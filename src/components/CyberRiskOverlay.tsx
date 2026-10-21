import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { nodeById, type NodeId } from '../data/atlas'
import { research } from '../data/research'

type Point = [number,number,number]

function CyberConnection({from,to,index}:{from:Point;to:Point;index:number}){
 const dot=useRef<THREE.Mesh>(null)
 const halo=useRef<THREE.Mesh>(null)
 const curve=useMemo(()=>{
  const a=new THREE.Vector3(...from)
  const b=new THREE.Vector3(...to)
  const c=new THREE.Vector3((a.x+b.x)/2,Math.max(a.y,b.y)+2.5+(index*.6),(a.z+b.z)/2)
  return new THREE.QuadraticBezierCurve3(a,c,b)
 },[from.join(),to.join(),index])
 const points=useMemo(()=>curve.getPoints(48),[curve])
 useFrame(({clock})=>{
  const t=(clock.elapsedTime*.16 +index/3)%1
  dot.current?.position.copy(curve.getPoint(t))
  if(halo.current){
    halo.current.scale.setScalar(1+Math.sin(clock.elapsedTime*2+index)*.28)
    const m=halo.current.material as THREE.MeshBasicMaterial
    m.opacity=.14+Math.sin(clock.elapsedTime*2.4+index)*.08
  }
 })
 return <group>
   <Line points={points} lineWidth={2} color="#ffb46f" transparent opacity={.76}/>
   <Line points={points} lineWidth={.7} color="#ffe5bc" transparent opacity={.68}/>
   <mesh ref={dot}><sphereGeometry args={[.095,9,8]}/><meshBasicMaterial color="#ffd6ac" toneMapped={false}/></mesh>
   <mesh ref={halo} position={to}>
     <sphereGeometry args={[.47,16,12]}/>
     <meshBasicMaterial color="#ff9b5c" transparent opacity={.18} depthWrite={false} side={THREE.DoubleSide}/>
   </mesh>
   <mesh position={to} rotation={[-Math.PI/2,0,0]}>
     <ringGeometry args={[.35,.39,48]}/>
     <meshBasicMaterial color="#ffb979" side={THREE.DoubleSide} transparent opacity={.7}/>
   </mesh>
   <mesh position={to}><sphereGeometry args={[.11,12,10]}/><meshBasicMaterial color="#ffc48c" toneMapped={false}/></mesh>
 </group>
}
export function CyberRiskOverlay({selected,active}:{selected:NodeId|null;active:boolean}){
 if(!selected||!active)return null
 const related=research[selected].related
 const from=nodeById[selected].coordinates
 return <group>
   {related.map((id,index)=><CyberConnection key={id} index={index} from={from} to={nodeById[id].coordinates}/>)}
   <pointLight color="#efac72" intensity={16} distance={5} position={from}/>
   <mesh position={from} rotation={[-Math.PI/2,0,0]}>
     <ringGeometry args={[.57,.62,64]}/>
     <meshBasicMaterial color="#ffbc7a" side={THREE.DoubleSide} opacity={.75} transparent/>
   </mesh>
 </group>
}
