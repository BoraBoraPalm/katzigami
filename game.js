/* KATZIGAMI — The Mushroom Oracle. Original graphics, story, and synthesized audio.
   All characters are cats. No third-party runtime dependencies. */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const canvas = $('game'), ctx = canvas.getContext('2d', {alpha:false});
const stage = $('stage'), overlay = $('overlay'), overlayContent = $('overlay-content');
const heartsUI = $('hearts'), mushroomsUI = $('mushrooms'), levelUI = $('level'), chapterUI = $('chapter-label');
const SAVE_KEY='katzigami-v1', TOTAL=7, HEIGHT=540;
const MUSHROOMS={
 giggle:{name:'Kicherling',color:'#ff9ab9',hint:'Er kichert sogar über schlechte Wortspiele.'},
 rose:{name:'Rosenröhrling',color:'#ed7eb1',hint:'Du riechst plötzlich nach Marmelade.'},
 mint:{name:'Minz-Miau',color:'#70d3ad',hint:'Frischer Atem für Drachenkatzen.'},
 lantern:{name:'Leuchtpfote',color:'#ffd96c',hint:'Er leuchtet bei verdächtigen Ausreden.'},
 moon:{name:'Mondmilchling',color:'#c1afff',hint:'Ein Stück vom Mond. Schmeckt nach Käse.'},
 cloud:{name:'Wolkenknusper',color:'#9cddff',hint:'Flauschig. Unverschämt flauschig.'},
 crown:{name:'Kronenknopf',color:'#ffb75c',hint:'Der letzte Pilz. Er trägt ein winziges Krönchen.'}
};
const POWERS={
 blossom:{name:'Blütenpfote', color:'#ff78af',symbol:'✿',hint:'Momo verschießt kichernde Blüten!'},
 spark:{name:'Funkelpfote',color:'#ffd077',symbol:'⚡',hint:'Sternenfunken kitzeln Schattenkatzen!'},
 moon:{name:'Mondpfote',color:'#bda8ff',symbol:'☾',hint:'Mondkugeln zaubern den Weg frei!'},
 starlight:{name:'Sternenpfote',color:'#8ce4e9',symbol:'✦',hint:'Funkelsterne besiegen sogar den Spiegel!'}
};
const LEVEL_MUSIC=[
 {tempo:.205,melody:[523,659,784,659,587,698,784,0,659,784,880,784,698,587,523,0],bass:[262,0,392,0,294,0,440,0,330,0,440,0,294,0,392,0]},
 {tempo:.245,melody:[392,466,523,0,466,392,349,0,392,523,587,523,466,349,392,0],bass:[196,0,0,294,233,0,0,349,196,0,294,0,175,0,262,0]},
 {tempo:.275,melody:[523,0,622,698,0,622,523,466,523,0,784,698,622,0,523,0],bass:[262,0,0,392,311,0,0,466,262,0,392,0,233,0,349,0]},
 {tempo:.235,melody:[440,523,659,0,784,659,523,0,494,587,698,880,784,659,587,0],bass:[220,0,330,0,247,0,370,0,220,0,349,0,294,0,440,0]}
];
const CHAPTERS=[
 {name:'Die Kicherwiese',subtitle:'KAPITEL 1 · WO BLUMEN WITZE ERZÄHLEN',sky:['#8bdbff','#ffdaea'],hills:['#b7e3ba','#7ed0aa'],grass:'#70bd86',soil:'#b88a9e',width:2380,
  gaps:[[1080,1195]], platforms:[[365,350,180],[865,346,185],[1030,410,280],[1400,356,195],[1870,352,190]],
  mushrooms:[['giggle',440,312],['rose',1485,316]],enemies:[670,1630,2080],npcs:[[260,'Pip','Jeder Pilz hat ein Geheimnis. Meins ist: Ich kann nicht pfeifen.','peach']],
  checkpoint:[900,1750],power:['blossom',810,400]},
 {name:'Der Flüsterwald',subtitle:'KAPITEL 2 · ALLE GERÜCHTE HABEN SCHNURRHAARE',sky:['#a1e2ca','#ffe7b5'],hills:['#96d5b1','#72b99d'],grass:'#70b78f',soil:'#9a80a0',width:2550,
  gaps:[[1290,1425]],platforms:[[440,360,205],[900,348,200],[1235,404,260],[1500,345,210],[1990,355,210]],
  mushrooms:[['mint',575,321],['lantern',1585,307]],enemies:[730,1150,1740,2210],npcs:[[400,'Yuki','Die Königin sammelt Farben! Aber warum trägt sie nur Grau?','lilac']],checkpoint:[1050,1900],power:['spark',1080,400]},
 {name:'Der Zuckermond',subtitle:'KAPITEL 3 · DIE WAHRHEIT HAT EINEN SCHWANZ',sky:['#b1b0f4','#ffd5ef'],hills:['#a9a0e8','#8b92d1'],grass:'#ad9ccf',soil:'#9f7fa5',width:2720,
  gaps:[[1190,1320],[1900,2025]],platforms:[[410,350,200],[690,342,170],[1110,405,300],[1470,348,220],[1820,404,275],[2190,350,200]],
  mushrooms:[['moon',760,303],['cloud',1940,366]],enemies:[890,1520,2115,2420],npcs:[[490,'Dahlia','Ich habe die Farben NICHT gestohlen. Ich habe sie in Sicherheit gebracht, du Fellkartoffel!','rose']],checkpoint:[1070,1830],power:['moon',1660,400]},
 {name:'Der Sternengarten',subtitle:'KAPITEL 4 · DIE ZEIT KANN NICHT SCHNURREN',sky:['#958dd1','#f5b4cd'],hills:['#ae9fd2','#856cae'],grass:'#91b6a9',soil:'#866f9a',width:2730,
  gaps:[[950,1075],[1670,1810]],platforms:[[340,350,210],[860,402,280],[1280,348,205],[1600,403,290],[1810,340,200],[2125,355,190]],
  mushrooms:[['crown',1910,302]],enemies:[660,1420,2070],npcs:[[310,'Miso','Wenn wir das überleben, gründe ich eine Pilz-Pizzeria. Ohne Pilze.','ginger']],checkpoint:[1020,1880],power:['starlight',1230,402]}
];
const defaultSave=()=>({version:1,level:0,collected:[],hearts:3,checkpoint:0,flags:{},shown:[],won:false,ending:'',deaths:0,mute:false,power:null});
function loadSave(){try{const raw=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(!raw||raw.version!==1||!Array.isArray(raw.collected)||!Number.isInteger(raw.level))return defaultSave();return {...defaultSave(),...raw,flags:raw.flags&&typeof raw.flags==='object'?raw.flags:{},collected:raw.collected.filter(x=>Object.hasOwn(MUSHROOMS,x)),shown:Array.isArray(raw.shown)?raw.shown:[],level:Math.max(0,Math.min(3,raw.level)),hearts:Math.max(1,Math.min(3,Number(raw.hearts)||3)),power:Object.hasOwn(POWERS,raw.power)?raw.power:null}}catch{return defaultSave()}}
let save=loadSave(),level=null,player=null,phase='menu',vxInput={left:false,right:false,jump:false},clock=0,viewW=960,cam=0,toastUntil=0,lastFrame=0,ambience=0,boss=null,queuedJump=0,coyote=0,audioCtx=null,audioMuted=!!save.mute,musicAt=0,musicStep=0,particles=[],shots=[],specialCooldown=0,powerFlash=0;
const rand=(x)=>{let v=Math.sin(x*127.1+18.27)*43758.5453;return v-Math.floor(v)};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(save))}catch{/* localStorage may be disabled; current session still works */}}
function updateUI(){const ability=$('special'),power=save.power&&POWERS[save.power];ability.disabled=!power;ability.classList.toggle('unlocked',!!power);ability.setAttribute('aria-label',power?'Spezialfähigkeit '+power.name+' einsetzen':'Spezialfähigkeit gesperrt – zuerst Verwandlungspilz einsammeln');ability.title=power?'Spezialfähigkeit: '+power.name:'Zuerst Verwandlungspilz sammeln';$('special-icon').textContent=power?power.symbol:'🔒';$('special-label').textContent=power?'MAGIE':'GESPERRT';ability.style.setProperty('--power-color',power?power.color:'#c6b6c8');heartsUI.textContent='♥ '.repeat(save.hearts).trim()+' ♡'.repeat(3-save.hearts);mushroomsUI.textContent='🍄 '+save.collected.length+'/'+TOTAL;levelUI.textContent=(save.level+1)+' / 4';chapterUI.textContent=CHAPTERS[save.level].name.toUpperCase();$('sound-toggle').textContent=audioMuted?'♩':'♫';$('sound-toggle').setAttribute('aria-label',audioMuted?'Ton einschalten':'Ton ausschalten')}
function resize(){const r=stage.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);if(r.width<1||r.height<1)return;viewW=HEIGHT*r.width/r.height;canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);ctx.setTransform(canvas.width/viewW,0,0,canvas.height/HEIGHT,0,0);ctx.imageSmoothingEnabled=true;if(level)cam=clamp(cam,0,Math.max(0,level.width-viewW))}
function tone(freq,when,duration,wave='sine',volume=.11,endFreq){if(audioMuted)return;try{audioCtx??=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=wave;o.frequency.setValueAtTime(Math.max(60,freq),when);if(endFreq)o.frequency.exponentialRampToValueAtTime(Math.max(60,endFreq),when+duration);g.gain.setValueAtTime(.0001,when);g.gain.exponentialRampToValueAtTime(volume,when+.015);g.gain.exponentialRampToValueAtTime(.0001,when+duration);o.connect(g).connect(audioCtx.destination);o.start(when);o.stop(when+duration+.012)}catch{/* Audio unavailable */}}
function sound(kind){if(audioMuted)return;let now;try{audioCtx??=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();now=audioCtx.currentTime}catch{return}
 if(kind==='jump'){tone(265,now,.12,'triangle',.09,465);tone(550,now+.09,.10,'sine',.035,670)}
 if(kind==='pick'){[520,665,790,1050].forEach((n,i)=>tone(n,now+i*.065,.16,'sine',.09))}
 if(kind==='hurt'){tone(470,now,.21,'sawtooth',.065,170);tone(155,now+.08,.13,'triangle',.065,100)}
 if(kind==='bonk'){tone(190,now,.11,'square',.06,110);tone(510,now+.10,.14,'sine',.07,830)}
 if(kind==='choice'){tone(490,now,.07,'sine',.08);tone(735,now+.085,.15,'triangle',.08)}
 if(kind==='meow'){tone(510,now,.16,'triangle',.09,310);tone(600,now+.15,.20,'sine',.09,280)}
 if(kind==='win'){[392,523,659,784,1046,1318].forEach((n,i)=>tone(n,now+i*.105,.34,'triangle',.09))}
 if(kind==='enemy'){tone(330,now,.09,'triangle',.09,800);tone(180,now+.08,.2,'sine',.06,100)}
 if(kind==='transform'){[392,523,659,784,1046,1318,1568].forEach((n,i)=>tone(n,now+i*.085,.27,i%2?'triangle':'sine',.10))}
 if(kind==='cast'){tone(650,now,.10,'sine',.055,1150);tone(330,now+.05,.14,'triangle',.04,760)}
 if(kind==='break'){[780,560,390].forEach((n,i)=>tone(n,now+i*.075,.18,'triangle',.08))}
}
// Original four-song soundtrack, synthesized in real time after the first user gesture.
function musicTick(){
 if(phase!=='playing'||audioMuted||!audioCtx||audioCtx.state!=='running')return;
 const now=audioCtx.currentTime,track=LEVEL_MUSIC[save.level];
 if(musicAt<now-.8)musicAt=now+.025;
 let notes=0;
 while(musicAt<now+.12&&notes++<3){
  const i=musicStep%16,n=track.melody[i],b=track.bass[i];
  if(n)tone(n*(save.power?1.5:1),musicAt,track.tempo*.78,save.power?'sine':save.level===1?'triangle':'sine',save.power?.023:.030);
  if(b)tone(b,musicAt,track.tempo*1.35,'triangle',.020);
  if(save.power&&i%4===2)tone(n? n*2:784,musicAt+.045,track.tempo*.56,'sine',.014);
  musicAt+=track.tempo;musicStep++;
 }
}
function resetMusic(){musicAt=0;musicStep=0}
function burst(x,y,color,n=18){for(let i=0;i<n;i++){const a=i*Math.PI*2/n+rand(clock*700+i),v=75+rand(i*23+clock)*180;particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-60,life:.5+rand(i)*.5,max:.9,color,size:3+rand(i*7)*6})}if(particles.length>220)particles.splice(0,particles.length-220)}
function toast(text){$('toast').textContent=text;$('toast').classList.add('show');toastUntil=performance.now()+2300}
function clearInputs(){vxInput.left=vxInput.right=vxInput.jump=false;queuedJump=0;['left','right','jump','special'].forEach(id=>$(id).classList.remove('pressed'))}
function showOverlay(html){overlayContent.innerHTML=html;overlay.classList.add('visible');clearInputs()}
function hideOverlay(){overlay.classList.remove('visible');overlayContent.replaceChildren()}
function card(tag,title,portrait,body,buttons){return `<article class="story-card"><div class="story-tag">${tag}</div><div class="story-portrait"><span>${portrait}</span></div><h1 class="story-title">${title}</h1><p class="story-copy">${body}</p><div class="choice-grid">${buttons.map((b,i)=>`<button class="story-button ${b.secondary?'secondary':''}" data-option="${i}" type="button">${b.label}</button>`).join('')}</div></article>`}
function presentCard(tag,title,portrait,body,options){showOverlay(card(tag,title,portrait,body,options));overlayContent.querySelectorAll('[data-option]').forEach((el,i)=>el.addEventListener('click',()=>{sound('choice');hideOverlay();options[i].action()},{once:true}))}
function dialog({tag='KATZEN-GESPRÄCH',title,portrait='🐱 ✨ 🐱',body,options}){phase='dialogue';presentCard(tag,title,portrait,body,options)}
function hasSavedGame(){try{return !!localStorage.getItem(SAVE_KEY)}catch{return false}}
function menu(){phase='menu';updateUI();presentCard('EIN HANDGEMACHTES KATZENABENTEUER','KATZIGAMI ✿','🐱 🍄 🌸','Momo, eine unerschrocken verfressene Katze, sucht sieben magische Pilze. Verwandlungspilze verleihen ihr besondere Katzenkräfte! Doch jemand hat die Farben des Waldes gestohlen …',[
 ...(hasSavedGame()? [{label:save.won?'🌸 Noch einmal das Finale / weiterspielen':'🐾 Spielstand fortsetzen',action:()=>enterLevel(save.level,true)}]:[]),
 {label:'✿ Neues Abenteuer beginnen',action:()=>{save=defaultSave();persist();enterLevel(0,true)}},
 {label:'🎮 So spielt man',secondary:true,action:help}
 ]);
}
function help(){dialog({tag:'SPIELANLEITUNG',title:'Mit zwei Daumen ins Abenteuer!',portrait:'⬅️ 🐱 ➡️ ⬆️',body:'Links: laufen. Rechts: springen (gedrückt halten = höher!). Die NEUE Magietaste daneben wird ERST nach einem besonderen Verwandlungspilz aktiv; damit wirfst du Zauberkugeln. Bei Schaden verliert Momo ihre Verwandlung. Sammle sieben Orakelpilze, springe auf freche Schattenkatzen und erreiche die glitzernde Tür. Deine Antworten ändern Abkürzungen, Gegner, den Endkampf und das Ende. Spielstände werden automatisch auf diesem Gerät gespeichert. Auf PC: A/D oder Pfeiltasten, Leertaste zum Springen.',options:[{label:'Miau, verstanden! 🐾',action:()=>phase==='dialogue'&&menu()}]})}
function markShown(key){if(!save.shown.includes(key)){save.shown.push(key);persist();return false}return true}
function enterLevel(i,withIntro=false){const restoring=withIntro&&i===save.level&&!save.won&&save.checkpoint>0;const spawnX=restoring?save.checkpoint:78;save.level=i;if(!restoring)save.checkpoint=0;save.hearts=Math.max(1,save.hearts);level=makeLevel(i);boss={triggered:false,active:false,done:false,hp:2,x:level.width-315,y:402,inv:0};player={x:spawnX,y:330,w:43,h:60,vx:0,vy:0,grounded:false,facing:1,inv:1,landed:false,runCycle:0};shots=[];particles=[];specialCooldown=0;powerFlash=0;resetMusic();cam=0;coyote=0;clearInputs();persist();updateUI();hideOverlay();phase='playing';if(withIntro&&!markShown('start'+i))startDialog(i)}
function makeLevel(i){const d=CHAPTERS[i];let ground=[],previous=0;for(const [from,to] of d.gaps){ground.push({x:previous,y:450,w:from-previous,h:100,ground:true});previous=to}ground.push({x:previous,y:450,w:d.width-previous,h:100,ground:true});const platforms=d.platforms.map(([x,y,w])=>({x,y,w,h:24,ground:false}));let enemies=d.enemies.map((x,j)=>({base:x,x,y:411,dead:false,seed:j+i*4,range:38}));if(i===1&&!save.flags.helpedMiso){enemies.push({base:1360,x:1360,y:366,dead:false,seed:8,range:25})}if(i===2&&!save.flags.trustedQueen){enemies.push({base:1140,x:1140,y:365,dead:false,seed:11,range:25},{base:1760,x:1760,y:367,dead:false,seed:13,range:25})}if(i===3&&save.flags.readLetter){enemies=enemies.slice(0,2)}
 if(i===1&&save.flags.helpedMiso)platforms.push({x:1135,y:350,w:245,h:24,ground:false,helper:true});
 if(i===2&&save.flags.trustedQueen)platforms.push({x:1720,y:345,w:300,h:24,ground:false,helper:true});
 return {...d,index:i,ground,platforms,enemies,items:d.mushrooms.map(([id,x,y])=>({id,x,y,taken:save.collected.includes(id)})),powerItem:{id:d.power[0],x:d.power[1],y:d.power[2],taken:false},checkpoints:d.checkpoint};}
