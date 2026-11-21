(()=>{
 const page=document.getElementById('cenario-page');
 function update(target){const active=target==='project/cenario-3d';document.body.classList.toggle('cenario-active',active);page.hidden=!active;}
 window.addEventListener('portfolio:route',event=>update(event.detail));update(location.hash.slice(1));
 if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion:reduce)').matches){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('tp-visible');observer.unobserve(entry.target);}}),{threshold:0,rootMargin:'0px 0px -35px 0px'});page.querySelectorAll('.tp-reveal').forEach(el=>{el.classList.add('tp-pending');observer.observe(el);});}
 page.querySelectorAll('p').forEach(el=>{if(el.children.length||el.classList.contains('tp-eye'))return;el.textContent=el.textContent.trim().replace(/ (\S+)$/,'\u00a0$1');});
})();
