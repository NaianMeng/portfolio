(()=>{
 const body=document.body,header=document.querySelector('.site-header');
 const desktop=matchMedia('(hover:hover) and (pointer:fine)'),compact=matchMedia('(max-width:970px)');
 let lastY=Math.max(0,window.scrollY),travel=0,direction=0,open=false,closeTimer,routeFrame;
 function persistent(){return (body.dataset.route==='home'&&window.scrollY<30)||!desktop.matches||compact.matches;}
 function setOpen(value){clearTimeout(closeTimer);open=persistent()||value;body.classList.toggle('menu-expanded',open);if(open)body.classList.remove('header-hidden');}
 function hide(){clearTimeout(closeTimer);open=false;body.classList.remove('menu-expanded');body.classList.add('header-hidden');}
 function route(){clearTimeout(closeTimer);cancelAnimationFrame(routeFrame);travel=0;direction=0;lastY=Math.max(0,window.scrollY);body.classList.remove('header-hidden');setOpen(false);routeFrame=requestAnimationFrame(()=>{lastY=Math.max(0,window.scrollY);travel=0;direction=0;setOpen(false);});}
 header.addEventListener('pointerenter',e=>{if(desktop.matches&&e.pointerType==='mouse')setOpen(true);});
 header.addEventListener('pointermove',e=>{if(desktop.matches&&e.pointerType==='mouse')setOpen(true);},{passive:true});
 header.addEventListener('pointerleave',e=>{if(desktop.matches&&e.pointerType==='mouse')closeTimer=setTimeout(()=>setOpen(false),220);});
 document.addEventListener('click',e=>{if(open&&!header.contains(e.target))setOpen(false);});
 window.addEventListener('portfolio:route',route);
 desktop.addEventListener('change',route);compact.addEventListener('change',route);
 window.addEventListener('scroll',()=>{
  const y=Math.max(0,Math.min(window.scrollY,document.documentElement.scrollHeight-window.innerHeight));
  const delta=y-lastY;lastY=y;if(!delta)return;
  const nextDirection=Math.sign(delta);if(nextDirection!==direction){travel=0;direction=nextDirection;}travel+=Math.abs(delta);
  if(y<30){travel=0;body.classList.remove('header-hidden');setOpen(false);return;}
  if(direction>0&&y>120&&travel>=20){hide();travel=0;}
  else if(direction<0&&travel>=12){setOpen(true);travel=0;}
 },{passive:true});
 document.addEventListener('pointermove',e=>{if(desktop.matches&&e.pointerType==='mouse'&&e.clientY<24)setOpen(true);},{passive:true});
 document.querySelectorAll('[data-scroll-to]').forEach(button=>button.addEventListener('click',()=>{const target=document.querySelector(button.dataset.scrollTo);target?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});}));
 document.querySelectorAll('p').forEach(p=>{if(p.children.length||p.classList.contains('ec-eye'))return;const text=p.textContent.trim();p.textContent=text.replace(/ (\S+)$/,'\u00a0$1');});
 const worksKeyboardLinks = 'a[data-nav="works"], .work-view .gallery-link, .works-grid > a, .case-footer a[href="#works"]';
 document.querySelectorAll('a,button,input,textarea,[tabindex]').forEach(el=>{
  if(!el.matches(worksKeyboardLinks)) el.tabIndex=-1;
 });
 setOpen(open);
})();
