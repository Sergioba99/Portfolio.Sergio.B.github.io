  /* ── LISTA DE PROYECTOS ────────────────────────────────────────
     Para mover un proyecto desde index.html a esta página:
       1. Quita su entrada del array PROJECTS en index.html
          y reduce el número de botones en ese archivo
       2. Añade aquí su entrada con nombre y archivo
     Formato: { name: 'Nombre corto', sub: 'Tech · Stack', file: 'projects/archivo.html' }
  ──────────────────────────────────────────────────────────────── */
/* ── LÓGICA DE RUTAS PARA OTROS PROYECTOS ── */
/**
 * ── ARQUITECTURA FRONTE-END UNIFICADA ──
 * Resuelve conflictos de rutas y duplicidad de funciones.
 */

const PROJECTS = [
    {name: "Prompt Template Library", sub: "YAML · PySide6 · SQLite", file: "projects/promptTemplateLibrary.html"},
    {name: "Fan Control", sub: "ESP32 · Arduino", file: "projects/fanControl.html"},
    {name: "RepliTal Avatar", sub: "Avatar IA · Presentación", file: "projects/replitalAvatar.html"},
    {name: "Chatbot del portfolio", sub: "Chatbase · Integración web", file: "projects/chatbotPortfolio.html"},
];

const ASSET_VERSION = '20260415';
const FETCH_CACHE = new Map();
let loadToken = 0;

// 1. Detección Automática de Entorno
const isGitHub = window.location.hostname.includes('github.io');
const REPO_NAME = isGitHub ? '/' + window.location.pathname.split('/')[1] : '';
const isInSubfolder = window.location.pathname.includes('/html/');

const BASE = window.location.origin + REPO_NAME;

/**
 * Normaliza las URLs dinámicamente según la ubicación del archivo.
 */
function getSmartPath(path) {
    if (/^(https?:|mailto:|tel:|sms:|whatsapp:|ftp:|data:)/i.test(path) || path.startsWith('#')) return path;
    
    // Si estamos en /html/ y queremos algo en /projects/, subimos un nivel
    if (isInSubfolder && path.startsWith('projects/')) {
        return `../${path}`;
    }
    return path;
}

/**
 * Fetch con gestión de caché y control de errores.
 */
async function fetchTextCached(url) {
    const finalUrl = getSmartPath(url);
    if (FETCH_CACHE.has(finalUrl)) return FETCH_CACHE.get(finalUrl);
    
    const response = await fetch(`${finalUrl}?v=${ASSET_VERSION}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${finalUrl}`);
    
    const text = await response.text();
    FETCH_CACHE.set(finalUrl, text);
    return text;
}

/**
 * Carga componentes (Nav/Footer) y corrige sus enlaces internos.
 */
/**
 * Carga componentes (Nav/Footer) y corrige sus enlaces internos.
 * Versión con Interceptor de Anclajes para navegación entre páginas.
 */
async function loadComponent(id, url) {
    const el = document.getElementById(id);
    if (!el) return;

    try {
        const rawText = await fetchTextCached(url);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = rawText;

        tempDiv.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;

            // RESOLUCIÓN DE NAVEGACIÓN LIMPIA
            if (href.startsWith('#')) {
                // Usamos la constante BASE que ya tienes definida.
                // Si BASE es 'repo', esto genera 'repo/#hero' en lugar de 'repo/index.html#hero'
                link.href = `${BASE}/${href}`;
            } 
            else if (!/^(https?:|mailto:|tel:|sms:|whatsapp:|ftp:|data:)/i.test(href)) {
                const cleanHref = href.startsWith('/') ? href.slice(1) : href;
                link.href = `${BASE}/${cleanHref}`;
            }
        });

        el.innerHTML = tempDiv.innerHTML;
        if (id === 'main-nav') {
            initNavigation();
            highlightActiveNavLinks();
        }
    } catch (err) {
        console.error(`[Error] loadComponent (${id}):`, err);
    }
}

/**
 * Carga el proyecto seleccionado en el visor.
 */
async function opLoad(index) {
    if (!PROJECTS[index] || !viewer) return;
    if (index === currentIndex && !viewer.querySelector('.op-loading')) return;

    const token = ++loadToken;
    currentIndex = index;
    
    viewer.innerHTML = '<div class="op-loading">Cargando contenido...</div>';
    
    try {
        const html = await fetchTextCached(PROJECTS[index].file);
        if (token !== loadToken) return;
        viewer.innerHTML = html;
        
        window.ProjectVideo?.init(viewer);
        window.ProjectCarousel?.init(viewer);
        
        updateControls();
        viewer.classList.add('op-fade');
    } catch (err) {
        if (token !== loadToken) return;
        viewer.innerHTML = '<div class="op-error">No se pudo cargar el proyecto.</div>';
    }
}

