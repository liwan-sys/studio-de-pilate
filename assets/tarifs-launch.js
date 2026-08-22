(() => {
  const offers = document.querySelectorAll('[data-launch-offer]');
  const isFrench = document.documentElement.lang.toLowerCase().startsWith('fr');

  offers.forEach((offer) => {
    const deadline = Date.parse(offer.dataset.launchDeadline || '');
    const timer = offer.querySelector('.pricing-launch-countdown');
    const daysNode = offer.querySelector('[data-countdown-days]');
    const hoursNode = offer.querySelector('[data-countdown-hours]');
    const minutesNode = offer.querySelector('[data-countdown-minutes]');
    const secondsNode = offer.querySelector('[data-countdown-seconds]');
    const cta = offer.querySelector('[data-launch-cta]');
    const ctaLabel = offer.querySelector('[data-launch-cta-label]');
    let intervalId = null;

    if (!Number.isFinite(deadline) || !timer || !daysNode || !hoursNode || !minutesNode || !secondsNode) return;

    const expireOffer = () => {
      offer.classList.add('pricing-launch-expired');
      offer.querySelectorAll('[data-launch-only]').forEach((node) => { node.hidden = true; });
      offer.querySelectorAll('[data-launch-ended]').forEach((node) => { node.hidden = false; });

      if (cta && ctaLabel) {
        ctaLabel.textContent = cta.dataset.defaultLabel || ctaLabel.textContent;
        cta.setAttribute('aria-label', cta.dataset.defaultAriaLabel || cta.getAttribute('aria-label'));
      }

      if (intervalId) window.clearInterval(intervalId);
    };

    const updateCountdown = () => {
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        expireOffer();
        return false;
      }

      const totalSeconds = Math.floor(remaining / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const pad = (value) => String(value).padStart(2, '0');

      daysNode.textContent = pad(days);
      hoursNode.textContent = pad(hours);
      minutesNode.textContent = pad(minutes);
      secondsNode.textContent = pad(seconds);
      timer.setAttribute(
        'aria-label',
        isFrench
          ? `${days} jours, ${hours} heures, ${minutes} minutes et ${seconds} secondes restantes`
          : `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds remaining`
      );
      return true;
    };

    if (updateCountdown()) intervalId = window.setInterval(updateCountdown, 1000);
  });
})();
