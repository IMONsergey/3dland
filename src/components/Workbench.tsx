import { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronRight, Compass, Cpu, Factory, GitBranch, Globe2, Layers3, Microscope, Search, Shield, ShieldAlert, Target, X } from 'lucide-react'
import { eras, eraInfo, nodeById, nodes, sectors, trackFor, trackNames, type Era, type NodeId, type NodeTrack } from '../data/atlas'
import { research, researchMethod, eraContrast } from '../data/research'

type Mode = 'atlas'|'compare'|'method'
export type WorkbenchProps={
 open:boolean
 onClose:()=>void
 onLocate:(id:NodeId)=>void
 initialNode:NodeId | null
 year:Era
 onYearChange:(year:Era)=>void
}
const categories:Array<{id:'all'|NodeTrack;name:string}>=[
 {id:'all',name:'Все узлы'},{id:'production',name:'Производство'},{id:'automation',name:'Автономизация'},{id:'infrastructure',name:'Инфраструктура'}
]
const threatStages=[
 {code:'01',title:'ТОЧКА ВЗАИМОДЕЙСТВИЯ',icon:Target,key:'entry' as const},
 {code:'02',title:'ГРАНИЦА ДОВЕРИЯ',icon:GitBranch,key:'boundary' as const},
 {code:'03',title:'ФИЗИЧЕСКОЕ ПОСЛЕДСТВИЕ',icon:Activity,key:'effect' as const},
 {code:'04',title:'ПРИНЦИП ЗАЩИТЫ',icon:Shield,key:'safeguard' as const}
]
function Counter({value,total}:{value:number;total:number}){
 return <span className="wb-counter">{String(value).padStart(2,'0')}<i> / {String(total).padStart(2,'0')}</i></span>
}
function ScenarioDiff({year,active,onClick}:{year:Era;active:boolean;onClick:()=>void}) {
 const e=eraContrast[year]
 return <button className={'wb-time-choice '+(active?'active':'')} onClick={onClick} aria-pressed={active}>
  <span className="wb-time-year">{year}</span>
  <span className="wb-time-name">{eraInfo[year].title}</span>
  <ChevronRight size={16}/>
  <span className="wb-time-desc">{e.automation}</span>
 </button>
}
function RiskChain({record}:{record:typeof research[NodeId]}){
 return <div className="wb-risk-chain">
   {threatStages.map((item,i)=>{
    const Icon=item.icon
    return <div key={item.key} className={'wb-chain-node '+(i===3?'protect':'')}>
      <span className="wb-chain-index">{item.code}</span>
      <span className="wb-chain-icon"><Icon size={15}/></span>
      <div className="wb-chain-body"><div className="wb-chain-label">{item.title}</div><p>{record[item.key]}</p></div>
    </div>
   })}
 </div>
}
function HexBackdrop(){
 return <svg className="wb-hex" viewBox="0 0 390 300" fill="none" aria-hidden="true">
  <path d="m200 8 173 100v95L200 294 26 203v-95L200 8Z" stroke="currentColor" strokeWidth="1"/>
  <path d="m200 36 147 85v68L200 273 53 189v-68L200 36Z" stroke="currentColor" strokeWidth="1" strokeDasharray="3 9"/>
  <path d="m200 67 119 67v43L200 248 81 177v-43L200 67Z" stroke="currentColor" opacity=".4"/>
  <path d="M200 8v286M26 108l347 95M373 108 26 203" stroke="currentColor" strokeDasharray="2 12" opacity=".22"/>
  <circle cx="200" cy="154" r="8" fill="currentColor"/><circle cx="200" cy="154" r="47" stroke="currentColor" opacity=".5"/>
 </svg>
}
export function Workbench({open,onClose,onLocate,initialNode,year,onYearChange}:WorkbenchProps){
 const [mode,setMode]=useState<Mode>('atlas')
 const [nodeId,setNodeId]=useState<NodeId>(initialNode??'furnace')
 const [filter,setFilter]=useState<'all'|NodeTrack>('all')
 const [query,setQuery]=useState('')
 const [listOpen,setListOpen]=useState(false)
 const current=nodeById[nodeId]
 const record=research[nodeId]
 const activeIndex=nodes.findIndex(n=>n.id===nodeId)
 const filtered=useMemo(()=>nodes.filter(n=>{
   const text=[n.name,n.label,n.category,n.forecast[year].signal,research[n.id].system].join(' ').toLocaleLowerCase('ru')
   return (filter==='all'||trackFor(n.id)===filter)&&text.includes(query.trim().toLocaleLowerCase('ru'))
 }),[filter,query,year])
 useEffect(()=>{if(open && initialNode)setNodeId(initialNode)},[open,initialNode])
 useEffect(()=>{
  if(!open)return
  const onKey=(e:KeyboardEvent)=>{
   if(e.key==='Escape'){e.preventDefault();onClose()}
  }
  window.addEventListener('keydown',onKey)
  return()=>window.removeEventListener('keydown',onKey)
 },[open,onClose])
 if(!open)return null
 const select=(id:NodeId)=>{setNodeId(id);setListOpen(false)}
 const step=(delta:number)=>select(nodes[(activeIndex+delta+nodes.length)%nodes.length].id)
 return <section className="wb-root" role="dialog" aria-modal="true" aria-label="Исследовательская лаборатория Завод 2040">
    <header className="wb-header">
      <div className="wb-brand"><span className="wb-brand-icon"><Microscope size={20}/></span><div><strong>ЛАБОРАТОРИЯ БУДУЩЕГО</strong><small>ЗАВОД 2040 / ИССЛЕДОВАТЕЛЬСКИЙ АТЛАС</small></div></div>
      <nav className="wb-navigation" aria-label="Разделы лаборатории">
        <button className={mode==='atlas'?'active':''} onClick={()=>setMode('atlas')}><Layers3 size={15}/> АТЛАС УЗЛОВ</button>
        <button className={mode==='compare'?'active':''} onClick={()=>setMode('compare')}><GitBranch size={15}/> СРАВНЕНИЕ ЭПОХ</button>
        <button className={mode==='method'?'active':''} onClick={()=>setMode('method')}><BookOpen size={15}/> МЕТОДОЛОГИЯ</button>
      </nav>
      <button className="wb-close" aria-label="Вернуться на завод" onClick={onClose}><span>ВЕРНУТЬСЯ НА ЗАВОД</span><X size={20}/></button>
    </header>
    <div className="wb-layout">
      <aside className={'wb-sidebar '+(listOpen?'open':'')}>
        <div className="wb-sidebar-top">
          <div className="wb-sidebar-eyebrow"><span className="wb-signal"/> КАТАЛОГ ПРОГНОЗОВ <Counter value={nodes.length} total={nodes.length}/></div>
          <label className="wb-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Найти технологию или систему" aria-label="Поиск по узлам"/>{query&&<button aria-label="Очистить поиск" onClick={()=>setQuery('')}><X size={14}/></button>}</label>
          <div className="wb-filters" aria-label="Тип производственного узла">{categories.map(c=><button className={filter===c.id?'active':''} key={c.id} onClick={()=>setFilter(c.id)}>{c.name}</button>)}</div>
        </div>
        <div className="wb-node-list" role="list" aria-label="Производственные узлы">
         {filtered.map(n=><button role="listitem" key={n.id} className={'wb-node-link '+(nodeId===n.id?'active':'')} onClick={()=>select(n.id)}>
           <span className="wb-node-no">{n.number}</span><span className="wb-node-name"><strong>{n.name}</strong><small>{trackNames[trackFor(n.id)]}</small></span><ArrowUpRight size={15}/>
         </button>)}
         {!filtered.length&&<div className="wb-no-results">По запросу ничего не найдено. Попробуйте другое название или сбросьте фильтр.</div>}
        </div>
        <div className="wb-sidebar-bottom"><Globe2 size={17}/><span>01 / 06</span><strong>МЕТАЛЛУРГИЯ</strong><span className="wb-muted">ДОСТУПНА</span></div>
      </aside>
      <div className="wb-content">
       <div className="wb-mobile-control"><button onClick={()=>setListOpen(v=>!v)}><Layers3 size={16}/> КАТАЛОГ УЗЛОВ <ChevronRight size={16}/></button><button onClick={onClose}><X size={18}/></button></div>
       {mode==='atlas'&&<div className="wb-editorial" key={nodeId}>
        <div className="wb-breadcrumb"><span>АТЛАС</span><ChevronRight size={12}/><span>МЕТАЛЛУРГИЯ</span><ChevronRight size={12}/><span className="wb-breadcrumb-current">УЗЕЛ {current.number}</span></div>
        <div className="wb-editorial-hero"><HexBackdrop/><span className="wb-top-index">{current.number}<i> / 14</i></span><div className="wb-type-indicator"><span className="wb-type-dot"/>{current.category}</div>
          <h2>{current.name}</h2><p>{record.thesis}</p>
          <div className="wb-hero-actions"><button className="wb-action-main" onClick={()=>onLocate(nodeId)}><Compass size={17}/> НАЙТИ НА ЗАВОДЕ <ArrowUpRight size={16}/></button><div><button aria-label="Предыдущий узел" onClick={()=>step(-1)}><ArrowLeft size={19}/></button><button aria-label="Следующий узел" onClick={()=>step(1)}><ArrowRight size={19}/></button></div></div>
        </div>
        <div className="wb-section-heading"><div><span>01 / ВРЕМЕННАЯ ТРАЕКТОРИЯ</span><h3>Три стадии одной технологии</h3></div><span>ПРОГНОСТИЧЕСКАЯ МОДЕЛЬ</span></div>
        <div className="wb-scenario-years">{eras.map(y=><ScenarioDiff key={y} year={y} active={year===y} onClick={()=>onYearChange(y)}/>)}</div>
        <div className="wb-opportunity-risk" key={nodeId+'-'+year}>
          <article className="wb-story-block opportunity">
            <div className="wb-story-heading"><ZapIcon/><span>ВОЗМОЖНОСТЬ / {year}</span></div>
            <h4>{current.forecast[year].signal}</h4><p>{current.forecast[year].opportunity}</p>
          </article>
          <article className="wb-story-block risk">
            <div className="wb-story-heading"><ShieldAlert size={17}/><span>КИБЕРФИЗИЧЕСКИЙ РИСК / {year}</span></div>
            <h4>Что меняется в границах доверия</h4><p>{current.forecast[year].risk}</p>
          </article>
        </div>
        <div className="wb-notebook">
          <div className="wb-notebook-label"><span className="wb-notebook-symbol">?</span>ВОПРОС К ЭКСПЕРТАМ</div><p>{record.question}</p>
        </div>
        <div className="wb-technical-notes"><span>СИСТЕМЫ И ОБОРУДОВАНИЕ</span><p>{record.system}</p></div>
       </div>}
       {mode==='compare'&&<div className="wb-comparison" key={nodeId}>
        <div className="wb-breadcrumb"><span>ЛАБОРАТОРИЯ</span><ChevronRight size={12}/><span>СРАВНЕНИЕ ЭПОХ</span></div>
        <div className="wb-compare-head"><span className="wb-top-index">2030—2040</span><h2>Как изменится<br/><em>{current.name.toLocaleLowerCase('ru')}?</em></h2>
          <p>Три гипотезы развития одной системы. Сравните не только возможности, но и новые зависимости, которые возникают при повышении автономности.</p>
          <button onClick={()=>setMode('atlas')} className="wb-text-button">ВЕРНУТЬСЯ К ИССЛЕДОВАНИЮ <ArrowUpRight size={15}/></button>
        </div>
        <div className="wb-compare-grid">{eras.map((y,i)=><article key={y} className={'wb-compare-column '+(year===y?'active':'')}>
          <div className="wb-compare-era"><span>0{i+1} / ВРЕМЕННОЙ ГОРИЗОНТ</span><strong>{y}</strong><small>{eraInfo[y].title}</small></div>
          <div className="wb-compare-section"><span>ТЕХНОЛОГИЧЕСКИЙ СДВИГ</span><h3>{current.forecast[y].signal}</h3><p>{current.forecast[y].opportunity}</p></div>
          <div className="wb-compare-section danger"><span><ShieldAlert size={14}/> НОВАЯ ЗАВИСИМОСТЬ</span><p>{current.forecast[y].risk}</p></div>
          <div className="wb-compare-section"><span>РОЛЬ ЧЕЛОВЕКА</span><p>{eraContrast[y].role}</p></div>
          <button className="wb-compare-select" onClick={()=>{onYearChange(y);setMode('atlas')}}>{year===y?<><Check size={16}/> ТЕКУЩИЙ ГОРИЗОНТ</>:<>ИССЛЕДОВАТЬ {y} <ArrowUpRight size={16}/></>}</button>
        </article>)}</div>
        <div className="wb-compare-disclaimer"><Shield size={18}/> Временные горизонты — аналитические гипотезы, а не подтверждённые предсказания. Иллюстративные примеры требуют отраслевой экспертизы.</div>
       </div>}
       {mode==='method'&&<div className="wb-method">
        <div className="wb-breadcrumb"><span>ЛАБОРАТОРИЯ</span><ChevronRight size={12}/><span>МЕТОДОЛОГИЯ</span></div>
        <span className="wb-top-index">О ПОДХОДЕ</span><h2>Будущее<br/>можно исследовать.<br/><em>Не обязательно угадывать.</em></h2>
        <p className="wb-method-lead">«Завод 2040» связывает развитие технологий, промышленные зависимости и киберфизические риски. Каждый сценарий состоит из четырёх логических слоёв.</p>
        <div className="wb-method-grid">{researchMethod.map((step,i)=><div className="wb-method-step" key={step.index}><span>{step.index}</span><div className="wb-method-icon">{i===0?<Cpu/>:i===1?<GitBranch/>:i===2?<ShieldAlert/>:<Shield/>}</div><h3>{step.title}</h3><p>{step.text}</p></div>)}</div>
        <div className="wb-section-heading"><div><span>02 / ОТРАСЛЕВЫЕ МИРЫ</span><h3>От одного завода — к шести отраслям</h3></div></div>
        <div className="wb-sector-grid">{sectors.map(s=><div key={s.id} className={'wb-sector-card '+(s.availability==='live'?'live':'planned')}><div><span>{s.code} / 06</span><span>{s.availability==='live'?'ДОСТУПНО':'ЗАПЛАНИРОВАНО'}</span></div><Factory size={28}/><h4>{s.name}</h4><p>{s.availability==='live'?'Работающая сцена с узлами, прогнозами и моделью рисков.':'Отдельная производственная сцена и экспертные прогнозы ещё не подготовлены.'}</p></div>)}</div>
        <div className="wb-method-disclaimer"><ShieldAlert size={18}/><p>Это демонстрационный исследовательский прототип. Все сценарии носят гипотетический характер, не являются официальными прогнозами Kaspersky и не должны использоваться как инженерная оценка безопасности без экспертной проверки.</p></div>
       </div>}
      </div>
      {mode==='atlas'&&<aside className="wb-inspector">
       <div className="wb-inspector-head"><span><span className="wb-signal"/> МОДЕЛЬ РИСКА</span><span>RISK MAP / {current.number}</span></div>
       <div className="wb-inspector-body">
         <div className="wb-graph-overline">КАК ЦИФРОВОЕ ВЛИЯЕТ НА ФИЗИЧЕСКОЕ</div>
         <RiskChain record={record}/>
         <div className="wb-inspector-section">
           <div className="wb-inspector-title"><Shield size={15}/> КОНТРОЛИ И ОГРАНИЧЕНИЯ</div>
           {record.controls.map((control,i)=><div className="wb-guardrail" key={control}><span>{String(i+1).padStart(2,'0')}</span>{control}</div>)}
         </div>
         <div className="wb-inspector-section wb-links">
           <div className="wb-inspector-title"><GitBranch size={15}/> СВЯЗАННЫЕ СИСТЕМЫ</div>
           {record.related.map(id=><button onClick={()=>select(id)} key={id}><span className="wb-link-dot"/>{nodeById[id].name}<ArrowUpRight size={14}/></button>)}
         </div>
         <div className="wb-inspector-section wb-tags"><div className="wb-inspector-title">КОНТЕКСТ ИССЛЕДОВАНИЯ</div><div>{record.references.map(t=><span key={t}>{t}</span>)}</div></div>
       </div>
       <div className="wb-inspector-footer"><span>14 УЗЛОВ / 42 СЦЕНАРИЯ</span><span>ГИПОТЕЗЫ, НЕ АУДИТ</span></div>
      </aside>}
    </div>
    <div className="wb-bottom"><span><span className="wb-signal"/> ATLAS / INDUSTRIAL FUTURES</span><span>ПРОТОТИП / НЕЗАВИСИМАЯ КОНЦЕПЦИЯ <i>●</i> 2026</span><button onClick={onClose}>СНОВА К 3D-МОДЕЛИ <ArrowUpRight size={14}/></button></div>
 </section>
}
function ZapIcon(){return <Cpu size={17}/>}
