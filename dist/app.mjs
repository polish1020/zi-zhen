import {SPECIAL_PALETTES,IDIOM_MOVES} from './specials.mjs';
import {Game,WORDS,CHAPTERS,getMap,getWord,matchWord,towerStats,GRADES,HINT_COST,REFRESH_COST,SKILL_COOLDOWN,ENEMIES,enemyPosition,wavePlan,gradeEffect,isAir,WAVE_INTERVAL,THEME_UNITS,astralPhase,damageClass,WORD_TRAITS,traitEffect,COMMON_BOSSES,MAP_BOSSES,MAP_BOSS_POOLS,bossChapter,hasIceShell,WORD_RUNES,runeEffect,hasRune,MAP_MINION_POOLS,COMMON_MINIONS,minionChapter,enemyHealthScale,runeLimit,bossSkillName,bossSkillText,towerDefense,towerActive,enemyWeapon,wordCategory,wordLearning,isGameSkill,isCultureWord,rebuildPercent,bossPower,bossPowerText,bossAura,bossAuraText,SPECIAL_EFFECTS,attackName,learningRank} from './engine.mjs';
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
const standaloneDisplay=matchMedia('(display-mode: standalone)');
let viewportFrame=0;
function syncViewport(){
 viewportFrame=0;
 const root=document.documentElement,installed=navigator.standalone===true||standaloneDisplay.matches;
 // Standalone iOS can under-report innerHeight too. Its game shell is anchored
 // to all four viewport edges in CSS, independently of these JS measurements.
 const height=window.innerHeight||root.clientHeight;
 if(installed)root.style.removeProperty('--app-height');
 else root.style.setProperty('--app-height',height+'px');
 root.style.setProperty('--visual-height',(window.visualViewport?.height||height)+'px');
 root.dataset.standalone=String(installed);
}
function scheduleViewport(){if(!viewportFrame)viewportFrame=requestAnimationFrame(syncViewport);}
syncViewport();
window.addEventListener('resize',scheduleViewport);
window.addEventListener('orientationchange',scheduleViewport);
window.addEventListener('pageshow',scheduleViewport);
document.addEventListener('fullscreenchange',scheduleViewport);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)scheduleViewport();});
window.visualViewport?.addEventListener('resize',scheduleViewport);
standaloneDisplay.addEventListener('change',scheduleViewport);
function enterGame(){sound(440,.06);document.body.classList.add('playing');document.documentElement.classList.add('game-open');syncViewport();if(mobileLayout.matches)window.scrollTo(0,0);if(['won','lost'].includes(game.phase))setTimeout(result,0);if(mobileLayout.matches&&document.documentElement.dataset.standalone!=='true'&&!document.fullscreenElement&&document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().catch(()=>{});}
function updateHome(){const progress=game.wave>0||game.towers.length>0||game.refreshes>0||game.hintWord!==null||game.ink!==CHAPTERS[game.chapter].ink||game.hand.some(t=>t.used);$('#enter-game').innerHTML=progress?'继续游戏 <span>接着守护这卷山河 →</span>':'开始游戏 <span>落笔，启程 →</span>';$('#home-word-count').textContent=WORDS.length.toLocaleString()+' 种词语';$('#home-chapter-name').textContent=CHAPTERS[game.chapter].name;$('#home-save-note').textContent=progress?'已保存当前战局与字牌，点击继续游戏即可恢复。':'进度保存在当前浏览器，随时回来继续守关。';}
$('#enter-game').onclick=enterGame;
$('#exit-game').onclick=()=>{if(['battle','intermission'].includes(game.phase))paused=true;document.body.classList.remove('playing');document.documentElement.classList.remove('game-open');if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});save();updateUI();};
$('#jump-codex').onclick=codex;
$('#game-guide').onclick=guide;
$('#home-guide').onclick=guide;
$('#home-chapters').onclick=chapters;
$('#enemy-preview').onclick=enemyGuide;
$('#advance-chapter').onclick=()=>{if(game.chapter<CHAPTERS.length-1)confirmNextChapter();else chapters();};
const c=$('#battlefield');let ctx=c.getContext('2d');c.removeAttribute('tabindex');c.setAttribute('role','img');
const mapTargets=document.createElement('div');mapTargets.className='map-targets';mapTargets.setAttribute('aria-label','阵位');$('#canvas-wrap').append(mapTargets);
PADS.forEach((p,i)=>{const b=document.createElement('button');b.className='map-target';b.style.left=`${p.x/9}%`;b.style.top=`${p.y/5.2}%`;b.setAttribute('aria-label',`空阵位 ${i+1}，点击放置词塔`);b.onclick=()=>selectPad(i);b.onmouseenter=()=>hover=i;b.onmouseleave=()=>hover=-1;b.onfocus=()=>hover=i;b.onblur=()=>hover=-1;mapTargets.append(b);});
const battleNotice=document.createElement('div');battleNotice.className='battle-notice';battleNotice.id='battle-notice';battleNotice.setAttribute('role','status');battleNotice.setAttribute('aria-live','polite');const battleMessages=document.createElement('div');battleMessages.className='battle-messages';$('.battle-top').after(battleMessages);battleMessages.append(battleNotice,$('#pause-overlay'));
function toast(msg){battleNotice.textContent=msg;battleNotice.title=msg;battleNotice.classList.add('active');if(!document.body.classList.contains('playing')){$('#toast').textContent=msg;$('#toast').classList.add('visible');}clearTimeout(toastTimer);toastTimer=setTimeout(()=>{$('#toast').classList.remove('visible');battleNotice.classList.remove('active');battleNotice.textContent=paused?'时间已暂停，可组词布阵':mapModeLabel()+' · 单击词塔查看属性与升级';},3400);}
function save(){try{localStorage.setItem(SAVE,JSON.stringify(game.export()));localStorage.setItem(RECORD,JSON.stringify(records));$('#save-status').textContent='✓ 进度自动保存';}catch{$('#save-status').textContent='此浏览器无法保存进度';}}
function sound(note=440,duration=.09){if(!audioOn)return;try{audioCtx??=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.value=note;g.gain.setValueAtTime(.045,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+duration);}catch{}}
function updateTowerDefense(){
 const t=game.towers.find(t=>t.id===selected);
 if(t&&$('#repair')){const d=towerDefense(t),hp=t.hp??d.maxHp,cost=game.repairCost(t),cooldown=Math.ceil(Math.max(0,(t.repairReadyAt||0)-game.time)),terminal=['won','lost'].includes(game.phase),pressure=game.towerPressure(t);
  $('#tower-hp').textContent=`${towerActive(t)?'耐久':'废墟'} ${Math.ceil(hp)} / ${d.maxHp} · 护甲 ${Math.round(Math.max(0,d.armor-(t.corrodedUntil>game.time?.1:0))*100)}%${t.corrodedUntil>game.time?' · 腐蚀':''}${t.chillUntil>game.time?' · 冰滞':''}${t.disruptedUntil>game.time?' · 封禁攻击 '+Math.ceil((t.disruptedUntil-game.time)*10)/10+'s':''}${t.lessonShieldUntil>game.time&&t.lessonShield>0?' · 学盾 '+Math.ceil(t.lessonShield):''}${(t.lessonPowerUntil>game.time||t.idiomPowerUntil>game.time)?' · 强化就绪':''}${t.lessonHasteUntil>game.time?' · 鼓舞':''}${getWord(t.word).idiomMove?' · 绝技 '+(t.idiomCharge||0)+'/4'+(t.idiomReadyAt>game.time?' · 冷却 '+Math.ceil(t.idiomReadyAt-game.time)+'s':''):''}${pressure>2?' · 围攻 '+pressure:''}`;
  $('#tower-damage').textContent=towerActive(t)?primaryValue(getWord(t.word),towerStats(t)):'停用';$('#tower-rate').textContent=towerActive(t)?towerStats(t).rate.toFixed(2)+'s':'停用';
  $('#tower-hp-bar').value=hp;$('#tower-hp-bar').max=d.maxHp;
  $('#repair').innerHTML=`${hp<=0?'重建词塔':cost?'修复词塔':'耐久完好'}<span>${cooldown?'冷却 '+cooldown+'s':cost?cost+' 墨点'+(hp<=0?' · '+rebuildPercent(t)+'%':''):'无需花费'}</span>`;
  $('#repair').disabled=!cost||cooldown>0||game.ink<cost||terminal;
  $('#upgrade').disabled=!towerActive(t)||t.level>=getWord(t.word).maxLevel||game.ink<game.upgradeCost(t)||terminal;
  if(!towerActive(t))$('#upgrade').innerHTML='需先重建<span>词语和等级保留</span>';
  $('#sell').disabled=terminal;
 }
 const siege=game.enemies.filter(e=>e.hp>0&&e.towerTarget!==undefined),ruins=game.towers.filter(t=>!towerActive(t));
 if(siege.length)c.setAttribute('aria-label',c.getAttribute('aria-label')+'；攻塔蓄力 ×'+siege.length);
 if(ruins.length)c.setAttribute('aria-label',c.getAttribute('aria-label')+'；损毁词塔 ×'+ruins.length);
}
function siegeDescription(kind){const w=enemyWeapon(kind),mode={melee:'近战',cleave:'范围重击',air:'空中掠袭',stalker:'辅助猎手',spell:'远程法术'}[w.style];return `攻塔 · ${w.name}（${mode}）：基础伤害 ${w.damage}，距离 ${w.range}，间隔 ${w.interval.toFixed(2).replace(/0+$/,'').replace(/\.$/,'')} 秒，先蓄力再命中。${w.sideRatio?'可波及附近另一座塔，副伤害为 '+Math.round(w.sideRatio*100)+'%。':''}${w.style==='stalker'?'优先袭击范围内的辅助词塔，光照可化解偷袭加成。':''}${w.style==='spell'?'冰冻或缄默可打断蓄力。':'冰冻可打断蓄力。'}${w.debuff==='corrode'?'命中腐蚀护甲 4 秒。':w.debuff==='chill'?'命中造成冰滞 2.5 秒。':w.debuff==='flame'?'焰击可被火塔抵抗。':''}`;}

