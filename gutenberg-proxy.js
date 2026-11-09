// Intermediario para «Leamos» (lector.html). Se pega en un Cloudflare Worker (gratis) y hace dos cosas:
//  1. GET  /?url=…  → busca y descarga libros de Project Gutenberg (solo gutenberg.org y gutendex.com),
//     aunque esos sitios no autoricen a otras páginas (CORS).
//  2. POST /tts     → voz neuronal gratuita de Microsoft Edge (la misma que usa edge-tts), con la posición de
//     cada palabra. Cuerpo: {"text": "…", "voice": "ko-KR-SunHiNeural"}. Respuesta: {"audio": base64 mp3, "words": [[ms, "palabra"], …]}.
//  3. GET  /tts-test → diagnóstico: prueba la voz y muestra qué firmas se intentaron y qué respondió Microsoft.
import { connect as tcpConnect } from 'cloudflare:sockets';
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': 'content-type' };
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...CORS, 'content-type': 'application/json' } });

export default {
  async fetch(req) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const u = new URL(req.url);
    if (u.pathname.replace(/\/+$/, '') === '/tts-test') {
      const voice = u.searchParams.get('voice') || 'ko-KR-SunHiNeural', tried = [];
      try { const r = await edgeTTS('안녕하세요. 만나서 반가워요.', voice, tried); return json({ ok: true, voice, firma: GOOD, bytes: Math.round(r.audio.length * 0.75), words: r.words.length, tried }); }
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
// Desde octubre de 2026 speech.platform.bing.com responde 403 y la voz se sirve en api.msedgeservices.com, con una
// firma Sec-MS-GEC nueva (v2). Desde un Worker, el fetch() con Upgrade a ese servidor recibe un 200 vacío, así que se
// abre un socket TLS (cloudflare:sockets) y se habla WebSocket a mano (RFC 6455). Basado en readest (PR #7056) y edge-tts (PR #492).
const TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
const HOST = 'api.msedgeservices.com', PATH = '/tts/cognitiveservices/websocket/v1';
const VERSION = '143.0.3650.75', MAJOR = VERSION.split('.')[0];
let GOOD = null;   // qué firma funcionó la última vez ('2' o '1')
const escXml = s => s.replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]));
const toHex = b => [...b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
const hex = n => toHex(crypto.getRandomValues(new Uint8Array(n)));
const cat = (a, b) => { const m = new Uint8Array(a.length + b.length); m.set(a); m.set(b, a.length); return m; };

// firma Sec-MS-GEC: v1 = SHA256(hora de Windows redondeada a 5 min + token); v2 = "<CS64>-<SHA256 con prefijo>"
const winTicks = () => { let t = Math.floor(Date.now() / 1000) + 11644473600; t -= t % 300; return (BigInt(t) * 10000000n).toString(); };
async function gecV1(){ return toHex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(winTicks() + TOKEN)))); }
const GEC_PREFIX = [0x79706f43, 0x68676972, 0x43282074, 0x694d2029, 0x736f7263, 0x2074666f, 0x70726f43, 0x7461726f, 0x2e6e6f69, 0x6c6c4120, 0x67697220, 0x20737468, 0x65736572, 0x64657672, 0x0000002e];
const rol16 = x => ((x << 16) | (x >>> 16)) >>> 0;
const words32 = bytes => { const p = new Uint8Array(Math.ceil(bytes.length / 8) * 8); p.set(bytes); const v = new DataView(p.buffer); return Array.from({ length: p.length / 4 }, (_, i) => v.getUint32(i * 4, true)); };
function cs64Swap(w, a, b){
  let acc = 0, last = 0;
  for (let i = 0; i < w.length; i += 2) {
    let t = rol16((Math.imul(rol16(w[i]), 0xef0569fb) + Math.imul(w[i], a)) >>> 0), q = Math.imul(t, 0x76f50f34) >>> 0;
    acc = (acc + Math.imul(rol16(q), 0xc3efea97) + q) >>> 0;
    t = rol16((Math.imul(rol16(w[i + 1]), 0xc31713db) + Math.imul(w[i + 1], b)) >>> 0); q = Math.imul(t, 0x1881ce3c) >>> 0;
    last = (Math.imul(rol16(q), 0x35bd1ec9) + q) >>> 0; acc = (acc + last) >>> 0;
  }
  return [last, acc];
}
function cs64Rev(w, a, b){
  let st = 0, acc = 0;
  for (let i = 0; i < w.length; i += 2) {
    st = Math.imul(st + w[i], a) >>> 0;
    for (const c of [0xcf98b111, 0x87085b9f, 0x12ceb96d, 0x257e1d83]) st = Math.imul(rol16(st), c) >>> 0;
    let t = Math.imul(w[i + 1] + st, b) >>> 0;
    t = Math.imul(rol16(t), 0xa27416f5) >>> 0; t = rol16(Math.imul(rol16(t), 0xd38396ff) >>> 0);
    acc = (acc + st) >>> 0; st = Math.imul(rol16(Math.imul(t, 0x7c932b89) >>> 0), 0xbfa49f69) >>> 0; acc = (acc + st) >>> 0;
  }
  return [st, acc];
}
async function gecV2(){
  const suf = new TextEncoder().encode(winTicks() + TOKEN), data = new Uint8Array(57 + suf.length), v = new DataView(data.buffer);
  GEC_PREFIX.forEach((x, i) => v.setUint32(i * 4, x, true)); data.set(suf, 57);
  const dig = new Uint8Array(await crypto.subtle.digest('SHA-256', data)), w = words32(data), [k0, k1] = words32(dig);
  const a = (k0 | 1) >>> 0, b = (k1 | 1) >>> 0, [s0, s1] = cs64Swap(w, a, b), [r0, r1] = cs64Rev(w, a, b);
  const o = new DataView(new ArrayBuffer(8)); o.setUint32(0, (s0 ^ r0) >>> 0, true); o.setUint32(4, (s1 ^ r1) >>> 0, true);
  return `${toHex(new Uint8Array(o.buffer))}-${toHex(dig)}`;
}

