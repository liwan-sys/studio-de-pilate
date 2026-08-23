#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function fail(message) {
  errors.push(message);
}

function walk(directory, extension, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'dist', 'node_modules', 'design-system'].includes(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute, extension, files);
    if (entry.isFile() && entry.name.endsWith(extension)) files.push(absolute);
  }
  return files;
}

function htmlFileForUrl(url) {
  const pathname = new URL(url).pathname;
  if (pathname === '/') return 'index.html';
  if (pathname === '/en/') return 'en/index.html';
  return `${pathname.slice(1)}.html`;
}

function valuesForKey(value, key, found = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => valuesForKey(item, key, found));
    return found;
  }
  if (!value || typeof value !== 'object') return found;
  for (const [entryKey, entryValue] of Object.entries(value)) {
    if (entryKey === key) found.push(entryValue);
    valuesForKey(entryValue, key, found);
  }
  return found;
}

function asArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function attributeValue(tag, name) {
  if (!tag) return undefined;
  return tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'))?.[2];
}

const sitemap = read('sitemap.xml');
const sitemapUrls = [...sitemap.matchAll(/<loc>(https:\/\/studiosvb\.com\/[^<]*)<\/loc>/g)].map((match) => match[1]);
const uniqueSitemapUrls = new Set(sitemapUrls);
if (sitemapUrls.length !== uniqueSitemapUrls.size) fail('Le sitemap contient des URL en double.');

const redirects = read('_redirects');
const permanentRedirects = new Set();
const rewrites = new Map();
for (const rawLine of redirects.split('\n')) {
  const line = rawLine.trim();
  if (!line || line.startsWith('#')) continue;
  const [source, target, status = ''] = line.split(/\s+/);
  if (status.startsWith('301')) permanentRedirects.add(source);
  if (status === '200' || status === '200!') rewrites.set(source, target);
}

function publicPathExists(pathname) {
  if (pathname === '/' || pathname === '/en/') return true;
  if (rewrites.has(pathname)) return true;

  const relativePath = pathname.replace(/^\/+/, '');
  return relativePath !== '' && fs.existsSync(path.join(root, relativePath));
}

