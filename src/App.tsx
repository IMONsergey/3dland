import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronRight, Copy, Crosshair, Info, Layers3, Menu, Pause, Play, ShieldAlert, X, Zap } from 'lucide-react'
import { CinematicJourney, journeyChapters } from './components/CinematicJourney'
import { PhotoStage } from './components/PhotoStage'
import { eras, eraInfo, nodeById, nodes, sectors, type Era, type NodeId } from './data/atlas'
import './styles.css'
import './components/workbench.css'
import './components/journey.css'
import './components/experience.css'

const IndustrialWorld = lazy(() => import('./components/IndustrialWorld').then(m => ({default:m.IndustrialWorld})))
const Workbench = lazy(() => import('./components/Workbench').then(m => ({default:m.Workbench})))

type View = 'stage' | 'explore'
function initialYear():Era {
  const value=Number(new URLSearchParams(window.location.search).get('year'))
  return value===2035 || value===2040 ? value : 2030
}
function initialNode():NodeId|null {
  const id=new URLSearchParams(window.location.search).get('node') as NodeId|null
  return id&&nodeById[id]?id:null
}
function initialView():View {
  const params=new URLSearchParams(window.location.search)
  return params.get('mode')==='explore'||initialNode()?'explore':'stage'
}
function Wordmark(){
  return <span className="brand-lockup" aria-label="Завод 2040"><span className="brand-symbol" aria-hidden="true"><i/><i/><i/><i/></span><span className="brand-word">ЗАВОД<span>2040</span></span></span>
}

