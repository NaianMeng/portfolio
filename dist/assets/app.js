

(()=>{const ns='http://www.w3.org/2000/svg',eg=document.getElementById('edges'),vg=document.getElementById('vertices'),scene=document.getElementById('scene'),toggle=document.getElementById('toggle'),selection=document.getElementById('selection');
const vertices=Array.from({length:16},(_,i)=>Array.from({length:4},(_,a)=>i&(1<<a)?1:-1)),edges=[];for(let i=0;i<16;i++)for(let a=0;a<4;a++){const j=i^(1<<a);if(i<j)edges.push([i,j])}
const lines=edges.map(([a,b])=>{const el=document.createElementNS(ns,'line');el.setAttribute('class','edge');el.setAttribute('stroke-width',vertices[a][3]!==vertices[b][3]?1.3:1.8);eg.appendChild(el);return el}),dots=vertices.map((_,i)=>{const el=document.createElementNS(ns,'circle');el.setAttribute('class','dot');el.setAttribute('r',[0,3,14].includes(i)?5:2.5);vg.appendChild(el);return el});

// Menu labels follow fixed 4D vertices through the exact SVG screen projection.
const homeSvg=eg.ownerSVGElement;
const tetherSvg=document.createElementNS(ns,'svg');
tetherSvg.setAttribute('class','vertex-tethers');tetherSvg.setAttribute('aria-hidden','true');scene.appendChild(tetherSvg);
const bindings=[['.node.work',0],['.node.about',3],['.node.contact',14]].map(([selector,index])=>{
 const button=scene.querySelector(selector),line=document.createElementNS(ns,'line');
 line.setAttribute('class','vertex-tether');tetherSvg.appendChild(line);dots[index].classList.add('menu-vertex');
 function highlight(active){button.classList.toggle('vertex-active',active);dots[index].classList.toggle('vertex-active',active);line.classList.toggle('vertex-active',active)}
 button.addEventListener('pointerenter',()=>highlight(true));button.addEventListener('pointerleave',()=>highlight(document.activeElement===button));button.addEventListener('focus',()=>highlight(true));button.addEventListener('blur',()=>highlight(false));
 button.style.left='0';
 button.style.top='0';
 return {button,index,line};
});
let menuLayout;
function measureMenu(){
 const matrix=homeSvg.getScreenCTM(),box=scene.getBoundingClientRect();
 if(!matrix||box.width<1||box.height<1)return;
 const offsetX=matrix.e-box.left-scene.clientLeft,offsetY=matrix.f-box.top-scene.clientTop;
 const labels=bindings.map(binding=>({...binding,width:binding.button.offsetWidth,height:binding.button.offsetHeight}));
 tetherSvg.setAttribute('viewBox','0 0 '+box.width+' '+box.height);
 return {matrix,offsetX,offsetY,width:box.width,height:box.height,labels};
}
function positionMenu(points){
 if(!menuLayout)return;
 const {matrix,offsetX,offsetY,width:sceneWidth,height:sceneHeight,labels}=menuLayout;
 const gap=10,pad=10,placed=[];
 const clamp=(v,min,max)=>Math.max(min,Math.min(v,Math.max(min,max)));
 for(const {button,index,line,width,height} of labels){
  const point=points[index];
  const x=point.x*matrix.a+point.y*matrix.c+offsetX;
  const y=point.x*matrix.b+point.y*matrix.d+offsetY;
  // Each label keeps one attachment direction. Only the local offset changes
  // when a boundary or another label requires room; projection never lags.
  const maxLeft=sceneWidth-width-pad,maxTop=sceneHeight-height-42;
  const preferred=index===0?{left:x-width/2,top:y-height-gap}:
    index===3?{left:x+gap,top:y-height/2}:{left:x-width-gap,top:y-height/2};
  const candidates=[preferred,
   {left:x-width/2,top:y-height-gap},
   {left:x+gap,top:y-height/2},
   {left:x-width-gap,top:y-height/2},
   {left:x-width/2,top:y+gap}];
  let chosen=null;
  for(const candidate of candidates){
   const left=clamp(candidate.left,pad,maxLeft),top=clamp(candidate.top,pad,maxTop);
   const coversVertex=x>left-4&&x<left+width+4&&y>top-4&&y<top+height+4;
   const collision=placed.some(r=>left<r.left+r.width+8&&left+width+8>r.left&&top<r.top+r.height+8&&top+height+8>r.top);
   const cost=(coversVertex?100000:0)+(collision?10000:0)+Math.hypot(left-candidate.left,top-candidate.top);
   if(!chosen||cost<chosen.cost)chosen={left,top,width,height,cost};
   if(cost===0)break;
  }
  placed.push(chosen);
  button.style.translate=chosen.left+'px '+chosen.top+'px';
  const endX=clamp(x,chosen.left,chosen.left+width),endY=clamp(y,chosen.top,chosen.top+height);
  line.setAttribute('x1',x);line.setAttribute('y1',y);
  line.setAttribute('x2',endX);line.setAttribute('y2',endY);
 }
}

const angles={xw:.29,yw:-.35,zw:.13,xy:.12,xz:-.31,yz:.24};function rot(v,a,b,t){const c=Math.cos(t),s=Math.sin(t),x=v[a],y=v[b];v[a]=x*c-y*s;v[b]=x*s+y*c}
function project(base){let v=[...base];rot(v,0,3,angles.xw);rot(v,1,3,angles.yw);rot(v,2,3,angles.zw);const w=4/(4-v[3]);v=[v[0]*w,v[1]*w,v[2]*w];rot(v,0,1,angles.xy);rot(v,0,2,angles.xz);rot(v,1,2,angles.yz);const depth=6/(6-v[2]);return{x:350+v[0]*130*depth,y:350+v[1]*130*depth,z:v[2]}}
function draw(){const p=vertices.map(project);edges.forEach(([a,b],i)=>{const el=lines[i];el.setAttribute('x1',p[a].x);el.setAttribute('y1',p[a].y);el.setAttribute('x2',p[b].x);el.setAttribute('y2',p[b].y);el.setAttribute('opacity',Math.max(.3,Math.min(.95,.64+(p[a].z+p[b].z)*.11)))});p.forEach((v,i)=>{dots[i].setAttribute('cx',v.x);dots[i].setAttribute('cy',v.y)});positionMenu(p)}
let pointer=null,moved=false;scene.addEventListener('pointerdown',e=>{if(e.target.closest('button,a'))return;e.preventDefault();pointer={id:e.pointerId,x:e.clientX,y:e.clientY};moved=false;scene.setPointerCapture(e.pointerId)});scene.addEventListener('pointermove',e=>{if(!pointer||pointer.id!==e.pointerId)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;if(Math.abs(dx)+Math.abs(dy)>1)moved=true;angles.xw+=dx*.006;angles.yw+=dy*.006;angles.xy+=dx*.002;angles.xz+=dy*.002;pointer.x=e.clientX;pointer.y=e.clientY;draw()});scene.addEventListener('pointercancel',()=>{pointer=null});scene.addEventListener('pointerup',e=>{if(!pointer||pointer.id!==e.pointerId)return;pointer=null;if(!moved&&!scene.classList.contains('open'))open(true)});
function open(value){scene.classList.toggle('open',value);toggle.setAttribute('aria-expanded',String(value));toggle.innerHTML=value?'Recolher menu':'Explorar o hipercubo';scene.querySelectorAll('.node').forEach(el=>el.tabIndex=-1);draw()}toggle.addEventListener('click',()=>open(!scene.classList.contains('open')));
function refreshMenuLayout(){
 menuLayout=measureMenu();
 draw();
}
if(typeof ResizeObserver!=='undefined'){
 const layoutObserver=new ResizeObserver(refreshMenuLayout);
 layoutObserver.observe(scene);
 bindings.forEach(({button})=>layoutObserver.observe(button));
}
window.addEventListener('resize',refreshMenuLayout);
window.addEventListener('portfolio:route',event=>{if(event.detail==='home')refreshMenuLayout()});
if(document.fonts)document.fonts.ready.then(refreshMenuLayout);
menuLayout=measureMenu();
open(true);

window.portfolioMotion.register({element:scene,route:'home',controls:[],speed:4,pauseOnHover:false,hitTest:event=>Boolean(event.target.closest('.node'))||window.portfolioMotion.svgHit(homeSvg,eg,event),apply:x=>{const delta=x*Math.PI/180;angles.zw=(angles.zw+delta)%(Math.PI*2);draw()}});
})();




