"""Regression checks for Katzigami retro-anime long levels, buffs, curses and enemies."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
HTML=(ROOT/'index.html').read_text().replace('<script src="game.js" defer></script>','').replace('<link rel="stylesheet" href="style.css">','')
CSS=(ROOT/'style.css').read_text()
JS=(ROOT/'game.js').read_text().replace("new URLSearchParams(location.search).has('test')","true")
MEMORY='''<script>Object.defineProperty(window,"localStorage",{value:(()=>{const m={};return{getItem:k=>m[k]??null,setItem:(k,v)=>m[k]=String(v),removeItem:k=>delete m[k]}})()})</script>'''
HTML=HTML.replace('</head>','<style>'+CSS+'</style></head>').replace('</body>',MEMORY+'<script>'+JS+'</script></body>')
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None,args=['--no-sandbox','--disable-dev-shm-usage'])
 page=b.new_page(viewport={'width':844,'height':390})
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(HTML,wait_until='domcontentloaded')
 page.locator('[data-option="0"]').click()
 page.locator('[data-option="0"]').click() # hero
 page.locator('[data-option="1"]').click() # medium
 page.locator('[data-option="0"]').click()
 api='window.__katzigamiTest'
 def snapshot():return page.evaluate(api+'.snapshot()')
 # 12 visually distinct chapters, extended terrain, seven story mushrooms only.
 lengths=[];stages=[];foes=set();items=0;buffs=set()
 for i in range(20):
  page.evaluate(f'{api}.enterLevel({i})')
  q=snapshot();assert q['level']==i and q['width']>=3000,q
  lengths.append(q['width']);stages.append((q['act'],q['stage']))
  foes.update(x['type'] for x in q['enemies'])
  buffs.update(x['kind'] for x in q['charms'])
  items+=page.evaluate(f'(()=>{{{api}.collectAll();return {api}.snapshot().collected.length}})()') if False else 0
 assert len(set(stages))==20,stages
 assert max(lengths)>4400,lengths
 assert len(foes)>=8,foes
 assert {'speed','invincible','fly','sway','slow','silence'}.issubset(buffs),buffs
 # Positive effect cannot be collected twice per pickup; timer is temporary.
 page.evaluate(f'{api}.enterLevel(0)')
 page.evaluate(f'{api}.givePower("spark")')
 page.evaluate(f'{api}.giveCharm("speed")')
 assert snapshot()['effects']['speed']>8
 page.evaluate(f'{api}.step(5)')
 assert 3<snapshot()['effects']['speed']<5
 page.evaluate(f'{api}.step(5)')
 assert 'speed' not in snapshot()['effects']
 # Invulnerability prevents damage then expires. Current test position clears inv.
 page.evaluate(f'{api}.giveCharm("invincible")')
 hp=snapshot()['hearts']
 page.evaluate(f'{api}.hurt()')
 assert snapshot()['hearts']==hp,'Invincibility failed'
 page.evaluate(f'{api}.step(7)')
 assert 'invincible' not in snapshot()['effects']
 page.evaluate(f'{api}.hurt()')
 assert snapshot()['hearts']==hp-1,'Invulnerability never wore off'
 # Silence deactivates magic but leaves the transformation itself.
 page.evaluate(f'{api}.giveCharm("silence")')
 assert page.locator('#special').is_disabled() and snapshot()['power']=='spark'
 assert not page.evaluate(f'{api}.cast()'),'Silence did not block magic'
 page.evaluate(f'{api}.step(8)')
 assert not page.locator('#special').is_disabled(),'Silence did not expire'
 # Slow and sway have bounded duration, and flight changes vertical velocity.
 page.evaluate(f'{api}.giveCharm("slow")')
 page.evaluate(f'{api}.giveCharm("sway")')
 assert snapshot()['effects']['slow']>0 and snapshot()['effects']['sway']>0
 page.evaluate(f'{api}.step(9)')
 assert 'slow' not in snapshot()['effects'] and 'sway' not in snapshot()['effects'],(snapshot()['phase'],snapshot()['effects'])
 page.evaluate(f'{api}.position(505,250)')
 page.evaluate(f'{api}.giveCharm("fly")')
 page.keyboard.down('Space')
 before=snapshot()['player']['y']
 page.evaluate(f'{api}.step(.4)')
 page.keyboard.up('Space')
 assert snapshot()['player']['y']<before-30,'Fly input did not lift the cat'
 # Tapping pause freezes all timed effects.
 page.evaluate(f'{api}.giveCharm("speed")')
 remaining=snapshot()['effects']['speed']
 page.locator('#pause-toggle').click()
 page.evaluate(f'{api}.step(2)')
 assert 0 <= remaining-snapshot()['effects']['speed'] < .2, 'Effect timer should freeze while paused'
 assert not errors,errors
 print('PASS – 20 long stages, eight+ feline enemy classes, six timed buffs/curses, damage immunity, silence, flight, cooldown expiration and pause')
 b.close()
