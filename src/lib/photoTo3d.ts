import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../config'

const FN = `${SUPABASE_URL}/functions/v1/toy-3d`
const headers = { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }

/** Verkleinert ein Foto auf höchstens `max` Pixel Kantenlänge und gibt es als JPEG-data:-URI zurück. */
async function shrink(file: File, max = 1024): Promise<string> {
  const bmp = await createImageBitmap(file)
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas')
  c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k)
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
  return c.toDataURL('image/jpeg', 0.88)
}

async function call<T>(init: RequestInit & { query?: string }): Promise<T> {
  const r = await fetch(FN + (init.query ?? ''), { ...init, headers: { ...headers, ...(init.headers ?? {}) } })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(data.error ?? `Server antwortet mit ${r.status}`)
  return data as T
}

export interface Progress { status: string; progress: number }

/**
 * Schickt 1 bis 4 Fotos an Meshy (über den Server) und wartet, bis das 3D-Modell fertig ist.
 * Das erste Foto sollte das Auto von vorne zeigen. Gibt eine Blob-URL des GLB zurück.
 */
export async function photosTo3d(files: File[], onProgress: (p: Progress) => void): Promise<string> {
  const images = await Promise.all(files.slice(0, 4).map(f => shrink(f)))
  const { taskId } = await call<{ taskId: string }>({
    method: 'POST', body: JSON.stringify({ images }), headers: { 'Content-Type': 'application/json' },
  })
  for (;;) {
    await new Promise(r => setTimeout(r, 5000))
    const t = await call<{ status: string; progress: number; error: string | null }>({ query: `?task=${taskId}` })
    onProgress(t)
    if (t.status === 'SUCCEEDED') break
    if (t.status === 'FAILED' || t.status === 'CANCELED') throw new Error(t.error ?? 'Meshy konnte kein Modell bauen.')
  }
  const r = await fetch(`${FN}?task=${taskId}&file=glb`, { headers })
  if (!r.ok) throw new Error(`Modell konnte nicht geladen werden (${r.status})`)
  return URL.createObjectURL(await r.blob())
}