function startDialog(i){if(i===0){dialog({tag:'PROLOG · DIE VERLORENEN FARBEN',title:'Momo und das Pilzorakel',portrait:'🐱 🍄 🌸',body:'»MIAU?!« Alle Blumen werden blass! Pilzbote Pip behauptet, Königin Dahlia hätte die Farben gestohlen. Sammle die sieben Orakelpilze und finde heraus, wer hier eigentlich Quatsch erzählt.',options:[{label:'🍰 Erst Kuchen, dann Weltrettung!',action:()=>{save.flags.cake=true;persist();resume();toast('Momo: »Ich rette niemals nüchtern … äh, hungrig!«')}},{label:'⚔️ Ich bin die auserwählte Samtpfote!',action:()=>{save.flags.hero=true;persist();resume();toast('Momo: »Schicksal, zieh dich warm an!«')}}]});return}
 const details=[null,{title:'Ein Wald voller Gerüchte',portrait:'🐈 🌳 🐈',body:save.flags.helpedMiso?'Miso wurde gerettet und begleitet dich. Sie kennt geheime Pilzpfade!':'Miso ist beleidigt und hat die Brücke mitgenommen. Jetzt warten zusätzliche Schattenkatzen. Autsch.',line:'Die Wahrheit raschelt zwischen den Blättern.'},{title:'Die Königin in Grau',portrait:'👑 🐈 🌙',body:save.flags.trustedQueen?'Dahlia dankt für dein Vertrauen: Ein sicherer Mondsteg erscheint.':'Du glaubst Pip. Doch die Wolkenkatzen sehen plötzlich erstaunlich bissig aus.'},{title:'Der Garten außerhalb der Zeit',portrait:'⏳ 🐱 🌼',body:save.flags.readLetter?'Der Brief verrät, wie das Spiegelkätzchen entstand. Du kannst mit ihm reden.':'Du hast den Brief verworfen. Vielleicht kann ein Pilz das Spiegelkätzchen trotzdem besänftigen.'}];const v=details[i];dialog({tag:CHAPTERS[i].subtitle,title:v.title,portrait:v.portrait,body:v.body,options:[{label:'🐾 Weiter in den Blumenwahnsinn!',action:resume}]});}
