/**
 * 3D environments — one procedural set per walkthrough scene id.
 *
 * Mirrors `scenery.tsx`'s 12 hand-built SVG environments in true 3D: each
 * builder returns a Group of primitive-based set dressing plus a lighting
 * preset matching the v9.14.1 per-scene cinematographic moods (warm kopitiam,
 * sterile resus, surgical cathlab, transit MRT, …). Everything is procedural
 * geometry — no model files — so the chunk stays code-only and the builders
 * construct headlessly in node for unit tests.
 *
 * Environments may carry `userData.animate(t)` for ambient motion (kopitiam
 * ceiling fans, ambulance beacon, MRT tunnel light-streaks).
 */
import * as THREE from 'three';
import type { SceneId } from '../lib/scenery';

export interface LightingPreset {
  /** Hemisphere sky/ground colours + intensity. */
  hemi: { sky: string; ground: string; intensity: number };
  /** Key directional light. */
  key: { color: string; intensity: number; pos: [number, number, number] };
  /** Scene fog colour + density (exp2). */
  fog: { color: string; density: number };
  /** Renderer clear colour (visible above the back wall). */
  clear: string;
}

export interface Environment3D {
  group: THREE.Group;
  lighting: LightingPreset;
}

/* ── shared kit ───────────────────────────────────────────────────────── */

function std(color: string, roughness = 0.85, metalness = 0.02): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function emissive(color: string, intensity = 1.2): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color, emissive: color, emissiveIntensity: intensity, roughness: 0.4,
  });
}

function box(
  w: number, h: number, d: number, material: THREE.Material,
  x = 0, y = 0, z = 0, castShadow = true,
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z);
  m.castShadow = castShadow;
  m.receiveShadow = true;
  return m;
}

function cylinder(
  rTop: number, rBot: number, h: number, material: THREE.Material,
  x = 0, y = 0, z = 0, segments = 12,
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, segments), material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** Floor slab + optional accent strips (tile joints / lane markings). */
function floor(group: THREE.Group, color: string, stripColor?: string) {
  const slab = new THREE.Mesh(new THREE.PlaneGeometry(40, 30), std(color, 0.9));
  slab.rotation.x = -Math.PI / 2;
  slab.position.set(0, 0, -7);
  slab.receiveShadow = true;
  group.add(slab);
  if (stripColor) {
    for (let z = 0; z >= -14; z -= 3.5) {
      const strip = new THREE.Mesh(new THREE.PlaneGeometry(40, 0.06), std(stripColor, 0.85));
      strip.rotation.x = -Math.PI / 2;
      strip.position.set(0, 0.005, z);
      group.add(strip);
    }
  }
}

/** Back + side walls boxing the set. */
function walls(group: THREE.Group, color: string, backZ = -16) {
  const m = std(color, 0.95);
  const back = box(40, 8, 0.3, m, 0, 4, backZ, false);
  const left = box(0.3, 8, 30, m, -16, 4, -7, false);
  const right = box(0.3, 8, 30, m, 16, 4, -7, false);
  group.add(back, left, right);
}

/** A fluorescent ceiling bar with a soft glow plane. */
function ceilingBar(group: THREE.Group, x: number, z: number, color = '#eef6ff') {
  group.add(box(3.2, 0.08, 0.35, emissive(color, 1.6), x, 5.6, z, false));
}

/** Hospital trolley / bed: frame, mattress, pillow, side rails. */
function trolley(group: THREE.Group, x: number, z: number, ry = 0, mattressColor = '#dbeafe') {
  const g = new THREE.Group();
  g.add(box(2.0, 0.12, 0.85, std('#94a3b8', 0.5, 0.6), 0, 0.62, 0));
  g.add(box(1.95, 0.18, 0.8, std(mattressColor, 0.95), 0, 0.78, 0));
  g.add(box(0.42, 0.10, 0.55, std('#f8fafc', 0.95), -0.68, 0.90, 0));
  for (const [lx, lz] of [[-0.85, -0.3], [-0.85, 0.3], [0.85, -0.3], [0.85, 0.3]] as const) {
    g.add(cylinder(0.035, 0.035, 0.6, std('#64748b', 0.4, 0.7), lx, 0.31, lz, 8));
  }
  for (const side of [-1, 1] as const) {
    g.add(box(1.6, 0.05, 0.05, std('#94a3b8', 0.4, 0.7), 0, 1.02, 0.41 * side));
  }
  g.position.set(x, 0, z);
  g.rotation.y = ry;
  group.add(g);
}

