import Phaser from 'phaser';
import type { Department, Facility } from '../../lib/types';
import { bus, Events } from '../../lib/events';

const LOGICAL_W = 800;
const LOGICAL_H = 600;

export class HospitalScene extends Phaser.Scene {
  private facility!: Facility;
  private patientSprite!: Phaser.GameObjects.Container;
  private patientDot!: Phaser.GameObjects.Arc;
  private patientLabel!: Phaser.GameObjects.Text;
  private deptObjects = new Map<string, {
    circle: Phaser.GameObjects.Arc;
    label: Phaser.GameObjects.Text;
    badge: Phaser.GameObjects.Container;
  }>();
  private bgGraphics!: Phaser.GameObjects.Graphics;
  private currentDept: Department | null = null;
  private title!: Phaser.GameObjects.Text;
  private subtitle!: Phaser.GameObjects.Text;
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

    // Title
    this.title = this.add
      .text(LOGICAL_W / 2, 28, this.facility.name, {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '24px',
        color: '#e2e8f0',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5);
    this.subtitle = this.add
      .text(LOGICAL_W / 2, 54, 'NHG cluster · Acute restructured hospital', {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '13px',
        color: '#7d8ba4',
      })
      .setOrigin(0.5, 0.5);
    root.add(this.title);
    root.add(this.subtitle);

    // Departments
    for (const dept of this.facility.departments) {
      const circle = this.add.circle(
        dept.position.x,
        dept.position.y,
        dept.radius,
        Phaser.Display.Color.HexStringToColor(dept.colour).color,
        0.18,
      );
      circle.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(dept.colour).color, 0.9);
      const label = this.add
        .text(dept.position.x, dept.position.y + dept.radius + 14, dept.shortLabel, {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '12px',
          color: '#cbd5f5',
        })
        .setOrigin(0.5, 0);

      const badge = this.add.container(
        dept.position.x + dept.radius - 6,
        dept.position.y - dept.radius + 6,
      );
      const badgeBg = this.add.circle(0, 0, 8, 0x0b1320, 1);
      badgeBg.setStrokeStyle(
        1.5,
        Phaser.Display.Color.HexStringToColor(dept.colour).color,
        1,
      );
      badge.add(badgeBg);
      badge.setVisible(false);

      root.add(circle);
      root.add(label);
      root.add(badge);
      this.deptObjects.set(dept.id, { circle, label, badge });
    }

    // Patient
    this.patientDot = this.add.circle(0, 0, 9, 0xffffff, 1);
    this.patientDot.setStrokeStyle(2, 0xed2939, 1);
    this.patientLabel = this.add
      .text(0, 14, 'Mr Tan', {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '11px',
        color: '#fff',
        backgroundColor: '#ED2939',
        padding: { x: 4, y: 1 },
      })
      .setOrigin(0.5, 0);
    this.patientSprite = this.add.container(0, 0, [this.patientDot, this.patientLabel]);
    this.patientSprite.setVisible(false);
    root.add(this.patientSprite);

    // Wire bus → scene
    const onMoveTo = (payload: unknown) => {
      const { department } = payload as { department: string };
      const dept = this.facility.departments.find((d) => d.id === department);
      if (dept) this.movePatientTo(dept);
    };
    const onReset = () => this.resetPatient();
    bus.on(Events.PatientMoveTo, onMoveTo);
    bus.on(Events.CaseReset, onReset);
    this.cleanup.push(() => bus.off(Events.PatientMoveTo, onMoveTo));
    this.cleanup.push(() => bus.off(Events.CaseReset, onReset));

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
    // Outer building
    g.fillStyle(0x111a2e, 1);
    g.fillRoundedRect(20, 80, LOGICAL_W - 40, LOGICAL_H - 100, 16);
    g.lineStyle(2, 0x1f2a44, 1);
    g.strokeRoundedRect(20, 80, LOGICAL_W - 40, LOGICAL_H - 100, 16);

    // Light grid floor
    g.lineStyle(1, 0x172238, 0.7);
    for (let x = 40; x < LOGICAL_W - 20; x += 40) g.lineBetween(x, 100, x, LOGICAL_H - 40);
    for (let y = 100; y < LOGICAL_H - 40; y += 40) g.lineBetween(40, y, LOGICAL_W - 40, y);

    // Corridor accents
    g.fillStyle(0x172238, 1);
    g.fillRect(40, 300, LOGICAL_W - 80, 6);
    g.fillRect(380, 100, 6, LOGICAL_H - 140);
  }

  private handleResize(gameSize: Phaser.Structs.Size) {
    const cam = this.cameras.main;
    cam.setSize(gameSize.width, gameSize.height);
    // We rebuild positions on resize by recreating the scene transform.
    this.scene.restart({ facility: this.facility });
  }

  private movePatientTo(dept: Department) {
    this.patientSprite.setVisible(true);
    if (this.moveTween) this.moveTween.stop();

    const start = this.currentDept ?? this.facility.departments[0];
    if (!this.currentDept) {
      this.patientSprite.setPosition(start.position.x, start.position.y);
    }

    // Highlight target
    this.deptObjects.forEach((obj, id) => {
      const isTarget = id === dept.id;
      obj.circle.setFillStyle(
        Phaser.Display.Color.HexStringToColor(
          this.facility.departments.find((d) => d.id === id)!.colour,
        ).color,
        isTarget ? 0.45 : 0.18,
      );
      obj.badge.setVisible(isTarget);
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
      obj.circle.setFillStyle(
        Phaser.Display.Color.HexStringToColor(dept.colour).color,
        0.18,
      );
      obj.badge.setVisible(false);
    });
  }
}
