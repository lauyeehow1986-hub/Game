import Phaser from 'phaser';
import { TTSH } from '../../content/facilities/nhg/ttsh';
import { facilities } from '../../content';
import { bus, Events } from '../../lib/events';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    this.scene.start('HospitalScene', { facility: TTSH });

    bus.on(Events.FacilityChanged, (payload: unknown) => {
      const { facilityId } = payload as { facilityId: string };
      const facility = facilities[facilityId];
      if (!facility) return;
      const hospital = this.scene.get('HospitalScene');
      if (hospital) {
        this.scene.stop('HospitalScene');
        this.scene.launch('HospitalScene', { facility });
      }
    });
  }
}
