import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { openai, STT_MODEL, CHAT_MODEL } from '../openaiClient.js';

const router = express.Router();
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname || 'recording.m4a'}`);
  },
});
const upload = multer({ storage });

const EXTRACTION_PROMPT = `You will receive a transcript of someone describing a product out loud. Extract ONLY what
they actually said into structured fields — do not invent, assume, or embellish anything not
present in the transcript.

Return JSON only, no prose, no markdown fences:
{
  "productName": string,      // short product name based on what they said
  "material": string,         // material/substance mentioned, exactly as described — empty string if not mentioned
  "craftType": string,        // category/type of item, based only on the transcript — empty string if unclear
  "size": string,             // dimensions if mentioned, else ""
  "description": string       // 2-3 sentences using ONLY facts stated in the transcript, lightly cleaned up for grammar
}

Rules:
- If the transcript doesn't mention a craft, material, region, or origin, leave that field empty — never fabricate one.
- Do not assume this is a handicraft, artisan good, or any specific product category unless the transcript says so.
- If the transcript is unclear, nonsensical, or too short to extract meaningful fields, reflect that honestly (short/empty fields) rather than guessing.`;

// POST /api/voice/process  (multipart/form-data, field: "audio")
router.post('/process', upload.single('audio'), async (req, res) => {
  const filePath = req.file?.path;
  try {
    if (!filePath) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    // 1. Speech-to-text with translation to English (Whisper auto-detects source language)
    const translation = await openai.audio.translations.create({
      file: fs.createReadStream(filePath),
      model: STT_MODEL,
    });

    // Also get the raw transcript in the original language for language detection / "what I heard"
    const rawTranscription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: STT_MODEL,
    });

    const englishText = translation.text?.trim() || '';
    const originalText = rawTranscription.text?.trim() || englishText;
    const detectedLanguage = rawTranscription.language || 'unknown';

    // 2. Extract structured attributes via chat completion
    const completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0.2,
      messages: [
        { role: 'system', content: EXTRACTION_PROMPT },
        { role: 'user', content: englishText },
      ],
      response_format: { type: 'json_object' },
    });

    const extractedAttributes = JSON.parse(completion.choices[0].message.content);

    res.json({
      transcription: originalText,
      englishTranscription: englishText,
      detectedLanguage,
      extractedAttributes,
    });
  } catch (err) {
    console.error('[voice/process] error:', err.message);
    res.status(500).json({ error: 'Voice processing failed. Please try again.' });
  } finally {
    if (filePath) fs.unlink(filePath, () => {});
  }
});

export default router;
