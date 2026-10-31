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
 blossom:{name:'Blütenpfote',rank:1,color:'#ff78af',symbol:'✿',damage:1,cooldown:.48,attack:'Blütenwurf',hint:'Stufe I: präzise Blütenwürfe (1 Schaden).'},
 spark:{name:'Donnerpfote',rank:2,color:'#ffc854',symbol:'⚡',damage:2,cooldown:.43,attack:'Kettenblitz',hint:'Stufe II: Blitze durchdringen zwei Gegner (2 Schaden).'},
 moon:{name:'Mondwächterin',rank:3,color:'#bda8ff',symbol:'☾',damage:3,cooldown:.56,attack:'Mondexplosion',hint:'Stufe III: Explosion mit Flächenschaden (3 Schaden).'},
 starlight:{name:'Sternenkönigin',rank:4,color:'#8ce4e9',symbol:'✦',damage:3,cooldown:.63,attack:'Sternensturm',hint:'Stufe IV: drei zielsuchende Sterne (je 3 Schaden).'}
};
const ENEMY_TYPES={
 scout:{name:'Schattenflitzer',hp:1,range:58,speed:1.65,scale:.66,color:'#a9a0c8',score:1},
 jumper:{name:'Hüpf-Luchs',hp:2,range:74,speed:1.85,scale:.72,color:'#f7b4a9',score:2},
 armored:{name:'Panzerkater',hp:4,range:34,speed:.88,scale:.82,color:'#a3b8d4',score:3},
 witch:{name:'Nebelhexenkatze',hp:3,range:66,speed:1.2,scale:.75,color:'#b9a1e1',score:4},
 titan:{name:'Titanmieze',hp:8,range:22,speed:.65,scale:1.12,color:'#df9baa',score:5},
 ninja:{name:'Ninjakatze',hp:3,range:110,speed:3.3,scale:.7,color:'#e5a2cd',score:4},
 phantom:{name:'Geisterpfote',hp:4,range:115,speed:1.7,scale:.67,color:'#95d8fa',score:4},
 archer:{name:'Bogenmieze',hp:5,range:65,speed:1.1,scale:.76,color:'#ffc287',score:5},
 guardian:{name:'Wächterkater',hp:10,range:44,speed:.7,scale:1.02,color:'#b6caaa',score:7}
};
const ROUTE_ENEMIES={
 bird:{name:'Wolkenkrähe',hp:3,color:'#83c7e7',speed:1.6,scale:.7,range:82,score:4},
 worm:{name:'Riesenregenwurm',hp:7,color:'#d7939e',speed:.75,scale:1.05,range:47,score:6},
 bat:{name:'Tropfenfledermaus',hp:4,color:'#8d82b6',speed:2.1,scale:.78,range:86,score:5},
 mole:{name:'Maulwurf-Wächter',hp:5,color:'#ab9379',speed:1.2,scale:.87,range:70,score:5}
};
Object.assign(ENEMY_TYPES,ROUTE_ENEMIES);
const COIN_VALUES={bronze:1,silver:5,gold:20};
const CHARMS={
 speed:{name:'Turbo-Fisch',icon:'🐟',color:'#ffe46c',seconds:9,bad:false,info:'Rennboost!'},
 invincible:{name:'Sternen-Schutz',icon:'⭐',color:'#ffdd82',seconds:6,bad:false,info:'Kurz unverwundbar!'},
 fly:{name:'Flugfeder',icon:'🪽',color:'#9feef4',seconds:8,bad:false,info:'Springen halten = fliegen!'},
 sway:{name:'Schwindelpilz',icon:'🌀',color:'#cf9aff',seconds:7,bad:true,info:'Hui! Die Welt schwankt!'},
 slow:{name:'Schneckenschleim',icon:'🐌',color:'#a4a2da',seconds:8,bad:true,info:'Oh nein, Schneckentempo!'},
 silence:{name:'Magie-Siegel',icon:'🔒',color:'#ed91ba',seconds:7,bad:true,info:'Spezialfähigkeit blockiert!'},
 dizzy:{name:'Schlauch-Schwindel',icon:'💫',color:'#fbbdf1',seconds:2.2,bad:true,info:'Die Pfoten taumeln!'}
};
const ENEMY_MAP=[
 ['scout','jumper','armored','scout','jumper','armored'],
 ['scout','armored','jumper','witch','armored','jumper','witch','titan'],
 ['jumper','witch','armored','titan','scout','witch','armored','titan','jumper'],
 ['armored','witch','titan','jumper','titan','witch','armored','titan','witch']
];
const EXTRA_ENEMY_SPAWNS=[[515,1190,1940],[525,1550,1935,2360],[570,1040,1610,2330],[520,1120,1520,2300,2510]];
const levelOf=power=>POWERS[power]?.rank||0;
const LEVEL_MUSIC=[
 {tempo:.205,melody:[523,659,784,659,587,698,784,0,659,784,880,784,698,587,523,0],bass:[262,0,392,0,294,0,440,0,330,0,440,0,294,0,392,0]},
 {tempo:.245,melody:[392,466,523,0,466,392,349,0,392,523,587,523,466,349,392,0],bass:[196,0,0,294,233,0,0,349,196,0,294,0,175,0,262,0]},
 {tempo:.275,melody:[523,0,622,698,0,622,523,466,523,0,784,698,622,0,523,0],bass:[262,0,0,392,311,0,0,466,262,0,392,0,233,0,349,0]},
 {tempo:.235,melody:[440,523,659,0,784,659,523,0,494,587,698,880,784,659,587,0],bass:[220,0,330,0,247,0,370,0,220,0,349,0,294,0,440,0]}
];
const BASE_CHAPTERS=[
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
// Twelve longer stages spanning four different story worlds.
const CHAPTERS=BASE_CHAPTERS.flatMap((base,act)=>[0,1,2,3,4].map(stage=>{
 const names=[
 ['Die Kicherwiese','Mohnblumen-Boulevard','Kirschblüten-Karussell','Wolken über Milchtal','Das Maulwurf-Picknick'],
 ['Der Flüsterwald','Mooskatzen-Tempel','Nebelpfoten-Schlucht','Fledermaus-Glockenturm','Der Regenwurm-König'],
 ['Der Zuckermond','Kristall-Milchstraße','Süßigkeiten-Meteor','Wolkenzirkus','Die Tropfstein-Bäckerei'],
 ['Der Sternengarten','Uhrwerk-Pagode','Das Sternschnuppenfeld','Die letzte Wolkentreppe','Das Spiegelkönigreich']
];
 const width=base.width+720+stage*620+act*190;
 const gaps=base.gaps.map(g=>[...g]),platforms=base.platforms.map(p=>[...p]);
 for(let x=base.width+220;x<width-340;x+=680){const span=100+stage*10;gaps.push([x,x+span]);platforms.push([x-65,354+(x%3)*14,span+200]);platforms.push([x+245,322+stage%2*28,155])}
 gaps.sort((a,b)=>a[0]-b[0]);
 const mushrooms=stage===0?base.mushrooms.slice(0,1):stage===2?base.mushrooms.slice(1,2):[];
 return {...base,act,stage,name:names[act][stage],subtitle:'WELT '+(act+1)+' · LEVEL '+(stage+1)+' / 5',width,gaps,platforms,mushrooms,checkpoint:[...base.checkpoint,Math.floor((base.width+width)/2)].sort((a,b)=>a-b),enemies:[...base.enemies,base.width+135,base.width+500,base.width+850],power:[base.power[0],stage===0?base.power[1]:base.width+170,400]};
}));
const actOf=i=>Math.floor(Math.max(0,i)/5);
const isFinal=i=>i===CHAPTERS.length-1;
// A new local campaign seed changes the mystery, atmosphere, encounters and cat personalities.
const MYSTERIES=[
 {name:'Die gestohlene Morgenröte',cause:'Ein uralter Sonnengong hält alle Blumen im Gestern gefangen.',clue:'Die Blüten flüstern von einem Gong, der nie geschlagen wurde.',ending:'Als der Sonnengong erklingt, erwacht ein völlig neuer Morgen.'},
 {name:'Die verschwundenen Träume',cause:'Der Traumsammler hat die Wünsche der Katzen in einer Uhr versteckt.',clue:'In den Pilzsporen schlafen Wünsche, die sich an niemanden erinnern.',ending:'Die Träume entkommen der Uhr und tauchen als tanzende Sterne wieder auf.'},
 {name:'Das Lied der letzten Blume',cause:'Das Schweigen des Mondchores ließ die Farben allmählich erblassen.',clue:'Jede verschwundene Farbe ist eine Note eines vergessenen Liedes.',ending:'Der Mondchor stimmt eine neue Melodie an, und die Blumen antworten.'},
 {name:'Die falsche Königin',cause:'Ein Spiegelgeist tauschte die Erinnerungen der Katzen und verwirrte ganz Katzigami.',clue:'Eine Königin hat plötzlich zwei Schatten, aber nur einen Napf.',ending:'Der Spiegelgeist gibt seine Täuschung zu – und bekommt einen eigenen Napf.'},
 {name:'Der endlose Samstag',cause:'Ein ängstliches Zukunftskätzchen wollte einen glücklichen Tag niemals enden lassen.',clue:'Die Uhren haben aufgehört zu ticken, aber die Fische werden älter.',ending:'Die Zeit läuft wieder und Zukunfts-Momo wagt einen neuen Tag.'}
];
const CAT_PERSONALITIES=['frech','vorsichtig','dramatisch','verspielt','misstrauisch'];
const HEROES={
 cat:{name:'Momo',label:'🐱 Momo · Samtpfote',blurb:'Ausgewogen, schnurrende Zaubergeschosse.',icon:'🐱'},
 dog:{name:'Bello',label:'🐶 Bello · Wackelohr',blurb:'Federnde Bälle, gleicher Schaden wie Momo.',icon:'🐶'},
 chicken:{name:'Kiki',label:'🐔 Kiki · Eierkönigin',blurb:'Bunte Eier im Bogen – gleich starke Angriffe.',icon:'🐔'},
 rabbit:{name:'Luna',label:'🐰 Luna · Langohr',blurb:'Hoppelige Sternensprünge, gleich starke Magie.',icon:'🐰'},
 fox:{name:'Fips',label:'🦊 Fips · Fuchsnase',blurb:'Wirbelnde Blätter, genauso stark wie die anderen.',icon:'🦊'}
};
const DIFFICULTY={
 easy:{name:'Leicht',hearts:5,lives:9,enemyHp:1,enemySpeed:.8,reward:1.4},
 medium:{name:'Mittel',hearts:3,lives:5,enemyHp:1,enemySpeed:1,reward:1},
 hard:{name:'Schwer',hearts:3,lives:3,enemyHp:1.3,enemySpeed:1.2,reward:.85},
 ultra:{name:'Ultra',hearts:2,lives:1,enemyHp:1.55,enemySpeed:1.45,reward:.7}
};
const COSTUMES={clown:'🤡 Clownhut mit Blume',mouse:'🎩 Maus-Zylinder',armor:'🛡️ Ritterrüstung',chef:'👨‍🍳 Kochmütze',crown:'👑 Prinzenkrone',bow:'🎀 Riesenschleife'};
const SMALL_PERKS={glide:'Leichtes Gleiten',bounce:'Etwas höher springen',magnet:'Münzenmagnet',rapid:'Zauber etwas schneller' };
const diff=()=>DIFFICULTY[save.difficulty]||DIFFICULTY.medium;
const hero=()=>HEROES[save.character]||HEROES.cat;
function seeded(seed,salt){let n=(seed^Math.imul(salt+17,0x9e3779b1))>>>0;n^=n>>>16;n=Math.imul(n,0x7feb352d);n^=n>>>15;n=Math.imul(n,0x846ca68b);return((n^(n>>>16))>>>0)/4294967296}
function campaignSeed(){try{const r=new Uint32Array(1);crypto.getRandomValues(r);return r[0]||1}catch{return(Date.now()>>>0)||1}}
const mystery=()=>MYSTERIES[(save.seed||1)%MYSTERIES.length];
const campaignVar=(salt)=>seeded(save.seed||1,salt);
const personality=(index)=>CAT_PERSONALITIES[Math.floor(campaignVar(index+101)*CAT_PERSONALITIES.length)];
const defaultSave=()=>({version:1,campaignV3:true,campaignV4:true,character:'cat',difficulty:'medium',lives:5,coins:0,coinTaken:[],rolledHouses:[],costumes:[],perk:null,seed:campaignSeed(),level:0,collected:[],hearts:3,checkpoint:0,flags:{},shown:[],won:false,ending:'',deaths:0,mute:false,power:null,relations:{},answers:[],encounters:0});
function loadSave(){try{const raw=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(!raw||raw.version!==1||!Array.isArray(raw.collected)||!Number.isInteger(raw.level))return defaultSave();return {...defaultSave(),...raw,flags:raw.flags&&typeof raw.flags==='object'?raw.flags:{},collected:raw.collected.filter(x=>Object.hasOwn(MUSHROOMS,x)),shown:Array.isArray(raw.shown)?raw.shown:[],level:Math.max(0,Math.min(CHAPTERS.length-1,raw.campaignV4?raw.level:(raw.campaignV3?Math.floor(raw.level/3)*5+raw.level%3:raw.level*5))),campaignV3:true,campaignV4:true,
 character:Object.hasOwn(HEROES,raw.character)?raw.character:'cat',difficulty:Object.hasOwn(DIFFICULTY,raw.difficulty)?raw.difficulty:'medium',
 lives:Number.isInteger(raw.lives)?clamp(raw.lives,0,99):5,coins:Number.isInteger(raw.coins)?clamp(raw.coins,0,999999):0,
 coinTaken:Array.isArray(raw.coinTaken)?raw.coinTaken:[],rolledHouses:Array.isArray(raw.rolledHouses)?raw.rolledHouses:[],costumes:Array.isArray(raw.costumes)?raw.costumes.filter(x=>Object.hasOwn(COSTUMES,x)):[],perk:Object.hasOwn(SMALL_PERKS,raw.perk)?raw.perk:null,
 hearts:Math.max(1,Math.min(5,Number(raw.hearts)||3)),power:Object.hasOwn(POWERS,raw.power)?raw.power:null,seed:Number.isInteger(raw.seed)?raw.seed:campaignSeed(),relations:raw.relations&&typeof raw.relations==='object'?raw.relations:{},answers:Array.isArray(raw.answers)?raw.answers.slice(-16):[],encounters:Number(raw.encounters)||0}}catch{return defaultSave()}}
let save=loadSave(),level=null,player=null,phase='menu',vxInput={left:false,right:false,jump:false},clock=0,viewW=960,cam=0,camY=0,toastUntil=0,lastFrame=0,ambience=0,boss=null,queuedJump=0,coyote=0,audioCtx=null,audioMuted=!!save.mute,musicAt=0,musicStep=0,particles=[],shots=[],enemyShots=[],specialCooldown=0,powerFlash=0,effects={},transport=null;
const rand=(x)=>{let v=Math.sin(x*127.1+18.27)*43758.5453;return v-Math.floor(v)};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(save))}catch{/* localStorage may be disabled; current session still works */}}
function updateUI(){const ability=$('special'),power=save.power&&POWERS[save.power];ability.disabled=!power||!!effects.silence;ability.classList.toggle('unlocked',!!power&&!effects.silence);ability.setAttribute('aria-label',power?'Spezialfähigkeit '+power.name+' einsetzen':'Spezialfähigkeit gesperrt – zuerst Verwandlungspilz einsammeln');ability.title=effects.silence?'Magie für '+effects.silence.toFixed(1)+' Sekunden gesperrt':power?'Stufe '+power.rank+' – '+power.attack+': '+power.hint:'Zuerst Verwandlungspilz sammeln';$('special-icon').textContent=power?power.symbol:'🔒';$('special-label').textContent=effects.silence?'FLUCH':power?'STUFE '+power.rank:'GESPERRT';ability.style.setProperty('--power-color',power?power.color:'#c6b6c8');heartsUI.textContent='♥'.repeat(save.hearts)+'♡'.repeat(Math.max(0,diff().hearts-save.hearts))+' 🐾'+save.lives;
 mushroomsUI.textContent='🍄'+save.collected.length+'/'+TOTAL+' 🪙'+save.coins;levelUI.textContent=(save.level+1)+' / '+CHAPTERS.length;chapterUI.textContent=CHAPTERS[save.level].name.toUpperCase();$('sound-toggle').textContent=audioMuted?'♩':'♫';$('sound-toggle').setAttribute('aria-label',audioMuted?'Ton einschalten':'Ton ausschalten')}
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
 const now=audioCtx.currentTime,track=LEVEL_MUSIC[actOf(save.level)];
 if(musicAt<now-.8)musicAt=now+.025;
 let notes=0;
 while(musicAt<now+.12&&notes++<3){
  const i=musicStep%16,n=track.melody[i],b=track.bass[i];
  if(n)tone(n*(1+levelOf(save.power)*.07),musicAt,track.tempo*.78,save.power?'sine':actOf(save.level)===1?'triangle':'sine',save.power?.025:.030);
  if(b)tone(b,musicAt,track.tempo*1.35,'triangle',.020);
  if(save.power&&i%4===2)tone(n? n*2:784,musicAt+.045,track.tempo*.56,'sine',.014+levelOf(save.power)*.003);
  musicAt+=track.tempo;musicStep++;
 }
}
function resetMusic(){musicAt=0;musicStep=0}
function burst(x,y,color,n=18){for(let i=0;i<n;i++){const a=i*Math.PI*2/n+rand(clock*700+i),v=75+rand(i*23+clock)*180;particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-60,life:.5+rand(i)*.5,max:.9,color,size:3+rand(i*7)*6})}if(particles.length>220)particles.splice(0,particles.length-220)}
function toast(text){$('toast').textContent=text;$('toast').classList.add('show');toastUntil=performance.now()+2300}
function clearInputs(){vxInput.left=vxInput.right=vxInput.jump=false;queuedJump=0;['left','right','jump','special'].forEach(id=>$(id).classList.remove('pressed'))}
function showOverlay(html){overlayContent.innerHTML=html;overlay.classList.add('visible');clearInputs()}
function hideOverlay(){overlay.classList.remove('visible');overlayContent.replaceChildren()}
function escapeText(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function card(tag,title,portrait,body,buttons){return `<article class="story-card"><div class="story-tag">${tag}</div><div class="story-portrait"><span>${portrait}</span></div><h1 class="story-title">${title}</h1><p class="story-copy">${body}</p><div class="choice-grid">${buttons.map((b,i)=>`<button class="story-button ${b.secondary?'secondary':''}" data-option="${i}" type="button">${b.label}</button>`).join('')}</div></article>`}
function presentCard(tag,title,portrait,body,options){showOverlay(card(tag,title,portrait,body,options));overlayContent.querySelectorAll('[data-option]').forEach((el,i)=>el.addEventListener('click',()=>{sound('choice');hideOverlay();options[i].action()},{once:true}))}
function dialog({tag='KATZEN-GESPRÄCH',title,portrait='🐱 ✨ 🐱',body,options}){phase='dialogue';presentCard(tag,title,portrait,body,options)}
// Offline companion logic is rule-based (no cloud AI, no API key or invented LLM claims).
// Free text is interpreted into intent, affinity and world changes on every campaign.
function interpretAnswer(input){
 const t=String(input).toLocaleLowerCase('de').normalize('NFD').replace(/\p{M}/gu,'');
 const words=(pattern)=>pattern.test(t);
 if(words(/(hilfe|helfe|rett|freund|lieb|zusammen|danke|vertrau|fried|vergeb|sorry|tut mir leid|schutzen|schuetzen|gemeinsam)/))return 'kind';
 if(words(/(kampf|angreif|besieg|hass|bose|boese|hau|schlag|zorn|stark|gefahr|droh)/))return 'brave';
 if(words(/(warum|wieso|wer |was |wie |wo |geheim|beweis|wissen|wahr|such|untersuch|frage|verdacht)/))return 'curious';
 if(words(/(pizza|kuchen|fisch|thun|essen|hungrig|keks|pilz|snack|mampf)/))return 'funny';
 if(words(/(nein|nicht|lieber nicht|weg|allein|egal|lass mich|skepti)/))return 'skeptical';
 return 'inventive';
}
const REACTIONS={
 kind:['Du gibst mir Hoffnung! Ich helfe dir, auch wenn meine Pfoten zittern.','Zusammen können wir sogar ein Ungeheuer zum Schnurren bringen!','Du bekommst meinen geheimen Blumenweg. Er ist fast schneckenfrei.'],
 brave:['Mutig! Ich locke den großen Wächter von deinem Weg.','So viel Katzenmut! Die Schatten schicken jetzt ihre Besten.','Du kämpfst mit Herz. Oder mit viel zu viel Koffein.'],
 curious:['Eine kluge Frage! Folge den leuchtenden Sporen, nicht den Gerüchten.','Ich habe eine Spur gefunden. Die Uhr sagt nicht die Wahrheit.','Du willst Beweise? Gut. Ich zeige dir eine verborgene Abkürzung.'],
 funny:['DU WILLST WIRKLICH JETZT ESSEN?! Ich mag dich.','Ein Schnitzel aus Pilzen? Mit Schnurrhaaren? Genial!','Hahaha! Vor Lachen hat die Wache ihre Rüstung verloren.'],
 skeptical:['Hm. Ich behalte dich im Auge. Mit beiden Katzenaugen.','Dein Misstrauen ist fair. Aber ein Gegner hat es gehört.','Ich zwinge dich zu nichts. Pass bloß auf die nächste Weggabelung auf.'],
 inventive:['Das ist überraschend. Ich erzähle dem Wald davon!','So hat hier noch keine Katze geantwortet. Das ändert unseren Plan.','Interessanter Gedanke! Ich probiere einen ungewöhnlichen Umweg.']
};
function applyConversation(name,answer){
 const intent=interpretAnswer(answer),mood=personality(save.level),relative={kind:2,brave:0,curious:1,funny:1,skeptical:-2,inventive:0}[intent];
 const relation=(save.relations[name]||0)+relative;
 save.relations[name]=clamp(relation,-8,8);
 save.answers.push({cat:name,intent,text:String(answer).slice(0,130),chapter:save.level});
 save.answers=save.answers.slice(-16);
 save.encounters=(save.encounters||0)+1;
 if(intent==='kind')save.flags.madePeace=true;
 if(intent==='brave')save.flags.battleSpirit=true;
 if(intent==='curious')save.flags.detective=true;
 if(intent==='funny')save.flags.feast=true;
 if(intent==='skeptical')save.flags.wary=true;
 if(intent==='inventive')save.flags.inventive=true;
 // Actual mechanical outcomes: aid creates bridges, distrust adds hostiles,
 // curiosity uncovers clues and supplies safe platforms.
 const ally=relation>=1,hostile=relation<=-1;
 if(ally)save.flags['ally'+save.level]=true;
 if(hostile)save.flags['rival'+save.level]=true;
 persist();
 const phrase=REACTIONS[intent][Math.floor(campaignVar(save.encounters*13+name.length)*REACTIONS[intent].length)];
 return {intent,relation,reply:name+' ('+mood+'): »'+phrase+'«',effect:ally?'Verbündete bauen eine Abkürzung!':hostile?'Eine Schattenpatrouille ist misstrauisch geworden.':'Deine Antwort wird den weiteren Weg verändern.'};
}
function talkWithCat(){
 if(phase!=='playing'||!level||!player)return;
 const npc=level.npcs[0],name=npc[1];
 const persona=personality(save.level);
 const prompt=`${name} ist heute ${persona} und fragt: »${mystery().clue} Was sollen wir jetzt tun, Momo?«`;
 const options=[
 {label:'💗 Wir halten zusammen!',action:()=>answerToCat(name,'Ich helfe dir, wir retten die Katzen zusammen!')},
 {label:'🔍 Ich will die Wahrheit herausfinden!',action:()=>answerToCat(name,'Warum passiert das? Ich suche Beweise und die Wahrheit!')},
 {label:'😼 Ich kämpfe mich durch!',action:()=>answerToCat(name,'Ich besiege die Gegner und kämpfe für den Wald!')}
 ];
 dialog({tag:'DYNAMISCHES KATZENGESPRÄCH · '+mystery().name,title:'Was antwortest du '+name+'?',portrait:'🐱 💬 🐈',body:escapeText(prompt),options});
 const holder=overlayContent.querySelector('.story-card');
 const form=document.createElement('form');form.className='free-answer';
 const field=document.createElement('textarea');field.rows=2;field.maxLength=160;field.placeholder='Deine eigene Antwort an '+name+' …';field.setAttribute('aria-label','Eigene Antwort an '+name);
 const submit=document.createElement('button');submit.type='submit';submit.className='story-button free-send';submit.textContent='💬 Eigene Antwort senden';
 form.append(field,submit);holder.append(form);
 form.addEventListener('submit',e=>{e.preventDefault();const answer=field.value.trim();if(!answer){field.focus();return}hideOverlay();answerToCat(name,answer)});
}
function answerToCat(name,answer){
 const r=applyConversation(name,answer);
 dialog({tag:'KATZENREAKTION · '+r.intent.toUpperCase(),title:name+' antwortet!',portrait:'🐈 💫 🐱',body:escapeText(r.reply)+' '+escapeText(r.effect),options:[{label:'🐾 Und weiter!',action:()=>{enterDynamicEncounters();resume()}}]});
}
function enterDynamicEncounters(){
 if(!level)return;
 const i=level.index;
 if(save.flags['ally'+i]&&!level.allyBridge){const gap=level.gaps[0];if(gap)level.platforms.push({x:gap[0]+12,y:398,w:gap[1]-gap[0]-24,h:24,ground:false,helper:true});level.allyBridge=true}
 if(save.flags['rival'+i]&&!level.rivalAdded){
  const base=level.width*.63;const type=i>1?'witch':'armored';const t=ENEMY_TYPES[type];level.enemies.push({id:'rival'+i,type,name:t.name,base,x:base,y:411,baseY:411,hp:t.hp+Math.floor(i/4),maxHp:t.hp+Math.floor(i/4),dead:false,seed:i+101,range:t.range,inv:0,attackTimer:1.8,alert:0,dash:0});level.rivalAdded=true;
 }
}
function hasSavedGame(){try{return !!localStorage.getItem(SAVE_KEY)}catch{return false}}
function characterSelect(){
 phase='menu';
 presentCard('WÄHLE DEINEN HELDEN','Wer rettet Katzigami?','🐱 🐶 🐔 🐰 🦊','Alle fünf Helden sind gleich stark – aber ihre Angriffe fühlen sich anders an.',Object.entries(HEROES).map(([id,h])=>({label:h.label+' · '+h.blurb,action:()=>difficultySelect(id)})));
}
function difficultySelect(character){
 phase='menu';presentCard('WÄHLE DIE HERAUSFORDERUNG','Wie mutig bist du?','🎲 💖 💀','Echte Lebensanzeige! Sind alle Leben verbraucht, ist dieses Abenteuer vorbei.',
 Object.entries(DIFFICULTY).map(([id,d])=>({label:(id==='ultra'?'💀':id==='hard'?'🔥':id==='medium'?'🌸':'💗')+' '+d.name+' · '+d.lives+' Leben · '+d.hearts+' Herzen',
 action:()=>{save=defaultSave();save.character=character;save.difficulty=id;save.lives=d.lives;save.hearts=d.hearts;persist();enterLevel(0,true)}})));
}
function menu(){phase='menu';updateUI();presentCard('EIN HANDGEMACHTES KATZENABENTEUER','KATZIGAMI ✿','🐱 🍄 🌸','Momo sucht sieben Pilze und ein neues Geheimnis bei jedem Durchlauf. Du kannst andere Katzen mit selbst geschriebenen Antworten überzeugen – und jede Patrouille reagiert anders. Welche Wendung wartet wohl heute?',[
 ...(hasSavedGame()&&save.lives>0? [{label:save.won?'🌸 Noch einmal das Finale / weiterspielen':'🐾 Spielstand fortsetzen',action:()=>enterLevel(save.level,true)}]:[]),
 {label:'✿ Neues Abenteuer beginnen',action:characterSelect},
 {label:'🎮 So spielt man',secondary:true,action:help}
 ]);
}
function help(){dialog({tag:'SPIELANLEITUNG',title:'Mit zwei Daumen ins Abenteuer!',portrait:'⬅️ 🐱 ➡️ ⬆️',body:'Links: laufen. Rechts: springen (gedrückt halten = höher!). Die NEUE Magietaste daneben wird ERST nach einem besonderen Verwandlungspilz aktiv; damit wirfst du Zauberkugeln. Jeder Verwandlungspilz bringt eine höhere Stufe: Blütenwurf, Kettenblitz, Mondexplosion und Sternensturm. Upgrades bleiben auch nach Treffern erhalten. Durchquere zwölf lange Level in vier Retro-Anime-Welten. Sammle sieben Orakelpilze und besiege unterschiedliche Katzengegner mit mehreren Lebenspunkten. Helle Bonus-Items verleihen zeitweise Turbo, Unverwundbarkeit oder Flugfähigkeit (zum Fliegen Sprungtaste gedrückt halten). Dunkle, durchgestrichene Items verursachen Flüche: Bildschirm-Schwanken, Schneckentempo oder Magiesperre. Die Restzeit steht über Momos Kopf. Du kannst gefährliche Items überspringen. Jedes neue Abenteuer hat ein neues Katzigmysterium und zufällige Gegner. Bei Katzenbegegnungen kannst du eigene Antworten eintippen, die Beziehungen, Abkürzungen und Gegner beeinflussen. Das läuft offline mit Spielregeln, nicht über eine Sprachmodell-KI. Spielstände werden automatisch auf diesem Gerät gespeichert. Auf PC: A/D oder Pfeiltasten, Leertaste zum Springen.',options:[{label:'Miau, verstanden! 🐾',action:()=>phase==='dialogue'&&menu()}]})}
function markShown(key){if(!save.shown.includes(key)){save.shown.push(key);persist();return false}return true}
function enterLevel(i,withIntro=false){const restoring=withIntro&&i===save.level&&!save.won&&save.checkpoint>0;const spawnX=restoring?save.checkpoint:78;save.level=i;if(!restoring)save.checkpoint=0;save.hearts=clamp(save.hearts,1,diff().hearts);level=makeLevel(i);boss={triggered:false,active:false,done:false,hp:12,maxHp:12,x:level.width-315,y:402,inv:0};player={x:spawnX,y:330,w:43,h:60,vx:0,vy:0,grounded:false,facing:1,inv:1,landed:false,runCycle:0,route:null,tubeCooldown:0,dizzy:0,hatTick:0};shots=[];enemyShots=[];particles=[];effects={};transport=null;specialCooldown=0;powerFlash=0;resetMusic();cam=0;camY=0;coyote=0;clearInputs();persist();updateUI();hideOverlay();phase='playing';if(withIntro&&!markShown('start'+i))startDialog(i);else enterDynamicEncounters()}
function makeLevel(i){const d=CHAPTERS[i],act=actOf(i);let ground=[],previous=0;for(const [from,to] of d.gaps){ground.push({x:previous,y:450,w:from-previous,h:100,ground:true});previous=to}ground.push({x:previous,y:450,w:d.width-previous,h:100,ground:true});const platforms=d.platforms.map(([x,y,w])=>({x,y,w,h:24,ground:false}));const positions=[...d.enemies,...EXTRA_ENEMY_SPAWNS[act]];
 const routes=[
 {id:'cloud',label:'Wolkenparcours',from:900,end:2090,y:-555,kind:'cloud',bonus:200},
 {id:'depth',label:i%2?'Tropfsteinhöhle':'Maulwurfstollen',from:1370,end:Math.min(d.width-350,2750),y:890,kind:i%2?'cave':'burrow',bonus:360}
 ];
 const tubes=routes.flatMap(q=>[
  {id:q.id+'-in',x:q.from,y:378,route:q.id,direction:'in'},
  {id:q.id+'-out',x:q.end,y:q.kind==='cloud'?-540:966,route:q.id,direction:'out'}
 ]);
 const routePlatforms=[];
 for(const route of routes){
  if(route.kind==='cloud'){
   for(let x=route.from+125,j=0;x<route.end+70;x+=175,j++)routePlatforms.push({x,y:-462+(j%3===1?-54:0),w:158,h:25,ground:false,moving:true,baseY:-462+(j%3===1?-54:0),baseX:x,phase:j*1.9});
  }else{
   routePlatforms.push({x:route.from+100,y:1035,w:route.end-route.from+150,h:90,ground:true,route:route.kind});
   for(let x=route.from+300,j=0;x<route.end;x+=260,j++)routePlatforms.push({x,y:916-j%2*45,w:135,h:25,ground:false,route:route.kind});
  }
 }
 const newCoins=[];
 const addCoin=(x,y,type,id)=>newCoins.push({id:'coin-'+i+'-'+id,x,y,type,taken:save.coinTaken.includes('coin-'+i+'-'+id)});
 for(let x=260,j=0;x<d.width-140;x+=185,j++)addCoin(x,j%3===0?346:400,j%8===0?'gold':j%3===0?'silver':'bronze','main-'+j);
 for(const route of routes){for(let x=route.from+175,j=0;x<route.end;x+=156,j++)addCoin(x,route.kind==='cloud'?-535:967,j%5===0?'gold':'silver',route.id+'-'+j)}
 const houses=[{id:'house-'+i+'-a',x:650,y:450},{id:'house-'+i+'-b',x:d.width-420,y:450}].map(h=>({...h,used:save.rolledHouses.includes(h.id),cooldown:0}));
 const routeHazards=routes.filter(q=>q.kind==='cave').flatMap(q=>Array.from({length:6},(_,j)=>({x:q.from+230+j*180,y:830,type:'stalactite'})));

 const makeEnemy=(x,j,type)=>{const t=ENEMY_TYPES[type],hp=Math.max(1,Math.ceil(t.hp*diff().enemyHp));return {id:'e'+j,type,name:t.name,base:x,x,y:411,baseY:411,hp,maxHp:hp,dead:false,seed:j+i*11,range:t.range,inv:0,attackTimer:1.8+rand(j*13+i)*2}};
 for(let x=d.width-680;x>d.width-2100&&x>650;x-=420){if(!d.gaps.some(([a,b])=>x>a-65&&x<b+55))positions.push(x)}
 let enemies=positions.map((x,j)=>makeEnemy(x,j,j===0?'scout':ENEMY_MAP[act][(j+Math.floor(campaignVar(i*100+j)*ENEMY_MAP[act].length))%ENEMY_MAP[act].length]));
 // Each new adventure has distinct patrols, without moving mandatory collectibles.
 for(let j=0;j<5+Math.ceil(i/2);j++){const x=Math.round(550+campaignVar(i*32+j*13)*Math.max(200,d.width-1050));if(d.gaps.some(([a,b])=>x>a-60&&x<b+60))continue;const options=act===0?['scout','jumper','ninja']:act<3?['jumper','armored','witch','phantom','archer']:['armored','witch','titan','phantom','ninja','archer','guardian'];enemies.push(makeEnemy(x,30+j,options[Math.floor(campaignVar(500+i*20+j)*options.length)]))}

 if(act===1&&!save.flags.helpedMiso)enemies.push(makeEnemy(1360,20,'armored'));
 if(act===2&&!save.flags.trustedQueen){enemies.push(makeEnemy(1140,21,'witch'),makeEnemy(1760,22,'titan'))}
 if(act===3&&save.flags.readLetter)enemies=enemies.filter(e=>e.type!=='titan'||e.base>2000);
 if(act===1&&save.flags.helpedMiso)platforms.push({x:1135,y:350,w:245,h:24,ground:false,helper:true});
 if(act===2&&save.flags.trustedQueen)platforms.push({x:1720,y:345,w:300,h:24,ground:false,helper:true});
 const charms=[];
 const keys=Object.keys(CHARMS);
 for(let j=0;j<8+Math.floor(i/3);j++){
  let x=Math.round(490+(j+1)*(d.width-880)/(9+Math.floor(i/3))+campaignVar(i*303+j)*90);
  if(d.gaps.some(([a,b])=>x>a-80&&x<b+75))x+=190;
  x=Math.min(d.width-250,x);
  const kind=keys[(j+Math.floor(campaignVar(i*503+j)*keys.length))%keys.length];
  charms.push({id:'charm'+i+'-'+j,kind,x,y:400,taken:false});
 }
 // High and low route fauna; each route has distinct challenges and rewards.
 for(const route of routes){
  const types=route.kind==='cloud'?['bird','bird','bat']:route.kind==='cave'?['bat','worm','bat']:['worm','mole','worm'];
  for(let j=0;j<5;j++){
   const x=route.from+280+j*(route.end-route.from-320)/5;
   const enemy=makeEnemy(x,100+j+i*11,types[j%types.length]);
   enemy.baseY=route.kind==='cloud'?-518:945;enemy.y=enemy.baseY;enemy.route=route.id;
   enemy.hp=Math.max(2,Math.ceil(enemy.hp*1.1));enemy.maxHp=enemy.hp;enemies.push(enemy);
  }
 }
 const brightness=campaignVar(i*43+2),toneVariant=brightness<.33?'Dämmerung':brightness>.7?'Morgentau':'Sternenschein';
 return {...d,index:i,toneVariant,ground,platforms,enemies,routes,tubes,routePlatforms,routeHazards,coins:newCoins,houses,items:d.mushrooms.map(([id,x,y])=>({id,x,y,taken:save.collected.includes(id)})),powerItem:{id:d.power[0],x:d.power[1],y:d.power[2],taken:false},charms,checkpoints:d.checkpoint};}
// Bonus routes, collectible coins and a free once-per-house dice reward.
function takeCoin(coin){
 if(coin.taken)return;coin.taken=true;const value=COIN_VALUES[coin.type]||1;
 save.coins+=value;save.coinTaken.push(coin.id);persist();updateUI();
 if(value>=5){sound('pick');burst(coin.x,coin.y,'#ffdd69',8)}
}
function throwDice(house){
 if(house.used||phase!=='playing')return;
 house.used=true;save.rolledHouses.push(house.id);persist();
 const dice=new Uint32Array(1);try{crypto.getRandomValues(dice)}catch{dice[0]=campaignSeed()}
 const roll=dice[0]%6+1;let reward='';
 if(roll===1){save.lives=Math.min(99,save.lives+1);reward='Ein zusätzliches Leben! 🐾'}
 else if(roll===2){save.hearts=Math.min(diff().hearts,save.hearts+2);reward='Zwei Herzen aufgefüllt! 💗'}
 else if(roll===3){save.coins+=20;reward='20 Goldmünzen! 🪙'}
 else if(roll===4){const ids=Object.keys(COSTUMES);const id=ids[Math.floor(campaignVar(save.level+save.rolledHouses.length*27)*ids.length)];
   if(!save.costumes.includes(id))save.costumes.push(id);save.worn=id;reward=COSTUMES[id]+' freigeschaltet!'}
 else if(roll===5){const ids=Object.keys(SMALL_PERKS);const id=ids[Math.floor(campaignVar(save.level+save.rolledHouses.length*49)*ids.length)];
   save.perk=id;reward='Kleiner Bonus: '+SMALL_PERKS[id]+'!'}
 else {save.coins+=5;save.hearts=Math.min(diff().hearts,save.hearts+1);reward='Keksregen! 5 Münzen und ein Herz! 🍪'}
 sound('win');persist();updateUI();
 dialog({tag:'DAS WÜRFELHAUS · '+roll+' ⚄',title:'Was für ein Pfotenwurf!',portrait:'🎲 '+hero().icon+' 🏠',body:reward+' Komm später in einem anderen Level wieder – jedes Haus darf einmal würfeln.',options:[{label:'🐾 Ab ins Abenteuer!',action:resume}]})
}
function enterHouse(house){
 if(house.used||phase!=='playing')return;
 dialog({tag:'DAS GRATIS-WÜRFELHAUS',title:'Haus zum Glückskeks!',portrait:'🏠 🎲 🐭',body:'Eine Zylindermaus ruft: »Ein Wurf pro Haus, ganz ohne Einsatz! Würfel Gewänder, Münzen, zusätzliche Leben oder einen kleinen Spezialbonus.«',options:[{label:'🎲 Würfeln!',action:()=>{phase='playing';throwDice(house)}},{label:'🐾 Vielleicht später',action:()=>{house.cooldown=3;resume()}}]})
}
function activateTube(tube){
 if(player.tubeCooldown>0||player.transit||phase!=='playing')return;
 const route=level.routes.find(q=>q.id===tube.route);
 if(!route||tube.direction==='out'&&player.route!==route.id||tube.direction==='in'&&player.route)return;
 player.transit={tubeId:tube.id,t:0.65,route:route.id,direction:tube.direction};
 player.vx=0;player.vy=0;player.inv=1.6;
 sound('meow');burst(tube.x,tube.y,route.kind==='cloud'?'#fff3ba':'#b7a1e3',24);
 toast(tube.direction==='in'?'🌀 SCHLURP! '+route.label:'💨 PLOPP! Die Abkürzung endet!');
}
function updateAdventure(dt){
 if(player.tubeCooldown>0)player.tubeCooldown=Math.max(0,player.tubeCooldown-dt);
 if(player.stagger>0)player.stagger=Math.max(0,player.stagger-dt);
 if(player.transit){
  player.transit.t-=dt;
  if(player.transit.t>0)return true;
  const t=player.transit,route=level.routes.find(q=>q.id===t.route);
  if(t.direction==='in'){player.x=route.from+135;player.y=route.kind==='cloud'?-522:971;player.route=route.id;camY=route.kind==='cloud'?-690:760}
  else {player.x=Math.min(level.width-200,route.end+155);player.y=320;player.route=null;camY=0}
  player.transit=null;player.vx=0;player.vy=0;player.grounded=false;
  player.tubeCooldown=2.5;player.stagger=1.3;player.inv=1.8;
  effects.sway=Math.max(effects.sway||0,1.7);
  return true;
 }
 for(const platform of level.routePlatforms){
  if(!platform.moving)continue;
  const oldX=platform.x,oldY=platform.y;
  platform.x=platform.baseX+Math.sin(clock*1.05+platform.phase)*35;
  platform.y=platform.baseY+Math.cos(clock*1.4+platform.phase)*20;
  if(player.grounded&&Math.abs(player.y+player.h-oldY)<5&&player.x+player.w>oldX&&player.x<oldX+platform.w){player.x+=platform.x-oldX;player.y+=platform.y-oldY}
 }
 for(const tube of level.tubes){
  if(Math.abs(player.x+player.w*.5-tube.x)<38&&Math.abs(player.y+player.h*.55-tube.y)<76)activateTube(tube);
 }
 for(const coin of level.coins){if(!coin.taken&&Math.abs(player.x+player.w/2-coin.x)<(save.perk==='magnet'?83:27)&&Math.abs(player.y+player.h/2-coin.y)<(save.perk==='magnet'?85:30))takeCoin(coin)}
 for(const house of level.houses){
  house.cooldown=Math.max(0,house.cooldown-dt);
  if(!house.used&&!house.cooldown&&!player.route&&Math.abs(player.x+player.w/2-house.x)<37&&Math.abs(player.y+player.h-house.y)<28){enterHouse(house);return true}
 }
 if(player.route==='cloud'&&player.y>170){player.route=null;player.tubeCooldown=1.5;toast('☁️ Plumps! Zurück in der Blumenwelt.')}
 if(player.route==='depth'&&player.x>level.routes[1].end+75){player.route=null}
 for(const trap of level.routeHazards){if(player.route&&Math.abs(player.x+20-trap.x)<28&&Math.abs(player.y-trap.y)<32)hurt()}
 camY+=(clamp(player.y-260,-800,960)-camY)*Math.min(1,dt*5.5);
 return false;
}
function drawAdventure(){
 // Draw in world coordinates after camera translation.
 for(const q of level.routes){
  if(q.kind==='cloud'){
   ctx.save();ctx.fillStyle='#e8f7ff90';ctx.fillRect(q.from-cam,-795,q.end-q.from+230,460);
   for(let x=q.from+75;x<q.end;x+=210){ctx.font='bold 34px serif';ctx.fillStyle='#fff';ctx.fillText('✦',x-cam,-690+Math.sin(x)*27)}
   ctx.restore();
  }else{
   const x=q.from-cam,w=q.end-q.from+160;
   ctx.save();round(x,740,w,540,40,q.kind==='cave'?'#483856':'#80624f',q.kind==='cave'?'#b7a0d0':'#c5a27e',6);
   for(let k=0;k<20;k++){const px=x+(k+.5)*w/20;ctx.fillStyle=q.kind==='cave'?'#e3c6ff':'#ccb288';ctx.beginPath();
    ctx.moveTo(px-23,752);ctx.lineTo(px,790+((k*19)%70));ctx.lineTo(px+23,752);ctx.fill();
    if(q.kind==='burrow'){ellipse(px,853+Math.sin(k)*28,18,6,'#cfaf8880')}
   }ctx.restore();
  }
 }
 for(const p of level.routePlatforms){
  if(p.moving){const x=p.x-cam;if(x>-180&&x<viewW+180){ctx.save();ctx.globalAlpha=.93;ellipse(x+p.w*.5,p.y+14,p.w*.5,22,'#d3e9ff');ellipse(x+32,p.y+2,40,24,'#fff');ellipse(x+88,p.y-8,51,33,'#fff');ellipse(x+132,p.y+3,33,21,'#fff');ctx.restore()}}
  else drawGround(p);
 }
 for(const tube of level.tubes){
  const x=tube.x-cam,y=tube.y;if(x<-110||x>viewW+110)continue;
  ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(clock*2+tube.x)*.13);
  ctx.lineWidth=30;ctx.lineCap='round';ctx.strokeStyle=tube.route==='cloud'?'#7edcd6':'#cb96c4';ctx.beginPath();ctx.moveTo(0,-55);ctx.bezierCurveTo(-40,-105,50,-105,0,-15);ctx.stroke();
  ctx.lineWidth=13;ctx.strokeStyle='#fff6dc';ctx.stroke();
  ellipse(0,-14,30,20,'#785778');ellipse(0,-14,20,11,'#29233f');
  ctx.font='22px sans-serif';ctx.fillText(tube.direction==='in'?'🌀':'💨',-12,-56);ctx.restore();
 }
 for(const coin of level.coins){if(coin.taken)continue;const x=coin.x-cam,y=coin.y+Math.sin(clock*3+coin.x)*5;if(x<-35||x>viewW+35)continue;
  ctx.save();ctx.translate(x,y);ctx.scale(.65+.35*Math.abs(Math.cos(clock*3+coin.x)),1);
  const color=coin.type==='gold'?'#ffd75c':coin.type==='silver'?'#d5e7f6':'#ce9877';ellipse(0,0,14,15,color);ctx.strokeStyle='#fff8d9';ctx.lineWidth=3;ctx.stroke();ctx.font='bold 14px sans-serif';ctx.fillStyle='#8c6c69';ctx.textAlign='center';ctx.fillText(coin.type==='gold'?'20':coin.type==='silver'?'5':'1',0,5);ctx.restore()}
 for(const house of level.houses){const x=house.x-cam;if(x<-100||x>viewW+120)continue;
  ctx.save();ctx.translate(x,house.y);round(-45,-83,90,82,11,'#fff4d3','#e7b7c3',4);
  ctx.fillStyle='#de91af';ctx.beginPath();ctx.moveTo(-56,-82);ctx.lineTo(0,-135);ctx.lineTo(56,-82);ctx.closePath();ctx.fill();
  round(-17,-36,34,36,12,'#a888c4');ctx.font='25px sans-serif';ctx.fillText(house.used?'🐭':'🎲',-14,-94);ctx.restore()}
 for(const trap of level.routeHazards){const x=trap.x-cam;if(x<-30||x>viewW+30)continue;ctx.fillStyle='#ded0ed';ctx.beginPath();ctx.moveTo(x-20,750);ctx.lineTo(x,840);ctx.lineTo(x+20,750);ctx.fill()}
}
function startDialog(i){if(i===0){dialog({tag:'PROLOG · DIE VERLORENEN FARBEN',title:'Momo und das Pilzorakel',portrait:'🐱 🍄 🌸',body:'»MIAU?!« Alle Blumen werden blass! '+mystery().clue+' Pilzbote Pip verdächtigt Königin Dahlia. Sammle die sieben Orakelpilze und finde heraus, wer hier eigentlich Quatsch erzählt.',options:[{label:'🍰 Erst Kuchen, dann Weltrettung!',action:()=>{save.flags.cake=true;persist();resume();toast('Momo: »Ich rette niemals nüchtern … äh, hungrig!«')}},{label:'⚔️ Ich bin die auserwählte Samtpfote!',action:()=>{save.flags.hero=true;persist();resume();toast('Momo: »Schicksal, zieh dich warm an!«')}}]});return}
 if(i%5!==0){resume();return}
 const details=[null,{title:'Ein Wald voller Gerüchte',portrait:'🐈 🌳 🐈',body:save.flags.helpedMiso?'Miso wurde gerettet und begleitet dich. Sie kennt geheime Pilzpfade!':'Miso ist beleidigt und hat die Brücke mitgenommen. Jetzt warten zusätzliche Schattenkatzen. Autsch.',line:'Die Wahrheit raschelt zwischen den Blättern.'},{title:'Die Königin in Grau',portrait:'👑 🐈 🌙',body:save.flags.trustedQueen?'Dahlia dankt für dein Vertrauen: Ein sicherer Mondsteg erscheint.':'Du glaubst Pip. Doch die Wolkenkatzen sehen plötzlich erstaunlich bissig aus.'},{title:'Der Garten außerhalb der Zeit',portrait:'⏳ 🐱 🌼',body:save.flags.readLetter?'Der Brief verrät, wie das Spiegelkätzchen entstand. Du kannst mit ihm reden.':'Du hast den Brief verworfen. Vielleicht kann ein Pilz das Spiegelkätzchen trotzdem besänftigen.'}];const v=details[actOf(i)];dialog({tag:CHAPTERS[i].subtitle,title:v.title,portrait:v.portrait,body:v.body+' '+mystery().clue,options:[{label:'🐾 Weiter in den Blumenwahnsinn!',action:resume}]});}
