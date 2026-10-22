import { chromium } from 'playwright-core'
import { strict as assert } from 'node:assert'
const browser=await chromium.launch({
  headless:true,
  executablePath:process.env.CHROME_BIN||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader'],
})
const origin=process.env.SITE_URL||'http://127.0.0.1:4317/3dland/'
const configurations=[
  {name:'desktop',w:1440,h:900,mobile:false},
  {name:'mobile',w:390,h:844,mobile:true},
  {name:'tablet',w:1024,h:768,mobile:false},
]
const stats=[]
for(const item of configurations){
 const ctx=await browser.newContext({viewport:{width:item.w,height:item.h},deviceScaleFactor:1,isMobile:item.mobile,hasTouch:item.mobile})
 const page=await ctx.newPage()
 const errors=[]
 page.on('pageerror',error=>errors.push(error.message))
 page.on('response',response=>{if(response.url().includes('/renders/')&&response.status()>=400) errors.push(response.status()+' '+response.url())})
 const res=await page.goto(origin,{waitUntil:'domcontentloaded',timeout:25000})
 await page.locator('.photo-stage').waitFor()
 await page.waitForFunction(()=>{const img=document.querySelector('.photo-stage-shot.active img');return img&&img.complete&&img.naturalWidth>1000})
 await page.screenshot({path:'preview-premium-'+item.name+'-hero.png'})
 const home=await page.evaluate(()=>({canvas:document.querySelectorAll('canvas').length,viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,heroImage:document.querySelector('.photo-stage-shot.active img')?.naturalWidth}))
 assert.equal(home.canvas,0,'3D should load only on demand')
 assert.equal(home.scrollWidth,home.viewport,'horizontal overflow on home')
 await page.locator('.primary-action').click()
 await page.locator('.journey').waitFor()
 await page.waitForFunction(()=>{const img=document.querySelector('.journey-shot.active img');return img&&img.complete&&img.naturalWidth>1000})
 await page.waitForTimeout(450)
 await page.screenshot({path:'preview-premium-'+item.name+'-chapter-01.png'})
 for(let i=1;i<=3;i++){
   await page.locator('.journey-controls button').nth(1).click()
   await page.waitForFunction((n)=>document.querySelector('.journey-kicker')?.textContent?.startsWith(String(n).padStart(2,'0')),[i+1])
   await page.waitForTimeout(400)
   await page.screenshot({path:'preview-premium-'+item.name+'-chapter-0'+(i+1)+'.png'})
 }
 await page.locator('.journey-actions button').first().click()
 await page.locator('.journey').waitFor({state:'detached'})
 await page.locator('canvas').waitFor({timeout:28000})
 await page.waitForTimeout(900)
 await page.screenshot({path:'preview-premium-'+item.name+'-explore.png'})
 const marker=page.locator('.world-marker').first()
 await marker.click({force:true,timeout:12000})
 await page.locator('.detail-card').waitFor({timeout:12000})
 await page.locator('.detail-tabs [role=tab]').nth(1).click()
 assert.equal(await page.locator('.detail-story.risk-mode').count(),1)
 await page.screenshot({path:'preview-premium-'+item.name+'-detail.png'})
 if(item.mobile){
   await page.locator('.mobile-menu-button').click()
   await page.locator('.mobile-menu button').filter({hasText:'Атлас прогнозов'}).click()
 } else {
   await page.locator('.header-nav button').filter({hasText:'Атлас прогнозов'}).click()
 }
 await page.locator('.wb-root').waitFor()
 await page.screenshot({path:'preview-premium-'+item.name+'-atlas.png'})
 const atlas=await page.evaluate(()=>({nodes:document.querySelectorAll('.wb-node-link').length,photo:document.querySelector('.wb-article-visual img')?.getAttribute('src'),scrollWidth:document.documentElement.scrollWidth}))
 assert.equal(atlas.nodes,14)
 assert.equal(atlas.scrollWidth,item.w,'atlas horizontal overflow')
 await page.locator('.wb-navigation button').nth(1).click()
 assert.equal(await page.locator('.wb-compare-column').count(),3)
 await page.screenshot({path:'preview-premium-'+item.name+'-compare.png'})
 stats.push({name:item.name,http:res.status(),home,atlas,errors})
 console.log('CHECKPOINT '+item.name+' '+JSON.stringify({home,atlas,errors}))
 await ctx.close()
}
await browser.close()
console.log('RESULT '+JSON.stringify(stats,null,2))
if(stats.some(s=>s.errors.length))process.exit(1)
