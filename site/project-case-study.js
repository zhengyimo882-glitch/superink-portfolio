/* Content: supplied resume (implementation), Prototype MDD v0.1 and Relic GDD
   v0.2 (design intent). Planned validation is explicitly separated from results. */
(() => {
  const t = (en, zh) => window.siteI18n?.language === 'zh-CN' ? zh : en;
  const relic = document.body.classList.contains('viewing-relic');
  const game = relic ? 'relic' : 'superink';
  const params = new URLSearchParams(location.search);
  const isExperienceAnchor = () => /^#(?:ink-|relic-(?!gameplay)|hero$|intent$|experience$|recognition$|combat-story$|loop$)/.test(location.hash);
  const legacyExperience = isExperienceAnchor();
  const immersive = params.get('view') === 'experience' || (!params.has('view') && legacyExperience);
  const main = document.querySelector('main');
  const root = relic ? document.querySelector('#relic-project') : main;
  const video = document.querySelector(relic ? '#relic-gameplay' : '#proof');
  const experienceId = relic ? 'relic-intro' : 'ink-studio';
  const experienceURL = `./projects.html?project=${game}&view=experience#${experienceId}`;
  const readURL = `./projects.html?project=${game}#case-overview`;
  window.addEventListener('hashchange', () => {
    if (!immersive && isExperienceAnchor()) {
      const target=new URL(location.href);target.searchParams.set('view','experience');location.replace(target.href);
    }
  });
  const data = relic ? {
    name: 'One More Relic', tag: t('EXPLORATION / EXTRACTION / FOLK HORROR', '探索 / 撤离 / 民俗微恐'),
    pitch: t('Make leaving a decision the player owns.', '见好就收，还是再拿一件？'),
    intro: t('A browser-playable tomb exploration prototype. Carry limited relics out, restore and appraise them, then decide what is worth another trip.', '一款可以直接在浏览器中试玩的古墓探索原型。下墓寻找古物，带回店里清理、鉴定；背包只有两个位置，每次深入都要想好带什么、何时走。'),
    role: t('Solo Developer & Technical Designer', '独立开发者 / 技术策划'), period: t('Jul–Sep 2026', '2026 年 7–9 月'), stack: 'Phaser 3 · TypeScript · Vite · WebGL',
    scope: t('Playable vertical slice', '核心流程可玩版本'),
    own: t('Exploration and extraction loop, six-state encounters, directional lighting, restoration and appraisal, and a repeatable art pipeline.', '我负责探索与撤离流程、包含六种状态的灵异遭遇系统、定向照明、古物清理与鉴定，并建立了统一美术风格的制作流程。'),
    systemTitle: t('Light is an information system.', '用光线引导探索。'),
    systemIntro: t('Mouse-directed lighting combines cone tests with wall occlusion. What the player can discover depends on both where they aim and what the room hides.', '手电跟随鼠标转动，只有光照范围内、且未被墙壁挡住的目标才会显露。玩家需要主动观察，才能发现房间里的线索。'),
    steps: [
      [t('Aim the light', '转动手电'), t('Player direction defines the search area.', '根据玩家的照明方向确定搜索范围。')],
      [t('Test the cone', '检测锥形范围'), t('Check whether a point lies inside the illuminated region.', '判断目标是否位于照明范围内。')],
      [t('Check occlusion', '检查遮挡'), t('Walls can block a point that is otherwise inside the cone.', '即使位于光锥内，目标也可能被墙体遮挡。')],
      [t('Reveal information', '揭示信息'), t('Visibility supports discovery and encounter pacing.', '控制哪些线索被看见，以及危险何时出现。')]
    ],
    boundary: t('Alongside lighting, a six-state encounter loop structures supernatural events. The prototype also connects extraction to restoration, appraisal and shop progression.', '灵异事件由六种状态组成的系统驱动；探索结束后，可以带着古物回店里清理、鉴定，继续推进店铺流程。'),
    decisions: [
      [t('01 / Risk without a danger meter', '01 / 让环境提示危险'), t('An explicit greed percentage would turn uncertainty into a calculation.', '如果直接显示危险百分比，玩家容易只盯着数字计算，探索中的不确定感就会减弱。'), t('Keep an identifiable exit and readable rewards; communicate danger through the environment.', '让玩家知道出口在哪、有什么值得带走，再用环境线索提醒危险。'), t('Tradeoff: ambiguity creates tension, but cues still need to make failure understandable.', '需要平衡：危险不能一眼看穿，但出事后，玩家也应该明白自己漏掉了什么线索。')],
      [t('02 / A small inventory creates a choice', '02 / 背包越小，越需要取舍'), t('Unlimited carrying removes the reason to compare discoveries.', '如果所有东西都能带走，玩家就不必考虑哪件更值得留下。'), t('The playable slice uses a carry capacity of two and connects loot to restoration and appraisal.', '当前版本最多携带两件古物，带回店后可以继续清理和鉴定。'), t('Tradeoff: each item matters more, while repeated trips can become friction. This needs playtesting.', '需要验证：限量携带让选择更重要，但频繁往返会不会变成重复劳动？')]
    ],
    evidence: t('Browser-playable exploration → extraction → restoration → appraisal → shop loop; six-state encounters; cone and occlusion checks. Key scenes were checked in-browser for blocking errors, with periodic mentor reviews.', '浏览器版本已打通探索、撤离、清理、鉴定和店铺流程，并实现灵异遭遇、光照范围与墙体遮挡检测。我在浏览器中检查了关键场景是否能正常推进，也定期接受导师评审。'),
    iteration: t('When stock assets failed to match style and perspective, I built a repeatable brief → style control → cleanup → unification → in-engine check pipeline.', '现成素材的风格和透视难以统一，因此我重新整理了美术流程：先明确需求与风格，再处理素材，最后放进引擎检查整体效果。'),
    next: t('Next validation: can first-time players explain what they can keep by leaving, and identify the clue that made them stay? The full seven-tomb campaign remains outside the demonstrated slice.', '接下来想通过试玩确认：新玩家是否知道现在撤离能带走什么，又是什么让他们决定继续？目前展示的是核心流程，尚未实现完整的七座墓穴。'),
    watch: t('Watch for the light cone, room visibility, item decisions and the return to appraisal.', '可以留意手电如何照亮房间、玩家如何选择古物，以及回店后的鉴定过程。')
  } : {
    name: 'SuperInk', tag: t('SYSTEMIC FPS / DRAW-TO-WEAPON', '绘画生成武器 / 第一人称射击'),
    pitch: t('Turn a drawn gesture into a combat decision.', '亲手画出武器，再用它投入战斗。'),
    intro: t('A Unity FPS prototype connecting multi-stroke recognition, ink cost and temporary weapons. Drawing creates a tool; combat determines how well it is used.', '一款用 Unity 开发的第一人称射击原型。玩家画出图案，消耗墨水生成限时武器，再回到射击战斗中。画什么、何时画，都需要根据战况判断。'),
    role: t('Solo Technical Designer & Gameplay Programmer', '独立技术策划 / 玩法程序'), period: t('May–Aug 2026', '2026 年 5–8 月'), stack: 'Unity 6 · C# · URP',
    scope: t('Single-player FPS prototype', '单人 FPS 原型'),
    own: t('Drawing recognition, ink economy, weapon generation, inventory adapters, ammunition and depletion, plus Enhanced / Normal / Unstable outcomes.', '我负责图案识别、墨水消耗与回收、武器生成，以及背包和弹药系统的对接；绘画质量会影响武器的强化、普通或不稳定状态。'),
    systemTitle: t('From a 2D stroke to an equipped weapon.', '从二维笔画到可装备的武器。'),
    systemIntro: t('A drawing is a command for a predefined item. Recognition feeds weapon creation and configuration; it does not reconstruct arbitrary 3D geometry from the sketch.', '每种图案对应一种预设物品。系统先判断玩家画的是什么，再根据绘画质量生成对应武器、设置属性；它并不是把任意草图直接变成三维模型。'),
    steps: [
      [t('Draw', '绘制'), t('Capture multiple strokes as the player’s input.', '采集玩家的多笔画输入。')],
      [t('Recognize', '识别'), t('Deterministic recognition evaluates the pattern and its quality.', '按固定规则匹配图案，并评估绘画质量。')],
      [t('Create & configure', '创建与配置'), t('Connect recognition outcomes and ink rules to weapon factories.', '根据识别结果和墨水规则，创建武器并设置属性。')],
      [t('Equip & consume', '装备与消耗'), t('Adapters connect inventory, ammo and temporary weapon depletion.', '通过适配层接入背包和弹药系统，处理武器到期或耗尽的情况。')]
    ],
    boundary: t('Built on Akila FPS Framework for locomotion and camera. My original work is recognition, ink economy, weapon factories and the adapters that connect these systems to combat.', '移动与镜头基于 Akila FPS Framework。我的原创工作是识别、墨水经济、武器工厂，以及将这些系统接入战斗的适配层。'),
    decisions: [
      [t('01 / Protect the core loop', '01 / 先把核心玩法做完整'), t('Multiplayer and a full character roster expanded the project beyond a focused prototype.', '多人联机和完整角色阵容让项目规模过大，分散了验证核心玩法的精力。'), t('After mentor scope reviews, I cut those features and focused the slice on drawing into combat.', '与导师讨论开发范围后，我删去了这些功能，集中打磨从绘画生成武器到射击战斗的完整流程。'), t('Tradeoff: less breadth, but a smaller set of connected systems to implement and verify.', '取舍：内容变少了，但能把时间用在核心系统的衔接和验证上。')],
      [t('02 / Reward clarity, preserve FPS skill', '02 / 画得好有优势，射击技巧仍然重要'), t('Drawing competes with aiming, movement and attention during combat.', '战斗中停下来画画，会占用瞄准和移动的时间，也可能打断射击节奏。'), t('Use predefined patterns and temporary weapons. The design targets efficiency and reliability rather than extreme damage differences.', '采用预设图案和限时武器，让熟练绘画主要提升生成效率与武器稳定性，避免仅靠绘画分数拉开过大的伤害差距。'), t('Tradeoff: bounded creation is easier to read, but drawing time and failure feedback still need tuning.', '取舍：预设图案限制了自由度，但更容易学习。画一次需要多久、失败后如何恢复，还需要继续调整。')]
    ],
    evidence: t('Eight authored Unity EditMode cases cover exact, noisy, incomplete and misplaced drawings. Manual playtests check the connected combat behavior. These are functional checks, not a measured recognition accuracy or latency benchmark.', '我编写了八个 Unity EditMode 测试，检查准确、带干扰、缺少笔画和位置偏移的图案，并通过手动试玩检查战斗流程。目前验证的是功能是否正常，还没有正式统计识别准确率或延迟。'),
    iteration: t('The prototype connects deterministic recognition to Enhanced / Normal / Unstable outcomes, turning input quality into a weapon-state decision rather than a standalone drawing score.', '识别结果已接入强化、普通和不稳定三种武器状态。画得好不好，会体现在武器的使用表现上，而不只是一个分数。'),
    next: t('Next validation: measure drawing-to-equip time, rejection patterns and recovery after a failed drawing under combat pressure. Use those observations to tune thresholds and feedback.', '接下来会记录战斗中从落笔到装备武器的耗时、哪些图案容易识别失败，以及失败后多久能回到战斗，再调整识别阈值和提示。'),
    watch: t('Watch for drawing input, weapon creation and the transition back into shooting.', '重点观察绘画输入、武器生成，以及切回射击的衔接。')
  };
  document.body.classList.add('case-page');
  document.body.classList.toggle('case-immersive', immersive);
  const lead = document.createElement('section');
  lead.id = 'case-overview'; lead.className = 'case-section case-lead';
  lead.tabIndex=-1;
  const skip=document.createElement('a');skip.className='case-skip';skip.href='#case-overview';skip.textContent=t('Skip to project content','跳转到项目内容');document.body.prepend(skip);
  lead.innerHTML = `<a class="case-back" href="./#projects">← ${t('All projects','全部项目')}</a><p class="case-eyebrow">${data.tag}</p><h1>${data.name}</h1><p class="case-pitch">${data.pitch}</p><p class="case-intro">${data.intro}</p><dl class="case-facts">${[[t('ROLE / TEAM','职责 / 团队'),data.role+' · '+t('1 person','1 人')],[t('DEVELOPMENT','开发时间'),data.period],[t('ENGINE / TOOLS','引擎 / 工具'),data.stack],[t('SCOPE','范围'),data.scope]].map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl><div class="case-actions"><a class="case-primary" href="#${video.id}">${t('Watch gameplay','观看实机')} ↓</a><a href="#case-system">${t('Technical breakdown','技术拆解')} ↓</a><a href="${experienceURL}">${t('Interactive experience','进入互动体验')} ↗</a></div>`;
  const study = document.createElement('section'); study.className = 'case-section case-study';
  study.innerHTML = `<section id="case-system" class="case-chapter"><p class="case-eyebrow">02 / ${t('SYSTEMS & OWNERSHIP','系统与职责')}</p><h2>${data.systemTitle}</h2><p class="case-intro">${data.systemIntro}</p><ol class="case-pipeline">${data.steps.map(([a,b],i)=>`<li><span>0${i+1}</span><h3>${a}</h3><p>${b}</p></li>`).join('')}</ol><div class="case-ownership"><h3>${t('What I built','我负责的内容')}</h3><p>${data.own}</p><p>${data.boundary}</p></div></section><section id="case-decisions" class="case-chapter"><p class="case-eyebrow">03 / ${t('DESIGN TRADEOFFS','设计取舍')}</p><h2>${t('The choices behind the prototype.','开发中做过哪些取舍？')}</h2><div class="case-decisions">${data.decisions.map(([a,b,c,d])=>`<article><h3>${a}</h3><dl><dt>${t('Problem','问题')}</dt><dd>${b}</dd><dt>${t('Decision','决策')}</dt><dd>${c}</dd><dt>${t('Cost / open question','取舍与待验证问题')}</dt><dd>${d}</dd></dl></article>`).join('')}</div></section><section id="case-validation" class="case-chapter"><p class="case-eyebrow">04 / ${t('VALIDATION & ITERATION','验证与迭代')}</p><h2>${t('What the prototype demonstrates.','做到了哪一步，还要验证什么？')}</h2><div class="case-validation"><article><h3>${t('Implemented & checked','已实现与验证')}</h3><p>${data.evidence}</p></article><article><h3>${t('Iteration','迭代')}</h3><p>${data.iteration}</p></article><article><h3>${t('Next validation','下一步验证')}</h3><p>${data.next}</p></article></div></section>`;
  root.prepend(lead); lead.after(video); video.after(study);
  if (relic) {
    const url = window.RELIC_CONFIG?.links.demoUrl;
    if (url && /^https:\/\//.test(url)) {
      const demo = document.createElement('a'); demo.href=url; demo.target='_blank'; demo.rel='noopener';
      demo.textContent=t('Play the prototype ↗','试玩原型 ↗');lead.querySelector('.case-actions').append(demo);
    }
  }
  video.classList.add('case-video');
  const videoHeading = document.createElement('header'); videoHeading.className = 'case-video-heading';
  videoHeading.innerHTML = `<p class="case-eyebrow">01 / ${t('GAMEPLAY','实机演示')}</p><h2>${t('See the loop in action.','看看实际怎么玩。')}</h2><p>${data.watch}</p>`;
  video.prepend(videoHeading);
  if(!relic){const external=document.createElement('a');external.className='case-video-external';external.href='https://youtu.be/B_fIuysQRdc';external.target='_blank';external.rel='noopener';external.textContent=t('Watch on YouTube ↗','在 YouTube 观看 ↗');videoHeading.append(external);}
  // Video and case-study text are immediately readable, independent of reveals.
  video.querySelectorAll('.rr-reveal,.scroll-reveal').forEach(el=>el.classList.remove('rr-reveal','scroll-reveal'));
  const experience = document.createElement('section'); experience.id = 'case-experience'; experience.className = 'case-section case-experience';
  experience.innerHTML = `<div><p class="case-eyebrow">05 / ${t('INTERACTIVE EXPERIENCE','互动体验')}</p><h2>${t('Explore the idea through interaction.','亲手试一试。')}</h2><p>${t('A web interpretation of the game’s ideas. The gameplay video above shows the actual prototype.','下面是围绕核心玩法制作的网页互动，实际游戏画面可查看上方视频。')}</p></div><a class="case-primary" href="${immersive?readURL:experienceURL}">${immersive?t('Return to quick read','返回快速阅读'):t('Enter the experience','进入互动体验')} ↗</a>`;
  study.after(experience);
  const interactiveIds = relic ? ['relic-intro','relic-objects','relic-fear','relic-shop','relic-artwork'] : ['ink-studio','hero','intent','experience','recognition','combat-story','loop'];
  interactiveIds.forEach(id=>{const el=document.getElementById(id);if(el){el.hidden=!immersive;root.append(el);}});
  const profile=document.querySelector('#about');
  profile.hidden=true;
  const end=document.createElement('section');end.className='case-section case-end';
  end.innerHTML=`<p class="case-eyebrow">${t('CONTINUE EXPLORING','继续了解')}</p><h2>${t('More work. Same designer.','再看看其他作品。')}</h2><div class="case-actions"><a href="./#about">${t('About Yimo','关于郑以墨')} ↗</a><a href="./assets/Yimo-Zheng-Resume.pdf?v=20261124-2" target="_blank" rel="noopener">${t('Resume','简历')} ↗</a><a href="mailto:zhengyimo882@gmail.com">${t('Contact','联系')} ↗</a></div>`;
  end.append(document.querySelector('.project-selector'));root.append(end);
  const nav=document.querySelector('.site-header nav');
  nav.innerHTML=`<a href="./#projects">${t('Work','作品')}</a>${[['case-overview','Overview','概况'],[video.id,'Gameplay','实机'],['case-system','Systems','系统'],['case-decisions','Decisions','取舍'],['case-validation','Validation','验证'],['case-experience','Experience','体验']].map(([id,en,zh])=>`<a href="#${id}">${t(en,zh)}</a>`).join('')}<a href="./assets/Yimo-Zheng-Resume.pdf?v=20261124-2" target="_blank" rel="noopener">${t('Resume','简历')} ↗</a>`;
  document.querySelector('footer a[href="#about"]')?.setAttribute('href','./#about');
  const modeLink=document.createElement('a');modeLink.className='case-mode-link';
  modeLink.href=immersive?readURL:experienceURL;
  modeLink.textContent=immersive?t('Quick read ↗','快速阅读 ↗'):t('Interactive ↗','互动展示 ↗');
  modeLink.setAttribute('aria-label',immersive?t('Return to the project case study','返回项目复盘'):t('Open the interactive project experience','打开项目互动展示'));
  nav.append(modeLink);
  if(immersive)window.layoutProjectExperience?.({root,lead,study,video,experience,end,nav,relic,t,experienceId});
  document.querySelector('.identity > span > small').textContent=data.name+' · '+(immersive?t('INTERACTIVE','互动展示'):t('CASE STUDY','项目复盘'));
  if(location.hash==='#about')location.replace('./#about');
  document.title=`${data.name} — ${t("Yimo Zheng","郑以墨 · Yimo Zheng")} · ${t('Project case study','项目复盘')}`;
  document.querySelector('meta[name="description"]').content=data.intro;
  window.dispatchEvent(new Event('case-view-ready'));
  window.dispatchEvent(new Event('resize'));
  window.ScrollTrigger?.refresh();
})();
