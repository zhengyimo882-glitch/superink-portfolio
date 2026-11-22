(() => {
 'use strict';
 const fine=matchMedia('(hover:hover) and (pointer:fine)'), reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const pointer=document.createElement('div');pointer.className='relic-pointer';pointer.setAttribute('aria-hidden','true');
 pointer.innerHTML='<span class="relic-pointer-tip"></span><span class="relic-pointer-halo"><i></i><i></i><i></i><i></i><small></small></span>';
 document.body.append(pointer);
 const halo=pointer.querySelector('.relic-pointer-halo'),label=pointer.querySelector('small');
 let x=0,y=0,hx=0,hy=0,raf=0,last=0,active=false,seen=false,subject=null,timer=0;
 const stamps=new Set();
 const available=()=>document.body.classList.contains('viewing-relic')&&fine.matches&&!document.hidden;
 function hide(){active=false;subject=null;clearTimeout(timer);pointer.className='relic-pointer';if(document.body.classList.contains('relic-pointer-active'))document.body.classList.remove('relic-pointer-active');if(raf)cancelAnimationFrame(raf);raf=0;last=0;}
 function draw(now){raf=0;if(!active)return;const dt=Math.min((now-(last||now-16))/1000,.05);last=now;const ease=reduced.matches?1:1-Math.exp(-dt*20);hx+=(x-hx)*ease;hy+=(y-hy)*ease;halo.style.transform=`translate(${hx-x}px,${hy-y}px)`;if(Math.abs(x-hx)+Math.abs(y-hy)>.1)raf=requestAnimationFrame(draw);else last=0;}
 function classify(el){
  if(!el||!available()||el.closest('dialog[open],iframe,input,textarea,select,[contenteditable="true"]')){hide();return;}
  const control=el.closest('a,button,[role="button"]');
  const media=el.closest('.rr-frame,.rr-art-stack,.relic-descent-scene:not(.relic-descent-opening)');
  // Native text selection and disabled controls retain their familiar cursors.
  if(control?.matches(':disabled,[aria-disabled="true"]')||(!control&&!media&&el.closest('p,h1,h2,h3,h4,blockquote,figcaption,.about-summary'))){hide();return;}
  const imageMode=!!media&&(!control||control.matches('.rr-choice-next'));
  const next=imageMode?media:control||null;
  if(!active){hx=x;hy=y;halo.style.transform='translate(0,0)';}
  active=true;if(!document.body.classList.contains('relic-pointer-active'))document.body.classList.add('relic-pointer-active');pointer.classList.add('is-visible');
  pointer.classList.toggle('is-image',imageMode);pointer.classList.toggle('is-control',!!control&&!imageMode);
  const tomb=el.closest('#relic-objects,#relic-fear');pointer.classList.toggle('is-tomb',!!tomb);
  if(next!==subject){clearTimeout(timer);pointer.classList.remove('is-inspecting');subject=next;
   if(imageMode)timer=setTimeout(()=>{if(active&&subject===next){label.textContent=document.documentElement.lang.startsWith('zh')?'细察':'EXAMINE';pointer.classList.add('is-inspecting');}},500);
  }
 }
 document.addEventListener('pointermove',e=>{if(e.pointerType==='touch'){hide();return;}seen=true;x=e.clientX;y=e.clientY;pointer.style.transform=`translate3d(${x}px,${y}px,0)`;classify(e.target);if(active&&!raf)raf=requestAnimationFrame(draw);},{passive:true});
 document.addEventListener('pointerdown',e=>{if(!active||e.button!==0||e.pointerType==='touch'||reduced.matches)return;
  const stamp=document.createElement('span');stamp.className='relic-pointer-stamp';stamp.setAttribute('aria-hidden','true');stamp.style.left=e.clientX+'px';stamp.style.top=e.clientY+'px';document.body.append(stamp);stamps.add(stamp);
  if(stamps.size>5){const first=stamps.values().next().value;first.remove();stamps.delete(first);}
  setTimeout(()=>{stamp.remove();stamps.delete(stamp);},650);
 },{passive:true});
 document.addEventListener('pointerout',e=>{if(!e.relatedTarget){seen=false;hide();}},{passive:true});
 document.addEventListener('pointercancel',hide);document.addEventListener('keydown',e=>{if(e.key==='Tab'){seen=false;hide();}});
 addEventListener('blur',()=>{seen=false;hide();});addEventListener('scroll',()=>{if(seen)classify(document.elementFromPoint(x,y));},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)hide();});fine.addEventListener('change',hide);reduced.addEventListener('change',hide);
 new MutationObserver(()=>{if(!available())hide();}).observe(document.body,{attributes:true,attributeFilter:['class']});
})();
