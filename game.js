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
 {name:'Das verlorene Morgen',clue:'Auf den Wachkatern glänzt Nox’ Uhrensiegel.',cause:'Nox versiegelte die Herzuhr mit der Angst des Spiegelkätzchens.',ending:'Die sieben Glocken schlagen wieder und ein neuer Morgen erwacht.'},
 {name:'Der gefälschte Befehl',clue:'Pips königlicher Brief trägt unsichtbare Tinte des Uhrmeisters Nox.',cause:'Nox täuschte Pip, der die Königin zu Unrecht beschuldigte.',ending:'Pip lernt, Beweise zu prüfen, bevor er neue Gerüchte verbreitet.'},
 {name:'Die sieben Sporen',clue:'In den Pilzsporen steckt eine Karte zu den sieben Zeitglocken.',cause:'Die Orakelpilze können die versiegelten Zeitglocken wieder stimmen.',ending:'Sieben Glocken erklingen wie ein neues Lied und erwecken die Blüten.'},
 {name:'Die verschwundenen Farben',clue:'Im Schloss ist ein Versteck voller sicher verwahrter Blütenfarben.',cause:'Dahlia bewahrte die Farben vor Nox, verdunkelte damit aber selbst den Garten.',ending:'Dahlia gibt die bewahrten Farben frei und übernimmt Verantwortung.'},
 {name:'Der Spiegel der Angst',clue:'Eine kleine Schattenkatze trägt eine Nachricht aus der Zukunft.',cause:'Zukunfts-Momo wollte aus Verlustangst die Zeit festhalten. Nox nutzte sie aus.',ending:'Spiegel-Momo kann endlich einem neuen Tag begegnen.'}
];
const STORY_ARCS=[
 {title:'DAS ERSTE VERBLASSEN',place:'Das Blütenreich',portrait:'🌸 🐱 🕰️',beat:'Die Herzuhr ist stehen geblieben und die Blumen verlieren ihre Farben. Nox’ Schattenwächter besetzen die Straßen. Nur sieben Orakelpilze können die Zeitglocken wieder stimmen.'},
 {title:'STIMMEN UNTER DEN WURZELN',place:'Flüsterwald und Höhlen',portrait:'🌲 🐈 🕯️',beat:'Die Wurzeln verraten: Die Wachkatzen gehorchen Nox, dem verstoßenen Uhrmeister. Pip erhielt gefälschte Befehle. Wer die Wahrheit finden will, muss durch die unterirdischen Tunnel.'},
 {title:'DIE VERBOTENE SANDUHR',place:'Zuckermond und Wolken',portrait:'🌙 👑 ⌛',beat:'Dahlia gesteht, dass sie die Farben versteckt hat, bevor Nox sie stehlen konnte. Ihr Schutzzauber hat den Garten mit verdunkelt. Sie ist nicht böse, hat aber großen Schaden angerichtet.'},
 {title:'DAS GESTOHLENE MORGEN',place:'Sternenreich und Spiegel',portrait:'🌌 🪞 🐈‍⬛',beat:'Ein verängstigtes Zukunfts-Ich wollte den schönsten Tag festhalten. Nox manipulierte die Schattenkatze und versiegelte damit die Herzuhr. Du kannst den Bann im Kampf lösen oder versuchen, die gefangene Katze zu retten.'}
];
function openingForHero(){
 const details={cat:'das Mondglöckchen ihres verschwundenen Vaters',dog:'die Uhr seiner verschollenen Schwester',chicken:'ein Ei, das rückwärts zu ticken beginnt',rabbit:'ein Foto, aus dem alle Katzen verschwinden',fox:'einen Brief seiner früheren Mentorin'};
 return hero().name+' will eigentlich nur zum Blütenfest. Doch als die Herzuhr mitten am Tag verstummt, beginnt '+details[save.character]+' zu leuchten. Eine Warnung erscheint: »Wenn die siebte Glocke schweigt, gibt es kein Morgen mehr.«';
}

const STORY_ECHOES=[
 ['Pip: »Ein Pilz zeigt nach Norden, die anderen nach Nox’ Schloss.«','Miso: »Die Schattenkatzen bewachen keine Schätze. Sie bewachen die Wahrheit.«','Ein Uhrensplitter trägt die Gravur: „Keine Zukunft gehört einem Einzigen.“','Ein Wachkater flüstert: »Wir folgen nur den Briefen des Uhrmeisters.«','Eine Glocke erklingt. Nox hört sie – und schickt Verstärkung.'],
 ['In der Wurzelwand steckt das zweite Stück von Pips gefälschtem Befehl.','Ein Riesenwurm zeigt auf einen Geheimgang unter dem Schloss.','Miso: »Nox hat die Tunnel verschließen lassen. Wovor hat er Angst?«','Eine Fledermaus singt eine Melodie, die nur Zeitpilze verstehen.','Im Moos liegt Dahlias Siegel – sie war hier, bevor alles verblasste.'],
 ['Pip: »Die Königin hatte Angst. Vielleicht hatte ich vorschnell geurteilt.«','Dahlia: »Ich habe gerettet, was ich konnte. Das reicht vielleicht nicht.«','Ein Kristall zeigt einen fremden Garten voller ungespielter Morgen.','Die Wolken flüstern, dass Nox nicht alle Erinnerungen löschen konnte.','Eine Sanduhr zerbricht. Darin steckt ein Brief aus der Zukunft.'],
 ['Nox: »Was ist ein Königreich wert, dessen Zukunft niemand kontrolliert?«','Spiegel-Momo: »Manchmal wünsche ich mir, ich hätte einfach Abschied genommen.«','Dahlia: »Du kannst Zeit nicht besitzen. Du kannst nur in ihr leben.«','Ein letzter Uhrzeiger dreht sich, obwohl die Herzuhr stillsteht.','Die siebte Glocke bebt. Hinter dem Spiegel wartet die Entscheidung.']
];
function discoverStoryEcho(){
 if(!player||!level||phase!=='playing')return;
 const id='echo'+save.level;
 if(player.x<level.width*.43||save.shown.includes(id))return;
 save.shown.push(id);persist();
 const line=STORY_ECHOES[actOf(save.level)]?.[level.stage];
 if(line){toast('📜 '+line);sound('choice')}
}
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
const COSTUMES={clown:'Clownhut mit Zauberblume',mouse:'Zylinder mit neugieriger Maus',armor:'Prunkrüstung',chef:'Festtags-Kochhaube',crown:'Sternenkrone',bow:'Flatternde Festschleife'};
const COSTUME_STYLE={
 cat:{clown:'Schnurrbart-Clownhut',mouse:'Mäusezylinder mit Münztrick',armor:'Mondpfoten-Panzer',chef:'Thunfisch-Kochmütze',crown:'Samtpfoten-Diadem',bow:'Kirschblüten-Schleife'},
 dog:{clown:'Wackelohr-Blumenhut',mouse:'Knochenzauber-Zylinder',armor:'Knochenritter-Harnisch',chef:'Keksbäcker-Haube',crown:'Spürnasen-Krone',bow:'Schwanzwedel-Halstuch'},
 chicken:{clown:'Kicher-Kammhut',mouse:'Kükenzauber-Zylinder',armor:'Eierwächter-Rüstung',chef:'Eierkoch-Haube',crown:'Sonnenkamm-Krone',bow:'Festliches Federcape'},
 rabbit:{clown:'Wackelohren-Blume',mouse:'Traumhasen-Zylinder',armor:'Mondhasen-Panzer',chef:'Karottenkoch-Haube',crown:'Traumohren-Krone',bow:'Sternenohren-Schleife'},
 fox:{clown:'Fuchsschalk-Blumenhut',mouse:'Fuchstrick-Zylinder',armor:'Waldwächter-Rüstung',chef:'Waldküchen-Haube',crown:'Herbstlaub-Krone',bow:'Flatternder Blätterkragen'}
};
const OUTFIT_PALETTES={
 cat:['#efb2d1','#926eae','#ffe2a1'],dog:['#93c7e6','#537ea9','#fff1c9'],
 chicken:['#f6bd71','#ce755e','#fff0b1'],rabbit:['#c8aae9','#8b73bd','#f9e4ff'],
 fox:['#dfab79','#9b665f','#fff0be']
};
const prizeName=(id)=>COSTUME_STYLE[save.character]?.[id]||COSTUMES[id]||id;

const SMALL_PERKS={glide:'Leichtes Gleiten',bounce:'Etwas höher springen',magnet:'Münzenmagnet',rapid:'Zauber etwas schneller' };
const diff=()=>DIFFICULTY[save.difficulty]||DIFFICULTY.medium;
const hero=()=>HEROES[save.character]||HEROES.cat;
function seeded(seed,salt){let n=(seed^Math.imul(salt+17,0x9e3779b1))>>>0;n^=n>>>16;n=Math.imul(n,0x7feb352d);n^=n>>>15;n=Math.imul(n,0x846ca68b);return((n^(n>>>16))>>>0)/4294967296}
function campaignSeed(){try{const r=new Uint32Array(1);crypto.getRandomValues(r);return r[0]||1}catch{return(Date.now()>>>0)||1}}
const mystery=()=>MYSTERIES[(save.seed||1)%MYSTERIES.length];
const campaignVar=(salt)=>seeded(save.seed||1,salt);
const personality=(index)=>CAT_PERSONALITIES[Math.floor(campaignVar(index+101)*CAT_PERSONALITIES.length)];
const FRIEND_ROSTER={
 Pip:{coat:'peach',icon:'📮',hint:'Auf dem Rücken von Nox’ Briefen steht ein zweites, verborgenes Siegel.',secret:'Pips Briefsiegel zeigt den versteckten Ausgang bei der zweiten Glocke.'},
 Yuki:{coat:'lilac',icon:'🍃',hint:'Unter Moos versteckt sich eine alte Brücke, die nur von der anderen Seite sichtbar ist.',secret:'Yuki kennt die geheime alte Wurzelbrücke und führt zu zusätzlichen Münzen.'},
 Miso:{coat:'ginger',icon:'🧭',hint:'Die Wachkatzen wechseln ihre Schicht immer nach dem dritten Uhrenschlag.',secret:'Miso hat die Patrouille ausspioniert: Die besten Münzen liegen unter der Wachplattform.'},
 Tavi:{coat:'rose',icon:'🔧',hint:'Nox’ Uhrwerkräder haben eine blinde Stelle. Dort kommt man sicher vorbei.',secret:'Tavi hat den Zahnkranz markiert und eine verborgene Münzspur entdeckt.'},
 Dahlia:{coat:'rose',icon:'👑',hint:'Ich hatte gute Gründe, die Blütenfarben zu verstecken, aber nicht das Recht, allen die Wahrheit zu verschweigen.',secret:'Dahlia verrät den Schlüssel zur versteckten Kronenkammer.'}
};
const FRIEND_SCHEDULE=['Pip','Yuki','Miso','Yuki','Pip','Miso','Yuki','Tavi','Pip','Miso','Dahlia','Yuki','Miso','Tavi','Yuki','Pip','Miso','Tavi','Yuki','Miso'];
const INJURY_LEVELS={6:'Yuki',12:'Miso',17:'Tavi'};
const HEAL_COST=150;
function friendState(name){if(!save.friends)save.friends={};return save.friends[name]||(save.friends[name]={trust:0,healed:false,injured:false,meetings:0,secrets:0})}
const defaultSave=()=>({version:1,campaignV3:true,campaignV4:true,character:'cat',difficulty:'medium',lives:5,coins:0,coinTaken:[],rolledHouses:[],costumes:[],perk:null,seed:campaignSeed(),level:0,collected:[],hearts:3,checkpoint:0,flags:{},shown:[],won:false,ending:'',deaths:0,mute:false,power:null,relations:{},answers:[],encounters:0,friends:{},friendEncounters:[]});
function loadSave(){try{const raw=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(!raw||raw.version!==1||!Array.isArray(raw.collected)||!Number.isInteger(raw.level))return defaultSave();return {...defaultSave(),...raw,flags:raw.flags&&typeof raw.flags==='object'?raw.flags:{},collected:raw.collected.filter(x=>Object.hasOwn(MUSHROOMS,x)),shown:Array.isArray(raw.shown)?raw.shown:[],level:Math.max(0,Math.min(CHAPTERS.length-1,raw.campaignV4?raw.level:(raw.campaignV3?Math.floor(raw.level/3)*5+raw.level%3:raw.level*5))),campaignV3:true,campaignV4:true,
 character:Object.hasOwn(HEROES,raw.character)?raw.character:'cat',difficulty:Object.hasOwn(DIFFICULTY,raw.difficulty)?raw.difficulty:'medium',
 lives:Number.isInteger(raw.lives)?clamp(raw.lives,0,99):5,coins:Number.isInteger(raw.coins)?clamp(raw.coins,0,999999):0,
 coinTaken:Array.isArray(raw.coinTaken)?raw.coinTaken:[],rolledHouses:Array.isArray(raw.rolledHouses)?raw.rolledHouses:[],costumes:Array.isArray(raw.costumes)?raw.costumes.filter(x=>Object.hasOwn(COSTUMES,x)):[],perk:Object.hasOwn(SMALL_PERKS,raw.perk)?raw.perk:null,
 hearts:Math.max(1,Math.min(5,Number(raw.hearts)||3)),power:Object.hasOwn(POWERS,raw.power)?raw.power:null,seed:Number.isInteger(raw.seed)?raw.seed:campaignSeed(),relations:raw.relations&&typeof raw.relations==='object'?raw.relations:{},answers:Array.isArray(raw.answers)?raw.answers.slice(-16):[],encounters:Number(raw.encounters)||0,friends:raw.friends&&typeof raw.friends==='object'?raw.friends:{},friendEncounters:Array.isArray(raw.friendEncounters)?raw.friendEncounters:[]}}catch{return defaultSave()}}
