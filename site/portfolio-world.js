import * as T from './vendor/three/three.module.js';
// One shared renderer; the selected project owns a distinct physical scene.
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const relic=document.body.classList.contains('viewing-relic');
const canvas=document.createElement('canvas');canvas.className='portfolio-world';canvas.setAttribute('aria-hidden','true');
let renderer;
try { renderer=new T.WebGLRenderer({canvas,antialias:innerWidth>700,alpha:false,powerPreference:'low-power'}); } catch(e) { console.warn('Using atmospheric background fallback'); }
if(renderer){
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(innerWidth<700?78:48,innerWidth/innerHeight,.1,95);
 renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1:1.4));renderer.setSize(innerWidth,innerHeight);
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=relic?1.1:1.05;
 scene.background=new T.Color(relic?'#100e0c':'#060d12');scene.fog=new T.FogExp2(scene.background,relic?.032:.038);
 const rand=(()=>{let n=82;return()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296;};})();
 function texture(kind){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d'),im=x.createImageData(256,256);for(let y=0;y<256;y++)for(let i=0;i<256;i++){let v=kind==='wood'?48+12*Math.sin(i*.15+Math.sin(y*.025)*2)+rand()*15:kind==='metal'?100+rand()*35+Math.sin(y*2)*8:78+rand()*35+9*Math.sin(i*.07)*Math.sin(y*.11);const j=(y*256+i)*4;im.data[j]=v;im.data[j+1]=v*(kind==='wood'?.67:.96);im.data[j+2]=v*(kind==='wood'?.43:.9);im.data[j+3]=255;}x.putImageData(im,0,0);const tex=new T.CanvasTexture(c);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(3,3);tex.colorSpace=T.SRGBColorSpace;return tex;}
 const stoneTex=texture('stone'),woodTex=texture('wood'),metalTex=texture('metal');
 // Large softbox reflections give curved ink and metal an actual surface response.
 const ec=document.createElement('canvas');ec.width=512;ec.height=256;const ex=ec.getContext('2d');ex.fillStyle=relic?'#30251b':'#12202b';ex.fillRect(0,0,512,256);for(const [x,w,color] of [[70,42,relic?'#ddc6a1':'#b6e7e2'],[300,20,relic?'#9f7850':'#527f96']]){const g=ex.createLinearGradient(x-35,0,x+w+35,0);g.addColorStop(0,'#000');g.addColorStop(.5,color);g.addColorStop(1,'#000');ex.fillStyle=g;ex.fillRect(x-35,32,w+70,175);}const env=new T.CanvasTexture(ec);env.mapping=T.EquirectangularReflectionMapping;env.colorSpace=T.SRGBColorSpace;const pmrem=new T.PMREMGenerator(renderer),envMap=pmrem.fromEquirectangular(env);scene.environment=envMap.texture;env.dispose();pmrem.dispose();
 const stone=new T.MeshStandardMaterial({map:stoneTex,color:'#6f716b',roughness:.94,bumpMap:stoneTex,bumpScale:.08});
 const wood=new T.MeshStandardMaterial({map:woodTex,color:'#b39a7e',roughness:.6,bumpMap:woodTex,bumpScale:.035});
 const brass=new T.MeshStandardMaterial({color:'#ad8e59',metalness:.82,roughness:.34,map:metalTex});
 const graphite=new T.MeshStandardMaterial({color:'#1b2830',metalness:.65,roughness:.49,map:metalTex});
 const black=new T.MeshStandardMaterial({color:'#090f13',roughness:.42,metalness:.35});
 const glass=new T.MeshPhysicalMaterial({color:relic?'#9e8d72':'#7ba6a6',metalness:.05,roughness:.13,transparent:true,opacity:.16,side:T.DoubleSide,depthWrite:false});
 function box(w,h,d,x,y,z,mat){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);scene.add(m);return m;}
 function light(color,intensity,x,y,z,tx,ty,tz){const l=new T.SpotLight(color,intensity,32,.55,.8,1.3);l.position.set(x,y,z);l.target.position.set(tx,ty,tz);scene.add(l,l.target);return l;}
 scene.add(new T.HemisphereLight(relic?'#b7ad95':'#a1c7d7',relic?'#271b10':'#080e18',1.1));
 box(24,.3,80,0,-3.4,-18,relic?stone:graphite);
 box(.7,14,80,-10,2,-18,relic?stone:graphite);box(.7,14,80,10,2,-18,relic?stone:graphite);
 const ink=[],artifacts=[],lamps=[];
 if(relic){
  // Three solid rooms: gallery, burial chamber, and a warm appraisal room.
  for(let room=0;room<3;room++){
   const z=1-room*19,mat=room===1?stone:wood;
   for(const side of [-1,1]){
    box(4.3,12,1.4,side*7.8,2,z-8,stone);box(12,1.6,1.4,0,7.2,z-8,stone);
    box(2.8,3.6,1.9,side*6.7,-1.45,z-1,mat);
    box(3,0.1,2.1,side*6.7,.4,z-1,brass);
    box(3,3.8,.07,side*6.7,2.3,z-.05,glass);
    box(.055,3.8,.08,side*6.7-1.5,2.3,z-.05,brass);box(.055,3.8,.08,side*6.7+1.5,2.3,z-.05,brass);
    const points=[new T.Vector2(0,0),new T.Vector2(.55,0),new T.Vector2(.75,.3),new T.Vector2(.8,1),new T.Vector2(.4,1.45),new T.Vector2(.35,1.9),new T.Vector2(.55,2),new T.Vector2(.55,2.1)];
    const vessel=new T.Mesh(new T.LatheGeometry(points,32),brass);vessel.position.set(side*6.7,.45,z-1);vessel.rotation.z=side*.055;scene.add(vessel);artifacts.push(vessel);
    lamps.push(light(room===1?'#a7b8b1':'#ffdaa1',34,side*6.4,6,z+1,side*6.7,1,z-1));
    box(.9,.06,.45,side*6.4,5.8,z+1,new T.MeshBasicMaterial({color:room===1?'#a5beb4':'#e0bb7e'}));
   }
  }
  box(8,12,1,0,2,-51,stone);
  // Uneven masonry catches grazing light along the burial chamber walls.
  for(const side of [-1,1])for(let row=0;row<6;row++)for(let col=0;col<5;col++){
   box(.25+rand()*.22,1.25,2.6,side*9.5,-2.6+row*1.45,-13-col*2.8-(row%2)*.65,stone);
  }
  light('#9cbbb7',42,-8.8,4,-13,-9.4,0,-24);light('#b7c9bc',32,8.8,4,-17,9.4,0,-28);
  // Soft shafts terminate at the display, with transparent feathered edges.
  const beamMat=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,uniforms:{tint:{value:new T.Color('#c5a579')}},vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform vec3 tint;void main(){float a=pow(sin(vUv.x*3.14159),3.)*sin(vUv.y*3.14159)*.038;gl_FragColor=vec4(tint,a);}'});
  for(const lamp of lamps){const beam=new T.Mesh(new T.PlaneGeometry(2.7,5.4),beamMat);beam.position.copy(lamp.position);beam.position.y-=2.7;beam.rotation.x=-.12;scene.add(beam);}

 }else{
  for(let i=0;i<5;i++){
   const z=3-i*12,side=i%2?1:-1;
   const panel=box(.3,9,5,side*7.7,1,z,graphite);panel.rotation.y=side*.16;
   box(.045,5,.045,side*7.45,1.5,z+2,new T.MeshBasicMaterial({color:'#638f8a'}));
   box(4,6,.08,-side*7.1,1.2,z-3,glass);
   light('#9ce5d4',28,side*5,5,z+2,side*4,0,z-2);
  }
  const inkMat=new T.MeshPhysicalMaterial({color:'#071515',metalness:.88,roughness:.22,clearcoat:1,clearcoatRoughness:.12,envMapIntensity:2.8});
  for(let i=0;i<15;i++){
   const g=new T.SphereGeometry(1,32,24),original=g.attributes.position.array.slice();const m=new T.Mesh(g,inkMat);const side=i%2?1:-1;
   const radius=i<4?.55+rand()*.5:.18+rand()*.4;
   m.position.set(side*(5.2+rand()*2.2),-1.5+rand()*6,6-i*3.4);m.scale.set(radius,radius*(1.2+rand()),radius);scene.add(m);ink.push({m,original,phase:rand()*6,base:m.position.clone(),radius});
  }
  // A dark reflective island anchors the floating ink instead of a floor grid.
  const pool=new T.Mesh(new T.CylinderGeometry(4.8,5,.15,64),inkMat);pool.position.set(0,-3.16,-6);scene.add(pool);
  light('#a6c7df',48,-5,6,9,0,0,-5);
 }
 // Sparse illuminated motes: their size and parallax follow actual depth.
 const count=innerWidth<700?35:75,positions=new Float32Array(count*3);for(let i=0;i<count;i++){positions[i*3]=(rand()-.5)*18;positions[i*3+1]=rand()*10-3;positions[i*3+2]=10-rand()*65;}
 const dg=new T.BufferGeometry();dg.setAttribute('position',new T.BufferAttribute(positions,3));const dc=document.createElement('canvas');dc.width=dc.height=32;const dx=dc.getContext('2d'),grad=dx.createRadialGradient(16,16,0,16,16,16);grad.addColorStop(0,'#fff');grad.addColorStop(.2,'#ffffff99');grad.addColorStop(1,'#ffffff00');dx.fillStyle=grad;dx.fillRect(0,0,32,32);
 const dust=new T.Points(dg,new T.PointsMaterial({color:relic?'#e4c38d':'#93cbbf',size:.055,map:new T.CanvasTexture(dc),transparent:true,opacity:.35,depthWrite:false,blending:T.AdditiveBlending}));scene.add(dust);
 let frame=0,last=0,time=0,px=0,py=0,sx=0,sy=0,depth=0,targetDepth=0;
 let sections=[];
 function measure(){sections=relic?['relic-intro','relic-gameplay','relic-objects','relic-fear','relic-shop','relic-artwork','about'].map(id=>document.getElementById(id)).filter(Boolean):['ink-studio','about'].map(id=>document.getElementById(id)).filter(Boolean);updateDepth();}
 function updateDepth(){if(relic&&sections.length>2){let i=0;while(i<sections.length-2&&scrollY>=sections[i+1].getBoundingClientRect().top+scrollY)i++;const a=sections[i].getBoundingClientRect().top+scrollY,b=sections[i+1].getBoundingClientRect().top+scrollY;const stops=[0,12,22,31,43,46,49];targetDepth=T.MathUtils.lerp(stops[i],stops[i+1],T.MathUtils.clamp((scrollY-a)/Math.max(1,b-a),0,1));}else targetDepth=Math.min(30,scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)*30);}
 function render(now=0){frame=0;if(document.hidden)return;if(now-last<33&&!reduced.matches){frame=requestAnimationFrame(render);return;}const dt=Math.min((now-last)/1000||.016,.06);last=now;if(!reduced.matches)time+=dt;
 const ease=reduced.matches?1:1-Math.exp(-dt*3);depth+=(targetDepth-depth)*ease;sx+=(px-sx)*ease;sy+=(py-sy)*ease;
 camera.position.set(reduced.matches?0:sx*.45,1+(reduced.matches?0:sy*.22),14-(reduced.matches?0:depth));camera.lookAt(0,.8,camera.position.z-15);
 for(const item of ink){const {m,original,phase,base}=item,p=m.geometry.attributes.position;for(let j=0;j<p.count;j++){const x=original[j*3],y=original[j*3+1],z=original[j*3+2];const r=1+.13*Math.sin(y*3+time*.55+phase)*Math.cos(x*2+time*.3)+.07*Math.sin(z*4+time*.4);p.setXYZ(j,x*r,y*r,z*r);}p.needsUpdate=true;m.geometry.computeVertexNormals();const assembly=T.MathUtils.smoothstep(scrollY,200,1500);m.position.x=base.x*(1+assembly*.15);m.scale.y=item.radius*(1.25+Math.sin(time*.25+phase)*.15-assembly*.3);m.position.y=base.y+Math.sin(time*.32+phase)*.22;m.rotation.y=time*.07+phase;}
 dust.rotation.y=Math.sin(time*.04)*.025;dust.position.y=Math.sin(time*.12)*.12;
 lamps.forEach((l,i)=>l.intensity=34*(1+Math.sin(time*.7+i)*.025));renderer.render(scene,camera);
 if(!reduced.matches)frame=requestAnimationFrame(render);
 }
 function wake(){if(!frame&&!document.hidden){last=performance.now()-40;frame=requestAnimationFrame(render);}}
 addEventListener('pointermove',e=>{if(e.pointerType==='touch'||reduced.matches)return;px=e.clientX/innerWidth-.5;py=-(e.clientY/innerHeight-.5);},{passive:true});
 addEventListener('scroll',()=>{updateDepth();if(reduced.matches)wake();},{passive:true});
 addEventListener('resize',()=>{camera.fov=innerWidth<700?78:48;camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);measure();wake();},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else wake();});reduced.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;wake();});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);frame=0;document.body.classList.remove('world-ready');});canvas.addEventListener('webglcontextrestored',()=>location.reload());
 document.body.prepend(canvas);measure();render();document.body.classList.add('world-ready');
 window.portfolioWorld={kind:relic?'relic':'ink',renderer,scene,camera,get depth(){return depth;}};
}
