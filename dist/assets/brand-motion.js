// Share the logo projection between the header and the home opening.
(()=>{
 const svg=document.querySelector('.site-brand .brand-hypercube');if(!svg)return;
 const openingLogo=svg.cloneNode(true);
 const vertices=Array.from({length:16},(_,i)=>Array.from({length:3},(_,a)=>(i&(1<<a)?1:-1)*(i<8?1:.43)));
 const edges=[];for(let i=0;i<16;i++)for(let a=0;a<3;a++){const j=(i&8)|((i&7)^(1<<a));if(i<j)edges.push([i,j]);}for(let i=0;i<8;i++)edges.push([i,i+8]);
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');let angle=.48,frame=null,last=null,lastDraw=0;
 const tiltCos=Math.cos(-.3),tiltSin=Math.sin(-.3);
 function createRenderer(target){
  const edgeGroup=target.querySelector('.brand-edges');
  const lines=[...edgeGroup.querySelectorAll('line')];
  const [core,...faces]=target.querySelectorAll('.brand-core polygon');
  core.setAttribute('fill','#751c19');
  core.setAttribute('fill-opacity','1');
  faces.forEach(face=>face.setAttribute('display','none'));
  let paths;
  return function render(angle,progress=1){
  const cos=Math.cos(angle),sin=Math.sin(angle);
  const points=vertices.map(([x,y,z])=>{[x,z]=[x*cos+z*sin,-x*sin+z*cos];[y,z]=[y*tiltCos-z*tiltSin,y*tiltSin+z*tiltCos];const d=5/(5-z);return{x:50+x*27*d,y:50+y*27*d};});
  // One opaque silhouette avoids hairline seams between red cube faces.
  const inner=points.slice(8).sort((a,b)=>a.x-b.x||a.y-b.y);
  const cross=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);
  const lower=[],upper=[];
  for(const p of inner){while(lower.length>=2&&cross(lower[lower.length-2],lower[lower.length-1],p)<=0)lower.pop();lower.push(p);}
  for(const p of [...inner].reverse()){while(upper.length>=2&&cross(upper[upper.length-2],upper[upper.length-1],p)<=0)upper.pop();upper.push(p);}
  const hull=lower.slice(0,-1).concat(upper.slice(0,-1));
  core.setAttribute('points',hull.map(p=>p.x.toFixed(3)+','+p.y.toFixed(3)).join(' '));
  if(progress===1){
   // Once formed, draw all edges as two paths with the original stroke opacities.
   if(!paths){
    paths=[.9,.6].map(opacity=>{
     const path=document.createElementNS(target.namespaceURI,'path');
     path.setAttribute('fill','none');
     path.setAttribute('opacity',String(opacity));
     path.setAttribute('vector-effect','non-scaling-stroke');
     edgeGroup.append(path);
     return path;
    });
    lines.forEach(line=>line.remove());
   }
   const coordinates=points.map(p=>p.x.toFixed(3)+','+p.y.toFixed(3));
   const segments=edges.map(([a,b])=>'M'+coordinates[a]+'L'+coordinates[b]);
   paths[0].setAttribute('d',segments.slice(0,24).join(''));
   paths[1].setAttribute('d',segments.slice(24).join(''));
   return;
  }
  edges.forEach(([a,b],i)=>{
   const line=lines[i],start=points[a],end=points[b];
   const edgeProgress=progress===1?1:Math.max(0,Math.min(1,(progress-i*.018)/.42));
   const length=edgeProgress*edgeProgress*(3-2*edgeProgress);
   line.setAttribute('x1',start.x.toFixed(3));
   line.setAttribute('y1',start.y.toFixed(3));
   line.setAttribute('x2',(start.x+(end.x-start.x)*length).toFixed(3));
   line.setAttribute('y2',(start.y+(end.y-start.y)*length).toFixed(3));
   const opacity=i>=24?.6:.9;
   line.setAttribute('opacity',String(opacity*Math.min(1,length*4)));
  });
  };
 }
 const draw=createRenderer(svg);
 window.portfolioBrandMotion={createRenderer,cloneOpeningLogo:()=>openingLogo.cloneNode(true),getAngle:()=>angle};
 function active(){return !document.hidden&&!reduced.matches&&!document.body.classList.contains('header-hidden')&&!document.documentElement.classList.contains('home-intro-active');}
 function stop(){if(frame!==null)cancelAnimationFrame(frame);frame=null;last=null;}
 function tick(now){frame=null;if(!active()){last=null;return;}if(last!==null)angle=(angle+Math.min((now-last)/1000,.1)*Math.PI/45)%(Math.PI*2);last=now;if(now-lastDraw>=1000/60-.5){draw(angle);lastDraw=now;}frame=requestAnimationFrame(tick);}
 function sync(){if(active()){if(frame===null){last=null;frame=requestAnimationFrame(tick);}}else stop();}
 draw(angle);sync();document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);const observer=new MutationObserver(sync);const classChanges={attributes:true,attributeFilter:['class']};observer.observe(document.body,classChanges);observer.observe(document.documentElement,classChanges);
})();
