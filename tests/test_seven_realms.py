"""Katzigami seven-world overhaul: distinct render, rules, enemies and hazards."""
from pathlib import Path
import hashlib
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
html=(ROOT/'index.html').read_text().replace('<script src="game.js" defer></script>','').replace('<link rel="stylesheet" href="style.css">','')
css=(ROOT/'style.css').read_text().replace("@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@500;600;700;800;900&display=swap');",'')
js=(ROOT/'game.js').read_text().replace("new URLSearchParams(location.search).has('test')","true")
storage='''<script>Object.defineProperty(window,"localStorage",{value:(()=>{const m={};return{getItem:k=>m[k]??null,setItem:(k,v)=>m[k]=String(v),removeItem:k=>delete m[k]}})()})</script>'''
html=html.replace('</head>','<style>'+css+'</style></head>').replace('</body>',storage+'<script>'+js+'</script></body>')
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None,args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':844,'height':390},device_scale_factor=1)
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='domcontentloaded')
 for n in (0,0,1,0):page.locator('[data-option="%d"]'%n).click()
 api='window.__katzigamiTest'
 def call(code):return page.evaluate(api+'.'+code)
 def snap():return call('snapshot()')
 def step(t):return call('step('+str(t)+')')
 worlds=[
  (0,'castle',{'door','painting','vampire'},'Geisterschloss'),
  (3,'snow',{'igloo','thinIce'},'Schneesturm'),
  (6,'jungle',{'vine','banana'},'Dschungel'),
  (9,'race',{'boost','hurdle','oil'},'Rennstrecke'),
  (12,'moon',{'ufo','meteor'},'Mond'),
  (15,'sea',{'dome','current','coral'},'Unterwasserwelt'),
  (18,'mountain',{'wind','rock','avalanche'},'Bergwelt')
 ]
 images=set()
 for i,id,kinds,title in worlds:
  call('enterLevel('+str(i)+')')
  assert call('realmState().id')==id,(i,call('realmState().id'))
  found={o['kind'] for o in call('realmState().events')}
  assert kinds.issubset(found),(id,kinds,found)
  assert len(snap()['enemies'])>=8,(i,len(snap()['enemies']))
  assert title.upper() in page.locator('#chapter-label').inner_text().upper(),(id,page.locator('#chapter-label').inner_text())
  assert call('musicState().biome')==id
  page.wait_for_timeout(90)
  images.add(hashlib.sha256(page.locator('#game').screenshot()).digest())
 assert len(images)==7,'The seven realms must visually render differently'
 # Castle: doors open and release fresh enemies, portraits are physical hazards.
 call('enterLevel(0)')
 start=len(snap()['enemies'])
 call('position(711,390)')
 step(3)
 assert len(snap()['enemies'])>start,('Door ambush failed',snap()['phase'],start,len(snap()['enemies']),call('realmState().events')[:4],snap()['player'])
 # Snow: immersion has a real hypothermia timer, not merely snow art.
 call('enterLevel(3)')
 call('position(1205,530)')
 before=call('realmState().cold')
 step(.65)
 assert call('realmState().cold')<before,'Icy water should consume warmth'
 # Jungle: grabbing a vine switches to pendulum control, letting go launches you.
 call('enterLevel(6)')
 assert call('realmSetVine()'),'The vine must be actually grabbable'
 assert call('realmState().vinning')
 page.keyboard.down('ArrowRight')
 step(.48)
 page.keyboard.up('ArrowRight')
 assert call('realmState().vinning')
 page.keyboard.up('Space')
 step(.06)
 assert not call('realmState().vinning'),'Releasing jump should launch from vine'
 # Race: the opponent makes real progress and creates a finish-time competition.
 call('enterLevel(9)')
 first=call('realmState().raceX')
 step(.8)
 assert call('realmState().raceX')>first+100,'Rival did not advance'
 # Moon: gravity must be dramatically lower than normal.
 call('enterLevel(12)')
 call('position(490,70)')
 step(.3)
 assert snap()['player']['vy']<210,('Moon gravity not reduced',snap()['player'])
 # Sea: diving too far ahead of the slow submarine drains real oxygen.
 call('enterLevel(15)')
 call('position(1100,780)')
 air=call('realmState().oxygen')
 step(1)
 assert call('realmState().oxygen')<air,('Air hose not enforced',call('realmState()'))
 # Mountains: moving rockfalls and avalanches are not static art.
 call('enterLevel(18)')
 rock=next(e for e in call('realmState().events') if e['kind']=='rock')
 call('position('+str(rock['x']-30)+',260)')
 step(.33)
 rock2=next(e for e in call('realmState().events') if e['kind']=='rock')
 assert rock2['y']!=rock['y'],(rock,rock2)
 assert not errors,errors
 print('PASS – seven different rendered worlds, unique hazards, swinging vines, castle ambush, freezing water, timed rival, moon gravity, submarine oxygen and mountain rockfalls')
 browser.close()
