from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
HTML=(ROOT/'index.html').read_text().replace('<script src="game.js" defer></script>','').replace('<link rel="stylesheet" href="style.css">','')
CSS=(ROOT/'style.css').read_text().replace("@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@500;600;700;800;900&display=swap');",'')
JS=(ROOT/'game.js').read_text().replace("new URLSearchParams(location.search).has('test')","true")
MEMORY='<script>Object.defineProperty(window,"localStorage",{value:(()=>{const m={};return{getItem:k=>m[k]??null,setItem:(k,v)=>m[k]=String(v),removeItem:k=>delete m[k]}})()})</script>'
HTML=HTML.replace('</head>','<style>'+CSS+'</style></head>').replace('</body>',MEMORY+'<script>'+JS+'</script></body>')
def launch(browser,w=844,h=390):
 page=browser.new_page(viewport={'width':w,'height':h},device_scale_factor=1)
 errors=[]
 page.on('pageerror',lambda err:errors.append(str(err)))
 page.set_content(HTML,wait_until='domcontentloaded')
 page.wait_for_timeout(130)
 return page,errors

def snap(p):return p.evaluate('window.__katzigamiTest.snapshot()')

def click(p,n=0):p.locator('[data-option="%d"]'%n).click()

with sync_playwright() as P:
 browser=P.chromium.launch(headless=True,executable_path='/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None,args=['--no-sandbox','--disable-dev-shm-usage'])
 for w,h in [(844,390),(390,844),(360,740),(1440,900),(320,640)]:
  page,errors=launch(browser,w,h)
  coords={id:page.locator('#'+id).bounding_box() for id in ('left','right','jump','special')}
  for k in ('left','right','jump'):
   assert coords[k]['width']>=77 and coords[k]['height']>=77,(w,k,coords)
  a,b,j,sp=(coords[k] for k in ('left','right','jump','special'))
  assert a['x']+a['width'] < b['x'],(w,coords)
  def overlaps(p,q): return p['x'] < q['x']+q['width'] and p['x']+p['width']>q['x'] and p['y']<q['y']+q['height'] and p['y']+p['height']>q['y']
  assert not overlaps(sp,b) and not overlaps(sp,j),(w,coords)
  assert sp['width']>=60 and sp['height']>=60,(w,coords)
  assert j['x']+j['width']<=w+1,(w,coords)
  assert page.locator('#special').is_disabled(),(w,'Special enabled before mushroom')
  page.screenshot(path=str(ROOT/'tests'/f'power-layout-{w}x{h}.png'))
  assert not errors,(w,errors)
  page.close()
 print('PASS: preserved large movement+jump control positions; adjacent non-overlapping ability button at 320/360/390 portrait, 844 landscape and desktop')
 page,errors=launch(browser)
 click(page,0);click(page,0)
 before=snap(page)
 assert before['power'] is None and before['shots']==0
 assert not page.evaluate('window.__katzigamiTest.cast()'),'Cast was possible without power mushroom'
 page.evaluate('window.__katzigamiTest.collectAll()')
 assert snap(page)['power'] is None,'Quest mushrooms must not unlock power'
 page.evaluate('window.__katzigamiTest.takePower()')
 assert snap(page)['power']=='blossom' and not page.locator('#special').is_disabled(),'Power mushroom must unlock ability'
 assert page.locator('#special-icon').inner_text()=='✿'
 page.evaluate('window.__katzigamiTest.step(.5)')
 page.locator('#special').dispatch_event('pointerdown',{'pointerId':20,'pointerType':'touch','button':0})
 assert snap(page)['shots']>0,'Special touch did not create projectile'
 page.locator('#special').dispatch_event('pointerup',{'pointerId':20,'pointerType':'touch','button':0})
 page.evaluate('window.__katzigamiTest.hurt()')
 assert snap(page)['power']=='blossom' and not page.locator('#special').is_disabled(),'Upgrades must remain permanently unlocked after damage'
 page.evaluate('window.__katzigamiTest.step(.5)'); assert page.evaluate('window.__katzigamiTest.cast()'),'Casting should remain unlocked after hit'
 assert snap(page)['hearts']==2,'Taking damage should cost a heart while retaining power'

 # A real projectile must eliminate a shadow-cat on collision (not just animate).
 page.evaluate('window.__katzigamiTest.enterLevel(0)')
 page.evaluate('window.__katzigamiTest.takePower()')
 page.evaluate('window.__katzigamiTest.step(.2)')
 # Pin the target and exclude other patrollers so the actual projectile collision is reproducible.
 first=snap(page)['enemies'][0]
 assert page.evaluate('(id)=>window.__katzigamiTest.isolateEnemy(id,540)',first['id'])
 page.evaluate('window.__katzigamiTest.position(415,390)')
 page.evaluate('window.__katzigamiTest.step(.04)')
 assert page.evaluate('window.__katzigamiTest.cast()'), 'Cannot cast for enemy collision check'
 page.evaluate('window.__katzigamiTest.step(.45)')
 assert snap(page)['enemies'][0]['dead'], 'Magic projectile did not hit nearby shadow-cat'
 print('PASS: magical projectile physically defeats a cat enemy')
 assert not errors,errors
 print('PASS: seven quest mushrooms do NOT unlock; transforming mushroom unlocks; touch cast fires; damage keeps permanent upgrades but costs a heart')
 page.close()
 page,errors=launch(browser)
 click(page,0);click(page,0)
 for i,power in enumerate(('blossom','spark','moon','starlight')):
  page.evaluate('(i)=>window.__katzigamiTest.enterLevel(i*3)',i)
  page.evaluate('window.__katzigamiTest.takePower()')
  assert snap(page)['power']==power,(i,snap(page)['power'])
  assert not page.locator('#special').is_disabled()
  page.evaluate('window.__katzigamiTest.step(.45)')
  assert page.evaluate('window.__katzigamiTest.cast()'),(i,'cast failed')
  if i==0:
   page.screenshot(path=str(ROOT/'tests'/'transformed-blossom.png'))
  assert not errors,(i,errors)
 print('PASS: all four distinct transformations unlock and cast, with no canvas script errors')
 browser.close()