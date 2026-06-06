/**
 * WalkthroughScene — Phaser canvas renderer for the pathway cinematic (v9.9,
 * beta). Runs alongside the default SVG `<Stage>` behind a renderer toggle.
 *
 * Design: the hand-built SVG environments are loaded as a single full-stage
 * texture (see sceneTexture.ts), so the backdrop is pixel-identical to SVG
 * mode. Phaser then owns what a game loop does well that SVG can't:
 *   - smooth tweened motion of figures between beats (they glide / walk in),
 *   - a continuous 60 fps idle bob on active figures,
 *   - a pulsing focus ring on the current speaker,
 *   - particle ambience (drifting motes / steam),
 *   - a camera shake punctuating the AED shock.
 *
 * Figures are drawn procedurally with Graphics using the SAME skin/uniform
 * colours the SVG sprite derives (passed in via the frame), so identities stay
 * consistent across renderers. Coordinates use a fixed 480×270 logical space
 * (Scale.FIT) so they map 1:1 with the SVG stage geometry.
 */
import Phaser from 'phaser';
import { STAGE_W, STAGE_H, type SceneId } from '../../lib/scenery';
import { sceneToDataUri } from './sceneTexture';

export interface PhaserFigure {
  id: string;
  x: number;
  y: number;
  scale: number;
  swatch: string;
  skin: string;
  role: string;
  pose: 'stand' | 'walk' | 'kneel' | 'sit' | 'cpr' | 'collapsed' | 'point';
  facing: 'N' | 'S' | 'E' | 'W';
  isActive: boolean;
  isLead: boolean;
  isSelected: boolean;
}

export interface PhaserFrame {
  scene: SceneId;
  figures: PhaserFigure[];
  caption: { role: string; action: string; x: number } | null;
  /** Punctuate this frame with a camera shake (e.g. the AED shock). */
  shake?: boolean;
}

interface FigNode {
  container: Phaser.GameObjects.Container;
  ring: Phaser.GameObjects.Graphics;
  body: Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
  phase: number;
  pose: PhaserFigure['pose'];
  active: boolean;
}

function hexToNum(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  return m ? parseInt(m[1], 16) : 0x888888;
}

export class WalkthroughScene extends Phaser.Scene {
  static KEY = 'walkthrough-scene';

  private bg?: Phaser.GameObjects.Image;
  private bgScene: SceneId | null = null;
  private figs = new Map<string, FigNode>();
  private dust?: Phaser.GameObjects.Particles.ParticleEmitter;
  private captionBox?: Phaser.GameObjects.Graphics;
  private captionText?: Phaser.GameObjects.Text;
  private onPick: ((id: string) => void) | null = null;
  private pending: PhaserFrame | null = null;
  private ready = false;

  constructor() {
    super(WalkthroughScene.KEY);
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#0b1320');

    // 4×4 white dot texture for the ambience particles.
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 1).fillCircle(2, 2, 2);
    g.generateTexture('wt-dust', 4, 4);
    g.destroy();

    this.dust = this.add
      .particles(0, 0, 'wt-dust', {
        x: { min: 0, max: STAGE_W },
        y: STAGE_H + 4,
        lifespan: 7000,
        speedY: { min: -14, max: -4 },
        speedX: { min: -3, max: 3 },
        scale: { start: 0.6, end: 0 },
        alpha: { start: 0.16, end: 0 },
        frequency: 320,
        quantity: 1,
      })
      .setDepth(-5);

    // Top caption ("broadcast band") — never overlaps figures.
    this.captionBox = this.add.graphics().setDepth(100);
    this.captionText = this.add
      .text(STAGE_W / 2, 10, '', {
        fontFamily: 'ui-monospace, monospace',
        fontSize: '8px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: 184 },
      })
      .setOrigin(0.5, 0)
      .setDepth(101);

