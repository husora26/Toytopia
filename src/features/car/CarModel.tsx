import { createContext, useContext, useMemo, useRef, type ReactNode } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Beispielauto aus Grundformen. Jedes anklickbare Teil trägt einen Schlüssel (`k`),
 * der zu einem Eintrag in `CarProfile.parts` passt. Ein echtes GLB-Modell ersetzt
 * später diese Datei; seine Knoten heißen dann genauso.
 */

export interface Motion { speed: number; wheelAngle: number }

interface CarCtx {
  paint: string
  selected: string | null
  onPick: (key: string) => void
}
const Ctx = createContext<CarCtx>({ paint: '#e63946', selected: null, onPick: () => {} })

type V3 = [number, number, number]
interface MatSpec {
  color?: string
  metalness?: number
  roughness?: number
  emissive?: string
  emissiveIntensity?: number
  opacity?: number
}
const HIGHLIGHT = '#ff8a3d'

function Material({ spec, paint, glass, lit }: { spec?: MatSpec; paint?: boolean; glass?: boolean; lit: boolean }) {
  const { paint: paintColor } = useContext(Ctx)
  const emissive = lit ? HIGHLIGHT : spec?.emissive ?? '#000000'
  const emissiveIntensity = lit ? 0.8 : spec?.emissiveIntensity ?? 0
  if (glass) {
    return <meshPhysicalMaterial color={lit ? HIGHLIGHT : '#aad4ff'} transparent opacity={lit ? 0.5 : 0.28} roughness={0.05} side={THREE.DoubleSide} depthWrite={false} />
  }
  if (paint) {
    return <meshPhysicalMaterial color={paintColor} metalness={0.4} roughness={0.32} clearcoat={1} clearcoatRoughness={0.08} emissive={emissive} emissiveIntensity={emissiveIntensity} />
  }
  return (
    <meshStandardMaterial
      color={spec?.color ?? '#888888'}
      metalness={spec?.metalness ?? 0}
      roughness={spec?.roughness ?? 0.6}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
      transparent={spec?.opacity !== undefined}
      opacity={spec?.opacity ?? 1}
    />
  )
}

function usePick(k?: string) {
  const { selected, onPick } = useContext(Ctx)
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (!k || e.delta > 6) return // war ein Drehen, kein Tippen
    e.stopPropagation()
    onPick(k)
  }
  return { lit: !!k && selected === k, onClick }
}

interface PartProps { k?: string; position?: V3; rotation?: V3; m?: MatSpec; paint?: boolean; glass?: boolean }

/** Abgerundeter Quader */
function Box({ size, r = 0.04, ...p }: PartProps & { size: V3; r?: number }) {
  const { lit, onClick } = usePick(p.k)
  return (
    <RoundedBox args={size} radius={r} smoothness={3} position={p.position} rotation={p.rotation} castShadow receiveShadow onClick={onClick}>
      <Material spec={p.m} paint={p.paint} glass={p.glass} lit={lit} />
    </RoundedBox>
  )
}

function Mesh({ children, ...p }: PartProps & { children: ReactNode }) {
  const { lit, onClick } = usePick(p.k)
  return (
    <mesh position={p.position} rotation={p.rotation} castShadow receiveShadow onClick={onClick}>
      {children}
      <Material spec={p.m} paint={p.paint} glass={p.glass} lit={lit} />
    </mesh>
  )
}

const DARK = { color: '#1c1c1e', roughness: 0.9 }
const CHROME = { color: '#c9d1d8', metalness: 0.9, roughness: 0.25 }
const SEAT = { color: '#6b4f3a', roughness: 0.8 }