/** Vitals monitor on a rolling stand, screen facing the camera. */
function monitor(group: THREE.Group, x: number, z: number) {
  const g = new THREE.Group();
  g.add(cylinder(0.04, 0.18, 1.25, std('#64748b', 0.4, 0.7), 0, 0.63, 0, 10));
  g.add(box(0.55, 0.42, 0.10, std('#1e293b', 0.6), 0, 1.45, 0));
  g.add(box(0.46, 0.33, 0.012, emissive('#10331f', 0.9), 0, 1.45, 0.055, false));
  g.add(box(0.36, 0.025, 0.014, emissive('#34d399', 1.8), 0, 1.50, 0.058, false));
  g.add(box(0.36, 0.02, 0.014, emissive('#fbbf24', 1.5), 0, 1.42, 0.058, false));
  g.position.set(x, 0, z);
  group.add(g);
}

function ivPole(group: THREE.Group, x: number, z: number) {
  const g = new THREE.Group();
  g.add(cylinder(0.025, 0.025, 1.9, std('#94a3b8', 0.35, 0.8), 0, 0.95, 0, 8));
  g.add(box(0.16, 0.26, 0.05, std('#e0f2fe', 0.4), 0.12, 1.78, 0));
  g.position.set(x, 0, z);
  group.add(g);
}

/** Round kopitiam marble table + red stools. */
function kopiTable(group: THREE.Group, x: number, z: number, stools = 3) {
  const g = new THREE.Group();
  g.add(cylinder(0.55, 0.55, 0.05, std('#e7e5e4', 0.6), 0, 0.74, 0, 18));
  g.add(cylinder(0.06, 0.10, 0.72, std('#57534e', 0.7), 0, 0.37, 0, 10));
  for (let i = 0; i < stools; i += 1) {
    const a = (i / stools) * Math.PI * 2 + 0.5;
    g.add(cylinder(0.19, 0.19, 0.05, std('#b91c1c', 0.7), Math.cos(a) * 0.95, 0.45, Math.sin(a) * 0.95, 12));
    g.add(cylinder(0.045, 0.06, 0.43, std('#44403c', 0.7), Math.cos(a) * 0.95, 0.22, Math.sin(a) * 0.95, 8));
  }
  // kopi cups
  g.add(cylinder(0.05, 0.04, 0.07, std('#f0fdf4', 0.5), 0.2, 0.80, 0.1, 8));
  g.add(cylinder(0.05, 0.04, 0.07, std('#fff7ed', 0.5), -0.18, 0.80, -0.12, 8));
  g.position.set(x, 0, z);
  group.add(g);
}

/** Hawker stall: counter + signboard + warm interior glow. */
function stall(group: THREE.Group, x: number, z: number, signColor: string, awning: string) {
  const g = new THREE.Group();
  g.add(box(3.4, 1.05, 1.2, std('#7f8ea3', 0.8), 0, 0.53, 0));
  g.add(box(3.4, 0.08, 1.3, std('#cbd5e1', 0.5), 0, 1.10, 0));
  g.add(box(3.0, 1.6, 0.1, std('#334155', 0.9), 0, 2.2, -0.5));
  g.add(box(3.2, 0.55, 0.12, emissive(signColor, 1.1), 0, 3.15, -0.45, false));
  g.add(box(3.5, 0.35, 1.5, std(awning, 0.85), 0, 2.85, 0.1));
  // interior warm glow
  const lamp = new THREE.PointLight('#ffb454', 12, 6, 2);
  lamp.position.set(0, 1.9, 0);
  g.add(lamp);
  g.position.set(x, 0, z);
  group.add(g);
}

function ceilingFan(group: THREE.Group, x: number, z: number): THREE.Group {
  const fan = new THREE.Group();
  fan.add(cylinder(0.03, 0.03, 0.5, std('#404040', 0.6), 0, -0.25, 0, 8));
  const blades = new THREE.Group();
  for (let i = 0; i < 3; i += 1) {
    const blade = box(1.5, 0.03, 0.18, std('#5c5247', 0.7), 0.75, 0, 0);
    const arm = new THREE.Group();
    arm.rotation.y = (i / 3) * Math.PI * 2;
    arm.add(blade);
    blades.add(arm);
  }
  blades.position.y = -0.5;
  blades.name = 'fan-blades';
  fan.add(blades);
  fan.position.set(x, 5.6, z);
  group.add(fan);
  return blades;
}

/* ── per-scene builders ───────────────────────────────────────────────── */

