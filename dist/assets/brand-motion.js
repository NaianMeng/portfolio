// Header-only animation. The existing home link and menu retain their handlers.
(()=>{
 const svg=document.querySelector('.site-brand .brand-hypercube');if(!svg)return;
 const lines=[...svg.querySelectorAll('.brand-edges line')],polygons=[...svg.querySelectorAll('.brand-core polygon')];
 const vertices=Array.from({length:16},(_,i)=>Array.from({length:3},(_,a)=>(i&(1<<a)?1:-1)*(i<8?1:.43)));
 const edges=[];for(let i=0;i<16;i++)for(let a=0;a<3;a++){const j=(i&8)|((i&7)^(1<<a));if(i<j)edges.push([i,j]);}for(let i=0;i<8;i++)edges.push([i,i+8]);
 const faces=[[8,9,11,10],[12,14,15,13],[8,12,13,9],[10,11,15,14],[8,10,14,12],[9,13,15,11]];
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');let angle=.48,frame=null,last=null,lastDraw=0;
 function draw(){const points=vertices.map(([x,y,z])=>{const c=Math.cos(angle),s=Math.sin(angle);[x,z]=[x*c+z*s,-x*s+z*c];const tilt=-.3;[y,z]=[y*Math.cos(tilt)-z*Math.sin(tilt),y*Math.sin(tilt)+z*Math.cos(tilt)];const d=5/(5-z);return{x:50+x*27*d,y:50+y*27*d,z};});
  // One opaque silhouette avoids hairline seams between red cube faces.
  const inner=points.slice(8).sort((a,b)=>a.x-b.x||a.y-b.y);
  const cross=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);
  const lower=[],upper=[];
  for(const p of inner){while(lower.length>=2&&cross(lower[lower.length-2],lower[lower.length-1],p)<=0)lower.pop();lower.push(p);}
  for(const p of [...inner].reverse()){while(upper.length>=2&&cross(upper[upper.length-2],upper[upper.length-1],p)<=0)upper.pop();upper.push(p);}
  const hull=lower.slice(0,-1).concat(upper.slice(0,-1));
  polygons[0].setAttribute('points',hull.map(p=>p.x.toFixed(3)+','+p.y.toFixed(3)).join(' '));polygons[0].setAttribute('fill','#751c19');polygons[0].setAttribute('fill-opacity','1');polygons.slice(1).forEach(p=>p.setAttribute('display','none'));
  edges.forEach(([a,b],i)=>{const line=lines[i];line.setAttribute('x1',points[a].x.toFixed(3));line.setAttribute('y1',points[a].y.toFixed(3));line.setAttribute('x2',points[b].x.toFixed(3));line.setAttribute('y2',points[b].y.toFixed(3));line.setAttribute('opacity',i>=24?'.6':'.9');});
 }
 function active(){return !document.hidden&&!reduced.matches&&!document.body.classList.contains('header-hidden');}
 function stop(){if(frame!==null)cancelAnimationFrame(frame);frame=null;last=null;}
 function tick(now){frame=null;if(!active()){last=null;return;}if(last!==null)angle=(angle+Math.min((now-last)/1000,.1)*Math.PI/45)%(Math.PI*2);last=now;if(now-lastDraw>=1000/60){draw();lastDraw=now;}frame=requestAnimationFrame(tick);}
 function sync(){if(active()){if(frame===null){last=null;frame=requestAnimationFrame(tick);}}else stop();}
 draw();sync();document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
})();
