/* Lightweight motion for the portfolio and case studies; no WebGL dependency. */
(() => {
  if(document.body.classList.contains('case-immersive'))return;
  if(document.body.id!=='home'&&!document.body.classList.contains('case-page'))return;
  const body=document.body,reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
  body.classList.add('reading-polish');
  const atmosphere=document.createElement('div');atmosphere.className='reading-atmosphere';atmosphere.setAttribute('aria-hidden','true');
  atmosphere.innerHTML='<div class="atmosphere-light"></div><div class="atmosphere-surface"></div><div class="atmosphere-horizon"></div>';
  body.prepend(atmosphere);
  const progress=document.createElement('div');progress.className='reading-progress';progress.setAttribute('aria-hidden','true');body.append(progress);
  let frame=0;
  const update=()=>{frame=0;const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${max>0?Math.min(1,Math.max(0,scrollY/max)):0})`;body.classList.toggle('reading-scrolled',scrollY>30);};
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
  new ResizeObserver(schedule).observe(document.body);schedule();
  const cards=[...document.querySelectorAll('.work-card,.intro-note,.case-decisions article,.case-experience,.case-pipeline li')];
  cards.forEach(card=>{
    card.classList.add('reading-surface');let next=0,point;
    function paint(){next=0;if(!fine.matches||reduced.matches)return;const r=card.getBoundingClientRect();const x=Math.min(1,Math.max(0,(point.x-r.left)/r.width)),y=Math.min(1,Math.max(0,(point.y-r.top)/r.height));card.style.setProperty('--light-x',`${x*100}%`);card.style.setProperty('--light-y',`${y*100}%`);card.style.setProperty('--tilt-x',`${(0.5-y)*3}deg`);card.style.setProperty('--tilt-y',`${(x-0.5)*3}deg`);}
    card.addEventListener('pointermove',e=>{if(!fine.matches||reduced.matches)return;point={x:e.clientX,y:e.clientY};if(!next)next=requestAnimationFrame(paint);},{passive:true});
    const reset=()=>{if(next)cancelAnimationFrame(next);next=0;card.style.setProperty('--tilt-x','0deg');card.style.setProperty('--tilt-y','0deg');};
    card.addEventListener('pointerleave',reset);card.addEventListener('focusout',reset);reduced.addEventListener('change',reset);
    if(card.matches('.work-card')){
      const preview=()=>body.dataset.preview=card.classList.contains('relic-work')?'relic':'ink';
      card.addEventListener('pointerenter',preview);card.addEventListener('focusin',preview);
      card.addEventListener('pointerleave',()=>delete body.dataset.preview);card.addEventListener('focusout',e=>{if(!card.contains(e.relatedTarget))delete body.dataset.preview;});
    }
  });
  // Animate a section only once; content is visible even if the observer fails.
  const animations=new Set();
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{
    if(!isIntersecting)return;observer.unobserve(target);
    if(reduced.matches||target.closest('[hidden]'))return;
    const anim=target.animate([{opacity:.55,transform:'translateY(22px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,easing:'cubic-bezier(.16,1,.3,1)'});animations.add(anim);anim.finished.then(()=>animations.delete(anim)).catch(()=>{});
  }),{threshold:.08});document.querySelectorAll('.section-top,.work-card,.home-about,.home-contact,.case-chapter,.case-video-heading,.case-experience').forEach(el=>observer.observe(el));}
  reduced.addEventListener('change',()=>{if(reduced.matches)animations.forEach(a=>a.finish());});
  document.addEventListener('visibilitychange',()=>body.classList.toggle('reading-paused',document.hidden));
  // A practical shortcut beside the existing mail link, with bilingual feedback.
  const contact=document.querySelector('.home-contact');
  if(contact){const tools=document.createElement('div');tools.className='contact-tools';const email=contact.querySelector('a');email.before(tools);tools.append(email);
    const button=document.createElement('button');button.type='button';button.className='copy-email';tools.append(button);
    const status=document.createElement('span');status.className='copy-status';status.setAttribute('role','status');tools.append(status);
    const zh=()=>document.documentElement.lang.startsWith('zh');const label=()=>button.textContent=zh()?'复制邮箱':'Copy email';label();new MutationObserver(label).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText('zhengyimo882@gmail.com');status.textContent=zh()?'邮箱已复制':'Email copied';}catch{status.textContent=zh()?'请选中邮箱地址复制':'Select the email address to copy it';}});
  }
})();
