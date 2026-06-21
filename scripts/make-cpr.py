"""
make-cpr.py — author a kneeling, hands-together CPR compression clip for the
Quaternius CharacterArmature and export it as public/3d/anims/cpr-compressions.glb
(replacing the 'PickUp' stand-in, whose hands sit ~1 m apart so one lands on the
patient's pelvis). Headless Blender, same spirit as make-cast.py.

Run:
  "<blender>" --background --python scripts/make-cpr.py -- [--inspect]

--inspect : just dump the rig + render the rest pose (no posing/export).

The engine (animationLibrary.ts) retargets this clip's CharacterArmature track
onto every cast member, and layers a vertical compression bob, so we only need a
single held pose: kneeling over the casualty, both hands together on the sternum.
"""
import bpy
import os
import sys
from math import radians
from mathutils import Euler, Vector, Matrix, Quaternion

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'public', '3d', 'cast', '_quaternius', 'glTF', 'Casual_Male.gltf')
OUT = os.path.join(ROOT, 'public', '3d', 'anims', 'cpr-compressions.glb')
OUT_SUPINE = os.path.join(ROOT, 'public', '3d', 'anims', 'lying-down.glb')
OUT_KNEEL = os.path.join(ROOT, 'public', '3d', 'anims', 'kneeling.glb')
PREVIEW_DIR = os.path.join(ROOT, '.verify', 'blender')
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
INSPECT = '--inspect' in argv
SUPINE = '--supine' in argv  # author lying-down.glb (face-up) instead of cpr
KNEEL = '--kneel' in argv    # author kneeling.glb (bedside attending lean)

os.makedirs(PREVIEW_DIR, exist_ok=True)


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def import_src():
    bpy.ops.import_scene.gltf(filepath=SRC)
    arm = next(o for o in bpy.context.scene.objects if o.type == 'ARMATURE')
    return arm


def setup_render(name, cam_loc, cam_rot, look_h=1.0):
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_WORKBENCH'
    scene.render.resolution_x = 600
    scene.render.resolution_y = 700
    scene.render.film_transparent = False
    cam_data = bpy.data.cameras.new('cam')
    cam = bpy.data.objects.new('cam', cam_data)
    cam.location = cam_loc
    cam.rotation_euler = cam_rot
    scene.collection.objects.link(cam)
    scene.camera = cam
    scene.render.filepath = os.path.join(PREVIEW_DIR, name)
    bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(cam)
    print('  rendered', name)


def dump_rig(arm):
    print('=== ARMATURE', arm.name, '===')
    for b in arm.data.bones:
        h = b.head_local
        t = b.tail_local
        print(f'{b.name:14s} head=({h.x:+.2f},{h.y:+.2f},{h.z:+.2f}) '
              f'tail=({t.x:+.2f},{t.y:+.2f},{t.z:+.2f}) '
              f'parent={b.parent.name if b.parent else "-"}')


def dg():
    bpy.context.view_layer.update()


def to_rest(arm):
    """Clear any imported action and zero every pose bone → true rest (T-pose)."""
    if arm.animation_data:
        arm.animation_data_clear()
    for pb in arm.pose.bones:
        pb.matrix_basis = Matrix()
    dg()


def aim(arm, name, target, roll_hint=None):
    """Rotate pose bone `name` about its head so head->tail points at world `target`."""
    pb = arm.pose.bones[name]
    dg()
    head = pb.head.copy()
    cur = (pb.tail - pb.head).normalized()
    new = (Vector(target) - head).normalized()
    q = cur.rotation_difference(new)
    R = q.to_matrix().to_4x4()
    pb.matrix = Matrix.Translation(head) @ R @ Matrix.Translation(-head) @ pb.matrix
    dg()


