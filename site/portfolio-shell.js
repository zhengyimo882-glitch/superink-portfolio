(() => {
  const header=document.querySelector('.site-header'),nav=header.querySelector('nav');
  nav.id='project-navigation';
  const button=document.createElement('button');button.className='project-menu-toggle';button.type='button';
  button.textContent=document.documentElement.lang.startsWith('zh')?'菜单':'Menu';
  button.setAttribute('aria-controls',nav.id);button.setAttribute('aria-expanded','false');header.append(button);
  const close=()=>{nav.classList.remove('is-open');button.setAttribute('aria-expanded','false');};
  button.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');button.setAttribute('aria-expanded',String(open));});
  const sectionLinks=[...nav.querySelectorAll('a')].filter(a=>a.getAttribute('href').startsWith('#'));
  const sections=sectionLinks.map(a=>document.getElementById(a.hash.slice(1)));
  let queued=0;
  function markPosition(){
    queued=0;let current=0;
    const line=header.getBoundingClientRect().bottom+56;
    sections.forEach((section,i)=>{if(section&&!section.closest('[hidden]')&&section.getBoundingClientRect().top<=line)current=i;});
    sectionLinks.forEach((a,i)=>{if(i===current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
  }
  function schedule(){if(!queued)queued=requestAnimationFrame(markPosition);}
  nav.addEventListener('click',e=>{
    const link=e.target.closest('a');if(!link)return;close();
    if(link.getAttribute('href').startsWith('#')){
      const target=document.getElementById(link.hash.slice(1));
      // Move keyboard focus out of the collapsed menu without scrolling twice.
      if(target){target.tabIndex=-1;target.focus({preventScroll:true});}
    }
    schedule();
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&button.getAttribute('aria-expanded')==='true'){close();button.focus();}});
  document.addEventListener('click',e=>{if(!header.contains(e.target))close();});
  header.addEventListener('focusout',e=>{if(!header.contains(e.relatedTarget))close();});
  matchMedia('(max-width:1050px)').addEventListener('change',close);
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
  function settleAnchor(){
    const el=document.getElementById(location.hash.slice(1));
    if(el&&!el.closest('[hidden]')){window.ScrollTrigger?.refresh();el.scrollIntoView({block:'start',behavior:'instant'});}
    schedule();
  }
  addEventListener('load',()=>requestAnimationFrame(()=>requestAnimationFrame(settleAnchor)),{once:true});
  schedule();
})();