// WebSocket mínimo sobre un socket TLS: manda texto (enmascarado) y recibe texto o binario
function frame(op, payload){
  const n = payload.length, ext = n < 126 ? 0 : n < 65536 ? 2 : 8, f = new Uint8Array(2 + ext + 4 + n), v = new DataView(f.buffer);
  f[0] = 0x80 | op;
  if (!ext) f[1] = 0x80 | n; else if (ext === 2) { f[1] = 0x80 | 126; v.setUint16(2, n); } else { f[1] = 0x80 | 127; v.setBigUint64(2, BigInt(n)); }
  const m = crypto.getRandomValues(new Uint8Array(4)); f.set(m, 2 + ext);
  for (let i = 0; i < n; i++) f[2 + ext + 4 + i] = payload[i] ^ m[i % 4];
  return f;
}
async function openSocket(gec){
  const id = hex(16);
  const q = `ConnectionId=${id}&Ocp-Apim-Subscription-Key=${TOKEN}&Sec-MS-GEC=${encodeURIComponent(gec === '2' ? await gecV2() : await gecV1())}&Sec-MS-GEC-Version=${gec}-${VERSION}`;
  const sock = tcpConnect({ hostname: HOST, port: 443 }, { secureTransport: 'on' });
  const reader = sock.readable.getReader(), writer = sock.writable.getWriter();
  const key = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
  const req = [`GET ${PATH}?${q} HTTP/1.1`, `Host: ${HOST}`, 'Upgrade: websocket', 'Connection: Upgrade', `Sec-WebSocket-Key: ${key}`, 'Sec-WebSocket-Version: 13',
    `User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${MAJOR}.0.0.0 Safari/537.36 Edg/${MAJOR}.0.0.0`,
    'Accept-Encoding: gzip, deflate, br, zstd', 'Accept-Language: en-US,en;q=0.9', 'Pragma: no-cache', 'Cache-Control: no-cache',
    'Origin: chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold', `Cookie: muid=${hex(16)};`];
  await writer.write(new TextEncoder().encode(req.join('\r\n') + '\r\n\r\n'));
  let buf = new Uint8Array(0), end = -1;
  const timer = setTimeout(() => sock.close().catch(() => {}), 15000);
  try {
    while (end < 0) {
      const { value, done } = await reader.read();
      if (done) throw new Error('cerró la conexión');
      buf = cat(buf, value); end = new TextDecoder().decode(buf).indexOf('\r\n\r\n');
    }
  } finally { clearTimeout(timer); }
  const status = +new TextDecoder().decode(buf).split('\r\n')[0].split(' ')[1];
  if (status !== 101) { sock.close().catch(() => {}); return { status }; }
  buf = buf.slice(end + 4);
  const L = { message: [], close: [], error: [] }, emit = (t, e) => L[t].forEach(f => f(e));
  let closed = false, frag = null, fragOp = 0;
  const write = f => writer.write(f).catch(e => { if (!closed) emit('error', e); });
  const finish = () => { if (closed) return; closed = true; sock.close().catch(() => {}); emit('close'); };
  const drain = () => {
    while (buf.length >= 2) {
      const v = new DataView(buf.buffer, buf.byteOffset, buf.byteLength), fin = buf[0] & 0x80, op = buf[0] & 0x0f;
      let n = buf[1] & 0x7f, off = 2;
      if (n === 126) { if (buf.length < 4) return; n = v.getUint16(2); off = 4; }
      else if (n === 127) { if (buf.length < 10) return; n = Number(v.getBigUint64(2)); off = 10; }
      if (buf.length < off + n) return;
      const p = buf.slice(off, off + n); buf = buf.slice(off + n);
      if (op === 0x8) return finish();
      if (op === 0x9) { write(frame(0xa, p)); continue; }
      if (op === 0xa) continue;
      if (op) fragOp = op;
      frag = frag ? cat(frag, p) : p;
      if (!fin) continue;
      const msg = frag; frag = null;
      emit('message', { data: fragOp === 1 ? new TextDecoder().decode(msg) : msg.buffer });
    }
  };
  const pump = async () => {
    try { drain(); while (!closed) { const { value, done } = await reader.read(); if (done) break; buf = cat(buf, value); drain(); } finish(); }
    catch (e) { if (!closed) { closed = true; sock.close().catch(() => {}); emit('error', e); } }
  };
  const ws = {
    accept: () => { pump(); },
    send: s => write(frame(1, new TextEncoder().encode(s))),
    close: () => { if (closed) return; write(frame(8, new Uint8Array(0))); finish(); },
    addEventListener: (t, f) => L[t].push(f)
  };
  return { ws, status, id };
}
async function edgeTTS(text, voice, tried = []){
  let ws = null, id = '';
  for (const g of GOOD ? [GOOD, ...['2', '1'].filter(x => x !== GOOD)] : ['2', '1']) {
    try {
      const c = await openSocket(g);
      tried.push(`firma v${g}: ${c.ws ? 'ok' : c.status}`);
      if (c.ws) { ws = c.ws; id = c.id; GOOD = g; break; }
    } catch (e) { tried.push(`firma v${g}: ${e.message}`); }
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
