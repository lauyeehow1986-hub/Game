import Phaser from 'phaser';
import { TTSH } from '../../content/facilities/nhg/ttsh';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    this.scene.start('HospitalScene', { facility: TTSH });
  }
}
