import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Innenraum als 360°-Rundumbild. Die Kamera steht in der Mitte einer Kugel,
 * auf deren Innenseite das Bild liegt. Bilder im Format 2:1 passen genau; breitere
 * Bilder (z.B. 16:9) werden leicht gestaucht. Die Bildmitte zeigt nach vorne (+x).
 */
export function PanoramaRoom({ url, position }: { url: string; position: THREE.Vector3 }) {
  const tex = useTexture(url)
  tex.colorSpace = THREE.SRGBColorSpace
  return (
    <mesh position={position} scale={[-1, 1, 1]} rotation={[0, Math.PI, 0]} renderOrder={-1}>
      <sphereGeometry args={[40, 64, 32]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}