# --- CPR pose targets (Blender world: Z up, character faces -Y, left = +X) ---
# Kneeling: drop the pelvis, plant knees on the ground, shins back; torso upright
# with a slight forward lean; both arms straight down-forward, hands together on
# the casualty's chest in front. No engine drop needed (clip already kneels).
BODY_DROP = 0.52
KNEE_L = Vector((0.22, -0.18, 0.06));  ANKLE_L = Vector((0.24, 0.42, 0.03));  TOE_L = Vector((0.24, 0.60, 0.06))
KNEE_R = Vector((-0.22, -0.18, 0.06)); ANKLE_R = Vector((-0.24, 0.42, 0.03)); TOE_R = Vector((-0.24, 0.60, 0.06))
ABDOMEN_T = Vector((0.0, -0.08, 1.00))
TORSO_T = Vector((0.0, -0.20, 1.14))
# Head looks forward at the chest, NOT chin-tucked — a sharp down-tilt bares the
# scalp (rigid hair swings away → "bald back"). Keep it close to level.
HEAD_T = Vector((0.0, -0.55, 1.58))
HAND_L = Vector((0.05, -0.34, 0.30))
HAND_R = Vector((-0.05, -0.34, 0.30))


def lower(arm, name, dz):
    pb = arm.pose.bones[name]
    dg()
    m = pb.matrix.copy()
    m.translation.z -= dz
    pb.matrix = m
    dg()


def pose_cpr(arm):
    to_rest(arm)
    # 1) drop the pelvis to a kneeling height (children follow).
    lower(arm, 'Body', BODY_DROP)
    # 2) kneel: thighs down to knees on the ground, shins back, feet behind.
    aim(arm, 'UpperLeg.L', KNEE_L); aim(arm, 'LowerLeg.L', ANKLE_L); aim(arm, 'Foot.L', TOE_L)
    aim(arm, 'UpperLeg.R', KNEE_R); aim(arm, 'LowerLeg.R', ANKLE_R); aim(arm, 'Foot.R', TOE_R)
    # 3) spine: slight forward lean over the casualty.
    aim(arm, 'Abdomen', ABDOMEN_T); aim(arm, 'Torso', TORSO_T); aim(arm, 'Head', HEAD_T)
    # 4) arms straight, converging on the hand target → hands together on the chest.
    for seg in ('UpperArm.L', 'LowerArm.L', 'Fist.L'):
        aim(arm, seg, HAND_L)
    for seg in ('UpperArm.R', 'LowerArm.R', 'Fist.R'):
        aim(arm, seg, HAND_R)


# --- Supine "lying-down" (face-up): the Quaternius Death clip lands the patient
# FACE-DOWN (prone) — you can't do CPR on a back. Lay the figure flat on its back
# with the head at the same end the scene expects (glTF +Z), arms at the sides. ---
SUP_ARM_L = (Vector((0.30, -0.04, 1.05)), Vector((0.33, -0.04, 0.6)), Vector((0.35, -0.04, 0.18)))
SUP_ARM_R = (Vector((-0.30, -0.04, 1.05)), Vector((-0.33, -0.04, 0.6)), Vector((-0.35, -0.04, 0.18)))


def pose_supine(arm):
    to_rest(arm)
    # arms down to the sides (from the T-pose) for a natural casualty.
    for seg, t in zip(('UpperArm.L', 'LowerArm.L', 'Fist.L'), SUP_ARM_L):
        aim(arm, seg, t)
    for seg, t in zip(('UpperArm.R', 'LowerArm.R', 'Fist.R'), SUP_ARM_R):
        aim(arm, seg, t)
    # tip the whole skeleton onto its back: -90° about world X lays it flat face-up,
    # +180° about Z puts the head at glTF +Z (matching the Death clip's end).
    pb = arm.pose.bones['Bone']
    dg()
    R = Matrix.Rotation(radians(180), 4, 'Z') @ Matrix.Rotation(radians(-90), 4, 'X')
    pb.matrix = R @ pb.matrix
    dg()


