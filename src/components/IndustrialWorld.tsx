import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, OrbitControls, Line, Sparkles } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsType } from 'three-stdlib'
import { nodes, type Era, type NodeId } from '../data/atlas'

type WorldProps = {
  year: Era
  selected: NodeId | null
  onSelect: (id: NodeId) => void
  resetKey: number
}
type Vec3 = [number, number, number]
const steel = '#2b4852'
const teal = '#6be7c5'

function Box({ p, s, color = steel, metalness = .42, emissive, opacity = 1, rotation }: { p: Vec3; s: Vec3; color?: string; metalness?: number; emissive?: string; opacity?: number; rotation?: Vec3 }) {
  return <mesh position={p} rotation={rotation} castShadow receiveShadow>
    <boxGeometry args={s} />
    <meshStandardMaterial color={color} metalness={metalness} roughness={.53} emissive={emissive ?? '#000000'} emissiveIntensity={emissive ? .55 : 0} transparent={opacity < 1} opacity={opacity} />
  </mesh>
}
function Cylinder({ p, r, h, color = steel, segments = 24, rotation, opacity = 1, rTop }: { p: Vec3; r: number; h: number; color?: string; segments?: number; rotation?: Vec3; opacity?: number; rTop?: number }) {
  return <mesh position={p} rotation={rotation} castShadow receiveShadow>
    <cylinderGeometry args={[rTop ?? r, r, h, segments]} />
    <meshStandardMaterial color={color} metalness={.48} roughness={.5} transparent={opacity < 1} opacity={opacity} />
  </mesh>
}
function Neon({ p, s, color = teal }: { p: Vec3; s: Vec3; color?: string }) {
  return <mesh position={p}>
    <boxGeometry args={s}/>
    <meshBasicMaterial color={color} toneMapped={false} />
  </mesh>
}
function Beam({ a, b, width = .09, color = '#5a8990' }: { a: Vec3; b: Vec3; width?: number; color?: string }) {
  const diff = useMemo(() => new THREE.Vector3(...b).sub(new THREE.Vector3(...a)), [a.join(), b.join()])
  const center = useMemo(() => new THREE.Vector3(...a).add(new THREE.Vector3(...b)).multiplyScalar(.5), [a.join(), b.join()])
  const rot = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), diff.clone().normalize()), [diff])
  return <mesh position={center} quaternion={rot} castShadow>
    <cylinderGeometry args={[width, width, diff.length(), 8]}/>
    <meshStandardMaterial color={color} metalness={.64} roughness={.4}/>
  </mesh>
}
function Ground({ year }: {year: Era}) {
  const accent = year === 2030 ? '#60d9b6' : year === 2035 ? '#7acbe8' : '#b7f2d0'
  return <group>
    <Box p={[0,-.58,0]} s={[22.7,1.2,17.7]} color="#102730"/>
    <Box p={[0,.035,0]} s={[22.4,.10,17.4]} color="#17323a"/>
    <Box p={[0,.099,0]} s={[22.0,.015,17]} color="#223b42"/>
    <Box p={[-1.2,.115,5.62]} s={[19.5,.026,2.25]} color="#243a40"/>
    <Box p={[4.72,.13,-.15]} s={[1.85,.02,13.4]} color="#23363b"/>
    <Box p={[-6.9,.13,-.1]} s={[1.35,.02,13.4]} color="#24383e"/>
    {Array.from({length:23},(_,i) => <Box key={'g'+i} p={[-10.4+i*.95,.144,5.61]} s={[.4,.008,.034]} color="#63787c" />)}
    {Array.from({length:15},(_,i) => <Box key={'r'+i} p={[4.7,.15,-6.65+i*.95]} s={[.028,.008,.34]} color="#5b7779" />)}
    <Box p={[0,-.02,-8.59]} s={[22.6,.075,.035]} color={accent} emissive={accent} />
    <Box p={[0,-.02,8.59]} s={[22.6,.075,.035]} color={accent} emissive={accent} />
    <Box p={[-11.29,-.02,0]} s={[.04,.075,17.2]} color={accent} emissive={accent} />
    <Box p={[11.29,-.02,0]} s={[.04,.075,17.2]} color={accent} emissive={accent} />
    {[-10.8,10.8].flatMap(x => [-8.2,8.2].map(z=><group key={x+'/'+z}>
      <Cylinder p={[x,.19,z]} r={.13} h={.3} color={accent} />
      <Cylinder p={[x,.4,z]} r={.08} h={.14} color="#dfffe9" />
    </group>))}
    {Array.from({length:12},(_,i)=><Box key={'road'+i} p={[-10.5+i*1.8,-.01,8.46]} s={[.85,.06,.07]} color="#4c7778"/>)}
    {Array.from({length:14},(_,i)=><Box key={'side'+i} p={[10.95,-.01,-7.5+i*1.15]} s={[.07,.06,.54]} color="#4a6d70"/>)}
    <group position={[-2.5,.22,-6.6]}>
      {Array.from({length:7},(_,i)=><group key={i}>
        <Box p={[i*1.05,0,0]} s={[.05,.015,1.2]} color="#45606a"/>
        <Box p={[i*1.05,-.02,-.65]} s={[.72,.017,.018]} color="#547f82"/>
        <Box p={[i*1.05,-.02,.65]} s={[.72,.017,.018]} color="#547f82"/>
      </group>)}
    </group>
  </group>
}
function FactoryHall() {
  return <group position={[-3.95,0,-2.2]}>
    <Box p={[0,1.35,0]} s={[5.8,2.58,4.15]} color="#24434d"/>
    <Box p={[0,2.7,0]} s={[6.1,.22,4.4]} color="#3d5960"/>
    <Box p={[0,2.84,0]} s={[5.72,.1,3.98]} color="#213a42"/>
    {Array.from({length:6},(_,i)=><group key={i}>
      <Box p={[-2.53+i*1.02,2.99,.15]} s={[.74,.075,3.62]} color={i%2 ? '#466b71' : '#365159'} rotation={[0,0,-.2]} />
      <Box p={[-2.42+i*1.02,1.1,2.095]} s={[.09,2.15,.045]} color="#64888a"/>
      <Box p={[-2.42+i*1.02,1.3,-2.095]} s={[.08,2.05,.05]} color="#618388"/>
    </group>)}
    {Array.from({length:5},(_,i)=><group key={i}>
      <Box p={[-2.15+i*1.06,.89,2.112]} s={[.68,1.4,.055]} color="#142e36" />
      <Neon p={[-2.15+i*1.06,1.33,2.145]} s={[.45,.05,.04]} color={i===2 ? '#ffb97b' : '#66d4c0'}/>
    </group>)}
    {Array.from({length:3},(_,i)=><group key={i}>
      <Cylinder p={[-2+i*1.65,3.33,-1.03]} r={.17} h={.8} color="#8aa6a4"/>
      <Cylinder p={[-2+i*1.65,3.77,-1.03]} r={.29} h={.11} color="#688987"/>
    </group>)}
    <Box p={[0,.21,2.38]} s={[6.1,.25,.45]} color="#517077"/>
    <Neon p={[0,.4,2.61]} s={[5.88,.05,.06]} color="#b7dbcc"/>
  </group>
}
function Furnace({ year }: {year: Era}) {
  const active = year === 2040
  return <group position={[2.25,0,-3.7]}>
    <Cylinder p={[.2,2.45,0]} r={1.18} rTop={.96} h={4.65} color="#38535a" />
    <Cylinder p={[.2,5.11,0]} r={.94} rTop={.64} h={1.1} color="#647274"/>
    <Cylinder p={[.2,5.68,0]} r={.62} h={.13} color="#a4a29b"/>
    {Array.from({length:6},(_,i)=><Cylinder key={i} p={[.2,1.05+i*.75,0]} r={1.205} h={.075} color="#82928e" />)}
    {Array.from({length:7},(_,i)=> {
      const angle=i*Math.PI*2/7
      return <Beam key={i} a={[.2+Math.cos(angle)*1.25,.3,Math.sin(angle)*1.25]} b={[.2+Math.cos(angle)*1.06,4.6,Math.sin(angle)*1.06]} width={.046}/>
    })}
    <Box p={[-1.6,1.65,.9]} s={[2.8,.17,1.05]} color="#74878a"/>
    <Box p={[-1.6,2.55,.9]} s={[2.8,.1,1.05]} color="#83918b"/>
    {[-2.85,-.4].map(x=><Beam key={x} a={[x,.22,1.28]} b={[x,2.57,1.28]} width={.06}/>)}
    <Cylinder p={[-2.35,3.05,-.6]} r={.33} h={5.6} color="#465b63" />
    <Cylinder p={[-2.35,5.84,-.6]} r={.41} h={.12} color="#819791" />
    <Cylinder p={[2.0,2.35,-1.6]} r={.32} h={4.2} color="#586f73" />
    <Cylinder p={[2,4.5,-1.6]} r={.41} h={.09} color="#97a39a" />
    <Beam a={[.2,4.55,-.4]} b={[2,4.55,-1.6]} width={.21} color="#79908a"/>
    <Beam a={[.85,1.1,0]} b={[2.35,1.1,0]} width={.32} color="#5c7981"/>
    <Box p={[2.15,.26,1.25]} s={[2.5,.35,1.15]} color="#3e5158"/>
    <Neon p={[2.15,.455,1.22]} s={[1.8,.055,.6]} color="#e88d4f" />
    <Neon p={[2.15,.47,1.22]} s={[1.25,.06,.38]} color="#ffd28e" />
    {[-.68,.88].map(x=><group key={x}>
      <Beam a={[x,1.0,1.3]} b={[x,3.25,1.3]} width={.06} color="#81958e" />
      <Beam a={[x,3.25,1.3]} b={[x+.4,3.25,.4]} width={.055} color="#81958e" />
    </group>)}
    <group position={[.2,3.5,0]}>
      <mesh rotation={[-Math.PI/2,0,0]}>
        <torusGeometry args={[1.55,.019,6,72]} />
        <meshBasicMaterial color={active ? '#abf5d8' : '#72caba'} transparent opacity={active ? .72 : .25}/>
      </mesh>
    </group>
  </group>
}
function Silos({ year }: {year: Era}) {
  return <group position={[7.15,0,-3.45]}>
    {[-1.05,.22,1.48].map((x,i)=><group key={i} position={[x,0,i===1?-.25:0]}>
      <Cylinder p={[0,2.14,0]} r={.65} h={4.1} color={i===1?'#5a7174':'#48656b'} />
      <Cylinder p={[0,4.38,0]} r={.66} rTop={.1} h={.45} color="#8a9b91" />
      {Array.from({length:4},(_,j)=><Cylinder key={j} p={[0,1.1+j*.85,0]} r={.677} h={.047} color="#80908c"/>)}
      <Beam a={[-.72,.15,.34]} b={[-.72,3.85,.34]} width={.045}/>
      <Neon p={[0,3.6,.661]} s={[.52,.045,.05]} color={year===2040?'#95f6b8':'#6edacc'}/>
      <Cylinder p={[0,.3,0]} r={.8} h={.55} color="#1c3842" />
    </group>)}
    <Box p={[.19,3.42,0]} s={[4.2,.12,.3]} color="#85938f"/>
    {[-1.25,1.75].map(x=><Beam key={x} a={[x,.3,.34]} b={[x,3.48,.34]} width={.055}/>)}
    <Box p={[.25,.21,1.23]} s={[4.7,.28,1.5]} color="#344b53"/>
    <Box p={[.25,.4,1.5]} s={[3.7,.1,.55]} color="#728781"/>
  </group>
}
function Warehouse({ year }: {year: Era}) {
  return <group position={[5.6,0,2.45]}>
    <Box p={[.35,1.3,0]} s={[5.8,2.55,3.55]} color="#344a53"/>
    <Box p={[.35,2.72,0]} s={[6.1,.31,3.9]} color="#50676a"/>
    {Array.from({length:9},(_,i)=><Box key={i} p={[-2.35+i*.66,2.91,-.1]} s={[.39,.035,3.52]} color={i%2?'#729194':'#405d66'}/>)}
    {Array.from({length:5},(_,i)=><group key={i}>
      <Box p={[-1.95+i*1.09,.86,1.81]} s={[.78,1.27,.06]} color="#142f37"/>
      <Box p={[-1.95+i*1.09,.86,1.85]} s={[.65,1.11,.03]} color="#405761"/>
      <Neon p={[-1.95+i*1.09,1.48,1.87]} s={[.6,.035,.028]} color={year===2040?'#c5f8ad':'#64dcca'}/>
    </group>)}
    {[-2.4,0,2.4].map(x=><Box key={x} p={[x,1.68,-1.81]} s={[.07,1.8,.06]} color="#7d9591"/>)}
    <Box p={[.35,.21,2.05]} s={[6.0,.22,.57]} color="#64787a"/>
    <Neon p={[.3,2.18,1.795]} s={[4.85,.06,.05]} color="#a4e4cf"/>
  </group>
}
function RobotArm({ index, year }: { index: number; year: Era }) {
  const arm = useRef<THREE.Group>(null)
  useFrame(({clock})=>{
    if(arm.current) arm.current.rotation.y = Math.sin(clock.elapsedTime*.7 + index*2.3)*.48
  })
  return <group position={[-3.05+index*1.5, .18,3.2]}>
    <Box p={[0,.23,0]} s={[.74,.4,.75]} color="#263f45"/>
    <Cylinder p={[0,.51,0]} r={.31} h={.2} color="#849b93"/>
    <group ref={arm} position={[0,.6,0]}>
      <Beam a={[0,0,0]} b={[.46,.95,-.18]} width={.18} color={year===2040?'#b5e5bf':'#dca36a'}/>
      <Cylinder p={[.46,.95,-.18]} r={.24} h={.28} color="#879d96"/>
      <Beam a={[.46,.95,-.18]} b={[.25,1.7,.36]} width={.13} color={year===2040?'#b5e5bf':'#c98658'}/>
      <Box p={[.25,1.72,.36]} s={[.34,.25,.36]} color="#324d54"/>
      <Beam a={[.11,1.72,.45]} b={[.11,1.34,.45]} width={.06} color="#d0ded0"/>
      <Beam a={[.4,1.72,.45]} b={[.4,1.34,.45]} width={.06} color="#d0ded0"/>
    </group>
  </group>
}
function Robotics({ year }: {year: Era}) {
  return <group>
    <Box p={[-2.45,.19,3.16]} s={[5.4,.23,2.95]} color="#44545a"/>
    <Box p={[-2.45,.35,3.16]} s={[4.9,.06,2.15]} color="#243b41"/>
    <Box p={[-2.5,.38,3.68]} s={[4.7,.04,.42]} color="#75888a"/>
    {[0,1,2].map(i=><RobotArm key={i} index={i} year={year}/>)}
    {Array.from({length:6},(_,i)=><Box key={i} p={[-4.75+i*.9,.47,3.7]} s={[.41,.13,.34]} color={i%2?'#6e8a87':'#b26f54'}/>)}
    {[-5.15,.18].map(x=><group key={x}><Beam a={[x,.36,2.03]} b={[x,2.7,2.03]} width={.06}/>
    <Neon p={[x,2.7,2.03]} s={[.13,.1,.14]} color="#9ff0d8"/></group>)}
    <Beam a={[-5.15,2.7,2.03]} b={[.18,2.7,2.03]} width={.07}/>
    {year>=2035 && <group position={[.25,0,0]}>
      <Box p={[-.05,1.3,1.4]} s={[.85,2.35,.85]} color="#365d63"/>
      <Neon p={[-.05,2.1,1.84]} s={[.5,.11,.025]}/>
    </group>}
  </group>
}
function Transformer({ x, z }: {x: number; z: number}) {
  return <group position={[x,.2,z]}>
    <Box p={[0,.5,0]} s={[1.12,.85,.76]} color="#526c70"/>
    {Array.from({length:4},(_,i)=><Box key={i} p={[-.39+i*.25,.98,0]} s={[.09,.36,.58]} color="#92a29b"/>)}
    <Cylinder p={[-.33,1.37,0]} r={.11} h={.46} color="#a7b6aa"/>
    <Cylinder p={[.33,1.37,0]} r={.11} h={.46} color="#a7b6aa"/>
    <Neon p={[0,.55,.395]} s={[.7,.045,.025]} color="#a1dcc5"/>
  </group>
}
function PowerYard({year}: {year: Era}) {
  return <group position={[-7.7,0,3.35]}>
    <Box p={[0,.18,0]} s={[3.8,.22,3.3]} color="#31494e"/>
    {[-.98,.98].flatMap(x=>[-.9,.9].map(z=><Transformer key={x+'/'+z} x={x} z={z}/>))}
    {[-1.55,1.55].map(x=><group key={x}>
      {[-1.25,1.25].map(z=><Beam key={z} a={[x,.4,z]} b={[x,3.18,z]} width={.066} />)}
      <Beam a={[x,3.2,-1.3]} b={[x,3.2,1.3]} width={.08} />
      <Beam a={[x,2.24,-1.3]} b={[x,2.24,1.3]} width={.065} />
    </group>)}
    <Beam a={[-1.6,3.15,0]} b={[1.55,3.15,0]} width={.05}/>
    {year===2040 && <group>
      {[-1.15,0,1.15].map(z=><mesh key={z} position={[0,2.7,z]} rotation={[-Math.PI/2,0,0]}>
        <planeGeometry args={[1.15,.45]}/><meshBasicMaterial color="#52caa9" transparent opacity={.42} side={THREE.DoubleSide}/>
      </mesh>)}
    </group>}
    <Box p={[0,.13,1.88]} s={[4.35,.16,.16]} color="#91aeaa"/>
  </group>
}
function ControlCenter({year}: {year: Era}) {
  return <group position={[1.55,0,3.7]}>
    <Box p={[0,.2,0]} s={[2.6,.35,2.3]} color="#425963"/>
    <Box p={[0,1.35,0]} s={[2.05,2.0,1.8]} color="#23414c"/>
    <Box p={[0,2.75,0]} s={[2.8,.25,2.45]} color="#65817f"/>
    {[-.7,0,.7].map(x=><Box key={x} p={[x,1.55,.93]} s={[.54,1.02,.06]} color="#6aa2a2" opacity={.65}/>)}
    <Box p={[0,.54,.96]} s={[1.88,.06,.08]} color="#7eaaac"/>
    <Neon p={[0,2.31,.955]} s={[1.8,.085,.05]} color={year===2040?'#c4ffb9':'#82e4d6'}/>
    <Cylinder p={[0,3.24,0]} r={.08} h={.78} color="#9cb2ac"/>
    <mesh position={[0,3.72,0]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[.38,.025,5,40]}/><meshBasicMaterial color="#71ebc6"/></mesh>
    {year>=2035 && <group>
      <Box p={[.01,2.1,-.1]} s={[1.45,.92,.045]} color="#69e8c7" opacity={.18}/>
      <Line points={[[-.68,1.85,-.06],[-.2,2.23,-.06],[.2,2.0,-.06],[.68,2.34,-.06]]} color="#8dfad8" lineWidth={1.8}/>
    </group>}
  </group>
}
function Pipework() {
  return <group>
    <Beam a={[-.2,.55,-3.5]} b={[-.2,.55,-5.65]} width={.18} color="#8a9a91"/>
    <Beam a={[-.2,.55,-5.65]} b={[-2.6,.55,-5.65]} width={.18} color="#8a9a91"/>
    <Beam a={[3.4,.9,-1.2]} b={[3.4,.9,1.2]} width={.13} color="#b47751"/>
    <Beam a={[3.4,.9,1.2]} b={[2.9,.9,1.2]} width={.13} color="#b47751"/>
    <Beam a={[1.3,.65,1.0]} b={[-.5,.65,1]} width={.13} color="#829791"/>
    <Beam a={[-.5,.65,1]} b={[-.5,.65,2]} width={.13} color="#829791"/>
    {Array.from({length:5},(_,i)=><group key={i}>
      <Cylinder p={[.1+i*.52,.35,-6.9]} r={.17} h={.46} color="#557278"/>
      <Neon p={[.1+i*.52,.61,-6.9]} s={[.27,.03,.26]} color="#63d8b6"/>
    </group>)}
    <Box p={[3.35,.2,0]} s={[1.2,.25,2.1]} color="#354c52"/>
  </group>
}
function MaterialFlow({year}: {year: Era}) {
  const conveyor = useRef<THREE.Group>(null)
  useFrame(({clock})=>{
    if(conveyor.current) conveyor.current.position.z = Math.sin(clock.elapsedTime*1.2)*.12
  })
  return <group position={[-.1,0,-.3]}>
    <Box p={[0,.5,0]} s={[1.5,.27,6.8]} color="#5e7271" />
    <Box p={[-.73,.72,0]} s={[.13,.14,6.7]} color="#abb8a9"/>
    <Box p={[.73,.72,0]} s={[.13,.14,6.7]} color="#abb8a9"/>
    <group ref={conveyor}>
      {Array.from({length:11},(_,i)=><Box key={i} p={[0,.72,-3+i*.61]} s={[1.26,.035,.12]} color={i%2?'#dda069':'#909d97'}/>)}
    </group>
    {Array.from({length:4},(_,i)=><group key={i}>
      <Beam a={[-.7,.2,-2.5+i*1.7]} b={[-.7,.6,-2.5+i*1.7]} width={.06}/>
      <Beam a={[.7,.2,-2.5+i*1.7]} b={[.7,.6,-2.5+i*1.7]} width={.06}/>
    </group>)}
    {year===2040 && <Neon p={[0,.77,0]} s={[.045,.03,6.6]} color="#8afbe1" />}
  </group>
}
function Drone({index, year}: {index: number;year: Era}) {
  const ref = useRef<THREE.Group>(null)
  const phase = index*1.92
  useFrame(({clock})=>{
    if(!ref.current) return
    const t=clock.elapsedTime*.45+phase
    ref.current.position.set(Math.cos(t)*6.1,5.5+Math.sin(t*1.6)*.45+index*.22,Math.sin(t)*4.8)
    ref.current.rotation.y=-t+.3
  })
  if (year===2030 && index>0) return null
  if (year===2035 && index>2) return null
  return <group ref={ref} position={[0,5,0]}>
    <Box p={[0,0,0]} s={[.48,.13,.3]} color="#d4e5dc" />
    {[[-.5,-.38],[-.5,.38],[.5,-.38],[.5,.38]].map(([x,z],i)=><group key={i}>
      <Beam a={[0,0,0]} b={[x,0,z]} width={.028} color="#a2dbce"/>
      <Cylinder p={[x,.02,z]} r={.18} h={.02} color="#9cedd2"/>
    </group>)}
    <Neon p={[0,-.13,0]} s={[.2,.07,.2]} color="#96edc8"/>
  </group>
}
function AutonomousVehicles({ year }: {year: Era}) {
  const group=useRef<THREE.Group>(null)
  useFrame(({clock})=>{if(group.current)group.current.position.x = Math.sin(clock.elapsedTime*.28)*4.0})
  return <group>
    <group ref={group} position={[0,.25,5.6]}>
      <Box p={[0,.33,0]} s={[1.28,.43,.85]} color={year===2030?'#c58d66':'#bbd8c9'}/>
      <Box p={[0,.6,0]} s={[.75,.2,.67]} color="#375662"/>
      {[-.4,.4].flatMap(z=>[-.42,.42].map(x=><Cylinder key={x+'/'+z} p={[x,.13,z]} r={.16} h={.12} color="#182b31" rotation={[Math.PI/2,0,0]}/>))}
      <Neon p={[.63,.36,0]} s={[.04,.12,.5]} color="#8df4d1"/>
    </group>
    {year>=2035 && [-4,3].map((x,i)=><group key={i} position={[x,.23,5.64]}>
      <Box p={[0,.26,0]} s={[1.3,.42,.92]} color="#527d78"/>
      <Neon p={[.66,.25,0]} s={[.04,.1,.66]} color="#9af4ce" />
      <Box p={[0,.53,0]} s={[.75,.16,.65]} color="#a0b7ad"/>
    </group>)}
  </group>
}
function FuturisticOverlays({year}: {year: Era}) {
  const rotating = useRef<THREE.Group>(null)
  useFrame(({clock})=>{if(rotating.current) rotating.current.rotation.y=clock.elapsedTime*.11})
  if(year===2030) return null
  return <group>
    <group ref={rotating} position={[.2,6,-.7]}>
      <mesh rotation={[-Math.PI/2,0,0]}><torusGeometry args={[4.0,.018,4,96]}/><meshBasicMaterial color="#6ce6c5" transparent opacity={year===2040?.37:.17}/></mesh>
      <mesh rotation={[.3,0,.3]}><torusGeometry args={[4.35,.015,4,96]}/><meshBasicMaterial color="#61d4ba" transparent opacity={year===2040?.23:.10}/></mesh>
    </group>
    {[[-5.9,4,-2.8],[3.7,5.6,-.9],[7.25,5.35,-3.05]].map((p,i)=><group key={i} position={p as Vec3}>
      <Box p={[0,.55,0]} s={[.028,1.1,.028]} color="#8bf7dc" opacity={year===2040?.5:.22}/>
      <mesh rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.4,.44,40]}/><meshBasicMaterial color="#85f4cc" transparent opacity={.4} side={THREE.DoubleSide}/></mesh>
    </group>)}
  </group>
}
function Personnel({year}: {year:Era}) {
  const people:Vec3[]=[[-5.75,0,4.75],[-4.65,0,4.98],[-2.9,0,4.94],[-1.6,0,5.0],[2.1,0,5.18],[6.3,0,5.4],[-8.8,0,-.4]]
  const visible=year===2030?7:year===2035?3:0
  return <group>
    {people.slice(0,visible).map(([x,,z],i)=><group key={i} position={[x,.2,z]}>
      <Cylinder p={[0,.36,0]} r={.095} h={.43} color={i%2?'#d5b879':'#f0a15e'} segments={10}/>
      <Cylinder p={[0,.67,0]} r={.09} h={.1} color="#e6d6bd" segments={10}/>
      <Cylinder p={[0,.76,0]} r={.12} h={.09} color="#ebc262" segments={10}/>
      <Beam a={[-.035,.16,0]} b={[-.035,.02,0]} width={.035} color="#59757e"/>
      <Beam a={[.035,.16,0]} b={[.035,.02,0]} width={.035} color="#59757e"/>
    </group>)}
  </group>
}
function FutureExpansion({year}: {year:Era}) {
  if (year===2030) return null
  return <group>
    <group position={[-3.95,3.07,-2.2]}>
      {Array.from({length:7},(_,i)=><group key={i} position={[-2.35+i*.78,0,0]}>
        <Box p={[0,.08,0]} s={[.56,.09,3.15]} color="#183941" rotation={[-.16,0,0]}/>
        <Box p={[0,.145,0]} s={[.44,.015,2.9]} color={year===2040?'#7cd9b3':'#547e91'} rotation={[-.16,0,0]}/>
        {Array.from({length:5},(_,j)=><Neon key={j} p={[0,.17,-1.14+j*.56]} s={[.4,.015,.017]} color="#79d9bf"/>)}
      </group>)}
    </group>
    <group position={[-8.6,0,-5.85]}>
      <Box p={[0,.18,0]} s={[2.9,.26,2.55]} color="#40585e"/>
      <Box p={[0,.45,0]} s={[2.43,.24,2.12]} color="#27464d"/>
      {[-.68,0,.68].map(x=><group key={x} position={[x,0,0]}>
        <Box p={[0,1.3,-.05]} s={[.46,1.45,.8]} color="#426874"/>
        <Neon p={[0,1.7,.355]} s={[.31,.34,.035]} color="#91ead6"/>
        <Neon p={[0,.9,.355]} s={[.31,.055,.035]} color="#a2e6d4"/>
      </group>)}
      <Box p={[0,2.11,-.02]} s={[2.65,.15,1.95]} color="#739c97"/>
      <Neon p={[0,2.23,0]} s={[2.25,.025,1.4]} color="#78d7bc"/>
    </group>
    {year===2040 && <group>
      <group position={[3.65,0,-.95]}>
        <Box p={[0,.2,0]} s={[1.85,.26,1.7]} color="#45656c"/>
        <Cylinder p={[0,1.45,0]} r={.63} rTop={.4} h={2.4} color="#5b7b80" />
        <Cylinder p={[0,2.67,0]} r={.43} h={.16} color="#b5d6c3" />
        <mesh position={[0,2.8,0]} rotation={[-Math.PI/2,0,0]}>
          <torusGeometry args={[.85,.025,6,64]}/><meshBasicMaterial color="#b4f2dc" transparent opacity={.56}/>
        </mesh>
      </group>
      <group position={[7.5,0,-.2]}>
        <Beam a={[0,.8,-1.65]} b={[0,.8,1.7]} width={.15} color="#9abcd0"/>
        <Beam a={[-.5,2.0,-1.65]} b={[-.5,2.0,1.7]} width={.09} color="#7ebcaa"/>
        {Array.from({length:5},(_,i)=><Box key={i} p={[-.5,1.48,-1.25+i*.67]} s={[.19,.85,.18]} color="#4b8182"/>)}
        <Neon p={[-.5,2.09,0]} s={[.05,.07,3.2]} color="#8effce"/>
      </group>
    </group>}
  </group>
}
function Steam() {
  const refs=useRef<(THREE.Mesh|null)[]>([])
  useFrame(({clock})=>{
    refs.current.forEach((m,i)=>{
      if(!m) return
      const t=(clock.elapsedTime*.3+i*.23)%1
      m.position.y=5.9+t*2.8
      m.position.x=-.1 + Math.sin(clock.elapsedTime*.25+i)*t*.45
      m.scale.setScalar(.5 + t*1.7)
      const material=m.material as THREE.MeshBasicMaterial
      material.opacity=(1-t)*.095
    })
  })
  return <group position={[-.25,0,-4.25]}>
    {Array.from({length:8},(_,i)=><mesh key={i} ref={m=>{refs.current[i]=m}} position={[0,6+i*.2,0]}>
      <sphereGeometry args={[.38,9,7]}/>
      <meshBasicMaterial color="#cce8dd" transparent opacity={.1} depthWrite={false}/>
    </mesh>)}
  </group>
}
function Markers({ selected, onSelect }: Pick<WorldProps,'selected'|'onSelect'>) {
  return <group>
    {nodes.map(n=><group key={n.id} position={n.coordinates}>
      <mesh position={[0,-.12,0]} rotation={[-Math.PI/2,0,0]}>
        <ringGeometry args={[.24,.27,36]}/>
        <meshBasicMaterial color={selected===n.id?'#e7ffcb':'#77efcf'} transparent opacity={selected===n.id?.8:.35} side={THREE.DoubleSide}/>
      </mesh>
      <Html center position={[0,.35,0]} distanceFactor={18} zIndexRange={[60,10]}>
        <button type="button" className={'world-marker '+(selected===n.id?'active':'')} onClick={(e)=>{e.stopPropagation();onSelect(n.id)}} aria-label={'Открыть прогноз: '+n.name}>
          <span className="marker-number">{n.number}</span>
          <span className="marker-text">{n.label}</span>
          <span className="marker-dot" />
        </button>
      </Html>
    </group>)}
  </group>
}
function CameraRig({selected,resetKey}: {selected:NodeId|null; resetKey:number}) {
  const {camera} = useThree()
  const controls=useRef<OrbitControlsType>(null)
  const animation=useRef<{position:THREE.Vector3;target:THREE.Vector3;active:boolean} | null>(null)
  useEffect(()=>{
    const node=nodes.find(n=>n.id===selected)
    const target=node?new THREE.Vector3(node.coordinates[0]*.50,1.0,node.coordinates[2]*.5):new THREE.Vector3(0,1.0,0)
    const pos=node? new THREE.Vector3(target.x+15,target.y+14,target.z+19) : new THREE.Vector3(20,17.5,23.5)
    animation.current={position:pos,target,active:true}
  },[selected,resetKey])
  useFrame((_,delta)=>{
    if(!controls.current || !animation.current?.active) return
    const v=animation.current
    const k=1-Math.exp(-delta*3.6)
    camera.position.lerp(v.position,k)
    controls.current.target.lerp(v.target,k)
    controls.current.update()
    if(camera.position.distanceTo(v.position)<.035 && controls.current.target.distanceTo(v.target)<.03)v.active=false
  })
  return <OrbitControls ref={controls} enableDamping dampingFactor={.08} maxPolarAngle={Math.PI*.46} minPolarAngle={Math.PI*.17} minDistance={17} maxDistance={48} screenSpacePanning enablePan rotateSpeed={.55} zoomSpeed={.7} panSpeed={.65} onStart={()=>{if(animation.current)animation.current.active=false}}/>
}
function Scene({year,selected,onSelect,resetKey}: WorldProps) {
  return <>
    <color attach="background" args={['#07161e']} />
    <fog attach="fog" args={['#07161e',35,83]}/>
    <ambientLight intensity={1.35} color="#86b2bc"/>
    <hemisphereLight intensity={1.7} color="#b6e0dc" groundColor="#172a32"/>
    <directionalLight position={[-10,21,17]} intensity={3.0} color="#e5f5ea" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-17} shadow-camera-right={17} shadow-camera-top={17} shadow-camera-bottom={-17} shadow-bias={-.0006} />
    <directionalLight position={[14,6,-9]} intensity={1.4} color="#6cd8c4" />
    <pointLight position={[2,4,-3]} intensity={21} distance={9} color="#ed9e60" />
    <pointLight position={[-6,3,3]} intensity={6} distance={10} color="#5fdfcb" />
    <group>
      <Ground year={year}/>
      <FactoryHall/>
      <Furnace year={year}/>
      <Silos year={year}/>
      <Warehouse year={year}/>
      <Robotics year={year}/>
      <PowerYard year={year}/>
      <ControlCenter year={year}/>
      <Pipework/>
      <FutureExpansion year={year}/>
      <Personnel year={year}/>
      <MaterialFlow year={year}/>
      <AutonomousVehicles year={year}/>
      {Array.from({length:5},(_,i)=><Drone key={i} index={i} year={year}/>)}
      <Steam/>
      <FuturisticOverlays year={year}/>
      <Markers selected={selected} onSelect={onSelect}/>
    </group>
    <gridHelper args={[85,68,'#193844','#122d36']} position={[0,-1.22,0]}/>
    <Sparkles count={38} speed={.15} scale={[29,9,26]} size={1.2} color="#87b7bc" position={[0,2,0]} opacity={.22}/>
    <CameraRig selected={selected} resetKey={resetKey}/>
  </>
}
export function IndustrialWorld(props: WorldProps) {
  return <div className="world-canvas" role="img" aria-label="Интерактивная трёхмерная модель металлургического предприятия будущего">
    <Canvas shadows dpr={[1,1.65]} camera={{position:[20,17.5,23.5],fov:40,near:.1,far:180}} gl={{antialias:true,alpha:false,powerPreference:'high-performance'}} style={{touchAction:'none'}}>
      <Suspense fallback={null}><Scene {...props}/></Suspense>
    </Canvas>
  </div>
}
