"""
make-cast-photoreal.py — generate the 14 shared `_lib` cast archetypes as real
photoreal MakeHuman humans, headless in Blender 5.x + MPFB.

This is the v12 "photoreal asset pipeline" step. `castManifest.ts` routes every
actor across all four walkthroughs to one of 14 role archetypes in
`public/3d/cast/_lib/`. Replacing those GLBs with real human meshes upgrades
*every* figure at once — and once committed (the `_lib/` gitignore rule is
removed) the **deployed** site shows photoreal humans instead of capsules.

What makes this photoreal (vs. the earlier white-mannequin attempt) is the real
MakeHuman **System Assets CC0** pack (~268 MB, fetched once by
`scripts/fetch-makehuman-assets.ps1` into `MH_ASSETS`):

  • SKIN  — per age×ethnicity×sex photo **diffuse textures** mapped onto the
            base-mesh UVs (the dominant realism factor: real human skin, eyes,
            lips painted into the face).
  • CLOTHES — fitted garment meshes (suits / coverall) with fabric **diffuse +
            normal** maps, draped onto the body shape and rigged to the skeleton
            via MPFB's `add_mhclo_asset`.
  • HAIR  — a hair mesh with diffuse+alpha cards.
  • EYEBROWS — alpha-mapped brow cards (a surprisingly large life/realism cue).

GLB-export safety: MPFB's own "v2 skin" is a complex node group the glTF
exporter can't trace, so we DON'T use it. Every material here is a plain
Principled BSDF wired exactly how the glTF exporter understands — image-texture
→ Base Color, normal-map → Normal, texture-alpha → Alpha. That survives GLB
intact, so the deployed humans look the same as the Blender render.

Run:
    blender --background --python scripts/make-cast-photoreal.py            # all 14
    blender --background --python scripts/make-cast-photoreal.py -- --only doctor-male-old
Override the asset pack location with the MH_ASSETS env var.
"""
import bpy
import os
import sys
import glob
import math

PKG = "bl_ext.blender_org.mpfb"
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
LIB_DIR = os.path.join(REPO_ROOT, "public", "3d", "cast", "_lib")
ASSETS = os.environ.get("MH_ASSETS", r"C:\Users\lauye\Documents\makehuman_assets")


def log(*a):
    print("[photoreal]", *a)
    sys.stdout.flush()


def _hs():
    return __import__(PKG + ".services.humanservice", fromlist=["HumanService"]).HumanService


# ---- phenotype tables -------------------------------------------------------
# race macro drives bone structure (nose/brow); the skin texture drives colour.
RACE = {
    "chinese": {"asian": 0.92, "caucasian": 0.05, "african": 0.03},
    "malay":   {"asian": 0.80, "caucasian": 0.08, "african": 0.12},
    "indian":  {"asian": 0.40, "caucasian": 0.45, "african": 0.15},
    "mixed":   {"asian": 0.62, "caucasian": 0.28, "african": 0.10},
}
# Which photo-skin folder ethnicity to draw the diffuse from, plus an optional
# multiply tint to nudge a "lightskinned" texture toward an authentic SG tone.
SKIN_SRC = {
    "chinese": ("asian",     None),
    "malay":   ("asian",     (0.90, 0.80, 0.70)),   # slightly tanned
    "indian":  ("caucasian", (0.66, 0.50, 0.39)),   # warm brown
    "mixed":   ("asian",     (0.96, 0.90, 0.84)),
}
HAIR_RGB = {"black": (0.035, 0.028, 0.025), "darkbrown": (0.09, 0.06, 0.04), "grey": (0.55, 0.55, 0.57)}

# 14 archetypes from castManifest.CAST_LIB_FILES. garment_tint=None keeps the
# real fabric texture; a tint recolours (keeping the fabric normal map) for
# roles the CC0 pack has no garment for (scrubs / coat / hi-vis).
SCRUBS = (0.36, 0.62, 0.66)   # teal scrubs
COAT   = (0.95, 0.96, 0.97)   # white coat
HIVIS  = (0.94, 0.46, 0.08)   # hi-vis orange
NAVY   = (0.13, 0.15, 0.22)
GREY   = (0.50, 0.52, 0.56)

