(()=>{
 const page=document.getElementById('fragmin-page');
 const text=page.querySelector('#fragmin-test-text');
 const weight=page.querySelector('#fragmin-test-weight');
 const value=page.querySelector('#fragmin-weight-value');
 function fitText() {
  if (page.hidden) return;
  text.style.height = 'auto';
  text.style.height = text.scrollHeight + 'px';
 }
 function updateWeight() {
  text.style.setProperty('--fragmin-weight', weight.value);
  weight.style.setProperty('--weight-progress', (weight.value / weight.max * 100) + '%');
  value.value = weight.value;
  fitText();
 }
 text.addEventListener('input', fitText);
 weight.addEventListener('input', updateWeight);
 window.addEventListener('resize', fitText, {passive: true});
 document.fonts?.ready.then(fitText);

 function update(target){const active=target==='project/fragmin';document.body.classList.toggle('fragmin-active',active);page.hidden=!active;if(active)updateWeight();if(!active)page.querySelectorAll("video").forEach(v=>v.pause());}
 window.addEventListener('portfolio:route',event=>update(event.detail));update(location.hash.slice(1));
 if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion:reduce)').matches){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('tp-visible');observer.unobserve(entry.target);}}),{threshold:0,rootMargin:'0px 0px -35px 0px'});page.querySelectorAll('.tp-reveal').forEach(el=>{el.classList.add('tp-pending');observer.observe(el);});}
 page.querySelectorAll('p').forEach(el=>{if(el.children.length||el.classList.contains('tp-eye'))return;el.textContent=el.textContent.trim().replace(/ (\S+)$/,'\u00a0$1');});
})();
