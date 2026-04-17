#!/usr/bin/env python3
"""
Studio SVB — Content build pipeline.

Rôle :
  1. Agréger les reviews JSON (content/reviews/*.json) en /assets/reviews.json
  2. Agréger les articles blog Markdown (content/blog/*.md) en /assets/blog-index.json
     + génération HTML statique dans /blog/<slug>.html
  3. Générer un flux RSS /blog/rss.xml
  4. Agréger les coachs en /assets/coachs.json

Lancé par build.sh AVANT le build Tailwind.
"""

from __future__ import annotations
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
ASSETS  = ROOT / "assets"
BLOG    = ROOT / "blog"


# ----------------------------------------------------------------
# Front-matter Markdown parser (léger, sans dépendance externe)
# ----------------------------------------------------------------
FM_RE = re.compile(r'^---\s*\n(.*?)\n---\s*\n(.*)$', re.DOTALL)


def parse_frontmatter(text: str) -> tuple[dict, str]:
    m = FM_RE.match(text)
    if not m:
        return {}, text
    fm_raw, body = m.group(1), m.group(2)
    meta: dict = {}
    # Very small YAML-ish parser (supports scalars, lists [a,b,c] and "quoted" strings)
    current_list_key = None
    for line in fm_raw.splitlines():
        if not line.strip():
            continue
        if line.startswith('- ') and current_list_key:
            meta[current_list_key].append(line[2:].strip().strip('"').strip("'"))
            continue
        if ':' not in line:
            continue
        key, _, raw = line.partition(':')
        key = key.strip()
        raw = raw.strip()
        if raw == '':
            # list coming on next lines
            meta[key] = []
            current_list_key = key
            continue
        current_list_key = None
        # strip quotes
        if raw.startswith('"') and raw.endswith('"'):
            raw = raw[1:-1]
        elif raw.startswith("'") and raw.endswith("'"):
            raw = raw[1:-1]
        # booleans
        if raw.lower() in ('true', 'false'):
            meta[key] = raw.lower() == 'true'
        # numbers
        elif re.fullmatch(r'-?\d+', raw):
            meta[key] = int(raw)
        elif re.fullmatch(r'-?\d+\.\d+', raw):
            meta[key] = float(raw)
        # inline lists [a, b, c]
        elif raw.startswith('[') and raw.endswith(']'):
            inner = raw[1:-1].strip()
            meta[key] = [x.strip().strip('"').strip("'") for x in inner.split(',') if x.strip()]
        else:
            meta[key] = raw
    return meta, body


# ----------------------------------------------------------------
# Minimal Markdown → HTML (sans dépendance)
#   Suffisant pour le contenu SVB (titres, liste, gras/italique, liens, citations, images).
# ----------------------------------------------------------------
def md_to_html(md: str) -> str:
    lines = md.split('\n')
    html_lines: list[str] = []
    in_code = False
    in_list: str | None = None  # 'ul' or 'ol'

    def close_list():
        nonlocal in_list
        if in_list:
            html_lines.append(f"</{in_list}>")
            in_list = None

    def inline(s: str) -> str:
        # Escape HTML primitives first (but preserve tags we'll emit later)
        # Links: [text](url)
        s = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2" rel="noopener">\1</a>', s)
        # Images: ![alt](url)
        s = re.sub(r'!\[([^\]]*)\]\(([^)]+)\)', r'<img src="\2" alt="\1" loading="lazy" decoding="async" />', s)
        # Bold **x**
        s = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', s)
        # Italic *x* (non-greedy, not across lines)
        s = re.sub(r'(?<!\*)\*([^*\n]+)\*(?!\*)', r'<em>\1</em>', s)
        # Inline code `x`
        s = re.sub(r'`([^`]+)`', r'<code>\1</code>', s)
        return s

    for raw in lines:
        line = raw.rstrip()

        # Code fences
        if line.strip().startswith('```'):
            close_list()
            if in_code:
                html_lines.append('</code></pre>')
                in_code = False
            else:
                html_lines.append('<pre><code>')
                in_code = True
            continue
        if in_code:
            html_lines.append(line.replace('&', '&amp;').replace('<', '&lt;'))
            continue

        # Blank line
        if not line.strip():
            close_list()
            continue

        # Headings
        m = re.match(r'^(#{1,6})\s+(.+)$', line)
        if m:
            close_list()
            level = len(m.group(1))
            html_lines.append(f"<h{level}>{inline(m.group(2))}</h{level}>")
            continue

        # Blockquote
        if line.startswith('> '):
            close_list()
            html_lines.append(f"<blockquote>{inline(line[2:])}</blockquote>")
            continue

        # Ordered list
        m = re.match(r'^\s*\d+\.\s+(.+)$', line)
        if m:
            if in_list != 'ol':
                close_list()
                html_lines.append('<ol>')
                in_list = 'ol'
            html_lines.append(f"  <li>{inline(m.group(1))}</li>")
            continue

        # Unordered list
        m = re.match(r'^\s*[-*]\s+(.+)$', line)
        if m:
            if in_list != 'ul':
                close_list()
                html_lines.append('<ul>')
                in_list = 'ul'
            html_lines.append(f"  <li>{inline(m.group(1))}</li>")
            continue

        # Paragraph
        close_list()
        html_lines.append(f"<p>{inline(line)}</p>")

    close_list()
    if in_code:
        html_lines.append('</code></pre>')

    return '\n'.join(html_lines)


