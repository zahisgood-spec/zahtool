/* ZAHTOOL 主控台核心：每位使用者（每個瀏覽器）各自的設定與使用紀錄 */
(()=>{
const K='nova-console',DEF=()=>({v:1,u:0,name:'',sfx:{on:true,vol:.6},fx:true,sort:'default',tools:{}});
let S=DEF();
function load(){try{const j=JSON.parse(localStorage.getItem(K)||'null');S=norm(j)}catch(e){S=DEF()}}
function norm(j){const d=DEF();if(!j||typeof j!=='object')return d;return{v:1,u:Math.max(0,+j.u||0),name:String(j.name||'').slice(0,24),sfx:{on:j.sfx?j.sfx.on!==false:true,vol:Math.min(1,Math.max(0,j.sfx&&+j.sfx.vol>=0?+j.sfx.vol:.6))},fx:j.fx!==false,sort:['default','used','recent'].includes(j.sort)?j.sort:'default',tools:(j.tools&&typeof j.tools==='object')?j.tools:{}}}
const save=(bump=true)=>{if(bump!==false)S.u=Date.now();try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}if(bump!==false&&window.novaAccount&&novaAccount.queuePush)novaAccount.queuePush()};
load();
const slug=(location.pathname.match(/\/tools\/([^/]+)/)||[])[1]||null;
const g=(s,k,d)=>{const t=S.tools[s];return t&&k in t?t[k]:d};
const api={slug,get:()=>S,save,
 enabled:s=>g(s,'on',true),pinned:s=>g(s,'pin',false),toolSfx:s=>g(s,'sfx',true),toolFx:s=>g(s,'fx',true),opens:s=>g(s,'n',0),last:s=>g(s,'t',0),
 setTool(s,k,v){(S.tools[s]=S.tools[s]||{})[k]=v;save()},
 resetStats(s){const t=S.tools[s];if(t){delete t.n;delete t.t;save()}},
 sfxEnabled:()=>S.sfx.on,vol:()=>S.sfx.vol,
 arrange(list){const idx=new Map(list.map((t,i)=>[t[0],i])),m=S.sort;
  return list.filter(t=>api.enabled(t[0])).sort((x,y)=>{const p=(api.pinned(y[0])?1:0)-(api.pinned(x[0])?1:0);if(p)return p;
   if(m==='used'){const d=api.opens(y[0])-api.opens(x[0]);if(d)return d}
   if(m==='recent'){const d=api.last(y[0])-api.last(x[0]);if(d)return d}
   return idx.get(x[0])-idx.get(y[0])})},
 exportJSON:()=>JSON.stringify(S,null,2),
 applyRemote(o){S=norm(o);save(false)},
 importJSON(str){S=norm(JSON.parse(str));save()},
 reset(){S=DEF();save()},
 fxOff:()=>!S.fx||(slug&&!api.toolFx(slug))};
window.novaConsole=api;
/* 動態效果：關閉時讓全站動畫模組視為「減少動態效果」 */
const off=api.fxOff();
document.documentElement.dataset.fx=off?'off':'on';
if(off){const mm=window.matchMedia.bind(window);window.matchMedia=q=>{const r=mm(q);return /prefers-reduced-motion\s*:\s*reduce/.test(q)?new Proxy(r,{get:(t,k)=>k==='matches'?true:(typeof t[k]==='function'?t[k].bind(t):t[k])}):r};
 const c=document.createElement('style');c.textContent='html[data-fx=off] *,html[data-fx=off] *:before,html[data-fx=off] *:after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}html[data-fx=off] #novaMotionCanvas,html[data-fx=off] .nova-tool-stage,html[data-fx=off] #gl{display:none!important}';document.head.appendChild(c)}
/* 工具頁：記錄使用次數；被停用時顯示提示 */
if(slug){
 if(api.enabled(slug)){api.setTool(slug,'n',api.opens(slug)+1);api.setTool(slug,'t',Date.now())}
 else addEventListener('DOMContentLoaded',()=>{
  const w=document.querySelector('#workspace .workspace')||document.querySelector('main');if(!w)return;
  const n=document.createElement('div');n.className='workspace';n.style.cssText='text-align:center;padding:48px 18px';
  n.innerHTML='<h3 style="margin:0 0 8px">此工具已在主控台停用</h3><p style="color:var(--muted);margin:0 0 20px">你可以隨時重新啟用。</p><div class="actions" style="justify-content:center"><button class="primary" id="ncOn">重新啟用</button><a class="small" href="../../console/index.html" style="display:inline-block;padding:10px 16px;border:1px solid var(--line);border-radius:12px">前往主控台</a></div>';
  w.style.display='none';w.parentNode.insertBefore(n,w);document.getElementById('ncOn').onclick=()=>{api.setTool(slug,'on',true);location.reload()}})
}
})();