function recipe(){return matchWord(chars.map(id=>game.hand.find(t=>t.id===id&&!t.used)?.ch).filter(Boolean));}
function attributeBadge(w){return `<span class="attribute-badge" style="--attribute-color:${w.color}"><b>${w.icon}</b><span>${w.name}</span></span>`;}
function wordTypeLabel(w){return{idiom:'成语',skill:'技能词',phrase:'四字词',common:w.tier===1?'单字':'词语'}[wordCategory(w.word)];}
function learningCard(w){const lesson=wordLearning(w.word);return lesson?`<div class="word-learning-card"><b>${lesson.culture?'传统文化 · ':''}${wordTypeLabel(w)}释义 · ${lesson.group}</b><p>${lesson.meaning}</p></div>`:'';}
function identity(w,compact=false){return `<div class="word-identity">${attributeBadge(w)}<span class="grade-badge grade-${w.tier}">${GRADES[w.tier]} · ${w.tier} 字</span><span class="attack-badge">${damageClass(w)} · ${w.tag}</span>${compact?'':`<span class="trait-badge">${attackName(w)}</span>${w.runes.map(id=>`<span class="meaning-badge" title="${WORD_RUNES[id].desc}">${WORD_RUNES[id].name}</span>`).join('')}`}</div>`;}
function idiomOnly(w){return !!w.idiomMove&&traitEffect(w)===IDIOM_MOVES[w.idiomMove].desc;}
function idiomCard(w,modal=false){const m=IDIOM_MOVES[w.idiomMove];return m&&!idiomOnly(w)?`<div class="tower-effect-block idiom-effect-card ${modal?'grade-effect-card':''}"><h5>词义绝技 · ${m.name}</h5><p>${m.desc}</p></div>`:'';}
function runeSummary(w){return `${GRADES[w.tier]} · 附加特性 ${w.runes.length}/${runeLimit(w.tier)}`;}
function bossWindup(e){const skill=ENEMIES[e.kind].pulse,left=e.pulseAt-game.time;return !!(skill&&(e.pulses||0)<skill.limit&&left>=0&&left<=1&&!(e.silencedUntil>game.time));}
function primaryValue(w,stats=w){return w.type==='income'?`${stats.damage} / ${stats.income}`:w.type==='aura'?`${stats.damage} / ${Math.round(stats.aura*100)}%`:stats.damage;}
function primaryLabel(w){return w.type==='income'?'攻击 / 每轮产墨':w.type==='aura'?'攻击 / 光环增伤':'攻击伤害';}
function towerEffectSections(w,defense,t){
 const section=(id,title,content)=>`<section class="tower-effect-section" aria-labelledby="tower-section-${id}"><h4 id="tower-section-${id}">${title}</h4>${content}</section>`;
 return `<div class="tower-effects"><div class="tower-effect-content" tabindex="0" role="region" aria-label="词塔效果说明">${wordLearning(w.word)?section('learning',wordTypeLabel(w)+'释义',`<p>${wordLearning(w.word).meaning}</p>`):''}${section('attack','攻击效果',`${w.special?'':`<div class="tower-effect-block"><h5>基础属性 · ${w.name}</h5><p>${w.desc}</p></div>`}<div class="tower-effect-block trait-effect"><h5>${idiomOnly(w)?'词义绝技':w.special?'战斗演绎':'攻击形态'} <span class="trait-badge">${attackName(w)}</span></h5><p>${traitEffect(w)}</p></div>${idiomCard(w)}`)}${section('defense','守备能力',`<p class="defense-effect">${defense.role}</p><p class="crowd-defense-note">围攻伤害直接叠加；塔的护甲和保护光环仍可减伤。</p><p class="crowd-defense-note">重建按每座塔的次数递增：投入的 50% 起，每次增加 15 个百分点，上限 100%；修复不随次数涨价。此塔已重建 ${t.rebuilds||0} 次，下次按 ${rebuildPercent(t)}% 计费。</p>`)}${section('meaning','附加词义',`<div class="meaning-effect"><span class="rune-capacity">${runeSummary(w)}</span>${w.runes.length?w.runes.map(id=>`<div class="tower-meaning-row"><span class="meaning-badge">${WORD_RUNES[id].name}</span><p>${runeEffect({...w,runes:[id]}).slice(WORD_RUNES[id].name.length+1)}</p></div>`).join(''):`<p>${runeEffect(w)}</p>`}</div>`)}${section('grade','品质特性',`<p class="grade-effect">${GRADES[w.tier]} · ${gradeEffect(w)}</p>`)}</div></div>`;
}
function renderForge(){
 const panel=$('.forge-panel'),tower=detailOpen?game.towers.find(t=>t.id===selected):null;
 if(!game.towers.some(t=>t.id===selected)){selected=null;detailOpen=false;}
 panel.classList.toggle('inspecting',!!tower);
 if(tower){
  const t=tower,w=getWord(t.word),stats=towerStats(t),max=t.level>=w.maxLevel,defense=towerDefense(t);
  panel.innerHTML=`<div class="forge-heading"><span>词塔详情</span><button id="back-forge" aria-label="返回组字工坊">返回字库 ↗</button></div><div class="tower-detail"><h3>${w.word}<small class="vocabulary-badge">${wordTypeLabel(w)}</small></h3><div class="tower-level">${identity(w,true)}<div class="tower-integrity"><span id="tower-hp"></span><progress id="tower-hp-bar" max="${defense.maxHp}" value="${t.hp??defense.maxHp}" aria-label="词塔耐久"></progress></div></div><div class="detail-stats"><div><small>${primaryLabel(w)}</small><b id="tower-damage">${primaryValue(w,stats)}</b></div><div><small>攻击范围</small><b>${stats.range}</b></div><div><small>攻击间隔</small><b id="tower-rate">${w.damage?stats.rate.toFixed(2)+'s':'—'}</b></div><div><small>当前等级</small><b>${t.level} / ${w.maxLevel}</b></div></div>${towerEffectSections(w,defense,t)}<div class="tower-actions"><button id="upgrade" class="forge-button">${max?'已臻化境':'升级词塔'}<span>${max?'最高等级':game.upgradeCost(t)+' 墨点 ↗'}</span></button><button id="repair" class="forge-button repair-button"></button><button id="sell" class="sell-button">拆除<span>返还 ${game.salvageValue(t)} 墨点</span></button></div></div><div class="forge-footnote">存活塔返还投入的 70%，废墟 35%；修缮不增加返还基数。</div>`;
  $('#back-forge').onclick=()=>{selected=null;detailOpen=false;renderForge();updateUI();};
  $('#upgrade').disabled=max||game.ink<game.upgradeCost(t)||['won','lost'].includes(game.phase);
  $('#upgrade').onclick=()=>{if(game.upgrade(t.id)){sound(660);toast('词塔升级成功');save();renderForge();updateUI();}};
  $('#repair').onclick=()=>{if(game.repair(t.id)){save();renderForge();updateUI();}};
  $('#sell').onclick=()=>{game.sell(t.id);selected=null;renderForge();save();updateUI();toast('已返还墨点，消耗的字牌不返还');};
  updateTowerDefense();return;
 }
 panel.innerHTML=forgeTemplate;
 chars=chars.filter(id=>game.hand.some(t=>t.id===id&&!t.used));
 $('#forge-slots').innerHTML=Array.from({length:4},(_,i)=>{const id=chars[i],tile=game.hand.find(t=>t.id===id);return `<button class="forge-slot ${tile?'':'empty'}" data-slot="${i}" aria-label="${tile?'取消字牌'+tile.ch:'第'+(i+1)+'个字位'}" ${tile?'':'disabled'}>${tile?.ch||['一','二','三','四'][i]}</button>`;}).join('');
 $$('[data-slot]').forEach(b=>b.onclick=()=>{chars.splice(+b.dataset.slot,1);placing=null;renderForge();updateUI();});
 $('#hand-meta').textContent=`剩余 ${game.hand.filter(t=>!t.used).length} / ${game.hand.length}`;
 $('#character-grid').innerHTML=game.hand.map(t=>`<button class="char ${chars.includes(t.id)?'selected':''} ${t.used?'used':''}" data-char="${t.ch}" data-tile="${t.id}" aria-pressed="${chars.includes(t.id)}" aria-label="${t.used?'已用':'选择'}字牌${t.ch}，编号${t.id}" ${t.used?'disabled':''}>${t.ch}${t.used?'<small>已用</small>':''}</button>`).join('');
 $$('.char').forEach(b=>b.onclick=()=>{placing=null;const id=+b.dataset.tile;if(chars.includes(id))chars=chars.filter(x=>x!==id);else if(chars.length<4)chars.push(id);else{toast('最多选择四张字牌，点击已选字牌可以撤回');return;}sound(390+chars.length*70);renderForge();updateUI();});
 const w=recipe();
 $('#recipe-preview').innerHTML=w?`<div class="recipe-title"><button id="recipe-details" class="recipe-details" aria-label="查看${w.word}效果">${w.word} <small>ⓘ</small></button><span class="recipe-tag">${w.icon} · ${GRADES[w.tier]} · ${w.tier} 级</span></div><div class="recipe-meaning-tags" aria-label="已组词语的类型与词义"><span class="recipe-kind-chip">${wordTypeLabel(w)}</span><span class="recipe-attack-chip" title="${traitEffect(w)}">${attackName(w)}</span>${w.idiomMove&&w.special!==w.idiomMove?`<span class="recipe-meaning-chip" title="${IDIOM_MOVES[w.idiomMove].desc}">绝技 · ${IDIOM_MOVES[w.idiomMove].name}</span>`:''}${w.runes.map(id=>`<span class="recipe-meaning-chip" data-preview-rune="${id}" title="${WORD_RUNES[id].desc}">${WORD_RUNES[id].name}</span>`).join('')}</div><p>${w.name} · ${w.tag}</p><div class="recipe-stats"><span>${w.damage?'伤害 '+w.damage:w.type==='income'?'每轮 +'+w.income+' 墨点':'增伤 '+Math.round(w.aura*100)+'%'}</span><span>范围 ${w.range}</span></div>`:`<div class="invalid-recipe">${chars.length?'词序不符或尚未入词谱':'选 1—4 字，落字成阵'}</div><p>单字起阵，二字成词，三字成势，四字成典。</p>`;
 if(w)$('#recipe-details').onclick=()=>wordDetails(w);
 $('#forge').innerHTML=placing?'取消放置 <span>字牌尚未消耗 ↩</span>':`凝字成塔 <span>${w?w.cost+' 墨点 ↗':'请选择字牌'}</span>`;
 $('#forge').onclick=()=>{if(placing){placing=null;renderForge();updateUI();return;}if(!w||!game.canBuild(w.word,chars))return;placing={word:w.word,ids:[...chars]};selected=null;toast('点击空阵位；成功落塔后才消耗字牌');sound(600);renderForge();updateUI();};
 $('#clear-chars').onclick=()=>{chars=[];placing=null;renderForge();updateUI();};
 $('#hint-letters').innerHTML=!game.availableWords().length?'无可组词<span>不扣墨点</span>':game.hintCost()?`提示<span>${game.hintCost()} 墨点</span>`:'查看提示<span>已解锁 · 免费</span>';
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
function bossBrief(plan){if(!plan.boss)return'';return `<div class="grade-effect-card boss-brief"><b>${plan.bossKind?'BOSS · '+ENEMIES[plan.bossKind].name:'随机 Boss 候选'}</b><p>${plan.bossKind?ENEMIES[plan.bossKind].desc:'本波将在 '+COMMON_BOSSES.length+' 种通用 Boss 与本章 '+MAP_BOSS_POOLS[game.chapter].length+' 种专属 Boss 之间随机抽取。本章专属：'+MAP_BOSS_POOLS[game.chapter].map(k=>ENEMIES[k].name).join('、')+'。候选：'+plan.bossPool.map(k=>ENEMIES[k].name).join('、')+'。'}</p>${plan.bossKind?`<p class="boss-skill-description"><strong>主动技能 · ${bossSkillName(plan.bossKind)}</strong><br>${bossSkillText(plan.bossKind)}<br>${bossAuraText(plan.bossKind)}<br>${bossPowerText(plan.bossKind)}</p>`:''}<small>全游戏共 ${COMMON_BOSSES.length+MAP_BOSSES.length} 种 Boss：${COMMON_BOSSES.length} 种通用，每图 ${MAP_BOSS_POOLS[game.chapter].length} 种专属。避免连续重复，已抽取的结果随战局保存，刷新不会换 Boss。</small></div>`;}
const enemyPortraits=new Map();
function enemyPortrait(kind){
 if(enemyPortraits.has(kind))return enemyPortraits.get(kind);
 const canvas=document.createElement('canvas');canvas.width=192;canvas.height=160;
 const battleContext=ctx,data=ENEMIES[kind];
 // Draw the same sprite into a separate target synchronously; restore even on failure.
 try{
  ctx=canvas.getContext('2d');ctx.translate(96,88);
  ctx.fillStyle='#5264481a';ctx.beginPath();ctx.ellipse(0,52,data.boss?56:33,9,0,0,Math.PI*2);ctx.fill();
  const enemy={kind,id:0,map:game.chapter,route:0,d:0,hp:data.hp,maxHp:data.hp,shield:data.shield||0,shellHits:0,enraged:false,astralMode:data.initialPhase??0,bornAt:0};
  if(data.boss)drawBoss(enemy,0,false);else{ctx.scale(2,2);minionBody(enemy,0);}
 }finally{ctx=battleContext;}
 const source=canvas.toDataURL('image/png');enemyPortraits.set(kind,source);return source;
}
function enemyGuide(){
 const specialty=THEME_UNITS[game.chapter],next=game.phase==='battle'?game.plan(game.wave):game.wavePreview(),previewWave=game.phase==='battle'?game.wave:game.wave+1;
 openModal(`<div class="modal-eyebrow">ENEMY FIELD GUIDE</div><h2 class="modal-title">墨影各异，借势应对。</h2><p class="modal-intro">共 ${Object.values(ENEMIES).filter(e=>!e.boss).length} 种小怪与 ${COMMON_BOSSES.length+MAP_BOSSES.length} 种 Boss。所有怪物进入射程都能蓄力攻塔，不设两人上限；优先分散攻击可触及的词塔，负载相同时优先守备塔，每只怪物独立按完整攻塔伤害结算，围攻人数越多总伤害越高。不同元素与兵种使用自己的攻塔招式，图鉴下方列出射程、间隔及命中效果。小兵第 7 轮起攻塔成长加快，后期基础伤害最高提升至此前两倍；Boss 带 4 名护卫推进，护卫会在前方等待首领，行进至中段和后段、护卫损失后，最多补援 2 次、每次 2 名。护卫生命和攻塔伤害更高。补援部队专司攻塔，不额外扣山门生命，Boss 倒下或离场后退散；随波出场的普通护卫仍会突破山门。本章：${getMap(game.chapter).name}，${mapModeLabel()}。每轮 3 波，每隔 ${WAVE_INTERVAL} 个游戏秒开始下一波。主线第 3 轮首次出现 Boss，第 5、7 轮再次出现，第 8 轮起每轮都有 Boss（均在本轮末波），章节收尾保证有 Boss；无尽模式从第一轮起，每一波都有 Boss。${game.phase==='battle'?'当前波':'下一波'}第 ${next.round} 轮 ${next.part}/3 波 · ${next.title}，预计 ${next.count} 只。本波小怪生命约为图鉴基础值的 ${enemyHealthScale(game.chapter,previewWave,'normal').toFixed(2)} 倍${next.boss?'，Boss 约 '+enemyHealthScale(game.chapter,previewWave,'boss').toFixed(2)+' 倍':''}。第 4 轮起小怪解锁冲刺、突进和领飞，第 6 轮起解锁列盾、护援、扰墨等进阶能力，生命和数量成长加快；Boss 从波次前中段进场，后续小怪形成护卫；具备护军光环与范围攻塔大招，首次支援技能通常在出场 3 秒后触发，半血可提前，半血后施法加快。应对：${next.counter}。</p><div class="grade-effect-card theme-unit-brief"><b>${CHAPTERS[game.chapter].area} · 三种特色兵</b>${MAP_MINION_POOLS[game.chapter].map(k=>`<p><span class="enemy-seal" style="--enemy-color:${ENEMIES[k].color}">${ENEMIES[k].icon}</span><strong>${ENEMIES[k].name}</strong>：${ENEMIES[k].desc}</p>`).join('')}<small>第 2 轮起出现原有特色兵；第 4 轮起三种轮换。${specialty.counter}。</small></div>${bossBrief(next)}<div class="codex-filters enemy-filters" aria-label="怪物分类"><button data-enemy-filter="all" class="active">全部</button><button data-enemy-filter="minion">小怪</button><button data-enemy-filter="chapter">本章专属</button><button data-enemy-filter="boss">Boss</button></div><p class="codex-note" id="enemy-count">共 ${Object.keys(ENEMIES).length} 种，形象与战场一致。</p><div class="codex-grid">${Object.entries(ENEMIES).map(([kind,e])=>`<article class="codex-card enemy-card" data-enemy-kind="${kind}" data-enemy-boss="${!!e.boss}" data-enemy-chapter="${e.boss?bossChapter(kind):minionChapter(kind)}"><img class="enemy-portrait" src="${enemyPortrait(kind)}" alt="${e.name}的战场形象" width="192" height="160" loading="lazy" decoding="async"><h3>${e.icon||e.sigil?`<span class="enemy-seal" style="--enemy-color:${e.color||BOSS_COLORS[kind]||'#927455'}">${e.icon||e.sigil}</span>`:''}${e.name}<small>${e.role?e.role+' · ':''}${e.boss?(COMMON_BOSSES.includes(kind)?'通用 BOSS · ':CHAPTERS[bossChapter(kind)].area+'专属 BOSS · '):minionChapter(kind)>=0?CHAPTERS[minionChapter(kind)].area+'特色 · ':''}${isAir({kind})?'飞行':'地面'} · 基础生命 ${e.hp}</small></h3><p>${e.desc}</p><p class="enemy-siege-description">${siegeDescription(kind)}</p>${e.boss?`<p class="boss-skill-description"><strong>主动技能 · ${bossSkillName(kind)}</strong><br>${bossSkillText(kind)}<br>${bossAuraText(kind)}<br>${bossPowerText(kind)}</p>`:''}</article>`).join('')}</div>`,()=>{
  $$('[data-enemy-filter]').forEach(button=>button.onclick=()=>{const filter=button.dataset.enemyFilter;let count=0;$$('[data-enemy-filter]').forEach(b=>b.classList.toggle('active',b===button));$$('[data-enemy-kind]').forEach(card=>{const show=filter==='all'||filter==='minion'&&card.dataset.enemyBoss==='false'||filter==='boss'&&card.dataset.enemyBoss==='true'||filter==='chapter'&&+card.dataset.enemyChapter===game.chapter;card.hidden=!show;if(show)count++;});$('#enemy-count').textContent='共 '+count+' 种，形象与战场一致。';});
 });
}
function wordDetails(w){const defense=towerDefense({word:w.word,level:w.tier});openModal(`<div class="modal-eyebrow">WORD EFFECT · ${GRADES[w.tier]}</div><h2 class="modal-title">${w.word}<small class="effect-tag">${w.tag}</small></h2>${identity(w)}<span class="vocabulary-badge">${wordTypeLabel(w)}</span>${learningCard(w)}${w.special?'':`<p class="modal-intro">${w.desc}</p>`}<div class="grade-effect-card tower-defense-card"><b>守备 · 耐久 ${defense.maxHp} · 护甲 ${Math.round(defense.armor*100)}%</b><p>${defense.role}</p><small>等级和词义影响耐久。损毁保留词语和等级，可付费重建。</small></div><div class="grade-effect-card word-trait-card"><b>${idiomOnly(w)?'词义绝技':w.special?'战斗演绎':'攻击形态'} · ${attackName(w)}</b><p>${traitEffect(w)}</p></div>${idiomCard(w,true)}<div class="grade-effect-card meaning-effect-card"><b>${runeSummary(w)}</b><p class="meaning-names">${w.runes.map(id=>WORD_RUNES[id].name).join('＋')||'无附加特性'}</p><p>${runeEffect(w)}</p>${w.runes.length?'<small>同类状态取最强值。</small>':''}</div><div class="grade-effect-card word-grade-card"><b>${GRADES[w.tier]}专属特性</b><p>${gradeEffect(w)}</p><small>字数决定品质与附加特性上限：凡字 0 个，灵词／妙语最多 1 个，天成最多 2 个。升级提高数值，品质和附加特性保持。</small></div><div class="word-effect-stats"><div><small>建造消耗</small><b>${w.cost} 墨点</b></div><div><small>初始等级 / 上限</small><b>${w.tier} / ${w.maxLevel} 级</b></div><div><small>${primaryLabel(w)}</small><b>${primaryValue(w)}</b></div><div><small>范围 / 攻击间隔</small><b>${w.range} / ${w.damage?w.rate+'s':'—'}</b></div></div><p class="modal-intro">成功落塔才消耗 ${w.tier} 张字牌和墨点。建成后可再升级两次。地图外观中，环纹表示品阶，角纹表示升级，侧边符印表示附加特性。点击地图上的词塔，即可显示范围，并在下方查看详情与升级。</p><button class="primary" id="effect-done">返回组词</button>`,()=>$('#effect-done').onclick=closeModal);}
function updateUI(){$('#canvas-wrap').dataset.theme=getMap(game.chapter).theme;updateHome();const activeBosses=game.enemies.filter(e=>e.hp>0&&ENEMIES[e.kind].boss);c.setAttribute('aria-label',activeBosses.length?'塔防战场，Boss ×'+activeBosses.length+'：'+activeBosses.map(e=>ENEMIES[e.kind].name+'，生命 '+Math.ceil(e.hp)+' / '+Math.ceil(e.maxHp)+(e.enraged?'，二阶段':'')+(e.bossStrikeAt>game.time?'，'+bossPower(e.kind).name+'蓄力':'')+'，'+bossAura(e.kind).name+(bossWindup(e)?'，'+bossSkillName(e.kind)+'蓄势':'')).join('；'):'塔防战场，点击阵位组词布阵');$('.sound-off').classList.toggle('hidden',audioOn);$('#sound').setAttribute('aria-label',audioOn?'关闭音效':'开启音效');battleNotice.dataset.boss=String(activeBosses.length>0);if(!battleNotice.classList.contains('active'))battleNotice.textContent=activeBosses.length?'Boss ×'+activeBosses.length+' · '+ENEMIES[activeBosses[0].kind].name+' · '+(activeBosses[0].bossStrikeAt>game.time?bossPower(activeBosses[0].kind).name+'蓄力':activeBosses[0].enraged?'狂暴 · '+bossAura(activeBosses[0].kind).name:bossAura(activeBosses[0].kind).name)+(paused?' · 已暂停':''):paused?'时间已暂停，可组词布阵':mapModeLabel()+' · 单击词塔查看属性与升级';document.body.classList.toggle('placing',!!placing);document.body.classList.toggle('range-preview',selected!==null&&!detailOpen);const ch=CHAPTERS[game.chapter],info=game.roundInfo(),terminal=['won','lost'].includes(game.phase);$('#chapter-name').textContent=ch.name;$('.chapter-mark').textContent=CHAPTER_MARKS[game.chapter];$('#area-name').textContent=ch.area;$('#chapter-intro').textContent=ch.intro;$('#wave-total').textContent=game.endless?'∞':game.campaignRounds;$('.map-label span').textContent=ch.area;$('.map-label small').textContent=getMap(game.chapter).name+" · "+mapModeLabel();$('#hp').textContent=game.hp;$('#hp').title='山门生命'+(game.barrierRemaining()?' · 本轮屏障 '+game.barrierRemaining():'')+(game.activeTowers.some(t=>hasRune(getWord(t.word),'revive'))?' · 重生'+(game.reviveUsed?'已用':'可用'):'');$('#max-hp').textContent='/ '+ch.hp;$('#ink').textContent=Math.floor(game.ink);$('#phase-label').textContent=terminal?(game.phase==='won'?'山河无恙':'山门失守'):paused?'暂歇片刻':game.phase==='intermission'?`整备 ${Math.ceil(Math.max(0,game.autoWaveAt-game.time))}s`:game.phase==='battle'?'守关进行中':'布阵时刻';$('#wave-label').textContent=`${game.endless?'无尽 · ':''}第 ${info.round} 轮 · ${info.part}/3 波`;const done=game.phase==='prepare'||game.phase==='won'?game.wave:Math.max(0,game.wave-1);$('#progress-label').textContent=game.endless?`无尽 · ${info.round} 轮`:`${Math.floor(done/3)} / ${game.campaignRounds}`;$('#wave-dots').innerHTML=Array.from({length:game.campaignRounds},(_,i)=>`<i class="${i<Math.floor(done/3)?'done':''}"></i>`).join('');$('#wave-title').textContent=terminal?(game.phase==='won'?'此卷已守 · 山河无恙':'山门失守 · 来日再战'):game.phase==='battle'?`第 ${game.wave} 波 · ${game.plan(game.wave).title}`:`第 ${game.wave+1} 波 · ${game.wavePreview().title}`;$('#wave-description').textContent=game.phase==='battle'?`场上 ${game.enemies.length} 只 · 待出现 ${game.queue.length} 只${game.autoWaveAt>0?' · 下波 '+Math.ceil(Math.max(0,game.autoWaveAt-game.time))+'s':' · 清空敌人结束本轮'}`:(game.wave===0?'准备好你的第一座词塔':terminal?'每一次落字，皆是修行':'本轮已清，补强防线后再出发');$('#start').innerHTML=terminal?'查看战报 ↗':['battle','intermission'].includes(game.phase)?(paused?'继续守关 ▷':game.autoWaveAt>0?`下波 ${Math.ceil(Math.max(0,game.autoWaveAt-game.time))}s · Ⅱ`:'暂歇片刻 Ⅱ'):'迎战墨影 <span>→</span>';$('#pause-overlay').classList.toggle('hidden',!paused||terminal);$('#map-message').textContent=placing?'落字成阵 · 点击圆形空阵位建塔':selected?'在词塔详情中升级，或拆除词塔':terminal?(game.phase==='won'?'山河无恙 · 此卷已守':'山门失守 · 再试一阵'):game.phase==='battle'?'战斗中也可建塔、升级，随时调整防线':game.towers.length?'布阵就绪，点击「迎战墨影」开始下一波':'点击「凝字成塔」，开始布阵';$('#speed').textContent=speed+'×';const cooldown=Math.ceil(Math.max(0,game.skillReady-game.time));$('#skill').disabled=game.phase!=='battle'||cooldown>0||game.ink<game.skillCost()||paused;$('#skill').innerHTML=`✦ <span>${cooldown?cooldown+'s':'落墨'}</span><small>${game.skillCost()}</small>`;$('#skill').title=`落墨：${game.skillCost()}墨点 · 全场100伤害 · 冷却${SKILL_COOLDOWN}秒，每次费用加15`;$('#skill').setAttribute('aria-label',cooldown?`落墨冷却中，还需${cooldown}秒，下次${game.skillCost()}墨点`:`落墨技能：花费${game.skillCost()}墨点，全场100伤害，冷却${SKILL_COOLDOWN}秒`);[...mapTargets.children].forEach((b,i)=>{const t=game.towers.find(t=>t.pad===i);b.setAttribute('aria-pressed',String(!!t&&t.id===selected));b.setAttribute('aria-label',!game.padUnlocked(i)?`未解锁阵位${i+1}，花费${game.unlockCost()}墨点解锁`:t?`阵位${i+1}：${t.word}，${t.level}级，${towerActive(t)?"耐久 "+Math.ceil(t.hp??towerDefense(t).maxHp)+" / "+towerDefense(t).maxHp:"损毁待重建"}，点击查看或升级`:`空阵位${i+1}，点击放置词塔`);});if($('#upgrade')){const t=game.towers.find(t=>t.id===selected);$('#upgrade').disabled=!t||t.level>=getWord(t.word).maxLevel||game.ink<game.upgradeCost(t)||terminal;}$('#enemy-preview').textContent=(game.phase==='battle'?game.plan(game.wave):game.wavePreview()).title+' ↗';$('#enemy-preview').title=$('#enemy-preview').textContent+' · 本章特色：'+MAP_MINION_POOLS[game.chapter].map(k=>ENEMIES[k].name).join('、');$('#enemy-preview').setAttribute('aria-label',$('#enemy-preview').textContent+'，查看怪物图鉴');updateForgeButtons();updateTowerDefense();}
function reset(ch=game.chapter){game=new Game(ch);({routes,pads:PADS,color:mapColor}=getMap(ch));PATH=routes[0];resize();paused=false;placing=null;selected=null;detailOpen=false;chars=[];speed=1;renderForge();updateUI();save();}
function openModal(html,setup){$('#modal-content').innerHTML=html;if(!$('#modal').open)$('#modal').showModal();setup?.();}
function closeModal(){$('#modal').close();$$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.nav==='campaign'));}
$('#close-modal').onclick=closeModal;$('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){const r=$('#modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal();}});$('#modal').addEventListener('close',()=>{$$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.nav==='campaign'))});
function codex(){
 openModal(`<div class="modal-eyebrow">THE WORD CODEX · ${WORDS.length.toLocaleString()} RECIPES</div><h2 class="modal-title">一字成兵，四字成典。</h2><p class="modal-intro">普通字词使用「普」属性；四字成语按词义使用学、火、冰等属性。带词义绝技的词塔攻击可蓄力，蓄满 4 次且冷却结束后自动释放；升级提升数值，蓄力与冷却可在词塔详情查看。火、弓等属性决定主要攻击机制；攻击形态（远射、弥散等）修饰攻击方式；附加特性提供额外效果。三者与字数品阶叠加。词典可查词语释义与游戏效果；成语与技能词分开标识。付费提示才会选入当前字牌。</p><input id="codex-search" class="codex-search" aria-label="搜索词语或流派" placeholder="搜索词语、流派或效果，如冰霜箭、毒云"><div class="codex-filters" aria-label="按字数筛选"><button data-length="0" class="active">全部</button>${[1,2,3,4].map(n=>`<button data-length="${n}">${n}字</button>`).join('')}</div><label class="codex-trait-label">词语类型 <select id="codex-kind" aria-label="按词语类型筛选"><option value="">全部词语</option><option value="idiom">成语</option><option value="skill">游戏技能词</option><option value="learning">有简明释义</option><option value="culture">传统文化</option></select></label><label class="codex-trait-label">属性 <select id="codex-attribute" aria-label="按属性筛选"><option value="">全部属性</option>${[...new Map(WORDS.map(w=>[w.type,w])).values()].map(w=>`<option value="${w.type}">${w.icon} · ${w.name}</option>`).join('')}</select></label><label class="codex-trait-label">学习招式 <select id="codex-special" aria-label="按学习招式筛选"><option value="">全部招式</option>${Object.entries(SPECIAL_EFFECTS).map(([id,f])=>`<option value="${id}">${f.name}</option>`).join('')}</select></label><label class="codex-trait-label">攻击形态 <select id="codex-trait" aria-label="按攻击形态筛选"><option value="">全部形态</option>${Object.entries(WORD_TRAITS).map(([id,t])=>`<option value="${id}">${t.name}</option>`).join("")}</select></label><label class="codex-trait-label">附加特性 <select id="codex-rune" aria-label="按附加特性筛选"><option value="">全部特性</option>${Object.entries(WORD_RUNES).map(([id,t])=>`<option value="${id}">${t.name}</option>`).join("")}</select></label><details class="learning-index"><summary>${WORDS.filter(w=>w.special).length.toLocaleString()} 个学属性词 · ${Object.keys(SPECIAL_EFFECTS).length} 类战斗演绎</summary><p>成语、文化词与日常词都可归为学；近义词共享招式，完整词义优先于单字联想。学属性的招式替代通用攻击形态，不额外叠加普属性余波；附加词义仍按品质限制。</p><div class="meaning-index-list">${Object.entries(SPECIAL_EFFECTS).map(([id,f])=>`<button data-special-index="${id}"><b>${f.name}</b><span>${f.desc}</span></button>`).join('')}</div></details><details class="meaning-index"><summary>${Object.keys(WORD_TRAITS).length} 种攻击形态 · ${Object.keys(WORD_RUNES).length} 种附加特性，点击查看说明</summary><p>附加特性按品质限制：1 字凡字没有，2 字灵词和 3 字妙语最多 1 个，4 字天成最多 2 个；升级不改变品质。相近词共享含义，同词效果固定；未细分词保留基础效果。</p><div class="meaning-index-list">${Object.entries(WORD_RUNES).map(([id,t])=>`<button data-rune-index="${id}"><b>${t.name}</b><span>${t.desc}</span></button>`).join("")}</div></details><p id="codex-count" class="modal-intro"></p><div class="codex-grid" id="codex-list"></div><div class="codex-pagination"><button id="codex-prev">上一页</button><span id="codex-page"></span><button id="codex-next">下一页</button></div>`,()=>{
 let length=0,page=0,trait='',rune='',kind='',attribute='',special='';const size=40;
 const draw=()=>{const q=$('#codex-search').value.trim();const list=WORDS.filter(w=>(!length||w.tier===length)&&(!kind||(kind==='learning'?!!wordLearning(w.word):kind==='skill'?isGameSkill(w.word):kind==='culture'?isCultureWord(w.word):wordCategory(w.word)===kind))&&(!attribute||w.type===attribute)&&(!special||w.special===special)&&(!trait||!w.special&&w.trait===trait)&&(!rune||hasRune(w,rune))&&(!q||[w.word,w.name,w.tag,attackName(w),IDIOM_MOVES[w.idiomMove]?.name||'',...w.runes.map(id=>WORD_RUNES[id].name)].some(x=>x.includes(q))));const pages=Math.max(1,Math.ceil(list.length/size));page=Math.min(page,pages-1);$('#codex-count').textContent=`共 ${list.length.toLocaleString()} 个词语，每页 ${size} 个`;$('#codex-page').textContent=`${page+1} / ${pages}`;$('#codex-prev').disabled=page===0;$('#codex-next').disabled=page===pages-1;$('#codex-list').innerHTML=list.length?list.slice(page*size,(page+1)*size).map(w=>`<article class="codex-card"><h3 style="color:${w.color}">${w.word}<small>${wordTypeLabel(w)} · ${w.icon} ${w.name} · ${GRADES[w.tier]} · ${w.cost} 墨点</small></h3>${wordLearning(w.word)?`<p class="codex-definition">${wordLearning(w.word).meaning}</p>`:''}<p>${attackName(w)} · ${traitEffect(w)}</p>${w.idiomMove&&w.special!==w.idiomMove?`<p class="codex-definition">绝技 · ${IDIOM_MOVES[w.idiomMove].name}：${IDIOM_MOVES[w.idiomMove].desc}</p>`:''}<p class="codex-meanings">${runeSummary(w)} · ${w.runes.map(id=>WORD_RUNES[id].name).join(" · ")||"无附加特性"}</p><div class="recipe-stats"><span>${w.damage?'伤害 '+w.damage:w.type==='income'?'每轮 +'+w.income:'增伤 '+Math.round(w.aura*100)+'%'}</span><span>范围 ${w.range}</span></div><button class="codex-pick" data-word-effect="${w.word}">查看词塔效果 ↗</button></article>`).join(''):'<p class="modal-intro">词库中暂未找到，试试其他词语。</p>';$$('[data-word-effect]').forEach(b=>b.onclick=()=>wordDetails(getWord(b.dataset.wordEffect)));};
 $('#codex-attribute').onchange=()=>{attribute=$('#codex-attribute').value;page=0;draw();};$('#codex-special').onchange=()=>{special=$('#codex-special').value;page=0;draw();};$('#codex-kind').onchange=()=>{kind=$('#codex-kind').value;page=0;draw();};$('#codex-rune').onchange=()=>{rune=$('#codex-rune').value;page=0;draw();};$$('[data-special-index]').forEach(b=>b.onclick=()=>{special=b.dataset.specialIndex;$('#codex-special').value=special;page=0;draw();$('.learning-index').open=false;});$$('[data-rune-index]').forEach(b=>b.onclick=()=>{rune=b.dataset.runeIndex;$('#codex-rune').value=rune;page=0;draw();$('.meaning-index').open=false;});$('#codex-trait').onchange=()=>{trait=$('#codex-trait').value;page=0;draw();};$('#codex-search').oninput=()=>{page=0;draw();};$$('[data-length]').forEach(b=>b.onclick=()=>{length=+b.dataset.length;page=0;$$('[data-length]').forEach(x=>x.classList.toggle('active',x===b));draw();});$('#codex-prev').onclick=()=>{page--;draw();$('#modal').scrollTop=0;};$('#codex-next').onclick=()=>{page++;draw();$('#modal').scrollTop=0;};draw();
 });
}
function guide(){openModal(`<div class="modal-eyebrow">A LITTLE FIELD GUIDE</div><h2 class="modal-title">随机落字，借词守关。</h2><p class="modal-intro">每批 16 张随机字牌，保证能组成攻击词，也藏着三字词与四字词；常见成语会经常出现在手牌中。词典可按成语、游戏技能词、传统文化筛选，点击词语可阅读简明释义。「普」保留稳定基础攻击；「学」涵盖成语、日常词与文化词，释义解释本义，战斗演绎展示游戏能力。</p><div class="guide-step"><span>01</span><div><h3>选 1—4 张字牌</h3><p>必须按正确词序依次点击字牌，重复字需要不同的字牌。单字 1 级、二字 2 级、三字 3 级、四字 4 级；长词伤害与效率更高。点击字牌或上方字位可撤回，需要查阅时可手动打开词典。</p></div></div><div class="guide-step"><span>02</span><div><h3>成功落塔才消耗</h3><p>点「凝字成塔」，再点地图空阵位，支付墨点并消耗对应字牌。取消或点到已占阵位不会消耗字牌。拆塔只返还 70% 投入墨点，不返还字牌；每塔可再升级两次，按原词 1—4 字，每次升级的基础耐久增量为 150/200/250/300，再受属性和词义影响。</p></div></div><div class="guide-step"><span>03</span><div><h3>墨点换新字，留钱布阵</h3><p>换一批字会丢弃当前整批字牌并发出 16 张新牌。每次固定 ${REFRESH_COST} 墨点。刷新网页会恢复原牌和价格，不会重新抽字。提示首次 ${HINT_COST} 墨点，每次成功购买后下次增加 ${HINT_COST}，跨轮次和无尽模式保留；重开或切换章节重置。没有可组词不扣费、不涨价。提示优先给出当前字牌能组成的最长词；已解锁提示重复查看免费，换一批字后重新计费。主线前 3 轮普通怪掉落完整，第 4/5/6 轮起分别为基础的 95%/90%/90%；Boss 掉落、财塔产墨和额外赏金保持完整。主线清波奖与轮末奖在第 6 轮后不再上涨，布阵时需要取舍升级、解锁和换词。怪物会沿途蓄力攻塔，仍沿原路线前进；所有怪物进入射程都能出手，没有两人占位限制；优先分散攻击可触及的词塔，负载相同时优先守备塔。每只怪物均按完整攻击力独立结算，围攻伤害直接叠加；塔的护甲、保护光环及单次伤害上限继续生效。小兵攻塔伤害逐轮增强，中后期生命、数量和推进速度成长加快，前三轮有伤害缓冲；近距优先攻击石系和守阵塔，远程、飞行与偷袭各有目标习惯。词塔损毁后暂停攻击和辅助，保留词语、等级及阵位，可在详情花费墨点重建。存活塔每轮结束免费修复 30% 最大耐久，光系或回春邻塔再加 10%。重建首次消耗投入的 50%，同塔后续每次增加 15 个百分点，上限 100%，跨轮保留。日常修复按投入的 25% × 损伤比例计费，最低 5 墨点，仍享有金塔和词义优惠，不随次数涨价。手动修复/重建冷却 8 秒，暂停也可操作；维修费不计入拆塔返还，废墟仅返还 35% 投入。</p></div></div><div class="guide-step"><span>04</span><div><h3>多派相辅，借势守关</h3><p>烈焰清群、寒霜减速、雷霆连锁、疾风补刀、山石破甲、辉光增伤、毒瘴持续伤害、神射与远射形态优先点杀射程内的 Boss，神射可远程斩杀、点金攻击与赏金、圣光照明与光环、剑气穿透、潮汐震荡、咒印易伤、幻影追击。金塔与光塔都会主动攻击，辅助效果同类取最强。落墨首次 30 墨点，此后每次多 15；造成全场 100 伤害，冷却 ${SKILL_COOLDOWN} 秒。重开或切换关卡重置费用，无尽模式保留累计。</p></div></div><p class="modal-intro">每轮 3 波，按 ${WAVE_INTERVAL} 个游戏秒固定间隔出场，未清完的敌人会与后续波次同时进攻；轮末存活词塔会自动修复耐久；山门爱心不随轮次回复，漏怪造成的爱心损失会保留。主线第 3、5、7 轮有 Boss，第 8 轮起每轮都有 Boss，均在本轮末波出现；章节收尾保证有 Boss；无尽模式从第一轮起，每一波都有 Boss。点击开始界面进入战场；手机竖屏地图与字库上下同屏，短横屏自动并排。暂停时仍可组词、建塔、解锁、升级和刷新；敌人、攻击与波次倒计时保持停止，点击继续后恢复。切到后台自动暂停，字牌、刷新价格和战局一起保存。旧版战局会自动迁移，已有星级保留。</p><button class="primary" id="guide-done">落笔，启程 →</button>`,()=>$('#guide-done').onclick=closeModal);}
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
function settings(){openModal(`<div class="modal-eyebrow">A QUIETER MOMENT</div><h2 class="modal-title">案头小设</h2><div class="setting-row"><div>游戏音效<p>攻击、落字与升级音效；密集攻击自动限频。</p></div><button id="sound-setting">${audioOn?'已开启':'已关闭'}</button></div><div class="setting-row"><div>重开当前篇章<p>重置当前布阵，保留已获得的通关星级。</p></div><button id="restart-setting">重新开始</button></div><div class="setting-row"><div>本地存档<p>战局与星级仅保存在此浏览器，无需注册。</p></div><button id="erase-setting" class="danger">清除全部进度</button></div><p class="modal-intro">字阵 v3.3 · 随机字牌 / ${WORDS.length.toLocaleString()} 种词语 / 十五属性 · 普 / 学与元素兵器<br>快捷键：空格迎战或暂停，Esc 取消选中。切换到其他页面会自动暂停。</p>`,()=>{$('#sound-setting').onclick=()=>{toggleSound();$('#sound-setting').textContent=audioOn?'已开启':'已关闭'};$('#restart-setting').onclick=()=>confirmReset(false);$('#erase-setting').onclick=()=>confirmReset(true);});}
function confirmReset(all){openModal(`<div class="modal-eyebrow">START AFRESH</div><h2 class="modal-title">${all?'清除全部进度？':'重新开始此卷？'}</h2><p class="modal-intro">${all?'当前战局与所有篇章星级将被清除。此操作无法撤销。':'当前阵容和波次将重置，已有通关星级会保留。'}</p><div class="result-actions"><button class="secondary" id="cancel-reset">保留进度</button><button class="primary" id="do-reset">确认${all?'清除':'重开'}</button></div>`,()=>{$('#cancel-reset').onclick=settings;$('#do-reset').onclick=()=>{if(all)records=Array(CHAPTERS.length).fill(0);reset(all?0:game.chapter);closeModal();toast(all?'已清除进度，山河重启':'新的一卷，落笔启程')};});}
function toggleSound(){audioOn=!audioOn;try{localStorage.setItem('wordward-audio-v1',audioOn?'on':'off');}catch{}$('.sound-off').classList.toggle('hidden',audioOn);$('#sound').setAttribute('aria-label',audioOn?'关闭音效':'开启音效');$('#sound').title=audioOn?'关闭音效':'开启音效';sound(520,.16);}
$('#sound').onclick=toggleSound;$('#settings').onclick=settings;$('#mobile-settings').onclick=settings;$('#guide-link').onclick=guide;$('#chapters').onclick=chapters;$$('[data-nav]').forEach(b=>b.onclick=()=>{if(b.dataset.nav==='codex')codex();else if(b.dataset.nav==='guide')guide();else{closeModal();return;}$$('.nav-item').forEach(x=>x.classList.toggle('active',x===b));});
function start(){if(mobileLayout.matches&&!document.body.classList.contains('playing'))enterGame();if(['won','lost'].includes(game.phase))return result();if(game.phase==='prepare'){if(!game.activeTowers.some(t=>getWord(t.word).damage>0)){toast('先建造或重建至少一座攻击词塔，再迎战墨影');return;}game.startWave();paused=false;sound(320,.2);save();}else{paused=!paused;save();}updateUI();}
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
Object.assign(ATTACK_TONES,{orbit:[520,'sine',.12],penetrate:[360,'triangle',.09],cross:[610,'triangle',.08],rally:[880,'sine',.13],triage:[1040,'sine',.14],watch:[760,'sine',.07],counter:[160,'triangle',.1],hunt:[430,'triangle',.07],beast:[110,'triangle',.15],nectar:[1150,'sine',.12],thrift:[1260,'sine',.07],rhythm:[660,'sine',.12],resonate:[330,'sine',.14],geometry:[820,'triangle',.08],weave:[580,'sine',.09],pillar:[90,'triangle',.15],shelter:[940,'sine',.12],dawn:[1350,'sine',.1],guide:[710,'triangle',.07],relay:[560,'triangle',.06],puzzle:[450,'sine',.12],mechanism:[890,'triangle',.055],reversal:[740,'sine',.14],festival:[990,'sine',.12]});
function attackAudio(type,now){if(!audioOn||!audioCtx||audioCtx.state!=='running'||now-lastAttackSound<85)return;lastAttackSound=now;const [freq,wave,duration]=ATTACK_TONES[type]||ATTACK_TONES.basic;try{const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type=wave;osc.frequency.setValueAtTime(freq,audioCtx.currentTime);osc.frequency.exponentialRampToValueAtTime(Math.max(40,freq*.55),audioCtx.currentTime+duration);gain.gain.setValueAtTime(.018,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);osc.connect(gain);gain.connect(audioCtx.destination);osc.start();osc.stop(audioCtx.currentTime+duration);}catch{}}
let lastEnemySound=0,lastBossSound=0;
const ENEMY_TONES={claw:150,rush:360,quake:65,dive:640,shadow:290,ink:220,flame:110,frost:980,acid:170,thunder:85,tide:140,vine:250,prism:1150,seal:410,star:760,cannon:55};
function enemyAttackAudio(f,now){
 if(!audioOn||!audioCtx||audioCtx.state!=='running'||now-(f.boss?lastBossSound:lastEnemySound)<(f.boss?200:180))return;
 if(f.boss)lastBossSound=now;else lastEnemySound=now;
 try{const duration=f.boss?.24:.12,freq=ENEMY_TONES[f.visual]||150;
  for(let i=0;i<(f.boss?2:1);i++){const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=['prism','frost','star','tide'].includes(f.visual)?'sine':'triangle';o.frequency.setValueAtTime(freq*(i?1.5:1),audioCtx.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(35,freq*.4),audioCtx.currentTime+duration);g.gain.setValueAtTime(f.boss?.026:.021,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+duration);}
 }catch{}
}
// Local vector ornaments share the same meanings as the combat engine.
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const RUNE_COLORS={ember:'#c3673e',frost:'#67aebe',storm:'#a79335',toxin:'#7d934c',venom:'#728d3f',thorn:'#668750',shine:'#c0a050',curse:'#976488',edge:'#688a9a',tide:'#568da9',valor:'#ba7951',execute:'#a36362',focus:'#82739d',study:'#7b8f77',tempo:'#71986b',mend:'#6e9b6b',prosper:'#b08d45',barrier:'#689b99',inspire:'#b17e49',sky:'#719dac',slayer:'#9a809f',echo:'#977da9',brood:'#8b9370',luck:'#bfa151',peace:'#7e9d8b',bloom:'#b58295',soul:'#887897',seal:'#907593',rescue:'#ac8168',gravity:'#908174',count:'#998352',measure:'#6c91a0',bleed:'#b26a63',silence:'#88719b',revive:'#b9905d',flank:'#6a9590',backstab:'#886f86',front:'#a57f54',growth:'#7d9c61'};
function runeGlyph(id,x,y,size){
 ctx.save();ctx.translate(x,y);ctx.scale(size/10,size/10);const color=RUNE_COLORS[id]||'#819074';ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=1.7;
 const stroke=(p,width=1.7)=>line(p.map(([x,y])=>({x,y})),color,width),diamond=(r=7)=>silhouette([[0,-r],[r,0],[0,r],[-r,0]],color+'33',color);
 if(id==='ember'||id==='revive'){silhouette([[-6,7],[-7,0],[-2,-9],[1,-1],[5,-6],[7,2],[4,7]],color+'77',color);if(id==='revive')stroke([[-10,3],[-3,0],[0,6],[3,0],[10,3]],1.4);}
 else if(id==='frost'){for(let i=0;i<3;i++){ctx.save();ctx.rotate(i*Math.PI/3);stroke([[0,-9],[0,9]]);stroke([[-3,-5],[0,-3],[3,-5]],1.3);ctx.restore();}}
 else if(id==='storm')silhouette([[2,-10],[-7,1],[-1,1],[-3,10],[7,-3],[1,-3]],color+'99',color);
 else if(id==='toxin'||id==='venom'){ctx.beginPath();ctx.moveTo(0,-9);ctx.bezierCurveTo(-13,4,-6,10,0,9);ctx.bezierCurveTo(8,9,11,3,0,-9);ctx.fillStyle=color+'77';ctx.fill();ctx.stroke();if(id==='venom')stroke([[-4,1],[1,0],[-1,5],[4,3]],1.5);}
 else if(['thorn','peace','growth'].includes(id)){stroke([[0,9],[0,-5]]);silhouette([[0,0],[-9,-7],[-8,0],[0,4]],color+'77',color);silhouette([[0,-3],[8,-9],[8,-3],[0,1]],color+'66',color);if(id==='thorn')stroke([[-6,4],[-10,7],[2,6],[6,9]],1.2);if(id==='peace')circle(0,0,11,null,color+'66');}
 else if(id==='bloom'){for(let i=0;i<5;i++){const a=i*Math.PI*2/5;circle(Math.cos(a)*5,Math.sin(a)*5,3.5,color+'99');}circle(0,0,2,'#f7ebbf');}
 else if(id==='shine'||id==='luck'){diamond(id==='shine'?5:7);for(let i=0;i<4;i++){const a=i*Math.PI/2;stroke([[Math.cos(a)*7,Math.sin(a)*7],[Math.cos(a)*11,Math.sin(a)*11]],1.3);}}
 else if(id==='curse'){diamond();stroke([[-4,-2],[4,-2],[0,4],[0,-6]],1.4);circle(0,0,11,null,color+'66');}
 else if(['edge','bleed','backstab','front'].includes(id)){if(id==='bleed'){for(let i=-1;i<=1;i++)stroke([[i*4-3,7],[i*4+3,-7]],1.8);}else{silhouette([[-4,8],[-1,-6],[4,-10],[4,-3],[-1,8]],color+'77',color);stroke([[-7,5],[3,9]],2);if(id==='backstab')stroke([[-10,-7],[-5,-7],[-7,-3]],1.4);if(id==='front')stroke([[5,0],[10,-5],[5,-10]],1.4);}}
 else if(id==='tide'){for(const y of [-5,2,8]){ctx.beginPath();ctx.moveTo(-9,y);ctx.bezierCurveTo(-3,y-7,2,y+6,9,y);ctx.stroke();}}
 else if(['valor','inspire','rescue'].includes(id)){stroke([[-5,10],[-5,-10]],2);silhouette([[-4,-9],[9,-6],[4,-1],[9,2],[-4,1]],color+'66',color);if(id==='rescue'){stroke([[1,-5],[1,2]],1.3);stroke([[-2,-2],[4,-2]],1.3);}}
 else if(id==='execute'||id==='focus'){circle(0,0,id==='focus'?6:8,null,color);stroke([[-11,0],[-4,0],[0,0],[11,0]],1.3);stroke([[0,-11],[0,-4],[0,0],[0,11]],1.3);if(id==='execute')stroke([[-5,-4],[0,4],[5,-4]],2);}
 else if(id==='study'){silhouette([[-9,-7],[-2,-8],[0,-5],[2,-8],[9,-7],[9,7],[2,6],[0,9],[-2,6],[-9,7]],color+'22',color);stroke([[0,-5],[0,9]],1.2);}
 else if(id==='tempo'||id==='flank'){for(const x of [-5,3])stroke([[x-3,-7],[x+3,0],[x-3,7]],2);if(id==='flank')stroke([[-10,9],[10,9]],1.3);}
 else if(id==='mend'){stroke([[0,-9],[0,9]],3);stroke([[-9,0],[9,0]],3);}
 else if(id==='prosper'){circle(-3,2,7,color+'44',color);circle(3,-3,6,'#f3e9c8',color);ctx.strokeRect(1,-5,4,4);}
 else if(id==='barrier'){silhouette([[-8,-7],[0,-10],[8,-7],[7,4],[0,10],[-7,4]],color+'33',color);stroke([[0,-6],[0,6]],1.2);}
 else if(id==='sky'){stroke([[-8,8],[0,1],[8,-9]],1.6);silhouette([[0,1],[1,-8],[8,-9],[7,-2]],color+'66',color);}
 else if(id==='slayer'){diamond(9);stroke([[-5,5],[5,-5]],2);stroke([[-5,-5],[5,5]],2);}
 else if(id==='echo'){circle(-4,0,6,null,color);circle(4,0,6,null,color);}
 else if(id==='brood'){silhouette([[-10,-6],[-2,-3],[0,4],[2,-3],[10,-6],[6,4],[0,9],[-6,4]],color+'77',color);}
 else if(id==='soul'){ctx.beginPath();ctx.moveTo(0,-10);ctx.bezierCurveTo(-11,-7,-7,8,2,9);ctx.bezierCurveTo(-2,3,11,2,0,-10);ctx.fillStyle=color+'77';ctx.fill();ctx.stroke();circle(-1,-3,1.5,'#f8efd7');}
 else if(id==='seal'){ctx.strokeRect(-7,-1,14,10);ctx.beginPath();ctx.arc(0,-1,5,Math.PI,0);ctx.stroke();circle(0,3,1.5,color);}
 else if(id==='gravity'){silhouette([[-8,-5],[2,-9],[9,-2],[5,8],[-7,7]],color+'77',color);stroke([[-10,10],[10,10]],1.3);}
 else if(id==='count'){ctx.strokeRect(-9,-9,18,18);for(const [x,y]of[[-4,-4],[4,-4],[0,0],[-4,4],[4,4]])circle(x,y,1.5,color);}
 else if(id==='measure'){ctx.rotate(-.5);ctx.strokeRect(-4,-10,8,20);for(let i=0;i<4;i++)stroke([[-4,-7+i*4],[i%2?0:2,-7+i*4]],1.1);}
 else if(id==='silence'){circle(0,0,8,null,color);stroke([[-9,-9],[9,9]],2);stroke([[-3,-4],[-3,4],[3,4],[3,-4]],1.2);}
 ctx.restore();
}
function towerSchoolArt(w,time){
 const color=w.color,pulse=Math.sin(time*.002)*2;
 if(w.type==='splash'){for(const side of [-1,1]){line([{x:side*21,y:15},{x:side*29,y:-7}],color,2);runeGlyph('ember',side*29,-15,9);}}
 else if(w.type==='slow'){for(const side of [-1,1])silhouette([[side*23,-14],[side*32,-26],[side*36,0],[side*25,9]],color+'44',color);}
 else if(w.type==='chain'){for(const side of [-1,1]){line([{x:side*26,y:17},{x:side*26,y:-26}],color,2);circle(side*26,-27,4,color+'66',color);}line([{x:-26,y:-28},{x:-10,y:-35},{x:0,y:-30},{x:11,y:-37},{x:26,y:-28}],color+'88',1.4);}
 else if(w.type==='fast'){for(const side of [-1,1]){ctx.beginPath();ctx.ellipse(0,-8,33,12,side*.5,side<0?0:Math.PI,side<0?Math.PI:Math.PI*2);ctx.strokeStyle=color+'99';ctx.lineWidth=2;ctx.stroke();}}
 else if(w.type==='heavy'){for(const side of [-1,1]){silhouette([[side*21,15],[side*23,-18],[side*32,-12],[side*34,17]],color+'77',color);line([{x:side*22,y:2},{x:side*31,y:-1}],color,1);}}
 else if(w.type==='aura'){ctx.beginPath();ctx.ellipse(0,-34,31+pulse,8,0,0,Math.PI*2);ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();for(const side of [-1,1])line([{x:side*25,y:-30},{x:side*31,y:-39}],color+'aa',1.5);}
 else if(w.type==='poison'){for(const side of [-1,1]){circle(side*26,-17,7,color+'44',color);circle(side*31,-26-pulse,4,color+'77');circle(side*32,-3,3,color+'77');}}
 else if(w.type==='sniper'){for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(side*24,-25);ctx.quadraticCurveTo(side*45,-5,side*24,17);ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.stroke();line([{x:side*24,y:-25},{x:side*24,y:17}],color+'99',1);}}
 else if(w.type==='income'){for(const side of [-1,1]){circle(side*28,12,8,'#eee0b0',color);ctx.strokeStyle=color;ctx.strokeRect(side*28-2,10,4,4);circle(side*28,-23,4,color+'44',color);}}
 else if(w.type==='pierce'){for(const side of [-1,1])silhouette([[side*22,18],[side*24,-25],[side*30,-35],[side*33,-25],[side*29,18]],color+'55',color);}
 else if(w.type==='pulse'){for(const y of [6,14]){ctx.beginPath();ctx.ellipse(0,y,34,8,0,0,Math.PI);ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();}}
 else if(w.type==='mark'){for(const side of [-1,1]){ctx.save();ctx.translate(side*29,-21);ctx.rotate(side*.2);ctx.strokeStyle=color;ctx.strokeRect(-5,-10,10,20);line([{x:-2,y:-6},{x:2,y:2},{x:-2,y:6}],color,1.2);ctx.restore();}}
 else if(w.type==='echo'){ctx.strokeStyle=color+'77';ctx.strokeRect(-29,-25,12,35);ctx.strokeRect(17,-25,12,35);circle(0,-37,5,null,color);}
 else{for(const side of [-1,1]){line([{x:side*24,y:-23},{x:side*29,y:-27},{x:side*29,y:16},{x:side*24,y:12}],color+'99',1.5);}}
}
function towerFormArt(w){
 const color=w.color;
 if(w.special){const f=SPECIAL_EFFECTS[w.special];runeGlyph(f.glyph,0,-43,11);if(['visit','volley','double'].includes(w.special))for(const x of [-14,0,14])circle(x,-58,2.5,color);}
 else if(w.trait==='impact'){for(let i=0;i<4;i++){const a=i*Math.PI/2;line([{x:Math.cos(a)*4,y:-40+Math.sin(a)*4},{x:Math.cos(a)*10,y:-40+Math.sin(a)*10}],color,1.5);}circle(0,-40,3,color+'66',color);}
 else if(['ranged','blade','sunder'].includes(w.trait)){runeGlyph(w.trait==='ranged'?'front':'edge',0,-40,9);}
 else if(w.trait==='spread'){for(const x of [-13,0,13])circle(x,-38,3,color+'55',color);}
 else if(w.trait==='combo'){for(const x of [-8,8]){ctx.strokeStyle=color;ctx.strokeRect(x-3,-43,6,8);}}
 else if(w.trait==='dragon'){for(const side of [-1,1])line([{x:side*12,y:-31},{x:side*20,y:-43},{x:side*27,y:-38}],color,2);}
 else if(['ward','bind'].includes(w.trait)){ctx.setLineDash([3,4]);circle(0,-6,34,null,color+'aa');ctx.setLineDash([]);}
 else if(w.trait==='firewall'){for(const x of [-11,0,11])silhouette([[x-4,17],[x-2,-3],[x+2,3],[x+5,17]],color+'44');}
 else if(['radiance','purify','moon','coin','fortune','entice','venom','rapid'].includes(w.trait)){const id={radiance:'shine',purify:'seal',moon:'sky',coin:'luck',fortune:'prosper',entice:'luck',venom:'venom',rapid:'tempo'}[w.trait];runeGlyph(id,0,-40,9);}
}
function drawTower(t){
 const p=PADS[t.pad],w=getWord(t.word),up=t.level-w.tier,motion=reducedMotion.matches?0:game.time*1000,gradeColor=w.tier===4?'#b69a4e':w.tier===3?'#a087b5':w.color;
 ctx.save();ctx.translate(p.x,p.y);
 const defense=towerDefense(t),hp=t.hp??defense.maxHp;
 if(!towerActive(t)){silhouette([[-27,22],[-21,-5],[-5,0],[2,-20],[12,4],[28,13],[31,26]],'#8b8a7977','#8a826e');line([{x:-10,y:-8},{x:2,y:4},{x:-4,y:20}],'#6e6557',2);ctx.fillStyle='#756a58';ctx.font='18px serif';ctx.textAlign='center';ctx.fillText(w.icon,0,7);ctx.font='11px system-ui';ctx.fillText(w.word+' · 待重建',0,43);ctx.restore();return;}
 if(t.hitUntil>game.time){circle(0,0,36,'#c6794929','#b66346');if(!reducedMotion.matches)ctx.translate(Math.sin(game.time*80)*3,0);}
 ctx.fillStyle='#7e8f6a33';ctx.beginPath();ctx.ellipse(3,24,31+up*2,11,0,0,7);ctx.fill();
 if(w.tier>=3){ctx.save();ctx.translate(0,6);ctx.rotate(motion*.00012);ctx.setLineDash(w.tier===4?[8,4]:[3,7]);circle(0,0,32+up*2,null,gradeColor+'88');ctx.setLineDash([]);ctx.restore();}
 towerSchoolArt(w,motion+t.id*230);
 for(let i=0;i<=up;i++){ctx.fillStyle=i===up?'#d9debf':'#a4b393';ctx.fillRect(-23-i*2,16+i*3,46+i*4,6);}
 ctx.fillStyle='#f9f4e4';ctx.strokeStyle=gradeColor;ctx.lineWidth=1.5+up*.5;ctx.beginPath();ctx.roundRect(-22,-29,44,47,4);ctx.fill();ctx.stroke();
 ctx.strokeStyle=w.color+'66';ctx.lineWidth=.7;ctx.strokeRect(-18,-25,36,39);
 ctx.fillStyle=w.color;ctx.font='26px "Noto Serif SC", "Songti SC", serif';ctx.textAlign='center';ctx.fillText(w.icon,0,4);
 ctx.fillStyle=gradeColor;ctx.fillRect(-26,-33,52,5);if(w.tier===2)line([{x:-27,y:-30},{x:-27,y:-36},{x:27,y:-36},{x:27,y:-30}],w.color,1.2);
 if(w.tier>=3)for(const side of [-1,1]){line([{x:side*13,y:-33},{x:side*19,y:-39},{x:side*25,y:-33}],gradeColor,1.5);}
 if(up>0)for(const side of [-1,1]){line([{x:side*18,y:-25},{x:side*18,y:-19},{x:side*12,y:-25}],gradeColor,2);if(up===2)line([{x:side*18,y:14},{x:side*18,y:8},{x:side*12,y:14}],gradeColor,2);}
 towerFormArt(w);
 w.runes.forEach((id,i)=>{const x=i?32:-32,y=1;circle(x,y,10,'#faf4df',RUNE_COLORS[id]);runeGlyph(id,x,y,7.5);if(!reducedMotion.matches&&game.phase==='battle'){const angle=motion*.001+i*2+t.id;circle(x+Math.cos(angle)*14,y+Math.sin(angle)*10,1.5,RUNE_COLORS[id]+'aa');}});
 for(let j=0;j<t.level;j++)circle((j-(t.level-1)/2)*7,29,2.2,j>=w.tier?gradeColor:w.color);
 const labelFont=Math.max(10,7*dpr/boardScale);ctx.font=labelFont+'px system-ui,"PingFang SC","Microsoft YaHei",sans-serif';const labelWidth=ctx.measureText(w.word).width;ctx.fillStyle='#f7f4e8ed';ctx.fillRect(-labelWidth/2-4,34,labelWidth+8,labelFont+4);ctx.fillStyle='#526748';ctx.fillText(w.word,0,34+labelFont);
 if(hp<defense.maxHp-1e-6){ctx.fillStyle='#d4cdb8';ctx.fillRect(-28,40+labelFont,56,4);ctx.fillStyle=hp/defense.maxHp>.4?'#73916a':'#b57156';ctx.fillRect(-28,40+labelFont,56*hp/defense.maxHp,4);}
 if(t.lessonShieldUntil>game.time&&t.lessonShield>0)circle(0,0,37,'#c8ac5522','#b79b52');
 if(t.idiomGuardUntil>game.time)circle(0,0,40,(IDIOM_MOVES[w.idiomMove]?.color||'#b5a181')+'22',IDIOM_MOVES[w.idiomMove]?.color||'#b5a181');
 if(t.idiomPowerUntil>game.time)circle(0,0,36,null,'#c9a559');
 if(t.corrodedUntil>game.time||t.chillUntil>game.time)circle(0,0,36,null,t.corrodedUntil>game.time?'#9a9259':'#81b5c6');
 if(selected===t.id||hover===t.pad){ctx.strokeStyle='#7d9065';ctx.lineWidth=1;ctx.strokeRect(-43,-48,86,83);}ctx.restore();
}
function learningMoveArt(f,progress){
 const w=getWord(f.word),id=f.special;if(!w||!SPECIAL_PALETTES[id])return;
 const q=f.to,p=f.from,rank=learningRank(w),r=18+rank*4,phase=reducedMotion.matches?.6:progress,angle=Math.atan2(q.y-p.y,q.x-p.x),color=f.color;
 ctx.save();ctx.translate(q.x,q.y);ctx.strokeStyle=color;ctx.fillStyle=color+'33';ctx.lineWidth=2;
 const ray=(a,d,origin={x:0,y:0})=>line([origin,{x:origin.x+Math.cos(a)*d,y:origin.y+Math.sin(a)*d}],color,2);
 const ring=(x,y,size)=>circle(x,y,size,null,color);
 if(id==='orbit'){ctx.rotate(angle);ctx.beginPath();ctx.ellipse(-r*(1-phase),0,r+phase*8,9+rank*2,0,-Math.PI*.8,Math.PI*.8);ctx.stroke();silhouette([[r,-6],[r+10,0],[r,6]],color);}
 else if(id==='penetrate'){ctx.rotate(angle);line([{x:-r*2,y:0},{x:r*(1+phase*2),y:0}],color,4);for(let i=0;i<rank;i++)line([{x:i*18,y:-9},{x:i*18+10,y:0},{x:i*18,y:9}],color,2);}
 else if(id==='cross'){for(const side of[-1,1])line([{x:-r,y:side*r},{x:0,y:0},{x:r,y:-side*r}],color,2+phase);for(let i=0;i<rank;i++)ring((i-(rank-1)/2)*15,0,4);}
 else if(id==='rally'){ctx.translate(p.x-q.x,p.y-q.y);for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(0,0,12+i*9+phase*10,-1.2,1.2);ctx.stroke();}silhouette([[-2,-35],[18,-29],[5,-18],[-2,-18]],color+'99',color);}
 else if(id==='triage'){ring(0,0,r*phase+8);line([{x:-10,y:0},{x:10,y:0}],color,4);line([{x:0,y:-10},{x:0,y:10}],color,4);for(let i=0;i<rank;i++)ring(Math.cos(i*2.1)*r,Math.sin(i*2.1)*r,4);}
 else if(id==='watch'){ctx.beginPath();ctx.moveTo(-r,0);ctx.quadraticCurveTo(0,-r,r,0);ctx.quadraticCurveTo(0,r,-r,0);ctx.stroke();ring(0,0,6+phase*3);ray(-Math.PI/4,r*1.8);}
 else if(id==='counter'){silhouette([[-r*.6,-r],[r*.6,-r],[r*.5,r*.3],[0,r],[-r*.5,r*.3]],color+'33',color);for(const side of[-1,1])line([{x:side*r*.4,y:0},{x:side*r*(1+phase),y:-r*.6}],color,3);}
 else if(id==='hunt'){for(let i=0;i<rank+1;i++){ctx.save();ctx.translate(-r+i*12,-r+i*9);ctx.rotate(-.5);ctx.fillStyle=color+'99';ctx.beginPath();ctx.ellipse(0,0,3,6,0,0,7);ctx.fill();ctx.restore();}line([{x:-r,y:r},{x:r,y:-r}],color,1.5);ring(0,0,8);}
 else if(id==='beast'){ctx.save();ctx.rotate(angle);silhouette([[-r,5],[-r*.5,-12],[-3,-10],[5,-19],[10,-14],[20,-10],[r,3],[10,7],[7,19],[0,8],[-10,9],[-15,18]],color+'88',color);ctx.restore();for(let i=0;i<rank;i++)ray(Math.PI+i*.25,r+phase*15);}
 else if(id==='nectar'){for(let i=0;i<5;i++){const a=i*Math.PI*2/5;circle(Math.cos(a)*12,Math.sin(a)*12,8,color+'22',color);}ctx.beginPath();ctx.moveTo(0,-r);ctx.quadraticCurveTo(-10,-r*.3,0,2);ctx.quadraticCurveTo(10,-r*.3,0,-r);ctx.stroke();}
 else if(id==='thrift'){for(let i=0;i<rank;i++){ring((i-(rank-1)/2)*12,-phase*8,7);ctx.strokeRect((i-(rank-1)/2)*12-2,-2-phase*8,4,4);}ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*1.6);ctx.stroke();}
 else if(id==='rhythm'){for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-r,-12+i*12);ctx.bezierCurveTo(-8,8+i*12+Math.sin(phase*7)*5,8,-28+i*12,r,-12+i*12);ctx.stroke();}}
 else if(id==='resonate'){for(let i=0;i<rank;i++)ring(0,0,8+i*8+phase*r);for(const side of[-1,1])ray(side*.45,r+phase*12);}
 else if(id==='geometry'){const d=(25+rank*10)*(.5+phase*.5);ctx.strokeRect(-d,-d,d*2,d*2);line([{x:-d,y:0},{x:d,y:0}],color,1);line([{x:0,y:-d},{x:0,y:d}],color,1);for(const x of[-d,d])for(const y of[-d,d])circle(x,y,3,color);}
 else if(id==='weave'){const d=r*(.6+phase*.5);ctx.save();ctx.rotate(Math.PI/4);for(let i=-2;i<=2;i++){line([{x:i*d/2,y:-d},{x:i*d/2,y:d}],color,1);line([{x:-d,y:i*d/2},{x:d,y:i*d/2}],color,1);}ctx.restore();}
 else if(id==='pillar'){ctx.translate(p.x-q.x,p.y-q.y);for(let i=0;i<3;i++)ctx.strokeRect(-r+i*4,-i*9,r*2-i*8,9);line([{x:-r-8,y:10},{x:r+8,y:10}],color,3);}
 else if(id==='shelter'){ctx.translate(p.x-q.x,p.y-q.y);ctx.beginPath();ctx.arc(0,0,r+phase*8,Math.PI,Math.PI*2);ctx.stroke();line([{x:0,y:-r},{x:0,y:13},{x:8,y:18}],color,2);for(const side of[-1,1])line([{x:side*15,y:-r-12},{x:side*17,y:-r-4}],color,1);}
 else if(id==='dawn'){ring(0,0,8+phase*6);for(let i=0;i<8;i++)ray(i*Math.PI/4,16+phase*r);line([{x:-r,y:r},{x:r,y:-r}],color,2);}
 else if(id==='guide'){for(let i=0;i<rank;i++){const x=(i-(rank-1)/2)*14;line([{x:x-5,y:-10},{x:x+5,y:0},{x:x-5,y:10}],color,2);}ctx.setLineDash([3,5]);line([{x:p.x-q.x,y:p.y-q.y},{x:0,y:0}],color,1);ctx.setLineDash([]);}
 else if(id==='relay'){const count=rank+2;for(let i=0;i<count;i++){const k=(i+phase)/count;ring((p.x-q.x)*(1-k),(p.y-q.y)*(1-k),3+i);}}
 else if(id==='puzzle'){ctx.rotate(phase*Math.PI/3);for(let i=0;i<3;i++){const a=i*Math.PI*2/3;ring(Math.cos(a)*r,Math.sin(a)*r,5);ray(a,r);}ring(0,0,7);}
 else if(id==='mechanism'){ctx.rotate(angle);for(const side of[-1,1])line([{x:-r,y:side*9},{x:r+phase*12,y:side*9}],color,3);for(let i=0;i<rank+1;i++)circle(-10+i*9,-18,2.5,color);ring(-r,0,6);}
 else if(id==='reversal'){ctx.translate(p.x-q.x,p.y-q.y);for(const side of[-1,1]){ctx.beginPath();ctx.arc(0,0,r+phase*4,side<0?0:Math.PI,side<0?Math.PI*.8:Math.PI*1.8);ctx.stroke();}line([{x:0,y:12},{x:0,y:-13},{x:-5,y:-8},{x:0,y:-13},{x:5,y:-8}],color,2);}
 else if(id==='festival'){const colors=['#b87d52','#729b9b','#9c87b8','#b3a04e'];for(let i=0;i<4;i++){const a=i*Math.PI/2+phase*.6;circle(Math.cos(a)*r,Math.sin(a)*r,5+rank,null,colors[i]);}ring(0,0,6);}
 ctx.restore();
}

