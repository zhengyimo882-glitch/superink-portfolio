(() => {
  const cn=window.siteI18n?.language==='zh-CN';
  const t=(en,zh)=>cn?zh:en;
  const cases=[{
    host:'#recognition',id:'ink-evidence',title:t('A mistake should change the fight.','失误应该改变战局。'),
    question:t('What happens when a drawing falls short?','图案画得不够好时，游戏如何回应？'),
    choices:[
      [t('Near success','接近成功'),t('Almost the intended pattern','图案接近目标'),t('Partial ink refund or a low-durability item','部分返墨，或低耐久物品'),t('Recover value and reassess the next move.','保留部分价值，重新判断下一步。')],
      [t('Moderate failure','中等失败'),t('Recognizable intent, imperfect execution','意图可辨认，执行有偏差'),t('A weakened or deformed item','弱化或变形的物品'),t('Adapt to a compromised tool instead of restarting an input test.','适应受限的工具，而不是重新参加一次绘画考试。')],
      [t('Severe failure','严重失败'),t('A large departure from the pattern','图案偏差较大'),t('An odd, unstable item that may still help','奇怪且不稳定，但可能仍有用途的物品'),t('Create tension and surprise while preserving a possible next action.','制造紧张和意外，同时保留继续行动的可能。')]
    ],
    rationale:t('Design choice: replace a binary error screen with consequences the player can respond to. The risk is unreadable randomness; feedback must explain what was created.','设计取舍：用玩家可以应对的后果替代二元报错。风险在于结果显得随机，因此反馈必须让玩家看懂自己创造了什么。')
  },{
    host:'#relic-fear',id:'relic-evidence',title:t('Leaving must be a real choice.','离开必须是一个真正的选择。'),
    question:t('You have something worth keeping. Do you go back?','你已经拿到了值得保住的东西。现在回去吗？'),
    choices:[
      [t('Leave with what I have','带着现有收获离开'),t('Known loot + a clear exit','已知收获 + 明确出口'),t('Give up the unknown reward','放弃尚未揭晓的收益'),t('Protect what you already earned. Returning should feel legitimate.','保住已有收获；返程应是合理的选择。')],
      [t('Explore one more room','再探索一间房'),t('An unanswered clue beyond the exit','出口之外还有未解的线索'),t('Trade safety for unknown value','用安全交换未知价值'),t('Read changes in the tomb, then decide again. Risk is felt, not shown as a percentage.','从墓穴变化中感知危险，再次做决定；风险不是明确的百分比。')]
    ],
    rationale:t('Design choice: show a clear exit and a readable reward, while leaving danger partly uncertain. If progress requires staying, greed stops being the player’s decision.','设计取舍：让出口和已有收益清晰可见，同时让危险保留不确定性。如果推进任务必须留下，贪婪就不再是玩家的主动选择。')
  }];
  cases.forEach(c=>{
    const host=document.querySelector(c.host);if(!host)return;
    const panel=document.createElement('div');panel.className='design-evidence';panel.id=c.id;
    panel.innerHTML=`<p class="evidence-label">${t('DESIGN DECISIONS / INTERACTIVE','设计决策 / 交互示意')}</p><h3>${c.title}</h3><p>${c.question}</p><div class="evidence-options" role="group" aria-label="${c.question}">${c.choices.map((s,i)=>`<button type="button" data-case="${i}" aria-pressed="${i===0}" aria-controls="${c.id}-result">${s[0]}</button>`).join('')}</div><div class="evidence-result" id="${c.id}-result" aria-live="polite" aria-atomic="true"></div><p class="evidence-rationale">${c.rationale}</p>`;
    const render=i=>{
      panel.querySelectorAll('button').forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));
      const labels=[t('PLAYER INPUT','玩家输入'),t('SYSTEM RESPONSE','系统回应'),t('PLAYER CONSEQUENCE','玩家后果')];
      panel.querySelector('.evidence-result').innerHTML=c.choices[i].slice(1).map((s,j)=>`<div><span>0${j+1} / ${labels[j]}</span><p>${s}</p></div>`).join('');
    };
    panel.addEventListener('click',e=>{const b=e.target.closest('button[data-case]');if(b)render(Number(b.dataset.case));});
    render(0);host.prepend(panel);
  });
})();
