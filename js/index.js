const ASSET_VERSION = '20260415';
const FETCH_CACHE = new Map();

function initNavigation() {
  const nav = document.getElementById('main-nav');
  if (!nav || nav.dataset.initialized === 'true') return;

  const toggle = nav.querySelector('.nav-toggle');
  const links = nav.querySelector('.nav-links');
  if (!toggle || !links) return;

  const closeMenu = () => {
    nav.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', event => {
    if (!nav.classList.contains('nav-open')) return;
    if (!nav.contains(event.target)) closeMenu();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 640) closeMenu();
  });

  nav.dataset.initialized = 'true';
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

async function loadComponent(id, url) {
  const el = document.getElementById(id);
  if (!el) return;
  try {
    el.innerHTML = await fetchTextCached(url);
    if (id === 'main-nav') initNavigation();
  } catch (err) {
    console.error('Error cargando componente', id, err);
  }
}

loadComponent('main-nav', `/Portfolio.Sergio.B.github.io/html/navigation.html?v=${ASSET_VERSION}`);
loadComponent('main-footer', `/Portfolio.Sergio.B.github.io/html/footer.html?v=${ASSET_VERSION}`);
