(() => {
  const stage = document.querySelector('#ink-studio');
  const canvas = stage.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const hint = stage.querySelector('[data-studio-hint]');
  const next = stage.querySelector('[data-studio-next]');
  const reset = stage.querySelector('[data-studio-reset]');
  const zh = window.siteI18n?.language === 'zh-CN';
  const label = (en, cn) => zh ? cn : en;
  const hints = [
    label('Drag to sketch a stroke. Scroll to give it form.', '按住并拖动，画下任意一笔。向下滚动，让笔画成形。'),
    label('Scroll to assemble. Scroll back to retrace your stroke.', '下滚让线框聚合，上滚可倒放至原来的笔迹。'),
    label('Drag to rotate the AK. You can also use the arrow keys.', '拖动可绕中心旋转 AK，也可以使用方向键。')
  ];
  reset.textContent = label('Redraw', '重新绘画');
  canvas.setAttribute('aria-label', label('Draw a stroke or rotate the AK model', '绘画或旋转 AK 模型'));
  const edges = [];
  // Build a faceted silhouette from closed contours with visible depth.
  function mesh(outline, depth) {
    const front = outline.map(([x,y]) => [x,y,depth]);
    const back = outline.map(([x,y]) => [x,y,-depth]);
    for (let i=0; i<front.length; i++) {
      const j=(i+1)%front.length;
      edges.push([front[i],front[j]], [back[i],back[j]], [front[i],back[i]], [front[i],back[j]]);
      if (i>1 && i<front.length-1) edges.push([front[0],front[i]]);
    }
  }
  mesh([[-96,-8],[-91,-12],[-57,-9],[-39,-7],[-40,0],[-62,7],[-94,16]],4);
  mesh([[-44,-13],[-35,-17],[10,-16],[19,-9],[12,2],[-41,2]],6);
  mesh([[-31,2],[-20,2],[-25,22],[-35,20]],4);
  mesh([[-8,2],[7,1],[9,11],[15,20],[24,27],[15,34],[2,26],[-6,15]],4);
  mesh([[10,-15],[42,-15],[48,-10],[41,-4],[10,-3]],5);
  mesh([[42,-11],[91,-11],[95,-9],[94,-6],[42,-7]],2);
  mesh([[71,-11],[75,-21],[79,-21],[80,-10]],2);
  mesh([[27,-15],[35,-20],[63,-14],[69,-11],[52,-11]],2);
  const guide = [[-.42,.18],[.02,-.34],[.39,.22],[-.42,.18]];
  let stroke=[], path=[], yaw=-.27, pitch=-.13, progress=0, mode=-1, pointer=null;
  let width=0, height=0;
  const clamp = v => Math.max(0,Math.min(1,v));
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
  const demo=sample(guide);
  function draw() {
    if (!width || !height || stage.hidden) return;
    ctx.clearRect(0,0,width,height);
    const unit=Math.min(width*.76,height*.97);
    const source=path.length ? path : demo;
    const scale=Math.min(width/215,height/85);
    const project=([x,y,z])=>{
      y-=5;
      const xx=x*Math.cos(yaw)+z*Math.sin(yaw), zz=z*Math.cos(yaw)-x*Math.sin(yaw);
      return [xx*scale,(y*Math.cos(pitch)-zz*Math.sin(pitch))*scale];
    };
    const point=(from,to,t)=>[width/2+from[0]*unit*(1-t)+to[0]*t,height/2+from[1]*unit*(1-t)+to[1]*t];
    ctx.lineWidth=1.45; ctx.lineCap='round';
    ctx.setLineDash(!stroke.length && progress===0 ? [5,7] : []);
    for(let i=0;i<edges.length;i++){
      const t=clamp(progress*1.22-i/edges.length*.22);
      const smooth=t*t*(3-2*t);
      const a=point(source[i],project(edges[i][0]),smooth);
      const b=point(source[i+1],project(edges[i][1]),smooth);
      ctx.strokeStyle=progress===0 && !stroke.length ? '#74bcb4' : (i%4===1 && progress>.9 ? '#39998f' : '#9fffe4');
      ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();
    }
  }
  function update(value){
    progress=value;
    const state=value<.015?0:value>=.995?2:1;
    if(mode!==state){
      mode=state;hint.textContent=hints[state];
      canvas.classList.toggle('model-ready',state===2);
      next.textContent=state===2 ? label('Explore gameplay ↓','查看游戏实机 ↓') : label('Preview model ↓','预览模型 ↓');
      if(pointer!==null && canvas.hasPointerCapture(pointer)) canvas.releasePointerCapture(pointer);
      pointer=null;
    }
    draw();
  }
  function resize(){
    const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;
    const ratio=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);draw();
  }
  new ResizeObserver(resize).observe(canvas);
  function position(e){
    const rect=canvas.getBoundingClientRect(),unit=Math.min(width*.76,height*.97);
    return [(e.clientX-rect.left-width/2)/unit,(e.clientY-rect.top-height/2)/unit];
  }
  let last;
  canvas.addEventListener('pointerdown',e=>{
    if(pointer!==null || e.button!==0 || mode===1) return;
    pointer=e.pointerId;canvas.setPointerCapture(pointer);last=position(e);
    if(mode===0){stroke=[last];path=[];draw();}
  });
  canvas.addEventListener('pointermove',e=>{
    if(pointer!==e.pointerId) return;
    const p=position(e);
    if(mode===2){yaw+=(p[0]-last[0])*4;pitch+=(p[1]-last[1])*4;}
    else if(Math.hypot(p[0]-last[0],p[1]-last[1])>.002){stroke.push(p);path=sample(stroke);}
    last=p;draw();
  });
  canvas.addEventListener('lostpointercapture',()=>{pointer=null;});
  canvas.addEventListener('keydown',e=>{
    if(mode!==2 || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) return;
    e.preventDefault();yaw+=({'ArrowLeft':-.15,'ArrowRight':.15}[e.key]||0);
    pitch+=({'ArrowUp':-.15,'ArrowDown':.15}[e.key]||0);draw();
  });
  const pin=stage.firstElementChild;
  const travel=()=>stage.offsetHeight-pin.offsetHeight;
  gsap.registerPlugin(ScrollTrigger);
  let trigger;
  function visibility(){
    if(stage.hidden){trigger?.kill();trigger=null;return;}
    if(!trigger) trigger=ScrollTrigger.create({trigger:stage,start:'top top',end:()=>'+='+travel(),onUpdate:self=>update(clamp(self.progress*1.35))});
    trigger.refresh();update(clamp(trigger.progress*1.35));resize();
  }
  new MutationObserver(visibility).observe(stage,{attributes:true,attributeFilter:['hidden']});
  const jump=top=>window.scrollTo({top,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  const start=()=>stage.getBoundingClientRect().top+scrollY;
  reset.addEventListener('click',()=>{stroke=[];path=[];yaw=-.27;pitch=-.13;draw();jump(start());});
  next.addEventListener('click',()=>jump(mode===2 ? document.querySelector('#proof').getBoundingClientRect().top+scrollY : start()+travel()*.8));
  visibility();
})();