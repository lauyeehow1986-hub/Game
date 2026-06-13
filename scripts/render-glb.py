"""render-glb.py — import a GLB and render a framed portrait PNG for QA.
    blender --background --python scripts/render-glb.py -- <in.glb> <out.png>
"""
import bpy, sys, os, math

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
src = argv[0]
out = argv[1] if len(argv) > 1 else os.path.splitext(src)[0] + ".png"

# clean scene
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

bpy.ops.import_scene.gltf(filepath=src)

# bounds of all mesh objects
mins = [1e9, 1e9, 1e9]; maxs = [-1e9, -1e9, -1e9]
nmesh = 0
for o in bpy.data.objects:
    if o.type == "MESH":
        nmesh += 1
        for c in o.bound_box:
            w = o.matrix_world @ __import__("mathutils").Vector(c)
            for i in range(3):
                mins[i] = min(mins[i], w[i]); maxs[i] = max(maxs[i], w[i])
print(f"[render] meshes={nmesh} bounds min={mins} max={maxs}")

import mathutils
Vec = mathutils.Vector
# longest axis = the figure's "up" (standing height); frame the upper portion.
dims = [maxs[i] - mins[i] for i in range(3)]
up_axis = dims.index(max(dims))
center = Vec([(mins[i] + maxs[i]) / 2 for i in range(3)])
radius = 0.5 * math.sqrt(sum(d * d for d in dims))
# PORTRAIT mode frames head+shoulders; FULL frames the whole figure.
mode = os.environ.get("RENDER_MODE", "portrait")
horiz = [i for i in range(3) if i != up_axis]
# Facing axis is unreliable from the bbox; default to the convention (faces the
# Y axis when Z is up) and allow env overrides while probing the true front.
depth_axis = int(os.environ.get("DEPTH_AXIS", horiz[1] if up_axis == 2 else horiz[0]))
side_axis = [i for i in horiz if i != depth_axis][0]
front_sign = float(os.environ.get("FRONT_SIGN", "-1"))
H = dims[up_axis]

target = center.copy()
if mode == "portrait":
    target[up_axis] = mins[up_axis] + H * 0.86   # head/shoulders
    frame_radius = H * 0.16
else:
    target[up_axis] = mins[up_axis] + H * 0.52
    frame_radius = H * 0.58

# 3/4 front: dominant along the facing axis, slight side offset + downward look
dirv = Vec((0.0, 0.0, 0.0))
dirv[depth_axis] = front_sign
dirv[side_axis] = 0.32
dirv[up_axis] = 0.10
dirv.normalize()

cam_data = bpy.data.cameras.new("Cam"); cam = bpy.data.objects.new("Cam", cam_data)
bpy.context.scene.collection.objects.link(cam)
cam_data.lens = 95
fov = 2 * math.atan(18.0 / cam_data.lens)
dist = frame_radius / math.sin(fov / 2)
cam.location = target + dirv * dist
direction = target - cam.location
cam.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
bpy.context.scene.camera = cam
print(f"[render] mode={mode} up={up_axis} depth={depth_axis} target={list(target)} dist={dist:.2f}")

def frame_vec(d, s, u):
    v = Vec((0.0, 0.0, 0.0))
    v[depth_axis] = d; v[side_axis] = s; v[up_axis] = u
    return v

def add_light(name, h0, h1, u, energy, size=2.0):
    ld = bpy.data.lights.new(name, type="AREA"); ld.energy = energy; ld.size = size
    lo = bpy.data.objects.new(name, ld)
    lo.location = target + frame_vec(h0, h1, u) * radius
    bpy.context.scene.collection.objects.link(lo)
    d = target - lo.location
    lo.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    return lo

# key/fill/rim in the (depth, side, up) frame — all on the camera-facing side
add_light("key",  -1.4, -1.2, 1.0, 700, 2.0)
add_light("fill", -0.9,  1.4, 0.3, 260, 2.5)
add_light("rim",   1.5,  0.4, 1.2, 450, 1.8)

# soft world
world = bpy.data.worlds.new("W"); bpy.context.scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.05, 0.06, 0.08, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 0.6

sc = bpy.context.scene
for eng in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE", "CYCLES"):
    try:
        sc.render.engine = eng
        break
    except (TypeError, Exception):
        continue
print(f"[render] engine={sc.render.engine}")
sc.render.resolution_x = 720; sc.render.resolution_y = 900
sc.render.film_transparent = False
try:
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Medium High Contrast"
except Exception:
    pass
sc.render.filepath = out
bpy.ops.render.render(write_still=True)
print(f"[render] wrote {out}")
