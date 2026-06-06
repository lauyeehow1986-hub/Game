/**
 * WalkthroughScene — Phaser canvas renderer for the pathway cinematic.
 *
 * v9.9 (beta): backdrop = the hand-built SVG environment loaded as one texture;
 * figures were simplified Graphics avatars.
 *
 * v9.10 (fidelity): figures are now the REAL `ActorSprite` art, baked to
 * textures (see spriteTexture.ts) — exact accessories, poses, expressions — so
 * Cinematic figures match the SVG sprites detail-for-detail. Phaser then layers
 * on motion the SVG stage can't: figures glide between beat positions, *walk in*
 * from offscreen (and out) when a beat marks them walking, idle-bob at 60 fps,
 * the speaker gets a pulsing focus ring + halo, particle ambience drifts
 * through, and the camera shakes on the AED shock.
 *
 * Coordinates use a fixed 480×270 logical space (Scale.FIT) so they map 1:1
 * with the SVG stage geometry from `walkthrough-staging.ts`.
 */
import Phaser from 'phaser';
import { STAGE_W, STAGE_H, type SceneId } from '../../lib/scenery';
import type { WalkthroughActor } from '../../lib/walkthrough';
import { sceneToDataUri } from './sceneTexture';
import {
  SPRITE_BASE,
  spriteTextureKey,
  spriteToDataUri,
  type SpriteTextureOpts,
} from './spriteTexture';

export interface PhaserFigure {
  id: string;
  x: number;
  y: number;
  scale: number;
  actor: WalkthroughActor;
  swatch: string;
  role: string;
  pose: SpriteTextureOpts['pose'];
  expression: SpriteTextureOpts['expression'];
  facing: SpriteTextureOpts['direction'];
  walking: boolean;
  isActive: boolean;
  isLead: boolean;
  isSelected: boolean;
}

export interface PhaserFrame {
  scene: SceneId;
  figures: PhaserFigure[];
  caption: { role: string; action: string; x: number } | null;
  shake?: boolean;
}

interface FigNode {
  container: Phaser.GameObjects.Container;
  ring: Phaser.GameObjects.Graphics;
  halo: Phaser.GameObjects.Graphics;
  image: Phaser.GameObjects.Image | null;
  label: Phaser.GameObjects.Text;
  actor: WalkthroughActor;
  texKey: string;
  figPx: number;
  phase: number;
  pose: PhaserFigure['pose'];
  active: boolean;
  moving: boolean;
  tx: number;
  ty: number;
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