function resume(){hideOverlay();phase='playing';enterDynamicEncounters();clearInputs();lastFrame=performance.now();musicAt=0}
function pause(){if(phase==='playing'){phase='paused';clearInputs();presentCard('PAUSE · EINE KATZE MUSS MAL SITZEN','Miau-Pause','🐱 ☕ 🌸',`Kapitel ${save.level+1}: ${CHAPTERS[save.level].name}. Gesammelte Pilze: ${save.collected.length}/${TOTAL}. Dein Fortschritt ist gespeichert.`,[
 {label:'▶ Weiterhüpfen',action:resume},
 {label:'↩ Kapitel neu starten',action:()=>enterLevel(save.level)},
 {label:'🏠 Hauptmenü',secondary:true,action:menu}
 ])}else if(phase==='paused')resume()}
function checkEndOfLevel(){if(phase!=='playing')return;if(isFinal(save.level)){if(!boss.done){toast('Ein magischer Spiegel versperrt den Ausgang!');player.x=Math.min(player.x,level.width-230);return}endChoice();return}
 const i=save.level;
 if(i%5!==4){nextChapter('Neue Strecke, neue Abenteuer! 🐱');return}
 if(i===4){dialog({tag:'PLOT TWIST · KAPITEL 1',title:'Miso in der Seifenblase',portrait:'🐈 🫧 🐱',body:'Kätzchen Miso hängt in einer riesigen Seifenblase. Gleichzeitig flattert eine Karte mit geheimen Abkürzungen davon. Pip ruft: »Rette die Karte! Katzen haben neun Leben!«',options:[
 {label:'💗 Miso retten – Freunde sind wichtiger!',action:()=>{save.flags.helpedMiso=true;nextChapter('Miso: »Ich schulde dir ein Leben. Und eine Pizza.«')}},
 {label:'🗺️ Karte jagen – die Mission geht vor!',action:()=>{save.flags.helpedMiso=false;nextChapter('Miso: »Ich merke mir das. Sehr detailliert.«')}}
 ]})}
 if(i===9){dialog({tag:'PLOT TWIST · KAPITEL 2',title:'Die Königin hat ein Geheimnis',portrait:'👑 🐈 🐾',body:'Königin Dahlia sagt, sie habe alle Farben in einer Sanduhr versteckt, um den Wald vor dem ewigen Stillstand zu retten. Pip ruft: »Das sagen ALLE verdächtigen Katzen!«',options:[
 {label:'🌷 Dahlia glauben – ihre Geschichte anhören',action:()=>{save.flags.trustedQueen=true;nextChapter('Dahlia: »Endlich jemand mit Ohren UND Gehirn.«')}},
 {label:'🦉 Pip glauben – die Königin ist schuld!',action:()=>{save.flags.trustedQueen=false;nextChapter('Pip: »Ich war nie eine Eule! Ich bin ein KATER!«')}}
 ]})}
 if(i===14){dialog({tag:'DIE GROSSE WENDUNG · KAPITEL 3',title:'Die Katze von morgen',portrait:'🐱 ⏳ 🐱',body:'In der Uhr liegt ein Brief von MOMO … aus der Zukunft! '+mystery().cause+' Doch das Spiegelkätzchen hält immer noch die Zeit fest. Dahlia hat die Farben versteckt, um die Welt wieder anzuschubsen!',options:[
 {label:'💌 Brief lesen – auch das traurige Ende',action:()=>{save.flags.readLetter=true;nextChapter('Brief-Momo: »P.S. Kauf keinen Thunfisch aus der Zukunft.«')}},
 {label:'🔥 Brief zuklappen – ich entscheide selbst!',action:()=>{save.flags.readLetter=false;nextChapter('Momo: »Spoiler sind schlimmer als Gurken!«')}}
 ]})}
}
function nextChapter(msg){toast(msg);save.level++;save.hearts=diff().hearts;save.checkpoint=0;persist();sound('meow');enterLevel(save.level,true)}
function bossTalk(){if(phase!=='playing'||boss.triggered)return;boss.triggered=true;const empathic=!!save.flags.readLetter,canOffer=save.collected.length>=5;let options=[];
 if(empathic){options.push({label:'💞 »Ich weiß, wer du bist. Komm mit, Zukunfts-Momo.«',action:()=>{boss.done=true;save.flags.kindShadow=true;persist();resume();toast('Spiegel-Momo: »Du hast mich … nicht gehasst?«')}})}
 else if(canOffer){options.push({label:'🍄 Einen Pilz teilen – Frieden?',action:()=>{boss.done=true;save.flags.kindShadow=true;persist();resume();toast('Spiegel-Momo: »Ist das … Käsegeschmack?!«')}})}
 options.push({label:'⚔️ »Dann tanzen wir, Schattenpfote!« (12 Herzen)',action:()=>{boss.active=true;save.flags.kindShadow=false;persist();resume();toast('Spring dem Spiegelkätzchen zweimal auf den Kopf!')}});
 dialog({tag:'FINALE · DER SPIEGEL',title:'Du bist … ICH?!',portrait:'🐱 🪞 🐈‍⬛',body:'Spiegel-Momo: »'+mystery().cause+' Niemand sollte sich fürchten. Aber jetzt können die Blumen nicht mehr wachsen … und mein Fischstäbchen ist seit 700 Jahren kalt!«',options})}
