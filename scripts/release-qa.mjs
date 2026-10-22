import {chromium} from 'playwright-core'
import {strict as assert} from 'node:assert'
const url=process.env.SITE_URL||'http://127.0.0.1:4317/3dland/'
const executablePath=process.env.CHROME_BIN||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox','--disable-webgl','--disable-gpu']})
const page=await browser.newPage({viewport:{width:1440,height:900}})
const errors=[]
page.on('pageerror',e=>errors.push(e.message))
await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000})
await page.locator('.header-nav button').filter({hasText:'Атлас прогнозов'}).click()
await page.locator('.wb-root').waitFor()
assert.equal(await page.locator('.wb-node-link').count(),14)
let count=0
for(let i=0;i<14;i++){
  await page.locator('.wb-node-link').nth(i).click()
  const details=page.locator('.wb-deepdive')
  await details.locator('summary').click()
  assert.equal(await page.locator('.wb-chain-node').count(),4)
  assert.equal(await page.locator('.wb-guardrail').count(),3)
  for(let j=0;j<3;j++){
    await page.locator('.wb-time-choice').nth(j).click()
    const opportunity=await page.locator('.wb-story-block.opportunity p').innerText()
    const risk=await page.locator('.wb-story-block.risk p').innerText()
    assert(opportunity.length>55,'technology scenario too short '+i+'-'+j)
    assert(risk.length>55,'risk scenario too short '+i+'-'+j)
    count++
  }
}
await page.close()
const compatible=await browser.newPage({viewport:{width:1280,height:800}})
compatible.on('pageerror',e=>errors.push(e.message))
await compatible.goto(url+'?mode=explore&year=2040&node=water',{waitUntil:'domcontentloaded',timeout:30000})
await compatible.locator('.world-fallback').waitFor({timeout:25000})
assert.equal(await compatible.locator('.fallback-point').count(),14)
assert.equal(await compatible.locator('.detail-card').count(),1)
await compatible.locator('.fallback-point').first().click({force:true})
assert.equal(await compatible.locator('.detail-card').count(),1)
await browser.close()
console.log(JSON.stringify({scenarios:count,riskModels:14,nonWebGL:true,errors}))
if(errors.length)process.exit(1)