function buildKopitiam(): Environment3D {
  const g = new THREE.Group();
  floor(g, '#8a7b66', '#6e6253'); // worn terrazzo
  walls(g, '#9a8f7d');
  stall(g, -8, -13.5, '#fbbf24', '#15803d');  // drinks
  stall(g, 0, -13.8, '#f87171', '#b91c1c');   // chicken rice
  stall(g, 8, -13.5, '#a5f3fc', '#0e7490');   // noodles
  kopiTable(g, -7, -7); kopiTable(g, -2.5, -8.5); kopiTable(g, 3, -7.5);
  kopiTable(g, 8, -8); kopiTable(g, -9.5, -3.5); kopiTable(g, 9.5, -4);
  // shophouse pillars
  for (const x of [-12, 12]) g.add(cylinder(0.35, 0.4, 5.6, std('#d6cdbd', 0.9), x, 2.8, -2, 12));
  const fans = [ceilingFan(g, -6, -8), ceilingFan(g, 6, -8)];
  ceilingBar(g, -6, -11, '#fff7e0'); ceilingBar(g, 6, -11, '#fff7e0');
  g.userData.animate = (t: number) => { for (const f of fans) f.rotation.y = t * 6; };
  return {
    group: g,
    lighting: {
      hemi: { sky: '#ffe9c4', ground: '#5e503f', intensity: 0.85 },
      key: { color: '#ffd9a0', intensity: 1.6, pos: [6, 9, 6] },
      fog: { color: '#8a7457', density: 0.016 },
      clear: '#3d3326',
    },
  };
}

function buildStreet(): Environment3D {
  const g = new THREE.Group();
  floor(g, '#3f4650', '#c8cdd4'); // asphalt + lane markings
  // HDB block facade with lit windows
  const facade = box(34, 14, 0.5, std('#aab4be', 0.95), 0, 7, -16.5, false);
  g.add(facade);
  for (let fx = -14; fx <= 14; fx += 2.6) {
    for (let fy = 2.5; fy <= 12; fy += 2.2) {
      if ((fx * 7 + fy * 13) % 3 < 2) g.add(box(1.1, 0.9, 0.1, emissive('#ffe9b0', 0.7), fx, fy, -16.2, false));
    }
  }
  // SCDF ambulance — white box van, red stripe, beacon
  const amb = new THREE.Group();
  amb.add(box(4.6, 2.0, 2.0, std('#f8fafc', 0.6), 0, 1.35, 0));
  amb.add(box(1.4, 1.5, 1.9, std('#e2e8f0', 0.6), -2.9, 1.05, 0));
  amb.add(box(4.6, 0.28, 2.02, std('#dc2626', 0.6), 0, 1.1, 0));
  for (const [wx, wz] of [[-2.9, 0.95], [-2.9, -0.95], [1.4, 0.95], [1.4, -0.95]] as const) {
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.13, 8, 16), std('#1c1c1e', 0.8));
    wheel.position.set(wx, 0.42, wz);
    wheel.castShadow = true;
    amb.add(wheel);
  }
  const beacon = box(0.5, 0.18, 0.5, emissive('#ef4444', 2.5), -0.4, 2.5, 0, false);
  amb.add(beacon);
  const beaconLight = new THREE.PointLight('#ef4444', 0, 14, 1.8);
  beaconLight.position.set(-0.4, 2.8, 0);
  amb.add(beaconLight);
  amb.position.set(6.5, 0, -10.5);
  amb.rotation.y = -0.25;
  g.add(amb);
  // street lamp
  g.add(cylinder(0.07, 0.09, 6.5, std('#52525b', 0.6), -10, 3.25, -12, 8));
  g.add(box(1.2, 0.12, 0.4, emissive('#ffedb8', 1.8), -9.5, 6.45, -12, false));
  trolley(g, -3, -6, 0.1);
  g.userData.animate = (t: number) => {
    const on = Math.sin(t * 7) > 0;
    (beacon.material as THREE.MeshStandardMaterial).emissiveIntensity = on ? 3.2 : 0.4;
    beaconLight.intensity = on ? 26 : 0;
  };
  return {
    group: g,
    lighting: {
      hemi: { sky: '#aebdd4', ground: '#2c3240', intensity: 0.7 },
      key: { color: '#cfe0f4', intensity: 1.1, pos: [-6, 10, 7] },
      fog: { color: '#39404e', density: 0.015 },
      clear: '#202633',
    },
  };
}

