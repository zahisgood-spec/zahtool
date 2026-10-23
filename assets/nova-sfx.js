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
/* ── V3.6 每個環節的音效個性：由場景（曲風／調性）決定打擊、主音色、懸停音 ── */
const NSC=window.NovaScenes;
const scn=()=>NSC?NSC.get(NSC.id()):{st:'home',root:38,mode:'maj'};
const nt=(s,d,o)=>NSC?NSC.note(s,d,o):s.root+[0,2,4,5,7,9,11][d%7]+12*Math.floor(d/7);
const H={
 boom:(t,v)=>{Y.boom(t,.8*v,.4);Y.tick(t,.2*v)},
 kick:(t,v)=>Y.kick(t,.9*v),
 timp:(t,v,r)=>Y.timp(t,.8*v,r),
 snare:(t,v)=>{Y.snare(t,.5*v);Y.tick(t,.1*v)},
 s808:(t,v,r)=>Y.sub808(r+12,t,.45,.6*v),
 tick:(t,v)=>Y.tick(t,.9*v),
 gong:(t,v,r)=>{Y.gong(r+12,t,.18*v,1.8);Y.timp(t,.3*v,r)},
 taiko:(t,v,r)=>{Y.timp(t,.9*v,r);Y.boom(t,.35*v,.3)}
};
const L={
 brass:(n,t,d,v)=>{Y.brass(n,t,d,v);Y.brass(n-12,t,d,v*.7)},
 synth:(n,t,d,v)=>Y.synth(n,t,d,v*.8,{type:'sawtooth',det:[-8,8],cut:4500,atk:.003}),
 sq:(n,t,d,v)=>Y.synth(n,t,d,v*.7,{type:'square',cut:2800,q:6}),
 bell:(n,t,d,v)=>Y.bell(n+12,t,v*.8,d*2+.5),
 pluck:(n,t,d,v)=>Y.pluck(n,t,v*1.4),
 choir:(n,t,d,v)=>{Y.choir(n,t,d,v*.8);Y.brass(n-12,t,d*.8,v*.5)},
 spicc:(n,t,d,v)=>{Y.spicc(n,t,v*1.2);Y.spicc(n+12,t,v*.6)},
 stab:(n,t,d,v)=>{Y.brass(n,t,d*.6,v*1.1);Y.brass(n+7,t,d*.6,v*.8)}
};
const HOV={
 bell:(n,t,v)=>Y.bell(n+12,t,v,.5),
 sq:(n,t,v)=>Y.synth(n-12,t,.07,v,{type:'square',cut:3000,q:5}),
 spicc:(n,t,v)=>Y.spicc(n,t,v),
 pluck:(n,t,v)=>Y.pluck(n,t,v*1.4),
 hat:(n,t,v)=>Y.hat(t,v*1.8),
 snare:(n,t,v)=>Y.snare(t,v*1.6),
 tick:(n,t,v)=>Y.tick(t,v*1.6)
};
const PAL={
 home:{hit:'boom',lead:'brass',hov:'bell'},orch:{hit:'boom',lead:'brass',hov:'bell'},
 arp:{hit:'kick',lead:'synth',hov:'sq'},bell:{hit:'tick',lead:'bell',hov:'bell'},
 dark:{hit:'gong',lead:'choir',hov:'pluck'},pulse:{hit:'timp',lead:'spicc',hov:'spicc'},
 drive:{hit:'taiko',lead:'stab',hov:'tick'},march:{hit:'snare',lead:'brass',hov:'snare'},
 ambient:{hit:'tick',lead:'pluck',hov:'bell'},tension:{hit:'tick',lead:'sq',hov:'tick'},
 trap:{hit:'s808',lead:'bell',hov:'hat'}
};
const CT=[14,16,18,21],HV=[21,22,23,25,26],TY=[23,24,25,26,27];
const rnd=a=>a[Math.random()*a.length|0];
function pal(){const s=scn(),p=PAL[s.st]||PAL.orch;return{s,hit:H[p.hit],lead:L[p.lead],hov:HOV[p.hov],st:s.st}}
const S={
 click(){const t=T(),P=pal(),n=nt(P.s,rnd(CT));P.hit(t,.6,P.s.root);P.lead(n,t,.2,.07);Y.bell(n+12,t+.015,.04,.9)},
 power(){const t=T(),P=pal();P.hit(t,1,P.s.root);Y.boom(t,.55);Y.crash(t,.26,2.4);Y.timp(t,.6,P.s.root);
  [0,.06,.14,.24].forEach((o,i)=>{const n=nt(P.s,CT[i]);P.lead(n,t+o,.5-o,.07);Y.bell(n+12,t+o+.04,.05,1.5)});Y.strings(P.s.root+12,t,1.4,.04);duck(1700)},
 powerdown(){const t=T(),P=pal();P.hit(t,.9,P.s.root);Y.timp(t,.55,P.s.root);
  [0,.12,.24,.36].forEach((o,i)=>{const n=nt(P.s,CT[3-i]);P.lead(n,t+o,.4,.065)});Y.revCrash(t,.5,.1);duck(1300)},
 open(){const t=T(),P=pal();P.hit(t,.9,P.s.root);Y.boom(t,.45);[0,1,2].forEach(i=>P.lead(nt(P.s,CT[i]),t,.34,.065));Y.bell(nt(P.s,23)+12,t+.02,.05,1.4);Y.riser(t,.4,.07)},
 hover(){const P=pal();P.hov(nt(P.s,rnd(HV)),T(),.028)},
 type(){const P=pal();P.hov(nt(P.s,rnd(TY)),T(),.03)},
 toggle(){const t=T(),P=pal();Y.tick(t,.1);Y.bell(nt(P.s,18)+12,t+.02,.05,.5);Y.bell(nt(P.s,21)+12,t+.09,.05,.7)},
 ok(){const t=T(),P=pal();CT.forEach((d,i)=>{Y.bell(nt(P.s,d+7)+12,t+i*.07,.06,1.1);P.lead(nt(P.s,d),t+i*.07,.4,.06)});P.hit(t,.5,P.s.root)},
 warn(){const t=T(),P=pal(),n=nt(P.s,14);P.lead(n,t,.4,.07);P.lead(n+1,t,.4,.06);P.hit(t,.7,P.s.root);Y.boom(t,.3)},
 whoosh(){let first=true;try{first=!sessionStorage.getItem('nova-fan');sessionStorage.setItem('nova-fan','1')}catch(e){}fan(T(),first?'full':'short')},
 victory(){fan(T(),'mini')}
};
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
