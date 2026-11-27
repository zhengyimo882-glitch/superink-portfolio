(() => {
  'use strict';
  const root=document.querySelector('#relic-project'),hero=document.querySelector('#relic-intro');
  if(!root||!hero)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const cn=window.siteI18n?.language==='zh-CN',t=(en,zh)=>cn?zh:en;
  const copy=hero.querySelector('.rr-hero-copy');
  const track=document.createElement('div');track.className='relic-descent-track';
  track.innerHTML=`<div class="relic-descent-pin"><div class="relic-descent-world"></div><div class="relic-descent-hud"><span>${t('SCROLL TO DESCEND · REVERSE TO RETURN','滚动深入 · 向上滚动返回')}</span><span data-descent-step></span><a href="#relic-gameplay">${t('Skip to gameplay ↗','跳至实机演示 ↗')}</a></div></div>`;
  const world=track.querySelector('.relic-descent-world');
  const opening=document.createElement('div');opening.className='relic-descent-scene relic-descent-opening';opening.append(copy);world.append(opening);
  const scenes=[
    ['tomb',t('01 / THE THRESHOLD','01 / 墓门'),t('Read the room.','先看清这间墓室。'),t('Light reveals a path. What you disturb may change it.','光照出一条路。你触碰的东西，可能改变它。')],
    ['portal',t('02 / THE TEMPTATION','02 / 诱惑'),t('One more passage.','再深入一条墓道。'),t('You could turn back. Something beyond the light keeps you here.','你可以回头。但光线之外，还有东西让你留下。')],
    ['shop',t('03 / THE RETURN','03 / 归来'),t('What did you bring back?','你究竟带回了什么？'),t('Leaving the tomb is only the beginning.','走出墓穴，只是开始。')]
  ];
  scenes.forEach(([key,label,title,body])=>{
    const asset=window.RELIC_CONFIG.assets[key];
    const scene=document.createElement('div');scene.className='relic-descent-scene';
    const image=document.createElement('img');image.src='./assets/relic/'+asset.file;image.alt=window.siteI18n?.t(asset.alt)||asset.alt;image.decoding='async';image.loading='lazy';image.width=1280;image.height=720;
    const text=document.createElement('div');text.className='relic-descent-copy';
    text.innerHTML=`<span>${label}</span><h2>${title}</h2><p>${body}</p>`;
    scene.append(image,text);world.append(scene);
  });
  hero.append(track);hero.classList.add('relic-descent-enabled');
  const panels=[...world.children],pin=track.firstElementChild,step=track.querySelector('[data-descent-step]');
  const clamp=x=>Math.max(0,Math.min(1,x));let frame=0;
  function draw(){
    frame=0;if(root.hidden)return;
    if(reduced.matches){panels.forEach(p=>{p.removeAttribute('style');p.inert=false;p.removeAttribute('aria-hidden');});return;}
    const distance=Math.max(1,track.offsetHeight-pin.offsetHeight);
    const progress=clamp(-track.getBoundingClientRect().top/distance)*3.85;
    let nearest=Math.min(3,Math.round(progress));
    panels.forEach((panel,i)=>{
      const q=progress-i;
      // A reading interval around each plane keeps text still; travel is spatial,
      // reversible and derived solely from native scroll, never a replayed tween.
      const z=Math.max(-5000,Math.min(980,(q<-.15?q+.15:q>.25?q-.25:0)*1800));
      const opacity=clamp((q+.95)/.55)*(1-clamp((q-.35)/.4));
      panel.style.transform=`translateZ(${z}px)`;panel.style.opacity=String(opacity);
      panel.style.visibility=opacity>.005?'visible':'hidden';
      panel.style.zIndex=String(10-i);
      panel.inert=i!==nearest||opacity<.1;panel.setAttribute('aria-hidden',String(panel.inert));
    });
    step.textContent=`0${nearest+1} / 04`;
  }
  function schedule(){if(!frame&&!root.hidden)frame=requestAnimationFrame(draw);}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});addEventListener('load',schedule);
  root.addEventListener('project-visibility',schedule);reduced.addEventListener('change',schedule);
  // Keyboard focus can return to the opening's real controls without leaving them offscreen.
  copy.addEventListener('focusin',()=>{if(!reduced.matches)track.scrollIntoView({behavior:'instant',block:'start'});});
  schedule();
})();