function resume(){hideOverlay();phase='playing';clearInputs();lastFrame=performance.now();musicAt=0}
function pause(){if(phase==='playing'){phase='paused';clearInputs();presentCard('PAUSE · EINE KATZE MUSS MAL SITZEN','Miau-Pause','🐱 ☕ 🌸',`Kapitel ${save.level+1}: ${CHAPTERS[save.level].name}. Gesammelte Pilze: ${save.collected.length}/${TOTAL}. Dein Fortschritt ist gespeichert.`,[
 {label:'▶ Weiterhüpfen',action:resume},
 {label:'↩ Kapitel neu starten',action:()=>enterLevel(save.level)},
 {label:'🏠 Hauptmenü',secondary:true,action:menu}
 ])}else if(phase==='paused')resume()}
function checkEndOfLevel(){if(phase!=='playing')return;if(save.level===3){if(!boss.done){toast('Ein magischer Spiegel versperrt den Ausgang!');player.x=Math.min(player.x,level.width-230);return}endChoice();return}
 const i=save.level;
 if(i===0){dialog({tag:'PLOT TWIST · KAPITEL 1',title:'Miso in der Seifenblase',portrait:'🐈 🫧 🐱',body:'Kätzchen Miso hängt in einer riesigen Seifenblase. Gleichzeitig flattert eine Karte mit geheimen Abkürzungen davon. Pip ruft: »Rette die Karte! Katzen haben neun Leben!«',options:[
 {label:'💗 Miso retten – Freunde sind wichtiger!',action:()=>{save.flags.helpedMiso=true;nextChapter('Miso: »Ich schulde dir ein Leben. Und eine Pizza.«')}},
 {label:'🗺️ Karte jagen – die Mission geht vor!',action:()=>{save.flags.helpedMiso=false;nextChapter('Miso: »Ich merke mir das. Sehr detailliert.«')}}
 ]})}
 if(i===1){dialog({tag:'PLOT TWIST · KAPITEL 2',title:'Die Königin hat ein Geheimnis',portrait:'👑 🐈 🐾',body:'Königin Dahlia sagt, sie habe alle Farben in einer Sanduhr versteckt, um den Wald vor dem ewigen Stillstand zu retten. Pip ruft: »Das sagen ALLE verdächtigen Katzen!«',options:[
 {label:'🌷 Dahlia glauben – ihre Geschichte anhören',action:()=>{save.flags.trustedQueen=true;nextChapter('Dahlia: »Endlich jemand mit Ohren UND Gehirn.«')}},
 {label:'🦉 Pip glauben – die Königin ist schuld!',action:()=>{save.flags.trustedQueen=false;nextChapter('Pip: »Ich war nie eine Eule! Ich bin ein KATER!«')}}
 ]})}
 if(i===2){dialog({tag:'DIE GROSSE WENDUNG · KAPITEL 3',title:'Die Katze von morgen',portrait:'🐱 ⏳ 🐱',body:'In der Uhr liegt ein Brief von MOMO … aus der Zukunft! Das Spiegelkätzchen ist ein zukünftiges Ich, das die Zeit anhielt, um einen einzigen perfekten Tag nie zu verlieren. Dahlia hat die Farben versteckt, um die Zeit wieder anzuschubsen!',options:[
 {label:'💌 Brief lesen – auch das traurige Ende',action:()=>{save.flags.readLetter=true;nextChapter('Brief-Momo: »P.S. Kauf keinen Thunfisch aus der Zukunft.«')}},
 {label:'🔥 Brief zuklappen – ich entscheide selbst!',action:()=>{save.flags.readLetter=false;nextChapter('Momo: »Spoiler sind schlimmer als Gurken!«')}}
 ]})}
}
function nextChapter(msg){toast(msg);save.level++;save.hearts=3;save.checkpoint=0;persist();sound('meow');enterLevel(save.level,true)}
function bossTalk(){if(phase!=='playing'||boss.triggered)return;boss.triggered=true;const empathic=!!save.flags.readLetter,canOffer=save.collected.length>=5;let options=[];
 if(empathic){options.push({label:'💞 »Ich weiß, wer du bist. Komm mit, Zukunfts-Momo.«',action:()=>{boss.done=true;save.flags.kindShadow=true;persist();resume();toast('Spiegel-Momo: »Du hast mich … nicht gehasst?«')}})}
 else if(canOffer){options.push({label:'🍄 Einen Pilz teilen – Frieden?',action:()=>{boss.done=true;save.flags.kindShadow=true;persist();resume();toast('Spiegel-Momo: »Ist das … Käsegeschmack?!«')}})}
 options.push({label:'⚔️ »Dann tanzen wir, Schattenpfote!« (2 Treffer)',action:()=>{boss.active=true;save.flags.kindShadow=false;persist();resume();toast('Spring dem Spiegelkätzchen zweimal auf den Kopf!')}});
 dialog({tag:'FINALE · DER SPIEGEL',title:'Du bist … ICH?!',portrait:'🐱 🪞 🐈‍⬛',body:'Spiegel-Momo: »Ich habe den besten Tag meines Lebens angehalten. Keiner musste Abschied nehmen. Aber jetzt können die Blumen nicht mehr wachsen … und mein Fischstäbchen ist seit 700 Jahren kalt.«',options})}
