(()=>{
const root=document.getElementById('vizao-reader');if(!root)return;
const stage=root.querySelector('.vr-stage'),book=root.querySelector('.vr-book'),status=root.querySelector('.vr-status'),prev=root.querySelector('[data-vr="prev"]'),next=root.querySelector('[data-vr="next"]'),input=root.querySelector('input'),zoom=root.querySelector('[data-vr="zoom"]'),full=root.querySelector('[data-vr="full"]');
const small=matchMedia('(max-width:700px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');let current=1,opened=false,zoomed=false,touchX=null,texts=null,turning=false;
function pages(){return small.matches||current===1||current===116?[current]:[current,current+1];}
function normalize(n){n=Math.max(1,Math.min(116,Number(n)||1));return !small.matches&&n>1&&n<116?n-n%2:n;}
function img(n){const el=document.createElement('img');el.src='assets/revista/pages/'+String(n).padStart(3,'0')+'.webp';el.alt='Revista Vizão — página '+n;el.width=1188;el.height=1600;el.draggable=false;return el;}
function syncText(list=pages()){root.querySelector('.vr-transcript').textContent=texts?list.map(n=>texts[n-1]).join('\n\n'):'';}
async function render(animate=false,direction=1){
 if(turning)return;turning=true;
 const target=normalize(current),list=small.matches||target===1||target===116?[target]:[target,target+1];
 const old=[...book.querySelectorAll(':scope > img')];const fresh=list.map(img);
 try{
 await Promise.all(fresh.map(i=>i.decode()));
 if(animate&&!reduced.matches&&old.length===2&&fresh.length===2&&!zoomed){
  // Keep the stationary old leaf visible until the turning leaf lands.
  const under=direction>0?[old[0],fresh[1]]:[fresh[0],old[1]];
  book.replaceChildren(...under);book.classList.add('vr-spread');
  const sheet=document.createElement('div');sheet.className='vr-turning-sheet '+(direction>0?'vr-forward':'vr-backward');sheet.setAttribute('aria-hidden','true');
  const front=document.createElement('div');front.className='vr-sheet-face vr-sheet-front';front.append(old[direction>0?1:0].cloneNode());
  const back=document.createElement('div');back.className='vr-sheet-face vr-sheet-back';back.append(fresh[direction>0?0:1].cloneNode());sheet.append(front,back);book.append(sheet);
  const animation=sheet.animate([{transform:'rotateY(0deg)'},{transform:'rotateY('+(-direction*180)+'deg)'}],{duration:460,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
  await animation.finished.catch(()=>{});
 }
 book.replaceChildren(...fresh);book.classList.toggle('vr-spread',list.length===2);current=target;
 input.value=current;prev.disabled=current===1;next.disabled=current===116;
 status.textContent=list.length===2?'Páginas '+list.join('–')+' de 116':'Página '+current+' de 116';syncText(list);
 stage.scrollTop=0;stage.scrollLeft=0;
 for(const n of [list[0]-2,list[0]-1,list.at(-1)+1,list.at(-1)+2])if(n>=1&&n<=116){const p=new Image();p.src='assets/revista/pages/'+String(n).padStart(3,'0')+'.webp';}
 }catch{status.textContent='Não foi possível carregar esta página. Tente novamente.';const n=old[0]?.alt.match(/(\d+)$/);if(n)current=Number(n[1]);input.value=current;}
 finally{turning=false;}
}
function turn(dir){if(turning)return;if(dir<0&&current===1||dir>0&&current===116)return;current=small.matches?current+dir:dir>0?(current===1?2:current+2):(current===2?1:current-2);render(true,dir);}
root.querySelector('[data-vr="open"]').addEventListener('click',()=>{opened=true;root.classList.add('vr-open');root.querySelector('.vr-cover').hidden=true;root.querySelector('.vr-controls').hidden=false;stage.hidden=false;render();stage.focus();fetch('assets/revista/pages/text.json').then(r=>r.json()).then(t=>{texts=t;syncText();}).catch(()=>{});});
prev.addEventListener('click',()=>turn(-1));next.addEventListener('click',()=>turn(1));input.addEventListener('change',()=>{if(turning){input.value=current;return;}current=input.value;render();});input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!turning){current=input.value;render();stage.focus();}});
zoom.addEventListener('click',()=>{zoomed=!zoomed;root.classList.toggle('vr-zoomed',zoomed);zoom.setAttribute('aria-pressed',String(zoomed));zoom.textContent=zoomed?'Reduzir':'Ampliar';});
full.addEventListener('click',async()=>{try{if(root.classList.contains('vr-expanded')){root.classList.remove('vr-expanded');full.textContent='Tela cheia';return;}if(document.fullscreenElement)await document.exitFullscreen();else if(root.requestFullscreen)await root.requestFullscreen();else{root.classList.toggle('vr-expanded');full.textContent=root.classList.contains('vr-expanded')?'Fechar tela cheia':'Tela cheia';}}catch{root.classList.toggle('vr-expanded');full.textContent=root.classList.contains('vr-expanded')?'Fechar tela cheia':'Tela cheia';}});
document.addEventListener('fullscreenchange',()=>{full.textContent=document.fullscreenElement?'Sair da tela cheia':'Tela cheia';});
root.addEventListener('keydown',e=>{if(e.target.matches('input'))return;if(e.key==='ArrowRight'){e.preventDefault();turn(1);}if(e.key==='ArrowLeft'){e.preventDefault();turn(-1);}if(e.key==='Escape'){root.classList.remove('vr-expanded');full.textContent='Tela cheia';}});
stage.addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX;},{passive:true});stage.addEventListener('touchend',e=>{if(touchX===null||zoomed)return;let delta=e.changedTouches[0].clientX-touchX;if(Math.abs(delta)>60)turn(delta<0?1:-1);touchX=null;},{passive:true});small.addEventListener('change',()=>{if(opened)render();});
})();