# ----------------------------------------------------------------
# HTML page template for blog articles generated via CMS
# ----------------------------------------------------------------
BLOG_TEMPLATE = """<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title} — Blog Studio SVB</title>
  <meta name="description" content="{description_attr}" />
  <meta name="robots" content="index, follow" />
  <meta name="author" content="{author_attr}" />
  <link rel="canonical" href="https://studiosvb.com/blog/{slug}" />

  <meta property="og:type" content="article" />
  <meta property="og:title" content="{title_attr}" />
  <meta property="og:description" content="{description_attr}" />
  <meta property="og:url" content="https://studiosvb.com/blog/{slug}" />
  <meta property="og:image" content="https://studiosvb.com{thumb_url}" />
  <meta property="og:locale" content="fr_FR" />
  <meta property="article:published_time" content="{date}" />
  <meta property="article:author" content="{author_attr}" />
  <meta property="article:section" content="{category}" />

  <meta name="theme-color" content="#4A8D84" />
  <link rel="icon" type="image/png" href="/images/favicon-32.png" />
  <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500;600;700&family=Great+Vibes&family=Montserrat:wght@300;400;500;600;700;800&display=swap" />
  <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500;600;700&family=Great+Vibes&family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

  <link rel="stylesheet" href="/assets/tailwind.css" />
  <link rel="stylesheet" href="/assets/svb.css" />

  <script>
    (function(){{
      var granted = false;
      try {{ granted = localStorage.getItem('svb-consent-v1') === 'granted'; }} catch(e) {{}}
      if (!granted) {{ window.dataLayer = window.dataLayer || []; return; }}
      (function(w,d,s,l,i){{w[l]=w[l]||[];w[l].push({{'gtm.start':
      new Date().getTime(),event:'gtm.js'}});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      }})(window,document,'script','dataLayer','GTM-5RW8LB7B');
    }})();
  </script>

  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": {title_json},
    "description": {description_json},
    "image": "https://studiosvb.com{thumb_url}",
    "datePublished": "{date}",
    "dateModified": "{date}",
    "author": {{ "@type": "Organization", "name": {author_json} }},
    "publisher": {{
      "@type": "Organization",
      "name": "SVB Santez Vous Bien",
      "logo": {{ "@type": "ImageObject", "url": "https://studiosvb.com/images/logo.webp" }}
    }},
    "mainEntityOfPage": "https://studiosvb.com/blog/{slug}"
  }}
  </script>

  <style>
    body{{
      background:linear-gradient(180deg,#98D0B3 0%,#F2E6CF 100%);
      min-height:100vh;font-family:'Montserrat',sans-serif;color:#2F4F4F;
    }}
    .nav{{
      position:sticky;top:0;z-index:50;background:rgba(251,246,236,.85);
      backdrop-filter:blur(20px);border-bottom:1px solid rgba(47,79,79,.08);
      padding:14px 24px;display:flex;align-items:center;gap:18px;font-size:.92rem;
    }}
    .nav a{{text-decoration:none;color:#2F4F4F;font-weight:500;padding:6px 10px;border-radius:20px}}
    .nav a:hover{{background:rgba(74,141,132,.1);color:#4A8D84}}
    .nav-brand{{font-family:'Great Vibes',cursive;font-size:1.8rem;color:#4A8D84;line-height:.8;margin-right:auto}}
    .nav .cta{{background:#4A8D84;color:#fff!important;padding:10px 20px;border-radius:30px;font-weight:700;font-size:.82rem;text-transform:uppercase;letter-spacing:.06em}}
    article.post{{max-width:760px;margin:40px auto;padding:0 24px}}
    .post-meta{{display:flex;gap:14px;align-items:center;font-size:.8rem;opacity:.7;margin-bottom:1rem}}
    .post-cat{{background:#2F4F4F;color:#FBF6EC;padding:4px 12px;border-radius:16px;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em}}
    article h1{{font-family:'Great Vibes',cursive;font-weight:400;font-size:clamp(2.8rem,6vw,4.5rem);line-height:1;margin:0 0 .6rem;color:#2F4F4F}}
    article .lead{{font-size:1.1rem;line-height:1.6;color:#2F4F4F;opacity:.78;margin:0 0 2rem;padding-left:1.2rem;border-left:3px solid #98D0B3}}
    article .content{{line-height:1.8;font-size:1.02rem}}
    article .content h2{{font-family:'Dancing Script',cursive;font-weight:600;font-size:2.2rem;margin-top:2.5rem;margin-bottom:1rem;color:#4A8D84}}
    article .content h3{{font-weight:700;font-size:1.25rem;margin-top:2rem;margin-bottom:.8rem;color:#2F4F4F}}
    article .content p{{margin:0 0 1.1rem}}
    article .content img{{border-radius:18px;margin:1.8rem 0;box-shadow:0 10px 30px rgba(47,79,79,.15)}}
    article .content ul,article .content ol{{padding-left:1.5rem;margin:1rem 0}}
    article .content li{{margin:.4rem 0}}
    article .content blockquote{{border-left:4px solid #E8B496;padding:1rem 1.4rem;background:rgba(255,255,255,.6);border-radius:0 14px 14px 0;margin:1.6rem 0;font-style:italic}}
    article .content a{{color:#4A8D84;font-weight:600;border-bottom:1px dashed}}
    article .content a:hover{{background:rgba(152,208,179,.2)}}
    .hero-thumb{{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:22px;margin-bottom:2rem;box-shadow:0 20px 50px rgba(47,79,79,.18)}}
    .end-cta{{background:rgba(255,255,255,.85);border:1px solid rgba(47,79,79,.08);border-radius:24px;padding:2.2rem;text-align:center;margin:3rem 0 2rem}}
    .end-cta h2{{font-family:'Dancing Script',cursive;font-size:2rem;color:#4A8D84;margin:0 0 .6rem}}
    .end-cta p{{margin:0 0 1.4rem;opacity:.8}}
    .btn-primary{{display:inline-block;background:#2F4F4F;color:#FBF6EC;padding:14px 28px;border-radius:999px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-size:.85rem;text-decoration:none;transition:all .2s}}
    .btn-primary:hover{{background:#4A8D84;transform:translateY(-2px)}}
    footer{{background:#2F4F4F;color:#FBF6EC;padding:40px 24px;text-align:center;font-size:.85rem;margin-top:2rem}}
    footer a{{color:inherit}}
  </style>
</head>
<body>
  <nav class="nav" aria-label="Navigation principale">
    <a href="/" class="nav-brand" aria-label="Accueil Studio SVB">SVB</a>
    <a href="/">Accueil</a>
    <a href="/tarifs">Tarifs</a>
    <a href="/equipe">Équipe</a>
    <a href="/blog/">Blog</a>
    <a href="/contact">Contact</a>
    <a href="/reserver" class="cta" data-track="cta_blog_article_book">Essai 30€</a>
  </nav>

  <article class="post">
    <div class="post-meta">
      <span class="post-cat">{category}</span>
      <time datetime="{date}">{date_human}</time>
      <span>· {author}</span>
    </div>
    {hero_img}
    <h1>{h1}</h1>
    <p class="lead">{description}</p>
    <div class="content">
{body_html}
    </div>

    <div class="end-cta">
      <h2>Prêt·e à essayer ?</h2>
      <p>Cours d'essai à 30€ · intégralement remboursé à l'abonnement.</p>
      <a href="/reserver" class="btn-primary" data-track="cta_blog_article_book">Réserver mon essai</a>
    </div>
  </article>

  <footer>
    <p>© <span id="year"></span> Studio SVB · Santez Vous Bien · Saint-Ouen-sur-Seine</p>
    <p style="margin-top:8px;opacity:.7"><a href="/mentions-legales">Mentions légales</a> · <a href="/cgv">CGV</a> · <a href="/contact">Contact</a></p>
  </footer>

  <script src="/assets/svb.js" defer></script>
  <script>document.getElementById('year').textContent = new Date().getFullYear();</script>
</body>
</html>
"""