// A partir de aquí, mantén tus funciones de Sidebar y Carrusel (SIN duplicar loadComponent ni opLoad)

function highlightActiveNavLinks() {
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-links a').forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        link.classList.remove('active');
        link.removeAttribute('aria-current');

        const url = new URL(href, window.location.origin);
        if (url.pathname.replace(/\/+$/, '') === currentPath.replace(/\/+$/, '')) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });
}


let currentIndex = 0;
const viewer = document.getElementById('op-viewer');
const sideList = document.getElementById('op-sidebar-list');
const sideToggle = document.getElementById('op-sidebar-toggle');
const sideBackdrop = document.getElementById('op-sidebar-backdrop');
const counter = document.getElementById('op-counter');
const prevBtn = document.getElementById('op-prev');
const nextBtn = document.getElementById('op-next');

/* AQUÍ COMIENZA TU FUNCIÓN setSidebarOpen(open) ... NO TOCAR HACIA ABAJO */

  function setSidebarOpen(open) {
    document.body.classList.toggle('op-sidebar-open', open);
    if (sideToggle) {
      sideToggle.setAttribute('aria-expanded', String(open));
    }
    if (sideBackdrop) {
      sideBackdrop.hidden = !open;
    }
  }

  function toggleSidebar() {
    setSidebarOpen(!document.body.classList.contains('op-sidebar-open'));
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  function buildSidebar() {
    sideList.innerHTML = '';
    if (PROJECTS.length === 0) {
      sideList.innerHTML = '<p style="font-size:13px;color:var(--border);">Sin proyectos todavía.</p>';
      return;
    }
    PROJECTS.forEach((p, i) => {
      const btn = document.createElement('button');
      btn.className = 'op-sidebar-item' + (i === 0 ? ' active' : '');
      btn.setAttribute('aria-pressed', String(i === 0));
      btn.innerHTML = `<span class="op-sidebar-name">${p.name}</span>
                       <span class="op-sidebar-sub">${p.sub}</span>`;
      btn.onclick = () => opLoad(i);
      sideList.appendChild(btn);
    });
  }

  function updateControls() {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === PROJECTS.length - 1;
    counter.textContent = PROJECTS.length > 0
      ? `${currentIndex + 1} / ${PROJECTS.length}`
      : '';
    document.querySelectorAll('.op-sidebar-item').forEach((el, i) => {
      const isActive = i === currentIndex;
      el.classList.toggle('active', isActive);
      el.setAttribute('aria-pressed', String(isActive));
    });
  }

  function opNavigate(dir) {
    const next = currentIndex + dir;
    if (next >= 0 && next < PROJECTS.length) opLoad(next);
  }

  document.addEventListener('keydown', e => {
    if (document.body.classList.contains('op-sidebar-open') && e.key === 'Escape') {
      closeSidebar();
      return;
    }
    if (isLightboxOpen()) return;
    if (e.key === 'ArrowLeft')  opNavigate(-1);
    if (e.key === 'ArrowRight') opNavigate(1);
  });

  if (sideToggle) {
    sideToggle.addEventListener('click', toggleSidebar);
  }
  if (sideBackdrop) {
    sideBackdrop.addEventListener('click', closeSidebar);
  }
  window.addEventListener('resize', () => {
    if (window.innerWidth > 700) {
      closeSidebar();
    }
  });

  function isLightboxOpen() {
    const lightbox = document.getElementById('image-lightbox');
    return !!lightbox && lightbox.classList.contains('open');
  }

  // Inicializar
/* ── INICIALIZACIÓN COMPLETA ── */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Construir la estructura del índice lateral inmediatamente
    buildSidebar(); 

    // 2. Determinar rutas de componentes (Nav/Footer)
    // Si BASE existe (GitHub), usa ruta absoluta. Si no (Local), sube un nivel.
    const navPath = BASE ? `${BASE}/html/navigation.html` : '../html/navigation.html';
    const footerPath = BASE ? `${BASE}/html/footer.html` : '../html/footer.html';

    // 3. Cargar Navegación y Footer
    // Usamos una versión simplificada de carga para asegurar que no bloquee el resto
    loadComponent('main-nav', navPath);
    loadComponent('main-footer', footerPath);

    // 4. Cargar el primer proyecto automáticamente al entrar
    // Lo envolvemos en un pequeño timeout para que el navegador respire
    window.requestAnimationFrame(() => opLoad(0));
});

  /* ── CARGAR COMPONENTES ── */
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