function endChoice(){if(phase!=='playing')return;dialog({tag:'FINALE · DEINE ENTSCHEIDUNG',title:'Die Uhr tickt wieder',portrait:'🌈 🐱 ⏳',body:`Du hast ${save.collected.length} von ${TOTAL} Orakelpilzen. Momo hält die Sanduhr in den Pfoten. Die Welt kann wieder wachsen – oder für immer in einem hübschen Augenblick bleiben.`,options:[
 {label:'🌸 Zeit freigeben – Veränderung wagen',action:()=>ending('release')},
 {label:'🌙 Alles für immer bewahren – den Moment einfrieren',action:()=>ending('freeze')}
 ]})}
function ending(choice){save.flags.finalChoice=choice;save.won=true;let type,title,body;
 if(choice==='freeze'){type='MOND-ENDE';title='Ein schnurrender Augenblick';body='Die Zeit steht still. Alle Katzen genießen ewig dieselbe Teestunde. Problem: Der Tee ist nach vier Milliarden Schlucken noch immer lauwarm. Momo lernt, dass auch perfekte Tage manchmal weitergehen sollten.'}
 else if(save.collected.length===TOTAL&&save.flags.helpedMiso&&save.flags.trustedQueen&&save.flags.readLetter&&save.flags.kindShadow){type='WAHRES STERNEN-ENDE';title='Sieben Pilze und neun Leben';body='Du hast alle sieben Pilze gefunden, Miso gerettet, Dahlia vertraut und Zukunfts-Momo vergeben! Der Wald erblüht. Pip eröffnet eine Nachrichtenagentur, die erstmals Fakten prüft. Und Miso bestellt eine Pizza. Mit Pilzen. Wahnsinn!'}
 else if(save.collected.length===TOTAL){type='REGENBOGEN-ENDE';title='Die Farben kehren zurück';body='Alle sieben Pilze leuchten gleichzeitig! Die Uhr erwacht. Die Blumen blühen wieder, Dahlia lässt die Farben frei, und Momo wird zur offiziellen Heldin der königlichen Snackabteilung.'}
 else {type='PFOTEN-ENDE';title='Ein unperfekt perfekter Morgen';body='Die Zeit geht wieder weiter – auch mit ein paar fehlenden Pilzen. Manchmal muss man mutig sein, bevor man alles versteht. Momo und die Katzen feiern mit einer Torte, die verdächtig nach Thunfisch schmeckt.'}
 // A completed adventure also reflects the player's freely written answers and allegiances.
 const bonds=Object.values(save.relations||{}).reduce((a,b)=>a+b,0);
 const epilogue=bonds>=3?' Deine befreundeten Katzen organisieren ein prachtvolles Fest.':bonds<=-2?' Einige misstrauische Katzen bleiben als schwierige Rivalen zurück.':' Die anderen Katzen versprechen, noch viele Fragen zu stellen.';
 body+=' '+mystery().ending+epilogue;
 save.ending=type;persist();sound('win');phase='ending';presentCard(`🏆 ${type}`,title,'🐈 🌈 🍄',body,[{label:'🐾 Die Pilze noch einmal suchen',action:()=>{save.won=false;save.level=0;save.checkpoint=0;persist();enterLevel(0)}},{label:'🏠 Hauptmenü',secondary:true,action:menu}])}
