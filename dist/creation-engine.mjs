import {ALL_CHARACTERS,CHARACTER_INDEX,ALL_PARTS,STARTER_CHARACTERS,CREATIONS,CREATION_INDEX,LAYOUTS,matchCreation,WATER_KINDS,PLANT_KINDS,PERSON_KINDS,ACTION_KINDS,DISCOVERIES} from './creation-data.mjs';
export const CREATION_SAVE_KEY='wordward-creation-save-v1';
export const MAX_OBJECTS=80,MAX_ALBUM=8;
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const clone=x=>JSON.parse(JSON.stringify(x));
const person=e=>PERSON_KINDS.includes(e.kind),plant=e=>PLANT_KINDS.includes(e.kind),water=e=>WATER_KINDS.includes(e.kind);
const tree=e=>['tree','grove','forest','pine','willow','maple','fruitTree','blossomTree','bamboo','woodland','rainforest'].includes(e.kind);
const rainCondition=s=>['rain','heavyRain','thunder'].includes(s.weather);
const house=e=>['house','village','tower','castle','library'].includes(e.kind);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const integer=(n,min,max)=>Number.isInteger(n)&&n>=min&&n<=max;
const emptyScene=seed=>({title:'我的一方天地',seed,serial:0,weather:'none',time:'day',wind:false,frozen:false,hadRain:false,rainbow:false,sky:[],objects:[]});
export class CreationWorld{
 constructor(seed=Math.floor(Math.random()*0xffffffff)){
  this.rngState=(seed>>>0)||1;this.scene=emptyScene(this.rngState);this.knownChars=[...STARTER_CHARACTERS];this.knownWords=[];this.discoveries=[];this.album=[];this.recommendations=[];this.undoStack=[];this.refresh();
 }
 random(){let n=this.rngState;n^=n<<13;n^=n>>>17;n^=n<<5;this.rngState=n>>>0;return this.rngState/4294967296;}
 choose(rows){return rows[Math.floor(this.random()*rows.length)];}
 shuffle(rows){const a=[...rows];for(let i=a.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 refresh(){
  // Complete recipes, not random isolated scraps: no discovery depends on luck.
  const useful=ALL_CHARACTERS.filter(g=>g.parts.length===2&&CREATION_INDEX.has(g.char));
  const selected=this.shuffle(useful).slice(0,3),parts=[...new Set([...selected.flatMap(g=>g.parts),'人','木','水','雨','山','日'])];
  for(const p of this.shuffle(Object.keys(ALL_PARTS)))if(parts.length<12&&!parts.includes(p))parts.push(p);
  this.recommendations=this.shuffle(parts).slice(0,12);return this.recommendations;
 }
 get availableWords(){return CREATIONS.filter(c=>c.isWord&&[...c.text].every(ch=>this.knownChars.includes(ch)));}
 learn(layout,parts){const glyph=matchCreation(layout,parts);if(!glyph)return{ok:false,message:'这组部件暂未收录。可以换摆法，或去造物册看看配方。'};const fresh=!this.knownChars.includes(glyph.char);if(fresh)this.knownChars.push(glyph.char);return{ok:true,glyph,fresh,creation:CREATION_INDEX.get(glyph.char)||null};}
 word(chars){const text=Array.isArray(chars)?chars.join(''):chars;if(typeof text!=='string'||[...text].length<2||[...text].length>4)return{ok:false,message:'按顺序选 2—4 个字，再试着组合。'};if([...text].some(c=>!this.knownChars.includes(c)))return{ok:false,message:'先到造字台，把这个词里的字造出来。'};const creation=CREATION_INDEX.get(text);if(!creation?.isWord)return{ok:false,message:'这个词暂未收进造物册，并不代表它不是词语。'};const fresh=!this.knownWords.includes(text);if(fresh)this.knownWords.push(text);return{ok:true,creation,fresh};}
 checkpoint(){this.undoStack.push(clone({scene:this.scene,rngState:this.rngState}));if(this.undoStack.length>24)this.undoStack.shift();}
 undo(){const old=this.undoStack.pop();if(!old)return false;this.scene=old.scene;this.rngState=old.rngState;return true;}
 discover(id,events){if(!this.discoveries.includes(id)){this.discoveries.push(id);events.push({id,...DISCOVERIES[id]});}}
 spawn(text,kind,x,y,extra={}){const object={id:++this.scene.serial,text,kind,x:clamp(x,45,955),y:clamp(y,100,590),variant:Math.floor(this.random()*7),size:clamp((text.startsWith('大')?1.25:text.startsWith('小')?.75:1)*(.84+this.random()*.3),.55,1.7),growth:0,bloom:false,frozen:false,mood:'idle',...extra};this.scene.objects.push(object);return object;}
 canUse(text){const c=CREATION_INDEX.get(text);return!!c&&(c.isWord?this.knownWords.includes(text):this.knownChars.includes(text));}
 place(text,x=500,y=400){
  const c=CREATION_INDEX.get(text);if(!c||!this.canUse(text))return{ok:false,message:'先造出这个字或词，再放进画卷。'};
  if(!Number.isFinite(x)||!Number.isFinite(y))return{ok:false,message:'点一下画卷，选择落笔的位置。'};
  const kind=c.kind,events=[],s=this.scene;
  const waterRequired=['fish','goldfish','boat','sailboat','lotus'];
  const nearest=(predicate,point={x,y})=>s.objects.filter(predicate).sort((a,b)=>distance(a,point)-distance(b,point))[0];
  if(waterRequired.includes(kind)&&!s.objects.some(water))return{ok:false,message:'先造一汪水，再把它放进去吧。水、河、池塘都可以。'};
  const action=ACTION_KINDS.includes(kind);
  const need=['rest','run','jump','heart','sing'].includes(kind)?person:['clean','freeze','bubble'].includes(kind)?water:['grow','bloom','lush'].includes(kind)?plant:null;
  if(need&&!s.objects.some(need))return{ok:false,message:need===person?'先造一个人，再试试这个动作。':need===water?'先画出水，再让它发生变化。':'先种下花草树木，再试试这个变化。'};
  if(!action&&!['sun','moon','star','rainbow','cloud','darkCloud'].includes(kind)&&s.objects.length+( ['landscape','woodland'].includes(kind)?2:1)>MAX_OBJECTS)return{ok:false,message:'这幅画已经很热闹啦！可以挪走一些造物，或开启一张新画卷。'};
  this.checkpoint();let object=null;
  const rain=()=>{s.weather=kind==='heavyRain'?'heavyRain':kind==='thunder'?'thunder':'rain';s.hadRain=true;s.frozen=false;s.rainbow=false;for(const o of s.objects){if(plant(o))o.growth=clamp(o.growth+1,0,3);if(water(o))o.frozen=false;if(o.kind==='fire'){o.kind='smoke';o.text='烟';this.discover('fireOut',events);}}if(s.objects.some(plant))this.discover('rainGrowth',events);};
  const warm=()=>{if(s.frozen||s.objects.some(o=>o.frozen))this.discover('thaw',events);s.frozen=false;for(const o of s.objects)o.frozen=false;if(['snow','blizzard','frost'].includes(s.weather))s.weather='none';};
  const clear=()=>{warm();if(s.hadRain){s.rainbow=true;this.discover('rainbow',events);}s.weather='none';s.time='day';};
  const grow=(bloom=false)=>{for(const o of s.objects)if(plant(o)){o.growth=clamp(o.growth+1,0,3);if(bloom)o.bloom=true;}};
  if(['rain','heavyRain','thunder'].includes(kind))rain();
  else if(['snow','blizzard','frost','freeze'].includes(kind)){s.weather=kind==='freeze'?s.weather:kind;s.frozen=true;for(const o of s.objects)if(water(o))o.frozen=true;if(s.objects.some(water))this.discover('frozenWater',events);}
  else if(['clear','light','dawn','fairWind'].includes(kind)){clear();if(kind==='fairWind')s.wind=true;}
  else if(['night','sunset','moonlight','stars'].includes(kind)){s.time=kind==='sunset'?'dusk':'night';if(['stars','moonlight'].includes(kind)&&!s.sky.some(o=>o.kind===kind))s.sky.push({kind,x:clamp(x,100,900),y:clamp(y,55,250),variant:0,text});}
  else if(kind==='fog')s.weather='fog';
  else if(kind==='wind'){s.wind=true;}
  else if(kind==='warm')warm();
  else if(['grow','lush','bloom'].includes(kind))grow(kind==='bloom');
  else if(kind==='springBloom'){warm();s.weather='none';s.time='day';grow(true);this.discover('spring',events);}
  else if(kind==='clean'){for(const o of s.objects)if(water(o))o.clean=true;}
  else if(kind==='clearLandscape'){for(const o of s.objects){if(water(o))o.clean=true;if(plant(o))o.growth=clamp(o.growth+1,0,3);}clear();}
  else if(['rest','run','jump','heart','sing'].includes(kind)){for(const o of s.objects.filter(person))o.mood=kind;}
  else if(kind==='invite'){if(s.objects.length<MAX_OBJECTS)object=this.spawn('人','person',x,y);else{this.undoStack.pop();return{ok:false,message:'画卷有点挤啦，先挪走一个造物吧。'};}}
  else if(kind==='bubble'){for(const o of s.objects)if(water(o))o.bubbles=true;}
  else if(kind==='allLights'){s.time='night';for(const o of s.objects)if(house(o)||o.kind==='lantern')o.lit=true;}
  else if(kind==='birdsFlowers'){
   if(s.objects.length>MAX_OBJECTS-2){this.undoStack.pop();return{ok:false,message:'留出两个位置，再试试鸟语花香。'};}
   this.spawn('花','flower',x,y,{bloom:true});object=this.spawn('鸟','bird',x+42,y-64,{singing:true});
  }
  else if(['sun','moon','star','cloud','darkCloud','rainbow'].includes(kind)){
   if(kind==='sun'){s.time='day';s.sky=s.sky.filter(o=>o.kind!=='sun');}
   if(kind==='moon'){s.time='night';s.sky=s.sky.filter(o=>o.kind!=='moon');}
   if(kind==='star')s.time='night';if(kind==='rainbow')s.rainbow=true;
   if(s.sky.length>=24)s.sky.shift();s.sky.push({text,kind,x:clamp(x,50,950),y:clamp(y,50,255),variant:Math.floor(this.random()*5)});
  }
  else{
   let point={x,y},source=null;if(waterRequired.includes(kind)){source=nearest(water);point={x:clamp(x,source.x-60*source.size,source.x+60*source.size),y:source.y};}
   object=this.spawn(text,kind,point.x,point.y);if(source)object.waterAnchor=source.id;if(s.frozen&&water(object))object.frozen=true;if(['rain','heavyRain','thunder'].includes(s.weather)&&plant(object)){object.growth=1;this.discover('rainGrowth',events);}
   if(['rainforest','landscape','woodland'].includes(kind)){
    if(kind==='rainforest'){object.kind='forest';rain();}
    if(kind==='landscape'){object.kind='mountain';this.spawn('水','pond',x+65,y+48);}
    if(kind==='woodland'){object.kind='mountain';this.spawn('木','grove',x+35,y+20);}
   }
   const mountain=s.objects.find(o=>['mountain','peak'].includes(o.kind)&&distance(o,object)<210);if(water(object)&&mountain){object.falls=mountain.id;this.discover('waterfall',events);}if(['mountain','peak'].includes(object.kind)){const stream=s.objects.find(o=>water(o)&&distance(o,object)<210);if(stream){stream.falls=object.id;this.discover('waterfall',events);}}
  }
  // A welcoming habitat can attract a visitor. This never removes or harms
  // player creations; the seeded roll is included in undo and save/restore.
  if(s.objects.length<MAX_OBJECTS){
   const flowers=s.objects.filter(o=>['flower','flowerBed','garden','blossomTree','sunflower','dandelion'].includes(o.kind));
   if(s.time==='day'&&s.weather==='none'&&flowers.length>=2&&!s.objects.some(o=>o.kind==='butterfly')&&this.random()<.35){const f=this.choose(flowers);this.spawn('蝶','butterfly',f.x+42,f.y-30);}
   else if(rainCondition(s)&&s.objects.some(water)&&s.objects.some(plant)&&!s.objects.some(o=>o.kind==='frog')&&this.random()<.25){const pond=this.choose(s.objects.filter(water));this.spawn('蛙','frog',pond.x+66,pond.y+7);this.discover('rainFrog',events);}
   else if(s.objects.filter(tree).length>=3&&!s.objects.some(o=>o.kind==='bird')&&this.random()<.3){const t=this.choose(s.objects.filter(tree));this.spawn('鸟','bird',t.x+20,t.y-85);}
  }
  this.reactions(events);this.scene.sky=this.scene.sky.slice(-24);
  return{ok:true,creation:c,object,events,message:events.length?events.map(e=>e.title).join(' · '):action?`「${text}」让画卷发生了变化。`:`「${text}」落进画卷了，可以继续添画。`};
 }
 reactions(events=[]){
  const s=this.scene,raining=['rain','heavyRain','thunder'].includes(s.weather);
  for(const o of s.objects){
   if(water(o)){const peak=s.objects.find(e=>['mountain','peak'].includes(e.kind)&&distance(e,o)<210);if(peak)o.falls=peak.id;else delete o.falls;}
   if(person(o)){o.sheltered=raining&&s.objects.some(h=>house(h)&&distance(o,h)<160);o.umbrella=raining&&!o.sheltered;if(o.sheltered)this.discover('rainShelter',events);else if(o.umbrella)this.discover('umbrella',events);if(o.mood==='rest'&&s.objects.some(t=>tree(t)&&distance(o,t)<155))this.discover('treeRest',events);}
   if(['bird','monkey','bug'].includes(o.kind)){const t=s.objects.filter(tree).sort((a,b)=>distance(a,o)-distance(b,o))[0];o.perched=!!t&&distance(t,o)<180;if(o.perched){o.anchor=t.id;if(o.kind==='bird')this.discover('birdTree',events);}else delete o.anchor;}
   if(['butterfly','bee','dragonfly'].includes(o.kind)&&s.objects.some(f=>['flower','flowerBed','garden','blossomTree','lotus'].includes(f.kind)&&distance(f,o)<200))this.discover('flowerVisitor',events);
   if(['fish','goldfish'].includes(o.kind)&&s.objects.some(water))this.discover('waterLife',events);
   if(['boat','sailboat'].includes(o.kind)&&s.objects.some(water))this.discover('boatWater',events);
   if(o.kind==='windmill'&&s.wind)this.discover('windmill',events);
   if(['lantern','candle','house','village','library'].includes(o.kind)&&s.time!=='day')this.discover('nightLight',events);
  }
  return events;
 }
 move(id,x,y){const o=this.scene.objects.find(e=>e.id===id);if(!o||!Number.isFinite(x)||!Number.isFinite(y))return false;this.checkpoint();const oldX=o.x,oldY=o.y;o.x=clamp(x,45,955);o.y=clamp(y,100,590);if(water(o))for(const dependent of this.scene.objects.filter(e=>e.waterAnchor===id)){dependent.x=clamp(dependent.x+o.x-oldX,45,955);dependent.y=clamp(dependent.y+o.y-oldY,100,590);}else if(o.waterAnchor){const target=this.scene.objects.filter(water).sort((a,b)=>distance(a,o)-distance(b,o))[0];if(target){o.x=clamp(o.x,target.x-60*target.size,target.x+60*target.size);o.y=target.y;o.waterAnchor=target.id;}}this.reactions();return true;}
 remove(id){const i=this.scene.objects.findIndex(e=>e.id===id);if(i<0)return false;if(water(this.scene.objects[i])&&this.scene.objects.filter(water).length===1&&this.scene.objects.some(o=>['fish','goldfish','boat','sailboat','lotus'].includes(o.kind)))return false;this.checkpoint();this.scene.objects.splice(i,1);for(const dependent of this.scene.objects.filter(e=>e.waterAnchor===id)){const target=this.scene.objects.filter(water).sort((a,b)=>distance(a,dependent)-distance(b,dependent))[0];if(target){dependent.waterAnchor=target.id;dependent.x=target.x;dependent.y=target.y;}}this.reactions();return true;}
 restyle(id,{variant=false,resize=false}={}){const o=this.scene.objects.find(e=>e.id===id);if(!o)return false;this.checkpoint();if(variant)o.variant=(o.variant+1)%7;if(resize)o.size=o.size>=1.45?.7:Math.min(1.65,o.size+.2);this.reactions();return true;}
 rename(title){const t=typeof title==='string'?title.trim().slice(0,24):'';if(!t)return false;this.checkpoint();this.scene.title=t;return true;}
 newScene(){if(this.album.length>=MAX_ALBUM)return{ok:false,message:'画册已有 8 幅画，先导出或删除一幅再开新卷。'};if(this.scene.objects.length||this.scene.sky.length||this.scene.weather!=='none')this.album.push(clone(this.scene));this.scene=emptyScene(Math.floor(this.random()*0xffffffff)||1);this.undoStack=[];return{ok:true};}
 openAlbum(index){if(!integer(index,0,this.album.length-1))return false;const incoming=this.album[index];this.album[index]=clone(this.scene);this.scene=clone(incoming);this.undoStack=[];return true;}
 deleteAlbum(index){if(!integer(index,0,this.album.length-1))return false;this.album.splice(index,1);return true;}
 migrateLessons(data){if(!data||!Array.isArray(data.learned))return;for(const c of data.learned)if(CHARACTER_INDEX.has(c)&&!this.knownChars.includes(c))this.knownChars.push(c);}
 export(){return{version:1,rngState:this.rngState,scene:clone(this.scene),knownChars:[...this.knownChars],knownWords:[...this.knownWords],discoveries:[...this.discoveries],album:clone(this.album),recommendations:[...this.recommendations]};}
 static restore(data){
  const object=x=>x&&typeof x==='object'&&!Array.isArray(x),unique=(xs,valid,max)=>Array.isArray(xs)&&xs.length<=max&&new Set(xs).size===xs.length&&xs.every(valid);
  if(!object(data)||data.version!==1||!integer(data.rngState,1,0xffffffff)||!unique(data.knownChars,c=>CHARACTER_INDEX.has(c),ALL_CHARACTERS.length)||!unique(data.knownWords,w=>CREATION_INDEX.get(w)?.isWord&&[...w].every(c=>data.knownChars.includes(c)),CREATIONS.length)||!unique(data.discoveries,id=>Object.hasOwn(DISCOVERIES,id),Object.keys(DISCOVERIES).length)||!Array.isArray(data.album)||data.album.length>MAX_ALBUM||!unique(data.recommendations,p=>Object.hasOwn(ALL_PARTS,p),12))throw Error('Invalid creation progress');
  const validateScene=s=>{
   if(!object(s)||typeof s.title!=='string'||!s.title.trim()||s.title.length>24||!integer(s.seed,1,0xffffffff)||!integer(s.serial,0,10000000)||!['none','rain','heavyRain','thunder','snow','blizzard','frost','fog'].includes(s.weather)||!['day','night','dusk'].includes(s.time)||['wind','frozen','hadRain','rainbow'].some(k=>typeof s[k]!=='boolean')||!Array.isArray(s.objects)||s.objects.length>MAX_OBJECTS||!Array.isArray(s.sky)||s.sky.length>24)throw Error('Invalid painting');
   const ids=new Set();for(const o of s.objects){if(!object(o)||!integer(o.id,1,s.serial)||ids.has(o.id)||!CREATION_INDEX.has(o.text)||typeof o.kind!=='string'||!Object.values(CREATIONS).some(c=>c.kind===o.kind)||!Number.isFinite(o.x)||o.x<45||o.x>955||!Number.isFinite(o.y)||o.y<100||o.y>590||!Number.isFinite(o.size)||o.size<.55||o.size>1.7||!integer(o.variant,0,6)||!integer(o.growth,0,3)||typeof o.bloom!=='boolean'||typeof o.frozen!=='boolean'||!['idle','rest','run','jump','heart','sing'].includes(o.mood))throw Error('Invalid object');ids.add(o.id);}
   for(const o of s.sky)if(!object(o)||!['sun','moon','star','cloud','darkCloud','rainbow','stars','moonlight'].includes(o.kind)||!Number.isFinite(o.x)||o.x<0||o.x>1000||!Number.isFinite(o.y)||o.y<0||o.y>300||!integer(o.variant,0,4)||!CREATION_INDEX.has(o.text))throw Error('Invalid sky');
  };
  validateScene(data.scene);data.album.forEach(validateScene);const game=new CreationWorld(data.rngState);game.rngState=data.rngState;game.scene=clone(data.scene);game.knownChars=[...data.knownChars];game.knownWords=[...data.knownWords];game.discoveries=[...data.discoveries];game.album=clone(data.album);game.recommendations=[...data.recommendations];return game;
 }
}