def build_blog() -> list[dict]:
    """Parse content/blog/*.md, write /blog/<slug>.html, return index for blog-index.json"""
    articles: list[dict] = []
    blog_src = CONTENT / "blog"
    if not blog_src.exists():
        return articles

    for md_file in sorted(blog_src.glob("*.md")):
        slug = md_file.stem
        text = md_file.read_text(encoding="utf-8")
        meta, body = parse_frontmatter(text)
        if not meta:
            print(f"  ⚠ skip {md_file}: pas de front-matter")
            continue
        date = str(meta.get('date', ''))[:10] or datetime.now().strftime('%Y-%m-%d')
        title = meta.get('title', slug)
        h1 = meta.get('h1', title)
        description = meta.get('description', '')
        category = meta.get('category', 'Studio')
        author = meta.get('author', 'Équipe SVB')
        thumb = meta.get('thumb', '/images/og-image.jpg')

        # thumb could be relative like "images/blog/X.webp" (public_folder) -> normalize
        thumb_url = thumb if thumb.startswith('/') else '/' + thumb.lstrip('./')
        hero_img = (
            f'<img src="{thumb_url}" alt="{h1}" class="hero-thumb" loading="eager" decoding="async" '
            f'fetchpriority="high" />'
        ) if thumb_url else ''

        date_human = ''
        try:
            date_human = datetime.fromisoformat(date).strftime('%d %B %Y')
        except Exception:
            date_human = date

        # Avoid overwriting manual blog posts (existing .html files that weren't generated from CMS)
        out_path = BLOG / f"{slug}.html"
        if out_path.exists():
            # Skip if not a CMS-generated file (check for marker)
            existing = out_path.read_text(encoding='utf-8', errors='ignore')
            if '<!-- cms-generated -->' not in existing:
                print(f"  → {slug}.html: fichier existant non-CMS, skip")
            else:
                out_path.write_text(render_blog(meta, body, slug, date, date_human, hero_img, h1, description, category, author, thumb_url), encoding='utf-8')
                print(f"  ✓ rebuild {slug}.html")
        else:
            out_path.write_text(render_blog(meta, body, slug, date, date_human, hero_img, h1, description, category, author, thumb_url), encoding='utf-8')
            print(f"  ✓ new    {slug}.html")

        articles.append({
            'slug': slug,
            'title': title,
            'h1': h1,
            'description': description,
            'category': category,
            'date': date,
            'thumb': thumb_url.lstrip('/images/').lstrip('/'),
            'featured': bool(meta.get('featured', False)),
        })
    return articles


