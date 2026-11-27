/* Only interactive views pay for the WebGL modules. */
(() => {
  function start(){
    if(!document.body.classList.contains('case-immersive'))return;
    import('./portfolio-world.js').catch(error=>console.warn('Atmosphere fallback',error));
    if(!document.body.classList.contains('viewing-relic'))import('./ak-model.js').catch(error=>console.warn('Drawing fallback',error));
  }
  if(document.body.classList.contains('case-page'))start();
  else addEventListener('case-view-ready',start,{once:true});
})();
