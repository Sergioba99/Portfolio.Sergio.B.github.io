const ASSET_VERSION = '20260415';
const FETCH_CACHE = new Map();

// Función para obtener la base de la URL dinámicamente
// js/otrosProyectos.js (y similar en index)

function getBaseHref() {
    const isGitHub = window.location.hostname.includes('github.io');
    // Si es GitHub, extraemos el nombre del repositorio de la URL
    if (isGitHub) return '/' + window.location.pathname.split('/')[1];
    return '';
}

const BASE = getBaseHref();

async function loadComponent(id, url) {
    const el = document.getElementById(id);
    if (!el) return;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error en fetch');
        let rawText = await response.text();
        
        // NORMALIZACIÓN DE RUTAS:
        // Reemplazamos los href que empiezan con "/" por la ruta base correcta (Local o GitHub)
        const processedText = rawText.replace(/href="\/([^"]*)"/g, (match, path) => {
            return `href="${BASE}/${path}"`;
        });
        
        el.innerHTML = processedText;
        
        if (id === 'main-nav') {
            initNavigation();
            highlightActiveLink();
        }
    } catch (err) {
        console.error('Error cargando componente', id, err);
    }
}

function highlightActiveLink() {
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-item').forEach(link => {
        if (link.getAttribute('href').includes(currentPath)) {
            link.classList.add('active');
        }
    });
}

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

loadComponent('main-nav', `html/navigation.html?v=${ASSET_VERSION}`);
loadComponent('main-footer', `html/footer.html?v=${ASSET_VERSION}`);
