"""Dialogue deck regression: varied, contextual, no repeated story scenes in one campaign."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
html=(ROOT/'index.html').read_text().replace('<script src="game.js" defer></script>','').replace('<link rel="stylesheet" href="style.css">','')
css=(ROOT/'style.css').read_text()
js=(ROOT/'game.js').read_text().replace("new URLSearchParams(location.search).has('test')","true")
memory='''<script>Object.defineProperty(window,"localStorage",{value:(()=>{const m={};return{getItem:k=>m[k]??null,setItem:(k,v)=>m[k]=String(v),removeItem:k=>delete m[k]}})()})</script>'''
html=html.replace('</head>','<style>'+css+'</style></head>').replace('</body>',memory+'<script>'+js+'</script></body>')
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None,args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':844,'height':390},device_scale_factor=1)
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='domcontentloaded')
 api='window.__katzigamiTest'
 def call(code):return page.evaluate(api+'.'+code)
 def choose(n):page.locator('[data-option="%d"]'%n).click()
 # Start a real game through normal character and difficulty selection.
 choose(0);choose(0);choose(1)
 assert 'Momo' in page.locator('.story-title').inner_text()
 assert len(page.locator('.story-button').all_text_contents())==2
 opener=page.locator('.story-title').inner_text()
 choose(0)
 stats=call('dialogueStats()')
 assert len(stats['worlds'])==7 and min(stats['worlds'].values())>=10,stats
 assert sum(stats['worlds'].values())+stats['wanderers']>=100,stats
 assert stats['prologues']>=12 and stats['friendOpeners']>=25 and stats['friendChoices']>=24,stats
 # Twenty chapters: questions, option triads, and even reaction lines never repeat.
 titles=[];questions=[];choice_sets=[];responses=[]
 for i in range(20):
  call('enterLevel('+str(i)+')')
  call('engage()')
  assert call('snapshot().phase')=='dialogue'
  title=page.locator('.story-title').inner_text()
  question=page.locator('.story-copy').inner_text()
  labels=page.locator('button[data-option]').all_text_contents()
  assert len(labels)==3,labels
  assert len(set(labels))==3,labels
  titles.append(title);questions.append(question);choice_sets.append(tuple(labels))
  choose(1)
  response=page.locator('.story-copy').inner_text()
  responses.append(response)
  choose(0)
  assert call('snapshot().phase')=='playing'
 assert len(set(titles))==20,('Repeated scene titles',titles)
 assert len(set(questions))==20,('Repeated dialogue',questions)
 assert len(set(choice_sets))==20,('Repeated options',choice_sets)
 assert len(set(responses))==20,('Repeated reaction dialogue',responses)
 seen=call('dialogueUsed()')
 assert len(seen)==len(set(seen)),('Duplicate used dialogue IDs',seen)
 assert len(seen)>=40,('Scenes or reactions not saved',seen)
 # Manual save carries dialogue history, protecting uniqueness after restoring.
 assert call('createSlot("Vor einer neuen Unterhaltung").ok')
 saved=call('dialogueUsed()')
 call('enterLevel(0)')
 call('engage()')
 extra=page.locator('.story-title').inner_text()
 assert extra not in titles
 choose(2);choose(0)
 assert call('loadSlot("Vor einer neuen Unterhaltung")')
 assert call('dialogueUsed()')==saved
 call('enterLevel(0)')
 call('engage()')
 assert page.locator('.story-title').inner_text() not in titles
 choose(0);choose(0)
 # Repeated friends receive separate one-time openings and answer triads.
 friend_bodies=[];friend_choices=[]
 for i in [1,3,11,14,18]:
  call('enterLevel('+str(i)+')')
  assert call('friendMeet()')
  friend_bodies.append(page.locator('.story-copy').inner_text())
  friend_choices.append(tuple(page.locator('button[data-option]').all_text_contents()))
  choose(2)
 assert len(set(friend_bodies))==len(friend_bodies),friend_bodies
 assert len(set(friend_choices))==len(friend_choices),friend_choices
 # New games reset the deck and vary the opening; they do not reset other game rules.
 opening_titles={opener}
 for i in range(10):
  call('newCampaign()')
  call('replayPrologue()')
  opening_titles.add(page.locator('.story-title').inner_text())
  choose(0)
 assert len(opening_titles)>=4,('Not enough randomized prologues',opening_titles)
 assert not errors,errors
 print('PASS – 100+ contextual dialogue scenes, 12+ prologues, twenty unique replies/choices/reactions, recurring friends, manual-save preservation and varied new games')
 browser.close()
