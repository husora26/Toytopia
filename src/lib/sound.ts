/** Einfache Klänge per WebAudio. Startet erst nach einer Berührung (Browser-Regel). */
let ctx: AudioContext | null = null
const audio = () => (ctx ??= new AudioContext())

let engine: { o: OscillatorNode; o2: OscillatorNode; g: GainNode } | null = null

export function engineOn() {
  if (engine) return
  const a = audio()
  const o = a.createOscillator(), o2 = a.createOscillator(), g = a.createGain(), f = a.createBiquadFilter()
  o.type = 'sawtooth'; o2.type = 'square'
  o.frequency.value = 55; o2.frequency.value = 27.5
  f.type = 'lowpass'; f.frequency.value = 380
  g.gain.value = 0
  o.connect(f); o2.connect(f); f.connect(g); g.connect(a.destination)
  o.start(); o2.start()
  g.gain.linearRampToValueAtTime(0.08, a.currentTime + 0.4)
  engine = { o, o2, g }
}

export function engineOff() {
  if (!engine) return
  const e = engine, a = audio()
  engine = null
  e.g.gain.linearRampToValueAtTime(0, a.currentTime + 0.4)
  setTimeout(() => { e.o.stop(); e.o2.stop() }, 500)
}

/** speed 0..1 */
export function engineRev(speed: number) {
  if (!engine) return
  engine.o.frequency.value = 55 + speed * 45
  engine.o2.frequency.value = 27.5 + speed * 22
}

export function honk() {
  const a = audio(), g = a.createGain()
  g.gain.value = 0.12
  g.connect(a.destination)
  for (const fr of [392, 494]) {
    const o = a.createOscillator()
    o.type = 'square'; o.frequency.value = fr
    o.connect(g); o.start(); o.stop(a.currentTime + 0.35)
  }
}
