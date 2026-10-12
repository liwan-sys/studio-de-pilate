/* Muted autoplay for every SVB video; browser playback policies still apply. */
(() => {
  const start = (video) => {
    if (!(video instanceof HTMLVideoElement)) return;
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.setAttribute('autoplay', '');
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.preload = 'auto';

    if (video.dataset.src) {
      video.src = video.dataset.src;
      delete video.dataset.src;
    }
    video.querySelectorAll('source[data-src]').forEach((source) => {
      source.src = source.dataset.src;
      delete source.dataset.src;
    });

    let started = false;
    const play = () => {
      if (started || (!video.querySelector('source[src]') && !video.src)) return;
      const attempt = video.play();
      if (attempt && typeof attempt.then === 'function') attempt.then(() => { started = true; }).catch(() => {});
      else started = true;
    };
    play();
    video.addEventListener('loadeddata', play, { once: true });
    video.addEventListener('canplay', play, { once: true });
  };

  const initialize = () => {
    document.querySelectorAll('video').forEach(start);
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(({ target }) => {
        if (target instanceof HTMLVideoElement) start(target);
        else if (target instanceof HTMLSourceElement && target.parentElement instanceof HTMLVideoElement) start(target.parentElement);
      });
    });
    document.querySelectorAll('video').forEach((video) => observer.observe(video, { attributes: true, attributeFilter: ['src', 'data-src'], childList: true, subtree: true }));
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
