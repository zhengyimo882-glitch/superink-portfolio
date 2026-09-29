// Verified destinations only. Set demoUrl when a public playable build is available.
window.RELIC_CONFIG = {
 links: {demoUrl: 'https://zhengyimo882-glitch.github.io/one-more-relic/', youtubeUrl: 'https://youtu.be/JUIhE9zRpBk'},
 motion: {feedback:200, transition:550, entrance:1000},
 copy: {
  hero: {title:'ONE MORE RELIC',quote:'You could leave now. But what about one more relic?',body:'Tomb exploration. Relic appraisal. The temptation to stay.'},
  video: {title:'One trip. One more temptation.'},
  explore: {title:'Read the room.\nRespect its rules.',body:'Study the layout, follow the clues, and consider what you disturb.'},
  choice: {title:'What will you take?\nWhen will you leave?',body:'Space is limited. Leave with what you have—or take another step into the unknown.'},
  shop: {title:'Bring it back.\nUncover its story.',body:'Clean the surface, examine the evidence, and decide what to sell or keep.'}
 },
 assets: {
  tomb:{file:'gameplay-tomb-before-candle.png',alt:'Main tomb chamber with ritual candles, a central coffin and the exploration interface.',caption:'Main chamber'},
  portal:{file:'gameplay-tomb-portal.png',alt:'A blue-purple portal beside a lit ritual candle in the tomb.',caption:'A passage appears'},
  cellar:{file:'gameplay-cellar.png',alt:'Hidden cellar illuminated by the player’s flashlight, with a return portal.',caption:'Beyond the main chamber'},
  departure:{file:'gameplay-departure.png',alt:'Actual departure confirmation showing the carried book and the option to stay.',caption:'Departure confirmation'},
  shop:{file:'gameplay-shop.png',alt:'Antique shop with wooden display cabinets, a cleaning bench and objects awaiting inspection.',caption:'Back above ground'},
  clean:{file:'gameplay-cleaning-en.png',alt:'Open thread-bound book on the cleaning bench with brush, pick and cloth tools.',caption:'Clean / Thread-bound book'},
  examine:{file:'gameplay-inspection-en.png',alt:'English inspection interface showing the open pages of the thread-bound book under adjustable side lighting.',caption:'Examine / Paper fibres under side lighting'},
  record:{file:'gameplay-observations-en.png',alt:'English observations notebook recording the folded map seam found along the spine of the same thread-bound book.',caption:'Record evidence / Folded map seam'}
 },
 hotspots:[{x:43,y:25,label:'Ritual candle',text:'A candle beside the passage.'},{x:50,y:56,label:'Central coffin',text:'A coffin at the center of the chamber.'}],
 stages:[{key:'clean',label:'Clean'},{key:'examine',label:'Examine'},{key:'record',label:'Record evidence'}]
};
// Generated specifically for the choice section; never label these as gameplay.
Object.assign(window.RELIC_CONFIG.assets, {
 choiceCarry:{file:'choice-carry-art.png',alt:'AI promotional illustration of a worn blue thread-bound book in a satchel on a tomb ledge.',caption:'The choice'},
 choiceExplore:{file:'choice-explore-art.png',alt:'AI promotional illustration of the book beside a deep stone tomb passage.',caption:'Further into the unknown'},
 choiceReturn:{file:'choice-return-art.png',alt:'AI promotional illustration of the book and satchel resting on a warmly lit antique-shop counter.',caption:'Back above ground'}
});
// Supplied promotional illustrations, in the requested presentation order.
window.RELIC_CONFIG.gallery = [
 {file:'protagonist-relic.png',title:'The keeper',alt:'The protagonist holding an ornate antique vessel.',width:2560,height:3200},
 {file:'cleaning-evidence.png',title:'Read the traces',alt:'The protagonist carefully cleaning an antique at a workbench.',width:3840,height:2160},
 {file:'shop-choices.png',title:'Above ground',alt:'An antique displayed on a shop counter facing the protagonist.',width:3840,height:2160},
 {file:'tomb-risk.png',title:'Into the unknown',alt:'The protagonist holding a lantern beside an open vessel in a tomb.',width:3840,height:2160}
];
// Artwork narration: concise paraphrases of GDD v0.2 §§1.2, 6.1–6.3, 7.1 and 9.1.
[
 {eyebrow:'THE OBJECT / GDD DESIGN',headline:'More than something to take.',body:'Financial pressure brings you to the antique shop. Below ground, an object’s place can matter as much as its value.'},
 {eyebrow:'THE EVIDENCE / GDD DESIGN',headline:'Every trace asks a question.',body:'Cleaning reveals patterns, material and damage. Appraisal follows the evidence—not a single click.'},
 {eyebrow:'THE SHOP / GDD DESIGN',headline:'Bringing it back is only the beginning.',body:'Sell, collect or keep researching. The shop is where discoveries become decisions about the next descent.'},
 {eyebrow:'THE TEMPTATION / GDD DESIGN',headline:'One more step into the unknown.',body:'Read the layout, the light and the placement of objects. The first tomb teaches these rules before later tombs open the full leave-or-stay dilemma.'}
].forEach((text,i)=>Object.assign(window.RELIC_CONFIG.gallery[i],text));
