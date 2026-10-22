import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Era, NodeId } from '../data/atlas'

type XYZ = [number,number,number]
const palette = {
  frame:'#657e83', bright:'#a1b5aa', dark:'#25404a', roof:'#385862',
  turquoise:'#8ce2c9', amber:'#efab60', orange:'#ff8f42',
  concrete:'#34444b', electric:'#86d4de', black:'#102b33'
}
const materials = {
  iron: new THREE.MeshStandardMaterial({color:palette.frame, metalness:.68,roughness:.4}),
  light: new THREE.MeshStandardMaterial({color:palette.bright,metalness:.65,roughness:.37}),
  rust: new THREE.MeshStandardMaterial({color:'#886650',metalness:.45,roughness:.78}),
  concrete:new THREE.MeshStandardMaterial({color:palette.concrete,metalness:.18,roughness:.88}),
  dark:new THREE.MeshStandardMaterial({color:palette.dark,metalness:.62,roughness:.44}),
  yellow:new THREE.MeshStandardMaterial({color:palette.amber,metalness:.34,roughness:.6}),
  green:new THREE.MeshStandardMaterial({color:palette.turquoise,metalness:.5,roughness:.32,emissive:'#40ad91',emissiveIntensity:.25}),
  molten:new THREE.MeshBasicMaterial({color:'#ff9b43',toneMapped:false}),
  glass:new THREE.MeshStandardMaterial({color:'#52959a',metalness:.15,transparent:true,opacity:.48,roughness:.18})
}
function Box({p,s,mat='iron',rotation}: {p:XYZ;s:XYZ;mat?:keyof typeof materials;rotation?:XYZ}){
  return <mesh position={p} rotation={rotation} castShadow receiveShadow><boxGeometry args={s}/><primitive object={materials[mat]} attach="material"/></mesh>
}
function Rod({a,b,thick=.055,mat='iron'}:{a:XYZ;b:XYZ;thick?:number;mat?:keyof typeof materials}){
  const {position,quaternion,length}=useMemo(()=>{
    const from=new THREE.Vector3(...a), to=new THREE.Vector3(...b)
    const direction=to.clone().sub(from)
    return {position:from.add(to).multiplyScalar(.5),quaternion:new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),direction.clone().normalize()),length:direction.length()}
  },[a.join(','),b.join(',')])
  return <mesh position={position} quaternion={quaternion} castShadow><cylinderGeometry args={[thick,thick,length,7]}/><primitive object={materials[mat]} attach="material"/></mesh>
}
function Tank({p,r=1,h=2.5,material='iron',bands=3}:{p:XYZ;r?:number;h?:number;material?:keyof typeof materials;bands?:number}){
 return <group position={p}>
   <mesh castShadow receiveShadow position={[0,h/2,0]}><cylinderGeometry args={[r*.96,r,h,28]}/><primitive object={materials[material]} attach="material"/></mesh>
   <mesh castShadow position={[0,h+.18,0]}><coneGeometry args={[r,.36,28]}/><primitive object={materials.light} attach="material"/></mesh>
   {Array.from({length:bands},(_,i)=><mesh key={i} position={[0,.36+i*(h-.5)/(bands-1),0]}><torusGeometry args={[r+.009,.034,6,40]}/><primitive object={materials.light} attach="material" /></mesh>)}
   {Array.from({length:8},(_,i)=>{
     const a=i*Math.PI/4;return <Rod key={i} a={[Math.cos(a)*r,.12,Math.sin(a)*r]} b={[Math.cos(a)*r,h-.15,Math.sin(a)*r]} thick={.028} mat="light"/>
   })}
 </group>
}
function LabelPlate({text,sub,width=1.8,color='#9eeed5'}:{text:string;sub?:string;width?:number;color?:string}) {
  const texture=useMemo(()=>{
    const canvas=document.createElement('canvas');canvas.width=640;canvas.height=144
    const ctx=canvas.getContext('2d');if(!ctx)return null
    ctx.fillStyle='#0d2933';ctx.fillRect(0,0,640,144)
    ctx.strokeStyle=color;ctx.lineWidth=3;ctx.strokeRect(4,4,632,136)
    ctx.fillStyle=color;ctx.fillRect(20,26,4,89)
    ctx.textBaseline='middle';ctx.fillStyle='#d6f6e9';ctx.font='bold 31px Arial';ctx.fillText(text,42,57)
    ctx.font='17px Arial';ctx.fillStyle='#8cbbc0';ctx.fillText(sub??'ОБЪЕКТ • ПРОИЗВОДСТВЕННЫЙ КОНТУР',43,103)
    const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8
    return tex
  },[text,sub,color])
  if(!texture)return null
  return <mesh><planeGeometry args={[width,width*.225]}/><meshBasicMaterial map={texture} side={THREE.DoubleSide}/></mesh>
}
function GantryCrane({year}:{year:Era}){
 const mobile=useRef<THREE.Group>(null)
 useFrame(({clock})=>{if(mobile.current)mobile.current.position.x=Math.sin(clock.elapsedTime*.22)*1.36})
 return <group position={[-4.03,0,-2.2]}>
   {[-2.65,2.65].map(x=><group key={x}>
     {[-1.83,1.83].map(z=><group key={z}>
       <Rod a={[x,.1,z]} b={[x,4.8,z]} thick={.094} mat="light"/>
       <Box p={[x,4.87,z]} s={[.32,.24,.36]} mat="yellow"/>
     </group>)}
     <Rod a={[x,4.75,-1.98]} b={[x,4.75,1.98]} thick={.14} mat="light"/>
     {Array.from({length:6},(_,i)=><Rod key={i} a={[x,4.78,-1.8+i*.6]} b={[x,5.24,-1.48+i*.6]} mat="rust" thick={.024}/>)}
   </group>)}
   {[4.88,5.25].map(y=><group key={y}>
     <Rod a={[-2.78,y,-1.83]} b={[2.78,y,-1.83]} thick={.10} mat="yellow"/>
     <Rod a={[-2.78,y,1.83]} b={[2.78,y,1.83]} thick={.10} mat="yellow"/>
   </group>)}
   {Array.from({length:10},(_,i)=>{
     const x=-2.65+i*.59
     return <group key={i}>
       <Rod a={[x,4.88,-1.83]} b={[x+.3,5.25,-1.83]} thick={.042} mat="yellow"/>
       <Rod a={[x,4.88,1.83]} b={[x+.3,5.25,1.83]} thick={.042} mat="yellow"/>
     </group>
   })}
   <group ref={mobile} position={[0,0,0]}>
     <Box p={[0,5.14,0]} s={[.85,.35,3.95]} mat="yellow"/>
     <Box p={[0,5.42,0]} s={[.46,.27,.64]} mat="dark"/>
     <Rod a={[0,4.95,.1]} b={[0,year===2040?2.1:2.9,.1]} thick={.024} mat="light"/>
     <Box p={[0,year===2040?1.98:2.78,.1]} s={[.47,.18,.37]} mat="rust"/>
     <Rod a={[-.12,year===2040?1.98:2.78,.1]} b={[-.12,year===2040?1.68:2.45,.1]} thick={.026} mat="light"/>
     <Rod a={[.12,year===2040?1.98:2.78,.1]} b={[.12,year===2040?1.68:2.45,.1]} thick={.026} mat="light"/>
   </group>
 </group>
}
function RollingFoundry({year}:{year:Era}){
 const line=useRef<THREE.Group>(null)
 useFrame(({clock})=>{if(line.current)line.current.position.x=((clock.elapsedTime*.34)%1)*1.8})
 return <group position={[-5.55,0,1.02]}>
  <Box p={[2.5,.2,0]} s={[7,.28,1.5]} mat="concrete"/>
  <Box p={[2.5,.62,0]} s={[6.86,.35,1.13]} mat="dark"/>
  {Array.from({length:18},(_,i)=><group key={i} position={[-.7+i*.38,.84,0]}>
     <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.135,.135,.95,12]}/><primitive object={materials.light} attach="material"/></mesh>
     <Box p={[0,-.02,.52]} s={[.1,.13,.08]} mat="rust"/>
     <Box p={[0,-.02,-.52]} s={[.1,.13,.08]} mat="rust"/>
   </group>)}
  {[1.05,3.35,5.5].map((x,i)=><group key={x} position={[x,0,0]}>
    <Rod a={[-.5,.55,-.78]} b={[-.5,2.33,-.78]} thick={.12} mat="iron"/>
    <Rod a={[-.5,.55,.78]} b={[-.5,2.33,.78]} thick={.12} mat="iron"/>
    <Rod a={[.5,.55,-.78]} b={[.5,2.33,-.78]} thick={.12} mat="iron"/>
    <Rod a={[.5,.55,.78]} b={[.5,2.33,.78]} thick={.12} mat="iron"/>
    <Box p={[0,2.35,0]} s={[1.4,.35,2.1]} mat={i===1?'yellow':'light'}/>
    <Box p={[0,1.4,0]} s={[.45,1.23,1.44]} mat="rust"/>
    <mesh position={[0,1.32,0]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.31,.31,1.45,18]}/><primitive object={materials.iron} attach="material"/></mesh>
    <Box p={[.6,1.8,1.07]} s={[.32,.7,.16]} mat="dark"/>
    <Box p={[.6,1.9,1.17]} s={[.2,.15,.015]} mat="green"/>
  </group>)}
  <group ref={line}>
    <Box p={[1.15,1.04,0]} s={[2.45,.14,.56]} mat="molten"/>
    <Box p={[1.15,1.16,0]} s={[2.35,.015,.4]} mat="yellow"/>
  </group>
  <pointLight position={[1.2,1.32,0]} color="#ff892a" intensity={13} distance={5}/>
  <Box p={[.8,.3,1.18]} s={[.15,.12,6.5]} mat="yellow" rotation={[0,Math.PI/2,0]}/>
  <group position={[5.25,2.85,1.06]}><LabelPlate text="ROLLING / LINE 02" sub="AUTOMATED METAL FORMING" width={2.5}/></group>
  {year===2040 && <group>
   {Array.from({length:6},(_,i)=><mesh key={i} position={[i*1.18,2.9,0]} rotation={[-Math.PI/2,0,0]}>
     <ringGeometry args={[.51,.525,32]}/><meshBasicMaterial color="#aafbe0" transparent opacity={.4} side={THREE.DoubleSide}/>
   </mesh>)}
  </group>}
 </group>
}
function TankFarm({year}:{year:Era}){
 return <group position={[7.2,0,-6.15]}>
   <Box p={[0,.16,0]} s={[6.7,.28,3.9]} mat="concrete"/>
   {[[-1.9,-.72],[-.55,-.72],[.85,-.72],[2.25,-.72]].map(([x,z],i)=><Tank key={i} p={[x,.33,z]} r={.58} h={i%2?2.05:2.35} bands={3} material={i%2?'light':'iron'}/>)}
   <Box p={[0,.42,1.2]} s={[5.45,.23,1.22]} mat="dark"/>
   {Array.from({length:5},(_,i)=><group key={i}>
      <mesh position={[-2.1+i*1.05,.6,1.25]}><torusGeometry args={[.24,.06,8,24]}/><primitive object={materials.light} attach="material"/></mesh>
      <Box p={[-2.1+i*1.05,.37,1.25]} s={[.5,.2,.38]} mat="iron"/>
      <Box p={[-2.1+i*1.05,.6,1.5]} s={[.16,.18,.05]} mat="green"/>
   </group>)}
   <Rod a={[-2.7,2.87,-.72]} b={[2.65,2.87,-.72]} thick={.065} mat="light"/>
   {Array.from({length:10},(_,i)=><Rod key={i} a={[-2.7+i*.59,2.88,-.72]} b={[-2.7+i*.59,3.3,-.72]} thick={.026} mat="light"/>)}
   <Rod a={[-2.8,3.3,-.72]} b={[2.8,3.3,-.72]} thick={.027} mat="light"/>
   <group position={[0,3.65,.45]}><LabelPlate text={year===2040?'WATER / CLOSED LOOP':'WATER / TREATMENT'} sub="INDUSTRIAL RECIRCULATION SYSTEM" width={2.9}/></group>
 </group>
}
function Pylon({x,z,height=4.7}:{x:number;z:number;height?:number}){
 return <group position={[x,0,z]}>
   {[-.5,.5].flatMap(dx=>[-.35,.35].map(dz=><Rod key={dx+'/'+dz} a={[dx,.15,dz]} b={[dx*.38,height,dz*.38]} thick={.065} mat="light"/>))}
   {Array.from({length:5},(_,i)=>{
     const y=.8+i*.8,scale=1-(y/height)*.63
     return <group key={i}>
       <Rod a={[-.5*scale,y,-.35*scale]} b={[.5*scale,y,-.35*scale]} thick={.055}/>
       <Rod a={[-.5*scale,y,.35*scale]} b={[.5*scale,y,.35*scale]} thick={.055}/>
       <Rod a={[-.5*scale,y,-.35*scale]} b={[-.5*scale,y,.35*scale]} thick={.045}/>
       <Rod a={[.5*scale,y,-.35*scale]} b={[.5*scale,y,.35*scale]} thick={.045}/>
       {i>0&&<Rod a={[-.5*scale,y,-.35*scale]} b={[.5*(scale+.14),y-.8,-.35*(scale+.14)]} thick={.029}/>}
     </group>
   })}
   <Rod a={[-1.1,height-.28,0]} b={[1.1,height-.28,0]} thick={.095}/>
   <Rod a={[-.65,height+.12,0]} b={[.65,height+.12,0]} thick={.06}/>
   {[-.8,0,.8].map(px=><group key={px}>
     <Rod a={[px,height-.35,0]} b={[px,height-.67,0]} thick={.042} mat="yellow"/>
     <Box p={[px,height-.73,0]} s={[.19,.2,.16]} mat="light"/>
   </group>)}
 </group>
}
function PowerGrid({year}:{year:Era}){
 return <group position={[-8.25,0,1.0]}>
   {[[-1.2,0],[1.2,-1.25]].map(([x,z],i)=><Pylon key={i} x={x} z={z} height={4.2}/>)}
   <Rod a={[-1.2,3.46,0]} b={[1.2,3.46,-1.25]} thick={.014} mat="light"/>
   <Rod a={[-1.6,3.46,0]} b={[.8,3.46,-1.25]} thick={.014} mat="light"/>
   <Rod a={[-.8,3.46,0]} b={[1.6,3.46,-1.25]} thick={.014} mat="light"/>
   {year>=2035&&<group position={[.2,4.9,-.4]}><mesh rotation={[-Math.PI/2,0,0]}>
     <ringGeometry args={[1.18,1.21,40]}/><meshBasicMaterial color="#84ffcf" transparent opacity={.32} side={THREE.DoubleSide}/>
   </mesh></group>}
 </group>
}
function Container({p,color,turn=false}:{p:XYZ;color:string;turn?:boolean}){
 return <group position={p} rotation={[0,turn?Math.PI/2:0,0]}>
   <mesh castShadow receiveShadow><boxGeometry args={[1.95,.91,.91]}/><meshStandardMaterial color={color} metalness={.54} roughness={.64}/></mesh>
   {Array.from({length:12},(_,i)=><Box key={i} p={[-.87+i*.158,0,.467]} s={[.032,.8,.013]} mat="light"/>)}
   {[-.9,.9].map(x=><group key={x}>
     <Box p={[x,.02,.47]} s={[.048,.83,.02]} mat="rust"/>
     <Box p={[x,.02,-.47]} s={[.048,.83,.02]} mat="rust"/>
   </group>)}
 </group>
}
function RailPort({year}:{year:Era}){
 const train=useRef<THREE.Group>(null)
 useFrame(({clock})=>{if(train.current)train.current.position.x=-7+((clock.elapsedTime*.25)%1)*13})
 return <group>
   {[-7.3,-7.7].map(z=><Rod key={z} a={[-10.8,.22,z]} b={[10.8,.22,z]} thick={.065} mat="light"/>)}
   {Array.from({length:38},(_,i)=><Box key={i} p={[-10.6+i*.58,.16,-7.5]} s={[.16,.09,.92]} mat="rust"/>)}
   <group ref={train} position={[-7,0,-7.5]}>
     <Box p={[0,.65,0]} s={[2.2,.9,1.02]} mat={year===2030?'yellow':'light'}/>
     <Box p={[-.6,1.32,0]} s={[.72,.48,.95]} mat="dark"/>
     <Box p={[-.6,1.34,.486]} s={[.48,.27,.019]} mat="glass"/>
     {[-.7,.7].map(x=>[-.38,.38].map(z=><mesh key={x+'/'+z} position={[x,.25,z]} rotation={[Math.PI/2,0,0]}>
       <cylinderGeometry args={[.18,.18,.14,16]}/><primitive object={materials.dark} attach="material"/>
     </mesh>))}
     <Box p={[1.23,.64,0]} s={[.2,.18,.7]} mat="green"/>
     <group position={[2.75,0,0]}>
       <Box p={[0,.57,0]} s={[2.7,.82,1.06]} mat="iron"/>
       <Box p={[0,1.03,0]} s={[2.43,.12,.89]} mat="rust"/>
       {[-1.05,1.05].map(x=><Box key={x} p={[x,.25,0]} s={[.27,.3,1.09]} mat="dark"/>)}
     </group>
   </group>
   <group position={[9.2,0,5.8]}>
     <Container p={[0,.78,0]} color="#3f7880"/>
     <Container p={[0,1.73,0]} color="#67777a"/>
     <Container p={[-2.05,.78,0]} color="#756453"/>
     <Container p={[-2.05,1.73,0]} color="#496b73"/>
     <Container p={[-2.2,.78,-1.1]} color="#74877c"/>
   </group>
 </group>
}
function UtilityRacks(){
 return <group>
   {Array.from({length:13},(_,i)=>{
     const x=-4.9+i*.82
     return <group key={i} position={[x,0,-6.48]}>
       <Rod a={[0,.21,-.5]} b={[0,2.1,-.5]} thick={.055}/>
       <Rod a={[0,.21,.5]} b={[0,2.1,.5]} thick={.055}/>
       <Rod a={[0,2.05,-.62]} b={[0,2.05,.62]} thick={.055} mat="light"/>
       {[-.35,0,.35].map(z=><group key={z}>
         <mesh position={[0,2.16,z]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.11,.11,.48,12]}/><primitive object={materials.rust} attach="material"/></mesh>
       </group>)}
     </group>
   })}
   {[-6.83,-6.48,-6.13].map(z=><Rod key={z} a={[-5.3,2.16,z]} b={[5.3,2.16,z]} thick={.1} mat="light"/>)}
   <group position={[-3.55,3.65,-6.6]}><LabelPlate text="UTILITIES / PIPE RACK" width={2.6}/></group>
 </group>
}
function CoolingStack(){
 return <group position={[9.65,0,-.95]}>
   <mesh position={[0,1.35,0]} castShadow><cylinderGeometry args={[.87,1.22,2.56,24,1,true]}/><primitive object={materials.concrete} attach="material"/></mesh>
   <mesh position={[0,2.58,0]}><torusGeometry args={[.86,.09,10,36]}/><primitive object={materials.light} attach="material"/></mesh>
   <mesh position={[0,.18,0]}><cylinderGeometry args={[1.17,1.17,.28,24]}/><primitive object={materials.dark} attach="material"/></mesh>
   {Array.from({length:8},(_,i)=>{
     const a=i*Math.PI/4
     return <Rod key={i} a={[Math.cos(a)*1.0,.25,Math.sin(a)*1.0]} b={[Math.cos(a)*.79,2.56,Math.sin(a)*.79]} thick={.028} mat="light"/>
   })}
   <mesh position={[0,2.6,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.82,24]}/><meshStandardMaterial color="#152d37" side={THREE.DoubleSide}/></mesh>
 </group>
}
function SiteLamps({year}:{year:Era}){
 const positions:XYZ[]=[[-10,0,5.9],[-6.4,0,5.8],[-1.7,0,5.75],[2.6,0,5.74],[8.8,0,5.8],[-9.6,0,-5.5],[-5.75,0,-5.7],[1.2,0,-6.0],[9.55,0,-5.65]]
 return <group>
   {positions.map(([x,,z],i)=><group key={i} position={[x,0,z]}>
     <Rod a={[0,.2,0]} b={[0,2.7,0]} thick={.043} mat="light"/>
     <Rod a={[0,2.7,0]} b={[.35,2.7,0]} thick={.038} mat="light"/>
     <Box p={[.38,2.64,0]} s={[.21,.16,.28]} mat="dark"/>
     <mesh position={[.41,2.55,0]}><sphereGeometry args={[.06,8,8]}/><meshBasicMaterial color={year===2040?'#a9ffdf':'#e4e1bc'}/></mesh>
   </group>)}
 </group>
}
function GroundMarks(){
 return <group>
   {Array.from({length:20},(_,i)=>{
     const x=-10.5+i*1.08
     return <Box key={i} p={[x,.15,6.72]} s={[.58,.012,.07]} mat={i%3===0?'yellow':'light'}/>
   })}
   {[-8.4,-5.9,-3.3,-.8,1.75,4.3,6.85,9.4].map(x=><group key={x}>
     <Box p={[x,.143,7.0]} s={[.038,.016,1.12]} mat="light"/>
     <Box p={[x,.143,6.12]} s={[.038,.016,.12]} mat="yellow"/>
   </group>)}
   {Array.from({length:9},(_,i)=><group key={i}>
     <Box p={[-10.1+i*.28,.145,4.8]} s={[.12,.012,.62]} mat={i%2?'yellow':'dark'} rotation={[0,.28,0]}/>
   </group>)}
 </group>
}
export function EngineeringDetail({year,onSelect}:{year:Era;onSelect:(id:NodeId)=>void}){
 const pick=(id:NodeId)=>(event:{stopPropagation:()=>void})=>{event.stopPropagation();onSelect(id)}
 return <group>
   <group onClick={pick('maintenance')}><GantryCrane year={year}/></group>
   <group onClick={pick('casting')}><RollingFoundry year={year}/></group>
   <group onClick={pick('water')}><TankFarm year={year}/></group>
   <group onClick={pick('energy')}><PowerGrid year={year}/></group>
   <group onClick={pick('rail')}><RailPort year={year}/></group>
   <group onClick={pick('network')}><UtilityRacks/></group>
   <group onClick={pick('emissions')}><CoolingStack/></group>
   <SiteLamps year={year}/>
   <GroundMarks/>
 </group>
}
