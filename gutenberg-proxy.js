// Intermediario para «Leamos» (lector.html). Se pega en un Cloudflare Worker (gratis) y hace dos cosas:
//  1. GET  /?url=…  → busca y descarga libros de Project Gutenberg (solo gutenberg.org y gutendex.com),
//     aunque esos sitios no autoricen a otras páginas (CORS).
//  2. POST /tts     → voz neuronal gratuita de Microsoft Edge (la misma que usa edge-tts), con la posición de
//     cada palabra. Cuerpo: {"text": "…", "voice": "ko-KR-SunHiNeural"}. Respuesta: {"audio": base64 mp3, "words": [[ms, "palabra"], …]}.
//  3. GET  /tts-test → diagnóstico: prueba la voz y muestra qué versiones se intentaron y qué respondió Microsoft.
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': 'content-type' };
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...CORS, 'content-type': 'application/json' } });

export default {
  async fetch(req) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const u = new URL(req.url);
    if (u.pathname.replace(/\/+$/, '') === '/tts-test') {
      const voice = u.searchParams.get('voice') || 'ko-KR-SunHiNeural', tried = [];
      try { const r = await edgeTTS('안녕하세요. 만나서 반가워요.', voice, tried); return json({ ok: true, voice, version: GOOD, bytes: Math.round(r.audio.length * 0.75), words: r.words.length, tried }); }
      catch (e) { return json({ ok: false, voice, error: e.message, tried }, 502); }
    }
    if (u.pathname.replace(/\/+$/, '') === '/tts') {
      if (req.method !== 'POST') return json({ error: 'usa POST' }, 405);
      try {
        const { text, voice } = await req.json();
        if (!text || String(text).length > 3000) return json({ error: 'falta el texto o es muy largo' }, 400);
        if (!/^[a-z]{2,3}-[A-Z]{2,4}-[A-Za-z]+Neural$/.test(voice || '')) return json({ error: 'voz no válida' }, 400);
        return json(await edgeTTS(String(text), voice));
      } catch (e) { return json({ error: e.message || 'error de la voz' }, 502); }
    }
    // --- Gutenberg ---
    if (req.method !== 'GET') return new Response('solo GET', { status: 405, headers: CORS });
    let target;
    try { target = new URL(u.searchParams.get('url')); } catch (e) { return new Response('falta ?url=', { status: 400, headers: CORS }); }
    const ok = h => /(^|\.)(gutenberg\.org|gutendex\.com)$/.test(h);
    if (target.protocol !== 'https:' || !ok(target.hostname)) return new Response('sitio no permitido', { status: 403, headers: CORS });
    const r = await fetch(target.toString(), { headers: { 'user-agent': 'Leamos (lector de libros)' }, redirect: 'follow' });
    if (!ok(new URL(r.url).hostname)) return new Response('sitio no permitido', { status: 403, headers: CORS });
    const h = new Headers(r.headers);
    for (const [k, v] of Object.entries(CORS)) h.set(k, v);
    h.delete('set-cookie');
    return new Response(r.body, { status: r.status, headers: h });
  }
};

