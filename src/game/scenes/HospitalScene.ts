import Phaser from 'phaser';
import type { Department, Facility } from '../../lib/types';
import { bus, Events } from '../../lib/events';

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
}

const OPS_BADGE_EVENT = 'ops:badges';

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
  private currentDept: Department | null = null;
  private moveTween: Phaser.Tweens.Tween | null = null;
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

    const patientDot = this.add.circle(0, 0, 9, 0xffffff, 1);
    patientDot.setStrokeStyle(2, 0xed2939, 1);
    const patientLabel = this.add
      .text(0, 14, 'Patient', {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '11px',
        color: '#fff',
        backgroundColor: '#ED2939',
        padding: { x: 4, y: 1 },
      })
      .setOrigin(0.5, 0);
    this.patientSprite = this.add.container(0, 0, [patientDot, patientLabel]);
    this.patientSprite.setVisible(false);
    root.add(this.patientSprite);

    const onMoveTo = (payload: unknown) => {
      const { department } = payload as { department: string };
      const dept = this.facility.departments.find((d) => d.id === department);
      if (dept) this.movePatientTo(dept);
    };
    const onReset = () => this.resetPatient();
    const onOpsBadges = (payload: unknown) => this.applyOpsBadges(payload as OpsBadgePayload | null);
    bus.on(Events.PatientMoveTo, onMoveTo);
    bus.on(Events.CaseReset, onReset);
    bus.on(OPS_BADGE_EVENT, onOpsBadges);
    this.cleanup.push(() => bus.off(Events.PatientMoveTo, onMoveTo));
    this.cleanup.push(() => bus.off(Events.CaseReset, onReset));
    this.cleanup.push(() => bus.off(OPS_BADGE_EVENT, onOpsBadges));

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

  private movePatientTo(dept: Department) {
    this.patientSprite.setVisible(true);
    if (this.moveTween) this.moveTween.stop();
    if (!this.currentDept) {
      this.patientSprite.setPosition(dept.position.x, dept.position.y);
    }
    this.deptObjects.forEach((obj, id) => {
      const f = this.facility.departments.find((d) => d.id === id)!;
      const colour = Phaser.Display.Color.HexStringToColor(f.colour).color;
      obj.circle.setFillStyle(colour, id === dept.id ? 0.45 : 0.18);
    });
    this.moveTween = this.tweens.add({
      targets: this.patientSprite,
      x: dept.position.x,
      y: dept.position.y,
      duration: 900,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.currentDept = dept;
        bus.emit(Events.PatientArrived, { departmentId: dept.id });
      },
    });
  }

  private resetPatient() {
    if (this.moveTween) this.moveTween.stop();
    this.patientSprite.setVisible(false);
    this.currentDept = null;
    this.deptObjects.forEach((obj, id) => {
      const dept = this.facility.departments.find((d) => d.id === id)!;
      obj.circle.setFillStyle(Phaser.Display.Color.HexStringToColor(dept.colour).color, 0.18);
    });
  }

  private applyOpsBadges(payload: OpsBadgePayload | null) {
    if (!payload) {
      this.deptObjects.forEach(({ badgeBg, badgeText }) => {
        badgeBg.setVisible(false);
        badgeText.setVisible(false);
      });
      // Reset all department fills.
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
  }
}
