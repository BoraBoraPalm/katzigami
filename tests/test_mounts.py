"""Rideable cloud birds and wall-/ceiling-climbing snails in the mobile game."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
html=(ROOT/'index.html').read_text().replace('<script src="game.js" defer></script>','').replace('<link rel="stylesheet" href="style.css">','')
css=(ROOT/'style.css').read_text().replace("@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@500;600;700;800;900&display=swap');",'')
js=(ROOT/'game.js').read_text().replace("new URLSearchParams(location.search).has('test')","true")
mem='''<script>Object.defineProperty(window,"localStorage",{value:(()=>{const m={};return{getItem:k=>m[k]??null,setItem:(k,v)=>m[k]=String(v),removeItem:k=>delete m[k]}})()})</script>'''
html=html.replace('</head>','<style>'+css+'</style></head>').replace('</body>',mem+'<script>'+js+'</script></body>')
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None,args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':844,'height':390})
 errors=[]
 page.on('pageerror',lambda x:errors.append(str(x)))
 page.set_content(html,wait_until='domcontentloaded')
 api='window.__katzigamiTest'
 def snap():return page.evaluate(api+'.snapshot()')
 def step(seconds):page.evaluate('(s)=>window.__katzigamiTest.step(s)',seconds)
 for option in [0,0,1,0]:page.locator('[data-option="%s"]'%option).click()
 # Rare mounts are seeded into real vertical routes rather than every stage.
 assert set(m['kind'] for m in snap()['mounts'])=={'bird','snail'},snap()['mounts']
 page.evaluate(api+'.enterLevel(1)')
 assert not snap()['mounts'],'Mounts should be rare rather than appearing every stage'
 page.evaluate(api+'.enterLevel(0)')
 # Mounting must require a controlled, precise landing from above.
 assert page.evaluate(api+'.precisionLanding("bird")')
 step(.27)
 assert snap()['ride'] and snap()['ride']['id'].startswith('bird'),snap()
 first=snap()['player']['x']
 step(1)
 assert snap()['ride']['left']<6
 assert abs(snap()['player']['x']-first)>10,'The bird should carry the rider'
 assert snap()['player']['y']<0,'Bird ride must remain in the high cloud route'
 page.keyboard.down('Space');step(.1);page.keyboard.up('Space')
 assert snap()['ride'] is None,'Jump must allow immediate dismount using existing touch/key control'
 # Snail sticks to cave wall, then crawls upside down across ceiling.
 page.evaluate(api+'.enterLevel(0)')
 assert page.evaluate(api+'.mount("snail")')
 step(3.2)
 q=snap()
 snail=next(x for x in q['mounts'] if x['kind']=='snail')
 assert abs(abs(snail['angle'])-3.141592653589793)<.05, snail
 assert q['ride'] is not None,'Snail should still be carrying passenger'
 assert q['player']['y']>snail['y'],'Upside-down passenger should hang below ceiling snail'
 step(5.1)
 assert snap()['ride'] is None,'Snail ride must automatically end'
 assert not errors,errors
 print('PASS – bird precision landing + flight + jump dismount, rare mounts, upside-down wall snail and automatic time limit')
 browser.close()