(() => {
  const projects = [
    {slug:'kitkat',title:'KitKat Match Up',short:'KITKAT',summary:'Uma proposta de valorização do produto inspirada em sobremesas brasileiras, construída com imagens e apresentação em 3D.',overview:'Minha atuação neste projeto se concentra em modelagem, renders e no display de apresentação.',tags:['3D','Embalagem','Visualização'],concept:'A direção do projeto aproxima o universo KitKat de referências de sobremesas brasileiras. Este espaço reunirá as referências e as decisões que orientaram as formas e a apresentação.',process:'Aqui entram etapas de modelagem, materiais, iluminação, testes de câmera e evolução dos renders. As peças serão organizadas como uma sequência visual, com textos curtos.',result:'A última parte reunirá renders finais, aplicações da embalagem e imagens do display, mostrando como o trabalho funciona em conjunto.'},
    {slug:'emilie-chamie',title:'Prêmio Emilie Chamie',short:'EMILIE CHAMIE',summary:'Uma identidade visual para o prêmio e a mostra estudantil, pensada para circular entre peças gráficas, audiovisual e o espaço do evento.',overview:'O conceito visual parte da passagem entre dia e noite, associada aos diferentes períodos e percursos dos estudantes.',tags:['Identidade visual','Motion','Audiovisual'],concept:'A transição entre luz e noite orienta a cor e a linguagem do sistema visual. Aqui serão mostrados o conceito e as primeiras explorações.',process:'Este bloco receberá estudos de gradiente, tipografia, composição e animação, além da adaptação da identidade aos formatos do evento.',result:'Aqui entram os desdobramentos finais: vinhetas, projeções, certificados, peças gráficas e aplicações de palco.'},
    {slug:'tipografia-variavel',title:'Tipografia Variável',short:'TIPO VARIÁVEL',summary:'Um estudo de letra e movimento que coloca em diálogo a ideia de um futuro iminente e o desconforto do passado.',overview:'O case mostra o conceito, a construção da fonte variável e sua expressão em movimento.',tags:['Tipografia','Pesquisa visual','Motion'],concept:'O contraste entre tempos orienta as decisões formais da tipografia. Aqui entram referências, testes de forma e critérios do desenho.',process:'Esta seção mostrará esboços, evolução dos glifos, variações dos eixos e testes de uso da fonte em composição.',result:'O encerramento apresentará a tipografia aplicada e a peça final de motion que explora sua transformação.'}
  ];
  const catalogue=[["kitkat", "KitKat"], ["fragmin", "Fragmin"], ["revista-infografico", "Infográfico Revista Visão"], ["revista-video-visao", "Revista Vizão"], ["tipo-sp", "Tipo SP"], ["terras-de-agua", "Terras de Água"], ["identidade-pessoal", "Identidade Pessoal"], ["cenario-3d", "Habitat 1989"], ["telefone-3d", "Última chamada"], ["design-20-anos", "Design ESPM 20 anos"], ["nave-3d-02", "Exodus"], ["emilie-chamie", "Emilie Chamie"]];
  const legacyProjects=projects.slice();
  projects.splice(0,projects.length,...catalogue.map(([slug,title])=>legacyProjects.find(p=>p.slug===slug)||{slug,title,short:title,summary:"",overview:"",tags:[],concept:"",process:"",result:""}));
  const projectNavigation = Array.from(document.querySelectorAll('.case-footer'), footer => {
    const nav = document.createElement('nav');
    nav.className = 'project-pagination';
    nav.setAttribute('aria-label', 'Navegação entre projetos');
    const links = ['← Projeto anterior', 'Próximo projeto →'].map(label => {
      const link = document.createElement('a');
      const title = document.createElement('strong');
      link.append(label, title);
      nav.append(link);
      return {link, title};
    });
    footer.before(nav);
    return links;
  });
  const gallery=document.getElementById("works-gallery");
  for(const [i,project] of projects.entries()){const link=document.createElement("a");link.href="#project/"+project.slug;const number=document.createElement("span");number.className="gallery-number";number.textContent=String(i+1).padStart(2,"0");const title=document.createElement("h3");title.textContent=project.title;link.append(number,title);gallery.appendChild(link)}
  const body=document.body, homeWork=document.querySelector('.shell .node.work'), homeContact=document.querySelector('.shell .node.contact'), homeAbout=document.querySelector('.shell .node.about'), cube=document.getElementById('works-cube'), stage=document.getElementById('cube-stage');
  function safeRoute(value){try{return decodeURIComponent(value)}catch{return 'home'}}
  let navigationRevision=0;
  function show(target, push=false) {
    if(target==='project/lapis') target='works/all';
    if(target==='project/nave-3d-01') target='project/design-20-anos';
    const revision=++navigationRevision;
    const galleryTarget=target==='works/all';
    let view='home', project=null, index=-1;
    if(target==='works'||galleryTarget) view='works';
    if(target==='contact') view='contact';
    if(target==='about') view='about';
    if(target.startsWith('project/')) { index=projects.findIndex(p=>p.slug===target.slice(8)); if(index>=0){view='case';project=projects[index]} }
    document.querySelector('.case-view').classList.toggle('no-details',Boolean(project&&!project.concept));
    if(project) {
      const fields={'case-index':String(index+1).padStart(2,'0')+' / PROJETO','case-title':project.title,'case-summary':project.summary,'case-overview':project.overview,'case-art':project.short,'case-concept':project.concept,'case-process':project.process,'case-result':project.result};
      for(const [id,value] of Object.entries(fields)) document.getElementById(id).textContent=value;
      const tags=document.getElementById('case-tags');tags.replaceChildren();
      for(const label of project.tags){const item=document.createElement('span');item.textContent=label;tags.appendChild(item)}
      const neighbours = [
        projects[(index + projects.length - 1) % projects.length],
        projects[(index + 1) % projects.length]
      ];
      for (const links of projectNavigation) {
        links.forEach(({link, title}, position) => {
          link.href = '#project/' + neighbours[position].slug;
          title.textContent = neighbours[position].title;
        });
      }
    }
    body.dataset.route=view;
    window.dispatchEvent(new CustomEvent("portfolio:route",{detail:target}));
    document.querySelectorAll('[data-nav]').forEach(a=>{const active=a.dataset.nav===(view==='case'?'works':view); if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
    const pageTitles={'revista-video-visao':'Revista Vizão','revista-infografico':'Infográfico Revista Visão','identidade-pessoal':'Identidade pessoal'};
    document.title=(view==='case'?(pageTitles[project.slug]||project.title):view==='works'?'Works':view==='contact'?'Contato':view==='about'?'Sobre':'Home')+' — Naian Menginelli';
    if(push&&(safeRoute(location.hash.slice(1))||'home')!==target){try{history.pushState({target},'', '#'+target)}catch(err){/* In restricted previews the visible navigation still works. */}}
    if(galleryTarget){
      requestAnimationFrame(()=>{
        if(revision!==navigationRevision)return;
        document.querySelector('.works-gallery').scrollIntoView({behavior:push&&!window.matchMedia('(prefers-reduced-motion:reduce)').matches?'smooth':'instant',block:'start'});
      });
    }else window.scrollTo(0,0);
  }
  homeWork.addEventListener('click',()=>show('works',true));
  homeContact.addEventListener('click',()=>show('contact',true));
  homeAbout.addEventListener('click',()=>show('about',true));
  document.addEventListener('click',e=>{
    const anchor=e.target.closest('a[href^="#"]');
    if(!anchor)return;
    if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0)return;
    const target=safeRoute(anchor.getAttribute('href').slice(1));
    if(target==='home'||target==='works'||target==='works/all'||target==='contact'||target==='about'||target.startsWith('project/')){e.preventDefault();show(target,true)}
  });
  window.addEventListener('popstate',()=>show(safeRoute(location.hash.slice(1))));
  window.addEventListener('hashchange',()=>show(safeRoute(location.hash.slice(1))));
  show(safeRoute(location.hash.slice(1)));
  document.getElementById('contact-form').addEventListener('input',()=>{document.getElementById('contact-status').textContent=''});
  function composeEmail(fields){
    const name=String(fields.get('name')||'').trim();
    const subject='Contato pelo portfólio'+(name?' — '+name:'');
    const message='Nome: '+name+'\nE-mail: '+String(fields.get('email')||'').trim()+'\n\n'+String(fields.get('message')||'');
    return 'mailto:naianmenginelli@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(message);
  }
  document.getElementById('contact-form').addEventListener('submit',e=>{
    e.preventDefault();
    const href=composeEmail(new FormData(e.currentTarget));
    document.getElementById('contact-status').textContent='Abra seu aplicativo de e-mail para revisar e enviar. Se ele não abrir, use “Copiar mensagem”.';
    window.location.href=href;
  });
  document.getElementById('contact-copy-message').addEventListener('click',async e=>{
    e.preventDefault();const fields=new FormData(document.getElementById('contact-form'));
    const message='Nome: '+fields.get('name')+'\nE-mail: '+fields.get('email')+'\n\n'+fields.get('message');
    const status=document.getElementById('contact-status');
    try{await navigator.clipboard.writeText(message);status.textContent='Mensagem copiada. Você pode colá-la em um e-mail para naianmenginelli@gmail.com.'}
    catch(err){const textarea=document.createElement('textarea');textarea.value=message;textarea.style.position='fixed';textarea.style.opacity='0';document.body.appendChild(textarea);textarea.select();let copied=false;try{copied=Boolean(document.execCommand&&document.execCommand('copy'))}catch(copyError){}textarea.remove();status.textContent=copied?'Mensagem copiada. Você pode colá-la em um e-mail para naianmenginelli@gmail.com.':'Não foi possível copiar automaticamente. Copie o texto dos campos manualmente.'}
  });
  // Uma segunda projeção 4D, sem menus ou elementos extras da Home.
  const contactSvg=document.getElementById('contact-tesseract');
  const ns='http://www.w3.org/2000/svg',edgeLayer=document.getElementById('contact-edges'),vertexLayer=document.getElementById('contact-vertices');
  const points=Array.from({length:16},(_,i)=>Array.from({length:4},(_,a)=>i&(1<<a)?1:-1)),links=[];
  for(let i=0;i<16;i++)for(let a=0;a<4;a++){const j=i^(1<<a);if(i<j)links.push([i,j,a])}
  const strokes=links.map(([a,b,axis])=>{const line=document.createElementNS(ns,'line');line.setAttribute('class',axis===3?'connector':'skeleton');edgeLayer.appendChild(line);return line});
  const vertices=points.map(()=>{const circle=document.createElementNS(ns,'circle');circle.setAttribute('r','3');vertexLayer.appendChild(circle);return circle});
  const angle={xw:.29,yw:-.35,zw:.13,xy:.12,xz:-.31,yz:.24};
  function rotate(v,a,b,t){const c=Math.cos(t),s=Math.sin(t),x=v[a],y=v[b];v[a]=x*c-y*s;v[b]=x*s+y*c}
  function projectContact(base){let v=[...base];rotate(v,0,3,angle.xw);rotate(v,1,3,angle.yw);rotate(v,2,3,angle.zw);const depth4=4/(4-v[3]);v=[v[0]*depth4,v[1]*depth4,v[2]*depth4];rotate(v,0,1,angle.xy);rotate(v,0,2,angle.xz);rotate(v,1,2,angle.yz);const depth3=6/(6-v[2]);const scale=130*600/700;return{x:300+v[0]*scale*depth3,y:300+v[1]*scale*depth3,z:v[2]}}
  function drawContact(){const p=points.map(projectContact);links.forEach(([a,b],i)=>{const line=strokes[i];line.setAttribute('x1',p[a].x);line.setAttribute('y1',p[a].y);line.setAttribute('x2',p[b].x);line.setAttribute('y2',p[b].y);line.setAttribute('opacity',Math.max(.42,Math.min(1,.77+(p[a].z+p[b].z)*.08)))});p.forEach((v,i)=>{vertices[i].setAttribute('cx',v.x);vertices[i].setAttribute('cy',v.y)})}
  drawContact();
  
  window.portfolioMotion.register({element:contactSvg,route:'contact',controls:[],speed:4,pauseOnHover:false,hitTest:event=>window.portfolioMotion.svgHit(contactSvg,edgeLayer,event),apply:x=>{const delta=x*Math.PI/180;angle.zw=(angle.zw+delta)%(Math.PI*2);drawContact()}});
  let contactPointer=null;
  contactSvg.addEventListener('pointerdown',e=>{e.preventDefault();contactPointer={id:e.pointerId,x:e.clientX,y:e.clientY};contactSvg.setPointerCapture(e.pointerId)});
  contactSvg.addEventListener('pointermove',e=>{if(!contactPointer||contactPointer.id!==e.pointerId)return;const dx=e.clientX-contactPointer.x,dy=e.clientY-contactPointer.y;angle.xw+=dx*.006;angle.yw+=dy*.006;angle.xy+=dx*.002;angle.xz+=dy*.002;contactPointer.x=e.clientX;contactPointer.y=e.clientY;drawContact()});
  contactSvg.addEventListener('pointerup',()=>{contactPointer=null});contactSvg.addEventListener('pointercancel',()=>{contactPointer=null});
  
  const aboutTopics=[
    {num:'01 / Sobre',title:'Designer em movimento.',text:'Olá! Sou Naian, designer interessado por motion design, criação 3D e soluções tecnológicas, áreas que me permitem unir pensamento lógico, experimentação e narrativa para transformar ideias em experiências visuais.'},
    {num:'02 / Origem',title:'Onde tudo começou.',text:'Minha relação com o design começou ainda jovem, ajudando minha mãe em seu trabalho com papelaria personalizada.\n\nAos 12 anos, iniciei um curso de design que se tornou um divisor de águas na minha trajetória. Foi nesse período que conheci diferentes possibilidades profissionais e percebi que me identificava principalmente com o audiovisual e o 3D.'},
    {num:'03 / Motion',title:'Narrativas em movimento.',text:'Durante minha formação em Design na ESPM-SP, essa curiosidade se transformou em uma relação ainda mais próxima com o motion design e com a criação de narrativas visuais.\n\nO motion acrescenta tempo, ritmo e transformação, tornando possível construir universos e conduzir diferentes formas de experiência.'},
    {num:'04 / 3D',title:'Ideias com dimensão.',text:'O que mais me interessa no movimento e no 3D é a possibilidade de materializar pensamentos, histórias e imaginações. A tridimensionalidade aproxima essas ideias do mundo real, permitindo que sejam vistas e sentidas como algo quase tangível.'},
    {num:'05 / Processo',title:'Curiosidade com método.',text:'Para mim, o design também é uma maneira de pensar. Tenho interesse em observar problemas, encontrar variações e experimentar caminhos até chegar a uma solução coerente com cada realidade. Essa busca constante por compreender, organizar e criar faz parte tanto do meu perfil profissional quanto da maneira como enxergo o mundo.'},
    {num:'06 / Referências',title:'O que me inspira.',text:'Meu interesse por desenho, filmes, videoclipes e efeitos visuais despertava a vontade de compreender como aqueles universos eram criados. Produções como Pacific Rim, Avatar e Tron, além de animes e videoclipes musicais, tiveram grande influência na formação do meu repertório visual.'}
  ];
  const aboutCube=document.getElementById('about-cube'),aboutStage=document.getElementById('about-stage');
  const aboutFaces=[...document.querySelectorAll('.about-face')],aboutPicks=[...document.querySelectorAll('[data-about-pick]')];
  let aboutX=-23,aboutY=-32,aboutAutoYaw=0,aboutPointer=null,aboutDragged=false;
  function drawAbout(){aboutCube.style.transform='rotateY('+aboutAutoYaw+'deg) rotateX('+aboutX+'deg) rotateY('+aboutY+'deg)'}
  let selectedAbout=0;
  function selectAbout(index,orient=false){
    const topic=aboutTopics[index],changed=index!==selectedAbout;
    selectedAbout=index;
    document.getElementById('about-number').textContent=topic.num;
    document.getElementById('about-title').textContent=topic.title;
    document.getElementById('about-text').textContent=topic.text.replace(/ (\S+)$/, '\u00a0$1');
    aboutFaces.forEach((face,i)=>face.classList.toggle('selected',i===index));
    aboutPicks.forEach((button,i)=>button.classList.toggle('active',i===index));
    if(orient){const poses=[[0,0],[0,-90],[-90,0],[0,90],[0,180],[90,0]];[aboutX,aboutY]=poses[index];aboutAutoYaw=0;drawAbout()}
    const detail=document.querySelector('.about-detail');
    if(changed&&detail.animate&&!window.matchMedia('(prefers-reduced-motion:reduce)').matches){
      for(const text of detail.querySelectorAll('h3,p')){
        text.getAnimations().forEach(animation=>animation.cancel());
        text.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,easing:'ease-out'});
      }
    }
  }
  aboutFaces.forEach(face=>face.addEventListener('click',()=>selectAbout(Number(face.dataset.about))));
  aboutPicks.forEach(button=>button.addEventListener('click',()=>selectAbout(Number(button.dataset.aboutPick),true)));
  aboutStage.addEventListener('pointerdown',e=>{if(!e.target.closest('button,a'))e.preventDefault();aboutPointer={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY};aboutDragged=false});
  aboutStage.addEventListener('pointermove',e=>{if(!aboutPointer||aboutPointer.id!==e.pointerId)return;const dx=e.clientX-aboutPointer.x,dy=e.clientY-aboutPointer.y;if(!aboutDragged&&Math.hypot(e.clientX-aboutPointer.startX,e.clientY-aboutPointer.startY)>5){aboutDragged=true;aboutCube.classList.add('dragging');aboutStage.setPointerCapture(e.pointerId)}if(aboutDragged){aboutY+=dx*.45;aboutX-=dy*.45;drawAbout()}aboutPointer.x=e.clientX;aboutPointer.y=e.clientY});
  aboutStage.addEventListener('pointerup',()=>{aboutPointer=null;aboutCube.classList.remove('dragging')});aboutStage.addEventListener('pointercancel',()=>{aboutPointer=null;aboutCube.classList.remove('dragging')});
  aboutStage.addEventListener('click',e=>{if(aboutDragged){e.preventDefault();e.stopImmediatePropagation();aboutDragged=false}},true);
  
  let rx=-24,ry=-32,worksAutoYaw=0,pointer=null,dragged=false;
  
  function draw(){cube.style.transform='rotateY('+worksAutoYaw+'deg) rotateX('+rx+'deg) rotateY('+ry+'deg)'}
  stage.addEventListener('pointerdown',e=>{if(!e.target.closest('button,a'))e.preventDefault();pointer={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY};dragged=false});
  stage.addEventListener('pointermove',e=>{if(!pointer||pointer.id!==e.pointerId)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;if(!dragged&&Math.hypot(e.clientX-pointer.startX,e.clientY-pointer.startY)>5){dragged=true;cube.classList.add('dragging');stage.setPointerCapture(e.pointerId)}if(dragged){ry+=dx*.45;rx-=dy*.45;draw()}pointer.x=e.clientX;pointer.y=e.clientY});
  window.addEventListener('pointerup',()=>{pointer=null;cube.classList.remove('dragging')});stage.addEventListener('pointercancel',()=>{pointer=null;cube.classList.remove('dragging')});
  cube.addEventListener('click',e=>{if(dragged){e.preventDefault();e.stopPropagation();dragged=false}},true);
  document.getElementById('rot-up').addEventListener('click',()=>{rx-=90;draw()});
  document.getElementById('rot-down').addEventListener('click',()=>{rx+=90;draw()});
  document.querySelectorAll('.about-controls [data-turn]').forEach(b=>b.addEventListener('click',()=>{const d=b.dataset.turn;if(d==='left'||d==='right')aboutY+=(d==='left'?-90:90);else aboutX+=(d==='up'?-90:90);drawAbout()}));
  document.getElementById('rot-left').addEventListener('click',()=>{ry-=90;draw()});
  document.getElementById('rot-right').addEventListener('click',()=>{ry+=90;draw()});
  window.portfolioMotion.register({element:stage,route:'works',speed:6,pauseOnHover:false,controls:[document.querySelector('.cube-controls')],apply:x=>{worksAutoYaw=(worksAutoYaw+x)%360;draw()},moving:value=>cube.classList.toggle('idle-motion',value)});
  window.portfolioMotion.register({element:aboutStage,route:'about',speed:5,pauseOnHover:false,controls:[document.querySelector('.about-picker'),document.querySelector('.about-controls')],apply:x=>{aboutAutoYaw=(aboutAutoYaw+x)%360;drawAbout()},moving:value=>aboutCube.classList.toggle('idle-motion',value)});
})();