function endChoice(){if(phase!=='playing')return;dialog({tag:'FINALE · DEINE ENTSCHEIDUNG',title:'Die Uhr tickt wieder',portrait:'🌈 🐱 ⏳',body:`Du hast ${save.collected.length} von ${TOTAL} Orakelpilzen. Momo hält die Sanduhr in den Pfoten. Die Welt kann wieder wachsen – oder für immer in einem hübschen Augenblick bleiben.`,options:[
 {label:'🌸 Zeit freigeben – Veränderung wagen',action:()=>ending('release')},
 {label:'🌙 Alles für immer bewahren – den Moment einfrieren',action:()=>ending('freeze')}
 ]})}
function ending(choice){save.flags.finalChoice=choice;save.won=true;let type,title,body;
 if(choice==='freeze'){type='MOND-ENDE';title='Ein schnurrender Augenblick';body='Die Zeit steht still. Alle Katzen genießen ewig dieselbe Teestunde. Problem: Der Tee ist nach vier Milliarden Schlucken noch immer lauwarm. Momo lernt, dass auch perfekte Tage manchmal weitergehen sollten.'}
 else if(save.collected.length===TOTAL&&save.flags.helpedMiso&&save.flags.trustedQueen&&save.flags.readLetter&&save.flags.kindShadow){type='WAHRES STERNEN-ENDE';title='Sieben Pilze und neun Leben';body='Du hast alle sieben Pilze gefunden, Miso gerettet, Dahlia vertraut und Zukunfts-Momo vergeben! Der Wald erblüht. Pip eröffnet eine Nachrichtenagentur, die erstmals Fakten prüft. Und Miso bestellt eine Pizza. Mit Pilzen. Wahnsinn!'}
 else if(save.collected.length===TOTAL){type='REGENBOGEN-ENDE';title='Die Farben kehren zurück';body='Alle sieben Pilze leuchten gleichzeitig! Die Uhr erwacht. Die Blumen blühen wieder, Dahlia lässt die Farben frei, und Momo wird zur offiziellen Heldin der königlichen Snackabteilung.'}
 else {type='PFOTEN-ENDE';title='Ein unperfekt perfekter Morgen';body='Die Zeit geht wieder weiter – auch mit ein paar fehlenden Pilzen. Manchmal muss man mutig sein, bevor man alles versteht. Momo und die Katzen feiern mit einer Torte, die verdächtig nach Thunfisch schmeckt.'}
 save.ending=type;persist();sound('win');phase='ending';presentCard(`🏆 ${type}`,title,'🐈 🌈 🍄',body,[{label:'🐾 Die Pilze noch einmal suchen',action:()=>{save.won=false;save.level=0;save.checkpoint=0;persist();enterLevel(0)}},{label:'🏠 Hauptmenü',secondary:true,action:menu}])}
