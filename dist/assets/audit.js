// Align pullquotes to the image edge, excluding captions even when they wrap.
(()=>{
 const pairs=[['.tp-quote','.tp-quote-image',701],['.cp-eye','.cp-bedroom',701],['.xp-eye','.xp-portrait',701],['.kk-eye','.kk-banoffee',701],['.fg-eye','.fg-pattern',701],['.id-eye','.id-quote-row .tp-figure',701],['.vs-eye','.vs-detail',701],['.ec-intro-eye','.ec-intro-secondary',961],['.ec-motion-layout>.ec-eye','.ec-motion-secondary',961]];
 const entries=pairs.map(([q,f,min])=>({quote:document.querySelector(q),caption:document.querySelector(f+' figcaption'),min})).filter(e=>e.quote&&e.caption);
 function align(){for(const {quote,caption,min} of entries){if(innerWidth<min||!caption.getBoundingClientRect().width)continue;const style=getComputedStyle(caption),gap=caption.getBoundingClientRect().height+parseFloat(style.marginTop||0);quote.style.setProperty('--eye-caption',gap+'px');}}
 let frame;function schedule(){cancelAnimationFrame(frame);frame=requestAnimationFrame(align);}
 if('ResizeObserver'in window){const observer=new ResizeObserver(schedule);entries.forEach(e=>observer.observe(e.caption));}
 addEventListener('resize',schedule);addEventListener('portfolio:route',schedule);document.fonts?.ready.then(schedule);schedule();
})();
