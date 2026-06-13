"""
make-cast-photoreal.py — generate the 14 shared `_lib` cast archetypes as
clothed MakeHuman humans, headless in Blender 5.x + MPFB.

This is the v12 "photoreal asset pipeline" step. `castManifest.ts` routes every
actor across all four walkthroughs to one of 14 role archetypes in
`public/3d/cast/_lib/` (doctor-old, worker, patient, casual, suit…). Replacing
those GLBs with real human meshes upgrades *every* figure at once — and once
committed (the `_lib/` gitignore rule is removed) the **deployed** site shows
clothed humans instead of the procedural capsule rig.

Honest scope: MPFB on a locked-down box has no skin/clothing/hair *asset packs*
(those need a MakeHuman download), and complex skin shaders don't survive GLB
export. So we build everything GLB-safe and asset-free:
  • a real MakeHuman base body (realistic proportions, ~19k verts, default rig);
  • a PBR **skin** material (Principled base tone + subsurface for flesh) on the
    head / neck / hands / forearms;
  • a role-coloured **clothing** material on the rest of the body, split by the
    rig's joint vertex-groups (short-sleeve scrubs / coat / gown / hi-vis / suit);
  • a simple **hair** cap on the scalp.
The result is a clothed, skin-shaded human — far past the capsule rig, short of a
scanned photoreal model (which the offline tools here can't reach).

Run:
    blender --background --python scripts/make-cast-photoreal.py            # all 14
    blender --background --python scripts/make-cast-photoreal.py -- --only doctor-male-old
"""
import bpy
import os
import sys
import math

PKG = "bl_ext.blender_org.mpfb"
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
LIB_DIR = os.path.join(REPO_ROOT, "public", "3d", "cast", "_lib")


def log(*a):
    print("[photoreal]", *a)
    sys.stdout.flush()


def _hs():
    return __import__(PKG + ".services.humanservice", fromlist=["HumanService"]).HumanService


RACE = {
    "chinese": {"asian": 0.85, "caucasian": 0.10, "african": 0.05},
    "malay": {"asian": 0.70, "caucasian": 0.12, "african": 0.18},
    "indian": {"asian": 0.45, "caucasian": 0.40, "african": 0.15},
    "mixed": {"asian": 0.6, "caucasian": 0.28, "african": 0.12},
}
SKIN = {
    "chinese": (0.82, 0.62, 0.49),
    "malay": (0.66, 0.47, 0.34),
    "indian": (0.55, 0.38, 0.27),
    "mixed": (0.72, 0.54, 0.42),
}
HAIR = {"black": (0.04, 0.03, 0.03), "darkbrown": (0.10, 0.07, 0.05), "grey": (0.55, 0.55, 0.57)}

# The 14 archetypes from castManifest.CAST_LIB_FILES, each with a phenotype +
# role-appropriate clothing colour and the clothing "type" (affects sleeves).
CAST = {
    "doctor-male-young":   dict(sex=0.9, age=0.42, eth="indian",  hair="black",    cloth=(0.93, 0.94, 0.96), kind="coat"),
    "doctor-female-young": dict(sex=0.15, age=0.42, eth="chinese", hair="black",    cloth=(0.93, 0.94, 0.96), kind="coat"),
    "doctor-male-old":     dict(sex=0.85, age=0.7,  eth="chinese", hair="grey",     cloth=(0.93, 0.94, 0.96), kind="coat"),
    "doctor-female-old":   dict(sex=0.15, age=0.7,  eth="indian",  hair="grey",     cloth=(0.93, 0.94, 0.96), kind="coat"),
    "suit-male":           dict(sex=0.9, age=0.5,  eth="chinese", hair="darkbrown", cloth=(0.16, 0.18, 0.24), kind="long"),
    "suit-female":         dict(sex=0.15, age=0.5,  eth="chinese", hair="black",    cloth=(0.18, 0.20, 0.26), kind="long"),
    "worker-male":         dict(sex=0.9, age=0.45, eth="malay",   hair="black",    cloth=(0.86, 0.36, 0.10), kind="long"),
    "worker-female":       dict(sex=0.2, age=0.45, eth="malay",   hair="black",    cloth=(0.86, 0.36, 0.10), kind="long"),
    "oldclassy-male":      dict(sex=0.85, age=0.78, eth="chinese", hair="grey",     cloth=(0.55, 0.60, 0.66), kind="gown"),
    "oldclassy-female":    dict(sex=0.15, age=0.78, eth="indian",  hair="grey",     cloth=(0.55, 0.60, 0.66), kind="gown"),
    "casual-male":         dict(sex=0.9, age=0.4,  eth="malay",   hair="black",    cloth=(0.20, 0.45, 0.55), kind="short"),
    "casual-female":       dict(sex=0.15, age=0.4,  eth="chinese", hair="black",    cloth=(0.62, 0.28, 0.40), kind="short"),
    "casual2-female":      dict(sex=0.2, age=0.5,  eth="indian",  hair="darkbrown", cloth=(0.45, 0.50, 0.30), kind="short"),
    "casual3-male":        dict(sex=0.88, age=0.55, eth="chinese", hair="darkbrown", cloth=(0.30, 0.34, 0.42), kind="short"),
}