let save=loadSave(),level=null,player=null,phase='menu',vxInput={left:false,right:false,jump:false},clock=0,viewW=960,cam=0,camY=0,toastUntil=0,lastFrame=0,ambience=0,boss=null,queuedJump=0,coyote=0,audioCtx=null,audioMuted=!!save.mute,musicAt=0,musicStep=0,particles=[],shots=[],enemyShots=[],specialCooldown=0,powerFlash=0,effects={},transport=null,companion=null;
const rand=(x)=>{let v=Math.sin(x*127.1+18.27)*43758.5453;return v-Math.floor(v)};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(save))}catch{/* localStorage may be disabled; current session still works */}}

// Separate, explicitly named bookmarks; autosave remains unchanged.
const SLOT_KEY='katzigami-named-saves-v1',SLOT_LIMIT=8;
function namedSlots(){
 try{const a=JSON.parse(localStorage.getItem(SLOT_KEY)||'[]');return Array.isArray(a)?a.filter(v=>v&&typeof v.name==='string'&&v.state?.version===1).slice(0,SLOT_LIMIT):[]}catch{return []}
}
function storeSlots(slots){try{localStorage.setItem(SLOT_KEY,JSON.stringify(slots));return true}catch{return false}}
function snapshotForSlot(name){
 const copy=JSON.parse(JSON.stringify(save));
 copy.manualCompanion=companion?{name:companion.name,remaining:companion.remaining,x:companion.x,y:companion.y}:null;
 copy.manualPosition=(player&&level&&phase!=='menu')?{level:save.level,x:clamp(player.x,0,level.width-65),y:player.y,route:player.route||null}:null;
 return {name:name.trim().slice(0,44),timestamp:Date.now(),level:save.level,hero:save.character,coins:save.coins,state:copy};
}
function createNamedSlot(name){
 const safe=String(name||'').trim().slice(0,44);
 if(!safe)return {ok:false,error:'Bitte gib deinem Spielstand einen Namen.'};
 const all=namedSlots(),existing=all.findIndex(v=>v.name.toLocaleLowerCase('de')===safe.toLocaleLowerCase('de'));
 if(existing<0&&all.length>=SLOT_LIMIT)return {ok:false,error:'Maximal acht benannte Spielstände. Lösche zuerst einen alten Stand.'};
 const slot=snapshotForSlot(safe);if(existing>=0)all.splice(existing,1);all.unshift(slot);
 if(!storeSlots(all))return {ok:false,error:'Browser-Speicherplatz nicht verfügbar.'};
 return {ok:true,name:safe};
}
function restoreNamedSlot(name){
 const slot=namedSlots().find(v=>v.name===name);if(!slot)return false;
 try{
  localStorage.setItem(SAVE_KEY,JSON.stringify(slot.state));
  save=loadSave();save.won=false;
  enterLevel(save.level,false);
  const p=slot.state.manualPosition;
  if(p&&p.level===save.level&&Number.isFinite(p.x)&&Number.isFinite(p.y)){
   player.x=clamp(p.x,0,level.width-player.w-150);player.y=clamp(p.y,-770,1065);
   player.route=p.route==='cloud'||p.route==='depth'?p.route:null;
   player.inv=3;player.grounded=false;player.vx=0;player.vy=0;
   cam=clamp(player.x-viewW*.33,0,Math.max(0,level.width-viewW));
   camY=player.route?clamp(player.y-330,-850,865):0;
  }
  if(slot.state.manualCompanion&&FRIEND_ROSTER[slot.state.manualCompanion.name]){
   companion={...slot.state.manualCompanion,remaining:Math.max(0,Math.min(1500,slot.state.manualCompanion.remaining)),secretShown:false};
  }
  persist();return true
 }catch{return false}
}
function removeNamedSlot(name){
 const all=namedSlots(),next=all.filter(v=>v.name!==name);
 return all.length>next.length&&storeSlots(next);
}
function showSaveManager(returnToGame=false){
 const slots=namedSlots();phase='paused';clearInputs();
 presentCard('💾 SPIELSTÄNDE','Deine Abenteuer',hero().icon+' 📜 ✨',
  'Benannte Spielstände kannst du einzeln laden oder löschen. Bis zu acht Speicherplätze, lokal in diesem Browser. Die automatische Speicherung bleibt erhalten.',
  [...slots.map(slot=>({label:'📖 '+escapeText(slot.name)+' · Level '+(slot.level+1)+' · 🪙 '+slot.coins,action:()=>showSlotActions(slot.name,returnToGame)})),
   {label:'✏️ Neuen Spielstand speichern',action:()=>showSaveNameEditor(returnToGame)},
   {label:'↩ Zurück',secondary:true,action:returnToGame?pauseMenu:menu}]);
}
function showSaveNameEditor(returnToGame){
 phase='paused';
 presentCard('💾 SPEICHERN','Wie heißt dein Abenteuer?',hero().icon+' ✏️ 📜',
  'Gib deinem aktuellen Fortschritt einen Namen. Ein bereits vorhandener Name wird durch den aktuellen Spielstand ersetzt.',
  [{label:'↩ Zurück',secondary:true,action:()=>showSaveManager(returnToGame)}]);
 const cardEl=overlayContent.querySelector('.story-card');
 const form=document.createElement('form');form.className='save-name-form';
 const input=document.createElement('input');input.type='text';input.maxLength=44;input.required=true;input.autocomplete='off';input.placeholder='Zum Beispiel: Vor dem Uhrwerkboss';input.setAttribute('aria-label','Name des Spielstands');
 const status=document.createElement('p');status.className='slot-message';status.setAttribute('role','status');
 const button=document.createElement('button');button.type='submit';button.className='story-button';button.textContent='💾 Mit diesem Namen speichern';
 form.append(input,button,status);cardEl.append(form);
 form.addEventListener('submit',e=>{e.preventDefault();const result=createNamedSlot(input.value);if(result.ok){
   sound('win');toast('💾 Gespeichert: '+result.name);showSaveManager(returnToGame);
  }else{status.textContent=result.error;input.focus()}});
}
function showSlotActions(name,returnToGame){
 const slot=namedSlots().find(v=>v.name===name);
 if(!slot)return showSaveManager(returnToGame);
 phase='paused';
 presentCard('📜 MANUELLER SPIELSTAND',escapeText(slot.name),hero().icon+' 💾 🌼',
  'Gespeichert in Level '+(slot.level+1)+'. '+slot.coins+' Münzen. Laden ersetzt den automatischen Spielstand, andere benannte Speicherplätze bleiben erhalten.',
  [{label:'▶ Diesen Spielstand laden',action:()=>{if(!restoreNamedSlot(name)){showSaveManager(returnToGame);toast('Spielstand konnte nicht geladen werden.')}}},
   {label:'🗑 Diesen Spielstand löschen',secondary:true,action:()=>{removeNamedSlot(name);showSaveManager(returnToGame)}},
   {label:'↩ Zurück',secondary:true,action:()=>showSaveManager(returnToGame)}]);
}
function pauseMenu(){
 phase='paused';clearInputs();
 presentCard('PAUSE · KATZIGAMI','Eine kleine Verschnaufpause',hero().icon+' ☕ 🍪',
  'Die Welt wartet auf dich. Deine Buffs und Flüche pausieren ebenfalls.',
  [{label:'🐾 Weiterspielen',action:resume},
   {label:'💾 Benannte Spielstände',action:()=>showSaveManager(true)},
   {label:'🏠 Hauptmenü',secondary:true,action:menu}]);
}
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
 if(kind==='dice'||kind==='reward'){[392,523,659,784,988].forEach((n,i)=>tone(n,now+i*.07,.14,i%2?'triangle':'sine',.055));}
 if(kind==='house'){tone(330,now,.15,'triangle',.04);tone(659,now+.12,.14,'sine',.05)}
 if(kind==='tube'){tone(140,now,.33,'sawtooth',.07,540);tone(740,now+.27,.17,'triangle',.04,200)}
 if(kind==='silver'){[660,840].forEach((n,i)=>tone(n,now+i*.07,.12,'triangle',.05))}
 if(kind==='gold'){[523,659,784,1046].forEach((n,i)=>tone(n,now+i*.06,.19,'sine',.065))}
 if(kind==='bronze'){tone(580,now,.10,'triangle',.04,780)}
 if(kind==='enemystrong'){tone(230,now,.2,'sawtooth',.045,105);tone(430,now+.04,.11,'triangle',.05)}

 if(kind==='ride'){[330,493,740,600,920].forEach((n,i)=>tone(n,now+i*.085,.15,i%2?'triangle':'sine',.06))}
}
// Original four-song soundtrack, synthesized in real time after the first user gesture.
// Original, procedural soundtrack. No external audio streams or copyrighted compositions.
// The four worlds use different harmonic palettes; secret routes and danger alter layers.
const MUSIC_SCENES={
 meadow:{lead:'triangle',second:'sine',bass:'triangle',shift:1,volume:.024,percussion:'brush',octave:1},
 forest:{lead:'sine',second:'triangle',bass:'sawtooth',shift:.75,volume:.020,percussion:'wood',octave:1},
 sugar:{lead:'square',second:'sine',bass:'triangle',shift:1.5,volume:.014,percussion:'toy',octave:1.5},
 clock:{lead:'triangle',second:'sawtooth',bass:'sine',shift:.75,volume:.019,percussion:'tick',octave:1}
};
const SCENE_IDS=['meadow','forest','sugar','clock'];
const WORLD_HARMONIES=[
 [[262,330,392],[294,370,440],[220,277,330],[246,311,370]],
 [[196,233,294],[175,220,262],[164,208,247],[196,246,294]],
 [[311,392,466],[349,440,523],[277,349,415],[311,392,523]],
 [[220,262,330],[196,246,294],[175,220,277],[220,277,330]]
];
let musicScene='explore',activeScore='explore',musicBlend=1,musicTransitions=0;
function detectMusicScene(){
 if(musicScene==='house'||musicScene==='reward')return musicScene;
 if(phase==='ending')return 'victory';
 if(phase==='dialogue')return 'story';
 if(phase!=='playing'||!player||!level)return 'menu';
 if(boss?.active&&!boss.done)return 'boss';
 if(player.riding)return player.riding.id.startsWith('bird')?'bird':'snail';
 if(transport)return 'tube';
 if(effects.dizzy>0||effects.sway>0||effects.slow>0||effects.silence>0)return 'curse';
 if(player.route==='cloud')return 'cloud';
 if(player.route==='depth')return level.routes.find(r=>r.id==='depth')?.kind==='cave'?'cave':'burrow';
 const danger=level.enemies.some(e=>!e.dead&&Math.abs(e.x-player.x)<320&&Math.abs(e.y-player.y)<110);
 if(save.hearts===1)return 'critical';
 if(danger)return 'danger';
 if(effects.invincible>0||effects.speed>0||save.power&&levelOf(save.power)>=3)return 'power';
 return 'explore';
}
function scoreNote(freq,start,len,wave,volume,soft=false){
 if(!audioCtx||!freq||!Number.isFinite(freq))return;
 try{
  const osc=audioCtx.createOscillator(),amp=audioCtx.createGain(),filter=audioCtx.createBiquadFilter();
  osc.type=wave;osc.frequency.setValueAtTime(freq,start);
  filter.type='lowpass';filter.frequency.setValueAtTime(soft?1100:4000,start);
  amp.gain.setValueAtTime(.0001,start);
  amp.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),start+.015);
  amp.gain.exponentialRampToValueAtTime(.0001,start+Math.max(.07,len));
  osc.connect(filter);filter.connect(amp);amp.connect(audioCtx.destination);
  osc.start(start);osc.stop(start+Math.max(.08,len)+.01);
 }catch{/* Headless browser and constrained audio devices may not support audio. */}
}
function scorePercussion(scene,i,when,vol){
 if(scene==='brush'){if(i%4===0)scoreNote(90,when,.09,'sine',vol);if(i%4===2)scoreNote(320,when,.045,'triangle',vol*.36)}
 if(scene==='wood'){if(i%2===0)scoreNote(i%4===0?118:195,when,.065,'triangle',vol*.65,true)}
 if(scene==='toy'){if(i%2===0)scoreNote(i%4===0?180:600,when,.045,'square',vol*.26)}
 if(scene==='tick'){scoreNote(i%2?1040:540,when,.032,'sine',vol*.27)}
}
function modeChange(next){
 if(next===activeScore)return;
 activeScore=next;musicBlend=0;musicTransitions++;
 if(audioCtx?.state==='running'&&!audioMuted){
  const at=audioCtx.currentTime+.025;
  if(next==='boss')scoreNote(140,at,.38,'sawtooth',.045);
  if(next==='cloud'||next==='bird')scoreNote(988,at,.30,'sine',.027);
  if(next==='house')scoreNote(740,at,.24,'triangle',.028);
 }
}
function musicTick(){
 if(audioMuted||!audioCtx||audioCtx.state!=='running')return;
 const desired=detectMusicScene();modeChange(desired);
 if(phase==='menu'||phase==='paused')return;
 const now=audioCtx.currentTime,act=actOf(save.level),style=MUSIC_SCENES[SCENE_IDS[act]||'clock'],base=LEVEL_MUSIC[act]||LEVEL_MUSIC[3];
 if(musicAt<now-.9)musicAt=now+.04;
 let scheduled=0;
 while(musicAt<now+.13&&scheduled++<3){
  const i=musicStep%16;
  let n=base.melody[i],b=base.bass[i],tempo=base.tempo;
  const route=['cloud','bird','cave','burrow','snail','tube'].includes(activeScore);
  const stressed=['danger','boss','critical'].includes(activeScore);
  const gag=['curse','house','reward'].includes(activeScore);
  const tender=activeScore==='story'||activeScore==='victory';
  tempo*=stressed?.82:route?1.13:tender?1.48:1;
  musicBlend=Math.min(1,musicBlend+tempo/1.2);
  const levelGain=.55+.45*musicBlend;
  const root=activeScore==='cave'||activeScore==='burrow'||activeScore==='snail'?.75:activeScore==='boss'?.85:1;
  const leadWave=activeScore==='cloud'||activeScore==='bird'||activeScore==='story'?'sine':gag?'triangle':style.lead;
  if(n&&(activeScore!=='story'||i%2===0)){
   scoreNote(n*style.octave*root,musicAt,tempo*(tender?1.55:.82),leadWave,style.volume*levelGain*(tender?.62:1));
   if((i%4===0||activeScore==='power'&&i%2===0)&&!tender){
     scoreNote(n*style.octave*root*1.5,musicAt+.045,tempo*.8,style.second,style.volume*.39*levelGain);
   }
  }
  if(b)scoreNote(b*(route?.75:1),musicAt,tempo*(route?2.15:1.4),style.bass,style.volume*(stressed?.84:.55)*levelGain,true);
  if(i%8===0 && !gag){
   const progression=WORLD_HARMONIES[act]||WORLD_HARMONIES[3],triad=progression[Math.floor(musicStep/8)%progression.length];
   const padWave=act===1?'sine':act===2?'triangle':act===3?'sawtooth':'sine';
   for(let c=0;c<3;c++)scoreNote(triad[c]*(route?.75:1),musicAt+c*.022,tempo*7.3,padWave,style.volume*(act===3?.12:.17)*levelGain,true);
  }
  if(stressed||activeScore==='power'){
   if(i%2===0){const pitch=n||base.melody[(i+1)%16]||523;scoreNote(pitch*2,musicAt,tempo*.35,'triangle',style.volume*.32*levelGain)}
  }
  if(route&&i%4===2)scoreNote((n||659)*2,musicAt+.035,tempo*1.2,'sine',style.volume*.34*levelGain);
  if(gag&&i%3===0)scoreNote((n||392)*(.7+Math.sin(i)*.05),musicAt+.02,tempo*.3,'triangle',style.volume*.50*levelGain);
  if(!tender&&activeScore!=='cloud')scorePercussion(stressed?'toy':style.percussion,i,musicAt,style.volume*1.25*levelGain);
  if(activeScore==='critical'&&i%4===0)scoreNote(82,musicAt,.19,'sine',.032);
  musicAt+=tempo;musicStep++;
 }
}
function resetMusic(){musicAt=0;musicStep=0;musicBlend=0}
function burst(x,y,color,n=18){for(let i=0;i<n;i++){const a=i*Math.PI*2/n+rand(clock*700+i),v=75+rand(i*23+clock)*180;particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-60,life:.5+rand(i)*.5,max:.9,color,size:3+rand(i*7)*6})}if(particles.length>220)particles.splice(0,particles.length-220)}
function toast(text){$('toast').textContent=text;$('toast').classList.add('show');toastUntil=performance.now()+2300}
function clearInputs(){vxInput.left=vxInput.right=vxInput.jump=false;queuedJump=0;['left','right','jump','special'].forEach(id=>$(id).classList.remove('pressed'))}
function showOverlay(html){overlayContent.innerHTML=html;overlay.classList.add('visible');clearInputs()}
function hideOverlay(){overlay.classList.remove('visible');overlayContent.replaceChildren()}
function resume(){musicScene='explore';hideOverlay();phase='playing';clearInputs();lastFrame=performance.now();musicAt=0}
function pause(){if(phase==='playing')pauseMenu();else if(phase==='paused')resume()}
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
 const prompt=`${name} ist heute ${persona} und berichtet: »${mystery().clue}« ${hero().name}, wem glaubst du und was sollen wir als Nächstes tun?`;
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
function menu(){phase='menu';updateUI();presentCard('EIN HANDGEMACHTES KATZENABENTEUER','KATZIGAMI ✿','🐱 🍄 🌸','Die Herzuhr steht still, Nox kontrolliert die Schattenwächter und Königin Dahlia verbirgt ein gefährliches Geheimnis. Sammle sieben Pilze und entscheide, wem du vertraust – mit fünf Helden und einer Geschichte mit Konsequenzen.',[
 ...(hasSavedGame()&&save.lives>0? [{label:save.won?'🌸 Noch einmal das Finale / weiterspielen':'🐾 Spielstand fortsetzen',action:()=>enterLevel(save.level,true)}]:[]),
 {label:'✿ Neues Abenteuer beginnen',action:characterSelect},
 {label:'💾 Benannte Spielstände',secondary:true,action:()=>showSaveManager(false)},
 {label:'🎮 So spielt man',secondary:true,action:help}
 ]);
}
function help(){dialog({tag:'SPIELANLEITUNG',title:'Mit zwei Daumen ins Abenteuer!',portrait:'⬅️ 🐱 ➡️ ⬆️',body:'Links: laufen. Rechts: springen (gedrückt halten = höher!). Die NEUE Magietaste daneben wird ERST nach einem besonderen Verwandlungspilz aktiv; damit wirfst du Zauberkugeln. Jeder Verwandlungspilz bringt eine höhere Stufe: Blütenwurf, Kettenblitz, Mondexplosion und Sternensturm. Upgrades bleiben auch nach Treffern erhalten. Wähle Katze, Hund, Huhn, Hase oder Fuchs sowie Leicht, Mittel, Schwer oder Ultra. Durchquere 20 lange Retro-Anime-Level mit Wolkenpfaden, Maulwurfsgängen und Tropfsteinhöhlen. Schwingende Schläuche saugen dich in alternative Routen. Mit einem präzisen Sprung von oben kannst du selten einen Vogel oder eine Wand- und Deckenschnecke reiten; mit derselben Sprungtaste springst du ab. Sammle Bronze-, Silber- und Goldmünzen und würfle in Häusern für Kostüme, Leben oder kleine Fähigkeiten. Sammle sieben Orakelpilze und besiege unterschiedliche Katzengegner mit mehreren Lebenspunkten. Helle Bonus-Items verleihen zeitweise Turbo, Unverwundbarkeit oder Flugfähigkeit (zum Fliegen Sprungtaste gedrückt halten). Dunkle, durchgestrichene Items verursachen Flüche: Bildschirm-Schwanken, Schneckentempo oder Magiesperre. Die Restzeit steht über dem Kopf deiner Spielfigur. Du kannst gefährliche Items überspringen. Jedes neue Abenteuer hat ein neues Katzigmysterium und zufällige Gegner. Bei Katzenbegegnungen kannst du eigene Antworten eintippen, die Beziehungen, Abkürzungen und Gegner beeinflussen. Das läuft offline mit Spielregeln, nicht über eine Sprachmodell-KI. Spielstände werden automatisch auf diesem Gerät gespeichert. Auf PC: A/D oder Pfeiltasten, Leertaste zum Springen.',options:[{label:'Miau, verstanden! 🐾',action:()=>phase==='dialogue'&&menu()}]})}
function markShown(key){if(!save.shown.includes(key)){save.shown.push(key);persist();return false}return true}
function enterLevel(i,withIntro=false){musicScene='explore';const restoring=withIntro&&i===save.level&&!save.won&&save.checkpoint>0;const spawnX=restoring?save.checkpoint:78;save.level=i;if(!restoring)save.checkpoint=0;save.hearts=clamp(save.hearts,1,diff().hearts);level=makeLevel(i);boss={triggered:false,active:false,done:false,hp:12,maxHp:12,x:level.width-315,y:402,inv:0};player={x:spawnX,y:330,w:43,h:60,vx:0,vy:0,grounded:false,facing:1,inv:1,landed:false,runCycle:0,route:null,tubeCooldown:0,dizzy:0,hatTick:0,riding:null};shots=[];enemyShots=[];particles=[];effects={};transport=null;companion=null;specialCooldown=0;powerFlash=0;resetMusic();cam=0;camY=0;coyote=0;clearInputs();persist();updateUI();hideOverlay();phase='playing';if(withIntro&&!markShown('start'+i))startDialog(i);else enterDynamicEncounters()}
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
 const houses=[{id:'house-'+i+'-a',x:650,y:450},{id:'house-'+i+'-b',x:isFinal(i)?d.width-630:d.width-420,y:450}].map(h=>({...h,used:save.rolledHouses.includes(h.id),cooldown:0}));
 // Rare rideable helpers: landing on a bird takes timing; the cave snail crawls
 // around a wall and across the ceiling. Neither costs a life on a missed attempt.
 const mounts=[];
 if(i%2===0)mounts.push({id:'bird-'+i,kind:'bird',route:'cloud',from:routes[0].from+290,to:routes[0].end-140,x:routes[0].from+290,y:-584,phase:i*.81,rideTime:6,rest:0});
 if(i%3===0||i%5===4)mounts.push({id:'snail-'+i,kind:'snail',route:'depth',from:routes[1].from+315,to:routes[1].end-190,x:routes[1].from+315,y:945,phase:i*.51,rideTime:8,rest:0,angle:0});
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
 const keys=Object.keys(CHARMS).filter(k=>k!=='dizzy'); // Tube dizziness is transport-only, not a random loot curse.
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
 // Four rule families make traversal itself different, not just the background.
 const challengeKinds=[
  ['blossom','updraft','blossom','updraft','blossom'],
  ['vine','root','vine','root','vine'],
  ['ice','jelly','ice','jelly','ice'],
  ['pendulum','shutter','gear','pendulum','shutter']
 ];
 const challenges=[],worldAct=actOf(i);
 const layout=challengeKinds[worldAct]||challengeKinds[3];
 for(let j=0;j<5;j++){
  let x=Math.round(850+(j+.5)*(d.width-1550)/5);
  const gap=d.gaps.find(([from,to])=>x>from-100&&x<to+90);
  if(gap)x=gap[0]-130;
  x=clamp(x,790,d.width-400);
  const kind=layout[(j+i)%5],obj={id:'challenge-'+i+'-'+j,type:kind,x,phase:i+j*1.4,active:false,remaining:0,cooldown:0,crumbles:0,open:false};
  if(kind==='vine'){
    const target=d.gaps.find(g=>g[0]>x&&g[0]<x+660);
    if(target){obj.bridge=[target[0],target[1]];obj.x=target[0]-135}
  }
  if(kind==='root'){obj.platform={x:x-35,y:348,w:135,h:25,ground:false,route:'root',breakable:true};platforms.push(obj.platform)}
  if(kind==='gear'){obj.platform={x:x-20,y:345,w:150,h:24,ground:false,moving:true,route:'gear',baseX:x-20,baseY:345};platforms.push(obj.platform)}
  challenges.push(obj);
 }
