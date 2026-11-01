import {GLYPHS,GLYPH_INDEX,LEVELS,COMPONENTS,STRUCTURES,ASSEMBLY_VARIANTS,placementText} from './glyph-data.mjs';
export const GLYPH_SAVE_KEY='wordward-glyph-save-v1';
const capacity=layout=>STRUCTURES[layout]?.positions.length||0;
const sameParts=(a,b)=>a.length===b.length&&a.every((p,i)=>p===b[i]);
const bag=parts=>[...parts].sort().join('|');
export function matchAssembly(layout,parts){const base=GLYPHS.find(g=>g.layout===layout&&sameParts(g.parts,parts));if(base)return base;const variant=ASSEMBLY_VARIANTS.find(g=>g.layout===layout&&sameParts(g.parts,parts));return variant?{...GLYPH_INDEX.get(variant.char),...variant}:null;}
export class GlyphGame{
 constructor(){this.level=1;this.history={};this.learned=[];this.practiced={};this.hints={};this.layout='lr';this.slots=[null,null];this.result=null;this.questIndex=0;}
 get chapter(){return LEVELS[this.level-1];}
 get completed(){return this.history[this.level]||[];}
 get complete(){return this.completed.length===this.chapter.targets.length;}
 get unlocked(){let id=1;while(id<LEVELS.length&&(this.history[id]||[]).length===LEVELS[id-1].targets.length)id++;return id;}
 get finishedLevels(){return LEVELS.filter(l=>(this.history[l.id]||[]).length===l.targets.length).length;}
 get quest(){return this.chapter.quests[this.questIndex];}
 get leaves(){return Object.values(this.history).reduce((n,chars)=>n+chars.length,0);}
 selectLevel(id){if(!Number.isInteger(id)||id<1||id>this.unlocked)return false;this.level=id;this.questIndex=Math.max(0,this.chapter.targets.findIndex(c=>!this.completed.includes(c)));this.resetDraft();return true;}
 selectQuest(index){if(!Number.isInteger(index)||index<0||index>=this.chapter.targets.length||this.completed.includes(this.chapter.targets[index]))return false;this.questIndex=index;return true;}
 resetDraft(){this.layout='lr';this.slots=[null,null];this.result=null;}
 setLayout(layout){if(!STRUCTURES[layout])return false;const filled=this.slots.filter(Boolean);this.layout=layout;this.slots=Array.from({length:capacity(layout)},(_,i)=>filled[i]||null);this.result=null;return true;}
 addPart(part,index=this.slots.indexOf(null)){if(!this.chapter.pool.includes(part)||!Number.isInteger(index)||index<0||index>=this.slots.length)return false;this.slots[index]=part;this.result=null;return true;}
 removePart(index){if(!Number.isInteger(index)||index<0||index>=this.slots.length)return false;this.slots[index]=null;this.result=null;return true;}
 swap(){if(this.slots.length!==2)return false;this.slots.reverse();this.result=null;return true;}
 assemble(){
  if(this.slots.some(p=>!p)){this.result=null;return{status:'incomplete',message:'再放一个部件，看看它们能变成什么字。'};}
  const glyph=matchAssembly(this.layout,this.slots);
  if(!glyph){this.result=null;const near=GLYPHS.find(g=>bag(g.parts)===bag(this.slots));return near?{status:'placement',message:`这些部件可以拼字。${placementText(near)}`}:{status:'uncollected',message:'这组部件还没收进本次工坊。可以换个部件再试试，不会扣分。'};}
  const fresh=!this.learned.includes(glyph.char);if(fresh)this.learned.push(glyph.char);this.result=glyph.char;return{status:'success',glyph,fresh};
 }
 apply(){
  if(!this.result||!GLYPH_INDEX.has(this.result))return{ok:false,message:'先把部件拼成一个字吧。'};
  const char=this.result,index=this.chapter.targets.indexOf(char);
  if(index<0)return{ok:false,message:`「${char}」已收进字册。这一关还有别的小任务，可以换个偏旁试试。`};
  if(this.completed.includes(char))return{ok:false,message:`「${char}」已经帮过忙了，试试还没点亮的小任务。`};
  this.history[this.level]=[...this.completed,char];this.questIndex=Math.max(0,this.chapter.targets.findIndex(c=>!this.completed.includes(c)));return{ok:true,char,index,effect:GLYPH_INDEX.get(char).effect,complete:this.complete};
 }
 hint(){if(this.complete)return{message:'这一关完成啦！可以写一写新字，或继续下一关。',step:0};const char=this.quest.char,key=this.level+':'+this.questIndex,n=(this.hints[key]||0)+1;this.hints[key]=Math.min(1000,n);const glyph=GLYPH_INDEX.get(char);return{step:n,message:n===1?this.quest.hint:`试着拼「${char}」（${glyph.pinyin}）。${placementText(glyph)}`};}
 recordPractice(char){if(!this.learned.includes(char)||!GLYPH_INDEX.has(char))return false;this.practiced[char]=Math.min(999,(this.practiced[char]||0)+1);return true;}
 export(){return{version:1,level:this.level,history:Object.fromEntries(Object.entries(this.history).map(([id,chars])=>[id,[...chars]])),learned:[...this.learned],practiced:{...this.practiced},hints:{...this.hints},layout:this.layout,slots:[...this.slots],result:this.result,questIndex:this.questIndex};}
 static restore(data){
  const object=x=>x&&typeof x==='object'&&!Array.isArray(x),integer=x=>Number.isSafeInteger(x)&&x>=0;
  if(!object(data)||data.version!==1||!Number.isInteger(data.level)||data.level<1||data.level>LEVELS.length||!object(data.history)||!object(data.practiced)||!object(data.hints)||!Array.isArray(data.learned)||data.learned.length>GLYPHS.length||new Set(data.learned).size!==data.learned.length||data.learned.some(c=>!GLYPH_INDEX.has(c)))throw Error('Invalid glyph save');
  const game=new GlyphGame();
  for(const[id,chars]of Object.entries(data.history)){const level=LEVELS[Number(id)-1];if(String(Number(id))!==id||!level||!Array.isArray(chars)||new Set(chars).size!==chars.length||chars.some(c=>!level.targets.includes(c)||!data.learned.includes(c)))throw Error('Invalid scene progress');game.history[id]=[...chars];}
  if(data.level>game.unlocked||Object.keys(game.history).some(id=>Number(id)>game.unlocked))throw Error('Invalid unlock progress');
  for(const[c,count]of Object.entries(data.practiced)){if(!data.learned.includes(c)||!integer(count)||count<1||count>999)throw Error('Invalid practice progress');game.practiced[c]=count;}
  for(const[key,count]of Object.entries(data.hints)){if(!/^(?:[1-9]|1\d|20):[0-2]$/.test(key)||!integer(count)||count>1000)throw Error('Invalid hints');game.hints[key]=count;}
  game.level=data.level;game.learned=[...data.learned];
  if(!STRUCTURES[data.layout]||!Array.isArray(data.slots)||data.slots.length!==capacity(data.layout)||data.slots.some(p=>p!==null&&!game.chapter.pool.includes(p))||!integer(data.questIndex)||data.questIndex>=game.chapter.targets.length)throw Error('Invalid draft');
  if(data.result!==null&&(!data.learned.includes(data.result)||matchAssembly(data.layout,data.slots)?.char!==data.result))throw Error('Invalid assembled character');
  game.layout=data.layout;game.slots=[...data.slots];game.result=data.result;game.questIndex=data.questIndex;return game;
 }
}
function length(points){let total=0;for(let i=1;i<points.length;i++)total+=Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]);return total;}
export function resample(points,n=28){
 const total=length(points);if(total<.001)return Array.from({length:n},()=>[...points[0]]);const out=[[...points[0]]];let traversed=0,index=1;
 for(let i=1;i<n-1;i++){const target=total*i/(n-1);while(index<points.length-1&&traversed+Math.hypot(points[index][0]-points[index-1][0],points[index][1]-points[index-1][1])<target){traversed+=Math.hypot(points[index][0]-points[index-1][0],points[index][1]-points[index-1][1]);index++;}const a=points[index-1],b=points[index],segment=Math.hypot(b[0]-a[0],b[1]-a[1]),t=segment?(target-traversed)/segment:0;out.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);}
 out.push([...points.at(-1)]);return out;
}
export const screenMedian=median=>median.map(([x,y])=>[x,900-y]);
export function evaluateStroke(points,median){
 if(!Array.isArray(points)||points.length<2||points.length>4000||points.some(p=>!Array.isArray(p)||p.length!==2||p.some(n=>!Number.isFinite(n)||n< -100||n>1124)))return{accepted:false,reason:'从亮点出发，顺着灰色笔画慢慢描。'};
 const expected=screenMedian(median),a=resample(points),b=resample(expected),dist=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]),reference=length(expected),drawn=length(points);
 const error=a.reduce((sum,p,i)=>sum+dist(p,b[i]),0)/a.length,maxError=Math.max(...a.map((p,i)=>dist(p,b[i]))),tolerance=Math.max(62,Math.min(115,reference*.2));
 const accepted=drawn>=Math.max(8,reference*.35)&&drawn<reference*3.5+60&&dist(a[0],b[0])<130&&dist(a.at(-1),b.at(-1))<145&&error<tolerance&&maxError<155;
 return{accepted,error,reason:accepted?'这一笔写好啦！':dist(a[0],b[0])>=130?'从发亮的小圆点开始写这一笔。':'顺着箭头的方向，慢慢描到这一笔的末尾。'};
}
export class WritingSession{
 constructor(data){if(!data||!Array.isArray(data.strokes)||!Array.isArray(data.medians)||data.strokes.length!==data.medians.length||!data.strokes.length||data.strokes.some(d=>typeof d!=='string'||!d)||data.medians.some(m=>!Array.isArray(m)||m.length<2||m.some(p=>!Array.isArray(p)||p.length!==2||p.some(n=>!Number.isFinite(n)))))throw Error('Invalid stroke data');this.data=data;this.index=0;}
 get complete(){return this.index===this.data.strokes.length;}
 submit(points){if(this.complete)return{accepted:false,complete:true,reason:'这个字已经描好啦。'};const result=evaluateStroke(points,this.data.medians[this.index]);if(result.accepted)this.index++;return{...result,complete:this.complete,index:this.index};}
}
