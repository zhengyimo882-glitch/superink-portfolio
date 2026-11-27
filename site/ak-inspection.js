const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=v=>{v=clamp(v);return v*v*(3-2*v);};

// Shared projection: annotation anchors and the solid model use the same camera.
export function projectPoint([x,y,z],yaw,pitch){
  y=-y;z=-z;
  const xx=x*Math.cos(yaw)+z*Math.sin(yaw),zz=z*Math.cos(yaw)-x*Math.sin(yaw);
  const yy=y*Math.cos(pitch)-zz*Math.sin(pitch),depth=y*Math.sin(pitch)+zz*Math.cos(pitch);
  return [xx*460/(460+depth),yy*460/(460+depth),depth];
}

export function frameModel(corners,width,height){
  // A rotation-invariant sphere fixes both the pivot and zoom for this viewport.
  const radius=Math.max(...corners.map(p=>Math.hypot(...p)));
  const projectedRadius=radius*460/Math.sqrt(460*460-radius*radius);
  const landscape=height<550&&width>height*1.65;
  const origin=[width*(landscape?.70:.52),height*.57];
  const safeRadius=Math.min(origin[0]-width*.05,width*.95-origin[0],origin[1]-height*.08,height*.98-origin[1]);
  const scale=safeRadius/projectedRadius;
  return {scale,origin};
}

export const notes=[
  {id:'01',part:['MUZZLE / FIRE RATE','枪口 / 射速'],title:['Precise drawing. Faster fire.','画得更准，射速更快。'],body:['Drawing quality becomes a tangible combat advantage.','画得准不准，会影响武器在战斗中的表现。'],anchor:[94,13,0],yaw:1.22,pitch:-.12},
  {id:'02',part:['RECEIVER / RELIABILITY','机匣 / 可靠性'],title:['Every stroke affects reliability.','画得越稳，用起来越可靠。'],body:['Imperfect recognition can create an unstable weapon that jams.','图案不够准确，也可能生成武器，只是开火时有卡壳的风险。'],anchor:[-23,12,7],yaw:-.3,pitch:-.16},
  {id:'03',part:['MAGAZINE / COMBAT RHYTHM','弹匣 / 战斗节奏'],title:['Creation is only the beginning.','造出来，只是战斗的开始。'],body:['Ammunition management and trigger discipline still shape the fight.','武器到手后，仍要留意剩余弹药，把握开火时机。'],anchor:[3,-21,0],yaw:-2.35,pitch:.15},
  {id:'04',part:['STOCK / PLAYER SIGNATURE','枪托 / 个人印记'],title:['Your pattern. Your weapon.','你的图案，你的武器。'],body:['Practice a personal pattern and reproduce it under pressure.','把自己的图案练熟，才能在紧张的战斗中快速画出来。'],anchor:[-78,8,0],yaw:2.8,pitch:-.12},
  {id:'05',part:['GRIP / INK STABILITY','握把 / 墨迹稳定性'],title:['Failure becomes a new situation.','没画好，也得想办法应对。'],body:['Unstable creations can expire early or collapse back into ink.','不稳定的武器可能提前失效，重新散成墨迹。'],anchor:[-33,-17,0],yaw:-2.65,pitch:-.35}
];

export function noteStrength(note,yaw,pitch){
  // Compare view directions on a sphere, including tilted and upside-down views.
  const facing=Math.sin(pitch)*Math.sin(note.pitch)+Math.cos(pitch)*Math.cos(note.pitch)*Math.cos(yaw-note.yaw);
  return smooth((facing-Math.cos(.98))/(1-Math.cos(.98)));
}

// Callouts have a fixed side; eligibility comes from the actual projected part,
// not from a slot that happened to be free when an angle window opened.
const noteSides=['right','left','left','right','right'];
export function sideStrength(note,anchor,yaw,pitch){
  const projected=projectPoint(anchor,yaw,pitch);
  const side=noteSides[Number(note.id)-1];
  const outward=projected[0]*(side==='left'?-1:1);
  return smooth((outward-.35)/3);
}

