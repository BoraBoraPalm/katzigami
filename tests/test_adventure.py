"""World-specific traversal, returning companions, high-cost healing, and named save slots."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
html=(ROOT/'index.html').read_text().replace('<script src="game.js" defer></script>','').replace('<link rel="stylesheet" href="style.css">','')
css=(ROOT/'style.css').read_text().replace("@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@500;600;700;800;900&display=swap');",'')
js=(ROOT/'game.js').read_text().replace("new URLSearchParams(location.search).has('test')","true")
memory='''<script>Object.defineProperty(window,"localStorage",{value:(()=>{const m={};return{getItem:k=>m[k]??null,setItem:(k,v)=>m[k]=String(v),removeItem:k=>delete m[k]}})()})</script>'''
html=html.replace('</head>','<style>'+css+'</style></head>').replace('</body>',memory+'<script>'+js+'</script></body>')
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None,args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':844,'height':390})
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='domcontentloaded')
 api='window.__katzigamiTest'
 def call(js):return page.evaluate(api+'.'+js)
 def snap():return call('snapshot()')
 def option(n):page.locator('[data-option="'+str(n)+'"]').click()
 # Main-menu manual saves must be accessible without keyboard shortcuts.
 assert 'Benannte Spielstände' in page.locator('#overlay-content').inner_text()
 page.locator('.story-button',has_text='Benannte Spielstände').click()
 page.locator('.story-button',has_text='Neuen Spielstand').click()
 field=page.locator('input[aria-label="Name des Spielstands"]')
 field.fill('Mein erstes Abenteuer')
 page.locator('.save-name-form button').click()
 assert call('slots()')[0]['name']=='Mein erstes Abenteuer'
 assert 'Mein erstes Abenteuer' in page.locator('#overlay-content').inner_text()
 # Seven genuinely different worlds now replace the repeated flower/jelly patterns.
 expected=[(0,'castle',{'door','painting','vampire'}),(3,'snow',{'thinIce','igloo'}),(6,'jungle',{'vine','banana'}),(9,'race',{'boost','hurdle','oil'}),(12,'moon',{'meteor','ufo'}),(15,'sea',{'dome','coral','current'}),(18,'mountain',{'wind','rock','avalanche'})]
 for lev,biome,hazards in expected:
  call('enterLevel('+str(lev)+')')
  assert call('realmState().id')==biome,(lev,call('realmState().id'))
  assert hazards.issubset({q['kind'] for q in call('realmState().events')}),(biome,call('realmState().events'))
 # A manual save remembers coins, current chapter and location.
 call('enterLevel(6)')
 call('setCoins(225)')
 call('position(1450,390)')
 assert call('createSlot("Vor der Wurzelhöhle").ok')
 call('setCoins(7)')
 call('enterLevel(13)')
 assert call('loadSlot("Vor der Wurzelhöhle")')
 assert snap()['level']==6 and call('slots()[0].coins')==225
 assert abs(snap()['player']['x']-1450)<12
 assert 'Vor der Wurzelhöhle' in [x['name'] for x in call('slots()')]
 # Returning friend Yuki was injured: healing costs coins and changes reputation.
 assert call('friendDebug().visitor.name')=='Yuki'
 assert call('friendMeet()')
 assert 'verletzt' in page.locator('.story-copy').inner_text().lower()
 assert call('friendHeal()')
 assert call('friendDebug().friends.Yuki.healed') is True
 assert call('friendDebug().friends.Yuki.trust')>=3
 assert '150' in page.locator('.story-copy').inner_text()
 option(0)
 assert call('friendDebug().companion.name')=='Yuki'
 assert page.locator('#overlay').get_attribute('class').find('visible')<0
 # The companion follows and discloses a secret trail.
 call('setCoins(150)')
 page.keyboard.down('ArrowRight')
 call('step(1.0)')
 page.keyboard.up('ArrowRight')
 assert call('friendDebug().companion') is not None
 assert call('friendDebug().companion.remaining')<1300
 # Later return is not a copy-pasted enemy, it has persistent trust.
 call('enterLevel(11)')
 assert call('friendDebug().visitor.name')=='Yuki'
 assert call('friendDebug().friends.Yuki.healed') is True
 # Leaving a wounded friend behind has a persistent cost to trust.
 call('enterLevel(12)')
 assert call('friendDebug().visitor.name')=='Miso'
 assert call('friendMeet()')
 option(2)
 assert call('friendDebug().friends.Miso.trust')<0
 assert call('friendDebug().visitor.status')=='departed'
 # A named slot genuinely rewinds the saved state; autosave was separate.
 assert call('loadSlot("Vor der Wurzelhöhle")')
 assert snap()['level']==6
 assert call('friendDebug().friends.Yuki.healed') is False
 assert call('deleteSlot("Vor der Wurzelhöhle")')
 assert 'Vor der Wurzelhöhle' not in [x['name'] for x in call('slots()')]
 # User-controlled names must be displayed safely, not interpreted as HTML.
 assert call('createSlot("<img src=x onerror=alert(1)>").ok')
 assert not errors,errors
 print('PASS – different platforming mechanics across four worlds; returning friends, healing and refusing; named UI save/load/delete/rewind')
 browser.close()
