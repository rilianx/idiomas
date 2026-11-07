// Intermediario para «Leamos» (lector.html): deja que el lector busque y descargue libros de
// Project Gutenberg aunque esos sitios no autoricen a otras páginas (CORS).
// Se pega en un Cloudflare Worker (gratis). Solo deja pasar gutenberg.org y gutendex.com.
// Uso: https://TU-WORKER.workers.dev/?url=https://gutendex.com/books/?search=austen
export default {
  async fetch(req) {
    const cors = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, OPTIONS' };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method !== 'GET') return new Response('solo GET', { status: 405, headers: cors });
    let target;
    try { target = new URL(new URL(req.url).searchParams.get('url')); } catch (e) { return new Response('falta ?url=', { status: 400, headers: cors }); }
    if (target.protocol !== 'https:' || !/(^|\.)(gutenberg\.org|gutendex\.com)$/.test(target.hostname)) return new Response('sitio no permitido', { status: 403, headers: cors });
    const r = await fetch(target.toString(), { headers: { 'user-agent': 'Leamos (lector de libros)' }, redirect: 'follow' });
    // los redireccionamientos se siguen aquí, pero se revisa que el destino final siga siendo un sitio permitido
    if (!/(^|\.)(gutenberg\.org|gutendex\.com)$/.test(new URL(r.url).hostname)) return new Response('sitio no permitido', { status: 403, headers: cors });
    const h = new Headers(r.headers);
    for (const [k, v] of Object.entries(cors)) h.set(k, v);
    h.delete('set-cookie');
    return new Response(r.body, { status: r.status, headers: h });
  }
};
