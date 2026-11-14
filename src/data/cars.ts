import type { CarProfile } from './types'

export const PAINT_COLORS: { name: string; hex: string }[] = [
  { name: 'Rot', hex: '#e63946' },
  { name: 'Blau', hex: '#1d6fd8' },
  { name: 'Gelb', hex: '#f4c20d' },
  { name: 'Grün', hex: '#2a9d55' },
  { name: 'Schwarz', hex: '#1b1d21' },
  { name: 'Weiß', hex: '#f3f4f6' },
]

/** Teile, die jedes Auto hat. Ein Profil kann einzelne Einträge überschreiben. */
const COMMON_PARTS: CarProfile['parts'] = {
  body: { tag: 'Außen', title: 'Karosserie', text: 'Die Hülle aus Blech schützt alle Teile und die Menschen im Auto.', fact: 'Unter dem Lack sind mehrere Schichten, damit nichts rostet.' },
  hood: { tag: 'Außen', title: 'Motorhaube', text: 'Unter der Haube versteckt sich der Motor. Tipp auf „Motorhaube“, um sie zu öffnen.', fact: 'Bei manchen Sportwagen ist der Motor hinten, dann ist vorne der Kofferraum.' },
  door: { tag: 'Außen', title: 'Tür', text: 'Durch die Türen steigt man ein. Tipp auf „Türen“ und dann auf „Einsteigen“.', fact: 'In jeder Tür steckt ein Stahlrohr, das bei einem Unfall schützt.' },
  glass: { tag: 'Außen', title: 'Scheiben', text: 'Die Frontscheibe ist aus Sicherheitsglas. Wenn sie bricht, bleibt sie an einer Folie hängen.', fact: 'Scheibenwischer wurden 1903 von Mary Anderson erfunden.' },
  wheel: { tag: 'Außen', title: 'Rad und Reifen', text: 'Der Gummireifen hält das Auto auf der Straße. Die Felge in der Mitte ist aus Metall.', fact: 'Die Rillen im Reifen leiten Regenwasser weg, damit das Auto nicht rutscht.' },
  headlight: { tag: 'Außen', title: 'Scheinwerfer', text: 'Die Scheinwerfer leuchten nachts die Straße aus.', fact: 'Moderne Scheinwerfer haben LEDs und können um Kurven leuchten.' },
  taillight: { tag: 'Außen', title: 'Rücklicht', text: 'Die roten Lichter hinten zeigen anderen, wo das Auto ist. Beim Bremsen leuchten sie heller.', fact: 'Rot sieht man auch bei Nebel gut.' },
  mirror: { tag: 'Außen', title: 'Außenspiegel', text: 'Im Spiegel sieht man, was neben und hinter dem Auto passiert.', fact: 'Der rechte Spiegel ist leicht gewölbt, damit man mehr sieht.' },
  exhaust: { tag: 'Außen', title: 'Auspuff', text: 'Hier kommen die Abgase vom Motor heraus.', fact: 'Elektroautos haben gar keinen Auspuff.' },
  engine: { tag: 'Motor', title: 'Motorblock', text: 'Das Herz des Autos. Im Inneren bewegen sich Kolben auf und ab und treiben die Räder an.', fact: 'Ein Kolben bewegt sich bei Autobahnfahrt etwa 50-mal pro Sekunde.' },
  battery: { tag: 'Motor', title: 'Batterie', text: 'Die Batterie gibt Strom zum Starten, für Licht und Radio.', fact: 'Beim Fahren lädt die Lichtmaschine die Batterie wieder auf.' },
  radiator: { tag: 'Motor', title: 'Kühler', text: 'Der Kühler kühlt den Motor mit Wasser und Fahrtwind, damit er nicht zu heiß wird.', fact: 'Das Kühlwasser im Motor wird etwa 90 Grad warm.' },
  airfilter: { tag: 'Motor', title: 'Luftfilter', text: 'Der Motor braucht Luft zum Arbeiten. Der Filter hält Staub und Insekten draußen.', fact: 'Ohne Filter würde Sand den Motor von innen abschleifen.' },
  oil: { tag: 'Motor', title: 'Öldeckel', text: 'Hier wird Motoröl nachgefüllt. Öl lässt die Teile im Motor leicht gleiten.', fact: 'Ohne Öl würde ein Motor nach wenigen Minuten kaputtgehen.' },
  coolant: { tag: 'Motor', title: 'Kühlwasserbehälter', text: 'In diesem Behälter sieht man, ob genug Kühlwasser da ist.', fact: 'Das Kühlwasser ist oft rosa oder grün gefärbt.' },
  steering: { tag: 'Innenraum', title: 'Lenkrad', text: 'Mit dem Lenkrad bestimmt man die Richtung. In der Mitte sind Hupe und Airbag.', fact: 'Tipp nochmal drauf: Hup hup!' },
  dash: { tag: 'Innenraum', title: 'Armaturenbrett', text: 'Hier sind Tacho, Lüftung und Radio.', fact: 'Der Tacho zeigt, wie schnell das Auto gerade fährt.' },
  speedo: { tag: 'Innenraum', title: 'Tacho', text: 'Der Zeiger zeigt die Geschwindigkeit in km/h.', fact: 'Beim Fahren bewegt sich der Zeiger mit.' },
  seat: { tag: 'Innenraum', title: 'Sitz', text: 'Bequeme Sitze mit Gurt. Kinder sitzen hinten im Kindersitz.', fact: 'Der Gurt hält dich bei einer Vollbremsung sicher fest.' },
  gear: { tag: 'Innenraum', title: 'Schalthebel', text: 'Mit dem Schalthebel wählt man den Gang: vorwärts, rückwärts oder parken.', fact: 'Viele Autos schalten heute von allein.' },
}

export const CARS: CarProfile[] = [
  {
    id: 'demo-sportwagen',
    name: 'Kleiner Sportwagen',
    defaultColor: '#e63946',
    summary: {
      tag: 'Steckbrief',
      title: 'Kleiner Sportwagen',
      text: 'Ein flacher Zweitürer mit Motor vorne. Später steht hier das echte Auto, das die App auf deinem Foto erkennt.',
      specs: [['Leistung', '180 PS'], ['Spitze', '230 km/h'], ['0 auf 100', '6,5 Sekunden'], ['Gewicht', '1.250 kg'], ['Sitze', '4']],
      fact: 'Das sind Beispielwerte. Beim echten Auto kommen sie aus der Auto-Bibliothek.',
    },
    parts: COMMON_PARTS,
  },
]
