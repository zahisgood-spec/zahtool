/* ZAHTOOL 帳號系統（Firebase Auth + Firestore）：登入、註冊、雲端同步主控台設定 */
(()=>{
const cfg=window.NOVA_CLOUD||{},ok=!!(cfg.apiKey&&cfg.projectId&&cfg.authDomain),C=window.novaConsole,HK='nova-acct',COL='userSettings',V='10.12.2';
const P=location.pathname;
const L=[];let fb=null,auth=null,db=null,user=null,lastUid=null,pt=0,first=true,state={status:'idle',at:0,msg:'',recovery:false};
const hint=()=>{try{return localStorage.getItem(HK)}catch(e){return null}};
const setHint=v=>{try{v?localStorage.setItem(HK,v):localStorage.removeItem(HK)}catch(e){}};
const nameOf=u=>(u.email||u.displayName||'user').split('@')[0];
const label=()=>{const nm=C&&C.get().name;if(user)return nm||nameOf(user);const h=hint();return h?(nm||h):null};
function paint(){const n=label();document.querySelectorAll('.acLink').forEach(el=>el.textContent=n?'👤 '+n:'👤 登入')}
function emit(){paint();L.forEach(f=>{try{f(user,state)}catch(e){}})}
const TR={'auth/invalid-credential':'帳號或密碼錯誤','auth/wrong-password':'帳號或密碼錯誤','auth/user-not-found':'帳號或密碼錯誤','auth/invalid-login-credentials':'帳號或密碼錯誤','auth/email-already-in-use':'此 Email 已註冊，請直接登入','auth/weak-password':'密碼至少需要 6 個字元','auth/invalid-email':'Email 格式不正確','auth/too-many-requests':'嘗試次數太多，請稍後再試','auth/popup-closed-by-user':'已取消登入','auth/cancelled-popup-request':'已取消登入','auth/network-request-failed':'網路連線失敗，請稍後再試','auth/operation-not-allowed':'尚未在 Firebase 啟用此登入方式','auth/unauthorized-domain':'此網域尚未加入 Firebase 授權網域','auth/requires-recent-login':'請重新登入後再執行此操作','permission-denied':'沒有權限，請檢查 Firestore 安全規則','unavailable':'雲端服務暫時無法使用'};
const tr=e=>{const c=e&&e.code?String(e.code).replace(/^firestore\//,''):'';return TR[c]||(e&&e.message)||String(e)};
const need=()=>{if(!ok)throw new Error('尚未設定雲端服務');if(!auth)throw new Error('帳號服務尚未就緒，請稍後再試')};
const wrap=async f=>{try{return await f()}catch(e){throw new Error(tr(e))}};
const load=src=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('無法載入帳號服務，請檢查網路'));document.head.appendChild(s)});
async function loadSDK(){if(window.firebase&&firebase.auth&&firebase.firestore)return;const b='https://www.gstatic.com/firebasejs/'+V+'/firebase-';await load(b+'app-compat.js');await Promise.all([load(b+'auth-compat.js'),load(b+'firestore-compat.js')])}
const ref=()=>db.collection(COL).doc(user.uid);
async function push(){const s=C.get();await ref().set({json:JSON.stringify(s),u:s.u||0,updatedAt:firebase.firestore.FieldValue.serverTimestamp()})}
async function sync(){if(!user||!db||!C)return;state={...state,status:'syncing'};emit();
 try{const snap=await ref().get(),d=snap.exists?snap.data():null;
  const loc=C.get().u||0,cu=d?+d.u||0:0;let r='same';
  if(!d||loc>cu){await push();r='pushed'}else if(cu>loc){C.applyRemote(JSON.parse(d.json));r='pulled'}
  state={...state,status:'ok',at:Date.now(),msg:r};emit();
  if(r==='pulled')setTimeout(()=>location.reload(),600)}
 catch(e){state={...state,status:'error',at:Date.now(),msg:tr(e)};emit()}}
const A=window.novaAccount={enabled:ok,
 get user(){return user},get state(){return state},get resolved(){return !first},
 on(f){L.push(f);f(user,state)},
 queuePush(){if(!user||!db)return;clearTimeout(pt);pt=setTimeout(sync,1500)},
 sync,
 async signUp(email,pw){need();const c=await wrap(()=>auth.createUserWithEmailAndPassword(email,pw));try{await c.user.sendEmailVerification()}catch(e){}return 'signed'},
 async signIn(email,pw){need();await wrap(()=>auth.signInWithEmailAndPassword(email,pw))},
 async google(){need();const p=new firebase.auth.GoogleAuthProvider();try{await auth.signInWithPopup(p)}catch(e){if(e&&e.code==='auth/popup-blocked'){await auth.signInWithRedirect(p);return}throw new Error(tr(e))}},
 async reset(email){need();await wrap(()=>auth.sendPasswordResetEmail(email))},
 async updatePassword(pw){need();if(!auth.currentUser)throw new Error('請先登入');await wrap(()=>auth.currentUser.updatePassword(pw))},
 async signOut(){need();await auth.signOut()}};
async function init(){
 if(!ok){emit();return}
 if(!hint()&&!window.NOVA_REQUIRE_GOOGLE&&!/\/(account|console)\//.test(P)){emit();return}
 try{await loadSDK()}catch(e){state={...state,status:'error',msg:e.message};emit();return}
 fb=window.firebase;if(!fb.apps.length)fb.initializeApp(cfg);auth=fb.auth();db=fb.firestore();
 auth.onAuthStateChanged(u=>{user=u||null;
  if(user){setHint(nameOf(user));if(user.uid!==lastUid){lastUid=user.uid;setTimeout(sync,0)}}
  else{lastUid=null;setHint(null)}
  first=false;emit()},e=>{state={...state,status:'error',msg:tr(e)};emit()})}
A.ready=init();
document.readyState==='loading'?addEventListener('DOMContentLoaded',paint):paint();
})();