function pickCoin(coin){
 if(coin.taken)return false;coin.taken=true;save.coins+=COIN_VALUES[coin.type];
 if(!save.coinTaken.includes(coin.id))save.coinTaken.push(coin.id);
 burst(coin.x,coin.y,coin.type==='gold'?'#ffdf73':coin.type==='silver'?'#c8ebf8':'#dc9d65',9);
 sound('pick');persist();updateUI();return true;
}
function awardDice(house){
 const roll=1+Math.floor(Math.random()*6),name=hero().name;
 let reward='',portrait='🎲';
 if(roll===1){save.hearts=Math.min(diff().hearts,save.hearts+2);reward='💗 Zwei Herzen für '+name+'!';}
 else if(roll===2){save.lives+=1;reward='🐾 Ein zusätzliches Leben!';}
 else if(roll===3){save.coins+=30;reward='🪙 30 Münzen – Jackpot!';}
 else if(roll===4||roll===5){const keys=Object.keys(COSTUMES),outfit=keys[Math.floor(Math.random()*keys.length)];if(!save.costumes.includes(outfit))save.costumes.push(outfit);save.outfit=outfit;reward='🎩 Neues Kostüm: '+COSTUMES[outfit]+'!';}
 else {const keys=Object.keys(SMALL_PERKS),perk=keys[Math.floor(Math.random()*keys.length)];save.perk=perk;reward='✨ Kleine Fähigkeit: '+SMALL_PERKS[perk]+'!';}
 save.rolledHouses.push(house.id);house.used=true;persist();updateUI();sound('transform');
 dialog({tag:'WÜRFELHAUS · '+roll+' AUGEN',title:'Glücks-Miau!',portrait:'🎲 '+portrait+' '+hero().icon,body:reward+' Das Glückshaus kann in diesem Durchlauf nur einmal verwendet werden.',options:[{label:'🐾 Weiter durch die Welt!',action:resume}]});
}
function visitHouse(house){
 if(house.used||phase!=='playing')return;
 house.cooldown=12;player.vx=0;
 dialog({tag:'HAUS DER WÜRFELNAGETIERE',title:'Hereinspaziert zum Katzenwürfeln!',portrait:'🏠 🎲 🐭',body:hero().name+' betritt die Glückshütte! Ein würfelnder Hamster fragt: »10 Münzen für eine Überraschung?« Du hast '+save.coins+' Münzen. Zu gewinnen: Leben, Herzen, Münzen, lustige Kleidung oder kleine Fähigkeiten.',
 options:[{label:'🎲 10 Münzen einsetzen!',action:()=>{if(save.coins<10){dialog({tag:'ZU WENIG MÜNZEN',title:'Pleite-Pfötchen!',portrait:'🐹 🪙',body:'Du brauchst zehn Münzen. Der Hamster akzeptiert leider keine Keksbrösel.',options:[{label:'🐾 Wieder hinaus',action:resume}]})}else{save.coins-=10;awardDice(house)}}},
 {label:'🐾 Lieber Münzen sparen',secondary:true,action:resume}]});
}
function beginTube(tube){
 if(transport||player.tubeCooldown>0)return false;
 const route=level.routes.find(r=>r.id===tube.route);
 if(!route)return false;
 transport={route:route.id,direction:tube.direction,elapsed:0,x:tube.x,y:tube.y};
 player.vx=0;player.vy=0;player.grounded=false;clearInputs();sound('transform');toast(tube.direction==='in'?'🌀 FFFSCHLURP! '+hero().name+' wird eingesaugt!':'🎺 PLÖPP! Der Rückweg ruft!');
 return true;
}
function tubeTick(dt){
 if(!transport)return false;
 transport.elapsed+=dt;
 const tx=transport.x;
 player.x+=(tx-player.x)*Math.min(1,dt*9);
 player.y+=(transport.y-player.y-24)*Math.min(1,dt*6);
 if(transport.elapsed>=.83){
  const route=level.routes.find(q=>q.id===transport.route);
  if(transport.direction==='in'){player.route=route.id;player.x=route.from+148;player.y=route.kind==='cloud'?-580:905}
  else {player.route=null;player.x=Math.min(level.width-220,route.end+115);player.y=300}
  player.vx=player.facing*115;player.vy=-160;player.inv=1.35;player.tubeCooldown=2.2;player.dizzy=2.2;
  effects.dizzy=2.2;transport=null;sound('meow');toast('💫 '+hero().name+' taumelt! Wo sind die eigenen Pfoten?');
 }
 return true;
}
function takeCharm(item){
 if(item.taken)return;
 item.taken=true;const p=CHARMS[item.kind];effects[item.kind]=p.seconds;
 burst(item.x,item.y,p.color,24);sound(p.bad?'hurt':'transform');toast((p.bad?'☠️ FLUCH: ':'✨ BONUS: ')+p.name+' · '+p.info+' ('+p.seconds+'s)');
 if(p.bad&&navigator.vibrate)navigator.vibrate([45,60,45]);
 updateUI();
}
function transform(item){
 if(item.taken)return;
 item.taken=true;
 const previous=levelOf(save.power),next=POWERS[item.id];
 if(next.rank>previous){
  save.power=item.id;powerFlash=1.5;specialCooldown=.2;
  toast('✨ UPGRADE! STUFE '+next.rank+' · '+next.name+' · '+next.hint);
  sound('transform');burst(item.x,item.y,next.color,50);resetMusic();
 }else{
  save.hearts=Math.min(diff().hearts,save.hearts+1);toast('🍄 Pilzbonus! Deine Stufe '+previous+' bleibt erhalten. +1 Herz!');
  sound('pick');burst(item.x,item.y,next.color,20);
 }
 persist();updateUI();if(navigator.vibrate)navigator.vibrate([35,40,45]);
}
function castSpecial(){
 if(phase!=='playing'||!save.power||!player||specialCooldown>0||effects.silence>0)return false;
 const p=POWERS[save.power],x=player.x+player.w/2+player.facing*29,y=player.y+22;
 const basic={x,y,vx:player.facing*560,vy:0,life:1.5,kind:save.power,color:p.color,damage:p.damage,hit:[],pierce:1,radius:14};
 if(save.character==='chicken'){basic.vy=-265;basic.gravity=570;basic.color='#ffe0b3'}
 if(save.character==='dog'){basic.bounce=true;basic.color='#99d4ff'}
 if(save.character==='rabbit'){basic.vy=-100;basic.color='#f2c0f5'}
 if(save.character==='fox'){basic.spin=true;basic.color='#ffc3a0'}
 if(p.rank===1)shots.push(basic);
 if(p.rank===2)shots.push({...basic,vx:player.facing*690,radius:20,pierce:2,life:1.3});
 if(p.rank===3)shots.push({...basic,vx:player.facing*470,radius:24,splash:110,life:1.8});
 if(p.rank===4){for(let i=-1;i<=1;i++)shots.push({...basic,x:x+i*8,y:y+i*15,vx:player.facing*(520+Math.abs(i)*55),vy:i*130,radius:13,homing:true,life:2.4})}
 specialCooldown=p.cooldown*(save.perk==='rapid'?.85:1);burst(x,y,p.color,8+p.rank*4);sound('cast');
 if(navigator.vibrate)navigator.vibrate(12);return true;
}
function hitEnemy(e,damage,x,y){
 if(e.dead||e.inv>0)return false;
 e.hp=Math.max(0,e.hp-damage);e.inv=.2;
 burst(x,y,ENEMY_TYPES[e.type].color,e.hp?7:17);
 if(e.hp===0){e.dead=true;sound('bonk');toast('✨ '+e.name+' besiegt!')}else{sound('enemy');toast('💥 '+e.name+': '+e.hp+'/'+e.maxHp+' ♥ übrig')}
 return true;
}
function hitBoss(damage,x,y){
 if(!boss.active||boss.done||boss.inv>0)return false;
 boss.hp=Math.max(0,boss.hp-damage);boss.inv=.34;burst(x,y,'#d9d1ff',18);sound('enemy');
 toast(boss.hp>0?'👑 Spiegel-Momo: '+boss.hp+'/'+boss.maxHp+' ♥':'Spiegel-Momo: »Gut, du gewinnst. Kekse?«');
 if(boss.hp<=0){boss.active=false;boss.done=true;enemyShots=[]}
 return true;
}
function collect(item){if(item.taken)return;item.taken=true;if(!save.collected.includes(item.id))save.collected.push(item.id);persist();updateUI();sound('pick');if(navigator.vibrate)navigator.vibrate(20);toast(`🍄 ${MUSHROOMS[item.id].name}! ${MUSHROOMS[item.id].hint}`)}
function gameOver(reason='Alle Leben aufgebraucht!'){
 save.lives=0;persist();clearInputs();
 dialog({tag:'GAME OVER · '+diff().name.toUpperCase(),title:'Oh nein! Plüsch-Alarm!',portrait:hero().icon+' 💀 🐾',body:escapeText(reason)+' Alle Leben sind verbraucht. Das ist das Ende dieses Abenteuers.',
 options:[{label:'🌈 Neues Abenteuer (Figur wählen)',action:characterSelect},{label:'🏠 Hauptmenü',secondary:true,action:menu}]});
}
function loseLife(reason){
 save.deaths++;save.lives=Math.max(0,save.lives-1);
 if(save.lives===0){gameOver(reason);return}
 save.hearts=diff().hearts;player.x=save.checkpoint||78;player.y=320;player.vx=0;player.vy=0;player.inv=2;player.route=null;camY=0;effects={};persist();updateUI();toast('🐾 Ein Leben verloren! Noch '+save.lives+' übrig.');
}
function hurt(){
 if(player.inv>0||effects.invincible>0||phase!=='playing')return;
 player.inv=1.4;if(save.power)burst(player.x+20,player.y+10,POWERS[save.power].color,14);
 save.hearts=Math.max(0,save.hearts-1);sound('hurt');updateUI();player.vy=-440;player.vx=-player.facing*240;
 if(save.hearts<=0)loseLife('Die Gegner waren diesmal stärker!');else toast('Aua! '+hero().name+' hat nur noch '+save.hearts+' Herzen.');
 persist();
}
function jump(){if(phase!=='playing')return;queuedJump=.16}
function simulate(dt){if(phase!=='playing'||!player||!level)return;clock+=dt;
 if(save.outfit==='mouse'){player.hatTick+=dt;if(player.hatTick>14){player.hatTick=0;save.coins++;persist();updateUI();burst(player.x+20,player.y-18,'#ffe27a',12);sound('pick');toast('🎩 Die Hutmaus wirft eine Münze! *Kicher!*')}}
 if(transport){tubeTick(dt);camY+=(clamp(player.y-330,-860,870)-camY)*Math.min(1,dt*8);cam+=(clamp(player.x-viewW*.33,0,Math.max(0,level.width-viewW))-cam)*Math.min(1,dt*6);return}
 player.tubeCooldown=Math.max(0,player.tubeCooldown-dt);
 player.dizzy=Math.max(0,player.dizzy-dt);
 for(const house of level.houses)house.cooldown=Math.max(0,house.cooldown-dt);
 for(const plat of level.routePlatforms){if(plat.moving){plat.x=plat.baseX+Math.sin(clock*1.1+plat.phase)*32;plat.y=plat.baseY+Math.cos(clock*1.45+plat.phase)*24}}

 const blocked=effects.silence>0;
 for(const key of Object.keys(effects)){effects[key]=Math.max(0,effects[key]-dt);if(!effects[key])delete effects[key]}
 if(blocked!==!!effects.silence)updateUI();
 player.inv=Math.max(0,player.inv-dt);boss.inv=Math.max(0,boss.inv-dt);powerFlash=Math.max(0,powerFlash-dt);specialCooldown=Math.max(0,specialCooldown-dt);coyote=Math.max(0,coyote-dt);queuedJump=Math.max(0,queuedJump-dt);
 const speedFactor=(effects.speed>0?1.65:1)*(effects.slow>0?.52:1)*(player.dizzy>0?.64:1);
 const target=(Number(vxInput.right)-Number(vxInput.left))*330*speedFactor;
 const acceleration=player.grounded?2350:1470;
 player.vx+=(target-player.vx)*Math.min(1,dt* (acceleration/330));if(Math.abs(target)<1&&Math.abs(player.vx)<4)player.vx=0;
 if(target)player.facing=target>0?1:-1;
 if(queuedJump>0&&(player.grounded||coyote>0)){player.vy=save.perk==='bounce'?-750:-710;player.grounded=false;coyote=0;queuedJump=0;sound('jump')}
 if(!vxInput.jump&&player.vy<-280)player.vy+=save.perk==='glide'?1350*dt:1850*dt;
 const previousBottom=player.y+player.h;
 player.vy=Math.min(1100,player.vy+(save.perk==='glide'?1500:1780)*dt);
 if(effects.fly>0&&vxInput.jump){player.vy=-280;player.grounded=false;coyote=0;queuedJump=0}
 if(effects.fly>0)player.y=Math.max(48,player.y);
 player.x=clamp(player.x+player.vx*dt,0,level.width-player.w);if(player.grounded&&Math.abs(player.vx)>14)player.runCycle+=Math.abs(player.vx)*dt*.073;
 player.y+=player.vy*dt;let landing=null;
 if(player.vy>=0){for(const platform of [...level.ground,...level.platforms,...level.routePlatforms]){
 if(player.x+player.w-7<platform.x||player.x+7>platform.x+platform.w)continue;
 if(previousBottom<=platform.y+10&&player.y+player.h>=platform.y){if(!landing||platform.y<landing.y)landing=platform}
 }}
 if(landing){player.y=landing.y-player.h;player.vy=0;if(!player.grounded)player.landed=true;player.grounded=true;coyote=.11}else{if(player.grounded)coyote=.11;player.grounded=false}
 if(player.y>1400){enemyShots=[];shots=[];sound('hurt');save.hearts=Math.max(0,save.hearts-1);
 if(save.hearts<=0)loseLife('Ein sehr, sehr tiefer Plumps!');else{player.x=save.checkpoint||78;player.y=320;player.vx=0;player.vy=0;player.inv=2;player.route=null;camY=0;persist();updateUI();toast('Plumps! '+hero().name+' landet auf der Würde!')}}

 const closeNpc=level.npcs[0];
 if(closeNpc&&Math.abs(player.x-closeNpc[0])<22&&!save.shown.includes('chat'+save.level)){
  save.shown.push('chat'+save.level);persist();talkWithCat();return;
 }
 for(const [k,cp] of level.checkpoints.entries()){if(player.x>cp&&save.checkpoint<cp){save.checkpoint=cp;persist();toast(k===0?'✿ Schnurrpunkt erreicht!':'✿ Letzter Schnurrpunkt erreicht!');sound('choice')}}
 for(const item of level.items){if(item.taken)continue;if(Math.abs(player.x+player.w/2-item.x)<37&&Math.abs(player.y+player.h/2-item.y)<49)collect(item)}
 for(const coin of level.coins){
  if(!coin.taken&&Math.abs(player.x+20-coin.x)<(save.perk==='magnet'?115:29)&&Math.abs(player.y+27-coin.y)<(save.perk==='magnet'?105:36))pickCoin(coin)
 }
 for(const house of level.houses){
  if(!house.used&&house.cooldown<=0&&player.y>310&&player.y<470&&Math.abs(player.x+20-house.x)<52){visitHouse(house);return}
 }
 for(const tube of level.tubes){
  if(player.tubeCooldown<=0&&tube.direction===(player.route?'out':'in')&&(!player.route||player.route===tube.route)&&Math.abs(player.x+20-tube.x)<45&&Math.abs(player.y+25-tube.y)<60){beginTube(tube);return}
 }
 if(player.route==='cloud'&&player.y>260){player.route=null;toast('☁️ PLUMPS! Zurück in die normale Welt!');}
 if(player.route==='depth'&&player.y<450){player.route=null;toast('🐛 Zurück an die Oberfläche!');}
 for(const item of level.charms){if(!item.taken&&Math.abs(player.x+player.w/2-item.x)<36&&Math.abs(player.y+player.h/2-item.y)<51)takeCharm(item)}
 if(player.route==='depth'&&level.routeHazards.some(h=>Math.abs(player.x+20-h.x)<23&&Math.abs(player.y-h.y)<100))hurt();
 const powerItem=level.powerItem;if(!powerItem.taken&&Math.abs(player.x+player.w/2-powerItem.x)<38&&Math.abs(player.y+player.h/2-powerItem.y)<51)transform(powerItem);
 for(const shot of shots){
  if(shot.homing){let target=null,distance=450;for(const e of level.enemies){if(e.dead||shot.hit.includes(e.id))continue;const d=Math.hypot(e.x-shot.x,e.y-shot.y);if(d<distance){distance=d;target={x:e.x+18,y:e.y+20}}}if(!target&&boss.active&&!boss.done)target={x:boss.x+Math.sin(clock*1.3)*60+15,y:boss.y+22};if(target){const desired=Math.atan2(target.y-shot.y,target.x-shot.x),current=Math.atan2(shot.vy,shot.vx);const delta=Math.atan2(Math.sin(desired-current),Math.cos(desired-current)),a=current+clamp(delta,-dt*5.2,dt*5.2),v=610;shot.vx=Math.cos(a)*v;shot.vy=Math.sin(a)*v}}
  shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;if(shot.gravity)shot.vy+=shot.gravity*dt;if(shot.bounce)shot.y+=Math.sin(clock*16+shot.x*.01)*2;if(shot.spin)shot.y+=Math.sin(clock*18)*2;shot.life-=dt;
  for(const e of level.enemies){if(e.dead||shot.hit.includes(e.id)||Math.abs(shot.x-(e.x+18))>20+shot.radius||Math.abs(shot.y-(e.y+24))>26+shot.radius)continue;
   if(hitEnemy(e,shot.damage,shot.x,shot.y)){shot.hit.push(e.id);shot.pierce--;if(shot.splash){for(const near of level.enemies){if(near!==e&&!near.dead&&Math.hypot(near.x-e.x,near.y-e.y)<shot.splash)hitEnemy(near,shot.damage,near.x,near.y)}burst(e.x,e.y,shot.color,32)}if(shot.pierce<=0)shot.life=0;break}
  }
  const bx=boss.x+Math.sin(clock*1.3)*60+15;
  if(shot.life>0&&isFinal(save.level)&&boss.active&&Math.abs(shot.x-bx)<43+shot.radius&&Math.abs(shot.y-(boss.y+24))<45+shot.radius){if(hitBoss(shot.damage,shot.x,shot.y))shot.life=0}
 }
 shots=shots.filter(sh=>sh.life>0&&sh.x>=0&&sh.x<level.width);
 for(const missile of enemyShots){missile.x+=missile.vx*dt;missile.y+=missile.vy*dt;missile.life-=dt;if(Math.abs(missile.x-(player.x+20))<26&&Math.abs(missile.y-(player.y+28))<32){hurt();missile.life=0}}
 enemyShots=enemyShots.filter(m=>m.life>0&&m.x>cam-200&&m.x<cam+viewW+200);
 for(const fx of particles){fx.x+=fx.vx*dt;fx.y+=fx.vy*dt;fx.vy+=210*dt;fx.life-=dt}particles=particles.filter(f=>f.life>0);
 for(const e of level.enemies){if(e.dead)continue;
  const info=ENEMY_TYPES[e.type];e.inv=Math.max(0,e.inv-dt);
  const playerDist=Math.abs(player.x-e.x);
  const chase=(e.type==='ninja'||e.type==='guardian')&&playerDist<320;
  const patrol=e.base+Math.sin(clock*info.speed*diff().enemySpeed+e.seed*2.2)*e.range;
  const delta=chase?Math.sign(player.x-e.x)*(e.type==='ninja'?180:58)*dt:0;
  e.x=clamp(patrol+delta,e.base-e.range-65,e.base+e.range+65);
  // Phantoms appear and disappear; ninjas sprint; archers attack from a distance.
  if(e.type==='ninja'&&playerDist<240)e.x+=Math.sign(player.x-e.x)*Math.min(85*dt,Math.abs(player.x-e.x)*.2);
  if((e.type==='archer'||e.type==='guardian')&&playerDist<410){
   e.attackTimer-=dt;
   if(e.attackTimer<=0){e.attackTimer=e.type==='archer'?2.25:3.4;
    const dx=player.x-e.x,dy=player.y-e.y,length=Math.max(1,Math.hypot(dx,dy));
    const v=e.type==='archer'?275:170;
    enemyShots.push({x:e.x+17,y:e.y+8,vx:dx/length*v,vy:dy/length*v,life:3.4});
    burst(e.x,e.y,info.color,6)
   }
  }
  e.y=e.route?(e.baseY+(e.type==='bird'||e.type==='bat'?Math.sin(clock*2.5+e.seed)*34:Math.sin(clock+e.seed)*6)):e.type==='jumper'?411-Math.max(0,Math.sin(clock*2.6+e.seed))*55:e.type==='witch'||e.type==='phantom'?365+Math.sin(clock*(e.type==='phantom'?3:2)+e.seed)*28:e.type==='ninja'?411-Math.max(0,Math.sin(clock*3.8+e.seed))*32:411;
  if(e.type==='titan'||e.type==='guardian')e.y=400;
  if(e.type==='witch'&&Math.abs(player.x-e.x)<390){e.attackTimer-=dt;if(e.attackTimer<=0){e.attackTimer=2.7;const dx=player.x-e.x,dy=player.y-e.y;const length=Math.max(1,Math.hypot(dx,dy));enemyShots.push({x:e.x+18,y:e.y+16,vx:dx/length*195,vy:dy/length*195,life:3});burst(e.x,e.y,'#c3abe8',5)}}
  const ey=e.y,ew=info.scale*55,eh=info.scale*70;
  if(player.x+player.w>e.x-ew*.25&&player.x<e.x+ew*.8&&player.y+player.h>ey-12&&player.y<ey+eh*.75){if(player.vy>70&&previousBottom<=ey+18){if(e.inv<=0)hitEnemy(e,1,e.x,ey);player.vy=-485;player.grounded=false}else hurt()}
 }
 if(isFinal(save.level)&&!boss.done){const bx=boss.x+Math.sin(clock*1.3)*60,bY=boss.y;
 if(player.x>level.width-475&&!boss.triggered)bossTalk();
 if(boss.active&&boss.inv<=0&&player.x+player.w>bx-20&&player.x<bx+49&&player.y+player.h>bY&&player.y<bY+51){if(player.vy>80&&previousBottom<=bY+16){hitBoss(1,bx,bY);player.vy=-575;player.grounded=false}else hurt()}}
 if(player.x>level.width-118&&player.y>180&&player.y<540){player.x=level.width-118;checkEndOfLevel()}
 cam+=(clamp(player.x-viewW*.33,0,Math.max(0,level.width-viewW))-cam)*Math.min(1,dt*5);
 camY+=(clamp(player.y-330,-850,865)-camY)*Math.min(1,dt*6);
 if(performance.now()>toastUntil)$('toast').classList.remove('show');
}
function round(x,y,w,h,r,fill,stroke,lw=2){ctx.beginPath();ctx.roundRect(x,y,w,h,Math.min(r,w/2,h/2));if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.lineWidth=lw;ctx.strokeStyle=stroke;ctx.stroke()}}
function ellipse(x,y,rx,ry,fill,rot=0){ctx.beginPath();ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill()}
function line(x,y,xx,yy,stroke,width=2){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(xx,yy);ctx.lineWidth=width;ctx.strokeStyle=stroke;ctx.stroke()}
function flower(x,y,s=1,t=0){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.rotate(t);line(0,3,0,18,'#64ad83',3);ellipse(-5,13,7,3,'#6fc494',-.4);const cols=['#fff3fc','#ffd1e5','#ffc8a7','#c9b8ff'];const color=cols[Math.floor(rand(x*3+y)*cols.length)];for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ellipse(Math.cos(a)*7,Math.sin(a)*7,6.2,8,color,a)}ellipse(0,0,4.8,4.8,'#ffcb58');ctx.restore()}
function landscapeDetails(){
 const i=actOf(level.index),t=clock,stage=level.stage;
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
 // Extra stage scenery in the retro anime worlds.
 for(let j=0;j<9;j++){
  const x=((j*313+stage*109-cam*.3)%(viewW+420)+viewW+420)%(viewW+420)-110;
  const y=170+(j%4)*49+Math.sin(t*.85+j)*15;
  if(stage===1){ctx.fillStyle=i===3?'#fff5c1':'#fce2ef';ctx.font='bold 32px serif';ctx.fillText(i===3?'⚙':'❀',x,y)}
  if(stage===2){ctx.strokeStyle=i===3?'#ffc3ea':'#fff7d6';ctx.lineWidth=5;ctx.beginPath();ctx.arc(x,y,14+j%3*4,0,Math.PI*2);ctx.stroke();ellipse(x,y,4,4,'#fff')}
 }
 ctx.restore();
}
function sky(){const a=level||CHAPTERS[0],grad=ctx.createLinearGradient(0,0,0,HEIGHT);grad.addColorStop(0,a.sky[0]);grad.addColorStop(1,a.sky[1]);ctx.fillStyle=grad;ctx.fillRect(-50,-50,viewW+100,HEIGHT+100);
 if(level.stage===1){ctx.fillStyle='#ff99dc13';ctx.fillRect(0,0,viewW,HEIGHT)}
 if(level.stage===2){ctx.fillStyle='#7f5cbf19';ctx.fillRect(0,0,viewW,HEIGHT)}
 if(a.toneVariant==='Dämmerung'){ctx.fillStyle='#5f378222';ctx.fillRect(0,0,viewW,HEIGHT)}
 if(a.toneVariant==='Morgentau'){ctx.fillStyle='#fff6bc22';ctx.fillRect(0,0,viewW,HEIGHT)}
 ctx.save();ctx.globalAlpha=.54;ellipse(viewW*.79,90,46,46,'#fff7d2');ellipse(viewW*.79-12,79,13,10,'#fffbe8');ctx.restore();
 for(let i=0;i<18;i++){const x=((i*211+rand(i+4)*90-cam*.18)%(viewW+350)+viewW+350)%(viewW+350)-140;const y=70+(i%5)*48+Math.sin(clock*.4+i)*8;drawCloud(x,y,.68+(i%3)*.17,i)}
 for(let layer=0;layer<2;layer++){const col=a.hills[layer];ctx.beginPath();ctx.moveTo(-100,HEIGHT);for(let x=-100;x<=viewW+120;x+=45){const worldX=x+cam*(layer? .27:.12);const y=325+layer*48+Math.sin(worldX*.0045+layer*.9)*26+Math.sin(worldX*.013+layer*2.4)*11;ctx.lineTo(x,y)}ctx.lineTo(viewW+120,HEIGHT);ctx.closePath();ctx.fillStyle=col;ctx.fill()}
 for(let i=0;i<13;i++){const x=((i*345+60-cam*.42)%(viewW+440)+viewW+440)%(viewW+440)-220;drawTree(x,330+(i%3)*25,i)}
 landscapeDetails();
}
function drawCloud(x,y,s,seed){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.globalAlpha=.58;ellipse(0,12,67,19,'#fff9fe');ellipse(-28,0,27,24,'#fff9fe');ellipse(4,-11,31,29,'#fff9fe');ellipse(38,0,28,23,'#fff9fe');ctx.fillStyle='#b0a5c9';ellipse(-8,7,2.3,2.5,'#baabc8');ellipse(16,7,2.3,2.5,'#baabc8');if(seed%4===0){line(-4,15,9,15,'#baabc8',2)}ctx.restore()}
function drawTree(x,y,seed){ctx.save();ctx.translate(x,y);const tint=actOf(level.index)===2?'#b9a0d5':'#9cceb7';ctx.globalAlpha=.65;round(-10,-35,20,110,9,'#9e8ba5');for(let j=0;j<3;j++){ellipse((j-1)*27,-43-(j%2)*12,46,55,tint)}for(let j=0;j<5;j++)flower((j-2)*15,-75+rand(seed*17+j)*40,.5,seed+j);ctx.restore()}
function drawGround(platform){const {x,y,w,ground}=platform;if(x+w<cam-30||x>cam+viewW+30||y<camY-160||y>camY+HEIGHT+150)return;ctx.save();ctx.translate(x-cam,y);const col=platform.moving?'#f6faff':platform.route==='cave'?'#8e82ae':platform.route==='burrow'?'#98775f':level.soil;
 round(0,0,w,ground?120:28,ground?8:12,col,platform.moving?'#bcdcec':'#775c8c',2);
 ctx.fillStyle=platform.moving?'#d5f4ff':platform.route==='cave'?'#b6a0d0':level.grass;
 round(0,-3,w,ground?18:15,8,ctx.fillStyle);
 round(0,8,w,ground?12:10,6,platform.moving?'#fcffff':'#c6e4ad');for(let k=0;k<w/67;k++){const dx=k*67+20;if(dx>w-12)break;ellipse(dx,22+(k%2)*6,3.8,2.8,'#d8b7c2');if(ground){if(k%3===0)flower(dx,-9,.45,k);else ellipse(dx,-1,3,4,'#ecf8c5')}}if(platform.helper){ctx.fillStyle='#fff2b8';for(let i=0;i<w/24;i++)ctx.fillText('✦',i*24,7)}ctx.restore()}
