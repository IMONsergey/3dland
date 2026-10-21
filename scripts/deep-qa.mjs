import {chromium} from 'playwright-core'
import {strict as assert} from 'node:assert'

const browser=await chromium.launch({
  headless:true,
  executablePath:process.env.CHROME_BIN || (process.platform==='darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : '/usr/bin/google-chrome'),
  args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling'],
})
const origin='http://127.0.0.1:4317/3dland/'
const results=[]
for(const spec of [
 {name:'desktop',width:1440,height:900,mobile:false},
 {name:'phone',width:390,height:844,mobile:true},
 {name:'tablet',width:1024,height:768,mobile:false}
]){
 const context=await browser.newContext({viewport:{width:spec.width,height:spec.height},isMobile:spec.mobile,hasTouch:spec.mobile,deviceScaleFactor:1})
 const page=await context.newPage()
 const errors=[]
 page.on('pageerror',e=>errors.push(e.message))
 const res=await page.goto(origin,{waitUntil:'domcontentloaded',timeout:25000})
 await page.locator('canvas').waitFor({timeout:25000})
 await page.waitForTimeout(1200)
 const dimensions=await page.evaluate(()=>({vw:window.innerWidth,sw:document.documentElement.scrollWidth,canvas:document.querySelectorAll('canvas').length,markers:document.querySelectorAll('.world-marker').length}))
 await page.screenshot({path:'preview-v2-'+spec.name+'-home.png'})
 assert.equal(res.status(),200)
 assert(dimensions.sw<=dimensions.vw,'horizontal overflow '+spec.name+': '+JSON.stringify(dimensions))
 if(spec.name==='phone'){
    await page.locator('.research-launcher').click()
 }else{
    await page.locator('.header-lab').click()
 }
 await page.locator('.wb-root').waitFor()
 await page.waitForTimeout(250)
 assert.equal(await page.locator('.wb-node-link').count(),14)
 await page.screenshot({path:'preview-v2-'+spec.name+'-lab.png'})
 if(spec.name==='phone'){
   await page.locator('.wb-mobile-control button').first().click()
   assert.equal(await page.locator('.wb-sidebar.open').count(),1)
   await page.locator('.wb-node-link').filter({hasText:'Железнодорожный терминал'}).click()
   assert.equal(await page.locator('.wb-sidebar.open').count(),0)
 }else{
   await page.locator('.wb-node-link').filter({hasText:'Доменный комплекс'}).click()
 }
 await page.locator('.wb-navigation button').nth(1).click()
 assert.equal(await page.locator('.wb-compare-column').count(),3)
 await page.screenshot({path:'preview-v2-'+spec.name+'-compare.png'})
 await page.locator('.wb-navigation button').nth(2).click()
 assert.equal(await page.locator('.wb-sector-card').count(),6)
 await page.screenshot({path:'preview-v2-'+spec.name+'-method.png'})
 await page.locator('.wb-navigation button').nth(0).click()
 await page.locator('.wb-action-main').click()
 await page.locator('.wb-root').waitFor({state:'detached'})
 await page.locator('.detail-card.has-selection').waitFor({timeout:7000})
 await page.locator('.detail-tabs [role=tab]').nth(1).click()
 assert.equal(await page.locator('.detail-story.risk-mode').count(),1)
 await page.waitForTimeout(350)
 await page.screenshot({path:'preview-v2-'+spec.name+'-risk.png'})
 const riskControls=await page.locator('.detail-research-link').count()
 const state=await page.evaluate(()=>({year:document.querySelector('.era-button.active')?.textContent?.trim(),title:document.querySelector('.detail-card h2')?.textContent,documentWidth:document.documentElement.scrollWidth}))
 results.push({screen:spec.name,http:res.status(),dimensions,errors,riskControls,state})
 await context.close()
}
await browser.close()
console.log(JSON.stringify(results,null,2))
if(results.some(v=>v.errors.length))process.exit(1)