function buildMrt(): Environment3D {
  const g = new THREE.Group();
  floor(g, '#b9bec6'); // carriage flooring
  // yellow tactile strip near the doors
  const tactile = new THREE.Mesh(new THREE.PlaneGeometry(40, 0.5), std('#eab308', 0.8));
  tactile.rotation.x = -Math.PI / 2;
  tactile.position.set(0, 0.006, -10.6);
  g.add(tactile);
  walls(g, '#d7dade', -13);
  // curved ceiling hint
  g.add(box(40, 0.3, 12, std('#e4e7ea', 0.9), 0, 6.1, -7, false));
  ceilingBar(g, -8, -7); ceilingBar(g, 0, -7); ceilingBar(g, 8, -7);
  // window band with dark tunnel + streak lights
  const streaks: THREE.Mesh[] = [];
  for (const wx of [-11, -3.5, 4, 11.5]) {
    g.add(box(5.6, 1.5, 0.1, std('#0c1118', 0.3), wx, 3.4, -12.8, false));
    const s = box(1.6, 0.06, 0.05, emissive('#7dd3fc', 1.6), wx - 1, 3.5, -12.7, false);
    streaks.push(s);
    g.add(s);
  }
  // longitudinal bench seats against the back wall (red/blue)
  for (const [bx, color] of [[-9, '#b91c1c'], [-3, '#1d4ed8'], [3, '#1d4ed8'], [9, '#b91c1c']] as const) {
    g.add(box(5.2, 0.14, 0.85, std(color, 0.75), bx, 0.48, -11.9));
    g.add(box(5.2, 0.9, 0.14, std(color, 0.75), bx, 1.0, -12.3));
  }
  // foreground priority bench (the v9.15 hero seat)
  const pri = new THREE.Group();
  pri.add(box(2.6, 0.16, 0.9, std('#7c3aed', 0.7), 0, 0.48, 0));
  pri.add(box(2.6, 0.85, 0.14, std('#7c3aed', 0.75), 0, 0.95, -0.42));
  pri.add(box(0.10, 0.6, 0.9, std('#cbd5e1', 0.3, 0.6), 1.36, 0.75, 0));
  pri.add(box(0.10, 0.6, 0.9, std('#cbd5e1', 0.3, 0.6), -1.36, 0.75, 0));
  pri.position.set(1.0, 0, -2.6);
  g.add(pri);
  // grab poles + sliding doors with SOS plunger
  for (const px of [-6, 0, 6]) g.add(cylinder(0.035, 0.035, 5.4, std('#c0c7cf', 0.25, 0.9), px, 2.7, -6, 10));
  g.add(box(3.0, 4.6, 0.18, std('#9aa3ad', 0.4, 0.6), -13.5, 2.3, -12.6, false));
  g.add(box(0.22, 0.22, 0.1, emissive('#ef4444', 1.6), -12.0, 1.5, -12.5, false));
  // route LED
  g.add(box(5.5, 0.5, 0.1, emissive('#16a34a', 1.0), 0, 5.2, -12.7, false));
  g.userData.animate = (t: number) => {
    for (let i = 0; i < streaks.length; i += 1) {
      const s = streaks[i];
      s.position.x = ((t * 9 + i * 4.7) % 26) - 13;
    }
  };
  return {
    group: g,
    lighting: {
      hemi: { sky: '#e8f0fa', ground: '#7c8694', intensity: 1.0 },
      key: { color: '#f2f7ff', intensity: 1.2, pos: [0, 8, 8] },
      fog: { color: '#9aa3ad', density: 0.012 },
      clear: '#11151c',
    },
  };
}

function buildResus(): Environment3D {
  const g = new THREE.Group();
  floor(g, '#cfd8da', '#9fb3b6');
  walls(g, '#dfe8e6');
  trolley(g, 0, -7.5);
  monitor(g, -2.6, -9); ivPole(g, 2.4, -8.8);
  // overhead exam light
  g.add(cylinder(0.5, 0.65, 0.22, emissive('#fdfdf2', 2.0), 0, 4.6, -7.5, 16));
  g.add(cylinder(0.04, 0.04, 1.2, std('#94a3b8', 0.4, 0.7), 0, 5.4, -7.5, 8));
  // supply cabinets + crash cart
  g.add(box(4.5, 2.2, 0.7, std('#b6c9cd', 0.7), -9, 1.1, -14.5));
  g.add(box(4.5, 2.2, 0.7, std('#b6c9cd', 0.7), 9, 1.1, -14.5));
  g.add(box(0.9, 1.1, 0.6, std('#dc2626', 0.6), 5.5, 0.55, -10));
  // curtain rail + curtain
  g.add(cylinder(0.025, 0.025, 9, std('#94a3b8', 0.5), -7, 4.2, -10, 8).rotateZ(Math.PI / 2));
  g.add(box(0.06, 2.6, 5.5, std('#7dd3c0', 0.95), -7, 2.85, -10, false));
  ceilingBar(g, -5, -8); ceilingBar(g, 5, -8); ceilingBar(g, 0, -12);
  return {
    group: g,
    lighting: {
      hemi: { sky: '#f0fbf7', ground: '#8fa6a2', intensity: 1.05 },
      key: { color: '#eafff5', intensity: 1.35, pos: [3, 9, 6] },
      fog: { color: '#aebfbd', density: 0.011 },
      clear: '#d7e4e1',
    },
  };
}

