(function () {
  function bindVideo(video) {
    if (!video || video.dataset.projectVideoBound === 'true') return;
    const placeholder = video.parentElement ? video.parentElement.querySelector('.video-placeholder') : null;
    const hidePlaceholder = () => placeholder?.classList.add('hidden');
    const showPlaceholder = () => {
      if (!video.currentSrc) placeholder?.classList.remove('hidden');
    };

    video.addEventListener('loadeddata', hidePlaceholder);
    video.addEventListener('canplay', hidePlaceholder);
    video.addEventListener('error', showPlaceholder);
    video.dataset.projectVideoBound = 'true';

    if (video.readyState >= 2) {
      hidePlaceholder();
    } else {
      showPlaceholder();
    }
  }

  function init(root = document) {
    root.querySelectorAll('.project-video-wrapper video').forEach(bindVideo);
  }

  window.ProjectVideo = { init, bindVideo };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init(document));
  } else {
    init(document);
  }
})();
