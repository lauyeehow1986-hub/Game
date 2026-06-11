"""
make-cast.py — generate photoreal recurring-cast GLB overrides with MakeHuman /
MPFB inside Blender, headless (Steps D + E of docs/REMAINING.md).

The 3D walkthrough renderer resolves an actor's mesh in three tiers
(`src/game3d/actorLoader.ts`):

    public/3d/cast/{actorId}.glb   ← authored override  (this script)
    public/3d/cast/_lib/*.glb      ← Quaternius shared cast (pnpm map:cast)
    procedural Humanoid rig         ← always-present fallback

This script populates the top tier: one parametric MakeHuman per recurring
character, phenotype chosen for Singaporean authenticity (age / sex / ethnicity
matched to the role — see [[feedback_sg_character_authenticity]]), a default
rig whose bone names retarget cleanly onto the pose clips
(`src/game3d/animationLibrary.ts` already routes Quaternius / MakeHuman default
rigs through `SkeletonUtils.retargetClip`), a simple skin tint, and a flat
attire-colour material so scrubs / coat / SCDF jumpsuit read at a glance. The
GLB lands at `public/3d/cast/{actorId}.glb`.

Run (Blender 5.x with the MPFB extension installed):

    blender --background --python scripts/make-cast.py
    # or a subset:
    blender --background --python scripts/make-cast.py -- --only patient,stroke-patient

`public/3d/cast/` is gitignored (binary assets), exactly like the HDRIs and the
Quaternius library — this script is the reproducible, committed recipe, not the
output. Step E (Marvelous Designer cloth sim / Ready Player Me scrubs) refines
the same override slots by hand; see docs/CAST-PHOTOREAL.md.
"""
import bpy
import os
import sys
import math

PKG = "bl_ext.blender_org.mpfb"
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CAST_DIR = os.path.join(REPO_ROOT, "public", "3d", "cast")


def log(*a):
    print("[make-cast]", *a)
    sys.stdout.flush()


def _hs():
    return __import__(PKG + ".services.humanservice", fromlist=["HumanService"]).HumanService


def _objservice():
    return __import__(PKG + ".services.objectservice", fromlist=["ObjectService"]).ObjectService


# Ethnicity → MPFB race triplet (sums to 1.0). Coarse but recognisable; refine
# by hand in MPFB for hero shots.
RACE = {
    "chinese": {"asian": 0.85, "caucasian": 0.10, "african": 0.05},
    "malay": {"asian": 0.70, "caucasian": 0.12, "african": 0.18},
    "indian": {"asian": 0.45, "caucasian": 0.40, "african": 0.15},
    "eurasian": {"asian": 0.45, "caucasian": 0.50, "african": 0.05},
    "mixed": {"asian": 0.55, "caucasian": 0.30, "african": 0.15},
}

# Skin tints (linear-ish sRGB) keyed to the ethnicity, kept gentle.
SKIN = {
    "chinese": (0.86, 0.70, 0.56),
    "malay": (0.72, 0.55, 0.42),
    "indian": (0.60, 0.43, 0.31),
    "eurasian": (0.83, 0.66, 0.54),
    "mixed": (0.74, 0.58, 0.46),
}

# Attire accent colours so roles read instantly even before Step-E garments.
ATTIRE = {
    "patient": (0.80, 0.82, 0.86),       # hospital gown / street clothes
    "scrubs-blue": (0.20, 0.45, 0.62),   # nurse / ward
    "scrubs-green": (0.18, 0.52, 0.42),  # theatre / surgeon
    "white-coat": (0.92, 0.93, 0.95),    # doctor / consultant
    "scdf": (0.86, 0.36, 0.10),          # SCDF paramedic / driver
    "support": (0.42, 0.40, 0.46),       # porter / cleaner / lab
}

