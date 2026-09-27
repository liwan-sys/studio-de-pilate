(() => {
  const english = new URLSearchParams(location.search).get('lang') === 'en';
  const mapElement = document.getElementById('studios-map');
  const status = document.getElementById('map-status');
  const directions = english ? 'Directions' : 'Itinéraire';
  if (english) {
    document.documentElement.lang = 'en';
    document.title = 'Both SVB studios in Saint-Ouen';
    mapElement.setAttribute('aria-label', 'Both SVB studios in Saint-Ouen');
    document.querySelector('.studio-addresses').setAttribute('aria-label', 'Directions to the studios');
    status.textContent = 'Our two studios in Saint-Ouen-sur-Seine';
    document.querySelectorAll('.studio-directions').forEach((label) => { label.textContent = directions; });
  }

  // Keep the address links usable even if the map library cannot load.
  if (!window.L) return;
  status.remove();
  const studios = [
    { id: 'lavandieres', name: 'Cours des Lavandières', address: '40 Cours des Lavandières', position: [48.9112118, 2.3314332], label: 'bottom' },
    { id: 'docks', name: 'Parc des Docks', address: '6 Mail André Breton', position: [48.9137218, 2.3291223], label: 'top' }
  ];
  const map = L.map(mapElement, { scrollWheelZoom: false, zoomControl: false, minZoom: 13, zoomSnap: 0.5 });
  L.control.zoom({
    position: 'topright',
    zoomInTitle: english ? 'Zoom in' : 'Zoomer',
    zoomOutTitle: english ? 'Zoom out' : 'Dézoomer'
  }).addTo(map);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
  }).addTo(map);

  studios.forEach((studio, index) => {
    const link = document.querySelector(`[data-studio="${studio.id}"]`);
    const content = document.createElement('div');
    const name = document.createElement('strong');
    name.textContent = `SVB · ${studio.name}`;
    const address = document.createElement('div');
    address.textContent = `${studio.address}, 93400 Saint-Ouen-sur-Seine`;
    const route = document.createElement('a');
    route.href = link.href;
    route.target = '_blank';
    route.rel = 'noopener noreferrer';
    route.textContent = directions;
    content.append(name, address, route);
    L.marker(studio.position, {
      title: `SVB · ${studio.name}`,
      alt: `SVB · ${studio.name}`,
      icon: L.divIcon({ className: 'svb-map-marker', html: String(index + 1), iconSize: [32, 32], iconAnchor: [16, 16] })
    }).on('add', (event) => {
      event.target.getElement().setAttribute('aria-label', `SVB · ${studio.name}`);
    }).addTo(map)
      .bindTooltip(studio.name, { permanent: true, direction: studio.label, offset: [0, studio.label === 'top' ? -20 : 20], className: 'studio-label', opacity: 1 })
      .bindPopup(content, { maxWidth: 230 });
  });

  // Fit both real locations after lazy loading and when the iframe changes size.
  const bounds = L.latLngBounds(studios.map((studio) => studio.position));
  function frameStudios() {
    map.invalidateSize({ pan: false });
    map.fitBounds(bounds, { padding: [85, 55], maxZoom: 17, animate: false });
  }
  frameStudios();
  if (window.ResizeObserver) new ResizeObserver(frameStudios).observe(mapElement);
  else window.addEventListener('resize', frameStudios);
})();
