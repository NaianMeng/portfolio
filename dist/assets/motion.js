// Continuous rotation; pause for actual pointer interaction, not empty layout space.
(() => {
  const entries=[];
  const reduced=window.matchMedia('(prefers-reduced-motion:reduce)');
  let frame=null;
  function stop(entry){entry.frame=null;entry.start=null;entry.moving?.(false)}
  function pause(entry){stop(entry);entry.waitUntil=performance.now()+9000}
  function tick(now){
    frame=null;
    const classes=document.documentElement.classList;
    const opening=classes.contains('home-intro-active')&&!classes.contains('home-intro-revealing');
    for(const entry of entries){
      const active=document.body.dataset.route===entry.route;
      if(active!==entry.active){entry.active=active;entry.hover=false;entry.drag=false;entry.waitUntil=now;stop(entry)}
      if(!active||opening||document.hidden||reduced.matches||entry.hover||entry.drag){stop(entry);continue}
      const box=entry.element.getBoundingClientRect();
      if(box.width<=0||box.height<=0||box.bottom<=0||box.top>=window.innerHeight){stop(entry);continue}
      if(now<entry.waitUntil)continue;
      if(entry.frame===null){entry.frame=now;entry.start=now}
      const dt=Math.min(.05,Math.max(0,(now-entry.frame)/1000));
      entry.frame=now;
      const progress=Math.min(1,(now-entry.start)/1500);
      const easing=progress*progress*(3-2*progress);
      try{entry.moving?.(true);entry.apply(entry.speed*easing*dt,0)}
      catch(error){stop(entry);entry.waitUntil=now+9000;console.warn('Cube motion could not update:',entry.route,error)}
    }
    if(!document.hidden&&!reduced.matches)frame=requestAnimationFrame(tick);
  }
  function resume(){if(frame===null&&!document.hidden&&!reduced.matches)frame=requestAnimationFrame(tick)}
  function reset(){entries.forEach(entry=>{entry.hover=false;entry.drag=false;entry.active=false;entry.waitUntil=performance.now();stop(entry)})}
  window.portfolioMotion={
    svgHit(svg,group,event){
      const matrix=svg.getScreenCTM();if(!matrix)return false;
      const point=svg.createSVGPoint();point.x=event.clientX;point.y=event.clientY;
      const local=point.matrixTransform(matrix.inverse()),box=group.getBBox();
      const margin=12/Math.max(.01,Math.hypot(matrix.a,matrix.b));
      return local.x>=box.x-margin&&local.x<=box.x+box.width+margin&&local.y>=box.y-margin&&local.y<=box.y+box.height+margin;
    },
    register(config){
      const entry={...config,active:false,hover:false,drag:false,frame:null,start:null,waitUntil:0};entries.push(entry);
      const hover=event=>{
        if(entry.pauseOnHover===false||event.pointerType!=='mouse'||document.body.dataset.route!==entry.route)return;
        const inside=entry.hitTest?entry.hitTest(event):true;
        if(inside!==entry.hover){entry.hover=inside;pause(entry)}
      };
      config.element.addEventListener('pointerenter',hover);
      config.element.addEventListener('pointermove',hover);
      config.element.addEventListener('pointerleave',()=>{if(entry.hover){entry.hover=false;pause(entry)}});
      config.element.addEventListener('pointerdown',()=>{entry.drag=true;pause(entry)});
      const release=()=>{if(entry.drag){entry.drag=false;pause(entry)}};
      window.addEventListener('pointerup',release);window.addEventListener('pointercancel',release);
      config.element.addEventListener('lostpointercapture',release);
      for(const element of config.controls||[]){if(entry.pauseOnHover!==false){element.addEventListener('pointerenter',()=>{entry.hover=true;pause(entry)});element.addEventListener('pointerleave',()=>{entry.hover=false;pause(entry)})}element.addEventListener('pointerdown',()=>{entry.drag=true;pause(entry)});element.addEventListener('click',()=>pause(entry))}
      resume();
    }
  };
  document.addEventListener('visibilitychange',()=>{if(frame!==null){cancelAnimationFrame(frame);frame=null}reset();resume()});
  window.addEventListener('blur',()=>{entries.forEach(entry=>{entry.hover=false;entry.drag=false;pause(entry)})});
  reduced.addEventListener('change',()=>{if(frame!==null){cancelAnimationFrame(frame);frame=null}reset();resume()});
})();