const guestName=FRIEND_SCHEDULE[i]||'Pip',friendId='friend-'+i+'-'+guestName;
 const visitor={id:friendId,name:guestName,x:Math.round(d.width*(i%3===0?.31:i%3===1?.40:.48)),y:390,status:save.friendEncounters.includes(friendId)?'departed':'waiting',injury:INJURY_LEVELS[i]===guestName};
 const brightness=campaignVar(i*43+2),toneVariant=brightness<.33?'Dämmerung':brightness>.7?'Morgentau':'Sternenschein';
 return {...d,index:i,toneVariant,ground,platforms,enemies,visitor,challenges,routes,tubes,routePlatforms,routeHazards,mounts,coins:newCoins,houses,items:d.mushrooms.map(([id,x,y])=>({id,x,y,taken:save.collected.includes(id)})),powerItem:{id:d.power[0],x:d.power[1],y:d.power[2],taken:false},charms,checkpoints:d.checkpoint};}
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

function friendMeeting(){
 if(phase!=='playing'||!level?.visitor||!player)return;
 const v=level.visitor;
 if(v.status!=='waiting'||Math.abs(player.x+player.w*.5-v.x)>47||player.route)return;
 v.status='talking';
 const state=friendState(v.name),wounded=v.injury&&!state.healed;
 const intro=state.meetings>0?'»Da bist du ja wieder!« ':'»Endlich begegnen wir uns!« ';
 state.meetings++;save.friendEncounters.push(v.id);persist();
 if(wounded){
  state.injured=true;persist();
  const text=intro+v.name+' liegt verletzt am Weg. Nox’ Wachkatzen haben die Pfote getroffen. Für '+HEAL_COST+' Münzen könnte ein Heilkraut helfen. Du hast '+save.coins+' Münzen. Wenn du nicht hilfst, bleibt der Freund zurück und verliert Vertrauen.';
  dialog({tag:'💔 VERLETZTER FREUND',title:v.name+' braucht dich!',portrait:'🐈‍⬛ 🩹 💔',body:text,
   options:[{label:'💗 Für '+HEAL_COST+' Münzen heilen',action:()=>healFriend(v)},
    {label:'🔎 Nur nach einem Hinweis fragen',action:()=>{state.trust--;persist();v.status='departed';toast(FRIEND_ROSTER[v.name].hint);resume()}},
    {label:'🐾 Weitergehen – Münzen behalten',action:()=>{state.trust-=2;persist();v.status='departed';resume();toast(v.name+' schaut dir traurig hinterher.')}}]});
 }else{
  const lore=FRIEND_ROSTER[v.name];
  dialog({tag:'🐾 WIEDERSEHEN · '+v.name.toUpperCase(),title:v.name+' ist zurück!',portrait:'🐱 '+lore.icon+' 🌸',
   body:intro+v.name+': »'+lore.hint+'« Begleite ich dich ein Stück? Vielleicht entdecken wir zusammen eine geheime Münzspur.',
   options:[{label:'🤝 Ein Stück gemeinsam reisen',action:()=>joinFriend(v)},
    {label:'🗝 Nur ein Geheimnis erfahren',action:()=>{state.secrets++;state.trust++;v.status='departed';persist();resume();toast(lore.secret)}},
    {label:'🐾 Allein weitergehen',action:()=>{v.status='departed';resume()}}]});
 }
}
function healFriend(v){
 const f=friendState(v.name);
 if(save.coins<HEAL_COST){
  v.status='waiting';toast('🪙 Es fehlen '+(HEAL_COST-save.coins)+' Münzen!');
  resume();return false;
 }
 save.coins-=HEAL_COST;f.healed=true;f.injured=false;f.trust+=3;persist();updateUI();
 burst(v.x,390,'#b6edc7',32);sound('transform');
 dialog({tag:'💗 GEHEILTE PFOTE',title:v.name+' ist wieder gesund!',portrait:'🌿 💖 🐈',body:'»Danke! Das Heilkraut wirkt. Ich zeige dir als Dank einen geheimen Weg und begleite dich ein Stück.« Die 150 Münzen sind ausgegeben, aber '+v.name+' vertraut dir nun mehr.',
  options:[{label:'🐾 Zusammen weiter!',action:()=>joinFriend(v)}]});return true;
}
function joinFriend(v){
 const state=friendState(v.name);state.trust++;persist();
 v.status='following';
 companion={name:v.name,x:v.x,y:390,remaining:850+Math.floor(campaignVar(save.level+35)*440),secretShown:false};
 resume();toast('🤝 '+v.name+' begleitet dich jetzt!');sound('choice');
}
function tickCompanion(dt){
 if(phase!=='playing'||!level||!player)return;
 if(level.visitor?.status==='waiting')friendMeeting();
 if(!companion)return;
 if(!Number.isFinite(companion.x))companion.x=player.x-60;
 const targetX=player.x-player.facing*72;
 companion.x+=(targetX-companion.x)*Math.min(1,dt*4);
 companion.y+=(player.y+17-companion.y)*Math.min(1,dt*3);
 companion.remaining-=Math.abs(player.vx)*dt;
 if(!companion.secretShown&&companion.remaining<550){
  companion.secretShown=true;const f=friendState(companion.name);f.secrets++;persist();
  toast('🗝 '+FRIEND_ROSTER[companion.name].secret);
  // Reward discovery, without placing coins in mandatory dangerous routes.
  for(let i=0;i<4;i++){
   const id='friend-secret-'+save.level+'-'+companion.name+'-'+i;
   if(!level.coins.some(c=>c.id===id)&&!save.coinTaken.includes(id))
    level.coins.push({id,x:clamp(player.x+135+i*48,120,level.width-210),y:340-i%2*40,type:i===3?'gold':'silver',taken:false});
  }
 }
 if(companion.remaining<=0||player.x>=level.width-450){
  const name=companion.name;companion=null;if(level.visitor)level.visitor.status='departed';
  toast('👋 '+name+' nimmt den Wurzelpfad und verschwindet. Bis bald!');
 }
}
function drawCompanion(){
 if(!level)return;
 const v=level.visitor;
 if(v&&v.status==='waiting'&&v.x>cam-90&&v.x<cam+viewW+90){
  ctx.save();ctx.globalAlpha=.95;drawCat(v.x-cam,406,.8,FRIEND_ROSTER[v.name].coat,Math.sin(clock*2)*3,1);
  if(v.injury&&!friendState(v.name).healed){ctx.font='bold 24px sans-serif';ctx.fillText('🩹',v.x-cam-13,375)}
  round(v.x-cam-44,315,88,25,10,'#fff9e9','#e8b4c7',2);ctx.textAlign='center';ctx.font='bold 13px Nunito,sans-serif';ctx.fillStyle='#7b557a';ctx.fillText(v.name+' ♥',v.x-cam,333);ctx.restore();
 }
 if(companion){
  const x=companion.x-cam,y=companion.y;
  if(x>-110&&x<viewW+110){
   ctx.save();drawCat(x,y,.76,FRIEND_ROSTER[companion.name].coat,Math.sin(clock*10)*3,player.facing);
   ctx.textAlign='center';ctx.font='bold 13px Nunito,sans-serif';ctx.fillStyle='#fff8e8';
   ctx.fillText(companion.name+' • '+Math.ceil(Math.max(0,companion.remaining)/100)+' ✿',x,y-72);ctx.restore();
  }
 }
}
const CHALLENGE_LABELS={
 blossom:'🌸 Blütensprung: Spring auf der federnden Blume!',
 updraft:'🌬️ Windblume: Der Luftstrom trägt dich nach oben!',
 vine:'🌿 Wurzelhebel: Lass eine Brücke aus dem Boden wachsen!',
 root:'🍂 Brüchige Wurzel: Nicht zu lange stehen bleiben!',
 ice:'🧊 Kristalleis: Vorsicht, rutschiger Boden!',
 jelly:'🍮 Mondgelee: Spring auf der glibberigen Plattform!',
 pendulum:'🕰️ Uhrpendel: Den richtigen Moment abpassen!',
 shutter:'⏳ Zeittor: Warte auf die offene Phase oder spring!',
 gear:'⚙️ Zahnräder: Bewegliche Plattformen nach oben nutzen!'
};
function nearbyChallenge(){return level?.challenges?.find(o=>Math.abs(player.x+player.w*.5-o.x)<92&&!player.route)}
function tickChallenges(dt){
 if(!level||!player||phase!=='playing')return;
 for(const o of level.challenges){
  o.cooldown=Math.max(0,o.cooldown-dt);
  const close=Math.abs(player.x+player.w*.5-o.x)<(o.type==='ice'?110:62);
  if(close&&!o.announced){o.announced=true;toast(CHALLENGE_LABELS[o.type]||'✦ Neues Hindernis!')}
  if(!close&&o.announced&&Math.abs(player.x-o.x)>280)o.announced=false;
  if(o.type==='blossom'&&close&&player.grounded&&vxInput.jump&&!o.cooldown){
   o.cooldown=2.3;player.vy=-930;player.grounded=false;player.y-=5;burst(o.x,430,'#ffcae3',22);sound('jump');
  }
  if(o.type==='updraft'&&close&&player.y<425&&player.y>65&&vxInput.jump){
    player.vy=Math.max(-460,player.vy-1350*dt);if(!o.cooldown){o.cooldown=1;burst(o.x,340,'#e1faff',12)}
  }
  if(o.type==='vine'){
   if(close&&!o.active){o.active=true;o.remaining=21;burst(o.x,439,'#9de0a7',18);sound('choice');
     if(o.bridge){const [from,to]=o.bridge;
      o.platform={x:from+5,y:411,w:to-from-10,h:24,ground:false,helper:true,route:'root'};
      level.platforms.push(o.platform)}
   }
   if(o.active&&o.remaining>0)o.remaining=Math.max(0,o.remaining-dt);
   // Root bridges stay for the level, so changing routes never creates unwinnable falls.
  }
  if(o.type==='root'&&o.platform){
   const p=o.platform,standing=player.grounded&&Math.abs(player.y+player.h-p.y)<6&&player.x+player.w>p.x&&player.x<p.x+p.w;
   if(standing)o.crumbles+=dt;
   if(o.crumbles>.85){p.y=1600;o.remaining=3;o.crumbles=0}
   if(o.remaining>0){o.remaining-=dt;if(o.remaining<=0){p.y=348}}
  }
  if(o.type==='jelly'&&close&&player.grounded&&!o.cooldown){
   o.cooldown=1.8;player.vy=-810;player.grounded=false;player.y-=4;
   burst(o.x,430,'#ffc8f1',18);sound('jump')
  }
  if(o.type==='gear'&&o.platform){
   const p=o.platform,prev=p.y;p.y=p.baseY+Math.sin(clock*1.35+o.phase)*95;
   p.x=p.baseX+Math.cos(clock*.55+o.phase)*25;
   if(player.grounded&&player.x+player.w>p.x&&player.x<p.x+p.w&&Math.abs(player.y+player.h-prev)<8)player.y+=p.y-prev;
  }
  if(o.type==='pendulum'&&close){
   const bobX=o.x+Math.sin(clock*1.9+o.phase)*67, bobY=405+Math.cos(clock*1.9+o.phase)*25;
   if(Math.abs(player.x+player.w/2-bobX)<23&&Math.abs(player.y+player.h/2-bobY)<31)hurt();
  }
  if(o.type==='shutter'){
   o.open=Math.sin(clock*1.9+o.phase)>.05;
   if(!o.open&&!player.route&&player.y+player.h>298&&Math.abs(player.x+player.w*.5-o.x)<24){
    const left=player.x<o.x;
    player.x=left?o.x-player.w-20:o.x+21;player.vx=0;
   }
  }
 }
}
function drawChallenges(){
 if(!level?.challenges)return;
 for(const o of level.challenges){
  const x=o.x-cam;if(x<-155||x>viewW+155)continue;
  ctx.save();ctx.translate(x,0);
  if(o.type==='blossom'){
    for(let i=0;i<8;i++){const a=Math.PI*2*i/8+Math.sin(clock*2)*.07;ellipse(Math.cos(a)*25,430+Math.sin(a)*11,14,11,i%2?'#ffc1e1':'#fbe3f1',a)}
    ellipse(0,430,23,11,'#f6c66e');ellipse(0,426,11,5,'#ffefb3');
  }else if(o.type==='updraft'){
    for(let i=0;i<5;i++){const yy=440-((clock*56+i*79)%340);
     ctx.globalAlpha=.3+.14*i;ctx.strokeStyle='#b4eff4';ctx.lineWidth=6;ctx.beginPath();ctx.arc(Math.sin(clock*2+i)*30,yy,13,0,Math.PI*1.2);ctx.stroke()}
    ctx.globalAlpha=1;ellipse(0,438,37,12,'#9ddbbe');ellipse(0,435,17,8,'#f8edc4');
  }else if(o.type==='vine'){
    round(-18,404,36,46,7,'#8f6b54','#d4c2a1',3);
    ctx.strokeStyle=o.active?'#97d899':'#d4a680';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(0,414);ctx.lineTo(o.active?27:-21,o.active?388:398);ctx.stroke();
    ellipse(o.active?27:-21,o.active?388:398,10,10,'#d2f3ad');
    if(o.active){ctx.font='25px serif';ctx.fillText('❧',6,377)}
  }else if(o.type==='root'){if(o.platform?.y>1400){ctx.globalAlpha=.4;ctx.font='25px serif';ctx.fillText('✧',-8,358)}else{ctx.strokeStyle='#bda17f';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-31,360);ctx.bezierCurveTo(-17,327,23,358,44,335);ctx.stroke()}}
  else if(o.type==='ice'){
    ctx.fillStyle='#aee9f3a9';ctx.strokeStyle='#fffef9';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-105,449);ctx.lineTo(-86,425);ctx.lineTo(88,425);ctx.lineTo(106,449);ctx.closePath();ctx.fill();ctx.stroke();
    for(let i=-2;i<=2;i++)ellipse(i*33,432+i%2*5,11,2,'#fff8ff');
  }else if(o.type==='jelly'){
    ctx.save();ctx.translate(0,435);ctx.scale(1+Math.sin(clock*8)*.05,1-Math.sin(clock*8)*.06);
    ellipse(0,0,55,17,'#e9b0e6');ellipse(0,-10,50,22,'#f6c7ed');ellipse(-14,-13,5,5,'#fffdfd');ellipse(14,-13,5,5,'#fffdfd');ctx.restore();
  }else if(o.type==='pendulum'){
    line(0,190,Math.sin(clock*1.9+o.phase)*67,405+Math.cos(clock*1.9+o.phase)*25,'#d8bca9',7);
    ellipse(Math.sin(clock*1.9+o.phase)*67,405+Math.cos(clock*1.9+o.phase)*25,26,28,'#cca3ae');ellipse(Math.sin(clock*1.9+o.phase)*67,405+Math.cos(clock*1.9+o.phase)*25,13,15,'#fff0ca');
  }else if(o.type==='shutter'){
    round(-22,295,44,155,6,o.open?'#cce3d260':'#8474a8',o.open?'#d1eac5':'#e5c19e',4);
    for(let i=0;i<6;i++)line(-14,308+i*23,14,308+i*23,'#fff1ca',3);
    ctx.font='bold 18px sans-serif';ctx.fillStyle='#fff7d4';ctx.fillText(o.open?'✓':'⌛',-9,289);
  }else if(o.type==='gear'){
    for(let i=0;i<8;i++){const a=clock*.9+i*Math.PI/4;ellipse(Math.cos(a)*37,330+Math.sin(a)*37,11,13,'#d3b4db',a)}
    ellipse(0,330,37,38,'#9a7baf');ellipse(0,330,14,15,'#f7eac2');
  }
  ctx.restore();
 }
}
function startDialog(i){
 if(i===0){
  const name=hero().name;
  dialog({tag:'PROLOG · DIE SIEBEN ZEITGLOCKEN',title:hero().name+' und das gestohlene Morgen',portrait:hero().icon+' 🌸 🕰️',
   body:openingForHero()+' Die Blumen werden grau und Katzenwächter sperren die Wege. Pilzbote Pip beschuldigt Königin Dahlia – doch auf seinem Befehl steht heimlich das Zeichen des Uhrmeisters NOX. Finde sieben Orakelpilze, rette die Herzuhr und entscheide, wem du glaubst.',
   options:[
    {label:'💗 Erst die Bewohner retten!',action:()=>{save.flags.cake=true;persist();resume();toast(name+': »Ich lasse niemanden zurück!«')}},
    {label:'⚔️ Schnell zu den sieben Zeitglocken!',action:()=>{save.flags.hero=true;persist();resume();toast(name+': »Die Zeit wartet nicht!«')}}
   ]});return;
 }
 if(i%5!==0){resume();return}
 const act=actOf(i),arc=STORY_ARCS[act];let branch='';
 if(act===1)branch=save.flags.helpedMiso?'Du hast Miso gerettet. Sie hilft dir, Nox’ gefälschte Befehle zu finden.':'Miso ist verletzt, weil du die Karte gewählt hast. Sie bewacht nun eine Abkürzung.';
 if(act===2)branch=save.flags.trustedQueen?'Dahlia zeigt dir einen geheimen Mondsteg und überreicht Beweise.':'Du vertraust Pip. Dahlia verweigert dir einen sicheren Weg, aber du kannst Beweise selbst suchen.';
 if(act===3)branch=save.flags.readLetter?'Du kennst Spiegel-Momos Trauer und kannst mit ihr sprechen.':'Du hast den Brief nicht gelesen. Die Schattenkatze bleibt rätselhaft, aber ein Pilz könnte Frieden stiften.';
 dialog({tag:'AKT '+(act+1)+' · '+arc.title,title:arc.place,portrait:arc.portrait,body:arc.beat+' '+branch+' '+mystery().clue,options:[{label:'🐾 Der Spur folgen!',action:resume}]});
}
function checkEndOfLevel(){if(phase!=='playing')return;if(isFinal(save.level)){if(!boss.done){toast('Ein magischer Spiegel versperrt den Ausgang!');player.x=Math.min(player.x,level.width-230);return}endChoice();return}
 const i=save.level;
 if(i%5!==4){nextChapter('Neue Strecke, neue Abenteuer! 🐱');return}
 if(i===4){dialog({tag:'PLOT TWIST · KAPITEL 1',title:'Die Geisel und die Karte',portrait:'🐈 🫧 🗺️',body:'Nox’ Wachkatzen haben Miso in einer Seifenblase gefangen. Gleichzeitig flattert eine Karte zu den sieben Zeitglocken davon. Pip ruft: »Hol die Karte!« Wen willst du retten?',options:[
 {label:'💗 Miso retten – Freunde sind wichtiger!',action:()=>{save.flags.helpedMiso=true;nextChapter('Miso: »Ich schulde dir ein Leben. Und eine Pizza.«')}},
 {label:'🗺️ Karte jagen – die Mission geht vor!',action:()=>{save.flags.helpedMiso=false;nextChapter('Miso: »Ich merke mir das. Sehr detailliert.«')}}
 ]})}
 if(i===9){dialog({tag:'PLOT TWIST · KAPITEL 2',title:'Dahlias riskantes Geständnis',portrait:'👑 🐈 ⌛',body:'Dahlia gesteht: »Ich versteckte die Farben vor Nox. Mein Schutzzauber ließ den Wald verdunkeln. Es tut mir leid.« Pip protestiert: »Sie könnte lügen!« Königin oder Bote – wem glaubst du?',options:[
 {label:'🌷 Dahlia glauben – ihre Geschichte anhören',action:()=>{save.flags.trustedQueen=true;nextChapter('Dahlia: »Endlich jemand mit Ohren UND Gehirn.«')}},
 {label:'🦉 Pip glauben – die Königin ist schuld!',action:()=>{save.flags.trustedQueen=false;nextChapter('Pip: »Ich war nie eine Eule! Ich bin ein KATER!«')}}
 ]})}
 if(i===14){dialog({tag:'DIE GROSSE WENDUNG · KAPITEL 3',title:'Die Stimme im Spiegel',portrait:'🐱 ⏳ 🐈‍⬛',body:'Der Brief aus der Zukunft enthüllt: Spiegel-Momo fürchtet einen schmerzhaften Abschied und wollte die Zeit aufhalten. Nox nutzte die Angst aus, versiegelte die Herzuhr und beschuldigte Dahlia. Der vermeintliche Endgegner könnte ein Opfer sein.',options:[
 {label:'💌 Brief lesen – auch das traurige Ende',action:()=>{save.flags.readLetter=true;nextChapter('Brief-Momo: »P.S. Kauf keinen Thunfisch aus der Zukunft.«')}},
 {label:'🔥 Brief zuklappen – ich entscheide selbst!',action:()=>{save.flags.readLetter=false;nextChapter('Momo: »Spoiler sind schlimmer als Gurken!«')}}
 ]})}
}
function nextChapter(msg){toast(msg);save.level++;save.hearts=diff().hearts;save.checkpoint=0;persist();sound('meow');enterLevel(save.level,true)}
function bossTalk(){if(phase!=='playing'||boss.triggered)return;boss.triggered=true;const empathic=!!save.flags.readLetter,canOffer=save.collected.length>=5;let options=[];
 if(empathic){options.push({label:'💞 »Ich weiß, wer du bist. Komm mit, Zukunfts-Momo.«',action:()=>{boss.done=true;save.flags.kindShadow=true;persist();resume();toast('Spiegel-Momo: »Du hast mich … nicht gehasst?«')}})}
 else if(canOffer){options.push({label:'🍄 Einen Pilz teilen – Frieden?',action:()=>{boss.done=true;save.flags.kindShadow=true;persist();resume();toast('Spiegel-Momo: »Ist das … Käsegeschmack?!«')}})}
 options.push({label:'⚔️ »Dann tanzen wir, Schattenpfote!« (12 Herzen)',action:()=>{boss.active=true;save.flags.kindShadow=false;persist();resume();toast('Spring dem Spiegelkätzchen zweimal auf den Kopf!')}});
 dialog({tag:'FINALE · DER SPIEGEL',title:'Spiegel-Momo · die gefangene Katze',portrait:'🐱 🪞 🐈‍⬛',body:'Nox tritt aus der Uhr: »Ein Morgen, das ich nicht beherrsche, darf nicht existieren.« Spiegel-Momo zittert: »Ich wollte nur verhindern, dass wir noch jemanden verlieren.« Die Schattenkatze ist gefangen zwischen Schuld und Angst. Du kannst Frieden versuchen oder kämpfen.',options})}
