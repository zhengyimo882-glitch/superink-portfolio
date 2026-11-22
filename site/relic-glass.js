(() => {
  'use strict';
  const root=document.querySelector('#relic-project');if(!root)return;
  const profile=document.querySelector('#about');
  const panels='.rr-hero-copy,.rr-heading,.rr-frame,.rr-scene,.rr-detail,.rr-shop-tools,.rr-inspection-footer,.rr-gallery-footer,.rr-ending,.rr-art-stack,.rr-gallery-heading,.relic-descent-scene:not(.relic-descent-opening),.design-evidence,.evidence-result > div,.evidence-options button,.rr-stage,.rr-button,.about-panel,.legacy-meta,.resume-highlights article,.project-selector';
  const controls='.rr-stage,.rr-button,.evidence-options button';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
  const states=new WeakMap(),moving=new Set();let current=null,frame=0,lastTime=0;
  const enabled=()=>document.body.classList.contains('viewing-relic')&&!document.hidden&&!reduced.matches&&fine.matches;
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  function register(node){
    if(!(node instanceof Element))return;
    const targets=[...(node.matches(panels)?[node]:[]),...node.querySelectorAll(panels)];
    for(const panel of targets){
      if(states.has(panel)||panel.closest('.rr-viewer'))continue;
      const small=panel.matches(controls);
      states.set(panel,{x:0,y:0,tx:0,ty:0,light:0,targetLight:0,small});
      panel.classList.add('rr-luxe-panel');if(small)panel.classList.add('rr-luxe-control');
      if(panel.matches('.rr-frame,.rr-art-stack,.relic-descent-scene'))panel.classList.add('rr-luxe-media');
      if(getComputedStyle(panel.parentElement).perspective==='none')panel.parentElement.classList.add('rr-luxe-perspective');
      const sheen=document.createElement('span');sheen.className='rr-luxe-sheen';sheen.setAttribute('aria-hidden','true');
      const trim=document.createElement('span');trim.className='rr-luxe-trim';trim.setAttribute('aria-hidden','true');panel.append(sheen,trim);
    }
  }
  register(root);if(profile)register(profile);
  const observer=new MutationObserver(records=>{
    for(const record of records)for(const node of record.addedNodes)register(node);
    if(current?.querySelector('iframe'))release();
  });observer.observe(root,{childList:true,subtree:true});
  function write(panel,state){
    const amount=state.small?4:panel.classList.contains('rr-inspect')?4.5:7;
    const rx=-state.y*amount,ry=state.x*amount,angle=Math.hypot(rx,ry);
    panel.style.setProperty('--luxe-axis-x',angle?String(rx/angle):'1');
    panel.style.setProperty('--luxe-axis-y',angle?String(ry/angle):'0');
    panel.style.setProperty('--luxe-angle',angle.toFixed(3)+'deg');
    panel.style.setProperty('--luxe-light-x',(50+state.x*43).toFixed(2)+'%');
    panel.style.setProperty('--luxe-light-y',(50+state.y*43).toFixed(2)+'%');
    panel.style.setProperty('--luxe-glint',state.light.toFixed(3));
  }
  function tick(now){
    frame=0;const dt=Math.min((now-(lastTime||now-16))/1000,.05);lastTime=now;
    for(const panel of moving){
      const state=states.get(panel);
      if(!panel.isConnected){moving.delete(panel);continue;}
      const ease=1-Math.exp(-dt*(panel===current?13:8));
      state.x+=(state.tx-state.x)*ease;state.y+=(state.ty-state.y)*ease;state.light+=(state.targetLight-state.light)*ease;write(panel,state);
      if(Math.abs(state.tx-state.x)+Math.abs(state.ty-state.y)+Math.abs(state.targetLight-state.light)<.002){
        state.x=state.tx;state.y=state.ty;state.light=state.targetLight;write(panel,state);moving.delete(panel);panel.classList.remove('rr-luxe-moving');
      }
    }
    if(moving.size)frame=requestAnimationFrame(tick);else lastTime=0;
  }
  function wake(panel){moving.add(panel);panel.classList.add('rr-luxe-moving');if(!frame)frame=requestAnimationFrame(tick);}
  function release(){
    if(!current)return;const panel=current;current=null;const state=states.get(panel);
    state.tx=state.ty=state.targetLight=0;panel.classList.remove('rr-luxe-hover');wake(panel);
  }
  document.addEventListener('pointermove',event=>{
    if(!enabled()||event.pointerType==='touch'){release();return;}
    const panel=event.target.closest?.('.rr-luxe-panel');
    if(!panel||panel.closest('[inert],[hidden]')||panel.querySelector('iframe')){release();return;}
    if(current!==panel){release();current=panel;panel.classList.add('rr-luxe-hover');}
    const state=states.get(panel),rect=panel.getBoundingClientRect();if(!rect.width||!rect.height)return;
    // The center remains stable under individual-axis rotation; original scroll
    // transforms stay intact on the separate CSS transform property.
    state.tx=clamp((event.clientX-(rect.left+rect.width/2))/(rect.width/2),-1,1);
    state.ty=clamp((event.clientY-(rect.top+rect.height/2))/(rect.height/2),-1,1);
    state.targetLight=1;wake(panel);
  },{passive:true});
  document.addEventListener('pointerout',event=>{if(!event.relatedTarget)release();},{passive:true});
  document.addEventListener('pointercancel',release,{passive:true});
  window.addEventListener('scroll',release,{passive:true});window.addEventListener('blur',release);
  function reset(){
    release();if(enabled())return;
    if(frame)cancelAnimationFrame(frame);frame=0;lastTime=0;
    for(const panel of moving){const s=states.get(panel);s.x=s.y=s.tx=s.ty=s.light=s.targetLight=0;write(panel,s);panel.classList.remove('rr-luxe-moving','rr-luxe-hover');}moving.clear();
  }
  reduced.addEventListener('change',reset);fine.addEventListener('change',reset);document.addEventListener('visibilitychange',reset);
  new MutationObserver(reset).observe(document.body,{attributes:true,attributeFilter:['class']});
})();
