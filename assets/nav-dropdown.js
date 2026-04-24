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
 * Studio SVB — Mobile nav drawer
 *
 * Remplace le toggle inline (display:flex column inline-styles) par un vrai
 * drawer right-slide + backdrop, scroll-lock, animations hamburger→X, et
 * fermeture automatique au clic lien / outside / ESC.
 *
 * Zéro changement HTML requis : on détecte #nav-toggle + #nav-menu, on strip
 * l'onclick inline existant, on réinstalle nos handlers. Marche identique sur
 * les 24+ pages du site.
 */
(function () {
    'use strict';

    var CSS = [
        /* Le drawer ne s'active qu'en mobile (<768px, breakpoint md de Tailwind) */
        '@media (max-width: 767px){',
            /* Toggle (hamburger → X) */
            '#nav-toggle{position:relative;z-index:100002;transition:transform .25s ease;}',
            'body.svb-nav-open #nav-toggle{transform:rotate(90deg);color:#2F4F4F;}',
            /* Backdrop */
            '.svb-nav-backdrop{',
                'position:fixed;inset:0;z-index:100000;',
                'background:rgba(47,79,79,0.45);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);',
                'opacity:0;visibility:hidden;transition:opacity .22s ease,visibility .22s;',
            '}',
            'body.svb-nav-open .svb-nav-backdrop{opacity:1;visibility:visible;}',
            /* Drawer — override des inline-styles injectés par l\'onclick historique */
            '#nav-menu{',
                'position:fixed !important;top:0 !important;right:0 !important;bottom:0 !important;left:auto !important;',
                'width:82% !important;max-width:320px !important;',
                'margin:0 !important;padding:88px 22px 28px !important;',
                'background:rgba(255,255,255,0.98) !important;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);',
                'box-shadow:-18px 0 50px -12px rgba(47,79,79,0.28);',
                'display:flex !important;flex-direction:column !important;align-items:stretch !important;',
                'justify-content:flex-start !important;',
                'gap:2px !important;',
                'overflow-y:auto;-webkit-overflow-scrolling:touch;',
                'transform:translateX(100%);transition:transform .28s cubic-bezier(.16,1,.3,1);',
                'z-index:100001;',
                'text-align:left;',
            '}',
            '#nav-menu.hidden{transform:translateX(100%);display:flex !important;}',
            'body.svb-nav-open #nav-menu{transform:translateX(0) !important;}',
            '#nav-menu a{',
                'display:block !important;width:100%;',
                'padding:14px 14px !important;margin:0 !important;',
                'font-size:15px !important;font-weight:600 !important;',
                'color:#2F4F4F !important;text-align:left !important;',
                'border-radius:10px;border-bottom:1px solid rgba(47,79,79,0.06);',
                'transition:background .15s ease,color .15s ease,transform .15s ease;',
            '}',
            '#nav-menu a:last-child{border-bottom:0;}',
            '#nav-menu a:hover,#nav-menu a:active,#nav-menu a:focus{',
                'background:#F2E6CF !important;color:#2F4F4F !important;outline:none;',
            '}',
            /* Le toggle FR|EN — styling spécifique, garde son apparence pilule */
            '#nav-menu a[aria-label="English version"]{',
                'margin-top:18px !important;border-bottom:0 !important;',
                'text-align:center !important;padding:10px 14px !important;',
                'background:rgba(242,230,207,0.35) !important;',
            '}',
            /* Scroll-lock body quand drawer ouvert */
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

    function ensureBackdrop() {
        var b = document.querySelector('.svb-nav-backdrop');
        if (b) return b;
        b = document.createElement('div');
        b.className = 'svb-nav-backdrop';
        b.setAttribute('aria-hidden', 'true');
        document.body.appendChild(b);
        b.addEventListener('click', close);
        return b;
    }

    function open() {
        document.body.classList.add('svb-nav-open');
        var menu = document.getElementById('nav-menu');
        var tog = document.getElementById('nav-toggle');
        if (menu) {
            menu.classList.remove('hidden');
            menu.setAttribute('aria-expanded', 'true');
        }
        if (tog) tog.setAttribute('aria-expanded', 'true');
    }

    function close() {
        document.body.classList.remove('svb-nav-open');
        var menu = document.getElementById('nav-menu');
        var tog = document.getElementById('nav-toggle');
        if (menu) {
            menu.classList.add('hidden');
            menu.setAttribute('aria-expanded', 'false');
            // Purge inline styles legacy laissés par l'ancien onclick
            menu.style.display = '';
            menu.style.flexDirection = '';
            menu.style.alignItems = '';
            menu.style.gap = '';
            menu.style.paddingTop = '';
        }
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

        // Retire l'onclick inline historique pour éviter double-toggle
        tog.removeAttribute('onclick');

        tog.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            toggle();
        });

        // Ferme quand on tape un lien du menu
        menu.addEventListener('click', function (e) {
            var a = e.target.closest('a');
            if (a) close();
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
