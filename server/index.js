import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import voiceRouter from './routes/voice.js';
import catalogRouter from './routes/catalog.js';

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.use('/api/voice', voiceRouter);
app.use('/api/catalog', catalogRouter);

app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`ShilpSetu server listening on :${PORT}`));
