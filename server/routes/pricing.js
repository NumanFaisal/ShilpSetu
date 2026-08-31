import express from 'express';
import { openai, CHAT_MODEL } from '../openaiClient.js';

const router = express.Router();

const PRICING_PROMPT = `You are a pricing assistant for an Indian artisan marketplace (MoSJE). Given a
product's name, category, material, and order quantity, estimate a fair retail price range in INR (₹)
for a single unit, based on realistic market knowledge of similar handmade/craft goods in India.

Return JSON only, no prose, no markdown fences:
{
  "min": number,          // lower bound of a fair price range, in INR
  "suggested": number,    // recommended price, in INR
  "max": number,          // upper bound of a fair price range, in INR
  "reasoning": string,    // 1-2 sentences on how you arrived at this price, referencing the actual
                           // product details given (category/material/quantity) — do not invent
                           // specific numbers like listing counts or percentages you don't actually know
  "marketInsight": string // 1 short sentence of general, honest market context for this category —
                           // avoid fabricating precise statistics (e.g. "X% increase") you can't verify
}

Rules:
- Base the estimate on the actual category/material provided — if these are vague or missing, give a
  wider, more conservative range and say so in the reasoning rather than pretending precision.
- Do not cite fake data points (e.g. "847 similar listings") — keep reasoning honest and general.
- suggested must be between min and max.`;

// POST /api/pricing/estimate
router.post('/estimate', async (req, res) => {
  try {
    const { name, category, material, quantity } = req.body || {};

    if (!category && !material && !name) {
      return res.status(400).json({ error: 'No product details provided' });
    }

    const userContent = JSON.stringify({
      name: name || '',
      category: category || '',
      material: material || '',
      quantity: quantity || 1,
    });

    const completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0.3,
      messages: [
        { role: 'system', content: PRICING_PROMPT },
        { role: 'user', content: userContent },
      ],
      response_format: { type: 'json_object' },
    });

    const pricing = JSON.parse(completion.choices[0].message.content);
    res.json(pricing);
  } catch (err) {
    console.error('[pricing/estimate] error:', err.message);
    res.status(500).json({ error: 'Pricing estimate failed. Please try again.' });
  }
});

export default router;