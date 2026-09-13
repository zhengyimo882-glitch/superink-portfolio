/* Reveal DOM text only: image pixels and embedded video content stay untouched. */
(() => {
 const root=document.querySelector('#relic-project');if(!root)return;
 const areas=[root,document.querySelector('nav[aria-label="Primary navigation"]'),document.querySelector('.project-code'),document.querySelector('footer')].filter(Boolean);
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const io=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{
  target.classList.toggle('rr-ink-visible',isIntersecting && document.body.classList.contains('viewing-relic'));
 }),{threshold:0.15});
 const excluded='rr-ink-run,script,style,iframe,svg,canvas,.rr-art-narration,[aria-hidden="true"]';
 function wrap(node){
  const run=document.createElement('rr-ink-run');
  const title=Boolean(node.parentElement.closest('h1,h2,h3,h4,h5,h6'));
  run.className=title?'rr-ink-title':'rr-ink-small';
  node.textContent.split(/(\s+)/).forEach((text,w)=>{
   if(!text.trim()){run.append(document.createTextNode(text));return;}
   const word=document.createElement('rr-ink-word');word.style.setProperty('--ink-delay',`${Math.min(w*.0125,.225)}s`);
   const base=document.createElement('rr-ink-base');base.textContent=text;word.append(base);
   for(let i=0;title && i<12;i++){
    const shard=document.createElement('rr-ink-shard');shard.textContent=text;shard.setAttribute('aria-hidden','true');
    shard.style.cssText=`clip-path:inset(${Math.floor(i/4)*33.333}% ${75-i%4*25}% ${66.667-Math.floor(i/4)*33.333}% ${i%4*25}%);--shard-delay:${((i*7+w*3)%12)*.0225}s;--sx:${((i*31+w*17)%91)-45}px;--sy:${((i*17+w*23)%61)-30}px`;
    word.append(shard);
   }
   run.append(word);
  });
  if(title){
  const dust=document.createElement('rr-ink-dust');dust.setAttribute('aria-hidden','true');
  for(let i=0;i<12;i++){const mote=document.createElement('i');mote.style.cssText=`--px:${(i*37)%100}%;--py:${(i*29)%90}%;--size:${8+(i*13)%35}px;--drift:${i%2?1:-1} ;--delay:${i*.0175}s`;dust.append(mote);}
  run.append(dust);}
  node.replaceWith(run);io.observe(run);
 }
 let pending=false;
 const changes=new MutationObserver(()=>{if(!pending){pending=true;queueMicrotask(scan);}});
 function scan(){pending=false;changes.disconnect();
  if(document.body.classList.contains('viewing-relic'))areas.forEach(area=>{
   const walker=document.createTreeWalker(area,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.textContent.trim() && !n.parentElement.closest(excluded)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT});
   const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);nodes.forEach(wrap);
  });
  areas.forEach(area=>changes.observe(area,{childList:true,subtree:true,characterData:true}));
 }
 root.addEventListener('project-visibility',e=>{
  queueMicrotask(()=>{scan();areas.forEach(area=>area.querySelectorAll('rr-ink-run').forEach(run=>{run.classList.remove('rr-ink-visible');io.unobserve(run);if(e.detail.visible)io.observe(run);}));});
 });
 motion.addEventListener('change',scan);scan();
})();
