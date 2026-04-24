/*!
 * Studio SVB — Menu déroulant "Abonnements" dans la nav
 *
 * Auto-hydrate tous les liens <a href="/tarifs"> ou <a href="/tarifs.html">
 * dont le texte est "Abonnements" — les transforme en dropdown avec les
 * 6 pages disciplines + lien "Tous les tarifs" en bas.
 *
 * Self-contained : le CSS est injecté au runtime.
 * Fallback : si JS ne charge pas, le lien garde son href d'origine vers /tarifs.
 */
(function () {
    'use strict';

    var DISCIPLINES = [
        { label: "Pilates Reformer", href: "/pilates-reformer-saint-ouen", tag: "50 min · small group" },
        { label: "Crossformer",      href: "/crossformer-saint-ouen",      tag: "50 min · Reformer + cardio" },
        { label: "Cross Training",   href: "/cross-training-saint-ouen",   tag: "55 min · small group" },
        { label: "Yoga",             href: "/yoga-saint-ouen",             tag: "60 min · Vinyasa & Hatha" },
        { label: "Boxe Anglaise",    href: "/boxe-anglaise-saint-ouen",    tag: "55 min · zéro contact" },
        { label: "Cours Barre",      href: "/cours-barre-saint-ouen",      tag: "55 min · posture & tonus" }
    ];

    var CSS = [
        '.svb-nav-abo-wrap{position:relative;display:inline-block;}',
        '.svb-nav-abo-trigger{cursor:pointer;display:inline-flex;align-items:center;gap:4px;}',
        '.svb-nav-abo-trigger::after{content:"▾";font-size:0.75em;opacity:0.7;transition:transform 0.2s ease;}',
        '.svb-nav-abo-wrap[data-open="true"] .svb-nav-abo-trigger::after{transform:rotate(180deg);}',
        '.svb-nav-abo-panel{position:absolute;top:calc(100% + 10px);left:50%;transform:translateX(-50%) translateY(-8px);',
            'min-width:280px;background:#fff;border-radius:16px;padding:8px;',
            'box-shadow:0 20px 50px -12px rgba(0,0,0,0.25),0 4px 12px -4px rgba(0,0,0,0.1);',
            'border:1px solid rgba(74,93,79,0.15);z-index:9999;',
            'opacity:0;visibility:hidden;pointer-events:none;transition:opacity 0.18s ease,transform 0.18s ease,visibility 0.18s;}',
        '.svb-nav-abo-wrap[data-open="true"] .svb-nav-abo-panel{opacity:1;visibility:visible;pointer-events:auto;transform:translateX(-50%) translateY(0);}',
        '.svb-nav-abo-title{font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#4A5D4F;padding:10px 14px 6px;margin:0;}',
        '.svb-nav-abo-item{display:block;padding:10px 14px;border-radius:10px;text-decoration:none;color:#1C1F1C;transition:background 0.12s ease;}',
        '.svb-nav-abo-item:hover,.svb-nav-abo-item:focus{background:#F9F1E7;outline:none;color:#1C1F1C;}',
        '.svb-nav-abo-item-label{display:block;font-size:14px;font-weight:700;line-height:1.2;color:#1C1F1C;}',
        '.svb-nav-abo-item-tag{display:block;font-size:11px;font-weight:500;color:#4A5D4F;margin-top:2px;opacity:0.9;}',
        '.svb-nav-abo-sep{height:1px;background:rgba(74,93,79,0.12);margin:6px 10px;}',
        '.svb-nav-abo-foot{display:block;padding:10px 14px;border-radius:10px;text-decoration:none;font-size:12px;font-weight:700;color:#4A5D4F;text-align:center;letter-spacing:0.04em;text-transform:uppercase;transition:background 0.12s ease;}',
        '.svb-nav-abo-foot:hover{background:#F9F1E7;color:#1C1F1C;}',
        '@media (max-width:767px){',
            '.svb-nav-abo-panel{position:fixed;top:auto;bottom:auto;left:16px;right:16px;transform:translateY(-8px);min-width:0;max-width:none;margin-top:8px;}',
            '.svb-nav-abo-wrap[data-open="true"] .svb-nav-abo-panel{transform:translateY(0);}',
        '}'
    ].join('');

    function injectCss() {
        if (document.getElementById('svb-nav-abo-css')) return;
        var style = document.createElement('style');
        style.id = 'svb-nav-abo-css';
        style.textContent = CSS;
        document.head.appendChild(style);
    }

    function isAbonnementsLink(a) {
        var txt = (a.textContent || '').trim().toLowerCase();
        if (txt !== 'abonnements') return false;
        var href = (a.getAttribute('href') || '').replace(/^\s+|\s+$/g, '');
        return href === '/tarifs' || href === '/tarifs.html' || href === 'tarifs.html' || href === 'tarifs';
    }

    function buildPanel() {
        var panel = document.createElement('div');
        panel.className = 'svb-nav-abo-panel';
        panel.setAttribute('role', 'menu');

        var title = document.createElement('p');
        title.className = 'svb-nav-abo-title';
        title.textContent = 'Choisis ta discipline';
        panel.appendChild(title);

        DISCIPLINES.forEach(function (d) {
            var a = document.createElement('a');
            a.className = 'svb-nav-abo-item';
            a.href = d.href;
            a.setAttribute('role', 'menuitem');
            a.innerHTML =
                '<span class="svb-nav-abo-item-label">' + d.label + '</span>' +
                '<span class="svb-nav-abo-item-tag">' + d.tag + '</span>';
            panel.appendChild(a);
        });

        var sep = document.createElement('div');
        sep.className = 'svb-nav-abo-sep';
        panel.appendChild(sep);

        var foot = document.createElement('a');
        foot.className = 'svb-nav-abo-foot';
        foot.href = '/tarifs';
        foot.textContent = 'Voir tous les tarifs →';
        foot.setAttribute('role', 'menuitem');
        panel.appendChild(foot);

        return panel;
    }

    function hydrate(a) {
        if (a.__svbAboHydrated) return;
        a.__svbAboHydrated = true;

        var wrap = document.createElement('span');
        wrap.className = 'svb-nav-abo-wrap';
        wrap.setAttribute('data-open', 'false');

        a.classList.add('svb-nav-abo-trigger');
        a.setAttribute('aria-haspopup', 'true');
        a.setAttribute('aria-expanded', 'false');

        a.parentNode.insertBefore(wrap, a);
        wrap.appendChild(a);

        var panel = buildPanel();
        wrap.appendChild(panel);

        var isOpen = false;
        var hoverTimer = null;

        function open() {
            if (isOpen) return;
            isOpen = true;
            wrap.setAttribute('data-open', 'true');
            a.setAttribute('aria-expanded', 'true');
        }

        function close() {
            if (!isOpen) return;
            isOpen = false;
            wrap.setAttribute('data-open', 'false');
            a.setAttribute('aria-expanded', 'false');
        }

        // Desktop : hover
        wrap.addEventListener('mouseenter', function () {
            if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = null; }
            open();
        });
        wrap.addEventListener('mouseleave', function () {
            hoverTimer = setTimeout(close, 180);
        });

        // Tap / click : empêche la navigation et toggle
        a.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (isOpen) close(); else open();
        });

        // Fermer si on clique ailleurs
        document.addEventListener('click', function (e) {
            if (!wrap.contains(e.target)) close();
        });

        // Fermer sur Escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' || e.keyCode === 27) close();
        });
    }

    function init() {
        injectCss();
        var links = document.querySelectorAll('a[href="/tarifs"], a[href="/tarifs.html"], a[href="tarifs.html"], a[href="tarifs"]');
        Array.prototype.forEach.call(links, function (a) {
            if (isAbonnementsLink(a)) hydrate(a);
        });
    }

    window.SvbNavDropdown = { init: init, DISCIPLINES: DISCIPLINES };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