function endChoice(){if(phase!=='playing')return;dialog({tag:'FINALE · DEINE ENTSCHEIDUNG',title:'Die Uhr tickt wieder',portrait:'🌈 🐱 ⏳',body:`Du hast ${save.collected.length} von ${TOTAL} Orakelpilzen. ${hero().name} hält die Sanduhr in den Pfoten. Die Welt kann wieder wachsen – oder für immer in einem hübschen Augenblick bleiben.`,options:[
 {label:'🌸 Zeit freigeben – Veränderung wagen',action:()=>ending('release')},
 {label:'🌙 Alles für immer bewahren – den Moment einfrieren',action:()=>ending('freeze')}
 ]})}
function ending(choice){musicScene='victory';save.flags.finalChoice=choice;save.won=true;let type,title,body;
 if(choice==='freeze'){type='MOND-ENDE';title='Ein schnurrender Augenblick';body='Die Zeit steht still, und Nox übernimmt die letzte Uhr. Niemand muss sich mehr verabschieden – aber niemand darf mehr wachsen. Der Tee bleibt ewig lauwarm, sogar die Kekse schmecken immer gleich. Ein schönes Gefängnis, das du vielleicht eines Tages wieder öffnest.'}
 else if(save.collected.length===TOTAL&&save.flags.helpedMiso&&save.flags.trustedQueen&&save.flags.readLetter&&save.flags.kindShadow){type='WAHRES STERNEN-ENDE';title='Sieben Pilze und neun Leben';body='Du hast alle sieben Pilze gefunden, Miso gerettet, Dahlia vertraut und Zukunfts-Momo vergeben! Der Wald erblüht. Pip eröffnet eine Nachrichtenagentur, die erstmals Fakten prüft. Und Miso bestellt eine Pizza. Mit Pilzen. Wahnsinn!'}
 else if(save.collected.length===TOTAL){type='REGENBOGEN-ENDE';title='Die Farben kehren zurück';body='Alle sieben Pilze leuchten gleichzeitig! Die Uhr erwacht. Die Blumen blühen wieder, Dahlia lässt die Farben frei, und Momo wird zur offiziellen Heldin der königlichen Snackabteilung.'}
 else {type='PFOTEN-ENDE';title='Ein unperfekt perfekter Morgen';body='Die Zeit geht wieder weiter – auch mit ein paar fehlenden Pilzen. Manchmal muss man mutig sein, bevor man alles versteht. Momo und die Katzen feiern mit einer Torte, die verdächtig nach Thunfisch schmeckt.'}
 // A completed adventure also reflects the player's freely written answers and allegiances.
 const bonds=Object.values(save.relations||{}).reduce((a,b)=>a+b,0);
 const epilogue=bonds>=3?' Deine befreundeten Katzen organisieren ein prachtvolles Fest.':bonds<=-2?' Einige misstrauische Katzen bleiben als schwierige Rivalen zurück.':' Die anderen Katzen versprechen, noch viele Fragen zu stellen.';
 body+=' '+(choice==='release'?'Nox’ Uhrwerk zerfällt: Er verliert die Macht über alle ungelebten Morgen. ':'Nox zieht seine goldene Uhr enger um das eingefrorene Königreich. ')+mystery().ending+epilogue;
 save.ending=type;persist();sound('win');phase='ending';presentCard(`🏆 ${type}`,title,'🐈 🌈 🍄',body,[{label:'🐾 Die Pilze noch einmal suchen',action:()=>{save.won=false;save.level=0;save.checkpoint=0;persist();enterLevel(0)}},{label:'🏠 Hauptmenü',secondary:true,action:menu}])}
