import { chromium } from 'playwright-core'
import { strict as assert } from 'node:assert'
const chrome = process.env.CHROME_BIN || (process.platform==='darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : '/usr/bin/google-chrome')
const url=process.env.SITE_URL||'http://127.0.0.1:4317/3dland/'
const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-webgl','--disable-gpu']})
const page=await browser.newPage({viewport:{width:1440,height:900}})
const errors=[]
page.on('pageerror',e=>errors.push(e.message))
await page.goto(url,{waitUntil:'domcontentloaded'})
await page.locator('.header-lab').click()
await page.locator('.wb-node-link').first().waitFor()
let scenarios=0
for(let i=0;i<14;i++){
 await page.locator('.wb-node-link').nth(i).click()
 assert.equal(await page.locator('.wb-chain-node').count(),4,'Missing risk stages')
 assert.equal(await page.locator('.wb-guardrail').count(),3,'Missing guardrails')
 for(let y=0;y<3;y++){
  await page.locator('.wb-time-choice').nth(y).click()
  const opportunity=await page.locator('.wb-story-block.opportunity p').innerText()
  const risk=await page.locator('.wb-story-block.risk p').innerText()
  assert(opportunity.length>65,'Incomplete technology forecast node '+i+' year '+y)
  assert(risk.length>65,'Incomplete cyber risk node '+i+' year '+y)
  scenarios++
 }
}
await browser.close()
const fallbackBrowser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-webgl','--disable-gpu']})
const compatibility=await fallbackBrowser.newPage({viewport:{width:1280,height:800}})
const fallbackErrors=[]
compatibility.on('pageerror',e=>fallbackErrors.push(e.message))
await compatibility.goto(url+'?year=2040&node=water',{waitUntil:'domcontentloaded'})
await compatibility.locator('.world-fallback').waitFor({timeout:10000})
assert.equal(await compatibility.locator('.fallback-point').count(),14)
assert.equal(await compatibility.locator('.detail-card.has-selection').count(),1)
await compatibility.screenshot({path:'preview-v2-no-webgl.png'})
await compatibility.locator('.fallback-point').first().click({force:true})
assert.equal(await compatibility.locator('.detail-card.has-selection').count(),1)
await fallbackBrowser.close()
console.log(JSON.stringify({scenariosTested:scenarios,webglFallback:true,errors,fallbackErrors}))
if(errors.length||fallbackErrors.length)process.exit(1)
