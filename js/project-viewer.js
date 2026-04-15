(function () {
  const ASSET_VERSION = '20260415';
  const FETCH_CACHE = new Map();

  const PROJECTS = [
    'projects/tfg.html',
    'projects/replital.html',
    'projects/fuzzyLibrary.html',
    'projects/TransportMe.html',
    'projects/DS3SaveBackup.html'
  ];
  const OTHER_PROJECTS_URL = '/Portfolio.Sergio.B.github.io/html/otros-proyectos.html';

  let currentIndex = 0;
  let nextButtonMode = 'project';

  const viewer = document.getElementById('pv-viewer');
  const btns = document.querySelectorAll('.pv-btn');
  const prevBtn = document.getElementById('pv-prev');
  const nextBtn = document.getElementById('pv-next');

  function handlePrevClick() {
    navigateProject(-1);
  }

  function handleNextClick() {
    if (nextButtonMode === 'more') {
      goToOtherProjects();
      return;
    }
    navigateProject(1);
  }

  if (prevBtn) prevBtn.addEventListener('click', handlePrevClick);
  if (nextBtn) nextBtn.addEventListener('click', handleNextClick);
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const index = Number(btn.dataset.projectIndex);
      if (Number.isInteger(index)) loadProject(index);
    });
  });

  function updateControls() {
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (!nextBtn) return;
    const isLast = currentIndex === PROJECTS.length - 1;
    nextButtonMode = isLast ? 'more' : 'project';
    nextBtn.disabled = false;
    nextBtn.classList.toggle('pv-more-link', isLast);
    nextBtn.textContent = isLast ? 'Más proyectos' : '›';
    nextBtn.setAttribute('aria-label', isLast ? 'Más proyectos' : 'Proyecto siguiente');
    nextBtn.title = isLast ? 'Más proyectos' : 'Proyecto siguiente';
  }

  function loadProject(index) {
    currentIndex = index;
    btns.forEach((b, i) => b.classList.toggle('active', i === index));
    updateControls();
    closeLightbox();
    if (viewer) viewer.innerHTML = '<div class="pv-loading">Cargando...</div>';
    fetchTextCached(`${PROJECTS[index]}?v=${ASSET_VERSION}`)
      .then(html => {
        if (!viewer) return;
        viewer.innerHTML = html;
        window.ProjectVideo?.init(viewer);
        viewer.classList.remove('pv-fade');
        void viewer.offsetWidth;
        viewer.classList.add('pv-fade');
        window.ProjectCarousel?.init(viewer);
      })
      .catch(() => {
        if (viewer) viewer.innerHTML = '<div class="pv-loading">No se pudo cargar el proyecto.</div>';
      });
  }

  function preloadProjectFragments() {
    PROJECTS.forEach((project, i) => {
      if (i === currentIndex) return;
      fetchTextCached(`${project}?v=${ASSET_VERSION}`).catch(() => {});
    });
  }

  function navigateProject(dir) {
    const next = currentIndex + dir;
    if (next >= 0 && next < PROJECTS.length) {
      loadProject(next);
      return;
    }
    if (dir > 0 && currentIndex === PROJECTS.length - 1) {
      goToOtherProjects();
    }
  }

  function goToOtherProjects() {
    window.location.href = OTHER_PROJECTS_URL;
  }

  function fetchTextCached(url) {
    if (FETCH_CACHE.has(url)) return FETCH_CACHE.get(url);
    const promise = fetch(url).then(res => {
      if (!res.ok) throw new Error('No encontrado');
      return res.text();
    });
    FETCH_CACHE.set(url, promise);
    promise.catch(() => FETCH_CACHE.delete(url));
    return promise;
  }

  // Compatibilidad con fragmentos o handlers antiguos.
  window.loadProject = loadProject;
  window.navigateProject = navigateProject;
  window.goToOtherProjects = goToOtherProjects;

  function init() {
    loadProject(0);
    preloadProjectFragments();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
