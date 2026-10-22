import { Suspense, Component, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import type { Era, NodeId } from '../data/atlas'

// Real-world scale authored GLBs. These are presented as production visualization,
// not certified CAD. See docs/ASSET_PROVENANCE.md for CC0 URLs and scope.
const base=import.meta.env.BASE_URL

const models={
  forklift:base+'models/forklift.glb',
  wheelLoader:base+'models/wheel-loader.glb',
  telehandler:base+'models/telehandler.glb',
}
const robotUrl='https://assets.stoicsoft.com/1designtool/3d/models/industrial-robot-arm/cd1566d1a2/model.glb'

class AssetBoundary extends Component<{children:ReactNode},{failed:boolean}>{
 state={failed:false}
 static getDerivedStateFromError(){return {failed:true}}
 componentDidCatch(error:Error){console.warn('Optional industrial model unavailable:',error.message)}
 render(){return this.state.failed?null:this.props.children}
}

function configureMesh(o:THREE.Object3D){
 o.traverse(node=>{
   if(!(node instanceof THREE.Mesh))return
   node.castShadow=true
   node.receiveShadow=true
   const materials=Array.isArray(node.material)?node.material:[node.material]
   const cloned=materials.map(mat=>{
     if(!(mat instanceof THREE.MeshStandardMaterial))return mat
     const out=mat.clone()
     out.metalness=Math.max(.18,Math.min(.85,out.metalness))
     out.roughness=Math.max(.38,Math.min(.92,out.roughness))
     return out
   })
   node.material=Array.isArray(node.material)?cloned:cloned[0]
 })
}

function AuthoredVehicle({url,position,scale,rotation=0,movement=false,onSelect}:{
 url:string;position:[number,number,number];scale:number;rotation?:number;
 movement?:boolean;onSelect:()=>void
}){
 const {scene}=useGLTF(url)
 const group=useRef<THREE.Group>(null)
 const model=useMemo(()=>{
   const object=scene.clone(true)
   configureMesh(object)
   const box=new THREE.Box3().setFromObject(object)
   const center=box.getCenter(new THREE.Vector3())
   object.position.set(-center.x,-box.min.y,-center.z)
   return object
 },[scene])
 useFrame(({clock})=>{
   if(group.current&&movement)group.current.position.x=position[0]+Math.sin(clock.elapsedTime*.23)*.55
 })
 return <group ref={group} position={position} rotation={[0,rotation,0]} scale={scale}
   onClick={event=>{event.stopPropagation();onSelect()}}>
   <primitive object={model}/>
 </group>
}

function AnimatedRobot({position,scale=1.08,onSelect}:{
 position:[number,number,number];scale?:number;onSelect:()=>void
}){
 const robot=useGLTF(robotUrl)
 const group=useRef<THREE.Group>(null)
 const cloned=useMemo(()=>{
   const scene=robot.scene.clone(true)
   configureMesh(scene)
   scene.traverse(n=>{
     if(!(n instanceof THREE.Mesh))return
     const mats=Array.isArray(n.material)?n.material:[n.material]
     mats.forEach(mat=>{
       if(!(mat instanceof THREE.MeshStandardMaterial))return
       const {r,g,b}=mat.color
       if(r>g*1.30&&r>b*1.45){
         mat.color.set('#3d6862')
         mat.metalness=.52
         mat.roughness=.43
       }
     })
   })
   return scene
 },[robot.scene])
 const {actions}=useAnimations(robot.animations,group)
 useEffect(()=>{
   for(const action of Object.values(actions)){
     if(action){action.reset().setLoop(THREE.LoopRepeat,Infinity).play()}
   }
   return ()=>{for(const action of Object.values(actions)){action?.stop()}}
 },[actions])
 return <group ref={group} position={position} scale={scale} onClick={e=>{e.stopPropagation();onSelect()}}>
  <primitive object={cloned}/>
 </group>
}

function AuthoredBlastFurnace({onSelect}:{onSelect:()=>void}){
 const gltf=useGLTF(base+'models/k-furnace-authored.glb')
 const object=useMemo(()=>{
   const item=gltf.scene.clone(true)
   item.traverse(node=>{
     if(!(node instanceof THREE.Mesh))return
     node.castShadow=true
     node.receiveShadow=true
   })
   return item
 },[gltf.scene])
 return <group position={[2.25,.16,-3.70]} onClick={event=>{event.stopPropagation();onSelect()}}>
   <primitive object={object}/>
 </group>
}

function TexturedFactoryFloor(){
 const textures=useTexture([
  base+'pbr/k_concrete_cold_1k.jpg',
  base+'pbr/concrete_floor_nor_gl_1k.jpg',
  base+'pbr/concrete_floor_rough_1k.jpg'
 ])
 const [diffuse,normal,roughness]=textures
 useMemo(()=>{
   for(const tex of textures){
     tex.wrapS=THREE.RepeatWrapping;tex.wrapT=THREE.RepeatWrapping
     tex.repeat.set(7,5);tex.anisotropy=4;tex.needsUpdate=true
   }
   diffuse.colorSpace=THREE.SRGBColorSpace
 },[textures,diffuse])
 return <mesh position={[0,.112,0]} rotation={[-Math.PI/2,0,0]} receiveShadow>
   <planeGeometry args={[22,17]}/>
   <meshStandardMaterial color="#98aba7" map={diffuse} normalMap={normal}
     normalScale={new THREE.Vector2(.20,.20)} roughnessMap={roughness}
     metalness={.02} roughness={.97}/>
 </mesh>
}

function WeatheredIndustrialSurfaces(){
 const [roof,roofNormal,roofRough]=useTexture([
   base+'pbr/corrugated_iron_diff_1k.jpg',
   base+'pbr/corrugated_iron_nor_gl_1k.jpg',
   base+'pbr/corrugated_iron_rough_1k.jpg',
 ])
 useMemo(()=>{
   for(const tex of [roof,roofNormal,roofRough]){
     tex.wrapS=THREE.RepeatWrapping;tex.wrapT=THREE.RepeatWrapping
     tex.repeat.set(3.6,2.4);tex.anisotropy=4;tex.needsUpdate=true
   }
   roof.colorSpace=THREE.SRGBColorSpace
 },[roof,roofNormal,roofRough])
 return <group>

   <mesh position={[-3.95,2.918,-2.20]} rotation={[-Math.PI/2,0,0]} receiveShadow>
     <planeGeometry args={[5.73,3.97]}/>
     <meshStandardMaterial map={roof} normalMap={roofNormal} roughnessMap={roofRough}
       normalScale={new THREE.Vector2(.26,.26)} color="#aabcb7" metalness={.47} roughness={.75}/>
   </mesh>
   <mesh position={[5.95,2.893,2.45]} rotation={[-Math.PI/2,0,0]} receiveShadow>
     <planeGeometry args={[5.95,3.77]}/>
     <meshStandardMaterial map={roof} normalMap={roofNormal} roughnessMap={roofRough}
       normalScale={new THREE.Vector2(.30,.30)} color="#9aafa9" metalness={.5} roughness={.69}/>
   </mesh>
 </group>
}

export function AuthenticIndustrialLayer({year,onSelect}:{year:Era;onSelect:(id:NodeId)=>void}){
const desktop=typeof window==='undefined'||window.innerWidth>900
 return <group>
   <AssetBoundary><Suspense fallback={null}><AuthoredBlastFurnace onSelect={()=>onSelect('furnace')}/></Suspense></AssetBoundary>
   <AssetBoundary><Suspense fallback={null}><TexturedFactoryFloor/></Suspense></AssetBoundary>
   <AssetBoundary><Suspense fallback={null}><WeatheredIndustrialSurfaces/></Suspense></AssetBoundary>
   <AssetBoundary><Suspense fallback={null}>
     <AuthoredVehicle url={models.forklift} position={[4.35,.22,5.67]} scale={1.05}
       rotation={-.12} movement={year>=2035} onSelect={()=>onSelect('logistics')}/>
   </Suspense></AssetBoundary>
   {desktop&&<AssetBoundary><Suspense fallback={null}>
     <AuthoredVehicle url={models.wheelLoader} position={[8.16,.20,-6.15]} scale={.46}
       rotation={1.65} onSelect={()=>onSelect('storage')}/>
   </Suspense></AssetBoundary>}
   {desktop&&year>=2035&&<AssetBoundary><Suspense fallback={null}>
     <AuthoredVehicle url={models.telehandler} position={[-8.35,.22,-.72]} scale={.46}
       rotation={1.1} onSelect={()=>onSelect('maintenance')}/>
   </Suspense></AssetBoundary>}
   {desktop&&<AssetBoundary><Suspense fallback={null}>
     <AnimatedRobot position={[-3.85,.40,3.0]} scale={1.06} onSelect={()=>onSelect('robotics')}/>
   </Suspense></AssetBoundary>}
   {desktop&&year>=2035&&<AssetBoundary><Suspense fallback={null}>
     <AnimatedRobot position={[-1.15,.40,3.0]} scale={1.06} onSelect={()=>onSelect('robotics')}/>
   </Suspense></AssetBoundary>}
 </group>
}
