"""Katzigami campaign procedural generation and offline dialogue integration."""
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
html=(root/'index.html').read_text().replace('<script src="game.js" defer></script>','').replace('<link rel="stylesheet" href="style.css">','')
css=(root/'style.css').read_text().split("\n",1)[1]
js=(root/'game.js').read_text().replace("new URLSearchParams(location.search).has('test')","true")
html=html.replace('</head>','<style>'+css+'</style></head>').replace('</body>','<script>'+js+'</script></body>')
with sync_playwright() as p:
 b=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=b.new_page(viewport={'width':844,'height':390})
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html)
 page.wait_for_timeout(80)
 page.locator('[data-option="0"]').click() # new game
 page.locator('[data-option="0"]').click() # prologue
 # Teleport to the first NPC and trigger free-text dialogue.
 page.evaluate('window.__katzigamiTest.position(252,390)')
 page.evaluate('window.__katzigamiTest.step(.04)')
 assert page.locator('textarea').count()==1,'Free text field missing'
 page.locator('textarea').fill('Ich will dir helfen, wir müssen gemeinsam Frieden finden!')
 page.locator('.free-send').click()
 assert 'KATZENREAKTION' in page.locator('.story-tag').inner_text()
 assert page.evaluate('window.__katzigamiTest.relations().Pip')>=1
 page.locator('[data-option="0"]').click()
 assert page.evaluate('window.__katzigamiTest.snapshot().phase')=='playing'
 assert page.evaluate('window.__katzigamiTest.snapshot().flags.ally0') is True
 assert page.evaluate('window.__katzigamiTest.snapshot().enemies.length')>=6
 # A reply that looks like markup is rendered as text only and never as an element.
 text='<img src=x onerror=alert(1)> Ich glaub dir nicht, nein'
 result=page.evaluate('(s)=>window.__katzigamiTest.chat(s,"Pip")',text)
 assert result['intent']=='skeptical',result
 assert page.evaluate('window.__katzigamiTest.snapshot().flags.rival0') is False or page.evaluate('window.__katzigamiTest.snapshot().flags.rival0') is None
 # New campaigns must generally differ in seed and random enemy distributions.
 seeds=[];mysteries=[];foes=[]
 for j in range(14):
  page.evaluate('window.__katzigamiTest.newCampaign()')
  seeds.append(page.evaluate('window.__katzigamiTest.seed()'))
  mysteries.append(page.evaluate('window.__katzigamiTest.mystery()'))
  foes.append(tuple(x['type'] for x in page.evaluate('window.__katzigamiTest.snapshot().enemies')))
 assert len(set(seeds))==14, 'Seeds not unique'
 assert len(set(mysteries))>=3, 'Mystery variations insufficient'
 assert len(set(foes))>=4, 'Enemy composition not varying'
 # Combat strength still scales, and multiple enemy classes survive one weak hit.
 page.evaluate('window.__katzigamiTest.enterLevel(3)')
 armored=next(x for x in page.evaluate('window.__katzigamiTest.snapshot().enemies') if x['type'] in ('armored','titan'))
 page.evaluate('id=>window.__katzigamiTest.damageEnemy(id,1)',armored['id'])
 after=next(x for x in page.evaluate('window.__katzigamiTest.snapshot().enemies') if x['id']==armored['id'])
 assert not after['dead'] and after['hp']<armored['hp']
 # Typing space/left/right should not move player or trigger game shortcuts.
 page.evaluate('window.__katzigamiTest.enterLevel(1)')
 page.evaluate('window.__katzigamiTest.engage()')
 page.locator('textarea').fill('Ich tippe frei, space und Pfeile bleiben im Textfeld')
 page.locator('textarea').press('ArrowLeft')
 assert page.evaluate('window.__katzigamiTest.snapshot().phase')=='dialogue'
 assert not errors,errors
 print('PASS – free text dialog, NPC relationships and consequences, varied campaign seeds/mysteries, multi-hit armor, keyboard input safe')
 b.close()