// ---- voz de Microsoft Edge (protocolo de «Leer en voz alta», como edge-tts) ----
// Microsoft exige una versión de Chromium reciente (con una vieja responde 403) y la cambia con cada versión de
// Edge: se prueban varias, de la más nueva a la más vieja, y se recuerda la que funcionó.
const TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
const VERSIONS = ['143.0.3650.75', '142.0.3595.53', '140.0.3485.54', '138.0.3351.65', '134.0.3124.66', '130.0.2849.68'];
let GOOD = null;
const escXml = s => s.replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]));
const hex = n => [...crypto.getRandomValues(new Uint8Array(n))].map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
async function secMsGec(){
  let t = Math.floor(Date.now() / 1000) + 11644473600; t -= t % 300;   // hora de Windows, redondeada a 5 minutos
  const data = new TextEncoder().encode(`${BigInt(t) * 10000000n}${TOKEN}`);
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', data))].map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}
async function connect(version){
  const major = version.split('.')[0], id = hex(16);
  const url = `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TOKEN}&Sec-MS-GEC=${await secMsGec()}&Sec-MS-GEC-Version=1-${version}&ConnectionId=${id}`;
  const resp = await fetch(url, { headers: {
    Upgrade: 'websocket', Origin: 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold', Pragma: 'no-cache', 'Cache-Control': 'no-cache',
    'Accept-Encoding': 'gzip, deflate, br', 'Accept-Language': 'en-US,en;q=0.9', Cookie: `muid=${hex(16)};`,
    'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${major}.0.0.0 Safari/537.36 Edg/${major}.0.0.0`,
    'Sec-CH-UA': `"Microsoft Edge";v="${major}", "Chromium";v="${major}", "Not_A Brand";v="24"`, 'Sec-CH-UA-Mobile': '?0', 'Sec-CH-UA-Platform': '"Windows"'
  } });
  return { ws: resp.webSocket, status: resp.status, id };
}
async function edgeTTS(text, voice, tried = []){
  let ws = null, id = '';
  for (const v of GOOD ? [GOOD, ...VERSIONS.filter(x => x !== GOOD)] : VERSIONS) {
    try {
      const c = await connect(v);
      tried.push(`${v}: ${c.ws ? 'ok' : c.status}`);
      if (c.ws) { ws = c.ws; id = c.id; GOOD = v; break; }
    } catch (e) { tried.push(`${v}: ${e.message}`); }
  }
  if (!ws) throw new Error('Microsoft rechazó la conexión (' + tried.join(', ') + ')');
  ws.accept();
  const chunks = [], words = [], date = new Date().toString();
  const done = new Promise((ok, ko) => {
    const timer = setTimeout(() => ko(new Error('la voz de Edge tardó demasiado')), 30000);
    ws.addEventListener('message', ev => {
      if (typeof ev.data === 'string') {
        if (ev.data.includes('Path:turn.end')) { clearTimeout(timer); ok(); }
        else if (ev.data.includes('Path:audio.metadata')) {
          try { const j = JSON.parse(ev.data.slice(ev.data.indexOf('\r\n\r\n') + 4)); for (const m of j.Metadata || []) if (m.Type === 'WordBoundary') words.push([Math.round(m.Data.Offset / 10000), m.Data.text?.Text || '']); } catch (e) {}
        }
      } else {
        const b = new Uint8Array(ev.data), hl = (b[0] << 8) | b[1];
        if (new TextDecoder().decode(b.subarray(2, 2 + hl)).includes('Path:audio')) chunks.push(b.slice(2 + hl));
      }
    });
    ws.addEventListener('close', () => { clearTimeout(timer); ok(); });
    ws.addEventListener('error', () => { clearTimeout(timer); ko(new Error('error de conexión con la voz de Edge')); });
  });
  ws.send(`X-Timestamp:${date}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"true"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`);
  const [, lc, name] = voice.match(/^([a-z]{2,3}-[A-Z]{2,4})-(.+)$/);
  const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${lc}'><voice name='Microsoft Server Speech Text to Speech Voice (${lc}, ${name})'><prosody pitch='+0Hz' rate='+0%' volume='+0%'>${escXml(text)}</prosody></voice></speak>`;
  ws.send(`X-RequestId:${id}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${date}Z\r\nPath:ssml\r\n\r\n${ssml}`);
  await done;
  try { ws.close(); } catch (e) {}
  if (!chunks.length) throw new Error('la voz de Edge no devolvió audio');
  const all = new Uint8Array(chunks.reduce((a, c) => a + c.length, 0)); let o = 0;
  for (const c of chunks) { all.set(c, o); o += c.length; }
  let bin = ''; for (let i = 0; i < all.length; i += 0x8000) bin += String.fromCharCode(...all.subarray(i, i + 0x8000));
  return { audio: btoa(bin), words };
}
