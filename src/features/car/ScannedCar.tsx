import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'

/** Länge, auf die jedes geladene Modell skaliert wird (gleich wie das Beispielauto). */
export const CAR_LENGTH = 4.3

/**
 * Ein fertiges 3D-Modell (GLB), z.B. aus einem Foto-zu-3D-Dienst.
 * Wird auf Autolänge skaliert, auf den Boden gestellt und so gedreht, dass die lange Seite entlang x liegt.
 * Solche Modelle sind eine geschlossene Hülle: Türen und Motorhaube lassen sich nicht öffnen.
 */
export function ScannedCar({ url, onPick }: { url: string; onPick: (key: string) => void }) {
  const { scene } = useGLTF(url)
  const object = useMemo(() => {
    const root = scene.clone(true)
    root.traverse(o => {
      if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true }
    })
    const box = new THREE.Box3().setFromObject(root)
    const size = box.getSize(new THREE.Vector3())
    if (size.z > size.x) root.rotation.y = Math.PI / 2
    const wrapper = new THREE.Group()
    wrapper.add(root)
    const b2 = new THREE.Box3().setFromObject(wrapper)
    const s2 = b2.getSize(new THREE.Vector3())
    const scale = CAR_LENGTH / Math.max(s2.x, 0.0001)
    wrapper.scale.setScalar(scale)
    const b3 = new THREE.Box3().setFromObject(wrapper)
    const c = b3.getCenter(new THREE.Vector3())
    wrapper.position.set(-c.x, -b3.min.y, -c.z)
    return wrapper
  }, [scene])

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 6) return
    e.stopPropagation()
    onPick('scan')
  }
  return <primitive object={object} onClick={onClick} />
}