function buildCathlab(): Environment3D {
  const g = new THREE.Group();
  floor(g, '#3c4654', '#2f3845');
  walls(g, '#46505e');
  // cath table
  g.add(box(2.6, 0.14, 0.8, std('#1f2937', 0.5), 0, 0.95, -7.5));
  g.add(box(0.5, 0.85, 0.5, std('#475569', 0.5, 0.5), 0, 0.45, -7.5));
  // C-arm: a big arc over the table
  const cArm = new THREE.Mesh(
    new THREE.TorusGeometry(1.45, 0.16, 10, 24, Math.PI),
    std('#e2e8f0', 0.45, 0.4),
  );
  cArm.position.set(0.8, 1.1, -7.5);
  cArm.rotation.z = Math.PI;
  cArm.castShadow = true;
  g.add(cArm);
  g.add(box(0.55, 0.4, 0.55, std('#cbd5e1', 0.4), 0.8, 2.65, -7.5));   // detector
  g.add(box(0.55, 0.4, 0.55, std('#cbd5e1', 0.4), 0.8, -0.2 + 0.65, -7.5)); // tube
  // ceiling monitor boom (bank of 4 screens)
  const boom = new THREE.Group();
  for (let i = 0; i < 4; i += 1) {
    boom.add(box(0.85, 0.55, 0.06, emissive('#1c2f4a', 1.2), -1.35 + i * 0.9, 0, 0, false));
  }
  boom.add(cylinder(0.05, 0.05, 2.0, std('#94a3b8', 0.4, 0.7), 0, 1.4, 0, 8));
  boom.position.set(-2.2, 2.3, -8.6);
  g.add(boom);
  // lead-glass control room
  g.add(box(6, 2.4, 0.18, std('#9fb8d9', 0.1, 0.1), -10, 1.6, -14.0, false));
  monitor(g, 4.5, -9.5);
  ceilingBar(g, 0, -10, '#dbeafe');
  return {
    group: g,
    lighting: {
      hemi: { sky: '#9fb4d4', ground: '#252d3a', intensity: 0.55 },
      key: { color: '#cfe2ff', intensity: 1.0, pos: [-4, 8, 5] },
      fog: { color: '#2c3442', density: 0.016 },
      clear: '#1d2430',
    },
  };
}

function buildImaging(): Environment3D {
  const g = new THREE.Group();
  floor(g, '#cdd6e0', '#aebbcb');
  walls(g, '#dde5ee');
  // scanner gantry: big ring + bore
  const gantry = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.55, 14, 28), std('#f1f5f9', 0.55));
  ring.castShadow = true;
  gantry.add(ring);
  const bore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 0.95, 1.5, 24, 1, true),
    new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.8, side: THREE.BackSide }),
  );
  bore.rotation.x = Math.PI / 2;
  gantry.add(bore);
  gantry.add(box(3.4, 0.5, 1.4, std('#e2e8f0', 0.6), 0, -1.75, 0));
  gantry.position.set(0, 2.0, -11);
  g.add(gantry);
  // sliding patient table into the bore
  g.add(box(0.75, 0.10, 3.6, std('#dbeafe', 0.8), 0, 1.05, -8.2));
  g.add(box(0.5, 0.95, 1.2, std('#cbd5e1', 0.6), 0, 0.5, -7.2));
  // control window
  g.add(box(5.5, 2.2, 0.16, std('#aac4e2', 0.1, 0.1), 9.5, 1.7, -14.2, false));
  monitor(g, -5.5, -9);
  ceilingBar(g, 0, -8, '#e8f1ff'); ceilingBar(g, -6, -11, '#e8f1ff');
  return {
    group: g,
    lighting: {
      hemi: { sky: '#dbe7f6', ground: '#69788c', intensity: 0.9 },
      key: { color: '#e8f1ff', intensity: 1.15, pos: [5, 9, 6] },
      fog: { color: '#7e8ca0', density: 0.012 },
      clear: '#c2cedd',
    },
  };
}