    this.captionBox = this.add.graphics().setDepth(1000);
    this.captionText = this.add
      .text(STAGE_W / 2, 12, '', {
        fontFamily: 'ui-monospace, monospace',
        fontSize: '8px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: 184 },
      })
      .setOrigin(0.5, 0)
      .setDepth(1001);

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
        this.exitFigure(node);
        this.figs.delete(id);
      }
    }

    this.updateCaption(frame.caption);
    if (frame.shake) this.cameras.main.shake(380, 0.005);
  }

  /** Ensure a texture exists (baking it from `make` if not), then run `then`. */
  private ensureTexture(key: string, make: () => string, then: () => void): void {
    if (this.textures.exists(key)) {
      then();
      return;
    }
    const handler = (addedKey: string) => {
      if (addedKey !== key) return;
      this.textures.off(Phaser.Textures.Events.ADD, handler);
      then();
    };
    this.textures.on(Phaser.Textures.Events.ADD, handler);
    this.textures.addBase64(key, make());
  }

  private loadBackground(scene: SceneId): void {
    const key = `wt-bg-${scene}`;
    this.ensureTexture(key, () => sceneToDataUri(scene), () => {
      if (this.bg) this.bg.destroy();
      this.bg = this.add
        .image(0, 0, key)
        .setOrigin(0, 0)
        .setDisplaySize(STAGE_W, STAGE_H)
        .setDepth(-10);
    });
  }

  private upsertFigure(f: PhaserFigure): void {
    const figPx = 34 * f.scale;
    const texKey = spriteTextureKey(f.id, {
      pose: f.pose,
      expression: f.expression,
      direction: f.facing,
    });

    let node = this.figs.get(f.id);
    if (!node) {
      const ring = this.add.graphics();
      const halo = this.add.graphics();
      const label = this.add
        .text(0, 9, '', {
          fontFamily: 'ui-monospace, monospace',
          fontSize: '5.5px',
          color: '#ffffff',
          align: 'center',
        })
        .setOrigin(0.5, 0);

      // Walk-in: enter from the edge the figure faces away from; else fade in.
      const entryX = f.walking
        ? f.facing === 'W'
          ? STAGE_W + 30
          : f.facing === 'E'
            ? -30
            : f.x < STAGE_W / 2
              ? -30
              : STAGE_W + 30
        : f.x;
      const container = this.add.container(entryX, f.y, [halo, ring, label]);
      container.setSize(28, 34);
      container.setInteractive(
        new Phaser.Geom.Rectangle(-14, -figPx, 28, figPx + 6),
        Phaser.Geom.Rectangle.Contains,
      );
      container.on('pointerdown', () => this.onPick?.(f.id));

      node = {
        container,
        ring,
        halo,
        image: null,
        label,
        actor: f.actor,
        texKey: '',
        figPx,
        phase: Math.random() * Math.PI * 2,
        pose: f.pose,
        active: f.isActive,
        moving: false,
        tx: f.x,
        ty: f.y,
      };
      this.figs.set(f.id, node);

      if (f.walking && entryX !== f.x) {
        node.moving = true;
        this.tweens.add({
          targets: container,
          x: f.x,
          y: f.y,
          duration: 950,
          ease: 'Sine.easeInOut',
          onComplete: () => {
            if (node) node.moving = false;
          },
        });
      } else {
        container.setAlpha(0);
        this.tweens.add({ targets: container, alpha: 1, duration: 250 });
      }
    } else if (node.tx !== f.x || node.ty !== f.y) {
      // Reposition between beats — walk if the beat is a walking one, else glide.
      node.moving = f.walking;
      this.tweens.add({
        targets: node.container,
        x: f.x,
        y: f.y,
        duration: f.walking ? 850 : 450,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          if (node) node.moving = false;
        },
      });
    }

    node.tx = f.x;
    node.ty = f.y;
    node.figPx = figPx;
    node.pose = f.pose;
    node.active = f.isActive;
    node.container.setDepth(Math.round(f.y));

    this.drawRing(node, f);
    node.label.setText(f.isLead ? '' : f.role.length > 16 ? f.role.slice(0, 16) + '…' : f.role);
    node.label.setAlpha(f.isActive ? 1 : 0.7);

    // Swap / create the sprite image when the pose-texture changes.
    if (node.texKey !== texKey) {
      node.texKey = texKey;
      this.ensureTexture(
        texKey,
        () => spriteToDataUri(f.actor, { pose: f.pose, expression: f.expression, direction: f.facing }),
        () => {
          const n = this.figs.get(f.id);
          if (!n || n.texKey !== texKey) return;
          if (!n.image) {
            n.image = this.add.image(0, -n.figPx / 2, texKey).setOrigin(0.5, 0.5);
            n.container.add(n.image);
            n.container.sendToBack(n.image);
            // keep ring/halo behind the sprite
            n.container.sendToBack(n.ring);
            n.container.sendToBack(n.halo);
          } else {
            n.image.setTexture(texKey);
          }
          n.image.setScale(n.figPx / SPRITE_BASE);
          n.image.setAlpha(f.isActive ? 1 : 0.55);
        },
      );
    } else if (node.image) {
      node.image.setScale(figPx / SPRITE_BASE);
      node.image.setAlpha(f.isActive ? 1 : 0.55);
    }
  }

  private drawRing(node: FigNode, f: PhaserFigure): void {
    const { ring, halo } = node;
    ring.clear();
    halo.clear();
    if (f.isActive || f.isSelected) {
      const col = f.isSelected ? 0xffffff : hexToNum(f.swatch);
      ring.lineStyle(1.1, f.isLead ? 0xfde68a : col, 0.85);
      ring.strokeEllipse(0, 2, 26 * f.scale, 9 * f.scale);
    }
    if (f.isLead) {
      // soft focus halo + outer ring on the speaker
      halo.fillStyle(0xfde68a, 0.12);
      halo.fillCircle(0, -node.figPx * 0.45, node.figPx * 0.95);
      ring.lineStyle(1.2, 0xfde68a, 0.5);
      ring.strokeEllipse(0, 2, 32 * f.scale, 11 * f.scale);
    }
  }

  private exitFigure(node: FigNode): void {
    const edge = node.tx < STAGE_W / 2 ? -30 : STAGE_W + 30;
    this.tweens.add({
      targets: node.container,
      x: edge,
      alpha: 0,
      duration: 600,
      ease: 'Sine.easeIn',
      onComplete: () => node.container.destroy(),
    });
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
    const bh = this.captionText.height + 8;
    this.captionText.setPosition(bx, 12);
    this.captionBox.clear();
    this.captionBox.fillStyle(0x000000, 0.8);
    this.captionBox.fillRoundedRect(bx - bw / 2, 8, bw, bh, 5);
    this.captionBox.lineStyle(0.8, 0xfde68a, 0.4);
    this.captionBox.strokeRoundedRect(bx - bw / 2, 8, bw, bh, 5);
  }

  update(time: number): void {
    for (const node of this.figs.values()) {
      if (!node.image) continue;
      const rest = -node.figPx / 2;
      if (node.pose === 'collapsed') {
        node.image.y = rest;
        continue;
      }
      if (node.moving) {
        // brisker bob + slight tilt while walking
        node.image.y = rest + Math.sin(time / 90 + node.phase) * 1.6;
        node.image.rotation = Math.sin(time / 90 + node.phase) * 0.04;
      } else {
        node.image.rotation = 0;
        node.image.y = node.active ? rest + Math.sin(time / 320 + node.phase) * 0.9 : rest;
      }
    }
  }
}
