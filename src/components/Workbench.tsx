import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronRight, Compass, Search, Shield, ShieldAlert, X } from 'lucide-react'
import { eras, eraInfo, nodeById, nodes, sectors, trackFor, trackNames, type Era, type NodeId, type NodeTrack } from '../data/atlas'
import { research, researchMethod, eraContrast } from '../data/research'
import { visualForNode } from './PhotoStage'

type Mode = 'atlas' | 'compare' | 'method'
type Props = {
  open: boolean
  onClose: () => void
  onLocate: (id: NodeId) => void
  initialNode: NodeId | null
  year: Era
  onYearChange: (year: Era) => void
}

const filters: Array<{ id: 'all' | NodeTrack, title: string }> = [
  { id:'all', title:'Все' },
  { id:'production', title:'Производство' },
  { id:'automation', title:'Автоматизация' },
  { id:'infrastructure', title:'Инфраструктура' },
]

export function Workbench({open, onClose, onLocate, initialNode, year, onYearChange}: Props) {
  const [mode, setMode] = useState<Mode>('atlas')
  const [nodeId, setNodeId] = useState<NodeId>(initialNode ?? 'furnace')
  const [filter, setFilter] = useState<'all' | NodeTrack>('all')
  const [query, setQuery] = useState('')
  const [listOpen, setListOpen] = useState(false)
  const current = nodeById[nodeId]
  const record = research[nodeId]
  const currentIndex = nodes.findIndex(n => n.id === nodeId)
  const matches = useMemo(() => nodes.filter(n => {
    const corpus = [n.name,n.label,n.category,n.forecast[year].signal,research[n.id].system].join(' ').toLowerCase()
    return (filter === 'all' || trackFor(n.id) === filter) && corpus.includes(query.toLowerCase().trim())
  }),[filter,query,year])

  useEffect(() => {if (open && initialNode) setNodeId(initialNode)},[open,initialNode])
  useEffect(() => {
    if (!open) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {event.preventDefault(); if(listOpen)setListOpen(false);else onClose()}
    }
    window.addEventListener('keydown',handleKey)
    return () => window.removeEventListener('keydown',handleKey)
  },[open,onClose,listOpen])

  if (!open) return null
  const select = (id:NodeId) => {setNodeId(id);setListOpen(false)}
  const step = (delta:number) => select(nodes[(currentIndex+delta+nodes.length)%nodes.length].id)

  return <section className="wb-root" role="dialog" aria-modal="true" aria-label="Атлас промышленного будущего">
    <header className="wb-header">
      <div className="wb-identity"><span className="wb-brand">завод<span>2040</span></span><span className="wb-slash"/> <span className="wb-section-name">Атлас будущего</span></div>
      <nav className="wb-navigation" aria-label="Разделы атласа">
        <button className={mode==='atlas'?'active':''} onClick={()=>setMode('atlas')}>Прогнозы</button>
        <button className={mode==='compare'?'active':''} onClick={()=>setMode('compare')}>Сравнить годы</button>
        <button className={mode==='method'?'active':''} onClick={()=>setMode('method')}>О методе</button>
      </nav>
      <button className="wb-close" onClick={onClose} aria-label="Закрыть атлас">Закрыть <X size={19}/></button>
    </header>

    <div className="wb-layout">
      <aside className={'wb-sidebar '+(listOpen?'open':'')}>
        <div className="wb-sidebar-head">
          <span>Узлы производства</span>
          <span className="wb-total">{String(nodes.length).padStart(2,'0')}</span>
        </div>
        <label className="wb-search"><Search size={17}/><input aria-label="Поиск по узлам" placeholder="Найти технологию" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button aria-label="Очистить поиск" onClick={()=>setQuery('')}><X size={15}/></button>}</label>
        <div className="wb-filters">{filters.map(f=><button key={f.id} className={filter===f.id?'active':''} onClick={()=>setFilter(f.id)}>{f.title}</button>)}</div>
        <div className="wb-node-list" role="list" aria-label="Исследовательские узлы">
          {matches.map(n=><button key={n.id} role="listitem" onClick={()=>select(n.id)} className={'wb-node-link '+(nodeId===n.id?'active':'')}>
            <span className="wb-node-no">{n.number}</span>
            <span className="wb-node-text"><strong>{n.name}</strong><small>{trackNames[trackFor(n.id)]}</small></span>
            <ChevronRight size={16}/>
          </button>)}
          {!matches.length&&<p className="wb-empty">По вашему запросу ничего не найдено.</p>}
        </div>
        <div className="wb-sidebar-footer"><span className="wb-live-dot"/> Металлургия <span>01 / 06</span></div>
      </aside>

      <main className="wb-main">
        <div className="wb-mobile-control">
          <button onClick={()=>setListOpen(v=>!v)}>Все узлы <ChevronDown size={15}/></button>
          <span>14 прогнозных точек</span>
        </div>
        {mode==='atlas'&&<article className="wb-editorial" key={nodeId}>
          <div className="wb-crumbs">Металлургия <span>/</span> {current.category}</div>
          <div className="wb-article-top">
            <div className="wb-overline"><span className="wb-green-dash"/> Узел {current.number} — 14</div>
            <h1>{current.name}</h1>
            <p className="wb-lead">{record.thesis}</p>
            <div className="wb-hero-actions">
              <button className="wb-action-main" onClick={()=>onLocate(nodeId)}>Показать на заводе <ArrowUpRight size={18}/></button>
              <div className="wb-step-control">
                <button aria-label="Предыдущий узел" onClick={()=>step(-1)}><ArrowLeft size={19}/></button>
                <button aria-label="Следующий узел" onClick={()=>step(1)}><ArrowRight size={19}/></button>
              </div>
            </div>
            <figure className="wb-article-visual">
              <img src={visualForNode(nodeId)} alt={'Концептуальная фотореалистичная визуализация: '+current.name} decoding="async" loading="eager"/>
              <figcaption><span>ПРОМЫШЛЕННОЕ БУДУЩЕЕ / CGI-КОНЦЕПТ</span><span>{current.number}—14</span></figcaption>
            </figure>
          </div>
          <div className="wb-part-title"><span>01 / Сценарий развития</span><p>Выберите временной горизонт</p></div>
          <div className="wb-scenario-years" role="group" aria-label="Выбор года">
            {eras.map(y=><button key={y} className={'wb-time-choice '+(year===y?'active':'')} onClick={()=>onYearChange(y)} aria-pressed={year===y}>
              <strong>{y}</strong><span>{eraInfo[y].title}</span>
            </button>)}
          </div>
          <div className="wb-opportunity-risk" key={nodeId+'-'+year}>
            <section className="wb-story-block opportunity">
              <div className="wb-story-label"><span className="wb-disc"/><span>Возможность</span><span className="wb-year">{year}</span></div>
              <h2>{current.forecast[year].signal}</h2>
              <p>{current.forecast[year].opportunity}</p>
            </section>
            <section className="wb-story-block risk">
              <div className="wb-story-label"><ShieldAlert size={16}/><span>Новый киберриск</span><span className="wb-year">{year}</span></div>
              <h2>Что может пойти не так?</h2>
              <p>{current.forecast[year].risk}</p>
            </section>
          </div>
          <blockquote className="wb-question"><span>Вопрос к экспертам</span><p>«{record.question}»</p></blockquote>
          <details className="wb-deepdive">
            <summary><span className="wb-deepdive-label">02 / Разбор киберриска</span><strong>От цифровой зависимости к физическому последствию</strong><span className="wb-deepdive-action">Развернуть <ChevronDown size={18}/></span></summary>
            <div className="wb-deepdive-content">
              <div className="wb-risk-chain">
                {[
                  {name:'Точка взаимодействия',value:record.entry},
                  {name:'Граница доверия',value:record.boundary},
                  {name:'Возможное последствие',value:record.effect},
                  {name:'Принцип защиты',value:record.safeguard}
                ].map((stage,i)=><div className="wb-chain-node" key={stage.name}>
                  <span className="wb-chain-number">{String(i+1).padStart(2,'0')}</span>
                  <div><h3>{stage.name}</h3><p>{stage.value}</p></div>
                </div>)}
              </div>
              <div className="wb-guardrails">
                <h3><Shield size={19}/> Что помогает ограничить риск</h3>
                {record.controls.map((control,i)=><div className="wb-guardrail" key={control}><span>{String(i+1).padStart(2,'0')}</span>{control}</div>)}
              </div>
            </div>
          </details>
          <div className="wb-related"><div><span>03 / Связанные системы</span><p>{record.system}</p></div><div className="wb-related-list">{record.related.map(id=><button key={id} onClick={()=>select(id)}>{nodeById[id].name} <ArrowUpRight size={15}/></button>)}</div></div>
          <div className="wb-footnote">Гипотетический сценарий. Требуется отраслевая и экспертная верификация.</div>
        </article>}

        {mode==='compare'&&<article className="wb-editorial wb-comparison">
          <div className="wb-crumbs">Атлас <span>/</span> Сравнение временных горизонтов</div>
          <div className="wb-overline"><span className="wb-green-dash"/> 2030 — 2040</div>
          <h1>Одно производство.<br/><em>Три варианта будущего.</em></h1>
          <p className="wb-lead">Как изменится {current.name.toLocaleLowerCase('ru')} — и какие новые зависимости появятся вместе с автоматизацией?</p>
          <div className="wb-compare-grid">
            {eras.map(y=><section className={'wb-compare-column '+(year===y?'active':'')} key={y}>
              <div className="wb-compare-year"><strong>{y}</strong><span>{eraInfo[y].title}</span></div>
              <div className="wb-compare-segment"><span>Технология</span><h2>{current.forecast[y].signal}</h2><p>{current.forecast[y].opportunity}</p></div>
              <div className="wb-compare-segment risk"><span>Уязвимость</span><p>{current.forecast[y].risk}</p></div>
              <div className="wb-compare-segment"><span>Роль человека</span><p>{eraContrast[y].role}</p></div>
              <button className="wb-compare-select" onClick={()=>{onYearChange(y);setMode('atlas')}}>{year===y?'Текущий год':'Исследовать '+y} <ArrowUpRight size={16}/></button>
            </section>)}
          </div>
        </article>}

        {mode==='method'&&<article className="wb-editorial wb-method">
          <div className="wb-crumbs">Атлас <span>/</span> О проекте</div>
          <div className="wb-overline"><span className="wb-green-dash"/> Методология</div>
          <h1>Будущее —<br/><em>это множество сценариев.</em></h1>
          <p className="wb-lead">Вместо прогнозов без контекста мы показываем, как технологии меняют предприятие и какие новые условия необходимы для безопасной работы.</p>
          <div className="wb-method-steps">
            {researchMethod.map((item,i)=><div className="wb-method-step" key={item.index}><span>{item.index}</span><div><h2>{item.title}</h2><p>{item.text}</p></div>{i<3&&<ArrowRight size={18}/>}</div>)}
          </div>
          <div className="wb-part-title"><span>02 / Отраслевые миры</span><p>Платформа может развиваться в шести направлениях</p></div>
          <div className="wb-sector-grid">
            {sectors.map(s=><div key={s.id} className={'wb-sector-card '+(s.availability==='live'?'live':'planned')}><span>{s.code}</span><strong>{s.name}</strong><small>{s.availability==='live'?<><Check size={15}/>Доступно</>:'Запланировано'}</small></div>)}
          </div>
          <p className="wb-method-note"><ShieldAlert size={19}/> Демонстрационный прототип, не официальный прогноз Kaspersky. Материалы требуют проверки отраслевыми экспертами.</p>
        </article>}
      </main>
    </div>
    <footer className="wb-bottom"><span>Завод 2040 / Независимый концепт</span><button onClick={onClose}>Вернуться к 3D-модели <Compass size={16}/></button></footer>
  </section>
}