function drawPowerMushroom(item){if(item.taken)return;const x=item.x-cam,y=item.y+Math.sin(clock*4+item.x)*7;if(x<-50||x>viewW+50)return;const p=POWERS[item.id];ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(clock*3)*.12);ctx.shadowColor=p.color;ctx.shadowBlur=22;ellipse(0,13,12,20,'#fff9dc');ctx.beginPath();ctx.moveTo(-30,2);ctx.quadraticCurveTo(-27,-36,0,-34);ctx.quadraticCurveTo(27,-36,30,2);ctx.quadraticCurveTo(0,16,-30,2);ctx.fillStyle=p.color;ctx.fill();ctx.strokeStyle='#fff8f3';ctx.lineWidth=3;ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.font='bold 29px sans-serif';ctx.textAlign='center';ctx.fillText(p.symbol,0,-4);ctx.restore();const radius=36+Math.sin(clock*4)*5;ctx.save();ctx.strokeStyle=p.color;ctx.globalAlpha=.5;ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y-4,radius,0,Math.PI*2);ctx.stroke();ctx.restore()}
function drawEffects(){for(const shot of shots){const x=shot.x-cam,y=shot.y+Math.sin(clock*15)*3;ctx.save();ctx.shadowBlur=20;ctx.shadowColor=shot.color;ellipse(x,y,shot.radius,shot.radius,shot.color);ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.font='bold '+Math.round(shot.radius*1.35)+'px sans-serif';ctx.textAlign='center';ctx.fillText(save.character==='chicken'?'🥚':save.character==='dog'?'🔵':save.character==='rabbit'?'🌙':save.character==='fox'?'🍃':POWERS[shot.kind].symbol,x,y+6);if(shot.kind==='spark'){line(x-25,y+10,x+25,y-13,'#fff29c',4)}if(shot.kind==='moon'){ctx.strokeStyle='#f8e6ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,shot.radius+7,0,Math.PI*2);ctx.stroke()}ctx.restore()}
 for(const bullet of enemyShots){ctx.save();ctx.shadowColor='#bd81e5';ctx.shadowBlur=14;ellipse(bullet.x-cam,bullet.y,10,10,'#bb87df');ellipse(bullet.x-cam-2,bullet.y-2,3,3,'#fff');ctx.restore()}
 for(const f of particles){ctx.save();ctx.globalAlpha=clamp(f.life/f.max,0,1);ellipse(f.x-cam,f.y,f.size,f.size*.75,f.color);ctx.restore()}}
function drawCharm(item){
 if(item.taken)return;
 const data=CHARMS[item.kind],x=item.x-cam,y=item.y+Math.sin(clock*3+item.x)*8;
 if(x<-65||x>viewW+65)return;
 ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(clock*3+item.x)*.11);
 ctx.shadowColor=data.color;ctx.shadowBlur=16;round(-24,-27,48,48,13,data.bad?'#57395e':'#fff9f2',data.color,4);
 ctx.shadowBlur=0;ctx.textAlign='center';ctx.font='28px "Apple Color Emoji","Segoe UI Emoji",sans-serif';ctx.fillText(data.icon,0,7);
 if(data.bad){ctx.strokeStyle='#ffb2d0';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-30,-32);ctx.lineTo(30,23);ctx.stroke();ctx.fillStyle='#fff';ctx.font='bold 13px sans-serif';ctx.fillText('!',20,-18)}
 else {ctx.fillStyle='#fff9ab';ctx.font='bold 15px sans-serif';ctx.fillText('✦',-30,-21)}
 ctx.restore();
}
function drawStatusTimers(){
 if(!player)return;
 const active=Object.keys(effects).filter(k=>effects[k]>0);
 if(!active.length)return;
 const cx=clamp(player.x+player.w/2-cam,45,viewW-45),columns=viewW<500?2:Math.min(5,active.length);
 const rows=Math.ceil(active.length/columns),top=Math.max(camY+70+rows*26,player.y-81);
 ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';
 active.forEach((key,j)=>{const data=CHARMS[key],row=Math.floor(j/columns),col=j%columns;
 const inRow=Math.min(columns,active.length-row*columns);
 const x=cx+(col-(inRow-1)/2)*82,y=top-15-(rows-1-row)*29;
  const bx=clamp(x,43,viewW-43);
  round(bx-39,y-13,78,27,10,data.bad?'#573857e8':'#fff9e9ed',data.color,2);
  ctx.font='bold 13px Nunito,sans-serif';ctx.fillStyle=data.bad?'#fff':'#5b4779';
  ctx.fillText(data.icon+' '+effects[key].toFixed(1)+'s',bx,y+1);
 });
 ctx.restore();
}
function drawMushroom(item){const t=clock*2+item.x*.05,x=item.x-cam,y=item.y+Math.sin(t)*5;if(item.taken||x<-50||x>viewW+50)return;ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t)*.065);ellipse(0,22,24,5,'#724e9066');ellipse(0,12,10,19,'#fff3db');round(-9,6,18,18,7,'#fff4db','#cfa4a7',1.7);const color=MUSHROOMS[item.id].color;ctx.beginPath();ctx.moveTo(-25,5);ctx.quadraticCurveTo(-24,-25,0,-28);ctx.quadraticCurveTo(24,-25,25,5);ctx.quadraticCurveTo(0,15,-25,5);ctx.fillStyle=color;ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#fff5ed';ctx.stroke();ellipse(-12,-9,5,3.5,'#fff9ed',-.5);ellipse(8,-16,6,4.5,'#fff9ed',.3);ellipse(16,-3,4,3,'#fff9ed');ellipse(-4,10,1.7,2.5,'#655279');ellipse(5,10,1.7,2.5,'#655279');ctx.restore()}
function drawEnemy(e){if(e.dead)return;const type=ENEMY_TYPES[e.type],x=e.x-cam+18,y=e.y+29;
 if(x<-140||x>viewW+140)return; // Keep long levels smooth on phone GPUs.
 ctx.save();if(e.inv>0&&Math.floor(clock*23)%2===0)ctx.globalAlpha=.55;
 if(e.route){
  ctx.textAlign='center';
  if(e.type==='bird'){
   ctx.fillStyle='#e2f8ff';ellipse(x,y,23,17,'#f6faff');ellipse(x-28,y-10,27,10,'#bde6f5',Math.sin(clock*14)*.3);ellipse(x+28,y-10,27,10,'#bde6f5',-Math.sin(clock*14)*.3);
   ctx.fillStyle='#ffb76c';ctx.beginPath();ctx.moveTo(x+14,y-2);ctx.lineTo(x+32,y+4);ctx.lineTo(x+13,y+9);ctx.fill();ellipse(x-4,y-8,4,5,'#3c4764');
  }else if(e.type==='bat'){
   ellipse(x,y,18,18,'#716486');for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+side*47,y-35-Math.sin(clock*18)*13,x+side*53,y+10);ctx.lineTo(x+side*19,y+5);ctx.closePath();ctx.fillStyle='#8d7aa9';ctx.fill()}ellipse(x-6,y-2,4,5,'#eac5ed');ellipse(x+6,y-2,4,5,'#eac5ed');
  }else if(e.type==='worm'){
   ctx.strokeStyle='#d88e9b';ctx.lineWidth=27;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x-39,y+19);ctx.bezierCurveTo(x-17,y-26,x+13,y+24,x+24,y-17);ctx.stroke();ellipse(x+24,y-19,18,19,'#f1afb4');ellipse(x+20,y-23,3.8,5,'#56445f');ellipse(x+31,y-23,3.8,5,'#56445f');
  }else {ellipse(x,y,24,31,'#a78b70');ellipse(x-19,y-19,11,9,'#d3b599');ellipse(x+20,y-19,11,9,'#d3b599');ellipse(x-8,y-7,4,4,'#373346');ellipse(x+8,y-7,4,4,'#373346');ellipse(x,y+4,10,7,'#e6b0a6')}
 } else drawCat(x,y,type.scale,'shadow',Math.sin(clock*5+e.seed)*3,e.x>(player?.x??0)?-1:1);
 ctx.textAlign='center';ctx.font='bold 20px sans-serif';ctx.fillStyle=type.color;
 if(e.type==='armored'){round(x-23,y-40,46,12,6,'#a9c4dd','#e9f8ff',2);ctx.fillText('🛡',x,y-38)}
 if(e.type==='jumper')ctx.fillText('🐾',x,y-49);
 if(e.type==='witch'){ctx.fillText('✧',x-30,y-37);ctx.fillText('✧',x+26,y-42);ctx.beginPath();ctx.moveTo(x-21,y-42);ctx.lineTo(x,y-91);ctx.lineTo(x+20,y-42);ctx.closePath();ctx.fillStyle='#a98cdc';ctx.fill();round(x-28,y-47,56,9,5,'#d9c4fa')}
 if(e.type==='titan'){ctx.fillStyle='#e6acc7';ctx.font='bold 32px sans-serif';ctx.fillText('♛',x,y-65)}
 if(e.type==='ninja'){round(x-24,y-32,48,13,5,'#34344d');ctx.fillStyle='#ffc4db';ctx.fillText('✦',x+20,y-46)}
 if(e.type==='phantom'){ctx.globalAlpha=.62+.23*Math.sin(clock*6+e.seed);ctx.font='25px sans-serif';ctx.fillText('☁',x,y-51)}
 if(e.type==='archer'){ctx.font='26px sans-serif';ctx.fillText('🏹',x+20,y-27)}
 if(e.type==='guardian'){ctx.font='28px sans-serif';ctx.fillText('🛡',x,y-62);round(x-28,y-41,56,8,3,'#f5e4aa')}
 if(e.maxHp>1){const w=56,h=7,top=y-(e.type==='witch'?104:e.type==='titan'?95:75);round(x-w/2,top,w,h,3,'#513c69');round(x-w/2+2,top+1,(w-4)*e.hp/e.maxHp,h-2,3,e.hp/e.maxHp>.33?'#f9a1b8':'#ffcc73')}
 ctx.restore()}
