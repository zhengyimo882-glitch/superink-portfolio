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
    pitch: t('Make leaving a decision the player owns.', '让离开成为玩家自己的决定。'),
    intro: t('A browser-playable tomb exploration prototype. Carry limited relics out, restore and appraise them, then decide what is worth another trip.', '可在浏览器游玩的墓穴探索原型：带着有限的器物撤离，清理与鉴定，再决定什么值得下一次冒险。'),
    role: t('Solo Developer & Technical Designer', '独立开发者 / 技术策划'), period: t('Jul–Sep 2026', '2026 年 7–9 月'), stack: 'Phaser 3 · TypeScript · Vite · WebGL',
    scope: t('Playable vertical slice', '可玩垂直切片'),
    own: t('Exploration and extraction loop, six-state encounters, directional lighting, restoration and appraisal, and a repeatable art pipeline.', '探索与撤离循环、六状态遭遇系统、定向灯光、清理与鉴定，以及可重复执行的美术制作流程。'),
    systemTitle: t('Light is an information system.', '光，是信息系统。'),
    systemIntro: t('Mouse-directed lighting combines cone tests with wall occlusion. What the player can discover depends on both where they aim and what the room hides.', '鼠标定向灯光结合锥形范围检测与墙体遮挡。玩家能发现什么，同时取决于朝向和房间结构。'),
    steps: [
      [t('Aim the light', '指向光源'), t('Player direction defines the search area.', '玩家朝向决定搜索区域。')],
      [t('Test the cone', '检测锥形范围'), t('Check whether a point lies inside the illuminated region.', '判断目标是否位于照明范围内。')],
      [t('Check occlusion', '检查遮挡'), t('Walls can block a point that is otherwise inside the cone.', '即使位于光锥内，目标也可能被墙体遮挡。')],
      [t('Reveal information', '揭示信息'), t('Visibility supports discovery and encounter pacing.', '可见性服务于发现与遭遇节奏。')]
    ],
    boundary: t('Alongside lighting, a six-state encounter loop structures supernatural events. The prototype also connects extraction to restoration, appraisal and shop progression.', '灯光之外，六状态遭遇循环组织超自然事件。原型也打通了撤离、清理、鉴定和店铺推进。'),
    decisions: [
      [t('01 / Risk without a danger meter', '01 / 不用数值条表达风险'), t('An explicit greed percentage would turn uncertainty into a calculation.', '明确的贪念百分比会把未知变成算题。'), t('Keep an identifiable exit and readable rewards; communicate danger through the environment.', '保留明确的撤离方向和可辨认收益，通过环境传达危险。'), t('Tradeoff: ambiguity creates tension, but cues still need to make failure understandable.', '代价：模糊性制造紧张，但反馈仍必须让失败可以理解。')],
      [t('02 / A small inventory creates a choice', '02 / 小背包制造取舍'), t('Unlimited carrying removes the reason to compare discoveries.', '无限携带会削弱发现之间的取舍。'), t('The playable slice uses a carry capacity of two and connects loot to restoration and appraisal.', '可玩切片采用两个携带位，并把战利品接入清理与鉴定。'), t('Tradeoff: each item matters more, while repeated trips can become friction. This needs playtesting.', '代价：每件器物更有分量，但反复往返可能造成负担，需要通过试玩验证。')]
    ],
    evidence: t('Browser-playable exploration → extraction → restoration → appraisal → shop loop; six-state encounters; cone and occlusion checks. Key scenes were checked in-browser for blocking errors, with periodic mentor reviews.', '已形成浏览器可玩的探索 → 撤离 → 清理 → 鉴定 → 店铺循环，包含六状态遭遇以及光锥与遮挡检测；关键场景经过浏览器阻塞问题检查，并接受阶段性导师评审。'),
    iteration: t('When stock assets failed to match style and perspective, I built a repeatable brief → style control → cleanup → unification → in-engine check pipeline.', '现成素材无法统一风格与透视后，我建立了需求定义 → 风格控制 → 清理 → 统一 → 引擎内检查的制作流程。'),
    next: t('Next validation: can first-time players explain what they can keep by leaving, and identify the clue that made them stay? The full seven-tomb campaign remains outside the demonstrated slice.', '下一步验证：首次游玩的玩家能否说清离开能保住什么，以及哪条线索让自己继续深入？完整七墓流程仍不属于当前展示的切片。'),
    watch: t('Watch for the light cone, room visibility, item decisions and the return to appraisal.', '重点观察光锥、房间可见性、器物取舍与返回鉴定的过程。')
  } : {
    name: 'SuperInk', tag: t('SYSTEMIC FPS / DRAW-TO-WEAPON', '系统型 FPS / 绘画生成武器'),
    pitch: t('Turn a drawn gesture into a combat decision.', '让一次绘画成为一次战斗决策。'),
    intro: t('A Unity FPS prototype connecting multi-stroke recognition, ink cost and temporary weapons. Drawing creates a tool; combat determines how well it is used.', 'Unity FPS 原型，将多笔画识别、墨水成本与临时武器连接起来。绘画创造工具，战斗决定如何使用它。'),
    role: t('Solo Technical Designer & Gameplay Programmer', '独立技术策划 / 玩法程序'), period: t('May–Aug 2026', '2026 年 5–8 月'), stack: 'Unity 6 · C# · URP',
    scope: t('Single-player FPS prototype', '单人 FPS 原型'),
    own: t('Drawing recognition, ink economy, weapon generation, inventory adapters, ammunition and depletion, plus Enhanced / Normal / Unstable outcomes.', '绘画识别、墨水经济、武器生成、背包适配、弹药与耗尽逻辑，以及强化 / 普通 / 不稳定结果。'),
    systemTitle: t('From a 2D stroke to an equipped weapon.', '从二维笔画到可装备的武器。'),
    systemIntro: t('A drawing is a command for a predefined item. Recognition feeds weapon creation and configuration; it does not reconstruct arbitrary 3D geometry from the sketch.', '图案是预定义物品的指令。识别结果用于创建与配置武器，并不把任意草图重建成三维几何体。'),
    steps: [
      [t('Draw', '绘制'), t('Capture multiple strokes as the player’s input.', '采集玩家的多笔画输入。')],
      [t('Recognize', '识别'), t('Deterministic recognition evaluates the pattern and its quality.', '确定性识别判断图案及其质量。')],
      [t('Create & configure', '创建与配置'), t('Connect recognition outcomes and ink rules to weapon factories.', '将识别结果与墨水规则接入武器工厂。')],
      [t('Equip & consume', '装备与消耗'), t('Adapters connect inventory, ammo and temporary weapon depletion.', '通过适配层连接背包、弹药与临时武器耗尽。')]
    ],
    boundary: t('Built on Akila FPS Framework for locomotion and camera. My original work is recognition, ink economy, weapon factories and the adapters that connect these systems to combat.', '移动与镜头基于 Akila FPS Framework。我的原创工作是识别、墨水经济、武器工厂，以及将这些系统接入战斗的适配层。'),
    decisions: [
      [t('01 / Protect the core loop', '01 / 保护核心循环'), t('Multiplayer and a full character roster expanded the project beyond a focused prototype.', '多人联机与完整角色阵容让范围超出了聚焦的原型。'), t('After mentor scope reviews, I cut those features and focused the slice on drawing into combat.', '经过导师范围评审，裁掉这些功能，集中验证绘画到战斗的循环。'), t('Tradeoff: less breadth, but a smaller set of connected systems to implement and verify.', '代价：内容广度减少，但需要实现与验证的系统更集中。')],
      [t('02 / Reward clarity, preserve FPS skill', '02 / 奖励清晰输入，保留 FPS 技巧'), t('Drawing competes with aiming, movement and attention during combat.', '绘画会与瞄准、移动和战斗注意力争夺时间。'), t('Use predefined patterns and temporary weapons. The design targets efficiency and reliability rather than extreme damage differences.', '使用预定义图案与临时武器；设计方向是奖励效率与可靠性，而不是制造悬殊伤害差距。'), t('Tradeoff: bounded creation is easier to read, but drawing time and failure feedback still need tuning.', '代价：有限创造更容易理解，但绘画耗时和失败反馈仍需要调校。')]
    ],
    evidence: t('Eight authored Unity EditMode cases cover exact, noisy, incomplete and misplaced drawings. Manual playtests check the connected combat behavior. These are functional checks, not a measured recognition accuracy or latency benchmark.', '已编写八个 Unity EditMode 测试，覆盖精确、噪声、不完整和错位图案，并通过手动试玩检查接入战斗后的行为。这些属于功能验证，不等于识别准确率或延迟基准。'),
    iteration: t('The prototype connects deterministic recognition to Enhanced / Normal / Unstable outcomes, turning input quality into a weapon-state decision rather than a standalone drawing score.', '原型将确定性识别接入强化 / 普通 / 不稳定结果，让输入质量影响武器状态，而不只是得到一个孤立的绘画分数。'),
    next: t('Next validation: measure drawing-to-equip time, rejection patterns and recovery after a failed drawing under combat pressure. Use those observations to tune thresholds and feedback.', '下一步验证：记录战斗压力下从绘制到装备的时间、被拒绝的图案，以及失败后的恢复过程，再据此调整阈值与反馈。'),
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
  study.innerHTML = `<section id="case-system" class="case-chapter"><p class="case-eyebrow">02 / ${t('SYSTEMS & OWNERSHIP','系统与职责')}</p><h2>${data.systemTitle}</h2><p class="case-intro">${data.systemIntro}</p><ol class="case-pipeline">${data.steps.map(([a,b],i)=>`<li><span>0${i+1}</span><h3>${a}</h3><p>${b}</p></li>`).join('')}</ol><div class="case-ownership"><h3>${t('What I built','我负责的内容')}</h3><p>${data.own}</p><p>${data.boundary}</p></div></section><section id="case-decisions" class="case-chapter"><p class="case-eyebrow">03 / ${t('DESIGN TRADEOFFS','设计取舍')}</p><h2>${t('The choices behind the prototype.','原型背后的选择。')}</h2><div class="case-decisions">${data.decisions.map(([a,b,c,d])=>`<article><h3>${a}</h3><dl><dt>${t('Problem','问题')}</dt><dd>${b}</dd><dt>${t('Decision','决策')}</dt><dd>${c}</dd><dt>${t('Cost / open question','代价 / 待验证')}</dt><dd>${d}</dd></dl></article>`).join('')}</div></section><section id="case-validation" class="case-chapter"><p class="case-eyebrow">04 / ${t('VALIDATION & ITERATION','验证与迭代')}</p><h2>${t('What the prototype demonstrates.','原型已经证明了什么。')}</h2><div class="case-validation"><article><h3>${t('Implemented & checked','实现与检查')}</h3><p>${data.evidence}</p></article><article><h3>${t('Iteration','迭代')}</h3><p>${data.iteration}</p></article><article><h3>${t('Next validation','下一步验证')}</h3><p>${data.next}</p></article></div></section>`;
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
  videoHeading.innerHTML = `<p class="case-eyebrow">01 / ${t('GAMEPLAY','实机演示')}</p><h2>${t('See the loop in action.','看核心循环如何运行。')}</h2><p>${data.watch}</p>`;
  video.prepend(videoHeading);
  if(!relic){const external=document.createElement('a');external.className='case-video-external';external.href='https://youtu.be/B_fIuysQRdc';external.target='_blank';external.rel='noopener';external.textContent=t('Watch on YouTube ↗','在 YouTube 观看 ↗');videoHeading.append(external);}
  // Video and case-study text are immediately readable, independent of reveals.
  video.querySelectorAll('.rr-reveal,.scroll-reveal').forEach(el=>el.classList.remove('rr-reveal','scroll-reveal'));
  const experience = document.createElement('section'); experience.id = 'case-experience'; experience.className = 'case-section case-experience';
  experience.innerHTML = `<div><p class="case-eyebrow">05 / ${t('INTERACTIVE EXPERIENCE','互动体验')}</p><h2>${t('Explore the idea through interaction.','通过互动，感受设计。')}</h2><p>${t('A web interpretation of the game’s ideas. The gameplay video above shows the actual prototype.','这里以网页交互演绎游戏理念；上方实机视频展示实际原型。')}</p></div><a class="case-primary" href="${immersive?readURL:experienceURL}">${immersive?t('Return to quick read','返回快速阅读'):t('Enter the experience','进入互动体验')} ↗</a>`;
  study.after(experience);
  const interactiveIds = relic ? ['relic-intro','relic-objects','relic-fear','relic-shop','relic-artwork'] : ['ink-studio','hero','intent','experience','recognition','combat-story','loop'];
  interactiveIds.forEach(id=>{const el=document.getElementById(id);if(el){el.hidden=!immersive;root.append(el);}});
  const profile=document.querySelector('#about');
  profile.hidden=true;
  const end=document.createElement('section');end.className='case-section case-end';
  end.innerHTML=`<p class="case-eyebrow">${t('CONTINUE EXPLORING','继续了解')}</p><h2>${t('More work. Same designer.','更多作品，同一个设计者。')}</h2><div class="case-actions"><a href="./#about">${t('About Yimo','关于 Yimo')} ↗</a><a href="./assets/Yimo-Zheng-Resume.pdf?v=20261124-2" target="_blank" rel="noopener">${t('Resume','简历')} ↗</a><a href="mailto:zhengyimo882@gmail.com">${t('Contact','联系')} ↗</a></div>`;
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
  document.querySelector('.identity small').textContent=data.name+' · '+(immersive?t('INTERACTIVE','互动展示'):t('CASE STUDY','项目复盘'));
  if(location.hash==='#about')location.replace('./#about');
  document.title=`${data.name} — Yimo Zheng · ${t('Project case study','项目复盘')}`;
  document.querySelector('meta[name="description"]').content=data.intro;
  window.dispatchEvent(new Event('case-view-ready'));
  window.dispatchEvent(new Event('resize'));
  window.ScrollTrigger?.refresh();
})();
