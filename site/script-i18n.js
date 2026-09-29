(() => {
  const STORAGE_KEY = 'portfolio-language';
  const language = localStorage.getItem(STORAGE_KEY) === 'zh-CN' ? 'zh-CN' : 'en';
  const zh = {
    'Gameplay + Technical Design': '玩法与技术设计',
    'About': '关于我', 'Gameplay': '游戏玩法', 'Intent': '设计意图', 'Experience': '核心体验', 'Outcomes': '系统成果',
    'Creation ink': '创造墨量', 'Player input detected / move to create': '已检测到玩家输入 / 移动鼠标开始创作',
    '07 ACTION NODES / LIVE': '07 动作节点 / 实时', 'DESIGNER SIGNAL': '设计者信号', 'Focus': '专注度', 'Tools': '工具',
    'INK AMMO': '墨弹药', 'INK COLLAPSE': '墨迹崩解', 'INK-04 / STABLE': '墨迹-04 / 稳定', 'JAM RISK': '卡壳风险',
    'LOCKED / YIMO ZHENG': '已锁定 / 郑一墨', 'RANGE 12.4M · TRACKING': '距离 12.4 米 · 追踪中', 'RANGE 18.7M': '距离 18.7 米',
    'REC': '录制', 'TACTICAL LOOP': '战术循环', 'TARGET / CREATION': '目标 / 创造', 'PLAYBACK / 01': '回放 / 01', 'Yimo Zheng': '郑一墨',
    'SuperInk is a systemic FPS prototype where player-designed drawings become temporary combat objects.': 'SuperInk 是一款系统驱动的第一人称射击原型，玩家亲手绘制的图形会化为限时存在的战斗实体。',
    'Draw the weapon.': '绘制武器。', 'Shape the fight.': '塑造战局。', '01 / MOVE YOUR MOUSE': '01 / 移动鼠标',
    '02 / FORMING SUPERINK': '02 / SuperInk 正在成形', '03 / CREATION COMPLETE': '03 / 创造完成',
    'Reset canvas ↺': '重置画布 ↺', 'Enter the system': '进入系统', 'Design intent': '设计意图',
    'Can mouse control become a form of': '鼠标操控能否成为一种', 'creation?': '创造？', 'Rather than only a tool for aiming.': '而不只是用于瞄准的工具。',
    'Players design their own visual patterns, reproduce them under pressure, and watch the game translate their input into physical weapons.': '玩家设计属于自己的视觉图案，在压力下将其复现，并亲眼见证游戏把输入转化为实体武器。',
    'I designed it.': '由我设计。', 'I drew it.': '由我绘制。', 'I fought with it.': '由我持之战斗。',
    'A successful drawing does not end at recognition. It creates a weapon that immediately returns the player to FPS combat, where positioning, ammunition management, trigger discipline, movement, teamwork, and tactical planning still determine the outcome.': '一次成功的绘制并不止于识别结果。它会生成一件武器，把玩家立刻送回第一人称射击战斗；而站位、弹药管理、射击纪律、移动、团队协作与战术规划，依然决定最终胜负。',
    'When that self-created weapon eliminates an enemy, combat feedback amplifies the satisfaction of drawing it. The player experiences the consequence of something they personally brought into existence.': '当玩家用亲手创造的武器击败敌人时，战斗反馈会放大绘制本身的成就感。玩家切实感受到：自己创造的事物，正在改变战局。',
    'The core experience': '核心体验', 'Control becomes visible.': '操控，变得清晰可见。', 'Every layer of play changes because the player made the mark.': '因为玩家亲手留下了那一道痕迹，游戏的每一层体验都随之改变。',
    '01 / AUTHORSHIP': '01 / 玩家创作', 'Player Authorship': '玩家创作权',
    'Players create their own visual patterns instead of choosing only from predetermined weapon icons. Each pattern becomes a personal combat signature that can be practiced and refined.': '玩家不再只能从预设武器图标中选择，而是创造自己的视觉图案。每一种图案都会成为独特的战斗签名，并可通过练习不断打磨。',
    '02 / MASTERY': '02 / 操控精通', 'Mouse Mastery Made Visible': '让鼠标技巧清晰可见',
    'Stroke structure, accuracy, and similarity influence the reliability and formation quality of each generated weapon.': '笔画结构、准确度与相似度，会共同影响生成武器的可靠性和成形质量。',
    '03 / CONSEQUENCE': '03 / 创造代价', 'Creation With Consequence': '创造伴随代价',
    'Generated weapons are powerful but temporary. Ink, ammunition, and durability force the player to decide when creation is worth the cost.': '生成武器威力强大，却无法永久存在。墨量、弹药与耐久度迫使玩家判断：何时创造才值得付出代价。',
    '04 / COMBAT': '04 / 战斗本质', 'Still an FPS': '依然是第一人称射击',
    'Creation expands the player’s options, but never replaces positioning, aim, ammunition control, trigger discipline, timing, coordination, or strategy.': '创造拓展了玩家的选择，却不会取代站位、瞄准、弹药控制、射击纪律、时机、配合与策略。',
    'Play gameplay demo': '播放玩法演示', 'From creation to capture': '从创造到夺取目标',
    'A mark only matters when it enters the fight.': '只有进入战斗，痕迹才有意义。', 'Scroll through the combat sequence.': '滚动浏览完整战斗流程。',
    'COMBAT SEQUENCE': '战斗流程', '01 — MANIFEST': '01 — 显形', 'A DRAWING BECOMES FIREPOWER.': '一幅图案，化为真实火力。',
    'Ink transforms a player-authored pattern into a temporary physical weapon. Drawing quality influences its stability, ammunition, and reliability—making mouse control visible through gameplay.': '墨迹将玩家亲手绘制的图案转化为限时存在的实体武器。绘制质量会影响武器的稳定性、弹药量与可靠性，让鼠标操控直接呈现在玩法结果中。',
    '02 — ADVANCE': '02 — 推进', 'CREATION ONLY MATTERS IF YOU CAN TAKE IT INTO THE FIGHT.': '只有把创造带入战斗，它才真正有意义。',
    'After generating a weapon, the player must read the battlefield, manage distance, and decide when to push toward the objective.': '生成武器后，玩家必须研判战场、控制距离，并选择向目标推进的时机。',
    '03 — ENGAGE': '03 — 交战', 'EXPRESSION DOES NOT REPLACE FPS MASTERY.': '自由表达无法取代射击技巧。',
    'Movement, aim, ammunition control, trigger discipline, and timing determine whether a self-created weapon can become a real combat advantage.': '移动、瞄准、弹药控制、射击纪律与时机，共同决定自创武器能否转化为真正的战斗优势。',
    '04 — INSCRIBE': '04 — 铭刻', 'OBJECTIVES ARE CAPTURED BY WRITING ON THEM.': '在目标上书写，才能将其夺取。',
    'Instead of passively standing inside a capture zone, players expose themselves to draw directly onto the objective—turning positioning, protection, and teamwork into visible territorial control.': '玩家不再被动站在占领区内，而要冒险直接在目标上绘制；站位、掩护与团队协作由此转化为清晰可见的区域控制。',
    'Core loop': '核心循环', 'Every stage returns control to the player.': '每一个阶段，都把控制权交还给玩家。',
    'Design': '设计', 'Draw': '绘制', 'Recognize': '识别', 'Generate': '生成', 'Fight': '战斗', 'Recover Ink': '回收墨量', 'Adapt': '调整',
    'The drawing is theirs. The decision is theirs. The consequences are theirs.': '图案由玩家绘制，决定由玩家做出，后果也由玩家承担。',
    'Recognition outcomes': '识别结果', 'Draw the signal. See what survives.': '绘出信号，看看什么能够成形。',
    'Trace the reference pattern. The system captures your strokes, normalizes the shape, and converts geometric similarity into weapon behavior.': '临摹参考图案。系统会捕捉笔画、归一化形状，并把几何相似度转化为武器表现。',
    'INK RECOGNITION LAB // LIVE INPUT': '墨迹识别实验室 // 实时输入', 'AWAITING STROKE': '等待笔画', 'DRAW INSIDE THE FIELD': '请在区域内绘制',
    'REFERENCE / WEAPON PATTERN 01': '参考 / 武器图案 01', 'CAPTURE': '采集', 'NORMALIZE': '归一化', 'RESAMPLE': '重采样', 'COMPARE': '比对', 'CREATION': '创造',
    'CLEAR': '清除', 'ANALYZE DRAWING': '分析图案', 'SHOW REFERENCE': '显示参考', 'TIER': '等级', 'GEOMETRIC MATCH': '几何匹配度',
    'NO CREATION': '未生成', 'Draw the reference signal, then analyze the captured geometry.': '绘制参考信号，然后分析捕捉到的几何形状。',
    'ANALYZING GEOMETRY': '正在分析几何结构', 'CREATION RESOLVED': '创造结果已生成',
    'REFINED WEAPON': '精制武器', 'STABLE WEAPON': '稳定武器', 'UNSTABLE WEAPON': '不稳定武器', 'FAILED CREATION': '创造失败',
    'Maximum reliability · efficient formation': '最高可靠性 · 高效成形', 'Reliable combat output · standard formation': '可靠战斗输出 · 标准成形',
    'Limited ammo · possible jam · early collapse': '弹药有限 · 可能卡壳 · 提前崩解', 'Ink burst · no usable object formed': '墨迹爆散 · 未形成可用实体',
    'Simplified browser demonstration of the recognition pipeline used in SuperInk.': '这是 SuperInk 识别流程的简化浏览器演示。',
    'Why I make games': '我为何制作游戏',
    'I make games to create worlds that can outlive me—proof that I was here, and that I left something worth remembering.': '我制作游戏，是为了创造比我存在更久的世界——证明我曾在这里，也曾留下值得被记住的事物。',
    'Current Project': '当前项目', 'SuperInk / Calligrapher': 'SuperInk / 书法家', 'Gameplay + Technical Designer': '玩法与技术设计师',
    'Systemic FPS / Interaction Design': '系统驱动 FPS / 交互设计', 'Unity / C# / Rapid Prototyping': 'Unity / C# / 快速原型开发',
    'View GitHub': '查看 GitHub', 'Education': '教育经历', 'University of Wisconsin-Madison': '威斯康星大学麦迪逊分校',
    'B.S. Computer Science · GPA 3.8 / 4.0': '计算机科学学士 · GPA 3.8 / 4.0', 'Modern game engines · Computer graphics · Computer engineering': '现代游戏引擎 · 计算机图形学 · 计算机工程',
    'Software Engineering': '软件工程', 'Real-time S&P 500 intelligence platform': '标普 500 实时智能分析平台',
    'Built with Flask, React, SQLite, FastAPI microservices, and Docker.': '采用 Flask、React、SQLite、FastAPI 微服务与 Docker 构建。',
    'faster SQL': 'SQL 提速', 'faster deploys': '部署提速', 'stocks': '只股票', 'sectors': '个行业板块',
    'Gameplay Algorithms + LLM': '玩法算法 + 大语言模型', 'SuperInk Recognition System': 'SuperInk 识别系统',
    'Designed a geometric drawing-recognition pipeline using ordered stroke capture, normalization, resampling, direction structure, path length, and template similarity. LLM-assisted workflows support rapid system documentation, test-case ideation, and prototype iteration.': '设计了一套几何图形识别流程，涵盖有序笔画采集、归一化、重采样、方向结构、路径长度与模板相似度。借助大语言模型工作流，加速系统文档、测试用例构思与原型迭代。',
    'pipeline stages': '个流程阶段', 'quality tiers': '个质量等级', 'assisted iteration': '辅助迭代',
    'Systemic FPS prototype / Unity 6 / Solo developer': '系统驱动 FPS 原型 / Unity 6 / 独立开发', 'Back to profile ↑': '返回个人简介 ↑',
    'SELECT YOUR NEXT PROJECT': '选择下一个项目', '01 / SYSTEMIC FPS': '01 / 系统驱动 FPS', '02 / ONE MORE RELIC': '02 / 见好不收', 'One More Relic': '见好不收',
    'Draw the weapon. Shape the fight.': '绘制武器，塑造战局。', 'Explore. Recover. Decide.': '探索、带回、抉择。',
    'Up next: SuperInk · Scroll to explore': '接下来：SuperInk · 向下滚动探索', 'Up next: One More Relic · Scroll to explore': '接下来：《见好不收》· 向下滚动探索',
    'Explore project ↓': '探索项目 ↓', 'ONE MORE RELIC / 02': '见好不收 / 02', 'Overview': '概览', 'Explore': '探索', 'The Choice': '抉择', 'The Shop': '古玩店',
    'One More Relic / 2D game prototype': '《见好不收》/ 2D 游戏原型',
    'AN EXPLORATION GAME BY YIMO ZHENG': '郑一墨创作的探索游戏', 'ONE MORE RELIC': '见好不收', 'ONE MORE': '见好', 'RELIC': '不收',
    '“You could leave now. But what about one more relic?”': '“现在就能离开。可要是再拿一件呢？”',
    'Tomb exploration. Relic appraisal. The temptation to stay.': '探索古墓，鉴定古物，抵抗继续深入的诱惑。', 'Play Demo ↗': '在线试玩 ↗', 'Watch Gameplay': '观看玩法演示',
    'One trip. One more temptation.': '一次下墓，再多一次诱惑。', 'Watch on YouTube ↗': '在 YouTube 观看 ↗',
    '03 / EXPLORE': '03 / 探索', 'Read the room.': '观察空间。', 'Respect its rules.': '遵循其中的规则。',
    'Study the layout, follow the clues, and consider what you disturb.': '研读空间布局，追寻线索，也要审慎考虑自己会惊动什么。',
    'Move the light. Tap a marker.': '移动光源，点击标记。', 'Inspection light': '观察灯', 'Close detail': '关闭细节',
    'Gameplay screenshot': '游戏实机截图', 'Beyond the main chamber': '主墓室之外',
    '04 / THE CHOICE': '04 / 抉择', 'What will you take?': '你要带走什么？', 'When will you leave?': '你会在何时离开？',
    'Space is limited. Leave with what you have—or take another step into the unknown.': '携带空间有限。带着已有收获离开，还是继续迈向未知？',
    'Click to continue': '点击继续', 'AI promotional artwork': 'AI 宣传插画', '01 / Take the book': '01 / 带走古籍', '02 / A little deeper': '02 / 再深入一点', '03 / Back to the shop': '03 / 返回古玩店',
    '05 / SHOP': '05 / 古玩店', 'Bring it back.': '把它带回来。', 'Uncover its story.': '揭开它的故事。',
    'Clean the surface, examine the evidence, and decide what to sell or keep.': '清理器物表面，审视留下的证据，再决定出售还是珍藏。',
    'Clean': '清理', 'Examine': '观察', 'Record evidence': '记录证据', 'Magnify pages': '放大书页',
    'Clean / Thread-bound book': '清理 / 线装古籍', 'Examine / Paper fibres under side lighting': '观察 / 侧光下的纸张纤维', 'Record evidence / Folded map seam': '记录证据 / 地图折痕',
    'Ready for': '准备好再来', 'one more?': '一件了吗？', 'Back to Top ↑': '返回顶部 ↑', 'Back to projects': '返回项目列表',
    '06 / ARTWORK': '06 / 美术作品', 'Between two worlds.': '游走于两个世界之间。', 'Scroll to uncover ↓': '向下滚动，逐一揭晓 ↓',
    'Promotional artwork': '宣传插画', 'Choose artwork': '选择美术作品', 'Show': '显示',
    'The keeper': '守护者', 'Read the traces': '解读痕迹', 'Above ground': '地面之上', 'Into the unknown': '深入未知',
    'THE OBJECT / GDD DESIGN': '器物 / GDD 设计', 'More than something to take.': '它不只是可以带走的东西。',
    'Financial pressure brings you to the antique shop. Below ground, an object’s place can matter as much as its value.': '经济压力把你带进古玩店。而在地下，器物所处的位置，可能与它本身的价值同样重要。',
    'THE EVIDENCE / GDD DESIGN': '证据 / GDD 设计', 'Every trace asks a question.': '每一道痕迹，都在提出一个问题。',
    'Cleaning reveals patterns, material and damage. Appraisal follows the evidence—not a single click.': '清理会显露纹样、材质与损伤；鉴定依靠证据推进，而非一次点击就能完成。',
    'THE SHOP / GDD DESIGN': '古玩店 / GDD 设计', 'Bringing it back is only the beginning.': '把它带回来，只是故事的开始。',
    'Sell, collect or keep researching. The shop is where discoveries become decisions about the next descent.': '出售、收藏，或继续研究。古玩店让每一次发现，都转化为下一次下墓前的抉择。',
    'THE TEMPTATION / GDD DESIGN': '诱惑 / GDD 设计', 'One more step into the unknown.': '再向未知迈出一步。',
    'Read the layout, the light and the placement of objects. The first tomb teaches these rules before later tombs open the full leave-or-stay dilemma.': '观察布局、光线与器物位置。第一座墓会教会玩家这些规则，后续墓穴则完整展开“离开还是继续”的抉择。',
    'View full image': '查看完整图片', 'Close image': '关闭图片',
    'Main chamber': '主墓室', 'A passage appears': '通道显现', 'Departure confirmation': '离开确认', 'Back above ground': '返回地面',
    'The choice': '抉择', 'Further into the unknown': '继续深入未知', 'A candle beside the passage.': '通道旁的一支蜡烛。', 'A coffin at the center of the chamber.': '墓室中央的一口棺椁。',
    'Primary navigation': '主导航', 'Choose a project': '选择项目', 'Antique shop stages': '古玩店流程', 'Gameplay video': '玩法视频', 'Choose artwork': '选择美术作品',
    'Play SuperInk gameplay demo': '播放 SuperInk 玩法演示', 'Play One More Relic gameplay video': '播放《见好不收》玩法视频',
    'Draw a pattern for geometric weapon recognition': '绘制图案以进行几何武器识别', 'Recognition pipeline': '识别流程', 'Selected resume highlights': '精选履历',
    'Yimo Zheng, home': '郑一墨，主页', 'Portrait of Yimo Zheng': '郑一墨肖像',
    'SuperInk gameplay demo thumbnail': 'SuperInk 玩法演示缩略图', 'One More Relic — YouTube video thumbnail': '《见好不收》YouTube 视频缩略图',
    'Main tomb chamber with ritual candles, a central coffin and the exploration interface.': '主墓室场景，包含仪式蜡烛、中央棺椁与探索界面。',
    'Hidden cellar illuminated by the player’s flashlight, with a return portal.': '玩家用手电照亮隐藏地窖，返程传送门位于其中。',
    'A blue-purple portal beside a lit ritual candle in the tomb.': '墓中点燃的仪式蜡烛旁，出现了一道蓝紫色传送门。',
    'Actual departure confirmation showing the carried book and the option to stay.': '离开确认界面，展示玩家携带的古籍以及继续留下的选项。',
    'Antique shop with wooden display cabinets, a cleaning bench and objects awaiting inspection.': '古玩店内设有木质陈列柜、清理台和等待鉴定的器物。',
    'AI promotional illustration of a worn blue thread-bound book in a satchel on a tomb ledge.': 'AI 宣传插画：一册磨损的蓝色线装古籍装在挎包中，置于墓穴石台上。',
    'AI promotional illustration of the book beside a deep stone tomb passage.': 'AI 宣传插画：古籍放在幽深的石砌墓道旁。',
    'AI promotional illustration of the book and satchel resting on a warmly lit antique-shop counter.': 'AI 宣传插画：古籍与挎包放在暖光照亮的古玩店柜台上。',
    'Inspect ritual candle': '观察仪式蜡烛', 'Inspect central coffin': '观察中央棺椁',
    'Open thread-bound book on the cleaning bench with brush, pick and cloth tools.': '清理台上的线装古籍，旁边摆放着软毛刷、竹签与棉布工具。',
    'English inspection interface showing the open pages of the thread-bound book under adjustable side lighting.': '观察界面展示摊开的线装古籍书页，并可调节侧光。',
    'English observations notebook recording the folded map seam found along the spine of the same thread-bound book.': '观察记录本记下了同一本线装古籍书脊处发现的地图折痕。',
    'The protagonist holding an ornate antique vessel.': '主角手持一件纹饰繁复的古代器物。', 'The protagonist carefully cleaning an antique at a workbench.': '主角在工作台前仔细清理一件古物。',
    'An antique displayed on a shop counter facing the protagonist.': '一件古物陈列在店铺柜台上，与主角相对。', 'The protagonist holding a lantern beside an open vessel in a tomb.': '主角提着灯笼，站在墓中一件开启的器物旁。',
    'SuperInk — Draw the weapon. Shape the fight.': 'SuperInk — 绘制武器，塑造战局',
    'SuperInk — a systemic FPS prototype where player-designed drawings become temporary combat objects.': 'SuperInk——一款系统驱动的第一人称射击原型，玩家绘制的图形会化为限时存在的战斗实体。',
    'Yimo Zheng — One More Relic': '郑一墨 — 见好不收'
  };

  const t = (value) => language === 'zh-CN' ? (zh[value] ?? value) : value;
  window.siteI18n = { language, t };
  document.documentElement.lang = language;
  const description = document.querySelector('meta[name="description"]');
  if (description && language === 'zh-CN') description.content = t(description.content);

  const translateText = (node) => {
    if (language !== 'zh-CN' || node.parentElement?.closest('[data-i18n-control],script,style,svg')) return;
    const raw = node.nodeValue;
    const trimmed = raw.trim();
    if (!trimmed || !zh[trimmed]) return;
    let translated = raw.replace(trimmed, zh[trimmed]);
    if (node.nextSibling?.nodeType === Node.ELEMENT_NODE && /[\u3400-\u9fff！？。]$/.test(zh[trimmed])) translated = translated.trimEnd();
    if (node.previousSibling?.nodeType === Node.ELEMENT_NODE && /^[\u3400-\u9fff]/.test(zh[trimmed])) translated = translated.trimStart();
    node.nodeValue = translated;
  };
  const translateElement = (element) => {
    if (element.matches?.('[data-i18n-control]')) return;
    ['aria-label', 'alt', 'title', 'placeholder'].forEach((attribute) => {
      const value = element.getAttribute?.(attribute);
      if (value && zh[value]) element.setAttribute(attribute, zh[value]);
    });
  };
  const translateRoot = (root) => {
    if (language !== 'zh-CN') return;
    if (root.nodeType === Node.TEXT_NODE) return translateText(root);
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
    if (root.nodeType === Node.ELEMENT_NODE) translateElement(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      if (walker.currentNode.nodeType === Node.TEXT_NODE) translateText(walker.currentNode);
      else translateElement(walker.currentNode);
    }
  };
  window.siteI18n.translate = translateRoot;

  translateRoot(document);
  const observer = new MutationObserver((records) => records.forEach((record) => {
    if (record.type === 'characterData') translateText(record.target);
    record.addedNodes.forEach(translateRoot);
  }));
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });

  const control = document.querySelector('[data-i18n-control]');
  if (control) {
    control.textContent = language === 'zh-CN' ? 'EN' : '中文';
    control.setAttribute('aria-label', language === 'zh-CN' ? 'Switch to English' : '切换为中文');
    control.addEventListener('click', () => {
      localStorage.setItem(STORAGE_KEY, language === 'zh-CN' ? 'en' : 'zh-CN');
      sessionStorage.setItem('portfolio-project', document.body.classList.contains('viewing-relic') ? 'relic' : 'superink');
      sessionStorage.setItem('portfolio-scroll', String(scrollY));
      location.reload();
    });
  }
  addEventListener('load', () => {
    const saved = Number(sessionStorage.getItem('portfolio-scroll'));
    if (!Number.isFinite(saved)) return;
    sessionStorage.removeItem('portfolio-scroll');
    requestAnimationFrame(() => requestAnimationFrame(() => scrollTo({ top: saved, behavior: 'instant' })));
  }, { once: true });
})();
