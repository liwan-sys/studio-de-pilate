/*!
 * Studio SVB — Simulateur d'abonnement par discipline
 * Drop-in widget : <div data-svb-simulator="pilates-reformer"></div>
 *
 * Disciplines supportées :
 *   pilates-reformer, crossformer, cross-training, yoga, boxe, barre, afrodance
 *
 * Auto-init au DOMContentLoaded.
 * Réversible via SvbSimulator.render(el) si injection dynamique.
 */
(function () {
    'use strict';

    // Grille tarifaire officielle — miroir de /tarifs.html
    // `includes` = disciplines réellement accessibles avec ce pass (miroir /sessions.html)
    var PASSES = {
        reformer: {
            label: "Pass Reformer",
            duration: "50 min",
            url: "reformer",
            prices: { 2: 70.30, 4: 136.30, 6: 198.30, 8: 256.30, 10: 310.30, 12: 360.30 },
            includes: ["Pilates Reformer"]
        },
        crossformer: {
            label: "Pass Crossformer",
            duration: "50 min",
            url: "crossformer",
            prices: { 2: 78.30, 4: 152.30, 6: 222.30, 8: 288.30, 10: 350.30, 12: 408.30 },
            includes: ["Crossformer"]
        },
        fullformer: {
            label: "Pass Full Former",
            duration: "50 min",
            url: "fullformer",
            prices: { 2: 74.30, 4: 144.30, 6: 210.30, 8: 272.30, 10: 330.30, 12: 384.30 },
            includes: ["Pilates Reformer", "Crossformer"],
            comboOf: "Reformer + Crossformer"
        },
        cross: {
            label: "Pass Cross",
            duration: "55 min",
            url: "cross",
            prices: { 2: 30.30, 4: 60.30, 6: 90.30, 8: 116.30, 10: 145.30, 12: 168.30 },
            includes: ["Cross Training", "Cross Rox", "Cross Core", "Cross Body", "Cross Yoga"]
        },
        focus: {
            label: "Pass Focus",
            duration: "55-60 min",
            url: "focus",
            prices: { 2: 36.30, 4: 72.30, 6: 105.30, 8: 136.30, 10: 165.30, 12: 192.30 },
            includes: ["Yoga Vinyasa", "Hatha Flow", "Classic Pilates", "Power Pilates", "Boxe Anglaise", "Afrodance'All", "Core & Stretch"]
        },
        full: {
            label: "Pass Full",
            duration: "55-60 min",
            url: "full",
            prices: { 2: 40.30, 4: 80.30, 6: 115.30, 8: 150.30, 10: 180.30, 12: 210.30 },
            includes: ["Cross Training", "Cross Rox", "Cross Core", "Cross Body", "Cross Yoga", "Yoga Vinyasa", "Hatha Flow", "Classic Pilates", "Power Pilates", "Boxe Anglaise", "Afrodance'All", "Core & Stretch"],
            comboOf: "Cross + Focus"
        }
    };

    // URLs des seances d'essai par discipline (toutes vers /essai = tunnel Mollie + tracking GA4/Meta)
    // Le param ?d= permet a essai.html de pre-selectionner la discipline si voulu plus tard.
    var TRIAL_URL = {
        reformer:    "/essai?d=reformer",
        crossformer: "/essai?d=crossformer",
        other:       "/essai?d=cross_yoga_pilates"
    };

    // Discipline → passes pertinents (ordre = priorité d'affichage)
    // `highlight` = discipline à mettre en avant comme "celle que tu cherches"
    // `trial` = clé dans TRIAL_URL pour le bouton "Faire une séance d'essai"
    var DISCIPLINE_MAP = {
        "pilates-reformer": {
            label: "Pilates Reformer",
            highlight: "Pilates Reformer",
            passes: ["reformer", "fullformer"],
            trial: "reformer"
        },
        "crossformer": {
            label: "Crossformer",
            highlight: "Crossformer",
            passes: ["crossformer", "fullformer"],
            trial: "crossformer"
        },
        "cross-training": {
            label: "Cross Training",
            highlight: "Cross Training",
            passes: ["cross", "full"],
            trial: "other"
        },
        "yoga": {
            label: "Yoga",
            highlight: "Yoga Vinyasa",
            passes: ["focus", "full"],
            trial: "other"
        },
        "boxe": {
            label: "Boxe Anglaise",
            highlight: "Boxe Anglaise",
            passes: ["focus", "full"],
            trial: "other"
        },
        "pilates": {
            label: "Pilates",
            highlight: "Classic Pilates",
            passes: ["focus", "full"],
            trial: "other"
        },
        "afrodance": {
            label: "Afrodance",
            highlight: "Afrodance'All",
            passes: ["focus", "full"],
            trial: "other"
        }
    };

    var SESSIONS_OPTS = [2, 4, 6, 8, 10, 12];
    var DEFAULT_SESSIONS = 4;

    function fmtEuro(n) {
        return n.toFixed(2).replace('.', ',') + ' €';
    }

    function fmtEuroInt(n) {
        return Math.round(n) + ' €';
    }

    function rhythmText(sessions) {
        var perWeek = sessions / 4.33;
        if (perWeek < 0.6) return "≈ 1 séance toutes les 2 semaines";
        if (perWeek <= 1.15) return "≈ 1 séance par semaine";
        if (perWeek <= 1.7) return "≈ 1,5 séance par semaine";
        if (perWeek <= 2.3) return "≈ 2 séances par semaine";
        if (perWeek <= 2.8) return "≈ 2-3 séances par semaine";
        return "≈ " + Math.round(perWeek) + " séances par semaine";
    }

    // Construit la liste HTML des disciplines incluses, avec mise en avant de la discipline courante
    function buildIncludesHtml(pass, highlight) {
        if (!pass.includes || pass.includes.length === 0) return '';
        var items = pass.includes.map(function (d) {
            var isHighlight = (d === highlight);
            return '<li class="svb-sim-inc-item' + (isHighlight ? ' highlight' : '') + '">' +
                (isHighlight ? '★ ' : '') + d +
                '</li>';
        }).join('');
        var headline = pass.includes.length === 1
            ? 'Discipline incluse'
            : pass.includes.length + ' disciplines incluses avec ce pass';
        return '<div class="svb-sim-includes">' +
            '<div class="svb-sim-inc-head">' + headline + '</div>' +
            '<ul class="svb-sim-inc-list">' + items + '</ul>' +
            '</div>';
    }

    function render(el) {
        var key = el.getAttribute('data-svb-simulator');
        if (!key) return;
        var cfg = DISCIPLINE_MAP[key];
        if (!cfg) {
            console.warn('[SvbSimulator] discipline inconnue :', key);
            return;
        }

        var initialPass = cfg.passes[0];

        var passButtonsHtml = '';
        if (cfg.passes.length > 1) {
            passButtonsHtml = '<div class="svb-sim-passes" role="tablist" aria-label="Choisir la formule">' +
                cfg.passes.map(function (p, i) {
                    var pass = PASSES[p];
                    return '<button type="button" class="svb-sim-pass-btn' + (i === 0 ? ' active' : '') + '" data-pass="' + p + '" role="tab" aria-selected="' + (i === 0 ? 'true' : 'false') + '">' +
                        '<span class="svb-sim-pass-label">' + pass.label + '</span>' +
                        (pass.comboOf ? '<span class="svb-sim-pass-inc">' + pass.comboOf + '</span>' : '') +
                        '</button>';
                }).join('') +
                '</div>';
        }

        var sessionsHtml = '<div class="svb-sim-sessions-opts" role="group" aria-label="Nombre de séances par mois">' +
            SESSIONS_OPTS.map(function (s) {
                return '<button type="button" class="svb-sim-session-btn' + (s === DEFAULT_SESSIONS ? ' active' : '') + '" data-sessions="' + s + '">' + s + '</button>';
            }).join('') +
            '</div>';

        el.innerHTML =
            '<div class="svb-sim-wrap">' +
                '<div class="svb-sim-head">' +
                    '<span class="svb-sim-pill">Simulateur abonnement</span>' +
                    '<h3 class="svb-sim-title">Combien ça coûte pour toi ?</h3>' +
                    '<p class="svb-sim-sub">Choisis ta formule et ta fréquence. Le prix s\'affiche en 1 clic. Zéro calcul compliqué.</p>' +
                '</div>' +
                passButtonsHtml +
                '<div class="svb-sim-sessions">' +
                    '<label class="svb-sim-label">Combien de séances de ' + cfg.label + ' par mois&nbsp;?</label>' +
                    sessionsHtml +
                    '<div class="svb-sim-week" data-week></div>' +
                '</div>' +
                '<div class="svb-sim-result">' +
                    '<div class="svb-sim-price-row">' +
                        '<div class="svb-sim-price-box">' +
                            '<div class="svb-sim-price-tag">Par mois</div>' +
                            '<div class="svb-sim-price-monthly" data-monthly>—</div>' +
                        '</div>' +
                        '<div class="svb-sim-price-box">' +
                            '<div class="svb-sim-price-tag">Par séance</div>' +
                            '<div class="svb-sim-price-unit" data-unit>—</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="svb-sim-details" data-details></div>' +
                '</div>' +
                '<div class="svb-sim-includes-wrap" data-includes></div>' +
                '<a class="svb-sim-cta" data-cta href="' + (TRIAL_URL[cfg.trial] || TRIAL_URL.other) + '" target="_blank" rel="noopener noreferrer">' +
                    'Faire une séance d\'essai →' +
                '</a>' +
                '<p class="svb-sim-foot">Essai à 30 € · 15 € remboursés si inscription · Pas d\'engagement annuel obligatoire · Résiliation flexible</p>' +
            '</div>';

        var state = { pass: initialPass, sessions: DEFAULT_SESSIONS };
        var $monthly  = el.querySelector('[data-monthly]');
        var $unit     = el.querySelector('[data-unit]');
        var $details  = el.querySelector('[data-details]');
        var $week     = el.querySelector('[data-week]');
        var $cta      = el.querySelector('[data-cta]');
        var $includes = el.querySelector('[data-includes]');

        function update() {
            var pass = PASSES[state.pass];
            var price = pass.prices[state.sessions];
            var perS = price / state.sessions;
            $monthly.textContent = fmtEuro(price);
            $unit.textContent = fmtEuroInt(perS) + ' / séance';
            $details.innerHTML =
                '<strong>' + pass.label + '</strong> — ' +
                state.sessions + ' séance' + (state.sessions > 1 ? 's' : '') +
                ' par mois, au choix parmi les disciplines ci-dessous.<br>' +
                'Durée de chaque séance : ' + pass.duration;
            $week.textContent = rhythmText(state.sessions);
            $includes.innerHTML = buildIncludesHtml(pass, cfg.highlight);
            // Le CTA est fixe : lien Sportigo vers la séance d'essai. On ne change pas l'href selon le pass.
        }

        Array.prototype.forEach.call(el.querySelectorAll('.svb-sim-pass-btn'), function (btn) {
            btn.addEventListener('click', function () {
                Array.prototype.forEach.call(el.querySelectorAll('.svb-sim-pass-btn'), function (b) {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
                state.pass = btn.getAttribute('data-pass');
                update();
            });
        });

        Array.prototype.forEach.call(el.querySelectorAll('.svb-sim-session-btn'), function (btn) {
            btn.addEventListener('click', function () {
                Array.prototype.forEach.call(el.querySelectorAll('.svb-sim-session-btn'), function (b) {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
                state.sessions = parseInt(btn.getAttribute('data-sessions'), 10);
                update();
            });
        });

        update();
    }

    function init() {
        var els = document.querySelectorAll('[data-svb-simulator]');
        Array.prototype.forEach.call(els, render);
    }

    // Export minimal pour ré-init après injection dynamique
    window.SvbSimulator = { render: render, init: init, PASSES: PASSES, DISCIPLINE_MAP: DISCIPLINE_MAP };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
