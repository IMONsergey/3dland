import {chromium} from 'playwright-core'
import {strict as assert} from 'node:assert'

const executablePath=process.env.CHROME_BIN||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const url=process.env.SITE_URL||'http://127.0.0.1:4317/3dland/'
const browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']})
const specs=[
 {name:'desktop',width:1440,height:900,mobile:false},
 {name:'mobile',width:390,height:844,mobile:true},
 {name:'tablet',width:1024,height:768,mobile:false},
]
const results=[]
for(const spec of specs){
  const context=await browser.newContext({viewport:{width:spec.width,height:spec.height},deviceScaleFactor:1,isMobile:spec.mobile,hasTouch:spec.mobile})
  const page=await context.newPage()
  const errors=[]
  page.on('pageerror',e=>errors.push(e.message))
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000})
  assert.equal(response.status(),200)
  await page.locator('canvas').waitFor({timeout:35000})
  await page.locator('.world-marker').first().waitFor({timeout:35000})
  await page.waitForTimeout(850)
  assert.equal(await page.locator('.world-marker').count(),14)
  assert.equal(await page.locator('.visual-mode-switch button.active').count(),1)
  assert((await page.locator('.visual-mode-switch button.active').innerText()).includes('3D'))
  const initial=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth,canvas:document.querySelectorAll('canvas').length,photoHidden:document.querySelector('.hero-photo-underlay')?.classList.contains('is-hidden')}))
  assert.equal(initial.width,initial.viewport,'overflow in '+spec.name)
  assert.equal(initial.canvas,1,'3D canvas not loaded in '+spec.name)
  assert(initial.photoHidden,'3D was not ready on '+spec.name)
  await page.screenshot({path:'preview-3d-restored-'+spec.name+'-home.png'})
  // Real user gesture: rotating the camera must move the world-space markers.
  if(!spec.mobile){
    const mark=page.locator('.world-marker[data-node="furnace"]')
    const before=await mark.evaluate(el=>({left:el.style.left,top:el.style.top}))
    const a={x:spec.width*.65,y:spec.height*.54}
    await page.mouse.move(a.x,a.y)
    await page.mouse.down()
    await page.mouse.move(a.x+95,a.y+30,{steps:10})
    await page.mouse.up()
    await page.waitForTimeout(650)
    const after=await mark.evaluate(el=>({left:el.style.left,top:el.style.top}))
    assert(before.left!==after.left||before.top!==after.top,'OrbitControls not responding to drag')
  }
  await page.locator('.visual-mode-switch button').nth(1).click()
  await page.locator('.photo-stage').waitFor()
  await page.waitForTimeout(280)
  assert.equal(await page.locator('canvas').count(),0,'Photo mode should not unnecessarily render WebGL')
  await page.screenshot({path:'preview-3d-restored-'+spec.name+'-render.png'})
  await page.locator('.visual-mode-switch button').first().click()
  await page.locator('canvas').waitFor({timeout:35000})
  await page.waitForTimeout(250)
  // Stage markers navigate directly to context-rich 3D detail.
  await page.locator('.world-marker[data-node="storage"]').evaluate(el=>(el).click())
  await page.locator('.detail-card').waitFor({timeout:12000})
  assert((await page.locator('.detail-card h2').innerText()).includes('Сырьевые'))
  assert.equal(await page.locator('.world-marker').count(),14)
  await page.screenshot({path:'preview-3d-restored-'+spec.name+'-hotspot.png'})
  await page.locator('.header-logo').click()
  await page.locator('.primary-action').click()
  await page.locator('.journey').waitFor()
  assert.equal(await page.locator('.journey-mode-switch button.active').count(),1)
  assert((await page.locator('.journey-mode-switch button.active').innerText()).includes('3D'))
  await page.locator('canvas').waitFor({timeout:35000})
  await page.waitForTimeout(800)
  await page.screenshot({path:'preview-3d-restored-'+spec.name+'-chapter-3d.png'})
  await page.locator('.journey-controls button').nth(1).click()
  assert((await page.locator('.journey-kicker').innerText()).includes('02 / 04'))
  await page.locator('.journey-mode-switch button').nth(1).click()
  await page.locator('.journey-photography').waitFor()
  await page.waitForTimeout(240)
  assert.equal(await page.locator('canvas').count(),0,'Story photo option should not consume 3D resources')
  await page.screenshot({path:'preview-3d-restored-'+spec.name+'-chapter-render.png'})
  await page.locator('.journey-mode-switch button').first().click()
  await page.locator('canvas').waitFor({timeout:35000})
  await page.locator('.journey-focus-link').click()
  await page.locator('.journey').waitFor({state:'detached'})
  await page.locator('.detail-card').waitFor()
  assert((await page.locator('.detail-card h2').innerText()).includes('Роботизирован'))
  await page.locator('.detail-tabs [role="tab"]').nth(1).click()
  assert.equal(await page.locator('.detail-story.risk-mode').count(),1)
  if(spec.mobile){
    await page.locator('.mobile-menu-button').click()
    await page.locator('.mobile-menu button').filter({hasText:'Атлас'}).click()
  }else{
    await page.locator('.header-nav button').filter({hasText:'Атлас'}).click()
  }
  await page.locator('.wb-root').waitFor()
  assert.equal(await page.locator('.wb-node-link').count(),14)
  const stats={name:spec.name,http:response.status(),initial,errors}
  console.log('PASS '+JSON.stringify(stats))
  if(errors.length)throw Error('JS errors: '+JSON.stringify(stats))
  results.push(stats)
  await context.close()
}
await browser.close()
console.log('DONE '+JSON.stringify(results,null,2))
