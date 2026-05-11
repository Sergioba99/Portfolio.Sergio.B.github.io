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
    }
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

    // ACTUALIZADO: Ahora el límite es 1024px
    if (window.innerWidth <= 1024) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        return;
    }

    const card = grid.querySelector('.course-card');
    if (!card) return;

    const style = window.getComputedStyle(grid);
    const gap = parseInt(style.gap) || 32;
    const cardFullWidth = card.offsetWidth + gap;
    const totalContentWidth = (cardFullWidth * COURSES.length) - gap;
    const windowWidth = grid.parentElement.offsetWidth;

    // Lógica de desborde para escritorio (> 1024px)
    if (totalContentWidth > windowWidth) {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
        grid.style.justifyContent = 'flex-start';
    } else {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        grid.style.justifyContent = 'center';
    }
}

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