import { useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { CarModel, type Motion } from './CarModel'
import { engineRev } from '../../lib/sound'

export type CameraView = 'outside' | 'engine' | 'inside'

const ROAD_R = 9.5
const ROAD_Z = 9.5 // Mittelpunkt der Ringstraße; das Auto startet an ihrem Rand

/** Kamerapunkte im Koordinatensystem des Autos: [Position, Blickziel] */
const VIEWS: Record<CameraView, [THREE.Vector3, THREE.Vector3, number]> = {
  outside: [new THREE.Vector3(6.5, 3.4, 6.5), new THREE.Vector3(0, 0.7, 0), 40],
  engine: [new THREE.Vector3(3.6, 2.9, 1.6), new THREE.Vector3(1.4, 0.7, 0), 40],
  inside: [new THREE.Vector3(-0.25, 1.22, 0.4), new THREE.Vector3(1.6, 1.0, 0.4), 62],
}

function Ground() {
  const dashes = Array.from({ length: 48 }, (_, i) => (i / 48) * Math.PI * 2)
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, ROAD_Z]} receiveShadow>
        <circleGeometry args={[26, 72]} />
        <meshStandardMaterial color="#9ccf8a" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, ROAD_Z]} receiveShadow>
        <ringGeometry args={[ROAD_R - 1.5, ROAD_R + 1.5, 96]} />
        <meshStandardMaterial color="#5c636b" roughness={0.9} />
      </mesh>
      {dashes.map(a => (
        <mesh key={a} rotation={[-Math.PI / 2, 0, -a]} position={[Math.cos(a) * ROAD_R, 0.02, ROAD_Z + Math.sin(a) * ROAD_R]}>
          <planeGeometry args={[0.9, 0.12]} />
          <meshBasicMaterial color="#f5f5f5" />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
        <circleGeometry args={[3.6, 64]} />
        <meshStandardMaterial color="#e8edf2" roughness={0.8} />
      </mesh>
    </group>
  )
}

interface Props {
  paint: string
  selected: string | null
  onPick: (key: string | null) => void
  hoodOpen: boolean
  doorsOpen: boolean
  driving: boolean
  view: CameraView
  /** Infokarte offen: auf schmalen Bildschirmen das Bild nach oben schieben, damit die Karte das Auto nicht verdeckt */
  cardOpen: boolean
}

function Rig({ driving, view, car, motion, cardOpen }: { driving: boolean; view: CameraView; car: React.RefObject<THREE.Group>; motion: Motion; cardOpen: boolean }) {
  const { camera, controls, size } = useThree() as unknown as { camera: THREE.PerspectiveCamera; controls: OrbitControlsImpl | null; size: { width: number; height: number } }
  const shift = useRef(0)
  const tween = useRef<{ t: number; fp: THREE.Vector3; tp: THREE.Vector3; ft: THREE.Vector3; tt: THREE.Vector3 } | null>(null)
  const state = useRef({ angle: 0, last: new THREE.Vector3() })

  // Kamerafahrt, wenn die Ansicht wechselt
  useEffect(() => {
    if (!controls || !car.current) return
    const [pos, target, fov] = VIEWS[view]
    camera.fov = fov
    camera.updateProjectionMatrix()
    controls.minDistance = view === 'inside' ? 0.01 : 2.5
    controls.maxPolarAngle = view === 'inside' ? Math.PI * 0.75 : Math.PI * 0.49
    car.current.updateMatrixWorld()
    tween.current = {
      t: 0,
      fp: camera.position.clone(), tp: car.current.localToWorld(pos.clone()),
      ft: controls.target.clone(), tt: car.current.localToWorld(target.clone()),
    }
  }, [view, controls, camera, car])

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    // Bildausschnitt sanft verschieben (nur schmale Bildschirme, nicht im Innenraum)
    const want = cardOpen && size.width < 640 && view !== 'inside' ? 0.2 : 0
    if (Math.abs(want - shift.current) > 0.001) {
      shift.current += (want - shift.current) * Math.min(1, dt * 6)
      if (shift.current < 0.002 && want === 0) { shift.current = 0; camera.clearViewOffset() }
      else camera.setViewOffset(size.width, size.height, 0, size.height * shift.current, size.width, size.height)
    }
    const g = car.current
    if (!g || !controls) return
    const s = state.current
    motion.speed += ((driving ? 1 : 0) - motion.speed) * Math.min(1, dt * 1.5)
    if (motion.speed > 0.001) {
      s.last.copy(g.position)
      s.angle += motion.speed * dt * 0.45
      g.position.set(Math.sin(s.angle) * ROAD_R, 0, ROAD_Z - Math.cos(s.angle) * ROAD_R)
      g.rotation.y = -s.angle
      const delta = g.position.clone().sub(s.last)
      motion.wheelAngle += delta.length() / 0.38
      camera.position.add(delta) // Kamera fährt mit
      controls.target.add(delta)
      engineRev(motion.speed)
    }
    const tw = tween.current
    if (tw) {
      tw.t = Math.min(1, tw.t + dt / 1.1)
      const k = tw.t < 0.5 ? 2 * tw.t * tw.t : 1 - Math.pow(-2 * tw.t + 2, 2) / 2
      camera.position.lerpVectors(tw.fp, tw.tp, k)
      controls.target.lerpVectors(tw.ft, tw.tt, k)
      if (tw.t >= 1) tween.current = null
    }
  })
  return null
}

export function CarScene(p: Props) {
  const car = useRef<THREE.Group>(null)
  const motion = useRef<Motion>({ speed: 0, wheelAngle: 0 }).current
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [6.5, 3.4, 6.5], fov: 40, near: 0.05, far: 200 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      onPointerMissed={e => { if (e.type === 'click') p.onPick(null) }}
      style={{ touchAction: 'none' }}
      aria-label="3D-Ansicht des Autos. Ziehen zum Drehen, tippen auf ein Teil für Infos."
    >
      <hemisphereLight args={['#ffffff', '#8899aa', 1.3]} />
      <directionalLight
        position={[6, 10, 4]} intensity={2.2} castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-24} shadow-camera-right={24} shadow-camera-top={30} shadow-camera-bottom={-24}
      />
      <Ground />
      <group ref={car}>
        <CarModel paint={p.paint} selected={p.selected} onPick={p.onPick} hoodOpen={p.hoodOpen} doorsOpen={p.doorsOpen} motion={motion} />
      </group>
      <OrbitControls makeDefault enableDamping target={[0, 0.7, 0]} minDistance={2.5} maxDistance={30} maxPolarAngle={Math.PI * 0.49} />
      <Rig driving={p.driving} view={p.view} car={car} motion={motion} cardOpen={p.cardOpen} />
    </Canvas>
  )
}
