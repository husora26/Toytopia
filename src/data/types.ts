/** Infokarte zu einem anklickbaren Teil oder zum ganzen Spielzeug. */
export interface PartInfo {
  tag: string
  title: string
  text: string
  fact: string
  specs?: [label: string, value: string][]
}

/**
 * Ein Eintrag der Auto-Bibliothek.
 * Später: `modelUrl` zeigt auf ein GLB, dessen Knoten genau so heißen wie die Schlüssel in `parts`.
 */
export interface CarProfile {
  id: string
  name: string
  summary: PartInfo
  parts: Record<string, PartInfo>
  defaultColor: string
  modelUrl?: string
}
