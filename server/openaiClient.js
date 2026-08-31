import OpenAI from 'openai';

// Groq (https://console.groq.com) is free, no card required, and OpenAI SDK-compatible —
// we just point the client at Groq's endpoint. It gives us Whisper (STT) and Llama
// (extraction/catalog writing) both on the free tier.
//
// To swap in Bhashini instead (govt STT API), replace `transcribeAudio` calls in
// routes/voice.js with Bhashini's ASR + NMT pipeline endpoints and keep the same
// return shape: { transcription, detectedLanguage }.
export const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

// Groq's current model names (check https://console.groq.com/docs/models for latest)
export const STT_MODEL = 'whisper-large-v3';
export const CHAT_MODEL = 'openai/gpt-oss-120b';