function semanticAttackArt(f,progress){
 const w=getWord(f.word);if(!w||!f.from)return;
 const to=f.to||f.from,dx=to.x-f.from.x,dy=to.y-f.from.y,len=Math.hypot(dx,dy),ux=len?dx/len:1,uy=len?dy/len:0;
 const point=f.kind==='cast'?f.from:{x:f.from.x+dx*progress,y:f.from.y+dy*progress};
 const level=Math.min(6,f.level||w.tier),size=5+level*.6;
 ctx.save();ctx.globalAlpha=Math.max(0,f.life/f.max)*.85;
 if(level>=3&&!reducedMotion.matches){for(const side of [-1,1])line([{x:point.x-ux*18-uy*side*5,y:point.y-uy*18+ux*side*5},{x:point.x-ux*4-uy*side*5,y:point.y-uy*4+ux*side*5}],w.color+'77',1+level*.15);}
 if(level>=5)circle(point.x,point.y,size+2,null,w.tier>=4?'#c1a153':w.color+'99');
 if(w.special)runeGlyph(SPECIAL_EFFECTS[w.special].glyph,point.x,point.y,size+1);
 if(w.trait==='spread'&&!reducedMotion.matches)for(const side of [-1,1])circle(point.x-uy*side*10,point.y+ux*side*10,4,w.color+'33');
 if(w.trait==='ranged'){line([{x:point.x-ux*10-uy*4,y:point.y-uy*10+ux*4},{x:point.x-ux*14,y:point.y-uy*14},{x:point.x-ux*10+uy*4,y:point.y-uy*10-ux*4}],w.color,1.2);}
 for(let i=0;i<w.runes.length;i++){
  const id=w.runes[i],shot=f.shot||1,cycle=['focus','tempo','gravity','silence','tide'].includes(id)?4:['thorn','brood'].includes(id)?3:id==='count'?w.semanticCycle:1,active=shot%cycle===0;
  const side=i?1:-1,offset=f.kind==='cast'?18:8;
  runeGlyph(id,f.kind==='cast'?point.x+side*22:point.x-uy*offset*side,f.kind==='cast'?point.y-20:point.y+ux*offset*side,active?size:size*.7);
  if(active&&progress>.7&&f.kind==='bolt'&&!reducedMotion.matches)circle(to.x,to.y,9+(progress-.7)*22,null,RUNE_COLORS[id]+'99');
 }
 ctx.restore();
}