function transform(item){
 if(item.taken)return;
 item.taken=true;
 save.power=item.id;powerFlash=1.25;specialCooldown=.2;
 persist();updateUI();sound('transform');burst(item.x,item.y,POWERS[item.id].color,36);
 if(navigator.vibrate)navigator.vibrate([35,40,45]);
 toast('✨ VERWANDLUNG! '+POWERS[item.id].name+' – '+POWERS[item.id].hint+' Magietaste freigeschaltet!');
 resetMusic();
}
function castSpecial(){
 if(phase!=='playing'||!save.power||!player||specialCooldown>0)return false;
 const p=POWERS[save.power],speed=560;
 shots.push({x:player.x+player.w/2+player.facing*29,y:player.y+22,vx:player.facing*speed,life:1.4,kind:save.power,color:p.color});
 specialCooldown=.48;burst(player.x+player.w/2+player.facing*30,player.y+22,p.color,7);sound('cast');
 if(navigator.vibrate)navigator.vibrate(12);
 return true;
}
function collect(item){if(item.taken)return;item.taken=true;if(!save.collected.includes(item.id))save.collected.push(item.id);persist();updateUI();sound('pick');if(navigator.vibrate)navigator.vibrate(20);toast(`🍄 ${MUSHROOMS[item.id].name}! ${MUSHROOMS[item.id].hint}`)}
function hurt(){if(player.inv>0||phase!=='playing')return;player.inv=1.5;if(save.power){const p=POWERS[save.power];burst(player.x+20,player.y+10,p.color,30);save.power=null;specialCooldown=0;shots=[];sound('break');toast('Oh nein! Momo verliert ihre Verwandlung! 🍄');persist();updateUI();resetMusic();player.vy=-440;player.vx=-player.facing*240;return}save.hearts=Math.max(0,save.hearts-1);sound('hurt');updateUI();player.vy=-440;player.vx=-player.facing*240;toast('Autsch! Die Schattenkatze ruft: »Miau-ha-ha!«');if(save.hearts<=0){save.deaths++;save.hearts=3;const newX=save.checkpoint||78;player.x=newX;player.y=320;player.vy=0;player.inv=2;updateUI();toast('Neun Leben? Praktisch unbegrenzt! 🐾')}persist()}
function jump(){if(phase!=='playing')return;queuedJump=.16}
function simulate(dt){clock+=dt;if(phase!=='playing'||!player||!level)return;
 player.inv=Math.max(0,player.inv-dt);boss.inv=Math.max(0,boss.inv-dt);powerFlash=Math.max(0,powerFlash-dt);specialCooldown=Math.max(0,specialCooldown-dt);coyote=Math.max(0,coyote-dt);queuedJump=Math.max(0,queuedJump-dt);
 const target=(Number(vxInput.right)-Number(vxInput.left))*330;
 const acceleration=player.grounded?2350:1470;
 player.vx+=(target-player.vx)*Math.min(1,dt* (acceleration/330));if(Math.abs(target)<1&&Math.abs(player.vx)<4)player.vx=0;
 if(target)player.facing=target>0?1:-1;
 if(queuedJump>0&&(player.grounded||coyote>0)){player.vy=-710;player.grounded=false;coyote=0;queuedJump=0;sound('jump')}
 if(!vxInput.jump&&player.vy<-280)player.vy+=1850*dt;
 const previousBottom=player.y+player.h;
 player.vy=Math.min(1100,player.vy+1780*dt);
 player.x=clamp(player.x+player.vx*dt,0,level.width-player.w);if(player.grounded&&Math.abs(player.vx)>14)player.runCycle+=Math.abs(player.vx)*dt*.073;
 player.y+=player.vy*dt;let landing=null;
 if(player.vy>=0){for(const platform of [...level.ground,...level.platforms]){
 if(player.x+player.w-7<platform.x||player.x+7>platform.x+platform.w)continue;
 if(previousBottom<=platform.y+10&&player.y+player.h>=platform.y){if(!landing||platform.y<landing.y)landing=platform}
 }}
 if(landing){player.y=landing.y-player.h;player.vy=0;if(!player.grounded)player.landed=true;player.grounded=true;coyote=.11}else{if(player.grounded)coyote=.11;player.grounded=false}
 if(player.y>HEIGHT+120){save.deaths++;if(save.power){save.power=null;shots=[];resetMusic()}sound('hurt');save.hearts=Math.max(1,save.hearts-1);const cp=save.checkpoint||78;player.x=cp;player.y=320;player.vx=0;player.vy=0;player.inv=1.5;persist();updateUI();toast('Plumps! Momo landet auf ihrer Würde. 🐾')}
 for(const [k,cp] of level.checkpoints.entries()){if(player.x>cp&&save.checkpoint<cp){save.checkpoint=cp;persist();toast(k===0?'✿ Schnurrpunkt erreicht!':'✿ Letzter Schnurrpunkt erreicht!');sound('choice')}}
 for(const item of level.items){if(item.taken)continue;if(Math.abs(player.x+player.w/2-item.x)<37&&Math.abs(player.y+player.h/2-item.y)<49)collect(item)}
 const powerItem=level.powerItem;if(!powerItem.taken&&Math.abs(player.x+player.w/2-powerItem.x)<38&&Math.abs(player.y+player.h/2-powerItem.y)<51)transform(powerItem);
 for(const shot of shots){
  shot.x+=shot.vx*dt;shot.life-=dt;
  for(const e of level.enemies){if(e.dead||Math.abs(shot.x-(e.x+18))>31||Math.abs(shot.y-(e.y+26))>35)continue;e.dead=true;shot.life=0;burst(e.x+18,e.y+20,shot.color,14);sound('bonk');toast('Puff! Schattenkatze weggefunkt!');break}
  if(save.level===3&&boss&&boss.active&&boss.inv<=0&&Math.abs(shot.x-(boss.x+Math.sin(clock*1.3)*60+15))<43&&Math.abs(shot.y-(boss.y+24))<56){boss.hp--;boss.inv=.85;shot.life=0;burst(shot.x,shot.y,shot.color,18);sound('enemy');toast(boss.hp>0?'Spiegel-Momo: »Meine Frisur!«':'Spiegel-Momo: »Gut, du gewinnst. Kekse?«');if(boss.hp<=0){boss.active=false;boss.done=true}}
 }
 shots=shots.filter(sh=>sh.life>0&&sh.x>=0&&sh.x<level.width);
 for(const fx of particles){fx.x+=fx.vx*dt;fx.y+=fx.vy*dt;fx.vy+=210*dt;fx.life-=dt}particles=particles.filter(f=>f.life>0);
 for(const e of level.enemies){if(e.dead)continue;e.x=e.base+Math.sin(clock*1.25+e.seed*2.2)*e.range;const ey=e.y;
 if(player.x+player.w>e.x-18&&player.x<e.x+40&&player.y+player.h>ey&&player.y<ey+44){if(player.vy>70&&previousBottom<=ey+18){e.dead=true;player.vy=-485;player.grounded=false;sound('bonk');toast('BONK! Die Schattenkatze meldet sich krank.')}else hurt()}}
 if(save.level===3&&!boss.done){const bx=boss.x+Math.sin(clock*1.3)*60,bY=boss.y;
 if(player.x>level.width-475&&!boss.triggered)bossTalk();
 if(boss.active&&boss.inv<=0&&player.x+player.w>bx-20&&player.x<bx+49&&player.y+player.h>bY&&player.y<bY+51){if(player.vy>80&&previousBottom<=bY+16){boss.hp--;boss.inv=.85;player.vy=-575;player.grounded=false;sound('enemy');toast(boss.hp>0?'Spiegel-Momo: »Das kitzelt mein Ego!«':'Spiegel-Momo: »Okay, du gewinnst. Kekse?«');if(boss.hp<=0){boss.active=false;boss.done=true}}else hurt()}}
 if(player.x>level.width-118){player.x=level.width-118;checkEndOfLevel()}
 cam+=(clamp(player.x-viewW*.33,0,Math.max(0,level.width-viewW))-cam)*Math.min(1,dt*5);
 if(performance.now()>toastUntil)$('toast').classList.remove('show');
}
function round(x,y,w,h,r,fill,stroke,lw=2){ctx.beginPath();ctx.roundRect(x,y,w,h,Math.min(r,w/2,h/2));if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.lineWidth=lw;ctx.strokeStyle=stroke;ctx.stroke()}}
function ellipse(x,y,rx,ry,fill,rot=0){ctx.beginPath();ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill()}
function line(x,y,xx,yy,stroke,width=2){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(xx,yy);ctx.lineWidth=width;ctx.strokeStyle=stroke;ctx.stroke()}
function flower(x,y,s=1,t=0){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.rotate(t);line(0,3,0,18,'#64ad83',3);ellipse(-5,13,7,3,'#6fc494',-.4);const cols=['#fff3fc','#ffd1e5','#ffc8a7','#c9b8ff'];const color=cols[Math.floor(rand(x*3+y)*cols.length)];for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ellipse(Math.cos(a)*7,Math.sin(a)*7,6.2,8,color,a)}ellipse(0,0,4.8,4.8,'#ffcb58');ctx.restore()}
function landscapeDetails(){
 const i=level.index,t=clock;
 ctx.save();
 if(i===0){ // Butterflies and vivid blossoms – sunny meadow.
  for(let j=0;j<13;j++){const x=((j*193+110-cam*.31)%(viewW+240)+viewW+240)%(viewW+240)-100,y=170+j%5*45+Math.sin(t*1.7+j)*20;const fl=Math.sin(t*14+j)*6;ellipse(x-6,y,8,4+Math.abs(fl),'#ffb1d0',-.5);ellipse(x+6,y,8,4+Math.abs(fl),'#ffe7a5',.5);ellipse(x,y,2,9,'#aa83aa')}
 }else if(i===1){ // A living, secretive forest, tall translucent trunks and dangling vines.
  ctx.globalAlpha=.38;for(let j=0;j<13;j++){const x=((j*223+170-cam*.31)%(viewW+270)+viewW+270)%(viewW+270)-100;round(x-8,-60,21,430,9,'#658d82');ellipse(x+3,95,59,80,'#5b9f91');ellipse(x-35,125,42,66,'#75b69d');ctx.strokeStyle='#558b79';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+14,0);ctx.quadraticCurveTo(x+26,100+Math.sin(t+j)*12,x+15,205);ctx.stroke()}
  ctx.globalAlpha=1;
 }else if(i===2){ // Pink sugar-moon sky with floating candy rings.
  ctx.globalAlpha=.52;for(let j=0;j<15;j++){const x=((j*197+80-cam*.24)%(viewW+220)+viewW+220)%(viewW+220)-90,y=60+j%5*48+Math.sin(t*.7+j)*9;ctx.strokeStyle=j%2?'#fff1fc':'#f7c5f7';ctx.lineWidth=8;ctx.beginPath();ctx.arc(x,y,12+j%3*4,0,Math.PI*2);ctx.stroke();ellipse(x,y,3,3,'#fff9c9')}
  ctx.globalAlpha=1;
 }else{ // Violet night stars, comet trails and lavender haze.
  for(let j=0;j<65;j++){const x=((j*137+rand(j)*70-cam*.10)%(viewW+180)+viewW+180)%(viewW+180)-60,y=30+rand(j*20)*290;const pulse=.4+.6*Math.sin(t*2+j);ellipse(x,y,1.5+Math.max(0,pulse)*2,1.5+Math.max(0,pulse)*2,j%4?'#f8ebfc':'#fff9c1')}
  const x=((t*67)%(viewW+300))-150;line(x,90,x-60,140,'#fdf2ff',4);ellipse(x,90,6,6,'#ffecb5');
 }
 ctx.restore();
}
function sky(){const a=level||CHAPTERS[0],grad=ctx.createLinearGradient(0,0,0,HEIGHT);grad.addColorStop(0,a.sky[0]);grad.addColorStop(1,a.sky[1]);ctx.fillStyle=grad;ctx.fillRect(0,0,viewW,HEIGHT);
 ctx.save();ctx.globalAlpha=.54;ellipse(viewW*.79,90,46,46,'#fff7d2');ellipse(viewW*.79-12,79,13,10,'#fffbe8');ctx.restore();
 for(let i=0;i<18;i++){const x=((i*211+rand(i+4)*90-cam*.18)%(viewW+350)+viewW+350)%(viewW+350)-140;const y=70+(i%5)*48+Math.sin(clock*.4+i)*8;drawCloud(x,y,.68+(i%3)*.17,i)}
 for(let layer=0;layer<2;layer++){const col=a.hills[layer];ctx.beginPath();ctx.moveTo(-100,HEIGHT);for(let x=-100;x<=viewW+120;x+=45){const worldX=x+cam*(layer? .27:.12);const y=325+layer*48+Math.sin(worldX*.0045+layer*.9)*26+Math.sin(worldX*.013+layer*2.4)*11;ctx.lineTo(x,y)}ctx.lineTo(viewW+120,HEIGHT);ctx.closePath();ctx.fillStyle=col;ctx.fill()}
 for(let i=0;i<13;i++){const x=((i*345+60-cam*.42)%(viewW+440)+viewW+440)%(viewW+440)-220;drawTree(x,330+(i%3)*25,i)}
 landscapeDetails();
}
function drawCloud(x,y,s,seed){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.globalAlpha=.58;ellipse(0,12,67,19,'#fff9fe');ellipse(-28,0,27,24,'#fff9fe');ellipse(4,-11,31,29,'#fff9fe');ellipse(38,0,28,23,'#fff9fe');ctx.fillStyle='#b0a5c9';ellipse(-8,7,2.3,2.5,'#baabc8');ellipse(16,7,2.3,2.5,'#baabc8');if(seed%4===0){line(-4,15,9,15,'#baabc8',2)}ctx.restore()}
function drawTree(x,y,seed){ctx.save();ctx.translate(x,y);const tint=level.index===2?'#b9a0d5':'#9cceb7';ctx.globalAlpha=.65;round(-10,-35,20,110,9,'#9e8ba5');for(let j=0;j<3;j++){ellipse((j-1)*27,-43-(j%2)*12,46,55,tint)}for(let j=0;j<5;j++)flower((j-2)*15,-75+rand(seed*17+j)*40,.5,seed+j);ctx.restore()}
function drawGround(platform){const {x,y,w,ground}=platform;if(x+w<cam-30||x>cam+viewW+30)return;ctx.save();ctx.translate(x-cam,y);const col=level.soil;round(0,0,w,ground?120:28,ground?8:12,col,'#775c8c',2);ctx.fillStyle=level.grass;round(0,-3,w,ground?18:15,8,level.grass);round(0,8,w,ground?12:10,6,'#c6e4ad');for(let k=0;k<w/67;k++){const dx=k*67+20;if(dx>w-12)break;ellipse(dx,22+(k%2)*6,3.8,2.8,'#d8b7c2');if(ground){if(k%3===0)flower(dx,-9,.45,k);else ellipse(dx,-1,3,4,'#ecf8c5')}}if(platform.helper){ctx.fillStyle='#fff2b8';for(let i=0;i<w/24;i++)ctx.fillText('✦',i*24,7)}ctx.restore()}
function drawPowerMushroom(item){if(item.taken)return;const x=item.x-cam,y=item.y+Math.sin(clock*4+item.x)*7;if(x<-50||x>viewW+50)return;const p=POWERS[item.id];ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(clock*3)*.12);ctx.shadowColor=p.color;ctx.shadowBlur=22;ellipse(0,13,12,20,'#fff9dc');ctx.beginPath();ctx.moveTo(-30,2);ctx.quadraticCurveTo(-27,-36,0,-34);ctx.quadraticCurveTo(27,-36,30,2);ctx.quadraticCurveTo(0,16,-30,2);ctx.fillStyle=p.color;ctx.fill();ctx.strokeStyle='#fff8f3';ctx.lineWidth=3;ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.font='bold 29px sans-serif';ctx.textAlign='center';ctx.fillText(p.symbol,0,-4);ctx.restore();const radius=36+Math.sin(clock*4)*5;ctx.save();ctx.strokeStyle=p.color;ctx.globalAlpha=.5;ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y-4,radius,0,Math.PI*2);ctx.stroke();ctx.restore()}
function drawEffects(){for(const shot of shots){const x=shot.x-cam,y=shot.y+Math.sin(clock*15)*4;ctx.save();ctx.shadowBlur=20;ctx.shadowColor=shot.color;ellipse(x,y,15,14,shot.color);ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.font='bold 22px sans-serif';ctx.textAlign='center';ctx.fillText(POWERS[shot.kind].symbol,x,y+6);ctx.restore()}for(const f of particles){ctx.save();ctx.globalAlpha=clamp(f.life/f.max,0,1);ellipse(f.x-cam,f.y,f.size,f.size*.75,f.color);ctx.restore()}}
function drawMushroom(item){const t=clock*2+item.x*.05,x=item.x-cam,y=item.y+Math.sin(t)*5;if(item.taken||x<-50||x>viewW+50)return;ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t)*.065);ellipse(0,22,24,5,'#724e9066');ellipse(0,12,10,19,'#fff3db');round(-9,6,18,18,7,'#fff4db','#cfa4a7',1.7);const color=MUSHROOMS[item.id].color;ctx.beginPath();ctx.moveTo(-25,5);ctx.quadraticCurveTo(-24,-25,0,-28);ctx.quadraticCurveTo(24,-25,25,5);ctx.quadraticCurveTo(0,15,-25,5);ctx.fillStyle=color;ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#fff5ed';ctx.stroke();ellipse(-12,-9,5,3.5,'#fff9ed',-.5);ellipse(8,-16,6,4.5,'#fff9ed',.3);ellipse(16,-3,4,3,'#fff9ed');ellipse(-4,10,1.7,2.5,'#655279');ellipse(5,10,1.7,2.5,'#655279');ctx.restore()}
function drawEnemy(e){if(e.dead)return;drawCat(e.x-cam+18,e.y+29,.66,'shadow',Math.sin(clock*5+e.seed)*3,e.x>(player?.x??0)?-1:1)}
function drawNPC([x,name,speech,kind]){if(x<cam-70||x>cam+viewW+70)return;drawCat(x-cam,407,.85,kind,Math.sin(clock*2+x)*2,1);ctx.save();ctx.font='bold 13px Nunito, sans-serif';const w=Math.min(220,ctx.measureText(name+' ♥').width+24);round(x-cam-w/2,324,w,26,12,'#fff6ec','#f3bbd5',2);ctx.fillStyle='#b16c94';ctx.textAlign='center';ctx.fillText(name+' ♥',x-cam,343);ctx.restore();if(player&&Math.abs(player.x-x)<155&&phase==='playing'&&speech){ctx.save();ctx.font='800 12px Nunito, sans-serif';const parts=wrapText(speech,215);const width=235,h=parts.length*17+15;round(clamp(x-cam-width/2,5,Math.max(5,viewW-width-5)),254-(h-32),width,h,13,'#fffaf3','#bba3be',2);ctx.textAlign='center';ctx.fillStyle='#755f7a';parts.forEach((s,k)=>ctx.fillText(s,clamp(x-cam,5+width/2,Math.max(5+width/2,viewW-5-width/2)),268-(h-32)+k*17));ctx.restore()}}
function wrapText(text,max){const words=text.split(' '),lines=[];let l='';for(const word of words){const t=l?l+' '+word:word;if(ctx.measureText(t).width>max&&l){lines.push(l);l=word}else l=t}if(l)lines.push(l);return lines}
function drawCat(x,y,s=1,kind='cream',bob=0,facing=1,motion=null){const palettes={cream:['#fff4df','#f5d7bb','#75587a'],shadow:['#6d587e','#9b81ae','#fff7ed'],lilac:['#cfb8f9','#ac8ae0','#664b79'],peach:['#ffc7b8','#f3a5aa','#725578'],rose:['#f2b0c9','#d990b8','#775072'],ginger:['#ffcf8f','#f5a878','#765271']};let [fur,trim,ink]=palettes[kind]||palettes.cream;
 const running=motion&&motion.grounded&&Math.abs(motion.vx)>28,airborne=motion&&!motion.grounded,cycle=motion?motion.runCycle:clock*4;
 const swing=running?Math.sin(cycle)*11:airborne?7:1.3*Math.sin(clock*2);
 ctx.save();ctx.translate(x,y+bob);ctx.scale(facing*s,s);
 if(motion&&save.power){fur={blossom:'#ffe1f0',spark:'#fff0b6',moon:'#ebddff',starlight:'#d8fdff'}[save.power];trim=POWERS[save.power].color}
 if(running){ctx.save();ctx.globalAlpha=.28;for(let k=0;k<3;k++)ellipse(-34-k*12,17+(k%2)*7,6,3,trim);ctx.restore()}
 // Springy tail, two swinging rear paws, body bounce and floppy scarf.
 ctx.strokeStyle=fur;ctx.lineWidth=12;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(17,13);ctx.bezierCurveTo(48,-4+Math.sin(clock*9)*6,37,-30,24,-22+Math.sin(clock*7)*9);ctx.stroke();ctx.strokeStyle=trim;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(17,13);ctx.bezierCurveTo(48,-4+Math.sin(clock*9)*6,37,-30,24,-22+Math.sin(clock*7)*9);ctx.stroke();
 for(const [px,dir] of [[-12,1],[12,-1]]){ctx.save();ctx.translate(px,18);ctx.rotate((swing*dir)*.036);round(-9,0,18,19,8,fur);round(-12,13+(airborne?-6:0),23,10,5,fur,trim,1);ctx.restore()}
 ellipse(0,7,23,28,fur);ellipse(0,15,15,13,trim);
 // Arms counter-swing with the legs, pronounced when running.
 for(const [side,dir] of [[-1,1],[1,-1]]){ctx.save();ctx.translate(side*19,0);ctx.rotate(swing*dir*.027+(airborne?-.28*dir:0));ellipse(side*5,11,9,16,fur);ellipse(side*6,22,10,7,fur);ctx.restore()}
 ctx.beginPath();ctx.moveTo(-29,-14);ctx.lineTo(-26,-48+Math.sin(clock*7)*2);ctx.lineTo(-9,-34);ctx.lineTo(10,-34);ctx.lineTo(28,-48-Math.sin(clock*7)*2);ctx.lineTo(29,-13);ctx.closePath();ctx.fillStyle=fur;ctx.fill();ctx.strokeStyle=trim;ctx.lineWidth=2;ctx.stroke();ctx.beginPath();ctx.moveTo(-24,-37);ctx.lineTo(-22,-24);ctx.lineTo(-14,-31);ctx.fillStyle='#f7aab7';ctx.fill();ctx.beginPath();ctx.moveTo(23,-37);ctx.lineTo(21,-24);ctx.lineTo(13,-31);ctx.fill();
 ellipse(0,-14,29,27,fur);const blink=Math.sin(clock*1.6+x*.03)>.994?2:12;ellipse(-13,-12,7,blink,ink);ellipse(13,-12,7,blink,ink);if(blink>4){ellipse(-11,-16,2.7,4,'#fff');ellipse(15,-16,2.7,4,'#fff')}ellipse(-21,-1,7,4,'#f6acb9');ellipse(21,-1,7,4,'#f6acb9');ctx.beginPath();ctx.moveTo(-5,-3);ctx.lineTo(0,1);ctx.lineTo(5,-3);ctx.closePath();ctx.fillStyle='#de8ea8';ctx.fill();ctx.strokeStyle=ink;ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(-5,2);ctx.quadraticCurveTo(0,7,0,3);ctx.quadraticCurveTo(0,7,6,2);ctx.stroke();line(-29,-1,-37,-4,ink,1.3);line(-29,4,-38,6,ink,1.3);line(29,-1,37,-4,ink,1.3);line(29,4,38,6,ink,1.3);
 if(kind==='cream'){round(-21,25,42,8,4,save.power?trim:'#f38dae');ellipse(16+Math.sin(clock*13)*3,30,7,10,'#ffd9e5')}if(kind==='shadow'){ellipse(0,-50,7,4,'#e8c1ff');ctx.font='18px sans-serif';ctx.fillText('✦',-9,-47)}
 if(motion&&save.power){const p=POWERS[save.power];ctx.save();ctx.shadowColor=p.color;ctx.shadowBlur=14;ctx.fillStyle=p.color;ctx.font='bold 26px sans-serif';ctx.textAlign='center';ctx.fillText(p.symbol,0,-52+Math.sin(clock*6)*2);ctx.restore()}
 ctx.restore()}
