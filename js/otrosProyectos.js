  /* ── LISTA DE PROYECTOS ────────────────────────────────────────
     Para mover un proyecto desde index.html a esta página:
       1. Quita su entrada del array PROJECTS en index.html
          y reduce el número de botones en ese archivo
       2. Añade aquí su entrada con nombre y archivo
     Formato: { name: 'Nombre corto', sub: 'Tech · Stack', file: 'projects/archivo.html' }
  ──────────────────────────────────────────────────────────────── */
const ASSET_VERSION = '20260415';
const PROJECT_BASE = '/Portfolio.Sergio.B.github.io/';
const FETCH_CACHE = new Map();
const PROJECT_PREFETCH_RADIUS = 2;

  const PROJECTS = [
    // Ejemplo — descomenta y adapta cuando muevas proyectos:
    //{ name: 'TransportMe',       sub: 'Java · Spigot',      file: 'projects/TransportMe.html' },
    //{ name: 'Gestor backups DS3', sub: 'Python · Utilidad',  file: 'projects/DS3SaveBackup.html' },
    {name: "Prompt Template Library", sub: "YAML · PySide6 · SQLite", file: "projects/promptTemplateLibrary.html"},
    {name: "Fan Control", sub: "ESP32 · Arduino", file: "projects/fanControl.html"},
    {name: "RepliTal Avatar", sub: "Avatar IA · Presentación", file: "projects/replitalAvatar.html"},
  ];

  let currentIndex = 0;
  const viewer    = document.getElementById('op-viewer');
  const sideList  = document.getElementById('op-sidebar-list');
  const counter   = document.getElementById('op-counter');
  const prevBtn   = document.getElementById('op-prev');
  const nextBtn   = document.getElementById('op-next');
  const lightbox = document.getElementById('image-lightbox');
  const lightboxFrame = lightbox ? lightbox.querySelector('.lightbox-frame') : null;
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxPrev = lightbox ? lightbox.querySelector('.lightbox-nav button[aria-label="Imagen anterior"]') : null;
  const lightboxNext = lightbox ? lightbox.querySelector('.lightbox-nav button[aria-label="Imagen siguiente"]') : null;
  let lightboxState = { carouselId: null, index: 0 };
  let lightboxZoom = { scale: 1, x: 0, y: 0, dragging: false, startX: 0, startY: 0 };

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
    closeLightbox();
    viewer.innerHTML = '<div class="op-loading">Cargando...</div>';
    fetchTextCached(`${PROJECT_BASE}${PROJECTS[index].file}?v=${ASSET_VERSION}`)
      .then(html => {
        viewer.innerHTML = html;
        window.ProjectVideo?.init(viewer);
        viewer.classList.remove('op-fade');
        void viewer.offsetWidth;
        viewer.classList.add('op-fade');
        viewer.querySelectorAll('.carousel').forEach(c => initCarousel(c.id));
        scheduleProjectWindowPrefetch(index);
      })
      .catch(() => {
        viewer.innerHTML = '<div class="op-loading">No se pudo cargar el proyecto.</div>';
      });
  }

  function scheduleProjectWindowPrefetch(centerIndex) {
    const run = () => syncProjectWindow(centerIndex);
    if (window.requestIdleCallback) {
      window.requestIdleCallback(run, { timeout: 1200 });
    } else {
      setTimeout(run, 400);
    }
  }

  function syncProjectWindow(centerIndex) {
    const desiredUrls = new Set();
    const start = Math.max(0, centerIndex - PROJECT_PREFETCH_RADIUS);
    const end = Math.min(PROJECTS.length - 1, centerIndex + PROJECT_PREFETCH_RADIUS);

    for (let i = start; i <= end; i++) {
      desiredUrls.add(`${PROJECT_BASE}${PROJECTS[i].file}?v=${ASSET_VERSION}`);
    }

    desiredUrls.forEach(url => {
      fetchTextCached(url).catch(() => {});
    });

    for (const key of FETCH_CACHE.keys()) {
      if (!key.includes('/projects/')) continue;
      if (!desiredUrls.has(key)) {
        FETCH_CACHE.delete(key);
      }
    }
  }

  function opNavigate(dir) {
    const next = currentIndex + dir;
    if (next >= 0 && next < PROJECTS.length) opLoad(next);
  }

  document.addEventListener('keydown', e => {
    if (isLightboxOpen()) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        changeLightboxSlide(-1);
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        changeLightboxSlide(1);
        return;
      }
      if (e.key === 'Escape') {
        closeLightbox();
        return;
      }
    }
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
      carousel.style.display = 'none';
      return;
    }
    carousel.style.display = '';
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
  const track = carousel.querySelector('.carousel-track');
  if (track && !track.dataset.bound) {
    track.dataset.bound = 'true';
    const syncActiveDot = () => syncCarouselDots(id);
    const rebuildDots = () => {
      buildCarouselDots(id);
      syncCarouselDots(id);
    };
    track.addEventListener('scroll', () => {
      if (track._raf) cancelAnimationFrame(track._raf);
      track._raf = requestAnimationFrame(syncActiveDot);
    });
    window.addEventListener('resize', rebuildDots);
  }
    buildCarouselDots(id);
    syncCarouselDots(id);
  }

  function isLightboxOpen() {
    return !!lightbox && lightbox.classList.contains('open');
  }

  function clampLightboxPan() {
    if (!lightboxImage) return;
    if (lightboxZoom.scale <= 1) {
      lightboxZoom.x = 0;
      lightboxZoom.y = 0;
      return;
    }
    const maxX = Math.max(0, (lightboxImage.clientWidth * (lightboxZoom.scale - 1)) / 2);
    const maxY = Math.max(0, (lightboxImage.clientHeight * (lightboxZoom.scale - 1)) / 2);
    lightboxZoom.x = Math.max(-maxX, Math.min(maxX, lightboxZoom.x));
    lightboxZoom.y = Math.max(-maxY, Math.min(maxY, lightboxZoom.y));
  }

  function applyLightboxTransform() {
    if (!lightboxImage || !lightboxFrame) return;
    clampLightboxPan();
    lightboxImage.style.transform = `translate(${lightboxZoom.x}px, ${lightboxZoom.y}px) scale(${lightboxZoom.scale})`;
    lightboxFrame.classList.toggle('zoomed', lightboxZoom.scale > 1);
    lightboxFrame.classList.toggle('is-dragging', !!lightboxZoom.dragging);
  }

  function resetLightboxZoom() {
    lightboxZoom = { scale: 1, x: 0, y: 0, dragging: false, startX: 0, startY: 0 };
    applyLightboxTransform();
  }

  function setLightboxZoom(nextScale) {
    lightboxZoom.scale = Math.max(1, Math.min(4, nextScale));
    if (lightboxZoom.scale === 1) {
      lightboxZoom.x = 0;
      lightboxZoom.y = 0;
    }
    applyLightboxTransform();
  }

  function getCarouselSlides(id) {
    const carousel = id ? document.getElementById(id) : null;
    return carousel ? Array.from(carousel.querySelectorAll('.carousel-slide')) : [];
  }

  function renderLightbox() {
    if (!lightbox || !lightboxImage || !lightboxCounter || !lightboxCaption) return;
    const slides = getCarouselSlides(lightboxState.carouselId);
    const slide = slides[lightboxState.index];
    if (!slide) return;
    const image = slide.querySelector('img');
    const caption = slide.querySelector('.slide-caption');
    lightboxImage.src = image ? image.src : '';
    lightboxImage.alt = image?.alt || 'Imagen ampliada del proyecto';
    lightboxCounter.textContent = `${lightboxState.index + 1} / ${slides.length}`;
    lightboxCaption.textContent = caption ? caption.textContent.trim() : (image?.alt || '');
    if (lightboxPrev) lightboxPrev.style.visibility = slides.length > 1 ? 'visible' : 'hidden';
    if (lightboxNext) lightboxNext.style.visibility = slides.length > 1 ? 'visible' : 'hidden';
    resetLightboxZoom();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function openLightbox(carouselId, index) {
    const slides = getCarouselSlides(carouselId);
    if (!slides.length) return;
    lightboxState = { carouselId, index };
    renderLightbox();
  }

  function changeLightboxSlide(delta) {
    const slides = getCarouselSlides(lightboxState.carouselId);
    if (slides.length <= 1) return;
    lightboxState.index = (lightboxState.index + delta + slides.length) % slides.length;
    renderLightbox();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    resetLightboxZoom();
    if (lightboxImage) lightboxImage.src = '';
    if (lightboxCaption) lightboxCaption.textContent = '';
    lightboxState = { carouselId: null, index: 0 };
    document.body.style.overflow = '';
  }

  if (viewer) {
    viewer.addEventListener('click', event => {
      const image = event.target.closest('.carousel-slide img');
      if (!image || !viewer.contains(image)) return;
      const slide = image.closest('.carousel-slide');
      const carousel = image.closest('.carousel');
      if (!slide || !carousel) return;
      const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
      openLightbox(carousel.id, slides.indexOf(slide));
    });
  }

  function moveCarousel(id, dir) {
    const carousel = document.getElementById(id);
    const track = carousel ? carousel.querySelector('.carousel-track') : null;
    if (!track) return;
    track.scrollBy({ left: dir * track.clientWidth, behavior: 'smooth' });
  }

  function getCurrentSlide(id, total) {
    const carousel = document.getElementById(id);
    const track = carousel ? carousel.querySelector('.carousel-track') : null;
    if (!track || total === 0) return 0;
    const page = Math.round(track.scrollLeft / track.clientWidth);
    return Math.max(0, Math.min(total - 1, page));
  }

  function goToSlide(id, index) {
    const carousel = document.getElementById(id);
    const track = carousel ? carousel.querySelector('.carousel-track') : null;
    const pages = getCarouselPageCount(id);
    if (!track || pages === 0) return;
    const target = Math.max(0, Math.min(pages - 1, index));
    track.scrollTo({ left: target * track.clientWidth, behavior: 'smooth' });
    syncCarouselDots(id);
  }

  function getCarouselPageCount(id) {
    const carousel = document.getElementById(id);
    const track = carousel ? carousel.querySelector('.carousel-track') : null;
    if (!track) return 0;
    const total = track.scrollWidth;
    const viewport = track.clientWidth;
    if (!total || !viewport) return 0;
    return Math.max(1, Math.ceil(total / viewport));
  }

  function buildCarouselDots(id) {
    const carousel = document.getElementById(id);
    const dotsContainer = document.getElementById('dots-' + id);
    if (!carousel || !dotsContainer) return;
    const pages = getCarouselPageCount(id);
    if (pages === 0) return;
    dotsContainer.innerHTML = '';
    for (let i = 0; i < pages; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.onclick = () => goToSlide(id, i);
      dotsContainer.appendChild(dot);
    }
  }

  function syncCarouselDots(id) {
    const carousel = document.getElementById(id);
    if (!carousel) return;
    const dots = carousel.querySelectorAll('.carousel-dot');
    const pages = getCarouselPageCount(id);
    const current = getCurrentSlide(id, pages);
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    const prev = carousel.querySelector('.prev');
    const next = carousel.querySelector('.next');
    if (prev) prev.disabled = current === 0;
    if (next) next.disabled = current >= Math.max(0, pages - 1);
  }

  // Inicializar
  buildSidebar();
  if (lightbox) {
    lightbox.addEventListener('click', event => {
      if (event.target.id === 'image-lightbox') closeLightbox();
    });
  }

  if (lightboxImage && lightboxFrame) {
    lightboxImage.addEventListener('load', applyLightboxTransform);

    lightboxImage.addEventListener('dblclick', event => {
      event.preventDefault();
      setLightboxZoom(lightboxZoom.scale > 1 ? 1 : 2.5);
    });

    lightboxFrame.addEventListener('wheel', event => {
      if (!isLightboxOpen()) return;
      event.preventDefault();
      const delta = event.deltaY < 0 ? 0.25 : -0.25;
      setLightboxZoom(lightboxZoom.scale + delta);
    }, { passive: false });

    lightboxImage.addEventListener('pointerdown', event => {
      if (lightboxZoom.scale <= 1) return;
      event.preventDefault();
      lightboxZoom.dragging = true;
      lightboxZoom.startX = event.clientX - lightboxZoom.x;
      lightboxZoom.startY = event.clientY - lightboxZoom.y;
      lightboxImage.setPointerCapture?.(event.pointerId);
      applyLightboxTransform();
    });

    lightboxImage.addEventListener('pointermove', event => {
      if (!lightboxZoom.dragging) return;
      lightboxZoom.x = event.clientX - lightboxZoom.startX;
      lightboxZoom.y = event.clientY - lightboxZoom.startY;
      applyLightboxTransform();
    });

    const stopLightboxDrag = event => {
      if (!lightboxZoom.dragging) return;
      lightboxZoom.dragging = false;
      lightboxImage.releasePointerCapture?.(event.pointerId);
      applyLightboxTransform();
    };

    lightboxImage.addEventListener('pointerup', stopLightboxDrag);
    lightboxImage.addEventListener('pointercancel', stopLightboxDrag);
    lightboxImage.addEventListener('pointerleave', stopLightboxDrag);
  }
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

  async function fetchTextCached(url) {
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
