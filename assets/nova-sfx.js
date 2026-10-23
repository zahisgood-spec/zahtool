/* ZAHTOOL SFX — 以 Web Audio 即時合成，不需任何音檔 */
(()=>{
const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
const KEY='nova-sfx',C=window.novaConsole;let on=true,paintFn;if(C)on=C.sfxEnabled();else try{on=localStorage.getItem(KEY)!=='off'}catch(e){}
let ctx,master,Y;
function init(){if(ctx)return ctx;ctx=new AC();
 const comp=ctx.createDynamicsCompressor();comp.threshold.value=-16;comp.knee.value=8;comp.ratio.value=5;comp.attack.value=.004;comp.release.value=.22;
 master=ctx.createGain();master.gain.value=.75;master.connect(comp);comp.connect(ctx.destination);
 Y=window.NovaSynth?NovaSynth.create(ctx,master,{rev:3.6,wet:.55,echo:.3}):null;return ctx}
function ready(){if(C)on=C.sfxEnabled();if(!on||(C&&C.slug&&!C.toolSfx(C.slug)))return false;init();if(!Y)return false;master.gain.value=.75*(C?C.vol():1);if(ctx.state==='suspended')ctx.resume().catch(()=>{});return true}
const T=()=>ctx.currentTime;
const DM=[50,57,62,66,69],PENT=[86,88,90,93,95];
const duck=ms=>{try{dispatchEvent(new CustomEvent('nova-duck',{detail:{ms,to:.3}}))}catch(e){}};
/* 史詩開場號角：蓄力（定音鼓滾奏＋爬升）→ 全樂團重擊 → 英雄主題 → 終止和弦。
   mode：full 完整版／short 精簡版／mini 登入成功版 */
function fan(t,mode){
 const B=60/108,pre=mode==='mini'?0:mode==='short'?.9:1.2,h=t+pre,chord=(ns,s,d,v)=>ns.forEach(n=>Y.brass(n,s,d,v));
 if(pre){Y.timpRoll(t,pre,.15,.6,38);Y.riser(t,pre,.3);Y.revCrash(t,pre,.2);if(mode==='full')Y.roll(t+.15,pre-.1,.04,.2)}
 Y.boom(h,mode==='mini'?.7:.95);Y.crash(h,mode==='mini'?.3:.42,3.4);Y.timp(h,.7,38);Y.timp(h,.5,45);
 chord(DM,h,mode==='mini'?.5:.75,.075);
 const len=mode==='full'?11:mode==='short'?4:3.4;
 [50,57,62,66].forEach(n=>Y.strings(n,h,len*B,.04));
 if(mode!=='mini')[62,66,69,74].forEach(n=>Y.choir(n,h+.05,len*B,.045));
 duck(Math.round((pre+(mode==='full'?len*B+1.4:mode==='short'?3.2:len*B+1))*1000));
 if(mode==='short')return;
 const lead=(n,b,d)=>{const s=h+b*B,du=d*B*.95;Y.brass(n,s,du,.085);Y.brass(n-12,s,du,.05);Y.brass(n-7,s,du,.04);Y.bell(n+12,s,.035,1.3)};
 if(mode==='mini'){lead(74,0,.6);lead(78,.6,.6);lead(81,1.2,.6);lead(86,1.8,1.6);
  const e=h+1.8*B;chord([62,66,69,74,78],e,1.6*B,.08);Y.boom(e,.6);Y.crash(e,.3,3);Y.timp(e,.6,38);return}
 lead(74,0,1.5);lead(78,1.5,1.5);lead(81,3,1);
 lead(81,4,1.5);lead(85,5.5,1.5);lead(83,7,.5);lead(81,7.5,.5);
 const e=h+8*B;lead(86,8,3);chord([50,57,62,66,69,74],e,3*B,.08);chord([62,66,69,74,78],e,3*B,.07);
 Y.boom(e,.9);Y.crash(e,.45,4.5);Y.timp(e,.75,38);Y.timpRoll(h+6.5*B,1.5*B,.2,.45,45);
 [0,.25,.5,.75].forEach((x,i)=>Y.bell(86+[0,4,7,12][i],e+x*B,.05,2))
}
const S={
 click(){const t=T(),n=[62,66,69,74][Math.random()*4|0];Y.boom(t,.5,.4);Y.tick(t,.12);Y.brass(n,t,.2,.07);Y.brass(n-12,t,.2,.05);Y.bell(n+24,t+.015,.04,.9)},
 power(){const t=T();Y.boom(t,.85);Y.crash(t,.26,2.4);Y.timp(t,.6,38);[62,66,69,74].forEach(n=>Y.brass(n,t,.8,.07));Y.strings(50,t,1.4,.04);
  [[74,.06],[78,.15],[81,.24],[86,.33]].forEach(a=>{Y.brass(a[0],t+a[1],.3,.05);Y.bell(a[0]+12,t+a[1],.05,1.5)});duck(1700)},
 powerdown(){const t=T();Y.boom(t,.75);Y.timp(t,.55,38);[[74,0],[69,.12],[62,.24],[50,.36]].forEach(a=>{Y.brass(a[0],t+a[1],.35,.06);Y.brass(a[0]-12,t+a[1],.35,.04)});Y.revCrash(t,.5,.1);duck(1300)},
 open(){const t=T();Y.boom(t,.6);chord3(t);Y.bell(86,t+.02,.05,1.4);Y.riser(t,.4,.07)},
 hover(){Y.bell(PENT[Math.random()*5|0],T(),.028,.5)},
 type(){Y.bell(88+(Math.random()*5|0),T(),.03,.2)},
 toggle(){const t=T();Y.tick(t,.1);Y.bell(81,t+.02,.05,.5);Y.bell(88,t+.09,.05,.7)},
 ok(){const t=T();[[74,0],[78,.07],[81,.14],[86,.21]].forEach(a=>Y.bell(a[0]+12,t+a[1],.06,1.1));Y.brass(62,t,.45,.06);Y.brass(69,t+.07,.4,.05);Y.brass(74,t+.14,.5,.06);Y.timp(t,.35,38)},
 warn(){const t=T();Y.brass(50,t,.4,.07);Y.brass(51,t,.4,.06);Y.boom(t,.35)},
 whoosh(){let first=true;try{first=!sessionStorage.getItem('nova-fan');sessionStorage.setItem('nova-fan','1')}catch(e){}fan(T(),first?'full':'short')},
 victory(){fan(T(),'mini')}
};
function chord3(t){Y.brass(62,t,.3,.07);Y.brass(69,t,.3,.06);Y.brass(74,t,.36,.065)}
const play=n=>{if(ready())S[n]()};
window.novaSfx={play,get on(){return on}};
let lastH=0,lastT=0,lastEl=null;
const CLICK='button,a[href],.chip,.card,summary,.cta,.ghost,.pill-btn,.small,.primary,.tab,label';
addEventListener('pointerdown',e=>{const t=e.target.closest&&e.target.closest(CLICK);if(!t||t.id==='sfxBtn'||t.id==='bgmBtn'||(t.closest&&t.closest('#bgmWrap')))return;
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
 b.onclick=()=>{if(on)play('powerdown');on=!on;if(C){C.get().sfx.on=on;C.save()}try{localStorage.setItem(KEY,on?'on':'off')}catch(e){}paint();if(on)play('power')};
 paint();document.body.appendChild(b)}
const start=()=>{watch();btn();addEventListener('nova-sfx-sync',()=>{if(C)on=C.sfxEnabled();paintFn&&paintFn()})};
document.readyState==='loading'?addEventListener('DOMContentLoaded',start):start();
/* 瀏覽器要求先有互動才能發聲 */
['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,()=>{if(on)init(),ctx.state==='suspended'&&ctx.resume()},{once:true,capture:true}));
})();