// Enemy attacks use their own palette and silhouettes, separate from tower bolts.
function enemyAttackArt(from,to,w,phase,detail=true){
 const dx=to.x-from.x,dy=to.y-from.y,len=Math.hypot(dx,dy)||1,angle=Math.atan2(dy,dx),color=w.color,big=w.power?2:w.boss?1.35:1;
 ctx.save();ctx.translate(from.x,from.y);ctx.rotate(angle);
 const x=len*phase,head={x,y:0},stroke=(points,width=2)=>line(points.map(([x,y])=>({x,y})),color,width*big);
 if(w.visual==='claw'||w.visual==='shadow'){
  ctx.translate(x,0);for(const offset of [-10,0,10]){line([{x:-18,y:offset-9},{x:0,y:offset+3},{x:17,y:offset+7}],'#fff4df',5*big);stroke([[-18,offset-9],[0,offset+3],[17,offset+7]],2.5);}
  if(w.visual==='shadow'){circle(-13,0,20,color+'22');stroke([[-20,20],[20,-20]],3);}
 }else if(w.visual==='quake'){
  ctx.translate(x,0);ctx.rotate(-angle);for(let i=0;i<2;i++){ctx.beginPath();ctx.ellipse(0,9,(22+phase*22+i*13)*big,(10+phase*10+i*6)*big,0,0,Math.PI*2);ctx.strokeStyle=color;ctx.lineWidth=(2-i*.6)*big;ctx.stroke();}
  if(detail)for(let i=0;i<5;i++){const a=i*Math.PI*2/5;stroke([[Math.cos(a)*12,Math.sin(a)*12],[Math.cos(a+.18)*29,Math.sin(a+.18)*29],[Math.cos(a)*42,Math.sin(a)*42]],2);}
 }else if(w.visual==='rush'){
  line([{x:0,y:0},head],'#fff1dc',7*big);stroke([[0,0],[x,0]],3);silhouette([[x+10,0],[x-9,-7],[x-5,0],[x-9,7]],color);
 }else if(w.visual==='dive'){
  ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(x*.5,-34*big,x,0);ctx.strokeStyle='#f1f3df';ctx.lineWidth=7*big;ctx.stroke();ctx.strokeStyle=color;ctx.lineWidth=3*big;ctx.stroke();
  for(const side of [-1,1])stroke([[x-25,side*20],[x+4,0],[x-13,side*8]],2.5);
 }else if(w.visual==='thunder'){
  const pts=Array.from({length:8},(_,i)=>({x:x*i/7,y:i===0||i===7?0:(i%2?1:-1)*(8+i%3*3)*big}));line(pts,color+'99',8*big);line(pts,'#fff4bd',3*big);circle(x,0,12*big,color+'44',color);
 }else if(w.visual==='flame'){
  silhouette([[0,-3],[x-20,-17*big],[x+7,0],[x-20,17*big],[0,3]],color+'66',color);for(let i=0;i<(detail?4:2);i++){const a=x*(i+1)/4;silhouette([[a-8,7],[a-5,-15],[a+2,-5],[a+10,0],[a+7,9]],i%2?'#f1bb68':color);}
 }else if(w.visual==='frost'){
  stroke([[0,0],[x,0]],3);silhouette([[x+13,0],[x-6,-10],[x-15,0],[x-6,10]],'#d1f0ef',color);if(detail)for(const side of [-1,1])stroke([[x-35,side*9],[x-19,side*4],[x-27,side*15]],1.5);
 }else if(w.visual==='acid'){
  stroke([[0,0],[x,0]],2);for(let i=0;i<(detail?3:1);i++){circle(x-i*12,(i%2?1:-1)*6,8-i,color+'99','#d9dfaa');}circle(x,0,17*big,color+'22');
 }else if(w.visual==='tide'){
  for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(x-i*13,0,(10+i*5)*big,-1.2,1.2);ctx.strokeStyle=i===0?'#d5eeee':color;ctx.lineWidth=(4-i*.7)*big;ctx.stroke();}stroke([[0,0],[Math.max(0,x-25),0]],2);
 }else if(w.visual==='vine'){
  const pts=Array.from({length:13},(_,i)=>({x:x*i/12,y:Math.sin(i*.9)*9*big}));line(pts,'#d6ddbb',6*big);line(pts,color,3*big);if(detail)for(let i=2;i<12;i+=3){const q=pts[i];silhouette([[q.x,q.y],[q.x-3,q.y-13],[q.x+8,q.y-4]],color);}
 }else if(w.visual==='prism'){
  for(const side of [-1,1]){stroke([[0,side*9],[x*.5,side*17],[x,0]],2);silhouette([[x+8,side*3],[x-9,side*16],[x-16,side*4]],'#ead8ed',color);}
 }else if(w.visual==='seal'){
  stroke([[0,0],[x,0]],2);ctx.translate(x,0);ctx.rotate(Math.PI/4);ctx.strokeStyle=color;ctx.lineWidth=2.5*big;ctx.strokeRect(-13,-13,26,26);stroke([[-7,0],[7,0]],2);stroke([[0,-7],[0,7]],2);
 }else if(w.visual==='star'){
  stroke([[0,0],[x,0]],2);const pts=Array.from({length:10},(_,i)=>{const a=i*Math.PI/5,r=(i%2?6:16)*big;return[x+Math.cos(a)*r,Math.sin(a)*r];});silhouette(pts,'#f1ddba',color);
 }else if(w.visual==='cannon'){
  ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(x*.5,-40*big,x,0);ctx.strokeStyle=color+'88';ctx.lineWidth=3*big;ctx.stroke();circle(x,0,10*big,color,'#f0d9b0');stroke([[x-6,-4],[x+4,5]],2);
 }else{stroke([[0,0],[x,0]],4);circle(x,0,9*big,color,'#e8def2');circle(x-13,4,4,color+'88');}
 ctx.restore();
}
function siegeWindup(e,marked){
 const target=game.towers.find(t=>t.id===e.towerTarget);if(!target||!towerActive(target))return;
 const weapon=enemyWeapon(e.kind),boss=!!ENEMIES[e.kind].boss,p=enemyPosition(e),q=PADS[target.pad],progress=Math.max(0,Math.min(1,1-(e.towerStrikeAt-game.time)/weapon.windup)),radius=boss?36:29;
 ctx.save();const first=!marked.has(target.id),pressure=game.towerPressure(target);marked.add(target.id);if(boss||first){ctx.setLineDash([5,6]);line([p,q],'#fff6e5bb',boss?6:4);line([p,q],weapon.color+'bb',boss?3:2);ctx.setLineDash([]);}
 if(first){circle(q.x,q.y,radius,weapon.color+'16',weapon.color+'aa');ctx.beginPath();ctx.arc(q.x,q.y,radius+4,-Math.PI/2,-Math.PI/2+Math.PI*2*progress);ctx.strokeStyle=weapon.color;ctx.lineWidth=boss?4:2.5;ctx.stroke();if(pressure>2){ctx.font=`bold ${Math.max(14,8*dpr/boardScale)}px system-ui`;ctx.textAlign='left';ctx.fillStyle='#8a4c36';ctx.fillText('×'+pressure,q.x+29,q.y-34);}}
 circle(p.x,p.y,boss?32:20,weapon.color+'22',weapon.color);
 if(progress>.6)enemyAttackArt(p,q,{...weapon,boss},reducedMotion.matches?1:(progress-.6)/.4,!mobileLayout.matches);
 if(boss){const font=Math.max(17,10*dpr/boardScale);ctx.font=`bold ${font}px system-ui`;ctx.textAlign='center';const label=weapon.name,width=ctx.measureText(label).width+12,x=Math.max(width/2+6,Math.min(894-width/2,p.x)),y=Math.min(500-font,Math.max(15,p.y+53));ctx.fillStyle='#493d35ee';ctx.fillRect(x-width/2,y,width,font+10);ctx.fillStyle='#fff0c9';ctx.fillText(label,x,y+font+2);}
 ctx.restore();
}
function idiomArt(f,progress){
 const q=f.to,color=f.color||'#bca565',r=28+(reducedMotion.matches?8:progress*25),id=f.move;
 ctx.save();ctx.translate(q.x,q.y);ctx.strokeStyle=color;ctx.fillStyle=color+'22';ctx.lineWidth=2;
 if(id==='roots'){for(const sign of[-1,1]){ctx.beginPath();ctx.moveTo(-r,sign*r*.3);ctx.bezierCurveTo(-r*.2,-sign*r,r*.2,sign*r,r,-sign*r*.3);ctx.stroke();}for(const x of[-.6,0,.6])silhouette([[r*x,-r*.4],[r*x-7,-r*.7],[r*x+7,-r*.6]],color+'66',color);}
 else if(id==='borrow'){for(const side of[-1,1]){ctx.beginPath();ctx.arc(side*r*.3,0,r*.7,-Math.PI*.8,Math.PI*.4);ctx.stroke();line([{x:side*r*.8,y:-r*.3},{x:0,y:0},{x:side*r*.5,y:r*.6}],color,2);}}
 else if(['flame','wrath','aggravate'].includes(id)){
  for(let i=0;i<6;i++){const a=i*Math.PI/3;line([{x:Math.cos(a)*r*.4,y:Math.sin(a)*r*.4},{x:Math.cos(a+.12)*r*1.2,y:Math.sin(a+.12)*r*1.2},{x:Math.cos(a+.25)*r*.65,y:Math.sin(a+.25)*r*.65}],color,3);}
 }else if(['frost','storm','precision'].includes(id)){
  for(let i=0;i<4;i++){const a=i*Math.PI/2;line([{x:0,y:0},{x:Math.cos(a+.2)*r*.55,y:Math.sin(a+.2)*r*.55},{x:Math.cos(a)*r,y:Math.sin(a)*r}],color,3);}
 }else if(['rampart','steadfast'].includes(id)){
  silhouette([[0,-r],[-r*.8,-r*.5],[-r*.65,r*.4],[0,r],[r*.65,r*.4],[r*.8,-r*.5]],color+'22',color);circle(0,0,r*.55,null,color);
 }else if(['healing','purity','radiance','succession','rally'].includes(id)){
  circle(0,0,r,null,color);line([{x:-r*.5,y:0},{x:r*.5,y:0}],color,4);line([{x:0,y:-r*.5},{x:0,y:r*.5}],color,4);
  if(id==='purity'){ctx.beginPath();ctx.arc(0,0,r*.7,.3,Math.PI*1.5);ctx.stroke();}
  if(id==='succession')line([{x:-r,y:r*.6},{x:0,y:r*.3},{x:r,y:r*.6}],color,3);
 }else if(['reputation','tide','conspire','toxic'].includes(id)){
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3;circle(Math.cos(a)*r*.65,Math.sin(a)*r*.65,r*.55,color+'11',color);}
  if(id==='conspire')line([{x:-r*.6,y:r*.3},{x:0,y:-r*.6},{x:r*.6,y:r*.3},{x:-r*.6,y:r*.3}],color,3);
 }else if(['contrast','turning','scarcity','mirage'].includes(id)){
  for(const side of[-1,1]){circle(side*r*.45,0,r*.6,null,color);line([{x:side*r*.2,y:-r*.7},{x:side*r*.7,y:r*.7}],color,3);}
 }else{
  ctx.strokeRect(-r*.75,-r*.75,r*1.5,r*1.5);ctx.rotate(Math.PI/4);ctx.strokeRect(-r*.55,-r*.55,r*1.1,r*1.1);ctx.rotate(-Math.PI/4);
 }
 ctx.font=`bold ${Math.max(20,13*dpr/boardScale)}px serif`;ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(f.glyph||'章',0,0);
 const letter=Math.max(13,9*dpr/boardScale);ctx.font=`bold ${letter}px serif`;for(const[i,ch]of[...f.word].entries()){const x=(i%2?1:-1)*(r+7),y=(i<2?-1:1)*(r+7);circle(x,y,Math.max(12,letter*.65),'#f5efdfe6',color);ctx.fillStyle=color;ctx.fillText(ch,x,y);}
 ctx.restore();
}
function towerHitArt(f,progress){
 const p=f.to,color=f.color||'#a65b42';circle(p.x,p.y,27+progress*23,color+'22',color);
 if(progress<.35){ctx.strokeStyle=color;ctx.lineWidth=f.boss?3:2;ctx.strokeRect(p.x-26,p.y-31,52,51);}
 const text=f.damage!==undefined?'−'+(f.damage<1?f.damage.toFixed(2):f.damage<10?f.damage.toFixed(1):Math.round(f.damage)):'';
 if(text){const font=Math.max(18,(f.boss?11:9)*dpr/boardScale),rise=reducedMotion.matches?0:progress*27;ctx.font=`bold ${font}px system-ui`;ctx.textAlign='center';ctx.strokeStyle='#fff7e8';ctx.lineWidth=4;ctx.strokeText(text,p.x+24,p.y-34-rise);ctx.fillStyle=f.boss?'#9b392e':'#7f4432';ctx.fillText(text,p.x+24,p.y-34-rise);}
}
function enemySkillArt(f,progress){
 const p=f.to,r=26+(reducedMotion.matches?8:progress*32),color=f.color;ctx.save();ctx.translate(p.x,p.y);
 if(f.skill==='shield'||f.skill==='guard'){silhouette([[0,-r],[-r,-r*.5],[-r*.8,r*.4],[0,r],[r*.8,r*.4],[r,-r*.5]],color+'22',color);circle(0,0,r*.6,null,color);}
 else if(f.skill==='heal'){circle(0,0,r,null,'#5e9766');for(const side of [-1,1]){line([{x:side*r*.6-5,y:-r*.5},{x:side*r*.6+5,y:-r*.5}],'#5e9766',3);line([{x:side*r*.6,y:-r*.5-5},{x:side*r*.6,y:-r*.5+5}],'#5e9766',3);}}
 else if(f.skill==='summon'){for(let i=0;i<3;i++){const a=i*Math.PI*2/3;circle(Math.cos(a)*r,Math.sin(a)*r,9,color+'44',color);}circle(0,0,r,null,color);}
 else if(f.skill==='blink'||f.skill==='haste'){for(const y of [-10,0,10])line([{x:-r,y},{x:0,y},{x:r*.5,y:y-7}],color,3);}
 else{ctx.setLineDash([4,5]);circle(0,0,r,null,color);circle(0,0,r*.65,null,color);ctx.setLineDash([]);for(const side of [-1,1])line([{x:side*12,y:-14},{x:-side*12,y:14}],color,2);}
 if(f.boss){const font=Math.max(16,9*dpr/boardScale);ctx.font=`bold ${font}px system-ui`;ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#fbf4e5';ctx.strokeText(f.name,0,58);ctx.fillStyle=color;ctx.fillText(f.name,0,58);}
 ctx.restore();
}
function drawEffect(f,time,decorate=true){
 if(f.life>f.max)return;
 const a=Math.max(0,f.life/f.max),progress=1-a;ctx.save();ctx.globalAlpha=a;
 if(f.sound&&!f.played){f.played=true;attackAudio(f.sound,time);}
 if(f.kind==='siege'){if(!f.played){f.played=true;if(!f.secondary)enemyAttackAudio(f,time);}enemyAttackArt(f.from,f.to,f,f.power&&!reducedMotion.matches?Math.min(1,progress*2):1,decorate&&!reducedMotion.matches);if(f.power){const r=reducedMotion.matches?56:35+progress*55;circle(f.to.x,f.to.y,r,f.color+'0c',f.color+'aa');if(decorate&&!reducedMotion.matches)for(let n=0;n<6;n++){const angle=n*Math.PI/3+progress;const q={x:f.to.x+Math.cos(angle)*r,y:f.to.y+Math.sin(angle)*r};circle(q.x,q.y,4,f.color);}}if(f.boss&&!f.secondary){circle(f.to.x,f.to.y,30+progress*30,null,f.color);}}
 else if(f.kind==='boss-arrival'||f.kind==='boss-burst'){const p=f.to,r=reducedMotion.matches?85:40+progress*(f.kind==='boss-arrival'?140:160);circle(p.x,p.y,r,f.color+'0c',f.color);circle(p.x,p.y,r*.7,null,f.color+'99');for(let i=0;i<8;i++){const angle=i*Math.PI/4+progress*.3;line([{x:p.x+Math.cos(angle)*r*.8,y:p.y+Math.sin(angle)*r*.8},{x:p.x+Math.cos(angle)*r,y:p.y+Math.sin(angle)*r}],f.color,3);}}
 else if(f.kind==='reflected'){line([f.from,f.to],f.color+'99',4);circle(f.to.x,f.to.y,24,null,f.color);}
 else if(f.kind==='tower-hit')towerHitArt(f,progress);
 else if(f.kind==='enemy-skill')enemySkillArt(f,progress);
 else if(f.kind==='tower-repair'){circle(f.to.x,f.to.y,20+progress*30,null,'#86a77c');ctx.fillStyle='#6c9568';ctx.font='20px system-ui';ctx.textAlign='center';ctx.fillText('+',f.to.x,f.to.y-25-progress*15);}
 else if(f.kind==='learning-art'){learningMoveArt(f,progress);}
 else if(f.kind==='idiom'){idiomArt(f,progress);}
 else if(f.kind==='idiom-aid'){line([f.from,f.to],f.color+'88',2);circle(f.to.x,f.to.y,22+progress*15,f.color+'11',f.color);ctx.font=`bold ${Math.max(17,10*dpr/boardScale)}px serif`;ctx.fillStyle=f.color;ctx.textAlign='center';ctx.fillText(f.glyph,f.to.x,f.to.y-30-progress*12);}
 else if(f.kind==='bolt'){
  const from=f.from,to=f.to,dx=to.x-from.x,dy=to.y-from.y,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len;
  const q={x:from.x+dx*progress,y:from.y+dy*progress};
  if(f.attackType==='slash'){ctx.translate(to.x,to.y);ctx.rotate(Math.atan2(dy,dx));ctx.strokeStyle=f.color;ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,18+progress*9,-1.2,1.2);ctx.stroke();line([{x:-9,y:-12},{x:9,y:12}],'#f1e8d3',2);}
  else if(f.attackType==='chain'){
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
  }else if(['sniper','fast','slow','arrow'].includes(f.attackType)){
   line([{x:q.x-ux*18,y:q.y-uy*18},q],f.color,3);silhouette([[q.x+ux*6,q.y+uy*6],[q.x-ux*5-uy*5,q.y-uy*5+ux*5],[q.x-ux*5+uy*5,q.y-uy*5-ux*5]],f.color);
   if(f.attackType==='slow')circle(to.x,to.y,8+progress*13,null,'#85b9c3');
  }else{
   line([{x:q.x-ux*14,y:q.y-uy*14},q],f.color+'66',7);circle(q.x,q.y,f.attackType==='splash'?6:4,f.color);
   if(f.attackType==='poison')for(let i=0;i<3;i++)circle(to.x+Math.cos(i*2)*progress*17,to.y+Math.sin(i*2)*progress*17,4,f.color+'66');
   if(f.attackType==='income'){ctx.fillStyle='#c7a655';ctx.font='15px serif';ctx.textAlign='center';ctx.fillText('◆',q.x,q.y);}
  }
 }else if(f.kind==='breath'){const dx=f.to.x-f.from.x,dy=f.to.y-f.from.y;ctx.translate(f.from.x,f.from.y);ctx.rotate(Math.atan2(dy,dx));const r=f.radius*(.35+.65*progress);ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,r,-Math.PI/5,Math.PI/5);ctx.closePath();ctx.fillStyle=f.color+'33';ctx.fill();ctx.strokeStyle=f.color;ctx.lineWidth=2;ctx.stroke();for(let i=-2;i<=2;i++){const a=i*.2;circle(Math.cos(a)*r*.8,Math.sin(a)*r*.8,4,f.color);} }
 else if(f.kind==='bind'){ctx.translate(f.to.x,f.to.y);ctx.rotate(progress*.5);silhouette([[0,-24],[-17,0],[0,24],[17,0]],f.color+'22',f.color);line([{x:-10,y:-10},{x:10,y:10}],f.color,2);line([{x:10,y:-10},{x:-10,y:10}],f.color,2);}
 else if(f.kind==='lesson'){line([f.from,f.to],f.color+'77',2);circle(f.to.x,f.to.y,18+progress*16,null,f.color);runeGlyph(f.glyph,f.to.x,f.to.y-35,10);ctx.fillStyle=f.color;ctx.font='11px system-ui';ctx.textAlign='center';ctx.fillText(f.name,f.to.x,f.to.y-52-progress*9);}
 else if(f.kind==='cast')circle(f.from.x,f.from.y,12+progress*15,null,f.color+'77');
 else if(f.kind==='blast'){circle(f.to.x,f.to.y,(f.radius||65)*progress,f.color+'15',f.color);circle(f.to.x,f.to.y,(f.radius||65)*progress*.7,null,f.color+'66');}
 else if(f.kind==='upgrade'){
  const p=f.to;circle(p.x,p.y,30+progress*45,null,'#c3a052');circle(p.x,p.y,22+progress*28,'#e2c36a22','#f2d48c');
  for(let i=0;i<10;i++){const angle=i*Math.PI/5;circle(p.x+Math.cos(angle)*(25+progress*38),p.y+Math.sin(angle)*(25+progress*38)-progress*15,2.5,'#ba9047');}
  ctx.fillStyle='#94713b';ctx.font='bold 21px serif';ctx.textAlign='center';ctx.fillText('升级 · '+f.level+'级',p.x,p.y-48-progress*25);
 }else if(f.kind==='coin'){ctx.fillStyle='#b38b35';ctx.font='bold 18px serif';ctx.textAlign='center';ctx.fillText('+'+f.amount+' 墨',f.to.x,f.to.y-20-progress*25);}
 else if(f.kind==='pop'){for(let i=0;i<5;i++){const angle=i*1.257;circle(f.to.x+Math.cos(angle)*progress*24,f.to.y+Math.sin(angle)*progress*24,2,f.color);}}
 else if(f.kind==='rain'){ctx.fillStyle='#f6f0d155';ctx.fillRect(0,0,900,520);for(let i=0;i<24;i++)line([{x:i*43,y:(i*67+progress*460)%520-70},{x:i*43-25,y:(i*67+progress*460)%520}],'#9c8050',2);}
 ctx.restore();
 if(decorate&&['bolt','cast','breath'].includes(f.kind))semanticAttackArt(f,progress);
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
const BOSS_COLORS={hillboss:'#9b7950',bambooboss:'#548262',scrollboss:'#9c82ac',tideboss:'#539eaa',cloudboss:'#789aaf',gearboss:'#b28a4c',frostlord:'#86b4c8',mirrorqueen:'#b17da9',beaconlord:'#bd7a4f',astralboss:'#9a87bd',boss:'#b46b49',ironboss:'#aa8050',broodqueen:'#986aa6',stormboss:'#518eae',frostboss:'#699da9',inkking:'#b95862'};
for(const [kind,data]of Object.entries(ENEMIES))if(data.boss&&data.color)BOSS_COLORS[kind]=data.color;
function silhouette(points,fill,stroke){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}
function drawMapBoss(e,time){
 const index=bossChapter(e.kind),unit=THEME_UNITS[index].kind,color=BOSS_COLORS[e.kind];
 ctx.save();ctx.scale(1.85,1.85);minionBody({...e,kind:unit,shellHits:e.kind==='frostlord'?Math.floor((e.shellHits||0)/2):e.shellHits},time);ctx.restore();
 if(e.kind==='hillboss'){for(const side of [-1,1])silhouette([[side*22,-24],[side*41,-38],[side*42,-10],[side*25,-4]],'#8d7d68','#c5b58e');}
 if(e.kind==='bambooboss'){for(const side of [-1,1])line([{x:side*20,y:5},{x:side*52,y:-31}],'#d5ddba',4);ctx.setLineDash([4,8]);circle(0,0,54,null,color);ctx.setLineDash([]);}
 if(e.kind==='scrollboss'){for(const side of [-1,1]){ctx.save();ctx.translate(side*44,-5);ctx.rotate(side*.25);ctx.fillStyle='#dfd1b8';ctx.fillRect(-9,-26,18,52);for(let i=0;i<5;i++)line([{x:-5,y:-17+i*9},{x:5,y:-17+i*9}],color,1.5);ctx.restore();}line([{x:-45,y:29},{x:0,y:41},{x:45,y:29}],color,3);}
 if(e.kind==='tideboss'){for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(0,28+i*8,42+i*8,7,0,0,7);ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();}silhouette([[-27,-18],[-37,-35],[-19,-25]],'#9fc9c8');}
 if(e.kind==='cloudboss'){for(const side of [-1,1])line([{x:side*35,y:-24},{x:side*69,y:-12},{x:side*47,y:4}],'#dedcc8',4);circle(0,-18,30,null,'#d7c398');}
 if(e.kind==='gearboss'){for(const [x,y]of[[-39,-24],[35,26]]){ctx.save();ctx.translate(x,y);ctx.rotate(game.time*.6);for(let i=0;i<6;i++){const a=i*Math.PI/3;line([{x:Math.cos(a)*10,y:Math.sin(a)*10},{x:Math.cos(a)*17,y:Math.sin(a)*17}],color,5);}circle(0,0,9,'#56685f','#d9bd80');ctx.restore();}}
 if(e.kind==='frostlord'){for(const side of [-1,1])line([{x:side*13,y:-26},{x:side*27,y:-52},{x:side*39,y:-46},{x:side*35,y:-64}],'#cbe6e9',3);}
 if(e.kind==='mirrorqueen'){for(let i=0;i<4;i++){const a=i*Math.PI/2+game.time*.2;ctx.save();ctx.translate(Math.cos(a)*48,Math.sin(a)*38);ctx.rotate(a);silhouette([[0,-15],[-9,0],[0,15],[9,0]],'#e4d6e866',color);ctx.restore();}}
 if(e.kind==='beaconlord'){silhouette([[25,-50],[32,-68],[37,-57],[41,-72],[47,-50],[36,-42]],'#d6924e');line([{x:-27,y:35},{x:-39,y:-45}],'#d8c39a',4);}
 if(e.kind==='astralboss'){for(const [side,label]of[[-1,'日'],[1,'月']]){circle(side*47,Math.sin(game.time)*8,10,side<0?'#bf9958':'#8f89be','#e4d4aa');ctx.fillStyle='#f3e3bc';ctx.font='12px serif';ctx.textAlign='center';ctx.fillText(label,side*47,Math.sin(game.time)*8+4);}}
 silhouette([[-18,-43],[-23,-59],[-7,-50],[0,-65],[7,-50],[23,-59],[18,-43]],'#bda060','#ead3a3');
}
function drawExpandedBoss(e,time){
 const data=ENEMIES[e.kind],color=BOSS_COLORS[e.kind],shape=data.ornament;
 if(shape==='whale'){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(-3,2,48,25,-.08,0,7);ctx.fill();silhouette([[32,-4],[59,-28],[57,-5],[64,18],[32,9]],color,'#cfe1d9');silhouette([[-13,12],[-33,40],[-4,28],[11,20]],'#74a0af','#d0dfd8');ctx.beginPath();ctx.ellipse(-17,14,25,9,-.05,0,Math.PI);ctx.fillStyle='#c7d9d7';ctx.fill();circle(-32,-3,3,'#f5e5bd');line([{x:-43,y:8},{x:-30,y:12},{x:-18,y:12}],'#7296a3',2);}else{ctx.save();ctx.scale(1.8,1.8);minionBody({...e,kind:data.portraitUnit,shellHits:Math.floor((e.shellHits||0)/(shellLimitForArt(e)/3))},time);ctx.restore();}
 const orb=(x,y,r=9)=>circle(x,y,r,color+'55',color);
 if(['armor','shell'].includes(shape)){silhouette([[-29,-25],[-44,-9],[-32,30],[0,41],[32,30],[44,-9],[29,-25]],color+'77','#d7c6a1');for(const y of [-8,5,18])line([{x:-22,y},{x:0,y:y+8},{x:22,y}],color,3);}
 if(['drum','pearl'].includes(shape)){ctx.fillStyle=shape==='pearl'?'#d9dfca':'#a77c57';ctx.beginPath();ctx.ellipse(0,7,25,19,0,0,7);ctx.fill();circle(0,7,15,null,'#ead4a8');if(shape==='drum')for(const side of [-1,1])line([{x:side*33,y:-15},{x:side*9,y:4}],'#dcc8a1',4);else orb(0,6,12);}
 if(['blades','staff','ballista'].includes(shape)){for(const side of [-1,1]){line([{x:side*19,y:29},{x:side*47,y:-42}],'#d5d8c1',4);if(shape==='ballista')line([{x:side*50,y:-35},{x:side*32,y:-48},{x:side*20,y:-31}],color,4);}if(shape==='staff')orb(44,-43,11);}
 if(['tree','spores'].includes(shape)){for(const side of [-1,1])line([{x:side*13,y:-18},{x:side*35,y:-41},{x:side*53,y:-30}],color,4);for(let i=0;i<6;i++){const a=i*Math.PI/3;orb(Math.cos(a)*45,Math.sin(a)*33,shape==='tree'?11:6);}}
 if(['flame','warbanner'].includes(shape)){for(let i=0;i<5;i++){const x=(i-2)*14,h=22+Math.sin(time*.005+i)*9;silhouette([[x-8,24],[x-3,24-h],[x+3,15-h],[x+9,24]],color+'aa','#dfb479');}if(shape==='warbanner'){line([{x:41,y:34},{x:41,y:-55}],color,4);silhouette([[41,-54],[72,-44],[59,-31],[72,-20],[41,-26]],color,'#e3c892');}}
 if(['pages','cage','ribbons'].includes(shape)){for(const side of [-1,1]){ctx.save();ctx.translate(side*40,-2);ctx.rotate(side*.2);ctx.fillStyle=shape==='pages'?'#e1d6bc':color+'66';ctx.fillRect(-7,-26,14,52);line([{x:-5,y:-18},{x:5,y:-18},{x:-5,y:0},{x:5,y:18}],color,2);ctx.restore();}if(shape==='cage')for(const x of [-28,-10,10,28])line([{x,y:-37},{x,y:32}],color+'aa',2);}
 if(['lightning','icewings','crystal'].includes(shape)){for(const side of [-1,1]){const x=side*27;silhouette([[x,-6],[side*52,-37],[side*47,0],[side*60,16],[side*30,22]],shape==='lightning'?'#c8c7a8':color+'99','#d9e6df');}if(shape==='lightning')line([{x:0,y:-38},{x:-9,y:-18},{x:10,y:-21},{x:0,y:0}],'#efdb91',3);}
 if(['clock','mirrors'].includes(shape)){for(let i=0;i<4;i++){const a=i*Math.PI/2+game.time*.25;ctx.save();ctx.translate(Math.cos(a)*46,Math.sin(a)*38);ctx.rotate(a);if(shape==='clock'){orb(0,0,11);line([{x:0,y:-8},{x:0,y:0},{x:6,y:3}],'#ead9b4',2);}else silhouette([[0,-13],[-8,0],[0,13],[8,0]],'#e3d9e477',color);ctx.restore();}}
 if(shape==='whale'){line([{x:0,y:-34},{x:-6,y:-49},{x:1,y:-58},{x:6,y:-46}],color,3);}
 if(shape==='sun'){for(let i=0;i<12;i++){const a=i*Math.PI/6;line([{x:Math.cos(a)*37,y:Math.sin(a)*37},{x:Math.cos(a)*54,y:Math.sin(a)*54}],color,3);}}
 if(shape==='moon'){circle(0,-8,45,null,color);ctx.beginPath();ctx.arc(0,-8,45,-1.6,1.6);ctx.arc(-10,-8,36,1.2,-1.2,true);ctx.fillStyle=color+'77';ctx.fill();}
 if(hasIceShell(e)){silhouette([[0,-49],[-41,-20],[-41,23],[0,48],[41,23],[41,-20]],'#b6dbe333','#d4e8e8');}
 silhouette([[-18,-46],[-23,-61],[-6,-52],[0,-68],[6,-52],[23,-61],[18,-46]],'#c3a16b','#ead3a1');
}
function shellLimitForArt(e){return ENEMIES[e.kind].shellLimit||3;}
function drawBossPresence(e,time){
 const p=enemyPosition(e),a=bossAura(e.kind),power=bossPower(e.kind),disabled=e.freezeUntil>game.time||e.silencedUntil>game.time;
 ctx.save();ctx.globalAlpha=disabled?.18:1;
 circle(p.x,p.y,a.radius,a.color+'0c',a.color+'44');ctx.setLineDash([12,9]);circle(p.x,p.y,a.radius-8,null,a.color+'66');ctx.setLineDash([]);
 const angle=reducedMotion.matches?0:time*.00035;for(let i=0;i<6;i++){const q=angle+i*Math.PI/3;ctx.font='bold 19px serif';ctx.textAlign='center';ctx.fillStyle=a.color+'99';ctx.fillText(i%2?a.sigil:'阵',p.x+Math.cos(q)*(a.radius-20),p.y+Math.sin(q)*(a.radius-20)+6);}
 if(!disabled)for(const ally of game.enemies){if(ally.hp<=0||ENEMIES[ally.kind].boss)continue;const q=enemyPosition(ally);if(Math.hypot(q.x-p.x,q.y-p.y)>a.radius)continue;circle(q.x,q.y,21,null,a.color+'bb');if(a.regen>.003&&!(ally.poisonUntil>game.time||ally.healBlockUntil>game.time)){line([{x:q.x-4,y:q.y-28},{x:q.x+4,y:q.y-28}],a.color,2);line([{x:q.x,y:q.y-32},{x:q.x,y:q.y-24}],a.color,2);}}
 if(e.bossStrikeAt>game.time){const progress=Math.max(0,1-(e.bossStrikeAt-game.time)/power.windup);circle(p.x,p.y,power.range,a.color+'0c',a.color+'aa');circle(p.x,p.y,48+progress*65,null,a.color+'bb');
  for(const id of e.bossTargets||[]){const t=game.towers.find(t=>t.id===id);if(!t)continue;const q=PADS[t.pad];line([p,q],a.color+'88',3);circle(q.x,q.y,39,a.color+'20',a.color);ctx.beginPath();ctx.arc(q.x,q.y,44,-Math.PI/2,-Math.PI/2+progress*Math.PI*2);ctx.strokeStyle=a.color;ctx.lineWidth=4;ctx.stroke();ctx.font='bold 17px serif';ctx.fillStyle=a.color;ctx.textAlign='center';ctx.fillText('危',q.x,q.y-46);}
 }
 ctx.restore();
}
function drawBoss(e,time,labels=true){
 const color=BOSS_COLORS[e.kind],pulse=1+Math.sin(time*.004)*.05;
 ctx.save();ctx.scale(pulse*1.13,pulse*1.13);circle(0,0,42,null,color+'66');circle(0,0,48+Math.sin(time*.003)*3,null,color+'24');
 if(ENEMIES[e.kind].portraitUnit){drawExpandedBoss(e,time);}
 else if(MAP_BOSSES.includes(e.kind)){drawMapBoss(e,time);}
 else if(e.kind==='ironboss'){
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
 if(!labels)return;
 const font=Math.max(14,8*dpr/boardScale);ctx.font=`600 ${font}px system-ui`;ctx.textAlign='center';const title=(e.enraged?'狂暴 · ':'首领 · ')+ENEMIES[e.kind].name,labelWidth=ctx.measureText(title).width;
 ctx.fillStyle='#f8f0dfed';ctx.fillRect(-labelWidth/2-5,-70-font,labelWidth+10,font+7);ctx.fillStyle=color;ctx.fillText(title,0,-68);
 ctx.fillStyle='#d4cab3';ctx.fillRect(-34,-61,68,5);ctx.fillStyle=color;ctx.fillRect(-34,-61,68*Math.max(0,e.hp/e.maxHp),5);
 if(e.bossStrikeAt>game.time){ctx.font=`bold ${Math.max(17,10*dpr/boardScale)}px serif`;ctx.textAlign='center';ctx.strokeStyle='#fff4dd';ctx.lineWidth=5;ctx.strokeText(bossPower(e.kind).name+' · 蓄力',0,82);ctx.fillStyle=color;ctx.fillText(bossPower(e.kind).name+' · 蓄力',0,82);}
 const readyIn=e.pulseAt-game.time;
 if(bossWindup(e)){
  circle(0,0,52+(1-readyIn)*9,null,color+'bb');ctx.font='600 13px system-ui';ctx.fillStyle=color;ctx.fillText(bossSkillName(e.kind)+'蓄势',0,61);
 }

}
function variantMinion(e,time){
 const data=ENEMIES[e.kind],color=data.color,shape=data.trim;
 ctx.save();minionBody({...e,kind:data.sprite,paintColor:color,shellHits:data.shellLimit?Math.floor((e.shellHits||0)/(data.shellLimit/3)):e.shellHits},time);ctx.restore();
 const plate=(x=0,y=0)=>silhouette([[x-8,y-9],[x+8,y-9],[x+7,y+4],[x,y+10],[x-7,y+4]],color+'99','#d7d4b5');
 if(['shield','warshield'].includes(shape)){plate(-16,1);if(shape==='warshield'){line([{x:16,y:18},{x:16,y:-33}],color,2);silhouette([[16,-32],[36,-25],[16,-17]],color,'#dfc69c');}}
 if(shape==='helmet'){silhouette([[-14,-10],[-9,-24],[0,-28],[9,-24],[14,-10]],color,'#d5d8bc');line([{x:-11,y:-11},{x:11,y:-11}],'#dac796',2);}
 if(['bat','glider','shard'].includes(shape)){for(const side of [-1,1]){silhouette([[side*8,-7],[side*36,-23],[side*29,-3],[side*36,8],[side*11,5]],color+'88','#c8d7d3');if(shape==='shard')line([{x:side*8,y:-7},{x:side*28,y:-17},{x:side*20,y:3}],'#e5d4eb',1.5);}if(shape==='glider'){ctx.beginPath();ctx.ellipse(0,-19,29,9,0,Math.PI,Math.PI*2);ctx.strokeStyle='#e7d6a5';ctx.lineWidth=2;ctx.stroke();}}
 if(shape==='shell'){silhouette([[0,-24],[-18,-13],[-18,10],[0,24],[18,10],[18,-13]],color+'bb','#cbdadb');for(const y of [-9,0,9])line([{x:-15,y},{x:0,y:y+5},{x:15,y}],color,2);}
 if(shape==='horn'){line([{x:16,y:0},{x:32,y:-14},{x:35,y:-27}],color,4);circle(33,-26,7,'#d6c28e',color);}
 if(['flame','spark','meteor'].includes(shape)){const glyph=shape==='meteor'?'sky':'ember';runeGlyph(glyph,0,-27,9);for(const side of [-1,1])line([{x:side*6,y:14},{x:side*21,y:23},{x:side*28,y:18}],color+'bb',2);}
 if(shape==='spores'){for(let i=0;i<5;i++){const a=i*Math.PI*.4;circle(Math.cos(a)*21,Math.sin(a)*22,4,color+'66','#c0cc8f');}}
 if(shape==='pennant'){line([{x:19,y:23},{x:19,y:-34}],color,2);silhouette([[19,-33],[39,-25],[30,-19],[39,-11],[19,-14]],color,'#e1d2a8');}
 if(shape==='rock'){for(const side of [-1,1])silhouette([[side*8,-13],[side*12,-33],[side*20,-21],[side*28,-11]],color,'#cbb99c');line([{x:-17,y:3},{x:-4,y:-3},{x:12,y:8}],'#d6c9ab',2);}
 if(shape==='gust'){for(const side of [-1,1])line([{x:side*10,y:10},{x:side*22,y:25},{x:side*30,y:18}],color,2);runeGlyph('tempo',0,-29,8);}
 if(shape==='leaves'){for(const side of [-1,1]){line([{x:side*12,y:0},{x:side*25,y:-29}],color,2);silhouette([[side*20,-13],[side*36,-20],[side*28,-5]],color+'bb','#b8d19b');}runeGlyph('mend',0,-28,6);}
 if(shape==='dart'){for(const side of [-1,1])silhouette([[side*14,11],[side*23,-10],[side*30,-15],[side*27,-3]],'#c9d5ac',color);}
 if(shape==='pages'){for(const side of [-1,1]){ctx.save();ctx.translate(side*22,-3);ctx.rotate(side*.4);ctx.fillStyle='#ddd0b9';ctx.fillRect(-7,-17,14,34);line([{x:-3,y:-10},{x:3,y:-10},{x:-3,y:0},{x:3,y:10}],color,1.4);ctx.restore();}}
 if(shape==='brush'){line([{x:22,y:20},{x:22,y:-18}],color,3);silhouette([[17,-18],[22,-34],[27,-18]],'#d2cbb1',color);runeGlyph('study',-18,1,7);}
 if(shape==='splash'){runeGlyph('tide',0,-25,9);for(const side of [-1,1])circle(side*24,14,4,'#9ec4c955',color);}
 if(shape==='pearl'){for(let i=-2;i<=2;i++)line([{x:i*5,y:17},{x:i*9,y:-11-Math.abs(i)*2}],color,3);circle(0,5,8,'#ece0bd',color);}
 if(shape==='cloud'){for(const [x,y,r]of[[-15,9,10],[0,11,13],[15,9,10],[-7,-25,8],[7,-25,8]])circle(x,y,r,color+'55','#c9dde1');}
 if(shape==='bolt')runeGlyph('storm',0,-24,11);
 if(shape==='wheel'){for(const x of [-17,17]){circle(x,17,9,'#596d65','#d0b573');for(let i=0;i<4;i++){const a=i*Math.PI/2+time*.002;line([{x,y:17},{x:x+Math.cos(a)*8,y:17+Math.sin(a)*8}],color,2);}}}
 if(shape==='veil'){ctx.strokeStyle=color+'99';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,1,25,29,-.1,Math.PI*.9,Math.PI*2.4);ctx.stroke();runeGlyph('frost',0,-28,7);}
 if(shape==='iceclaws'){for(const side of [-1,1])silhouette([[side*14,0],[side*36,-10],[side*31,5],[side*39,18],[side*17,14]],'#c0dce0aa',color);runeGlyph('frost',0,-21,8);}
 if(shape==='mirror'){for(const side of [-1,1])silhouette([[side*23,-20],[side*34,-4],[side*23,12],[side*12,-4]],'#e1d6e688',color);}
 if(shape==='orbit'){circle(0,0,27,null,color+'aa');for(let i=0;i<3;i++){const a=i*Math.PI*2/3;circle(Math.cos(a)*27,Math.sin(a)*27,5,'#ded5ea',color);}}
}

