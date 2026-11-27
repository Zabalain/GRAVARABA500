// Contador histórico de descargas de GPX (Vercel Serverless Function).
// GET  /api/downloads  -> {"total": N}
// POST /api/downloads  -> suma 1 y devuelve {"total": N}
// Necesita una base de datos Redis conectada al proyecto en Vercel (Storage > Upstash Redis).
// Variables de entorno que usa (Vercel las crea solo al conectar la base de datos):
//   KV_REST_API_URL y KV_REST_API_TOKEN  (o UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN)
const KEY = 'gravaraba500:gpx-downloads';

module.exports = async (req, res) => {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  res.setHeader('Cache-Control', 'no-store');
  if (!url || !token) { res.status(503).json({ error: 'Almacenamiento no configurado' }); return; }
  try {
    const cmd = req.method === 'POST' ? 'incr' : 'get';
    const r = await fetch(`${url}/${cmd}/${KEY}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await r.json();
    res.status(200).json({ total: Number(data.result || 0) });
  } catch (e) {
    res.status(500).json({ error: 'Error al leer el contador' });
  }
};
