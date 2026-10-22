import {chromium} from 'playwright-core'
import {strict as assert} from 'node:assert'
const chrome=process.env.CHROME_BIN||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']})
const base=process.env.SITE_URL||'http://127.0.0.1:4317/3dland/'
const results=[]
for(const spec of [{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}]){
 const page=await browser.newPage({viewport:{width:spec.width,height:spec.height}})
 const errors=[];const assets=[]
 page.on('pageerror',e=>errors.push(e.message))
 page.on('response',r=>{if(r.url().includes('/models/')||r.url().includes('/pbr/'))assets.push({name:r.url().split('/').pop(),status:r.status()})})
 const response=await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000})
 await page.locator('canvas').waitFor({timeout:30000})
 await page.waitForTimeout(spec.name==='desktop'?4900:3200)
 const state=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,markers:document.querySelectorAll('.world-marker').length,brand:document.querySelector('.kaspersky-approved-wordmark')?.getAttribute('src'),canvas:document.querySelectorAll('canvas').length}))
 await page.screenshot({path:'preview-final-factory-'+spec.name+'.png'})
 assert.equal(response.status(),200);assert.equal(state.viewport,state.document);assert.equal(state.markers,14)
 assert(assets.some(a=>a.name==='k-furnace-authored.glb'&&a.status===200),'authored furnace missing')
 assert(assets.some(a=>a.name==='forklift.glb'&&a.status===200),'GLB equipment missing')
 assert(assets.some(a=>a.name==='corrugated_iron_diff_1k.jpg'&&a.status===200),'PBR roof missing')
 assert(errors.length===0,'JS errors '+JSON.stringify(errors))
 results.push({name:spec.name,state,assets,errors})
 console.log('PASS',JSON.stringify(results[results.length-1]))
 await page.close()
}
await browser.close()
