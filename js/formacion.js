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

function renderCourses() {
    const grid = document.getElementById('courses-grid');
    // Seleccionamos los botones directamente por su ID
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

    // 2. Lógica de visibilidad y movimiento (Límite: 4 cursos)
    if (COURSES.length >= 4) {
        // Mostramos las flechas si existen
        if (prevBtn) prevBtn.style.display = 'flex';
        if (nextBtn) nextBtn.style.display = 'flex';

        // Función para calcular el desplazamiento dinámico
        const getScrollAmount = () => {
            const card = grid.querySelector('.course-card');
            const style = window.getComputedStyle(grid);
            const gap = parseInt(style.gap) || 32; // Lee el gap real del CSS o usa 32px por defecto
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
    } else {
        // Si hay menos de 4, ocultamos las flechas por completo
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        
        // Opcional: Centrar las tarjetas si hay pocas
        //grid.style.justifyContent = 'center';
    }
}

// Asegúrate de llamar a la función cuando cargue el DOM
document.addEventListener('DOMContentLoaded', renderCourses);
