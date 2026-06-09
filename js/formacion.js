const COURSES = [
    {
        title: "Make Intermediate",
        platform: "Make Academy",
        image: "media/images/make/make-intermediate.png",
        pdf: "media/pdf/certificates/MakeCertificate.pdf",
        externo: "https://www.credly.com/badges/bc188295-795e-40bb-808c-9388b8138b32/public_url"
    },
    {
        title: "Claude Code in Action",
        platform: "Anthropic Academy",
        image: "media/images/anthropic/claudeCodeInAction.svg",
        pdf: "media/pdf/certificates/claudeCodeCertificate.pdf",
        externo: "https://verify.skilljar.com/c/egfgpou5awsn"
    },
    {
        title: "Introduction to Claude Cowork",
        platform: "Anthropic Academy",
        image: "media/images/anthropic/introduccionClaudeCowork.png",
        pdf: "media/pdf/certificates/introductionClaudeCowork.pdf",
        externo: "https://verify.skilljar.com/c/mfjrs68xtq48"
    },   
    
];

/**
 * Comprueba si el ancho total de las tarjetas desborda el contenedor visible
 * y activa o desactiva las flechas de navegación.
 */
function updateCarouselNavigation() {
    const grid = document.getElementById('courses-grid');
    const prevBtn = document.getElementById('course-prev');
    const nextBtn = document.getElementById('course-next');

    if (!grid || !prevBtn || !nextBtn) return;

    // En móvil/tablet pequeña no queremos flechas nunca
    if (window.innerWidth <= 1024) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        return;
    }

    const maxScroll = Math.max(0, grid.scrollWidth - grid.clientWidth);
    const scrollLeft = Math.ceil(grid.scrollLeft);

    const tolerance = 4;

    const hasOverflow = maxScroll > tolerance;

    if (!hasOverflow) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        return;
    }

    prevBtn.style.display = scrollLeft > tolerance ? 'flex' : 'none';

    nextBtn.style.display =
        scrollLeft < (maxScroll - tolerance) ? 'flex' : 'none';
}

function setupDots() {
    const grid = document.getElementById('courses-grid');
    const container = document.querySelector('.carousel-container');
    const oldDots = document.querySelector('.carousel-dots');
    if (oldDots) oldDots.remove();

    if (!grid || !container || window.innerWidth > 1024) return;

    const cards = grid.querySelectorAll('.course-card');
    if (cards.length === 0) return;

    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'carousel-dots';
    
    // Creamos exactamente un punto por cada tarjeta
    cards.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = `dot ${i === 0 ? 'active' : ''}`;
        dot.onclick = () => {
            // Centramos la tarjeta correspondiente
            cards[i].scrollIntoView({ 
                behavior: 'smooth', 
                inline: 'center', 
                block: 'nearest' 
            });
        };
        dotsContainer.appendChild(dot);
    });

    container.after(dotsContainer);
}

function updateActiveDot() {
    const grid = document.getElementById('courses-grid');
    const dots = document.querySelectorAll('.dot');
    const cards = grid.querySelectorAll('.course-card');
    if (!grid || dots.length === 0 || cards.length === 0) return;

    // Buscamos qué tarjeta está más cerca del centro visual del contenedor
    const containerCenter = grid.scrollLeft + (grid.offsetWidth / 2);
    
    let activeIndex = 0;
    let minDistance = Infinity;

    cards.forEach((card, index) => {
        // Calculamos el centro de la tarjeta respecto al inicio del grid
        const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
        const distance = Math.abs(containerCenter - cardCenter);
        
        if (distance < minDistance) {
            minDistance = distance;
            activeIndex = index;
        }
    });

    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === activeIndex);
    });
}

// Función para quitar el difuminado al final del scroll
function updateScrollMasks() {
    const grid = document.getElementById('courses-grid');
    if (!grid) return;
    const windowEl = grid.parentElement; // .courses-window
    if (!windowEl) return;

    // 1. Detectar si hay scroll a la izquierda
    const hasScrollLeft = grid.scrollLeft > 10;
    
    // 2. Detectar si hay scroll a la derecha
    const hasScrollRight = grid.scrollLeft + grid.clientWidth < grid.scrollWidth - 10;

    // Si estamos en PC (>1024px) normalmente no queremos máscara si no hay scroll activo
    if (window.innerWidth > 1024 && !hasScrollLeft && !hasScrollRight) {
        windowEl.style.webkitMaskImage = 'none';
        windowEl.style.maskImage = 'none';
        return;
    }

    if (!hasScrollLeft && !hasScrollRight) {
    windowEl.style.webkitMaskImage = 'none';
    windowEl.style.maskImage = 'none';
    return;
}

    // Aplicamos el degradado dinámico mediante variables
    // Si no hay scroll a la izquierda, el negro empieza en 0% (sin transparencia)
    // Si hay scroll, el negro empieza más adelante para dejar el borde transparente
    const leftStop = hasScrollLeft ? 'black 10%' : 'black 0%';
    const rightStop = hasScrollRight ? 'black 90%' : 'black 100%';

    const mask = `linear-gradient(to right, transparent 0%, ${leftStop}, ${rightStop}, transparent 100%)`;
    
    windowEl.style.webkitMaskImage = mask;
    windowEl.style.maskImage = mask;
}

// Asegúrate de añadir los listeners
const grid = document.getElementById('courses-grid');
if (grid) {
    grid.addEventListener('scroll', updateScrollMasks);
    grid.addEventListener('scroll', updateActiveDot);
}
window.addEventListener('resize', updateScrollMasks);

function renderCourses() {
    const grid = document.getElementById('courses-grid');
    const prevBtn = document.getElementById('course-prev');
    const nextBtn = document.getElementById('course-next');
    
    if (!grid) return;

    // 1. Renderizar tarjetas
    grid.innerHTML = COURSES.map(course => {
        const pdfBtn = course.pdf ? `<a href="${course.pdf}" target="_blank" rel="noopener noreferrer" class="btn-course">Ver PDF</a>` : '';
        const externoBtn = course.externo ? `<a href="${course.externo}" target="_blank" rel="noopener noreferrer" class="btn-course">Ver Credencial</a>` : '';

        return `
            <article class="course-card">
                <div class="course-image">
                    <img src="${course.image}" alt="Certificado de ${course.title}">
                </div>
                <div class="course-content">
                    <h3>${course.title}</h3>
                    <p>${course.platform}</p>
                    <div class="course-actions">${pdfBtn}${externoBtn}</div>
                </div>
            </article>
        `;
    }).join('');

    // 2. Ejecutar lógica de navegación inicial
    // Usamos un pequeño timeout para asegurar que el DOM ha calculado los anchos correctamente
    setTimeout(updateCarouselNavigation, 10);

    // 3. Configurar eventos de clic
    const getScrollAmount = () => {
        const card = grid.querySelector('.course-card');
        const gap = parseInt(window.getComputedStyle(grid).gap) || 32;
        return card.offsetWidth + gap;
    };

    if (nextBtn) {
        nextBtn.onclick = () => {
            grid.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
        };
    }

    if (prevBtn) {
        prevBtn.onclick = () => {
            grid.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
        };
    }

    setupDots();
    window.addEventListener('resize', () => {
        setupDots();
        updateCarouselNavigation();
    });
}

// Eventos de carga y cambio de tamaño
document.addEventListener('DOMContentLoaded', renderCourses);
window.addEventListener('resize', updateCarouselNavigation);
// Ejecutar una vez al cargar
updateScrollMasks();
