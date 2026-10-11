(() => {
  'use strict';

  // Edit color values through CSSOM. Layout, type, media and content stay intact.
  const palette = {
    '2f4f4f': '25231f', '1d3838': '1d1c19', '203b3a': '201e1b',
    '203a3d': '201e1b', '1f454d': '25221d', '315d62': '3a352d',
    '566f6e': '555047', '4a8d84': '635a49', '3c6660': '3c3831',
    '4a5c58': '514c43', '456063': '575147', '64706e': '6f685d',
    '7a8c8a': '8d8372', '96a39c': 'a99e8a', 'a8b8ad': 'c8bea9',
    'b8c3b9': 'd9cfba', 'b8d8c0': 'eee5d3', 'd4dfd7': 'f5efe3',
    'dfe4d7': 'f8f3e9', 'e8efe9': 'f8f5ef', 'fbf6ec': 'fbf6ec',
    'e8b496': 'dfc491', 'f5c76d': 'edcf8d', 'f0ddcb': 'f1e6d0',
    'f4decb': 'f3e8d2', 'd49c7d': 'b79a64', 'f0dfd5': 'faf6ee',
    'e7dec8': 'eee6d7', 'fff4e8': 'fff8eb', '8f7467': '93816a',
    'c25a38': '9a773c'
  };
  const targetColors = new Set(Object.values(palette));
  const colorProperties = /^(?:color|background(?:-color|-image)?|(?:border(?:-(?:top|right|bottom|left))?|outline)(?:-color)?|box-shadow|text-shadow|fill|stroke|stop-color|flood-color|caret-color|accent-color|text-decoration-color|column-rule-color)$/;
  const colorToken = /#[\da-f]{3,8}\b|rgba?\(\s*[\d.]+(?:\s*,\s*|\s+)[\d.]+(?:\s*,\s*|\s+)[\d.]+(?:\s*[,/]\s*[\d.]+%?)?\s*\)/gi;

  function recolor(token) {
    let rgb, alpha = '', isHex = token[0] === '#';
    if (isHex) {
      let hex = token.slice(1);
      if (![3, 4, 6, 8].includes(hex.length)) return token;
      if (hex.length < 5) hex = [...hex].map(x => x + x).join('');
      rgb = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16));
      alpha = hex.slice(6);
    } else {
      const values = token.match(/[\d.]+%?/g);
      rgb = values.slice(0, 3).map(Number);
      alpha = values[3] || '';
    }
    const key = rgb.map(x => x.toString(16).padStart(2, '0')).join('').toLowerCase();
    if (targetColors.has(key)) return token;
    let mapped = palette[key];
    if (!mapped) {
      const [r, g, b] = rgb;
      const max = Math.max(...rgb), min = Math.min(...rgb), delta = max - min;
      if (!delta) return token;
      let hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
      hue = (hue * 60 + 360) % 360;
      // Catch legacy sage/teal variants, leaving semantic saturated colors alone.
      if (hue < 75 || hue > 205 || delta / max > 0.65) return token;
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const base = max > 185 ? Math.min(250, Math.round(luminance + 20)) : Math.round(luminance * 0.8);
      mapped = [base, Math.max(0, base - 3), Math.max(0, base - 10)].map(x => x.toString(16).padStart(2, '0')).join('');
    }
    if (isHex) return '#' + mapped + alpha;
    const next = [0, 2, 4].map(i => parseInt(mapped.slice(i, i + 2), 16));
    return alpha ? `rgba(${next.join(',')},${alpha})` : `rgb(${next.join(',')})`;
  }

  function colorValue(value) {
    // Never rewrite image URLs, including fragment identifiers that resemble hex.
    return value.split(/(url\([^)]*\))/gi).map((part, i) => i % 2 ? part : part.replace(colorToken, recolor)).join('');
  }

  function styleColors(style) {
    if (!style) return;
    for (const name of [...style]) {
      if (!colorProperties.test(name) && !name.startsWith('--')) continue;
      const value = style.getPropertyValue(name);
      const updated = colorValue(value);
      if (updated !== value) style.setProperty(name, updated, style.getPropertyPriority(name));
    }
  }

  function rulesColors(rules) {
    for (const rule of rules) {
      if (rule.style) styleColors(rule.style);
      if (rule.cssRules) rulesColors(rule.cssRules);
    }
  }
  const seen = new WeakSet();
  function sheetColors(sheet) {
    if (!sheet || seen.has(sheet)) return;
    try { rulesColors(sheet.cssRules); seen.add(sheet); } catch { /* Cross-origin font styles contain no brand colors. */ }
  }
  function elementColors(element) {
    if (element.nodeType !== 1) return;
    if (element.hasAttribute('style')) styleColors(element.style);
    if (element.sheet) sheetColors(element.sheet);
    for (const child of element.querySelectorAll('[style],style,link[rel="stylesheet"]')) {
      if (child.hasAttribute('style')) styleColors(child.style);
      if (child.sheet) sheetColors(child.sheet);
    }
  }
  for (const sheet of document.styleSheets) sheetColors(sheet);
  elementColors(document.documentElement);
  new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'attributes') styleColors(record.target.style);
      else for (const node of record.addedNodes) elementColors(node);
    }
  }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['style'] });
  document.addEventListener('load', event => {
    if (event.target?.sheet) sheetColors(event.target.sheet);
  }, true);
  document.addEventListener('DOMContentLoaded', () => {
    for (const sheet of document.styleSheets) sheetColors(sheet);
    elementColors(document.documentElement);
  });
})();

document.addEventListener('DOMContentLoaded',()=>{const b=document.getElementById('svb-menu-toggle'),p=document.getElementById('svb-menu-panel');if(!b||!p)return;const set=o=>{p.classList.toggle('hidden',!o);b.setAttribute('aria-expanded',String(o));b.setAttribute('aria-label',document.documentElement.lang==='en'?(o?'Close menu':'Open menu'):(o?'Fermer le menu':'Ouvrir le menu'))};b.addEventListener('click',()=>set(b.getAttribute('aria-expanded')!=='true'));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&b.getAttribute('aria-expanded')==='true'){set(false);b.focus()}});document.addEventListener('click',e=>{if(!e.target.closest('.svb-unified-nav'))set(false)});const path=location.pathname.replace(/\.html$/,'').replace(/\/$/,'')||'/';p.querySelectorAll('a').forEach(a=>{if(a.getAttribute('href').replace(/\.html$/,'')===path)a.setAttribute('aria-current','page')})});
addEventListener('scroll',()=>document.body.classList.toggle('svb-page-scrolled',scrollY>12),{passive:true});
