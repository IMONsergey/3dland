import bpy, math, os, mathutils
from math import pi, sin, cos
from mathutils import Vector
from collections import defaultdict

ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..'))
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def material(name, rgb, metallic=.4, roughness=.52, image=None, roughmap=None, emissive=None):
    m=bpy.data.materials.new(name)
    m.use_nodes=True
    principled=m.node_tree.nodes.get("Principled BSDF")
    principled.inputs['Base Color'].default_value=(*rgb,1)
    principled.inputs['Metallic'].default_value=metallic
    principled.inputs['Roughness'].default_value=roughness
    if image:
        node=m.node_tree.nodes.new('ShaderNodeTexImage')
        node.image=bpy.data.images.load(os.path.join(ROOT,'public/pbr',image),check_existing=True)
        node.interpolation='Linear'
        m.node_tree.links.new(node.outputs['Color'],principled.inputs['Base Color'])
    if roughmap:
        rn=m.node_tree.nodes.new('ShaderNodeTexImage')
        rn.image=bpy.data.images.load(os.path.join(ROOT,'public/pbr',roughmap),check_existing=True)
        rn.image.colorspace_settings.name='Non-Color'
        m.node_tree.links.new(rn.outputs['Color'],principled.inputs['Roughness'])
    if emissive:
        principled.inputs['Emission Color'].default_value=(*emissive,1)
        principled.inputs['Emission Strength'].default_value=1.5
    return m

m_shell=material('K/01 — weathered graphite steel',(.20,.33,.30),.64,.55,
                 'k_weathered_steel_1k.jpg','rusty_painted_metal_rough_1k.jpg')
m_beam=material('K/02 — zinc plated structural steel',(.30,.40,.38),.67,.43)
m_dark=material('K/03 — dark industrial machine paint',(.09,.13,.12),.55,.51)
m_bolt=material('K/04 — bright machined fittings',(.52,.58,.56),.83,.33)
m_mesh=material('K/05 — service decking',(.25,.32,.30),.51,.64)
m_energy=material('K/06 — cyber immunity internal mint',(.012,.55,.37),.1,.4,emissive=(.06,.76,.58))
m_pipe=material('K/07 — refractory heatshield',(.38,.42,.41),.71,.49)

def assign(obj,mat):
    obj.data.materials.clear();obj.data.materials.append(mat)
    for poly in obj.data.polygons:poly.use_smooth=True
    return obj

def cylindrical(name,loc,radius,depth,mat,vertices=24,side_only=False):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc)
    o=bpy.context.object;o.name=name;assign(o,mat)
    if not side_only:
        mod=o.modifiers.new('machined edge', 'BEVEL');mod.width=min(.038,radius*.13);mod.segments=2
        mod2=o.modifiers.new('Weighted normals','WEIGHTED_NORMAL');mod2.keep_sharp=True
    return o

def cuboid(name,loc,size,mat,bevel=.0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc)
    o=bpy.context.object;o.name=name
    o.dimensions=size;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    assign(o,mat)
    if bevel:
        mod=o.modifiers.new('edge radii','BEVEL');mod.width=bevel;mod.segments=2
        mod2=o.modifiers.new('weighted normals','WEIGHTED_NORMAL')
    return o

def bar(name,a,b,r,mat,vertices=12):
    aa,bb=Vector(a),Vector(b); direction=bb-aa
    mid=(aa+bb)*.5
    o=cylindrical(name,mid,r,direction.length,mat,vertices,side_only=True)
    o.rotation_euler=direction.to_track_quat('Z','Y').to_euler()
    return o

def ring(name,r,z,minor,mat,center=(.2,0),segments=72):
    bpy.ops.mesh.primitive_torus_add(major_segments=segments,minor_segments=10,
       location=(center[0],center[1],z),major_radius=r,minor_radius=minor)
    o=bpy.context.object;o.name=name;return assign(o,mat)

def pipepath(name,coords,rad,mat):
    curve=bpy.data.curves.new(name,'CURVE');curve.dimensions='3D';curve.resolution_u=12;curve.bevel_resolution=4
    curve.bevel_depth=rad
    spline=curve.splines.new('POLY');spline.points.add(len(coords)-1)
    for p,xyz in zip(spline.points,coords):p.co=(*xyz,1)
    ob=bpy.data.objects.new(name,curve);bpy.context.collection.objects.link(ob)
    ob.data.materials.append(mat)
    bpy.context.view_layer.objects.active=ob;ob.select_set(True)
    bpy.ops.object.convert(target='MESH');ob.select_set(False)
    return ob

