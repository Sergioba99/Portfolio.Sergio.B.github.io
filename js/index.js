/* ── CONFIGURACIÓN GLOBAL UNIFICADA (Migrado de otrosProyectos.js) ── */
const ASSET_VERSION = '20260415';
const isGitHub = window.location.hostname.includes('github.io');
const REPO_NAME = isGitHub ? '/' + window.location.pathname.split('/')[1] : '';

// Tu solución estratégica para la base
const PROJECT_BASE = (window.location.origin + REPO_NAME).replace(/\/+$/, '');

/**
 * Resuelve rutas de forma absoluta para evitar ambigüedad entre carpetas.
 */
function resolveUrl(path) {
    if (path.startsWith('http') || path.startsWith('#')) return path;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${PROJECT_BASE}/${cleanPath}`;
}

/**
 * Carga de componentes con normalización de enlaces integrada.
*/
async function loadComponent(id, url) {
    const el = document.getElementById(id);
    if (!el) return;

    try {
        // Usamos resolveUrl para encontrar el archivo HTML
        const response = await fetch(`${resolveUrl(url)}?v=${ASSET_VERSION}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const html = await response.text();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Corrección de enlaces para que siempre apunten a la raíz del proyecto
        tempDiv.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            if (href) {
                // Caso especial: Logo o volver al inicio limpio
                if (href === '/' || href === 'index.html') {
                    link.href = PROJECT_BASE + '/';
                } else {
                    link.href = resolveUrl(href);
                }
            }
        });

        el.innerHTML = tempDiv.innerHTML;
        if (id === 'main-nav') initNavigation();
        
    } catch (err) {
        console.error(`[Fallo Crítico] No se pudo cargar ${id}:`, err);
    }
}

// Inicialización única y limpia
document.addEventListener('DOMContentLoaded', () => {
    loadComponent('main-nav', 'html/navigation.html');
    loadComponent('main-footer', 'html/footer.html');
    highlightActiveLink();
});


/* ── LÓGICA DE NAVEGACIÓN ── */

function initNavigation() {
    const nav = document.getElementById('main-nav');
    if (!nav || nav.dataset.initialized === 'true') return;

    const toggle = nav.querySelector('.nav-toggle');
    const links = nav.querySelector('.nav-links');
    if (!toggle || !links) return;

    // --- Lógica de Toggle (Ahora es la misma que antes, pero ahora está en el contexto correcto) ---
    toggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('nav-open');
        toggle.setAttribute('aria-expanded', isOpen);
    });

    // Delegación de eventos para cerrar menú y manejar scroll suave
    links.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            nav.classList.remove('nav-open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });

    nav.dataset.initialized = 'true';
}

function highlightActiveLink() {
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') && currentPath.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });
}

// --- End of migrated code ---