CAST = {
    "doctor-male-young":   dict(sex=0.95, age=0.40, eth="indian",  hair=("short02",   "black"),     garment="male_casualsuit01",   tint=SCRUBS),
    "doctor-female-young": dict(sex=0.10, age=0.40, eth="chinese", hair=("ponytail01", "black"),    garment="female_casualsuit01", tint=SCRUBS),
    "doctor-male-old":     dict(sex=0.90, age=0.72, eth="chinese", hair=("short03",   "grey"),      garment="male_elegantsuit01",  tint=COAT),
    "doctor-female-old":   dict(sex=0.12, age=0.72, eth="indian",  hair=("bob01",     "grey"),      garment="female_elegantsuit01", tint=COAT),
    "suit-male":           dict(sex=0.95, age=0.50, eth="chinese", hair=("short01",   "darkbrown"), garment="male_elegantsuit01",  tint=NAVY),
    "suit-female":         dict(sex=0.10, age=0.50, eth="chinese", hair=("bob02",     "black"),     garment="female_elegantsuit01", tint=NAVY),
    "worker-male":         dict(sex=0.95, age=0.46, eth="malay",   hair=("short04",   "black"),     garment="male_worksuit01",     tint=HIVIS),
    "worker-female":       dict(sex=0.18, age=0.46, eth="malay",   hair=("ponytail01", "black"),    garment="female_sportsuit01",  tint=HIVIS),
    "oldclassy-male":      dict(sex=0.88, age=0.80, eth="chinese", hair=("short03",   "grey"),      garment="male_elegantsuit01",  tint=GREY),
    "oldclassy-female":    dict(sex=0.12, age=0.80, eth="indian",  hair=("bob01",     "grey"),      garment="female_elegantsuit01", tint=GREY),
    "casual-male":         dict(sex=0.95, age=0.38, eth="malay",   hair=("short02",   "black"),     garment="male_casualsuit02",   tint=None),
    "casual-female":       dict(sex=0.12, age=0.38, eth="chinese", hair=("long01",    "black"),     garment="female_casualsuit01", tint=None),
    "casual2-female":      dict(sex=0.18, age=0.50, eth="indian",  hair=("braid01",   "darkbrown"), garment="female_casualsuit02", tint=None),
    "casual3-male":        dict(sex=0.90, age=0.55, eth="chinese", hair=("short01",   "darkbrown"), garment="male_casualsuit03",   tint=None),
}


# ---- asset path resolution --------------------------------------------------
def _agegroup(age):
    return "young" if age < 0.5 else ("middleage" if age < 0.7 else "old")


def skin_diffuse(eth, age, sex):
    src_eth, tint = SKIN_SRC[eth]
    s = "male" if sex >= 0.5 else "female"
    folder = os.path.join(ASSETS, "skins", f"{_agegroup(age)}_{src_eth}_{s}")
    pngs = glob.glob(os.path.join(folder, "*diffuse*.png"))
    return (pngs[0] if pngs else None), tint


def garment_paths(name):
    d = os.path.join(ASSETS, "clothes", name)
    mhclo = os.path.join(d, name + ".mhclo")
    diff = glob.glob(os.path.join(d, "*_diffuse.png"))
    norm = glob.glob(os.path.join(d, "*_normal.png"))
    return (mhclo if os.path.exists(mhclo) else None,
            diff[0] if diff else None, norm[0] if norm else None)


def hair_paths(style):
    d = os.path.join(ASSETS, "hair", style)
    mhclo = os.path.join(d, style + ".mhclo")
    diff = glob.glob(os.path.join(d, "*diffuse*.png")) or glob.glob(os.path.join(d, style + ".png"))
    return (mhclo if os.path.exists(mhclo) else None, diff[0] if diff else None)


def eyebrow_paths(idx="eyebrow006"):
    d = os.path.join(ASSETS, "eyebrows", idx)
    mhclo = os.path.join(d, idx + ".mhclo")
    diff = os.path.join(d, idx + ".png")
    return (mhclo if os.path.exists(mhclo) else None, diff if os.path.exists(diff) else None)


# ---- material builders (all plain Principled, GLB-export safe) ---------------
def _img(path, non_color=False, maxdim=1024):
    img = bpy.data.images.load(path, check_existing=True)
    if non_color:
        try:
            img.colorspace_settings.name = "Non-Color"
        except Exception:  # noqa: BLE001
            pass
    # Downscale so the WebP-embedded GLBs stay web-light (skin/garment 1K,
    # hair/brow 512). Keeps aspect; only shrinks oversized source textures.
    w, h = img.size
    if w > 0 and h > 0 and max(w, h) > maxdim:
        if w >= h:
            nw, nh = maxdim, max(1, round(h * maxdim / w))
        else:
            nw, nh = max(1, round(w * maxdim / h)), maxdim
        try:
            img.scale(nw, nh)
        except Exception:  # noqa: BLE001
            pass
    return img