// Reveal the introduction and project previews once during native scrolling.
(() => {
  const section=document.querySelector('.shell');
  if(!section||!('IntersectionObserver' in window)||window.matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  const intro=[...section.querySelectorAll('.copy>.eyebrow,.copy>.lede,.copy>.actions')];
  const previews=[section.querySelector('.selected-work .section-heading'),...section.querySelectorAll('.selected-grid>a')].filter(Boolean);
  const works=[...document.querySelectorAll('.work-view .work-intro h2,.work-view .work-intro p,.work-view .gallery-link,.work-view .cube-controls,.work-view .project-index,.work-view .gallery-heading,.work-view .works-grid>a')];
  const about=[...document.querySelectorAll('.about-view .about-copy h2,.about-view .about-picker,.about-view .about-detail,.about-view .about-bottom')];
  const contact=[...document.querySelectorAll('.contact-view .contact-copy h2,.contact-view .contact-copy>p,.contact-view .contact-fields,.contact-view .contact-form>label,.contact-view .contact-actions')];
  const items=[...intro,...previews,...works,...about,...contact];
  let observer;
  try {
    observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(!entry.isIntersecting)continue;
        entry.target.classList.add('preview-visible');
        observer.unobserve(entry.target);
      }
    },{threshold:.15,rootMargin:'0px 0px -24px 0px'});
    items.forEach((item,index)=>{
      const worksStart=intro.length+previews.length;
      const aboutStart=worksStart+works.length;
      const contactStart=aboutStart+about.length;
      const order=index>=contactStart?Math.min(3,index-contactStart):index>=aboutStart?index-aboutStart:index>=worksStart?Math.min(3,index-worksStart):index<intro.length?index:Math.max(0,index-intro.length-1);
      item.style.setProperty('--preview-delay',order*90+'ms');
      item.classList.add('scroll-preview');
      observer.observe(item);
    });
  } catch {
    observer?.disconnect();
    items.forEach(item=>item.classList.remove('scroll-preview'));
  }
})();