function buildCounsel(): Environment3D {
  const g = new THREE.Group();
  floor(g, '#8f7f6a');
  walls(g, '#b9a98f');
  // meeting table + chairs
  g.add(box(2.8, 0.08, 1.3, std('#7c5e3f', 0.55), 0, 0.74, -7.5));
  g.add(box(0.18, 0.72, 0.18, std('#5b4631', 0.7), -1.2, 0.37, -7.5));
  g.add(box(0.18, 0.72, 0.18, std('#5b4631', 0.7), 1.2, 0.37, -7.5));
  for (const [cx, cz] of [[-1.0, -6.3], [0.4, -6.2], [-0.3, -8.8], [1.1, -8.7]] as const) {
    g.add(box(0.5, 0.06, 0.5, std('#475569', 0.8), cx, 0.46, cz));
    g.add(box(0.5, 0.6, 0.08, std('#475569', 0.8), cx, 0.78, cz - 0.22));
    g.add(box(0.06, 0.44, 0.06, std('#334155', 0.7), cx, 0.22, cz));
  }
  // potted plant + warm floor lamp + window with city dusk
  g.add(cylinder(0.22, 0.18, 0.35, std('#9a3412', 0.85), 5.5, 0.18, -10));
  g.add(new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), std('#3f6212', 0.95))
    .translateX(5.5).translateY(1.0).translateZ(-10));
  g.add(cylinder(0.03, 0.05, 1.6, std('#525252', 0.6), -5.5, 0.8, -11, 8));
  g.add(new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), emissive('#ffd9a0', 1.6))
    .translateX(-5.5).translateY(1.75).translateZ(-11));
  g.add(box(5, 2.2, 0.15, emissive('#2c3e5c', 0.5), 0, 3.2, -15.6, false));
  const warm = new THREE.PointLight('#ffc985', 18, 12, 2);
  warm.position.set(-5.5, 1.8, -11);
  g.add(warm);
  return {
    group: g,
    lighting: {
      hemi: { sky: '#f5e1bd', ground: '#594b39', intensity: 0.7 },
      key: { color: '#ffd9a8', intensity: 1.0, pos: [4, 7, 6] },
      fog: { color: '#6e5d49', density: 0.014 },
      clear: '#473b2d',
    },
  };
}

function buildWard(): Environment3D {
  const g = new THREE.Group();
  floor(g, '#d8dcd3', '#b3bcab');
  walls(g, '#e7ebe0');
  trolley(g, -4.5, -9, 0, '#fefce8');
  trolley(g, 4.5, -9, 0, '#fefce8');
  // bedside lockers + visitor chairs
  g.add(box(0.6, 0.8, 0.55, std('#b9aa90', 0.7), -2.6, 0.4, -9.5));
  g.add(box(0.6, 0.8, 0.55, std('#b9aa90', 0.7), 6.4, 0.4, -9.5));
  for (const cx of [-6.6, 2.5]) {
    g.add(box(0.5, 0.06, 0.5, std('#0e7490', 0.85), cx, 0.46, -8.2));
    g.add(box(0.5, 0.55, 0.07, std('#0e7490', 0.85), cx, 0.76, -8.45));
  }
  ivPole(g, -5.9, -9.6);
  // privacy curtains between beds
  g.add(box(0.06, 2.4, 4.2, std('#a7d6c9', 0.95), 0, 2.4, -9.5, false));
  // daylight window
  g.add(box(7, 2.4, 0.15, emissive('#dff1ff', 0.85), 0, 3.4, -15.6, false));
  ceilingBar(g, -4, -8); ceilingBar(g, 4, -8);
  return {
    group: g,
    lighting: {
      hemi: { sky: '#eef7f0', ground: '#90998c', intensity: 1.0 },
      key: { color: '#fdfdf2', intensity: 1.25, pos: [6, 9, 7] },
      fog: { color: '#aab3a4', density: 0.011 },
      clear: '#ccd4c6',
    },
  };
}

