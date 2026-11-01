import {GLYPHS,GLYPH_INDEX,LEVELS,COMPONENTS,STRUCTURES,placementText,structureName} from './glyph-data.mjs';
import {GlyphGame,GLYPH_SAVE_KEY,WritingSession,screenMedian} from './glyph-engine.mjs';
import {worldArt,registerArtGlyphs} from './glyph-art.mjs';
const $=selector=>document.querySelector(selector);
const esc=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
registerArtGlyphs(GLYPHS);
let game=new GlyphGame(),audioOn=true,saveWorks=true,playing=false,focusSlot=null,lastChar=null,drag=null,suppressClick=0,writer=null,strokeBundle=null;
const demoTimers=new Set();
try{const raw=localStorage.getItem(GLYPH_SAVE_KEY);if(raw&&raw.length<100000)game=GlyphGame.restore(JSON.parse(raw));audioOn=localStorage.getItem('wordward-glyph-audio-v1')!=='off';}catch{}
const dialog=$('#glyph-dialog');
function syncViewport(){const installed=navigator.standalone===true||matchMedia('(display-mode: standalone)').matches;document.documentElement.dataset.glyphStandalone=String(installed);if(installed)document.documentElement.style.removeProperty('--glyph-height');else document.documentElement.style.setProperty('--glyph-height',innerHeight+'px');}
syncViewport();
for(const name of ['resize','orientationchange','pageshow'])window.addEventListener(name,syncViewport);
window.visualViewport?.addEventListener('resize',syncViewport);
matchMedia('(display-mode: standalone)').addEventListener('change',syncViewport);
for(const name of ['selectstart','contextmenu','dblclick'])document.addEventListener(name,event=>event.preventDefault());
for(const name of ['gesturestart','gesturechange'])document.addEventListener(name,event=>event.preventDefault(),{passive:false});
document.addEventListener('touchmove',event=>{if(event.touches.length>1)event.preventDefault();},{passive:false});
document.addEventListener('wheel',event=>{if(event.ctrlKey)event.preventDefault();},{passive:false});
function save(){try{localStorage.setItem(GLYPH_SAVE_KEY,JSON.stringify(game.export()));saveWorks=true;}catch{saveWorks=false;}$('#glyph-save-status').textContent=saveWorks?'✓ 造字进度自动保存':'本次进度暂未保存，仍可继续玩';$('#glyph-home-save').textContent=saveWorks?'造字进度保存在当前浏览器，与塔防分别记录。':'当前浏览器无法保存进度，本次仍可继续玩。';}
function announce(text){$('#glyph-live').textContent=text;}
function feedback(text,success=false){$('#glyph-feedback').textContent=text;$('#glyph-feedback').classList.toggle('success',success);announce(text);}
function speak(char){const glyph=GLYPH_INDEX.get(char);if(!glyph||!audioOn)return;if(!('speechSynthesis'in window)){feedback('这里暂时不能朗读，拼音和释义仍然可以看。');return;}try{speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(glyph.meaning.replace(/这里读[^。]+。/g,''));utterance.lang='zh-CN';utterance.rate=.82;const voice=speechSynthesis.getVoices().find(v=>/^zh[-_]CN/i.test(v.lang))||speechSynthesis.getVoices().find(v=>/^zh/i.test(v.lang));if(voice)utterance.voice=voice;speechSynthesis.speak(utterance);}catch{feedback('朗读暂时不可用，可以先看拼音和释义。');}}
function renderAudio(){const b=$('#glyph-audio');b.textContent=audioOn?'♪':'静';b.setAttribute('aria-label',audioOn?'关闭造字朗读':'开启造字朗读');b.setAttribute('aria-pressed',String(audioOn));}
$('#glyph-audio').onclick=()=>{audioOn=!audioOn;if(!audioOn)window.speechSynthesis?.cancel();try{localStorage.setItem('wordward-glyph-audio-v1',audioOn?'on':'off');}catch{}renderAudio();};
function renderHome(){
 $('#glyph-progress').textContent=game.learned.length?`已经认识 ${game.learned.length} 个字，点亮 ${game.leaves} 片叶子`:'认识新字，从这一笔开始';
 const next=game.complete&&game.level<LEVELS.length?game.level+1:game.level;
 $('#glyph-continue').textContent=game.leaves||game.learned.length?`继续第 ${next} 关 →`:'从第一关出发 →';$('#glyph-book-count').textContent=`${game.learned.length} / ${GLYPHS.length}`;
 $('#glyph-level-grid').innerHTML=LEVELS.map(level=>{const count=(game.history[level.id]||[]).length,locked=level.id>game.unlocked;return `<button class="g-level-card ${count===3?'complete':''} ${level.id===next?'current':''}" data-glyph-level="${level.id}" ${locked?'disabled':''} aria-label="第 ${level.id} 关 ${esc(level.title)}，${locked?'尚未解锁':`完成 ${count} 个任务`}"><span class="g-level-family ${level.family.length>1?'long':''}" aria-hidden="true">${esc(level.family)}</span><div><small>第 ${String(level.id).padStart(2,'0')} 关${locked?' · 待解锁':''}</small><h3>${esc(level.title)}</h3></div><span class="g-level-leaves" aria-hidden="true">${'◆'.repeat(count)}${'◇'.repeat(3-count)}</span></button>`;}).join('');
 $('#glyph-home-picture').innerHTML=worldArt(LEVELS[0],game.history[1]||[],null,true);
}
function enterLevel(id,preserve=false){
 if(!preserve&&!game.selectLevel(id))return;
 playing=true;focusSlot=null;lastChar=game.result||game.completed.at(-1)||null;
 $('#glyph-home').hidden=true;$('#glyph-stage').hidden=false;document.body.classList.add('glyph-playing');document.documentElement.classList.add('glyph-playing');syncViewport();window.scrollTo(0,0);renderStage();save();feedback(game.complete?'小风景已经点亮啦，可以再认识几个字，或继续下一关。':'先选结构，再点部件。部件可以重复使用，也可以拖进格子里。');
}
function leaveStage(){playing=false;stopWriter();closeDialog();document.body.classList.remove('glyph-playing');document.documentElement.classList.remove('glyph-playing');$('#glyph-stage').hidden=true;$('#glyph-home').hidden=false;save();renderHome();window.scrollTo(0,0);}
$('#glyph-continue').onclick=()=>{const next=game.complete&&game.level<LEVELS.length?game.level+1:game.level;enterLevel(next,next===game.level);};
$('#glyph-level-grid').onclick=event=>{const b=event.target.closest('[data-glyph-level]');if(b&&!b.disabled)enterLevel(Number(b.dataset.glyphLevel));};
$('#glyph-levels').onclick=leaveStage;
function nextLevel(){if(game.level<LEVELS.length)enterLevel(game.level+1);else leaveStage();}
$('#glyph-next-level').onclick=nextLevel;
function renderScene(last=null){
 $('#glyph-next-level').hidden=!game.complete;$('#glyph-next-level').textContent=game.level<LEVELS.length?'下一关 →':'回到造字小径 →';
 $('#glyph-stage-index').textContent=`第 ${game.level} / ${LEVELS.length} 关`;
 $('#glyph-stage-title').textContent=game.chapter.title;$('#glyph-stage-count').textContent=game.learned.length;
 $('#glyph-quest-text').textContent=game.complete?'小风景修好啦！写一写刚学会的字，再去下一站吧。':game.quest.prompt;
 $('#glyph-scene-leaves').textContent='◆'.repeat(game.completed.length)+'◇'.repeat(3-game.completed.length);
 $('#glyph-world').innerHTML=worldArt(game.chapter,game.completed,last)+`<span class="g-world-caption">${esc(game.chapter.title)}</span><span class="g-world-progress">${game.complete?'一字一景，已经点亮':'小狐狸在等你的新字'}</span>`;
 $('#glyph-goals').innerHTML=game.chapter.quests.map((q,i)=>{const done=game.completed.includes(q.char);return `<button class="g-goal ${done?'done':i===game.questIndex?'current':''}" data-glyph-quest="${i}" aria-label="${esc(done?'复习'+q.char:q.prompt)}">${done?`<b>${q.char}</b>`:`<small>${i+1}</small>`}<span>${esc(done?q.after:q.before)}</span>${done?'<small>✓</small>':''}</button>`;}).join('');
}
function renderWorkshop(){
 $('#glyph-stage-count').textContent=game.learned.length;
 $('#glyph-structure-bar').innerHTML=Object.entries(STRUCTURES).map(([id,s])=>`<button class="g-structure" data-layout="${id}" aria-pressed="${game.layout===id}"><i aria-hidden="true"></i>${s.name}</button>`).join('');
 const slots=$('#glyph-slots');slots.dataset.layout=game.layout;slots.dataset.outer=game.slots[0]||'';slots.innerHTML=game.slots.map((part,i)=>`<button class="g-slot ${part?'':'empty'}" data-slot="${i}" aria-label="${STRUCTURES[game.layout].positions[i]}，${part?esc(COMPONENTS[part].name)+'，点击移走':'空格，点击选择位置'}">${esc(part||STRUCTURES[game.layout].positions[i])}${part?`<small>${STRUCTURES[game.layout].positions[i]}</small>`:''}</button>`).join('');
 $('#glyph-swap').hidden=game.slots.length!==2;
 const glyph=GLYPH_INDEX.get(game.result||lastChar);$('#glyph-practice').disabled=!glyph;
 $('#glyph-result').innerHTML=glyph?`<div class="g-result-head"><button class="g-result-char" id="glyph-result-detail" aria-label="查看${glyph.char}的释义">${glyph.char}</button><div><pinyin>${glyph.pinyin}</pinyin><small>${structureName(glyph)}${game.result?' · 造好啦':' · 刚刚认识'}</small></div><button class="g-listen" id="glyph-read" aria-label="听${glyph.char}的读音和释义">♪</button></div><p>${esc(glyph.meaning)}</p>`:'<div class="g-result-empty">偏旁搭一搭，<br>小世界有变化。<small>先选一个部件，试试放在哪里。</small></div>';
 const parts=$('#glyph-parts');parts.classList.toggle('few',game.chapter.pool.length<=4);parts.innerHTML=game.chapter.pool.map(part=>`<button class="g-part" data-part="${esc(part)}" title="${esc(COMPONENTS[part].note)}" aria-label="添加${esc(COMPONENTS[part].name)}"><b>${esc(part)}</b><small>${esc(COMPONENTS[part].name.replace('字部件',''))}</small></button>`).join('');
 const button=$('#glyph-forge');button.disabled=!game.result&&game.slots.some(p=>!p);
 button.textContent=game.complete&&game.result&&game.completed.includes(game.result)?(game.level<LEVELS.length?'下一关 →':'回到造字小径 →'):game.result?(game.chapter.targets.includes(game.result)&&!game.completed.includes(game.result)?`用「${game.result}」改变风景 →`:'继续搭一搭 →'):'拼成一个字 →';
}
function renderStage(){renderScene();renderWorkshop();}
function addPart(part,index=focusSlot){
 const slot=index!==null&&index!==undefined?index:game.slots.indexOf(null);
 if(!game.addPart(part,slot)){feedback('格子里已经放满啦。点一个部件移走，或者点「重摆」。');return;}
 focusSlot=null;renderWorkshop();feedback(`${COMPONENTS[part].name}放好了。${COMPONENTS[part].note}`);save();
}
$('#glyph-structure-bar').onclick=event=>{const b=event.target.closest('[data-layout]');if(!b)return;game.setLayout(b.dataset.layout);focusSlot=null;renderWorkshop();feedback(`${STRUCTURES[game.layout].name}摆法。点格子可以移走部件，再换一个试试。`);save();};
$('#glyph-parts').onclick=event=>{if(Date.now()<suppressClick)return;const b=event.target.closest('[data-part]');if(b)addPart(b.dataset.part);};
$('#glyph-slots').onclick=event=>{const b=event.target.closest('[data-slot]');if(!b)return;const index=Number(b.dataset.slot);game.removePart(index);focusSlot=index;renderWorkshop();feedback(`下一块部件会放在${STRUCTURES[game.layout].positions[index]}。`);save();};
$('#glyph-swap').onclick=()=>{game.swap();focusSlot=null;renderWorkshop();save();feedback('换个位置，看看字形有什么不同。');};
$('#glyph-clear').onclick=()=>{game.slots.fill(null);game.result=null;focusSlot=null;renderWorkshop();save();feedback('格子空出来啦，部件还在，可以再用。');};
function continueDraft(){
 const core=game.chapter.family;let retained=false;game.slots=game.slots.map(part=>{if(!retained&&part===core){retained=true;return part;}return null;});game.result=null;focusSlot=null;
}
$('#glyph-forge').onclick=()=>{
 if(game.complete&&game.result&&game.completed.includes(game.result)){nextLevel();return;}
 if(game.result){
  if(!game.chapter.targets.includes(game.result)||game.completed.includes(game.result)){continueDraft();renderWorkshop();feedback('新字已经收进字册。继续换个偏旁，试试下一个小任务。');save();return;}
  const event=game.apply();if(!event.ok){feedback(event.message);return;}
  lastChar=event.char;if(!event.complete)continueDraft();renderScene(event.char);renderWorkshop();save();feedback(event.complete?'三片叶子点亮啦！可以写一写新字，再去下一关。':`「${event.char}」让风景变了！继续找下一个字吧。`,true);return;
 }
 const result=game.assemble();if(result.status!=='success'){feedback(result.message);renderWorkshop();return;}
 lastChar=result.glyph.char;renderWorkshop();save();feedback(result.fresh?`发现新字「${lastChar}」！${placementText(result.glyph)}`:`又拼出「${lastChar}」啦！可以用它帮助小伙伴。`,true);speak(lastChar);
};
$('#glyph-hint').onclick=()=>{const hint=game.hint();feedback(hint.message);save();};
$('#glyph-goals').onclick=event=>{const b=event.target.closest('[data-glyph-quest]');if(!b)return;const i=Number(b.dataset.glyphQuest),char=game.chapter.targets[i];if(game.completed.includes(char)){openDetails(char);return;}if(game.result===char){$('#glyph-forge').click();return;}game.selectQuest(i);renderScene();save();feedback(game.quest.prompt);};
$('#glyph-result').onclick=event=>{if(event.target.closest('#glyph-read'))speak(game.result||lastChar);if(event.target.closest('#glyph-result-detail'))openDetails(game.result||lastChar);};
// Touch dragging uses the same position-sensitive recipe as tapping.
$('#glyph-parts').addEventListener('pointerdown',event=>{const b=event.target.closest('[data-part]');if(!b||event.button!==0)return;drag={part:b.dataset.part,id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};b.setPointerCapture?.(event.pointerId);});
window.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.id)return;if(!drag.moved&&Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>8){drag.moved=true;drag.ghost=document.createElement('div');drag.ghost.className='g-drag-ghost';drag.ghost.textContent=drag.part;document.body.append(drag.ghost);}if(drag.ghost){drag.ghost.style.left=event.clientX+'px';drag.ghost.style.top=event.clientY+'px';document.querySelectorAll('.g-slot').forEach(slot=>{const r=slot.getBoundingClientRect();slot.classList.toggle('drag-over',event.clientX>=r.left&&event.clientX<=r.right&&event.clientY>=r.top&&event.clientY<=r.bottom);});}});
function finishDrag(event){if(!drag||event.pointerId!==drag.id)return;const d=drag;drag=null;d.ghost?.remove();document.querySelectorAll('.g-slot').forEach(slot=>slot.classList.remove('drag-over'));if(d.moved){suppressClick=Date.now()+400;setTimeout(()=>{suppressClick=0;},0);const targets=[...document.querySelectorAll('.g-slot')].reverse(),target=targets.find(slot=>{const r=slot.getBoundingClientRect();return event.clientX>=r.left&&event.clientX<=r.right&&event.clientY>=r.top&&event.clientY<=r.bottom;});if(target)addPart(d.part,Number(target.dataset.slot));else feedback('把部件拖进格子里；没有放进去也不会消耗。');}}
window.addEventListener('pointerup',finishDrag);window.addEventListener('pointercancel',event=>{if(drag&&event.pointerId===drag.id){drag.ghost?.remove();drag=null;}});
function openDialog(html){stopWriter();$('#glyph-dialog-content').innerHTML=html;if(!dialog.open)dialog.showModal();$('#glyph-dialog-content').scrollTop=0;dialog.scrollTop=0;}
function closeDialog(){stopWriter();if(dialog.open)dialog.close();}
$('#glyph-close-dialog').onclick=closeDialog;dialog.addEventListener('close',stopWriter);
function openHelp(){openDialog(`<div class="g-dialog-help"><h2>让汉字走进风景里</h2><p>小狐狸遇到了一些小问题，试着用一个字帮帮它。</p><ol><li>看看上方的小任务，想一想它需要什么。</li><li>选「左右、上下、包围、三叠」摆法，点选或拖动部件。</li><li>点「拼成一个字」，听读音、看字义，再把字用到风景里。</li><li>点「写一写」，从亮点起笔，按笔顺跟着描红。</li></ol><p>部件可以重复使用，提示和试错都不扣分。每关还有额外的字，试着换偏旁发现它们吧！</p><p>偏旁、部件和部首不完全相同；声旁提供读音线索，读音也可能不同。这里学的是具体字的字形和字义。</p><button class="g-primary" id="glyph-help-done">我来试试 →</button></div>`);$('#glyph-help-done').onclick=closeDialog;}
$('#glyph-help').onclick=openHelp;
function openBook(){
 openDialog(`<h2>我的识字小树</h2><p>自己拼出的字会点亮叶子。点开一个字，还能听读音、看结构、跟着描红。</p><div class="g-book-summary"><span>已认识 ${game.learned.length} / ${GLYPHS.length} 字</span><span>已描红 ${Object.keys(game.practiced).length} 字</span></div>${LEVELS.map(level=>{const chars=[...level.targets,...level.extras],count=chars.filter(c=>game.learned.includes(c)).length;return `<section class="g-book-family"><h3>${level.title}<small>${count} / ${chars.length}</small></h3><div class="g-book-grid">${chars.map(char=>{const known=game.learned.includes(char);return `<button class="g-book-char" data-book-char="${char}" ${known?'':'disabled'} aria-label="${known?char+'，'+GLYPH_INDEX.get(char).pinyin:'尚未发现的字'}">${known?char:'◇'}<small>${known?(game.practiced[char]?'已描红 ✓':GLYPH_INDEX.get(char).pinyin):'待发现'}</small></button>`;}).join('')}</div></section>`;}).join('')}`);
 $('#glyph-dialog-content').onclick=event=>{const b=event.target.closest('[data-book-char]');if(b&&!b.disabled)openDetails(b.dataset.bookChar,true);};
}
$('#glyph-home-book').onclick=openBook;$('#glyph-stage-book').onclick=openBook;
function openDetails(char,fromBook=false){const g=GLYPH_INDEX.get(char);if(!g||!game.learned.includes(char))return;openDialog(`<div class="g-learned-detail"><h2>认识「${char}」</h2><div class="g-detail-char">${char}</div><div class="g-pinyin">${g.pinyin}</div><div class="g-formula">${g.parts.map(esc).join(' ＋ ')} → ${char}</div><p>${esc(g.meaning)}</p><p>${structureName(g)} · ${esc(placementText(g))}</p><p>${esc([...new Set(g.parts.map(p=>COMPONENTS[p].note))].join(' '))}</p><div class="g-detail-actions"><button id="glyph-detail-read" class="g-secondary">听一听 ♪</button><button id="glyph-detail-write" class="g-primary">跟着描红 →</button></div>${fromBook?'<button id="glyph-book-back" class="g-secondary" style="margin-top:12px">返回字册</button>':''}</div>`);$('#glyph-dialog-content').onclick=null;$('#glyph-detail-read').onclick=()=>speak(char);$('#glyph-detail-write').onclick=()=>openWriting(char);if(fromBook)$('#glyph-book-back').onclick=openBook;}
function stopWriter(){for(const timer of demoTimers)clearTimeout(timer);demoTimers.clear();if(writer?.canvas){writer.canvas.onpointerdown=null;writer.canvas.onpointermove=null;writer.canvas.onpointerup=null;writer.canvas.onpointercancel=null;}writer=null;}
async function loadStrokes(){if(!strokeBundle)strokeBundle=fetch('./glyph-strokes.json').then(r=>{if(!r.ok)throw Error('Stroke data unavailable');return r.json();}).catch(error=>{strokeBundle=null;throw error;});return strokeBundle;}
async function openWriting(char){
 const g=GLYPH_INDEX.get(char);if(!g||!game.learned.includes(char))return;
 openDialog(`<div class="g-writing"><h2>写一写 · ${char}</h2><p class="g-writing-subtitle">${g.pinyin} · ${esc(g.meaning)}</p><div class="g-writing-board"><svg id="glyph-stroke-svg" viewBox="0 0 1024 1024" aria-label="${char}的笔顺轮廓"></svg><canvas id="glyph-writing-canvas" width="1024" height="1024" aria-label="沿着亮点描写${char}"></canvas></div><p id="glyph-writing-message" class="g-writing-message" role="status">正在打开笔顺示范…</p><div class="g-writing-actions"><button id="glyph-demo" class="g-secondary" disabled>看笔顺</button><button id="glyph-write-again" class="g-secondary" disabled>再写一次</button><button id="glyph-writing-done" class="g-primary">先回去</button></div><p class="g-writing-note">从亮点起笔，顺着箭头描；可以多试几次，慢慢来。</p></div>`);
 const token={char};writer=token;$('#glyph-dialog-content').onclick=null;$('#glyph-writing-done').onclick=closeDialog;
 try{const bundle=await loadStrokes();if(writer!==token||!dialog.open)return;const data=bundle.characters?.[char];token.session=new WritingSession(data);token.canvas=$('#glyph-writing-canvas');token.ctx=token.canvas.getContext('2d');token.drawing=false;token.demo=false;token.awarded=false;token.points=[];$('#glyph-demo').disabled=false;$('#glyph-write-again').disabled=false;renderWriting(token);installWriting(token);$('#glyph-demo').onclick=()=>demoWriting(token);$('#glyph-write-again').onclick=()=>{for(const t of demoTimers)clearTimeout(t);demoTimers.clear();token.session=new WritingSession(data);token.demo=false;$('#glyph-demo').disabled=false;token.awarded=false;token.drawing=false;token.points=[];token.ctx.clearRect(0,0,1024,1024);renderWriting(token);};}catch{strokeBundle=null;if(writer===token){$('#glyph-writing-message').textContent='笔顺暂时没有打开，可以重试，或先继续造字。';$('#glyph-demo').disabled=false;$('#glyph-demo').textContent='重新打开';$('#glyph-demo').onclick=()=>openWriting(char);}}
}
function renderWriting(token,revealed=token.session.index){
 const data=token.session.data,complete=token.session.complete,active=token.demo?-1:token.session.index;
 const target=active>=0&&active<data.medians.length?screenMedian(data.medians[active]):null,start=target?.[0],next=target?.[Math.min(target.length-1,2)],angle=start&&next?Math.atan2(next[1]-start[1],next[0]-start[0])*180/Math.PI:0;
 $('#glyph-stroke-svg').innerHTML=`<g transform="translate(0 900) scale(1 -1)">${data.strokes.map((d,i)=>`<path d="${esc(d)}" fill="${i<revealed?'#3c6550':i===active?'#c1cfa9':'#e2e6d7'}"/>`).join('')}</g>${start&&!complete?`<circle cx="${start[0]}" cy="${start[1]}" r="21" fill="#bd875b" stroke="#f8efce" stroke-width="7"/><g transform="translate(${start[0]} ${start[1]}) rotate(${angle})"><path d="M30 0h50m-17-16 17 16-17 16" fill="none" stroke="#b78c57" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></g>`:''}`;
 $('#glyph-writing-message').textContent=token.demo?`看一看，第 ${revealed} / ${data.strokes.length} 笔。`:complete?'写好啦！这个字的描红叶子已经点亮。':`第 ${token.session.index+1} / ${data.strokes.length} 笔：从亮点出发，沿着浅绿色笔画描。`;
 $('#glyph-writing-done').textContent=complete?'带着新字回去 ✓':'先回去';
}
function demoWriting(token){if(writer!==token||token.demo)return;token.demo=true;token.drawing=false;token.points=[];token.ctx.clearRect(0,0,1024,1024);$('#glyph-demo').disabled=true;renderWriting(token,0);for(let i=1;i<=token.session.data.strokes.length;i++){const timer=setTimeout(()=>{demoTimers.delete(timer);if(writer!==token)return;renderWriting(token,i);},i*500);demoTimers.add(timer);}const timer=setTimeout(()=>{demoTimers.delete(timer);if(writer!==token)return;token.demo=false;$('#glyph-demo').disabled=false;renderWriting(token);},token.session.data.strokes.length*500+600);demoTimers.add(timer);}
function installWriting(token){
 const canvas=token.canvas,point=e=>{const r=canvas.getBoundingClientRect();return[(e.clientX-r.left)/r.width*1024,(e.clientY-r.top)/r.height*1024];};
 const draw=()=>{const ctx=token.ctx;ctx.clearRect(0,0,1024,1024);ctx.lineWidth=17;ctx.lineCap=ctx.lineJoin='round';ctx.strokeStyle='#b18a58';ctx.beginPath();token.points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();};
 canvas.onpointerdown=event=>{if(writer!==token||token.demo||token.drawing||event.isPrimary===false||token.session.complete||event.button!==0)return;event.preventDefault();canvas.setPointerCapture?.(event.pointerId);token.pointer=event.pointerId;token.drawing=true;token.points=[point(event)];draw();};
 canvas.onpointermove=event=>{if(!token.drawing||token.pointer!==event.pointerId)return;event.preventDefault();if(token.points.length<4000){token.points.push(point(event));draw();}};
 canvas.onpointerup=event=>{if(!token.drawing||token.pointer!==event.pointerId)return;token.drawing=false;token.points.push(point(event));const result=token.session.submit(token.points);token.ctx.clearRect(0,0,1024,1024);renderWriting(token);if(!result.accepted)$('#glyph-writing-message').textContent=result.reason;else if(result.complete&&!token.awarded){token.awarded=true;game.recordPractice(token.char);save();renderHome();announce(`「${token.char}」描红完成。`);}};
 canvas.onpointercancel=()=>{token.drawing=false;token.points=[];token.ctx.clearRect(0,0,1024,1024);};
}
$('#glyph-practice').onclick=()=>openWriting(game.result||lastChar);
document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&['+','-','=','0'].includes(event.key))event.preventDefault();if(dialog.open)return;if(playing&&event.code==='Space'&&!['BUTTON','A','INPUT','TEXTAREA'].includes(document.activeElement.tagName)){event.preventDefault();$('#glyph-forge').click();}if(playing&&event.key==='Escape')leaveStage();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){window.speechSynthesis?.cancel();save();}else syncViewport();});
window.addEventListener('pagehide',()=>{window.speechSynthesis?.cancel();save();});
renderAudio();renderHome();save();