def lathe(name,profile,segments=64,mat=m_shell):
    verts=[];faces=[];uvs=[]
    for j,(r,z) in enumerate(profile):
        for i in range(segments+1):
            angle=i*2*pi/segments
            verts.append((.2+cos(angle)*r,sin(angle)*r,z))
    for j in range(len(profile)-1):
        for i in range(segments):
            a=j*(segments+1)+i;b=a+1;c=a+(segments+1);d=c+1
            faces.append((a,c,d,b))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    ob=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(ob);assign(ob,mat)
    uv=mesh.uv_layers.new(name='Primary UV')
    k=0
    for poly in mesh.polygons:
        j=poly.index//segments
        i=poly.index%segments
        quad=[(i/segments,j/(len(profile)-1)),(i/segments,(j+1)/(len(profile)-1)),((i+1)/segments,(j+1)/(len(profile)-1)),((i+1)/segments,j/(len(profile)-1))]
        for li,coord in zip(poly.loop_indices,quad):uv.data[li].uv=coord
    return ob

# Blast furnace vessel: custom UV'd tapered profile at real factory cutaway scale.
profile=[(1.10,.15),(1.38,.38),(1.43,.7),(1.49,1.18),(1.43,1.7),
         (1.32,2.22),(1.24,2.78),(1.34,3.15),(1.38,3.65),
         (1.23,4.25),(1.10,4.75),(.88,5.22),(.70,5.60),(.58,5.95)]
lathe('Blast furnace / continuous weathered vessel',profile)
for height,r in [(.45,1.40),(1.2,1.50),(2.28,1.34),(3.15,1.41),(4.12,1.25),(5.08,.96)]:
    ring('Vessel welded flange',r,height,.052,m_beam)
    for i in range(32):
        a=i*pi*2/32
        # Hex head fasteners project beyond flange
        cylindrical('Radial bolted fastener',(.2+cos(a)*(r+.035),sin(a)*(r+.035),height),.038,.09,m_bolt,vertices=6,side_only=True)

# Thermal bustle pipe and hot blast feed.
ring('Concentric internal mint light slit',1.24,2.56,.025,m_energy)
ring('Mint under-rim lighting',.98,5.32,.025,m_energy)
for i in range(8):
    a=i*pi/4
    start=(.2+1.29*cos(a),1.29*sin(a),2.57)
    end=(.2+1.74*cos(a),1.74*sin(a),2.15)
    pipepath('Blast bustle downcomer',[start,end],.095,m_pipe)
    ring('Elbow union ring',1.77,2.15,.01,m_bolt) if i==0 else None

# Outer columns and platform: no toy cantilever slabs, use structural lattice.
post_positions=[(-1.9,-1.85),(2.35,-1.85),(2.35,1.90),(-1.9,1.90)]
for x,y in post_positions:
    bar('Primary furnace support', (x,y,.12),(x,y,6.18),.085,m_beam,20)
    cylindrical('Footing plate',(x,y,.14),.21,.18,m_dark,16)
for h in (1.35,2.73,4.15,5.62):
    for (x1,y1),(x2,y2) in zip(post_positions,post_positions[1:]+post_positions[:1]):
        bar('Catwalk perimeter crossbar',(x1,y1,h),(x2,y2,h),.058,m_beam)
for (x1,y1),(x2,y2) in zip(post_positions,post_positions[1:]+post_positions[:1]):
    for h in (1.35,4.15):
        bar('X brace A',(x1,y1,h),(x2,y2,h+1.38),.037,m_beam)
        bar('X brace B',(x2,y2,h),(x1,y1,h+1.38),.037,m_beam)

# Multi-level services decks around vessel with handrails, actual walkway cutaway.
for h in (2.7,4.14,5.60):
    for x1,y1,x2,y2 in [
        (-1.94,-1.94,2.39,-1.94),
        (-1.94,1.94,2.39,1.94),
        (-1.94,-1.94,-1.94,1.94),
        (2.39,-1.94,2.39,1.94)
    ]:
        aa=Vector((x1,y1,h));bb=Vector((x2,y2,h))
        v=bb-aa;mid=(aa+bb)*.5
        dims=(v.length+.07,.43,.072) if abs(v.x)>abs(v.y) else (.43,v.length+.07,.072)
        cuboid('Open industrial service deck',(mid.x,mid.y,h),dims,m_mesh,.018)
        for side in (-1,1):
            xx,yy=(x1,y1),(x2,y2)
            if abs(v.x)>abs(v.y):
                y=y1+side*.21
                for xx in (min(x1,x2),max(x1,x2)):
                    bar('Guardrail stanchion',(xx,y,h+.02),(xx,y,h+.84),.021,m_beam)
                bar('Guardrail top',(x1,y,h+.82),(x2,y,h+.82),.022,m_beam)
                bar('Guardrail mid',(x1,y,h+.42),(x2,y,h+.42),.015,m_beam)
            else:
                x=x1+side*.21
                for yy in (min(y1,y2),max(y1,y2)):
                    bar('Guardrail stanchion',(x,yy,h+.02),(x,yy,h+.84),.021,m_beam)
                bar('Guardrail top',(x,y1,h+.82),(x,y2,h+.82),.022,m_beam)
                bar('Guardrail mid',(x,y1,h+.42),(x,y2,h+.42),.015,m_beam)
