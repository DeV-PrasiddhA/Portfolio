'use strict';
(() => {
const canvas=document.querySelector('#neural');if(!canvas)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let paused=reduced.matches,visible=true,dirty=true,rotation=.3,tilt=.12,last=0,drag=false,x=0,y=0,lost=false;
const button=document.querySelector('#motion');
function label(){button.textContent=paused?'Play 3D motion':'Pause 3D motion';button.setAttribute('aria-pressed',String(paused))}label();
button.addEventListener('click',()=>{paused=!paused;dirty=true;label()});reduced.addEventListener('change',e=>{paused=e.matches;dirty=true;label()});
canvas.addEventListener('pointerdown',e=>{drag=true;x=e.clientX;y=e.clientY;canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!drag)return;rotation+=(e.clientX-x)*.009;tilt=Math.max(-1,Math.min(1,tilt+(e.clientY-y)*.007));x=e.clientX;y=e.clientY;dirty=true});
canvas.addEventListener('pointerup',()=>drag=false);canvas.addEventListener('pointercancel',()=>drag=false);
canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();rotation+=(e.key==='ArrowRight'?.12:e.key==='ArrowLeft'?-.12:0);tilt+=(e.key==='ArrowDown'?.08:e.key==='ArrowUp'?-.08:0);dirty=true}});
new IntersectionObserver(es=>{visible=es[0].isIntersecting;dirty=true}).observe(canvas);
const gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power'});
const vertex=`attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
const fragment=`precision highp float;
uniform vec2 res;uniform float time;uniform float tilt;
mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
vec2 scene(vec3 p){p.xz=rot(time)*p.xz;p.yz=rot(tilt)*p.yz;
float sphere=length(p)-.91;
vec3 q=p;q.yz=rot(.6)*q.yz;float ring=length(vec2(length(q.xz)-1.38,q.y))-.075;
vec3 b=p;b.xy=rot(1.15)*b.xy;b.yz=rot(-.55)*b.yz;float ring2=length(vec2(length(b.xz)-1.65,b.y))-.036;
vec3 c=p;c.xy=rot(-.65)*c.xy;c.yz=rot(1.4)*c.yz;float ring3=length(vec2(length(c.xz)-1.19,c.y))-.025;
vec2 r=vec2(sphere,1.);if(ring<r.x)r=vec2(ring,2.);if(ring2<r.x)r=vec2(ring2,3.);if(ring3<r.x)r=vec2(ring3,4.);return r;}
vec3 normal(vec3 p){vec2 e=vec2(.002,0.);return normalize(vec3(scene(p+e.xyy).x-scene(p-e.xyy).x,scene(p+e.yxy).x-scene(p-e.yxy).x,scene(p+e.yyx).x-scene(p-e.yyx).x));}
vec3 environment(vec3 r){float strip=pow(max(0.,1.-abs(r.y-.4)),18.);float edge=pow(max(dot(r,normalize(vec3(-1.,.6,1.))),0.),8.);return vec3(.09,.15,.23)+vec3(.3,.75,.95)*strip+vec3(.8,.25,1.)*edge;}
void main(){vec2 uv=(gl_FragCoord.xy-.5*res)/min(res.x,res.y);vec3 ro=vec3(0.,.15,4.9);vec3 rd=normalize(vec3(uv*3.75,-4.9));float t=0.;vec2 hit;float glow=0.;
for(int i=0;i<90;i++){vec3 p=ro+rd*t;hit=scene(p);glow+=.0018/(.02+abs(hit.x));if(hit.x<.002||t>9.)break;t+=hit.x*.8;}
vec3 color=vec3(.018,.025,.065);float haze=exp(-dot(uv,uv)*3.);color+=vec3(.035,.07,.16)*haze;
if(t<9.){vec3 p=ro+rd*t,n=normal(p),ref=reflect(rd,n);vec3 light=normalize(vec3(-2.,3.,4.));float diff=max(dot(n,light),0.);float rim=pow(1.-max(dot(n,-rd),0.),3.);float spec=pow(max(dot(ref,light),0.),60.);
if(hit.y<1.5){color=environment(ref)*(.45+.65*diff)+vec3(.65,.86,1.)*spec;vec3 q=p;q.xz=rot(time)*q.xz;q.yz=rot(tilt)*q.yz;float lines=pow(.5+.5*sin(q.y*48.),22.);color+=vec3(.05,.42,.52)*lines*.4;float patch=smoothstep(.88,.95,sin(q.x*14.)*cos(q.z*13.));color+=vec3(.04,.55,.62)*patch*.3;color+=vec3(.1,.65,.9)*rim*.8;
}else{vec3 base=hit.y<2.5?vec3(.2,.9,1.):hit.y<3.5?vec3(.68,.25,1.):vec3(1.,.63,.32);color=base*(.35+diff*.85)+vec3(1.)*spec*.8+base*rim;}}
color+=vec3(.09,.16,.3)*min(glow,.65);color=pow(color,vec3(.85));gl_FragColor=vec4(color,1.);}`;
let program;
function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
function fallback(){canvas.hidden=true;document.querySelector('.core-fallback').hidden=false;button.hidden=true;document.querySelector('.scene-hint').textContent='NEURAL CORE · STATIC VIEW'}
try{if(!gl)throw Error('WebGL unavailable');program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Shader link failed');gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const a=gl.getAttribLocation(program,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0)}catch{fallback();return}
const uRes=gl.getUniformLocation(program,'res'),uTime=gl.getUniformLocation(program,'time'),uTilt=gl.getUniformLocation(program,'tilt');
function resize(){const rect=canvas.getBoundingClientRect();const dpr=Math.min(devicePixelRatio||1,1.35);canvas.width=Math.min(1000,Math.round(rect.width*dpr));canvas.height=Math.min(1000,Math.round(rect.height*dpr));gl.viewport(0,0,canvas.width,canvas.height);dirty=true}new ResizeObserver(resize).observe(canvas);
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;fallback()});
function frame(now){requestAnimationFrame(frame);if(lost||!visible||document.hidden||now-last<33)return;let dt=Math.min(now-last,60);last=now;if(!paused&&!drag){rotation+=dt*.00022;dirty=true}if(!dirty)return;gl.uniform2f(uRes,canvas.width,canvas.height);gl.uniform1f(uTime,rotation);gl.uniform1f(uTilt,tilt);gl.drawArrays(gl.TRIANGLES,0,6);dirty=false}requestAnimationFrame(frame);
})();
