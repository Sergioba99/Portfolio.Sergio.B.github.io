const PROJECTS = [
    'projects/tfg.html',
    'projects/replital.html',
    'projects/fanControl.html',
    'projects/TransportMe.html',
    'projects/DS3SaveBackup.html'
  ];

  let currentIndex = 0;
  const viewer  = document.getElementById('pv-viewer');
  const btns    = document.querySelectorAll('.pv-btn');
  const prevBtn = document.getElementById('pv-prev');
  const nextBtn = document.getElementById('pv-next');

  function updateArrows() {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === PROJECTS.length - 1;
  }

  function centerArrows() {
    const h = viewer.offsetHeight;
    const offset = Math.round(h / 2) - 18;
    prevBtn.style.top = offset + 'px';
    nextBtn.style.top = offset + 'px';
  }

  function loadProject(index) {
    currentIndex = index;
    btns.forEach((b, i) => b.classList.toggle('active', i === index));
    updateArrows();
    viewer.innerHTML = '<div class="pv-loading">Cargando...</div>';
    fetch(PROJECTS[index])
      .then(res => {
        if (!res.ok) throw new Error('No encontrado');
        return res.text();
      })
      .then(html => {
        viewer.innerHTML = html;
        viewer.classList.remove('pv-fade');
        void viewer.offsetWidth;
        viewer.classList.add('pv-fade');
        viewer.querySelectorAll('.carousel').forEach(c => initCarousel(c.id));
        centerArrows();
      })
      .catch(() => {
        viewer.innerHTML = '<div class="pv-loading">No se pudo cargar el proyecto.</div>';
      });
  }

  function navigateProject(dir) {
    const next = currentIndex + dir;
    if (next >= 0 && next < PROJECTS.length) loadProject(next);
  }

  document.addEventListener('keydown', e => {
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

  loadProject(0);

  /* ── CARGAR COMPONENTES ── */
  async function loadComponent(id, url) {
    const el = document.getElementById(id);
    if (!el) return;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('No encontrado');
      el.innerHTML = await res.text();
    } catch (err) {
      console.error('Error cargando componente', id, err);
    }
  }
  loadComponent('main-nav', '/html/navigation.html');
  loadComponent('main-footer', '/html/footer.html');