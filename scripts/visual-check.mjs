import { chromium } from 'playwright-core'

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROME_BIN || (process.platform==='darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : '/usr/bin/google-chrome'),
  args: ['--no-sandbox', '--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})
const origin = process.env.SITE_URL || 'http://127.0.0.1:4317/3dland/'
let failed = false
for (const [kind, viewport, mobile] of [
  ['desktop', {width:1440,height:900}, false],
  ['mobile', {width:390,height:844}, true],
]) {
  const ctx=await browser.newContext({viewport,deviceScaleFactor:1,isMobile:mobile,hasTouch:mobile})
  const page=await ctx.newPage()
  const errors=[]
  page.on('pageerror', e=>errors.push(e.message))
  const response = await page.goto(origin, {waitUntil:'networkidle',timeout:30000})
  await page.locator('.era-button').first().waitFor({timeout:30000})
  await page.locator('canvas, .world-fallback').first().waitFor({timeout:30000})
  await page.waitForTimeout(450)
  const metrics=await page.evaluate(()=>({
    viewport:window.innerWidth, document:document.documentElement.scrollWidth,
    canvas:document.querySelectorAll('canvas').length,
    markers:document.querySelectorAll('.world-marker').length,
    controls:document.querySelectorAll('.era-button').length,
    year:document.querySelector('.era-button.active')?.textContent?.trim(),
  }))
  await page.screenshot({path:'preview-'+kind+'-tested.png',fullPage:false})
  try {
    await page.locator('.era-button').nth(2).click()
    await page.waitForTimeout(400)
    if(!String(await page.locator('.era-button.active').innerText()).includes('2040'))throw new Error('Year selection failed')
    await page.locator('.world-marker').nth(5).click({force:true})
    await page.waitForTimeout(500)
    if(await page.locator('.detail-card.has-selection').count()!==1)throw new Error('Card not visible')
    await page.locator('.detail-tabs [role=tab]').nth(1).click()
    if(await page.locator('.detail-story.risk-mode').count()!==1)throw new Error('Risk tab failed')
    await page.screenshot({path:'preview-'+kind+'-selected.png',fullPage:false})
    await page.keyboard.press('Escape')
    await page.waitForTimeout(350)
    if(await page.locator('.detail-card.has-selection').count()!==0)throw new Error('Escape failed')
  } catch(e) {failed=true; errors.push(String(e))}
  console.log(JSON.stringify({kind,http:response?.status(),metrics,errors}))
  if(metrics.controls!==3 || metrics.canvas<1 && await page.locator('.world-fallback').count()===0){failed=true;console.error('Incomplete page render',metrics)}
  if(metrics.viewport!==viewport.width||metrics.document>viewport.width) {failed=true; console.error('Viewport overflow',metrics)}
  if(errors.length)failed=true
  await ctx.close()
}
await browser.close()
if(failed)process.exit(1)