def render_blog(meta, body, slug, date, date_human, hero_img, h1, description, category, author, thumb_url) -> str:
    body_html = md_to_html(body)
    esc = lambda s: s.replace('"', '&quot;')
    return "<!-- cms-generated -->\n" + BLOG_TEMPLATE.format(
        title=meta.get('title', h1),
        title_attr=esc(meta.get('title', h1)),
        title_json=json.dumps(meta.get('title', h1), ensure_ascii=False),
        h1=h1,
        description=description,
        description_attr=esc(description),
        description_json=json.dumps(description, ensure_ascii=False),
        date=date,
        date_human=date_human,
        author=author,
        author_attr=esc(author),
        author_json=json.dumps(author, ensure_ascii=False),
        category=category,
        slug=slug,
        thumb_url=thumb_url,
        hero_img=hero_img,
        body_html=body_html,
    )


def build_blog_index(articles: list[dict]) -> None:
    """Merge with legacy HTML-only articles (already parsed previously) if assets/blog-index.json exists"""
    idx_path = ASSETS / "blog-index.json"
    legacy: list[dict] = []
    if idx_path.exists():
        try:
            legacy = json.loads(idx_path.read_text(encoding='utf-8'))
        except Exception:
            legacy = []
    by_slug = {a['slug']: a for a in legacy}
    for a in articles:
        by_slug[a['slug']] = a  # CMS version prend le pas
    merged = list(by_slug.values())
    merged.sort(key=lambda a: a.get('date', ''), reverse=True)
    idx_path.write_text(json.dumps(merged, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"✓ blog-index.json: {len(merged)} articles")


def build_rss(articles: list[dict]) -> None:
    """Génère /blog/rss.xml"""
    idx_path = ASSETS / "blog-index.json"
    if idx_path.exists():
        try:
            articles = json.loads(idx_path.read_text(encoding='utf-8'))
        except Exception:
            pass

    now = datetime.now(timezone.utc).strftime('%a, %d %b %Y %H:%M:%S +0000')
    items = []
    for a in articles[:25]:
        slug = a['slug']
        try:
            dt = datetime.fromisoformat(a.get('date', '2026-01-01')).replace(tzinfo=timezone.utc)
            pub = dt.strftime('%a, %d %b %Y %H:%M:%S +0000')
        except Exception:
            pub = now
        items.append(f"""  <item>
    <title><![CDATA[{a.get('title', slug)}]]></title>
    <link>https://studiosvb.com/blog/{slug}</link>
    <guid isPermaLink="true">https://studiosvb.com/blog/{slug}</guid>
    <description><![CDATA[{a.get('description', '')}]]></description>
    <category>{a.get('category', '')}</category>
    <pubDate>{pub}</pubDate>
  </item>""")
    rss = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Blog Studio SVB</title>
  <link>https://studiosvb.com/blog/</link>
  <description>Conseils sport et bien-être par l'équipe du Studio SVB à Saint-Ouen</description>
  <language>fr-FR</language>
  <lastBuildDate>{now}</lastBuildDate>
  <atom:link href="https://studiosvb.com/blog/rss.xml" rel="self" type="application/rss+xml" />
{chr(10).join(items)}
</channel>
</rss>
"""
    (BLOG / "rss.xml").write_text(rss, encoding='utf-8')
    print(f"✓ blog/rss.xml ({len(items)} entries)")


def build_reviews() -> None:
    """Agrège les reviews JSON → assets/reviews.json"""
    src = CONTENT / "reviews"
    reviews: list[dict] = []
    if src.exists():
        for f in sorted(src.glob("*.json")):
            try:
                r = json.loads(f.read_text(encoding='utf-8'))
                if r.get('published', True):
                    reviews.append(r)
            except Exception as e:
                print(f"  ⚠ skip {f}: {e}")
    reviews.sort(key=lambda r: r.get('date', ''), reverse=True)
    out = ASSETS / "reviews.json"
    out.write_text(json.dumps(reviews, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"✓ reviews.json: {len(reviews)} avis")


def build_coachs() -> None:
    """Agrège les coachs JSON → assets/coachs.json"""
    src = CONTENT / "coachs"
    coachs: list[dict] = []
    if src.exists():
        for f in sorted(src.glob("*.json")):
            try:
                c = json.loads(f.read_text(encoding='utf-8'))
                if c.get('published', True):
                    coachs.append(c)
            except Exception as e:
                print(f"  ⚠ skip {f}: {e}")
    coachs.sort(key=lambda c: c.get('order', 100))
    (ASSETS / "coachs.json").write_text(json.dumps(coachs, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"✓ coachs.json: {len(coachs)} coachs")


def main():
    ASSETS.mkdir(exist_ok=True)
    print("→ Build reviews...")
    build_reviews()
    print("→ Build coachs...")
    build_coachs()
    print("→ Build blog articles...")
    articles = build_blog()
    print("→ Build blog index + RSS...")
    build_blog_index(articles)
    build_rss(articles)
    print("\n✓ Content build complete.")


if __name__ == '__main__':
    main()
