const ASSET_VERSION = '20260413';
const FETCH_CACHE = new Map();

const PROJECTS = [
    'projects/tfg.html',
    'projects/replital.html',
    'projects/fuzzyLibrary.html',
    'projects/TransportMe.html',
    'projects/DS3SaveBackup.html'
  ];
  const OTHER_PROJECTS_URL = '/Portfolio.Sergio.B.github.io/html/otros-proyectos.html';
  
  let currentIndex = 0;
  const viewer  = document.getElementById('pv-viewer');
  const btns    = document.querySelectorAll('.pv-btn');
  const prevBtn = document.getElementById('pv-prev');
  const nextBtn = document.getElementById('pv-next');
  const lightbox = document.getElementById('image-lightbox');
  const lightboxFrame = lightbox ? lightbox.querySelector('.lightbox-frame') : null;
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxPrev = lightbox ? lightbox.querySelector('.lightbox-nav button[aria-label="Imagen anterior"]') : null;
  const lightboxNext = lightbox ? lightbox.querySelector('.lightbox-nav button[aria-label="Imagen siguiente"]') : null;
  let lightboxState = { carouselId: null, index: 0 };
  let nextButtonMode = 'project';
  let lightboxZoom = { scale: 1, x: 0, y: 0, dragging: false, startX: 0, startY: 0 };

  function handlePrevClick() {
    navigateProject(-1);
  }

  function handleNextClick() {
    if (nextButtonMode === 'more') {
      goToOtherProjects();
      return;
    }
    navigateProject(1);
  }

  if (prevBtn) prevBtn.addEventListener('click', handlePrevClick);
  if (nextBtn) nextBtn.addEventListener('click', handleNextClick);
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const index = Number(btn.dataset.projectIndex);
      if (Number.isInteger(index)) loadProject(index);
    });
  });

  function updateControls() {
    prevBtn.disabled = currentIndex === 0;
    const isLast = currentIndex === PROJECTS.length - 1;
    nextButtonMode = isLast ? 'more' : 'project';
    nextBtn.disabled = false;
    nextBtn.classList.toggle('pv-more-link', isLast);
    nextBtn.textContent = isLast ? 'Más proyectos' : '›';
    nextBtn.setAttribute('aria-label', isLast ? 'Más proyectos' : 'Proyecto siguiente');
    nextBtn.title = isLast ? 'Más proyectos' : 'Proyecto siguiente';
  }

  function loadProject(index) {
    currentIndex = index;
    btns.forEach((b, i) => b.classList.toggle('active', i === index));
    updateControls();
    closeLightbox();
    viewer.innerHTML = '<div class="pv-loading">Cargando...</div>';
    fetchTextCached(`${PROJECTS[index]}?v=${ASSET_VERSION}`)
      .then(html => {
        viewer.innerHTML = html;
        viewer.classList.remove('pv-fade');
        void viewer.offsetWidth;
        viewer.classList.add('pv-fade');
        viewer.querySelectorAll('.carousel').forEach(c => initCarousel(c.id));
      })
      .catch(() => {
        viewer.innerHTML = '<div class="pv-loading">No se pudo cargar el proyecto.</div>';
      });
  }

  function preloadProjectFragments() {
    PROJECTS.forEach((project, i) => {
      if (i === currentIndex) return;
      fetchTextCached(`${project}?v=${ASSET_VERSION}`).catch(() => {});
    });
  }

  function navigateProject(dir) {
    const next = currentIndex + dir;
    if (next >= 0 && next < PROJECTS.length) {
      loadProject(next);
      return;
    }
    if (dir > 0 && currentIndex === PROJECTS.length - 1) {
      goToOtherProjects();
    }
  }

  function goToOtherProjects() {
    window.location.href = OTHER_PROJECTS_URL;
  }

  // Keep inline HTML compatibility if any stale cached fragment still calls these.
  window.loadProject = loadProject;
  window.navigateProject = navigateProject;
  window.moveCarousel = moveCarousel;
  window.goToSlide = goToSlide;
  window.changeLightboxSlide = changeLightboxSlide;
  window.closeLightbox = closeLightbox;

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
    if (e.key === 'ArrowLeft')  navigateProject(-1);
    if (e.key === 'ArrowRight') navigateProject(1);
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

  loadProject(0);

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

  const schedulePreload = window.requestIdleCallback
    ? cb => window.requestIdleCallback(cb, { timeout: 1500 })
    : cb => setTimeout(cb, 900);

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
schedulePreload(preloadProjectFragments);
