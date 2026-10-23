/* ZAHTOOL 電影級合成器：銅管、弦樂、合唱、定音鼓、重擊、爬升、銅鈸…全部用 Web Audio 即時合成，不需任何音檔。
   音效（nova-sfx.js）與背景音樂（nova-bgm.js）共用。 */
(()=>{
const mtof=n=>440*Math.pow(2,(n-69)/12);
function makeIR(ctx,sec){
 const sr=ctx.sampleRate,len=Math.floor(sr*sec),ir=ctx.createBuffer(2,len,sr),pre=Math.floor(sr*.018);
 for(let c=0;c<2;c++){const d=ir.getChannelData(c);let p=0;
  for(let i=pre;i<len;i++){const x=i-pre,k=Math.pow(1-x/(len-pre),2.4);p=p*.55+(Math.random()*2-1)*.45;d[i]=p*k}}
 return ir
}
function create(ctx,out,o){
 o=o||{};
 const dry=ctx.createGain();dry.connect(out);
 const rv=ctx.createConvolver();rv.buffer=makeIR(ctx,o.rev||4.6);
 const rvIn=ctx.createGain(),rvOut=ctx.createGain();rvOut.gain.value=o.wet==null?.6:o.wet;rvIn.connect(rv);rv.connect(rvOut);rvOut.connect(out);
 const bus=(wet,vol)=>{const g=ctx.createGain();g.gain.value=vol==null?1:vol;g.connect(dry);if(wet){const s=ctx.createGain();s.gain.value=wet;g.connect(s);s.connect(rvIn)}return g};
 const brassBus=bus(.45),strBus=bus(.6),percBus=bus(.3),fxBus=bus(.45),bellBus=bus(.55),bassBus=bus(.08);
 /* 合唱：鋸齒波通過「啊」母音共振峰 */
 const chIn=ctx.createGain();[[800,6,1],[1180,7,.6],[2850,9,.22]].forEach(a=>{const f=ctx.createBiquadFilter(),g=ctx.createGain();f.type='bandpass';f.frequency.value=a[0];f.Q.value=a[1];g.gain.value=a[2]*2.2;chIn.connect(f);f.connect(g)
  ;g.connect(bus(.85))});
 /* 鈴／豎琴的回音 */
 const dl=ctx.createDelay(2),fb=ctx.createGain(),df=ctx.createBiquadFilter(),dw=ctx.createGain();dl.delayTime.value=(o.echo||.36);fb.gain.value=.34;df.type='lowpass';df.frequency.value=3000;dw.gain.value=.4;
 bellBus.connect(dl);dl.connect(df);df.connect(fb);fb.connect(dl);df.connect(dw);dw.connect(out);dw.connect(rvIn);
 const nb=ctx.createBuffer(1,ctx.sampleRate*4,ctx.sampleRate),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
 const noise=()=>{const s=ctx.createBufferSource();s.buffer=nb;return s};
 const osc=(type,f,c)=>{const x=ctx.createOscillator();x.type=type;x.frequency.value=f;if(c)x.detune.value=c;return x};
 const env=(g,t,a,v,d,r)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.setValueAtTime(v,t+Math.max(a,d));g.gain.linearRampToValueAtTime(0,t+d+r)};
 const S={mtof,
  /* 銅管：一開始明亮「噗」地衝出，再收斂到溫暖的持續音 */
  brass(n,t,d,v){v=v||.09;const f0=mtof(n),f=ctx.createBiquadFilter(),g=ctx.createGain();f.type='lowpass';f.Q.value=1.6;
   f.frequency.setValueAtTime(f0*1.3,t);f.frequency.linearRampToValueAtTime(Math.min(9000,f0*8),t+.07);f.frequency.exponentialRampToValueAtTime(Math.min(5000,f0*3.2),t+Math.min(d,.45)+.05);
   g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.045);g.gain.setValueAtTime(v*.86,t+Math.max(.06,d-.1));g.gain.linearRampToValueAtTime(0,t+d+.14);
   const vib=osc('sine',5.4);const vg=ctx.createGain();vg.gain.setValueAtTime(0,t);vg.gain.linearRampToValueAtTime(7,t+Math.max(.3,d*.8));vib.connect(vg);vib.start(t);vib.stop(t+d+.3);
   [-9,0,9].forEach(c=>{const x=osc('sawtooth',f0,c);vg.connect(x.detune);x.connect(f);x.start(t);x.stop(t+d+.3)});
   f.connect(g);g.connect(brassBus)},
  /* 弦樂（長音） */
  strings(n,t,d,v){v=v||.04;const f0=mtof(n),f=ctx.createBiquadFilter(),g=ctx.createGain(),vib=osc('sine',5.1),vg=ctx.createGain();f.type='lowpass';f.frequency.value=2600;vg.gain.value=6;vib.connect(vg);
   env(g,t,.45,v,d,.9);[-14,-5,5,14].forEach(c=>{const x=osc('sawtooth',f0,c);vg.connect(x.detune);x.connect(f);x.start(t);x.stop(t+d+1)});vib.start(t);vib.stop(t+d+1);f.connect(g);g.connect(strBus)},
  /* 弦樂（短促跳弓，做節奏推進） */
  spicc(n,t,v){v=v||.03;const f0=mtof(n),f=ctx.createBiquadFilter(),g=ctx.createGain();f.type='lowpass';f.frequency.setValueAtTime(4200,t);f.frequency.exponentialRampToValueAtTime(900,t+.2);
   g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+.2);
   [-7,7].forEach(c=>{const x=osc('sawtooth',f0,c);x.connect(f);x.start(t);x.stop(t+.25)});f.connect(g);g.connect(strBus)},
  choir(n,t,d,v){v=v||.05;const f0=mtof(n),g=ctx.createGain();env(g,t,.75,v,d,1.1);
   [-11,0,11].forEach(c=>{const x=osc('sawtooth',f0,c);x.connect(g);x.start(t);x.stop(t+d+1.2)});g.connect(chIn)},
  bass(n,t,d,v){v=v||.14;const f0=mtof(n),f=ctx.createBiquadFilter(),g=ctx.createGain();f.type='lowpass';f.frequency.value=620;f.Q.value=.8;
   env(g,t,.05,v,d,.25);[osc('sawtooth',f0),osc('square',f0,6)].forEach(x=>{x.connect(f);x.start(t);x.stop(t+d+.4)});
   const sub=osc('sine',f0/2),sg=ctx.createGain();env(sg,t,.08,v*1.25,d,.3);sub.connect(sg);sg.connect(bassBus);sub.start(t);sub.stop(t+d+.5);f.connect(g);g.connect(bassBus)},
  /* 定音鼓 */
  timp(t,v,n){v=v==null?.5:v;const f0=mtof(n||38),g=ctx.createGain(),x=osc('sine',f0*2.2),y=osc('triangle',f0*1.5),g2=ctx.createGain();
   x.frequency.setValueAtTime(f0*2.2,t);x.frequency.exponentialRampToValueAtTime(f0,t+.13);
   g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+1.5);
   g2.gain.setValueAtTime(0,t);g2.gain.linearRampToValueAtTime(v*.3,t+.004);g2.gain.exponentialRampToValueAtTime(.0001,t+.5);
   x.connect(g);y.connect(g2);g.connect(percBus);g2.connect(percBus);x.start(t);y.start(t);x.stop(t+1.6);y.stop(t+.6);
   const s=noise(),sf=ctx.createBiquadFilter(),sg=ctx.createGain();sf.type='lowpass';sf.frequency.value=1400;sg.gain.setValueAtTime(v*.5,t);sg.gain.exponentialRampToValueAtTime(.0001,t+.05);s.connect(sf);sf.connect(sg);sg.connect(percBus);s.start(t,Math.random()*2);s.stop(t+.08)},
  /* 電影式重擊：低頻轟＋噪音尾巴 */
  boom(t,v,k){v=v==null?.8:v;k=k||1;const x=osc('sine',95),g=ctx.createGain();x.frequency.setValueAtTime(95,t);x.frequency.exponentialRampToValueAtTime(30,t+.55*k);
   g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+2.4*k);x.connect(g);g.connect(percBus);x.start(t);x.stop(t+2.5*k);
   const s=noise(),f=ctx.createBiquadFilter(),ng=ctx.createGain();f.type='lowpass';f.frequency.setValueAtTime(1100,t);f.frequency.exponentialRampToValueAtTime(60,t+1.3*k);
   ng.gain.setValueAtTime(v*.5,t);ng.gain.exponentialRampToValueAtTime(.0001,t+1.4*k);s.connect(f);f.connect(ng);ng.connect(fxBus);s.start(t,Math.random()*2);s.stop(t+1.5*k)},
  crash(t,v,d){v=v==null?.35:v;d=d||3;const s=noise(),h=ctx.createBiquadFilter(),b=ctx.createBiquadFilter(),g=ctx.createGain();h.type='highpass';h.frequency.value=4200;b.type='peaking';b.frequency.value=7600;b.gain.value=6;
   g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(h);h.connect(b);b.connect(g);g.connect(fxBus);s.start(t,Math.random()*.5);s.stop(t+d+.05)},
  /* 爬升：噪音＋上滑鋸齒波，越來越亮越來越大 */
  riser(t,d,v){v=v==null?.3:v;const s=noise(),f=ctx.createBiquadFilter(),g=ctx.createGain();f.type='bandpass';f.Q.value=2.5;f.frequency.setValueAtTime(240,t);f.frequency.exponentialRampToValueAtTime(7000,t+d);
   g.gain.setValueAtTime(0,t);g.gain.exponentialRampToValueAtTime(v,t+d*.98);g.gain.linearRampToValueAtTime(0,t+d+.03);s.connect(f);f.connect(g);g.connect(fxBus);s.start(t,Math.random()*.5);s.stop(t+d+.05);
   const x=osc('sawtooth',110),y=osc('sawtooth',111.5),lf=ctx.createBiquadFilter(),g2=ctx.createGain();x.frequency.setValueAtTime(110,t);x.frequency.exponentialRampToValueAtTime(880,t+d);y.frequency.setValueAtTime(111.5,t);y.frequency.exponentialRampToValueAtTime(884,t+d);
   lf.type='lowpass';lf.frequency.setValueAtTime(300,t);lf.frequency.exponentialRampToValueAtTime(5200,t+d);g2.gain.setValueAtTime(0,t);g2.gain.exponentialRampToValueAtTime(v*.38,t+d*.98);g2.gain.linearRampToValueAtTime(0,t+d+.03);
   x.connect(lf);y.connect(lf);lf.connect(g2);g2.connect(fxBus);x.start(t);y.start(t);x.stop(t+d+.05);y.stop(t+d+.05)},
  /* 反向銅鈸：蓄力感 */
  revCrash(t,d,v){v=v==null?.22:v;const s=noise(),h=ctx.createBiquadFilter(),g=ctx.createGain();h.type='highpass';h.frequency.setValueAtTime(2200,t);h.frequency.exponentialRampToValueAtTime(6500,t+d);
   g.gain.setValueAtTime(.0005,t);g.gain.exponentialRampToValueAtTime(v,t+d);g.gain.linearRampToValueAtTime(0,t+d+.02);s.connect(h);h.connect(g);g.connect(fxBus);s.start(t,Math.random()*.5);s.stop(t+d+.05)},
  snare(t,v){v=v==null?.18:v;const s=noise(),f=ctx.createBiquadFilter(),g=ctx.createGain(),x=osc('triangle',190),g2=ctx.createGain();f.type='bandpass';f.frequency.value=1900;f.Q.value=.8;
   g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.17);g2.gain.setValueAtTime(v*.6,t);g2.gain.exponentialRampToValueAtTime(.0001,t+.1);
   s.connect(f);f.connect(g);g.connect(percBus);x.connect(g2);g2.connect(percBus);s.start(t,Math.random()*2);s.stop(t+.2);x.start(t);x.stop(t+.12)},
  roll(t,d,v0,v1){let k=0,x=0;const iv=.1;while(x<d){const p=x/d;S.snare(t+x,v0+(v1-v0)*p);x+=iv*(1-p*.65);k++}},
  timpRoll(t,d,v0,v1,n){let x=0;while(x<d){const p=x/d;S.timp(t+x,v0+(v1-v0)*p,n);x+=.12*(1-p*.5)}},
  /* 鈴／豎琴撥奏：亮晶晶的點綴 */
  bell(n,t,v,dec){v=v||.05;dec=dec||1.8;const f0=mtof(n),g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+dec);
   [[1,1],[2.76,.28],[5.4,.1]].forEach(a=>{const x=osc('sine',f0*a[0]),ag=ctx.createGain();ag.gain.value=a[1];x.connect(ag);ag.connect(g);x.start(t);x.stop(t+dec+.05)});g.connect(bellBus)},
  pluck(n,t,v){v=v||.06;const f0=mtof(n),f=ctx.createBiquadFilter(),g=ctx.createGain(),x=osc('triangle',f0),y=osc('sine',f0*2);f.type='lowpass';f.frequency.setValueAtTime(3600,t);f.frequency.exponentialRampToValueAtTime(800,t+.5);
   g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+1.5);const yg=ctx.createGain();yg.gain.value=.25;x.connect(f);y.connect(yg);yg.connect(f);f.connect(g);g.connect(bellBus);x.start(t);y.start(t);x.stop(t+1.6);y.stop(t+1.6)},
  tick(t,v){v=v||.1;const x=osc('sine',170),g=ctx.createGain();x.frequency.setValueAtTime(170,t);x.frequency.exponentialRampToValueAtTime(70,t+.08);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+.12);x.connect(g);g.connect(percBus);x.start(t);x.stop(t+.14);
   const y=osc('triangle',2100),g2=ctx.createGain();g2.gain.setValueAtTime(v*.35,t);g2.gain.exponentialRampToValueAtTime(.0001,t+.04);y.connect(g2);g2.connect(bellBus);y.start(t);y.stop(t+.06)}
 };
 return S
}
window.NovaSynth={create,mtof}
})();
