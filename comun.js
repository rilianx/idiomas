'use strict';
/* =====================================================================
   Código común de «Hablemos» (index.html) y «Leamos» (lector.html).
   Se carga antes del script de cada app (un <script> clásico, para que también
   funcione abriendo el archivo directamente, sin servidor).
   ===================================================================== */

/* ---------- utilidades ---------- */
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch (e) { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
// texto en párrafos (separados por una línea en blanco)
const paras = t => String(t || '').split(/\n\s*\n/).map(p => `<p style="margin:.35em 0;color:var(--fg)">${esc(p.trim()).replace(/\n/g, '<br>')}</p>`).join('');

/* ---------- la clave de la API (la misma para las dos apps) ---------- */
const KEYS = Object.assign({ anthropic: '', openai: '', workspace: '' }, load('hab-keys', {}));
const saveKeys = () => save('hab-keys', KEYS);

/* ---------- hangul: descomponer, componer y romanizar ---------- */
const H0 = 0xAC00, H1 = 0xD7A3;
const isHangul = ch => { const c = ch.charCodeAt(0); return c >= H0 && c <= H1; };
const dec = ch => { if (!ch || !isHangul(ch)) return null; const c = ch.charCodeAt(0) - H0; return { l: Math.floor(c / 588), v: Math.floor((c % 588) / 28), t: c % 28 }; };
const comp = (l, v, t) => String.fromCharCode(H0 + (l * 21 + v) * 28 + t);
const RI = ['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h'];
const RV = ['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i'];
const RF = ['','k','k','k','n','n','n','t','l','k','m','l','l','l','p','l','m','p','p','t','t','ng','t','t','k','t','p','t'];
// si la sílaba siguiente empieza con ㅇ, la consonante final se pasa (enlace): [lo que queda, lo que pasa]
const LINK = { 1:['','g'],2:['','kk'],3:['k','s'],4:['','n'],5:['n','j'],6:['n',''],7:['','d'],8:['','r'],9:['l','g'],10:['l','m'],11:['l','b'],12:['l','s'],13:['l','t'],14:['l','p'],15:['l',''],16:['','m'],17:['','b'],18:['p','s'],19:['','s'],20:['','ss'],22:['','j'],23:['','ch'],24:['','k'],25:['','t'],26:['','p'],27:['',''] };
function romanize(s){
  const ch = [...s]; let out = '', carry = null;
  for (let i = 0; i < ch.length; i++) {
    const d = dec(ch[i]);
    if (!d) { out += ch[i]; carry = null; continue; }
    const n = dec(ch[i + 1]);
    out += (carry !== null && (d.l === 11 || d.l === 5) ? carry : RI[d.l]) + RV[d.v]; carry = null;
    if (d.t) {
      if (n && n.l === 11 && LINK[d.t]) { out += LINK[d.t][0]; carry = LINK[d.t][1]; }
      else if (d.t === 8 && n && n.l === 5) { out += 'l'; carry = 'l'; }   // ㄹ+ㄹ → ll
      else out += RF[d.t];
    }
  }
  return out;
}

/* ---------- la IA: Claude (Messages API) u OpenAI (Chat Completions), con salida estructurada ----------
   Cada app dice cómo registrar el gasto: AI.onUsage = (kind, model, served, usage) => { … } */
const AI = { onUsage: null };
const MODELS = {
  'claude-haiku-5-5': { name: 'Claude Haiku 5.5', prov: 'anthropic' },
  'claude-sonnet-5-5': { name: 'Claude Sonnet 5.5', prov: 'anthropic' },
  'claude-opus-5-5': { name: 'Claude Opus 5.5', prov: 'anthropic' },
  'claude-fable-5-1': { name: 'Claude Fable 5.1', prov: 'anthropic' },
  'gpt-5.4-mini': { name: 'GPT-5.4 mini', prov: 'openai' }
};
const CHAT_MODELS = [['claude-haiku-5-5','Claude Haiku 5.5 · el más barato (recomendado)'],['gpt-5.4-mini','GPT-5.4 mini · OpenAI'],['claude-sonnet-5-5','Claude Sonnet 5.5 · mejor, más caro']];
const DEF_MODELS = [['claude-opus-5-5','Claude Opus 5.5 · preciso (recomendado)'],['claude-sonnet-5-5','Claude Sonnet 5.5 · más barato'],['claude-fable-5-1','Claude Fable 5.1 · el más capaz y el más caro'],['gpt-5.4-mini','GPT-5.4 mini · OpenAI, barato']];
const provOf = m => MODELS[m]?.prov || (m.startsWith('gpt') ? 'openai' : 'anthropic');

async function post(url, headers, body, ms){
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), ms);
  let res;
  try { res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), signal: ctl.signal }); }
  catch (e) { throw new Error(e.name === 'AbortError' ? 'la IA tardó demasiado' : 'sin conexión'); }
  finally { clearTimeout(timer); }
  return { res, data: await res.json().catch(() => ({})) };
}
// lo mismo, pero leyendo la respuesta a medida que llega (eventos del servidor); onEvent recibe cada evento
async function postStream(url, headers, body, ms, onEvent){
  const ctl = new AbortController(); let timer = setTimeout(() => ctl.abort(), ms);
  let res;
  try { res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), signal: ctl.signal }); }
  catch (e) { clearTimeout(timer); throw new Error(e.name === 'AbortError' ? 'la IA tardó demasiado' : 'sin conexión'); }
  // (si el servidor contesta sin streaming, se lee como una respuesta normal)
  if (!res.ok || !res.body || /application\/json/.test(res.headers.get('content-type') || '')) { clearTimeout(timer); return { res, data: await res.json().catch(() => ({})), plain: true }; }
  const reader = res.body.getReader(), dec = new TextDecoder(); let buf = '';
  try {
    for (;;) {
      const { value, done } = await reader.read(); if (done) break;
      clearTimeout(timer); timer = setTimeout(() => ctl.abort(), ms);   // mientras lleguen datos, no se corta
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
        if (!line.startsWith('data:')) continue;
        const d = line.slice(5).trim(); if (!d || d === '[DONE]') continue;
        let ev; try { ev = JSON.parse(d); } catch (e) { continue; }
        onEvent(ev);
      }
    }
  } catch (e) { throw new Error(e.name === 'AbortError' ? 'la IA tardó demasiado' : (e.message || 'se cortó la conexión')); }
  finally { clearTimeout(timer); }
  return { res, data: null };
}
// el texto de un campo de un JSON que todavía está llegando (p. ej. "ko" de {"ko":"안녕하…)
function partialString(raw, key){
  const m = raw.match(new RegExp('"' + key + '"\\s*:\\s*"')); if (!m) return '';
  let i = m.index + m[0].length, out = '';
  while (i < raw.length) {
    const c = raw[i];
    if (c === '"') break;
    if (c === '\\') {
      const n = raw[i + 1]; if (n === undefined) break;
      if (n === 'u') { const h = raw.substr(i + 2, 4); if (h.length < 4) break; out += String.fromCharCode(parseInt(h, 16)); i += 6; continue; }
      out += { n: '\n', t: '\t', r: '', b: '', f: '' }[n] ?? n; i += 2; continue;
    }
    out += c; i++;
  }
  return out;
}
const httpError = (res, data) => new Error({ 401: 'la clave no es válida', 403: 'la clave no tiene permiso', 429: 'demasiados pedidos seguidos (o sin saldo); espera un poco', 529: 'el servicio está saturado' }[res.status] || ('error ' + res.status + (data.error?.message ? ': ' + data.error.message : '')));
function parseJSON(txt){ try { const o = JSON.parse(txt); if (o && typeof o === 'object') return o; } catch (e) {} throw new Error('la respuesta llegó incompleta'); }
class NoKey extends Error {}

