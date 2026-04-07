  /* ── LISTA DE PROYECTOS ────────────────────────────────────────
     Para mover un proyecto desde index.html a esta página:
       1. Quita su entrada del array PROJECTS en index.html
          y reduce el número de botones en ese archivo
       2. Añade aquí su entrada con nombre y archivo
     Formato: { name: 'Nombre corto', sub: 'Tech · Stack', file: 'projects/archivo.html' }
  ──────────────────────────────────────────────────────────────── */
  const ASSET_VERSION = '20260407';

  const PROJECTS = [
    // Ejemplo — descomenta y adapta cuando muevas proyectos:
    //{ name: 'TransportMe',       sub: 'Java · Spigot',      file: 'projects/TransportMe.html' },
    //{ name: 'Gestor backups DS3', sub: 'Python · Utilidad',  file: 'projects/DS3SaveBackup.html' },
    {name: "Fan Control", sub: "ESP32 · Arduino", file: "projects/fanControl.html"},
  ];

  let currentIndex = 0;
  const viewer    = document.getElementById('op-viewer');
  const sideList  = document.getElementById('op-sidebar-list');
  const counter   = document.getElementById('op-counter');
  const prevBtn   = document.getElementById('op-prev');
  const nextBtn   = document.getElementById('op-next');

  function buildSidebar() {
    sideList.innerHTML = '';
    if (PROJECTS.length === 0) {
      sideList.innerHTML = '<p style="font-size:13px;color:var(--border);">Sin proyectos todavía.</p>';
      return;
    }
    PROJECTS.forEach((p, i) => {
      const btn = document.createElement('button');
      btn.className = 'op-sidebar-item' + (i === 0 ? ' active' : '');
      btn.innerHTML = `<span class="op-sidebar-name">${p.name}</span>
                       <span class="op-sidebar-sub">${p.sub}</span>`;
      btn.onclick = () => opLoad(i);
      sideList.appendChild(btn);

      // Separador visual cada 3 elementos
      if (i < PROJECTS.length - 1 && (i + 1) % 3 === 0) {
        const div = document.createElement('div');
        div.className = 'op-sidebar-divider';
        sideList.appendChild(div);
      }
    });
  }

  function updateControls() {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === PROJECTS.length - 1;
    counter.textContent = PROJECTS.length > 0
      ? `${currentIndex + 1} / ${PROJECTS.length}`
      : '';
    document.querySelectorAll('.op-sidebar-item').forEach((el, i) => {
      el.classList.toggle('active', i === currentIndex);
    });
  }

  function opLoad(index) {
    if (PROJECTS.length === 0) {
      viewer.innerHTML = '<p class="op-empty">Aquí aparecerán los proyectos que muevas desde la página principal.</p>';
      counter.textContent = '';
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      return;
    }
    currentIndex = index;
    updateControls();
    viewer.innerHTML = '<div class="op-loading">Cargando...</div>';
    fetch(`${PROJECTS[index].file}?v=${ASSET_VERSION}`)
      .then(res => {
        if (!res.ok) throw new Error('No encontrado');
        return res.text();
      })
      .then(html => {
        viewer.innerHTML = html;
        viewer.classList.remove('op-fade');
        void viewer.offsetWidth;
        viewer.classList.add('op-fade');
        viewer.querySelectorAll('.carousel').forEach(c => initCarousel(c.id));
      })
      .catch(() => {
        viewer.innerHTML = '<div class="op-loading">No se pudo cargar el proyecto.</div>';
      });
  }

  function opNavigate(dir) {
    const next = currentIndex + dir;
    if (next >= 0 && next < PROJECTS.length) opLoad(next);
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  opNavigate(-1);
    if (e.key === 'ArrowRight') opNavigate(1);
  });

  /* ── CARRUSEL ── */
  function initCarousel(id) {
    const carousel = document.getElementById(id);
    if (!carousel) return;
    const slides = carousel.querySelectorAll('.carousel-slide');
    const dotsContainer = document.getElementById('dots-' + id);
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    if (slides.length === 0) {
      carousel.querySelector('.carousel-track').innerHTML =
        '<div class="carousel-empty">Sin imágenes todavía</div>';
      carousel.querySelector('.prev').style.display = 'none';
      carousel.querySelector('.next').style.display = 'none';
      return;
    }
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.onclick = () => goToSlide(id, i);
      dotsContainer.appendChild(dot);
    });
    if (slides.length === 1) {
      carousel.querySelector('.prev').style.display = 'none';
      carousel.querySelector('.next').style.display = 'none';
    }
  }

  function moveCarousel(id, dir) {
    const slides = document.querySelectorAll('#' + id + ' .carousel-slide');
    const current = getCurrentSlide(id, slides.length);
    goToSlide(id, (current + dir + slides.length) % slides.length);
  }

  function getCurrentSlide(id, total) {
    const track = document.querySelector('#' + id + ' .carousel-track');
    const val = track.style.transform || 'translateX(0%)';
    const match = val.match(/-?([\d.]+)%/);
    if (!match) return 0;
    return Math.round(parseFloat(match[1]) / 100) % total;
  }

  function goToSlide(id, index) {
    const carousel = document.getElementById(id);
    const dots = carousel.querySelectorAll('.carousel-dot');
    carousel.querySelector('.carousel-track').style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }

  // Inicializar
  buildSidebar();
  opLoad(0);

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

  async function loadComponent(id, url) {
    const el = document.getElementById(id);
    if (!el) return;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('No encontrado');
      el.innerHTML = await res.text();
      if (id === 'main-nav') initNavigation();
    } catch (err) {
      console.error('Error cargando componente', id, err);
    }
  }
loadComponent('main-nav', `/Portfolio.Sergio.B.github.io/html/navigation.html?v=${ASSET_VERSION}`);
loadComponent('main-footer', `/Portfolio.Sergio.B.github.io/html/footer.html?v=${ASSET_VERSION}`);
