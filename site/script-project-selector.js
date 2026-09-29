(() => {
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
  profile.querySelector('.legacy-meta').before(selector);
  window.siteI18n?.translate(selector);

  const relic = document.createElement('div');
  relic.id = 'relic-project';
  relic.hidden = true;
  main.append(relic);
  window.mountRelicProject(relic);
  window.siteI18n?.translate(relic);
  const nav = document.querySelector('.site-header nav');
  const originalNav = nav.innerHTML;
  const footerCopy = document.querySelector('footer p');
  const originalFooter = footerCopy.textContent;
  const originalTitle = document.title;
  const videoPlayer = document.querySelector('#video-player');
  let selected = 'superink';
  let suspendedVideo = null;
  let videoPlaceholder = null;

  function selectGame(game) {
    selected = game;
    sessionStorage.setItem('portfolio-project', game);
    const isRelic = game === 'relic';
    superinkSections.forEach(section => { section.hidden = isRelic; });
    relic.hidden = !isRelic;
    document.body.classList.toggle('viewing-relic', isRelic);
    relic.dispatchEvent(new CustomEvent('project-visibility', { detail: { visible: isRelic } }));
    selector.querySelectorAll('[data-game]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.game === game)));
    document.querySelector('#project-selection-status').textContent = tr(`Up next: ${isRelic ? 'One More Relic' : 'SuperInk'} · Scroll to explore`);
    document.querySelector('[data-project-code]').textContent = tr(isRelic ? 'ONE MORE RELIC / 02' : 'SUPERINK / 01');
    nav.innerHTML = isRelic ? `<a href="#relic-intro">${tr('Overview')}</a><a href="#relic-gameplay">${tr('Gameplay')}</a><a href="#relic-objects">${tr('Explore')}</a><a href="#relic-fear">${tr('The Choice')}</a><a href="#relic-shop">${tr('The Shop')}</a>` : originalNav;
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
  selector.querySelectorAll('[data-game]').forEach(button => button.addEventListener('click', () => selectGame(button.dataset.game)));
  const scrollTo = node => node.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  selector.querySelector('.project-continue').addEventListener('click', () => scrollTo(selected === 'relic' ? relic : document.querySelector('#hero')));
  relic.querySelector('.project-return').addEventListener('click', () => { scrollTo(selector); selector.querySelector(`[data-game="${selected}"]`).focus({ preventScroll: true }); });
  if (location.hash.startsWith('#relic-')) {
    selectGame('relic');
    requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior:'instant',block:'start'}));
  } else if (sessionStorage.getItem('portfolio-project') === 'relic') {
    selectGame('relic');
  }
})();