function pickCoin(coin){
 if(coin.taken)return false;coin.taken=true;save.coins+=COIN_VALUES[coin.type];
 if(!save.coinTaken.includes(coin.id))save.coinTaken.push(coin.id);
 burst(coin.x,coin.y,coin.type==='gold'?'#ffdf73':coin.type==='silver'?'#c8ebf8':'#dc9d65',9);
 sound(coin.type);persist();updateUI();return true;
}
function awardDice(house){
 musicScene='reward';sound('dice');
 const roll=1+Math.floor(Math.random()*6),name=hero().name;
 let reward='',portrait='🎲';
 if(roll===1){save.hearts=Math.min(diff().hearts,save.hearts+2);reward='💗 Zwei Herzen für '+name+'!';}
 else if(roll===2){save.lives+=1;reward='🐾 Ein zusätzliches Leben!';}
 else if(roll===3){save.coins+=30;reward='🪙 30 Münzen – Jackpot!';}
 else if(roll===4||roll===5){const keys=Object.keys(COSTUMES),outfit=keys[Math.floor(Math.random()*keys.length)];if(!save.costumes.includes(outfit))save.costumes.push(outfit);save.outfit=outfit;reward='🎩 Neues Kostüm: '+prizeName(outfit)+'!';}
 else {const keys=Object.keys(SMALL_PERKS),perk=keys[Math.floor(Math.random()*keys.length)];save.perk=perk;reward='✨ Kleine Fähigkeit: '+SMALL_PERKS[perk]+'!';}
 save.rolledHouses.push(house.id);house.used=true;persist();updateUI();sound('transform');
 dialog({tag:'WÜRFELHAUS · '+roll+' AUGEN',title:'Glücks-Miau!',portrait:'🎲 '+portrait+' '+hero().icon,body:reward+' Das Glückshaus kann in diesem Durchlauf nur einmal verwendet werden.',options:[{label:'🐾 Weiter durch die Welt!',action:resume}]});
 showRewardIllustration(roll,reward);
}
function visitHouse(house){
 if(house.used||phase!=='playing')return;
 musicScene='house';sound('house');
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
 player.vx=0;player.vy=0;player.grounded=false;clearInputs();sound('tube');toast(tube.direction==='in'?'🌀 FFFSCHLURP! '+hero().name+' wird eingesaugt!':'🎺 PLÖPP! Der Rückweg ruft!');
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
 save.hearts=diff().hearts;player.x=save.checkpoint||78;player.y=320;player.vx=0;player.vy=0;player.inv=2;player.route=null;player.riding=null;camY=0;effects={};persist();updateUI();toast('🐾 Ein Leben verloren! Noch '+save.lives+' übrig.');
}
function hurt(){
 if(player.inv>0||effects.invincible>0||phase!=='playing')return;
 player.inv=1.4;if(save.power)burst(player.x+20,player.y+10,POWERS[save.power].color,14);
 save.hearts=Math.max(0,save.hearts-1);sound('hurt');updateUI();player.vy=-440;player.vx=-player.facing*240;
 if(save.hearts<=0)loseLife('Die Gegner waren diesmal stärker!');else toast('Aua! '+hero().name+' hat nur noch '+save.hearts+' Herzen.');
 persist();
}
function jump(){if(phase!=='playing')return;queuedJump=.16}
function mountPosition(m,t){
 const span=Math.max(230,m.to-m.from);
 if(m.kind==='bird'){
   const u=(t*.04+m.phase)%1;
   const ping=u<.5?u*2:(1-u)*2;
   m.x=clamp(m.from+span*ping+(m.steerOffset||0),m.from,m.to);
   m.y=-583+Math.sin(t*3.5+m.phase)*17;
   m.angle=Math.sin(t*3.5+m.phase)*.1;
 }else{
   // Crawl right up a cavern wall, cross the ceiling upside down, then descend.
   const u=((t*.085+m.phase)%1+1)%1;
   const left=m.from,right=m.to;
   if(u<.24){m.x=left;m.y=934-(u/.24)*220;m.angle=-Math.PI*.5}
   else if(u<.72){m.x=left+(u-.24)/.48*(right-left);m.y=714;m.angle=Math.PI}
   else {m.x=right;m.y=714+(u-.72)/.28*220;m.angle=Math.PI*.5}
 }
}
function startRide(m){
 if(player.riding||m.rest>0||transport||phase!=='playing'||player.route!==m.route)return false;
 player.riding={id:m.id,left:m.rideTime};
 player.grounded=false;player.vx=0;player.vy=0;player.inv=1.2;queuedJump=0;
 burst(m.x,m.y,m.kind==='bird'?'#d3f6ff':'#f1d4aa',24);sound('ride');
 toast(m.kind==='bird'?'🐦 JIPPI! Auf dem Wolkenvogel!':'🐌 WAHNSINN! Wand-Schnecke, sogar kopfüber!');
 return true;
}
function updateRiding(dt){
 const ride=player.riding;if(!ride)return false;
 const m=level.mounts.find(v=>v.id===ride.id);
 if(!m){player.riding=null;return false}
 ride.left=Math.max(0,ride.left-dt);
 if(m.kind==='bird')m.steerOffset=clamp((m.steerOffset||0)+(Number(vxInput.right)-Number(vxInput.left))*110*dt,-100,100);
 // Rotate the passenger around the snail's shell on walls and ceilings.
 const angle=m.kind==='snail'?(m.angle||0):0;
 player.x=clamp(m.x+Math.sin(angle)*57-player.w*.5,0,level.width-player.w);
 player.y=m.y-Math.cos(angle)*61-player.h*.5;
 player.vx=0;player.vy=0;player.inv=Math.max(player.inv,.35);player.grounded=false;
 if(queuedJump>0||ride.left<=0){
  player.riding=null;m.rest=4;queuedJump=0;
  player.vy=ride.left>0?-565:-140;
  player.vx=m.kind==='bird'?player.facing*170:player.facing*120;
  player.inv=.85;player.tubeCooldown=Math.max(player.tubeCooldown,1);
  sound('jump');toast('🎠 Absprung! Huiii!');
  return true;
 }
 cam+=(clamp(player.x-viewW*.33,0,Math.max(0,level.width-viewW))-cam)*Math.min(1,dt*6);
 camY+=(clamp(player.y-330,-850,865)-camY)*Math.min(1,dt*7);
 return true;
}
function drawMount(m){
 const x=m.x-cam,y=m.y;
 if(x<-100||x>viewW+100)return;
 ctx.save();ctx.translate(x,y);ctx.rotate(m.angle||0);
 if(m.kind==='bird'){
  ellipse(-7,2,31,22,'#f3e5ff');ellipse(18,-13,18,21,'#f7f3ff');
  for(const side of [-1,1]){ctx.save();ctx.translate(side*14,-6);ctx.rotate(side*Math.sin(clock*17)*.28);
   ellipse(side*21,3,32,12,'#b5e7ed',side*.24);ctx.restore()}
  ctx.fillStyle='#f5ae67';ctx.beginPath();ctx.moveTo(32,-12);ctx.lineTo(49,-8);ctx.lineTo(32,-3);ctx.fill();
  ellipse(23,-18,4,5,'#39344c');ellipse(-17,12,5,3,'#e59aca');
 }else{
  // Body and golden spiral shell rotate with the surface; rider stays upright.
  ellipse(-17,5,43,16,'#e0d9a0');ellipse(17,-2,19,18,'#cbd6a6');
  ellipse(-10,-11,25,28,'#e8a9c5');ctx.strokeStyle='#fff4d2';ctx.lineWidth=5;
  ctx.beginPath();ctx.arc(-11,-11,15,0,Math.PI*1.8);ctx.stroke();
  ctx.beginPath();ctx.arc(-11,-11,6,0,Math.PI*1.6);ctx.stroke();
  for(const q of [-1,1]){line(20+q*7,-7,23+q*9,-31,'#9ac49d',4);ellipse(23+q*9,-31,5,6,'#f7ecff')}
  ctx.fillStyle='#f5f0ff';ctx.font='17px sans-serif';ctx.fillText('✦',-9,-10);
 }
 ctx.restore();
 if(player?.riding?.id===m.id){ctx.save();ctx.font='bold 13px Nunito,sans-serif';ctx.textAlign='center';
  ctx.fillStyle='#fff5dc';ctx.fillText('⏳ '+player.riding.left.toFixed(1)+'s',x,y-87);ctx.restore()}
}
function simulate(dt){if(phase!=='playing'||!player||!level)return;clock+=dt;discoverStoryEcho();tickCompanion(dt);if(phase!=='playing')return;tickChallenges(dt);
 for(const mount of level.mounts){if(mount.testFreeze>0)mount.testFreeze=Math.max(0,mount.testFreeze-dt);else mountPosition(mount,clock);mount.rest=Math.max(0,mount.rest-dt)}
 if(updateRiding(dt))return;
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
 const slick=level.challenges?.some(o=>o.type==='ice'&&Math.abs(player.x+20-o.x)<115&&player.grounded&&!player.route);
 const acceleration=slick?330:(player.grounded?2350:1470);
 player.vx+=(target-player.vx)*Math.min(1,dt* (acceleration/330));if(Math.abs(target)<1&&Math.abs(player.vx)<4)player.vx=0;
 if(target)player.facing=target>0?1:-1;
 if(queuedJump>0&&(player.grounded||coyote>0)){player.vy=save.perk==='bounce'?-750:-710;player.grounded=false;coyote=0;queuedJump=0;sound('jump')}
 if(!vxInput.jump&&player.vy<-280)player.vy+=save.perk==='glide'?1350*dt:1850*dt;
 const previousBottom=player.y+player.h;
 const priorVy=player.vy;
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
 // Precision landing: only a controlled descent from above earns a ride.
 for(const m of level.mounts){if(m.rest>0||player.riding||player.route!==m.route||priorVy<115)continue;
  const center=player.x+player.w/2,foot=player.y+player.h;
  const upper=m.y-(m.kind==='bird'?23:32);
  if(Math.abs(center-m.x)<(m.kind==='bird'?36:27)&&previousBottom<=upper+7&&foot>=upper-4&&foot<=upper+45){
   if(startRide(m))return;
  }
 }
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

function paintedArchitecture(x,y,act,index){
 if(x < -160 || x>viewW+160)return;
 ctx.save();ctx.translate(x,y);
 if(act===0){
  if(index%2===0){
   round(-34,-64,68,71,7,'#fff2de','#c78e9e',3);
   ctx.beginPath();ctx.moveTo(-47,-65);ctx.lineTo(0,-109);ctx.lineTo(47,-65);ctx.closePath();ctx.fillStyle='#b56899';ctx.fill();
   round(-14,-26,28,32,6,'#ad829a');round(-25,-56,16,17,3,'#fff6b8');
   round(9,-56,16,17,3,'#fff6b8');
  }else{
   for(let side of [-1,1]){line(side*30,1,side*30,-94,'#996e94',8)}
   line(-44,-92,44,-92,'#fbe3c7',12);line(-40,-99,40,-99,'#ad6195',6);
   ellipse(0,-97,6,7,'#f8c891');
  }
 }else if(act===1){
  // Tall enchanted bark and a congregation of luminous spore lanterns.
  round(-20,-135,40,140,12,'#658a83','#335e66',3);
  ellipse(0,-147,62,53,'#63937e');ellipse(-34,-113,36,46,'#477e75');
  ellipse(36,-113,35,43,'#8ab995');
  ctx.strokeStyle='#c2d9a8';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(12,-120);ctx.bezierCurveTo(-30,-70,35,-40,-4,2);ctx.stroke();
  for(let i=0;i<4;i++){let px=-43+i*29,py=-29-i%2*27;ellipse(px,py,8,5,'#d6e9b8');ellipse(px,py+7,3,10,'#91bc9c');ellipse(px,py,2,2,'#fff3af')}
 }else if(act===2){
  // Opaline mineral towers, pastry moon rings and hanging star ornaments.
  for(let i=-1;i<=1;i++){
   let px=i*29;ctx.beginPath();ctx.moveTo(px-18,6);ctx.lineTo(px-17,-50);ctx.lineTo(px,-117+Math.abs(i)*28);ctx.lineTo(px+19,-49);ctx.lineTo(px+18,6);ctx.closePath();
   ctx.fillStyle=i===0?'#e5aedb':'#aeb8ed';ctx.fill();ctx.strokeStyle='#fff6ef';ctx.lineWidth=3;ctx.stroke();
   line(px-5,-60,px-5,-25,'#fff9d4',2);
  }
  ellipse(0,-130,37,11,'#fdf0cf');ellipse(0,-130,21,7,'#efbfd5');
 }else{
  // Gothic clocktower and moving hands distinguish the mechanical kingdom.
  round(-41,-163,82,171,13,'#514770','#deb39b',4);
  round(-30,-151,60,144,6,'#6c5889','#ffdfba',3);
  ellipse(0,-95,31,31,'#b7859b');ellipse(0,-95,27,27,'#fff1d7');
  for(let i=0;i<12;i++){let a=i*Math.PI/6;line(Math.sin(a)*20,-95-Math.cos(a)*20,Math.sin(a)*25,-95-Math.cos(a)*25,'#76537c',2)}
  line(0,-95,Math.sin(clock*.45)*17,-95-Math.cos(clock*.45)*17,'#4d3d61',4);
  line(0,-95,Math.sin(clock*.11+index)*24,-95-Math.cos(clock*.11+index)*24,'#4d3d61',3);
  ellipse(0,-95,4,4,'#ac7299');
 }
 ctx.restore();
}
function worldAtmosphere(){
 const act=actOf(level.index);ctx.save();
 for(let i=0;i<8;i++){
  const x=((i*337+89-cam*.36)%(viewW+440)+viewW+440)%(viewW+440)-150;
  paintedArchitecture(x,365+(i%3)*12,act,i);
 }
 if(act===0){
  for(let i=0;i<20;i++){const x=((i*113+clock*13*(i%2?1:-1)-cam*.16)%(viewW+180)+viewW+180)%(viewW+180)-40;
   ellipse(x,55+i%8*48+Math.sin(clock+i)*10,5,3,'#ffc4dd',Math.sin(clock+i))}
 }else if(act===1){
  for(let i=0;i<28;i++){const x=((i*137+cam*.1)%(viewW+200)+viewW+200)%(viewW+200)-40,y=48+i%7*46+Math.sin(clock+i)*8;
   ellipse(x,y,2,2,i%3?'#e6eec9':'#ffdd92')}
 }else if(act===2){
  for(let i=0;i<19;i++){const x=((i*167-cam*.23)%(viewW+200)+viewW+200)%(viewW+200)-60,y=56+i%6*49+Math.sin(clock+i)*11;
   ellipse(x,y,3,8,'#fff8f6',clock*.5+i)}
 }else{
  ctx.globalAlpha=.23;const gradient=ctx.createLinearGradient(0,235,0,HEIGHT);
  gradient.addColorStop(0,'#8467b000');gradient.addColorStop(1,'#4d3d77');
  ctx.fillStyle=gradient;ctx.fillRect(0,235,viewW,HEIGHT-235);
  for(let i=0;i<10;i++){let x=((i*215-cam*.09)%(viewW+250)+viewW+250)%(viewW+250)-80;
   line(x,25,x,240,'#f9ddaf',2);ellipse(x,240,5,7,'#ffcfa4')}
 }
 ctx.restore();
}
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
 landscapeDetails();worldAtmosphere();
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
function enemyFinery(e,x,y){
 if(e.route)return;
 const t=e.type,phase=clock*3+e.seed;
 ctx.save();ctx.translate(x,y);
 const metal=ctx.createLinearGradient(0,-82,0,24);metal.addColorStop(0,'#fff6df');metal.addColorStop(.5,t==='ninja'?'#5b5d80':'#b8a6ce');metal.addColorStop(1,'#68617f');
 const shade=e.type==='witch'?'#9d7bcc':e.type==='guardian'?'#6c8e86':e.type==='ninja'?'#514d70':'#cd93b2';
 if(t==='scout'){round(-29,-34,58,7,4,'#c77e9a');ellipse(-22,-31,6,5,'#fff1db');ellipse(21,-31,6,5,'#fff1db');}
 if(t==='armored'||t==='guardian'){
  round(-29,-13,58,34,10,metal,'#5e6883',2);
  round(-21,-9,42,8,4,'#e6e5db');drawRosette(0,3,t==='guardian'?'#82baaa':'#c7afd9',.38);
  for(let side of [-1,1]){ellipse(side*27,-4,12,11,'#d3d4e4');ellipse(side*27,-4,5,5,'#fff3dc')}
 }
 if(t==='ninja'){
  round(-28,-27,56,16,6,'#36364f','#9d7abc',3);
  for(let side of [-1,1])ellipse(side*12,-20,4,5,'#f1d5d9');
  ctx.beginPath();ctx.moveTo(-29,0);ctx.quadraticCurveTo(-60,15+Math.sin(phase)*8,-52,-23);ctx.lineTo(-19,-6);ctx.fillStyle='#8a80ae';ctx.fill();
 }
 if(t==='witch'){
  ctx.beginPath();ctx.moveTo(-26,-46);ctx.lineTo(0,-103+Math.sin(phase)*4);ctx.lineTo(26,-46);ctx.closePath();ctx.fillStyle=metal;ctx.fill();
  round(-36,-50,72,9,5,shade,'#f2dfff',2);
  for(let i=0;i<3;i++){let px=-38+i*38;ellipse(px,-72+Math.sin(phase+i)*8,3,4,'#eaffdd')}
 }
 if(t==='archer'){
  ctx.strokeStyle='#9b6d6c';ctx.lineWidth=6;ctx.beginPath();ctx.arc(28,0,26,-1.25,1.25);ctx.stroke();
  line(37,-22,37,20,'#fff6df',2);
  round(-25,-13,44,26,9,'#788a76','#d5f0b9',2);
 }
 if(t==='jumper'){for(let side of [-1,1]){ellipse(side*22,24,12,5,'#e3abc7');ellipse(side*22,21,7,3,'#fff2d3')}}
 if(t==='phantom'){ctx.globalAlpha=.4+Math.sin(clock*4+e.seed)*.2;ellipse(0,-11,38,48,'#cbd1fc');ctx.globalAlpha=1;
  ctx.fillStyle='#f8eaf9';ctx.font='bold 24px serif';ctx.textAlign='center';ctx.fillText('☾',0,-59)}
 if(t==='titan'){round(-32,-11,64,35,11,'#8a5b79','#e9b8d2',4);ellipse(0,2,12,15,'#ffdc9e')}
 for(let i=0;i<3;i++)if(t==='witch'||t==='phantom'){let a=phase*.5+i*Math.PI*2/3;ellipse(Math.cos(a)*40,-18+Math.sin(a)*15,3,3,'#fff9cf')}
 ctx.restore();
}
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
 enemyFinery(e,x,y);
 if(e.maxHp>1){const w=56,h=7,top=y-(e.type==='witch'?104:e.type==='titan'?95:75);round(x-w/2,top,w,h,3,'#513c69');round(x-w/2+2,top+1,(w-4)*e.hp/e.maxHp,h-2,3,e.hp/e.maxHp>.33?'#f9a1b8':'#ffcc73')}
 ctx.restore()}
