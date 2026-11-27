(() => {
  window.updatePersonNames = (language) => {
    const chinese = language === 'zh-CN';
    document.querySelectorAll('[data-person-name]').forEach(el => {
      el.querySelector('.person-primary').textContent = chinese ? '郑以墨' : 'Yimo Zheng';
      el.querySelector('.person-roman').hidden = !chinese;
    });
    document.querySelectorAll('.home-brand,.site-header .identity').forEach(el=>el.setAttribute('aria-label',chinese?'郑以墨，主页':'Yimo Zheng, home'));
  };
  let language='en'; try {language=localStorage.getItem('portfolio-language')||'en';} catch {}
  window.updatePersonNames(language);
})();
