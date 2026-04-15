(function () {
  const lightboxState = { carouselId: null, index: 0 };
  let lightboxZoom = { scale: 1, x: 0, y: 0, dragging: false, startX: 0, startY: 0 };

  const getLightbox = () => document.getElementById('image-lightbox');
  const getLightboxImage = () => document.getElementById('lightbox-image');
  const getLightboxCounter = () => document.getElementById('lightbox-counter');
  const getLightboxCaption = () => document.getElementById('lightbox-caption');

  function getCarouselSlides(id) {
    const carousel = id ? document.getElementById(id) : null;
    return carousel ? Array.from(carousel.querySelectorAll('.carousel-slide')) : [];
  }

  function getCarouselPageCount(id) {
    const carousel = id ? document.getElementById(id) : null;
    const track = carousel ? carousel.querySelector('.carousel-track') : null;
    if (!track) return 0;
    const slides = carousel.querySelectorAll('.carousel-slide');
    return slides.length;
  }

  function getCurrentSlide(id, total) {
    const carousel = document.getElementById(id);
    const track = carousel ? carousel.querySelector('.carousel-track') : null;
    if (!track || total === 0) return 0;
    const page = Math.round(track.scrollLeft / track.clientWidth);
    return Math.max(0, Math.min(total - 1, page));
  }

  function clampLightboxPan() {
    const lightboxImage = getLightboxImage();
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
    const lightbox = getLightbox();
    const lightboxImage = getLightboxImage();
    const lightboxFrame = lightbox ? lightbox.querySelector('.lightbox-frame') : null;
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

  function renderLightbox() {
    const lightbox = getLightbox();
    const lightboxImage = getLightboxImage();
    const lightboxCounter = getLightboxCounter();
    const lightboxCaption = getLightboxCaption();
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
    resetLightboxZoom();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function openLightbox(carouselId, index) {
    const slides = getCarouselSlides(carouselId);
    if (!slides.length) return;
    lightboxState.carouselId = carouselId;
    lightboxState.index = index;
    renderLightbox();
  }

  function closeLightbox() {
    const lightbox = getLightbox();
    const lightboxImage = getLightboxImage();
    const lightboxCaption = getLightboxCaption();
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    resetLightboxZoom();
    if (lightboxImage) lightboxImage.src = '';
    if (lightboxCaption) lightboxCaption.textContent = '';
    lightboxState.carouselId = null;
    lightboxState.index = 0;
    document.body.style.overflow = '';
  }

  function changeLightboxSlide(delta) {
    const slides = getCarouselSlides(lightboxState.carouselId);
    if (slides.length <= 1) return;
    lightboxState.index = (lightboxState.index + delta + slides.length) % slides.length;
    renderLightbox();
  }

  function moveCarousel(id, dir) {
    const carousel = document.getElementById(id);
    const track = carousel ? carousel.querySelector('.carousel-track') : null;
    if (!track) return;
    track.scrollBy({ left: dir * track.clientWidth, behavior: 'smooth' });
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

  function buildCarouselDots(id) {
    const carousel = document.getElementById(id);
    const dotsContainer = document.getElementById('dots-' + id);
    if (!carousel || !dotsContainer) return;
    const pages = getCarouselPageCount(id);
    if (pages === 0) {
      dotsContainer.innerHTML = '';
      return;
    }
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

  function initCarousel(id) {
    const carousel = document.getElementById(id);
    if (!carousel) return;
    const slides = carousel.querySelectorAll('.carousel-slide');
    const dotsContainer = document.getElementById('dots-' + id);
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    if (slides.length === 0) {
      const track = carousel.querySelector('.carousel-track');
      if (track) {
        track.innerHTML = '<div class="carousel-empty">Sin imágenes todavía</div>';
      }
      const prev = carousel.querySelector('.prev');
      const next = carousel.querySelector('.next');
      if (prev) prev.style.display = 'none';
      if (next) next.style.display = 'none';
      return;
    }

    carousel.style.display = '';
    buildCarouselDots(id);

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

    slides.forEach((slide, i) => {
      const image = slide.querySelector('img');
      if (image && !image.dataset.carouselBound) {
        image.dataset.carouselBound = 'true';
        image.addEventListener('click', () => openLightbox(id, i));
      }
    });

    if (slides.length === 1) {
      const prev = carousel.querySelector('.prev');
      const next = carousel.querySelector('.next');
      if (prev) prev.style.display = 'none';
      if (next) next.style.display = 'none';
    }

    syncCarouselDots(id);
  }

  function init(root = document) {
    root.querySelectorAll('.carousel').forEach(carousel => initCarousel(carousel.id));
  }

  const api = {
    init,
    initCarousel,
    moveCarousel,
    goToSlide,
    changeLightboxSlide,
    closeLightbox,
    openLightbox,
  };

  window.ProjectCarousel = api;
  window.moveCarousel = moveCarousel;
  window.goToSlide = goToSlide;
  window.changeLightboxSlide = changeLightboxSlide;
  window.closeLightbox = closeLightbox;
  window.openLightbox = openLightbox;

  const lightbox = getLightbox();
  const lightboxImage = getLightboxImage();
  const lightboxFrame = lightbox ? lightbox.querySelector('.lightbox-frame') : null;
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
      if (!lightbox.classList.contains('open')) return;
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
    const stopDrag = event => {
      if (!lightboxZoom.dragging) return;
      lightboxZoom.dragging = false;
      lightboxImage.releasePointerCapture?.(event.pointerId);
      applyLightboxTransform();
    };
    lightboxImage.addEventListener('pointerup', stopDrag);
    lightboxImage.addEventListener('pointercancel', stopDrag);
    lightboxImage.addEventListener('pointerleave', stopDrag);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init(document));
  } else {
    init(document);
  }
})();
