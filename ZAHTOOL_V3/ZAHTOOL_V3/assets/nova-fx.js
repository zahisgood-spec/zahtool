/* ZAHTOOL FX v3 — shared cinematic engine (no dependencies) */
(()=>{'use strict';
const D=document,B=D.body,H=D.documentElement,RM=matchMedia('(prefers-reduced-motion:reduce)').matches,FINE=matchMedia('(pointer:fine)').matches;
if(RM)return;
const L=(a,b,t)=>a+(b-a)*t,$=(s)=>[...D.querySelectorAll(s)],IDX=!!B.dataset.s;
const ACC=(getComputedStyle(H).getPropertyValue('--motion-accent').trim())||'#a58bff';
const hex=s=>{s=s.replace('#','');if(s.length===3)s=[...s].map(c=>c+c).join('');const n=parseInt(s,16);return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]};
const M={x:.5,y:.5,px:0,py:0},tasks=[];let BOOM=()=>{};
addEventListener('pointermove',e=>{M.px=e.clientX;M.py=e.clientY;M.x=e.clientX/innerWidth;M.y=1-e.clientY/innerHeight},{passive:true});
const HIT='a,button,summary,select,.upload,.card,[role=button]',MAG='.cta,.primary,.pill-btn,.ghost,.chip,.brand .logo';
const FS=`#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 R,M;uniform float T;uniform vec3 A;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.02+vec2(1.7,9.2);a*=.5;}return v;}
void main(){vec2 asp=vec2(R.x/R.y,1.);vec2 q=(gl_FragCoord.xy/R-.5)*asp,m=(M-.5)*asp;float t=T*.05;
vec2 w=vec2(fbm(q*1.6+t),fbm(q*1.6-t+5.));float f=fbm(q*1.4+w*1.9+t);
vec3 c=mix(vec3(.36,.24,.9),vec3(.1,.7,.95),smoothstep(.25,.75,f));c=mix(c,A,smoothstep(.35,.9,w.x)*.9);c*=1.35;
float g=exp(-length(q-m)*2.4)*.4,vig=smoothstep(1.3,.15,length(q));float a=clamp((f*f*1.6+g*1.6+.08)*vig,0.,1.);
gl_FragColor=vec4(c*a,a);}`;
/* 1 · aurora flow-field shader */
function aurora(){const c=D.createElement('canvas');c.className='fx-aurora';c.setAttribute('aria-hidden','true');B.prepend(c);
const g=c.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power'});if(!g){c.remove();return}
const sh=(t,s)=>{const o=g.createShader(t);g.shaderSource(o,s);g.compileShader(o);return o},p=g.createProgram();
g.attachShader(p,sh(g.VERTEX_SHADER,'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'));g.attachShader(p,sh(g.FRAGMENT_SHADER,FS));g.linkProgram(p);
if(!g.getProgramParameter(p,g.LINK_STATUS)){c.remove();return}
g.useProgram(p);g.bindBuffer(g.ARRAY_BUFFER,g.createBuffer());g.bufferData(g.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),g.STATIC_DRAW);
const l=g.getAttribLocation(p,'p');g.enableVertexAttribArray(l);g.vertexAttribPointer(l,2,g.FLOAT,false,0,0);
const U=n=>g.getUniformLocation(p,n),uR=U('R'),uM=U('M'),uT=U('T'),A=hex(ACC);g.uniform3fv(U('A'),A);
let w,h,mx=.5,my=.5;const rs=()=>{const k=Math.min(devicePixelRatio||1,1)*.6;w=c.width=Math.max(2,innerWidth*k|0);h=c.height=Math.max(2,innerHeight*k|0);g.viewport(0,0,w,h)};rs();addEventListener('resize',rs);
tasks.push(t=>{mx=L(mx,M.x,.04);my=L(my,M.y,.04);g.uniform2f(uR,w,h);g.uniform2f(uM,mx,my);g.uniform1f(uT,t%600);g.drawArrays(g.TRIANGLES,0,3)})}
/* 2 · cursor ring + magnetic pull */
function cursor(){if(!FINE)return;const o=D.createElement('i');o.className='fx-orb';B.append(o);let ox=innerWidth/2,oy=innerHeight/2;tasks.push(()=>{ox=L(ox,M.px,.07);oy=L(oy,M.py,.07);o.style.transform=`translate3d(${ox}px,${oy}px,0) translate(-50%,-50%)`});const r=D.createElement('i'),d=D.createElement('i');r.className='fx-ring';d.className='fx-dot';B.append(r,d);
let x=-99,y=-99,rx=x,ry=y;addEventListener('pointermove',e=>{x=e.clientX;y=e.clientY;r.classList.toggle('hot',!!(e.target.closest&&e.target.closest(HIT)))},{passive:true});
tasks.push(()=>{rx=L(rx,x,.16);ry=L(ry,y,.16);r.style.transform=`translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;d.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%)`});
const mg=new Map();D.addEventListener('pointermove',e=>{const el=e.target.closest&&e.target.closest(MAG);mg.forEach((m,k)=>{if(k!==el)m.tx=m.ty=0});if(!el)return;const b=el.getBoundingClientRect();let m=mg.get(el);if(!m)mg.set(el,m={x:0,y:0,tx:0,ty:0});m.tx=(e.clientX-b.left-b.width/2)*.3;m.ty=(e.clientY-b.top-b.height/2)*.4},{passive:true});
tasks.push(()=>mg.forEach((m,el)=>{m.x=L(m.x,m.tx,.15);m.y=L(m.y,m.ty,.15);el.style.translate=`${m.x}px ${m.y}px`;if(!m.tx&&!m.ty&&Math.abs(m.x)+Math.abs(m.y)<.1){el.style.translate='';mg.delete(el)}}))}
/* 3 · spotlight glare, kinetic titles, scramble kickers, live-value pops */
function type(){$('.card,.tool-card,.glass,.mock,.workspace,.nova-tool-stage').forEach(e=>e.classList.add('fx-glare'));
D.addEventListener('pointermove',e=>{const c=e.target.closest&&e.target.closest('.fx-glare');if(!c)return;const r=c.getBoundingClientRect();c.style.setProperty('--gx',e.clientX-r.left+'px');c.style.setProperty('--gy',e.clientY-r.top+'px')},{passive:true});
const G='ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#/<>*',scr=el=>{const s=el.dataset.t,n=s.length,t0=performance.now();(function f(){const p=Math.min(1,(performance.now()-t0)/900);el.textContent=p<1?[...s].map((c,i)=>c===' '||i<p*n*1.2-1?c:G[Math.random()*G.length|0]).join(''):s;if(p<1)requestAnimationFrame(f)})()};
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;io.unobserve(e.target);e.target.classList.add('in');if(e.target.dataset.t)scr(e.target)}),{threshold:.2});
$(IDX?'.shell h2,.thead h2':'h1,.head h2').forEach(e=>{e.classList.add('fx-wipe');io.observe(e)});
$('.kicker,.nova-stage-kicker').forEach(e=>{if(e.children.length)return;e.dataset.t=e.textContent;io.observe(e)});
$('.stat strong,.result,.output').forEach(e=>new MutationObserver(()=>{e.classList.remove('fx-pop');void e.offsetWidth;e.classList.add('fx-pop')}).observe(e,{childList:true,characterData:true,subtree:true}));
const pr=D.createElement('i');pr.className='fx-prog';B.append(pr);tasks.push(()=>{const m=H.scrollHeight-innerHeight;pr.style.transform=`scaleX(${m>0?scrollY/m:0})`})}
/* 4 · click burst (particles + shockwave ring) */
function burst(){const c=D.createElement('canvas');c.className='fx-burst';B.append(c);const x=c.getContext('2d');let P=[],on=0;
const rs=()=>{c.width=innerWidth;c.height=innerHeight};rs();addEventListener('resize',rs);
D.addEventListener('pointerdown',e=>{if(!(e.target.closest&&e.target.closest(HIT)))return;for(let i=0;i<18;i++){const a=Math.random()*6.283,v=2+Math.random()*5;P.push({x:e.clientX,y:e.clientY,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1,l:1,s:1.5+Math.random()*2.5})}P.push({x:e.clientX,y:e.clientY,ring:1,l:1});on=1});
tasks.push(()=>{if(!on)return;x.clearRect(0,0,c.width,c.height);P=P.filter(p=>p.l>0);
for(const p of P){p.l-=.028;if(p.ring){x.strokeStyle=ACC;x.globalAlpha=Math.max(0,p.l)*.6;x.lineWidth=2;x.beginPath();x.arc(p.x,p.y,(1-p.l)*70,0,6.283);x.stroke();continue}
p.x+=p.vx;p.y+=p.vy;p.vx*=.95;p.vy=p.vy*.95+.12;x.globalAlpha=Math.max(0,p.l);x.fillStyle=ACC;x.beginPath();x.arc(p.x,p.y,p.s*Math.max(0,p.l),0,6.283);x.fill()}
if(!P.length){on=0;x.clearRect(0,0,c.width,c.height)}})}
/* 5 · iris page transitions (between pages and between home screens) */
function trans(){const cv=D.createElement('div');cv.className='fx-cover'+(IDX?'':' init');B.append(cv);
const circ=(r,x,y)=>`circle(${r} at ${x}px ${y}px)`,wipe=(inn,x=innerWidth/2,y=innerHeight/2)=>{const a=[circ('0px',x,y),circ('150vmax',x,y)];cv.style.display='block';return cv.animate({clipPath:inn?a:a.slice().reverse()},{duration:inn?620:760,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards'}).finished};
const done=()=>{cv.style.display='none';cv.style.pointerEvents='none';cv.classList.remove('init');cv.getAnimations().forEach(a=>a.cancel())};
if(!IDX)requestAnimationFrame(()=>wipe(false).then(done));
addEventListener('pageshow',e=>{if(e.persisted)done()});
D.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[href]');if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button||a.target||a.hasAttribute('download'))return;
const u=new URL(a.href,location.href);if(u.protocol!==location.protocol||(u.pathname===location.pathname&&u.search===location.search))return;
e.preventDefault();cv.style.pointerEvents='all';wipe(true,e.clientX,e.clientY).then(()=>{location.href=u.href})});
const dive=(o,id)=>new Promise(r=>{const f=D.createElement('div');f.className='fx-flash';B.append(f);B.classList.add('diving');T={x:0,y:0,z:5.4,s:3.6};BOOM(2.2);
f.animate([{opacity:0},{opacity:0,offset:.62},{opacity:1}],{duration:1150,easing:'ease-in',fill:'forwards'}).finished.then(()=>{o(id);B.classList.remove('diving');cv.style.pointerEvents='none';return f.animate([{opacity:1},{opacity:0}],{duration:900,easing:'ease-out',fill:'forwards'}).finished}).then(()=>{f.remove();r()})});
if(IDX&&typeof show==='function'){$('#guide .glass').forEach((e,i)=>e.style.setProperty('--k',i));const o=show;let busy=0;window.show=function(id){if(busy||!B.classList.contains('ready')||id===B.dataset.s)return o(id);busy=1;cv.style.pointerEvents='all';
if(id==='guide'&&B.dataset.s==='welcome'&&typeof renderer!=='undefined'&&renderer){dive(o,id).then(()=>{busy=0});return}
wipe(true,M.px||innerWidth/2,M.py||innerHeight/2).then(()=>{o(id);return wipe(false,M.px||innerWidth/2,M.py||innerHeight/2)}).then(()=>{done();busy=0})}}}
/* 6 · home page: iridescent shader core, bloom halos, warp shockwave */
function gl3d(){if(!IDX||typeof THREE==='undefined'||typeof renderer==='undefined'||!renderer)return;const K=THREE;
const cv=D.createElement('canvas');cv.width=cv.height=128;const cx=cv.getContext('2d'),q=cx.createRadialGradient(64,64,0,64,64,64);q.addColorStop(0,'rgba(255,255,255,1)');q.addColorStop(.25,'rgba(255,255,255,.35)');q.addColorStop(1,'rgba(255,255,255,0)');cx.fillStyle=q;cx.fillRect(0,0,128,128);const tex=new K.CanvasTexture(cv);
const spr=(col,s,o)=>{const m=new K.Sprite(new K.SpriteMaterial({map:tex,color:col,blending:K.AdditiveBlending,transparent:true,depthWrite:false,opacity:o}));m.scale.setScalar(s);return m};
grp.add(spr(0x8f7cff,6.2,.5));sats.forEach(s=>s.m.add(spr(s.m.material.color,1.15,.9)));
const mat=new K.ShaderMaterial({uniforms:{t:{value:0}},vertexShader:'varying vec3 N,V;void main(){N=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);V=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
fragmentShader:'uniform float t;varying vec3 N,V;void main(){float f=pow(1.-abs(dot(normalize(N),normalize(V))),2.2);vec3 i=.5+.5*cos(6.283*(f*1.1+t*.08+vec3(0.,.33,.67)));vec3 c=mix(vec3(.05,.04,.16),i,f*.9+.08)+f*f*vec3(.5,.7,1.)*.6;gl_FragColor=vec4(c,1.);}'});
mat.color=new K.Color();mat.emissive=new K.Color();core.material.dispose();core.material=mat;
const ml=new K.PointLight(0xffffff,0,14);scene.add(ml);const waves=[];let kick=0;
function boom(k){const m=new K.Mesh(new K.RingGeometry(.98,1,96),new K.MeshBasicMaterial({color:0x9fe8ff,transparent:true,blending:K.AdditiveBlending,side:K.DoubleSide,depthWrite:false}));m.position.copy(grp.position);m.userData.t0=performance.now();scene.add(m);waves.push(m);kick=typeof k==='number'?k:1}
BOOM=boom;['enterBtn'].forEach(id=>{const b=D.getElementById(id);if(b)b.addEventListener('click',boom)});
tasks.push(t=>{mat.uniforms.t.value=t;ml.position.set(mouse.x*5,-mouse.y*3.5,3.5);ml.intensity=L(ml.intensity,1.8,.05);
if(kick>.004){kick*=.94;SP=PACE[st.pace].sp+kick*6;cam.fov=48+kick*16;cam.updateProjectionMatrix()}else if(kick){kick=0;SP=PACE[st.pace].sp;cam.fov=48;cam.updateProjectionMatrix()}
for(let i=waves.length-1;i>=0;i--){const w=waves[i],a=(performance.now()-w.userData.t0)/1100;w.position.copy(grp.position);if(a>=1){scene.remove(w);w.geometry.dispose();w.material.dispose();waves.splice(i,1);continue}w.scale.setScalar(1+a*10);w.material.opacity=(1-a)*.8}})}
[aurora,cursor,type,burst,trans,gl3d].forEach(f=>{try{f()}catch(e){console.warn('[nova-fx]',f.name,e)}});
(function f(){requestAnimationFrame(f);if(D.hidden)return;const t=performance.now()/1000;for(const k of tasks)k(t)})()})();
