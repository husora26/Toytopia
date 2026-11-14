import { useState } from 'react'
import { CarSection } from './features/car/CarSection'

type Section = 'cars' | 'plush' | 'room'

const SECTIONS: { id: Section; label: string; ready: boolean }[] = [
  { id: 'cars', label: '🚗 Autos', ready: true },
  { id: 'plush', label: '🧸 Kuscheltiere', ready: false },
  { id: 'room', label: '🏠 Kinderzimmer', ready: false },
]

export default function App() {
  const [section, setSection] = useState<Section>('cars')
  return (
    <div className="app">
      <header>
        <h1>Spielzeug-<span>Garage</span></h1>
        <nav className="tabs" aria-label="Bereiche">
          {SECTIONS.map(s => (
            <button key={s.id} className="tab" aria-pressed={section === s.id} onClick={() => setSection(s.id)}>
              {s.label}{!s.ready && <small> bald</small>}
            </button>
          ))}
        </nav>
      </header>
      {section === 'cars' ? (
        <CarSection />
      ) : (
        <div className="soon">
          <h2>{section === 'plush' ? 'Kuscheltiere' : 'Kinderzimmer'} kommen bald</h2>
          <p>{section === 'plush'
            ? 'Foto vom Kuscheltier machen, das echte Tier kennenlernen, Geräusche hören und zusehen, wie es sich bewegt.'
            : 'Mit mehreren Fotos das ganze Zimmer erfassen, alle Spielsachen zum Leben erwecken und mit einem Avatar herumlaufen.'}</p>
        </div>
      )}
    </div>
  )
}