function Wheel({ position, motion }: { position: V3; motion: Motion }) {
  const ref = useRef<THREE.Group>(null)
  const out = Math.sign(position[2])
  useFrame(() => { if (ref.current) ref.current.rotation.z = -motion.wheelAngle })
  return (
    <group position={position} ref={ref}>
      <Mesh k="wheel" rotation={[Math.PI / 2, 0, 0]} m={DARK}><cylinderGeometry args={[0.38, 0.38, 0.28, 40]} /></Mesh>
      <Mesh k="wheel" rotation={[Math.PI / 2, 0, 0]} m={CHROME}><cylinderGeometry args={[0.24, 0.24, 0.3, 24]} /></Mesh>
      {[0, 1, 2, 3, 4].map(i => (
        <Mesh key={i} k="wheel" position={[0, 0, out * 0.16]} rotation={[0, 0, (i / 5) * Math.PI * 2]} m={{ color: '#8a949d', metalness: 0.9, roughness: 0.3 }}>
          <boxGeometry args={[0.05, 0.4, 0.02]} />
        </Mesh>
      ))}
    </group>
  )
}

export interface CarModelProps {
  paint: string
  selected: string | null
  onPick: (key: string) => void
  hoodOpen: boolean
  doorsOpen: boolean
  motion: Motion
}

