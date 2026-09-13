/* Native scrolling drives a sticky artwork stack. No wheel interception. */
window.mountRelicGallery = function(root) {
 const items=window.RELIC_CONFIG.gallery;
 const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const section=document.createElement('section');section.id='relic-artwork';section.className='rr-gallery';section.setAttribute('aria-labelledby','rr-gallery-title');
 section.innerHTML=`<div class="rr-gallery-track"><div class="rr-gallery-sticky"><header class="rr-gallery-heading"><div><span class="rr-kicker">06 / ARTWORK</span><h2 id="rr-gallery-title">Between two worlds.</h2></div><span class="rr-gallery-hint">Scroll to uncover ↓</span></header><div class="rr-art-stack">${items.map((item,i)=>`<figure class="rr-art-card" data-art="${i}" style="z-index:${i+1}"><img src="./assets/relic/${item.file}" alt="${escape(item.alt)}" width="${item.width}" height="${item.height}" loading="lazy" decoding="async"><figcaption class="rr-art-narration"><span class="rr-caption-dust" aria-hidden="true">${Array.from({length:56},(_,d)=>`<i style="--dust:${d};--left:${(d*37)%100}%;--top:${(d*19)%85}%;--size:${8+(d*13)%65}px;--drift:${(d%2?1:-1)*(25+d*3)}px"></i>`).join('')}</span><span class="rr-art-eyebrow">${escape(item.eyebrow)}</span><h3 aria-label="${escape(item.headline)}">${item.headline.split(' ').map((word,w)=>`<span class="rr-word-mask rr-fragment-word" aria-hidden="true" style="--word:${w}"><span class="rr-word-solid">${escape(word)}</span>${Array.from({length:12},(_,f)=>`<span class="rr-letter-fragment" style="clip-path:inset(${Math.floor(f/4)*33.333}% ${75-(f%4)*25}% ${66.667-Math.floor(f/4)*33.333}% ${(f%4)*25}%);--fragment:${(f*7+w*3)%12};--dx:${((w*17+f*31)%111)-55}px;--dy:${((w*23+f*17)%81)-40}px">${escape(word)}</span>`).join('')}</span>`).join(' ')}</h3><p>${escape(item.body)}</p><span class="rr-art-rule" aria-hidden="true"></span></figcaption></figure>`).join('')}</div><div class="rr-gallery-footer"><p data-art-caption>01 / ${escape(items[0].title)}</p><div role="group" aria-label="Choose artwork">${items.map((item,i)=>`<button type="button" data-art-jump="${i}" aria-label="Show ${escape(item.title)}" aria-pressed="${i===0}"><span>0${i+1}</span></button>`).join('')}</div><span>Promotional artwork</span></div></div></div>`;
 root.querySelector('#relic-shop').after(section);
 section.querySelectorAll('.rr-art-narration').forEach(caption=>caption.querySelector('h3').prepend(caption.querySelector('.rr-caption-dust')));
 // The final invitation follows the last artwork rather than interrupting the scroll sequence.
 const ending=root.querySelector('.rr-ending');if(ending)section.append(ending);
 const track=section.querySelector('.rr-gallery-track'),sticky=section.querySelector('.rr-gallery-sticky'),cards=[...section.querySelectorAll('.rr-art-card')],buttons=[...section.querySelectorAll('[data-art-jump]')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,visible=false,active=-1;
 const clamp=x=>Math.max(0,Math.min(1,x));
 function draw(){frame=0;if(root.hidden)return;
  if(reduced.matches){cards.forEach(card=>{card.removeAttribute('style');card.removeAttribute('aria-hidden');});return;}
  const top=parseFloat(getComputedStyle(sticky).top)||0;
  const distance=Math.max(1,track.offsetHeight-sticky.offsetHeight);
  const progress=clamp((top-track.getBoundingClientRect().top)/distance)*3.35;
  cards.forEach((card,i)=>{
   const t=i===0?1:clamp((progress-(i-1)-.18)/.75),ease=t*t*(3-2*t),past=clamp(progress-i);
   card.style.zIndex=String(i+1);card.style.opacity=String(i===3?ease:1);
   card.style.filter=`brightness(${1-past*.35})`;
   if(i===0)card.style.transform=`scale(${1-past*.06}) translateY(${-past*10}px)`;
   if(i===1)card.style.transform=`translateY(${(1-ease)*110}%) rotate(${(1-ease)*-5}deg) scale(${1-past*.04})`;
   if(i===2){card.style.clipPath=`inset(0 ${(1-ease)*100}% 0 0)`;card.style.transform=`translateX(${(1-ease)*7}%) scale(${1-past*.035})`;}
   if(i===3)card.style.transform=`scale(${1.15-ease*.15}) translateY(${(1-ease)*20}px)`;
  });
  const index=Math.min(3,Math.max(0,Math.floor(progress+.07)));
  if(index!==active){active=index;section.dataset.active=String(index);section.querySelector('[data-art-caption]').textContent=`0${index+1} / ${items[index].title}`;cards.forEach((c,i)=>{c.setAttribute('aria-hidden',String(i!==index));c.classList.toggle('rr-art-current',i===index);});buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));}
  const current=cards[index];if(current.querySelector('.rr-art-narration').getBoundingClientRect().top<innerHeight*.9)current.classList.add('rr-reveal-ready');
  cards.forEach((c,i)=>{if(i!==index)c.classList.remove('rr-reveal-ready');});
 }
 function schedule(){if(!frame&&visible&&!root.hidden)frame=requestAnimationFrame(draw);}
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;section.classList.toggle('rr-gallery-visible',visible);if(visible)schedule();else if(frame){cancelAnimationFrame(frame);frame=0;}},{rootMargin:'200px'});observer.observe(track);
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});reduced.addEventListener('change',()=>{active=-1;draw();});
 root.addEventListener('project-visibility',e=>{if(e.detail.visible)schedule();else if(frame){cancelAnimationFrame(frame);frame=0;}});
 buttons.forEach((button,i)=>button.addEventListener('click',()=>{
  if(i===active){const card=cards[i];card.classList.remove('rr-art-current');void card.offsetWidth;card.classList.add('rr-art-current');}
  const top=parseFloat(getComputedStyle(sticky).top)||0;
  window.scrollTo({top:scrollY+track.getBoundingClientRect().top-top+(i/3.35)*(track.offsetHeight-sticky.offsetHeight),behavior:reduced.matches?'instant':'smooth'});
 }));
 draw();
};
