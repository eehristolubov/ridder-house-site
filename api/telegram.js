// Vercel serverless function: relays the contact form to Telegram without exposing the bot token.
// Deploy this repo on vercel.com (sign in with GitHub, free, no card required) and set
// TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID as environment variables there —
// never put the real values in this file or commit them to git.

const ALLOWED_ORIGIN = 'https://eehristolubov.github.io';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { name, phone } = req.body || {};
  if (!name || !phone) {
    return res.status(400).json({ ok: false, error: 'Missing fields' });
  }

  const text = `Новая заявка с сайта «Кедровская, 36А»\nИмя: ${name}\nТелефон: ${phone}`;

  const tgResponse = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text }),
  });
  const tgData = await tgResponse.json();

  return res.status(tgData.ok ? 200 : 502).json({ ok: tgData.ok, error: tgData.description });
}
