// Foto-zu-3D über Meshy. Der API-Schlüssel liegt nur hier auf dem Server (Secret MESHY_API_KEY).
//
// POST  { images: string[] }          -> { taskId }          (1 bis 4 Bilder als data:-URI oder https-URL, das erste = Vorderansicht)
// GET   ?task=<id>                    -> { status, progress, thumbnail, error }
// GET   ?task=<id>&file=glb           -> das fertige GLB (durchgereicht, damit der Browser es ohne CORS-Probleme laden kann)

const MESHY = 'https://api.meshy.ai/openapi/v1/multi-image-to-3d'
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const key = Deno.env.get('MESHY_API_KEY')
  if (!key) return json({ error: 'MESHY_API_KEY fehlt. Bitte im Supabase-Dashboard unter Edge Functions > Secrets eintragen.' }, 500)
  const auth = { Authorization: `Bearer ${key}` }

  try {
    if (req.method === 'POST') {
      const { images } = await req.json() as { images?: string[] }
      if (!Array.isArray(images) || images.length < 1 || images.length > 4) return json({ error: 'Bitte 1 bis 4 Bilder schicken.' }, 400)
      const r = await fetch(MESHY, {
        method: 'POST',
        headers: { ...auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_urls: images, should_texture: true, enable_pbr: true, target_formats: ['glb'] }),
      })
      const data = await r.json()
      if (!r.ok) return json({ error: data?.message ?? `Meshy antwortet mit ${r.status}` }, 502)
      return json({ taskId: data.result })
    }

    const url = new URL(req.url)
    const task = url.searchParams.get('task')
    if (!task || !/^[\w-]+$/.test(task)) return json({ error: 'task fehlt' }, 400)
    const r = await fetch(`${MESHY}/${task}`, { headers: auth })
    const t = await r.json()
    if (!r.ok) return json({ error: t?.message ?? `Meshy antwortet mit ${r.status}` }, 502)

    if (url.searchParams.get('file') === 'glb') {
      const glbUrl = t?.model_urls?.glb
      if (t.status !== 'SUCCEEDED' || !glbUrl) return json({ error: 'Modell ist noch nicht fertig' }, 409)
      const glb = await fetch(glbUrl)
      return new Response(glb.body, { headers: { ...cors, 'Content-Type': 'model/gltf-binary' } })
    }
    return json({ status: t.status, progress: t.progress ?? 0, thumbnail: t.thumbnail_url ?? null, error: t.task_error?.message ?? null })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})
