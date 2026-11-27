function setupProjectViewer(section) {
 const data = section.dataset;
 const button = section.querySelector('button');
 const stage = section.querySelector('.cp-model-stage');
 const status = section.querySelector('.cp-model-status');

 function showRender() {
  const poster = new Image();
  poster.src = data.poster;
  poster.alt = data.posterAlt;
  stage.classList.remove('is-loading');
  stage.replaceChildren(poster);
  stage.hidden = false;
  button.disabled = false;
  status.textContent = 'O modelo 3D não pôde ser exibido. Veja a imagem de referência.';
 }

 button.addEventListener('click', async () => {
  button.disabled = true;
  status.textContent = '';
  stage.hidden = false;
  stage.classList.add('is-loading');
  const loading = document.createElement('p');
  loading.className = 'cp-model-loading';
  loading.setAttribute('role', 'status');
  stage.replaceChildren(loading);
  loading.textContent = 'Carregando o modelo 3D…';

  try {
   const context = document.createElement('canvas').getContext('webgl2');
   if (!context) {
    showRender();
    return;
   }
   context.getExtension('WEBGL_lose_context')?.loseContext();
   await import('./vendor/model-viewer-4.1.0.min.js');
   const viewer = customElements.get('model-viewer');
   if (data.meshopt === 'true') viewer.meshoptDecoderLocation = new URL('assets/vendor/meshopt-decoder-0.24.0.js', document.baseURI).href;
   const model = document.createElement('model-viewer');
   if (!('cameraOrbit' in model)) throw new Error('Visualizador indisponível');

   model.setAttribute('alt', data.modelAlt);
   model.setAttribute('aria-describedby', section.querySelector(".cp-explore-help").id);
   model.setAttribute('camera-controls', '');
   model.setAttribute('touch-action', 'pan-y');
   model.setAttribute('interaction-prompt', 'none');
   model.setAttribute('camera-orbit', data.orbit);
   model.setAttribute('environment-image', data.environment || 'neutral');
   model.setAttribute('tone-mapping', data.toneMapping || 'aces');
   model.setAttribute('shadow-intensity', '0.5');
   model.setAttribute('exposure', data.exposure || '1.05');
   model.setAttribute('loading', 'eager');
   model.addEventListener('load', () => {
    stage.classList.remove('is-loading');
    loading.remove();
    status.textContent = 'Modelo 3D carregado.';
    model.focus();
    button.hidden = true;
   }, {once: true});
   model.addEventListener('error', showRender, {once: true});
   stage.append(model);
   model.src = data.projectModel;
  } catch {
   showRender();
  }
 });
}

document.querySelectorAll("[data-project-model]").forEach(setupProjectViewer);