function minionBody(e,time){
 if(ENEMIES[e.kind].sprite){variantMinion(e,time);return;}
 const data=ENEMIES[e.kind],type=e.kind,color=e.paintColor||data.color||({normal:'#48574c',swift:'#6b8c63',armor:'#727c76',flying:'#638ea6',tank:'#796854',shield:'#687f9c',regen:'#719864',split:'#936f97',small:'#6e7d65',lancer:'#a87d51',healer:'#799b6c',banner:'#a28e55',ward:'#8c83a7',brood:'#9c806c'}[type]),ink='#343f3d';
 const eyes=(y=-5)=>{ctx.fillStyle='#f5e7bd';ctx.fillRect(-7,y,3,3);ctx.fillRect(4,y,3,3);};
 const badge=(label)=>{ctx.fillStyle='#f0e5ca';ctx.font='bold 11px serif';ctx.textAlign='center';ctx.fillText(label,0,12);};
 if(type==='normal'||type==='small'){
  const r=type==='small'?7:11;silhouette([[0,-r-4],[-r,-2],[-r,7],[-5,13],[0,9],[6,13],[r,6],[r,-3]],color);eyes(-2);
 }else if(type==='swift'||type==='hillrunner'){
  line([{x:-12,y:8},{x:-22,y:18},{x:-5,y:17}],color,4);line([{x:9,y:8},{x:21,y:12},{x:15,y:22}],color,4);
  ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(0,0,16,11,-.2,0,7);ctx.fill();silhouette([[4,-6],[17,-14],[24,-4],[16,3]],color);
  if(type==='hillrunner'){circle(-13,-8,7,color);line([{x:-10,y:-11},{x:-22,y:-20}],color,3);badge('跃');}else{line([{x:-25,y:-3},{x:-17,y:-3}],'#a5b890',2);line([{x:-28,y:3},{x:-19,y:3}],'#a5b890',2);}eyes(-4);
 }else if(type==='armor'||type==='clockwork'){
  silhouette([[-15,-15],[0,-23],[15,-15],[19,10],[0,24],[-19,10]],color,'#c4c9b5');
  if(type==='clockwork'){for(let i=0;i<8;i++){const angle=i*Math.PI/4;line([{x:Math.cos(angle)*16,y:Math.sin(angle)*16},{x:Math.cos(angle)*23,y:Math.sin(angle)*23}],color,5);}circle(0,0,12,'#53625c','#d5b778');badge('机');const here=enemyPosition(e),ahead=enemyPosition({...e,d:e.d+4});ctx.save();ctx.rotate(Math.atan2(ahead.y-here.y,ahead.x-here.x));silhouette([[17,-17],[25,-12],[25,12],[17,17]],'#ceaa63','#ead6a1');ctx.restore();}
  else{silhouette([[-11,-11],[11,-11],[8,11],[0,18],[-8,11]],'#596b64','#c9c6a6');line([{x:-4,y:1},{x:4,y:1}],'#d3c8a3',3);}eyes(-10);
 }else if(type==='flying'||type==='cloudraptor'){
  const flap=Math.sin(time*.01+e.id)*3,wing=type==='cloudraptor'?32:24;
  for(const side of [-1,1])silhouette([[0,-7],[side*wing,-17-flap],[side*(wing-5),-2],[side*(wing-2),7],[side*10,3]],color,'#aacad1');
  silhouette([[0,-17],[-10,1],[0,19],[10,1]],ink);silhouette([[3,-13],[15,-8],[4,-5]],'#d5b77a');
  if(type==='cloudraptor'){line([{x:-5,y:18},{x:-11,y:29},{x:1,y:24}],'#86b7c9',2);if(e.diveUntil>game.time)line([{x:-35,y:6},{x:-22,y:6}],color,3);}eyes(-9);
 }else if(type==='tank'||type==='frostbeast'){
  ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(-20,-19,40,37,9);ctx.fill();line([{x:-19,y:-7},{x:-28,y:13}],color,8);line([{x:19,y:-7},{x:28,y:13}],color,8);
  silhouette([[-20,-12],[-26,-28],[-12,-21],[12,-21],[26,-28],[20,-12]],color);
  if(type==='frostbeast'&&(e.shellHits||0)<3){silhouette([[-23,-6],[-14,-24],[8,-26],[24,-5],[14,19],[-13,20]],'#b1d4dc55','#cceaf0');for(const x of [-12,0,12])line([{x,y:-19},{x:x+4,y:-7}],'#e1f2ef',1.5);}else if(type==='tank')badge('重');eyes(-8);
 }else if(['healer','ward','tideshaper','regen'].includes(type)){
  silhouette([[0,-19],[-12,-6],[-18,20],[0,14],[18,20],[12,-6]],color,'#c5d1af');circle(0,-11,9,ink);eyes(-12);
  if(type==='healer'||type==='regen'){line([{x:-4,y:3},{x:4,y:3}],'#e1efb8',3);line([{x:0,y:-1},{x:0,y:7}],'#e1efb8',3);if(type==='healer')line([{x:23,y:-22},{x:23,y:20}],'#a1b285',2);}
  if(type==='ward'){silhouette([[0,-30],[-7,-24],[0,-18],[7,-24]],'#d1c5df',color);circle(0,3,23,null,color+'88');}
  if(type==='tideshaper'){line([{x:22,y:20},{x:22,y:-20}],color,3);circle(22,-23,6,'#a2d6dc','#d3e7d7');for(let i=0;i<2;i++){ctx.beginPath();ctx.ellipse(0,17+i*5,25+i*5,4,0,0,7);ctx.strokeStyle=color+'77';ctx.stroke();}}
 }else if(type==='banner'||type==='beaconrunner'||type==='lancer'){
  circle(-3,-10,8,color);silhouette([[-11,0],[7,0],[10,18],[-15,18]],color);line([{x:1,y:15},{x:9,y:25}],color,3);line([{x:-9,y:15},{x:-16,y:25}],color,3);
  line([{x:14,y:21},{x:14,y:-30}],color,2.5);
  if(type==='lancer')silhouette([[14,-37],[9,-23],[19,-23]],'#d1c7a7',color);
  else{silhouette([[14,-31],[38,-25],[30,-19],[39,-12],[14,-15]],color,'#d5c398');if(type==='beaconrunner')silhouette([[23,-22],[26,-34],[31,-24],[28,-18]],'#e3a45e');}eyes(-12);
 }else if(type==='shield'||type==='scrollguard'){
  circle(0,-7,13,color);silhouette([[-13,1],[-17,17],[0,24],[17,17],[13,1]],color);
  if(type==='shield')silhouette([[-14,-8],[14,-8],[12,13],[0,22],[-12,13]],'#819ab2','#c2d6da');
  else{ctx.fillStyle='#e1d5ba';ctx.fillRect(-18,-3,36,20);for(const x of [-18,18]){circle(x,-4,3,color);circle(x,18,3,color);line([{x,y:-4},{x,y:18}],color,3);}for(const y of [3,9,14])line([{x:-9,y},{x:9,y}],color,1.5);}eyes(-11);
 }else if(type==='split'||type==='brood'){
  ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(0,1,type==='brood'?17:14,20,0,0,7);ctx.fill();
  if(type==='brood')for(const side of [-1,1])for(let i=0;i<3;i++)line([{x:side*10,y:-6+i*9},{x:side*23,y:-9+i*13}],color,3);
  else line([{x:0,y:-17},{x:-5,y:-4},{x:5,y:4},{x:0,y:18}],'#e7cadb',2);eyes(-7);
 }else if(type==='bamboostalker'){
  if(!(e.lightUntil>game.time)&&!(e.markUntil>game.time)&&!(e.breakUntil>game.time)&&!game.towers.some(t=>Math.hypot(PADS[t.pad].x-enemyPosition(e).x,PADS[t.pad].y-enemyPosition(e).y)<=130))ctx.globalAlpha*=.65;
  silhouette([[0,-25],[-14,-6],[-17,19],[0,11],[17,19],[13,-5]],color,'#adc19e');silhouette([[-16,-10],[0,-25],[18,-10]],'#486c4c');circle(0,-6,8,ink);eyes(-8);line([{x:13,y:5},{x:27,y:-8}],'#c6d3b6',2);silhouette([[0,-26],[8,-37],[13,-34]],'#84a674');
 }else if(type==='mirrorling'){
  if(e.isCopy)ctx.globalAlpha*=.58;
  silhouette([[0,-25],[-17,-8],[-14,17],[0,26],[14,17],[17,-8]],'#d2b9d455',color);circle(0,-3,13,color);silhouette([[-10,-7],[0,-14],[10,-7],[8,8],[0,13],[-8,8]],'#f0ddea');eyes(-4);circle(0,0,24,null,color+'88');
 }else if(type==='astral'){
  const lunar=astralPhase(e,game.time)===1;circle(0,0,17,lunar?'#7c75af':'#b19457','#d8c8a5');ctx.save();ctx.rotate(game.time*.8);ctx.beginPath();ctx.ellipse(0,0,28,9,-.4,0,7);ctx.strokeStyle='#c6b4dd';ctx.lineWidth=1.5;ctx.stroke();circle(27,0,3,'#e4d3ab');ctx.restore();ctx.fillStyle='#f4e5bb';ctx.font='16px serif';ctx.textAlign='center';ctx.fillText(lunar?'月':'日',0,6);
 }
}
function drawEnemy(e,time){
 const p=enemyPosition(e),boss=ENEMIES[e.kind].boss;ctx.save();ctx.translate(p.x,p.y+(reducedMotion.matches?0:Math.sin(time*.009+e.id)*2));
 if(!reducedMotion.matches){const weapon=enemyWeapon(e.kind),target=game.towers.find(t=>t.id===(e.towerTarget??e.towerLastTarget));if(target){const q=PADS[target.pad],dx=q.x-p.x,dy=q.y-p.y,len=Math.hypot(dx,dy)||1,remaining=e.towerStrikeAt-game.time,elapsed=game.time-((e.towerAttackAt||0)-weapon.interval),motion=e.towerTarget!==undefined?Math.max(0,1-remaining/weapon.windup)*-4:elapsed>=0&&elapsed<.4?Math.sin(elapsed/.4*Math.PI)*(boss?15:9):0;ctx.translate(dx/len*motion,dy/len*motion);}}

 if(boss){ctx.fillStyle='#383e3929';ctx.beginPath();ctx.ellipse(2,36,40,12,0,0,7);ctx.fill();drawBoss(e,time);ctx.restore();return;}
 const r=['tank','frostbeast','clockwork'].includes(e.kind)?21:e.kind==='small'?7:15;
 ctx.fillStyle='#44534122';ctx.beginPath();ctx.ellipse(2,r,r,5,0,0,7);ctx.fill();minionBody(e,time);
 if(e.enraged)circle(0,0,r+9,null,'#be8d5a99');if(hasIceShell(e)&&ENEMIES[e.kind].sprite)circle(0,0,r+5,null,'#b2d9df');if(e.shield>0)circle(0,0,r+6,null,'#8eacd2');
 if(e.poisonUntil>game.time||e.slowUntil>game.time)circle(0,0,r+3,null,e.poisonUntil>game.time?'#91a158':'#94c6d3');
 if(e.bleedUntil>game.time)line([{x:-r,y:r+3},{x:-r+5,y:r+8},{x:-r+8,y:r+2}],'#b46562',2);
 if(e.silencedUntil>game.time){circle(r,-r,6,'#765b85');line([{x:r-3,y:-r-3},{x:r+3,y:-r+3}],'#efdfed',2);}
 if(e.markUntil>game.time||e.lightUntil>game.time||e.bountyUntil>game.time)circle(0,0,r+8,null,e.markUntil>game.time?'#ae75a1':e.lightUntil>game.time?'#cfb75d':'#ba944f');
 if(e.breakUntil>game.time){line([{x:-r-2,y:-6},{x:-5,y:2},{x:4,y:-3},{x:r+3,y:6}],'#c58e58',2);}
 if(e.guardUntil>game.time)circle(0,0,r+9,null,'#739caca0');
 if(e.jamUntil>game.time){circle(0,0,r+10,null,'#9677a2aa');ctx.fillStyle='#81618d';ctx.font='11px system-ui';ctx.textAlign='center';ctx.fillText('扰',r+9,-r-3);}
 if(e.rallyUntil>game.time){silhouette([[0,-r-12],[-4,-r-5],[4,-r-5]],'#c77949');}
 if(e.hp<e.maxHp){ctx.fillStyle='#a8b099';ctx.fillRect(-16,-r-13,32,3);ctx.fillStyle='#768c68';ctx.fillRect(-16,-r-13,32*Math.max(0,e.hp/e.maxHp),3);}ctx.restore();
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
 for(const zone of game.zones){const color=zone.kind==='fire'?'#c76e3e':zone.kind==='net'?'#7c9971':'#7c934d';circle(zone.x,zone.y,zone.radius,color+'18',color+'88');ctx.save();ctx.translate(zone.x,zone.y);for(let i=0;i<8;i++){const a=i*2.399,x=Math.cos(a)*zone.radius*.65,y=Math.sin(a)*zone.radius*.55;if(zone.kind==='net'){line([{x:x-9,y:y-9},{x:x+9,y:y+9}],color+'88',1);line([{x:x+9,y:y-9},{x:x-9,y:y+9}],color+'88',1);}else if(zone.kind==='poison'){ctx.fillStyle=color+'33';ctx.beginPath();ctx.ellipse(x,y+Math.sin(time*.002+i)*3,18,11,0,0,7);ctx.fill();}else{const height=10+Math.sin(time*.008+i)*4;silhouette([[x-5,y+3],[x-2,y-height],[x+2,y-height*.5],[x+6,y+3]],color+'99');}}ctx.restore();}
 // mountain gate at end of trail
 ctx.save();ctx.translate(Math.min(865,Math.max(35,PATH.at(-1).x)),Math.min(470,Math.max(50,PATH.at(-1).y)));ctx.fillStyle='#a4b295';ctx.fillRect(-20,-28,5,50);ctx.fillRect(15,-28,5,50);ctx.fillStyle='#6e8767';ctx.fillRect(-26,-36,52,8);ctx.fillRect(-22,-18,44,5);ctx.beginPath();ctx.moveTo(-34,-35);ctx.quadraticCurveTo(0,-48,34,-35);ctx.lineTo(26,-29);ctx.lineTo(-26,-29);ctx.fill();ctx.fillStyle='#e9e9d6';ctx.fillRect(-9,-29,18,15);ctx.font='9px serif';ctx.textAlign='center';ctx.fillStyle='#68815e';ctx.fillText('山门',0,-18);ctx.restore();
 for(let i=0;i<PADS.length;i++){const p=PADS[i],t=game.towers.find(t=>t.pad===i),highlight=hover===i;if(t)continue;if(!game.padUnlocked(i)){circle(p.x,p.y,23,'#d9dfd0','#a4af96');ctx.fillStyle='#819071';ctx.font='17px serif';ctx.textAlign='center';ctx.fillText('锁',p.x,p.y+6);continue;}circle(p.x,p.y+4,26,'#bdc9ab33');circle(p.x,p.y,23,placing?'#f7f4df':'#eef0e1','#bbc7a8');circle(p.x,p.y,18,null,placing?'#8b9d75':'#d4dcc7');ctx.strokeStyle=placing?'#8a9b70':'#b5c1a3';ctx.lineWidth=1;line([{x:p.x-5,y:p.y},{x:p.x+5,y:p.y}],ctx.strokeStyle,1);line([{x:p.x,y:p.y-5},{x:p.x,y:p.y+5}],ctx.strokeStyle,1);if(placing||highlight){ctx.setLineDash([3,5]);circle(p.x,p.y,30+(placing?Math.sin(time*.002)*1.5:0),null,'#92a47b');ctx.setLineDash([]);}}
 const sel=game.towers.find(t=>t.id===selected);if(sel){const w=getWord(sel.word),p=PADS[sel.pad];if(w.trait==='ward'){ctx.setLineDash([4,5]);circle(p.x,p.y,towerStats(sel).range*.65,w.color+'12',w.color);ctx.setLineDash([]);}circle(p.x,p.y,towerStats(sel).range,w.color+'0e',w.color+'65');}
 const markedTargets=new Set();for(const e of game.enemies)if(e.hp>0&&e.towerTarget!==undefined)siegeWindup(e,markedTargets);
 for(const e of game.enemies)if(e.hp>0&&ENEMIES[e.kind].boss)drawBossPresence(e,time);
 for(const t of game.towers)drawTower(t);
 for(const e of game.enemies)if(!ENEMIES[e.kind].boss){drawEnemy(e,time);if(e.escortBossId!==undefined){const p=enemyPosition(e);circle(p.x,p.y,23,null,'#b08c4b');ctx.font=`bold ${Math.max(16,9*dpr/boardScale)}px serif`;ctx.fillStyle='#87682f';ctx.textAlign='center';ctx.fillText(e.escortSummoned?'援':'护',p.x,p.y+34);}}
 for(const e of game.enemies)if(ENEMIES[e.kind].boss)drawEnemy(e,time);
 for(const t of game.towers)if(t.disruptedUntil>game.time){const q=PADS[t.pad];circle(q.x,q.y,31,'#8c6c9922','#9262a5');ctx.font='bold 20px serif';ctx.fillStyle='#875997';ctx.textAlign='center';ctx.fillText('封',q.x,q.y+8);}

 const detailBudget=reducedMotion.matches?12:mobileLayout.matches?48:96;for(let i=0;i<game.effects.length;i++)drawEffect(game.effects[i],time,i>=game.effects.length-detailBudget);

}
let last=0,lastUI=0,lastSave=0;function frame(now){const dt=last?Math.min((now-last)/1000,.1):0;last=now;if(document.body.classList.contains('playing')&&!paused&&!$('#modal').open){for(let i=0;i<speed;i++)game.step(dt);}if(game.events.length){const events=game.events.splice(0);for(const e of events){if(e.type==='idiom-cast')sound(({flame:196,toxic:247,frost:880,storm:740,tide:330,purity:988,succession:784,visit:659,barrage:523,erosion:392,seasons:698,borrow:349,roots:494})[e.move]||620,.14);if(e.type==='wave'){save();if(game.plan(game.wave).boss)toast(ENEMIES[game.plan(game.wave).bossKind].name+'压境 · 点击敌情查看机制');}if(e.type==='clear'){toast(e.roundEnd?`第 ${Math.ceil(e.wave/3)} 轮已清，结算 ${e.reward} 墨点`:`第 ${Math.ceil(e.wave/3)} 轮 · ${(e.wave-1)%3+1}/3 波已清，获得 ${e.reward} 墨点`);sound(780,.25);save();renderForge();}if(e.type==='upgrade'){game.effects.push({kind:'upgrade',to:PADS[e.pad],level:e.level,life:1,max:1});sound(784,.14);setTimeout(()=>sound(1047,.18),90);}if(e.type==='repair'){game.effects.push({kind:'tower-repair',to:PADS[e.pad],life:.8,max:.8});sound(610,.09);toast((e.rebuilt?e.word+'已重建':e.word+'已修复')+' · '+e.cost+' 墨点');}if(e.type==='tower-down'){toast(e.word+'损毁，点击废墟可重建');save();renderForge();}if(e.type==='boss-arrive'){toast('首领登场 · '+e.name+' · 护军光环展开');sound(165,.25);setTimeout(()=>sound(110,.3),160);}if(e.type==='boss-cast'){toast(e.name+' · '+e.targets+' 座词塔受威胁');sound(100,.25);}if(e.type==='boss-reinforce')toast(e.name+'召集护卫 · 驰援次数有限');if(e.type==='boss-defeated'){toast(e.name+'已击败 · 护军光环消散');sound(660,.22);}if(e.type==='boss-phase'){toast(e.name+'狂暴 · 大招加速、范围目标增加！');sound(130,.25);}if(e.type==='leak'){sound(150,.14);if(e.blocked)toast('护佑屏障抵挡 '+e.blocked+' 点伤害');}if(e.type==='revive')toast('重生生效 · 山门保留 1 点生命，本局次数已用');if(e.type==='won'||e.type==='lost'){placing=null;selected=null;renderForge();save();result();}}const breaches=events.filter(e=>e.type==='leak'&&e.boss);if(breaches.length){const damage=breaches.reduce((n,e)=>n+e.damage,0),blocked=breaches.reduce((n,e)=>n+e.blocked,0);save();toast((breaches.length>1?'Boss ×'+breaches.length:ENEMIES[breaches[0].enemy].name)+'突破山门 · '+(damage?'爱心 -'+damage:'屏障挡下伤害')+(blocked?' · 屏障抵挡 '+blocked:'')+(events.some(e=>e.type==='revive')?' · 重生保命 1 爱心':''));}}if(now-lastUI>180){updateUI();lastUI=now;}if(now-lastSave>5000){save();lastSave=now;}draw(now);requestAnimationFrame(frame);}
renderForge();updateUI();resize();save();requestAnimationFrame(frame);
