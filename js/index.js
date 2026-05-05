/* ── CONFIGURACIÓN GLOBAL ── */
const ASSET_VERSION = '20260415';
const isGitHub = window.location.hostname.includes('github.io');
const REPO_NAME = isGitHub ? '/' + window.location.pathname.split('/')[1] : '';

/**
 * Normaliza rutas para que funcionen en Local y GitHub Pages.
 * Si detecta que estamos en la carpeta /html/, ajusta los enlaces.
 */
function getNormalizedPath(url) {
    if (url.startsWith('http') || url.startsWith('#')) return url;
    const isInSubfolder = window.location.pathname.includes('/html/');
    const prefix = isInSubfolder ? '../' : '';
    return `${prefix}${url}?v=${ASSET_VERSION}`;
}

async function loadComponent(id, url) {
    const el = document.getElementById(id);
    if (!el) return;

    try {
        const response = await fetch(getNormalizedPath(url));
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        let html = await response.text();

        // Corrección dinámica de enlaces dentro del componente inyectado
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        tempDiv.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;

            // RESOLUCIÓN DE NAVEGACIÓN LIMPIA
            if (href.startsWith('#')) {
                // Usamos la constante BASE que ya tienes definida.
                // Si BASE es 'repo', esto genera 'repo/#hero' en lugar de 'repo/index.html#hero'
                link.href = `${BASE}/${href}`;
            } 
            else if (!href.startsWith('http')) {
                const cleanHref = href.startsWith('/') ? href.slice(1) : href;
                link.href = `${BASE}/${cleanHref}`;
            }
            else if(href.startsWith('/')){
              link.href = `${BASE}${href}`;
            }
        });

        el.innerHTML = tempDiv.innerHTML;
        if (id === 'main-nav') initNavigation();
    } catch (err) {
        console.error(`Fallo cargando ${id}:`, err);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadComponent('main-nav', 'html/navigation.html');
    loadComponent('main-footer', 'html/footer.html');
});

/* Aquí pega tu función initNavigation() que ya tienes */

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


loadComponent('main-nav', `html/navigation.html?v=${ASSET_VERSION}`);
loadComponent('main-footer', `html/footer.html?v=${ASSET_VERSION}`);
