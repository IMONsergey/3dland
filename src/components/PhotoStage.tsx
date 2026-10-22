import type { Era, NodeId } from '../data/atlas'

export const renderAssets = {
  hero: import.meta.env.BASE_URL + 'renders/hero.webp',
  furnace: import.meta.env.BASE_URL + 'renders/furnace.webp',
  robots: import.meta.env.BASE_URL + 'renders/robots.webp',
  energy: import.meta.env.BASE_URL + 'renders/energy.webp',
  network: import.meta.env.BASE_URL + 'renders/network.webp',
} as const

export const eraVisual:Record<Era,keyof typeof renderAssets> = {
  2030:'hero',
  2035:'robots',
  2040:'energy'
}
const nodeVisuals:Partial<Record<NodeId,keyof typeof renderAssets>>={
  furnace:'furnace',
  casting:'furnace',
  quality:'furnace',
  robotics:'robots',
  maintenance:'robots',
  logistics:'hero',
  storage:'hero',
  energy:'energy',
  water:'energy',
  emissions:'energy',
  rail:'hero',
  control:'network',
  perimeter:'network',
  network:'network'
}
export const visualForNode=(id:NodeId):string=>renderAssets[nodeVisuals[id]??'hero']

export function PhotoStage({year}:{year:Era}) {
  return <div className="photo-stage" aria-hidden="true">
    {([2030,2035,2040] as Era[]).map(y=>
      <div className={'photo-stage-shot '+(year===y?'active':'')} key={y}>
        <img src={renderAssets[eraVisual[y]]} alt="" decoding="async" loading="eager" fetchPriority={y===2030?'high':'low'}/>
      </div>
    )}
    <div className="photo-stage-shade"/>
    <div className="photo-stage-noise"/>
  </div>
}