# --- "kneel" = bedside attending lean (replaces the PickUp deep waist-bow, which
# read as the clinician BOWING to the patient). Stay mostly upright with a modest
# forward lean and reach both hands forward-down toward a patient on a bed. ---
ATT_ABDOMEN = Vector((0.0, -0.16, 1.45))
ATT_TORSO = Vector((0.0, -0.30, 1.64))
ATT_HEAD = Vector((0.0, -0.45, 1.72))
ATT_HAND_L = Vector((0.18, -0.55, 1.12))
ATT_HAND_R = Vector((-0.18, -0.55, 1.12))


def pose_attend(arm):
    to_rest(arm)
    aim(arm, 'Abdomen', ATT_ABDOMEN); aim(arm, 'Torso', ATT_TORSO); aim(arm, 'Head', ATT_HEAD)
    for seg in ('UpperArm.L', 'LowerArm.L', 'Fist.L'):
        aim(arm, seg, ATT_HAND_L)
    for seg in ('UpperArm.R', 'LowerArm.R', 'Fist.R'):
        aim(arm, seg, ATT_HAND_R)


def keyframe_all(arm, name):
    for pb in arm.pose.bones:
        pb.rotation_mode = 'QUATERNION'
        pb.keyframe_insert('rotation_quaternion', frame=1)
        pb.keyframe_insert('location', frame=1)
        pb.keyframe_insert('rotation_quaternion', frame=12)
        pb.keyframe_insert('location', frame=12)
    act = arm.animation_data.action
    act.name = name
    # Prune the 17 imported source clips. The engine loads animations[0]; left in,
    # an alphabetically-earlier source clip (e.g. 'Death') wins and the authored
    # pose is silently ignored. Also clears any NLA stashing of those clips.
    for tr in list(arm.animation_data.nla_tracks):
        arm.animation_data.nla_tracks.remove(tr)
    for a in list(bpy.data.actions):
        if a is not act:
            bpy.data.actions.remove(a)


def export(arm, out):
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(
        filepath=out, export_format='GLB', export_animations=True,
        export_yup=True, use_selection=False,
    )
    print('  exported', out)


def main():
    reset()
    arm = import_src()
    dump_rig(arm)
    if INSPECT:
        setup_render('rest_front.png', (0, -4, 1.0), (radians(90), 0, 0))
        setup_render('rest_side.png', (4, 0, 1.0), (radians(90), 0, radians(90)))
        setup_render('rest_top.png', (0, 0, 5), (0, 0, 0))
        print('INSPECT done.')
        return
    if SUPINE:
        pose_supine(arm)
        setup_render('supine_top.png', (0, 0, 5), (0, 0, 0))
        setup_render('supine_side.png', (4, 0, 1.0), (radians(85), 0, radians(90)))
        keyframe_all(arm, 'lying-down')
        export(arm, OUT_SUPINE)
        print('Supine lying-down pose authored.')
        return
    if KNEEL:
        pose_attend(arm)
        setup_render('attend_side.png', (4, 0, 1.4), (radians(80), 0, radians(90)))
        setup_render('attend_3q.png', (3, 3, 1.7), (radians(74), 0, radians(135)))
        keyframe_all(arm, 'kneeling')
        export(arm, OUT_KNEEL)
        print('Attending kneel pose authored.')
        return
    pose_cpr(arm)
    # Preview from several angles (camera looks toward the figure's mid-height).
    setup_render('cpr_back.png', (0, -4, 1.2), (radians(78), 0, 0))
    setup_render('cpr_front.png', (0, 4, 1.2), (radians(78), 0, radians(180)))
    setup_render('cpr_side.png', (4, 0, 1.2), (radians(78), 0, radians(90)))
    setup_render('cpr_3q.png', (3, 3, 1.6), (radians(70), 0, radians(135)))
    keyframe_all(arm, 'cpr-compressions')
    export(arm, OUT)
    print('CPR pose authored.')


main()