export function createInspection(pin,anchors){
  const root=document.createElement('div');root.className='ak-inspection';
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
  svg.classList.add('ak-leaders');svg.setAttribute('aria-hidden','true');root.append(svg);
  const items=notes.map((note,i)=>{
    const group=document.createElementNS(ns,'g'),line=document.createElementNS(ns,'path'),dot=document.createElementNS(ns,'circle'),ring=document.createElementNS(ns,'circle');
    line.setAttribute('pathLength','1');dot.setAttribute('r','2.6');ring.setAttribute('r','7');ring.classList.add('ak-anchor-ring');group.append(line,ring,dot);svg.append(group);
    const card=document.createElement('div');card.className='ak-note';
    card.innerHTML='<span class="ak-note-kicker"></span><strong></strong><p></p>';
    card.dataset.part=note.id;
    root.append(card);return {note,anchor:anchors[i],dock:noteSides[i],group,line,dot,ring,card,opacity:0,active:false};
  });
  const hint=document.createElement('div');hint.className='ak-inspection-hint';root.append(hint);pin.append(root);
  const controls=pin.querySelector('.studio-controls');
  let previousTime=0,language;
  return {
    remove(){root.remove();},
    update({width,height,origin,scale,yaw,pitch,progress}){
      const now=performance.now(),dt=Math.min((now-previousTime)/1000,.1);previousTime=now;
      const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
      const lang=window.siteI18n?.language==='zh-CN'?1:0;
      if(language!==lang){language=lang;items.forEach(({note,card})=>{
        card.querySelector('span').textContent=note.id+' / '+note.part[lang];card.querySelector('strong').textContent=note.title[lang];card.querySelector('p').textContent=note.body[lang];
      });hint.textContent=lang?'拖动旋转 · 探索 5 处武器解析':'DRAG TO INSPECT · 5 DESIGN CONNECTIONS';}
      const ready=progress>=.995;root.style.visibility=progress>.94?'visible':'hidden';hint.style.opacity=ready?'.65':'0';
      svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
      const compact=width<720||height<550;
      const ranked=items.map(item=>({item,strength:noteStrength(item.note,yaw,pitch)*sideStrength(item.note,item.anchor,yaw,pitch)})).sort((a,b)=>b.strength-a.strength);
      const chosen=new Set(),usedSides=new Set();
      for(const {item,strength} of ranked){if(strength>.025&&!usedSides.has(item.dock)&&chosen.size<(compact?1:2)){chosen.add(item);usedSides.add(item.dock);}}
      for(const item of items){
        const sameSide=sideStrength(item.note,item.anchor,yaw,pitch);
        const strength=noteStrength(item.note,yaw,pitch),target=ready&&chosen.has(item)?smooth(strength*3)*sameSide:0;
        item.opacity=reduced?target:item.opacity+(target-item.opacity)*(1-Math.exp(-dt*12));
        item.opacity=Math.min(item.opacity,sameSide);
        if(item.opacity<.008&&target===0)item.opacity=0;
        const active=target>.1;
        if(active!==item.active){item.active=active;item.card.classList.toggle('is-active',active);item.group.classList.toggle('is-active',active);}
        item.card.style.opacity=item.opacity.toFixed(3);item.group.style.opacity=item.opacity.toFixed(3);item.card.setAttribute('aria-hidden',String(item.opacity<.15));
        if(item.opacity===0)continue;
        const p=projectPoint(item.anchor,yaw,pitch),ax=origin[0]+p[0]*scale,ay=origin[1]+p[1]*scale;
        const cardWidth=compact?Math.min(320,width-36):Math.min(290,width*.25);
        const right=item.dock!=='left';
        const x=compact?(height<550?24:(width-cardWidth)/2):right?width*.94-cardWidth:width*.06;
        item.card.style.width=cardWidth+'px';
        const preferredY=compact?(height<550?height*.48:height*.76):right?height*.33:height*.73;
        const y=Math.min(preferredY,(controls?.offsetTop??height*.91)-item.card.offsetHeight-14);
        item.card.style.left=x+'px';item.card.style.top=y+'px';
        const endX=compact?x+cardWidth/2:right?x:x+cardWidth,endY=compact?y-9:y+12;
        const elbowX=compact?endX:right?endX-22:endX+22,elbowY=compact?endY-18:endY;
        item.line.setAttribute('d',`M${ax.toFixed(1)},${ay.toFixed(1)} L${elbowX.toFixed(1)},${elbowY.toFixed(1)} L${endX.toFixed(1)},${endY.toFixed(1)}`);
        for(const dot of [item.dot,item.ring]){dot.setAttribute('cx',ax);dot.setAttribute('cy',ay);}
      }
    }
  };
}
