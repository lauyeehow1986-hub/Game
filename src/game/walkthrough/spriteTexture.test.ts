import { describe, it, expect } from 'vitest';
import {
  spriteToDataUri,
  spriteTextureKey,
  SPRITE_BASE,
  SPRITE_TEX,
} from './spriteTexture';
import { stemiWalkthrough } from '../../lib/walkthrough-stemi';

describe('spriteTexture — key', () => {
  it('different pose / expression / direction yield different keys', () => {
    const base = spriteTextureKey('patient', { pose: 'stand', expression: 'neutral', direction: 'S' });
    expect(base).not.toBe(spriteTextureKey('patient', { pose: 'cpr', expression: 'neutral', direction: 'S' }));
    expect(base).not.toBe(spriteTextureKey('patient', { pose: 'stand', expression: 'pained', direction: 'S' }));
    expect(base).not.toBe(spriteTextureKey('patient', { pose: 'stand', expression: 'neutral', direction: 'W' }));
    expect(base).not.toBe(spriteTextureKey('bystander', { pose: 'stand', expression: 'neutral', direction: 'S' }));
  });

  it('is stable for identical inputs', () => {
    const a = spriteTextureKey('cfr', { pose: 'kneel', expression: 'focused', direction: 'E' });
    const b = spriteTextureKey('cfr', { pose: 'kneel', expression: 'focused', direction: 'E' });
    expect(a).toBe(b);
  });
});

describe('spriteTexture — data URI', () => {
  it('returns a UTF-8 svg+xml data URI', () => {
    const uri = spriteToDataUri(stemiWalkthrough.actors['patient'], {
      pose: 'stand',
      expression: 'neutral',
      direction: 'S',
    });
    expect(uri.startsWith('data:image/svg+xml;charset=utf-8,')).toBe(true);
  });

  it('embeds the texture-box dimensions and SPRITE_BASE size', () => {
    const uri = spriteToDataUri(stemiWalkthrough.actors['cath-cardio'], {
      pose: 'stand',
      expression: 'neutral',
      direction: 'S',
    });
    const decoded = decodeURIComponent(uri.split(',')[1]);
    expect(decoded).toContain(`width="${SPRITE_TEX}"`);
    expect(decoded).toContain(`height="${SPRITE_TEX}"`);
    // ActorSprite renders at size=SPRITE_BASE; that ends up as a scale() factor.
    expect(decoded).toContain(`scale(${SPRITE_BASE / 64})`);
  });

  it('honours pose / expression / direction (markup actually differs)', () => {
    const a = stemiWalkthrough.actors['patient'];
    const stand = decodeURIComponent(spriteToDataUri(a, { pose: 'stand', expression: 'neutral', direction: 'S' }).split(',')[1]);
    const collapsed = decodeURIComponent(spriteToDataUri(a, { pose: 'collapsed', expression: 'unconscious', direction: 'S' }).split(',')[1]);
    expect(collapsed).not.toBe(stand);
    expect(collapsed).toMatch(/rotate\(-7\d/);
  });
});
