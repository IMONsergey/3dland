import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronRight, Copy, Crosshair, Info, Layers3, Menu, Pause, Play, ShieldAlert, X, Zap } from 'lucide-react'
import { IndustrialWorld } from './components/IndustrialWorld'
import { eras, eraInfo, nodeById, nodes, sectors, type Era, type NodeId } from './data/atlas'
import './styles.css'
import './components/workbench.css'

const Workbench = lazy(() => import('./components/Workbench').then(module => ({ default: module.Workbench })))

function initialYear(): Era {
  const parsed = Number(new URLSearchParams(location.search).get('year'))
  return parsed === 2035 || parsed === 2040 ? parsed : 2030
}

function initialNode(): NodeId | null {
  const node = new URLSearchParams(location.search).get('node') as NodeId | null
  return node && nodeById[node] ? node : null
}

function Logo({ light = true }: { light?: boolean }) {
  return <span className={'logo-word '+(light ? 'light' : '')} aria-label="Завод 2040">
    <span className="logo-glyph"><span/><span/><span/><span/></span>
    <span>завод<span className="logo-year">2040</span></span>
  </span>
}

export default function App() {
  const [year, setYear] = useState<Era>(initialYear)
  const [selected, setSelected] = useState<NodeId | null>(initialNode)
  const [tab, setTab] = useState<'opportunity' | 'risk'>('opportunity')
  const [resetKey, setResetKey] = useState(0)
  const [workbenchOpen, setWorkbenchOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sectorsOpen, setSectorsOpen] = useState(false)
  const [allMarkers, setAllMarkers] = useState(false)
  const [tour, setTour] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [toast, setToast] = useState('')

  const node = selected ? nodeById[selected] : null
  const index = useMemo(() => nodes.findIndex(n => n.id === selected), [selected])
  const forecast = node?.forecast[year]

  const focus = (id: NodeId) => {
    setSelected(id)
    setTab('opportunity')
    setMobileMenuOpen(false)
    setSectorsOpen(false)
  }

  const reset = () => {
    setSelected(null)
    setTour(false)
    setResetKey(i => i + 1)
  }

  const openAtlas = () => {
    setMobileMenuOpen(false)
    setAboutOpen(false)
    setSectorsOpen(false)
    setWorkbenchOpen(true)
    setPlaying(false)
  }

  const nextNode = (direction: number) => {
    const next = (index + direction + nodes.length) % nodes.length
    focus(nodes[next].id)
  }

  const beginTour = () => {
    setTour(true)
    focus(nodes[0].id)
  }

  const advanceTour = () => {
    if (index >= nodes.length - 1) { reset(); return }
    nextNode(1)
  }

  useEffect(() => {
    const url = new URL(location.href)
    url.searchParams.set('year', String(year))
    if (selected) url.searchParams.set('node', selected)
    else url.searchParams.delete('node')
    history.replaceState({}, '', url.pathname + url.search + url.hash)
  }, [year, selected])

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (workbenchOpen) return
      if (event.target instanceof HTMLElement && event.target.closest('input,textarea,select,[contenteditable]')) return
      if (event.key === 'Escape') {
        if (aboutOpen) setAboutOpen(false)
        else if (sectorsOpen) setSectorsOpen(false)
        else if (mobileMenuOpen) setMobileMenuOpen(false)
        else reset()
      } else if (!aboutOpen && !sectorsOpen && event.key === 'ArrowLeft') {
        setPlaying(false)
        setYear(y => eras[Math.max(eras.indexOf(y) - 1, 0)])
      } else if (!aboutOpen && !sectorsOpen && event.key === 'ArrowRight') {
        setPlaying(false)
        setYear(y => eras[Math.min(eras.indexOf(y) + 1, eras.length - 1)])
      }
    }
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  }, [aboutOpen, sectorsOpen, mobileMenuOpen, workbenchOpen])

  useEffect(() => {
    if (!playing) return
    const timer = window.setTimeout(() => {
      if (year === 2040) { setPlaying(false); return }
      setYear(eras[eras.indexOf(year) + 1])
    }, 2750)
    return () => window.clearTimeout(timer)
  }, [playing, year])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  const share = async () => {
    try { await navigator.clipboard.writeText(location.href); setToast('Ссылка скопирована') }
    catch { setToast('Ссылка доступна в адресной строке') }
  }

  return <div className={'app-shell era-'+year+(node?' viewing-node':'')}>
    <div className="scene-space">
      <IndustrialWorld
        year={year}
        selected={selected}
        onSelect={focus}
        resetKey={resetKey}
        showAllMarkers={allMarkers}
        riskView={tab === 'risk'}
        paused={workbenchOpen || aboutOpen || sectorsOpen}
      />
    </div>
    <div className="scene-vignette" aria-hidden="true"/>

    <header className="site-header">
      <button className="header-logo" onClick={reset} aria-label="На главную"><Logo/></button>
      <nav className="header-nav" aria-label="Главное меню">
        <button className={!node?'current':''} onClick={reset}>Обзор</button>
        <button className="header-lab" onClick={openAtlas}>Атлас прогнозов <ArrowUpRight size={15}/></button>
        <button onClick={() => setAboutOpen(true)}>О проекте</button>
      </nav>
      <button className="header-sector" onClick={() => setSectorsOpen(true)}>
        <span className="status-dot"/> Металлургия <ChevronDown size={14}/>
      </button>
      <button className="mobile-menu-button" aria-label={mobileMenuOpen?'Закрыть меню':'Открыть меню'} onClick={() => setMobileMenuOpen(v => !v)}>{mobileMenuOpen?<X size={22}/>:<Menu size={22}/>}</button>
    </header>

    {!node && <main className="hero-content">
      <div className="hero-eyebrow"><span className="eyebrow-line"/>Интерактивный проект о будущем промышленности</div>
      <h1>Завод<br/><span>2040</span><span className="hero-stop">.</span></h1>
      <p className="hero-statement">Загляните внутрь предприятия, которое ещё предстоит построить.</p>
      <p className="hero-description">Технологии будущего, меняющие производство. И новые риски, которые они создают.</p>
      <div className="hero-actions">
        <button className="primary-action" onClick={beginTour}>Исследовать завод <ArrowUpRight size={21}/></button>
        <button className="research-launcher" onClick={openAtlas}>Все прогнозы <ArrowRight size={17}/></button>
      </div>
      <div className="hero-footnote"><span>14 точек исследования</span><span className="hero-footnote-divider"/><span>2030–2040</span></div>
    </main>}

    <div className="scene-context">
      <span className="context-counter">01 / 06</span>
      <span>Металлургическое производство</span>
    </div>

    {node && forecast && <section className="detail-card has-selection" aria-label={'Прогноз: '+node.name} key={node.id}>
      <div className="detail-heading">
        <span className="detail-kicker"><span className="detail-index">{node.number}</span> / {String(nodes.length).padStart(2,'0')} <span className="detail-dot">·</span> {node.category}</span>
        <button className="detail-close" onClick={reset} aria-label="Закрыть прогноз"><X size={20}/></button>
      </div>
      <h2>{node.name}</h2>
      <p className="detail-subtitle">{node.level} <span>·</span> {year}</p>
      <div className="detail-tabs" role="tablist" aria-label="Слой исследования">
        <button role="tab" aria-selected={tab==='opportunity'} className={tab==='opportunity'?'active':''} onClick={()=>setTab('opportunity')}><Zap size={15}/> Возможность</button>
        <button role="tab" aria-selected={tab==='risk'} className={tab==='risk'?'active risk':''} onClick={()=>setTab('risk')}><ShieldAlert size={15}/> Киберриск</button>
      </div>
      <div className={'detail-story '+(tab==='risk'?'risk-mode':'')} key={node.id+'-'+year+'-'+tab}>
        <p className="detail-story-label">{tab==='risk'?'На что важно обратить внимание':'Горизонт '+year}</p>
        <h3>{tab==='risk'?'Что может пойти не так?':forecast.signal}</h3>
        <p>{tab==='risk'?forecast.risk:forecast.opportunity}</p>
      </div>
      <button className="detail-research-link" onClick={openAtlas}>Изучить подробнее <ArrowUpRight size={18}/></button>
      <div className="detail-footer">
        <button className="detail-share" onClick={share} title="Скопировать ссылку"><Copy size={16}/> Поделиться</button>
        <div className="detail-pagination">
          <span>{String(index+1).padStart(2,'0')} <i>/ {nodes.length}</i></span>
          <button onClick={()=>nextNode(-1)} aria-label="Предыдущая точка"><ArrowLeft size={18}/></button>
          <button onClick={()=>nextNode(1)} aria-label="Следующая точка"><ArrowRight size={18}/></button>
        </div>
      </div>
    </section>}

    {tour && node && <div className="tour-banner">
      <span>Маршрут исследования</span>
      <span>{String(index+1).padStart(2,'0')} / {nodes.length}</span>
      <button onClick={advanceTour}>{index===nodes.length-1?'Завершить':'Следующая точка'} <ArrowRight size={16}/></button>
    </div>}

    <section className="time-deck" aria-label="Горизонт будущего">
      <div className="deck-label">Выберите год</div>
      <div className="timeline">
        {eras.map((point) => <button className={'era-button '+(year===point?'active':'')} key={point} onClick={()=>{setPlaying(false);setYear(point)}} aria-pressed={year===point}><strong>{point}</strong></button>)}
      </div>
      <button className="deck-play" onClick={() => {if(playing) setPlaying(false);else{setYear(2030);setPlaying(true)}}} title={playing?'Остановить смену эпох':'Посмотреть изменения по годам'}>
        {playing?<Pause size={17}/>:<Play size={17}/>} <span>{playing?'Стоп':'Смотреть'}</span>
      </button>
      <p className="deck-caption">{eraInfo[year].title}</p>
    </section>

    <div className="scene-tools" aria-label="Управление видом">
      <button onClick={reset} title="Общий вид" aria-label="Общий вид"><Crosshair size={18}/></button>
      <button onClick={()=>setAllMarkers(v=>!v)} title={allMarkers?'Скрыть дополнительные точки':'Показать все точки'} aria-label={allMarkers?'Скрыть дополнительные точки':'Показать все точки'} aria-pressed={allMarkers} className={allMarkers?'active':''}><Layers3 size={18}/></button>
    </div>

    <div className="stage-caption"><span className="caption-indicator"/> Поверните модель, чтобы рассмотреть производство</div>
    <div className="prototype-tag">Независимый концепт · 2026</div>

    {mobileMenuOpen && <nav className="mobile-menu" aria-label="Мобильное меню">
      <button onClick={()=>{setMobileMenuOpen(false);reset()}}>Обзор <ChevronRight size={19}/></button>
      <button onClick={openAtlas}>Атлас прогнозов <ChevronRight size={19}/></button>
      <button onClick={()=>{setMobileMenuOpen(false);setSectorsOpen(true)}}>Отрасли <ChevronRight size={19}/></button>
      <button onClick={()=>{setMobileMenuOpen(false);setAboutOpen(true)}}>О проекте <ChevronRight size={19}/></button>
    </nav>}

    {sectorsOpen && <div className="modal-backdrop" onClick={()=>setSectorsOpen(false)}>
      <section className="editorial-modal sectors-modal" role="dialog" aria-modal="true" aria-label="Отрасли" onClick={e=>e.stopPropagation()}>
        <div className="modal-top"><span>Производственные миры</span><button onClick={()=>setSectorsOpen(false)} aria-label="Закрыть"><X size={22}/></button></div>
        <h2>Шесть отраслей.<br/><em>Разные сценарии будущего.</em></h2>
        <p>Прототип подробно исследует металлургию. Остальные отрасли предусмотрены концепцией, но ещё не разработаны.</p>
        <div className="sector-list">
          {sectors.map(s=><div className={'sector-list-item '+(s.availability==='live'?'live':'')} key={s.id}><span>{s.code}</span><strong>{s.name}</strong><span>{s.availability==='live'?<><Check size={15}/> Доступна</>:'В планах'}</span></div>)}
        </div>
        <button className="modal-primary" onClick={()=>setSectorsOpen(false)}>Вернуться к заводу <ArrowUpRight size={18}/></button>
      </section>
    </div>}

    {aboutOpen && <div className="modal-backdrop" onClick={()=>setAboutOpen(false)}>
      <section className="editorial-modal" role="dialog" aria-modal="true" aria-labelledby="about-heading" onClick={e=>e.stopPropagation()}>
        <div className="modal-top"><span>Завод 2040 / О проекте</span><button onClick={()=>setAboutOpen(false)} aria-label="Закрыть"><X size={22}/></button></div>
        <p className="modal-eyebrow"><Info size={16}/> Исследование промышленного будущего</p>
        <h2 id="about-heading">Что изменится<br/>на заводах <em>завтра?</em></h2>
        <p>Производство становится автономнее, но вместе с новыми возможностями появляются новые зависимости. «Завод 2040» предлагает исследовать их в одной интерактивной среде — от доменной печи до промышленной сети.</p>
        <div className="modal-stats"><div><strong>14</strong><span>производственных узлов</span></div><div><strong>42</strong><span>сценария развития</span></div><div><strong>03</strong><span>временных горизонта</span></div></div>
        <p className="modal-disclaimer"><ShieldAlert size={17}/> Иллюстративный концепт. Прогнозы гипотетические и не выражают официальную позицию Kaspersky; для клиентской публикации нужна экспертная проверка.</p>
        <button className="modal-primary" onClick={()=>{setAboutOpen(false);openAtlas()}}>Перейти к прогнозам <ArrowUpRight size={19}/></button>
      </section>
    </div>}

    {workbenchOpen && <Suspense fallback={<div className="lab-loading" role="status">Открываем атлас...</div>}>
      <Workbench
        open={workbenchOpen}
        initialNode={selected}
        year={year}
        onYearChange={y=>{setPlaying(false);setYear(y)}}
        onClose={()=>setWorkbenchOpen(false)}
        onLocate={id=>{focus(id);setWorkbenchOpen(false)}}
      />
    </Suspense>}

    {toast&&<div className="toast"><Check size={16}/>{toast}</div>}
  </div>
}