function drawGate(){const x=level.width-100-cam;if(x< -120||x>viewW+120)return;ctx.save();ctx.translate(x,405);const grd=ctx.createLinearGradient(-30,-80,30,10);grd.addColorStop(0,'#fff7cc');grd.addColorStop(1,'#f5a1d3');round(-39,-78,78,90,32,grd,'#fff4e3',5);round(-23,-63,46,69,20,'#af97d9','#fff5e3',3);ctx.font='32px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff4be';ctx.fillText('✦',0,-19);ctx.fillStyle='#fff5e9';ctx.font='bold 13px Fredoka';ctx.fillText(save.level===3?'FINALE':'ZIEL',0,-89);ctx.restore()}
function drawParticles(){ctx.save();for(let i=0;i<38;i++){const x=((i*113+rand(i)*220-cam*.38+Math.sin(clock+i)*17)%(viewW+90)+viewW+90)%(viewW+90)-30;const y=((i*71+clock*(10+i%4*4))%470);ellipse(x,y,3+(i%3),2.2,['#ffe5f8','#fff7bf','#ffd0df'][i%3],clock*.5+i)}ctx.restore()}
function drawWorld(){if(!level)return;ctx.save();ctx.setTransform(canvas.width/viewW,0,0,canvas.height/HEIGHT,0,0);sky();drawParticles();
 for(const p of [...level.ground,...level.platforms])drawGround(p);
 for(let j=0;j<level.width/100;j++){const x=j*101+22;if(x<cam-20||x>cam+viewW+25)continue;const grounded=level.ground.some(p=>x>=p.x+9&&x<p.x+p.w-9);if(grounded){flower(x-cam,441,.56+rand(j*5+1)*.5,j);if(j%4===0)flower(x-cam+25,448,.37,j*2)}}
 for(const p of level.checkpoints){const x=p-cam;if(x<-30||x>viewW+30)continue;line(x,450,x,373,'#a5819d',5);ctx.font='29px sans-serif';ctx.fillText(save.checkpoint>=p?'💗':'🌼',x-16,375)}
 for(const item of level.items)drawMushroom(item);drawPowerMushroom(level.powerItem);
 level.npcs.forEach(drawNPC);
 for(const e of level.enemies)drawEnemy(e);
 drawGate();
 if(level.index===3&&boss&&!boss.done&&boss.triggered){const x=boss.x+Math.sin(clock*1.3)*60-cam;drawCat(x+13,432,1.17,'shadow',Math.sin(clock*3)*2,-1);if(boss.active){ctx.font='25px Nunito';ctx.fillStyle='#fff';ctx.fillText('♥'.repeat(boss.hp),x-15,340)}}
 if(player&&(player.inv<=0||Math.floor(clock*14)%2===0)){const run=player.grounded&&Math.abs(player.vx)>30;const bob=run?Math.abs(Math.sin(player.runCycle))*4:Math.sin(clock*3)*1.5;drawCat(player.x+player.w/2-cam,player.y+player.h*.54,1,'cream',bob,player.facing,player)}
 drawEffects();
 if(powerFlash>0){ctx.save();ctx.globalAlpha=powerFlash*.14;ctx.fillStyle=POWERS[save.power]?.color||'#fff';ctx.fillRect(0,0,viewW,HEIGHT);ctx.restore()}
 ctx.restore()}
