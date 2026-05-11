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

    // 1. Si es móvil o tablet (<= 1024), ocultamos flechas siempre
    if (window.innerWidth <= 1024) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        return;
    }

    const card = grid.querySelector('.course-card');
    if (!card) return;

    // 2. Medición precisa
    const style = window.getComputedStyle(grid);
    const gap = parseInt(style.gap) || 32;
    const cardWidth = card.offsetWidth;
    
    // Ancho total que ocuparían todas las tarjetas juntas
    const totalContentWidth = (cardWidth * COURSES.length) + (gap * (COURSES.length - 1));
    
    // Ancho del contenedor donde viven las tarjetas
    const containerWidth = grid.parentElement.offsetWidth;

    // 3. Lógica de activación (añadimos un margen de error de 10px)
    // Si el contenido mide casi lo mismo o más que el contenedor, ponemos flechas
    if (totalContentWidth > (containerWidth - 10)) {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
        grid.style.justifyContent = 'flex-start';
    } else {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        // Si caben de sobra, los centramos para que no quede hueco a la derecha
        grid.style.justifyContent = 'flex-start';
    }
}

// Función para quitar el difuminado al final del scroll
function handleScrollEffects() {
    const grid = document.getElementById('courses-grid');
    const windowEl = grid.parentElement; // .courses-window
    
    if (!grid || !windowEl) return;

    // Detectamos si el usuario llegó al final (con un margen de 15px)
    const isAtEnd = grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 15;

    if (isAtEnd) {
        windowEl.style.maskImage = 'none';
        windowEl.style.webkitMaskImage = 'none';
    } else {
        // Volvemos a poner el degradado si no estamos al final (solo en móvil/tablet)
        if (window.innerWidth <= 1024) {
            const mask = 'linear-gradient(to right, black 0%, black 85%, transparent 100%)';
            windowEl.style.maskImage = mask;
            windowEl.style.webkitMaskImage = mask;
        }
    }
}

// Escuchamos el scroll del grid
document.getElementById('courses-grid').addEventListener('scroll', handleScrollEffects);

function renderCourses() {
    const grid = document.getElementById('courses-grid');
    const prevBtn = document.getElementById('course-prev');
    const nextBtn = document.getElementById('course-next');
    
    if (!grid) return;

    // 1. Renderizar tarjetas
    grid.innerHTML = COURSES.map(course => {
        const pdfBtn = course.pdf ? `<a href="${course.pdf}" target="_blank" class="btn-course">Ver PDF</a>` : '';
        const externoBtn = course.externo ? `<a href="${course.externo}" target="_blank" class="btn-course">Ver Credencial</a>` : '';

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
}

// Eventos de carga y cambio de tamaño
document.addEventListener('DOMContentLoaded', renderCourses);
window.addEventListener('resize', updateCarouselNavigation);