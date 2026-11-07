import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Fondo ambiental (receta 6 de /diseno: malla low-poly con Three.js), adaptado
 * a Kivo como la custodia misma:
 *  · un núcleo de alambre dorado = los fondos retenidos en el escrow;
 *  · dos anillos que orbitan en ejes distintos = comprador (turquesa) y
 *    vendedor (oro). Cada ~9 s se alinean —las dos confirmaciones— y en ese
 *    momento el núcleo se enciende y late: el dinero se libera;
 *  · una nube de partículas alrededor = los pagos de la red.
 * El puntero mueve la cámara y el scroll aleja la escena. Pausa con la pestaña
 * oculta, DPR ≤ 2, menos detalle en celular y un solo cuadro con
 * prefers-reduced-motion. Lee los colores de los tokens CSS (cambian con el tema).
 */
function cssColor(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  if (!v) return new THREE.Color(fallback)
  // los tokens *-rgb vienen como "212 166 71"
  const parts = v.split(/\s+/).map(Number)
  return parts.length === 3 ? new THREE.Color(parts[0] / 255, parts[1] / 255, parts[2] / 255) : new THREE.Color(v)
}

export default function EscrowScene() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile = window.matchMedia('(max-width: 767px)').matches
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !mobile })
    } catch {
      return // sin WebGL queda el fondo CSS
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(0, 0, 8)

    const isLight = () => document.documentElement.dataset.theme === 'light'
    const k = () => (isLight() ? 0.55 : 1)

    const coreGeo = new THREE.IcosahedronGeometry(1.1, mobile ? 1 : 2)
    const coreMat = new THREE.MeshBasicMaterial({ wireframe: true, transparent: true })
    const core = new THREE.Mesh(coreGeo, coreMat)

    const ringGeo = new THREE.TorusGeometry(2.1, 0.012, 8, mobile ? 90 : 160)
    const buyerMat = new THREE.MeshBasicMaterial({ transparent: true })
    const sellerMat = new THREE.MeshBasicMaterial({ transparent: true })
    const buyer = new THREE.Mesh(ringGeo, buyerMat)
    const seller = new THREE.Mesh(ringGeo, sellerMat)

    const count = mobile ? 500 : 1100
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 2.8 + Math.random() * 2.4
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th)
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.7
      pos[i * 3 + 2] = r * Math.cos(ph)
    }
    const ptsGeo = new THREE.BufferGeometry()
    ptsGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const ptsMat = new THREE.PointsMaterial({ size: mobile ? 0.035 : 0.025, transparent: true, depthWrite: false })
    const points = new THREE.Points(ptsGeo, ptsMat)

    const group = new THREE.Group()
    group.add(core, buyer, seller, points)
    scene.add(group)

    const recolor = () => {
      const gold = cssColor('--gold-rgb', '#d4a647')
      const teal = cssColor('--teal-rgb', '#2dd4bf')
      coreMat.color.copy(gold)
      sellerMat.color.copy(gold)
      buyerMat.color.copy(teal)
      ptsMat.color.copy(teal)
      coreMat.opacity = 0.45 * k()
      buyerMat.opacity = 0.7 * k()
      sellerMat.opacity = 0.7 * k()
      ptsMat.opacity = 0.55 * k()
      if (reduce) renderer.render(scene, camera)
    }
    recolor()
    const obs = new MutationObserver(recolor)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    const resize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      group.position.set(mobile ? 0 : w > 1100 ? 3.4 : 2.6, mobile ? 2.3 : 0.2, 0)
      group.scale.setScalar(mobile ? 0.62 : 1)
    }
    resize()
    window.addEventListener('resize', resize)

    let px = 0, py = 0, scroll = 0
    const onMove = (e) => {
      px = (e.clientX / window.innerWidth - 0.5) * 2
      py = (e.clientY / window.innerHeight - 0.5) * 2
    }
    const onScroll = () => { scroll = window.scrollY }
    if (!reduce && window.matchMedia('(pointer: fine)').matches) window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })

    const clock = new THREE.Clock()
    let raf = 0
    const frame = () => {
      const t = clock.getElapsedTime()
      // Los anillos giran a distinto ritmo; cada 9 s convergen a la misma inclinación.
      const phase = (t % 9) / 9
      const align = Math.max(0, 1 - Math.abs(phase - 0.5) * 8) // 0..1, pico a mitad del ciclo
      buyer.rotation.set(Math.PI / 2 + Math.sin(t * 0.4) * 0.9 * (1 - align), t * 0.3, 0)
      seller.rotation.set(Math.PI / 2 - Math.sin(t * 0.4) * 0.9 * (1 - align), -t * 0.3, 0)
      core.rotation.y += 0.004
      core.rotation.x = Math.sin(t * 0.3) * 0.2
      core.scale.setScalar(1 + align * 0.12 + Math.sin(t * 1.2) * 0.02)
      coreMat.opacity = (0.45 + align * 0.45) * k()
      points.rotation.y += 0.0008
      camera.position.x += (px * 0.5 - camera.position.x) * 0.04
      camera.position.y += (-py * 0.35 - Math.min(scroll * 0.0012, 1.4) - camera.position.y) * 0.04
      camera.position.z = 8 + Math.min(scroll * 0.0015, 2.5)
      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)
      raf = requestAnimationFrame(frame)
    }
    const onVis = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden && !reduce) raf = requestAnimationFrame(frame)
    }
    if (reduce) renderer.render(scene, camera)
    else {
      raf = requestAnimationFrame(frame)
      document.addEventListener('visibilitychange', onVis)
    }

    return () => {
      cancelAnimationFrame(raf)
      obs.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVis)
      coreGeo.dispose(); coreMat.dispose(); ringGeo.dispose(); buyerMat.dispose(); sellerMat.dispose()
      ptsGeo.dispose(); ptsMat.dispose(); renderer.dispose()
    }
  }, [])

  return <canvas ref={ref} className="amb-canvas" />
}