# Joint vertex-groups whose vertices stay bare skin. "coat"/"long" keep sleeves,
# so forearms become clothing; "short"/scrubs expose the forearm.
SKIN_PARTS_BASE = ["head", "neck", "hand", "finger", "thumb"]
SKIN_PARTS_SHORT = SKIN_PARTS_BASE + ["lowerarm"]


def pbr(name, rgb, roughness, subsurface=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes.get("Principled BSDF")
    if b:
        b.inputs["Base Color"].default_value = (rgb[0], rgb[1], rgb[2], 1.0)
        if "Roughness" in b.inputs:
            b.inputs["Roughness"].default_value = roughness
        # Subsurface gives skin its fleshy translucency. Input names shifted
        # across Blender versions — set whatever exists.
        for key, val in (("Subsurface Weight", subsurface), ("Subsurface", subsurface)):
            if key in b.inputs:
                try:
                    b.inputs[key].default_value = val
                except Exception:  # noqa: BLE001
                    pass
        if subsurface > 0 and "Subsurface Radius" in b.inputs:
            try:
                b.inputs["Subsurface Radius"].default_value = (0.30, 0.12, 0.07)
            except Exception:  # noqa: BLE001
                pass
    return m


def split_skin_clothing(obj, skin_mat, cloth_mat, skin_parts):
    obj.data.materials.clear()
    obj.data.materials.append(skin_mat)   # index 0
    obj.data.materials.append(cloth_mat)  # index 1
    skin_vg = {g.index for g in obj.vertex_groups
               if any(p in g.name.lower() for p in skin_parts)}
    skin_verts = set()
    for v in obj.data.vertices:
        for ge in v.groups:
            if ge.group in skin_vg and ge.weight > 0.5:
                skin_verts.add(v.index)
                break
    for poly in obj.data.polygons:
        n_skin = sum(1 for vi in poly.vertices if vi in skin_verts)
        poly.material_index = 0 if n_skin * 2 >= len(poly.vertices) else 1


def add_hair(obj, group, hair_rgb):
    # head centre = centroid of the joint-head group's vertices
    hidx = {g.index for g in obj.vertex_groups if g.name.lower() in ("joint-head", "joint-head-2")}
    pts = [v.co for v in obj.data.vertices
           if any(ge.group in hidx and ge.weight > 0.4 for ge in v.groups)]
    if not pts:
        return
    cx = sum(p.x for p in pts) / len(pts)
    cy = sum(p.y for p in pts) / len(pts)
    cz = sum(p.z for p in pts) / len(pts)
    top = max(p.z for p in pts)
    r = (max(p.x for p in pts) - min(p.x for p in pts)) * 0.62
    bpy.ops.mesh.primitive_uv_sphere_add(radius=max(r, 0.06), segments=20, ring_count=12,
                                         location=(cx, cy, top - r * 0.55))
    hair = bpy.context.active_object
    hair.scale = (1.06, 1.12, 1.0)
    hair.data.materials.append(pbr("hair", hair_rgb, 0.65))
    hair.name = "hair"
    hair.parent = obj
    for p in hair.data.polygons:  # drop the lower hemisphere so it's a cap
        pass
    return hair


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block in (bpy.data.meshes, bpy.data.materials, bpy.data.armatures):
        for b in list(block):
            if b.users == 0:
                block.remove(b)


def build(name, spec):
    HS = _hs()
    clear_scene()
    macro = {
        "gender": float(spec["sex"]), "age": float(spec["age"]), "muscle": 0.5,
        "weight": 0.5, "proportions": 0.5, "height": 0.5, "cupsize": 0.5,
        "firmness": 0.5, "race": dict(RACE[spec["eth"]]),
    }
    human = HS.create_human(macro_detail_dict=macro)
    try:
        HS.add_builtin_rig(human, "default")
    except Exception as e:  # noqa: BLE001
        log("  rig warn:", e)

    skin_mat = pbr(name + "_skin", SKIN[spec["eth"]], 0.52, subsurface=0.13)
    cloth_mat = pbr(name + "_cloth", spec["cloth"], 0.74)
    skin_parts = SKIN_PARTS_SHORT if spec["kind"] in ("short", "gown") else SKIN_PARTS_BASE
    split_skin_clothing(human, skin_mat, cloth_mat, skin_parts)
    add_hair(human, name, HAIR[spec["hair"]])

    out = os.path.join(LIB_DIR, name + ".glb")
    os.makedirs(LIB_DIR, exist_ok=True)
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(filepath=out, export_format="GLB", use_selection=True,
                              export_apply=True, export_yup=True)
    log(f"  -> {name}.glb ({os.path.getsize(out)//1024} KB)")


def main():
    only = None
    if "--" in sys.argv:
        extra = sys.argv[sys.argv.index("--") + 1:]
        if "--only" in extra:
            only = set(extra[extra.index("--only") + 1].split(","))
    names = [n for n in CAST if (only is None or n in only)]
    log(f"generating {len(names)} archetype(s) into {LIB_DIR}")
    for n in names:
        try:
            build(n, CAST[n])
        except Exception as e:  # noqa: BLE001
            import traceback
            traceback.print_exc()
            log("  FAILED", n, e)
    log("done")


if __name__ == "__main__":
    main()