# Metal grate panel streaks on decks, sparse, not visual noise.
for h in (2.7,4.14,5.60):
    for i in range(14):
        x=-1.68+i*.27
        bar('Deck anti-slip grating',(x,-2.10,h+.045),(x,-1.77,h+.045),.011,m_dark,6)
        bar('Deck anti-slip grating',(x, 1.77,h+.045),(x, 2.10,h+.045),.011,m_dark,6)

# Actual ladders and access cages across vessel.
for x,y in ((-2.21,1.53),(2.65,-1.58)):
    for z in (.35,3.06):
        end=min(z+2.35,5.95)
        bar('Maintenance ladder stringer',(x-.17,y,z),(x-.17,y,end),.026,m_bolt)
        bar('Maintenance ladder stringer',(x+.17,y,z),(x+.17,y,end),.026,m_bolt)
        for n in range(int((end-z)/.22)):
            h=z+.15+n*.22
            bar('Maintenance ladder rung',(x-.17,y,h),(x+.17,y,h),.019,m_bolt)

# Extraction chimney, filters, thermal lines and catwalk over hot gases.
for i,(x,y,r,zTop) in enumerate([(-1.18,-.90,.37,6.35),(1.62,-.83,.29,6.1)]):
    cylindrical('Flue stack sleeve',(x,y,zTop/2),r,zTop,m_dark,32,side_only=True)
    for h in (1.2,2.8,4.6,zTop-.36):
        ring('Flue service collar',r+.04,h,.035,m_beam,center=(x,y))
    cylindrical('Stack cap',(x,y,zTop+.04),r+.11,.11,m_bolt,32)
    pipepath('Flue gas duct',[(-.15,0,4.65),(x,y,4.65),(x,y,5.3)],.18,m_pipe)

# Dust separators, valves and extraction mechanism.
for i in range(3):
    x=-1.23+i*.95
    cylindrical('Dust filter vessel',(x,2.6,1.13),.33,2.15,m_dark,24)
    cylindrical('Filter crown',(x,2.6,2.24),.39,.12,m_bolt,24)
    bar('Pressure inlet',(x,2.27,.95),(x,1.87,.95),.10,m_pipe)
    for h in (.45,1.77):
        ring('Access coupling',.34,h,.024,m_beam,center=(x,2.6))
    for y in (2.5,2.7):
        cuboid('Filtration skid',(x,y,.18),(.46,.16,.36),m_beam,.025)

# Central bridge through furnace complex.
cuboid('Main cable catwalk',(0,-2.42,4.88),(4.75,.64,.19),m_dark,.025)
for x in [-2.15,-1.15,-.15,.85,1.85]:
    bar('Catwalk catenary support',(x,-2.42,4.92),(x,-2.42,5.79),.031,m_beam)
    cuboid('Inspection hatch',(x,-2.42,4.96),(.44,.33,.03),m_mesh,.005)
bar('Catwalk safety rail',(-2.4,-2.42,5.80),(2.33,-2.42,5.80),.027,m_beam)

# Detail: 24 insulation clamps and short diagnostic valves.
for i in range(24):
    a=2*pi*i/24
    r=1.49
    x=.2+cos(a)*r;y=sin(a)*r
    bar('Insulation saddle',(x,y,1.55),(x,y,1.84),.033,m_bolt,9)
for x,y in [(.2+1.47,0),(.2-1.47,0),(.2,1.47),(.2,-1.47)]:
    pipepath('Feed measuring probe',[(x,y,1.88),(x*1.3,y*1.3,1.88)],.027,m_beam)

# Apply modifiers, join into draw-call-efficient meshes by one material.
bpy.ops.object.select_all(action='DESELECT')
mesh_objects=[o for o in bpy.context.scene.objects if o.type=='MESH']
for obj in mesh_objects:
    bpy.context.view_layer.objects.active=obj
    for mod in list(obj.modifiers):
        try:bpy.ops.object.modifier_apply(modifier=mod.name)
        except:pass

groups=defaultdict(list)
for ob in [o for o in bpy.context.scene.objects if o.type=='MESH']:
    key=ob.data.materials[0].name if len(ob.data.materials) else 'NO MAT'
    groups[key].append(ob)
for key,items in groups.items():
    bpy.ops.object.select_all(action='DESELECT')
    for ob in items:ob.select_set(True)
    bpy.context.view_layer.objects.active=items[0]
    if len(items)>1:bpy.ops.object.join()
    items[0].name='Furnace — '+key
    items[0].select_set(False)

# Export only meshes. Three.js (R3F) positions the authored asset in the site.
out=os.path.join(ROOT,'public/models','k-furnace-authored.glb')
bpy.ops.export_scene.gltf(filepath=out,export_format='GLB',use_selection=False,
    export_apply=True,export_materials='EXPORT',export_normals=True,export_texcoords=True)
print('OUTPUT:',out,'BYTES',os.path.getsize(out),'MESHES',len([o for o in bpy.context.scene.objects if o.type=='MESH']))