function drawNpcAccents(name,x,y){
 ctx.save();ctx.translate(x,y);ctx.globalAlpha=.96;
 if(name==='Pip'){
  // Courier satchel and a deliberately over-sized postal beret.
  round(-16,-62,32,13,6,'#c1e6b1','#6b9d90',2);
  ctx.beginPath();ctx.moveTo(-27,-58);ctx.lineTo(0,-81);ctx.lineTo(19,-55);ctx.closePath();ctx.fillStyle='#608879';ctx.fill();
  ctx.strokeStyle='#9d7182';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-16,-1);ctx.lineTo(22,31);ctx.stroke();
  round(13,20,26,21,5,'#e5bb8a','#ae806b',2);
  ctx.font='bold 13px serif';ctx.fillStyle='#765d71';ctx.fillText('✉',18,35);
 }else if(name==='Dahlia'){
  // Queen's crown and delicate shawl; ambiguity without villain caricature.
  const g=ctx.createLinearGradient(0,-90,0,-43);g.addColorStop(0,'#fff6c4');g.addColorStop(1,'#be9d78');
  ctx.beginPath();ctx.moveTo(-26,-56);ctx.lineTo(-26,-82);ctx.lineTo(-13,-67);ctx.lineTo(0,-93);ctx.lineTo(13,-67);ctx.lineTo(25,-82);ctx.lineTo(26,-56);ctx.closePath();ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='#fff5e7';ctx.lineWidth=2;ctx.stroke();
  ellipse(0,-64,6,5,'#db8db7');ctx.strokeStyle='#dfc8e8';ctx.lineWidth=7;ctx.beginPath();ctx.arc(0,5,23,.1,Math.PI-.1);ctx.stroke();
 }else if(name==='Yuki'){
  // Botanist with a leaf diadem and pale green explorer sash.
  ctx.strokeStyle='#e9f4ca';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-18,-10);ctx.lineTo(17,19);ctx.stroke();
  for(let k=-1;k<=1;k++)ellipse(k*16,-65+(k%2)*7,12,6,'#9cd2b1',k*.24);
  ellipse(0,-68,3,4,'#ffe7b4');
 }else if(name==='Miso'){
  // Little hero carries a lantern and a patched adventure scarf.
  drawRibbon(0,-10,'#f0b38a');
  line(24,5,33,31,'#aa7989',3);ellipse(36,33,10,15,'#fff0ba');ellipse(36,35,4,5,'#ffd780');
 }
 ctx.restore();
}
function drawNPC([x,name,speech,kind]){if(x<cam-70||x>cam+viewW+70)return;drawCat(x-cam,407,.85,kind,Math.sin(clock*2+x)*2,1);drawNpcAccents(name,x-cam,407);ctx.save();ctx.font='bold 13px Nunito, sans-serif';const w=Math.min(220,ctx.measureText(name+' ♥').width+24);round(x-cam-w/2,324,w,26,12,'#fff6ec','#f3bbd5',2);ctx.fillStyle='#b16c94';ctx.textAlign='center';ctx.fillText(name+' ♥',x-cam,343);ctx.restore();if(player&&Math.abs(player.x-x)<155&&phase==='playing'&&speech){ctx.save();ctx.font='800 12px Nunito, sans-serif';const parts=wrapText(speech,215);const width=235,h=parts.length*17+15;round(clamp(x-cam-width/2,5,Math.max(5,viewW-width-5)),254-(h-32),width,h,13,'#fffaf3','#bba3be',2);ctx.textAlign='center';ctx.fillStyle='#755f7a';parts.forEach((s,k)=>ctx.fillText(s,clamp(x-cam,5+width/2,Math.max(5+width/2,viewW-5-width/2)),268-(h-32)+k*17));ctx.restore()}}
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
 const act=actOf(level.index);
 const palette=[
  ['#ffefdc','#b77d9f','#f6accb','#fff3c2'],
  ['#d4e5c8','#507c75','#a0cfab','#f7ecc0'],
  ['#e3d5fa','#936cab','#d3a5df','#fff2d7'],
  ['#c1b5d4','#685477','#dbaeb4','#f8d9a7']
 ][act];
 for(const h of level.houses){
  if(h.x<cam-112||h.x>cam+viewW+112)continue;
  const x=h.x-cam,light=.6+.4*Math.sin(clock*2+h.x);
  ctx.save();ctx.translate(x,0);
  ctx.shadowColor=palette[2];ctx.shadowBlur=h.used?3:10;
  round(-45,355,90,95,13,palette[0],palette[1],4);ctx.shadowBlur=0;
  // Each shop has a silhouette matched to the surrounding world.
  ctx.beginPath();ctx.moveTo(-54,359);ctx.quadraticCurveTo(-6,307,0,305);ctx.quadraticCurveTo(6,304,54,359);ctx.closePath();
  ctx.fillStyle=palette[1];ctx.fill();ctx.strokeStyle='#fff5db';ctx.lineWidth=4;ctx.stroke();
  if(act===1){for(let i=-2;i<=2;i++)ellipse(i*15,333,20,13,palette[2])}
  if(act===2){ellipse(0,316,32,13,'#f9e7ff');ellipse(0,316,21,8,palette[2])}
  if(act===3){for(let side of [-1,1]){line(side*39,348,side*39,320,palette[3],5);ellipse(side*39,320,6,6,palette[3])}}
  round(-20,387,40,62,15,palette[1],palette[3],3);
  round(-28,369,20,15,4,palette[3]);round(10,369,20,15,4,palette[3]);
  ellipse(-23,376,4,4,'#fff5cf');ellipse(17,376,4,4,'#fff5cf');
  ctx.textAlign='center';ctx.font='bold 27px Georgia,serif';ctx.fillStyle=h.used?'#bbb0b8':palette[3];
  ctx.fillText(h.used?'⌁':'⚄',0,354);
  // Animated mouse shopkeeper peeks through the upper window.
  if(!h.used){const peek=Math.max(0,Math.sin(clock*1.8+h.x)*9);
   ellipse(-8,337-peek,8,9,'#cdb3a8');ellipse(8,337-peek,8,9,'#cdb3a8');
   ellipse(0,340-peek,12,12,'#ead1ba');ellipse(-5,339-peek,2.3,3,'#5e5365');ellipse(5,339-peek,2.3,3,'#5e5365');
  }
  round(-35,452,70,22,8,h.used?'#9b90ab':palette[3],palette[1],2);
  ctx.font='bold 12px Nunito,sans-serif';ctx.fillStyle='#684b70';
  ctx.fillText(h.used?'BESUCHT':'10 MÜNZEN',0,468);
  for(let k=0;k<3;k++){ellipse(-31+k*28,356,3,3,'#fff5d4');}
  ctx.restore();
 }
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
// Hand-drawn vector outfits: every animal gets individual colors and prize names.
function materialGradient(upper,lower,y=-54,h=58){
 const g=ctx.createLinearGradient(0,y,0,y+h);g.addColorStop(0,upper);g.addColorStop(.48,'#fff9ef');g.addColorStop(.53,upper);g.addColorStop(1,lower);return g;
}
function drawRosette(x,y,color,scale=1){
 ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(clock*2.8+x)*.14);ctx.scale(scale,scale);
 for(let k=0;k<7;k++){const a=k*Math.PI*2/7;ellipse(Math.cos(a)*9,Math.sin(a)*9,8,13,color,a)}
 ellipse(0,0,9,9,'#fff4b5');ellipse(-2,-3,3,3,'#fff');ctx.restore();
}
function drawRibbon(x,y,color){
 ctx.save();ctx.translate(x,y);
 for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(side*24,-25,side*42,-10+Math.sin(clock*6)*5,side*30,10);ctx.lineTo(0,2);ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='#fff7ee';ctx.lineWidth=2;ctx.stroke()}
 ellipse(0,0,11,10,'#fff7e8');ellipse(0,0,5,6,color);ctx.restore();
}
function drawOutfit(x,y){
 if(!save.outfit||!player)return;
 const id=save.outfit,colors=OUTFIT_PALETTES[save.character]||OUTFIT_PALETTES.cat;
 const [base,dark,bright]=colors;
 const anim=player.dizzy>0?Math.sin(clock*21)*.20:Math.sin(clock*2.6)*.025;
 ctx.save();ctx.translate(x,y-66);ctx.rotate(anim);ctx.lineJoin='round';ctx.lineCap='round';
 const material=materialGradient(base,dark,-70,75);
 if(id==='armor'){
  round(-28,38,56,36,13,material,dark,3);
  round(-28,38,56,13,6,'#fff9de',dark,2);
  for(const side of [-1,1]){ellipse(side*30,47,13,13,material);ellipse(side*30,47,6,6,bright)}
  ctx.strokeStyle='#fff4dc';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,46);ctx.lineTo(0,70);ctx.stroke();drawRosette(0,52,base,.42);
 }else if(id==='mouse'){
  round(-25,-51,50,37,6,material,'#eed2a9',3);
  round(-38,-17,76,12,7,dark,bright,3);
  round(-24,-28,48,6,3,bright);
  const pop=Math.max(0,Math.sin(clock*2.7))*24;
  ctx.save();ctx.translate(0,-43-pop);
  ellipse(-11,-7,9,11,'#c3a8c2');ellipse(11,-7,9,11,'#c3a8c2');
  ellipse(-11,-7,5,6,'#efc7d4');ellipse(11,-7,5,6,'#efc7d4');
  ellipse(0,3,17,14,'#e2c9d8');ellipse(-6,1,2,3,'#503e5b');ellipse(6,1,2,3,'#503e5b');
  ellipse(0,7,3,2,'#d786a7');ctx.strokeStyle='#fff';ctx.lineWidth=1.2;
  for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(2*side,8);ctx.lineTo(17*side,12);ctx.stroke()}
  ctx.restore();
  if(pop>15){ellipse(27,-52-pop*.3,9,10,'#f8d46e');ellipse(27,-52-pop*.3,6,7,'#fff1b0');ctx.fillStyle='#b77b35';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('1',27,-49-pop*.3)}
 }else if(id==='clown'){
  ctx.beginPath();ctx.moveTo(-27,-12);ctx.quadraticCurveTo(-15,-52,3,-69);ctx.quadraticCurveTo(23,-50,29,-12);ctx.closePath();ctx.fillStyle=material;ctx.fill();
  ctx.strokeStyle=dark;ctx.lineWidth=3;ctx.stroke();
  for(let i=0;i<4;i++)ellipse(-14+i*9,-28-i*7,4,3,i%2?bright:'#fff');
  round(-32,-16,65,12,6,'#fff9e5',dark,2);drawRosette(28,-27,'#fca7bb',.95);
 }else if(id==='chef'){
  round(-22,-24,44,19,5,'#fffaf0',dark,2);
  for(const [cx,cy,r] of [[-20,-37,20],[0,-50,22],[22,-35,19]])ellipse(cx,cy,r,r*.8,'#fff8ef');
  round(-25,-31,50,11,4,base,bright,2);
  drawRosette(0,-34,base,.42);
 }else if(id==='crown'){
  ctx.beginPath();ctx.moveTo(-27,-12);ctx.lineTo(-30,-50);ctx.lineTo(-15,-31);ctx.lineTo(0,-57);ctx.lineTo(15,-31);ctx.lineTo(30,-50);ctx.lineTo(27,-12);ctx.closePath();
  ctx.fillStyle=materialGradient(bright,dark,-62,56);ctx.fill();ctx.strokeStyle=dark;ctx.lineWidth=3;ctx.stroke();
  round(-29,-21,58,13,5,base,bright,2);
  for(let i=-2;i<=2;i++)ellipse(i*11,-19-(i%2===0?3:0),4,5,i===0?'#f3a1d5':'#c3eaf4');
 }else if(id==='bow'){
  drawRibbon(0,-13,base);
  ctx.save();ctx.rotate(Math.sin(clock*6)*.1);
  for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(0,-7);ctx.lineTo(side*18,37+Math.sin(clock*4+side)*4);ctx.lineTo(side*5,29);ctx.closePath();ctx.fillStyle=side===1?base:bright;ctx.fill()}
  ctx.restore();
  ellipse(0,-11,7,7,dark);
 }
 if(['clown','mouse','chef','crown'].includes(id)){
  ellipse(-20,-14,4,2,'#ffffffbb');ellipse(17,-16,3,2,'#ffffff99');
 }
 ctx.restore();
}
function showRewardIllustration(roll,reward){
 const card=overlayContent.querySelector('.story-card');if(!card)return;
 card.classList.add('loot-card');
 const art=document.createElement('div');art.className='loot-art';
 const icons={1:'♥',2:'✦',3:'◈',4:'♛',5:'✿',6:'◇'};
 const symbol=icons[roll]||'✦',label=roll===4||roll===5?prizeName(save.outfit):reward.split('!')[0];
 art.innerHTML='<div class="loot-halo"><span class="loot-symbol">'+symbol+'</span><span class="loot-spark one">✦</span><span class="loot-spark two">✧</span><span class="loot-spark three">✦</span></div><strong>'+escapeText(label)+'</strong><small>NEU FREIGESCHALTET · '+escapeText(hero().name.toUpperCase())+'</small>';
 const title=card.querySelector('.story-title');title?.after(art);
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
 for(const p of [...level.ground,...level.platforms,...level.routePlatforms])drawGround(p);drawChallenges();
 for(let j=0;j<level.width/100;j++){const x=j*101+22;if(x<cam-20||x>cam+viewW+25)continue;const grounded=level.ground.some(p=>x>=p.x+9&&x<p.x+p.w-9);if(grounded){flower(x-cam,441,.56+rand(j*5+1)*.5,j);if(j%4===0)flower(x-cam+25,448,.37,j*2)}}
 for(const p of level.checkpoints){const x=p-cam;if(x<-30||x>viewW+30)continue;line(x,450,x,373,'#a5819d',5);ctx.font='29px sans-serif';ctx.fillText(save.checkpoint>=p?'💗':'🌼',x-16,375)}
 for(const item of level.items)drawMushroom(item);drawPowerMushroom(level.powerItem);for(const charm of level.charms)drawCharm(charm);for(const coin of level.coins)drawCoin(coin);drawHouses();for(const tube of level.tubes)drawTube(tube);
 level.npcs.forEach(drawNPC);drawCompanion();
 for(const e of level.enemies)drawEnemy(e);
 for(const m of level.mounts)drawMount(m);
 drawGate();
 if(isFinal(level.index)&&boss&&!boss.done&&boss.triggered){const x=boss.x+Math.sin(clock*1.3)*60-cam;drawCat(x+13,432,1.17,'shadow',Math.sin(clock*3)*2,-1);if(boss.active){ctx.font='25px Nunito';ctx.fillStyle='#fff';ctx.fillText('👑 SPIEGEL-MOMO',x-30,323);round(x-33,340,108,10,5,'#463353');round(x-31,342,104*boss.hp/boss.maxHp,6,3,'#fb98b5')}}
 if(player&&(player.inv<=0||player.riding||Math.floor(clock*14)%2===0)){
  const run=player.grounded&&Math.abs(player.vx)>30,bob=run?Math.abs(Math.sin(player.runCycle))*4:Math.sin(clock*3)*1.5;
  const mx=player.x+player.w/2-cam,my=player.y+player.h*.54;
  ctx.save();if(player.riding){const m=level.mounts.find(x=>x.id===player.riding.id);if(m?.kind==='snail'){ctx.translate(mx,my);ctx.rotate(m.angle||0);ctx.translate(-mx,-my)}}
  drawHero(mx,my,bob);ctx.restore()
 }
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
  challengeDebug:()=>level.challenges.map(({id,type,x,active,remaining,open,crumbles})=>({id,type,x,active,remaining,open,crumbles})),
  challengeTouch:(type)=>{const o=level.challenges.find(c=>c.type===type);if(!o)return false;player.x=o.x-20;player.y=390;player.grounded=true;vxInput.jump=true;tickChallenges(1/60);vxInput.jump=false;return o.active||player.vy<0||o.open||o.cooldown>0},
  friendDebug:()=>({visitor:level.visitor,companion:companion&&{...companion},friends:save.friends,meetings:save.friendEncounters.slice()}),
  friendMeet:()=>{if(!level.visitor)return false;player.x=level.visitor.x-20;friendMeeting();return true},
  friendHeal:()=>{if(!level.visitor)return false;return healFriend(level.visitor)},
  friendJoin:()=>{if(!level.visitor)return false;joinFriend(level.visitor);return true},
  setCoins:(n)=>{save.coins=Math.max(0,Math.min(999999,Math.floor(n)));persist();updateUI()},
  createSlot:name=>createNamedSlot(name),slots:()=>namedSlots().map(({name,level,coins})=>({name,level,coins})),loadSlot:name=>restoreNamedSlot(name),deleteSlot:name=>removeNamedSlot(name),
  musicMode:()=>detectMusicScene(),musicState:()=>({mode:detectMusicScene(),active:activeScore,transitions:musicTransitions,world:SCENE_IDS[actOf(save.level)]}),
  previewCostume:(key,character)=>{if(!Object.hasOwn(COSTUMES,key))return null;if(character&&Object.hasOwn(HEROES,character))save.character=character;save.outfit=key;persist();return prizeName(key)},
  testReward:(number=4)=>{const prior=Math.random;Math.random=()=>Math.max(0,Math.min(.999,(number-.5)/6));try{awardDice({id:'test-reward-'+save.level+'-'+number,used:false})}finally{Math.random=prior}return {costume:save.outfit,coins:save.coins,life:save.lives}},
  mystery:()=>mystery().name,seed:()=>save.seed,
  newCampaign:()=>{save=defaultSave();persist();enterLevel(0,false)},
  chat:(text,name='Pip')=>applyConversation(name,text),
  engage:()=>talkWithCat(),
  relations:()=>({...save.relations}),
  snapshot:()=>({phase,level:save.level,width:level.width,act:actOf(save.level),stage:level.stage,mounts:level.mounts.map(m=>({id:m.id,kind:m.kind,x:m.x,y:m.y,angle:m.angle,rest:m.rest})),ride:player?.riding?{...player.riding}:null,effects:{...effects},charms:level.charms.map(c=>({id:c.id,kind:c.kind,x:c.x,y:c.y,taken:c.taken})),player:player&&{x:player.x,y:player.y,vx:player.vx,vy:player.vy,grounded:player.grounded},collected:[...save.collected],power:save.power,shots:shots.length,hearts:save.hearts,checkpoint:save.checkpoint,flags:{...save.flags},shown:[...save.shown],boss:boss&&{...boss},ending:save.ending,winner:save.won,enemies:level.enemies.map(e=>({id:e.id,type:e.type,x:e.x,y:e.y,hp:e.hp,maxHp:e.maxHp,dead:e.dead})),enemyShots:enemyShots.length}),
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
  mount:(kind)=>{const m=level.mounts.find(x=>x.kind===kind);if(!m)return false;player.route=m.route;player.x=m.x-player.w/2;player.y=m.y-100;return startRide(m)},
  precisionLanding:(kind)=>{const m=level.mounts.find(x=>x.kind===kind);if(!m)return false;
   player.route=m.route;player.riding=null;player.tubeCooldown=3;player.x=m.x-player.w/2;player.y=m.y-130;player.vy=300;player.vx=0;player.grounded=false;player.inv=3;return true},
  giveCharm:(kind)=>{if(!CHARMS[kind])return false;takeCharm({kind,x:player.x+20,y:player.y+20,taken:false});return true},
  givePower:(name)=>{if(!POWERS[name])return false;transform({id:name,x:player.x+20,y:player.y+20,taken:false});return true},
  clearSave:()=>localStorage.removeItem(SAVE_KEY)
 };
}
setup();
if('serviceWorker' in navigator && location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();