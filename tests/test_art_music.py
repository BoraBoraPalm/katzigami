"""Art direction, campaign story, wardrobe and adaptive soundtrack regression."""
from pathlib import Path
import hashlib
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
html=(ROOT/'index.html').read_text().replace('<script src="game.js" defer></script>','').replace('<link rel="stylesheet" href="style.css">','')
css=(ROOT/'style.css').read_text().replace("@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@500;600;700;800;900&display=swap');",'')
js=(ROOT/'game.js').read_text().replace("new URLSearchParams(location.search).has('test')","true")
mem='''<script>Object.defineProperty(window,"localStorage",{value:(()=>{const m={};return{getItem:k=>m[k]??null,setItem:(k,v)=>m[k]=String(v),removeItem:k=>delete m[k]}})()})</script>'''
html=html.replace('</head>','<style>'+css+'</style></head>').replace('</body>',mem+'<script>'+js+'</script></body>')
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None,args=['--no-sandbox','--disable-dev-shm-usage'])
 pg=b.new_page(viewport={'width':844,'height':390},device_scale_factor=1)
 errors=[]
 pg.on('pageerror',lambda e:errors.append(str(e)))
 pg.set_content(html,wait_until='domcontentloaded')
 api='window.__katzigamiTest'
 def call(command):return pg.evaluate(api+'.'+command)
 for opt in [0,0,1]:pg.locator('[data-option="%s"]'%opt).click()
 title=pg.locator('.story-title').inner_text()
 body=pg.locator('.story-copy').inner_text()
 assert 'Momo' in title and 'Herzuhr' in body and ('Nox' in body or 'NOX' in body),(title,body)
 pg.locator('[data-option="0"]').click()
 assert call('snapshot().phase')=='playing'
 # Four themes must be visually distinct actual rendered frames, not only data labels.
 unique=set()
 modes=[]
 for lv,want in [(0,'meadow'),(5,'forest'),(10,'sugar'),(15,'clock')]:
  call('enterLevel('+str(lv)+')')
  world=call('musicState().world');assert world==want,(lv,world,want)
  pg.wait_for_timeout(100)
  shot=pg.locator('canvas#game').screenshot()
  unique.add(hashlib.sha256(shot).hexdigest())
  modes.append(world)
 assert len(unique)==4,'Worlds must render distinct art'
 # Timed negative items should trigger an adaptive curse score.
 call('giveCharm("slow")')
 assert call('musicMode()')=='curse'
 call('enterLevel(0)')
 call('mount("bird")')
 assert call('musicMode()')=='bird'
 call('enterLevel(0)')
 call('givePower("moon")')
 assert call('musicMode()') in ('power','danger','explore','critical'),call('musicMode()')
 # Per-character wardrobes must be different in names and actually render without crashes.
 names=[]
 for char in ['cat','dog','chicken','rabbit','fox']:
  names.append(call('previewCostume("clown","'+char+'")'))
  pg.wait_for_timeout(60)
  shot=pg.locator('canvas#game').screenshot()
  assert len(shot)>2000
 assert len(set(names))==5,names
 # Dice reveal must be an animated, readable reward card with a hero-specific title.
 call('testReward(4)')
 assert pg.locator('.loot-card .loot-art .loot-halo').count()==1
 assert pg.locator('.loot-art small').inner_text().endswith('FIPS')
 assert pg.locator('.loot-art strong').count()==1
 assert not errors,errors
 print('PASS – coherent intro, 4 visually distinct worlds, world-based soundtrack, curse/ride scoring, 5 character wardrobes and illustrated dice rewards')
 b.close()
