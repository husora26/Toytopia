import type { PartInfo } from '../../data/types'

export function InfoCard({ info, onClose }: { info: PartInfo; onClose: () => void }) {
  return (
    <aside className="info" aria-live="polite">
      <button className="close" aria-label="Schließen" onClick={onClose}>×</button>
      <span className="tag">{info.tag}</span>
      <h2>{info.title}</h2>
      <p>{info.text}</p>
      {info.specs && (
        <dl>
          {info.specs.map(([a, b]) => (
            <div key={a} className="row"><dt>{a}</dt><dd>{b}</dd></div>
          ))}
        </dl>
      )}
      <p className="fact">💡 {info.fact}</p>
    </aside>
  )
}
