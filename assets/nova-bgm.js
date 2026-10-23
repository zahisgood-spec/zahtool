/* ZAHTOOL BGM — 史詩電影配樂（原創），以 Web Audio 即時合成，不需任何音檔。
   結構：序曲 → 英雄主題 → 合唱橋段 → 全樂團高潮，約 1 分 7 秒一輪、循環播放。
   開關與音量存在主控台設定（bgm.on / bgm.vol），會跟著雲端同步；切換頁面時樂曲會接續。 */
(()=>{
const AC=window.AudioContext||window.webkitAudioContext;if(!AC||!window.NovaSynth)return;
const C=window.novaConsole,D=document,SK='nova-bgm-pos';
const cfg=()=>C?C.get().bgm:{on:true,vol:.4};
const BPM=100,BEAT=60/BPM,STEP=BEAT/2,BAR=BEAT*4;
/* D 大調：b＝低音，t＝中音域和弦音 */
const CH={D:{b:38,t:[50,54,57,62]},A:{b:45,t:[52,57,61,64]},Bm:{b:47,t:[54,59,62,66]},Fm:{b:42,t:[54,57,61,66]},G:{b:43,t:[55,59,62,67]},Em:{b:40,t:[52,55,59,64]}};
const SEC=[
 {n:'A',lv:.6,ch:['D','A','Bm','G']},
 {n:'B',lv:.85,ch:['D','A','Bm','Fm','G','D','Em','A']},
 {n:'C',lv:.7,ch:['Bm','G','D','A','Bm','G','A','A']},
 {n:'D',lv:1,ch:['D','A','Bm','Fm','G','D','Em','A']}
];
const TOTAL=SEC.reduce((a,s)=>a+s.ch.length,0);
/* 主旋律：每小節 8 個八分音符格，0＝延續前一音 */
const TH=[[74,0,0,78,0,0,81,0],[81,0,0,85,0,0,83,81],[78,0,0,81,0,0,83,0],[85,0,0,83,0,81,0,0],[79,0,0,83,0,0,86,0],[85,0,0,81,0,0,78,0],[79,0,81,0,83,0,85,0],[85,0,0,0,0,0,0,0]];
const CL=[78,79,81,85,83,86,85,81];  /* 橋段的合唱長音 */
const OST=[0,1,2,1,0,1,2,3];
let ctx,master,Y,timer=0,playing=false,t0=0,base=0,cn=0,stopT=0,duckF=1,duckT=0;
const target=()=>Math.min(1,Math.max(0,cfg().vol))*.75*duckF;

function init(){
 if(ctx)return;
 ctx=new AC();ctx.onstatechange=paint;
 const comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.knee.value=10;comp.ratio.value=6;comp.attack.value=.006;comp.release.value=.25;
 const mk=ctx.createGain();mk.gain.value=1.25;
 master=ctx.createGain();master.gain.value=0;master.connect(comp);comp.connect(mk);mk.connect(ctx.destination);
 Y=NovaSynth.create(ctx,master,{rev:4.8,wet:.62,echo:BEAT*.75});
}
function locate(k){for(const s of SEC){if(k<s.ch.length)return[s,k];k-=s.ch.length}}
function theme(arr,t,v,o){
 let s=0;
 while(s<8){
  if(arr[s]){let e=s+1;while(e<8&&!arr[e])e++;
   const n=arr[s]+(o||0),d=(e-s)*STEP*.96+(e===8?.06:0),at=t+s*STEP;
   Y.brass(n,at,d,v);Y.brass(n-12,at,d,v*.55);s=e
  }else s++
 }
}
function bar(k,t){
 const[sec,j]=locate(k%TOTAL),c=CH[sec.ch[j]],lv=sec.lv,n=sec.n,last=j===sec.ch.length-1,root=c.b;
 /* 弦樂長音鋪底 */
 c.t.forEach(x=>Y.strings(x,t,BAR*1.04,.026*lv));
 /* 低音 */
 if(!(n==='A'&&j<2))Y.bass(root,t,BAR*.97,.12*lv);
 /* 定音鼓 */
 if(n==='A'){Y.timp(t,.3,38);if(last)Y.timpRoll(t+BEAT*2,BEAT*2,.15,.5,38)}
 else if(n==='B'){Y.timp(t,.5,38);Y.timp(t+BEAT*2,.36,45)}
 else if(n==='D'){Y.timp(t,.62,38);Y.timp(t+BEAT*1.5,.4,45);Y.timp(t+BEAT*2,.5,38);Y.timp(t+BEAT*3,.4,45);Y.timp(t+BEAT*3.5,.34,50)}
 else Y.timp(t,.3,38);
 /* 跳弓弦樂推進 */
 if(n!=='C')for(let s=0;s<8;s++)Y.spicc(c.t[OST[s]],t+s*STEP,(n==='A'?.016:n==='B'?.028:.038)*(s%2?.75:1));
 /* 主旋律 */
 if(n==='B'){theme(TH[j],t,.1);if(j===0||j===4)Y.bell(86,t,.04,2)}
 else if(n==='D'){theme(TH[j],t,.115);
  TH[j].forEach((x,s)=>{if(x){Y.choir(x-12,t+s*STEP,STEP*2.2,.03);Y.bell(x+12,t+s*STEP,.03,1.2)}});
  c.t.forEach(x=>Y.brass(x+12,t,BAR*.95,.03))}
 else if(n==='A'&&j>=2)theme(TH[j===2?2:4],t,.06,-12);
 else if(n==='C'){
  c.t.forEach(x=>Y.choir(x+12,t,BAR*1.02,.04));Y.choir(CL[j],t,BAR*1.02,.05);
  if(j>=4)Y.brass(CL[j]-12,t+BEAT*.5,BAR*.85,.055)
 }
 /* 亮晶晶的點綴 */
 if(n==='A'||n==='C')[0,3,6].forEach(s=>Y.bell(c.t[(s+j)%4]+24,t+s*STEP,.022*lv,1.5));
 /* 段落轉折：銅鈸、重擊、爬升 */
 if(j===0){
  if(n==='B'||n==='D'){Y.crash(t,.34,3.4);Y.boom(t,.6)}
  else if(n==='C'){Y.crash(t,.2,3);Y.boom(t,.4)}
  else Y.crash(t,.18,2.6)
 }
 if(j===4&&(n==='B'||n==='D'))Y.crash(t,.2,2.2);
 if(last){
  if(n==='A'){Y.riser(t,BAR,.2);Y.revCrash(t+BEAT*2,BEAT*2,.2)}
  else if(n==='C'){Y.riser(t,BAR,.24);Y.roll(t+BEAT*2,BEAT*2,.05,.2)}
  else if(n==='B')Y.revCrash(t+BEAT*2,BEAT*2,.16);
  else{Y.roll(t+BEAT*2,BEAT*2,.04,.16);Y.revCrash(t+BEAT*2,BEAT*2,.16)}
 }
}
function sched(){
 if(!playing||!ctx)return;
 const h=ctx.currentTime+1.6;
 while(t0+cn*BAR<h){const k=(base+cn)%TOTAL;bar(k,t0+cn*BAR);cn++;try{sessionStorage.setItem(SK,String((k+1)%TOTAL))}catch(e){}}
}
function fade(v,d){
 if(!ctx)return;const n=ctx.currentTime;master.gain.cancelScheduledValues(n);master.gain.setValueAtTime(master.gain.value,n);master.gain.linearRampToValueAtTime(v,n+d)
}
function play(){
 if(playing)return;clearTimeout(stopT);init();
 let saved=0;try{saved=parseInt(sessionStorage.getItem(SK)||'0',10)||0}catch(e){}
 base=((saved%TOTAL)+TOTAL)%TOTAL;
 if(ctx.state==='suspended')ctx.resume().then(paint).catch(()=>{});
 playing=true;t0=ctx.currentTime+.2;cn=0;
 timer=setInterval(sched,250);sched();fade(target(),1.6);paint()
}
function stop(){
 if(!playing)return;playing=false;clearInterval(timer);fade(0,.8);paint();
 stopT=setTimeout(()=>{if(!playing&&ctx&&ctx.state==='running')ctx.suspend()},1100)
}
function apply(){
 if(cfg().on){if(!playing)play();else fade(target(),.3)}else stop();
 paint()
}
/* 音效的號角響起時，把音樂壓低讓出空間 */
addEventListener('nova-duck',e=>{
 const d=e.detail||{};duckF=d.to==null?.3:d.to;if(playing)fade(target(),.25);
 clearTimeout(duckT);duckT=setTimeout(()=>{duckF=1;if(playing)fade(target(),1.8)},d.ms||4000)
});

/* 介面：左下角音樂鈕＋滑動音量 */
let btn,vol,wrap;
function paint(){
 if(!btn)return;
 const on=cfg().on,live=on&&ctx&&ctx.state==='running';
 btn.classList.toggle('off',!on);btn.classList.toggle('wait',on&&!live);btn.classList.toggle('live',!!live);
 const label=!on?'開啟背景音樂':live?'關閉背景音樂':'點一下開始播放背景音樂';
 btn.setAttribute('aria-label',label);btn.title=label;btn.setAttribute('aria-pressed',on);
 if(vol&&document.activeElement!==vol)vol.value=cfg().vol
}
function ui(){
 const css=D.createElement('style');
 css.textContent='#bgmWrap{position:fixed;left:calc(max(14px,env(safe-area-inset-left)) + 52px);bottom:max(14px,env(safe-area-inset-bottom));z-index:150;height:42px;display:flex;align-items:center;border-radius:21px;border:1px solid #ffffff2a;background:#0b0e1dd9;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);transition:border-color .25s}#bgmWrap:hover,#bgmWrap:focus-within{border-color:#a58bff}'
 +'#bgmBtn{width:40px;height:40px;flex:none;border:0;background:none;color:#e9ebff;font-size:1.05rem;display:grid;place-items:center;cursor:pointer;position:relative;border-radius:50%}'
 +'#bgmBtn.off{opacity:.5}#bgmBtn.off:after{content:"";position:absolute;width:22px;height:2px;border-radius:2px;background:#e9ebff;transform:rotate(-45deg)}'
 +'#bgmBtn.wait{animation:bgmP 1.6s ease-in-out infinite}@keyframes bgmP{50%{box-shadow:0 0 0 7px #a58bff33;background:#a58bff22}}'
 +'#bgmBtn.live{text-shadow:0 0 12px #a58bff}'
 +'#bgmVol{width:0;opacity:0;margin:0;accent-color:#a58bff;transition:width .3s,opacity .3s,margin .3s;cursor:pointer}'
 +'#bgmWrap:hover #bgmVol,#bgmWrap:focus-within #bgmVol{width:92px;opacity:1;margin:0 14px 0 2px}'
 +'@media(prefers-reduced-motion:reduce){#bgmBtn.wait{animation:none}#bgmVol{transition:none}}';
 D.head.appendChild(css);
 wrap=D.createElement('div');wrap.id='bgmWrap';
 wrap.innerHTML='<button id="bgmBtn" type="button">🎵</button><input id="bgmVol" type="range" min="0" max="1" step="0.05" aria-label="音樂音量">';
 D.body.appendChild(wrap);btn=wrap.querySelector('#bgmBtn');vol=wrap.querySelector('#bgmVol');
 btn.onclick=()=>{
  /* 若因瀏覽器限制尚未發聲，這一下只是「啟動」，不要當成關閉 */
  if(cfg().on&&ctx&&ctx.state!=='running'){ctx.resume().then(paint);return}
  cfg().on=!cfg().on;if(C)C.save();apply()
 };
 vol.oninput=()=>{cfg().vol=+vol.value;if(C)C.save(false);if(playing)fade(target(),.15)};
 vol.onchange=()=>{if(C)C.save()};
 paint()
}

/* 瀏覽器要求先有互動才能發聲：任何手勢都嘗試啟動／恢復 */
const wake=e=>{
 if(e&&e.target&&e.target.closest&&e.target.closest('#bgmWrap'))return;
 if(!cfg().on)return;
 if(!playing)play();
 if(ctx&&ctx.state!=='running')ctx.resume().then(paint).catch(()=>{})
};
['pointerdown','pointerup','keydown','touchend','click'].forEach(ev=>addEventListener(ev,wake,true));
D.addEventListener('visibilitychange',()=>{
 if(!ctx||!playing)return;
 if(D.hidden)ctx.suspend();else ctx.resume().then(paint).catch(()=>{})
});
addEventListener('pagehide',()=>{if(ctx&&playing)fade(0,.25)});
addEventListener('nova-bgm-sync',apply);
window.novaBgm={get on(){return cfg().on},apply};
const start=()=>{ui();if(cfg().on)play()};
D.readyState==='loading'?addEventListener('DOMContentLoaded',start):start();
})();
