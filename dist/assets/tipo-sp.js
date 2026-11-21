(() => {
  const page = document.getElementById('tipo-sp-page');
  const videos = [...page.querySelectorAll('video')];
  const loops = videos.filter(video => video.hasAttribute('data-tsp-loop'));
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const visible = new Set();
  let active = false;

  function updateLoops() {
    for (const video of loops) {
      if (active && !document.hidden && !reducedMotion.matches && visible.has(video)) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
  }

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    updateLoops();
  }, { threshold: .2 });

  for (const video of loops) {
    video.muted = true;
    observer.observe(video);
  }

  function updateRoute(target) {
    active = target === 'project/tipo-sp';
    document.body.classList.toggle('tipo-sp-active', active);
    page.hidden = !active;
    if (!active) videos.forEach(video => video.pause());
    else updateLoops();
  }

  reducedMotion.addEventListener('change', updateLoops);
  document.addEventListener('visibilitychange', updateLoops);
  window.addEventListener('portfolio:route', event => updateRoute(event.detail));
  updateRoute(location.hash.slice(1));
})();
