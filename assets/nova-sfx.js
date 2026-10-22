/* ZAHTOOL SFX STUDIO v4 — cinematic procedural audio, no external audio files */
(()=>{'use strict';
const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
const KEY='nova-sfx',MODE='nova-sfx-mode',C=window.novaConsole;let on=true,mode='cinematic',ctx,master,comp,filter,paintFn,lastHover=null,lastType=0;
try{on=(C?C.sfxEnabled():localStorage.getItem(KEY)!=='off');mode=localStorage.getItem(MODE)||'cinematic'}catch(e){}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function init(){if(ctx)return ctx;ctx=new AC();master=ctx.createGain();filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=15000;comp=ctx.createDynamicsCompressor();comp.threshold.value=-22;comp.knee.value=18;comp.ratio.value=4;comp.attack.value=.004;comp.release.value=.22;master.gain.value=.48;filter.connect(comp);comp.connect(ctx.destination);master.connect(filter);return ctx}
function ready(){if(!on||(C&&C.slug&&!C.toolSfx(C.slug)))return false;init();master.gain.setTargetAtTime(.48*(C?C.vol():1),ctx.currentTime,.025);if(ctx.state==='suspended')ctx.resume();return true}
function env(g,t,d,v,attack=.008){g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,v),t+attack);g.gain.exponentialRampToValueAtTime(.0001,t+d)}
function tone(f,d=.12,type='sine',v=.1,to=null,delay=0,pan=0){const t=ctx.currentTime+delay,o=ctx.createOscillator(),g=ctx.createGain(),p=ctx.createStereoPanner?ctx.createStereoPanner():null;o.type=type;o.frequency.setValueAtTime(Math.max(20,f),t);if(to)o.frequency.exponentialRampToValueAtTime(Math.max(20,to),t+d);env(g,t,d,v);o.connect(g);if(p){p.pan.setValueAtTime(clamp(pan,-1,1),t);g.connect(p);p.connect(master)}else g.connect(master);o.start(t);o.stop(t+d+.03)}
function hiss(d=.2,low=500,high=6000,v=.08,delay=0){const t=ctx.currentTime+delay,n=Math.max(1,Math.floor(ctx.sampleRate*d)),b=ctx.createBuffer(1,n,ctx.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*(1-i/n);const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=b;f.type='bandpass';f.Q.value=.8;f.frequency.setValueAtTime(low,t);f.frequency.exponentialRampToValueAtTime(high,t+d);env(g,t,d,v,.025);s.connect(f);f.connect(g);g.connect(master);s.start(t);s.stop(t+d+.02)}
function chord(fs,d=.28,v=.055){fs.forEach((f,i)=>tone(f,d,'sine',v,null,i*.035,(i-fs.length/2)*.18))}
const S={
 click(){tone(680,.055,'sine',.065,980);tone(1360,.035,'triangle',.022,null,.012)},
 hover(){tone(1450,.028,'sine',.018,1750)},
 open(){tone(180,.32,'sine',.075,560);hiss(.42,180,4200,.07,.015);chord([523,784,1047],.22,.032)},
 close(){tone(620,.18,'sine',.05,240);hiss(.22,3200,250,.035)},
 toggle(){tone(390,.075,'triangle',.045,590);tone(790,.09,'sine',.055,1180,.045)},
 type(){tone(900+Math.random()*480,.022,'triangle',.012)},
 ok(){chord([659,831,988,1318],.25,.055);tone(1760,.18,'sine',.025,null,.12)},
 warn(){tone(330,.12,'triangle',.06,265);tone(265,.18,'triangle',.05,210,.11)},
 error(){tone(190,.24,'sawtooth',.045,95);tone(145,.2,'sine',.06,80,.08)},
 copy(){tone(880,.07,'sine',.05,1320);tone(1320,.11,'sine',.04,1760,.07)},
 whoosh(){hiss(.78,100,5200,.11);tone(95,.72,'sine',.065,390,.02);tone(780,.42,'triangle',.022,1560,.16)},
 notify(){chord([587,740,1175],.34,.04);tone(1480,.24,'sine',.02,null,.2)},
 delete(){tone(500,.12,'triangle',.045,240);hiss(.24,1800,200,.04,.04)},
 start(){tone(55,.6,'sine',.09,110);chord([220,330,440,660],.65,.035);hiss(.6,200,5200,.045,.1)},
 finish(){chord([523,659,784,1047,1318],.5,.045);tone(1568,.38,'sine',.035,null,.22)},
 tick(){tone(1800,.018,'sine',.014)},
 select(){tone(540,.055,'sine',.035,810);tone(1080,.06,'triangle',.02,null,.03)}
};
function play(n){if(!ready())return;try{(S[n]||S.click)()}catch(e){}}
window.novaSfx={play,get on(){return on},get mode(){return mode},setMode(v){mode=v;try{localStorage.setItem(MODE,v)}catch(e){};paintFn&&paintFn();if(on)play(v==='cinematic'?'start':'toggle')}};
const CLICK='button,a[href],.chip,.card,summary,.cta,.ghost,.pill-btn,.small,.primary,.tab,label,[role="button"]';
addEventListener('pointerdown',e=>{const t=e.target.closest&&e.target.closest(CLICK);if(!t||t.id==='sfxBtn'||t.disabled)return;if(t.matches('input,textarea'))return;const txt=(t.getAttribute('aria-label')||t.title||t.textContent||'').toLowerCase();if(/刪除|移除|清除|delete|remove/.test(txt))play('delete');else if(/複製|copy/.test(txt))play('copy');else if(/開始|啟動|進入|start/.test(txt))play('start');else if(/完成|儲存|產生|確認|submit|save|generate/.test(txt))play('ok');else if(t.matches('a[href*="tools/"],.card'))play('open');else play('click')},true);
addEventListener('pointerover',e=>{if(e.pointerType==='touch')return;const t=e.target.closest&&e.target.closest('.card,button,a[href],.chip,summary');if(!t||t===lastHover||t.id==='sfxBtn')return;lastHover=t;play('hover')},{passive:true,capture:true});
addEventListener('pointerout',e=>{if(e.target===lastHover)lastHover=null},{passive:true});
addEventListener('input',e=>{const t=e.target;if(!t.matches||!t.matches('input,textarea'))return;if(['checkbox','radio','range','color'].includes(t.type))return;const n=performance.now();if(n-lastType<65)return;lastType=n;play('type')},true);
addEventListener('change',e=>{const t=e.target;if(t.matches&&t.matches('input[type=checkbox],input[type=radio],select,input[type=range],input[type=color]'))play('toggle')},true);
addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches&&e.target.matches('input'))play('select')},true);
function watch(){const t=document.getElementById('toast');if(t)new MutationObserver(()=>{if(t.classList.contains('show'))play(/錯誤|失敗|無法|請|沒有|最多|不正確/.test(t.textContent)?'warn':'ok')}).observe(t,{attributes:true,attributeFilter:['class']});const i=document.getElementById('intro');if(i)new MutationObserver(()=>{if(i.classList.contains('open'))play('whoosh')}).observe(i,{attributes:true,attributeFilter:['class']})}
function btn(){const b=document.createElement('button');b.id='sfxBtn';b.type='button';b.innerHTML='<span class="sfx-icon">♫</span><span class="sfx-label">SOUND ON</span>';b.setAttribute('aria-label',on?'關閉音效':'開啟音效');const st=document.createElement('style');st.textContent=`#sfxBtn{position:fixed;left:max(16px,env(safe-area-inset-left));bottom:max(16px,env(safe-area-inset-bottom));z-index:9999;display:flex;align-items:center;gap:9px;height:44px;padding:0 15px;border-radius:999px;border:1px solid #a58bff55;background:linear-gradient(135deg,#17152deF,#090c19ed);color:#f2efff;font:700 10px/1 system-ui,sans-serif;letter-spacing:.14em;box-shadow:0 8px 32px #0008,0 0 25px #8e7bff18;backdrop-filter:blur(18px);cursor:pointer;transition:transform .25s,border-color .25s,box-shadow .25s}#sfxBtn:hover{transform:translateY(-3px);border-color:#8deaff;box-shadow:0 12px 36px #8e7bff30}#sfxBtn .sfx-icon{font-size:18px;color:#a9f3ff}#sfxBtn .sfx-label{white-space:nowrap}#sfxBtn[aria-pressed="false"]{opacity:.72}#sfxBtn[aria-pressed="false"] .sfx-icon{color:#9299b8}@media(max-width:600px){#sfxBtn{height:40px;padding:0 12px}}`;document.head.appendChild(st);
paintFn=()=>{b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-label',on?'關閉音效':'開啟音效');b.querySelector('.sfx-icon').textContent=on?'♫':'♪';b.querySelector('.sfx-label').textContent=on?(mode==='cinematic'?'SOUND ON · CINEMA':'SOUND ON · SOFT'):'SOUND OFF'};
b.onclick=()=>{on=!on;if(C){C.get().sfx.on=on;C.save()}try{localStorage.setItem(KEY,on?'on':'off')}catch(e){}paintFn();if(on){init();if(ctx.state==='suspended')ctx.resume();play('toggle')}};paintFn();document.body.appendChild(b)}
const start=()=>{watch();btn();addEventListener('nova-sfx-sync',()=>{if(C)on=C.sfxEnabled();paintFn&&paintFn()})};document.readyState==='loading'?addEventListener('DOMContentLoaded',start):start();
['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,()=>{if(on){init();if(ctx.state==='suspended')ctx.resume()}},{once:true,capture:true}));
})();
