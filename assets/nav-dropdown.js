/*!
 * Studio SVB - navigation principale.
 * Le lien Cours reste un lien direct vers la page qui regroupe les disciplines.
 */
(function () {
    'use strict';

    var CSS = [
        '.svb-mobile-drawer,.svb-nav-backdrop{display:none;}',

        '@media (max-width:767px){',
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
            'body.svb-nav-open{overflow:hidden;}',
        '}',
        '@media (prefers-reduced-motion:reduce){.svb-mobile-drawer,.svb-nav-backdrop{transition:none !important;}}'
    ].join('');

    var drawer = null;
    var backdrop = null;

    function injectCSS() {
        if (document.getElementById('svb-course-nav-css')) return;
        var style = document.createElement('style');
        style.id = 'svb-course-nav-css';
        style.textContent = CSS;
        document.head.appendChild(style);
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

    function buildDrawer(menu) {
        drawer = document.createElement('nav');
        drawer.className = 'svb-mobile-drawer';
        drawer.setAttribute('role', 'navigation');
        drawer.setAttribute('aria-label', 'Menu principal mobile');
        drawer.setAttribute('aria-hidden', 'true');
        drawer.innerHTML = '<p class="svb-mobile-drawer__title">Explorer SVB</p>';

        menu.querySelectorAll('a').forEach(function (anchor) {
            var clone = anchor.cloneNode(true);
            clone.removeAttribute('class');
            clone.removeAttribute('aria-haspopup');
            clone.removeAttribute('aria-expanded');
            clone.removeAttribute('aria-controls');
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
        initMobileDrawer();
    }

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') closeDrawer();
    });
    window.addEventListener('resize', function () {
        if (innerWidth >= 768) closeDrawer();
    });

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    window.SvbCourseNav = { init: init, close: closeDrawer };
})();