function drawNPC([x,name,speech,kind]){if(x<cam-70||x>cam+viewW+70)return;drawCat(x-cam,407,.85,kind,Math.sin(clock*2+x)*2,1);ctx.save();ctx.font='bold 13px Nunito, sans-serif';const w=Math.min(220,ctx.measureText(name+' ♥').width+24);round(x-cam-w/2,324,w,26,12,'#fff6ec','#f3bbd5',2);ctx.fillStyle='#b16c94';ctx.textAlign='center';ctx.fillText(name+' ♥',x-cam,343);ctx.restore();if(player&&Math.abs(player.x-x)<155&&phase==='playing'&&speech){ctx.save();ctx.font='800 12px Nunito, sans-serif';const parts=wrapText(speech,215);const width=235,h=parts.length*17+15;round(clamp(x-cam-width/2,5,Math.max(5,viewW-width-5)),254-(h-32),width,h,13,'#fffaf3','#bba3be',2);ctx.textAlign='center';ctx.fillStyle='#755f7a';parts.forEach((s,k)=>ctx.fillText(s,clamp(x-cam,5+width/2,Math.max(5+width/2,viewW-5-width/2)),268-(h-32)+k*17));ctx.restore()}}
function wrapText(text,max){const words=text.split(' '),lines=[];let l='';for(const word of words){const t=l?l+' '+word:word;if(ctx.measureText(t).width>max&&l){lines.push(l);l=word}else l=t}if(l)lines.push(l);return lines}
function drawCat(x,y,s=1,kind='cream',bob=0,facing=1,motion=null){const palettes={cream:['#fff4df','#f5d7bb','#75587a'],shadow:['#6d587e','#9b81ae','#fff7ed'],lilac:['#cfb8f9','#ac8ae0','#664b79'],peach:['#ffc7b8','#f3a5aa','#725578'],rose:['#f2b0c9','#d990b8','#775072'],ginger:['#ffcf8f','#f5a878','#765271']};let [fur,trim,ink]=palettes[kind]||palettes.cream;
 const running=motion&&motion.grounded&&Math.abs(motion.vx)>28,airborne=motion&&!motion.grounded,cycle=motion?motion.runCycle:clock*4;
 const swing=running?Math.sin(cycle)*11:airborne?7:1.3*Math.sin(clock*2);
 ctx.save();ctx.translate(x,y+bob);const rank=motion?levelOf(save.power):0;ctx.scale(facing*s*(1+rank*.085),s*(1+rank*.085));
 if(motion&&effects.invincible>0){ctx.save();ctx.globalAlpha=.24+.12*Math.sin(clock*15);ellipse(0,-10,70,84,'#ffe777');ctx.restore()}
 if(motion&&effects.fly>0){for(const side of [-1,1]){ctx.save();ctx.translate(side*23,-20);ctx.rotate(side*(.38+Math.sin(clock*18)*.28));ellipse(side*26,-12,29,17,'#dcffff',side*.38);ellipse(side*38,-25,20,12,'#fff4dc',side*.38);ctx.restore()}}
 if(motion&&save.power){fur={blossom:'#ffe1f0',spark:'#fff0b6',moon:'#ebddff',starlight:'#d8fdff'}[save.power];trim=POWERS[save.power].color}
 if(running){ctx.save();ctx.globalAlpha=.28;for(let k=0;k<3;k++)ellipse(-34-k*12,17+(k%2)*7,6,3,trim);ctx.restore()}
 // Springy tail, two swinging rear paws, body bounce and floppy scarf.
 ctx.strokeStyle=fur;ctx.lineWidth=12;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(17,13);ctx.bezierCurveTo(48,-4+Math.sin(clock*9)*6,37,-30,24,-22+Math.sin(clock*7)*9);ctx.stroke();ctx.strokeStyle=trim;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(17,13);ctx.bezierCurveTo(48,-4+Math.sin(clock*9)*6,37,-30,24,-22+Math.sin(clock*7)*9);ctx.stroke();
 for(const [px,dir] of [[-12,1],[12,-1]]){ctx.save();ctx.translate(px,18);ctx.rotate((swing*dir)*.036);round(-9,0,18,19,8,fur);round(-12,13+(airborne?-6:0),23,10,5,fur,trim,1);ctx.restore()}
 ellipse(0,7,23,28,fur);ellipse(0,15,15,13,trim);
 // Arms counter-swing with the legs, pronounced when running.
 for(const [side,dir] of [[-1,1],[1,-1]]){ctx.save();ctx.translate(side*19,0);ctx.rotate(swing*dir*.027+(airborne?-.28*dir:0));ellipse(side*5,11,9,16,fur);ellipse(side*6,22,10,7,fur);ctx.restore()}
 ctx.beginPath();ctx.moveTo(-29,-14);ctx.lineTo(-26,-48+Math.sin(clock*7)*2);ctx.lineTo(-9,-34);ctx.lineTo(10,-34);ctx.lineTo(28,-48-Math.sin(clock*7)*2);ctx.lineTo(29,-13);ctx.closePath();ctx.fillStyle=fur;ctx.fill();ctx.strokeStyle=trim;ctx.lineWidth=2;ctx.stroke();ctx.beginPath();ctx.moveTo(-24,-37);ctx.lineTo(-22,-24);ctx.lineTo(-14,-31);ctx.fillStyle='#f7aab7';ctx.fill();ctx.beginPath();ctx.moveTo(23,-37);ctx.lineTo(21,-24);ctx.lineTo(13,-31);ctx.fill();
 ellipse(0,-14,29,27,fur);
 // More feline, anime-style details: forehead fur, cheek tufts, nose bridge.
 for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(side*24,-8);ctx.lineTo(side*35,-12);ctx.lineTo(side*28,0);ctx.closePath();ctx.fillStyle=fur;ctx.fill()}
 for(let j=-1;j<=1;j++){ctx.strokeStyle=trim;ctx.globalAlpha=.48;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(j*7,-39);ctx.lineTo(j*8,-31);ctx.stroke()}ctx.globalAlpha=1;
 const blink=Math.sin(clock*1.6+x*.03)>.994?2:12;ellipse(-13,-12,7,blink,ink);ellipse(13,-12,7,blink,ink);if(blink>4){ellipse(-11,-16,2.7,4,'#fff');ellipse(15,-16,2.7,4,'#fff')}ellipse(-21,-1,7,4,'#f6acb9');ellipse(21,-1,7,4,'#f6acb9');ctx.beginPath();ctx.moveTo(-5,-3);ctx.lineTo(0,1);ctx.lineTo(5,-3);ctx.closePath();ctx.fillStyle='#de8ea8';ctx.fill();ctx.strokeStyle=ink;ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(-5,2);ctx.quadraticCurveTo(0,7,0,3);ctx.quadraticCurveTo(0,7,6,2);ctx.stroke();line(-29,-1,-37,-4,ink,1.3);line(-29,4,-38,6,ink,1.3);line(29,-1,37,-4,ink,1.3);line(29,4,38,6,ink,1.3);
 ctx.fillStyle='#fff';ellipse(-18,-15,2.4,3.5,'#fff');ellipse(18,-15,2.4,3.5,'#fff');
 // Paw-print details for a stronger cat silhouette.
 if(running||airborne){ellipse(-13,36,4.5,2.5,trim);ellipse(13,36,4.5,2.5,trim)}
 if(kind==='cream'){round(-21,25,42,8,4,save.power?trim:'#f38dae');ellipse(16+Math.sin(clock*13)*3,30,7,10,'#ffd9e5')}if(kind==='shadow'){ellipse(0,-50,7,4,'#e8c1ff');ctx.font='18px sans-serif';ctx.fillText('✦',-9,-47)}
 if(motion&&save.power){const p=POWERS[save.power],t=clock;ctx.save();ctx.shadowColor=p.color;ctx.shadowBlur=14+rank*3;ctx.textAlign='center';
  if(rank===1){for(let n=0;n<5;n++){const a=t*2+n*Math.PI*2/5;flower(Math.cos(a)*42,-16+Math.sin(a)*27,.28,n)}ctx.fillStyle='#e85497';ctx.font='bold 30px sans-serif';ctx.fillText('✿',0,-48)}
  if(rank===2){ctx.strokeStyle='#ffe574';ctx.lineWidth=5;for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(side*11,-53);ctx.lineTo(side*27,-72);ctx.lineTo(side*17,-69);ctx.lineTo(side*30,-87);ctx.stroke()}ctx.fillStyle='#fff3a4';ctx.font='bold 23px sans-serif';ctx.fillText('⚡',0,-54);for(let j=0;j<3;j++)ellipse(Math.sin(t*5+j*2)*38,Math.cos(t*5+j*2)*26,3,5,'#ffe279')}
  if(rank===3){ctx.strokeStyle='#f8ebff';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,-64,30,Math.PI*1.12,Math.PI*1.88);ctx.stroke();ctx.fillStyle='#fff4dc';ctx.font='bold 34px sans-serif';ctx.fillText('☾',0,-55);for(let j=0;j<6;j++)ellipse(Math.sin(t*2+j*2)*49,-15+Math.cos(t*2+j*2)*39,2.5,4,'#dccdff')}
  if(rank===4){for(const side of [-1,1]){ctx.save();ctx.translate(side*25,-2);ctx.rotate(side*(.35+Math.sin(t*6)*.15));for(let k=0;k<3;k++)ellipse(side*(12+k*7),-15-k*6,12,23,'#b5f9fb',side*.3);ctx.restore()}ctx.fillStyle='#fff0ac';ctx.beginPath();ctx.moveTo(-25,-51);ctx.lineTo(-22,-82);ctx.lineTo(-10,-66);ctx.lineTo(0,-91);ctx.lineTo(10,-66);ctx.lineTo(22,-82);ctx.lineTo(25,-51);ctx.closePath();ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#61cfd5';ctx.font='bold 22px sans-serif';ctx.fillText('✦',0,-55);for(let j=0;j<8;j++){const a=t*1.8+j*Math.PI/4;ellipse(Math.cos(a)*59,-10+Math.sin(a)*50,2.5,4,'#fffac5')}}
  ctx.restore()}

 ctx.restore()}
