import { useCallback, useState } from 'react'
import { CarScene, type CameraView } from './CarScene'
import { InfoCard } from './InfoCard'
import { CARS, PAINT_COLORS } from '../../data/cars'
import type { PartInfo } from '../../data/types'
import { dominantColor } from '../../lib/dominantColor'
import { engineOff, engineOn, honk } from '../../lib/sound'

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
    if (view === 'inside') { setView('outside'); return }
    if (driving) { setDriving(false); engineOff() }
    setHoodOpen(false); setDoorsOpen(true); setView('inside'); onPick('steering')
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

  return (
    <div className="section">
      <div className="section-head">
        <div>
          <h2 className="section-title">{car.name}</h2>
          <div className="sub">Beispielauto · noch kein echtes Modell</div>
        </div>
        <label className="upload" title="Foto vom Spielzeugauto: die Farbe wird übernommen">
          {photo && <img src={photo.url} alt="" />}
          <span>{photo ? photo.label : '📷 Foto vom Spielzeugauto'}</span>
          <input id="photo" type="file" accept="image/*" onChange={onPhoto} />
        </label>
      </div>

      <div className="stage">
        <CarScene paint={paint} selected={selected} onPick={onPick} hoodOpen={hoodOpen} doorsOpen={doorsOpen} driving={driving} view={view} cardOpen={!!card} />
        <div className="hint">Ziehen zum Drehen · Tippen auf ein Teil</div>
        {card && <InfoCard info={card} onClose={() => { setCard(null); setSelected(null) }} />}
      </div>

      <nav className="toolbar" aria-label="Aktionen">
        <button className="btn" aria-pressed={hoodOpen} onClick={toggleHood}>🔧 Motorhaube</button>
        <button className="btn" aria-pressed={doorsOpen} onClick={() => setDoorsOpen(!doorsOpen)}>🚪 Türen</button>
        <button className="btn" aria-pressed={view === 'inside'} onClick={toggleInside}>🪑 Einsteigen</button>
        <button className="btn" aria-pressed={driving} onClick={toggleDrive}>🏁 Fahren</button>
        <div className="swatches" role="group" aria-label="Farbe">
          {PAINT_COLORS.map(c => (
            <button key={c.hex} className="swatch" title={c.name} aria-label={`Farbe ${c.name}`}
              aria-pressed={paint === c.hex} style={{ background: c.hex }} onClick={() => setPaint(c.hex)} />
          ))}
        </div>
      </nav>
    </div>
  )
}
