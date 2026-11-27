(() => {
  const template = document.getElementById('terras-de-agua-template');
  let page;
  let videos = [];

  function show(route) {
    const active = route === 'project/terras-de-agua';
    if (active && !page) {
      page = template.content.firstElementChild.cloneNode(true);
      template.after(page);
      videos = [...page.querySelectorAll('video')];
      page.addEventListener('play', event => {
        for (const video of videos) {
          if (video !== event.target) video.pause();
        }
      }, true);
    }

    document.body.classList.toggle('terras-de-agua-active', active);
    if (!page) return;
    page.hidden = !active;
    if (!active) videos.forEach(video => video.pause());
  }

  window.addEventListener('portfolio:route', event => show(event.detail));
  show(location.hash.slice(1));
})();
