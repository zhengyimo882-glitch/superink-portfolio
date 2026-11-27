// The immersive route tells the story visually; the case-study route holds the detail.
window.layoutProjectExperience = ({root,lead,study,video,experience,end,nav,relic,t,experienceId}) => {
  lead.hidden=true;study.hidden=true;experience.hidden=true;
  const first=document.getElementById(experienceId);
  first.tabIndex=-1;document.querySelector('.case-skip').href='#'+experienceId;
  const set=(selector,en,zh)=>{const el=root.querySelector(selector);if(el)el.textContent=t(en,zh);};
  const fold=(panel,label)=>{
    if(!panel)return;const detail=document.createElement('details');detail.className='experience-detail';
    const summary=document.createElement('summary');summary.textContent=label;detail.append(summary);panel.before(detail);detail.append(panel);
    detail.parentElement.append(detail);
    detail.addEventListener('toggle',()=>{window.ScrollTrigger?.refresh();window.dispatchEvent(new Event('resize'));});
  };
  let route;
  if(!relic){
    const intent=document.getElementById('intent');intent.classList.add('visual-intent');
    intent.innerHTML=`<div class="section-label"><span>01</span> ${t('FROM INPUT TO IMPACT','从输入到战斗')}</div><div class="visual-intent-layout"><figure class="intent-visual"><img src="./assets/superink-gameplay-preview.webp" width="1280" height="720" loading="lazy" alt="${t('SuperInk video cover','SuperInk 视频封面')}"><figcaption><span>SUPERINK</span><a href="#proof">${t('Watch gameplay ↗','观看实机 ↗')}</a></figcaption><ol class="intent-flow" aria-label="${t('Core interaction','核心交互')}"><li><svg viewBox="0 0 100 60" aria-hidden="true"><path d="M10 48L43 11L83 48L10 48M32 36L66 36"/></svg><span>01 / ${t('Draw','绘制')}</span></li><li><svg viewBox="0 0 100 60" aria-hidden="true"><path d="M16 20L50 5L84 20L50 36ZM16 20V42L50 57L84 42V20M50 36V57"/></svg><span>02 / ${t('Create','生成')}</span></li><li><svg viewBox="0 0 100 60" aria-hidden="true"><circle cx="50" cy="30" r="19"/><path d="M50 2V19M50 41V58M22 30H39M61 30H78"/></svg><span>03 / ${t('Fight','战斗')}</span></li></ol></figure><div class="intent-caption"><h2 id="intent-title">${t('Draw it.<br>Bring it to life.','亲手画出。<br>带入战斗。')}</h2><p>${t('Your pattern becomes a temporary weapon. What happens next is up to you.','你的图案，成为临时武器。接下来，由你掌控。')}</p><a href="#recognition">${t('Try the drawing interaction ↓','试试绘画交互 ↓')}</a></div></div>`;
    set('#experience-title','One input. Four consequences.','一次输入，四种影响。');
    set('#experience .section-label span','02','02');
    set('#proof .case-eyebrow','03 / GAMEPLAY','03 / 实机演示');
    set('#recognition .section-label span','04','04');
    set('#combat-story .section-label span','05','05');
    set('#loop .section-label span','06','06');
    set('.experience-heading > p','', '');
    const cards=[['Your signature','你的印记','Practice a pattern of your own.','练熟属于自己的图案。'],['Make it reliable','让它可靠','Precision shapes formation quality.','准确度影响成形质量。'],['Spend with intent','有目的地消耗','Ink and ammo keep creation temporary.','墨水与弹药，让创造有代价。'],['Stay in the fight','回到战斗','Aim, movement and timing still matter.','瞄准、移动、时机依然重要。']];
    root.querySelectorAll('.principle-grid article').forEach((card,i)=>{const c=cards[i];card.querySelector('h3').textContent=t(c[0],c[1]);card.querySelector('p').textContent=t(c[2],c[3]);});
    set('#recognition-title','Make a mark. See the outcome.','画一笔，看看结果。');
    set('#recognition .proof-copy > p','Trace the guide, then analyze your drawing.','照着参考绘制，再点击分析。');
    set('#combat-story-title','From ink to impact.','从墨迹，到战局。');
    const scenes=[['Take form.','成形。','A temporary weapon, shaped by your input.','你的输入，生成临时武器。'],['Move in.','推进。','Read the space. Choose your moment.','观察空间，选择推进时机。'],['Commit.','交锋。','Movement and aim carry the fight.','用移动与瞄准接管战斗。'],['Leave a mark.','留下印记。','The objective becomes a surface to write on.','将目标表面变成书写的战场。']];
    root.querySelectorAll('.story-card').forEach((card,i)=>{const c=scenes[i];card.querySelector('h3').textContent=t(c[0],c[1]);card.querySelector('p').textContent=t(c[2],c[3]);});
    set('#loop-title','Draw. Fight. Adapt.','绘制。战斗。再调整。');
    set('#loop > p','', '');
    fold(document.querySelector('#ink-evidence'),t('Explore the design choices','展开设计取舍'));
    route=[['ink-studio','Create','创造'],['hero','Ink','墨迹'],['intent','Idea','理念'],['experience','Feel','体验'],['proof','Gameplay','实机'],['recognition','Try it','试一试'],['combat-story','Combat','战斗'],['loop','Loop','循环']];
  }else{
    set('#relic-objects .rr-heading h2','Read the room.','读懂墓室。');
    set('#relic-objects .rr-heading > p','Move the light. Notice what changes.','移动光源，留意变化。');
    set('#relic-fear .rr-heading h2','Leave. Or go deeper.','离开，还是深入。');
    set('#relic-fear .rr-heading > p','Two carrying slots. One more temptation.','两个携带位，又一次诱惑。');
    set('#relic-shop .rr-heading h2','Read the traces.','读懂器物的痕迹。');
    set('#relic-shop .rr-heading > p','Clean. Examine. Record.','清理。检查。记录。');
    const captions=[['An object worth a second look.','值得多看一眼的器物。'],['Patterns, material, wear. Follow the evidence.','纹样、材质、磨损，循着痕迹判断。'],['Sell, collect, or keep researching.','出售、收藏，或继续研究。'],['You can leave. Something asks you to stay.','你可以离开，却又想再往前。']];
    root.querySelectorAll('.rr-art-narration').forEach((el,i)=>{const p=el.querySelector('p');if(p&&captions[i])p.textContent=t(...captions[i]);});
    fold(document.querySelector('#relic-evidence'),t('Explore the leave-or-stay decision','展开撤离与深入的取舍'));
    route=[['relic-intro','Descend','下墓'],['relic-gameplay','Gameplay','实机'],['relic-objects','Explore','探索'],['relic-fear','Choose','抉择'],['relic-shop','Appraise','鉴定'],['relic-artwork','Gallery','画廊']];
  }
  route.forEach(([id])=>{const el=document.getElementById(id);if(el)root.append(el);});root.append(end);
  const mode=nav.querySelector('.case-mode-link');
  nav.innerHTML=`<a href="./#projects">${t('Work','作品')}</a>${route.filter(([id])=>document.getElementById(id)).map(([id,en,zh])=>`<a href="#${id}">${t(en,zh)}</a>`).join('')}`;
  if(mode)nav.append(mode);
  // Old overview links should land on the experience's first visible scene.
  if(location.hash==='#case-overview')history.replaceState(null,'','#'+experienceId);
};
