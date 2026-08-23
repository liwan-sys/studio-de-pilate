/*!
 * Studio SVB - navigation des cours.
 * Le lien Cours reste un lien normal sans JavaScript. Avec JavaScript, il
 * ouvre un menu desktop et devient un accordéon dans le drawer mobile.
 */
(function () {
    'use strict';

    var DISCIPLINES = [
        { label: 'Pilates Reformer', href: '/pilates-reformer-saint-ouen', tag: 'Machines · Lavandières' },
        { label: 'Crossformer', href: '/crossformer-saint-ouen', tag: 'Reformer + cardio · Lavandières' },
        { label: 'Cross Training', href: '/cross-training-saint-ouen', tag: 'Force & cardio · Parc des Docks' },
        { label: 'CrossRox, CrossCore & CrossBody', href: '/bootcamp-saint-ouen', tag: '3 formats Cross · Parc des Docks' },
        { label: 'Pilates', href: '/pilates-saint-ouen', tag: 'Classic, Power & mobilité' },
        { label: 'Yoga', href: '/yoga-saint-ouen', tag: 'Vinyasa, Hatha & Cross Yoga' },
        { label: 'Boxe anglaise', href: '/boxe-anglaise-saint-ouen', tag: 'Technique sans contact' },
        { label: 'Yoga Kids', href: '/sport-enfant-saint-ouen', tag: 'Cours enfants · Parc des Docks' },
        { label: 'Coaching privé', href: '/coaching-sportif-saint-ouen', tag: 'Solo ou duo · 2 studios' }
    ];

    var CSS = [
        '.svb-course-panel,.svb-mobile-drawer,.svb-nav-backdrop{display:none;}',
        '.svb-course-panel{',
            'position:fixed;z-index:99998;width:min(640px,calc(100vw - 24px));',
            'max-height:calc(100vh - 100px);overflow:auto;',
            'padding:12px;background:#fff;border:1px solid rgba(47,79,79,.12);',
            'border-radius:8px;box-shadow:0 24px 60px -18px rgba(47,79,79,.38);',
            'font-family:"Montserrat",sans-serif;',
            'opacity:0;visibility:hidden;pointer-events:none;transform:translateY(-7px);',
            'transition:opacity .18s ease,transform .18s ease,visibility .18s;',
        '}',
        '.svb-course-panel[data-open="true"]{display:block;opacity:1;visibility:visible;pointer-events:auto;transform:translateY(0);}',
        '.svb-course-panel__head{display:flex;align-items:end;justify-content:space-between;gap:18px;padding:10px 12px 13px;border-bottom:1px solid rgba(47,79,79,.1);}',
        '.svb-course-panel__eyebrow{margin:0;font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#4A8D84;}',
        '.svb-course-panel__all{font-size:11px;font-weight:800;text-decoration:none;color:#2F4F4F;white-space:nowrap;}',
        '.svb-course-panel__grid{display:grid;grid-template-columns:1fr 1fr;gap:0 8px;padding-top:7px;}',
        '.svb-course-panel__item{display:block;padding:11px 12px;text-decoration:none;color:#2F4F4F;border-radius:6px;transition:background .14s ease;}',
        '.svb-course-panel__item:hover,.svb-course-panel__item:focus{background:#F2E6CF;outline:none;}',
        '.svb-course-panel__label{display:block;font-size:14px;font-weight:750;line-height:1.25;color:#2F4F4F;}',
        '.svb-course-panel__tag{display:block;margin-top:3px;font-size:10.5px;font-weight:550;line-height:1.3;color:#4A8D84;}',
        'a.svb-course-trigger[aria-expanded="true"]{color:#E8B496 !important;}',

        '@media (max-width:767px){',
            '.svb-course-panel{display:none !important;}',
            '#nav-toggle{position:relative;z-index:100003;transition:transform .24s ease;}',
            'body.svb-nav-open #nav-toggle{transform:rotate(90deg);}',
            '#nav-menu{display:none !important;}',
            '.svb-nav-backdrop{display:block;position:fixed;inset:0;z-index:100000;background:rgba(25,48,48,.52);opacity:0;visibility:hidden;transition:opacity .22s ease,visibility .22s;}',
            'body.svb-nav-open .svb-nav-backdrop{opacity:1;visibility:visible;}',
            '.svb-mobile-drawer{',
                'display:flex;position:fixed;top:0;right:0;bottom:0;z-index:100001;',
                'width:min(88vw,360px);padding:78px 18px 28px;',
                'flex-direction:column;align-items:stretch;overflow-y:auto;',
                'background:#FBF6EC;border-left:1px solid rgba(47,79,79,.12);',
                'box-shadow:-20px 0 60px -20px rgba(25,48,48,.42);',
                'font-family:"Montserrat",sans-serif;',
                'transform:translateX(105%);visibility:hidden;',
                'transition:transform .3s cubic-bezier(.16,1,.3,1),visibility .3s;',
            '}',
            'body.svb-nav-open .svb-mobile-drawer{transform:translateX(0);visibility:visible;}',
            '.svb-mobile-drawer__title{margin:0 14px 8px;font-size:10px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#4A8D84;}',
            '.svb-mobile-drawer>a{display:block;width:100%;margin:0;padding:14px;border:0;border-bottom:1px solid rgba(47,79,79,.09);border-radius:0;background:transparent;color:#2F4F4F;font-size:15px;font-weight:650;letter-spacing:0;text-align:left;text-decoration:none;text-transform:none;}',
            '.svb-mobile-drawer>a:hover,.svb-mobile-drawer>a:focus{background:rgba(242,230,207,.72);outline:none;}',
            '.svb-mobile-drawer>a[aria-label="English version"],.svb-mobile-drawer>a[aria-label="Version française"]{margin-top:15px;border:1px solid rgba(47,79,79,.15);border-radius:999px;text-align:center;}',
            '.svb-mobile-courses{border-bottom:1px solid rgba(47,79,79,.09);}',
            '.svb-mobile-courses__head{display:flex;align-items:center;justify-content:space-between;width:100%;min-height:52px;padding:14px;margin:0;border:0;background:transparent;color:#2F4F4F;font-family:"Montserrat",sans-serif;font-size:15px;font-weight:750;text-align:left;cursor:pointer;}',
            '.svb-mobile-courses__head:hover,.svb-mobile-courses__head:focus{background:rgba(242,230,207,.72);outline:none;}',
            '.svb-mobile-courses__chevron{width:17px;height:17px;flex:0 0 auto;transition:transform .22s ease;}',
            '.svb-mobile-courses[data-open="true"] .svb-mobile-courses__chevron{transform:rotate(180deg);}',
            '.svb-mobile-courses__body{max-height:0;overflow:hidden;padding-left:9px;transition:max-height .32s ease;}',
            '.svb-mobile-courses[data-open="true"] .svb-mobile-courses__body{max-height:940px;}',
            '.svb-mobile-courses__body a{display:block;padding:11px 12px;border-bottom:1px solid rgba(47,79,79,.06);color:#2F4F4F;text-decoration:none;}',
            '.svb-mobile-courses__body a:hover,.svb-mobile-courses__body a:focus{background:#F2E6CF;outline:none;}',
            '.svb-mobile-courses__label{display:block;font-size:13.5px;font-weight:700;line-height:1.25;}',
            '.svb-mobile-courses__tag{display:block;margin-top:2px;font-size:10.5px;font-weight:550;line-height:1.3;color:#4A8D84;}',
            '.svb-mobile-courses__all{padding:14px 12px !important;border-bottom:0 !important;color:#4A8D84 !important;font-size:11px !important;font-weight:850 !important;letter-spacing:.09em;text-transform:uppercase;}',
            'body.svb-nav-open{overflow:hidden;}',
        '}',
        '@media (prefers-reduced-motion:reduce){.svb-course-panel,.svb-mobile-drawer,.svb-nav-backdrop,.svb-mobile-courses__body,.svb-mobile-courses__chevron{transition:none !important;}}'
    ].join('');

    var panel = null;
    var currentTrigger = null;
    var hideTimer = 0;
    var drawer = null;
    var backdrop = null;

    function injectCSS() {
        if (document.getElementById('svb-course-nav-css')) return;
        var style = document.createElement('style');
        style.id = 'svb-course-nav-css';
        style.textContent = CSS;
        document.head.appendChild(style);
    }

    function normalizedPath(anchor) {
        try {
            return new URL(anchor.getAttribute('href') || '', location.origin).pathname.replace(/\/+$/, '');
        } catch (e) {
            return '';
        }
    }

    function isCoursesLink(anchor) {
        var label = (anchor.textContent || '').trim().toLowerCase();
        var path = normalizedPath(anchor);
        return label === 'cours' && (path === '/sessions' || path === '/sessions.html');
    }

    function courseItems(className) {
        var html = '';
        var prefix = className.replace(/__item$/, '');
        DISCIPLINES.forEach(function (discipline) {
            html += '<a class="' + className + '" href="' + discipline.href + '">' +
                '<span class="' + prefix + '__label">' + discipline.label + '</span>' +
                '<span class="' + prefix + '__tag">' + discipline.tag + '</span>' +
            '</a>';
        });
        return html;
    }

    function buildPanel() {
        if (panel) return panel;
        panel = document.createElement('div');
        panel.id = 'svb-course-panel';
        panel.className = 'svb-course-panel';
        panel.setAttribute('role', 'menu');
        panel.setAttribute('aria-label', 'Choisir une discipline SVB');
        panel.innerHTML =
            '<div class="svb-course-panel__head">' +
                '<p class="svb-course-panel__eyebrow">Choisir une discipline</p>' +
                '<a class="svb-course-panel__all" href="/sessions">Tous les cours →</a>' +
            '</div>' +
            '<div class="svb-course-panel__grid">' + courseItems('svb-course-panel__item') + '</div>';
        panel.addEventListener('mouseenter', cancelHide);
        panel.addEventListener('mouseleave', scheduleHide);
        document.body.appendChild(panel);
        return panel;
    }

    function positionPanel(trigger) {
        if (!panel) return;
        var rect = trigger.getBoundingClientRect();
        var width = panel.offsetWidth || Math.min(640, innerWidth - 24);
        var left = rect.left + rect.width / 2 - width / 2;
        left = Math.max(12, Math.min(left, innerWidth - width - 12));
        panel.style.left = left + 'px';
        panel.style.top = (rect.bottom + 10) + 'px';
        panel.style.maxHeight = Math.max(220, innerHeight - rect.bottom - 22) + 'px';
    }

    function showPanel(trigger) {
        if (innerWidth < 768) return;
        cancelHide();
        buildPanel();
        if (currentTrigger && currentTrigger !== trigger) currentTrigger.setAttribute('aria-expanded', 'false');
        currentTrigger = trigger;
        trigger.setAttribute('aria-expanded', 'true');
        positionPanel(trigger);
        requestAnimationFrame(function () {
            positionPanel(trigger);
            panel.setAttribute('data-open', 'true');
        });
    }

    function hidePanel() {
        if (panel) panel.removeAttribute('data-open');
        if (currentTrigger) currentTrigger.setAttribute('aria-expanded', 'false');
        currentTrigger = null;
    }

    function scheduleHide() {
        clearTimeout(hideTimer);
        hideTimer = setTimeout(hidePanel, 180);
    }

    function cancelHide() {
        clearTimeout(hideTimer);
    }

    function hydrateDesktopTrigger(anchor) {
        if (anchor.dataset.svbCourseHydrated === '1') return;
        anchor.dataset.svbCourseHydrated = '1';
        anchor.classList.add('svb-course-trigger');
        anchor.setAttribute('aria-haspopup', 'menu');
        anchor.setAttribute('aria-expanded', 'false');
        anchor.setAttribute('aria-controls', 'svb-course-panel');
        anchor.addEventListener('mouseenter', function () { showPanel(anchor); });
        anchor.addEventListener('mouseleave', scheduleHide);
        anchor.addEventListener('focus', function () { showPanel(anchor); });
        anchor.addEventListener('click', function (event) {
            var noHover = !window.matchMedia || !window.matchMedia('(hover:hover)').matches;
            if (innerWidth >= 768 && noHover) {
                event.preventDefault();
                if (panel && panel.getAttribute('data-open') === 'true' && currentTrigger === anchor) hidePanel();
                else showPanel(anchor);
            }
        });
    }

    function closeDrawer() {
        document.body.classList.remove('svb-nav-open');
        var toggle = document.getElementById('nav-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
        if (drawer) drawer.setAttribute('aria-hidden', 'true');
    }

    function openDrawer() {
        document.body.classList.add('svb-nav-open');
        var toggle = document.getElementById('nav-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'true');
        if (drawer) drawer.setAttribute('aria-hidden', 'false');
    }

    function buildCoursesAccordion() {
        var section = document.createElement('div');
        section.className = 'svb-mobile-courses';
        section.setAttribute('data-open', 'false');

        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'svb-mobile-courses__head';
        button.setAttribute('aria-expanded', 'false');
        button.innerHTML = 'Cours' +
            '<svg class="svb-mobile-courses__chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
            '<path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

        var body = document.createElement('div');
        body.className = 'svb-mobile-courses__body';
        body.innerHTML = courseItems('svb-mobile-courses__item') +
            '<a class="svb-mobile-courses__all" href="/sessions">Voir tous les cours →</a>';
        body.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', closeDrawer); });

        button.addEventListener('click', function () {
            var isOpen = section.getAttribute('data-open') === 'true';
            section.setAttribute('data-open', isOpen ? 'false' : 'true');
            button.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
        });

        section.appendChild(button);
        section.appendChild(body);
        return section;
    }

    function buildDrawer(menu) {
        drawer = document.createElement('nav');
        drawer.className = 'svb-mobile-drawer';
        drawer.setAttribute('role', 'navigation');
        drawer.setAttribute('aria-label', 'Menu principal mobile');
        drawer.setAttribute('aria-hidden', 'true');
        drawer.innerHTML = '<p class="svb-mobile-drawer__title">Explorer SVB</p>';

        menu.querySelectorAll('a').forEach(function (anchor) {
            if (isCoursesLink(anchor)) {
                drawer.appendChild(buildCoursesAccordion());
                return;
            }
            var clone = anchor.cloneNode(true);
            clone.removeAttribute('class');
            clone.addEventListener('click', closeDrawer);
            drawer.appendChild(clone);
        });
        document.body.appendChild(drawer);
    }

    function initMobileDrawer() {
        var toggle = document.getElementById('nav-toggle');
        var menu = document.getElementById('nav-menu');
        if (!toggle || !menu || toggle.dataset.svbMobileHydrated === '1') return;
        toggle.dataset.svbMobileHydrated = '1';

        backdrop = document.createElement('div');
        backdrop.className = 'svb-nav-backdrop';
        backdrop.setAttribute('aria-hidden', 'true');
        backdrop.addEventListener('click', closeDrawer);
        document.body.appendChild(backdrop);
        buildDrawer(menu);

        toggle.removeAttribute('onclick');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (document.body.classList.contains('svb-nav-open')) closeDrawer();
            else openDrawer();
        });
    }

    function init() {
        injectCSS();
        document.querySelectorAll('a[href]').forEach(function (anchor) {
            if (isCoursesLink(anchor)) hydrateDesktopTrigger(anchor);
        });
        initMobileDrawer();
    }

    document.addEventListener('click', function (event) {
        if (!panel || !panel.hasAttribute('data-open')) return;
        if (panel.contains(event.target)) return;
        if (currentTrigger && currentTrigger.contains(event.target)) return;
        hidePanel();
    });
    document.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape') return;
        hidePanel();
        closeDrawer();
    });
    window.addEventListener('scroll', function () {
        if (panel && panel.hasAttribute('data-open') && currentTrigger) positionPanel(currentTrigger);
    }, { passive: true });
    window.addEventListener('resize', function () {
        if (innerWidth >= 768) closeDrawer();
        if (panel && panel.hasAttribute('data-open') && currentTrigger) positionPanel(currentTrigger);
    });

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    window.SvbCourseNav = { init: init, disciplines: DISCIPLINES, close: closeDrawer };
})();
