# Toytopia – Spielzeug-Garage

Eine Web-App, die Spielzeug zum Leben erweckt: Foto vom Spielzeug machen, dann das echte Vorbild in 3D erkunden.

## Stand

- **Autos:** Beispielauto in 3D. Drehen, Teile antippen (Infokarte), Motorhaube und Türen öffnen, Motorteile anklicken, einsteigen, auf der Ringstraße fahren, Farbe wechseln oder aus einem Foto übernehmen.
- **Kuscheltiere:** geplant.
- **Kinderzimmer mit Avatar:** später.

Konzept und Architektur: siehe Projekt-Doc „Spielzeug zum Leben erwecken – Konzept & Architektur“.

## Starten

```bash
npm install
npm run dev      # Entwicklungsserver
npm run build    # Produktionsbuild nach dist/
```

## Aufbau

| Pfad | Inhalt |
| --- | --- |
| `src/data/cars.ts` | Auto-Bibliothek: Steckbrief und Infotexte je Bauteil |
| `src/data/types.ts` | Datentypen (`CarProfile`, `PartInfo`) |
| `src/features/car/CarModel.tsx` | Beispielauto aus Grundformen, jedes Teil mit Schlüssel (`k="hood"` usw.) |
| `src/features/car/CarScene.tsx` | 3D-Szene: Straße, Licht, Kamerafahrten, Fahren |
| `src/features/car/CarSection.tsx` | Bedienung: Knöpfe, Farben, Foto, Infokarte |
| `src/lib/dominantColor.ts` | Kräftigste Farbe aus einem Foto lesen |
| `src/lib/sound.ts` | Motorgeräusch und Hupe (WebAudio) |

## Eigene 3D-Modelle und Innenraum

- **📦 3D-Modell laden:** nimmt ein `.glb` (z.B. aus Meshy oder Tripo, aus Fotos vom Spielzeug erzeugt). Das Modell wird auf Autolänge skaliert und auf den Boden gestellt. Es ist eine geschlossene Hülle, deshalb sind Motorhaube und Türen dann aus.
- **🖼️ Innenraum-Bild:** nimmt ein 360°-Rundumbild (am besten 2:1). „Einsteigen“ zeigt dann dieses Bild, und man schaut sich durch Ziehen um. Die Bildmitte ist „vorne“.

## Nächste Schritte

1. Echtes, zerlegbares Automodell (GLB) einbauen. Die Knotennamen im Modell müssen den Schlüsseln in `cars.ts` entsprechen (`hood`, `door`, `engine`, ...).
2. Foto-Erkennung über einen kleinen Server (Supabase Edge Function + Vision-KI), damit Marke und Modell erkannt werden.
3. Kuscheltier-Sektion mit Tierstimmen und Leerlauf-Animation.