async function ask(model, system, user, schema, { effort = 'low', maxTokens = 8000, ms = 60000, kind = 'chat', fast = false, onText = null } = {}){
  const prov = provOf(model);
  if (!KEYS[prov]) throw new NoKey(prov);
  const r = prov === 'openai' ? await openaiAsk(model, system, user, schema, effort, maxTokens, ms, true, onText) : await claudeAsk(model, system, user, schema, effort, maxTokens, ms, fast, true, onText);
  AI.onUsage?.(kind, model, r.served, r.usage);
  return r.out;
}
// Claude (Messages API). Las instrucciones fijas van en system y se marcan para el caché.
async function claudeAsk(model, system, user, schema, effort, maxTokens, ms, fast = false, fallback = true, onText = null){
  const body = { model, max_tokens: maxTokens, system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }], messages: [{ role: 'user', content: user }], output_config: { format: { type: 'json_schema', schema }, effort } };
  const headers = { 'content-type': 'application/json', 'x-api-key': KEYS.anthropic, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' };
  // una clave de organización (no asignada a un workspace) tiene que decir qué workspace usar
  if (KEYS.workspace) headers['anthropic-workspace-id'] = KEYS.workspace;
  // en Opus, Sonnet y Fable, si el modelo declina responder, el servidor lo reintenta en otro modelo
  if (fallback && model !== 'claude-haiku-5-5') { body.fallbacks = 'default'; headers['anthropic-beta'] = 'server-side-fallback-2026-07-01'; }
  // pedidos rápidos (la conversación): sin razonar antes de responder, para que 지수 conteste antes
  if (fast) { if (model === 'claude-haiku-5-5') body.thinking = { type: 'disabled' }; else if (model === 'claude-sonnet-5-5') body.thinking = { type: 'between_tools' }; }
  if (onText) return claudeStream(model, body, headers, ms, fast, fallback, onText, () => claudeAsk(model, system, user, schema, effort, maxTokens, ms, fast, false, onText), () => claudeAsk(model, system, user, schema, effort, maxTokens, ms, false, fallback, onText));
  const { res, data } = await post('https://api.anthropic.com/v1/messages', headers, body, ms);
  if (!res.ok) {
    if (res.status === 400 && fallback && /fallback/i.test(data.error?.message || '')) return claudeAsk(model, system, user, schema, effort, maxTokens, ms, fast, false);
    if (res.status === 400 && fast && /thinking/i.test(data.error?.message || '')) return claudeAsk(model, system, user, schema, effort, maxTokens, ms, false, fallback);
    throw httpError(res, data);
  }
  if (data.stop_reason === 'refusal') throw new Error('el modelo no quiso responder eso');
  if (data.stop_reason === 'max_tokens') throw new Error('la respuesta quedó cortada');
  console.debug('[ia]', data.model, data.usage);
  const u = data.usage || {};
  return { out: parseJSON((data.content || []).filter(b => b.type === 'text').map(b => b.text).join('')), served: data.model,
    usage: { in: u.input_tokens || 0, cacheW: u.cache_creation_input_tokens || 0, cacheR: u.cache_read_input_tokens || 0, out: u.output_tokens || 0 } };
}
// OpenAI (Chat Completions)
// Claude, leyendo la respuesta a medida que llega: onText recibe el texto (JSON parcial) acumulado
async function claudeStream(model, body, headers, ms, fast, fallback, onText, retryNoFallback, retryNoFast){
  body.stream = true;
  let text = '', stop = null, served = model, err = null; const u = {};
  const { res, data, plain } = await postStream('https://api.anthropic.com/v1/messages', headers, body, ms, ev => {
    if (ev.type === 'message_start') { served = ev.message?.model || served; Object.assign(u, ev.message?.usage || {}); }
    else if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta') { text += ev.delta.text; onText(text); }
    else if (ev.type === 'message_delta') { stop = ev.delta?.stop_reason || stop; if (ev.usage) Object.assign(u, ev.usage); }
    else if (ev.type === 'error') err = ev.error?.message || 'error del servicio';
  });
  if (!res.ok) {
    if (res.status === 400 && fallback && /fallback/i.test(data.error?.message || '')) return retryNoFallback();
    if (res.status === 400 && fast && /thinking/i.test(data.error?.message || '')) return retryNoFast();
    throw httpError(res, data);
  }
  if (plain && data) { text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join(''); stop = data.stop_reason; served = data.model || served; Object.assign(u, data.usage || {}); if (text) onText(text); }
  if (err) throw new Error(err);
  if (stop === 'refusal') throw new Error('el modelo no quiso responder eso');
  if (stop === 'max_tokens') throw new Error('la respuesta quedó cortada');
  console.debug('[ia]', served, u);
  return { out: parseJSON(text), served, usage: { in: u.input_tokens || 0, cacheW: u.cache_creation_input_tokens || 0, cacheR: u.cache_read_input_tokens || 0, out: u.output_tokens || 0 } };
}
async function openaiAsk(model, system, user, schema, effort, maxTokens, ms, strict = true, onText = null){
  const body = { model, max_completion_tokens: maxTokens, messages: [{ role: 'system', content: system + (strict ? '' : '\n\nResponde solo con un objeto JSON que siga este esquema: ' + JSON.stringify(schema)) }, { role: 'user', content: user }] };
  if (strict) { body.response_format = { type: 'json_schema', json_schema: { name: 'respuesta', strict: true, schema } }; body.reasoning_effort = effort; }
  else body.response_format = { type: 'json_object' };
  const oh = { 'content-type': 'application/json', authorization: 'Bearer ' + KEYS.openai };
  if (onText) {   // leyendo la respuesta a medida que llega
    body.stream = true; body.stream_options = { include_usage: true };
    let text = '', refusal = '', served = model, uu = {};
    const { res, data } = await postStream('https://api.openai.com/v1/chat/completions', oh, body, ms, ev => {
      served = ev.model || served; if (ev.usage) uu = ev.usage;
      const d = ev.choices?.[0]?.delta || {};
      if (d.refusal) refusal += d.refusal;
      if (d.content) { text += d.content; onText(text); }
    });
    if (!res.ok) { if (res.status === 400 && strict) return openaiAsk(model, system, user, schema, effort, maxTokens, ms, false, onText); throw httpError(res, data); }
    if (refusal) throw new Error('el modelo no quiso responder eso');
    const cached = uu.prompt_tokens_details?.cached_tokens || 0;
    return { out: parseJSON(text), served, usage: { in: (uu.prompt_tokens || 0) - cached, cacheW: 0, cacheR: cached, out: uu.completion_tokens || 0 } };
  }
  const { res, data } = await post('https://api.openai.com/v1/chat/completions', oh, body, ms);
  if (!res.ok) { if (res.status === 400 && strict) return openaiAsk(model, system, user, schema, effort, maxTokens, ms, false); throw httpError(res, data); }
  const msg = data.choices?.[0]?.message || {};
  if (msg.refusal) throw new Error('el modelo no quiso responder eso');
  console.debug('[ia]', data.model, data.usage);
  const u = data.usage || {}, cached = u.prompt_tokens_details?.cached_tokens || 0;
  return { out: parseJSON(msg.content || ''), served: data.model, usage: { in: (u.prompt_tokens || 0) - cached, cacheW: 0, cacheR: cached, out: u.completion_tokens || 0 } };
}

