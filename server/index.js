import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const app = express();
const port = process.env.PORT || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(cors());
app.use(express.json({limit:'1mb'}));

app.get('/api/health', (_req,res) => res.json({ok:true, geminiConfigured:Boolean(process.env.GEMINI_API_KEY), metaConfigured:Boolean(process.env.META_ACCESS_TOKEN && process.env.META_AD_ACCOUNT_ID)}));

app.post('/api/chat', async (req,res) => {
  try {
    if (!process.env.GEMINI_API_KEY) return res.status(503).json({error:'Gemini API key is not configured. Add GEMINI_API_KEY in Render Environment.'});
    const {messages=[]} = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) return res.status(400).json({error:'Please send a message.'});
    const history = messages.slice(-16).map(m => `${m.role === 'assistant' ? 'Assistant' : 'User'}: ${String(m.content || '').slice(0,6000)}`).join('\n\n');
    const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: `You are ASF AI Agent, the marketing assistant for ASF PPF Shield. Help with PPF, polishing, window tinting, customer service, and ethical Facebook advertising. Ask before making claims about prices, guarantees, or availability. Never claim that an ad was published unless a verified Meta API action confirms it.\n\nConversation:\n${history}`
    });
    res.json({reply:response.text || 'I could not generate a response.'});
  } catch (e) {
    console.error('Gemini error:',e);
    res.status(500).json({error:'AI request failed. Check the Gemini key, model, and API quota.'});
  }
});

// This endpoint only reports connection readiness. It does not publish or spend money.
app.get('/api/meta/status', (_req,res) => {
  const configured = Boolean(process.env.META_ACCESS_TOKEN && process.env.META_AD_ACCOUNT_ID);
  res.json({configured, appConfigured:Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET), note:configured ? 'Server-side Meta credentials are present. Verify token permissions and account access before use.' : 'Meta credentials are not configured yet.'});
});

app.get('/api/meta/ad-account', async (_req,res) => {
  if (!process.env.META_ACCESS_TOKEN || !process.env.META_AD_ACCOUNT_ID) return res.status(503).json({error:'Add META_ACCESS_TOKEN and META_AD_ACCOUNT_ID in server environment.'});
  try {
    const version = process.env.META_API_VERSION || 'v27.0';
    const account = process.env.META_AD_ACCOUNT_ID.startsWith('act_') ? process.env.META_AD_ACCOUNT_ID : `act_${process.env.META_AD_ACCOUNT_ID}`;
    const url = new URL(`https://graph.facebook.com/${version}/${account}`);
    url.searchParams.set('fields','id,name,account_status,currency,timezone_name');
    url.searchParams.set('access_token',process.env.META_ACCESS_TOKEN);
    const r = await fetch(url);
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({error:data.error?.message || 'Meta API request failed'});
    res.json(data);
  } catch (e) { res.status(500).json({error:'Could not reach Meta API.'}); }
});

if (process.env.NODE_ENV === 'production') {
  const clientDist = path.resolve(__dirname,'../dist');
  app.use(express.static(clientDist));
  app.get('*',(_req,res)=>res.sendFile(path.join(clientDist,'index.html')));
}
app.listen(port,'0.0.0.0',()=>console.log(`ASF AI Agent server listening on ${port}`));
