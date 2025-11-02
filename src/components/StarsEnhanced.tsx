import * as React from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

type Props = {
  count?: number
  radius?: number
  intensity?: number
  sizeMin?: number
  sizeMax?: number
  giantChance?: number
  fastRatio?: number
}

export default function StarsEnhanced({
  count = 12000,
  radius = 220,
  intensity = 1.1,
  sizeMin = 0.55,
  sizeMax = 6.8,
  giantChance = 0.045,
  fastRatio = 0.5
}: Props) {
  const uniforms = React.useMemo(() => ({
    uTime:  { value: 0 },
    uAlpha: { value: intensity }
  }), [intensity])

  const geo = React.useMemo(() => {
    const g = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const phases = new Float32Array(count)
    const colors = new Float32Array(count * 3)
    const speeds = new Float32Array(count)

    const randPow = (p: number) => Math.pow(Math.random(), p)

    for (let i = 0; i < count; i++) {
      const u = Math.random(), v = Math.random()
      const theta = 2 * Math.PI * u
      const phi = Math.acos(2 * v - 1)
      const r = radius * (0.85 + Math.random() * 0.2)
      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)
      positions[i*3+0] = x
      positions[i*3+1] = y
      positions[i*3+2] = z

      // sizes: many small, few large, rare giants
      let t = randPow(2.6)
      let s = THREE.MathUtils.lerp(sizeMin, sizeMax, t)
      if (Math.random() < giantChance) s += 2.0 * Math.random() + 1.0
      sizes[i] = s

      phases[i] = Math.random()

      const cool = new THREE.Color(0.78, 0.84, 1.0)
      const warm = new THREE.Color(1.0, 0.93, 0.82)
      const c = cool.clone().lerp(warm, Math.pow(Math.random(), 1.6))
      colors[i*3+0] = c.r
      colors[i*3+1] = c.g
      colors[i*3+2] = c.b

      // regions with ~2x twinkle speed
      const len = Math.sqrt(x*x + y*y + z*z) || 1.0
      const nx = x/len, ny = y/len, nz = z/len
      const gx = Math.floor((nx + 1.0) * 6.0)
      const gy = Math.floor((ny + 1.0) * 6.0)
      const gz = Math.floor((nz + 1.0) * 6.0)
      const regionSeed = gx + gy + gz
      let fast = (regionSeed % 2 === 0)
      if (Math.random() > fastRatio) fast = !fast
      speeds[i] = fast ? 2.0 : 1.0
    }

    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    g.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
    g.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
    g.setAttribute('aTwinkle', new THREE.BufferAttribute(speeds, 1))
    return g
  }, [count, radius, sizeMin, sizeMax, giantChance, fastRatio])

  useFrame((_, dt) => { uniforms.uTime.value += dt })

  const vertex = /* glsl */`
    uniform float uTime;
    attribute float aSize;
    attribute float aPhase;
    attribute float aTwinkle;
    attribute vec3  aColor;
    varying vec3 vColor;
    varying float vPhase;
    varying float vTw;
    varying float vDist;
    void main(){
      vColor = aColor;
      vPhase = aPhase;
      vTw    = aTwinkle;
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vDist = length(mv.xyz);
      // twinkle (faster in "fast" regions)
      float twinkle = 1.0 + 0.14 * sin(uTime * (1.6 * vTw + aPhase*2.2) + aPhase*6.28318);
      gl_PointSize = aSize * twinkle * 120.0 / vDist;
      gl_Position = projectionMatrix * mv;
    }
  `

  const fragment = /* glsl */`
    precision highp float;
    uniform float uTime;
    uniform float uAlpha;
    varying vec3  vColor;
    varying float vPhase;

    float circleMask(vec2 uv){
      float d = length(uv - 0.5) * 2.0;
      return smoothstep(1.0, 0.0, d);
    }
    float hash(float x){ return fract(sin(x) * 43758.5453123); }

    // Diamond-like glint (optional subtle)
    float diamond(vec2 uv){
      vec2 p = (uv - 0.5);
      float d1 = abs(p.x) + abs(p.y);
      float core = smoothstep(0.85, 0.0, d1 * 2.0);
      vec2 q = p * 2.0;
      float r = length(q) + 1e-5;
      float ang = atan(q.y, q.x);
      float spikes = pow(abs(sin(ang * 2.0)), 12.0) * smoothstep(0.8, 0.0, r);
      return clamp(core + spikes*0.8, 0.0, 1.0);
    }

    void main(){
      // Timing per star:
      // Fade-out: 1.5s — Off: 1.5s — Fade-in: 0.2s — On: random (3..8s) to keep chaos
      float r1 = hash(vPhase * 123.45);
      float r2 = hash(vPhase * 987.65);
      float onDur = mix(3.0, 8.0, r1);
      float fadeOutDur = 1.5;
      float offDur = 1.5;
      float fadeInDur = 0.2;
      float total = fadeOutDur + offDur + fadeInDur + onDur;

      // random start offset per star
      float startOffset = r2 * total;
      float t = mod(uTime + startOffset, total);

      float gate = 1.0;
      if (t < fadeOutDur) {
        // 1.5s slow fade to black
        gate = 1.0 - smoothstep(0.0, fadeOutDur, t);
      } else if (t < fadeOutDur + offDur) {
        // 1.5s fully off
        gate = 0.0;
      } else if (t < fadeOutDur + offDur + fadeInDur) {
        // quick appear
        gate = smoothstep(0.0, fadeInDur, t - (fadeOutDur + offDur));
      } else {
        gate = 1.0;
      }

      vec2 uv = gl_PointCoord;
      float mask = circleMask(uv);
      float core = pow(mask, 2.0);
      float halo = pow(mask, 1.25) * 0.55;

      vec3 col = mix(vColor, vec3(1.0), 0.10) * (0.7 + 0.3 * core);
      float alpha = (core + halo) * gate * uAlpha;

      // Diamond glint is strongest during fade-out & just before off
      float fadePhase = smoothstep(1.0, 0.0, clamp(t / max(fadeOutDur, 0.0001), 0.0, 1.0));
      float glintWin = fadePhase * (t < fadeOutDur ? 1.0 : 0.0);
      float glint = diamond(uv) * glintWin;
      glint *= 0.8 + 0.2 * sin(uTime * 6.0 + vPhase * 31.4);
      col += glint * 0.55;
      alpha += glint * 0.35;

      if (alpha < 0.01) discard;
      gl_FragColor = vec4(col, alpha);
    }
  `

  return (
    <points>
      {/* @ts-ignore */}
      <shaderMaterial args={[{ uniforms, vertexShader: vertex, fragmentShader: fragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }]} />
      {/* @ts-ignore */}
      <primitive attach="geometry" object={geo} />
    </points>
  )
}
