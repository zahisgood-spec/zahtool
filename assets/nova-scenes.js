/* ZAHTOOL 場景表：每個頁面（環節）都有自己專屬的配樂與音效個性。
   曲風 st、主音 root、調式 mode、速度 bpm、和弦進行 prog、旋律種子 seed 全都不同，
   旋律由種子即時生成，所以同一曲風的不同頁面也不會聽起來一樣。
   bgm（nova-bgm.js）與 sfx（nova-sfx.js）共用。 */
(()=>{
const MODES={maj:[0,2,4,5,7,9,11],min:[0,2,3,5,7,8,10],dor:[0,2,3,5,7,9,10],phr:[0,1,3,5,7,8,10],lyd:[0,2,4,6,7,9,11],mix:[0,2,4,5,7,9,10],hmin:[0,2,3,5,7,8,11]};
/* 曲風：混響、整體音量、旋律節奏型 */
const STY={
 home:{rev:4.8,wet:.62,gain:1,feel:'mid'},
 orch:{rev:4.8,wet:.62,gain:1,feel:'mid'},
 arp:{rev:2.4,wet:.36,gain:.92,feel:'busy'},
 bell:{rev:5.2,wet:.7,gain:1.05,feel:'mid'},
 dark:{rev:6.4,wet:.78,gain:1.05,feel:'long'},
 pulse:{rev:3.8,wet:.5,gain:1,feel:'mid'},
 drive:{rev:3.4,wet:.44,gain:1,feel:'mid'},
 march:{rev:3.2,wet:.46,gain:1,feel:'march'},
 ambient:{rev:6,wet:.74,gain:1.1,feel:'long'},
 tension:{rev:3,wet:.4,gain:1,feel:'sparse'},
 trap:{rev:2.4,wet:.3,gain:.95,feel:'busy'}
};
const SC={
 home:{st:'home',root:38,mode:'maj',bpm:100,name:'序曲・英雄'},
 gate:{st:'dark',root:40,mode:'phr',bpm:62,seed:3,prog:[0,1,0,6,0,1,5,6],name:'封印之門'},
 console:{st:'arp',root:33,mode:'dor',bpm:118,seed:5,prog:[0,3,0,6,0,3,6,4],name:'指揮中樞'},
 account:{st:'bell',root:41,mode:'maj',bpm:84,seed:7,prog:[0,4,5,3,0,4,3,4],name:'星光彼岸'},
 text:{st:'orch',var:'hymn',root:35,mode:'min',bpm:76,seed:11,prog:[0,5,2,6,0,5,3,4],name:'文字聖歌'},
 json:{st:'arp',root:40,mode:'min',bpm:124,seed:13,prog:[0,5,2,6,0,5,3,4],name:'資料脈衝'},
 password:{st:'dark',root:42,mode:'hmin',bpm:72,seed:17,prog:[0,5,3,4,0,5,3,4],name:'暗影金庫'},
 base64:{st:'pulse',root:43,mode:'min',bpm:112,seed:19,prog:[0,5,2,6,0,3,5,4],name:'位元洪流'},
 url:{st:'drive',root:38,mode:'min',bpm:128,seed:23,prog:[0,6,5,6,0,6,5,4],name:'疾風連結'},
 case:{st:'march',root:34,mode:'maj',bpm:108,seed:29,prog:[0,3,4,0,5,3,4,0],name:'字母進行曲'},
 image:{st:'bell',root:33,mode:'lyd',bpm:90,seed:31,prog:[0,1,0,1,4,3,0,1],name:'光影壓縮'},
 qr:{st:'arp',root:37,mode:'min',bpm:132,seed:37,prog:[0,6,5,6,0,6,3,4],name:'矩陣掃描'},
 timer:{st:'tension',root:40,mode:'min',bpm:100,seed:41,prog:[0,0,5,0,3,0,6,0],name:'專注倒數'},
 notes:{st:'ambient',root:39,mode:'maj',bpm:72,seed:43,prog:[0,4,5,2,3,0,3,4],name:'靈感低語'},
 seo:{st:'drive',root:43,mode:'dor',bpm:120,seed:47,prog:[0,3,0,6,0,3,6,4],name:'搜尋追擊'},
 wordcount:{st:'orch',var:'brassy',root:41,mode:'min',bpm:88,seed:53,prog:[0,5,2,6,0,3,5,4],name:'長篇史詩'},
 color:{st:'bell',root:36,mode:'lyd',bpm:96,seed:59,prog:[0,1,4,0,3,1,0,4],name:'七彩光譜'},
 gradient:{st:'ambient',root:38,mode:'lyd',bpm:80,seed:61,prog:[0,1,0,4,3,1,0,1],name:'流光漸變'},
 unit:{st:'march',root:33,mode:'mix',bpm:112,seed:67,prog:[0,6,3,0,0,6,3,4],name:'度量衡進行曲'},
 timestamp:{st:'tension',root:42,mode:'min',bpm:108,seed:71,prog:[0,5,0,6,0,3,4,0],name:'時間裂縫'},
 datecalc:{st:'pulse',root:36,mode:'dor',bpm:104,seed:73,prog:[0,3,0,6,0,3,6,4],name:'日曆齒輪'},
 picker:{st:'trap',root:33,mode:'min',bpm:140,seed:79,prog:[0,5,2,6,0,5,2,4],name:'幸運重擊'},
 uuid:{st:'arp',root:35,mode:'phr',bpm:136,seed:83,prog:[0,1,0,6,0,1,5,6],name:'唯一識別'},
 lines:{st:'pulse',root:40,mode:'dor',bpm:116,seed:89,prog:[0,3,0,6,0,3,6,4],name:'整齊列陣'},
 multisearch:{st:'drive',root:36,mode:'min',bpm:126,seed:97,prog:[0,5,6,4,0,5,3,6],name:'萬象追蹤'},
 bmi:{st:'orch',var:'epic',root:44,mode:'maj',bpm:86,seed:101,prog:[0,4,5,3,0,4,3,4],name:'生命凱歌'},
 loan:{st:'trap',root:41,mode:'min',bpm:132,seed:103,prog:[0,5,2,6,0,5,2,4],name:'金流重低音'},
 percent:{st:'pulse',root:38,mode:'maj',bpm:122,seed:107,prog:[0,4,5,3,0,4,3,4],name:'百分躍動'},
 radix:{st:'arp',root:43,mode:'hmin',bpm:128,seed:109,prog:[0,5,3,4,0,5,3,4],name:'進位矩陣'},
 regex:{st:'dark',root:37,mode:'min',bpm:90,seed:113,prog:[0,6,5,6,0,3,5,4],name:'符文解碼'},
 worldclock:{st:'ambient',root:40,mode:'lyd',bpm:84,seed:127,prog:[0,1,4,0,1,4,3,0],name:'環球時區'},
 stopwatch:{st:'tension',root:33,mode:'min',bpm:132,seed:131,prog:[0,0,5,6,0,3,4,4],name:'極限計時'}
};
Object.keys(SC).forEach(k=>{const s=SC[k];s.id=k;const y=STY[s.st];s.rev=y.rev;s.wet=y.wet;s.gain=y.gain;s.feel=y.feel});

const semi=(m,i)=>{const a=MODES[m],o=Math.floor(i/7);return a[((i%7)+7)%7]+12*o};
function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
/* 和弦：b＝低音，t＝中音域四個和弦音 */
function chord(s,r){return{b:s.root+semi(s.mode,r>=4?r-7:r),t:[0,2,4,7].map(d=>s.root+12+semi(s.mode,r+d))}}

const TPL={
 long:[[1,0,0,0,0,0,0,0],[1,0,0,0,1,0,0,0],[1,0,0,1,0,0,1,0],[1,0,0,0,0,0,1,0]],
 sparse:[[1,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0],[1,0,0,0,0,1,0,0],[0,0,0,0,1,0,0,0]],
 mid:[[1,0,0,1,0,0,1,0],[1,0,0,0,1,0,0,1],[1,0,1,0,1,0,0,0],[1,0,0,1,0,1,0,0],[1,0,0,0,0,0,1,0]],
 busy:[[1,0,1,1,0,1,1,0],[1,1,0,1,0,1,0,1],[1,0,1,0,1,1,0,1],[1,0,0,1,1,0,1,0]],
 march:[[1,0,0,1,1,0,1,0],[1,0,1,1,0,0,1,0],[1,0,0,1,0,1,0,0],[1,0,1,0,1,0,1,0]]
};
/* 依種子生成 8 小節主旋律：每小節 8 個八分音符格，數字＝midi 音高，0＝延續前一音 */
function makeTheme(s){
 const R=rng(s.seed*7919+1),tp=TPL[s.feel]||TPL.mid,pick=()=>tp[Math.floor(R()*tp.length)];
 const a=pick(),b=pick(),c=pick(),d=pick(),rh=[a,a,a,c,b,b,d,[1,0,0,0,0,0,0,0]];
 let prev=23+Math.floor(R()*3);const idx=[];
 for(let k=0;k<8;k++){
  const r=s.prog[k%s.prog.length],ct=[r,r+2,r+4].map(x=>x%7),bar=[];
  for(let q=0;q<8;q++){
   if(!rh[k][q]){bar.push(null);continue}
   let n;
   if(k===7){n=prev>=25?28:21}
   else if(q===0||q===4){
    const cand=[];for(let o=21;o<=28;o++)if(ct.includes(o%7))cand.push(o);
    cand.sort((x,y)=>Math.abs(x-prev)-Math.abs(y-prev)+(R()-.5)*3);n=cand[0]
   }else{
    const st=[-2,-1,-1,1,1,2];let d2=st[Math.floor(R()*6)];
    if(prev>26&&d2>0)d2=-d2;if(prev<22&&d2<0)d2=-d2;n=prev+d2
   }
   n=Math.max(21,Math.min(28,n));bar.push(n);prev=n
  }
  idx.push(bar)
 }
 let sh=0,sum=0,cnt=0;idx.forEach(b=>b.forEach(x=>{if(x!=null){sum+=s.root+semi(s.mode,x);cnt++}}));
 let avg=sum/Math.max(1,cnt);while(avg+sh>84)sh-=12;while(avg+sh<68)sh+=12;
 return idx.map(b=>b.map(x=>x==null?0:s.root+semi(s.mode,x)+sh))
}
/* 每個頁面的「小節計畫」：段落（序曲 A／主題 B／橋段 C／高潮 D）、和弦、旋律、合唱長音 */
function makePlan(s){
 if(s.st==='home')return homePlan();
 const TH=makeTheme(s),plan=[],secs=[['A',4,.6],['B',8,.85],['C',8,.7],['D',8,1]];
 secs.forEach(([n,len,lv])=>{for(let j=0;j<len;j++){
  const off=n==='C'?4:0,r=s.prog[(j+off)%s.prog.length],c=chord(s,r);
  let cl=s.root+semi(s.mode,r+21);while(cl>86)cl-=12;while(cl<72)cl+=12;
  let th=null;if(n==='B'||n==='D')th=TH[j];else if(n==='A'&&j>=2)th=TH[j];
  plan.push({n,j,last:j===len-1,lv,b:c.b,t:c.t,th,cl})
 }});
 return plan
}
/* 首頁：保留原本手寫的「序曲 → 英雄主題 → 合唱橋段 → 全樂團高潮」 */
function homePlan(){
 const CH={D:{b:38,t:[50,54,57,62]},A:{b:45,t:[52,57,61,64]},Bm:{b:47,t:[54,59,62,66]},Fm:{b:42,t:[54,57,61,66]},G:{b:43,t:[55,59,62,67]},Em:{b:40,t:[52,55,59,64]}};
 const SEC=[{n:'A',lv:.6,ch:['D','A','Bm','G']},{n:'B',lv:.85,ch:['D','A','Bm','Fm','G','D','Em','A']},{n:'C',lv:.7,ch:['Bm','G','D','A','Bm','G','A','A']},{n:'D',lv:1,ch:['D','A','Bm','Fm','G','D','Em','A']}];
 const TH=[[74,0,0,78,0,0,81,0],[81,0,0,85,0,0,83,81],[78,0,0,81,0,0,83,0],[85,0,0,83,0,81,0,0],[79,0,0,83,0,0,86,0],[85,0,0,81,0,0,78,0],[79,0,81,0,83,0,85,0],[85,0,0,0,0,0,0,0]];
 const CL=[78,79,81,85,83,86,85,81],plan=[];
 SEC.forEach(s=>s.ch.forEach((nm,j)=>{
  const c=CH[nm];let th=null;
  if(s.n==='B'||s.n==='D')th=TH[j];else if(s.n==='A'&&j>=2)th=TH[j===2?2:4];
  plan.push({n:s.n,j,last:j===s.ch.length-1,lv:s.lv,b:c.b,t:c.t,th,cl:CL[j]})
 }));
 return plan
}

let ov=null;
const pathId=()=>{const p=location.pathname,m=p.match(/\/tools\/([^/]+)/);if(m&&SC[m[1]])return m[1];if(/\/console\//.test(p))return'console';if(/\/account\//.test(p))return'account';return'home'};
const id=()=>ov||pathId();
/* 音效用：這個場景的音階（八度＋）音高。deg 為音階級數（可超過 7） */
const note=(s,deg,oct)=>s.root+semi(s.mode,deg)+12*(oct||0);
window.NovaScenes={
 MODES,SC,
 ids:()=>Object.keys(SC),
 get:k=>SC[k]||SC.home,
 id,
 /* 暫時覆寫場景（例如登入關卡）；傳入 null 還原 */
 set(x){if(ov===x)return;ov=x;try{dispatchEvent(new CustomEvent('nova-scene',{detail:{id:id()}}))}catch(e){}},
 plan:makePlan,theme:makeTheme,chord,semi,note
};
})();
