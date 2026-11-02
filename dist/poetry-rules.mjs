import{SCENE_RULES,SCENE_LIFE,poetryMastery}from'./poetry-scene-rules.mjs';
import {POEMS,POEM_LINES} from './poetry-data.mjs';
export {POEMS,POEM_LINES};
export const POEM_INDEX=new Map(POEMS.map(p=>[p.id,p]));
export const VERSE_INDEX=new Map(POEM_LINES.map(l=>[l.word,l]));
export const MAX_WORD_LENGTH=7;
export const POETRY_TECHNIQUE_POWER=.9;
export const POETRY_DRAW_CHANCE=1;
// Retained only for validating legacy save keys; no shared cooldown is executed.
export const FIELD_INTERVALS={allShield:16,allFreeze:18,allMend:18,allHaste:14,allSlow:12,allSilence:14,allWeaken:12,allReveal:10};
export const POETRY_PALETTES={snow:'#88adbc',ice:'#89adb9',frost:'#93a9b9',moon:'#a49ac3',stars:'#b19e6b',star:'#b8a878',sun:'#b69857',sunset:'#c28c67',dawn:'#c5a464',river:'#588f9c',water:'#639ca3',waterfall:'#619eaf',wave:'#527d9c',ripple:'#78a8a9',rain:'#729e98',spring:'#78a079',leaf:'#7e9873',grass:'#8ba376',petal:'#c08b9f',peach:'#c89399',plum:'#b38b9c',lotus:'#b18fa1',bamboo:'#76916d',mountain:'#8a9685',rock:'#9c947e',fire:'#bc7f54',firecracker:'#b97f56',storm:'#a5915e',jade:'#81a397',heart:'#be9990',resolve:'#b69b70',ink:'#7f91a2',scroll:'#aa9c74'};
export const poemPalette=l=>POETRY_PALETTES[l.art]||'#9e9173';
export const POETRY_WORDS=POEM_LINES.map(l=>({word:l.word,type:'poetry',icon:'诗',name:'诗韵',color:poemPalette(l),poem:l.poem,verse:l.word,tier:l.word.length,maxLevel:l.word.length+2,cost:{5:270,6:330,7:400}[l.word.length],damage:{5:110,6:132,7:154}[l.word.length],range:255+(l.word.length-5)*15,rate:1.35,trait:'balanced',runes:[],aura:0,income:0,signature:l.signature.name,tag:l.signature.name,desc:'以墨字攻击单体；每次普攻积蓄 1 点诗韵。蓄满后释放本句独有的诗意绝技。'}));
const pct=n=>Math.round(n*100)+'%';
const opText=([kind,a,b,c],word)=>{const m=poetryMastery(word),power=POETRY_TECHNIQUE_POWER*m.opening;return({
 strike:()=>`对主目标追击 ${a} 次，每次 ${pct(b*power)} 攻击伤害`,burst:()=>`墨意在 ${c} 半径内绽开，最多 ${a} 个敌人各受 ${pct(b*power)} 伤害`,chain:()=>`以 ${c} 距离接续最多 ${a} 个目标，各造成 ${pct(b*power)} 伤害`,fan:()=>`以 ${(c*180/Math.PI*2).toFixed(0)}° 扇面扫过最多 ${a} 敌人，各造成 ${pct(b*power)} 伤害`,line:()=>`贯穿宽度 ${c*2} 的墨线，最多 ${a} 个敌人各受 ${pct(b*power)} 伤害`,sky:()=>`优先追击飞行敌人，最多 ${a} 个各受 ${pct(b*power)} 伤害`,ground:()=>`拦截最多 ${a} 个地面敌人，各造成 ${pct(b*power)} 伤害`,slow:()=>`本次命中的敌人减速 ${pct(1-a)}，持续 ${b} 秒`,freeze:()=>`本次命中的敌人冻结 ${a} 秒`,mark:()=>`本次命中的敌人直伤易伤 ${pct(a)}，持续 ${b} 秒`,burn:()=>`本次命中的敌人灼烧 ${b} 秒，每秒 ${pct(a*power)} 攻击伤害`,silence:()=>`本次命中的敌人缄默 ${a} 秒`,armor:()=>`本次命中的敌人破甲 ${a} 秒`,shred:()=>`本次命中的敌人护盾削减 ${pct(a)}，每名最多削去 3 倍攻击的护盾`,push:()=>`本次命中的敌人沿原路线后退 ${a}；Boss 后退距离为五分之一`,reveal:()=>`本次命中的敌人显形 ${a} 秒`,shield:()=>`为范围内耐久最低的 ${c} 座存活塔提供 ${pct(Math.min(.2,a*m.support))} 最大耐久护盾，持续 ${b} 秒`,heal:()=>`修复范围内耐久最低的 ${b} 座存活塔，各恢复 ${pct(a*m.support)} 最大耐久`,haste:()=>`范围内 ${c} 座存活塔攻速提高 ${pct(Math.min(.25,a*m.support))}，持续 ${b} 秒`,guard:()=>`范围内耐久最低的 ${c} 座存活塔承伤降低 ${pct(Math.min(.2,a*m.support))}，持续 ${b} 秒`,allShield:()=>`全场存活词塔获得 ${pct(Math.min(.2,a*m.support))} 最大耐久护盾，持续 ${b} 秒`,allFreeze:()=>`全场敌人冻结 ${a} 秒`,allSlow:()=>`全场敌人减速 ${pct(1-a)}，持续 ${b} 秒`,allMend:()=>`全场存活词塔修复 ${pct(a*m.support)} 最大耐久；同时清除寒滞与腐蚀`,allReveal:()=>`全场敌人显形 ${a} 秒，破解潜行`,allHaste:()=>`全场存活词塔攻速提高 ${pct(Math.min(.25,a*m.support))}，持续 ${b} 秒`,allSilence:()=>`全场敌人缄默 ${a} 秒，可打断技能蓄力`,allWeaken:()=>`全场敌人攻塔伤害降低 15%，持续 ${a} 秒`
}[kind]());};
export function verseDescription(word){const l=typeof word==='string'?VERSE_INDEX.get(word):word;return `诗境「${l.signature.name}」持续 ${SCENE_LIFE} 秒：${l.signature.program.map(k=>SCENE_RULES[k][1]).join('；')}。每 ${l.charge} 次普攻蓄满诗韵，绝技冷却 ${l.cooldown} 秒。${l.ops.map(op=>opText(op,l.word)).join('；')}。`;}
export const POETRY_CONTROL_NOTE='冻结与缄默对 Boss 的持续时间为四分之一；同目标冻结后有 6 秒间隔。未破的冰壳免疫冻结与减速。同类护盾、攻速和减伤取最强值，不累加；只能修复存活塔，不恢复爱心或重建废墟。';
export function verseStatus(t,time){const l=VERSE_INDEX.get(t.word);return{charge:Math.min(l.charge,t.verseCharge||0),need:l.charge,remaining:Math.max(0,(t.verseReadyAt||0)-time)};}