function drawGate(){const x=level.width-100-cam;if(x< -120||x>viewW+120)return;ctx.save();ctx.translate(x,405);const grd=ctx.createLinearGradient(-30,-80,30,10);grd.addColorStop(0,'#fff7cc');grd.addColorStop(1,'#f5a1d3');round(-39,-78,78,90,32,grd,'#fff4e3',5);round(-23,-63,46,69,20,'#af97d9','#fff5e3',3);ctx.font='32px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff4be';ctx.fillText('✦',0,-19);ctx.fillStyle='#fff5e9';ctx.font='bold 13px Fredoka';ctx.fillText(isFinal(save.level)?'FINALE':'ZIEL',0,-89);ctx.restore()}
function drawParticles(){ctx.save();for(let i=0;i<38;i++){const x=((i*113+rand(i)*220-cam*.38+Math.sin(clock+i)*17)%(viewW+90)+viewW+90)%(viewW+90)-30;const y=((i*71+clock*(10+i%4*4))%470);ellipse(x,y,3+(i%3),2.2,['#ffe5f8','#fff7bf','#ffd0df'][i%3],clock*.5+i)}ctx.restore()}
function drawCoin(coin){
 if(coin.taken||coin.x<cam-50||coin.x>cam+viewW+50||coin.y<camY-40||coin.y>camY+HEIGHT+40)return;
 const x=coin.x-cam,y=coin.y,face=.45+.55*Math.abs(Math.cos(clock*5+coin.x*.01));
 const colors={bronze:['#d89b66','#87564c'],silver:['#e1f5ff','#89b6c9'],gold:['#ffe887','#db9d3e']},c=colors[coin.type];
 ctx.save();ctx.shadowColor=c[0];ctx.shadowBlur=8;ellipse(x,y,13*face,14,c[1]);ellipse(x,y,10*face,11,c[0]);ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillStyle=c[1];ctx.fillText(coin.type==='gold'?'20':coin.type==='silver'?'5':'1',x,y+4);ctx.restore();
}
function drawHouses(){
 for(const h of level.houses){if(h.x<cam-105||h.x>cam+viewW+110)continue;const x=h.x-cam;
 ctx.save();round(x-43,360,86,89,14,'#fff1d9','#b785aa',3);
 ctx.beginPath();ctx.moveTo(x-53,360);ctx.lineTo(x,314);ctx.lineTo(x+53,360);ctx.closePath();ctx.fillStyle=h.used?'#beaec3':'#f0a2c4';ctx.fill();ctx.strokeStyle='#fff8e5';ctx.lineWidth=4;ctx.stroke();
 round(x-15,393,30,56,8,'#ad7cb1','#fff7e2',2);
 ctx.font='25px sans-serif';ctx.textAlign='center';ctx.fillText(h.used?'🔒':'🎲',x,360);ctx.font='bold 13px sans-serif';ctx.fillStyle='#633e73';ctx.fillText(h.used?'BESUCHT':'10 🪙',x,385);
 ctx.restore();}
}
function drawTube(tube){
 const x=tube.x-cam,y=tube.y;if(x<-110||x>viewW+110)return;
 const angle=Math.sin(clock*2.5+tube.x*.005)*15;
 ctx.save();ctx.lineCap='round';
 ctx.lineWidth=57;ctx.strokeStyle='#806eab';ctx.beginPath();
 ctx.moveTo(x+angle*.5,y-168);ctx.bezierCurveTo(x+52+angle,y-124,x-49+angle*.5,y-75,x,y);ctx.stroke();
 ctx.lineWidth=43;ctx.strokeStyle='#b7e1cd';ctx.stroke();
 ctx.lineWidth=21;ctx.strokeStyle='#f0ffe9';ctx.stroke();
 for(let j=0;j<4;j++){const t=j/4;ellipse(x+Math.sin(t*Math.PI*3+clock*2)*11,y-28-j*36,8,5,'#fffaf0')}
 ellipse(x,y,40+Math.sin(clock*8)*4,29,'#6c4d87');
 ellipse(x,y-2,29,20,'#33284c');ellipse(x-11,y-8,5,3,'#fff');
 ctx.font='bold 18px sans-serif';ctx.fillStyle='#fff9e5';ctx.textAlign='center';ctx.fillText(tube.direction==='in'?'⇣':'⇡',x,y+5);
 ctx.restore();
}
function drawVerticalWorld(){
 for(const route of level.routes){
  const {from,end,kind}=route;
  if(end<cam-80||from>cam+viewW+80)continue;
  const x=from-cam,w=end-from;
  ctx.save();
  if(kind==='cloud'){
   const g=ctx.createLinearGradient(0,-770,0,-130);g.addColorStop(0,'#788ee5');g.addColorStop(1,'#e3f9ff');
   round(x,-740,w,700,30,g,'#f8ffff88',4);
   for(let j=0;j<12;j++){const xx=x+110+j*83,yy=-700+j%4*85;ellipse(xx,yy,57,23,'#ffffff88');ellipse(xx-20,yy-16,28,24,'#ffffffbb')}
   ctx.font='bold 29px sans-serif';ctx.fillStyle='#fefaff';ctx.fillText('☁️ DIE WOLKENPFOTEN',x+85,-660);
  }else{
   const bg=kind==='cave'?'#514460':'#755644';
   round(x,625,w,625,24,bg,kind==='cave'?'#ac93d5':'#b78f65',4);
   for(let j=0;j<20;j++){const xx=x+j*72,top=665+j%4*15,deep=65+Math.abs(Math.sin(j*12))*90;
    ctx.beginPath();ctx.moveTo(xx-23,top);ctx.lineTo(xx,top+deep);ctx.lineTo(xx+27,top);ctx.closePath();ctx.fillStyle=kind==='cave'?'#9c8bb8':'#af8c66';ctx.fill();
    if(kind==='burrow'){ellipse(xx+18,1045,26,9,'#caa577');ctx.font='15px sans-serif';ctx.fillText('🪱',xx,1085)}
    else {ctx.shadowBlur=8;ctx.shadowColor='#ddc8ff';ellipse(xx+26,995,7,13,'#bdaaf1');ctx.shadowBlur=0}
   }
   ctx.fillStyle='#fff2d0';ctx.font='bold 27px sans-serif';ctx.fillText(kind==='cave'?'🦇 TROPFSTEIN-HÖHLE':'🪱 MAULWURF-TUNNEL',x+60,720);
  }
  ctx.restore();
 }
 for(const spike of level.routeHazards){
  if(spike.x<cam-30||spike.x>cam+viewW+40)continue;
  const x=spike.x-cam;
  ctx.beginPath();ctx.moveTo(x-23,690);ctx.lineTo(x,spike.y+76);ctx.lineTo(x+23,690);ctx.closePath();ctx.fillStyle='#dfc0f7';ctx.fill();
 }
}
function drawOutfit(x,y){
 if(!save.outfit||!player)return;
 const theta=player.dizzy>0?Math.sin(clock*21)*.28:0;
 ctx.save();ctx.translate(x,y-66);ctx.rotate(theta);ctx.textAlign='center';
 if(save.outfit==='mouse'){
  round(-23,-47,46,33,5,'#313044','#ffe4b5',3);round(-35,-18,70,10,5,'#313044','#ffe4b5',2);
  if(Math.sin(clock*2.5)>.3){ctx.font='28px sans-serif';ctx.fillText('🐭',0,-43)}
 }else if(save.outfit==='clown'){ctx.font='37px sans-serif';ctx.fillText('🤡',0,-10);ctx.fillText('🌼',25,-35)}
 else{ctx.font='35px sans-serif';ctx.fillText({armor:'🛡️',chef:'👨‍🍳',crown:'👑',bow:'🎀'}[save.outfit]||'🎩',0,-20)}
 ctx.restore();
}
function drawHero(x,y,bob){
 if(save.character==='cat'){drawCat(x,y,1,'cream',bob,player.facing,player)}
 else {
  const type=save.character,dir=player.facing,run=player.grounded&&Math.abs(player.vx)>25;
  const stride=run?Math.sin(player.runCycle)*10:2*Math.sin(clock*2);
  const fur=save.power?POWERS[save.power].color:{dog:'#e9bb8d',chicken:'#ffedcc',rabbit:'#e2d4f6',fox:'#eaa16f'}[type];
  ctx.save();ctx.translate(x,y+bob);ctx.scale(dir*(1+levelOf(save.power)*.08),1+levelOf(save.power)*.08);
  if(effects.fly>0){for(const side of [-1,1]){ctx.save();ctx.translate(side*20,-18);ctx.rotate(side*Math.sin(clock*17)*.35);ellipse(side*30,0,34,13,'#e5ffff');ctx.restore()}}
  // Distinct animal silhouettes; all use identical collision and damage balance.
  if(type==='fox'){ctx.beginPath();ctx.moveTo(14,10);ctx.quadraticCurveTo(74,24,57,-18);ctx.lineTo(23,-5);ctx.closePath();ctx.fillStyle='#efae73';ctx.fill();ellipse(58,-16,10,6,'#fff5df')}
  for(const side of [-1,1]){ctx.save();ctx.translate(side*12,20);ctx.rotate(side*stride*.04);ellipse(0,8,10,17,fur);ctx.restore()}
  ellipse(0,7,type==='chicken'?25:24,29,fur);
  if(type==='chicken'){ellipse(-17,4,13,17,'#fff8eb');ellipse(17,4,13,17,'#fff8eb')}
  if(type==='rabbit'){for(const side of [-1,1]){ellipse(side*14,-57,11,34,fur,side*.16);ellipse(side*14,-57,5,24,'#eea1c8',side*.16)}}
  if(type==='dog'){for(const side of [-1,1]){ellipse(side*30,-21,13,29,'#b68266',side*.4)}}
  if(type==='fox'){for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(side*29,-24);ctx.lineTo(side*26,-57);ctx.lineTo(side*5,-35);ctx.closePath();ctx.fillStyle=fur;ctx.fill()}}
  ellipse(0,-17,type==='chicken'?23:28,25,fur);
  if(type==='chicken'){for(let j=-1;j<=1;j++)ellipse(j*10,-45-j%2*6,8,15,'#f07c89');ctx.beginPath();ctx.moveTo(4,-12);ctx.lineTo(23,-6);ctx.lineTo(5,-1);ctx.closePath();ctx.fillStyle='#ffa43f';ctx.fill()}
  if(type==='dog')ellipse(0,-1,17,10,'#fff3dc');
  if(type==='rabbit')ellipse(0,-5,15,10,'#fff5f6');
  ellipse(-12,-20,5,10,'#4c3b61');ellipse(12,-20,5,10,'#4c3b61');
  ellipse(-10,-24,2,3,'#fff');ellipse(14,-24,2,3,'#fff');
  ellipse(0,-7,4,3,type==='chicken'?'#e68849':'#9a607d');
  ellipse(-21,-8,6,4,'#f2a7b0');ellipse(21,-8,6,4,'#f2a7b0');
  ctx.restore();
 }
 if(save.outfit)drawOutfit(x,y);
 if(transport){ctx.save();ctx.globalAlpha=.35;ellipse(x,y-10,39,48,'#d5c7ff');ctx.restore()}
}
function drawWorld(){if(!level)return;ctx.save();ctx.setTransform(canvas.width/viewW,0,0,canvas.height/HEIGHT,0,0);
 if(effects.sway>0||effects.dizzy>0){ctx.translate(Math.sin(clock*12)*13,Math.cos(clock*8)*6);ctx.rotate(Math.sin(clock*5)*.009)}
 sky();drawParticles();ctx.save();ctx.translate(0,-camY);drawVerticalWorld();
 for(const p of [...level.ground,...level.platforms,...level.routePlatforms])drawGround(p);
 for(let j=0;j<level.width/100;j++){const x=j*101+22;if(x<cam-20||x>cam+viewW+25)continue;const grounded=level.ground.some(p=>x>=p.x+9&&x<p.x+p.w-9);if(grounded){flower(x-cam,441,.56+rand(j*5+1)*.5,j);if(j%4===0)flower(x-cam+25,448,.37,j*2)}}
 for(const p of level.checkpoints){const x=p-cam;if(x<-30||x>viewW+30)continue;line(x,450,x,373,'#a5819d',5);ctx.font='29px sans-serif';ctx.fillText(save.checkpoint>=p?'💗':'🌼',x-16,375)}
 for(const item of level.items)drawMushroom(item);drawPowerMushroom(level.powerItem);for(const charm of level.charms)drawCharm(charm);for(const coin of level.coins)drawCoin(coin);drawHouses();for(const tube of level.tubes)drawTube(tube);
 level.npcs.forEach(drawNPC);
 for(const e of level.enemies)drawEnemy(e);
 drawGate();
 if(isFinal(level.index)&&boss&&!boss.done&&boss.triggered){const x=boss.x+Math.sin(clock*1.3)*60-cam;drawCat(x+13,432,1.17,'shadow',Math.sin(clock*3)*2,-1);if(boss.active){ctx.font='25px Nunito';ctx.fillStyle='#fff';ctx.fillText('👑 SPIEGEL-MOMO',x-30,323);round(x-33,340,108,10,5,'#463353');round(x-31,342,104*boss.hp/boss.maxHp,6,3,'#fb98b5')}}
 if(player&&(player.inv<=0||Math.floor(clock*14)%2===0)){const run=player.grounded&&Math.abs(player.vx)>30;const bob=run?Math.abs(Math.sin(player.runCycle))*4:Math.sin(clock*3)*1.5;drawHero(player.x+player.w/2-cam,player.y+player.h*.54,bob)}
 drawEffects();drawStatusTimers();ctx.restore();
 if(powerFlash>0){ctx.save();ctx.globalAlpha=powerFlash*.14;ctx.fillStyle=POWERS[save.power]?.color||'#fff';ctx.fillRect(0,0,viewW,HEIGHT);ctx.restore()}
 ctx.restore()}
