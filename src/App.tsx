import { useEffect, useMemo, useState } from 'react'
import { ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronRight, Compass, Copy, Crosshair, Eye, Factory, GitBranch, Info, Layers3, Menu, MousePointer2, RotateCcw, ShieldAlert, X, Zap } from 'lucide-react'
import { IndustrialWorld } from './components/IndustrialWorld'
import { eras, eraInfo, nodeById, nodes, sectors, type Era, type NodeId } from './data/atlas'
import './styles.css'

function getInitialYear(): Era {
  const year = Number(new URLSearchParams(window.location.search).get('year'))
  return year === 2035 || year === 2040 ? year : 2030
}
function getInitialNode(): NodeId | null {
  const id = new URLSearchParams(window.location.search).get('node') as NodeId | null
  return id && nodeById[id] ? id : null
}
function BrandMark() {
  return <svg viewBox="0 0 45 45" fill="none" aria-hidden="true">
    <path d="M22.5 2.5 42.5 14v17L22.5 42.5 2.5 31V14L22.5 2.5Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="m22.5 12 11 6.4v8.2l-11 6.4-11-6.4v-8.2L22.5 12Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M22.5 2.5V12m0 21v9.5M2.5 14l9 4.4M42.5 14l-9 4.4M2.5 31l9-4.4m31 4.4-9-4.4" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="22.5" cy="22.5" r="3.5" fill="currentColor"/>
  </svg>
}
function ButtonKey({children}: {children: React.ReactNode}) {
  return <kbd className="key">{children}</kbd>
}
function App() {
  const [year,setYear] = useState<Era>(getInitialYear)
  const [selected,setSelected] = useState<NodeId | null>(getInitialNode)
  const [activeTab,setActiveTab] = useState<'opportunity'|'risk'>('opportunity')
  const [resetKey,setResetKey] = useState(0)
  const [sectorOpen,setSectorOpen] = useState(false)
  const [aboutOpen,setAboutOpen] = useState(false)
  const [mobileMenu,setMobileMenu] = useState(false)
  const [toast,setToast] = useState('')
  const [tourMode,setTourMode] = useState(false)
  const selectedNode = selected ? nodeById[selected] : null
  const currentIndex = useMemo(()=>nodes.findIndex(n=>n.id===selected),[selected])
  const forecast = selectedNode?.forecast[year]
  const focusNode = (id:NodeId) => {
    setSelected(id)
    setActiveTab('opportunity')
    setSectorOpen(false)
    setMobileMenu(false)
  }
  const resetView = () => {
    setSelected(null)
    setTourMode(false)
    setResetKey(k=>k+1)
  }
  const stepNode = (direction:number) => {
    const index = (currentIndex+direction+nodes.length) % nodes.length
    focusNode(nodes[index].id)
  }
  const startTour = () => {
    setTourMode(true)
    focusNode(nodes[0].id)
  }
  const nextTour = () => {
    if(!tourMode){startTour();return}
    if(currentIndex===nodes.length-1){setTourMode(false);resetView();return}
    stepNode(1)
  }
  useEffect(()=>{
    const next = new URL(window.location.href)
    next.searchParams.set('year',String(year))
    if(selected)next.searchParams.set('node',selected)
    else next.searchParams.delete('node')
    window.history.replaceState({},'',next.pathname+next.search+next.hash)
  },[year,selected])
  useEffect(()=>{
    const onKey = (e:KeyboardEvent)=>{
      if(e.target instanceof HTMLElement && (e.target.matches('input,textarea,select') || e.target.isContentEditable)) return
      if(e.key==='Escape'){
        if(aboutOpen){setAboutOpen(false);return}
        if(sectorOpen){setSectorOpen(false);return}
        resetView()
      }
      if(e.key==='ArrowLeft')setYear(y=>eras[Math.max(0,eras.indexOf(y)-1)])
      if(e.key==='ArrowRight')setYear(y=>eras[Math.min(2,eras.indexOf(y)+1)])
    }
    window.addEventListener('keydown',onKey)
    return ()=>window.removeEventListener('keydown',onKey)
  },[aboutOpen,sectorOpen])
  useEffect(()=>{
    if(!toast)return
    const timer=window.setTimeout(()=>setToast(''),2700)
    return ()=>window.clearTimeout(timer)
  },[toast])
  const share = async()=>{
    try{
      await navigator.clipboard.writeText(window.location.href)
      setToast('Ссылка на эту точку скопирована')
    }catch{
      setToast('Скопируйте ссылку из адресной строки')
    }
  }
  const showTitle = selectedNode?.name ?? 'Выберите точку'
  return <div className={'app-shell era-'+year}>
    <div className="ambient ambient-one"/><div className="ambient ambient-two"/>
    <div className="scene-space">
      <IndustrialWorld year={year} selected={selected} onSelect={focusNode} resetKey={resetKey}/>
    </div>
    <div className="scene-shade" aria-hidden="true"/>
    <div className="scene-coordinates" aria-hidden="true">
      <span>55°45′N / 37°37′E</span><span>SIMULATION / 01</span>
    </div>

    <header className="site-header">
      <a href="./" className="brand" aria-label="Завод 2040, начало" onClick={e=>{e.preventDefault();resetView()}}>
        <span className="brand-mark"><BrandMark/></span>
        <span className="brand-name">ЗАВОД <b>2040</b><small>ИНДУСТРИАЛЬНЫЙ АТЛАС БУДУЩЕГО</small></span>
      </a>
      <div className="header-center"><span className="signal-light"/> ИНТЕРАКТИВНОЕ ИССЛЕДОВАНИЕ <span className="header-separator">/</span> ПРОТОТИП 01</div>
      <div className="header-actions">
        <button className="header-link" onClick={()=>setAboutOpen(true)}><Info size={15}/> О ПРОЕКТЕ</button>
        <span className="divider-vertical"/>
        <button className="header-icon-button" title="Вернуть обзор" aria-label="Вернуть обзор" onClick={resetView}><RotateCcw size={17}/></button>
        <button className="mobile-menu-button" title="Открыть меню" aria-label="Открыть меню" onClick={()=>setMobileMenu(v=>!v)}>{mobileMenu?<X/>:<Menu/>}</button>
      </div>
    </header>

    <div className="left-rail" aria-label="Разделы атласа">
      <div className="rail-top"><span className="rail-index">01—06</span><span className="rail-track"/></div>
      <div className="rail-sections">
        <button className="rail-symbol active" title="Исследовать завод" aria-label="Исследовать завод" onClick={resetView}><Factory size={20}/><span className="rail-symbol-glow"/></button>
        <button className="rail-symbol" title="Выбрать отрасль" aria-label="Выбрать отрасль" onClick={()=>setSectorOpen(v=>!v)}><Layers3 size={19}/></button>
        <button className="rail-symbol" title="О проекте" aria-label="О проекте" onClick={()=>setAboutOpen(true)}><Info size={19}/></button>
      </div>
      <span className="rail-bottom">FUTURE INDUSTRY / 2040</span>
    </div>

    <section className="intro" aria-label="Описание проекта">
      <div className="intro-index"><span className="thin-accent"/> ПРОЕКТ 03 <span className="slash">/</span> СЦЕНАРИИ БУДУЩЕГО</div>
      <h1><span>ЗАВОД</span><strong>2040<span className="title-period">.</span></strong></h1>
      <p className="intro-lead">Предприятие будущего начинается здесь.</p>
      <p className="intro-copy">Исследуйте технологии, которые изменят промышленность, и новые киберриски, возникающие вместе с ними.</p>
      <button className="primary-action" onClick={startTour}><span className="action-icon"><ArrowUpRight size={21}/></span><span>НАЧАТЬ ИССЛЕДОВАНИЕ</span><ArrowRight className="action-arrow" size={17}/></button>
      <div className="intro-stats">
        <div><strong>08</strong><span>ТОЧЕК<br/>ИССЛЕДОВАНИЯ</span></div>
        <div className="stat-border"/><div><strong>03</strong><span>ГОРИЗОНТА<br/>БУДУЩЕГО</span></div>
      </div>
      <div className="sector-select-area">
        <div className="mini-label">АКТИВНАЯ ОТРАСЛЬ <span>01 / 06</span></div>
        <button className={'sector-select '+(sectorOpen?'opened':'')} onClick={()=>setSectorOpen(v=>!v)} aria-expanded={sectorOpen}>
          <span className="sector-select-icon"><Factory size={18}/></span><span className="sector-select-title">МЕТАЛЛУРГИЯ<small>Интерактивная модель</small></span><ChevronDown size={17}/>
        </button>
        {sectorOpen && <div className="sector-menu">
          <div className="sector-menu-header">ОТРАСЛЕВЫЕ МИРЫ <button aria-label="Закрыть" onClick={()=>setSectorOpen(false)}><X size={15}/></button></div>
          {sectors.map(sector=><div key={sector.id} className={'sector-option '+(sector.availability==='live'?'available':'unavailable')} aria-disabled={sector.availability==='planned'}>
            <span>{sector.code}</span><span>{sector.name}<small>{sector.description}</small></span><span className={'sector-status '+sector.availability}>{sector.availability==='live'?<Check size={14}/>: 'СКОРО'}</span>
          </div>)}
        </div>}
      </div>
    </section>

    <div className="world-caption">
      <span className="caption-number">FIG. 01</span>
      <span className="caption-line"/>
      <span>МЕТАЛЛУРГИЧЕСКОЕ ПРЕДПРИЯТИЕ<br/>ИНТЕРАКТИВНАЯ МОДЕЛЬ</span>
    </div>

    <section className={'detail-card '+(selectedNode?'has-selection':'is-empty')} aria-label="Прогноз выбранного узла">
      <div className="detail-heading"><span><span className="square-pulse"/> {selectedNode?'ТОЧКА ПРОГНОЗА':'ИССЛЕДОВАНИЕ СЦЕНЫ'}</span><button onClick={selectedNode?resetView:startTour} aria-label={selectedNode?'Закрыть карточку':'Начать исследование'}>{selectedNode?<X size={18}/>:<ArrowUpRight size={18}/>}</button></div>
      {selectedNode && forecast ? <>
        <div className="detail-meta"><span>№ {selectedNode.number}</span><span>{selectedNode.category}</span></div>
        <h2>{showTitle}</h2>
        <div className="detail-subtitle">{selectedNode.level} <span>•</span> {year}</div>
        <div className="detail-tabs" role="tablist" aria-label="Слои прогноза">
          <button role="tab" aria-selected={activeTab==='opportunity'} className={activeTab==='opportunity'?'active':''} onClick={()=>setActiveTab('opportunity')}><Zap size={16}/> ВОЗМОЖНОСТЬ</button>
          <button role="tab" aria-selected={activeTab==='risk'} className={activeTab==='risk'?'active risk':''} onClick={()=>setActiveTab('risk')}><ShieldAlert size={16}/> КИБЕРРИСК</button>
        </div>
        <div className={'detail-story '+(activeTab==='risk'?'risk-mode':'')} key={selectedNode.id+'-'+year+'-'+activeTab}>
          <div className="story-eyebrow"><span className="story-swatch"/>{activeTab==='risk'?'НОВАЯ ПОВЕРХНОСТЬ РИСКА':'ТЕХНОЛОГИЧЕСКИЙ СЦЕНАРИЙ'}</div>
          <h3>{activeTab==='risk'?'Что может пойти не так?':forecast.signal}</h3>
          <p>{activeTab==='risk'?forecast.risk:forecast.opportunity}</p>
          <button className="story-switch" onClick={()=>setActiveTab(v=>v==='opportunity'?'risk':'opportunity')}>{activeTab==='opportunity'?'Посмотреть связанный киберриск':'Вернуться к возможности'} <ArrowUpRight size={15}/></button>
        </div>
        <div className="detail-insight"><span>КЛЮЧЕВОЙ СДВИГ</span><strong>{forecast.insight}</strong></div>
        <div className="detail-footer">
          <span>{String(currentIndex+1).padStart(2,'0')} <span className="muted">/ {String(nodes.length).padStart(2,'0')}</span></span>
          <div className="detail-footer-actions">
            <button aria-label="Скопировать ссылку" title="Скопировать ссылку на прогноз" onClick={share}><Copy size={16}/></button>
            <button aria-label="Предыдущая точка" onClick={()=>stepNode(-1)}><ArrowLeft size={18}/></button>
            <button aria-label="Следующая точка" onClick={()=>stepNode(1)}><ArrowRight size={18}/></button>
          </div>
        </div>
      </> : <>
        <div className="empty-diagram"><div className="empty-diagram-inner"><Crosshair size={32}/></div><span className="empty-orbit orbit-one"/><span className="empty-orbit orbit-two"/></div>
        <h2 className="empty-title">Будущее<br/>в деталях.</h2>
        <p className="empty-copy">Выберите светящуюся точку на заводе — узнайте о технологии и связанных с ней уязвимостях.</p>
        <div className="empty-tip"><MousePointer2 size={15}/> НАЖМИТЕ НА МАРКЕР</div>
        <div className="detail-footer detail-footer-empty"><span>08 ИНТЕРАКТИВНЫХ УЗЛОВ</span><ArrowDownRight size={19}/></div>
      </>}
    </section>

    <div className="scene-tools" aria-label="Управление камерой">
      <button aria-label="Вернуть общий вид" onClick={resetView} title="Общий вид"><Crosshair size={17}/></button>
      <span className="scene-tools-divider"/>
      <button aria-label="Начать маршрут" onClick={startTour} title="Пошаговый маршрут"><GitBranch size={17}/></button>
    </div>
    {tourMode && <div className="tour-banner"><span className="tour-dot"/><span>МАРШРУТ ИССЛЕДОВАНИЯ</span><strong>{String(currentIndex+1).padStart(2,'0')} / 08</strong><button onClick={nextTour}>{currentIndex===nodes.length-1?'ЗАВЕРШИТЬ':'ДАЛЕЕ'} <ArrowRight size={15}/></button></div>}
    <section className="time-deck" aria-label="Горизонт будущего">
      <div className="deck-left"><div className="deck-caption"><span className="deck-light"/><span>ВРЕМЕННАЯ ШКАЛА</span></div><span className="deck-helper">Выберите горизонт</span></div>
      <div className="timeline">
        <span className="timeline-track"/>
        <span className="timeline-progress" style={{width:(eras.indexOf(year)*50)+'%'}}/>
        {eras.map((point,i)=><button key={point} className={'era-button '+(year===point?'active':'')} onClick={()=>setYear(point)} aria-pressed={year===point}>
          <span className="era-dot"><span/></span><strong>{point}</strong><small>{['БЛИЗКОЕ','СРЕДНЕЕ','ДАЛЬНЕЕ'][i]} БУДУЩЕЕ</small>
        </button>)}
      </div>
      <div className="deck-right"><span className="deck-current">0{eras.indexOf(year)+1}<span> / 03</span></span><div className="deck-era-label">{eraInfo[year].title}<small>{eraInfo[year].subtitle}</small></div></div>
    </section>
    <div className="bottom-info"><div><Eye size={16}/><span>ПЕРЕМЕЩАЙТЕ СЦЕНУ МЫШЬЮ <span className="bottom-separator">·</span> ПРИБЛИЖАЙТЕ КОЛЕСОМ</span></div><div className="bottom-keyboard">ГОД <ButtonKey>←</ButtonKey><ButtonKey>→</ButtonKey><span className="bottom-separator">·</span> ОБЗОР <ButtonKey>ESC</ButtonKey></div></div>
    <div className="demo-label">КОНЦЕПТ-ПРОТОТИП <span>·</span> ПРЕДПОЛОЖИТЕЛЬНЫЕ СЦЕНАРИИ</div>
    {mobileMenu && <div className="mobile-menu">
      <button onClick={()=>{setMobileMenu(false);setAboutOpen(true)}}><Info size={18}/>О проекте<ChevronRight/></button>
      <button onClick={()=>{setMobileMenu(false);setSectorOpen(true)}}><Layers3 size={18}/>Отрасли<ChevronRight/></button>
      <button onClick={()=>{setMobileMenu(false);resetView()}}><Compass size={18}/>Общий вид<ChevronRight/></button>
    </div>}
    {aboutOpen && <div className="modal-backdrop" onClick={()=>setAboutOpen(false)} role="presentation">
      <section className="about-modal" role="dialog" aria-modal="true" aria-labelledby="about-title" onClick={e=>e.stopPropagation()}>
        <div className="modal-top"><span>ЗАВОД 2040 <span className="muted">/ О ПРОЕКТЕ</span></span><button onClick={()=>setAboutOpen(false)} aria-label="Закрыть"><X size={21}/></button></div>
        <div className="modal-pictogram"><BrandMark/></div>
        <span className="modal-overline">ПРОМЫШЛЕННОСТЬ × АВТОМАТИЗАЦИЯ × КИБЕРБЕЗОПАСНОСТЬ</span>
        <h2 id="about-title">Будущее создаёт<br/><em>новые возможности.</em><br/>И новые вопросы.</h2>
        <p>«Завод 2040» — экспериментальный интерактивный атлас прогнозов развития промышленных технологий и новых вызовов цифровой безопасности. Исследуйте предприятие, переключайте 2030, 2035 и 2040 годы и открывайте два слоя каждого сценария: возможность и уязвимость.</p>
        <div className="modal-counters"><div><strong>03</strong><span>ГОРИЗОНТА</span></div><div><strong>08</strong><span>УЗЛОВ</span></div><div><strong>06</strong><span>ОТРАСЛЕЙ В КОНЦЕПЦИИ</span></div></div>
        <p className="modal-disclaimer"><ShieldAlert size={18}/> Демонстрационный прототип. Прогнозы являются гипотетическими и не представляют официальную позицию Kaspersky. Доступна детальная сцена металлургии; остальные отрасли запланированы.</p>
        <button className="modal-button" onClick={()=>{setAboutOpen(false);startTour()}}>ИССЛЕДОВАТЬ ЗАВОД <ArrowUpRight size={20}/></button>
      </section>
    </div>}
    {toast && <div className="toast"><Check size={17}/>{toast}</div>}
  </div>
}
export default App
