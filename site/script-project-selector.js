(() => {
  const restartAtTop = sessionStorage.getItem('portfolio-project-restart') === '1';
  if (restartAtTop) {
    history.scrollRestoration = 'manual';
    sessionStorage.removeItem('portfolio-project-restart');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }
  const tr = window.siteI18n?.t ?? (value => value);
  const main = document.querySelector('main');
  const profile = document.querySelector('#about');
  const superinkSections = [...main.children].filter(node => node !== profile);
  const selector = document.createElement('div');
  selector.className = 'project-selector';
  selector.innerHTML = `
    <p class="project-selector-label">SELECT YOUR NEXT PROJECT</p>
    <div class="project-options" role="group" aria-label="Choose a project">
      <button type="button" data-game="superink" aria-pressed="true"><span>01 / SYSTEMIC FPS</span><strong>SuperInk</strong><small>Draw the weapon. Shape the fight.</small></button>
      <button type="button" data-game="relic" aria-pressed="false"><span>02 / ONE MORE RELIC</span><strong>One More Relic</strong><small>Explore. Recover. Decide.</small></button>
    </div>
    <div class="project-selection-footer"><p role="status" aria-live="polite" id="project-selection-status">Up next: SuperInk · Scroll to explore</p><button type="button" class="project-continue">Explore project ↓</button></div>`;
  const projectSlot = profile.querySelector('.about-projects');
  if (projectSlot) projectSlot.append(selector);
  else profile.querySelector('.legacy-meta').before(selector);
  window.siteI18n?.translate(selector);

  const relic = document.createElement('div');
  relic.id = 'relic-project';
  relic.hidden = true;
  main.append(relic, profile);
  window.mountRelicProject(relic);
  window.siteI18n?.translate(relic);
  const nav = document.querySelector('.site-header nav');
  const switcher = document.createElement('button');
  switcher.className = 'studio-switch';
  switcher.type = 'button';
  document.querySelector('.project-code').prepend(switcher);
  const syncSwitcher = game => {
    switcher.textContent = game === 'relic' ? 'SuperInk ↗' : 'One More Relic ↗';
  };
  syncSwitcher('superink');
  switcher.addEventListener('click', () => {
    openProject(selected === 'relic' ? 'superink' : 'relic');
  });
  const navLabel=(en,zh)=>window.siteI18n?.language==='zh-CN'?zh:en;
  const updateNav=game=>{
    nav.innerHTML=`<button type="button" data-project="superink" aria-pressed="${game==='superink'}">SuperInk</button><button type="button" data-project="relic" aria-pressed="${game==='relic'}">One More Relic</button><a href="${game==='relic'?'#relic-gameplay':'#proof'}">${navLabel('Gameplay','实机演示')}</a><a href="${game==='relic'?'#relic-evidence':'#ink-evidence'}">${navLabel('Design','设计')}</a><a href="#about">${navLabel('About','关于我')}</a><a href="mailto:zhengyimo882@gmail.com">${navLabel('Contact','联系')}</a>`;
  };
  updateNav('superink');
  nav.addEventListener('click',event=>{
    const button=event.target.closest('[data-project]');if(!button)return;
    openProject(button.dataset.project);
  });
  const footerCopy = document.querySelector('footer p');
  const originalFooter = footerCopy.textContent;
  const originalTitle = document.title;
  const videoPlayer = document.querySelector('#video-player');
  let selected = 'superink';
  let suspendedVideo = null;
  let videoPlaceholder = null;

  function openProject(game) {
    if (game !== 'superink' && game !== 'relic') return;
    sessionStorage.setItem('portfolio-project', game);
    sessionStorage.setItem('portfolio-project-restart', '1');
    history.scrollRestoration = 'manual';
    // Drop section anchors so reloading cannot jump back to About or an old project.
    history.replaceState(history.state, '', location.pathname + location.search);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    location.reload();
  }

  function selectGame(game) {
    selected = game;
    syncSwitcher(game);
    sessionStorage.setItem('portfolio-project', game);
    const isRelic = game === 'relic';
    superinkSections.forEach(section => { section.hidden = isRelic; });
    relic.hidden = !isRelic;
    document.body.classList.toggle('viewing-relic', isRelic);
    relic.dispatchEvent(new CustomEvent('project-visibility', { detail: { visible: isRelic } }));
    selector.querySelectorAll('[data-game]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.game === game)));
    document.querySelector('#project-selection-status').textContent = tr(`Up next: ${isRelic ? 'One More Relic' : 'SuperInk'} · Scroll to explore`);
    document.querySelector('[data-project-code]').textContent = tr(isRelic ? 'ONE MORE RELIC / 02' : 'SUPERINK / 01');
    updateNav(game);
    footerCopy.textContent = isRelic ? tr('One More Relic / 2D game prototype') : originalFooter;
    document.title = isRelic ? tr('Yimo Zheng — One More Relic') : originalTitle;
    // Remove a playing embed while its project is hidden, so its audio stops.
    const iframe = videoPlayer.querySelector('iframe');
    if (isRelic && iframe) {
      suspendedVideo = iframe;
      videoPlaceholder = document.createElement('span');
      iframe.replaceWith(videoPlaceholder);
    } else if (!isRelic && suspendedVideo) {
      suspendedVideo.src = suspendedVideo.src.replace('autoplay=1', 'autoplay=0');
      videoPlaceholder.replaceWith(suspendedVideo);
      suspendedVideo = null;
    }
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('scroll'));
  }
  selector.querySelectorAll('[data-game]').forEach(button => button.addEventListener('click', () => openProject(button.dataset.game)));
  const scrollTo = node => node.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  selector.querySelector('.project-continue').addEventListener('click', () => openProject(selected));
  relic.querySelector('.project-return').addEventListener('click', () => { scrollTo(selector); selector.querySelector(`[data-game="${selected}"]`).focus({ preventScroll: true }); });
  if (!restartAtTop && location.hash.startsWith('#relic-')) {
    selectGame('relic');
    requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior:'instant',block:'start'}));
  } else if (sessionStorage.getItem('portfolio-project') === 'relic') {
    selectGame('relic');
  }
  if (restartAtTop) {
    const resetViewport = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      window.ScrollTrigger?.refresh();
      window.ScrollTrigger?.update();
      window.dispatchEvent(new Event('scroll'));
    };
    requestAnimationFrame(resetViewport);
    window.addEventListener('pageshow', resetViewport, { once: true });
  }
})();