function frame(now){try{if(!lastFrame)lastFrame=now;const elapsed=Math.min(.14,Math.max(0,(now-lastFrame)/1000));lastFrame=now;if(level){let remaining=elapsed;while(remaining>0.00001){const step=Math.min(1/60,remaining);simulate(step);remaining-=step}drawWorld()}else {level=makeLevel(0);drawWorld()}musicTick();if(performance.now()>toastUntil)$('toast').classList.remove('show')}catch(err){console.error('Katzigami frame:',err)}requestAnimationFrame(frame)}
function bindControl(id,key){const el=$(id),pointers=new Set();const release=e=>{pointers.delete(e.pointerId);if(!pointers.size){vxInput[key]=false;el.classList.remove('pressed')}};
 el.addEventListener('pointerdown',e=>{e.preventDefault();if(phase!=='playing')return;try{el.setPointerCapture(e.pointerId)}catch{}pointers.add(e.pointerId);vxInput[key]=true;el.classList.add('pressed');if(key==='jump')jump();if(audioCtx?.state==='suspended')audioCtx.resume()});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(event,release);
 window.addEventListener('blur',()=>{pointers.clear();vxInput[key]=false;el.classList.remove('pressed')});}
function setup(){bindControl('left','left');bindControl('right','right');bindControl('jump','jump');
 const special=$('special');special.addEventListener('pointerdown',e=>{e.preventDefault();if(phase!=='playing'||!save.power||effects.silence>0)return;try{special.setPointerCapture(e.pointerId)}catch{}special.classList.add('pressed');castSpecial()});for(const ev of ['pointerup','pointercancel','lostpointercapture'])special.addEventListener(ev,()=>special.classList.remove('pressed'));window.addEventListener('blur',()=>special.classList.remove('pressed'));
 const keyMap={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'jump',ArrowUp:'jump',KeyW:'jump',KeyX:'special',KeyJ:'special'};
 window.addEventListener('keydown',e=>{if(e.target instanceof HTMLElement&&e.target.closest('textarea,input'))return;if(keyMap[e.code]){e.preventDefault();if(phase==='playing'){if(keyMap[e.code]==='special'){if(!e.repeat)castSpecial()}else{if(!vxInput[keyMap[e.code]]&&keyMap[e.code]==='jump')jump();vxInput[keyMap[e.code]]=true}}}if(e.code==='Escape'){e.preventDefault();pause()}if(e.code==='Enter'&&phase==='dialogue'){const b=overlayContent.querySelector('button');if(b)b.click()}});
 window.addEventListener('keyup',e=>{if(keyMap[e.code]){e.preventDefault();vxInput[keyMap[e.code]]=false}});
 $('pause-toggle').addEventListener('click',pause);$('sound-toggle').addEventListener('click',()=>{audioMuted=!audioMuted;save.mute=audioMuted;persist();updateUI();resetMusic();if(!audioMuted)sound('choice')});
 window.addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInputs();if(phase==='playing')pause()}});
 stage.addEventListener('contextmenu',e=>e.preventDefault());resize();updateUI();menu();requestAnimationFrame(frame);
 // A narrow, opt-in interface for automated browser regression tests; not active in normal play.
 if(new URLSearchParams(location.search).has('test'))window.__katzigamiTest={
  mystery:()=>mystery().name,seed:()=>save.seed,
  newCampaign:()=>{save=defaultSave();persist();enterLevel(0,false)},
  chat:(text,name='Pip')=>applyConversation(name,text),
  engage:()=>talkWithCat(),
  relations:()=>({...save.relations}),
  snapshot:()=>({phase,level:save.level,width:level.width,act:actOf(save.level),stage:level.stage,effects:{...effects},charms:level.charms.map(c=>({id:c.id,kind:c.kind,x:c.x,y:c.y,taken:c.taken})),player:player&&{x:player.x,y:player.y,vx:player.vx,vy:player.vy,grounded:player.grounded},collected:[...save.collected],power:save.power,shots:shots.length,hearts:save.hearts,checkpoint:save.checkpoint,flags:{...save.flags},shown:[...save.shown],boss:boss&&{...boss},ending:save.ending,winner:save.won,enemies:level.enemies.map(e=>({id:e.id,type:e.type,x:e.x,y:e.y,hp:e.hp,maxHp:e.maxHp,dead:e.dead})),enemyShots:enemyShots.length}),
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
  isolateEnemy:(id,x=540)=>{const e=level.enemies.find(e=>e.id===id);if(!e)return false;for(const other of level.enemies)if(other!==e)other.dead=true;e.base=x;e.x=x;e.range=0;e.y=411;e.hp=1;e.maxHp=1;e.inv=0;return true},
  damageEnemy:(id,damage=1)=>{const e=level.enemies.find(e=>e.id===id);return e?hitEnemy(e,damage,e.x,e.y):false},
  damageBoss:(damage=1)=>hitBoss(damage,boss.x,boss.y),
  giveCharm:(kind)=>{if(!CHARMS[kind])return false;takeCharm({kind,x:player.x+20,y:player.y+20,taken:false});return true},
  givePower:(name)=>{if(!POWERS[name])return false;transform({id:name,x:player.x+20,y:player.y+20,taken:false});return true},
  clearSave:()=>localStorage.removeItem(SAVE_KEY)
 };
}
setup();
if('serviceWorker' in navigator && location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();