# Recurring cast. actorId is the sprite id used by the walkthroughs (matches the
# `id:` field of each WalkthroughActor), so the GLB lands in the right slot.
# (sex: 0=fem .. 1=masc; age: 0=child .. 0.5=young adult .. 1=old.)
CAST = [
    # ── Patients (one per pathway; ethnicity varied for authenticity) ──
    dict(actorId="patient",          name="Mr Tan (STEMI)",   ethnicity="chinese", sex=0.92, age=0.66, weight=0.60, attire="patient"),
    dict(actorId="stroke-patient",   name="Mdm Lim (stroke)", ethnicity="chinese", sex=0.12, age=0.80, weight=0.52, attire="patient"),
    dict(actorId="sepsis-patient",   name="Mdm Devi (sepsis)", ethnicity="indian", sex=0.12, age=0.74, weight=0.55, attire="patient"),
    dict(actorId="trauma-patient",   name="Mr Lim (trauma)",  ethnicity="chinese", sex=0.90, age=0.40, weight=0.48, attire="patient"),
    # ── Recurring staff archetypes (shared look across pathways) ──
    dict(actorId="paramedic",        name="SCDF paramedic",   ethnicity="malay",   sex=0.85, age=0.42, weight=0.52, attire="scdf"),
    dict(actorId="sepsis-ed-doctor", name="ED registrar",     ethnicity="indian",  sex=0.40, age=0.45, weight=0.48, attire="white-coat"),
    dict(actorId="trauma-team-leader", name="Trauma lead",    ethnicity="chinese", sex=0.55, age=0.52, weight=0.52, attire="white-coat"),
    dict(actorId="urologist",        name="Urologist",        ethnicity="indian",  sex=0.80, age=0.55, weight=0.55, attire="scrubs-green"),
    dict(actorId="trauma-surgeon",   name="Trauma surgeon",   ethnicity="malay",   sex=0.78, age=0.50, weight=0.55, attire="scrubs-green"),
    dict(actorId="icu-nurse",        name="ICU nurse",        ethnicity="malay",   sex=0.20, age=0.40, weight=0.50, attire="scrubs-blue"),
]


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block in (bpy.data.meshes, bpy.data.armatures, bpy.data.materials):
        for b in list(block):
            if b.users == 0:
                block.remove(b)


def flat_material(name, rgb):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (rgb[0], rgb[1], rgb[2], 1.0)
        if "Roughness" in bsdf.inputs:
            bsdf.inputs["Roughness"].default_value = 0.7
    return mat


def build_one(spec):
    HS = _hs()
    clear_scene()
    macro = {
        "gender": float(spec["sex"]),
        "age": float(spec["age"]),
        "muscle": 0.5,
        "weight": float(spec.get("weight", 0.5)),
        "proportions": 0.5,
        "height": float(spec.get("height", 0.5)),
        "cupsize": 0.5,
        "firmness": 0.5,
        "race": dict(RACE[spec["ethnicity"]]),
    }
    human = HS.create_human(macro_detail_dict=macro)
    # Rig with the default skeleton — naming-compatible with the pose clips.
    try:
        HS.add_builtin_rig(human, "default")
    except Exception as e:  # noqa: BLE001
        log("  rig warning:", e)

    # Skin + attire materials. Slot 0 = skin; add a second accent slot so the
    # GLB carries a recognisable role colour even before Step-E garments.
    skin = flat_material(spec["actorId"] + "_skin", SKIN[spec["ethnicity"]])
    human.data.materials.clear()
    human.data.materials.append(skin)
    human.data.materials.append(flat_material(spec["actorId"] + "_attire", ATTIRE[spec["attire"]]))

    out = os.path.join(CAST_DIR, spec["actorId"] + ".glb")
    os.makedirs(CAST_DIR, exist_ok=True)
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(
        filepath=out,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
    )
    size = os.path.getsize(out)
    log(f"  -> {spec['actorId']}.glb  ({size // 1024} KB)  [{spec['name']}]")
    return size


def main():
    argv = sys.argv
    only = None
    if "--" in argv:
        extra = argv[argv.index("--") + 1:]
        if "--only" in extra:
            only = set(extra[extra.index("--only") + 1].split(","))

    specs = [s for s in CAST if (only is None or s["actorId"] in only)]
    log(f"generating {len(specs)} cast member(s) into {CAST_DIR}")
    made = 0
    for spec in specs:
        try:
            build_one(spec)
            made += 1
        except Exception as e:  # noqa: BLE001
            import traceback
            traceback.print_exc()
            log("  FAILED", spec["actorId"], e)
    log(f"done: {made}/{len(specs)} cast GLBs written")


if __name__ == "__main__":
    main()
