import { Component, type ReactNode } from 'react'
import { Cpu, Factory, ShieldAlert } from 'lucide-react'
import { nodes, type NodeId } from '../data/atlas'

type Props={onSelect:(id:NodeId)=>void;selected:NodeId|null}
const points:Record<NodeId,{x:number;y:number}>={
 furnace:{x:54,y:32},casting:{x:28,y:42},robotics:{x:34,y:63},energy:{x:15,y:66},
 logistics:{x:71,y:65},storage:{x:77,y:30},control:{x:54,y:66},perimeter:{x:48,y:82},
 quality:{x:32,y:28},water:{x:87,y:19},rail:{x:47,y:16},network:{x:38,y:19},
 maintenance:{x:24,y:32},emissions:{x:86,y:51}
}
export function FallbackWorld({onSelect,selected}:Props){
 return <div className="world-fallback" aria-label="Схематический план завода в режиме совместимости">
  <div className="fallback-blueprint">
   <div className="fallback-grid" aria-hidden="true"/>
   <div className="fallback-block fb-production"><span>ДОМЕННЫЙ КОМПЛЕКС</span><div/></div>
   <div className="fallback-block fb-casting"><span>ПРОКАТНЫЙ ЦЕХ</span><div/></div>
   <div className="fallback-block fb-storage"><span>СЫРЬЕВОЙ ТЕРМИНАЛ</span><div/></div>
   <div className="fallback-block fb-hall"><span>СКЛАДСКОЙ КОМПЛЕКС</span><div/></div>
   <div className="fallback-block fb-energy"><span>ЭНЕРГОУЗЕЛ</span><div/></div>
   {nodes.map(n=><button
    key={n.id}
    className={'fallback-point '+(selected===n.id?'active':'')}
    style={{left:points[n.id].x+'%',top:points[n.id].y+'%'}}
    onClick={()=>onSelect(n.id)}
    title={n.name}
    aria-label={'Исследовать: '+n.name}
   ><span>{n.number}</span></button>)}
   <div className="fallback-coordinates">FACTORY / 01 <span>●</span> СХЕМА ОБЪЕКТОВ</div>
  </div>
  <div className="fallback-mode-message"><div><Cpu size={18}/><span>РЕЖИМ СОВМЕСТИМОСТИ</span></div><p>3D-графика недоступна в этом браузере. Все 14 точек и исследовательская лаборатория остаются доступными через схему предприятия.</p><div><Factory size={14}/> МЕТАЛЛУРГИЯ <span>·</span> <ShieldAlert size={14}/> 14 ТЕХНОЛОГИЙ</div></div>
 </div>
}
type BoundaryProps={children:ReactNode;onSelect:(id:NodeId)=>void;selected:NodeId|null}
export class WorldErrorBoundary extends Component<BoundaryProps,{failed:boolean}>{
 state={failed:false}
 static getDerivedStateFromError(){return {failed:true}}
 componentDidCatch(error:Error){console.error('3D unavailable, using compatibility mode',error)}
 render(){
  if(this.state.failed)return <FallbackWorld onSelect={this.props.onSelect} selected={this.props.selected}/>
  return this.props.children
 }
}
export function hasWebGL(){
 try{
  const canvas=document.createElement('canvas')
  return !!(canvas.getContext('webgl2',{antialias:false}) || canvas.getContext('webgl'))
 }catch{return false}
}
