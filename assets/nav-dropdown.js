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
        { label: "Pilates",          href: "/pilates-saint-ouen",          tag: "55 min · Classic & Power au sol" },
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

/*!
 * Studio SVB — Mobile nav drawer (v2, stacking-context-safe)
 *
 * Stratégie: cloner les <a> du #nav-menu dans un drawer séparé, enfant direct
 * de <body>. Évite les bugs de stacking context causés par reveal-load / blobs
 * ambients qui ont leur propre contexte z-index. Le #nav-menu original reste
 * intact pour la desktop (md:flex), il est juste forcé display:none en mobile
 * pour qu'on ne voie pas la version legacy empilée.
 */
(function () {
    'use strict';

    var CSS = [
        /* Base: drawer + backdrop CACHÉS partout par défaut (évite flash desktop) */
        '.svb-mobile-drawer,.svb-nav-backdrop{display:none;}',
        '@media (max-width: 767px){',
            /* Réactivation mobile */
            '.svb-mobile-drawer{display:flex;}',
            '.svb-nav-backdrop{display:block;}',
            /* Toggle hamburger au-dessus de tout */
            '#nav-toggle{position:relative;z-index:100003;transition:transform .25s ease;}',
            'body.svb-nav-open #nav-toggle{transform:rotate(90deg);color:#2F4F4F;}',
            /* Drawer ORIGINAL (#nav-menu dans la nav): caché en mobile — on utilise le clone */
            '#nav-menu{display:none !important;}',
            /* Backdrop */
            '.svb-nav-backdrop{',
                'position:fixed;top:0;left:0;right:0;bottom:0;z-index:100000;',
                'background:rgba(47,79,79,0.5);',
                'opacity:0;visibility:hidden;transition:opacity .22s ease,visibility .22s;',
            '}',
            'body.svb-nav-open .svb-nav-backdrop{opacity:1;visibility:visible;}',
            /* Drawer CLONE (enfant de body, pas de piège stacking context) */
            '.svb-mobile-drawer{',
                'position:fixed;top:0;right:0;bottom:0;',
                'width:82%;max-width:320px;',
                'margin:0;padding:82px 20px 28px;',
                'background:#ffffff;',
                'box-shadow:-18px 0 50px -12px rgba(47,79,79,0.28);',
                'display:flex;flex-direction:column;align-items:stretch;',
                'gap:0;overflow-y:auto;-webkit-overflow-scrolling:touch;',
                'transform:translateX(105%);transition:transform .3s cubic-bezier(.16,1,.3,1);',
                'z-index:100001;font-family:"Montserrat",sans-serif;',
                'visibility:hidden;',
            '}',
            'body.svb-nav-open .svb-mobile-drawer{transform:translateX(0);visibility:visible;}',
            '.svb-mobile-drawer a{',
                'display:block;width:100%;',
                'padding:15px 16px;margin:0;',
                'font-size:15px;font-weight:600;',
                'color:#2F4F4F;text-align:left;text-decoration:none;',
                'border-radius:10px;border-bottom:1px solid rgba(47,79,79,0.08);',
                'transition:background .15s ease,color .15s ease;',
                'background:transparent;',
                'letter-spacing:0;text-transform:none;',
            '}',
            '.svb-mobile-drawer a:last-child{border-bottom:0;}',
            '.svb-mobile-drawer a:hover,.svb-mobile-drawer a:active,.svb-mobile-drawer a:focus{',
                'background:#F2E6CF;color:#2F4F4F;outline:none;',
            '}',
            /* FR|EN gardé en pilule centrée en bas */
            '.svb-mobile-drawer a[aria-label="English version"]{',
                'margin-top:16px;border-bottom:0;text-align:center;',
                'padding:11px 14px;background:rgba(242,230,207,0.5);',
                'border-radius:22px;',
            '}',
            /* Accordéon Abonnements (remplace le dropdown hover desktop) */
            '.svb-mobile-abo{border-bottom:1px solid rgba(47,79,79,0.08);}',
            '.svb-mobile-abo-head{',
                'display:flex;align-items:center;justify-content:space-between;width:100%;',
                'padding:15px 16px;margin:0;',
                'background:transparent;border:0;cursor:pointer;',
                'font-family:"Montserrat",sans-serif;font-size:15px;font-weight:600;',
                'color:#2F4F4F;text-align:left;border-radius:10px;',
                'transition:background .15s ease;',
            '}',
            '.svb-mobile-abo-head:hover,.svb-mobile-abo-head:active,.svb-mobile-abo-head:focus{',
                'background:#F2E6CF;outline:none;',
            '}',
            '.svb-mobile-abo-head .svb-chev{',
                'width:14px;height:14px;transition:transform .2s ease;flex-shrink:0;margin-left:8px;',
            '}',
            '.svb-mobile-abo[data-open="true"] .svb-mobile-abo-head .svb-chev{transform:rotate(180deg);}',
            '.svb-mobile-abo-body{',
                'max-height:0;overflow:hidden;transition:max-height .28s ease;',
                'padding-left:10px;',
            '}',
            '.svb-mobile-abo[data-open="true"] .svb-mobile-abo-body{max-height:620px;}',
            '.svb-mobile-abo-body a{',
                'display:block;padding:12px 14px !important;',
                'font-size:14px !important;font-weight:500 !important;',
                'color:#2F4F4F !important;text-decoration:none;',
                'border-bottom:1px solid rgba(47,79,79,0.05) !important;',
                'background:transparent;',
            '}',
            '.svb-mobile-abo-body a .svb-sub-tag{',
                'display:block;font-size:11px;font-weight:500;color:#4A8D84;margin-top:2px;',
            '}',
            '.svb-mobile-abo-body a.svb-abo-all{',
                'color:#4A8D84 !important;font-weight:700 !important;',
                'text-transform:uppercase;letter-spacing:.08em;font-size:12px !important;',
                'border-bottom:0 !important;padding:14px 14px !important;',
            '}',
            /* Scroll-lock body */
            'body.svb-nav-open{overflow:hidden;}',
        '}'
    ].join('');

    function injectCSS() {
        if (document.getElementById('svb-mobile-nav-css')) return;
        var s = document.createElement('style');
        s.id = 'svb-mobile-nav-css';
        s.type = 'text/css';
        s.appendChild(document.createTextNode(CSS));
        document.head.appendChild(s);
    }

    var backdrop = null, drawer = null;

    function ensureBackdrop() {
        if (backdrop) return backdrop;
        backdrop = document.querySelector('.svb-nav-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'svb-nav-backdrop';
            backdrop.setAttribute('aria-hidden', 'true');
            document.body.appendChild(backdrop);
        }
        backdrop.addEventListener('click', close);
        return backdrop;
    }

    function buildDrawer() {
        if (drawer) return drawer;
        var menu = document.getElementById('nav-menu');
        if (!menu) return null;

        drawer = document.createElement('nav');
        drawer.className = 'svb-mobile-drawer';
        drawer.setAttribute('aria-label', 'Menu principal mobile');
        drawer.setAttribute('role', 'navigation');

        // Liste des disciplines pour l'accordéon Abonnements (même source que le
        // dropdown desktop hydrate via le premier IIFE).
        var DISCIPLINES = (window.SvbNavDropdown && window.SvbNavDropdown.DISCIPLINES) || [];

        // Clone chaque <a> du menu original, en remplaçant le lien "Abonnements"
        // par un accordéon déployant les disciplines.
        var anchors = menu.querySelectorAll('a');
        anchors.forEach(function (a) {
            var txt = (a.textContent || '').trim();
            if (txt === 'Abonnements' && DISCIPLINES.length) {
                drawer.appendChild(buildAboAccordion(DISCIPLINES));
                return;
            }
            var clone = a.cloneNode(true);
            // Strip les classes Tailwind de hover/transform qui parasitent le rendu
            clone.removeAttribute('class');
            // Ferme le drawer au clic
            clone.addEventListener('click', function () { close(); });
            drawer.appendChild(clone);
        });

        document.body.appendChild(drawer);
        return drawer;
    }

    function buildAboAccordion(disciplines) {
        var wrap = document.createElement('div');
        wrap.className = 'svb-mobile-abo';
        wrap.setAttribute('data-open', 'false');

        var head = document.createElement('button');
        head.type = 'button';
        head.className = 'svb-mobile-abo-head';
        head.setAttribute('aria-expanded', 'false');
        head.innerHTML = 'Abonnements' +
            '<svg class="svb-chev" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
            '<path d="M1 1l6 6 6-6" stroke="#4A8D84" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
            '</svg>';

        var body = document.createElement('div');
        body.className = 'svb-mobile-abo-body';

        disciplines.forEach(function (d) {
            var a = document.createElement('a');
            a.href = d.href;
            a.innerHTML = d.label + '<span class="svb-sub-tag">' + d.tag + '</span>';
            a.addEventListener('click', function () { close(); });
            body.appendChild(a);
        });

        var all = document.createElement('a');
        all.href = '/tarifs';
        all.className = 'svb-abo-all';
        all.textContent = 'Voir tous les tarifs →';
        all.addEventListener('click', function () { close(); });
        body.appendChild(all);

        head.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var isOpen = wrap.getAttribute('data-open') === 'true';
            wrap.setAttribute('data-open', isOpen ? 'false' : 'true');
            head.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
        });

        wrap.appendChild(head);
        wrap.appendChild(body);
        return wrap;
    }

    function open() {
        document.body.classList.add('svb-nav-open');
        var tog = document.getElementById('nav-toggle');
        if (tog) tog.setAttribute('aria-expanded', 'true');
    }

    function close() {
        document.body.classList.remove('svb-nav-open');
        var tog = document.getElementById('nav-toggle');
        if (tog) tog.setAttribute('aria-expanded', 'false');
    }

    function toggle() {
        if (document.body.classList.contains('svb-nav-open')) close(); else open();
    }

    function init() {
        var tog = document.getElementById('nav-toggle');
        var menu = document.getElementById('nav-menu');
        if (!tog || !menu) return;
        if (tog.dataset.svbMobileHydrated === '1') return;
        tog.dataset.svbMobileHydrated = '1';

        injectCSS();
        ensureBackdrop();
        buildDrawer();

        // Neutralise l'onclick inline historique (qui tenterait encore d'afficher
        // l'ancien menu empilé avec inline styles)
        tog.removeAttribute('onclick');

        tog.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            toggle();
        });

        // ESC ferme
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && document.body.classList.contains('svb-nav-open')) close();
        });

        // Resize vers desktop → force close
        window.addEventListener('resize', function () {
            if (window.innerWidth >= 768 && document.body.classList.contains('svb-nav-open')) close();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.SvbMobileNav = { open: open, close: close, toggle: toggle };
})();
