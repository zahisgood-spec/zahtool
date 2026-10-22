/* ZAHTOOL 登入關卡：載入動畫結束後，必須以 Google 登入才能使用。
   開關在 nova-config.js 的 window.NOVA_REQUIRE_GOOGLE；account/ 頁面不受限，方便登入。 */
(()=>{
const A=window.novaAccount;
if(!window.NOVA_REQUIRE_GOOGLE||!A||!A.enabled||/\/account\//.test(location.pathname))return;
const D=document,HK='nova-acct';
const hint=()=>{try{return localStorage.getItem(HK)}catch(e){return null}};
const isG=u=>!!u&&(u.providerData||[]).some(p=>p&&p.providerId==='google.com');
let armed=false,el=null,busy=false,msgBad='';

const css=D.createElement('style');
css.textContent=`
#zGate{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:18px;background:rgba(5,6,13,.8);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);opacity:0;transition:opacity .5s ease}
#zGate.on{opacity:1}
#zGate .zc{width:min(420px,100%);text-align:center;border:1px solid #ffffff1f;border-radius:26px;padding:34px 28px 28px;background:linear-gradient(150deg,#161a33e6,#0b0e1df0);box-shadow:0 30px 90px #000a;color:#f3f2ff;font-family:"Noto Sans TC",system-ui,sans-serif;transform:translateY(14px) scale(.98);transition:transform .6s cubic-bezier(.2,.8,.2,1)}
#zGate.on .zc{transform:none}
#zGate .zl{width:54px;height:54px;margin:0 auto 16px;border-radius:16px;display:grid;place-items:center;font:800 1.5rem Syne,system-ui,sans-serif;background:linear-gradient(135deg,#dccfff,#7fe0ff);color:#080a16}
#zGate h2{margin:0 0 8px;font:800 1.55rem/1.2 Syne,"Noto Sans TC",system-ui,sans-serif;letter-spacing:-.02em}
#zGate p{margin:0 0 22px;color:#9aa2c4;font-size:.9rem;line-height:1.7}
#zGate button{font:inherit;cursor:pointer}
#zGate .zg{width:100%;display:flex;align-items:center;justify-content:center;gap:12px;border:0;border-radius:99px;padding:14px 18px;background:#fff;color:#1f1f1f;font-weight:700;font-size:.95rem;transition:transform .15s,box-shadow .2s}
#zGate .zg:hover{transform:translateY(-1px);box-shadow:0 8px 28px #7fe0ff44}
#zGate .zg:disabled{opacity:.6;cursor:wait;transform:none}
#zGate .zg svg{width:20px;height:20px;flex:none}
#zGate .zo{margin-top:12px;background:none;border:0;color:#6fdcff;font-size:.84rem;padding:6px}
#zGate .zm{min-height:1.4em;margin-top:14px;font-size:.86rem;line-height:1.6;color:#ff9aa8}
@media(prefers-reduced-motion:reduce){#zGate,#zGate .zc{transition:none}}
`;
D.head.appendChild(css);

const G='<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>';

function setInert(on){[...D.body.children].forEach(n=>{if(n===el)return;if(on)n.setAttribute('inert','');else n.removeAttribute('inert')})}

function build(){
 el=D.createElement('div');el.id='zGate';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-labelledby','zT');
 el.innerHTML='<div class="zc"><div class="zl">Z</div><h2 id="zT">登入後開始使用</h2><p id="zS">請先使用 Google 帳號登入，才能使用 ZAHTOOL 的所有工具。</p><button class="zg" id="zB" type="button">'+G+'<span>使用 Google 登入</span></button><button class="zo" id="zO" type="button" hidden>登出目前帳號</button><div class="zm" id="zM" role="status" aria-live="polite"></div></div>';
 D.body.appendChild(el);
 const b=el.querySelector('#zB'),m=el.querySelector('#zM');
 b.onclick=async()=>{if(busy)return;busy=true;b.disabled=true;m.textContent='';
  try{await A.google()}catch(e){m.textContent=e.message||'登入失敗，請再試一次'}
  busy=false;b.disabled=false};
 el.querySelector('#zO').onclick=async()=>{try{await A.signOut()}catch(e){m.textContent=e.message}};
}

function show(){
 if(!el)build();
 const u=A.user,s=A.state,sub=el.querySelector('#zS'),o=el.querySelector('#zO'),m=el.querySelector('#zM');
 if(u&&!isG(u)){sub.textContent='目前登入的帳號不是 Google 帳號。請登出後改用 Google 登入。';o.hidden=false}
 else{sub.textContent='請先使用 Google 帳號登入，才能使用 ZAHTOOL 的所有工具。';o.hidden=true}
 if(s.status==='error'&&!u&&!busy)m.textContent=s.msg||'';
 if(!el.classList.contains('on')){D.documentElement.style.overflow='hidden';setInert(true);requestAnimationFrame(()=>requestAnimationFrame(()=>{el.classList.add('on');const b=el.querySelector('#zB');b&&b.focus({preventScroll:true})}))}
}
function hide(){
 if(!el||!el.classList.contains('on'))return;
 el.classList.remove('on');setInert(false);D.documentElement.style.overflow='';
 const e=el;el=null;setTimeout(()=>e.remove(),600);
}

function update(){
 if(!armed)return;
 const u=A.user,s=A.state;
 if(isG(u)){hide();return}
 /* 曾登入過的人：先等 Firebase 確認狀態，避免閃現關卡 */
 const waiting=!!hint()&&!A.resolved&&s.status!=='error';
 if(waiting)return;
 show();
}
A.on(update);

function arm(){armed=true;update()}
const intro=D.getElementById('intro');
if(intro){
 if(intro.classList.contains('gone'))arm();
 else new MutationObserver((_,o)=>{if(intro.classList.contains('gone')){o.disconnect();arm()}}).observe(intro,{attributes:true,attributeFilter:['class']});
}else{
 /* 工具頁：等虹膜轉場結束 */
 const t0=Date.now();(function w(){if(!D.querySelector('.fx-cover.init')||Date.now()-t0>2500)arm();else setTimeout(w,80)})();
}
})();
