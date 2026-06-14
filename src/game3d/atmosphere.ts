/**
 * atmosphere — drifting dust motes for cinematic air.
 *
 * Real interiors are never optically empty: fine dust hangs in the air and
 * lights up where a shaft catches it. The walkthrough scenes already cast
 * volumetric shafts (the surgical-light cone, the ward morning sunbeams, the
 * resus god-rays) but the air between them reads as dead vacuum. A sparse,
 * slow-drifting `Points` cloud of soft additive motes restores that sense of
 * a *room full of air* — and under the PostFX bloom the motes that sit in a
 * bright shaft twinkle, selling the beam as a real light path.
 *
 * Deliberately subtle: ~260 motes over the whole stage volume, low opacity,
 * tiny, additive — atmosphere, not snow. One global instance lives on the
 * Stage3D scene (dust is universal), so it costs a single draw call and is
 * scene-agnostic. Node-safe to construct (DataTexture sprite + BufferGeometry,
 * no WebGL context needed until render) so it unit-tests headless.
 */
import * as THREE from 'three';

/** Soft radial alpha sprite (white core → transparent edge) as a DataTexture,
 *  so construction needs no canvas/WebGL and stays headless-testable. */
function moteSprite(size = 32): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4);
  const c = (size - 1) / 2;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      const d = Math.hypot(x - c, y - c) / c; // 0 centre → 1 edge
      const a = Math.max(0, 1 - d);
      const alpha = Math.round(255 * a * a); // soft quadratic falloff
      data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; data[i + 3] = alpha;
    }
  }
  const tex = new THREE.DataTexture(data, size, size);
  tex.needsUpdate = true;
  return tex;
}

interface DustOptions {
  count?: number;
  /** [min,max] world bounds of the drifting volume. */
  x?: [number, number];
  y?: [number, number];
  z?: [number, number];
  size?: number;
  opacity?: number;
  color?: THREE.ColorRepresentation;
}

export class DustMotes {
  readonly points: THREE.Points;
  private velocities: Float32Array;
  private count: number;
  private bx: [number, number];
  private by: [number, number];
  private bz: [number, number];
  private sprite: THREE.DataTexture;

  constructor(opts: DustOptions = {}) {
    this.count = opts.count ?? 420;
    this.bx = opts.x ?? [-9, 9];
    this.by = opts.y ?? [0.1, 3.6]; // sit in the mid-tone band, not the bright ceiling
    this.bz = opts.z ?? [-14, 2];

    const positions = new Float32Array(this.count * 3);
    this.velocities = new Float32Array(this.count * 3);
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    for (let i = 0; i < this.count; i += 1) {
      positions[i * 3] = rand(this.bx[0], this.bx[1]);
      positions[i * 3 + 1] = rand(this.by[0], this.by[1]);
      positions[i * 3 + 2] = rand(this.bz[0], this.bz[1]);
      // slow updraft (dust rides convection) + a faint lateral wander
      this.velocities[i * 3] = rand(-0.03, 0.03);
      this.velocities[i * 3 + 1] = rand(0.012, 0.055);
      this.velocities[i * 3 + 2] = rand(-0.02, 0.02);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.sprite = moteSprite();
    const material = new THREE.PointsMaterial({
      size: opts.size ?? 0.06,
      map: this.sprite,
      color: new THREE.Color(opts.color ?? '#fff4e0'),
      transparent: true,
      opacity: opts.opacity ?? 0.62,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    this.points = new THREE.Points(geometry, material);
    this.points.frustumCulled = false; // the cloud spans the whole stage
    this.points.renderOrder = 2;
  }

  /** Tint the motes to the colour of the light lighting them — warm air in the
   *  kopitiam, cool in the clinical suites. Lerped toward white by `mix` so the
   *  motes stay bright (a fully-saturated tint would dim them). Called on each
   *  scene swap with that scene's key-light colour. */
  setTint(color: THREE.ColorRepresentation, mix = 0.4) {
    const m = this.points.material as THREE.PointsMaterial;
    m.color.set(color).lerp(new THREE.Color(0xffffff), mix);
  }

  /** Drift the motes; wrap any that leave the volume back in at the bottom. */
  update(dt: number) {
    const attr = this.points.geometry.getAttribute('position') as THREE.BufferAttribute;
    const p = attr.array as Float32Array;
    const wrap = (v: number, a: number, b: number) => (v > b ? a : v < a ? b : v);
    for (let i = 0; i < this.count; i += 1) {
      const j = i * 3;
      p[j] += this.velocities[j] * dt;
      p[j + 1] += this.velocities[j + 1] * dt;
      p[j + 2] += this.velocities[j + 2] * dt;
      // a mote that floats out the top re-enters at the floor at a fresh x/z
      if (p[j + 1] > this.by[1]) {
        p[j + 1] = this.by[0];
        p[j] = this.bx[0] + Math.random() * (this.bx[1] - this.bx[0]);
        p[j + 2] = this.bz[0] + Math.random() * (this.bz[1] - this.bz[0]);
      } else {
        p[j] = wrap(p[j], this.bx[0], this.bx[1]);
        p[j + 2] = wrap(p[j + 2], this.bz[0], this.bz[1]);
      }
    }
    attr.needsUpdate = true;
  }

  dispose() {
    this.points.geometry.dispose();
    (this.points.material as THREE.Material).dispose();
    this.sprite.dispose();
  }
}