function frame(now){try{if(!lastFrame)lastFrame=now;const dt=Math.min(.034,(now-lastFrame)/1000);lastFrame=now;if(level){simulate(dt);drawWorld()}else {level=makeLevel(0);drawWorld()}musicTick();if(performance.now()>toastUntil)$('toast').classList.remove('show')}catch(err){console.error('Katzigami frame:',err)}requestAnimationFrame(frame)}
function bindControl(id,key){const el=$(id),pointers=new Set();const release=e=>{pointers.delete(e.pointerId);if(!pointers.size){vxInput[key]=false;el.classList.remove('pressed')}};
 el.addEventListener('pointerdown',e=>{e.preventDefault();if(phase!=='playing')return;try{el.setPointerCapture(e.pointerId)}catch{}pointers.add(e.pointerId);vxInput[key]=true;el.classList.add('pressed');if(key==='jump')jump();if(audioCtx?.state==='suspended')audioCtx.resume()});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(event,release);
 window.addEventListener('blur',()=>{pointers.clear();vxInput[key]=false;el.classList.remove('pressed')});}
function setup(){bindControl('left','left');bindControl('right','right');bindControl('jump','jump');
 const special=$('special');special.addEventListener('pointerdown',e=>{e.preventDefault();if(phase!=='playing'||!save.power)return;try{special.setPointerCapture(e.pointerId)}catch{}special.classList.add('pressed');castSpecial()});for(const ev of ['pointerup','pointercancel','lostpointercapture'])special.addEventListener(ev,()=>special.classList.remove('pressed'));window.addEventListener('blur',()=>special.classList.remove('pressed'));
 const keyMap={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'jump',ArrowUp:'jump',KeyW:'jump',KeyX:'special',KeyJ:'special'};
 window.addEventListener('keydown',e=>{if(keyMap[e.code]){e.preventDefault();if(phase==='playing'){if(keyMap[e.code]==='special'){if(!e.repeat)castSpecial()}else{if(!vxInput[keyMap[e.code]]&&keyMap[e.code]==='jump')jump();vxInput[keyMap[e.code]]=true}}}if(e.code==='Escape'){e.preventDefault();pause()}if(e.code==='Enter'&&phase==='dialogue'){const b=overlayContent.querySelector('button');if(b)b.click()}});
 window.addEventListener('keyup',e=>{if(keyMap[e.code]){e.preventDefault();vxInput[keyMap[e.code]]=false}});
 $('pause-toggle').addEventListener('click',pause);$('sound-toggle').addEventListener('click',()=>{audioMuted=!audioMuted;save.mute=audioMuted;persist();updateUI();resetMusic();if(!audioMuted)sound('choice')});
 window.addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInputs();if(phase==='playing')pause()}});
 stage.addEventListener('contextmenu',e=>e.preventDefault());resize();updateUI();menu();requestAnimationFrame(frame);
 // A narrow, opt-in interface for automated browser regression tests; not active in normal play.
 if(new URLSearchParams(location.search).has('test'))window.__katzigamiTest={
  snapshot:()=>({phase,level:save.level,player:player&&{x:player.x,y:player.y,vx:player.vx,vy:player.vy,grounded:player.grounded},collected:[...save.collected],power:save.power,shots:shots.length,hearts:save.hearts,checkpoint:save.checkpoint,flags:{...save.flags},shown:[...save.shown],boss:boss&&{...boss},ending:save.ending,winner:save.won,enemies:level.enemies.map(e=>({x:e.x,dead:e.dead}))}),
  position:(x,y=390)=>{player.x=x;player.y=y;player.vy=0;player.vx=0;player.inv=2},
  collectAll:()=>{for(const item of level.items)collect(item)},
  takePower:()=>transform(level.powerItem),cast:()=>castSpecial(),hurt:()=>{player.inv=0;hurt()},
  specialState:()=>({disabled:$('special').disabled,rect:$('special').getBoundingClientRect().toJSON()}),
  step:(seconds)=>{let n=Math.ceil(seconds*60);while(n--)simulate(1/60)},
  advance:()=>checkEndOfLevel(),
  skipBoss:()=>{boss.done=true;boss.triggered=true},
  reset:()=>{localStorage.removeItem(SAVE_KEY);save=defaultSave();menu()},
  setFlag:(k,v)=>{save.flags[k]=v;persist()},
  enterLevel:(i)=>enterLevel(i,false),
  clearSave:()=>localStorage.removeItem(SAVE_KEY)
 };
}
setup();
if('serviceWorker' in navigator && location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();