export function CarModel({ paint, selected, onPick, hoodOpen, doorsOpen, motion }: CarModelProps) {
  const hood = useRef<THREE.Group>(null)
  const doorL = useRef<THREE.Group>(null)
  const doorR = useRef<THREE.Group>(null)
  const needle = useRef<THREE.Mesh>(null)
  const anim = useRef({ hood: 0, doors: 0 })

  useFrame((_, dt) => {
    const a = anim.current, k = Math.min(1, dt * 5)
    a.hood += ((hoodOpen ? 1 : 0) - a.hood) * k
    a.doors += ((doorsOpen ? 1 : 0) - a.doors) * k
    if (hood.current) hood.current.rotation.z = a.hood * 1.05
    if (doorL.current) doorL.current.rotation.y = a.doors * 1.1
    if (doorR.current) doorR.current.rotation.y = -a.doors * 1.1
    if (needle.current) needle.current.rotation.z = 1.2 - motion.speed * 2.2
  })

  const ctx = useMemo(() => ({ paint, selected, onPick }), [paint, selected, onPick])
  const pane = (w: number, h: number, lean: number) => new THREE.PlaneGeometry(w, h).rotateY(Math.PI / 2).rotateZ(lean)
  const windshield = useMemo(() => pane(1.52, 0.66, 0.5), [])
  const rearWindow = useMemo(() => pane(1.52, 0.62, -0.45), [])

  return (
    <Ctx.Provider value={ctx}>
      {/* Karosserie */}
      <Box k="body" paint size={[4.3, 0.22, 1.76]} r={0.06} position={[0, 0.36, 0]} />
      <Box k="body" paint size={[1.05, 0.5, 1.76]} r={0.12} position={[-1.62, 0.68, 0]} />
      <Box k="body" paint size={[0.14, 0.5, 1.76]} r={0.06} position={[2.08, 0.68, 0]} />
      <Box k="body" paint size={[1.32, 0.5, 0.08]} r={0.03} position={[1.42, 0.68, 0.84]} />
      <Box k="body" paint size={[1.32, 0.5, 0.08]} r={0.03} position={[1.42, 0.68, -0.84]} />
      <Box k="body" paint size={[0.08, 0.5, 1.76]} r={0.03} position={[0.78, 0.68, 0]} />
      <Box k="body" paint size={[0.12, 0.5, 1.76]} r={0.03} position={[-1.06, 0.68, 0]} />
      <Box k="body" paint size={[1.55, 0.08, 1.6]} position={[-0.32, 1.5, 0]} />
      {[0.76, -0.76].map(z => (
        <group key={z}>
          <Box k="body" paint size={[0.08, 0.66, 0.08]} r={0.02} position={[0.6, 1.2, z]} rotation={[0, 0, 0.5]} />
          <Box k="body" paint size={[0.08, 0.62, 0.08]} r={0.02} position={[-1.17, 1.2, z]} rotation={[0, 0, -0.45]} />
        </group>
      ))}
      <Box k="body" size={[0.05, 0.12, 1.2]} r={0.02} position={[2.16, 0.52, 0]} m={{ color: '#222428' }} />

      {/* Scheiben: nicht anklickbar, damit man durch sie hindurch ins Auto tippen kann */}
      <mesh geometry={windshield} position={[0.6, 1.2, 0]}><Glass k="glass" /></mesh>
      <mesh geometry={rearWindow} position={[-1.17, 1.2, 0]}><Glass k="glass" /></mesh>
      <mesh position={[-0.28, 1.17, 0.8]}><planeGeometry args={[1.45, 0.55]} /><Glass k="glass" /></mesh>
      <mesh position={[-0.28, 1.17, -0.8]}><planeGeometry args={[1.45, 0.55]} /><Glass k="glass" /></mesh>

      {/* Motorhaube, Gelenk an der Spritzwand */}
      <group ref={hood} position={[0.76, 0.94, 0]}>
        <Box k="hood" paint size={[1.42, 0.07, 1.74]} r={0.03} position={[0.71, 0, 0]} />
      </group>

      {/* Türen, Gelenk vorne */}
      {([[doorL, 1], [doorR, -1]] as const).map(([ref, side]) => (
        <group key={side} ref={ref} position={[0.74, 0.68, side * 0.88]}>
          <Box k="door" paint size={[1.74, 0.5, 0.07]} r={0.03} position={[-0.87, 0, 0]} />
          <Box k="door" size={[0.18, 0.03, 0.03]} r={0.01} position={[-1.4, 0.12, side * 0.05]} m={CHROME} />
        </group>
      ))}

      {/* Räder */}
      {([[1.42, 0.86], [1.42, -0.86], [-1.45, 0.86], [-1.45, -0.86]] as const).map(([x, z]) => (
        <Wheel key={`${x}${z}`} position={[x, 0.38, z]} motion={motion} />
      ))}

      {/* Lichter, Spiegel, Auspuff */}
      {[0.6, -0.6].map(z => (
        <group key={z}>
          <Box k="headlight" size={[0.06, 0.14, 0.36]} r={0.03} position={[2.16, 0.78, z]} m={{ color: '#fff6c2', emissive: '#ffe88a', emissiveIntensity: 0.6 }} />
          <Box k="taillight" size={[0.06, 0.1, 0.4]} r={0.03} position={[-2.15, 0.8, z]} m={{ color: '#d62828', emissive: '#8a0000', emissiveIntensity: 0.5 }} />
          <Box k="mirror" paint size={[0.16, 0.1, 0.22]} r={0.03} position={[0.45, 1.0, z * 1.6]} />
        </group>
      ))}
      <Mesh k="exhaust" position={[-2.2, 0.32, 0.5]} rotation={[0, 0, Math.PI / 2]} m={{ color: '#9aa3ab', metalness: 0.9, roughness: 0.3 }}>
        <cylinderGeometry args={[0.06, 0.06, 0.3, 16]} />
      </Mesh>

      {/* Motorraum */}
      <Box size={[1.2, 0.04, 1.6]} r={0.01} position={[1.42, 0.47, 0]} m={{ color: '#2a2e33' }} />
      <Box k="engine" size={[0.62, 0.36, 0.66]} r={0.05} position={[1.38, 0.68, -0.05]} m={{ color: '#8d969e', metalness: 0.7, roughness: 0.35 }} />
      {[0, 1, 2, 3].map(i => (
        <Mesh key={i} k="engine" position={[1.2 + i * 0.12, 0.89, -0.05]} m={{ color: '#3b3f45' }}><cylinderGeometry args={[0.05, 0.05, 0.06, 16]} /></Mesh>
      ))}
      <Box k="battery" size={[0.3, 0.24, 0.22]} r={0.03} position={[1.15, 0.62, 0.6]} m={{ color: '#1f2328' }} />
      <Mesh k="battery" position={[1.08, 0.76, 0.6]} m={{ color: '#d62828' }}><cylinderGeometry args={[0.03, 0.03, 0.04, 12]} /></Mesh>
      <Mesh k="battery" position={[1.22, 0.76, 0.6]} m={{ color: '#111111' }}><cylinderGeometry args={[0.03, 0.03, 0.04, 12]} /></Mesh>
      <Box k="radiator" size={[0.06, 0.36, 1.3]} r={0.02} position={[1.98, 0.7, 0]} m={{ color: '#50575e', metalness: 0.6, roughness: 0.4 }} />
      <Mesh k="airfilter" position={[1.7, 0.82, 0.42]} m={{ color: '#2b5c8a', roughness: 0.4 }}><cylinderGeometry args={[0.17, 0.17, 0.14, 28]} /></Mesh>
      <Mesh k="oil" position={[1.5, 0.89, -0.25]} m={{ color: '#f2c12e' }}><cylinderGeometry args={[0.05, 0.05, 0.04, 16]} /></Mesh>
      <Box k="coolant" size={[0.16, 0.18, 0.14]} r={0.03} position={[1.78, 0.66, -0.6]} m={{ color: '#f0a6ca', opacity: 0.75 }} />

      {/* Innenraum */}
      <Box size={[1.8, 0.04, 1.62]} r={0.01} position={[-0.14, 0.5, 0]} m={{ color: '#2f3338' }} />
      <Box k="dash" size={[0.3, 0.26, 1.6]} r={0.05} position={[0.6, 0.8, 0]} m={{ color: '#3a4048' }} />
      <group position={[0.44, 0.84, 0.4]} rotation={[0, -Math.PI / 2, 0]}>
        <Mesh k="speedo" m={{ color: '#f4f4f4', emissive: '#334455', emissiveIntensity: 0.3 }}><circleGeometry args={[0.09, 24]} /></Mesh>
        <mesh ref={needle} position={[0, 0, 0.004]}>
          <boxGeometry args={[0.008, 0.075, 0.004]} />
          <meshStandardMaterial color="#d62828" />
        </mesh>
      </group>
      <group position={[0.3, 0.95, 0.4]} rotation={new THREE.Euler(-0.35, Math.PI / 2, 0, 'YXZ')}>
        <Mesh k="steering" m={{ color: '#1a1a1a' }}><torusGeometry args={[0.17, 0.025, 12, 40]} /></Mesh>
        <Mesh k="steering" rotation={[Math.PI / 2, 0, 0]} m={{ color: '#333333' }}><cylinderGeometry args={[0.05, 0.05, 0.04, 20]} /></Mesh>
        <Mesh k="steering" m={{ color: '#1a1a1a' }}><boxGeometry args={[0.32, 0.03, 0.02]} /></Mesh>
      </group>
      {[0.4, -0.4].map(z => (
        <group key={z}>
          <Box k="seat" size={[0.48, 0.14, 0.5]} r={0.05} position={[-0.12, 0.62, z]} m={SEAT} />
          <Box k="seat" size={[0.12, 0.62, 0.5]} r={0.05} position={[-0.38, 0.94, z]} rotation={[0, 0, 0.12]} m={SEAT} />
        </group>
      ))}
      <Box k="seat" size={[0.46, 0.14, 1.4]} r={0.05} position={[-0.82, 0.62, 0]} m={SEAT} />
      <Box k="seat" size={[0.12, 0.56, 1.4]} r={0.05} position={[-1.0, 0.92, 0]} rotation={[0, 0, 0.12]} m={SEAT} />
      <Mesh k="gear" position={[0.25, 0.72, 0]} rotation={[0, 0, -0.25]} m={{ color: '#777777' }}><cylinderGeometry args={[0.02, 0.02, 0.22, 10]} /></Mesh>
      <Mesh k="gear" position={[0.28, 0.83, 0]} m={{ color: '#111111' }}><sphereGeometry args={[0.045, 16, 12]} /></Mesh>
    </Ctx.Provider>
  )
}

/** Glasmaterial für Scheiben mit eigener Geometrie; Klicks laufen über das Eltern-Mesh. */
function Glass({ k }: { k: string }) {
  const { selected } = useContext(Ctx)
  return <Material glass lit={selected === k} />
}
