(() => {
  'use strict';
  const stage = document.querySelector('#ink-studio');
  if (!stage) return;
  const pin = stage.querySelector('.studio-pin');
  const canvas = stage.querySelector('.studio-canvas');
  const ctx = canvas.getContext('2d');
  const space = document.createElement('canvas');
  space.className = 'studio-space superink-space';
  space.setAttribute('aria-hidden', 'true');
  document.body.prepend(space);
  const bg = space.getContext('2d');
  const hint = stage.querySelector('[data-studio-hint]');
  const next = stage.querySelector('[data-studio-next]');
  const reset = stage.querySelector('[data-studio-reset]');
  const heading = stage.querySelector('.studio-heading');
  const titleFace = stage.querySelector('.studio-title-face');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const projectSections = ['hero','intent','experience','proof','recognition','combat-story','loop']
    .map(id => document.getElementById(id)).filter(Boolean);
  projectSections.forEach(section => section.classList.add('si-space-section'));
  const label = (en, cn) => window.siteI18n?.language === 'zh-CN' ? cn : en;
  const hints = [
    ['Drag to sketch a stroke. Scroll to give it form.', '拖动绘制笔画，向下滚动，让它在空间中成形。'],
    ['Scroll to assemble. Scroll back to retrace your stroke.', '向下滚动聚合成形，向上滚动回到你的笔画。'],
    ['Drag to orbit the AK. Arrow keys also work.', '拖动旋转 AK，或使用方向键改变视角。']
  ];
  reset.textContent = label('Redraw', '重新绘制');
  canvas.setAttribute('aria-label', label('Draw a stroke; scroll to assemble; drag or use arrow keys to rotate.', '绘制笔画，滚动使其成形，再拖动或用方向键旋转。'));
  const edges = [], faces = [];
  function mesh(outline, depth) {
    const front = outline.map(([x,y]) => [x,y,depth]);
    const back = outline.map(([x,y]) => [x,y,-depth]);
    faces.push(front, [...back].reverse());
    for (let i=0; i<front.length; i++) {
      const j=(i+1)%front.length;
      edges.push([front[i],front[j]], [back[i],back[j]], [front[i],back[i]]);
      faces.push([front[i],back[i],back[j],front[j]]);
      // Selective diagonals reveal facets without obscuring the silhouette.
      if (i % 2 === 0) edges.push([front[i],back[j]]);
    }
  }
  mesh([[-96,-8],[-91,-12],[-57,-9],[-39,-7],[-40,0],[-62,7],[-94,16]],5);
  mesh([[-44,-13],[-35,-17],[10,-16],[19,-9],[12,2],[-41,2]],8);
  mesh([[-31,2],[-20,2],[-25,22],[-35,20]],5);
  mesh([[-8,2],[7,1],[9,11],[15,20],[24,27],[15,34],[2,26],[-6,15]],5);
  mesh([[10,-15],[42,-15],[48,-10],[41,-4],[10,-3]],6);
  mesh([[42,-11],[91,-11],[95,-9],[94,-6],[42,-7]],2.5);
  mesh([[71,-11],[75,-21],[79,-21],[80,-10]],2.5);
  mesh([[27,-15],[35,-20],[63,-14],[69,-11],[52,-11]],3);
  // A bounding sphere is invariant under rotation. Its projected radius gives a
  // safe, stable scale at every angle, including a vertical barrel on mobile.
  let radius = Math.max(...edges.flat().map(([x,y,z]) => Math.hypot(x,y-5,z)));
  const lens = 460;
  let projectedRadius = radius * lens / Math.sqrt(lens*lens-radius*radius);
  const guide = [[-.34,.15],[0,-.24],[.32,.15],[-.34,.15]];
  let stroke=[], path=[], yaw=-.30, pitch=-.16, progress=0, mode=-1, pointer=null;
  let width=0, height=0, last, frame=0, lastFrame=0, clock=0, inView=true;
  let mouseX=0, mouseY=0, cameraX=0, cameraY=0;
  const clamp = v => Math.max(0,Math.min(1,v));
  const smooth = t => t*t*(3-2*t);
  const center = () => [width*(height<550 && width>height*1.65 ? .70 : .52), height*.57];
  const unit = () => Math.min(width*.84, height*.62);
  function sample(points) {
    const lengths=[0];
    for(let i=1;i<points.length;i++) lengths.push(lengths[i-1]+Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]));
    const total=lengths.at(-1);
    if(!total) return [];
    let k=1;
    return Array.from({length:edges.length+1},(_,i)=>{
      const distance=total*i/edges.length;
      while(k<points.length-1 && lengths[k]<distance) k++;
      const t=(distance-lengths[k-1])/(lengths[k]-lengths[k-1]||1);
      return points[k-1].map((n,j)=>n+(points[k][j]-n)*t);
    });
  }
  let demo=sample(guide);
  // Deterministic dust positions avoid popping when the viewport resizes.
  const noise = n => { const v=Math.sin(n*127.1+311.7)*43758.5453; return v-Math.floor(v); };
  const dust = Array.from({length:76},(_,i)=>({x:(noise(i)-.5)*2600,y:(noise(i+90)-.5)*1000,z:noise(i+180)*2400,size:.6+noise(i+250)*1.5}));
  function drawSpace() {
    if(document.body.classList.contains("world-ready"))return;
    bg.clearRect(0,0,width,height);
    const u=Math.min(width,height)/780;
    const travelDepth=reduced.matches?0:(window.scrollY||0)*.12;
    const horizon=height*(.43+(reduced.matches?0:Math.sin(travelDepth*.002)*.035));
    const view=([x,y,z])=>{
      const a=.055*Math.sin(clock*.075)+cameraX*.045;
      const xx=x*Math.cos(a)-z*Math.sin(a)-cameraX*35;
      const zz=x*Math.sin(a)+z*Math.cos(a);
      const p=760/(760+zz);
      return [center()[0]+xx*p*u, horizon+(y+cameraY*20)*p*u,p];
    };
    const glow=bg.createRadialGradient(width*.57,height*.47,0,width*.57,height*.47,width*.58);
    glow.addColorStop(0,'#436e7626');glow.addColorStop(.4,'#223a4b1c');glow.addColorStop(1,'#080f1a00');
    bg.fillStyle=glow;bg.fillRect(0,0,width,height);
    const line=(a,b,alpha,color='117,163,173')=>{
      const p=view(a),q=view(b); bg.strokeStyle=`rgba(${color},${alpha})`;
      bg.beginPath();bg.moveTo(p[0],p[1]);bg.lineTo(q[0],q[1]);bg.stroke();
    };
    bg.lineWidth=.7;
    // Floor and ceiling converge on one vanishing point; depth rows drift slowly.
    for(let x=-1800;x<=1800;x+=150) {
      line([x,265,-180],[x,265,3000],.15);
      line([x,-520,100],[x,-520,3000],.045);
    }
    for(let i=0;i<25;i++) {
      const z=i*130-180+(clock*16+travelDepth)%130;
      line([-2000,265,z],[2000,265,z],.19*(1-i/27));
    }
    // Sparse architectural ribs and an elliptical ground orbit anchor the space.
    for(let i=0;i<5;i++) {
      const z=450+i*470;
      line([-950,265,z],[-950,-650,z],.07);
      line([950,265,z],[950,-650,z],.07);
    }
    for(const r of [280,430]) {
      bg.beginPath();
      for(let i=0;i<=100;i++) {
        const a=i/100*Math.PI*2, p=view([Math.cos(a)*r,263,Math.sin(a)*r+420]);
        if(i===0)bg.moveTo(p[0],p[1]);else bg.lineTo(p[0],p[1]);
      }
      bg.strokeStyle=r===280?'#a2c6bd35':'#b8bd9e1a';bg.stroke();
    }
    const fog=bg.createLinearGradient(0,height*.32,0,height*.63);
    fog.addColorStop(0,'#080f1a00');fog.addColorStop(.42,'#172630aa');fog.addColorStop(1,'#080f1a00');
    bg.fillStyle=fog;bg.fillRect(0,height*.32,width,height*.31);
    for(let i=0;i<dust.length;i++) {
      const d=dust[i], z=((d.z-clock*19-travelDepth)%2400+2400)%2400;
      const p=view([d.x+Math.sin(clock*.13+i)*14,d.y+Math.sin(clock*.2+i)*9,z]);
      if(p[0]<0 || p[0]>width || p[1]<0 || p[1]>height) continue;
      const alpha=(.18+.32*noise(i+310))*Math.min(1,z/180);
      const r=Math.max(.45,d.size*p[2]*u);
      if(i%7===0) {
        const halo=bg.createRadialGradient(p[0],p[1],0,p[0],p[1],r*7);
        halo.addColorStop(0,`rgba(155,199,189,${alpha*.3})`);halo.addColorStop(1,'#9bc7bd00');
        bg.fillStyle=halo;bg.beginPath();bg.arc(p[0],p[1],r*7,0,Math.PI*2);bg.fill();
      }
      bg.fillStyle=i%6===0?`rgba(201,193,158,${alpha})`:`rgba(168,202,209,${alpha})`;
      bg.beginPath();bg.arc(p[0],p[1],r,0,Math.PI*2);bg.fill();
    }
  }
  function drawModel() {
    ctx.globalAlpha=1;
    ctx.clearRect(0,0,width,height);
    let origin=center(),scale=Math.min(width*.42,height*.295)/projectedRadius;
    const source=path.length?path:demo,drawingOrigin=center();
    const detailed=window.superinkModel;
    if(detailed?.ready){
      ({origin,scale}=detailed.layout(width,height));
      detailed.render({width,height,origin,scale,yaw,pitch,progress});
      if(progress>=.98)return;
      ctx.globalAlpha=1-clamp((progress-.78)/.20);
    }
    const project=([x,y,z])=>{
      y-=5;
      const xx=x*Math.cos(yaw)+z*Math.sin(yaw), zz=z*Math.cos(yaw)-x*Math.sin(yaw);
      const yy=y*Math.cos(pitch)-zz*Math.sin(pitch), depth=y*Math.sin(pitch)+zz*Math.cos(pitch);
      const perspective=lens/(lens+depth);
      return [xx*scale*perspective,yy*scale*perspective,depth];
    };
    const point=(from,to,t)=>[(drawingOrigin[0]+from[0]*unit())*(1-t)+(origin[0]+to[0])*t,(drawingOrigin[1]+from[1]*unit())*(1-t)+(origin[1]+to[1])*t];
    // Draw directly in pointer space, including the very first dot. Model framing
    // only participates after drawing ends and the scroll-driven assembly begins.
    if(mode===0&&stroke.length){
      ctx.lineWidth=2;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#d4f7e7';ctx.fillStyle='#d4f7e7';
      ctx.shadowColor='#69efa7';ctx.shadowBlur=7;ctx.beginPath();
      stroke.forEach((p,i)=>{const x=drawingOrigin[0]+p[0]*unit(),y=drawingOrigin[1]+p[1]*unit();if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);});ctx.stroke();
      const first=stroke[0];ctx.beginPath();ctx.arc(drawingOrigin[0]+first[0]*unit(),drawingOrigin[1]+first[1]*unit(),1,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
      return;
    }
    // Back-to-front translucent surfaces give the wireframe physical thickness.
    if(progress>.55) {
      const projectedFaces=faces.map(face=>face.map(project)).sort((a,b)=>b.reduce((s,p)=>s+p[2],0)/b.length-a.reduce((s,p)=>s+p[2],0)/a.length);
      for(const face of projectedFaces) {
        ctx.beginPath();face.forEach((p,i)=>i?ctx.lineTo(origin[0]+p[0],origin[1]+p[1]):ctx.moveTo(origin[0]+p[0],origin[1]+p[1]));ctx.closePath();
        const a=clamp((progress-.55)/.45)*.16;
        ctx.fillStyle=`rgba(99,145,156,${a})`;ctx.fill();
      }
    }
    const segments=edges.map((edge,i)=>{
      const t=smooth(clamp(progress*1.22-i/edges.length*.22));
      const pa=project(edge[0]),pb=project(edge[1]);
      return {a:point(source[i],pa,t),b:point(source[i+1],pb,t),depth:(pa[2]+pb[2])/2};
    });
    ctx.lineCap='round';ctx.lineJoin='round';
    ctx.setLineDash(!stroke.length && progress===0?[3,8]:[]);
    // One combined glow pass is cheaper and softer than a shadow on every edge.
    ctx.beginPath();segments.forEach(s=>{ctx.moveTo(...s.a);ctx.lineTo(...s.b);});
    ctx.lineWidth=2.6;ctx.strokeStyle=progress===0?'#8daeb52d':'#93d2c532';
    ctx.shadowColor='#8fd6cb';ctx.shadowBlur=progress===0?3:15;ctx.stroke();ctx.shadowBlur=0;
    ctx.lineWidth=1.05;
    for(let band=0;band<3;band++) {
      ctx.beginPath();
      segments.forEach(s=>{if((s.depth < -12?0:s.depth>12?2:1)===band){ctx.moveTo(...s.a);ctx.lineTo(...s.b);}});
      ctx.strokeStyle=!stroke.length && progress===0?'#9bbac0aa':['#d4e8dd','#8ebeb9','#507a8599'][band];ctx.stroke();
    }
    ctx.setLineDash([]);
    // Small warm nodes provide a second material accent; assembly dust follows
    // the exact same sampled stroke-to-model path as the wireframe.
    for(let i=0;i<segments.length;i+=Math.max(9,Math.ceil(segments.length/100))) {
      const s=segments[i], t=clamp(progress*1.22-i/edges.length*.22);
      if(progress===0) continue;
      const orbit=(1-smooth(t))*Math.sin(Math.PI*t)*22;
      const x=s.a[0]+Math.cos(clock*.5+i)*orbit, y=s.a[1]+Math.sin(clock*.5+i)*orbit;
      ctx.fillStyle=`rgba(213,205,171,${.25+.45*Math.sin(Math.PI*t)})`;
      ctx.beginPath();ctx.arc(x,y,progress<.99?1.8:1.15,0,Math.PI*2);ctx.fill();
    }
  }
  function drawTypography() {
    if (!heading) return;
    const still = reduced.matches;
    const tiltX = still ? 0 : -4-cameraY*9+progress*5;
    const tiltY = still ? 0 : -7+cameraX*13+progress*4;
    heading.style.setProperty('--type-rx', `${tiltX.toFixed(2)}deg`);
    heading.style.setProperty('--type-ry', `${tiltY.toFixed(2)}deg`);
    heading.style.setProperty('--type-x', `${(still?0:cameraX*12).toFixed(2)}px`);
    heading.style.setProperty('--type-y', `${(still?0:Math.sin(clock*.65)*2.5+cameraY*7).toFixed(2)}px`);
    heading.style.setProperty('--type-light', `${(still?45:135-Math.sin(clock*.28)*120-cameraX*35).toFixed(1)}%`);
    heading.style.setProperty('--type-depth', `${(still?10:12+progress*12).toFixed(1)}px`);
  }
  function draw(){if(width && height && !stage.hidden){drawSpace();if(inView){drawModel();drawTypography();}}}
  function tick(now) {
    frame=0;
    if(stage.hidden || document.hidden) {lastFrame=0;return;}
    if(now-lastFrame>=32) {
      const dt=lastFrame?Math.min(now-lastFrame,70)/1000:0;
      lastFrame=now;clock+=dt;
      cameraX+=(mouseX-cameraX)*.055;cameraY+=(mouseY-cameraY)*.055;
      draw();
    }
    if(!reduced.matches) frame=requestAnimationFrame(tick);
  }
  function wake(){if(!frame && !stage.hidden && !document.hidden)frame=requestAnimationFrame(tick);}
  let hintAnimation;
  function update(value) {
    progress=value;
    const state=value<.015?0:value>=.995?2:1;
    if(mode!==state) {
      const previous=mode;
      mode=state;hint.textContent=label(...hints[state]);
      hintAnimation?.cancel();
      if (!reduced.matches && hint.animate) {
        hintAnimation=hint.animate([
          {opacity:0,transform:'translateY(9px) rotateX(-12deg)',filter:'blur(3px)'},
          {opacity:1,transform:'translateY(0) rotateX(0)',filter:'blur(0)'}
        ],{duration:previous<0?700:420,easing:'cubic-bezier(.2,.75,.2,1)'});
      }
      canvas.classList.toggle('model-ready',state===2);
      next.textContent=state===2?label('Explore gameplay','查看游戏实机'):label('Form the weapon','让笔画成形');
      if(pointer!==null && canvas.hasPointerCapture(pointer))canvas.releasePointerCapture(pointer);
      pointer=null;
    }
    draw();wake();
  }
  function resize() {
    const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;
    const ratio=Math.min(devicePixelRatio||1,width<650?1.5:2);
    for(const [c,context] of [[canvas,ctx],[space,bg]]) {
      c.width=Math.round(width*ratio);c.height=Math.round(height*ratio);
      context.setTransform(c.width/width,0,0,c.height/height,0,0);
    }
    draw();wake();
  }
  new ResizeObserver(resize).observe(canvas);
  function position(e) {
    const rect=canvas.getBoundingClientRect(), c=center();
    return [((e.clientX-rect.left)*width/rect.width-c[0])/unit(),((e.clientY-rect.top)*height/rect.height-c[1])/unit()];
  }
  window.addEventListener('pointermove',e=>{
    if(reduced.matches || stage.hidden || !width || !height)return;
    mouseX=e.clientX/width-.5;mouseY=e.clientY/height-.5;
  },{passive:true});
  pin.addEventListener('pointerleave',()=>{mouseX=mouseY=0;});
  // Individual rotate composes with the existing section-entry transforms.
  // Keep the video and recognition canvas stable for precise interaction.
  const tiltable = projectSections.flatMap(section => [...section.querySelectorAll('.principle-grid article, .loop-section li, .intent-body blockquote')]);
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  function flattenPanel(panel) {
    panel.style.removeProperty('--panel-axis-x');panel.style.removeProperty('--panel-axis-y');
    panel.style.removeProperty('--panel-angle');panel.style.removeProperty('--panel-light-x');
    panel.style.removeProperty('--panel-light-y');
  }
  tiltable.forEach(panel => {
    panel.classList.add('si-depth-panel');
    panel.addEventListener('pointermove', e => {
      if(reduced.matches || !finePointer.matches)return;
      const r=panel.getBoundingClientRect();
      const x=clamp((e.clientX-r.left)/r.width)-.5, y=clamp((e.clientY-r.top)/r.height)-.5;
      panel.style.setProperty('--panel-axis-x',(-y).toFixed(3));
      panel.style.setProperty('--panel-axis-y',x.toFixed(3));
      panel.style.setProperty('--panel-angle',`${(Math.hypot(x,y)*7).toFixed(2)}deg`);
      panel.style.setProperty('--panel-light-x',`${((x+.5)*100).toFixed(1)}%`);
      panel.style.setProperty('--panel-light-y',`${((y+.5)*100).toFixed(1)}%`);
    },{passive:true});
    panel.addEventListener('pointerleave',()=>flattenPanel(panel));
    panel.addEventListener('pointercancel',()=>flattenPanel(panel));
  });
  reduced.addEventListener('change',()=>tiltable.forEach(flattenPanel));
  canvas.addEventListener('pointerdown',e=>{
    if(pointer!==null || e.button!==0 || mode===1)return;
    pointer=e.pointerId;canvas.setPointerCapture(pointer);last=position(e);
    if(mode===0){stroke=[last];path=[];draw();}
  });
  canvas.addEventListener('pointermove',e=>{
    if(pointer!==e.pointerId)return;
    const p=position(e);
    if(mode===2){yaw+=(p[0]-last[0])*3;pitch+=(p[1]-last[1])*3;}
    else if(Math.hypot(p[0]-last[0],p[1]-last[1])>.002){stroke.push(p);path=sample(stroke);}
    last=p;draw();
  });
  const release=()=>{if(pointer!==null && canvas.hasPointerCapture(pointer))canvas.releasePointerCapture(pointer);pointer=null;};
  canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
  canvas.addEventListener('lostpointercapture',()=>{pointer=null;});
  canvas.addEventListener('keydown',e=>{
    if(mode!==2 || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
    e.preventDefault();yaw+=({'ArrowLeft':-.15,'ArrowRight':.15}[e.key]||0);
    pitch+=({'ArrowUp':-.15,'ArrowDown':.15}[e.key]||0);draw();
  });
  const travel=()=>Math.max(1,stage.offsetHeight-pin.offsetHeight);
  let trigger;
  function visibility() {
    if(stage.hidden){trigger?.kill();trigger=null;if(frame)cancelAnimationFrame(frame);frame=0;lastFrame=0;return;}
    if(window.ScrollTrigger && window.gsap) {
      if(!trigger)trigger=ScrollTrigger.create({trigger:stage,start:'top top',end:()=>'+='+travel(),onUpdate:self=>update(clamp(self.progress*1.35))});
      trigger.refresh();update(clamp(trigger.progress*1.35));
    }
    resize();wake();
  }
  if(window.ScrollTrigger && window.gsap)gsap.registerPlugin(ScrollTrigger);
  else window.addEventListener('scroll',()=>update(clamp(-stage.getBoundingClientRect().top/travel()*1.35)),{passive:true});
  new MutationObserver(visibility).observe(stage,{attributes:true,attributeFilter:['hidden']});
  new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView)wake();},{threshold:0}).observe(pin);
  document.addEventListener('visibilitychange',wake);
  reduced.addEventListener('change',()=>{if(reduced.matches){clock=0;cameraX=cameraY=0;hintAnimation?.cancel();titleEntrance?.cancel();draw();}wake();});
  const jump=top=>window.scrollTo({top,behavior:reduced.matches?'instant':'smooth'});
  const start=()=>stage.getBoundingClientRect().top+scrollY;
  reset.addEventListener('click',()=>{stroke=[];path=[];yaw=-.30;pitch=-.16;draw();jump(start());});
  next.addEventListener('click',()=>jump(mode===2?document.querySelector('#proof').getBoundingClientRect().top+scrollY:start()+travel()*.8));
  let titleEntrance;
  if (!reduced.matches && titleFace?.animate) {
    titleEntrance=titleFace.animate([
      {opacity:0,transform:'translateZ(-25px) translateY(16px) rotateX(18deg)',filter:'blur(5px)'},
      {opacity:1,transform:'translateZ(30px) translateY(0) rotateX(0)',filter:'blur(0)'}
    ],{duration:1100,easing:'cubic-bezier(.16,1,.3,1)'});
  }
  function useDetailedModel(){
    const model=window.superinkModel;if(!model?.ready)return;
    // Keep major contours during assembly; the final WebGL mesh keeps every face.
    const assemblyEdges=model.edges.map((edge,index)=>({edge,index,length:Math.hypot(...edge[0].map((v,i)=>v-edge[1][i]))}))
      .sort((a,b)=>b.length-a.length).slice(0,4500).sort((a,b)=>a.index-b.index);
    edges.length=0;for(const {edge} of assemblyEdges)edges.push(edge);
    faces.length=0;
    radius=model.edges.reduce((r,edge)=>Math.max(r,...edge.map(([x,y,z])=>Math.hypot(x,y-5,z))),0);
    projectedRadius=radius*lens/Math.sqrt(lens*lens-radius*radius);
    demo=sample(guide);path=stroke.length>1?sample(stroke):[];
    draw();wake();
  }
  window.addEventListener('superink-model-ready',useDetailedModel);
  if(window.superinkModel?.ready)useDetailedModel();
  update(0);visibility();
})();
