/** Liest die kräftigste Farbe aus einem Foto (Mitte des Bildes, ohne Grau, Schwarz und Weiß). */
export async function dominantColor(file: File): Promise<string | null> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = reject
      i.src = url
    })
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const g = c.getContext('2d')!
    g.drawImage(img, 0, 0, 64, 64)
    const d = g.getImageData(8, 8, 48, 48).data
    const bins = new Map<number, { n: number; r: number; g: number; b: number }>()
    for (let i = 0; i < d.length; i += 4) {
      const [h, s, l] = rgbToHsl(d[i], d[i + 1], d[i + 2])
      if (s < 0.35 || l < 0.12 || l > 0.88) continue
      const k = Math.round(h * 24)
      const bin = bins.get(k) ?? { n: 0, r: 0, g: 0, b: 0 }
      bin.n++; bin.r += d[i]; bin.g += d[i + 1]; bin.b += d[i + 2]
      bins.set(k, bin)
    }
    const best = [...bins.values()].sort((a, b) => b.n - a.n)[0]
    if (!best) return null
    const hex = (v: number) => Math.round(v / best.n).toString(16).padStart(2, '0')
    return `#${hex(best.r)}${hex(best.g)}${hex(best.b)}`
  } finally {
    URL.revokeObjectURL(url)
  }
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h / 6, s, l]
}
