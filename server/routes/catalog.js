import express from 'express';
import { openai, CHAT_MODEL } from '../openaiClient.js';

const router = express.Router();

const CATALOG_PROMPT = `You will receive a raw product description (from voice or manual entry) and any extracted
attributes. Write a polished catalog listing based STRICTLY on what was actually said — do not
invent facts, materials, regions, origins, or craft traditions that weren't mentioned.

Return JSON only, no prose, no markdown fences:
{
  "name": string,            // product title based on the description, under 60 chars
  "aiDescription": string,   // 3-4 sentences, polished tone, using ONLY facts present in the input
  "category": string,        // best-fit category based on what was actually described (not assumed)
  "tags": string[]           // 5-8 lowercase search tags derived from the actual content
}

Rules:
- If the description is vague, short, or doesn't mention material/origin/craft details, keep the
  output equally general — do not pad it with invented specifics to sound complete.
- Never default to a "handicraft" or "artisan" framing unless the input actually describes one.
- The output should read as a faithful, cleaned-up version of what was said, not a template filled
  with plausible-sounding details.`;

// POST /api/catalog/generate
router.post('/generate', async (req, res) => {
  try {
    const { voiceTranscription, manualDescription, attributes } = req.body || {};
    const sourceText = voiceTranscription || manualDescription;

    if (!sourceText) {
      return res.status(400).json({ error: 'No description provided' });
    }

    const userContent = JSON.stringify({ description: sourceText, attributes: attributes || {} });

    const completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0.4,
      messages: [
        { role: 'system', content: CATALOG_PROMPT },
        { role: 'user', content: userContent },
      ],
      response_format: { type: 'json_object' },
    });

    const catalog = JSON.parse(completion.choices[0].message.content);
    res.json(catalog);
  } catch (err) {
    console.error('[catalog/generate] error:', err.message);
    res.status(500).json({ error: 'Catalog generation failed. Please try again.' });
  }
});

export default router;
