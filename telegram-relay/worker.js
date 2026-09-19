// Cloudflare Worker: relays the contact form to Telegram without exposing the bot token.
// Deploy this in the Cloudflare dashboard (Workers & Pages) and set
// TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID as encrypted environment variables there —
// never put the real values in this file or commit them to git.

const ALLOWED_ORIGIN = 'https://eehristolubov.github.io';

export default {
  async fetch(request, env) {
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ ok: false, error: 'Method not allowed' }), { status: 405, headers });
    }

    let name, phone;
    try {
      ({ name, phone } = await request.json());
    } catch {
      return new Response(JSON.stringify({ ok: false, error: 'Bad request' }), { status: 400, headers });
    }

    if (!name || !phone) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing fields' }), { status: 400, headers });
    }

    const text = `Новая заявка с сайта «Кедровская, 36А»\nИмя: ${name}\nТелефон: ${phone}`;

    const tgResponse = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text }),
    });
    const tgData = await tgResponse.json();

    return new Response(JSON.stringify({ ok: tgData.ok, error: tgData.description }), {
      status: tgData.ok ? 200 : 502,
      headers,
    });
  },
};