function buildPharmacy(): Environment3D {
  const g = new THREE.Group();
  floor(g, '#d6d3cd', '#b8b4ab');
  walls(g, '#e4e1da');
  // dispensing counter
  g.add(box(9, 1.05, 1.0, std('#0e7490', 0.75), 0, 0.53, -9.5));
  g.add(box(9, 0.08, 1.15, std('#e2e8f0', 0.5), 0, 1.10, -9.5));
  // shelving with rows of medicine boxes
  for (const sx of [-6.5, 0, 6.5]) {
    g.add(box(5.4, 2.6, 0.5, std('#c8c4ba', 0.85), sx, 1.5, -14.6));
    const palette = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#f97316', '#8b5cf6'];
    for (let row = 0; row < 3; row += 1) {
      for (let i = 0; i < 7; i += 1) {
        const colorIdx = (row * 7 + i + Math.abs(Math.round(sx))) % palette.length;
        g.add(box(0.5, 0.4, 0.3, std(palette[colorIdx], 0.8),
          sx - 2.3 + i * 0.74, 0.85 + row * 0.78, -14.3, false));
      }
    }
  }
  // queue number display
  g.add(box(1.8, 0.7, 0.12, emissive('#dc2626', 1.4), 0, 3.3, -12, false));
  ceilingBar(g, -4, -8); ceilingBar(g, 4, -8);
  return {
    group: g,
    lighting: {
      hemi: { sky: '#f4f1ea', ground: '#8c887e', intensity: 1.0 },
      key: { color: '#fdfbf2', intensity: 1.2, pos: [-4, 9, 6] },
      fog: { color: '#a8a499', density: 0.011 },
      clear: '#c9c5bb',
    },
  };
}

function buildRehab(): Environment3D {
  const g = new THREE.Group();
  floor(g, '#cab98f'); // sprung wood
  walls(g, '#ddd2b8');
  // parallel bars
  for (const side of [-1, 1] as const) {
    g.add(cylinder(0.03, 0.03, 4.0, std('#d4d4d8', 0.3, 0.8), -5 + 0.45 * side, 0.95, -8, 8).rotateX(Math.PI / 2));
    for (const pz of [-9.8, -6.2]) {
      g.add(cylinder(0.035, 0.035, 0.95, std('#a1a1aa', 0.4, 0.7), -5 + 0.45 * side, 0.48, pz, 8));
    }
  }
  // treadmill
  const tm = new THREE.Group();
  tm.add(box(0.85, 0.18, 2.2, std('#27272a', 0.7), 0, 0.18, 0));
  tm.add(box(0.8, 0.04, 1.9, std('#3f3f46', 0.9), 0, 0.29, 0.05));
  tm.add(box(0.08, 1.25, 0.08, std('#52525b', 0.6), -0.36, 0.85, -0.95));
  tm.add(box(0.08, 1.25, 0.08, std('#52525b', 0.6), 0.36, 0.85, -0.95));
  tm.add(box(0.8, 0.35, 0.1, emissive('#0f2b3f', 1.1), 0, 1.5, -0.95, false));
  tm.position.set(3.5, 0, -8);
  g.add(tm);
  // exercise mats + gym ball
  g.add(box(2.0, 0.06, 1.2, std('#2563eb', 0.95), -1, 0.03, -4.5, false));
  g.add(new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 10), std('#dc2626', 0.6))
    .translateX(7).translateY(0.45).translateZ(-5.5));
  // daylight wall of windows
  g.add(box(12, 2.6, 0.15, emissive('#e4f4ff', 1.0), 0, 3.4, -15.6, false));
  return {
    group: g,
    lighting: {
      hemi: { sky: '#fdf6e3', ground: '#7c6f57', intensity: 1.05 },
      key: { color: '#fff7e0', intensity: 1.5, pos: [8, 10, 8] },
      fog: { color: '#a39577', density: 0.010 },
      clear: '#cfc3a4',
    },
  };
}

function buildClinic(): Environment3D {
  const g = new THREE.Group();
  floor(g, '#d3d7dc', '#b4bac2');
  walls(g, '#e2e6ea');
  // consult desk + monitor + two chairs
  g.add(box(2.2, 0.07, 1.0, std('#9c8468', 0.6), -2.5, 0.76, -8.5));
  g.add(box(0.16, 0.74, 0.9, std('#7d6850', 0.7), -3.4, 0.38, -8.5));
  g.add(box(0.16, 0.74, 0.9, std('#7d6850', 0.7), -1.6, 0.38, -8.5));
  g.add(box(0.55, 0.4, 0.05, emissive('#1d3047', 1.2), -2.9, 1.25, -8.7, false));
  for (const [cx, cz] of [[-2.5, -7.0], [-1.3, -7.0]] as const) {
    g.add(box(0.5, 0.06, 0.5, std('#475569', 0.8), cx, 0.46, cz));
    g.add(box(0.5, 0.55, 0.07, std('#475569', 0.8), cx, 0.76, cz - 0.24));
  }
  // exam couch with paper roll
  g.add(box(1.9, 0.14, 0.7, std('#0e7490', 0.7), 4, 0.72, -9));
  g.add(box(1.85, 0.05, 0.62, std('#f8fafc', 0.9), 4, 0.82, -9, false));
  g.add(box(0.4, 0.7, 0.5, std('#94a3b8', 0.6), 4, 0.35, -9));
  // anatomy poster + sink
  g.add(box(1.2, 1.6, 0.05, std('#fca5a5', 0.9), 8, 2.4, -15.7, false));
  g.add(box(0.8, 0.5, 0.5, std('#e2e8f0', 0.4), -8, 0.95, -14.8));
  ceilingBar(g, 0, -9);
  return {
    group: g,
    lighting: {
      hemi: { sky: '#f2f6fa', ground: '#8b929b', intensity: 1.0 },
      key: { color: '#fbfdff', intensity: 1.2, pos: [4, 8, 7] },
      fog: { color: '#a5acb5', density: 0.011 },
      clear: '#c6ccd3',
    },
  };
}

