(() => {
  const root = document.documentElement;
  if (!root.classList.contains('home-intro-pending')) return;

  const hidePending = () => root.classList.remove('home-intro-pending');
  const brand = document.querySelector('.site-brand .brand-hypercube');
  const projection = window.portfolioBrandMotion;
  if (!brand || !projection || document.body.dataset.route !== 'home' || document.hidden) {
    hidePending();
    return;
  }

  const target = brand.getBoundingClientRect();
  if (!target.width || !target.height) {
    hidePending();
    return;
  }

  // Draw the SVG at its largest displayed size so the compositor only scales it down.
  const scale = Math.min(280, Math.min(innerWidth, innerHeight) * .48) / target.width;
  const width = target.width * scale;
  const height = target.height * scale;

  const intro = document.createElement('div');
  intro.className = 'home-intro';
  intro.setAttribute('aria-hidden', 'true');
  const backdrop = document.createElement('div');
  backdrop.className = 'home-intro-backdrop';
  const logo = projection.cloneOpeningLogo();
  logo.classList.add('home-intro-logo');
  logo.style.width = width + 'px';
  logo.style.height = height + 'px';
  const glow = parseFloat(getComputedStyle(brand).getPropertyValue('--brand-glow'));
  if (Number.isFinite(glow)) logo.style.setProperty('--brand-glow', (glow * scale) + 'px');
  const edges = logo.querySelector('.brand-edges');
  const strokeWidth = parseFloat(getComputedStyle(brand.querySelector('.brand-edges')).strokeWidth);
  edges.style.strokeWidth = (strokeWidth * scale) + 'px';
  intro.append(backdrop, logo);

  const draw = projection.createRenderer(logo);
  const core = logo.querySelector('.brand-core');
  const turnAngle = Math.PI / 2;
  document.body.append(intro);
  root.classList.add('home-intro-active');
  hidePending();

  const formation = 680;
  const turnStart = 520;
  const lift = Math.min(30, Math.abs(target.top + target.height / 2 - innerHeight / 2) * .08);
  const duration = 3040;
  const ease = progress => (1 - Math.cos(Math.PI * progress)) / 2;
  const clampProgress = value => Math.min(1, Math.max(0, value));

  const events = new AbortController();
  const options = { signal: events.signal };
  let frame;
  let startTime;
  let revealing = false;
  let aligned = false;
  function finish() {
    events.abort();
    cancelAnimationFrame(frame);
    intro.remove();
    root.classList.remove('home-intro-active', 'home-intro-revealing');
  }

  function drawFrame(now) {
    startTime ??= now;
    const time = now - startTime;
    if (aligned) {
      // The aligned frame has painted. Reveal the live SVG on this frame.
      finish();
      return;
    }
    const motion = ease(clampProgress((time - turnStart) / (duration - turnStart)));
    // Let the rotation lead the travel, with a small lift along the path to the header.
    const travel = motion ** 2.15;
    if (!revealing && travel >= .08) {
      revealing = true;
      root.classList.add('home-intro-revealing');
    }
    // The header can move during startup as its layout settles.
    const centerX = innerWidth / 2;
    const centerY = innerHeight / 2;
    const destination = brand.getBoundingClientRect();
    const destinationX = destination.left + destination.width / 2;
    const destinationY = destination.top + destination.height / 2;
    const arc = 8 * lift * travel * (1 - travel) ** 2;
    const shrink = travel ** 1.3;
    const scaleX = (destination.width / width) ** shrink;
    const scaleY = (destination.height / height) ** shrink;
    const origin = intro.getBoundingClientRect();
    const x = centerX + (destinationX - centerX) * travel - width * scaleX / 2;
    const y = centerY + (destinationY - centerY) * travel - arc - height * scaleY / 2;
    logo.style.transform = `translate(${x - origin.left}px, ${y - origin.top}px) scale(${scaleX}, ${scaleY})`;
    backdrop.style.opacity = 1 - ease(travel);
    core.style.opacity = ease(clampProgress((time - 380) / (formation - 380)));
    draw(projection.getAngle() - turnAngle * (1 - motion), clampProgress(time / formation));
    aligned = time >= duration;
    frame = requestAnimationFrame(drawFrame);
  }

  function skipAfterThreePresses() {
    let firstPress = -Infinity;
    let presses = 0;
    return event => {
      if (event.timeStamp - firstPress > 850) {
        firstPress = event.timeStamp;
        presses = 0;
      }
      if (++presses === 3) finish();
    };
  }
  const skipWithEscape = skipAfterThreePresses();
  addEventListener('portfolio:route', finish, options);
  addEventListener('keydown', event => {
    if (event.key === 'Escape' && !event.repeat) skipWithEscape(event);
  }, options);
  logo.addEventListener('click', skipAfterThreePresses(), options);
  document.addEventListener('visibilitychange', finish, options);
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', finish, options);
  drawFrame(performance.now());
})();
