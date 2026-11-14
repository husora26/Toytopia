import { useCallback, useState } from 'react'
import { CarScene, type CameraView, type CarSource } from './CarScene'
import { InfoCard } from './InfoCard'
import { CARS, PAINT_COLORS } from '../../data/cars'
import type { PartInfo } from '../../data/types'
import { dominantColor } from '../../lib/dominantColor'
import { engineOff, engineOn, honk } from '../../lib/sound'
import { photosTo3d } from '../../lib/photoTo3d'

const PHOTO_INFO: PartInfo = {
  tag: 'Foto',
  title: 'Farbe erkannt',
  text: 'Die Farbe deines Spielzeugautos ist jetzt auf dem Modell.',
  fact: 'Später erkennt hier eine KI auch Marke und Modell, und das passende echte Auto erscheint.',
}

export function CarSection() {
  const car = CARS[0]
  const [paint, setPaint] = useState(car.defaultColor)
  const [selected, setSelected] = useState<string | null>(null)
  const [card, setCard] = useState<PartInfo | null>(car.summary)
  const [hoodOpen, setHoodOpen] = useState(false)
  const [doorsOpen, setDoorsOpen] = useState(false)
  const [driving, setDriving] = useState(false)
  const [view, setView] = useState<CameraView>('outside')
  const [photo, setPhoto] = useState<{ url: string; label: string } | null>(null)
  const [source, setSource] = useState<CarSource>({ kind: 'demo' })
  const scanned = source.kind === 'glb'
  const [building, setBuilding] = useState(false)
  const [panorama, setPanorama] = useState<string | undefined>(car.interiorPanorama)

  const onPick = useCallback((key: string | null) => {
    if (!key) { setSelected(null); setCard(car.summary); return }
    setSelected(prev => {
      if (key === 'steering' && prev === 'steering') { try { honk() } catch { /* kein Ton */ } }
      return key
    })
    setCard(car.parts[key] ?? null)
  }, [car])

  const toggleHood = () => {
    const open = !hoodOpen
    setHoodOpen(open)
    if (open && !driving && view !== 'inside') { setView('engine'); onPick('engine') }
    if (!open && view === 'engine') setView('outside')
  }
  const toggleInside = () => {
    if (view === 'inside') { setView('outside'); setCard(scanned ? car.parts.scan : car.summary); setSelected(null); return }
    if (driving) { setDriving(false); engineOff() }
    setHoodOpen(false); if (!scanned) setDoorsOpen(true); setView('inside')
    if (panorama) { setSelected(null); setCard(car.parts.interior) } else onPick('steering')
  }
  const toggleDrive = () => {
    const on = !driving
    setDriving(on)
    if (on) {
      setHoodOpen(false); setDoorsOpen(false)
      if (view !== 'outside') setView('outside')
      try { engineOn() } catch { /* kein Ton */ }
    } else engineOff()
  }

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const color = await dominantColor(f)
    setPhoto({ url: URL.createObjectURL(f), label: color ? 'Farbe übernommen' : 'Keine klare Farbe gefunden' })
    if (color) { setPaint(color); setCard(PHOTO_INFO); setSelected(null) }
  }

  const onModel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setSource({ kind: 'glb', url: URL.createObjectURL(f) })
    setHoodOpen(false); setDoorsOpen(false); setView('outside')
    setSelected(null); setCard(car.parts.scan)
  }

  const onBuild = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = [...(e.target.files ?? [])]
    e.target.value = ''
    if (!files.length || building) return
    setBuilding(true); setSelected(null)
    const show = (text: string, fact = 'Das erste Foto sollte das Auto von vorne zeigen. Bis zu 4 Fotos werden benutzt.') =>
      setCard({ tag: 'Wird gebaut', title: '3D-Modell aus Fotos', text, fact })
    show(`${Math.min(files.length, 4)} Foto(s) werden hochgeladen …`)
    try {
      const url = await photosTo3d(files, p => show(`Meshy rechnet: ${p.progress} % fertig. Das dauert meist ein paar Minuten.`))
      setSource({ kind: 'glb', url })
      setHoodOpen(false); setDoorsOpen(false); setView('outside')
      setCard(car.parts.scan)
    } catch (err) {
      setCard({ tag: 'Hat nicht geklappt', title: 'Kein 3D-Modell', text: String(err instanceof Error ? err.message : err), fact: 'Tipp: ruhiger Hintergrund, ganzes Auto im Bild, gutes Licht.' })
    } finally {
      setBuilding(false)
    }
  }

  return (
    <div className="section">
      <div className="section-head">
        <div>
          <h2 className="section-title">{car.name}</h2>
          <div className="sub">{scanned ? 'Modell aus deinen Fotos' : 'Beispielauto · noch kein echtes Modell'}</div>
        </div>
        <div className="uploads">
        <label className="upload" title="Foto vom Spielzeugauto: die Farbe wird übernommen">
          {photo && <img src={photo.url} alt="" />}
          <span>{photo ? photo.label : '📷 Foto vom Spielzeugauto'}</span>
          <input id="photo" type="file" accept="image/*" onChange={onPhoto} />
        </label>
        <label className="upload" title="1 bis 4 Fotos vom Spielzeugauto, zuerst von vorne">
          <span>{building ? '⏳ Wird gebaut …' : '🪄 3D aus Fotos'}</span>
          <input id="build" type="file" accept="image/*" multiple disabled={building} onChange={onBuild} />
        </label>
        <label className="upload" title="Fertiges 3D-Modell (.glb), z.B. aus einem Foto-zu-3D-Dienst">
          <span>{scanned ? '✅ Eigenes 3D-Modell' : '📦 3D-Modell laden'}</span>
          <input id="model" type="file" accept=".glb,model/gltf-binary" onChange={onModel} />
        </label>
        <label className="upload" title="360°-Bild vom Innenraum (am besten im Format 2:1)">
          <span>{panorama ? '✅ Innenraum-Bild' : '🖼️ Innenraum-Bild'}</span>
          <input id="pano" type="file" accept="image/*" onChange={e => {
            const f = e.target.files?.[0]
            if (f) { setPanorama(URL.createObjectURL(f)); setView('inside'); if (!scanned) setDoorsOpen(true); setSelected(null); setCard(car.parts.interior) }
          }} />
        </label>
        </div>
      </div>

      <div className="stage">
        <CarScene paint={paint} selected={selected} onPick={onPick} hoodOpen={hoodOpen} doorsOpen={doorsOpen} driving={driving} view={view} cardOpen={!!card} source={source} panorama={panorama} />
        <div className="hint">Ziehen zum Drehen · Tippen auf ein Teil</div>
        {card && <InfoCard info={card} onClose={() => { setCard(null); setSelected(null) }} />}
      </div>

      <nav className="toolbar" aria-label="Aktionen">
        <button className="btn" aria-pressed={hoodOpen} onClick={toggleHood} disabled={scanned} title={scanned ? 'Geht bei Modellen aus Fotos nicht' : undefined}>🔧 Motorhaube</button>
        <button className="btn" aria-pressed={doorsOpen} onClick={() => setDoorsOpen(!doorsOpen)} disabled={scanned} title={scanned ? 'Geht bei Modellen aus Fotos nicht' : undefined}>🚪 Türen</button>
        <button className="btn" aria-pressed={view === 'inside'} onClick={toggleInside}>🪑 Einsteigen</button>
        <button className="btn" aria-pressed={driving} onClick={toggleDrive}>🏁 Fahren</button>
        {scanned && <button className="btn" onClick={() => { setSource({ kind: 'demo' }); setCard(car.summary) }}>↩︎ Beispielauto</button>}
        {!scanned && <div className="swatches" role="group" aria-label="Farbe">
          {PAINT_COLORS.map(c => (
            <button key={c.hex} className="swatch" title={c.name} aria-label={`Farbe ${c.name}`}
              aria-pressed={paint === c.hex} style={{ background: c.hex }} onClick={() => setPaint(c.hex)} />
          ))}
        </div>}
      </nav>
    </div>
  )
}