def principled(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    return m, nt, bsdf


def _set(bsdf, key_options, val):
    for k in key_options:
        if k in bsdf.inputs:
            try:
                bsdf.inputs[k].default_value = val
                return
            except Exception:  # noqa: BLE001
                pass


def skin_material(name, diffuse_png, tint, roughness=0.48):
    m, nt, b = principled(name)
    _set(b, ("Roughness",), roughness)
    _set(b, ("Subsurface Weight", "Subsurface"), 0.12)
    if "Subsurface Radius" in b.inputs:
        try:
            b.inputs["Subsurface Radius"].default_value = (0.28, 0.12, 0.07)
        except Exception:  # noqa: BLE001
            pass
    _set(b, ("Specular IOR Level", "Specular"), 0.35)
    if diffuse_png and os.path.exists(diffuse_png):
        tex = nt.nodes.new("ShaderNodeTexImage")
        tex.image = _img(diffuse_png)
        tex.location = (-600, 300)
        if tint:
            mix = nt.nodes.new("ShaderNodeMixRGB")
            mix.blend_type = "MULTIPLY"
            mix.inputs["Fac"].default_value = 1.0
            mix.inputs["Color2"].default_value = (tint[0], tint[1], tint[2], 1.0)
            mix.location = (-300, 300)
            nt.links.new(tex.outputs["Color"], mix.inputs["Color1"])
            nt.links.new(mix.outputs["Color"], b.inputs["Base Color"])
        else:
            nt.links.new(tex.outputs["Color"], b.inputs["Base Color"])
    else:
        base = tint or (0.78, 0.60, 0.48)
        b.inputs["Base Color"].default_value = (base[0], base[1], base[2], 1.0)
    return m


def cloth_material(name, diffuse_png, normal_png, tint, roughness=0.7):
    """tint=None → keep real fabric diffuse; tint set → role colour + keep the
    fabric normal map so folds/weave still read."""
    m, nt, b = principled(name)
    _set(b, ("Roughness",), roughness)
    _set(b, ("Specular IOR Level", "Specular"), 0.25)
    if tint is None and diffuse_png and os.path.exists(diffuse_png):
        tex = nt.nodes.new("ShaderNodeTexImage")
        tex.image = _img(diffuse_png)
        tex.location = (-600, 300)
        nt.links.new(tex.outputs["Color"], b.inputs["Base Color"])
    else:
        c = tint or (0.5, 0.5, 0.5)
        b.inputs["Base Color"].default_value = (c[0], c[1], c[2], 1.0)
    if normal_png and os.path.exists(normal_png):
        ntex = nt.nodes.new("ShaderNodeTexImage")
        ntex.image = _img(normal_png, non_color=True)
        ntex.location = (-600, -100)
        nmap = nt.nodes.new("ShaderNodeNormalMap")
        nmap.location = (-300, -100)
        nmap.inputs["Strength"].default_value = 0.8
        nt.links.new(ntex.outputs["Color"], nmap.inputs["Color"])
        nt.links.new(nmap.outputs["Normal"], b.inputs["Normal"])
    return m


def alpha_material(name, diffuse_png, rgb=None, roughness=0.7):
    """Hair / eyebrow cards: diffuse colour (or tint) + texture alpha cutout."""
    m, nt, b = principled(name)
    _set(b, ("Roughness",), roughness)
    if diffuse_png and os.path.exists(diffuse_png):
        tex = nt.nodes.new("ShaderNodeTexImage")
        tex.image = _img(diffuse_png, maxdim=512)
        tex.location = (-600, 300)
        if rgb:
            mix = nt.nodes.new("ShaderNodeMixRGB")
            mix.blend_type = "MULTIPLY"
            mix.inputs["Fac"].default_value = 0.85
            mix.inputs["Color2"].default_value = (rgb[0], rgb[1], rgb[2], 1.0)
            mix.location = (-300, 300)
            nt.links.new(tex.outputs["Color"], mix.inputs["Color1"])
            nt.links.new(mix.outputs["Color"], b.inputs["Base Color"])
        else:
            nt.links.new(tex.outputs["Color"], b.inputs["Base Color"])
        if "Alpha" in b.inputs:
            nt.links.new(tex.outputs["Alpha"], b.inputs["Alpha"])
        try:
            m.blend_method = "HASHED"
            m.shadow_method = "HASHED"
        except Exception:  # noqa: BLE001
            pass
    elif rgb:
        b.inputs["Base Color"].default_value = (rgb[0], rgb[1], rgb[2], 1.0)
    return m


def replace_materials(obj, mat):
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    for p in obj.data.polygons:
        p.material_index = 0


# ---- build ------------------------------------------------------------------
def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block in (bpy.data.meshes, bpy.data.materials, bpy.data.armatures, bpy.data.images):
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

    # 1) photoreal skin diffuse on the body
    diff, tint = skin_diffuse(spec["eth"], spec["age"], spec["sex"])
    replace_materials(human, skin_material(name + "_skin", diff, tint))
    log(f"  skin: {os.path.basename(diff) if diff else 'flat'} tint={tint}")

    # 2) fitted, rigged garment mesh (parented under the armature, so track new
    #    objects rather than human.children).
    g_mhclo, g_diff, g_norm = garment_paths(spec["garment"])
    if g_mhclo:
        try:
            before = set(bpy.data.objects)
            HS.add_mhclo_asset(g_mhclo, human, asset_type="Clothes", subdiv_levels=0,
                               material_type="MAKESKIN", set_up_rigging=True,
                               interpolate_weights=True, import_subrig=False, import_weights=False)
            new = [o for o in bpy.data.objects if o not in before and o.type == "MESH"]
            if new:
                replace_materials(new[-1], cloth_material(name + "_cloth", g_diff, g_norm, spec["tint"]))
                log(f"  garment: {spec['garment']} -> {new[-1].name} tint={spec['tint']}")
            else:
                log("  garment: loaded but no new mesh found")
        except Exception as e:  # noqa: BLE001
            import traceback
            traceback.print_exc()
            log("  garment FAILED:", e)

    # 3) hair mesh
    h_style, h_color = spec["hair"]
    h_mhclo, h_diff = hair_paths(h_style)
    if h_mhclo:
        try:
            before = set(bpy.data.objects)
            HS.add_mhclo_asset(h_mhclo, human, asset_type="Hair", subdiv_levels=0,
                               material_type="MAKESKIN", set_up_rigging=True,
                               interpolate_weights=True, import_subrig=False, import_weights=False)
            new = [o for o in bpy.data.objects if o not in before and o.type == "MESH"]
            if new:
                replace_materials(new[-1], alpha_material(name + "_hair", h_diff, HAIR_RGB[h_color]))
                log(f"  hair: {h_style} ({h_color})")
        except Exception as e:  # noqa: BLE001
            log("  hair FAILED:", e)

    # 4) eyebrows (alpha cards) — big realism cue on the face
    eb_mhclo, eb_diff = eyebrow_paths()
    if eb_mhclo:
        try:
            before = set(bpy.data.objects)
            HS.add_mhclo_asset(eb_mhclo, human, asset_type="Eyebrows", subdiv_levels=0,
                               material_type="MAKESKIN", set_up_rigging=False,
                               interpolate_weights=False, import_subrig=False, import_weights=False)
            new = [o for o in bpy.data.objects if o not in before and o.type == "MESH"]
            if new:
                replace_materials(new[-1], alpha_material(name + "_brow", eb_diff, HAIR_RGB[h_color]))
                log("  eyebrows applied")
        except Exception as e:  # noqa: BLE001
            log("  eyebrows FAILED:", e)

    # export everything (body + rig + clothes + hair + brows) to one GLB
    out = os.path.join(LIB_DIR, name + ".glb")
    os.makedirs(LIB_DIR, exist_ok=True)
    bpy.ops.object.select_all(action="SELECT")
    export_kwargs = dict(filepath=out, export_format="GLB", use_selection=True,
                         export_apply=True, export_yup=True)
    # WebP-embed textures (EXT_texture_webp; three.js GLTFLoader supports it) to
    # keep the deployed cast web-light. Fall back to default PNG if unsupported.
    try:
        bpy.ops.export_scene.gltf(image_format="WEBP", export_image_quality=82, **export_kwargs)
    except TypeError:
        try:
            bpy.ops.export_scene.gltf(export_image_format="WEBP", export_image_quality=82, **export_kwargs)
        except Exception:  # noqa: BLE001
            bpy.ops.export_scene.gltf(**export_kwargs)
    log(f"  -> {name}.glb ({os.path.getsize(out)//1024} KB)")


def main():
    only = None
    if "--" in sys.argv:
        extra = sys.argv[sys.argv.index("--") + 1:]
        if "--only" in extra:
            only = set(extra[extra.index("--only") + 1].split(","))
    if not os.path.isdir(ASSETS):
        log(f"ASSETS not found: {ASSETS} (run scripts/fetch-makehuman-assets.ps1)")
        return
    names = [n for n in CAST if (only is None or n in only)]
    log(f"generating {len(names)} archetype(s) into {LIB_DIR}; assets={ASSETS}")
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
