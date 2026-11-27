(() => {
  const page = document.getElementById('design-20-anos-page');
  const videos = [...page.querySelectorAll('video')];

  function updateRoute(target) {
    const active = target === 'project/design-20-anos';
    document.body.classList.toggle('design-20-anos-active', active);
    page.hidden = !active;
    if (!active) videos.forEach(video => video.pause());
  }

  page.addEventListener('play', event => {
    if (event.target.paused) return;
    for (const video of videos) {
      if (video !== event.target) video.pause();
    }
  }, true);

  window.addEventListener('portfolio:route', event => updateRoute(event.detail));
  updateRoute(location.hash.slice(1));
})();
