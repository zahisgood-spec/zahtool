/* ZAHTOOL 首頁工具卡拖移排序：放開後自動儲存（跟著主控台設定與雲端同步）。
   滑鼠：按住移動即可拖；手機：長按卡片後拖；鍵盤：聚焦卡片後 Alt＋方向鍵。 */
(()=>{
const D=document,grid=D.getElementById('grid'),C=window.novaConsole;
if(!grid||!C)return;
const coarse=matchMedia('(pointer:coarse)').matches;
const css=D.createElement('style');
css.textContent=`
.grid .card{-webkit-touch-callout:none;-webkit-user-drag:none;user-select:none;-webkit-user-select:none}
.card.zsrc{opacity:.28;outline:2px dashed #ffffff66;outline-offset:-3px}
.zghost{position:fixed!important;left:0;top:0;z-index:9000;margin:0!important;pointer-events:none;opacity:.97;box-shadow:0 26px 70px #000c,0 0 0 1px #ffffff44;will-change:transform}
body.zdragging,body.zdragging *{cursor:grabbing!important;user-select:none!important;-webkit-user-select:none!important}
.zhint{margin:0 0 14px;color:var(--muted);font-size:.82rem}
#zToast{position:fixed;left:50%;bottom:max(70px,calc(env(safe-area-inset-bottom) + 60px));z-index:9100;transform:translate(-50%,16px);opacity:0;pointer-events:none;padding:10px 18px;border-radius:99px;border:1px solid #ffffff2a;background:#0b0e1df0;color:#f3f2ff;font-size:.86rem;font-weight:700;backdrop-filter:blur(12px);transition:opacity .25s,transform .25s}
#zToast.on{opacity:1;transform:translate(-50%,0)}
@media(prefers-reduced-motion:reduce){#zToast{transition:none}}`;
D.head.appendChild(css);
const hint=D.createElement('p');hint.className='zhint';
hint.textContent=coarse?'長按卡片後拖移，可自訂順序（自動儲存）':'拖移卡片可自訂順序（自動儲存），也可聚焦卡片後按 Alt＋方向鍵移動';
grid.parentNode.insertBefore(hint,grid);
const toastEl=D.createElement('div');toastEl.id='zToast';toastEl.setAttribute('role','status');toastEl.setAttribute('aria-live','polite');D.body.appendChild(toastEl);
let tt;const toast=m=>{toastEl.textContent=m;toastEl.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>toastEl.classList.remove('on'),1600)};
const sfx=n=>{try{window.novaSfx&&novaSfx.play(n)}catch(e){}};

const cards=()=>[...grid.querySelectorAll('.card')];
const vis=()=>cards().filter(c=>!c.classList.contains('hidden'));
const slug=c=>((c.getAttribute('href')||'').match(/tools\/([^/]+)/)||[])[1];
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;

/* FLIP：改動 DOM 順序後，讓其他卡片滑到新位置 */
function flip(mutate){
 const list=vis(),old=new Map(list.map(c=>[c,c.getBoundingClientRect()]));
 mutate();
 if(reduce||!D.documentElement.dataset||D.documentElement.dataset.fx==='off')return;
 list.forEach(c=>{const a=old.get(c),b=c.getBoundingClientRect(),dx=a.left-b.left,dy=a.top-b.top;
  if(dx||dy)try{c.animate([{translate:dx+'px '+dy+'px'},{translate:'0 0'}],{duration:260,easing:'cubic-bezier(.2,.8,.2,1)'})}catch(e){}})
}
let saveT;
function save(){
 clearTimeout(saveT);
 const order=cards().map(slug).filter(Boolean);
 const rest=(window.NOVA_TOOLS||[]).map(t=>t[0]).filter(s=>!order.includes(s));
 C.setOrder(order.concat(rest));
}
/* 釘選的工具永遠在最前面 */
function keepPinned(){
 const all=cards(),want=all.filter(c=>C.pinned(slug(c))).concat(all.filter(c=>!C.pinned(slug(c))));
 if(want.every((c,i)=>c===all[i]))return false;
 flip(()=>want.forEach(c=>grid.appendChild(c)));return true
}

let st=null,raf=0,suppress=false;
function start(){
 if(!st||st.active)return;
 st.active=true;clearTimeout(st.timer);
 const el=st.el,r=el.getBoundingClientRect(),g=el.cloneNode(true);
 g.classList.add('zghost');g.removeAttribute('href');g.removeAttribute('id');
 g.style.setProperty('width',r.width+'px');g.style.setProperty('height',r.height+'px');
 g.style.setProperty('animation','none');g.style.setProperty('transition','none');g.style.setProperty('--rx','0deg');g.style.setProperty('--ry','0deg');
 D.body.appendChild(g);st.ghost=g;st.w=r.width;
 el.classList.add('zsrc');D.body.classList.add('zdragging');
 if(navigator.vibrate)try{navigator.vibrate(12)}catch(e){}
 sfx('click');move();loop()
}
function move(){
 if(!st||!st.active)return;
 st.ghost.style.transform='translate('+(st.x-st.ox)+'px,'+(st.y-st.oy)+'px) scale(1.04) rotate(1.2deg)';
 const now=performance.now();if(now-st.last<110)return;
 const t=vis().find(c=>{if(c===st.el)return false;const r=c.getBoundingClientRect(),ix=r.width*.15,iy=r.height*.15;
  return st.x>r.left+ix&&st.x<r.right-ix&&st.y>r.top+iy&&st.y<r.bottom-iy});
 if(!t)return;
 const vs=vis(),after=vs.indexOf(st.el)<vs.indexOf(t);
 flip(()=>{after?t.after(st.el):t.before(st.el)});st.last=now;sfx('hover')
}
/* 每個畫面更新都重新判斷位置（指標停住時也能補上被節流略過的換位），並在靠近上下緣時自動捲動 */
function loop(){
 cancelAnimationFrame(raf);
 const tick=()=>{if(!st||!st.active)return;
  const e=90,y=st.y;let v=0;if(y<e)v=-(1-y/e)*18;else if(y>innerHeight-e)v=(1-(innerHeight-y)/e)*18;
  if(v)scrollBy(0,v);move();raf=requestAnimationFrame(tick)};
 raf=requestAnimationFrame(tick)
}
function finish(){
 clearTimeout(st&&st.timer);
 const s=st;st=null;if(!s)return;
 if(!s.active)return;
 cancelAnimationFrame(raf);
 const r=s.el.getBoundingClientRect(),g=s.ghost;
 g.style.setProperty('transition','transform .22s cubic-bezier(.2,.8,.2,1),opacity .22s');
 g.style.transform='translate('+r.left+'px,'+r.top+'px) scale(1)';
 setTimeout(()=>{g.remove();s.el.classList.remove('zsrc')},210);
 D.body.classList.remove('zdragging');
 suppress=true;setTimeout(()=>{suppress=false},350);
 const reverted=keepPinned();save();sfx('toggle');
 toast(reverted?'釘選的工具會固定在最前面；其餘順序已儲存':'已儲存排序')
}

grid.addEventListener('pointerdown',e=>{
 if(st||(e.pointerType==='mouse'&&e.button!==0))return;
 const el=e.target.closest&&e.target.closest('.card');if(!el)return;
 const r=el.getBoundingClientRect(),touch=e.pointerType!=='mouse';
 st={el,pid:e.pointerId,sx:e.clientX,sy:e.clientY,x:e.clientX,y:e.clientY,ox:e.clientX-r.left,oy:e.clientY-r.top,touch,active:false,last:0};
 if(touch)st.timer=setTimeout(start,380)
});
addEventListener('pointermove',e=>{
 if(!st||e.pointerId!==st.pid)return;
 st.x=e.clientX;st.y=e.clientY;
 if(!st.active){
  const d=Math.hypot(st.x-st.sx,st.y-st.sy);
  if(st.touch){if(d>10){clearTimeout(st.timer);st=null}}
  else if(d>6)start();
  return
 }
 e.preventDefault();move()
},{passive:false});
addEventListener('pointerup',e=>{if(st&&e.pointerId===st.pid)finish()});
addEventListener('pointercancel',e=>{if(st&&e.pointerId===st.pid){st.active?finish():(clearTimeout(st.timer),st=null)}});
/* 長按啟動後，阻止手機頁面跟著捲動／出現選單 */
addEventListener('touchmove',e=>{if(st&&st.active)e.preventDefault()},{passive:false});
grid.addEventListener('contextmenu',e=>{if(st)e.preventDefault()});
grid.addEventListener('dragstart',e=>e.preventDefault());
/* 拖完不要誤開工具（需早於 nova-fx 的頁面轉場處理） */
addEventListener('click',e=>{if(suppress&&e.target.closest&&e.target.closest('#grid')){e.preventDefault();e.stopPropagation()}},true);
/* 鍵盤：Alt＋方向鍵 */
grid.addEventListener('keydown',e=>{
 const el=e.target.closest&&e.target.closest('.card');
 if(!el||!e.altKey||!/^Arrow(Left|Right|Up|Down)$/.test(e.key))return;
 e.preventDefault();
 const vs=vis(),i=vs.indexOf(el),fwd=e.key==='ArrowRight'||e.key==='ArrowDown',t=vs[i+(fwd?1:-1)];
 if(!t)return;
 flip(()=>{fwd?t.after(el):t.before(el)});el.focus({preventScroll:false});
 clearTimeout(saveT);saveT=setTimeout(()=>{const rv=keepPinned();save();toast(rv?'釘選的工具會固定在最前面':'已儲存排序')},500)
},true);
})();
