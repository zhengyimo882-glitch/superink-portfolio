(() => {
  'use strict';
  const canvas=document.createElement('canvas');
  canvas.className='relic-space';canvas.setAttribute('aria-hidden','true');
  document.body.prepend(canvas);
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let w=0,h=0,frame=0,last=0,time=0,mx=0,my=0,sx=0,sy=0,travel=0;
  const dust=Array.from({length:65},(_,i)=>({x:(i*0.6180339)%1,y:(i*0.4142135)%1,z:.2+(i%9)/11,r:.6+(i%3)*.5}));
  const visible=()=>!(document.body.classList.contains("case-page")&&!document.body.classList.contains("case-immersive"))&&document.body.classList.contains('viewing-relic')&&!document.body.classList.contains('world-ready')&&!document.hidden;
  function resize(){w=innerWidth;h=innerHeight;const d=Math.min(devicePixelRatio||1,1.5);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);if(visible())draw();}
  function draw(){
    ctx.fillStyle='#100b09';ctx.fillRect(0,0,w,h);
    const motion=reduced.matches?0:1;
    const cx=w*(.52+sx*.065),cy=h*(.43+sy*.04);
    const light=ctx.createRadialGradient(cx,cy,0,cx,cy,w*.72);
    light.addColorStop(0,'#543121');light.addColorStop(.28,'#271812');light.addColorStop(1,'#0b0807');ctx.fillStyle=light;ctx.fillRect(0,0,w,h);
    // Receding stone doorways, rather than a wireframe grid.
    const phase=motion*((travel*.00055)%1);
    for(let i=10;i>=0;i--){
      const z=(i+1-phase)*.48+.38;
      const width=w*1.1/z,height=h*1.5/z;
      const x=cx-width/2,y=cy-height*.48;
      const alpha=Math.min(.6,(1/z)*.32)*Math.min(1,(z-.38)*3);
      ctx.lineWidth=Math.max(3,38/z);ctx.strokeStyle=`rgba(72,48,33,${alpha})`;
      ctx.beginPath();ctx.moveTo(x,y+height);ctx.lineTo(x,y+height*.16);ctx.lineTo(x+width*.14,y);ctx.lineTo(x+width*.86,y);ctx.lineTo(x+width,y+height*.16);ctx.lineTo(x+width,y+height);ctx.stroke();
      ctx.lineWidth=Math.max(1,2/z);ctx.strokeStyle=`rgba(210,158,94,${alpha*.7})`;ctx.stroke();
      // Stone courses and recessed joints give the doorway actual mass.
      for(let j=1;j<7;j++){
        const yy=y+height*(.18+j*.115);
        ctx.beginPath();ctx.moveTo(x-16/z,yy);ctx.lineTo(x+16/z,yy);ctx.moveTo(x+width-16/z,yy);ctx.lineTo(x+width+16/z,yy);ctx.stroke();
      }
    }
    // A rotating bronze relief sits deep behind the doorway.
    ctx.save();ctx.translate(cx,cy);ctx.rotate(motion*(time*.035+travel*.00004));
    const radius=Math.min(w,h)*.19;
    ctx.strokeStyle='#c4925540';ctx.lineWidth=1;
    for(const r of [radius,radius*.85,radius*.51]){ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();}
    for(let i=0;i<32;i++){const a=i*Math.PI/16;ctx.beginPath();ctx.moveTo(Math.cos(a)*radius*.89,Math.sin(a)*radius*.89);ctx.lineTo(Math.cos(a)*radius*(i%4? .97:1.08),Math.sin(a)*radius*(i%4?.97:1.08));ctx.stroke();}
    ctx.rotate(Math.PI/4);ctx.strokeRect(-radius*.3,-radius*.3,radius*.6,radius*.6);ctx.restore();
    // Slow shafts of warm light cross the dust without flashing.
    for(let i=0;i<3;i++){
      const x=w*(.15+i*.34)+Math.sin(time*.18+i)*w*.045*motion;
      const beam=ctx.createLinearGradient(x,0,x+w*.25,h);
      beam.addColorStop(0,'#e3b06700');beam.addColorStop(.45,'#c39a4910');beam.addColorStop(1,'#b3833400');
      ctx.fillStyle=beam;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+w*.035,0);ctx.lineTo(x+w*.42,h);ctx.lineTo(x+w*.14,h);ctx.closePath();ctx.fill();
    }
    // Warm pools of lantern light and suspended dust define the depth.
    for(const side of [.15,.85]){
      const x=w*side,y=h*.57;
      const glow=ctx.createRadialGradient(x,y,0,x,y,w*.3);
      glow.addColorStop(0,`rgba(183,94,34,${.12+Math.sin(time*.6+side)*.015})`);glow.addColorStop(1,'rgba(130,48,20,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
    }
    for(const p of dust){const x=(p.x*w+Math.sin(time*.24+p.y*12)*42*p.z+sx*50*p.z),y=((p.y*h-time*12*p.z-travel*.045*p.z)%h+h)%h;ctx.fillStyle=`rgba(224,182,113,${.16+p.z*.35})`;ctx.beginPath();ctx.arc(x,y,p.r*p.z*1.5,0,Math.PI*2);ctx.fill();}
    for(let i=0;i<4;i++){
      const x=w*(.2+i*.24)+Math.sin(time*.13+i*2)*w*.12*motion,y=h*(.65+i*.06);
      const mist=ctx.createRadialGradient(x,y,0,x,y,w*.38);mist.addColorStop(0,'#ad845014');mist.addColorStop(1,'#ad845000');ctx.fillStyle=mist;ctx.fillRect(0,0,w,h);
    }
    const fog=ctx.createLinearGradient(0,h*.6,0,h);fog.addColorStop(0,'#281b1200');fog.addColorStop(1,'#6c483216');ctx.fillStyle=fog;ctx.fillRect(0,0,w,h);
    const shade=ctx.createRadialGradient(w/2,h/2,h*.2,w/2,h/2,Math.max(w,h)*.7);shade.addColorStop(0,'#0000');shade.addColorStop(1,'#0009');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
  }
  function tick(now){frame=0;if(!visible()||reduced.matches)return;if(now-last>=33){time+=Math.min((now-last)/1000,.06);last=now;sx+=(mx-sx)*.055;sy+=(my-sy)*.055;travel+=(scrollY-travel)*.07;draw();}frame=requestAnimationFrame(tick);}
  function sync(){if(frame){cancelAnimationFrame(frame);frame=0;}if(!visible())return;draw();if(!reduced.matches){last=performance.now();frame=requestAnimationFrame(tick);}}
  addEventListener('resize',resize,{passive:true});
  addEventListener('pointermove',e=>{if(!visible()||reduced.matches)return;mx=e.clientX/w-.5;my=e.clientY/h-.5;},{passive:true});
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
  new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});resize();sync();
})();
