/* ZAHTOOL BGM — 每個頁面各自一首原創配樂，以 Web Audio 即時合成，不需任何音檔。
   場景（曲風／調性／速度／旋律）定義在 nova-scenes.js：首頁、登入關卡、主控台、帳號、28 個工具各不相同。
   曲風：史詩管弦、電子琶音、水晶鈴聲、暗黑氛圍、弦樂脈衝、戰鼓追擊、軍樂進行曲、空靈氛圍、倒數緊張、重低音陷阱。
   開關與音量存在主控台設定（bgm.on / bgm.vol），會跟著雲端同步；進入登入關卡時會自動換成關卡配樂。 */
(()=>{
const AC=window.AudioContext||window.webkitAudioContext;if(!AC||!window.NovaSynth||!window.NovaScenes)return;
const NS=window.NovaScenes,C=window.novaConsole,D=document;
const cfg=()=>C?C.get().bgm:{on:true,vol:.4};
let sc=NS.get(NS.id()),B=60/sc.bpm,ST=B/2,S16=B/4,BAR=B*4,plan=[],TOTAL=1,sceneId=null;
let ctx,master,Y,bus=null,timer=0,playing=false,t0=0,cn=0,stopT=0,duckF=1,duckT=0;
const target=()=>Math.min(1,Math.max(0,cfg().vol))*.75*duckF*(sc.gain||1);
const OST=[0,1,2,1,0,1,2,3];

function init(){
 if(ctx)return;
 ctx=new AC();ctx.onstatechange=paint;
 const comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.knee.value=10;comp.ratio.value=6;comp.attack.value=.006;comp.release.value=.25;
 const mk=ctx.createGain();mk.gain.value=1.25;
 master=ctx.createGain();master.gain.value=0;master.connect(comp);comp.connect(mk);mk.connect(ctx.destination);
}
/* 進入場景：建立專屬的音色庫與音量匯流排；舊場景淡出、新場景淡入 */
function enter(id){
 sceneId=id;sc=NS.get(id);B=60/sc.bpm;ST=B/2;S16=B/4;BAR=B*4;plan=NS.plan(sc);TOTAL=plan.length;
 const old=bus,now=ctx.currentTime;
 bus=ctx.createGain();bus.gain.setValueAtTime(0,now);bus.connect(master);
 Y=NovaSynth.create(ctx,bus,{rev:sc.rev,wet:sc.wet,echo:B*.75});
 bus.gain.linearRampToValueAtTime(1,now+(old?.9:.05));
 if(old){old.gain.cancelScheduledValues(now);old.gain.setValueAtTime(old.gain.value,now);old.gain.linearRampToValueAtTime(0,now+.7);setTimeout(()=>{try{old.disconnect()}catch(e){}},8000)}
 t0=now+(old?.45:.2);cn=0;
 if(playing)fade(target(),.5);
 paint()
}

/* ───────── 共用：主旋律 ───────── */
function theme(arr,t,v,o,voice){
 let s=0;
 while(s<8){
  if(arr[s]){let e=s+1;while(e<8&&!arr[e])e++;
   voice(arr[s]+(o||0),t+s*ST,(e-s)*ST*.96+(e===8?.06:0),v);s=e
  }else s++
 }
}
const V={
 brass:(n,at,d,v)=>{Y.brass(n,at,d,v);Y.brass(n-12,at,d,v*.55)},
 hymn:(n,at,d,v)=>{Y.choir(n,at,d*1.05,v*.55);Y.strings(n,at,d*1.05,v*.45);Y.strings(n-12,at,d*1.05,v*.3);Y.bell(n+12,at,v*.25,1.4)},
 synth:(n,at,d,v)=>{Y.synth(n,at,d,v*.75,{type:'sawtooth',det:[-10,10],cut:5200});Y.synth(n+12,at,d,v*.25,{type:'square',cut:3600})},
 bell:(n,at,d,v)=>{Y.bell(n+12,at,v*.8,2);Y.pluck(n,at,v*.55)},
 dark:(n,at,d,v)=>{Y.choir(n,at,d*1.05,v*.5);Y.brass(n,at,d,v*.8);Y.brass(n-12,at,d,v*.5)},
 pluck:(n,at,d,v)=>{Y.pluck(n,at,v*1.3);Y.bell(n+12,at,v*.25,1.6)},
 bright:(n,at,d,v)=>{Y.brass(n,at,d,v);Y.brass(n+12,at,d,v*.35);Y.bell(n+12,at,v*.3,1.1)}
};

/* ───────── 曲風 1：史詩管弦（首頁／文字／文章長度／BMI） ───────── */
function orch(p,t){
 const{n,j,last,lv,b}=p,c=p.t,T0=sc.root,vr=sc.var||'epic',hy=vr==='hymn',lead=hy?V.hymn:V.brass,tv=hy?.55:1;
 c.forEach(x=>Y.strings(x,t,BAR*1.04,(hy?.034:.026)*lv));
 if(!(n==='A'&&j<2))Y.bass(b,t,BAR*.97,.12*lv);
 if(n==='A'){Y.timp(t,.3*tv,T0);if(last)Y.timpRoll(t+B*2,B*2,.15*tv,.5*tv,T0)}
 else if(n==='B'){Y.timp(t,.5*tv,T0);Y.timp(t+B*2,.36*tv,T0+7)}
 else if(n==='D'){Y.timp(t,.62*tv,T0);Y.timp(t+B*1.5,.4*tv,T0+7);Y.timp(t+B*2,.5*tv,T0);Y.timp(t+B*3,.4*tv,T0+7);Y.timp(t+B*3.5,.34*tv,T0+12)}
 else Y.timp(t,.3*tv,T0);
 if(n!=='C'){
  if(hy)for(let s=0;s<8;s++)Y.pluck(c[OST[s]]+12,t+s*ST,.03*lv);
  else for(let s=0;s<8;s++)Y.spicc(c[OST[s]],t+s*ST,(n==='A'?.016:n==='B'?.028:.038)*(s%2?.75:1))
 }
 if(vr==='brassy'&&(n==='B'||n==='D')){Y.brass(c[0],t,B*.9,.05*lv);Y.brass(c[2],t+B*2,B*.9,.05*lv);Y.snare(t+B*3,.1);Y.snare(t+B*3.5,.12)}
 if(n==='B'){theme(p.th,t,hy?.09:.1,0,lead);if(j===0||j===4)Y.bell(c[3]+24,t,.04,2)}
 else if(n==='D'){theme(p.th,t,hy?.1:.115,0,lead);
  p.th.forEach((x,s)=>{if(x){Y.choir(x-12,t+s*ST,ST*2.2,.03);Y.bell(x+12,t+s*ST,.03,1.2)}});
  c.forEach(x=>Y.brass(x+12,t,BAR*.95,hy?.018:.03))}
 else if(n==='A'&&j>=2)theme(p.th,t,.06,-12,lead);
 else if(n==='C'){
  c.forEach(x=>Y.choir(x+12,t,BAR*1.02,.04));Y.choir(p.cl,t,BAR*1.02,.05);
  if(j>=4)Y.brass(p.cl-12,t+B*.5,BAR*.85,.055)
 }
 if(n==='A'||n==='C')[0,3,6].forEach(s=>Y.bell(c[(s+j)%4]+24,t+s*ST,.022*lv,1.5));
 if(j===0){
  if(n==='B'||n==='D'){Y.crash(t,.34,3.4);Y.boom(t,.6)}
  else if(n==='C'){Y.crash(t,.2,3);Y.boom(t,.4)}
  else Y.crash(t,.18,2.6)
 }
 if(j===4&&(n==='B'||n==='D'))Y.crash(t,.2,2.2);
 if(last){
  if(n==='A'){Y.riser(t,BAR,.2);Y.revCrash(t+B*2,B*2,.2)}
  else if(n==='C'){Y.riser(t,BAR,.24);Y.roll(t+B*2,B*2,.05,.2)}
  else if(n==='B')Y.revCrash(t+B*2,B*2,.16);
  else{Y.roll(t+B*2,B*2,.04,.16);Y.revCrash(t+B*2,B*2,.16)}
 }
}

/* ───────── 曲風 2：電子琶音（主控台／JSON／QR／UUID／進位） ───────── */
function arp(p,t){
 const{n,j,last,lv,b}=p,c=p.t,PAT=[0,1,2,3,2,1,2,3,0,1,2,3,2,1,3,2];
 if(n!=='C')for(let s=0;s<8;s++)Y.synth(b,t+s*ST,ST*.9,.08*lv,{type:'sawtooth',det:[-6,6],cut:420,q:2,dry:true});
 else{c.forEach(x=>Y.pad(x,t,BAR,.03));Y.bass(b,t,BAR*.97,.1)}
 for(let s=0;s<16;s++){
  if(n==='C'&&s%2)continue;
  Y.synth(c[PAT[s]]+12,t+s*S16,S16*.8,(n==='A'?.03:.042)*lv*(s%4===0?1.3:1),{type:'square',det:[-5,5],cut:2600+lv*2500,q:6})
 }
 if(n==='B'||n==='D'){for(let q=0;q<4;q++){Y.kick(t+q*B,.5*lv);Y.hat(t+q*B+B*.5,.05,q%2===1)}}
 if(n==='D'){Y.clap(t+B,.2);Y.clap(t+B*3,.2);theme(p.th,t,.1,0,V.synth)}
 if(n==='B')theme(p.th,t,.07,0,V.synth);
 if(n==='A'&&j>=2)theme(p.th,t,.05,0,V.bell);
 if(j===0){Y.crash(t,n==='D'?.3:.18,2.6);if(n==='B'||n==='D')Y.boom(t,.5)}
 if(last){Y.riser(t,BAR,n==='C'?.28:.18);if(n==='C'||n==='D')for(let s=0;s<8;s++)Y.hat(t+B*2+s*ST/2,.03+s*.006)}
}

/* ───────── 曲風 3：水晶鈴聲（帳號／圖片壓縮／顏色轉換） ───────── */
function crystal(p,t){
 const{n,j,last,lv,b}=p,c=p.t,T0=sc.root,PAT=[0,1,2,3,2,1,2,1];
 c.forEach(x=>Y.strings(x,t,BAR*1.04,.022*lv));Y.bass(b,t,BAR*.97,.08*lv);
 for(let s=0;s<8;s++)Y.pluck(c[PAT[s]]+12,t+s*ST,(n==='A'?.03:.045)*lv);
 if(n==='B'||n==='D')theme(p.th,t,n==='D'?.075:.055,0,V.bell);
 if(n==='C'||n==='D')c.forEach(x=>Y.choir(x+12,t,BAR,.025*lv));
 if(n==='D'){Y.timp(t,.35,T0);Y.timp(t+B*2,.28,T0+7)}
 [1,4,7].forEach(s=>Y.bell(c[(j+s)%4]+36,t+s*ST,.02*lv,2.2));
 if(j===0){Y.crash(t,.12,3);Y.bell(c[3]+24,t,.05,3)}
 if(last)Y.revCrash(t+B*2,B*2,.14)
}

/* ───────── 曲風 4：暗黑氛圍（登入關卡／密碼／正規表示式） ───────── */
function dark(p,t){
 const{n,j,last,lv,b}=p,c=p.t,T0=sc.root,hv=n==='A'?.35:n==='D'?.7:.5;
 if(j%2===0)Y.drone(b,t,BAR*2,.07*lv);
 Y.timp(t,hv,T0);Y.timp(t+B*.75,hv*.7,T0);
 if(n==='B'||n==='D'){Y.timp(t+B*2,hv*.8,T0);Y.timp(t+B*2.75,hv*.55,T0)}
 [c[0]-12,c[1]-12,c[2]-12].forEach(x=>Y.strings(x,t,BAR*1.04,.03*lv));
 if(n!=='A')c.forEach(x=>Y.choir(x,t,BAR*1.02,.026*lv));
 if(n==='B')theme(p.th,t,.07,-12,V.dark);
 if(n==='D'){theme(p.th,t,.1,-12,V.dark);Y.brass(b+12,t,BAR*.9,.05)}
 if(n==='A'||n==='C')Y.bell(c[(j*2)%4]+25,t+B*(1+j%3),.03,3);
 if(j===0){Y.gong(b+12,t,n==='D'?.2:.12,5);if(n==='D')Y.boom(t,.8)}
 if(n==='D'&&j%4===3)Y.boom(t+B*3,.5);
 if(last){Y.riser(t,BAR,.26);Y.revCrash(t+B*2,B*2,.2)}
}

/* ───────── 曲風 5：弦樂脈衝（Base64／日期計算／文字行／百分比） ───────── */
function pulse(p,t){
 const{n,j,last,lv,b}=p,c=p.t,T0=sc.root,PAT=[0,1,2,1,3,2,1,2,0,1,2,1,3,2,3,1];
 for(let s=0;s<16;s++)Y.spicc(c[PAT[s]],t+s*S16,(n==='A'?.012:n==='B'?.02:n==='C'?.014:.028)*lv*(s%4===0?1.6:1));
 Y.bass(b,t,BAR*.97,.13*lv);
 if(n==='B'||n==='D'){Y.timp(t,.5,T0);Y.timp(t+B*2,.4,T0+7)}
 if(n==='D'){Y.timp(t+B,.28,T0);Y.timp(t+B*3,.3,T0+7);theme(p.th,t,.11,0,V.brass);c.forEach(x=>Y.choir(x+12,t,BAR,.03));c.forEach(x=>Y.brass(x,t,BAR*.9,.03))}
 if(n==='B')theme(p.th,t,.08,0,V.bright);
 if(n==='C'){c.forEach(x=>Y.choir(x+12,t,BAR,.035));Y.bell(c[(j*3)%4]+24,t,.04,2)}
 if(n==='A'&&j>=2)theme(p.th,t,.05,-12,V.pluck);
 if(j===0){Y.crash(t,n==='D'||n==='B'?.3:.16,3);if(n==='B'||n==='D')Y.boom(t,.55)}
 if(last){Y.riser(t,BAR,.22);if(n==='B'||n==='D')Y.roll(t+B*2,B*2,.04,.17)}
}

/* ───────── 曲風 6：戰鼓追擊（URL／SEO／多重搜尋） ───────── */
function drive(p,t){
 const{n,j,last,lv,b}=p,c=p.t,T0=sc.root,G=[1,0,1,1,0,1,0,1],PAT=[0,2,1,3,0,2,1,3,0,2,1,3,0,2,3,1];
 if(n==='B'||n==='D'){G.forEach((x,s)=>{if(x){Y.timp(t+s*ST,(s===0?.6:.4)*lv,T0);if(s%4===0)Y.boom(t+s*ST,.25,.4)}})}
 else{Y.timp(t,.4,T0);Y.timp(t+B*2,.3,T0+7)}
 [0,3,6].forEach(s=>{Y.brass(b+12,t+s*ST,ST*.7,.06*lv);Y.brass(b+19,t+s*ST,ST*.7,.04*lv)});
 Y.bass(b,t,BAR*.97,.12*lv);
 if(n!=='C')for(let s=0;s<16;s++)Y.spicc(c[PAT[s]],t+s*S16,(n==='A'?.01:.018)*lv);
 if(n==='D'){Y.snare(t+B,.22);Y.snare(t+B*3,.22);theme(p.th,t,.115,0,V.brass)}
 if(n==='B'){Y.snare(t+B*3,.16);theme(p.th,t,.09,0,V.brass)}
 if(n==='C'){c.forEach(x=>Y.choir(x+12,t,BAR,.04));c.forEach(x=>Y.strings(x,t,BAR,.03))}
 if(j===0){Y.crash(t,n==='D'?.36:.22,3);Y.boom(t,.55)}
 if(last){Y.riser(t,BAR,.24);Y.roll(t+B*2,B*2,.05,.2)}
}

/* ───────── 曲風 7：軍樂進行曲（大小寫轉換／單位換算） ───────── */
function march(p,t){
 const{n,j,last,lv,b}=p,c=p.t,T0=sc.root;
 for(let q=0;q<4;q++){
  Y.snare(t+q*B,.12*lv);Y.snare(t+q*B+B*.75,.07*lv);if(q%2===0)Y.snare(t+q*B+B*.5,.08*lv);
  if(q%2===0)Y.bass(b,t+q*B,B*.9,.12*lv);else Y.bass(b+7,t+q*B,B*.9,.1*lv);
  if(q%2===1)c.forEach(x=>Y.brass(x,t+q*B,B*.4,.025*lv))
 }
 if(n!=='A'){Y.timp(t,.5,T0);Y.timp(t+B*2,.4,T0+7)}
 c.forEach(x=>Y.strings(x,t,BAR*1.04,.018*lv));
 if(n==='B'||n==='D')theme(p.th,t,n==='D'?.115:.095,0,V.bright);
 if(n==='D'){c.forEach(x=>Y.brass(x+12,t+B*.5,B*.5,.03));Y.crash(t+B*2,.16,1.6)}
 if(n==='A'&&j>=2)theme(p.th,t,.06,0,V.bell);
 if(n==='C'){c.forEach(x=>Y.choir(x+12,t,BAR,.035));Y.choir(p.cl,t,BAR,.04)}
 if(j===0){Y.crash(t,n==='D'||n==='B'?.32:.18,3);if(n==='B'||n==='D')Y.boom(t,.5)}
 if(last){Y.roll(t+B*2,B*2,.05,.2);Y.revCrash(t+B*2,B*2,.16)}
}

/* ───────── 曲風 8：空靈氛圍（備忘錄／漸層／世界時鐘） ───────── */
function ambient(p,t){
 const{n,j,last,lv,b}=p,c=p.t,T0=sc.root;
 c.forEach(x=>Y.pad(x,t,BAR*1.02,.026*lv));Y.bass(b,t,BAR*.97,.07*lv);
 if(p.th)theme(p.th,t,n==='A'?.04:.06,0,V.pluck);
 [2,5].forEach(s=>Y.bell(c[(j*3+s)%4]+24,t+s*ST,.022*lv,2.4));
 if(n==='D')c.forEach(x=>Y.strings(x,t,BAR*1.04,.02));
 if(n==='C')c.forEach(x=>Y.choir(x+12,t,BAR,.022));
 if(j===0){Y.bell(c[3]+24,t,.05,3);if(n==='B'||n==='D')Y.timp(t,.25,T0)}
 if(last)Y.riser(t,BAR,.12)
}

/* ───────── 曲風 9：倒數緊張（番茄鐘／時間戳／碼表） ───────── */
function tension(p,t){
 const{n,j,last,lv,b}=p,c=p.t;
 for(let q=0;q<4;q++){Y.tick(t+q*B,(q===0?.12:.07)*(.6+lv*.6));Y.hat(t+q*B+B*.5,.02*lv)}
 Y.drone(b,t,BAR,.06);
 for(let s=0;s<8;s++)Y.spicc(c[s%2?2:0],t+s*ST,.012*lv*(s%2?.7:1)*(n==='A'?.7:1.2));
 if(n==='B'||n==='D')theme(p.th,t,.07,0,V.bell);
 if(n==='D'){[0,2].forEach(i=>Y.brass(c[i]+12,t+B*.5,B*.3,.06));[0,2].forEach(i=>Y.brass(c[i]+12,t+B*2.5,B*.3,.05));if(j%4===0)Y.boom(t,.6)}
 if(n==='C')c.forEach(x=>Y.strings(x,t,BAR*1.04,.03));
 if(j===0){Y.crash(t,n==='D'?.3:.16,2.6);Y.boom(t,.4)}
 if(last){Y.riser(t,BAR,.24);Y.roll(t+B*2,B*2,.04,.18)}
}

/* ───────── 曲風 10：重低音陷阱（隨機抽籤／貸款試算） ───────── */
function trap(p,t){
 const{n,j,last,lv,b}=p,c=p.t,K=[1,0,0,0,0,1,0,0],K2=[1,0,0,1,0,0,1,0];
 if(n!=='C'){
  const kp=n==='D'?K2:K;
  kp.forEach((x,s)=>{if(x){Y.kick(t+s*ST,.55*lv);Y.sub808(b,t+s*ST,ST*1.8,.32*lv)}});
  if(n!=='A')Y.clap(t+B*2,.22);
  for(let s=0;s<16;s++)Y.hat(t+s*S16,(s%4===0?.05:.03)*lv,n==='D'&&s%8===6)
 }else{c.forEach(x=>Y.pad(x,t,BAR,.03));Y.sub808(b,t,BAR*.9,.22)}
 if(n==='B'||n==='D')theme(p.th,t,n==='D'?.1:.075,0,V.bell);
 if(n==='A'&&j>=2)theme(p.th,t,.05,0,V.bell);
 if(n==='D'){[0,3].forEach(s=>{Y.brass(c[0]+12,t+s*ST,ST*.8,.07);Y.brass(c[2]+12,t+s*ST,ST*.8,.05)})}
 if(j===0){Y.crash(t,n==='D'?.34:.2,2.8);Y.boom(t,n==='D'?.7:.4)}
 if(last){Y.riser(t,BAR,.24);for(let s=0;s<12;s++)Y.hat(t+B*3+s*B/12,.03+s*.004)}
}
const STY={home:orch,orch,arp,bell:crystal,dark,pulse,drive,march,ambient,tension,trap};

function sched(){
 if(!playing||!ctx)return;
 const h=ctx.currentTime+1.6;
 while(t0+cn*BAR<h){const k=cn%TOTAL,fn=STY[sc.st]||orch;fn(plan[k],t0+cn*BAR);cn++}
}
function fade(v,d){
 if(!ctx)return;const n=ctx.currentTime;master.gain.cancelScheduledValues(n);master.gain.setValueAtTime(master.gain.value,n);master.gain.linearRampToValueAtTime(v,n+d)
}
function play(){
 if(playing)return;clearTimeout(stopT);init();
 if(ctx.state==='suspended')ctx.resume().then(paint).catch(()=>{});
 enter(NS.id());
 playing=true;
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
/* 環節切換（例如登入關卡出現／消失）：換成該環節的配樂 */
addEventListener('nova-scene',e=>{
 const id=(e.detail&&e.detail.id)||NS.id();
 if(id===sceneId&&playing)return;
 if(playing&&ctx){enter(id);sched()}else{sc=NS.get(id);paint()}
});

/* 介面：左下角音樂鈕＋滑動音量 */
let btn,vol,wrap;
function paint(){
 if(!btn)return;
 const on=cfg().on,live=on&&ctx&&ctx.state==='running';
 btn.classList.toggle('off',!on);btn.classList.toggle('wait',on&&!live);btn.classList.toggle('live',!!live);
 const label=(!on?'開啟背景音樂':live?'關閉背景音樂':'點一下開始播放背景音樂')+'・'+sc.name;
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
  if(cfg().on&&ctx&&ctx.state!=='running'){ctx.resume().then(paint);if(window.novaSfx)novaSfx.play('power');return}
  cfg().on=!cfg().on;if(C)C.save();apply();if(window.novaSfx)novaSfx.play(cfg().on?'power':'powerdown')
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
