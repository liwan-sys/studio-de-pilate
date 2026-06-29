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
        fullformer: {
            label: "Pass Full Former",
            duration: "50 min",
            url: "fullformer",
            prices: { 4: 150, 8: 290, 10: 360 },
            includes: ["Pilates Reformer", "Crossformer"],
            comboOf: "Reformer + Crossformer"
        },
        full: {
            label: "Pass Full",
            duration: "55 min",
            url: "full",
            prices: { 4: 100, 8: 200, 10: 250 },
            includes: ["Cross Training", "Cross Rox", "Cross Core", "Cross Body", "Cross Yoga", "Yoga Vinyasa", "Hatha Flow", "Classic Pilates", "Power Pilates", "Boxe Anglaise", "Afrodance'All", "Core & Stretch"],
            comboOf: "Cross + Focus"
        },
        allaccess: {
            label: "SVB All Access",
            duration: "50-55 min selon discipline",
            url: "allaccess",
            prices: { 1: 320 },
            includes: ["Pilates Reformer", "Crossformer", "Cross Training", "Cross Rox", "Cross Core", "Cross Body", "Cross Yoga", "Yoga Vinyasa", "Hatha Flow", "Classic Pilates", "Power Pilates", "Boxe Anglaise", "Afrodance'All", "Core & Stretch"],
            comboOf: "Tout le studio",
            unlimited: true
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
            passes: ["fullformer", "allaccess"],
            trial: "reformer"
        },
        "crossformer": {
            label: "Crossformer",
            highlight: "Crossformer",
            passes: ["fullformer", "allaccess"],
            trial: "crossformer"
        },
        "cross-training": {
            label: "Cross Training",
            highlight: "Cross Training",
            passes: ["full", "allaccess"],
            trial: "other"
        },
        "yoga": {
            label: "Yoga",
            highlight: "Yoga Vinyasa",
            passes: ["full", "allaccess"],
            trial: "other"
        },
        "boxe": {
            label: "Boxe Anglaise",
            highlight: "Boxe Anglaise",
            passes: ["full", "allaccess"],
            trial: "other"
        },
        "pilates": {
            label: "Pilates",
            highlight: "Classic Pilates",
            passes: ["full", "allaccess"],
            trial: "other"
        },
        "afrodance": {
            label: "Afrodance",
            highlight: "Afrodance'All",
            passes: ["full", "allaccess"],
            trial: "other"
        }
    };

    var SESSIONS_OPTS = [4, 8, 10];
    var DEFAULT_SESSIONS = 8;

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
            var price = pass.unlimited ? pass.prices[1] : pass.prices[state.sessions];
            var perS = pass.unlimited ? null : price / state.sessions;
            $monthly.textContent = fmtEuro(price);
            $unit.textContent = pass.unlimited ? 'Selon planning' : fmtEuroInt(perS) + ' / séance';
            $details.innerHTML = pass.unlimited
                ? '<strong>' + pass.label + '</strong> — accès à tous les cours SVB selon disponibilités du planning.<br>Réservation obligatoire, sans garantie de place sur un cours ou horaire spécifique.'
                : '<strong>' + pass.label + '</strong> — ' +
                    state.sessions + ' séance' + (state.sessions > 1 ? 's' : '') +
                    ' par mois, au choix parmi les disciplines ci-dessous.<br>' +
                    'Durée de chaque séance : ' + pass.duration;
            $week.textContent = pass.unlimited ? 'Accès complet · places selon disponibilité' : rhythmText(state.sessions);
            $includes.innerHTML = buildIncludesHtml(pass, cfg.highlight);
            Array.prototype.forEach.call(el.querySelectorAll('.svb-sim-session-btn'), function (btn) {
                btn.style.display = pass.unlimited ? 'none' : '';
            });
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