// Display only rules that can affect this particular verse.
export function versePresentation(word){
 const l=typeof word==='string'?VERSE_INDEX.get(word):word,kinds=new Set(l.ops.map(op=>op[0])),has=(...keys)=>keys.some(k=>kinds.has(k)),notes=[];
 const scene=(...ids)=>ids.some(k=>l.signature.program.includes(k));
 const frozen=has('freeze','allFreeze')||scene('sprout','updraft','lullaby','wall'),silenced=has('silence','allSilence')||scene('silence_watch'),slowed=has('slow','allSlow')||scene('deep_pool','snowdrift','seed','willow','frost_armor','sand','weave','spring_back','scent','mist');
 if(frozen||silenced)notes.push(`Boss 的${[frozen?'冻结':'',silenced?'缄默':''].filter(Boolean).join('、')}时长为 25%。`);
 if(frozen)notes.push('同一敌人冻结后，间隔 6 秒才能再次冻结。');
 if(frozen||slowed)notes.push(`冰壳未破时免疫${[frozen?'冻结':'',slowed?'减速':''].filter(Boolean).join('和')}。`);
 if(silenced)notes.push('同一敌人的缄默触发间隔为 4 秒。');
 const buffs=[has('shield','allShield')||scene('lotus','chorus','return_home','mirror','medicine','frost_armor','clock','oath','cocoon','lantern_chain')?'护盾':'',has('haste','allHaste')||scene('song','rally','wine')?'攻速加成':'',has('guard')||scene('bastion')?'减伤':''].filter(Boolean);
 if(buffs.length)notes.push(`同类诗意${buffs.join('、')}取最强值。`);
 const targets={front:'优先攻击靠近山门的敌人',boss:'优先攻击 Boss',air:'优先攻击飞行敌人',ground:'优先攻击地面敌人',weak:'优先攻击生命比例最低的敌人',rear:'优先攻击后方敌人',nearest:'优先攻击最近的敌人',crowd:'优先攻击密集敌群',shield:'优先攻击护盾最多的敌人',east:'优先攻击东侧敌人',west:'优先攻击西侧敌人',north:'优先攻击北侧敌人',south:'优先攻击南侧敌人'};
 if(l.signature.program.includes('grounding'))notes.push('落羽持续 3 秒，飞行 Boss 为 0.75 秒；同目标间隔 8 秒。');
 if(l.signature.program.some(k=>['waterfall','undertow','eddy','vine','scent','beacon','seasons','horizon_gate'].includes(k)))notes.push('诗境位移对 Boss 的距离为五分之一。');
 if(scene('deep_pool','snowdrift'))notes.push('Boss 的下沉或积雪阻碍每层 5%，最多 15%。');
 return{signatureName:l.signature.name,sceneDuration:SCENE_LIFE,sceneEffects:l.signature.program.map(k=>SCENE_RULES[k][1]),charge:l.charge,cooldown:l.cooldown,targeting:targets[l.aim],effects:l.ops.map(op=>opText(op,l.word).replace('本次命中的敌人','命中敌人')),notes};
}