    this.ready = true;
    if (this.pending) {
      this.applyFrame(this.pending);
      this.pending = null;
    }
  }

  setPick(cb: (id: string) => void): void {
    this.onPick = cb;
  }

  setFrame(frame: PhaserFrame): void {
    if (!this.ready) {
      this.pending = frame;
      return;
    }
    this.applyFrame(frame);
  }

  private applyFrame(frame: PhaserFrame): void {
    if (frame.scene !== this.bgScene) {
      this.loadBackground(frame.scene);
      this.bgScene = frame.scene;
    }

    const seen = new Set<string>();
    for (const f of frame.figures) {
      seen.add(f.id);
      this.upsertFigure(f);
    }
    for (const [id, node] of this.figs) {
      if (!seen.has(id)) {
        node.container.destroy();
        this.figs.delete(id);
      }
    }

    this.updateCaption(frame.caption);
    if (frame.shake) this.cameras.main.shake(380, 0.005);
  }

  private loadBackground(scene: SceneId): void {
    const key = `wt-bg-${scene}`;
    const place = () => {
      if (this.bg) this.bg.destroy();
      this.bg = this.add
        .image(0, 0, key)
        .setOrigin(0, 0)
        .setDisplaySize(STAGE_W, STAGE_H)
        .setDepth(-10);
    };
    if (this.textures.exists(key)) {
      place();
      return;
    }
    // Listen on the generic ADD event and match the key — robust across
    // Phaser versions regardless of the keyed-event variant.
    const handler = (addedKey: string) => {
      if (addedKey !== key) return;
      this.textures.off(Phaser.Textures.Events.ADD, handler);
      place();
    };
    this.textures.on(Phaser.Textures.Events.ADD, handler);
    this.textures.addBase64(key, sceneToDataUri(scene));
  }

  private upsertFigure(f: PhaserFigure): void {
    let node = this.figs.get(f.id);
    if (!node) {
      const ring = this.add.graphics();
      const body = this.add.graphics();
      const label = this.add
        .text(0, 9, '', {
          fontFamily: 'ui-monospace, monospace',
          fontSize: '5.5px',
          color: '#ffffff',
          align: 'center',
        })
        .setOrigin(0.5, 0);
      const container = this.add.container(f.x, f.y, [ring, body, label]);
      container.setSize(26, 30);
      container.setInteractive(
        new Phaser.Geom.Rectangle(-13, -26, 26, 32),
        Phaser.Geom.Rectangle.Contains,
      );
      container.on('pointerdown', () => this.onPick?.(f.id));
      container.setAlpha(0);
      this.tweens.add({ targets: container, alpha: 1, duration: 250 });
      node = { container, ring, body, label, phase: Math.random() * Math.PI * 2, pose: f.pose, active: f.isActive };
      this.figs.set(f.id, node);
    } else {
      // Glide to the new position.
      this.tweens.add({ targets: node.container, x: f.x, y: f.y, duration: 450, ease: 'Sine.easeInOut' });
      node.pose = f.pose;
      node.active = f.isActive;
    }
    node.container.setScale(f.scale);
    node.container.setDepth(Math.round(f.y));
    this.drawFigure(node, f);
  }

  private drawFigure(node: FigNode, f: PhaserFigure): void {
    const { ring, body, label } = node;

    // floor ring
    ring.clear();
    if (f.isActive || f.isSelected) {
      const col = f.isSelected ? 0xffffff : hexToNum(f.swatch);
      ring.lineStyle(1.1, f.isLead ? 0xfde68a : col, 0.85);
      ring.strokeEllipse(0, 2, 26, 9);
    }
    if (f.isLead) {
      ring.lineStyle(1.2, 0xfde68a, 0.5);
      ring.strokeEllipse(0, 2, 32, 11);
    }

    // body (rounded), head, simple face — feet anchored at (0,0)
    body.clear();
    body.fillStyle(0x000000, 0.28);
    body.fillEllipse(0, 2, 16, 5); // contact shadow
    body.fillStyle(hexToNum(f.swatch), 1);
    body.fillRoundedRect(-5, -18, 10, 18, 3);
    body.fillStyle(hexToNum(f.skin), 1);
    body.fillCircle(0, -22, 4.5);
    if (f.facing !== 'N') {
      body.fillStyle(0x1a1410, 1);
      body.fillRect(-2.4, -23, 1.1, 1.4);
      body.fillRect(1.3, -23, 1.1, 1.4);
    }
    // pose framing
    body.setScale(f.facing === 'W' ? -1 : 1, 1);
    if (f.pose === 'collapsed') {
      body.setRotation(-1.29); // ≈ -74°, lays the figure down
    } else if (f.pose === 'kneel' || f.pose === 'sit' || f.pose === 'cpr') {
      body.setRotation(0);
      body.y = 4;
    } else {
      body.setRotation(0);
      body.y = 0;
    }
    body.setAlpha(f.isActive ? 1 : 0.55);

    label.setText(f.isLead ? '' : f.role.length > 16 ? f.role.slice(0, 16) + '…' : f.role);
    label.setAlpha(f.isActive ? 1 : 0.7);
  }

  private updateCaption(caption: PhaserFrame['caption']): void {
    if (!this.captionBox || !this.captionText) return;
    if (!caption) {
      this.captionBox.setVisible(false);
      this.captionText.setVisible(false);
      return;
    }
    this.captionBox.setVisible(true);
    this.captionText.setVisible(true);
    this.captionText.setText(`${caption.role}: ${caption.action}`);
    const bw = 200;
    const bx = Phaser.Math.Clamp(caption.x, bw / 2 + 4, STAGE_W - bw / 2 - 4);
    const th = this.captionText.height;
    const bh = th + 8;
    this.captionText.setPosition(bx, 12);
    this.captionBox.clear();
    this.captionBox.fillStyle(0x000000, 0.8);
    this.captionBox.fillRoundedRect(bx - bw / 2, 8, bw, bh, 5);
    this.captionBox.lineStyle(0.8, 0xfde68a, 0.4);
    this.captionBox.strokeRoundedRect(bx - bw / 2, 8, bw, bh, 5);
  }

  update(time: number): void {
    // Idle bob on the active figures' bodies (not the ring).
    for (const node of this.figs.values()) {
      if (!node.active || node.pose === 'collapsed') continue;
      const base = node.pose === 'kneel' || node.pose === 'sit' || node.pose === 'cpr' ? 4 : 0;
      node.body.y = base + Math.sin(time / 320 + node.phase) * 0.9;
    }
  }
}