const canonicals = new Map();
const titles = new Map();
const descriptions = new Map();
for (const url of sitemapUrls) {
  const relativeFile = htmlFileForUrl(url);
  const absoluteFile = path.join(root, relativeFile);
  if (!fs.existsSync(absoluteFile)) {
    fail(`Sitemap sans fichier source : ${url} (${relativeFile})`);
    continue;
  }

  const html = read(relativeFile);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1].trim();
  const descriptionTag = html.match(/<meta\b[^>]*\bname=(["'])description\1[^>]*>/i)?.[0];
  const canonicalTag = html.match(/<link\b[^>]*\brel=(["'])canonical\1[^>]*>/i)?.[0];
  const robotsTag = html.match(/<meta\b[^>]*\bname=(["'])robots\1[^>]*>/i)?.[0];
  const description = attributeValue(descriptionTag, 'content')?.trim();
  const canonical = attributeValue(canonicalTag, 'href');
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const robots = attributeValue(robotsTag, 'content') || '';

  if (!title) fail(`${relativeFile} n'a pas de title.`);
  if (!description) fail(`${relativeFile} n'a pas de meta description.`);
  if (title && (title.length < 10 || title.length > 70)) fail(`${relativeFile} a un title de ${title.length} caractères.`);
  if (description && (description.length < 70 || description.length > 180)) fail(`${relativeFile} a une meta description de ${description.length} caractères.`);
  if (canonical !== url) fail(`${relativeFile} : canonical ${canonical || 'absente'} au lieu de ${url}.`);
  if (h1Count !== 1) fail(`${relativeFile} contient ${h1Count} H1 au lieu d'un seul.`);
  if (/noindex/i.test(robots)) fail(`${relativeFile} est dans le sitemap mais porte noindex.`);
  if (permanentRedirects.has(new URL(url).pathname)) fail(`${url} est à la fois dans le sitemap et redirigée en 301.`);
  if (canonical && canonicals.has(canonical)) fail(`Canonical dupliquée : ${canonical}.`);
  if (canonical) canonicals.set(canonical, relativeFile);
  if (title && titles.has(title)) fail(`Title dupliqué entre ${titles.get(title)} et ${relativeFile}.`);
  if (description && descriptions.has(description)) fail(`Meta description dupliquée entre ${descriptions.get(description)} et ${relativeFile}.`);
  if (title) titles.set(title, relativeFile);
  if (description) descriptions.set(description, relativeFile);
}

const htmlFiles = walk(root, '.html');
const businessTypes = new Set(['LocalBusiness', 'SportsActivityLocation', 'HealthClub', 'ExerciseGym']);
const expectedBusinessFiles = new Set(['studio-cours-des-lavandieres.html', 'studio-parc-des-docks.html']);
const businessSchemaFiles = new Set();
const businessSchemas = new Map();
const serviceSchemas = [];

for (const absoluteFile of htmlFiles) {
  const relativeFile = path.relative(root, absoluteFile);
  const html = fs.readFileSync(absoluteFile, 'utf8');
  const canonicalTag = html.match(/<link\b[^>]*\brel=(["'])canonical\1[^>]*>/i)?.[0];
  const robotsTag = html.match(/<meta\b[^>]*\bname=(["'])robots\1[^>]*>/i)?.[0];
  const canonical = attributeValue(canonicalTag, 'href');
  const robotsValue = attributeValue(robotsTag, 'content') || '';

  if (canonical?.startsWith('https://studiosvb.com/') && !/noindex/i.test(robotsValue) && !uniqueSitemapUrls.has(canonical)) {
    fail(`${relativeFile} est indexable mais absent du sitemap : ${canonical}.`);
  }

  if (/<meta\s+name=["']keywords["']/i.test(html)) fail(`${relativeFile} contient encore meta keywords.`);

  for (const match of html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    let data;
    try {
      data = JSON.parse(match[1]);
    } catch (error) {
      fail(`${relativeFile} contient un JSON-LD invalide : ${error.message}`);
      continue;
    }

    const topLevelNodes = Array.isArray(data)
      ? data
      : Array.isArray(data?.['@graph'])
        ? data['@graph']
        : [data];

    for (const node of topLevelNodes) {
      if (!node || typeof node !== 'object') continue;
      const types = asArray(node['@type']);
      if (types.some((type) => businessTypes.has(type))) {
        businessSchemaFiles.add(relativeFile);
        const schemas = businessSchemas.get(relativeFile) || [];
        schemas.push(node);
        businessSchemas.set(relativeFile, schemas);
      }
      if (types.includes('Service')) serviceSchemas.push({ file: relativeFile, schema: node });
    }

    for (const key of ['aggregateRating', 'ratingCount', 'reviewCount']) {
      if (valuesForKey(data, key).length) {
        fail(`${relativeFile} contient ${key}, une donnée périssable qui doit rester sur la fiche Google.`);
      }
    }
    if (valuesForKey(data, 'openingHoursSpecification').length) {
      fail(`${relativeFile} contient des horaires fixes alors que le planning en ligne est la source courante.`);
    }

    for (const imageValue of [...valuesForKey(data, 'image'), ...valuesForKey(data, 'logo')].flat()) {
      const imageUrl = typeof imageValue === 'string' ? imageValue : imageValue?.url;
      if (!imageUrl?.startsWith('https://studiosvb.com/')) continue;
      const imagePath = decodeURIComponent(new URL(imageUrl).pathname).replace(/^\//, '');
      if (!fs.existsSync(path.join(root, imagePath))) fail(`${relativeFile} référence une image de schema absente : ${imagePath}.`);
    }

    for (const linkedValue of [...valuesForKey(data, 'url'), ...valuesForKey(data, 'item')].flat()) {
      if (typeof linkedValue !== 'string' || !linkedValue.startsWith('https://studiosvb.com/')) continue;
      const pathname = decodeURIComponent(new URL(linkedValue).pathname);
      if (permanentRedirects.has(pathname)) fail(`${relativeFile} contient une ancienne URL dans son schema : ${pathname}.`);
    }
  }
}

for (const file of businessSchemaFiles) {
  if (!expectedBusinessFiles.has(file)) fail(`Schema d'établissement inattendu dans ${file}.`);
}
for (const file of expectedBusinessFiles) {
  if (!businessSchemaFiles.has(file)) fail(`Schema d'établissement manquant dans ${file}.`);
}

const expectedBusinesses = new Map([
  ['studio-parc-des-docks.html', {
    id: 'https://studiosvb.com/studio-parc-des-docks#location',
    name: 'SVB - Studio de coaching sportif & Bootcamp',
    alternateName: 'SVB - Parc des Docks',
    streetAddress: '6 Mail André Breton',
    latitude: 48.9118,
    longitude: 2.3336,
    map: 'https://www.google.com/maps?cid=2059026041814845219',
  }],
  ['studio-cours-des-lavandieres.html', {
    id: 'https://studiosvb.com/studio-cours-des-lavandieres#location',
    name: 'Studio de pilates Reformer - SVB',
    alternateName: 'SVB - Cours des Lavandières',
    streetAddress: '40 Cours des Lavandières',
    latitude: 48.9108,
    longitude: 2.3345,
    map: 'https://www.google.com/maps?cid=5013071026965844982',
  }],
]);

for (const [file, expected] of expectedBusinesses) {
  const schemas = businessSchemas.get(file) || [];
  if (schemas.length !== 1) {
    fail(`${file} contient ${schemas.length} schema(s) d'établissement au lieu d'un seul.`);
    continue;
  }

  const [schema] = schemas;
  const actual = {
    id: schema['@id'],
    name: schema.name,
    alternateName: schema.alternateName,
    streetAddress: schema.address?.streetAddress,
    latitude: schema.geo?.latitude,
    longitude: schema.geo?.longitude,
    map: schema.hasMap,
  };
  for (const [key, value] of Object.entries(expected)) {
    if (actual[key] !== value) fail(`${file} : ${key} vaut ${actual[key]} au lieu de ${value}.`);
  }
}

const allowedLocationIds = new Set([...expectedBusinesses.values()].map((business) => business.id));
for (const { file, schema } of serviceSchemas) {
  const places = asArray(schema.availableAtOrFrom);
  if (!places.length) {
    fail(`${file} : le service ${schema.name || 'sans nom'} n'est relié à aucun studio.`);
    continue;
  }
  for (const place of places) {
    const id = typeof place === 'string' ? place : place?.['@id'];
    if (!allowedLocationIds.has(id)) fail(`${file} : le service ${schema.name || 'sans nom'} pointe vers un studio inconnu (${id || 'sans @id'}).`);
  }
}

for (const absoluteFile of htmlFiles) {
  const relativeFile = path.relative(root, absoluteFile);
  const html = fs.readFileSync(absoluteFile, 'utf8');
  for (const match of html.matchAll(/href=["']([^"']+)["']/gi)) {
    const href = match[1].trim();
    if (!href || href.startsWith('#') || /^(mailto:|tel:|javascript:)/i.test(href)) continue;

    let url;
    try {
      const basePath = `/${relativeFile.replace(/index\.html$/, '').replace(/\.html$/, '')}`;
      url = new URL(href, `https://studiosvb.com${basePath}`);
    } catch {
      warnings.push(`${relativeFile} contient un lien illisible : ${href}`);
      continue;
    }
    if (url.hostname !== 'studiosvb.com') continue;
    const pathname = decodeURIComponent(url.pathname);
    if (permanentRedirects.has(pathname)) fail(`${relativeFile} pointe vers une ancienne URL : ${pathname}.`);
    if (!permanentRedirects.has(pathname) && !publicPathExists(pathname)) {
      fail(`${relativeFile} pointe vers une page interne inexistante : ${pathname}.`);
    }
  }

  for (const match of html.matchAll(/(?:src|poster|data-src)=["']([^"']+)["']/gi)) {
    const value = match[1].trim();
    if (!value || value.startsWith('data:')) continue;
    let url;
    try {
      url = new URL(value, 'https://studiosvb.com/');
    } catch {
      fail(`${relativeFile} contient une ressource illisible : ${value}.`);
      continue;
    }
    if (url.hostname !== 'studiosvb.com') continue;
    const assetPath = decodeURIComponent(url.pathname).replace(/^\//, '');
    if (!assetPath || !/\.(?:css|js|json|png|jpe?g|webp|svg|ico|woff2?|mp4|webm)$/i.test(assetPath)) continue;
    if (!fs.existsSync(path.join(root, assetPath))) fail(`${relativeFile} référence une ressource absente : ${assetPath}.`);
  }
}

const forbiddenSitemapFragments = ['/blog', 'bien-etre', 'pilates-reformer-paris', 'pilates-reformer-clichy', 'pilates-reformer-levallois', 'pilates-reformer-asnieres'];
for (const fragment of forbiddenSitemapFragments) {
  if (sitemapUrls.some((url) => url.includes(fragment))) fail(`Le sitemap contient encore une page retirée : ${fragment}.`);
}

if (fs.existsSync(path.join(root, 'blog')) && fs.readdirSync(path.join(root, 'blog')).length) fail('Le dossier blog contient encore des fichiers.');
if (fs.existsSync(path.join(root, 'netlify/edge-functions/ab-test-hero.js'))) fail("L'ancien test A/B de l'accueil est encore présent.");
if (/ab-test-hero/i.test(read('netlify.toml'))) fail("La configuration Netlify active encore l'ancien test A/B de l'accueil.");
const robots = read('robots.txt');
if (!/User-agent:\s*OAI-SearchBot[\s\S]*?Allow:\s*\//i.test(robots)) fail("OAI-SearchBot n'est pas explicitement autorisé dans robots.txt.");
if (!robots.includes('Sitemap: https://studiosvb.com/sitemap.xml')) fail('robots.txt ne déclare pas le sitemap canonique.');

const allPublicCopy = htmlFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const forbiddenClaims = [
  /16\s+(coachs?|certified coaches)/i,
  /500\s*(?:à|a|to|-)\s*600\s*calories/i,
  /free trial/i,
  /limited (?:offer|spots)/i,
  /only a few spots left/i,
  /2\s+à\s+3\s+fois\s+plus\s+vite/i,
  /diagnostic offert/i,
  /abonnements annuels/i,
  /3\s*[×x]\s*moins cher/i,
  /5\s*[×x]\s*plus attentif/i,
  /2\s+à\s+15\s+ans d'expérience/i,
  /(?:soins?|espace|prestations?|services?)\s+(?:de\s+)?bien[- ]être/i,
  /\bmassages?\b/i,
  /\bwellness\b/i,
];
for (const claim of forbiddenClaims) {
  if (claim.test(allPublicCopy)) fail(`Ancienne affirmation trouvée : ${claim}.`);
}

if (errors.length) {
  console.error(`ÉCHEC SEO : ${errors.length} problème(s)\n`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`SEO OK : ${sitemapUrls.length} URL canoniques, ${htmlFiles.length} pages source, ${businessSchemaFiles.size} établissements et ${serviceSchemas.length} services vérifiés.`);
if (warnings.length) warnings.forEach((warning) => console.warn(`Avertissement : ${warning}`));
