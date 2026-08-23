#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const truth = JSON.parse(fs.readFileSync(path.join(root, 'content/commercial-truth.json'), 'utf8'));
const errors = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function fail(message) {
  errors.push(message);
}

function requireText(file, expected) {
  if (!read(file).includes(expected)) fail(`${file} doit contenir : ${expected}`);
}

function forbidText(file, pattern, label = pattern.toString()) {
  if (pattern.test(read(file))) fail(`${file} contient une ancienne information : ${label}`);
}

function attributeValue(tag, name) {
  if (!tag) return undefined;
  return tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'))?.[2];
}

function htmlFileForUrl(url) {
  const pathname = new URL(url).pathname;
  if (pathname === '/') return 'index.html';
  if (pathname === '/en/') return 'en/index.html';
  return `${pathname.slice(1)}.html`;
}

function allSourceHtml(directory = root, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'dist', 'node_modules', 'design-system'].includes(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) allSourceHtml(absolute, files);
    if (entry.isFile() && entry.name.endsWith('.html')) files.push(absolute);
  }
  return files;
}

const sourceHtmlFiles = allSourceHtml();
const publicCopy = sourceHtmlFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');

if (fs.existsSync(path.join(root, 'parrainage.html'))) {
  fail('La page parrainage supprimée ne doit pas être recréée.');
}
if (/href=["']\/parrainage(?:["'/?#])/i.test(publicCopy)) {
  fail('Un lien public pointe encore vers la page parrainage supprimée.');
}
forbidText('sitemap.xml', /studiosvb\.com\/parrainage/i, 'page parrainage dans le sitemap');
forbidText('llms.txt', /studiosvb\.com\/parrainage/i, 'page parrainage communiquée aux IA');
requireText('_redirects', '/parrainage                             /tarifs 301!');

for (const retired of [...truth.retired.courses, ...truth.retired.services, ...truth.retired.passes]) {
  const escaped = retired.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/-/g, '[- ]');
  if (new RegExp(`\\b${escaped}\\b`, 'i').test(publicCopy)) {
    fail(`Une offre retirée est encore présente dans les pages publiques : ${retired}`);
  }
}

