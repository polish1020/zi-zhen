import {Game,WORDS,CHAPTERS,getMap,getWord,matchWord,towerStats,GRADES,HINT_COST,SKILL_COOLDOWN,ENEMIES,enemyPosition,wavePlan,gradeEffect,isAir} from './engine.mjs';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const SAVE='wordward-save-v1',RECORD='wordward-record-v1';
// Keep game gestures from selecting text or changing the page scale.
document.addEventListener('selectstart',event=>event.preventDefault());
document.addEventListener('contextmenu',event=>event.preventDefault());
document.addEventListener('dblclick',event=>event.preventDefault());
for(const gesture of ['gesturestart','gesturechange'])document.addEventListener(gesture,event=>event.preventDefault(),{passive:false});
document.addEventListener('touchmove',event=>{if(event.touches.length>1)event.preventDefault();},{passive:false});
document.addEventListener('wheel',event=>{if(event.ctrlKey)event.preventDefault();},{passive:false});
document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&['+','-','=','0'].includes(event.key))event.preventDefault();});

let game=new Game(),records=Array(CHAPTERS.length).fill(0),paused=false,speed=1,chars=[],placing=null,selected=null,detailOpen=false,hover=-1,audioOn=true,audioCtx,toastTimer,stored=false;
try{const raw=JSON.parse(localStorage.getItem(RECORD));if(Array.isArray(raw)&&raw.length>0&&raw.length<=CHAPTERS.length&&raw.every(n=>Number.isInteger(n)&&n>=0&&n<=3))records=records.map((_,i)=>raw[i]||0);const saved=localStorage.getItem(SAVE);if(saved){const candidate=Game.restore(JSON.parse(saved));game=candidate;paused=['battle','intermission'].includes(game.phase);stored=true;}}catch{try{localStorage.removeItem(SAVE)}catch{}}
let {routes,pads:PADS,color:mapColor}=getMap(game.chapter),PATH=routes[0];
const CHAPTER_MARKS=['壹','贰','叁','肆','伍','陆','柒','捌','玖','拾'];
const mapModeLabel=()=>getMap(game.chapter).mode==='single'?'单入口':`${routes.length} 入口 · ${getMap(game.chapter).mode==='simultaneous'?'同时进攻':'轮番进攻'}`;
try{audioOn=localStorage.getItem('wordward-audio-v1')!=='off';}catch{}
const forgeTemplate=$('.forge-panel').innerHTML;
const mobileLayout=matchMedia('(max-width: 900px), (pointer: coarse), (display-mode: standalone)');
function enterGame(){sound(440,.06);document.body.classList.add('playing');if(['won','lost'].includes(game.phase))setTimeout(result,0);if(mobileLayout.matches&&!document.fullscreenElement&&document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().catch(()=>{});}
function updateHome(){const progress=game.wave>0||game.towers.length>0||game.refreshes>0||game.hintWord!==null||game.ink!==CHAPTERS[game.chapter].ink||game.hand.some(t=>t.used);$('#enter-game').innerHTML=progress?'继续游戏 <span>接着守护这卷山河 →</span>':'开始游戏 <span>落笔，启程 →</span>';$('#home-word-count').textContent=WORDS.length.toLocaleString()+' 种词语';$('#home-chapter-name').textContent=CHAPTERS[game.chapter].name;$('#home-save-note').textContent=progress?'已保存当前战局与字牌，点击继续游戏即可恢复。':'进度保存在当前浏览器，随时回来继续守关。';}
$('#enter-game').onclick=enterGame;
$('#exit-game').onclick=()=>{if(['battle','intermission'].includes(game.phase))paused=true;document.body.classList.remove('playing');if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});save();updateUI();};
$('#jump-codex').onclick=codex;
$('#game-guide').onclick=guide;
$('#home-guide').onclick=guide;
$('#home-chapters').onclick=chapters;
$('#enemy-preview').onclick=enemyGuide;
$('#advance-chapter').onclick=()=>{if(game.chapter<CHAPTERS.length-1)confirmNextChapter();else chapters();};
const c=$('#battlefield'),ctx=c.getContext('2d');c.removeAttribute('tabindex');c.setAttribute('role','img');
const mapTargets=document.createElement('div');mapTargets.className='map-targets';mapTargets.setAttribute('aria-label','阵位');$('#canvas-wrap').append(mapTargets);
const bossStatus=document.createElement('div');bossStatus.className='boss-status';bossStatus.hidden=true;bossStatus.setAttribute('aria-label','当前 Boss 状态');bossStatus.innerHTML='<div><b class="boss-name"></b><span class="boss-phase"></span></div><div class="boss-hp-track"><i></i></div><small class="boss-hp-text"></small>';$('#canvas-wrap').append(bossStatus);
PADS.forEach((p,i)=>{const b=document.createElement('button');b.className='map-target';b.style.left=`${p.x/9}%`;b.style.top=`${p.y/5.2}%`;b.setAttribute('aria-label',`空阵位 ${i+1}，点击放置词塔`);b.onclick=()=>selectPad(i);b.onmouseenter=()=>hover=i;b.onmouseleave=()=>hover=-1;b.onfocus=()=>hover=i;b.onblur=()=>hover=-1;mapTargets.append(b);});
const battleNotice=document.createElement('div');battleNotice.className='battle-notice';battleNotice.id='battle-notice';battleNotice.setAttribute('role','status');battleNotice.setAttribute('aria-live','polite');$('.battle-top').after(battleNotice);
function toast(msg){battleNotice.textContent=msg;battleNotice.title=msg;battleNotice.classList.add('active');if(!document.body.classList.contains('playing')){$('#toast').textContent=msg;$('#toast').classList.add('visible');}clearTimeout(toastTimer);toastTimer=setTimeout(()=>{$('#toast').classList.remove('visible');battleNotice.classList.remove('active');battleNotice.textContent=mapModeLabel()+' · 单击词塔查看属性与升级';},3400);}
function save(){try{localStorage.setItem(SAVE,JSON.stringify(game.export()));localStorage.setItem(RECORD,JSON.stringify(records));$('#save-status').textContent='✓ 进度自动保存';}catch{$('#save-status').textContent='此浏览器无法保存进度';}}
function sound(note=440,duration=.09){if(!audioOn)return;try{audioCtx??=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.value=note;g.gain.setValueAtTime(.045,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+duration);}catch{}}
function recipe(){return matchWord(chars.map(id=>game.hand.find(t=>t.id===id&&!t.used)?.ch).filter(Boolean));}
function attributeBadge(w){return `<span class="attribute-badge" style="--attribute-color:${w.color}"><b>${w.icon}</b><span>${w.name}</span></span>`;}
function identity(w){return `<div class="word-identity">${attributeBadge(w)}<span class="grade-badge grade-${w.tier}">${GRADES[w.tier]} · ${w.tier} 字</span><span class="attack-badge">${w.tag}</span></div>`;}
function primaryValue(w,stats=w){return w.type==='income'?`${stats.damage} / ${stats.income}`:w.type==='aura'?`${stats.damage} / ${Math.round(stats.aura*100)}%`:stats.damage;}
function primaryLabel(w){return w.type==='income'?'攻击 / 每轮产墨':w.type==='aura'?'攻击 / 光环增伤':'攻击伤害';}
function renderForge(){
 const panel=$('.forge-panel'),tower=detailOpen?game.towers.find(t=>t.id===selected):null;
 if(!game.towers.some(t=>t.id===selected)){selected=null;detailOpen=false;}
 panel.classList.toggle('inspecting',!!tower);
 if(tower){
  const t=tower,w=getWord(t.word),stats=towerStats(t),max=t.level>=w.maxLevel;
  panel.innerHTML=`<div class="forge-heading"><span>词塔详情</span><button id="back-forge" aria-label="返回组字工坊">返回字库 ↗</button></div><div class="tower-detail"><h3>${w.word}</h3><div class="tower-level">${identity(w)}</div><p class="tower-effects">${w.desc}<strong class="grade-effect">${GRADES[w.tier]}特性：${gradeEffect(w)}</strong></p><div class="detail-stats"><div><small>${primaryLabel(w)}</small><b>${primaryValue(w,stats)}</b></div><div><small>攻击范围</small><b>${stats.range}</b></div><div><small>攻击间隔</small><b>${w.damage?stats.rate.toFixed(2)+'s':'—'}</b></div><div><small>当前等级</small><b>${t.level} / ${w.maxLevel}</b></div></div><div class="tower-actions"><button id="upgrade" class="forge-button">${max?'已臻化境':'升级词塔'}<span>${max?'最高等级':game.upgradeCost(t)+' 墨点 ↗'}</span></button><button id="sell" class="sell-button">拆除 · 返还 ${Math.floor(t.spent*.7)} 墨点</button></div></div><div class="forge-footnote">拆除返还 70% 墨点，已消耗的字牌不返还。</div>`;
  $('#back-forge').onclick=()=>{selected=null;detailOpen=false;renderForge();updateUI();};
  $('#upgrade').disabled=max||game.ink<game.upgradeCost(t)||['won','lost'].includes(game.phase);
  $('#upgrade').onclick=()=>{if(game.upgrade(t.id)){sound(660);toast('词塔升级成功');save();renderForge();updateUI();}};
  $('#sell').onclick=()=>{game.sell(t.id);selected=null;renderForge();save();updateUI();toast('已返还墨点，消耗的字牌不返还');};
  return;
 }
 panel.innerHTML=forgeTemplate;
 chars=chars.filter(id=>game.hand.some(t=>t.id===id&&!t.used));
 $('#forge-slots').innerHTML=Array.from({length:4},(_,i)=>{const id=chars[i],tile=game.hand.find(t=>t.id===id);return `<button class="forge-slot ${tile?'':'empty'}" data-slot="${i}" aria-label="${tile?'取消字牌'+tile.ch:'第'+(i+1)+'个字位'}" ${tile?'':'disabled'}>${tile?.ch||['一','二','三','四'][i]}</button>`;}).join('');
 $$('[data-slot]').forEach(b=>b.onclick=()=>{chars.splice(+b.dataset.slot,1);placing=null;renderForge();updateUI();});
 $('#hand-meta').textContent=`剩余 ${game.hand.filter(t=>!t.used).length} / ${game.hand.length}`;
 $('#character-grid').innerHTML=game.hand.map(t=>`<button class="char ${chars.includes(t.id)?'selected':''} ${t.used?'used':''}" data-char="${t.ch}" data-tile="${t.id}" aria-pressed="${chars.includes(t.id)}" aria-label="${t.used?'已用':'选择'}字牌${t.ch}，编号${t.id}" ${t.used?'disabled':''}>${t.ch}${t.used?'<small>已用</small>':''}</button>`).join('');
 $$('.char').forEach(b=>b.onclick=()=>{placing=null;const id=+b.dataset.tile;if(chars.includes(id))chars=chars.filter(x=>x!==id);else if(chars.length<4)chars.push(id);else{toast('最多选择四张字牌，点击已选字牌可以撤回');return;}sound(390+chars.length*70);renderForge();updateUI();});
 const w=recipe();
 $('#recipe-preview').innerHTML=w?`<div class="recipe-title"><button id="recipe-details" class="recipe-details" aria-label="查看${w.word}效果">${w.word} <small>ⓘ</small></button><span class="recipe-tag">${w.icon} · ${GRADES[w.tier]} · ${w.tier} 级</span></div><p>${w.name} · ${w.tag}</p><div class="recipe-stats"><span>${w.damage?'伤害 '+w.damage:w.type==='income'?'每轮 +'+w.income+' 墨点':'增伤 '+Math.round(w.aura*100)+'%'}</span><span>范围 ${w.range}</span></div>`:`<div class="invalid-recipe">${chars.length?'词序不符或尚未入词谱':'选 1—4 字，落字成阵'}</div><p>单字起阵，二字成词，三字成势，四字成典。</p>`;
 if(w)$('#recipe-details').onclick=()=>wordDetails(w);
 $('#forge').innerHTML=placing?'取消放置 <span>字牌尚未消耗 ↩</span>':`凝字成塔 <span>${w?w.cost+' 墨点 ↗':'请选择字牌'}</span>`;
 $('#forge').onclick=()=>{if(placing){placing=null;renderForge();updateUI();return;}if(!w||!game.canBuild(w.word,chars))return;placing={word:w.word,ids:[...chars]};selected=null;toast('点击空阵位；成功落塔后才消耗字牌');sound(600);renderForge();updateUI();};
 $('#clear-chars').onclick=()=>{chars=[];placing=null;renderForge();updateUI();};
 $('#hint-letters').innerHTML=!game.availableWords().length?'无可组词<span>不扣墨点</span>':game.hintCost()?`提示<span>${HINT_COST} 墨点</span>`:'查看提示<span>已解锁 · 免费</span>';
 $('#hint-letters').onclick=()=>{const hint=game.requestHint();if(!hint)return;chars=game.tilesFor(hint.word)||[];placing=null;save();renderForge();updateUI();toast(`提示：${hint.word} · ${getWord(hint.word).tier} 字${hint.cost?'（花费 '+hint.cost+' 墨点）':'（已解锁）'}`);};
 $('#refresh-letters').innerHTML=`换一批字 <span>${game.refreshCost()} 墨点</span>`;
 $('#refresh-letters').onclick=()=>{const cost=game.refreshCost();if(game.refreshHand()){chars=[];placing=null;save();renderForge();updateUI();toast(`已刷新 16 张字牌 · 花费 ${cost} 墨点`);}};
 updateForgeButtons();
}
function updateForgeButtons(){const terminal=['won','lost'].includes(game.phase);if($('#forge')){const w=recipe();$('#forge').disabled=terminal||(!placing&&(!w||!game.canBuild(w.word,chars)));}if($('#refresh-letters'))$('#refresh-letters').disabled=terminal||game.ink<game.refreshCost();if($('#hint-letters'))$('#hint-letters').disabled=terminal||game.ink<game.hintCost()||!game.availableWords().length;}
function selectPad(i){
 if($('#modal').open||['won','lost'].includes(game.phase))return;
 if(!game.padUnlocked(i)){openUnlock(i);return;}
 const tower=game.towers.find(t=>t.pad===i);
 if(tower){selected=tower.id;detailOpen=true;placing=null;renderForge();sound(460);}
 else if(placing){if(game.build(placing.word,i,placing.ids)){placing=null;selected=null;detailOpen=false;chars=[];renderForge();save();sound(700);toast('词塔已落成，蓄势待发');}else toast('墨点不足，暂时无法建塔');}
 else{selected=null;detailOpen=false;renderForge();}
 updateUI();
}
function openUnlock(pad){const cost=game.unlockCost();openModal(`<div class="modal-eyebrow">EXPAND THE FRONT</div><h2 class="modal-title">解锁阵位 ${pad+1}</h2><p class="modal-intro">本次需要 ${cost} 墨点，${game.unlockedPads.length===PADS.length-1?"这是最后一个可解锁阵位。":"下一个阵位需要 "+(cost+20)+"。"}解锁后可永久使用至本局结束。${placing?`当前词塔建造另需 ${getWord(placing.word).cost} 墨点，解锁不会消耗字牌。`:''}</p><div class="result-actions"><button class="secondary" id="cancel-unlock">暂不解锁</button><button class="primary" id="unlock-pad" ${game.ink<cost?'disabled':''}>解锁 · ${cost} 墨点</button></div>`,()=>{$('#cancel-unlock').onclick=closeModal;$('#unlock-pad').onclick=()=>{if(game.unlockPad(pad)){save();updateUI();closeModal();toast(game.unlockedPads.length===PADS.length?'全部阵位已解锁，可以落塔':'阵位已解锁；下一阵位 '+game.unlockCost()+' 墨点');}};});}
function enemyGuide(){const next=game.phase==='battle'?wavePlan(game.chapter,game.wave):game.wavePreview();openModal(`<div class="modal-eyebrow">ENEMY FIELD GUIDE</div><h2 class="modal-title">墨影各异，借势应对。</h2><p class="modal-intro">本章地图：${getMap(game.chapter).name}，${mapModeLabel()}。每轮 3 波，波间整备 6 秒，轮末手动迎战下一轮。每 3 轮及章节最后一轮有 Boss。下一波：第 ${next.round} 轮 ${next.part}/3 波 · ${next.title}，预计 ${next.count} 只。应对建议：${next.counter}。可能出现 ${[...new Set(next.pool)].map(k=>ENEMIES[k].name).join("、")}${next.boss?"、"+ENEMIES[next.bossKind].name:""}。</p>${next.boss?`<div class="grade-effect-card boss-brief"><b>BOSS · ${ENEMIES[next.bossKind].name}</b><p>${ENEMIES[next.bossKind].desc}</p></div>`:""}<div class="codex-grid">${Object.entries(ENEMIES).map(([kind,e])=>`<article class="codex-card"><h3>${e.name}<small>${e.boss?'BOSS · ':''}${kind==='flying'||e.air?'飞行':'地面'} · 基础生命 ${e.hp}</small></h3><p>${e.desc}</p></article>`).join('')}</div>`);}
function wordDetails(w){openModal(`<div class="modal-eyebrow">WORD EFFECT · ${GRADES[w.tier]}</div><h2 class="modal-title">${w.word}<small class="effect-tag">${w.tag}</small></h2>${identity(w)}<p class="modal-intro">${w.desc}</p><div class="grade-effect-card"><b>${GRADES[w.tier]}专属特性</b><p>${gradeEffect(w)}</p><small>字数决定初始品阶；升级提高数值，保留该词的品阶特性。</small></div><div class="word-effect-stats"><div><small>建造消耗</small><b>${w.cost} 墨点</b></div><div><small>初始等级 / 上限</small><b>${w.tier} / ${w.maxLevel} 级</b></div><div><small>${primaryLabel(w)}</small><b>${primaryValue(w)}</b></div><div><small>范围 / 攻击间隔</small><b>${w.range} / ${w.damage?w.rate+'s':'—'}</b></div></div><p class="modal-intro">成功落塔才消耗 ${w.tier} 张字牌和墨点。建成后可再升级两次。点击地图上的词塔，即可显示范围，并在下方查看详情与升级。</p><button class="primary" id="effect-done">返回组词</button>`,()=>$('#effect-done').onclick=closeModal);}
function updateBossStatus(){const e=game.enemies.find(e=>e.hp>0&&ENEMIES[e.kind].boss);bossStatus.hidden=!e;if(!e)return;const data=ENEMIES[e.kind];bossStatus.style.setProperty('--boss-color',BOSS_COLORS[e.kind]||'#ad7054');bossStatus.querySelector('.boss-name').textContent=data.name;bossStatus.querySelector('.boss-phase').textContent=e.enraged?'二阶段 · 狂化':data.air?'BOSS · 空中':'BOSS';bossStatus.querySelector('.boss-hp-track i').style.width=Math.max(0,e.hp/e.maxHp)*100+'%';bossStatus.querySelector('.boss-hp-text').textContent=`生命 ${Math.ceil(e.hp)} / ${Math.ceil(e.maxHp)}${e.shield>0?' · 护盾 '+Math.ceil(e.shield):''}`;}
function updateUI(){$('#canvas-wrap').dataset.theme=getMap(game.chapter).theme;updateHome();updateBossStatus();$('.sound-off').classList.toggle('hidden',audioOn);$('#sound').setAttribute('aria-label',audioOn?'关闭音效':'开启音效');if(!battleNotice.classList.contains('active'))battleNotice.textContent=mapModeLabel()+' · 单击词塔查看属性与升级';document.body.classList.toggle('placing',!!placing);document.body.classList.toggle('range-preview',selected!==null&&!detailOpen);const ch=CHAPTERS[game.chapter],info=game.roundInfo(),terminal=['won','lost'].includes(game.phase);$('#chapter-name').textContent=ch.name;$('.chapter-mark').textContent=CHAPTER_MARKS[game.chapter];$('#area-name').textContent=ch.area;$('#chapter-intro').textContent=ch.intro;$('#wave-total').textContent=game.endless?'∞':ch.rounds;$('.map-label span').textContent=ch.area;$('.map-label small').textContent=getMap(game.chapter).name+" · "+mapModeLabel();$('#hp').textContent=game.hp;$('#max-hp').textContent='/ '+ch.hp;$('#ink').textContent=Math.floor(game.ink);$('#phase-label').textContent=terminal?(game.phase==='won'?'山河无恙':'山门失守'):paused?'暂歇片刻':game.phase==='intermission'?`整备 ${Math.ceil(Math.max(0,game.autoWaveAt-game.time))}s`:game.phase==='battle'?'守关进行中':'布阵时刻';$('#wave-label').textContent=`${game.endless?'无尽 · ':''}第 ${info.round} 轮 · ${info.part}/3 波`;const done=game.phase==='prepare'||game.phase==='won'?game.wave:Math.max(0,game.wave-1);$('#progress-label').textContent=game.endless?`无尽 · ${info.round} 轮`:`${Math.floor(done/3)} / ${ch.rounds}`;$('#wave-dots').innerHTML=Array.from({length:ch.rounds},(_,i)=>`<i class="${i<Math.floor(done/3)?'done':''}"></i>`).join('');$('#wave-title').textContent=terminal?(game.phase==='won'?'此卷已守 · 山河无恙':'山门失守 · 来日再战'):game.phase==='battle'?`第 ${game.wave} 波 · ${wavePlan(game.chapter,game.wave).title}`:`第 ${game.wave+1} 波 · ${game.wavePreview().title}`;$('#wave-description').textContent=game.phase==='battle'?`场上 ${game.enemies.length} 只 · 待出现 ${game.queue.length} 只`:(game.wave===0?'准备好你的第一座词塔':terminal?'每一次落字，皆是修行':'波次已清，补强防线后再出发');$('#start').innerHTML=terminal?'查看战报 ↗':['battle','intermission'].includes(game.phase)?(paused?'继续守关 ▷':game.phase==='intermission'?`下一波 ${Math.ceil(Math.max(0,game.autoWaveAt-game.time))}s · 暂停`:'暂歇片刻 Ⅱ'):'迎战墨影 <span>→</span>';$('#pause-overlay').classList.toggle('hidden',!paused||terminal);$('#map-message').textContent=placing?'落字成阵 · 点击圆形空阵位建塔':selected?'在词塔详情中升级，或拆除词塔':terminal?(game.phase==='won'?'山河无恙 · 此卷已守':'山门失守 · 再试一阵'):game.phase==='battle'?'战斗中也可建塔、升级，随时调整防线':game.towers.length?'布阵就绪，点击「迎战墨影」开始下一波':'点击「凝字成塔」，开始布阵';$('#speed').textContent=speed+'×';const cooldown=Math.ceil(Math.max(0,game.skillReady-game.time));$('#skill').disabled=game.phase!=='battle'||cooldown>0||game.ink<game.skillCost()||paused;$('#skill').innerHTML=`✦ <span>${cooldown?cooldown+'s':'落墨'}</span><small>${game.skillCost()}</small>`;$('#skill').title=`落墨：${game.skillCost()}墨点 · 全场100伤害 · 冷却${SKILL_COOLDOWN}秒，每次费用加15`;$('#skill').setAttribute('aria-label',cooldown?`落墨冷却中，还需${cooldown}秒，下次${game.skillCost()}墨点`:`落墨技能：花费${game.skillCost()}墨点，全场100伤害，冷却${SKILL_COOLDOWN}秒`);[...mapTargets.children].forEach((b,i)=>{const t=game.towers.find(t=>t.pad===i);b.setAttribute('aria-pressed',String(!!t&&t.id===selected));b.setAttribute('aria-label',!game.padUnlocked(i)?`未解锁阵位${i+1}，花费${game.unlockCost()}墨点解锁`:t?`阵位${i+1}：${t.word}，${t.level}级，点击查看或升级`:`空阵位${i+1}，点击放置词塔`);});if($('#upgrade')){const t=game.towers.find(t=>t.id===selected);$('#upgrade').disabled=!t||t.level>=getWord(t.word).maxLevel||game.ink<game.upgradeCost(t)||terminal;}$('#enemy-preview').textContent=(game.phase==='battle'?wavePlan(game.chapter,game.wave):game.wavePreview()).title+' ↗';$('#enemy-preview').title=$('#enemy-preview').textContent;$('#enemy-preview').setAttribute('aria-label',$('#enemy-preview').textContent+'，查看怪物图鉴');updateForgeButtons();}
function reset(ch=game.chapter){game=new Game(ch);({routes,pads:PADS,color:mapColor}=getMap(ch));PATH=routes[0];resize();paused=false;placing=null;selected=null;detailOpen=false;chars=[];speed=1;renderForge();updateUI();save();}
function openModal(html,setup){$('#modal-content').innerHTML=html;if(!$('#modal').open)$('#modal').showModal();setup?.();}
function closeModal(){$('#modal').close();$$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.nav==='campaign'));}
$('#close-modal').onclick=closeModal;$('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){const r=$('#modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal();}});$('#modal').addEventListener('close',()=>{$$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.nav==='campaign'))});
function codex(){
 openModal(`<div class="modal-eyebrow">THE WORD CODEX · ${WORDS.length.toLocaleString()} RECIPES</div><h2 class="modal-title">一字成兵，四字成典。</h2><p class="modal-intro">常用词与战斗组合都可组阵。词典可查效果；付费提示才会选入当前字牌。</p><input id="codex-search" class="codex-search" aria-label="搜索词语或流派" placeholder="搜索词语、流派或效果，如冰霜箭、毒云"><div class="codex-filters" aria-label="按字数筛选"><button data-length="0" class="active">全部</button>${[1,2,3,4].map(n=>`<button data-length="${n}">${n}字</button>`).join('')}</div><p id="codex-count" class="modal-intro"></p><div class="codex-grid" id="codex-list"></div><div class="codex-pagination"><button id="codex-prev">上一页</button><span id="codex-page"></span><button id="codex-next">下一页</button></div>`,()=>{
 let length=0,page=0;const size=40;
 const draw=()=>{const q=$('#codex-search').value.trim();const list=WORDS.filter(w=>(!length||w.tier===length)&&(!q||[w.word,w.name,w.tag].some(x=>x.includes(q))));const pages=Math.max(1,Math.ceil(list.length/size));page=Math.min(page,pages-1);$('#codex-count').textContent=`共 ${list.length.toLocaleString()} 个词语，每页 ${size} 个`;$('#codex-page').textContent=`${page+1} / ${pages}`;$('#codex-prev').disabled=page===0;$('#codex-next').disabled=page===pages-1;$('#codex-list').innerHTML=list.length?list.slice(page*size,(page+1)*size).map(w=>`<article class="codex-card"><h3 style="color:${w.color}">${w.word}<small>${w.icon} ${w.name} · ${GRADES[w.tier]} · ${w.cost} 墨点</small></h3><p>${w.tag} · ${gradeEffect(w)}</p><div class="recipe-stats"><span>${w.damage?'伤害 '+w.damage:w.type==='income'?'每轮 +'+w.income:'增伤 '+Math.round(w.aura*100)+'%'}</span><span>范围 ${w.range}</span></div><button class="codex-pick" data-word-effect="${w.word}">查看词塔效果 ↗</button></article>`).join(''):'<p class="modal-intro">词库中暂未找到，试试其他词语。</p>';$$('[data-word-effect]').forEach(b=>b.onclick=()=>wordDetails(getWord(b.dataset.wordEffect)));};
 $('#codex-search').oninput=()=>{page=0;draw();};$$('[data-length]').forEach(b=>b.onclick=()=>{length=+b.dataset.length;page=0;$$('[data-length]').forEach(x=>x.classList.toggle('active',x===b));draw();});$('#codex-prev').onclick=()=>{page--;draw();$('#modal').scrollTop=0;};$('#codex-next').onclick=()=>{page++;draw();$('#modal').scrollTop=0;};draw();
 });
}
function guide(){openModal(`<div class="modal-eyebrow">A LITTLE FIELD GUIDE</div><h2 class="modal-title">随机落字，借词守关。</h2><p class="modal-intro">每批 16 张随机字牌，保证能组成攻击词，也藏着三字词和四字成语。</p><div class="guide-step"><span>01</span><div><h3>选 1—4 张字牌</h3><p>必须按正确词序依次点击字牌，重复字需要不同的字牌。单字 1 级、二字 2 级、三字 3 级、四字 4 级；长词伤害与效率更高。点击字牌或上方字位可撤回，需要查阅时可手动打开词典。</p></div></div><div class="guide-step"><span>02</span><div><h3>成功落塔才消耗</h3><p>点「凝字成塔」，再点地图空阵位，支付墨点并消耗对应字牌。取消或点到已占阵位不会消耗字牌。拆塔只返还 70% 投入墨点，不返还字牌；每塔可再升级两次。</p></div></div><div class="guide-step"><span>03</span><div><h3>墨点换新字，留钱布阵</h3><p>换一批字会丢弃当前整批字牌并发出 16 张新牌。每轮从 15 墨点起，每次加 5，上限 40；轮末重置为 15。刷新网页会恢复原牌和价格，不会重新抽字。提示花费 ${HINT_COST} 墨点，优先给出当前字牌能组成的最长词；已解锁提示重复查看免费，换一批字后重新计费。</p></div></div><div class="guide-step"><span>04</span><div><h3>多派相辅，借势守关</h3><p>烈焰清群、寒霜减速、雷霆连锁、疾风补刀、山石破甲、辉光增伤、毒瘴持续伤害、神射远程斩杀、点金攻击与赏金、圣光照明与光环、剑气穿透、潮汐震荡、咒印易伤、幻影追击。金塔与光塔都会主动攻击，辅助效果同类取最强。落墨首次 30 墨点，此后每次多 15；造成全场 100 伤害，冷却 ${SKILL_COOLDOWN} 秒。重开或切换关卡重置费用，无尽模式保留累计。</p></div></div><p class="modal-intro">每轮连续 3 波，波间整备 6 秒；轮末恢复 2 点生命，可以慢慢补强。每 3 轮和章节收尾有 Boss。点击开始界面进入战场；手机竖屏地图与字库上下同屏，短横屏自动并排。切到后台自动暂停，字牌、刷新价格和战局一起保存。旧版战局会自动迁移，已有星级保留。</p><button class="primary" id="guide-done">落笔，启程 →</button>`,()=>$('#guide-done').onclick=closeModal);}
function chapters(){openModal(`<div class="modal-eyebrow">THE CAMPAIGN</div><h2 class="modal-title">山河有字，等你守护。</h2><p class="modal-intro">选择一个篇章，开启新的守关。切换篇章会替换当前战局，通关星级将保留。</p>${CHAPTERS.map((ch,i)=>`<button class="chapter-card" data-chapter="${i}"><span>${CHAPTER_MARKS[i]}</span><div><h3>${ch.name}</h3><small>${ch.rounds} 轮 · ${getMap(i).name} · ${getMap(i).routes.length} 入口<br>${ch.hp} 点生命 · ${ch.ink} 初始墨点</small></div><div class="chapter-stars" aria-label="${records[i]}星">${'★'.repeat(records[i])}${'☆'.repeat(3-records[i])}</div></button>`).join('')}`,()=>$$('[data-chapter]').forEach(b=>b.onclick=()=>{const ch=+b.dataset.chapter;if(game.wave||game.towers.length){openModal(`<div class="modal-eyebrow">A NEW CHAPTER</div><h2 class="modal-title">启程前往${CHAPTERS[ch].name}？</h2><p class="modal-intro">当前战局将被替换，已获得的通关星级会保留。</p><div class="result-actions"><button class="secondary" id="stay">继续当前战局</button><button class="primary" id="switch-chapter">开启新篇章 →</button></div>`,()=>{$('#stay').onclick=closeModal;$('#switch-chapter').onclick=()=>{reset(ch);closeModal();}})}else{reset(ch);closeModal();}}));}
function confirmNextChapter(){const next=game.chapter+1;if(next>=CHAPTERS.length)return chapters();openModal(`<div class="modal-eyebrow">A NEW CHAPTER</div><h2 class="modal-title">进入${CHAPTERS[next].name}？</h2><p class="modal-intro">当前阵容、字牌、墨点和波次将被替换。已获得的通关星级会保留，下一关从初始资源开始。</p><div class="result-actions"><button class="secondary" id="stay">继续当前战局</button><button class="primary" id="switch-chapter">进入下一关 →</button></div>`,()=>{$('#stay').onclick=closeModal;$('#switch-chapter').onclick=()=>{reset(next);closeModal();};});}
function result(){
 const won=game.phase==='won',stars=won?(game.hp/CHAPTERS[game.chapter].hp>=.8?3:game.hp/CHAPTERS[game.chapter].hp>=.4?2:1):0;
 if(won){records[game.chapter]=Math.max(records[game.chapter],stars);save();}
 const hasNext=game.chapter<CHAPTERS.length-1;
 openModal(`<div class="result"><div class="modal-eyebrow">${won?'CHAPTER COMPLETE':game.endless?'ENDLESS JOURNEY':'ANOTHER TRY'}</div><div class="result-seal">${won?'守':'再'}</div><h2 class="modal-title">${won?'此卷已守，山河无恙。':game.endless?'无尽止于此，落字再出发。':'落字未尽，来日再战。'}</h2><p class="modal-intro">${won?'继续无尽模式，保留阵容、墨点和剩余生命，挑战不断变强的墨影。':'可以重新挑战，也可以直接进入下一篇章。'}</p>${won?`<div class="result-stars">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</div>`:''}<div class="result-stats"><div><b>${game.kills}</b><small>击退墨影</small></div><div><b>${game.hp}</b><small>剩余生命</small></div><div><b>${game.wave}</b><small>${game.endless?'无尽波次':'抵御波次'}</small></div></div><div class="result-actions">${won?'<button class="primary" id="endless">继续游戏 · 无尽模式 →</button>':''}<button class="secondary" id="retry">重新挑战</button><button class="${won?'secondary':'primary'}" id="next">${hasNext?'进入下一关 →':'选择篇章 →'}</button></div></div>`,()=>{
  $('#retry').onclick=()=>{reset();closeModal();};
  $('#next').onclick=()=>{if(hasNext){reset(game.chapter+1);closeModal();}else chapters();};
  if($('#endless'))$('#endless').onclick=()=>{if(game.continueEndless()){paused=false;placing=null;selected=null;renderForge();updateUI();save();closeModal();toast('已进入无尽模式，阵容与墨点保留');}};
 });
}
function settings(){openModal(`<div class="modal-eyebrow">A QUIETER MOMENT</div><h2 class="modal-title">案头小设</h2><div class="setting-row"><div>游戏音效<p>攻击、落字与升级音效；密集攻击自动限频。</p></div><button id="sound-setting">${audioOn?'已开启':'已关闭'}</button></div><div class="setting-row"><div>重开当前篇章<p>重置当前布阵，保留已获得的通关星级。</p></div><button id="restart-setting">重新开始</button></div><div class="setting-row"><div>本地存档<p>战局与星级仅保存在此浏览器，无需注册。</p></div><button id="erase-setting" class="danger">清除全部进度</button></div><p class="modal-intro">字阵 v3.1 · 随机字牌 / ${WORDS.length.toLocaleString()} 种词语 / 十四流派<br>快捷键：空格迎战或暂停，Esc 取消选中。切换到其他页面会自动暂停。</p>`,()=>{$('#sound-setting').onclick=()=>{toggleSound();$('#sound-setting').textContent=audioOn?'已开启':'已关闭'};$('#restart-setting').onclick=()=>confirmReset(false);$('#erase-setting').onclick=()=>confirmReset(true);});}
function confirmReset(all){openModal(`<div class="modal-eyebrow">START AFRESH</div><h2 class="modal-title">${all?'清除全部进度？':'重新开始此卷？'}</h2><p class="modal-intro">${all?'当前战局与所有篇章星级将被清除。此操作无法撤销。':'当前阵容和波次将重置，已有通关星级会保留。'}</p><div class="result-actions"><button class="secondary" id="cancel-reset">保留进度</button><button class="primary" id="do-reset">确认${all?'清除':'重开'}</button></div>`,()=>{$('#cancel-reset').onclick=settings;$('#do-reset').onclick=()=>{if(all)records=Array(CHAPTERS.length).fill(0);reset(all?0:game.chapter);closeModal();toast(all?'已清除进度，山河重启':'新的一卷，落笔启程')};});}
function toggleSound(){audioOn=!audioOn;try{localStorage.setItem('wordward-audio-v1',audioOn?'on':'off');}catch{}$('.sound-off').classList.toggle('hidden',audioOn);$('#sound').setAttribute('aria-label',audioOn?'关闭音效':'开启音效');$('#sound').title=audioOn?'关闭音效':'开启音效';sound(520,.16);}
$('#sound').onclick=toggleSound;$('#settings').onclick=settings;$('#mobile-settings').onclick=settings;$('#guide-link').onclick=guide;$('#chapters').onclick=chapters;$$('[data-nav]').forEach(b=>b.onclick=()=>{if(b.dataset.nav==='codex')codex();else if(b.dataset.nav==='guide')guide();else{closeModal();return;}$$('.nav-item').forEach(x=>x.classList.toggle('active',x===b));});
function start(){if(mobileLayout.matches&&!document.body.classList.contains('playing'))enterGame();if(['won','lost'].includes(game.phase))return result();if(game.phase==='prepare'){if(!game.towers.some(t=>getWord(t.word).damage>0)){toast('先建造至少一座攻击词塔，再迎战墨影');return;}game.startWave();paused=false;sound(320,.2);save();}else{paused=!paused;save();}updateUI();}
$('#start').onclick=start;$('#resume').onclick=()=>{paused=false;updateUI()};$('#speed').onclick=()=>{speed=speed===1?2:speed===2?3:1;updateUI()};$('#skill').onclick=()=>{if(!paused&&game.skill()){sound(180,.4);toast('落墨如雨，荡尽墨影');save();updateUI();}};
document.addEventListener('keydown',e=>{if($('#modal').open)return;if(e.code==='Space'&&!['BUTTON','INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();start();}if(e.key==='Escape'){placing=null;selected=null;renderForge();updateUI();}});document.addEventListener('visibilitychange',()=>{if(document.hidden&&['battle','intermission'].includes(game.phase)){paused=true;save();updateUI();}});window.addEventListener('pagehide',save);
// All battle art is drawn locally; the game has no remote asset dependency.
let W=900,H=520,dpr=1,boardScale=1,boardX=0,boardY=0;
function resize(){
 const r=c.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,2);W=Math.round(r.width*dpr);H=Math.round(r.height*dpr);c.width=W;c.height=H;
 if(!W||!H)return;
 boardScale=Math.min(W/900,H/520);boardX=(W-900*boardScale)/2;boardY=(H-520*boardScale)/2;
 [...mapTargets.children].forEach((b,i)=>{b.style.left=(boardX+PADS[i].x*boardScale)/W*100+'%';b.style.top=(boardY+PADS[i].y*boardScale)/H*100+'%';});
}
new ResizeObserver(resize).observe(c);
function line(points,stroke,width){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();}
function circle(x,y,r,fill,stroke){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}}
function mountain(x,y,w,h,alpha){ctx.fillStyle=`rgba(126,149,111,${alpha})`;ctx.beginPath();ctx.moveTo(x-w/2,y);ctx.bezierCurveTo(x-w*.3,y-h*.18,x-w*.1,y-h,x,y-h);ctx.bezierCurveTo(x+w*.15,y-h,x+w*.25,y-h*.25,x+w/2,y);ctx.fill();}
const scenery=Array.from({length:63},(_,i)=>({x:(i*137+51)%900,y:(i*83+17)%520,r:3+(i*17)%6})).filter(p=>!PATH.slice(1).some((b,i)=>{const a=PATH[i];return p.x>=Math.min(a.x,b.x)-43&&p.x<=Math.max(a.x,b.x)+43&&p.y>=Math.min(a.y,b.y)-43&&p.y<=Math.max(a.y,b.y)+43})&&!PADS.some(t=>Math.hypot(t.x-p.x,t.y-p.y)<41));
let lastAttackSound=0;
const ATTACK_TONES={splash:[130,'triangle',.13],slow:[820,'sine',.09],chain:[210,'sawtooth',.06],fast:[540,'triangle',.045],heavy:[75,'triangle',.16],aura:[1046,'sine',.13],poison:[185,'sine',.11],sniper:[740,'triangle',.06],income:[1320,'sine',.08],pierce:[900,'triangle',.07],pulse:[160,'sine',.14],mark:[310,'sine',.12],echo:[620,'sine',.1],basic:[430,'triangle',.06]};
function attackAudio(type,now){if(!audioOn||!audioCtx||audioCtx.state!=='running'||now-lastAttackSound<85)return;lastAttackSound=now;const [freq,wave,duration]=ATTACK_TONES[type]||ATTACK_TONES.basic;try{const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type=wave;osc.frequency.setValueAtTime(freq,audioCtx.currentTime);osc.frequency.exponentialRampToValueAtTime(Math.max(40,freq*.55),audioCtx.currentTime+duration);gain.gain.setValueAtTime(.018,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);osc.connect(gain);gain.connect(audioCtx.destination);osc.start();osc.stop(audioCtx.currentTime+duration);}catch{}}
function drawEffect(f,time){
 const a=Math.max(0,f.life/f.max),progress=1-a;ctx.save();ctx.globalAlpha=a;
 if(f.sound&&!f.played){f.played=true;attackAudio(f.sound,time);}
 if(f.kind==='bolt'){
  const from=f.from,to=f.to,dx=to.x-from.x,dy=to.y-from.y,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len;
  const q={x:from.x+dx*progress,y:from.y+dy*progress};
  if(f.attackType==='chain'){
   const pts=Array.from({length:6},(_,i)=>({x:from.x+dx*i/5+(i>0&&i<5?Math.sin(i*13+time*.06)*10:0),y:from.y+dy*i/5+(i>0&&i<5?Math.cos(i*8+time*.06)*10:0)}));line(pts,f.color+'77',7);line(pts,'#f5e6a2',2);
  }else if(f.attackType==='heavy'){
   q.y-=Math.sin(progress*Math.PI)*45;circle(q.x,q.y,8,f.color,'#e4dbc0');line([{x:q.x-5,y:q.y-3},{x:q.x+3,y:q.y+4}],'#b9ac92',2);
  }else if(f.attackType==='pierce'||f.attackType==='aura'){
   line([from,to],f.color+'33',f.attackType==='aura'?11:8);line([from,to],f.color,2);circle(to.x,to.y,5+progress*10,null,f.color);
  }else if(f.attackType==='mark'){
   ctx.translate(to.x,to.y);ctx.rotate(progress*1.8);silhouette([[0,-17],[14,0],[0,17],[-14,0]],f.color+'33',f.color);circle(0,0,21,null,f.color);
  }else if(f.attackType==='pulse'){
   circle(from.x,from.y,15+progress*32,null,f.color);
  }else if(f.attackType==='echo'){
   ctx.strokeStyle=f.color;ctx.lineWidth=2;for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(from.x,from.y);ctx.quadraticCurveTo((from.x+to.x)/2-uy*side*30,(from.y+to.y)/2+ux*side*30,to.x,to.y);ctx.stroke();}circle(q.x,q.y,4,f.color);
  }else if(['sniper','fast','slow'].includes(f.attackType)){
   line([{x:q.x-ux*18,y:q.y-uy*18},q],f.color,3);silhouette([[q.x+ux*6,q.y+uy*6],[q.x-ux*5-uy*5,q.y-uy*5+ux*5],[q.x-ux*5+uy*5,q.y-uy*5-ux*5]],f.color);
   if(f.attackType==='slow')circle(to.x,to.y,8+progress*13,null,'#85b9c3');
  }else{
   line([{x:q.x-ux*14,y:q.y-uy*14},q],f.color+'66',7);circle(q.x,q.y,f.attackType==='splash'?6:4,f.color);
   if(f.attackType==='poison')for(let i=0;i<3;i++)circle(to.x+Math.cos(i*2)*progress*17,to.y+Math.sin(i*2)*progress*17,4,f.color+'66');
   if(f.attackType==='income'){ctx.fillStyle='#c7a655';ctx.font='15px serif';ctx.textAlign='center';ctx.fillText('◆',q.x,q.y);}
  }
 }else if(f.kind==='cast')circle(f.from.x,f.from.y,12+progress*15,null,f.color+'77');
 else if(f.kind==='blast'){circle(f.to.x,f.to.y,(f.radius||65)*progress,f.color+'15',f.color);circle(f.to.x,f.to.y,(f.radius||65)*progress*.7,null,f.color+'66');}
 else if(f.kind==='upgrade'){
  const p=f.to;circle(p.x,p.y,30+progress*45,null,'#c3a052');circle(p.x,p.y,22+progress*28,'#e2c36a22','#f2d48c');
  for(let i=0;i<10;i++){const angle=i*Math.PI/5;circle(p.x+Math.cos(angle)*(25+progress*38),p.y+Math.sin(angle)*(25+progress*38)-progress*15,2.5,'#ba9047');}
  ctx.fillStyle='#94713b';ctx.font='bold 21px serif';ctx.textAlign='center';ctx.fillText('升级 · '+f.level+'级',p.x,p.y-48-progress*25);
 }else if(f.kind==='coin'){ctx.fillStyle='#b38b35';ctx.font='bold 18px serif';ctx.textAlign='center';ctx.fillText('+'+f.amount+' 墨',f.to.x,f.to.y-20-progress*25);}
 else if(f.kind==='pop'){for(let i=0;i<5;i++){const angle=i*1.257;circle(f.to.x+Math.cos(angle)*progress*24,f.to.y+Math.sin(angle)*progress*24,2,f.color);}}
 else if(f.kind==='rain'){ctx.fillStyle='#f6f0d155';ctx.fillRect(0,0,900,520);for(let i=0;i<24;i++)line([{x:i*43,y:(i*67+progress*460)%520-70},{x:i*43-25,y:(i*67+progress*460)%520}],'#9c8050',2);}
 ctx.restore();
}
function drawBackdrop(time){
 const theme=getMap(game.chapter).theme;
 const pagoda=(x,y,size,color)=>{ctx.save();ctx.translate(x,y);ctx.scale(size,size);ctx.fillStyle=color;for(let i=0;i<3;i++){const y=-i*23;ctx.fillRect(-20,y-17,40,20);silhouette([[-32,y-17],[0,y-29],[32,y-17]],color);}line([{x:0,y:-79},{x:0,y:-92}],color,2);ctx.restore();};
 const bamboo=(x,y,size)=>{ctx.save();ctx.translate(x,y);ctx.scale(size,size);for(let j=0;j<3;j++){const xx=j*13;line([{x:xx,y:30},{x:xx-4,y:-90-j*13}],'#81987b66',3);for(let k=0;k<4;k++){const yy=-k*22;line([{x:xx-4,y:yy},{x:xx+3,y:yy}],'#607d5e66',2);for(const side of [-1,1])silhouette([[xx,yy],[xx+side*25,yy-15],[xx+side*10,yy-2]],'#79967655');}}ctx.restore();};
 if(theme==='mountain'){mountain(140,120,300,110,.15);mountain(780,500,340,150,.12);}
 if(theme==='bamboo'){for(const [x,y,z]of[[20,240,1.1],[415,180,.8],[790,60,1],[825,510,.85],[400,520,.7]])bamboo(x,y,z);}
 if(theme==='archive'){
  circle(790,58,28,'#e9e4cbaa');circle(803,48,25,mapColor);for(let i=0;i<40;i++)circle((i*139+45)%900,(i*61+15)%520,i%4===0?1.7:1,'#e0dfbc88');
  for(const [x,y,z]of[[80,140,1],[380,510,1.3],[880,450,.9]])pagoda(x,y,z,'#60768177');
  ctx.fillStyle='#a7b9bc22';for(let i=0;i<8;i++)ctx.fillRect(25+i*125,455,70,45);
 }
 if(theme==='river'){
  for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(-20,260+side*170);ctx.bezierCurveTo(220,260+side*80,350,320,450,330);ctx.bezierCurveTo(610,350,700,450,940,490);ctx.strokeStyle='#8ebbb677';ctx.lineWidth=48;ctx.stroke();}
  for(let i=0;i<24;i++){const x=(i*117)%900,y=300+(i*37)%210;line([{x,y},{x:x+18,y:y-2}],'#79a5a24d',1);}
 }
 if(theme==='cloud'){
  mountain(180,520,420,310,.14);mountain(700,440,330,320,.13);for(let i=0;i<10;i++){ctx.fillStyle='#f7f7ef88';ctx.beginPath();ctx.ellipse((i*173+20)%950,(i*97+40)%520,70+i%3*20,16,0,0,7);ctx.fill();}pagoda(770,90,.8,'#82919455');
 }
 if(theme==='corridor'){
  for(const y of [35,490])for(let i=0;i<9;i++){ctx.fillStyle='#a9947544';ctx.fillRect(15+i*110,y-18,8,38);ctx.fillStyle='#c1aa8655';ctx.fillRect(8+i*110,y-23,22,5);}
  ctx.strokeStyle='#b6a17c55';ctx.lineWidth=2;ctx.strokeRect(15,35,870,455);for(let i=0;i<5;i++){ctx.strokeStyle='#d2c6ab55';ctx.strokeRect(30+i*180,205,95,45);}
 }
 if(theme==='frost'){
  ctx.beginPath();ctx.moveTo(-20,280);ctx.bezierCurveTo(280,180,590,400,940,250);ctx.strokeStyle='#adcbd77a';ctx.lineWidth=75;ctx.stroke();
  for(let i=0;i<40;i++){const x=(i*137+40)%900,y=(i*71+25)%520;line([{x:x-4,y},{x:x+4,y}],'#ffffff99',1);line([{x,y:y-4},{x,y:y+4}],'#ffffff99',1);}
  for(const [x,y]of[[80,280],[540,360],[860,70]]){line([{x:x-30,y},{x,y:y+12},{x:x+30,y:y-8}],'#91b4c455',1.5);}
 }
 if(theme==='mirror'){
  for(const [x,y]of[[100,380],[450,90],[820,480]]){ctx.fillStyle='#b4a2c333';ctx.beginPath();ctx.ellipse(x,y,90,25,0,0,7);ctx.fill();ctx.save();ctx.translate(x,y);ctx.scale(1,-.35);pagoda(0,0,.8,'#8c769b55');ctx.restore();pagoda(x,y-8,.8,'#9d89a855');}
  for(let i=0;i<5;i++){ctx.strokeStyle='#b1a1bd44';ctx.lineWidth=3;ctx.strokeRect(40+i*190,55,55,110);}
 }
 if(theme==='beacon'){
  mountain(440,90,850,150,.15);for(const [x,y]of[[55,55],[75,505],[450,45]]){ctx.fillStyle='#95745b66';ctx.fillRect(x-14,y-3,28,32);silhouette([[x-21,y-4],[x,y-15],[x+21,y-4]],'#8b6a5366');circle(x,y-16,12,'#cb8a4f66');silhouette([[x-9,y-11],[x-5,y-28],[x,y-22],[x+6,y-36],[x+10,y-12]],'#d39a5777');}
  for(let i=0;i<10;i++)circle((i*173+30)%900,30+(i*39)%180,2,'#dba35877');
 }
 if(theme==='cosmos'){
  for(let i=0;i<65;i++)circle((i*137+24)%900,(i*83+18)%520,i%7===0?2:1,'#ddd1ae99');
  const stars=[{x:80,y:55},{x:220,y:32},{x:330,y:90},{x:555,y:45},{x:760,y:80},{x:840,y:160}];line(stars,'#b7a78755',1);
  ctx.save();ctx.translate(460,280);ctx.strokeStyle='#b4a17944';ctx.lineWidth=1;for(const r of [145,175,210])circle(0,0,r,null,'#b4a17933');ctx.setLineDash([3,13]);circle(0,0,235,null,'#c5ad7d55');ctx.restore();
  for(const [x,y]of[[55,55],[730,490]]){ctx.fillStyle='#d0bda244';ctx.fillRect(x,y,100,30);circle(x,y+15,4,'#c8b49677');circle(x+100,y+15,4,'#c8b49677');}
 }
}
const BOSS_COLORS={boss:'#b46b49',ironboss:'#aa8050',broodqueen:'#986aa6',stormboss:'#518eae',frostboss:'#699da9',inkking:'#b95862'};
function silhouette(points,fill,stroke){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}
function drawBoss(e,time){
 const color=BOSS_COLORS[e.kind],pulse=1+Math.sin(time*.004)*.05;
 ctx.save();ctx.scale(pulse,pulse);circle(0,0,42,null,color+'66');circle(0,0,48+Math.sin(time*.003)*3,null,color+'24');
 if(e.kind==='ironboss'){
  silhouette([[-22,-23],[-34,-6],[-27,26],[0,33],[27,26],[34,-6],[22,-23]],e.enraged?'#765647':'#5c6460','#b29b74');
  for(const y of [-2,8,18])line([{x:-19,y},{x:0,y:y+7},{x:19,y}],color,2);
  silhouette([[-24,-6],[-48,-12],[-51,17],[-36,33],[-23,20]],'#65716b','#c1b18c');
  line([{x:37,y:27},{x:37,y:-50}],'#b3b5a0',4);silhouette([[37,-59],[30,-39],[44,-39]],'#d3d2bc',color);
  silhouette([[-17,-30],[-23,-45],[-7,-38],[0,-43],[7,-38],[23,-45],[17,-30],[14,-11],[-14,-11]],'#343f3a','#c2ad81');
 }else if(e.kind==='broodqueen'){
  for(const side of [-1,1])for(let i=0;i<3;i++)line([{x:side*16,y:-6+i*9},{x:side*(38+i*3),y:-25+i*20},{x:side*(49+i*2),y:3+i*17}],color,4);
  ctx.fillStyle='#715371';ctx.beginPath();ctx.ellipse(0,10,29,34,0,0,7);ctx.fill();circle(0,-19,19,'#493c51','#c49bc5');
  for(const [x,y]of[[-12,10],[9,15],[0,31]])circle(x,y,7,'#b39aa8','#e0cbd6');
  line([{x:-12,y:-30},{x:-21,y:-45}],color,3);line([{x:12,y:-30},{x:21,y:-45}],color,3);
 }else if(e.kind==='stormboss'){
  const flap=Math.sin(time*.007)*7;
  for(const side of [-1,1])silhouette([[side*10,-9],[side*39,-33-flap],[side*72,-18-flap],[side*49,-8],[side*66,2],[side*31,10],[side*14,16]],'#557d91','#9bc5cd');
  silhouette([[-13,-21],[0,-37],[14,-20],[19,15],[0,37],[-19,15]],'#3e596d','#b3cdd0');
  silhouette([[5,-29],[24,-21],[8,-17]],'#dfba68');
  line([{x:-7,y:30},{x:-18,y:47},{x:0,y:41},{x:-7,y:60}],'#deb96d',4);
 }else if(e.kind==='frostboss'){
  ctx.setLineDash([6,7]);circle(0,0,52,null,'#82b5c1');ctx.setLineDash([]);
  silhouette([[0,-41],[-21,-14],[-34,34],[-14,26],[0,41],[14,26],[34,34],[21,-14]],'#587582','#accbd0');
  silhouette([[0,-34],[-16,-9],[0,2],[16,-9]],'#2e4953','#a9ced4');
  line([{x:35,y:32},{x:35,y:-42}],'#c8d8d2',3);circle(35,-43,10,'#8ab9c5','#dbe4d4');
  silhouette([[-11,0],[-19,24],[0,30],[19,24],[11,0]],'#a0bfbd','#d1ddd0');circle(0,31,4,'#e5d6a2');
 }else if(e.kind==='inkking'){
  silhouette([[0,-38],[-27,-20],[-39,33],[-20,25],[-9,44],[0,32],[12,45],[23,26],[38,34],[26,-20]],'#413e4c',e.enraged?'#cf6871':'#a17a8c');
  silhouette([[-20,-28],[-23,-48],[-6,-37],[0,-45],[6,-37],[23,-48],[20,-28],[13,-10],[-13,-10]],'#282f35','#c78686');
  for(let i=0;i<4;i++){const x=(i<2?-1:1)*(34+(i%2)*12),y=-7+(i%2)*29+Math.sin(time*.003+i)*4;ctx.save();ctx.translate(x,y);ctx.rotate(i%2?.2:-.2);ctx.fillStyle='#d4c4ae';ctx.fillRect(-6,-11,12,22);line([{x:-3,y:-4},{x:3,y:-4},{x:-2,y:1},{x:3,y:6}],'#755866',1.4);ctx.restore();}
  circle(0,13,8,e.enraged?'#e08579':'#9d5b65','#e4b5a0');
 }else{
  silhouette([[-21,-22],[-31,4],[-28,33],[-12,24],[0,39],[12,24],[28,33],[31,4],[21,-22]],'#655149',color);
  silhouette([[-19,-25],[-31,-47],[-12,-35],[0,-41],[12,-35],[31,-47],[19,-25],[15,-5],[-15,-5]],'#3d3c36','#c29168');
  line([{x:-22,y:8},{x:-38,y:29}],'#d4bd96',5);line([{x:22,y:8},{x:38,y:29}],'#d4bd96',5);
 }
 ctx.fillStyle=e.enraged?'#ffbc9a':'#f4deb0';ctx.fillRect(-9,-20,5,4);ctx.fillRect(5,-20,5,4);
 if(e.shield>0){ctx.strokeStyle='#86b6df';ctx.lineWidth=3;circle(0,0,53,null,'#86b6df');}
 if(e.enraged){ctx.setLineDash([7,5]);circle(0,0,56,null,'#cb5e58');ctx.setLineDash([]);}
 ctx.restore();
 const font=Math.max(14,8*dpr/boardScale);ctx.font=`600 ${font}px system-ui`;ctx.textAlign='center';const title=ENEMIES[e.kind].name,labelWidth=ctx.measureText(title).width;
 ctx.fillStyle='#f8f0dfed';ctx.fillRect(-labelWidth/2-5,-70-font,labelWidth+10,font+7);ctx.fillStyle=color;ctx.fillText(title,0,-68);
 ctx.fillStyle='#d4cab3';ctx.fillRect(-34,-61,68,5);ctx.fillStyle=color;ctx.fillRect(-34,-61,68*Math.max(0,e.hp/e.maxHp),5);
}
function drawEnemy(e,time){
 const p=enemyPosition(e),boss=ENEMIES[e.kind].boss;ctx.save();ctx.translate(p.x,p.y+Math.sin(time*.009+e.id)*2);
 if(boss){ctx.fillStyle='#383e3929';ctx.beginPath();ctx.ellipse(2,36,40,12,0,0,7);ctx.fill();drawBoss(e,time);ctx.restore();return;}
 const r=e.kind==='tank'?18:e.kind==='armor'?14:e.kind==='small'?7:11;
 circle(2,r*.8,r*.9,'#44534122');ctx.fillStyle=e.poisonUntil>game.time?'#7d8043':e.slowUntil>game.time?'#64838b':isAir(e)?'#62848c':['regen','healer'].includes(e.kind)?'#6c8a58':e.kind==='shield'?'#6b7892':e.kind==='tank'?'#756354':['split','brood'].includes(e.kind)?'#84657d':e.kind==='armor'?'#6f7161':'#48534a';
 ctx.beginPath();ctx.moveTo(-r,r*.6);ctx.bezierCurveTo(-r*1.3,-r,-r*.4,-r*1.4,0,-r);ctx.bezierCurveTo(r,-r*1.3,r*1.3,0,r,r*.7);ctx.lineTo(r*.3,r*.4);ctx.lineTo(0,r*.8);ctx.lineTo(-r*.4,r*.45);ctx.fill();
 ctx.fillStyle='#ecebd4';ctx.fillRect(-5,-3,2,3);ctx.fillRect(3,-3,2,3);
 if(e.kind==='armor'){ctx.strokeStyle='#b7b69a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-2,9,Math.PI,0);ctx.stroke();}
 if(isAir(e))line([{x:-21,y:-4},{x:-10,y:6},{x:0,y:-4},{x:10,y:6},{x:21,y:-4}],'#92b1af',3);
 if(e.kind==='regen'){ctx.fillStyle='#c8dfaf';ctx.fillRect(-1,-11,2,9);ctx.fillRect(-4,-8,8,2);}
 if(e.shield>0){ctx.strokeStyle='#8eacd2';ctx.lineWidth=3;circle(0,0,18,null,'#8eacd2');}
 if(e.kind==='split')line([{x:0,y:-11},{x:-3,y:-2},{x:3,y:3},{x:0,y:10}],'#c3a9c5',1.5);
 if(['healer','banner','ward','brood','lancer'].includes(e.kind)){ctx.fillStyle='#f5edd5';ctx.font='12px serif';ctx.textAlign='center';ctx.fillText({healer:'医',banner:'旗',ward:'阵',brood:'卵',lancer:'冲'}[e.kind],0,11);}
 if(e.markUntil>game.time||e.lightUntil>game.time||e.bountyUntil>game.time)circle(0,0,r+4,null,e.markUntil>game.time?'#ae75a1':e.lightUntil>game.time?'#cfb75d':'#ba944f');
 if(e.kind==='swift'){line([{x:-r-8,y:1},{x:-r-3,y:1}],'#8a967e',1);line([{x:-r-11,y:5},{x:-r-4,y:5}],'#a2ac95',1);}
 if(e.hp<e.maxHp){ctx.fillStyle='#a8b099';ctx.fillRect(-16,-r-10,32,3);ctx.fillStyle='#768c68';ctx.fillRect(-16,-r-10,32*Math.max(0,e.hp/e.maxHp),3);}ctx.restore();
}
function draw(time){if(!W||!H)return;ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=mapColor;ctx.fillRect(0,0,W,H);ctx.setTransform(boardScale,0,0,boardScale,boardX,boardY);ctx.clearRect(0,0,900,520);ctx.fillStyle=mapColor;ctx.fillRect(0,0,900,520);mountain(20,520,370,160,.1);mountain(790,110,340,160,.085);mountain(520,550,330,120,.1);mountain(500,36,190,75,.06);
 drawBackdrop(time);
 // very fine contours and wind lines
 ctx.strokeStyle='#a7b79b29';ctx.lineWidth=1;for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(10,500,190+i*22,100+i*13,-.25,Math.PI,Math.PI*2);ctx.stroke();}for(const p of (game.chapter<2?scenery:[]).filter(p=>!routes.some(route=>route.slice(1).some((b,i)=>{const a=route[i];return p.x>=Math.min(a.x,b.x)-35&&p.x<=Math.max(a.x,b.x)+35&&p.y>=Math.min(a.y,b.y)-35&&p.y<=Math.max(a.y,b.y)+35;})))){circle(p.x,p.y,p.r,'#a8ba9544');circle(p.x+4,p.y-3,p.r*.7,'#9bae8744');ctx.fillStyle='#9cab8755';ctx.fillRect(p.x-1,p.y,1,7);}
 // path, paper edge, center speckles
 for(const route of routes){const dark=[2,9].includes(game.chapter);line(route,dark?'#5a6a74':'#cad1b9',48);line(route,dark?'#a4a99c':'#f7f4e5',43);line(route,dark?'#b6b7a4':'#e4dfc8',33);line(route,dark?'#c8c4ad':'#ebe5d0',28);ctx.setLineDash([2,13]);line(route,'#d1c9ae',1);ctx.setLineDash([]);}
 // entry marker and quiet stones
 routes.forEach((route,i)=>{const start=route[0],x=Math.min(875,Math.max(25,start.x)),y=Math.min(485,Math.max(35,start.y));ctx.save();ctx.translate(x,y);circle(0,0,15,'#a35f4c','#f1d5ad');ctx.fillStyle='#fff0d4';ctx.font='13px serif';ctx.textAlign='center';ctx.fillText('入'+(i+1),0,5);ctx.restore();});
 for(const p of [{x:59,y:188},{x:150,y:390},{x:466,y:60},{x:740,y:121},{x:857,y:415}]){ctx.fillStyle='#bdc5ad';ctx.beginPath();ctx.ellipse(p.x,p.y,9,5,.4,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(p.x+12,p.y+4,5,3,-.3,0,7);ctx.fill();}
 // mountain gate at end of trail
 ctx.save();ctx.translate(Math.min(865,Math.max(35,PATH.at(-1).x)),Math.min(470,Math.max(50,PATH.at(-1).y)));ctx.fillStyle='#a4b295';ctx.fillRect(-20,-28,5,50);ctx.fillRect(15,-28,5,50);ctx.fillStyle='#6e8767';ctx.fillRect(-26,-36,52,8);ctx.fillRect(-22,-18,44,5);ctx.beginPath();ctx.moveTo(-34,-35);ctx.quadraticCurveTo(0,-48,34,-35);ctx.lineTo(26,-29);ctx.lineTo(-26,-29);ctx.fill();ctx.fillStyle='#e9e9d6';ctx.fillRect(-9,-29,18,15);ctx.font='9px serif';ctx.textAlign='center';ctx.fillStyle='#68815e';ctx.fillText('山门',0,-18);ctx.restore();
 for(let i=0;i<PADS.length;i++){const p=PADS[i],t=game.towers.find(t=>t.pad===i),highlight=hover===i;if(t)continue;if(!game.padUnlocked(i)){circle(p.x,p.y,23,'#d9dfd0','#a4af96');ctx.fillStyle='#819071';ctx.font='17px serif';ctx.textAlign='center';ctx.fillText('锁',p.x,p.y+6);continue;}circle(p.x,p.y+4,26,'#bdc9ab33');circle(p.x,p.y,23,placing?'#f7f4df':'#eef0e1','#bbc7a8');circle(p.x,p.y,18,null,placing?'#8b9d75':'#d4dcc7');ctx.strokeStyle=placing?'#8a9b70':'#b5c1a3';ctx.lineWidth=1;line([{x:p.x-5,y:p.y},{x:p.x+5,y:p.y}],ctx.strokeStyle,1);line([{x:p.x,y:p.y-5},{x:p.x,y:p.y+5}],ctx.strokeStyle,1);if(placing||highlight){ctx.setLineDash([3,5]);circle(p.x,p.y,30+(placing?Math.sin(time*.002)*1.5:0),null,'#92a47b');ctx.setLineDash([]);}}
 const sel=game.towers.find(t=>t.id===selected);if(sel){const w=getWord(sel.word),p=PADS[sel.pad];circle(p.x,p.y,towerStats(sel).range,w.color+'0e',w.color+'65');}
 for(const t of game.towers){const p=PADS[t.pad],w=getWord(t.word);if(w.type==='aura'){ctx.setLineDash([4,12]);circle(p.x,p.y,38+Math.sin(time*.001)*2,null,'#bea96766');ctx.setLineDash([]);}ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='#7e8f6a33';ctx.beginPath();ctx.ellipse(3,24,31,11,0,0,7);ctx.fill();ctx.fillStyle='#b6c0a1';ctx.fillRect(-23,16,46,6);ctx.fillStyle='#d9debf';ctx.fillRect(-19,10,38,9);ctx.fillStyle='#f9f4e4';ctx.strokeStyle=w.color;ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(-22,-29,44,47,4);ctx.fill();ctx.stroke();ctx.strokeStyle=w.color+'66';ctx.lineWidth=.7;ctx.strokeRect(-18,-25,36,39);ctx.fillStyle=w.color;ctx.font='26px "Noto Serif SC", "Songti SC", serif';ctx.textAlign='center';ctx.fillText(w.icon,0,4);ctx.fillStyle=w.color;ctx.fillRect(-26,-33,52,5);for(let j=0;j<t.level;j++)circle((j-(t.level-1)/2)*7,27,2.2,w.color);const labelFont=Math.max(10,7*dpr/boardScale);ctx.font=labelFont+'px system-ui,"PingFang SC","Microsoft YaHei",sans-serif';const labelWidth=ctx.measureText(w.word).width;ctx.fillStyle='#f7f4e8e8';ctx.fillRect(-labelWidth/2-4,34,labelWidth+8,labelFont+4);ctx.fillStyle='#526748';ctx.fillText(w.word,0,34+labelFont);if(selected===t.id||hover===t.pad){ctx.strokeStyle='#7d9065';ctx.lineWidth=1;ctx.strokeRect(-29,-39,58,75)}ctx.restore();}
 for(const e of game.enemies)drawEnemy(e,time);

 for(const f of game.effects)drawEffect(f,time);

}
let last=0,lastUI=0,lastSave=0;function frame(now){const dt=last?Math.min((now-last)/1000,.1):0;last=now;if(document.body.classList.contains('playing')&&!paused&&!$('#modal').open){for(let i=0;i<speed;i++)game.step(dt);}if(game.events.length){const events=game.events.splice(0);for(const e of events){if(e.type==='wave'){save();if(wavePlan(game.chapter,game.wave).boss)toast(ENEMIES[wavePlan(game.chapter,game.wave).bossKind].name+'压境 · 点击敌情查看机制');}if(e.type==='clear'){toast(`第 ${Math.ceil(game.wave/3)} 轮 · ${(game.wave-1)%3+1}/3 波已清，获得 ${e.reward} 墨点${e.roundEnd?' · 本轮结束':''}`);sound(780,.25);save();renderForge();}if(e.type==='upgrade'){game.effects.push({kind:'upgrade',to:PADS[e.pad],level:e.level,life:1,max:1});sound(784,.14);setTimeout(()=>sound(1047,.18),90);}if(e.type==='boss-phase')toast(e.name+'进入二阶段！');if(e.type==='leak')sound(150,.14);if(e.type==='won'||e.type==='lost'){placing=null;selected=null;renderForge();save();result();}}}if(now-lastUI>180){updateUI();lastUI=now;}if(now-lastSave>5000){save();lastSave=now;}draw(now);requestAnimationFrame(frame);}
renderForge();updateUI();resize();save();requestAnimationFrame(frame);
