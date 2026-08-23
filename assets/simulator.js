/*!
 * Studio SVB — Simulateur d'abonnement par discipline
 * Drop-in widget : <div data-svb-simulator="pilates-reformer"></div>
 *
 * Disciplines supportées :
 *   pilates-reformer, crossformer, cross-training, yoga, boxe, barre
 *
 * Auto-init au DOMContentLoaded.
 * Réversible via SvbSimulator.render(el) si injection dynamique.
 */
(function () {
    'use strict';

    // Passes disponibles. Les prix ne sont plus affiches sur le site
    // (grille tarifaire visible uniquement dans l'espace client SVB).
    var PASSES = {
        reformer:    { label: "Pass Reformer",    duration: "50 min",     url: "reformer",    includes: ["Pilates Reformer"] },
        crossformer: { label: "Pass Crossformer", duration: "50 min",     url: "crossformer", includes: ["Crossformer"] },
        fullformer:  { label: "Pass Full Former", duration: "50 min",     url: "fullformer",  includes: ["Pilates Reformer", "Crossformer"], comboOf: "Reformer + Crossformer" },
        cross:       { label: "Pass Cross",       duration: "55 min",     url: "cross",       includes: ["Cross Training", "Cross Rox", "Cross Core", "Cross Body", "Cross Yoga"] },
        focus:       { label: "Pass Focus",       duration: "55-60 min",  url: "focus",       includes: ["Yoga Vinyasa", "Hatha Flow", "Classic Pilates", "Power Pilates", "Boxe Anglaise", "Core & Stretch"] },
        full:        { label: "Pass Full",        duration: "55-60 min",  url: "full",        includes: ["Cross Training", "Cross Rox", "Cross Core", "Cross Body", "Cross Yoga", "Yoga Vinyasa", "Hatha Flow", "Classic Pilates", "Power Pilates", "Boxe Anglaise", "Core & Stretch"], comboOf: "Cross + Focus" }
    };

    // Discipline slug pour data-discipline sur le CTA .js-buy (ouvre le modal
    // web-customer.studiosvb.com au lieu de naviguer). Le tunnel externe Mollie
    // n'existe plus, on ouvre directement l'appli de reservation embarquee.
    var TRIAL_DISCIPLINE = {
        reformer:    "reformer",
        crossformer: "crossformer",
        other:       "cross_yoga_pilates"
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
                    '<h3 class="svb-sim-title">Trouve ta formule.</h3>' +
                    '<p class="svb-sim-sub">Choisis ta formule et ta fréquence. Le tarif à jour s\'affiche dans l\'espace client au moment de la réservation.</p>' +
                '</div>' +
                passButtonsHtml +
                '<div class="svb-sim-sessions">' +
                    '<label class="svb-sim-label">Combien de séances de ' + cfg.label + ' par mois&nbsp;?</label>' +
                    sessionsHtml +
                    '<div class="svb-sim-week" data-week></div>' +
                '</div>' +
                '<div class="svb-sim-result">' +
                    '<div class="svb-sim-details" data-details></div>' +
                '</div>' +
                '<div class="svb-sim-includes-wrap" data-includes></div>' +
                '<a class="svb-sim-cta js-buy" data-cta href="#" data-booking-path="/place/place_svb-lavandieres/subscription-plans">' +
                    'Voir le tarif dans l\'espace client →' +
                '</a>' +
                '<a class="svb-sim-cta js-buy" data-cta-trial style="margin-top:8px;background:transparent;color:#4A8D84;border:2px solid #4A8D84;" href="#" data-discipline="' + (TRIAL_DISCIPLINE[cfg.trial] || TRIAL_DISCIPLINE.other) + '" data-label="Essai ' + cfg.label + '" data-amount="30 €">' +
                    'Ou faire une séance d\'essai à 30 €' +
                '</a>' +
                '<p class="svb-sim-foot">Essai à 30 € · 15 € remboursés si inscription · Small group · Pause vacances incluse</p>' +
            '</div>';

        var state = { pass: initialPass, sessions: DEFAULT_SESSIONS };
        var $details  = el.querySelector('[data-details]');
        var $week     = el.querySelector('[data-week]');
        var $includes = el.querySelector('[data-includes]');

        function update() {
            var pass = PASSES[state.pass];
            $details.innerHTML =
                '<strong>' + pass.label + '</strong> — ' +
                state.sessions + ' séance' + (state.sessions > 1 ? 's' : '') +
                ' par mois, au choix parmi les disciplines ci-dessous.<br>' +
                'Durée de chaque séance : ' + pass.duration;
            $week.textContent = rhythmText(state.sessions);
            $includes.innerHTML = buildIncludesHtml(pass, cfg.highlight);
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