export default function App(){
  const [year,setYear]=useState<Era>(initialYear)
  const [selected,setSelected]=useState<NodeId|null>(initialNode)
  const [view,setView]=useState<View>(initialView)
  const [tab,setTab]=useState<'opportunity'|'risk'>('opportunity')
  const [resetKey,setResetKey]=useState(0)
  const [journeyActive,setJourneyActive]=useState(false)
  const [journeyStep,setJourneyStep]=useState(0)
  const [atlasOpen,setAtlasOpen]=useState(false)
  const [aboutOpen,setAboutOpen]=useState(false)
  const [sectorsOpen,setSectorsOpen]=useState(false)
  const [menuOpen,setMenuOpen]=useState(false)
  const [showAllMarkers,setShowAllMarkers]=useState(false)
  const [playing,setPlaying]=useState(false)
  const [toast,setToast]=useState('')

  const node=selected?nodeById[selected]:null
  const forecast=node?.forecast[year]
  const index=useMemo(()=>nodes.findIndex(n=>n.id===selected),[selected])
  const hero=!journeyActive&&view==='stage'
  const explorer=!journeyActive&&view==='explore'

  const focus=(id:NodeId)=>{
    setView('explore')
    setSelected(id)
    setTab('opportunity')
    setMenuOpen(false)
  }
  const closeCard=()=>{setSelected(null);setTab('opportunity');setResetKey(k=>k+1)}
  const toHome=()=>{
    setView('stage');setJourneyActive(false);setSelected(null);setYear(2030)
    setMenuOpen(false);setPlaying(false);setTab('opportunity')
    setResetKey(k=>k+1)
  }
  const openExplore=()=>{
    setJourneyActive(false);setView('explore');setSelected(null)
    setMenuOpen(false);setPlaying(false);setResetKey(k=>k+1)
  }
  const startJourney=()=>{
    setView('stage');setMenuOpen(false);setJourneyActive(true);setJourneyStep(0)
    setSelected(null);setPlaying(false);setYear(journeyChapters[0].year)
  }
  const goChapter=(step:number)=>{
    const c=journeyChapters[step]
    if(!c)return
    setJourneyStep(step);setYear(c.year)
    setTab(c.risk?'risk':'opportunity')
  }
  const exitJourney=()=>{
    setJourneyActive(false);setView('stage');setSelected(null);setMenuOpen(false)
  }
  const openAtlas=()=>{
    setJourneyActive(false);setAtlasOpen(true);setAboutOpen(false);setSectorsOpen(false)
    setMenuOpen(false);setPlaying(false)
  }
  const switchNode=(direction:number)=>{
    const pos=(index+direction+nodes.length)%nodes.length
    focus(nodes[pos].id)
  }

  useEffect(()=>{
    const next=new URL(window.location.href)
    next.searchParams.set('year',String(year))
    if(selected && view==='explore') next.searchParams.set('node',selected)
    else next.searchParams.delete('node')
    if(view==='explore')next.searchParams.set('mode','explore')
    else next.searchParams.delete('mode')
    window.history.replaceState({},'',next.pathname+next.search+next.hash)
  },[year,selected,view])
  useEffect(()=>{
    const onKey=(event:KeyboardEvent)=>{
      if(atlasOpen||journeyActive)return
      if(event.target instanceof HTMLElement && event.target.closest('input,textarea,select,[contenteditable]'))return
      if(event.key==='Escape'){
        if(aboutOpen)setAboutOpen(false)
        else if(sectorsOpen)setSectorsOpen(false)
        else if(menuOpen)setMenuOpen(false)
        else if(view==='explore')closeCard()
      }
      if(!aboutOpen&&!sectorsOpen&&['ArrowLeft','ArrowRight'].includes(event.key)){
        setPlaying(false)
        setYear(current=>eras[Math.max(0,Math.min(2,eras.indexOf(current)+(event.key==='ArrowLeft'?-1:1)))])
      }
    }
    window.addEventListener('keydown',onKey)
    return()=>window.removeEventListener('keydown',onKey)
  },[atlasOpen,journeyActive,aboutOpen,sectorsOpen,menuOpen,view])
  useEffect(()=>{
    if(!playing||journeyActive||atlasOpen)return
    const timer=window.setTimeout(()=>{
      if(year===2040){setPlaying(false);return}
      setYear(eras[eras.indexOf(year)+1])
    },2800)
    return()=>window.clearTimeout(timer)
  },[playing,year,journeyActive,atlasOpen])
  useEffect(()=>{
    if(!toast)return
    const timer=window.setTimeout(()=>setToast(''),2600)
    return()=>window.clearTimeout(timer)
  },[toast])
  const share=async()=>{
    try{await navigator.clipboard.writeText(window.location.href);setToast('Ссылка скопирована')}
    catch{setToast('Скопируйте адрес страницы')}
  }

  return <div className={'app-shell era-'+year+' view-'+view+(node&&explorer?' viewing-node':'')+(journeyActive?' journey-active':'')}>
    {hero&&<PhotoStage year={year}/>}
    {explorer&&<div className="scene-space">
      <Suspense fallback={<div className="scene-loading" role="status"><span className="loader-dot"/>Загружаем интерактивный завод</div>}>
        <IndustrialWorld year={year} selected={selected} onSelect={focus} resetKey={resetKey} showAllMarkers={showAllMarkers} riskView={tab==='risk'} paused={atlasOpen||aboutOpen||sectorsOpen}/>
      </Suspense>
    </div>}
    {explorer&&<div className="scene-vignette" aria-hidden="true"/>}

    {!journeyActive&&<header className="site-header">
      <button className="header-logo" onClick={toHome} aria-label="Главная"><Wordmark/></button>
      <nav className="header-nav" aria-label="Навигация">
        <button className={hero?'current':''} onClick={toHome}>Главная</button>
        <button className={explorer?'current':''} onClick={openExplore}>3D-завод</button>
        <button onClick={openAtlas}>Атлас прогнозов <ArrowUpRight size={15}/></button>
      </nav>
      <div className="header-right">
        <button className="header-sector" onClick={()=>setSectorsOpen(true)}><span className="status-dot"/>Металлургия<ChevronDown size={15}/></button>
        <button className="header-about" onClick={()=>setAboutOpen(true)}>О проекте</button>
      </div>
      <button className="mobile-menu-button" aria-label={menuOpen?'Закрыть меню':'Открыть меню'} onClick={()=>setMenuOpen(v=>!v)}>{menuOpen?<X size={24}/>:<Menu size={24}/>}</button>
    </header>}

    {hero&&<>
      <main className="hero-content">
        <div className="hero-eyebrow"><span className="eyebrow-line"/> ИНТЕРАКТИВНЫЙ АТЛАС БУДУЩЕГО</div>
        <h1><span>ЗАВОД</span><strong>2040</strong></h1>
        <p className="hero-statement">Будущее промышленности не ждут. <em>Его создают.</em></p>
        <p className="hero-description">Исследуйте новые технологии производства — и риски, которые появляются вместе с ними.</p>
        <div className="hero-actions">
          <button className="primary-action" onClick={startJourney}>НАЧАТЬ ПУТЕШЕСТВИЕ <ArrowUpRight size={21}/></button>
          <button className="secondary-action" onClick={openExplore}>Свободный 3D-обзор <ArrowRight size={17}/></button>
        </div>
      </main>
      <div className="hero-edge-caption"><span>01 / 06</span> МЕТАЛЛУРГИЧЕСКОЕ ПРОИЗВОДСТВО</div>
      <div className="hero-chapter-line"><span className="small-orbit"/>ЧЕТЫРЕ ГЛАВЫ О ПРОМЫШЛЕННОСТИ БУДУЩЕГО <ArrowDown size={15}/></div>
    </>}

    {explorer&&<>
      {!node&&<div className="explore-intro">
        <div className="explore-eyebrow"><span className="eyebrow-line"/> СВОБОДНОЕ ИССЛЕДОВАНИЕ</div>
        <h1>Исследуйте<br/><em>производство.</em></h1>
        <p>Поверните сцену, приблизьте оборудование или выберите отмеченный узел, чтобы открыть прогноз.</p>
        <button className="explore-return" onClick={startJourney}>Пройти путешествие <ArrowUpRight size={16}/></button>
      </div>}
      {node&&forecast&&<section className="detail-card" aria-label={'Прогноз: '+node.name} key={node.id}>
        <div className="detail-heading">
          <span className="detail-kicker"><span className="detail-index">{node.number}</span> / {String(nodes.length).padStart(2,'0')} <span className="detail-dot">·</span> {node.category}</span>
          <button className="detail-close" onClick={closeCard} aria-label="Закрыть прогноз"><X size={21}/></button>
        </div>
        <h2>{node.name}</h2>
        <p className="detail-subtitle">{node.level} <span>·</span> {year}</p>
        <div className="detail-tabs" role="tablist" aria-label="Слой исследования">
          <button role="tab" aria-selected={tab==='opportunity'} className={tab==='opportunity'?'active':''} onClick={()=>setTab('opportunity')}><Zap size={15}/> Возможность</button>
          <button role="tab" aria-selected={tab==='risk'} className={tab==='risk'?'active risk':''} onClick={()=>setTab('risk')}><ShieldAlert size={15}/> Киберриск</button>
        </div>
        <div className={'detail-story '+(tab==='risk'?'risk-mode':'')} key={node.id+'-'+year+'-'+tab}>
          <p className="detail-story-label">{tab==='risk'?'Новая граница доверия':'Технология / '+year}</p>
          <h3>{tab==='risk'?'Что может пойти не так?':forecast.signal}</h3>
          <p>{tab==='risk'?forecast.risk:forecast.opportunity}</p>
        </div>
        <button className="detail-research-link" onClick={openAtlas}>Подробнее в атласе <ArrowUpRight size={18}/></button>
        <div className="detail-footer">
          <button className="detail-share" onClick={share}><Copy size={15}/> Поделиться</button>
          <div className="detail-pagination">
            <span>{String(index+1).padStart(2,'0')} <i>/ {nodes.length}</i></span>
            <button onClick={()=>switchNode(-1)} aria-label="Предыдущий узел"><ArrowLeft size={18}/></button>
            <button onClick={()=>switchNode(1)} aria-label="Следующий узел"><ArrowRight size={18}/></button>
          </div>
        </div>
      </section>}
      <div className="explore-floor"><span className="small-orbit"/> ВЫБЕРИТЕ ОБЪЕКТ НА 3D-МОДЕЛИ</div>
      <div className="explore-tools" aria-label="Управление моделью">
        <button onClick={closeCard} title="Общий вид" aria-label="Общий вид"><Crosshair size={18}/></button>
        <button onClick={()=>setShowAllMarkers(v=>!v)} title="Показать все 14 точек" aria-label={showAllMarkers?'Скрыть дополнительные точки':'Показать все 14 точек'} aria-pressed={showAllMarkers}><Layers3 size={18}/></button>
      </div>
    </>}

    {!journeyActive&&<section className="time-deck" aria-label="Горизонт будущего">
      <span className="deck-label">ГОРИЗОНТ БУДУЩЕГО</span>
      <div className="timeline">{eras.map(point=>
        <button className={'era-button '+(year===point?'active':'')} key={point} onClick={()=>{setPlaying(false);setYear(point)}} aria-pressed={year===point}>{point}</button>
      )}</div>
      <button className="deck-play" onClick={()=>{if(playing)setPlaying(false);else{setYear(2030);setPlaying(true)}}} aria-label={playing?'Остановить':'Проиграть годы'}>{playing?<Pause size={17}/>:<Play size={17}/>}<span>{playing?'Стоп':'Смотреть'}</span></button>
      <span className="deck-caption">{eraInfo[year].title}</span>
    </section>}

    {!journeyActive&&<div className="prototype-tag">НЕЗАВИСИМЫЙ КОНЦЕПТ <span>·</span> 2026</div>}

    <CinematicJourney active={journeyActive} step={journeyStep} onStep={goChapter} onExit={exitJourney} onExplore={openExplore} onAtlas={openAtlas}/>

    {menuOpen&&<nav className="mobile-menu" aria-label="Мобильная навигация">
      <button onClick={toHome}>Главная <ChevronRight size={17}/></button>
      <button onClick={startJourney}>Путешествие <ChevronRight size={17}/></button>
      <button onClick={openExplore}>3D-завод <ChevronRight size={17}/></button>
      <button onClick={openAtlas}>Атлас прогнозов <ChevronRight size={17}/></button>
      <button onClick={()=>{setMenuOpen(false);setAboutOpen(true)}}>О проекте <ChevronRight size={17}/></button>
    </nav>}

    {sectorsOpen&&<div className="modal-backdrop" onClick={()=>setSectorsOpen(false)}>
      <section className="editorial-modal" role="dialog" aria-modal="true" aria-label="Отрасли" onClick={e=>e.stopPropagation()}>
        <div className="modal-top"><span>Производственные миры</span><button aria-label="Закрыть" onClick={()=>setSectorsOpen(false)}><X size={22}/></button></div>
        <h2>Шесть отраслей.<br/><em>Разные сценарии будущего.</em></h2>
        <p>Полноценная интерактивная среда готова для металлургии. Ещё пять отраслей предусмотрены концепцией и пока не разработаны.</p>
        <div className="sector-list">{sectors.map(s=><div key={s.id} className={'sector-list-item '+(s.availability==='live'?'live':'')}>
          <span>{s.code}</span><strong>{s.name}</strong><span>{s.availability==='live'?<><Check size={14}/>Доступна</>:'В планах'}</span>
        </div>)}</div>
        <button className="modal-primary" onClick={()=>setSectorsOpen(false)}>Вернуться <ArrowUpRight size={18}/></button>
      </section>
    </div>}

    {aboutOpen&&<div className="modal-backdrop" onClick={()=>setAboutOpen(false)}>
      <section className="editorial-modal" role="dialog" aria-modal="true" aria-labelledby="about-heading" onClick={e=>e.stopPropagation()}>
        <div className="modal-top"><span>Завод 2040 / о проекте</span><button aria-label="Закрыть" onClick={()=>setAboutOpen(false)}><X size={22}/></button></div>
        <p className="modal-eyebrow"><Info size={16}/> Исследование промышленного будущего</p>
        <h2 id="about-heading">Предприятие,<br/>которого ещё <em>нет.</em></h2>
        <p>Какими станут промышленные технологии в 2030, 2035 и 2040 годах? Что изменится в работе предприятия, какие новые возможности откроются и какие киберфизические риски появятся? Изучайте будущее через пространство и прогнозы.</p>
        <div className="modal-stats"><div><strong>14</strong><span>узлов производства</span></div><div><strong>42</strong><span>сценария</span></div><div><strong>03</strong><span>временных горизонта</span></div></div>
        <p className="modal-disclaimer"><ShieldAlert size={18}/> CGI-визуализации являются концептуальными. Прогнозы иллюстративные, не выражают позицию Kaspersky и требуют отраслевой проверки.</p>
        <button className="modal-primary" onClick={()=>{setAboutOpen(false);startJourney()}}>Начать исследование <ArrowUpRight size={18}/></button>
      </section>
    </div>}

    {atlasOpen&&<Suspense fallback={<div className="lab-loading" role="status">Открываем атлас...</div>}>
      <Workbench open={atlasOpen} initialNode={selected} year={year}
        onYearChange={y=>{setPlaying(false);setYear(y)}}
        onClose={()=>setAtlasOpen(false)}
        onLocate={id=>{focus(id);setAtlasOpen(false)}}/>
    </Suspense>}

    {toast&&<div className="toast"><Check size={16}/>{toast}</div>}
  </div>
}
