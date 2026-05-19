import Phaser from 'phaser';
import type { Department, Facility } from '../../lib/types';
import { bus, Events } from '../../lib/events';
import { useGame } from '../../state/gameStore';

const LOGICAL_W = 800;
const LOGICAL_H = 600;

const SECTOR_LABELS: Record<string, string> = {
  acute: 'Acute restructured hospital',
  specialty: 'National specialty centre',
  community: 'Community hospital',
  polyclinic: 'Public primary care · polyclinic',
  vwo: 'VWO partner hospital',
  'private-acute': 'Private hospital',
  'private-specialist': 'Private specialist',
  gp: 'General practice clinic',
  telemed: 'Telemedicine provider',
  ancillary: 'Ancillary node',
};

export interface OpsBadgePayload {
  byDept: Record<string, { occ: number; cap: number; queue: number; open: boolean }>;
  /** Per-department per-acuity dot counts (P1..P4). When provided the scene
   *  draws small coloured patient dots inside each department circle. */
  dots?: Record<string, { p1: number; p2: number; p3: number; p4: number }>;
}

const OPS_BADGE_EVENT = 'ops:badges';

const ACUITY_COLOUR = {
  p1: 0xf87171,
  p2: 0xfb923c,
  p3: 0xfacc15,
  p4: 0x4ade80,
} as const;

/** Helper used by PhaserGame to push ops badge data into the scene. */
export function pushOpsBadges(payload: OpsBadgePayload | null): void {
  bus.emit(OPS_BADGE_EVENT, payload);
}

export class HospitalScene extends Phaser.Scene {
  private facility!: Facility;
  private patientSprite!: Phaser.GameObjects.Container;
  private deptObjects = new Map<string, {
    circle: Phaser.GameObjects.Arc;
    badgeBg: Phaser.GameObjects.Rectangle;
    badgeText: Phaser.GameObjects.Text;
  }>();
  private bgGraphics!: Phaser.GameObjects.Graphics;
  private dotsGraphics!: Phaser.GameObjects.Graphics;
  private currentDept: Department | null = null;
  private moveTween: Phaser.Tweens.Tween | null = null;
  /** Cosmetic wobble tween that runs while the figure is in motion. */
  private walkTween: Phaser.Tweens.Tween | null = null;
  /** Queue of departments to walk through. When the engine collapses
   *  multiple transit nodes in one tick we get a burst of PatientMoveTo
   *  events; queueing keeps the sprite from teleporting to the last one. */
  private moveQueue: Department[] = [];
  private cleanup: Array<() => void> = [];

  constructor() {
    super({ key: 'HospitalScene' });
  }

  init(data: { facility: Facility }) {
    this.facility = data.facility;
  }

