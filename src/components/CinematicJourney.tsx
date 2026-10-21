import { useEffect, useRef } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Mouse, X } from 'lucide-react'
import type { Era, NodeId } from '../data/atlas'

export type Chapter = { number:string; label:string; year:Era; node:NodeId; lines:[string,string]; copy:string; detail:string; risk?:boolean }
export const journeyChapters:Chapter[] = [
  { number:'01',label:'ТЕХНОЛОГИИ',year:2030,node:'furnace',lines:['Будущее','начинается здесь.'],copy:'Домна становится живой системой данных. Цифровой двойник замечает изменения раньше человека — и постепенно начинает влиять на производство.',detail:'От измерения к прогнозированию' },
  { number:'02',label:'АВТОНОМИЯ',year:2035,node:'robotics',lines:['Машины учатся','договариваться.'],copy:'Промышленные роботы больше не просто исполняют команды. Они координируют задачи, адаптируют маршруты и взаимодействуют с производственной линией.',detail:'От команд к взаимодействию' },
  { number:'03',label:'АДАПТАЦИЯ',year:2040,node:'energy',lines:['Завод меняется','сам.'],copy:'Энергия, вода, материалы и производство работают как единая система. Цифровые агенты согласуют процессы в реальном времени.',detail:'От автоматизации к автономии' },
  { number:'04',label:'КИБЕРФИЗИЧЕСКОЕ БУДУЩЕЕ',year:2040,node:'network',lines:['Новая сила.','Новая уязвимость.'],copy:'Чем теснее связаны физические процессы и цифровые решения, тем важнее понимать, кому и чему разрешено управлять будущим.',detail:'От возможностей к доверию',risk:true },
]

type Props={active:boolean;step:number;onStep:(value:number)=>void;onExit:()=>void;onExplore:()=>void;onAtlas:()=>void}
export function CinematicJourney({active,step,onStep,onExit,onExplore,onAtlas}:Props){
  const lastAction=useRef(0)
  useEffect(()=>{
    if(!active)return
    const move=(dir:number)=>{
      const now=Date.now()
      if(now-lastAction.current<750)return
      const target=Math.max(0,Math.min(journeyChapters.length-1,step+dir))
      if(target!==step){lastAction.current=now;onStep(target)}
    }
    const onWheel=(event:WheelEvent)=>{
      if(Math.abs(event.deltaY)<9)return
      event.preventDefault()
      event.stopPropagation()
      move(Math.sign(event.deltaY))
    }
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();onExit();return}
      if(['ArrowDown','ArrowRight','PageDown',' '].includes(event.key)){event.preventDefault();event.stopImmediatePropagation();move(1)}
      if(['ArrowUp','ArrowLeft','PageUp'].includes(event.key)){event.preventDefault();event.stopImmediatePropagation();move(-1)}
    }
    let touchStart:number|null=null
    const onTouchStart=(event:TouchEvent)=>{touchStart=event.touches[0]?.clientY??null}
    const onTouchEnd=(event:TouchEvent)=>{
      if(touchStart===null)return
      const dy=touchStart-(event.changedTouches[0]?.clientY??touchStart)
      if(Math.abs(dy)>45){event.preventDefault();move(Math.sign(dy))}
      touchStart=null
    }
    window.addEventListener('wheel',onWheel,{capture:true,passive:false})
    window.addEventListener('keydown',onKey,true)
    window.addEventListener('touchstart',onTouchStart,{capture:true,passive:true})
    window.addEventListener('touchend',onTouchEnd,{capture:true,passive:false})
    return()=>{
      window.removeEventListener('wheel',onWheel,true)
      window.removeEventListener('keydown',onKey,true)
      window.removeEventListener('touchstart',onTouchStart,true)
      window.removeEventListener('touchend',onTouchEnd,true)
    }
  },[active,step,onStep,onExit])
  if(!active)return null
  const chapter=journeyChapters[step]
  return <section className={'journey journey-step-'+step} aria-label="Путешествие в будущее производства">
    <header className="journey-top">
      <div className="journey-eyebrow"><span className="journey-dot"/> ЗАВОД 2040 <span>/</span> ИНТЕРАКТИВНОЕ ПУТЕШЕСТВИЕ</div>
      <button className="journey-exit" onClick={onExit}>Завершить <X size={18}/></button>
    </header>
    <div className="journey-copy" key={step}>
      <span className="journey-kicker">{chapter.number} / 04 <i/> {chapter.label}</span>
      <h2>{chapter.lines[0]}<br/><em>{chapter.lines[1]}</em></h2>
      <p>{chapter.copy}</p>
      <div className="journey-detail">{chapter.detail}</div>
      {step===3&&<div className="journey-actions">
        <button onClick={onExplore}>Свободное исследование <ArrowUpRight size={18}/></button>
        <button onClick={onAtlas}>Открыть атлас прогнозов <ArrowRight size={16}/></button>
      </div>}
    </div>
    <footer className="journey-bottom">
      <div className="journey-progress">
        <span>ГЛАВА {chapter.number}—04</span>
        <div>{journeyChapters.map((c,i)=><button key={c.number} onClick={()=>onStep(i)} aria-label={'Глава '+c.number} className={i<=step?'active':''}><span/></button>)}</div>
      </div>
      <div className="journey-scroll"><Mouse size={16}/> Прокрутите, чтобы продолжить <ArrowDown size={15}/></div>
      <div className="journey-controls">
        <button onClick={()=>step===0?onExit():onStep(step-1)} aria-label="Предыдущая глава"><ArrowLeft size={20}/></button>
        <button onClick={()=>step===3?onExplore():onStep(step+1)} aria-label="Следующая глава"><ArrowRight size={20}/></button>
      </div>
    </footer>
    <div className="journey-ghost-year" aria-hidden="true">{chapter.year}</div>
  </section>
}
