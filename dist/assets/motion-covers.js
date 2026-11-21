// Shared motion-project covers: add source and poster when each film is available.
(()=>{
 const covers=[{slug:'revista-video-visao',src:'assets/revista/cover-galeria.mp4',poster:'assets/revista/cover-rostos.webp'},{slug:'revista-infografico',src:'assets/visao/cover-coleta.mp4',poster:'assets/visao/cover-coleta.webp'},{slug:'fragmin',src:'assets/fragmin/cover.mp4',poster:'assets/fragmin/abertura.webp'},{slug:'nave-3d-02',src:'assets/exodus/cover.mp4',poster:'assets/exodus/estrutura.webp'},{slug:'emilie-chamie',src:'assets/emilie/cover.mp4',poster:'assets/emilie/Motion_01.webp'}];
 const videos=[];
 for(const cover of covers){
  const cards=document.querySelectorAll('.works-grid>a[href="#project/'+cover.slug+'"],.selected-grid>a[href="#project/'+cover.slug+'"]');
  for(const card of cards){
  card.classList.add('motion-cover');
  const video=document.createElement('video');
  video.className='motion-cover-video';video.muted=true;video.defaultMuted=true;video.loop=true;video.playsInline=true;
  video.setAttribute('muted','');video.setAttribute('playsinline','');video.setAttribute('aria-hidden','true');video.tabIndex=-1;
  video.preload='none';video.poster=cover.poster;video.src=cover.src;
  card.prepend(video);videos.push(video);
  }
 }
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const visible=new Set();
 function sync(){for(const v of videos){if(visible.has(v)&&v.getBoundingClientRect().width>0&&v.getBoundingClientRect().height>0&&!document.hidden&&!reduced.matches){const playing=v.play();if(playing)playing.catch(()=>{});}else v.pause();}}
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries){const v=entry.target.querySelector('video.motion-cover-video');if(entry.isIntersecting)visible.add(v);else visible.delete(v);}sync();},{threshold:.05});videos.forEach(v=>observer.observe(v.parentElement));}
 document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
 window.addEventListener('portfolio:route',()=>{videos.forEach(v=>v.pause());requestAnimationFrame(sync);});
})();