const globalForbidden = [
  [/pause vacances incluse/i, 'pause vacances incluse'],
  [/no-commitment option from\s*€?12[.,]90/i, 'SVB Boost présenté comme un abonnement autonome'],
  [/Reformer Open|Reformer Basics|Reformer Tone|Yoga Softness|Yoga Balance|Cross Rock/i, 'ancien intitulé du planning anglais'],
  [/\b\d{2,}\s+(?:avis|(?:cumulative\s+)?Google reviews?)\b/i, 'nombre d’avis Google copié en dur'],
  [/\bits\s+\d{2,}\s+reviews\b|\(\d{2,}\s+(?:avis|reviews)\)/i, 'nombre d’avis Google copié en dur'],
  [/horaires d['’]accueil|reception hours/i, 'horaires d’accueil fixes'],
  [/réponse sous (?:1 h|24h)|response within 1 hour/i, 'délai de réponse non garanti'],
  [/dans les 3 jours(?! suivant)|within 3 days(?! after)/i, 'délai de conversion présenté sans point de départ'],
  [/⚠ï¸|Ã.|â€|â€™|â€œ|â€/u, 'texte mal encodé'],
];
for (const [pattern, label] of globalForbidden) {
  if (pattern.test(publicCopy)) fail(`Ancienne information trouvée : ${label}`);
}

requireText('index.html', 'Le Pass Try coûte 30 € et comprend deux séances dans deux disciplines différentes');
requireText('index.html', 'Pour Limitless, 1 no-show bloque l\'abonnement pendant 1 semaine.');
requireText('index.html', 'data-launch-deadline="2026-09-30T23:59:00+02:00"');
requireText('index.html', "Offre valable jusqu'au 30/09/2026 à 23h59");
requireText('tarifs.html', 'Une séance d\'essai achetée et une séance offerte dans une autre discipline.');
requireText('tarifs.html', 'data-launch-deadline="2026-09-30T23:59:00+02:00"');
requireText('tarifs.html', '"priceValidUntil": "2026-09-30"');
requireText('en/tarifs.html', 'data-launch-deadline="2026-09-30T23:59:00+02:00"');
requireText('en/tarifs.html', '"priceValidUntil": "2026-09-30"');
forbidText('index.html', /21 septembre 2026|21\/09\/2026|2026-09-21/i, 'ancienne date de fin Limitless');
forbidText('tarifs.html', /21 septembre 2026|21\/09\/2026|2026-09-21/i, 'ancienne date de fin Limitless');
forbidText('en/tarifs.html', /21 September 2026|2026-09-21/i, 'ancienne date de fin Limitless en anglais');
requireText('tarifs.html', '<dt>4 séances / mois</dt><dd>80,50 €</dd>');
requireText('tarifs.html', '<dt>4 séances / mois</dt><dd>140,50 €</dd>');
requireText('tarifs.html', '<strong>300 €</strong><small>/ mois</small>');
requireText('tarifs.html', '5 sessions différentes au choix pour trouver ta routine.');
requireText('tarifs.html', "dans les 3 jours suivant le dernier essai");
requireText('tarifs.html', "dans les 3 jours suivant l'expiration du pass");
requireText('en/tarifs.html', 'Five different sessions of your choice');
requireText('en/tarifs.html', 'within 3 days after the final trial');
requireText('en/tarifs.html', 'within 3 days after the pass expires');
requireText('faq.html', 'jusqu\'à 1 h avant');
requireText('faq.html', 'jusqu\'à 24 h avant');
requireText('faq.html', '1 no-show bloque l\'abonnement pendant 1 semaine');
requireText('faq.html', '<strong>Résiliation :</strong> par email avec 1 mois de préavis');
requireText('faq.html', 'absence d\'au moins 10 jours');
requireText('faq.html', 'sur justificatif médical');
requireText('tarifs.html', 'Valable une seule fois par personne');
requireText('tarifs.html', 'Non compatible avec SVB Limitless');
requireText('en/tarifs.html', 'Available once per person');
requireText('en/tarifs.html', 'Not available with SVB Limitless');
requireText('llms.txt', '**SVB Boost** : option à 12,90 € par mois');
requireText('studio.html', 'https://web-customer.studiosvb.com/place/place_svb-lavandieres/schedule');
requireText('studio.html', 'https://web-customer.studiosvb.com/place/place_svb-parc-docks/schedule');
requireText('en/studio.html', 'https://web-customer.studiosvb.com/place/place_svb-lavandieres/schedule');
requireText('en/studio.html', 'https://web-customer.studiosvb.com/place/place_svb-parc-docks/schedule');
forbidText('studio.html', /zéro crédit perdu/i, 'promesse absolue sur la conservation des crédits');
forbidText('en/studio.html', /zero credits lost/i, 'promesse absolue sur la conservation des crédits');

forbidText('essai.html', /Une séance par discipline|1 séance\s*\/\s*discipline/i, 'Pass Starter limité à une séance par discipline');
requireText('essai.html', '5 séances différentes au choix · 1 mois');
requireText('pilates-reformer-saint-ouen.html', '9 personnes maximum');
forbidText('pilates-reformer-saint-ouen.html', /8 personnes maximum/i, 'mauvaise jauge Reformer');
requireText('yoga-saint-ouen.html', 'Parc des Docks');
requireText('pourquoi-svb.html', "à 7 minutes à pied l'un de l'autre");
forbidText('pourquoi-svb.html', /Les 3 erreurs|LES ERREURS QUE PERSONNE CORRIGE/i, 'ancienne section des trois erreurs');
requireText('equipe.html', 'La Team SVB se prépare.');
requireText('en/equipe.html', 'The SVB team is getting ready.');
forbidText('equipe.html', /class="coach-card/i, 'anciens profils de la Team');
forbidText('en/equipe.html', /class="coach-card/i, 'anciens profils de la Team en anglais');

for (const course of [
  'Pilates Reformer',
  'Flow Reformer',
  'Crossformer',
  'Crossformer Challenger',
  'Cross Training',
  'Cross Rox',
  'Cross Core',
  'Cross Body',
  'Cross Yoga',
  'Yoga Vinyasa',
  'Pilates Classique',
  'Power Pilates',
  'Pilates Barre',
  'Stretch Mobility',
  'Boxe Anglaise',
  'Yoga Kids',
]) {
  requireText('sessions.html', course);
}
requireText('sessions.html', 'Studio Parc des Docks');
requireText('sessions.html', 'Studio Cours des Lavandières');
forbidText('sessions.html', /Studio Mail André Breton/i, 'adresse utilisée comme nom de studio');
forbidText('sessions.html', /Coaching Individuel|Coaching Duo/i, 'coaching affiché parmi les cours collectifs');

const sessionsCatalogue = read('sessions.html');
const sessionCardCount = (sessionsCatalogue.match(/<article\b[^>]*\bclass="session-card"/g) || []).length;
const sessionMediaCount = (sessionsCatalogue.match(/class="session-card__media"/g) || []).length;
const sessionBodyCount = (sessionsCatalogue.match(/class="session-card__body"/g) || []).length;
const sessionVideoCount = (sessionsCatalogue.match(/<video\b/g) || []).length;
if (sessionCardCount !== 16) fail(`sessions.html doit afficher 16 cartes de cours homogènes, pas ${sessionCardCount}.`);
if (sessionMediaCount !== sessionCardCount) fail('Chaque carte de cours doit avoir un média de même format.');
if (sessionBodyCount !== sessionCardCount) fail('Chaque carte de cours doit utiliser la même structure de contenu.');
if (sessionVideoCount < 5) fail('Les vidéos Crossformer, Reformer, Cross Training, Cross Yoga et Boxe doivent rester dans les cartes.');
for (const video of [
  'crossformer-immersion.mp4',
  'reformer-card-v2.mp4',
  'cross-training-immersion.mp4',
  'cross-yoga-card.mp4',
  'boxe-card.mp4',
]) {
  requireText('sessions.html', video);
}
requireText('sessions.html', 'Version intense');
forbidText('sessions.html', /<div class="session-card"/i, 'ancienne structure hétérogène des cartes de cours');

for (const course of ['Pilates Reformer', 'Flow Reformer', 'Crossformer', 'Crossformer Challenger']) {
  requireText('studio-cours-des-lavandieres.html', course);
}
for (const course of ['Cross Training', 'Cross Yoga', 'Pilates Classique', 'Power Pilates', 'Pilates Barre', 'Stretch Mobility', 'Boxe anglaise', 'Yoga Kids']) {
  requireText('studio-parc-des-docks.html', course);
}
forbidText('studio-cours-des-lavandieres.html', /Pilates au sol|Yoga Vinyasa|Hatha Flow|Yin Yoga|Core &(?:amp;|) Stretch/i, 'discipline attribuée au mauvais studio');
forbidText('studio-parc-des-docks.html', /Coaching individuel|Coaching duo/i, 'coaching affiché dans la liste des cours du Parc des Docks');

const navCourses = read('assets/nav-dropdown.js');
for (const course of ['Reformer', 'Crossformer', 'Cross Training', 'Pilates', 'Yoga', 'Stretch Mobility', 'Boxe', 'Yoga Kids']) {
  if (!navCourses.includes(course)) fail(`Le menu Cours doit contenir : ${course}`);
}
if (/Afrodance|Training Kids|Hatha/i.test(navCourses)) fail('Le menu Cours contient encore une discipline retirée.');

const sitemap = read('sitemap.xml');
const sitemapUrls = [...sitemap.matchAll(/<loc>(https:\/\/studiosvb\.com\/[^<]*)<\/loc>/g)].map((match) => match[1]);
for (const url of sitemapUrls) {
  const file = htmlFileForUrl(url);
  const html = read(file);
  const footerCount = (html.match(/<footer\b/gi) || []).length;
  if (footerCount !== 1) fail(`${file} doit avoir exactement un pied de page, pas ${footerCount}.`);
  if (!html.includes('Santez vous bien,<br>le bien-être au quotidien.')) {
    fail(`${file} n'affiche pas le slogan validé dans son pied de page.`);
  }
}

const standardNavPages = [
  'index.html',
  'sessions.html',
  'tarifs.html',
  'sport-debutant-saint-ouen.html',
  'sport-femme-saint-ouen.html'
];
for (const file of standardNavPages) {
  const html = read(file);
  for (const href of ['/sessions', '/studio', '/tarifs', '/equipe', '/faq', '/contact']) {
    if (!html.includes(`href="${href}"`)) fail(`${file} n'a pas le lien de navigation ${href}.`);
  }
}

const essai = read('essai.html');
if (!/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(essai)) {
  fail('essai.html doit rester noindex car cette page est réservée aux campagnes.');
}
if (sitemap.includes('https://studiosvb.com/essai')) fail('/essai ne doit pas être dans le sitemap.');
for (const file of sourceHtmlFiles) {
  const relative = path.relative(root, file);
  if (relative === 'essai.html') continue;
  if (/href=["'](?:https:\/\/studiosvb\.com)?\/essai(?:[?#/"'])/i.test(fs.readFileSync(file, 'utf8'))) {
    fail(`${relative} contient un lien interne vers la landing page publicitaire /essai.`);
  }
}

const allowedBookingPaths = new Set([
  '/place/place_svb-lavandieres/packs',
  '/place/place_svb-lavandieres/subscription-plans',
  '/place/place_svb-parc-docks/subscription-plans',
]);
const bookingScriptVersions = new Set();
const sharedScriptVersions = new Set();
const sharedStyleVersions = new Set();
const tailwindStyleVersions = new Set();
for (const file of sourceHtmlFiles) {
  const relative = path.relative(root, file);
  const html = fs.readFileSync(file, 'utf8');

  for (const match of html.matchAll(/svb-booking\.js\?v=([A-Za-z0-9._-]+)/g)) {
    bookingScriptVersions.add(match[1]);
  }
  for (const match of html.matchAll(/assets\/svb\.js\?v=([A-Za-z0-9._-]+)/g)) {
    sharedScriptVersions.add(match[1]);
  }
  for (const match of html.matchAll(/assets\/svb\.css\?v=([A-Za-z0-9._-]+)/g)) {
    sharedStyleVersions.add(match[1]);
  }
  for (const match of html.matchAll(/assets\/tailwind\.css\?v=([A-Za-z0-9._-]+)/g)) {
    tailwindStyleVersions.add(match[1]);
  }

  for (const match of html.matchAll(/<a\b[^>]*>/gi)) {
    const tag = match[0];
    const className = attributeValue(tag, 'class') || '';
    if (!/(?:^|\s)js-buy(?:\s|$)/.test(className)) continue;

    const explicitPath = attributeValue(tag, 'data-booking-path');
    const href = attributeValue(tag, 'href');
    let hrefPath;
    if (href?.startsWith('https://web-customer.studiosvb.com')) {
      hrefPath = new URL(href).pathname;
    }

    if (explicitPath && !allowedBookingPaths.has(explicitPath)) {
      fail(`${relative} utilise une destination de réservation inconnue : ${explicitPath}.`);
    }
    if (hrefPath && hrefPath !== '/' && !allowedBookingPaths.has(hrefPath)) {
      fail(`${relative} pointe vers une destination de réservation inconnue : ${hrefPath}.`);
    }
    if (explicitPath && hrefPath && hrefPath !== '/' && explicitPath !== hrefPath) {
      fail(`${relative} a deux destinations contradictoires sur le même bouton : ${hrefPath} et ${explicitPath}.`);
    }
    if (hrefPath === '/' && !explicitPath) {
      fail(`${relative} contient un bouton d'achat vers la racine de la boutique au lieu d'une offre précise.`);
    }
  }
}
if (bookingScriptVersions.size > 1) {
  fail(`Le module de réservation utilise plusieurs versions de cache : ${[...bookingScriptVersions].join(', ')}.`);
}
if (sharedScriptVersions.size > 1) {
  fail(`Le script commun utilise plusieurs versions de cache : ${[...sharedScriptVersions].join(', ')}.`);
}
if (sharedStyleVersions.size > 1) {
  fail(`Le style commun utilise plusieurs versions de cache : ${[...sharedStyleVersions].join(', ')}.`);
}
if (tailwindStyleVersions.size > 1) {
  fail(`Le style Tailwind utilise plusieurs versions de cache : ${[...tailwindStyleVersions].join(', ')}.`);
}

const headers = read('_headers');
if (!/\/essai[\s\S]*?X-Robots-Tag:\s*noindex/i.test(headers)) {
  fail('_headers doit envoyer X-Robots-Tag: noindex pour /essai.');
}

if (errors.length) {
  console.error(`ÉCHEC COHÉRENCE : ${errors.length} problème(s)\n`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`COHÉRENCE OK : vérité commerciale ${truth.version}, ${sitemapUrls.length} pages indexables contrôlées.`);
