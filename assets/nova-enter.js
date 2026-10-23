/* ZAHTOOL 進入確認：每個工具進入前都要先確認，確認後播放進場動畫（光環讀條＋曲速星流＋閃光）。
   - 從首頁、主控台點工具：先跳出確認視窗 → 確認 → 動畫 → 進入工具頁
   - 直接開啟工具網址／書籤：工具頁自己會先跳出確認視窗，確認後動畫揭曉
   - 重新整理（F5）不會再問一次
   - 系統開啟「減少動態效果」時，動畫縮短為簡單淡出
   與 nova-fx.js 的連結轉場整合：fx 在點擊時會先問 NovaEnter.intercept。 */
(()=>{
const D=document,SK='nova-enter',RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const sfx=n=>{try{window.novaSfx&&novaSfx.play(n)}catch(e){}};
const toolOf=u=>{const m=(u.pathname||'').match(/\/tools\/([^/]+)\/?(?:index\.html)?$/);return m?m[1]:null};
const info=s=>{const t=(window.NOVA_TOOLS||[]).find(x=>x[0]===s);return t?{id:s,ic:t[1],name:t[2],desc:t[3],c:t[4]}:{id:s,ic:'✦',name:s,desc:'',c:'#a58bff'}};

const css=D.createElement('style');
css.textContent=`
#zEnter{--ze:#a58bff;position:fixed;inset:0;z-index:9990;display:grid;place-items:center;padding:18px;background:rgba(5,6,13,.74);backdrop-filter:blur(14px) saturate(1.2);-webkit-backdrop-filter:blur(14px) saturate(1.2);opacity:0;transition:opacity .35s ease;font-family:"Noto Sans TC",system-ui,sans-serif;color:#f3f2ff;overflow:hidden}
#zEnter.on{opacity:1}
#zEnter.out{opacity:0;transition:opacity .28s ease}
#zEnter .ze-cv{position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity .5s;pointer-events:none}
#zEnter.go .ze-cv{opacity:1}
#zEnter .ze-card{position:relative;width:min(400px,100%);text-align:center;padding:30px 26px 20px;border-radius:26px;border:1px solid color-mix(in srgb,var(--ze) 42%,#ffffff1a);background:linear-gradient(150deg,#161a33f0,#0b0e1df5);box-shadow:0 30px 90px #000a,0 0 70px color-mix(in srgb,var(--ze) 24%,transparent);transform:perspective(900px) translateY(34px) rotateX(18deg) scale(.94);opacity:0;transition:transform .65s cubic-bezier(.2,.8,.2,1),opacity .4s,background .5s,border-color .5s,box-shadow .5s}
#zEnter.on .ze-card{transform:none;opacity:1}
#zEnter.go .ze-card{transform:translateY(var(--dy,0px)) scale(1.08);background:transparent;border-color:transparent;box-shadow:none;transition:transform .65s cubic-bezier(.2,.8,.2,1),opacity .4s,background .2s,border-color .2s,box-shadow .2s}
#zEnter .ze-orb{position:relative;width:112px;height:112px;margin:0 auto 18px;display:grid;place-items:center;transition:transform .7s cubic-bezier(.2,.8,.2,1)}
#zEnter.go .ze-orb{transform:scale(1.25)}
#zEnter .ze-ic{position:relative;z-index:2;width:66px;height:66px;border-radius:21px;display:grid;place-items:center;font:800 1.7rem Syne,"Noto Sans TC",system-ui,sans-serif;color:#fff;background:linear-gradient(135deg,color-mix(in srgb,var(--ze) 82%,#fff),color-mix(in srgb,var(--ze) 30%,#12152a));border:1px solid color-mix(in srgb,var(--ze) 70%,#fff);box-shadow:0 0 36px color-mix(in srgb,var(--ze) 55%,transparent),inset 0 1px 0 #fff6;animation:zeFloat 3.4s ease-in-out infinite}
#zEnter .ze-r{position:absolute;inset:6px;border-radius:50%;border:1px solid color-mix(in srgb,var(--ze) 65%,transparent);transform:rotateX(68deg);animation:zeSpin 6s linear infinite}
#zEnter .ze-r.r2{inset:-2px;border-style:dashed;opacity:.55;transform:rotateY(64deg) rotateZ(24deg);animation-duration:9s;animation-direction:reverse}
#zEnter .ze-pg{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg);pointer-events:none}
#zEnter .ze-pg circle{fill:none;stroke-width:2.5}
#zEnter .ze-pg .bg{stroke:#ffffff14}
#zEnter .ze-pg .fg{stroke:var(--ze);stroke-linecap:round;stroke-dasharray:289;stroke-dashoffset:289;filter:drop-shadow(0 0 6px var(--ze))}
@keyframes zeFloat{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-6px) rotate(3deg)}}
@keyframes zeSpin{to{rotate:360deg}}
#zEnter .ze-main{transition:opacity .3s,transform .4s}
#zEnter.go .ze-main{opacity:0;transform:translateY(10px);pointer-events:none}
#zEnter .ze-k{font:800 .68rem/1.3 Inter,system-ui,sans-serif;letter-spacing:.24em;color:var(--ze);margin-bottom:8px}
#zEnter h2{margin:0 0 8px;font:800 1.55rem/1.2 Syne,"Noto Sans TC",system-ui,sans-serif;letter-spacing:-.01em}
#zEnter .ze-main p{margin:0 0 22px;color:#9aa2c4;font-size:.9rem;line-height:1.7;min-height:1.7em}
#zEnter .ze-b{display:flex;gap:10px}
#zEnter button{font:inherit;cursor:pointer;border-radius:99px;padding:13px 18px;font-weight:800;font-size:.95rem;transition:transform .18s,box-shadow .25s,filter .2s}
#zEnter .ze-no{flex:0 0 auto;background:#ffffff0d;border:1px solid #ffffff24;color:#d7dbf3}
#zEnter .ze-no:hover{background:#ffffff18}
#zEnter .ze-ok{flex:1;border:0;color:#080a16;background:linear-gradient(110deg,color-mix(in srgb,var(--ze) 70%,#fff),#7fe0ff)}
#zEnter .ze-ok:hover{transform:translateY(-2px);box-shadow:0 10px 30px color-mix(in srgb,var(--ze) 45%,transparent);filter:brightness(1.06)}
#zEnter .ze-ok span{display:inline-block;transition:transform .25s}
#zEnter .ze-ok:hover span{transform:translate(2px,-2px)}
#zEnter .ze-h{margin-top:14px;font-size:.72rem;color:#6f77a0;letter-spacing:.04em}
#zEnter .ze-st{position:absolute;left:0;right:0;top:152px;opacity:0;transition:opacity .4s .15s;display:flex;flex-direction:column;gap:4px;align-items:center}
#zEnter.go .ze-st{opacity:1}
#zEnter .ze-st b{font:800 .68rem/1.3 Inter,system-ui,sans-serif;letter-spacing:.3em;color:var(--ze)}
#zEnter .ze-nm{font:800 1.35rem/1.3 Syne,"Noto Sans TC",system-ui,sans-serif;letter-spacing:.04em;min-height:1.3em}
#zEnter .ze-pc{font:700 .85rem Inter,system-ui,sans-serif;color:#9aa2c4;font-style:normal;font-variant-numeric:tabular-nums}
#zEnter .ze-w{position:absolute;left:50%;top:50%;width:120px;height:120px;margin:-60px 0 0 -60px;border-radius:50%;border:2px solid var(--ze);pointer-events:none;animation:zeW 1.15s ease-out forwards}
@keyframes zeW{from{transform:scale(.6);opacity:.9}to{transform:scale(15);opacity:0}}
#zEnter .ze-fl{position:absolute;inset:0;opacity:0;pointer-events:none;background:radial-gradient(circle at 50% 50%,#fff,var(--ze) 36%,#05060d 92%)}
@media(prefers-reduced-motion:reduce){#zEnter,#zEnter .ze-card,#zEnter .ze-orb{transition:opacity .2s!important}#zEnter .ze-ic,#zEnter .ze-r{animation:none!important}#zEnter .ze-cv,#zEnter .ze-w{display:none!important}}
`;
D.head.appendChild(css);

let el=null,busy=false,inerted=[],lastFocus=null;

function build(t){
 const e=D.createElement('div');e.id='zEnter';e.setAttribute('role','dialog');e.setAttribute('aria-modal','true');e.setAttribute('aria-labelledby','zeT');e.style.setProperty('--ze',t.c);
 e.innerHTML='<canvas class="ze-cv" aria-hidden="true"></canvas><div class="ze-card"><div class="ze-orb"><svg class="ze-pg" viewBox="0 0 100 100" aria-hidden="true"><circle class="bg" cx="50" cy="50" r="46"/><circle class="fg" cx="50" cy="50" r="46"/></svg><i class="ze-r"></i><i class="ze-r r2"></i><span class="ze-ic"></span></div>'
  +'<div class="ze-main"><div class="ze-k">ENTER · 進入確認</div><h2 id="zeT"></h2><p></p><div class="ze-b"><button type="button" class="ze-no">取消</button><button type="button" class="ze-ok">確認進入 <span>↗</span></button></div><div class="ze-h">Enter 確認　·　Esc 取消</div></div>'
  +'<div class="ze-st" aria-live="polite"><b>正在進入</b><span class="ze-nm"></span><em class="ze-pc">0%</em></div></div><div class="ze-fl"></div>';
 const q=s=>e.querySelector(s);
 q('.ze-ic').textContent=t.ic;q('h2').textContent=t.name;q('.ze-main p').textContent=t.desc;q('.ze-nm').textContent=t.name;
 return e;
}

/* 曲速星流：星點從中心向外加速拉長 */
function warp(cv,col,dur,tick){
 const x=cv.getContext('2d'),dpr=Math.min(devicePixelRatio||1,1.5);
 let W=cv.width=Math.round(innerWidth*dpr),H=cv.height=Math.round(innerHeight*dpr);
 const S=Array.from({length:170},()=>({a:Math.random()*6.283,r:Math.random()*.2+.02,v:Math.random()*.6+.4}));
 const t0=performance.now();
 (function f(n){
  const p=Math.min(1,(n-t0)/dur),cx=W/2,cy=H/2,M=Math.hypot(cx,cy),sp=.003+p*p*.07;
  x.globalAlpha=1;x.fillStyle='rgba(5,6,13,.3)';x.fillRect(0,0,W,H);
  x.lineWidth=dpr*1.5;x.strokeStyle=col;
  S.forEach(s=>{const r0=s.r;s.r+=sp*s.v*(1+s.r*4);const c=Math.cos(s.a),d=Math.sin(s.a);
   x.globalAlpha=Math.min(1,.25+s.r*1.6);x.beginPath();x.moveTo(cx+c*r0*M,cy+d*r0*M);x.lineTo(cx+c*s.r*M,cy+d*s.r*M);x.stroke();
   if(s.r>1){s.r=.02;s.a=Math.random()*6.283}});
  tick(p);if(p<1)requestAnimationFrame(f)
 })(t0);
}

function release(){
 inerted.forEach(n=>n.removeAttribute('inert'));inerted=[];
 D.documentElement.style.overflow='';
 busy=false;
}
function drop(){const e=el;el=null;if(e)setTimeout(()=>e.remove(),320)}

/* 開啟確認視窗。go：確認＋動畫完成後執行；cancel：取消後執行（可省略） */
function ask(slug,go,cancel){
 if(el)return;
 const t=info(slug);lastFocus=D.activeElement;el=build(t);D.body.appendChild(el);
 inerted=[...D.body.children].filter(n=>n!==el&&!n.hasAttribute('inert'));inerted.forEach(n=>n.setAttribute('inert',''));
 D.documentElement.style.overflow='hidden';
 const e=el,ok=e.querySelector('.ze-ok'),no=e.querySelector('.ze-no');

 const onKey=ev=>{
  if(!el||ev.target&&!e.contains(ev.target)&&ev.target!==D.body&&ev.target!==D.documentElement)return;
  if(ev.key==='Escape'&&!busy){ev.preventDefault();doCancel()}
  else if(ev.key==='Enter'&&D.activeElement!==no){ev.preventDefault();doOk()}
  else if(ev.key==='Tab'&&!busy){const a=D.activeElement;if(!e.contains(a)||(ev.shiftKey&&a===no)||(!ev.shiftKey&&a===ok)){ev.preventDefault();(ev.shiftKey?ok:no).focus()}}
 };
 D.addEventListener('keydown',onKey,true);
 const off=()=>D.removeEventListener('keydown',onKey,true);

 function doCancel(){
  if(busy)return;busy=true;off();sfx('toggle');
  e.classList.remove('on');e.classList.add('out');
  setTimeout(()=>{release();drop();try{lastFocus&&lastFocus.focus&&lastFocus.focus({preventScroll:true})}catch(x){}cancel&&cancel()},280);
 }
 function doOk(){
  if(busy)return;busy=true;off();sfx('power');
  const card=e.querySelector('.ze-card'),orb=e.querySelector('.ze-orb'),fg=e.querySelector('.ze-pg .fg'),nm=e.querySelector('.ze-nm'),pc=e.querySelector('.ze-pc'),fl=e.querySelector('.ze-fl');
  e.classList.add('go');
  const finish=()=>{
   const run=go||(()=>{});
   if(RM){e.classList.remove('on');e.classList.add('out');setTimeout(()=>{run(e)},220);return}
   fl.animate([{opacity:0},{opacity:1}],{duration:280,easing:'ease-in',fill:'forwards'}).finished.then(()=>run(e))
  };
  if(RM){nm.textContent=t.name;setTimeout(finish,260);return}
  /* 讓圖示移到畫面正中央，星流與衝擊波才會從它身上散開 */
  const r=orb.getBoundingClientRect();card.style.setProperty('--dy',(innerHeight/2-(r.top+r.height/2))+'px');
  const wave=()=>{const w=D.createElement('div');w.className='ze-w';e.appendChild(w);setTimeout(()=>w.remove(),1250)};
  wave();setTimeout(wave,430);setTimeout(wave,860);
  const G='01ABCDEF#$%&*+<>/',L=t.name.length;
  warp(e.querySelector('.ze-cv'),t.c,1450,p=>{
   fg.style.strokeDashoffset=289*(1-p);pc.textContent=Math.round(p*100)+'%';
   nm.textContent=[...t.name].map((c,i)=>(c===' '||p*1.5>(i+1)/L)?c:G[Math.random()*G.length|0]).join('');
   if(p>=1){nm.textContent=t.name;finish()}
  });
 }
 ok.addEventListener('click',doOk);no.addEventListener('click',doCancel);
 e.addEventListener('pointerdown',ev=>{if(ev.target===e&&!busy)doCancel()});
 requestAnimationFrame(()=>requestAnimationFrame(()=>{e.classList.add('on');ok.focus({preventScroll:true})}));
}

/* 離開首頁時被瀏覽器暫存（上一頁）→ 還原頁面狀態 */
addEventListener('pageshow',ev=>{if(ev.persisted&&el){const e=el;el=null;e.remove();release()}});

/* 公開 API：nova-fx.js 的連結轉場會先呼叫 intercept；回傳 true 代表已由確認視窗接手 */
window.NovaEnter={
 intercept(a,u){
  const s=toolOf(u);if(!s)return false;
  ask(s,()=>{try{sessionStorage.setItem(SK,JSON.stringify({s,t:Date.now()}))}catch(x){}location.href=u.href});
  return true
 },
 ask
};

/* 工具頁：直接開啟網址／書籤時，也要先確認（從首頁確認過來的、或重新整理則略過） */
const here=toolOf(location);
if(here){
 let tok=null;try{tok=JSON.parse(sessionStorage.getItem(SK)||'null');sessionStorage.removeItem(SK)}catch(e){}
 const nav=(performance.getEntriesByType&&performance.getEntriesByType('navigation')[0])||{};
 const pass=(tok&&tok.s===here&&Date.now()-tok.t<20000)||nav.type==='reload';
 if(!pass){
  /* 等開場虹膜轉場與登入關卡都結束，再問 */
  const t0=Date.now();
  (function w(){
   if(D.querySelector('.fx-cover.init')&&Date.now()-t0<3500)return setTimeout(w,80);
   setTimeout(function g(){
    if(D.getElementById('zGate')&&Date.now()-t0<90000)return setTimeout(g,200);
    ask(here,e=>{
     /* 動畫收尾：虹膜由中心收合，露出工具頁 */
     if(RM){e.remove();release();el=null;return}
     e.animate({clipPath:['circle(150vmax at 50% 50%)','circle(0px at 50% 50%)']},{duration:760,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards'}).finished.then(()=>{e.remove();el=null;release()});
    },()=>{location.href='../../index.html#toolbox'});
   },400);
  })();
 }
}
})();
