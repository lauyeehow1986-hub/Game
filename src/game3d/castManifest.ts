/**
 * Cast manifest — maps a walkthrough actor to a shared CC0 character GLB
 * from the Quaternius Ultimate Animated Character Pack (downloaded by
 * `pnpm map:cast`, see scripts/map-quaternius-cast.mjs).
 *
 * Two-tier lookup, both optional — the procedural `Humanoid` rig stays the
 * ground-truth fallback when neither file exists (offline-PWA + empty-folder
 * dev both keep working):
 *
 *   1. Per-actor override:  public/3d/cast/{actorId}.glb
 *      An authored MakeHuman / Ready Player Me export for a named recurring
 *      character (Mr Tan, Mdm Lim, …). Highest priority.
 *
 *   2. Shared library:      public/3d/cast/_lib/{libFile}
 *      A role-appropriate Quaternius character shared across every actor with
 *      the same clinical role, so we don't ship 55 × 2 MB duplicate blobs.
 *      `resolveLibFile` picks the file from the actor's id / role / team.
 *
 * Keyword-based so it generalises to *both* shipped walkthroughs (STEMI,
 * stroke) and any future actor without enumerating every id.
 */
import type { WalkthroughActor } from '../lib/walkthrough';

/** Where the shared archetype library GLBs live. Base-prefixed so it resolves
 *  under the GitHub Pages sub-path (`/Game/`) as well as at root (dev/tests). */
export const CAST_LIB_DIR = `${import.meta.env.BASE_URL}3d/cast/_lib/`;

/**
 * The shared character files we map onto. Each is a Quaternius UACP figure
 * converted to GLB by scripts/map-quaternius-cast.mjs. Keep this list in sync
 * with the `KEEP` set in that script so we only convert what we reference.
 */
export const CAST_LIB_FILES = [
  'doctor-male-young',
  'doctor-female-young',
  'doctor-male-old',
  'doctor-female-old',
  'suit-male',
  'suit-female',
  'worker-male',
  'worker-female',
  'oldclassy-male',
  'oldclassy-female',
  'casual-male',
  'casual-female',
  'casual2-female',
  'casual3-male',
] as const;

export type CastLibFile = (typeof CAST_LIB_FILES)[number];

/** Cheap deterministic pick between two gendered variants from an id. */
function femaleish(actor: WalkthroughActor): boolean {
  if (actor.gender) return actor.gender === 'f';
  const hay = `${actor.id} ${actor.role}`.toLowerCase();
  if (/\b(wife|mrs|mdm|madam|daughter|female|woman|mother|she|her)\b/.test(hay)) return true;
  if (/\b(husband|mr|son|male|man|father|he|his)\b/.test(hay)) return false;
  // Stable hash so a given actor always gets the same variant across renders.
  const h = [...actor.id].reduce((a, c) => a + c.charCodeAt(0), 0);
  return h % 2 === 0;
}

/**
 * Resolve the shared library file for an actor, or null when no sensible
 * mapping exists (caller then keeps the procedural rig).
 */
export function resolveLibFile(actor: WalkthroughActor): CastLibFile | null {
  const hay = `${actor.id} ${actor.role} ${actor.team ?? ''}`.toLowerCase();
  const f = femaleish(actor);

  // Senior clinicians — consultant / specialist / surgeon → older doctor.
  if (/consultant|specialist|surgeon|neurologist|urolog|intensivist|cardio|registrar|\breg\b|intervent|radiolog/.test(hay)) {
    return f ? 'doctor-female-old' : 'doctor-male-old';
  }
  // Front-line clinical — doctor / MO / nurse / HCA / radiographer / therapist.
  if (/doctor|\bmo\b|medical officer|nurse|\bhca\b|radiog|physio|\bot\b|therapist|dietitian|midwife/.test(hay)) {
    return f ? 'doctor-female-young' : 'doctor-male-young';
  }
  // Pre-hospital responders — paramedic / CFR / SCDF / ambulance crew. The
  // Quaternius pack has no EMS model and the construction "worker" reads wrong
  // (hard hat + hi-vis), so use the clinical figure and let castStyle dress them
  // in SCDF red (see garment()).
  if (/paramedic|ambulance|driver|cfr|responder|scdf|smrt-staff|smrt staff/.test(hay)) {
    return f ? 'doctor-female-young' : 'doctor-male-young';
  }
  // Pharmacy / coordination / admin / clerk in office attire.
  if (/pharm|coord|clerk|admin|counsel|registration|discharge/.test(hay)) {
    return f ? 'suit-female' : 'suit-male';
  }
  // Family + bystanders + support staff → everyday casual wear. Checked
  // before the patient block because family members carry `team: 'patient'`.
  if (/family|wife|husband|son|daughter|mother|father/.test(hay)) {
    return f ? 'casual-female' : 'casual2-female';
  }
  if (/bystander|support|cleaner|attendant|onlooker|public/.test(hay)) {
    // casual-male (full hair) not casual3-male: the latter has a bald crown that
    // reads as "bald at the back" when a bystander bends over to do CPR.
    return f ? 'casual-female' : 'casual-male';
  }
  // The patient themselves — usually an older adult.
  if (/patient/.test(hay)) {
    return f ? 'oldclassy-female' : 'oldclassy-male';
  }
  // Anyone clinical-adjacent we didn't catch → young doctor; else casual.
  if ((actor.team ?? '').length > 0) {
    return f ? 'casual-female' : 'casual-male';
  }
  return null;
}
