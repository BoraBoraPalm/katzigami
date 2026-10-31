"""Browser smoke / story path tests. Requires playwright and Chromium.
Tests use an in-memory localStorage shim because opaque document contexts block origin storage.
Production GitHub Pages loads files normally and uses real localStorage.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
HTML=(ROOT/'index.html').read_text().replace('<script src="game.js" defer></script>','').replace('<link rel="stylesheet" href="style.css">','')
CSS=(ROOT/'style.css').read_text().replace("@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@500;600;700;800;900&display=swap');",'')
JS=(ROOT/'game.js').read_text().replace("new URLSearchParams(location.search).has('test')","true")
MEMORY='''<script>Object.defineProperty(window,"localStorage",{value:(()=>{const m={};return{getItem:k=>m[k]??null,setItem:(k,v)=>m[k]=String(v),removeItem:k=>delete m[k]}})()})</script>'''
HTML=HTML.replace('</head>','<style>'+CSS+'</style></head>').replace('</body>',MEMORY+'<script>'+JS+'</script></body>')

def check(expr,msg):
    assert expr,msg

def load(browser,width=844,height=390):
    page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('console',lambda e:errors.append('console: '+e.text) if e.type=='error' and 'fonts.googleapis' not in e.text and 'ERR_NAME_NOT_RESOLVED' not in e.text else None)
    page.set_content(HTML,wait_until='domcontentloaded')
    page.wait_for_timeout(150)
    return page,errors

def snapshot(page):return page.evaluate('window.__katzigamiTest.snapshot()')
def click(page,i=0):page.locator(f'[data-option="{i}"]').click(timeout=3000)
def pos(page,x,y=390):page.evaluate('([x,y])=>window.__katzigamiTest.position(x,y)',[x,y]);page.evaluate('window.__katzigamiTest.step(.08)')
def take_all(page):
    page.evaluate('window.__katzigamiTest.collectAll()')
def finish(page,x):pos(page,x);page.wait_for_timeout(80)

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None,args=['--no-sandbox','--disable-dev-shm-usage','--disable-background-networking'])
    page,errors=load(browser)
    assert snapshot(page)['phase']=='menu'
    click(page,0) # new game
    click(page,0) # Momo cat
    click(page,1) # medium difficulty
    check(snapshot(page)['phase']=='dialogue','intro not shown')
    check('Momo' in page.locator('.story-title').inner_text(),'intro lacks cat')
    click(page,0) # cake
    check(snapshot(page)['phase']=='playing','intro choice did not resume')
    oldx=snapshot(page)['player']['x']
    page.keyboard.down('ArrowRight');page.wait_for_timeout(450);page.keyboard.up('ArrowRight')
    x=snapshot(page)['player']['x']
    check(x>oldx+40,f'keyboard movement failed: {oldx}->{x}')
    # Explicitly land before jump: test keyboard jumping, not bootstrap falling time.
    page.evaluate('(x)=>window.__katzigamiTest.position(x,390)',x)
    page.evaluate('window.__katzigamiTest.step(.06)')
    page.keyboard.down('Space');page.wait_for_timeout(80)
    up=snapshot(page)['player']['vy'];page.keyboard.up('Space')
    check(up<0,f'jump failed: vy={up}')
    # Large touch targets and separate controls in landscape
    boxes=[page.locator('#'+id).bounding_box() for id in ('left','right','jump')]
    check(all(b['width']>=77 and b['height']>=77 for b in boxes),'touch target too small on landscape')
    check(boxes[1]['x']+boxes[1]['width']+50<boxes[2]['x'],'left/right group not separated')
    page.wait_for_timeout(400)
    # All twelve chapters, three per world. The seven quest mushrooms are distributed.
    for i in range(20):
        check(snapshot(page)['level']==i,f'chapter {i+1} did not begin')
        take_all(page)
        width=snapshot(page)['width']
        check(width>=3000,f'chapter {i+1} must be longer')
        if i==19:
            pos(page,width-410)
            check(snapshot(page)['phase']=='dialogue','final mirror cat missing')
            click(page,0)
            check(snapshot(page)['boss']['done'],'compassion did not resolve mirror')
        finish(page,width-105)
        if i==11:
            check(snapshot(page)['phase']=='dialogue','final choice missing')
            click(page,0)
            break
        if i in (4,9,14):
            check(snapshot(page)['phase']=='dialogue',f'branching chapter ending missing: {i}')
            click(page,0)
        check(snapshot(page)['level']==i+1,f'next chapter missing after {i}')
        if snapshot(page)['phase']=='dialogue':click(page,0)
    check(len(snapshot(page)['collected'])==7,'not all seven quest mushrooms collected')
    check(snapshot(page)['flags']['helpedMiso'],'Miso rescue did not persist')
    check(snapshot(page)['flags']['trustedQueen'],'queen trust not saved')
    check(snapshot(page)['flags']['readLetter'],'letter choice not saved')
    check(snapshot(page)['winner'],'final game not won')
    check(snapshot(page)['ending']=='WAHRES STERNEN-ENDE',f"unexpected ending: {snapshot(page)['ending']}")
    check('"version":1' in page.evaluate('localStorage.getItem("katzigami-v1")'),'save not stored')
    page.screenshot(path=str(ROOT/'tests'/'true-ending.png'))
    check(not errors,f'JS errors in true ending route: {errors}')
    print('PASS – 20 long levels, all seven quest mushrooms, true ending and chapter decisions')
    page.close()
    # Alternate route: reject the friends, then fight the high-health mirror boss.
    page,errors=load(browser)
    click(page,0);click(page,0);click(page,1);click(page,1)
    for i in range(12):
        width=snapshot(page)['width']
        if i==11:
            pos(page,width-410)
            check(snapshot(page)['phase']=='dialogue','combat boss intro missing')
            buttons=page.locator('.story-button').all_text_contents()
            check(any('Schattenpfote' in b for b in buttons),'fight option missing')
            click(page,0)
            check(snapshot(page)['boss']['active'],'boss battle did not start')
            check(snapshot(page)['boss']['maxHp']>=10,'boss HP too low')
            for hit in range(12):
                result=page.evaluate('window.__katzigamiTest.damageBoss(1)')
                check(result,f'boss damage {hit} failed')
                page.evaluate('window.__katzigamiTest.step(.36)')
            check(snapshot(page)['boss']['done'],'boss did not fall after repeated hits')
        finish(page,width-105)
        if i==11:
            click(page,1)
            break
        if i in (2,5,8):click(page,1)
        if snapshot(page)['phase']=='dialogue':click(page,0)
    check(snapshot(page)['ending']=='MOND-ENDE','alternate ending not saved')
    check(not errors,f'JS errors on alternate route: {errors}')
    print('PASS – alternative choices across twenty levels; repeated-hit boss and moon ending')
    page.close()
    # Portrait and large desktop layout tests.
    for w,h in [(390,844),(360,740),(1440,900)]:
        pg,errs=load(browser,w,h)
        box=[pg.locator('#'+id).bounding_box() for id in ('left','right','jump')]
        check(all(b['width']>=77 and b['height']>=77 for b in box),f'mobile buttons too small: {w}x{h}, {box}')
        check(box[0]['x']+box[0]['width']<box[1]['x'],'move buttons collide')
        check(box[1]['x']+box[1]['width']<box[2]['x'],'jump overlaps movement')
        check(box[2]['x']+box[2]['width']<=w+1,'jump off-screen')
        check(not errs,f'Layout {w}x{h} has errors: {errs}')
        pg.screenshot(path=str(ROOT/'tests'/f'layout-{w}x{h}.png'))
        pg.close()
    print('PASS – Responsive portrait/landscape/desktop controls: 360x740, 390x844, 844x390, 1440x900')
    browser.close()
print('ALL BROWSER TESTS PASSED')