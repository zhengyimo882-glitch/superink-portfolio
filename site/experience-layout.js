// A short interactive route; implementation and design discussion live in the case study.
window.layoutProjectExperience = ({root,lead,study,video,experience,end,nav,relic,t,experienceId}) => {
  lead.hidden=true;study.hidden=true;experience.hidden=true;video.hidden=true;
  const readURL='./projects.html?project='+(relic?'relic':'superink')+'&view=read';
  const first=document.getElementById(experienceId);
  first.tabIndex=-1;document.querySelector('.case-skip').href='#'+experienceId;
  const set=(selector,en,zh)=>{const el=root.querySelector(selector);if(el)el.textContent=t(en,zh);};
  const hide=id=>{const el=document.getElementById(id);if(el)el.hidden=true;};
  let route,removed;
  if(!relic){
    removed=['intent','experience','proof','loop'];removed.forEach(hide);hide('ink-evidence');
    const pipeline=root.querySelector('.lab-pipeline');if(pipeline)pipeline.hidden=true;
    set('#recognition-title','Draw a pattern. Try recognition.','画个图案，试试识别。');
    set('#recognition .proof-copy > p','Trace the guide, then select Analyze Drawing.','照着参考图案画一遍，再点击“识别图案”。');
    set('#recognition .section-label span','01','01');
    set('#combat-story .section-label span','02','02');
    set('#combat-story-title','Bring it into the fight.','画出来，拿去战斗。');
    const scenes=[['Take form.','生成武器','Your drawing becomes a temporary weapon.','亲手画出的图案，变成限时武器。'],['Move in.','向前推进','Find a route. Choose your moment.','观察战场，找准推进的时机。'],['Engage.','投入交战','Aim, move and manage your ammo.','瞄准、走位，也别忘了剩余弹药。'],['Leave a mark.','留下印记','Drawing reaches beyond the weapon.','笔画不仅能生成武器，也能参与争夺目标。']];
    root.querySelectorAll('.story-card').forEach((card,i)=>{const c=scenes[i];card.querySelector('h3').textContent=t(c[0],c[1]);card.querySelector('p').textContent=t(c[2],c[3]);});
    route=[['ink-studio','Draw','画出武器'],['hero','Ink','留下墨迹'],['recognition','Try it','试试识别'],['combat-story','Combat','投入战斗']];
  }else{
    removed=['relic-gameplay','relic-artwork'];removed.forEach(hide);hide('relic-evidence');
    root.querySelectorAll('.rr-ending').forEach(el=>el.hidden=true);
    set('#relic-objects .rr-heading h2','Look into the dark.','照亮暗处，找找线索。');
    set('#relic-objects .rr-heading > p','Move the light and select a marker.','移动光源，点击标记查看详情。');
    set('#relic-fear .rr-heading h2','Leave now, or go deeper?','现在走，还是再往前？');
    set('#relic-fear .rr-heading > p','Room for two relics. What will you take?','背包只能装两件，你想带走什么？');
    set('#relic-shop .rr-heading h2','Discover what you brought back.','带回来了，再仔细看看。');
    set('#relic-shop .rr-heading > p','Clean, inspect and record your findings.','清理尘土、查看细节，记下发现的线索。');
    route=[['relic-intro','Descend','进入古墓'],['relic-objects','Explore','寻找线索'],['relic-fear','Choose','决定去留'],['relic-shop','Appraise','查看古物']];
  }
  route.forEach(([id])=>{const el=document.getElementById(id);if(el)root.append(el);});root.append(end);
  // Links to video or removed chapters still have a destination in the reading view.
  document.querySelectorAll('a[href^="#"]').forEach(a=>{const id=a.getAttribute('href').slice(1);if(removed.includes(id))a.href=readURL+(id===video.id?'#'+id:'#case-system');});
  const mode=nav.querySelector('.case-mode-link');
  nav.innerHTML=`<a href="./#projects">${t('Work','作品')}</a>${route.map(([id,en,zh])=>`<a href="#${id}">${t(en,zh)}</a>`).join('')}`;
  if(mode)nav.append(mode);
  // Keep the existing selector available to its event handlers, without another full-page outro.
  const selector=end.querySelector('.project-selector');if(selector)selector.hidden=true;
  end.querySelector('h2').textContent=t('Want to see the game?','想看看真正的游戏？');
  end.querySelector('.case-eyebrow').hidden=true;
  end.querySelector('.case-actions').innerHTML=`<a class="case-primary" href="${readURL}#${video.id}">${t('Watch gameplay','看实机视频')}</a><a href="${readURL}#case-system">${t('Read the case study','看设计与实现')}</a><a href="./#projects">${t('Other projects','看看其他作品')}</a>`;
  const hash=location.hash.slice(1);
  if(removed.includes(hash)){location.replace(readURL+(hash===video.id?'#'+hash:'#case-system'));}
  else if(hash==='case-overview')history.replaceState(null,'','#'+experienceId);
};
