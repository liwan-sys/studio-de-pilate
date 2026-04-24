/*!
 * Studio SVB — Dropdown "Abonnements" pour la navigation
 *
 * Hydrate tout lien <a href="/tarifs"> / <a href="/tarifs.html"> dont le
 * texte est "Abonnements". N'enveloppe PAS le lien (préserve le flex de la
 * nav parente) : le panneau est un <div> fixed attaché au <body>, positionné
 * par JS relativement au lien via getBoundingClientRect.
 *
 * Palette respectée : #2F4F4F (texte), #E8B496 (accent peach), #F2E6CF (sand),
 * Montserrat. Fallback : si JS ne charge pas, le lien pointe toujours vers /tarifs.
 */
(function () {
    'use strict';

    var DISCIPLINES = [
        { label: "Pilates Reformer", href: "/pilates-reformer-saint-ouen", tag: "50 min · small group" },
        { label: "Crossformer",      href: "/crossformer-saint-ouen",      tag: "50 min · Reformer + cardio" },
        { label: "Pilates",          href: "/pilates-senior",              tag: "55 min · Classic sur tapis" },
        { label: "Cross Training",   href: "/cross-training-saint-ouen",   tag: "55 min · small group" },
        { label: "Yoga",             href: "/yoga-saint-ouen",             tag: "60 min · Vinyasa & Hatha" },
        { label: "Boxe Anglaise",    href: "/boxe-anglaise-saint-ouen",    tag: "55 min · zéro contact" }
    ];

    var CSS = [
        '#svb-abo-panel{position:fixed;z-index:99998;min-width:280px;max-width:320px;',
            'background:#ffffff;border-radius:14px;padding:8px;',
            'box-shadow:0 20px 50px -12px rgba(47,79,79,0.35),0 4px 14px -4px rgba(47,79,79,0.15);',
            'border:1px solid rgba(47,79,79,0.12);',
            'font-family:"Montserrat",sans-serif;',
            'opacity:0;visibility:hidden;pointer-events:none;transform:translateY(-6px);',
            'transition:opacity 0.18s ease,transform 0.18s ease,visibility 0.18s;}',
        '#svb-abo-panel[data-open="true"]{opacity:1;visibility:visible;pointer-events:auto;transform:translateY(0);}',
        '#svb-abo-panel .svb-abo-title{font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#4A8D84;padding:10px 14px 6px;margin:0;}',
        '#svb-abo-panel .svb-abo-item{display:block;padding:10px 14px;border-radius:10px;text-decoration:none;color:#2F4F4F;transition:background 0.12s ease,color 0.12s ease;}',
        '#svb-abo-panel .svb-abo-item:hover,#svb-abo-panel .svb-abo-item:focus{background:#F2E6CF;outline:none;color:#2F4F4F;}',
        '#svb-abo-panel .svb-abo-item-label{display:block;font-size:14px;font-weight:700;line-height:1.2;color:#2F4F4F;font-family:"Montserrat",sans-serif;}',
        '#svb-abo-panel .svb-abo-item-tag{display:block;font-size:11px;font-weight:500;color:#4A8D84;margin-top:2px;}',
        '#svb-abo-panel .svb-abo-sep{height:1px;background:rgba(47,79,79,0.1);margin:6px 10px;}',
        '#svb-abo-panel .svb-abo-foot{display:block;padding:10px 14px;border-radius:10px;text-decoration:none;font-size:11px;font-weight:700;color:#4A8D84;text-align:center;letter-spacing:0.1em;text-transform:uppercase;transition:background 0.12s ease,color 0.12s ease;}',
        '#svb-abo-panel .svb-abo-foot:hover,#svb-abo-panel .svb-abo-foot:focus{background:#F2E6CF;color:#2F4F4F;outline:none;}',
        '@media (max-width: 640px){',
            '#svb-abo-panel{left:12px !important;right:12px !important;min-width:0;max-width:none;width:auto;}',
        '}'
    ].join('');

    function injectCSS() {
        if (document.getElementById('svb-abo-css')) return;
        var s = document.createElement('style');
        s.id = 'svb-abo-css';
        s.type = 'text/css';
        s.appendChild(document.createTextNode(CSS));
        document.head.appendChild(s);
    }

    function normalizeHref(a) {
        // href attribute can be "/tarifs" or "/tarifs.html" or full URL ; we
        // want the path part only, stripped from trailing index.
        var raw = a.getAttribute('href') || '';
        try {
            var u = new URL(raw, window.location.origin);
            return u.pathname.replace(/\/+$/, '');
        } catch (e) {
            return raw.replace(/^https?:\/\/[^/]+/, '').replace(/\/+$/, '');
        }
    }

    function isAbonnementsLink(a) {
        var txt = (a.textContent || '').trim().toLowerCase().replace(/[^a-zéèêàîï ]/g, '');
        if (txt !== 'abonnements') return false;
        var path = normalizeHref(a);
        return path === '/tarifs' || path === '/tarifs.html';
    }

    var panel = null;
    var currentTrigger = null;
    var hideTimer = 0;

    function buildPanel() {
        if (panel) return panel;
        panel = document.createElement('div');
        panel.id = 'svb-abo-panel';
        panel.setAttribute('role', 'menu');
        panel.setAttribute('aria-label', 'Abonnements par discipline');

        var html = '<p class="svb-abo-title">Abonnements par discipline</p>';
        for (var i = 0; i < DISCIPLINES.length; i++) {
            var d = DISCIPLINES[i];
            html += '<a class="svb-abo-item" role="menuitem" href="' + d.href + '">' +
                '<span class="svb-abo-item-label">' + d.label + '</span>' +
                '<span class="svb-abo-item-tag">' + d.tag + '</span>' +
            '</a>';
        }
        html += '<div class="svb-abo-sep"></div>' +
            '<a class="svb-abo-foot" href="/tarifs">Voir tous les tarifs →</a>';
        panel.innerHTML = html;

        panel.addEventListener('mouseenter', cancelHide);
        panel.addEventListener('mouseleave', scheduleHide);

        document.body.appendChild(panel);
        return panel;
    }

    function positionPanel(trigger) {
        if (!panel) return;
        var r = trigger.getBoundingClientRect();
        var pw = panel.offsetWidth || 280;
        var vw = window.innerWidth;

        // Centre sous le trigger, contraint dans le viewport
        var left = r.left + (r.width / 2) - (pw / 2);
        var margin = 8;
        if (left < margin) left = margin;
        if (left + pw > vw - margin) left = vw - margin - pw;

        panel.style.left = left + 'px';
        panel.style.top  = (r.bottom + 8) + 'px';
    }

    function show(trigger) {
        cancelHide();
        buildPanel();
        currentTrigger = trigger;
        trigger.classList.add('svb-abo-open');
        trigger.setAttribute('aria-expanded', 'true');
        positionPanel(trigger);
        // Double-raf pour garantir mesure correcte si le panel vient d'être ajouté
        requestAnimationFrame(function () {
            positionPanel(trigger);
            panel.setAttribute('data-open', 'true');
        });
    }

    function hide() {
        if (!panel) return;
        panel.removeAttribute('data-open');
        if (currentTrigger) {
            currentTrigger.classList.remove('svb-abo-open');
            currentTrigger.setAttribute('aria-expanded', 'false');
            currentTrigger = null;
        }
    }

    function scheduleHide() {
        clearTimeout(hideTimer);
        hideTimer = setTimeout(hide, 180);
    }

    function cancelHide() {
        clearTimeout(hideTimer);
    }

    function hydrate(a) {
        if (a.dataset.svbAboHydrated === '1') return;
        a.dataset.svbAboHydrated = '1';
        a.setAttribute('aria-haspopup', 'menu');
        a.setAttribute('aria-expanded', 'false');

        // Pas de chevron visible — le dropdown se révèle au hover sans indicateur parasite.

        a.addEventListener('mouseenter', function () { show(a); });
        a.addEventListener('mouseleave', scheduleHide);
        a.addEventListener('focus',     function () { show(a); });
        a.addEventListener('click', function (e) {
            // Sur mobile (pas de hover) ou interaction clavier : toggle au lieu de naviguer
            var isOpen = panel && panel.getAttribute('data-open') === 'true' && currentTrigger === a;
            var isTouchOrNoHover = !window.matchMedia || !window.matchMedia('(hover: hover)').matches;
            if (isTouchOrNoHover || e.altKey) {
                e.preventDefault();
                if (isOpen) hide(); else show(a);
            }
        });
    }

    function init() {
        injectCSS();
        var links = document.querySelectorAll('a[href]');
        for (var i = 0; i < links.length; i++) {
            if (isAbonnementsLink(links[i])) hydrate(links[i]);
        }
    }

    // Événements globaux (une seule fois)
    document.addEventListener('click', function (e) {
        if (!panel) return;
        if (panel.contains(e.target)) return;
        if (currentTrigger && currentTrigger.contains(e.target)) return;
        hide();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') hide();
    });
    window.addEventListener('scroll', function () {
        if (panel && panel.getAttribute('data-open') === 'true' && currentTrigger) {
            positionPanel(currentTrigger);
        }
    }, { passive: true });
    window.addEventListener('resize', function () {
        if (panel && panel.getAttribute('data-open') === 'true' && currentTrigger) {
            positionPanel(currentTrigger);
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.SvbNavDropdown = { init: init, DISCIPLINES: DISCIPLINES };
})();