/* ---------- gasto estimado ---------- */
// dólares por millón de tokens: [entrada, salida, lectura de caché, escritura de caché]. Precios publicados de Anthropic;
// la escritura de caché se estima en 1,25 veces la entrada. GPT-5.4 mini no tiene precio aquí: se cuentan solo sus tokens.
const PRICES = {
  'claude-haiku-5-5': [0.10, 0.50, 0.01, 0.125],
  'claude-sonnet-5-5': [2, 10, 0.20, 2.5],
  'claude-opus-5-5': [4, 20, 0.20, 5],
  'claude-fable-5-1': [10, 50, 0.25, 12.5]
};
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
// suma un pedido al registro de gasto de una app: { 'AAAA-MM-DD': { [kind]: { n, tin, tout, cost, unpriced } } }
function addUsage(store, kind, model, served, u){
  if (!u) return;
  const pr = PRICES[served] || PRICES[model];
  const day = store[today()] || (store[today()] = {});
  const k = day[kind] || (day[kind] = { n: 0, tin: 0, tout: 0, cost: 0, unpriced: 0 });
  k.n++; k.tin += u.in + u.cacheW + u.cacheR; k.tout += u.out;
  if (pr) k.cost += (u.in * pr[0] + u.out * pr[1] + u.cacheR * pr[2] + u.cacheW * pr[3]) / 1e6;
  else k.unpriced++;
}
const money = c => c === 0 ? '$0' : c < 0.001 ? '< $0,001' : '$' + c.toFixed(c < 0.01 ? 3 : 2).replace('.', ',');
const ktok = n => n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',') + ' M' : n >= 1000 ? Math.round(n / 1000) + ' mil' : String(n);

