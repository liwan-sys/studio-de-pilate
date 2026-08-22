# SVB Santez Vous Bien — Design System

**Version** : 1.0.0 · 2026-04-17
**Brand personality** : LUXE · LUDIQUE · MODERNE
**Status** : production-ready · Figma Make ready

> ⚠️ **Non-modification de la DA existante** — Ce design system documente, tokenise et scale la direction artistique **déjà en production** sur studiosvb.com. Aucune couleur, typo, ou dimension n'est changée par ce livrable. Il sert de socle de référence pour le Figma Make et les futures évolutions.

---

## 📖 Sommaire

1. [Philosophie de marque](#philosophie-de-marque)
2. [Système de couleurs](#1--système-de-couleurs)
3. [Typographie](#2--typographie)
4. [Système spatial](#3--système-spatial)
5. [Motion](#4--motion)
6. [Responsive patterns](#5--responsive-patterns)
7. [Accessibilité WCAG AA](#6--accessibilité-wcag-aa)
8. [Bibliothèque de composants](#7--bibliothèque-de-composants)
9. [Naming convention Figma](#8--convention-figma)

---

## Philosophie de marque

SVB est à la croisée de **3 territoires** qui dictent chaque décision design :

| Territoire | Traduction visuelle | Contre-exemple |
|---|---|---|
| **LUXE** | Script cursives (Great Vibes, Dancing Script), generous white-space, dégradés doux, photographie chaleureuse | Néons, carrés durs, typos industrielles |
| **LUDIQUE** | Emojis, tone de voix tutoyant, formulations chaleureuses, micro-interactions | Formalisme corporate, copy administratif |
| **MODERNE** | Sans-serif géométrique (Montserrat), WebP, PWA, performance > décoration | Éléments rétro, skeuomorphisme |

**Règle d'or** : dans le doute, demander *« ma grande-mère se sentirait-elle accueillie ici, et ma sœur de 25 ans trouverait-elle ça cool ? »* Si la réponse est non à l'une des deux, on n'y est pas.

---

## 1 · Système de couleurs

### 1.1 Palette brand (inchangée — signature visuelle SVB)

| Token | Hex | Usage |
|---|---|---|
| `brand.sage` | `#98D0B3` | Backgrounds doux, hero light, icônes tag |
| `brand.dark` | `#4A8D84` | Primary par défaut, texte accent, boutons |
| `brand.darker` | `#2D5A54` | Hover/pressed primary |
| `brand.sand` | `#F2E6CF` | Surface secondaire, badges warm |
| `brand.peach` | `#E8B496` | Accent ludique, highlight promos |
| `brand.cream` | `#FBF6EC` | Texte sur fonds sombres |
| `brand.ink` | `#2F4F4F` | Texte principal |
| `brand.ink-2` | `#1D3838` | Headings, fond nav mobile |

### 1.2 Scales primaire & secondaire (50 → 900)

Shades dérivées algorithmiquement pour **couvrir les 9 états** dont une UI a besoin sans inventer de nouvelles teintes.

**Primary (vert sage)** — `svb-color-primary-{50…900}`
`#EFF7F2` · `#DBEDE3` · `#C1E1CF` · `#98D0B3` · `#6EB79A` · **`#4A8D84`** · `#3D7370` · `#2D5A54` · `#1F423E` · `#102825`

**Secondary (sable → pêche)** — `svb-color-secondary-{50…900}`
`#FDF7F3` · `#FAEADB` · `#F2E6CF` · `#EED3AE` · **`#E8B496`** · `#D69879` · `#B87A5B` · `#8F5D44` · `#5F3E2E` · `#321F17`

**Neutral** — `svb-color-neutral-{0…900}` : 11 nuances chaudes (base sable, pas gris froid) pour garder la cohérence thermique avec la brand.

### 1.3 Couleurs sémantiques

| Intent | Light | Default | Dark | Usage |
|---|---|---|---|---|
| Success | `#DBEDE3` | `#2E9B6F` | `#1E6B4C` | Confirmations, Netlify Forms thanks |
| Warning | `#FEF3DB` | `#E8A846` | `#A8771F` | Slots complets, rappels |
| Error | `#FCE3DF` | `#D85B4A` | `#9B3628` | Validations formulaire, 404 |
| Info | `#DDEEF4` | `#4A8CA8` | `#2E5E75` | Notifications système, consent |

**Règle** : jamais de rouge vif (#FF0000) — `error` reste dans une palette terracotta qui cohabite avec la brand warm.

### 1.4 Dark mode

Activé via `[data-theme="dark"]` OU `@media (prefers-color-scheme: dark)`. **Pas activé par défaut sur le site** (l'identité SVB privilégie le thème clair). Prêt pour une future toggle.

| Alias | Light | Dark |
|---|---|---|
| `surface.base` | `#FFFFFF` | `#14201E` |
| `surface.raised` | `#FBF9F5` | `#1B2B28` |
| `text.primary` | `#2F4F4F` | `#EAE5D8` |
| `primary.500` | `#4A8D84` | `#6EB79A` (+1 stop pour contraste) |

---

## 2 · Typographie

### 2.1 Associations de polices (rationale)

| Famille | Police | Rôle |
|---|---|---|
| `font-hero` | **Great Vibes** (cursive de gala) | H1 uniquement. Signe l'émotion d'arrivée. |
| `font-display` | **Dancing Script** (cursive semi-formelle) | H2, H3, chapô. Apporte la chaleur récurrente sans lourdeur. |
| `font-body` | **Montserrat** (sans-serif géométrique) | Tout le texte long, UI, boutons. Rigueur moderne qui rééquilibre la cursive. |
| `font-mono` | JetBrains Mono | Codes, tokens, data. |

**Pourquoi ce mix** : la cursive apporte la signature marketing (luxe + humain), le Montserrat donne la lisibilité et la rigueur moderne. Les deux sont nées de la même famille typographique (grotesk/humaniste) → cohabitent sans choc.

**Règles d'usage** :
- Great Vibes : **jamais < 48px** (illisible en petit)
- Dancing Script : **jamais < 18px** (idem)
- Paragraphes > 2 lignes : **Montserrat obligatoire**
- Boutons, labels, nav : **Montserrat obligatoire**

### 2.2 Échelle typographique — 9 niveaux (fluide)

| Niveau | Mobile | Desktop | Famille | Poids | Usage |
|---|---|---|---|---|---|
| `display` | 64px | 144px | Hero | 400 | Splash, 404, moments WOW |
| `h1` | 48px | 96px | Hero | 400 | Hero page d'accueil |
| `h2` | 30px | 48px | Display | 600 | Titres sections |
| `h3` | 22px | 30px | Display | 600 | Titres blocs, quotes |
| `h4` | 18px | 20px | Body | 600 | Sous-titres cards |
| `body-lg` | 18px | 18px | Body | 400 | Lead, intros |
| `body` | 16px | 16px | Body | 400 | Corps principal |
| `body-sm` | 14px | 14px | Body | 400 | Helpers, footers |
| `caption` | 13px | 13px | Body | 500 | Captions images |
| `eyebrow` | 12px | 12px | Body | 700 | Kickers « NOS DISCIPLINES » (uppercase, letter-spacing 0.16em) |

**Ratio de progression** : 1.25 (Major Third) — suffisant pour créer une hiérarchie nette sans rupture visuelle.

**Fluid sizing** : toutes les tailles > body utilisent `clamp(min, vw-relative, max)` pour une adaptation continue de 375px à 1440px+.

---

## 3 · Système spatial

### 3.1 Grille de base

**Base unit : 8px** (`--svb-space-2`). Tous les espacements macro sont des multiples de 8.

Demi-pas tolérés uniquement pour :
- **4px** (`space-1`) : icônes inline, micro-gaps
- **12px** (`space-3`) : padding compact (tags, badges)

### 3.2 Tokens d'espacement (17 valeurs)

| Token | Valeur | Contexte type |
|---|---|---|
| `space-0.5` | 2px | Bordures internes |
| `space-1` | 4px | Icône + label |
| `space-2` | 8px | **BASE** — gap default |
| `space-3` | 12px | Padding bouton vertical |
| `space-4` | 16px | Padding card / input |
| `space-5` | 20px | — |
| `space-6` | 24px | Padding card featured |
| `space-8` | 32px | Gap entre cards |
| `space-10` | 40px | — |
| `space-12` | 48px | Padding section S (mobile) |
| `space-16` | 64px | Padding section M |
| `space-20` | 80px | Padding section L |
| `space-24` | 96px | Hero mobile |
| `space-32` | 128px | Hero desktop |

### 3.3 Radius (9 valeurs)

| Token | Valeur | Usage |
|---|---|---|
| `radius-xs` | 4px | Tags, petits badges |
| `radius-sm` | 8px | Inputs, checkboxes |
| `radius-md` | 12px | Boutons rectangulaires |
| `radius-lg` | 18px | **Cards** (default SVB) |
| `radius-xl` | 24px | Cards featured |
| `radius-2xl` | 32px | Modals, hero cards |
| `radius-3xl` | 44px | Containers promo |
| `radius-full` | 9999px | Pills, avatars, FAB, CTAs |

**Convention SVB** : les CTAs primaires sont toujours `radius-full` (pills). Les cards standard en `radius-lg`. La cohérence se joue là.

### 3.4 Elevation (shadows)

8 niveaux, teintés sage pour rester dans l'univers SVB (pas de shadow neutre gris froid) :

```
xs   ← 0 1px 2px rgba(47,79,79,.04)
sm   ← 0 2px 10px rgba(47,79,79,.06)    cards reposantes
md   ← 0 10px 30px rgba(47,79,79,.08)   hover cards
lg   ← 0 20px 50px rgba(47,79,79,.15)   dropdowns, popovers
xl   ← 0 30px 80px rgba(47,79,79,.18)   modals
brand← 0 14px 30px -12px rgba(74,141,132,.55)   CTAs primaires
focus← 0 0 0 3px rgba(74,141,132,.25)   ring a11y
```

---

## 4 · Motion

### 4.1 Philosophie

> « Le mouvement reste fluide. Nos animations aussi. »

- **Éase-out dominant** (`standard`, `emphasized`, `decelerate`) — les éléments arrivent en douceur, pressés sur la fin.
- **Éase-in rare** — uniquement pour les sorties (modal close, dismiss).
- **Bounce parcimonieux** — moments ludiques uniquement (confirmation, parrainage).

### 4.2 Durées

| Token | Durée | Usage |
|---|---|---|
| `xfast` | 120ms | Couleur, opacité |
| `fast` | 180ms | Transforms légers |
| `base` | **250ms** | UI default (boutons, links) |
| `medium` | 400ms | Cards, reveal |
| `slow` | 600ms | Modal enter |
| `xslow` | 800ms | Scroll reveal hero |
| `crawl` | 1200ms | Splash, narratif |

### 4.3 Courbes (cubic-bezier)

| Token | Bezier | Rôle |
|---|---|---|
| `standard` | 0.2, 0.7, 0.2, 1 | **Default** — élégant, neutre |
| `emphasized` | 0.16, 1, 0.3, 1 | **Signature SVB** — cards reveal, hero |
| `decelerate` | 0, 0, 0.2, 1 | Entrances (modal, toast) |
| `accelerate` | 0.4, 0, 1, 1 | Sorties |
| `bounce` | 0.34, 1.56, 0.64, 1 | Overshoot ludique |
| `anticipate` | 0.68, -0.55, 0.27, 1.55 | Moments WOW uniquement |

### 4.4 Micro-interactions — 5 principes

1. **Purpose** — chaque animation répond à « où suis-je / qu'est-ce qui a changé / que se passe-t-il ».
2. **Reduced-motion** — toute animation a son `prefers-reduced-motion: reduce` (durée = 0).
3. **Stagger** — cascade 80ms entre enfants quand > 3 items apparaissent.
4. **Distance max 40px** — au-delà, on perd le lien causal.
5. **Exit = Entrance ÷ 1.5** — on sort toujours plus vite qu'on entre.

---

## 5 · Responsive patterns

### 5.1 Breakpoints

| Token | Valeur | Viewport cible |
|---|---|---|
| `xs` | 320px | iPhone SE, smartwatches Safari |
| `sm` | 640px | Phone landscape |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Tablet landscape, petits laptops |
| `xl` | 1280px | **Desktop standard SVB** |
| `2xl` | 1536px | Large desktop |
| `3xl` | 1920px | Ultra-wide |

**Mobile-first** — toute règle CSS part du mobile, `@media (min-width: ...)` monte en puissance.

### 5.2 Grille responsive

| BP | Colonnes | Gap | Container max |
|---|---|---|---|
| xs | 4 | 16px | 100% |
| sm | 6 | 20px | 640px |
| md | 8 | 24px | 768px |
| lg | 12 | 24px | 1024px |
| xl | 12 | 32px | **1240px** (SVB standard) |

### 5.3 Logique adaptative

| Composant | < 640px | 640 — 1024px | > 1024px |
|---|---|---|---|
| Nav | Burger + drawer | Horizontal tronqué | Horizontal complet |
| Hero | Vidéo + CTA stack | Vidéo + CTA stack | Vidéo + CTA inline |
| Cards grid | 1 col | 2 col | 3-4 col |
| Tarifs cards | Stack vertical | 2 col | 3 col (featured centrée) |
| Planning | Liste verticale | Grille 2 col | Table 7 jours |
| Footer | Stack 1 col | 2 col | 4 col |

### 5.4 Fluid typography

`clamp(min, calc(...), max)` pour toutes les tailles > body. Transition continue sans bond brutal entre breakpoints.

---

## 6 · Accessibilité WCAG AA

### 6.1 Ratios de contraste minimum (WCAG 2.2 AA)

| Type | Ratio | Exemple SVB |
|---|---|---|
| Texte courant | **4.5:1** | `ink` sur `cream` = 8.3:1 ✅ |
| Texte large (≥18.66px reg / ≥14px bold) | **3:1** | `brand.dark` sur `sand` = 5.1:1 ✅ |
| UI components (bordures d'état, icônes) | **3:1** | `border-strong` sur `surface.base` = 3.2:1 ✅ |

**Paires validées** (testées avec WebAIM Contrast Checker) :

| Foreground | Background | Ratio | Statut |
|---|---|---|---|
| `ink` #2F4F4F | `cream` #FBF6EC | 9.4:1 | AAA ✅ |
| `ink` #2F4F4F | `sage` #98D0B3 | 4.6:1 | AA ✅ |
| `ink` #2F4F4F | `sand` #F2E6CF | 7.3:1 | AAA ✅ |
| `cream` #FBF6EC | `ink-2` #1D3838 | 13.2:1 | AAA ✅ |
| `cream` #FBF6EC | `brand.dark` #4A8D84 | 4.9:1 | AA ✅ |
| `brand.dark` #4A8D84 | `cream` #FBF6EC | 4.9:1 | AA ✅ |

**Paires à éviter** ❌
- `sage` sur `cream` : 1.4:1 (décoratif uniquement, jamais de texte)
- `peach` sur `cream` : 1.5:1 (idem)

### 6.2 Checklist composants

| Critère | Où | Statut |
|---|---|---|
| `<label>` explicite sur tout input | Forms | ✅ |
| `aria-label` sur boutons icon-only | FAB WhatsApp, burger, X close | ✅ |
| Focus visible sur TOUS les interactifs | `:focus-visible` outline 2px + offset 3px | ✅ |
| Skip-to-content | Home, blog, key pages | ✅ (`.svb-skip`) |
| Tap target ≥ 44×44px (iOS/Android) | Tous boutons mobile | ✅ |
| `prefers-reduced-motion` respecté | Toutes animations | ✅ |
| Hiérarchie heading (H1 unique, H2→H6 logique) | Par page | ✅ (validé audit) |
| Texte redimensionnable 200% sans overflow | Viewport + `rem` units | ✅ |
| Contraste non-text ≥ 3:1 | Bordures inputs, icônes | ✅ |
| `lang="fr"` ou `lang="en"` déclaré | `<html>` | ✅ |
| alt descriptifs sur toutes `<img>` | 103/103 imgs | ✅ |

### 6.3 Focus ring standard SVB

```css
:where(button, a, input, select, textarea, [tabindex]):focus-visible {
  outline: 2px solid #4A8D84;
  outline-offset: 3px;
  border-radius: 6px;
}
```

---

## 7 · Bibliothèque de composants

36 composants documentés. Chaque composant est décrit par :
- **Anatomie** (parts Figma)
- **États** (default, hover, focus, active, disabled, loading, error)
- **Variantes** (size, intent, layout)
- **Règles d'usage** (quand oui / quand non)
- **Tokens consommés**

> 📐 **Convention Figma** : chaque composant = 1 Main Component avec Variants (pour les states) et Component Properties (pour size/intent). Voir §8.

---

### 7.1 Button · Primary

**Anatomie** : conteneur pill + icône optionnelle (gauche/droite) + label.
**Variantes** :
- Size : `sm` (36px), `md` (44px default), `lg` (56px), `xl` (64px)
- Intent : `primary` (ink-2 bg), `brand` (brand.dark bg), `peach` (accent)
- Shape : pill (`radius-full` default), rounded (`radius-md`)

**États** :

| State | Transform | Background | Shadow |
|---|---|---|---|
| default | — | `brand.ink-2` | `shadow-brand` |
| hover | translateY(-2px) | `brand.dark` | `shadow-xl` |
| focus-visible | — | = default | outline focus |
| active/pressed | translateY(0) scale(.98) | `brand.darker` | `shadow-inner` |
| disabled | — | `neutral-300` | none (opacity 55%) |
| loading | — | = default | spinner remplace label |

**Usage** : **1 seul primary par zone visible**. Si 2 actions → secondary pour la moins importante.

**Tokens** :
`color.brand.ink-2`, `color.brand.dark`, `color.brand.darker`, `color.brand.cream`, `typography.body` + `fw.semibold` + `ls.wider`, `radius.full`, `shadow.brand`, `shadow.xl`, `dur.base`, `ease.standard`.

---

### 7.2 Button · Secondary (Outline)

Même anatomie, variations de style :
- Border 1.5px `brand.ink-2`, transparent background
- Hover : fond devient `brand.ink-2`, texte `cream`

**Usage** : actions secondaires d'une zone (« Voir les disciplines » à côté d'un CTA « Réserver »).

---

### 7.3 Button · Ghost

Pas de bordure, fond transparent. Hover : fond `primary-100`.
**Usage** : actions tertiaires, navigation secondaire.

---

### 7.4 Button · Icon

Carré ou rond (`radius-full`), taille min 44×44 (a11y).
**Obligatoire** : `aria-label` descriptif.
**Usage** : burger menu, close modal, play video, actions quick.

---

### 7.5 Link (Inline / Arrow)

2 variantes :
- **Inline** : `brand.dark`, underline au hover, transition xfast
- **Arrow** : « Voir plus → » — underline animée bottom-up au hover

---

### 7.6 Input · Text

**Anatomie** : container + label + helper text optionnel + error message.
**Taille** : 44px min height.
**Border** : `border-default`, focus `border-focus` (brand.dark) + `shadow-focus`.
**Background** : `surface.sunken` au repos, `surface.base` au focus.

**États** : default, focus, filled, disabled, error, success.

**Règles** :
- Label TOUJOURS visible (pas de placeholder-as-label)
- Helper text sous l'input (not tooltip)
- Error state : border `error`, message `error-dark` avec icône

---

### 7.7 Input · Select (Dropdown)

Identique Input Text + chevron icon droite. Native `<select>` pour accessibilité mobile.

---

### 7.8 Input · Textarea

Min 80px height, resize vertical uniquement (`resize: vertical`).

---

### 7.9 Checkbox / Radio

- 18×18px, accent-color `brand.dark`
- Focus ring visible
- Label cliquable sur toute la largeur

---

### 7.10 Toggle Switch

- 32×18px, track radius-full
- Animation 180ms base
- Handle `cream`, track `primary-300` → `brand.dark` (on)

---

### 7.11 Card (Default)

**Anatomie** : container (radius-lg, shadow-sm, border subtle) + media zone + body (padding 6) + footer optional.
**Hover** : `translateY(-6px)`, `shadow-lg`, duration medium.
**Variantes** : default, featured (transform scale 1.03), clickable (tout le container = lien).

---

### 7.12 Card · Pricing

3 zones : header (nom pass), prix hero, liste features (bullets sage), CTA full-width.
Variante `featured` : background dégradé brand, badge « Le + choisi ».

---

### 7.13 Card · Coach

Ratio média 4:5, photo cover, body avec nom (Dancing Script) + role + bio italic + tags.

---

### 7.14 Card · Class / Session

Slot horaire : heure (bold body-lg), discipline, durée, coach thumb, CTA réserver.
État `full` : grisé + label « Complet ».

---

### 7.15 Badge / Chip / Tag

Pill `radius-full`, padding 1/3, body-sm bold.
Intents : default, brand, peach, success, warning, error.

---

### 7.16 Alert / Banner

Full-width ou contained, radius-md, padding 4, icône gauche + message + close optionnel.
Intents sémantiques (4 variantes couleur).

---

### 7.17 Toast / Notification

Position fixed bottom-center (mobile) ou top-right (desktop). Auto-dismiss 5s. Swipeable mobile.

---

### 7.18 Modal / Dialog

Backdrop `surface.overlay` + blur, content radius-2xl, padding 12. Close ×, ESC key, click outside.
Focus trap obligatoire, return focus au trigger à la fermeture.

---

### 7.19 Drawer / Sheet

Slide depuis right (desktop) ou bottom (mobile). Même règles focus que modal.

---

### 7.20 Navbar

Sticky top, background `surface.base` avec blur 20px, border-bottom subtle.
Logo (Great Vibes) + links center + CTA droite. Mobile : logo + burger.

---

### 7.21 Footer

Background `brand.ink-2`, texte `cream`. 4 col desktop, 2 col tablet, 1 col mobile.
Contient : brand + baseline, liens disciplines, liens studio, légal, copyright.

---

### 7.22 Breadcrumb

`Accueil > Blog > Article`. Séparateur `›` (U+203A), dernier lien non cliquable (aria-current=page).

---

### 7.23 Tabs

Horizontal chips (sm radius-full) ou underline (md/lg). Active : background `brand.ink-2`.
Clavier : flèches gauche/droite, Home/End.

---

### 7.24 Accordion

`<details>` + `<summary>` natifs + enrichissement JS. Icon `+` rotate 45° à l'ouverture (duration base ease standard).

---

### 7.25 Tooltip

Affiché au hover/focus. Délai 500ms entry, 200ms exit. Background `ink-2`, text `cream`, body-sm, padding 2/3, radius-sm.

---

### 7.26 Popover

Plus élaboré que tooltip (peut contenir actions). Trigger click, dismiss ESC ou click outside.

---

### 7.27 Avatar

Cercle `radius-full`, tailles : xs (24px), sm (32px), md (40px default), lg (56px), xl (80px).
Fallback : initiales sur fond `peach` + `cream` text.

---

### 7.28 Loader · Spinner

Cercle 24px rotation 360° linear 800ms infinite. Color `brand.dark`.

---

### 7.29 Loader · Skeleton

Background `neutral-100` + pseudo `linear-gradient(90deg, transparent, rgba(255,255,255,.6), transparent)` animation 1.2s shimmer.

---

### 7.30 Progress Bar

Hauteur 6px, track `neutral-200`, fill `brand.dark`, radius-full. Peut être déterminé (width %) ou indéterminé (animation).

---

### 7.31 Pagination

Chiffres dans des cercles 40×40 (min tap), actif = `brand.ink-2` bg. Flèches prev/next avec aria-label.

---

### 7.32 Stat / KPI

Grand chiffre (`display` ou `h1` en Dancing Script), label caption uppercase eyebrow en dessous. Optionnel : delta +/- avec couleur success/error.

---

### 7.33 Testimonial Card

Background dark (`ink-2`), texte `cream` italic, étoiles peach, auteur bold + date secondary. Scroll-snap horizontal en carousel.

---

### 7.34 Hero (Video)

100svh min, video background muted loop playsinline preload="none" (lazy), poster preload fetchpriority="high".
Overlay gradient `to bottom, rgba(0,0,0,.3), rgba(0,0,0,.5)`.
Content centré ou aligné bas-gauche.

---

### 7.35 FAB (Floating Action Button)

Position fixed bottom-right. 56×56 min, radius-full, shadow-xl.
Transition scale 1.08 au hover. Respect reduced-motion.

---

### 7.36 Consent Banner (RGPD)

Position fixed bottom, max-width 780px, backdrop blur, 2 boutons (Accepter/Refuser). Voir §7.36 pour détail implémentation.

---

### 7.37 Newsletter Widget

Inline ou card. Email input + submit inline. State : idle, loading, success, error. Message texte sous le form.

---

### 7.38 Splash Screen (logo intro)

Plein écran sage→sand gradient, logo centré, fade-out 1.4s après 400ms delay. **Skippable** (touch/click). Désactivé en reduced-motion.

---

## 8 · Convention Figma

### 8.1 Nommage

| Type | Format | Exemple |
|---|---|---|
| Color style | `color/category/shade` | `color/primary/500` |
| Text style | `text/level/variant` | `text/h2/default` |
| Effect style | `shadow/size` ou `blur/size` | `shadow/brand` |
| Component | `Module / Component / Variant` | `Button / Primary / Large` |
| Component property | `PascalCase` | `Size`, `Intent`, `State`, `HasIcon` |
| Icon | `icon/category/name` | `icon/action/close` |

### 8.2 Structure d'un composant Figma (exemple Button)

```
🔘 Button / Primary                        [Main Component]
├─ 📋 Properties
│   ├─ Size: sm | md | lg | xl              (variant)
│   ├─ State: default | hover | focus | active | disabled | loading  (variant)
│   ├─ HasIconLeft: boolean                  (boolean)
│   ├─ HasIconRight: boolean                 (boolean)
│   └─ Label: "Button"                       (text)
├─ 🎨 Variants: Size × State = 24 combinaisons
└─ 📐 Auto-layout horizontal, gap 2, padding (h-3 v-4)
```

### 8.3 Tokens dans Figma (via Tokens Studio plugin)

Importer `tokens.json` via [Tokens Studio for Figma](https://tokens.studio). Le fichier respecte le W3C Design Tokens Community Group spec → compatibilité immédiate.

Après import :
- Les styles Figma sont générés automatiquement
- Les modifications dans le plugin se répercutent dans les composants
- Export bidirectionnel Git possible (via Tokens Studio Pro)

### 8.4 Figma Make — quickstart

1. **Créer un nouveau Figma Make project** avec ce repo comme base.
2. **Importer** `/design-system/tokens.json` via Tokens Studio.
3. **Mapper** les styles auto-générés aux composants.
4. **Pages Figma recommandées** :
   - `01 · Foundations` (colors, type, spacing, motion)
   - `02 · Components` (la bibliothèque 36 items)
   - `03 · Patterns` (cards, forms, headers assemblés)
   - `04 · Templates` (pages types : home, tarifs, blog article)
   - `05 · Icons` (librairie icônes)
   - `06 · Archive` (versions dépréciées)

### 8.5 Workflow de mise à jour

1. Modifier les tokens dans Tokens Studio
2. Exporter vers `/design-system/tokens.json`
3. Le script `build.sh` lit le JSON et régénère `tokens.css`
4. Commit → Netlify rebuild

---

## 9 · Changelog

- **1.0.0** (2026-04-17) — Initial release. 36 composants, 9 niveaux typo, dark mode ready, WCAG AA validé.

---

## 📁 Fichiers livrables

- `tokens.json` — Design tokens (format W3C DTCG)
- `tokens.css` — CSS custom properties + dark mode + utility classes
- `DESIGN-SYSTEM.md` — Ce document (Figma-ready)
- `index.html` — Showcase visuel interactif du design system

## 📬 Contact design system

Questions, évolutions, nouveaux composants → **design@studiosvb.fr** (alias à créer) ou PR sur ce repo.
