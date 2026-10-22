/* ZAHTOOL SFX — 以 Web Audio 即時合成，不需任何音檔 */
(()=>{
const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
const KEY='nova-sfx',C=window.novaConsole;let on=true,paintFn;if(C)on=C.sfxEnabled();else try{on=localStorage.getItem(KEY)!=='off'}catch(e){}
let ctx,master;
function init(){if(ctx)return ctx;ctx=new AC();const comp=ctx.createDynamicsCompressor();master=ctx.createGain();master.gain.value=.55;master.connect(comp);comp.connect(ctx.destination);return ctx}
function ready(){if(C)on=C.sfxEnabled();if(!on||(C&&C.slug&&!C.toolSfx(C.slug)))return false;init();master.gain.value=.55*(C?C.vol():1);if(ctx.state==='suspended')ctx.resume();return true}
function tone(f,d,type,v,to,delay){const t=ctx.currentTime+(delay||0),o=ctx.createOscillator(),g=ctx.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+d);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(master);o.start(t);o.stop(t+d+.02)}
function noise(d,f1,f2,v){const t=ctx.currentTime,n=ctx.sampleRate*d,b=ctx.createBuffer(1,n,ctx.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;const s=ctx.createBufferSource();s.buffer=b;const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.Q.value=1.2;bp.frequency.setValueAtTime(f1,t);bp.frequency.exponentialRampToValueAtTime(f2,t+d);const g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+d*.4);g.gain.linearRampToValueAtTime(0,t+d);s.connect(bp);bp.connect(g);g.connect(master);s.start(t)}
const S={
 click(){tone(520,.07,'sine',.16,780);tone(1040,.05,'triangle',.05,null,.01)},
 open(){tone(392,.12,'sine',.14,588);tone(588,.14,'sine',.12,880,.07);tone(1175,.1,'triangle',.04,null,.12)},
 hover(){tone(1250,.035,'triangle',.035)},
 type(){tone(880+Math.random()*260,.025,'sine',.035)},
 toggle(){tone(440,.08,'square',.05,660);tone(660,.08,'sine',.1,990,.05)},
 ok(){[660,880,1320].forEach((f,i)=>tone(f,.16,'sine',.12,null,i*.06))},
 warn(){tone(300,.14,'sawtooth',.06,200)},
 whoosh(){noise(1,180,3200,.22);tone(110,.9,'sine',.1,440)}
};
const play=n=>{if(ready())S[n]()};
window.novaSfx={play,get on(){return on}};
let lastH=0,lastT=0,lastEl=null;
const CLICK='button,a[href],.chip,.card,summary,.cta,.ghost,.pill-btn,.small,.primary,.tab,label';
addEventListener('pointerdown',e=>{const t=e.target.closest&&e.target.closest(CLICK);if(!t||t.id==='sfxBtn')return;
 if(t.matches('input,textarea'))return;
 if(t.matches('a[href*="tools/"],.card'))play('open');else play('click')},true);
addEventListener('pointerover',e=>{if(e.pointerType==='touch')return;const t=e.target.closest&&e.target.closest('.card,button,a[href],.chip,summary');if(!t||t===lastEl||t.id==='sfxBtn')return;lastEl=t;const n=performance.now();if(n-lastH<70)return;lastH=n;play('hover')},true);
addEventListener('input',e=>{const t=e.target;if(!t.matches||!t.matches('input,textarea'))return;if(t.type==='checkbox'||t.type==='radio'||t.type==='range'||t.type==='color')return;const n=performance.now();if(n-lastT<45)return;lastT=n;play('type')},true);
addEventListener('change',e=>{const t=e.target;if(t.matches&&t.matches('input[type=checkbox],input[type=radio],select,input[type=range],input[type=color]'))play('toggle')},true);
addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches&&e.target.matches('input'))play('click')},true);
/* toast：複製成功 / 提示 */
function watch(){
 const t=document.getElementById('toast');
 if(t)new MutationObserver(()=>{if(t.classList.contains('show'))play(/沒有|請|最多|錯誤|無法|失敗|不/.test(t.textContent)?'warn':'ok')}).observe(t,{attributes:true,attributeFilter:['class']});
 const i=document.getElementById('intro');
 if(i)new MutationObserver(()=>{if(i.classList.contains('open'))play('whoosh')}).observe(i,{attributes:true,attributeFilter:['class']});
}
/* 靜音開關 */
function btn(){
 const b=document.createElement('button');b.id='sfxBtn';b.type='button';
 const css=document.createElement('style');css.textContent='#sfxBtn{position:fixed;left:max(14px,env(safe-area-inset-left));bottom:max(14px,env(safe-area-inset-bottom));z-index:150;width:42px;height:42px;border-radius:50%;border:1px solid #ffffff2a;background:#0b0e1dd9;color:#e9ebff;font-size:1.05rem;display:grid;place-items:center;cursor:pointer;backdrop-filter:blur(12px);transition:transform .25s,border-color .25s}#sfxBtn:hover{transform:scale(1.08);border-color:#a58bff}';document.head.appendChild(css);
 const paint=paintFn=()=>{b.textContent=on?'🔊':'🔇';b.setAttribute('aria-label',on?'關閉音效':'開啟音效');b.title=b.getAttribute('aria-label');b.setAttribute('aria-pressed',on)};
 b.onclick=()=>{on=!on;if(C){C.get().sfx.on=on;C.save()}try{localStorage.setItem(KEY,on?'on':'off')}catch(e){}paint();if(on)play('toggle')};
 paint();document.body.appendChild(b)}
const start=()=>{watch();btn();addEventListener('nova-sfx-sync',()=>{if(C)on=C.sfxEnabled();paintFn&&paintFn()})};
document.readyState==='loading'?addEventListener('DOMContentLoaded',start):start();
/* 瀏覽器要求先有互動才能發聲 */
['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,()=>{if(on)init(),ctx.state==='suspended'&&ctx.resume()},{once:true,capture:true}));
})();