/* ---------- esquemas de respuesta ---------- */
const POS = ['sustantivo','verbo','adjetivo','adverbio','pronombre','número','partícula','preposición','conjunción','artículo','determinante','expresión','nombre propio','puntuación','otro'];
const obj = (props) => ({ type: 'object', additionalProperties: false, required: Object.keys(props), properties: props });
const STR = { type: 'string' };

/* ---------- voz del navegador ---------- */
let ALL_VOICES = [];
function refreshVoices(){ ALL_VOICES = window.speechSynthesis?.getVoices() || []; }
if ('speechSynthesis' in window) { refreshVoices(); if (speechSynthesis.addEventListener) speechSynthesis.addEventListener('voiceschanged', refreshVoices); else speechSynthesis.onvoiceschanged = refreshVoices; }
const TTS_LANG = { ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN', fr: 'fr-FR', de: 'de-DE', it: 'it-IT', pt: 'pt-BR' };
const voicesFor = lang => ALL_VOICES.filter(v => v.lang.toLowerCase().replace('_', '-').startsWith(lang));
// una frase para leer en voz alta, con la voz elegida (o la primera del idioma)
function makeUtterance(text, lang, rate = 1, voiceName = ''){
  const u = new SpeechSynthesisUtterance(text);
  u.lang = TTS_LANG[lang] || lang; u.rate = rate;
  const vs = voicesFor(lang), v = vs.find(v => v.name === voiceName) || vs.find(v => v.lang === u.lang) || vs[0];
  if (v) u.voice = v;
  return u;
}

/* ---------- el significado sobre una palabra ---------- */
function placeTip(tip, el){
  const r = el.getBoundingClientRect();
  tip.style.left = Math.max(90, Math.min(innerWidth - 90, r.left + r.width / 2)) + 'px';
  if (r.top > 100) { tip.classList.remove('below'); tip.style.top = (r.top - 6) + 'px'; } else { tip.classList.add('below'); tip.style.top = (r.bottom + 6) + 'px'; }
  tip.hidden = false;
}

/* ---------- la ficha de una palabra del diccionario ----------
   e: { meaning, explanation, hanja, irregular, conjugations, forms, examples: [{ ko, es }], sentence }
   extra: cómo se llama el campo hanja en ese idioma (Hanja, Pronunciación, Pinyin…) */
function entryHTML(e, { lang = 'ko', extra = 'Hanja', sentence = false, maxForms = 40 } = {}){
  const say = t => `<span class="tx" lang="${lang}" data-say="${esc(t)}" style="cursor:pointer">`;
  let h = '';
  if (e.meaning) h += `<div class="sec-t">Significado</div><div>${esc(e.meaning)}</div>`;
  if (e.explanation) h += `<div class="sec-t">Explicación</div><div>${esc(e.explanation)}</div>`;
  if (e.hanja) h += `<div class="small" style="margin-top:6px">${esc(extra)}: ${esc(e.hanja)}</div>`;
  if (e.irregular) h += `<div class="form">⚠ ${esc(e.irregular)}</div>`;
  if (e.conjugations?.length) h += `<div class="sec-t">Conjugación</div><div class="conj">${e.conjugations.map(c => `${say(c.form)}${esc(c.form)}</span><span>${esc(c.label)}</span>`).join('')}</div>`;
  const forms = Object.entries(e.forms || {}).slice(0, maxForms);
  if (forms.length) h += `<div class="sec-t">Formas que has visto</div><div class="conj">${forms.map(([f, l]) => `${say(f)}${esc(f)}</span><span>${esc(l || '—')}</span>`).join('')}</div>`;
  if (e.examples?.length) h += `<div class="sec-t">Ejemplos</div>${e.examples.map(x => `<div class="ex">${say(x.ko)}🔊 ${esc(x.ko)}</span><br><span class="small">${esc(x.es)}</span></div>`).join('')}`;
  if (sentence && e.sentence) h += `<div class="sec-t">Donde la viste</div><div class="small" lang="${lang}">${esc(e.sentence)}</div>`;
  return h;
}
