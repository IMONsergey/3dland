# Third-party 3D and PBR asset provenance

Purpose: avoid ungrounded provenance or bundling assets that cannot legally be redistributed.

## Authored factory

- public/models/k-furnace-authored.glb — original Blender 4.5 script-generated industrial blast-furnace superstructure and geometry. Source: scripts/create-furnace-blender.py.
- Meshes: tapered industrial vessel, rings, welded flanges, bolts, maintenance walkways, guardrails, structural support lattice, access ladders, stack and flue, filter vessels, safety machine components. Exported as GLB with authored PBR.
- This is a concept representation, not an engineering-grade CAD reconstruction.
- Blender 4.5 LTS is installed on the authorized Mac. The asset is reproducibly generated with:
  /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup --python scripts/create-furnace-blender.py

## Innerscene — CC0 reusable GLB components

Downloaded through public catalogue's direct asset URLs; individual URLs:
- **Electric Counterbalance Forklift**: https://www.innerscene.com/api/library/electric-counterbalance-forklift-7acc0547/download → public/models/forklift.glb
- **Wheel Loader**: https://www.innerscene.com/api/library/wheel-loader-da80dfd2/download → public/models/wheel-loader.glb
- **Telescopic Handler**: https://www.innerscene.com/api/library/telescopic-handler-40a550aa/download → public/models/telehandler.glb

Catalogue pages list CC0 use. Verify the current licence metadata prior to wider commercial reuse. Some models are high-poly and not suitable for every mobile device.

## Poly Haven — CC0 PBR sets

- https://polyhaven.com/a/rusty_painted_metal
- https://polyhaven.com/a/concrete_floor
- https://polyhaven.com/a/corrugated_iron

Downloaded the 1k jpg **diff / normal GL / roughness** channels into public/pbr. Cool factory-grade colour maps k_concrete_cold_1k.jpg and k_weathered_steel_1k.jpg are derived edits of those CC0 texture sets. No intellectual property claim on the Poly Haven originals.

## External robotic arm, embedded, not redistributed

- https://1designtool.com/3d/models/industrial-robot-arm
- Embedded external file URL: https://assets.stoicsoft.com/1designtool/3d/models/industrial-robot-arm/cd1566d1a2/model.glb

Provider permits supported website use but restricts standalone raw model redistribution; the model is loaded by URL at runtime rather than committed in public/models. Playback uses any available embedded clips. If network / provider unavailable, 3D arm falls back to the rest of the scene. For production, replace with a licensed self-hosted robot asset.

## What is *not* included

- Proprietary Kaspersky fonts, private normative brandbook and raw licensed photographic archives.
- CAD representations of a real metallurgy plant.
- Unverified copies of competitor promotional designs.

## Size/performance

- Forklift GLB: ~0.7 MB
- Wheel loader GLB: ~6.3 MB
- Telehandler GLB: ~8.4 MB
- Authored furnace GLB: ~2.4 MB
- PBR jpgs: ~6.7 MB
- High-poly loader/telehandler and network robot are **desktop only**. Core furnace and forklift remain available mobile.
- On slower GPUs, use WebGL fallback, reduced texture quality or model LOD.
