import express from 'express';
import { openai, CHAT_MODEL } from '../openaiClient.js';

const router = express.Router();

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

const SYNTHESIS_PROMPT = `You are a pricing assistant for an Indian artisan marketplace (MoSJE). You are
given the artisan's actual production cost (material + labour) and real web search results about
market prices for similar products in India. Your job is to read the search results and extract a
realistic market price range grounded in what they actually say — never invent numbers not supported
by the search snippets.

Return JSON only, no prose, no markdown fences:
{
  "marketMin": number,     // lowest realistic market price (INR) found/implied in the search results
  "marketMax": number,     // highest realistic market price (INR) found/implied in the search results
  "suggested": number,     // final recommended price — must be >= baseCost provided, balanced against market range
  "reasoning": string      // 2-3 sentences: how you weighed base cost vs market range to land on suggested price
}

Rules:
- suggested must never be below baseCost (the artisan should never sell at a loss).
- If search results are sparse, unclear, or don't mention real prices, say so honestly in reasoning
  and fall back to a conservative range starting near baseCost — do not fabricate specific figures.
- Do not cite fake statistics not present in the search results.`;

async function tavilySearch(query) {
  if (!TAVILY_API_KEY) return { results: [] };
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: TAVILY_API_KEY,
      query,
      search_depth: 'basic',
      max_results: 6,
    }),
  });
  if (!res.ok) return { results: [] };
  return res.json();
}

// POST /api/pricing/estimate
router.post('/estimate', async (req, res) => {
  try {
    const { name, category, material, materialCost, labourHours, wageRate, quantity } = req.body || {};

    if (!name && !category) {
      return res.status(400).json({ error: 'No product details provided' });
    }

    const matCost = Number(materialCost) || 0;
    const hours = Number(labourHours) || 0;
    const wage = Number(wageRate) || 0;
    const baseCost = Math.round(matCost + hours * wage);

    const query = `${name || category} handmade price India ₹`;
    const searchData = await tavilySearch(query);
    const results = (searchData.results || []).slice(0, 6);

    const sources = results.map((r) => ({ title: r.title, url: r.url }));
    const searchContext = results.map((r) => `- ${r.title}: ${r.content?.slice(0, 300)}`).join('\n');

    const userContent = JSON.stringify({
      product: { name, category, material, quantity: quantity || 1 },
      baseCost,
      searchResults: searchContext || 'No search results found.',
    });

    const completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0.2,
      messages: [
        { role: 'system', content: SYNTHESIS_PROMPT },
        { role: 'user', content: userContent },
      ],
      response_format: { type: 'json_object' },
    });

    const synthesis = JSON.parse(completion.choices[0].message.content);

    res.json({
      baseCost,
      marketMin: synthesis.marketMin,
      marketMax: synthesis.marketMax,
      suggested: synthesis.suggested,
      reasoning: synthesis.reasoning,
      sources,
    });
  } catch (err) {
    console.error('[pricing/estimate] error:', err.message);
    res.status(500).json({ error: 'Pricing estimate failed. Please try again.' });
  }
});

export default router;