  create() {
    const cam = this.cameras.main;
    const scaleX = cam.width / LOGICAL_W;
    const scaleY = cam.height / LOGICAL_H;
    const s = Math.min(scaleX, scaleY);
    const offsetX = (cam.width - LOGICAL_W * s) / 2;
    const offsetY = (cam.height - LOGICAL_H * s) / 2;

    const root = this.add.container(offsetX, offsetY);
    root.setScale(s);

    this.bgGraphics = this.add.graphics();
    root.add(this.bgGraphics);
    this.drawFloorplan();

    this.dotsGraphics = this.add.graphics();
    root.add(this.dotsGraphics);

    const title = this.add
      .text(LOGICAL_W / 2, 28, this.facility.name, {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '22px',
        color: '#e2e8f0',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5);
    const subtitle = this.add
      .text(
        LOGICAL_W / 2,
        54,
        `${(this.facility.cluster ?? '').toUpperCase()} · ${SECTOR_LABELS[this.facility.type] ?? this.facility.type}`,
        {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '12px',
          color: '#7d8ba4',
        },
      )
      .setOrigin(0.5, 0.5);
    root.add(title);
    root.add(subtitle);

    for (const dept of this.facility.departments) {
      const colour = Phaser.Display.Color.HexStringToColor(dept.colour).color;
      const circle = this.add.circle(dept.position.x, dept.position.y, dept.radius, colour, 0.18);
      circle.setStrokeStyle(2, colour, 0.9);
      const label = this.add
        .text(dept.position.x, dept.position.y + dept.radius + 12, dept.shortLabel, {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '12px',
          color: '#cbd5f5',
        })
        .setOrigin(0.5, 0);

      const badgeBg = this.add.rectangle(
        dept.position.x + dept.radius - 4,
        dept.position.y - dept.radius + 4,
        46,
        16,
        0x0b1320,
        1,
      );
      badgeBg.setStrokeStyle(1, colour, 1);
      badgeBg.setOrigin(0.5, 0.5);
      badgeBg.setVisible(false);
      const badgeText = this.add
        .text(dept.position.x + dept.radius - 4, dept.position.y - dept.radius + 4, '', {
          fontFamily: 'ui-monospace, monospace',
          fontSize: '10px',
          color: '#e2e8f0',
        })
        .setOrigin(0.5, 0.5);
      badgeText.setVisible(false);

      root.add(circle);
      root.add(label);
      root.add(badgeBg);
      root.add(badgeText);
      this.deptObjects.set(dept.id, { circle, badgeBg, badgeText });
    }

    // Stylised patient figure: head + torso. Built from Phaser primitive
    // GameObjects (Arc, Rectangle, Ellipse) instead of Graphics — primitives
    // render reliably inside a scaled/translated Container, whereas Graphics
    // drawn at relative coords can render at unexpected positions in some
    // Phaser builds.
    const FIG_RED = 0xed2939;
    const FIG_OUTLINE = 0x111a2e;
    const shadow = this.add.ellipse(0, 16, 22, 6, 0x000000, 0.4);
    const body = this.add.rectangle(0, 7, 16, 14, FIG_RED);
    body.setStrokeStyle(1.5, FIG_OUTLINE, 1);
    const head = this.add.circle(0, -5, 6, 0xffffff);
    head.setStrokeStyle(1.5, FIG_OUTLINE, 1);

    const patientLabel = this.add
      .text(0, 22, 'Patient', {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '11px',
        color: '#fff',
        backgroundColor: '#ED2939',
        padding: { x: 4, y: 1 },
      })
      .setOrigin(0.5, 0);
    this.patientSprite = this.add.container(0, 0, [shadow, body, head, patientLabel]);
    this.patientSprite.setVisible(false);
    root.add(this.patientSprite);

    const onMoveTo = (payload: unknown) => {
      const { department } = payload as { department: string };
      const dept = this.facility.departments.find((d) => d.id === department);
      if (!dept) return;
      this.enqueueMove(dept);
    };
    const onReset = () => this.resetPatient();
    const onOpsBadges = (payload: unknown) => this.applyOpsBadges(payload as OpsBadgePayload | null);
    bus.on(Events.PatientMoveTo, onMoveTo);
    bus.on(Events.CaseReset, onReset);
    bus.on(OPS_BADGE_EVENT, onOpsBadges);
    this.cleanup.push(() => bus.off(Events.PatientMoveTo, onMoveTo));
    this.cleanup.push(() => bus.off(Events.CaseReset, onReset));
    this.cleanup.push(() => bus.off(OPS_BADGE_EVENT, onOpsBadges));

    // Bootstrap: if a case is already running when the scene mounts (the
    // Phaser chunk is lazy-loaded, so the user can start a case before
    // listeners are attached and miss the initial PatientMoveTo), snap
    // the figure to the current node so subsequent hops have a starting
    // point.
    const run = useGame.getState().run;
    if (run.caseId && run.currentNodeId) {
      const dept = this.facility.departments.find((d) => {
        // currentNodeId is a pathway node id, not a department id. Look up
        // the node's department from the case definition.
        const caseDef = useGame.getState().caseDef;
        const node = caseDef?.pathway.find((n) => n.id === run.currentNodeId);
        return node?.department === d.id;
      });
      if (dept) this.enqueueMove(dept);
    }

    this.scale.on('resize', this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.handleResize, this);
      this.cleanup.forEach((fn) => fn());
      this.cleanup = [];
    });
  }

  private drawFloorplan() {
    const g = this.bgGraphics;
    g.clear();
    g.fillStyle(0x111a2e, 1);
    g.fillRoundedRect(20, 80, LOGICAL_W - 40, LOGICAL_H - 100, 16);
    g.lineStyle(2, 0x1f2a44, 1);
    g.strokeRoundedRect(20, 80, LOGICAL_W - 40, LOGICAL_H - 100, 16);
    g.lineStyle(1, 0x172238, 0.7);
    for (let x = 40; x < LOGICAL_W - 20; x += 40) g.lineBetween(x, 100, x, LOGICAL_H - 40);
    for (let y = 100; y < LOGICAL_H - 40; y += 40) g.lineBetween(40, y, LOGICAL_W - 40, y);
    g.fillStyle(0x172238, 1);
    g.fillRect(40, 300, LOGICAL_W - 80, 6);
    g.fillRect(380, 100, 6, LOGICAL_H - 140);
  }

  private handleResize(gameSize: Phaser.Structs.Size) {
    const cam = this.cameras.main;
    cam.setSize(gameSize.width, gameSize.height);
    this.scene.restart({ facility: this.facility });
  }

  private enqueueMove(dept: Department) {
    // Skip duplicates of where we already are (or just queued).
    const last = this.moveQueue[this.moveQueue.length - 1] ?? this.currentDept;
    if (last && last.id === dept.id) return;
    this.moveQueue.push(dept);
    if (!this.moveTween) this.dequeueNext();
  }

  private dequeueNext() {
    const dept = this.moveQueue.shift();
    if (!dept) return;
    this.patientSprite.setVisible(true);
    if (!this.currentDept) {
      this.patientSprite.setPosition(dept.position.x, dept.position.y);
    }
    this.deptObjects.forEach((obj, id) => {
      const f = this.facility.departments.find((d) => d.id === id)!;
      const colour = Phaser.Display.Color.HexStringToColor(f.colour).color;
      obj.circle.setFillStyle(colour, id === dept.id ? 0.45 : 0.18);
    });
    // Slower hops with a smaller queue speed-up, so motion is clearly
    // visible even on the busiest chains.
    const duration = Math.max(550, 1100 - this.moveQueue.length * 120);
    this.moveTween = this.tweens.add({
      targets: this.patientSprite,
      x: dept.position.x,
      y: dept.position.y,
      duration,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.currentDept = dept;
        this.moveTween = null;
        // Stop the walking wobble so the figure rests upright at its
        // destination.
        if (this.walkTween) {
          this.walkTween.stop();
          this.walkTween = null;
          this.patientSprite.angle = 0;
        }
        bus.emit(Events.PatientArrived, { departmentId: dept.id });
        if (this.moveQueue.length > 0) this.dequeueNext();
      },
    });
    // Subtle rotation oscillation gives the figure a "walking" feel while
    // it tweens — purely cosmetic, no gameplay effect.
    if (this.walkTween) this.walkTween.stop();
    this.patientSprite.angle = 0;
    this.walkTween = this.tweens.add({
      targets: this.patientSprite,
      angle: { from: -4, to: 4 },
      duration: 180,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private resetPatient() {
    if (this.moveTween) this.moveTween.stop();
    this.moveTween = null;
    if (this.walkTween) this.walkTween.stop();
    this.walkTween = null;
    this.patientSprite.angle = 0;
    this.moveQueue = [];
    this.patientSprite.setVisible(false);
    this.currentDept = null;
    this.deptObjects.forEach((obj, id) => {
      const dept = this.facility.departments.find((d) => d.id === id)!;
      obj.circle.setFillStyle(Phaser.Display.Color.HexStringToColor(dept.colour).color, 0.18);
    });
  }

  private applyOpsBadges(payload: OpsBadgePayload | null) {
    this.dotsGraphics.clear();
    if (!payload) {
      this.deptObjects.forEach(({ badgeBg, badgeText }) => {
        badgeBg.setVisible(false);
        badgeText.setVisible(false);
      });
      this.deptObjects.forEach((obj, id) => {
        const dept = this.facility.departments.find((d) => d.id === id);
        if (dept) {
          obj.circle.setFillStyle(Phaser.Display.Color.HexStringToColor(dept.colour).color, 0.18);
        }
      });
      return;
    }
    for (const [deptId, info] of Object.entries(payload.byDept)) {
      const obj = this.deptObjects.get(deptId);
      const dept = this.facility.departments.find((d) => d.id === deptId);
      if (!obj || !dept) continue;
      const usage = info.cap > 0 ? info.occ / info.cap : 0;
      const baseColour = Phaser.Display.Color.HexStringToColor(dept.colour).color;
      const fillAlpha = !info.open ? 0.08 : 0.18 + Math.min(0.5, usage * 0.5);
      obj.circle.setFillStyle(baseColour, fillAlpha);
      const label = `${info.occ}/${info.cap}${info.queue > 0 ? ` +${info.queue}` : ''}`;
      obj.badgeText.setText(label);
      obj.badgeBg.setVisible(true);
      obj.badgeText.setVisible(true);
    }

    // Draw per-acuity patient dots inside each department circle.
    if (payload.dots) {
      for (const [deptId, dotCounts] of Object.entries(payload.dots)) {
        const dept = this.facility.departments.find((d) => d.id === deptId);
        if (!dept) continue;
        const dots: Array<keyof typeof ACUITY_COLOUR> = [];
        for (let i = 0; i < dotCounts.p1; i++) dots.push('p1');
        for (let i = 0; i < dotCounts.p2; i++) dots.push('p2');
        for (let i = 0; i < dotCounts.p3; i++) dots.push('p3');
        for (let i = 0; i < dotCounts.p4; i++) dots.push('p4');
        const max = Math.min(dots.length, 18);
        const r = 3;
        const gap = 8;
        const cols = Math.min(max, 6);
        const rows = Math.ceil(max / cols);
        const startX = dept.position.x - ((cols - 1) * gap) / 2;
        const startY = dept.position.y - ((rows - 1) * gap) / 2;
        for (let i = 0; i < max; i++) {
          const c = i % cols;
          const r0 = Math.floor(i / cols);
          this.dotsGraphics.fillStyle(ACUITY_COLOUR[dots[i]], 1);
          this.dotsGraphics.fillCircle(startX + c * gap, startY + r0 * gap, r);
        }
        if (dots.length > max) {
          // Overflow indicator — small grey notch.
          this.dotsGraphics.fillStyle(0x7d8ba4, 1);
          this.dotsGraphics.fillRect(
            dept.position.x - 6,
            dept.position.y + (rows * gap) / 2 - 2,
            12,
            2,
          );
        }
      }
    }
  }
}