function buildBackhouse(): Environment3D {
  const g = new THREE.Group();
  floor(g, '#7d8084', '#65686c'); // sealed concrete
  walls(g, '#8e9196');
  // industrial racking with crates
  for (const rx of [-8, 8]) {
    g.add(box(5.5, 3.2, 0.7, std('#5b6066', 0.8, 0.4), rx, 1.7, -14.2));
    for (let lvl = 0; lvl < 3; lvl += 1) {
      for (let i = 0; i < 4; i += 1) {
        g.add(box(0.9, 0.55, 0.6, std(['#9a6b3f', '#3f5c9a', '#6b7280'][(lvl + i) % 3], 0.85),
          rx - 1.9 + i * 1.25, 0.6 + lvl * 1.0, -14.0, false));
      }
    }
  }
  // laundry trolley + linen
  const cart = new THREE.Group();
  cart.add(box(1.4, 0.9, 0.9, std('#d9d2c5', 0.9), 0, 0.65, 0));
  cart.add(box(1.3, 0.25, 0.8, std('#f6f3ec', 0.95), 0, 1.18, 0, false));
  for (const [wx, wz] of [[-0.55, 0.35], [0.55, 0.35], [-0.55, -0.35], [0.55, -0.35]] as const) {
    cart.add(cylinder(0.09, 0.09, 0.1, std('#27272a', 0.6), wx, 0.12, wz, 8).rotateX(Math.PI / 2));
  }
  cart.position.set(-3, 0, -7.5);
  g.add(cart);
  // kitchen line: stainless counter + stock pot + steam glow
  g.add(box(5.5, 0.95, 1.0, std('#b7bec6', 0.25, 0.85), 5, 0.48, -10.5));
  g.add(cylinder(0.42, 0.42, 0.5, std('#9aa2ab', 0.3, 0.9), 4, 1.2, -10.5, 16));
  const steam = new THREE.PointLight('#ffe9c4', 8, 6, 2);
  steam.position.set(4, 2.2, -10.2);
  g.add(steam);
  // pipe runs + caged ceiling lamps
  g.add(cylinder(0.09, 0.09, 22, std('#6b7280', 0.5, 0.6), 0, 5.7, -12, 10).rotateZ(Math.PI / 2));
  for (const lx of [-6, 0, 6]) {
    g.add(box(0.5, 0.25, 0.5, emissive('#ffe2a8', 1.5), lx, 5.3, -9, false));
  }
  return {
    group: g,
    lighting: {
      hemi: { sky: '#c9c2b4', ground: '#3c3e42', intensity: 0.65 },
      key: { color: '#ffe9c4', intensity: 0.95, pos: [-5, 8, 5] },
      fog: { color: '#4a4c50', density: 0.017 },
      clear: '#36383c',
    },
  };
}

/* ── registry ─────────────────────────────────────────────────────────── */

const BUILDERS: Record<SceneId, () => Environment3D> = {
  kopitiam: buildKopitiam,
  street: buildStreet,
  mrt: buildMrt,
  resus: buildResus,
  cathlab: buildCathlab,
  imaging: buildImaging,
  counsel: buildCounsel,
  ward: buildWard,
  pharmacy: buildPharmacy,
  rehab: buildRehab,
  clinic: buildClinic,
  backhouse: buildBackhouse,
};

export const SCENE_IDS_3D = Object.keys(BUILDERS) as SceneId[];

/** Build (or rebuild) the 3D environment for a scene id. */
export function buildEnvironment3D(id: SceneId): Environment3D {
  const builder = BUILDERS[id] ?? BUILDERS.resus;
  const env = builder();
  env.group.name = `env-${id}`;
  return env;
}
