(() => {
  'use strict';
  const scopes=[...document.querySelectorAll('.si-space-section')];
  if(!scopes.length || !window.IntersectionObserver || !Element.prototype.animate)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const small=matchMedia('(max-width: 650px)');
  const plans=new Map(),active=new Set();
  const ease='cubic-bezier(.16,1,.3,1)';
  const end={opacity:1,transform:'perspective(1200px) translate3d(0,0,0) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)',filter:'blur(0px)',clipPath:'inset(0% 0% 0% 0%)'};
  const frames=(start,mid)=>[start,...(mid?[{...mid,offset:.72}]:[]),end];
  const presets={
    warp:()=>frames({opacity:0,transform:'perspective(1200px) translate3d(0,24px,-1600px) rotateX(18deg)',filter:'blur(12px)'},{opacity:.95,transform:'perspective(1200px) translate3d(0,-3px,25px) rotateX(-1deg)',filter:'blur(.5px)'}),
    orbitLeft:()=>frames({opacity:0,transform:'perspective(1200px) translate3d(-110px,20px,-700px) rotateY(48deg) rotateZ(-7deg)',filter:'blur(6px)'}),
    orbitRight:()=>frames({opacity:0,transform:'perspective(1200px) translate3d(110px,-18px,-800px) rotateY(-45deg) rotateZ(6deg)',filter:'blur(5px)'}),
    fold:()=>frames({opacity:0,transform:'perspective(1200px) translate3d(0,65px,-500px) rotateX(70deg)',filter:'blur(4px)'}),
    spiral:()=>frames({opacity:0,transform:'perspective(1200px) translate3d(40px,30px,-850px) rotateZ(-24deg) rotateY(20deg)',filter:'blur(7px)'}),
    drop:()=>frames({opacity:0,transform:'perspective(1200px) translate3d(0,-95px,-500px) rotateX(-28deg)',filter:'blur(4px)'},{opacity:1,transform:'perspective(1200px) translate3d(0,5px,0) rotateX(1deg)',filter:'blur(0px)'}),
    shutter:()=>frames({opacity:.2,transform:'perspective(1200px) translate3d(0,0,-420px)',clipPath:'inset(49.5% 0% 49.5% 0%)',filter:'blur(4px)'},{opacity:1,transform:'perspective(1200px) translate3d(0,0,-30px)',clipPath:'inset(1% 0% 1% 0%)',filter:'blur(0px)'}),
    scan:()=>frames({opacity:.3,transform:'perspective(1200px) translate3d(24px,0,-80px)',clipPath:'inset(0% 100% 0% 0%)',filter:'blur(3px)'}),
    scanReverse:()=>frames({opacity:.3,transform:'perspective(1200px) translate3d(-24px,0,-80px)',clipPath:'inset(0% 0% 0% 100%)',filter:'blur(3px)'}),
    decode:()=>[
      {opacity:0,transform:'translateY(12px)',clipPath:'inset(0% 0% 100% 0%)',filter:'blur(3px)',offset:0},
      {opacity:.45,transform:'translateY(7px)',clipPath:'inset(0% 0% 65% 0%)',filter:'blur(1px)',offset:.25},
      {opacity:.85,transform:'translateY(2px)',clipPath:'inset(0% 0% 20% 0%)',filter:'blur(0px)',offset:.6},end
    ],
    focus:()=>frames({opacity:0,transform:'perspective(1200px) translateZ(160px) scale(1.04)',filter:'blur(10px)'}),
    rise:()=>frames({opacity:0,transform:'perspective(1200px) translate3d(0,35px,-180px)',filter:'blur(5px)'}),
    trace:()=>frames({opacity:.25,transform:'translateX(-12px)',clipPath:'inset(0% 100% 0% 0%)',filter:'blur(0px)'})
  };
  const select=s=>scopes.flatMap(scope=>[...scope.querySelectorAll(s)]);
  function add(selector,types,duration=950,stagger=75){
    select(selector).forEach((node,i)=>{
      if(plans.has(node))return;
      const type=types[i%types.length];
      plans.set(node,{type,duration,delay:Math.min(i*stagger,300),state:'pending',animation:null,timer:null});
      node.dataset.siArrival=type;
    });
  }
  // Unique directions and rhythms, deliberately assigned by content role.
  add('#hero-title',['focus'],1250,0);
  add('.hero-statement strong',['shutter'],900,0);
  add('.hero-statement p',['decode'],800,0);
  add('#intent-title',['warp'],1250,0);
  add('#experience-title',['shutter'],1100,0);
  add('#recognition-title',['orbitRight'],1150,0);
  add('#loop-title',['fold'],1100,0);
  add('#combat-story-title',['focus'],1150,0);
  add('.section-label,.hero-index',['trace','scanReverse','decode'],650,35);
  add('.intent-heading > p,.experience-heading > p,.proof-copy > p,.story-intro > p',['scan','rise','scanReverse','decode'],850,60);
  add('.intent-body > p',['decode','orbitRight','scanReverse'],900,80);
  add('.intent-body blockquote',['orbitLeft'],1200,0);
  add('.principle-grid article',['orbitLeft','fold','orbitRight','spiral'],1150,95);
  add('.video-column',['shutter'],1350,0);
  add('.recognition-lab',['drop'],1050,0);
  add('.loop-section li',['warp','orbitLeft','fold','drop','orbitRight','spiral','focus'],1000,55);
  add('.loop-section > p',['scanReverse'],1000,0);
  add('.fps-section-hud',['decode'],750,0);
  add('.about-intro',['orbitLeft'],1150,0);
  add('.about-portrait',['focus'],1350,0);
  add('.about-education',['scan'],950,0);
  add('.about-section-heading',['decode','scanReverse'],750,0);
  add('.resume-highlights article',['warp','fold','orbitRight'],1100,85);
  add('.about-experience article',['orbitLeft','shutter'],1050,90);
  add('.about-toolkit',['trace'],850,0);
  add('.about-contact',['rise'],950,0);
  if(!plans.size)return;

  function settle(node){
    const p=plans.get(node);if(!p)return;
    p.state='done';node.dataset.siState='done';
    if(p.timer!==null){clearTimeout(p.timer);p.timer=null;}
    if(p.animation){const animation=p.animation;p.animation=null;animation.onfinish=null;animation.oncancel=null;animation.cancel();}
    active.delete(node);
    observer?.unobserve(node);
  }
  function play(node){
    const p=plans.get(node);if(!p || p.state!=='pending')return;
    if(reduced.matches || document.hidden){settle(node);return;}
    // Observe the original layout only. The animation itself changes the
    // intersection rectangle and must not be allowed to cancel its own entrance.
    observer.unobserve(node);
    // On small screens use shorter travel, while keeping the assigned direction.
    const keyframes=presets[p.type]().map(frame=>{
      if(!small.matches || !frame.transform)return frame;
      return {...frame,transform:frame.transform.replace(/(-?\d+(?:\.\d+)?)px/g,(m,n)=>Math.abs(Number(n))===1200?m:`${Number(n)*.6}px`)};
    });
    p.state='running';node.dataset.siState='running';active.add(node);
    try {
      const animation=node.animate(keyframes,{duration:p.duration,delay:p.delay,easing:p.type==='decode'?'linear':ease,fill:'both'});
      p.animation=animation;
      animation.onfinish=()=>settle(node);
      animation.oncancel=()=>{if(p.animation===animation)settle(node);};
      p.timer=setTimeout(()=>settle(node),p.duration+p.delay+2000);
    } catch {settle(node);}
  }
  const observer=new IntersectionObserver(entries=>{
    // Observer notifications only schedule a check. Wheel events and observer
    // callbacks share the same layout threshold and one-way state machine.
    if(entries.some(entry=>plans.get(entry.target)?.state==='pending'))queueCheck();
  },{threshold:0,rootMargin:'0px'});

  scopes.forEach(scope=>{
    scope.classList.add('si-motion-scope');
    if(typeof sectionFxObserver!=='undefined')sectionFxObserver.unobserve(scope);
    // Remove the previous blanket reveal system from this project only.
    scope.querySelectorAll('.scroll-reveal,.fx-card,.fx-image,.ink-write').forEach(node=>{
      if(typeof revealObserver!=='undefined')revealObserver.unobserve(node);
      node.classList.remove('scroll-reveal','fx-card','fx-image','ink-write');
    });
    scope.querySelectorAll('.ink-word').forEach(word=>word.replaceWith(document.createTextNode(word.textContent)));
  });
  plans.forEach((p,node)=>{
    node.dataset.siState=reduced.matches?'done':'pending';
    if(reduced.matches)p.state='done';else observer.observe(node);
  });
  // Focus and activation always reveal the complete control immediately.
  function revealInteraction(event){
    for(let node=event.target;node && node!==document;node=node.parentElement){
      if(plans.has(node))settle(node);
    }
  }
  document.addEventListener('focusin',revealInteraction);
  document.addEventListener('pointerdown',revealInteraction,true);
  reduced.addEventListener('change',()=>{if(reduced.matches)plans.forEach((p,node)=>settle(node));});
  // A layout-based backup covers missed observer notifications, restored scroll
  // positions and project switching. Running/done items never get re-armed.
  let checkFrame=0;
  function checkVisible(){
    checkFrame=0;
    if(document.hidden)return;
    const line=window.innerHeight*.9;
    plans.forEach((p,node)=>{
      if(p.state!=='pending' || node.closest('[hidden]'))return;
      const r=node.getBoundingClientRect();
      if(!r.width || !r.height)return;
      if(r.bottom<=0)settle(node);
      else if(r.top<line && r.right>0 && r.left<window.innerWidth)play(node);
    });
  }
  function queueCheck(){if(!checkFrame)checkFrame=requestAnimationFrame(checkVisible);}
  for(const event of ['scroll','resize','pageshow','load'])window.addEventListener(event,queueCheck,{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)[...active].forEach(settle);else queueCheck();
  });
  const studio=document.getElementById('ink-studio');
  if(studio)new MutationObserver(queueCheck).observe(studio,{attributes:true,attributeFilter:['hidden']});
  // Only hide waiting elements after both trigger paths have been installed.
  // If setup fails or JS is unavailable, the baseline remains visible.
  scopes.forEach(scope=>scope.classList.add('si-arrivals-ready'));
  queueCheck();
})();
