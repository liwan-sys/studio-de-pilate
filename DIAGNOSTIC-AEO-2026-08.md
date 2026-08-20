# Diagnostic AEO/GEO — Actions restantes (2026-08-20)

Suite à l'audit AEO/GEO du 19-20 août 2026 (fichier `auditaeosvb.html`),
voici l'état d'exécution des 19 actions.

## ✅ Fait (dans le code) — vague 1

- **Instagram handle** : `instagram.com/studiosvb` (compte inexistant) → `instagram.com/svb.officiel` partout (30 fichiers HTML + schema.org `sameAs`).
- **5 URLs 404 orphelines** : 10 redirections 301 ajoutées dans `_redirects` (`/tarifs-offres/`, `/cours/`, `/planning/`, `/cadeau`, `/hello-world/` avec + sans slash).
- **Schema.org studio-cours-des-lavandieres** : type `HealthClub`, `geo`, `hasMap`, `openingHoursSpecification` (7 jours), `aggregateRating` 5.0/140, `knowsAbout` enrichi (Lagree Method, Megaformer, Classic & Power Pilates, Hatha Flow).
- **Schema.org studio-parc-des-docks** : idem — type `HealthClub`, geo, hasMap, opening hours, aggregateRating, knowsAbout enrichi.
- **`/contact`** : JSON-LD `ContactPage` + `Organization` ajouté (vide avant).
- **Hreflang FR/EN** sur 6 paires de pages (sessions, studio, tarifs, equipe, contact, faq) — avant, seul l'accueil déclarait ses alternates.
- **Sitemap.xml** : `lastmod=2026-08-20` sur les 33 entrées.
- **Nombre d'avis** : harmonisé à "plus de 140 avis Google" partout (index disait 146, autres pages 140).
- **`llms.txt`** créé à la racine avec identité, adresses, horaires, disciplines, liens clés.

## ⏳ À faire côté humain — vague 1 (priorité maximale)

Ces actions nécessitent un accès à des comptes externes ou des décisions opérationnelles.

### 1. Fiche Google Business Profile (LE point le plus rentable)

**Priorité #1 absolue.** Le site revendique "5,0 sur 140 avis Google" mais aucune fiche Google Business n'est trouvable par les crawlers. Sans fiche revendiquée avec NAP identique au site :
- Impossible pour les IA de citer la note
- `aggregateRating` déclaré dans le code paraît invérifiable
- Les 140 avis n'ont aucune valeur pour AEO

**À faire** (2 h max) :
1. Vérifier sur https://business.google.com si des fiches existent pour :
   - 6 Mail André Breton, 93400 Saint-Ouen-sur-Seine
   - 40 Cours des Lavandières, 93400 Saint-Ouen-sur-Seine
2. Si oui : **revendiquer** chaque fiche, corriger NAP pour être **strictement identique** au site :
   - Nom : "Studio SVB" (choisir UNE forme canonique — aujourd'hui 6 variantes circulent)
   - Adresse : identique caractère par caractère au site
   - Téléphone : 07 44 91 91 55 (partout)
   - Catégorie principale : **Studio de Pilates** (pas "Salle de sport")
   - Horaires : identiques à `openingHoursSpecification` du site
   - Site : https://studiosvb.com
3. Si non : **créer** les 2 fiches et lancer une campagne de collecte d'avis Google.
4. Remplacer les `<iframe src="maps.google.com/maps?q=...">` du site par l'URL canonique de chaque fiche (Google Maps > Partager > Copier le lien).

### 2. Redirection studiosvb.fr → studiosvb.com

Le domaine `.fr` affiche une page de parking Squarespace "En construction". L'e-mail affiché sur le site est `hello@studiosvb.fr`.

**À faire** :
1. Depuis Squarespace : configurer une redirection 301 permanente de `studiosvb.fr` vers `studiosvb.com` (ou l'inverse si tu préfères basculer sur le .fr).
2. Trancher **maintenant** la direction et t'y tenir.
3. Optionnel : aligner le domaine de l'e-mail (`hello@studiosvb.com`) pour cohérence — si l'e-mail actuel .fr fonctionne bien via un forward MX, tu peux garder .fr.

### 3. Fusionner les 2 pages Facebook

Deux pages Facebook concurrentes : ID `61569485866457` (indexée par Google) et `61574972498498` (liée depuis le site).

**À faire** : depuis Meta Business > outil de fusion de pages. Choisir laquelle garder puis fusionner. Effet immédiat sur les signaux sociaux.

### 4. S'inscrire sur ClassPass, Gymlib/Wellpass et Urban Sports Club

Trois inscriptions déclaratives = trois pages tierces indexées avec avis et prix (format que ChatGPT Search et Perplexity recopient).

**À faire** :
- ClassPass (fr.classpass.com)
- Gymlib (récemment renommé Wellpass) — gymlib.com
- Urban Sports Club — urbansportsclub.com

Bonus : annuaires fitness gratuits — MaSalleDeSport, Yogasita, Yoze, Alentoor.

### 5. Corriger la bio Instagram + Weezevent

- Bio Instagram : corriger "Pilate reformer" → "Pilates Reformer".
- Page Weezevent de déc. 2024 : demander de dépublier ou mettre à jour, elle diffuse encore le handle `@svbclub` (troisième handle qui traîne).

## ⏳ À faire côté humain — vague 2 (1-2 mois)

### 6. Récupérer la citation Communale Saint-Ouen

**communalesaintouen.com/evenements/cross-training-avec-shanael/** — cette page ne mentionne pas "SVB" ni "Santez Vous Bien", donne un téléphone différent (06 66 50 12 69), renvoie vers les comptes personnels.

**À faire** : e-mail à Communale demandant l'ajout de :
- "Studio SVB / Santez Vous Bien"
- Téléphone officiel 07 44 91 91 55
- Lien vers https://studiosvb.com
- Correction du jour (mercredi/dimanche en titre, samedi dans le corps)

### 7. Annuaire du Cours des Lavandières

Studio absent de l'annuaire des commerçants du Cours des Lavandières alors qu'il y est implanté. E-mail simple à envoyer.

### 8. Créer les fiches annuaires manquantes (NAP identique partout)

PagesJaunes, Yelp, Foursquare, Apple Plans, Bing Places, Petit Futé, Justacoté, 118712, annuaire mairie de Saint-Ouen.

**Règle absolue** : nom / adresse / téléphone strictement identiques (au caractère près) partout. **Choisir une forme canonique unique** — aujourd'hui 6 variantes circulent : "SVB SANTEZ-VOUS BIEN", "SANTEZ VOUS BIEN", "Studio SVB", "SVB | Pilate reformer"...

Ma reco : **"Studio SVB"** comme nom principal.

### 9. LinkedIn

Le profil LinkedIn de la fondatrice est encore indexé sous l'employeur "Neoness". Pour une IA interrogée sur "qui a fondé Santez Vous Bien", LinkedIn contredit la réalité.

**À faire** :
- Mettre à jour le profil personnel
- Créer une page entreprise LinkedIn "Studio SVB"
- Ouvrir un compte TikTok de marque (aujourd'hui seul le compte personnel du co-fondateur porte le studio)
- Idéalement : chaîne YouTube

## ⏳ À faire côté humain — vague 3 (trimestre)

### 10. Entrer dans les listicles parisiens

Cibles par ordre d'accessibilité :
- **Enlarge your Paris** (seul guide "Saint-Ouen" identifié)
- **exo-sport** (classement studios reformer, mis à jour avril 2026)
- **Sortiraparis** : 3 angles — guide reformer, guide Lagree, **angle enfants** (a déjà valu un article à Burning Bar)
- **Paris ZigZag** (format "on a testé")
- **Paris Wellness Review**, **Cocoon Paris** (listicle Lagree, 5 places, aucune au nord)
- **Ma Chaussette Pilates**, **Do it in Paris**, **Club Evolution**, **35 Sport Club**

Angles à proposer :
- "le premier studio Crossformer / Lagree au nord de Paris"
- "faire du reformer 40 % moins cher qu'intra-muros, à 4 min de la ligne 14"
- "le studio où on peut venir avec ses enfants"

### 11. Lancer un blog de 8-10 articles-réponses

Pas du contenu de marque : des **réponses**. Sujets à traiter :
- *Reformer, Crossformer ou Lagree : quelles différences ?*
- *Combien coûte vraiment un cours de reformer à Paris en 2026 (tableau comparatif)*
- *Reprendre le sport après un accouchement : par quoi commencer*
- *Faire du pilates avec ses enfants sur place*
- *Reformer à Paris vs proche banlieue : le vrai calcul*

Chaque article balisé `Article` ou `FAQPage` avec `datePublished` + `dateModified`.

### 12. Ouvrir les pages "post-partum" et "post-blessure"

Personne ne tient "studio de reformer post-partum au nord de Paris". Seul Gaïa Pilates (18e) est positionné mais avec un site très faible.

Créer une page dédiée + partenariat de recommandation croisée avec des sages-femmes et kinés de Saint-Ouen / 18e.

### 13. Reddit + groupes Facebook locaux

Reddit = source la plus surpondérée par AI Overviews et ChatGPT Search sur les recommandations locales. **Aujourd'hui : zéro empreinte.**

Ne pas spammer : participer honnêtement aux fils r/paris et r/Fitness_fr sur le pilates et le sport dans le nord parisien.

### 14. Mesurer le progrès

Reposer les 10 requêtes de l'audit dans ChatGPT / Perplexity / Gemini interrogés en français depuis une adresse française :
- meilleur studio pilates reformer Saint-Ouen
- pilates reformer Saint-Ouen-sur-Seine
- salle de sport Saint-Ouen cours collectifs
- studio fitness boutique Paris 18 pilates reformer
- coach sportif Saint-Ouen
- cours de pilates près de Mairie de Saint-Ouen
- salle de sport avec espace enfants Paris nord
- remise en forme post-partum Saint-Ouen / Paris 18
- meilleur studio pilates Paris pas cher
- crossformer Paris

Refaire ce test **dans 90 jours** (mi-novembre 2026) pour mesurer.

## Actions vague 2 restantes (côté code — TODO)

Ces actions demandent une rédaction plus longue et méritent leur propre PR :

- **Écrire la page Crossformer ↔ Lagree** — pont sémantique explicite dans le contenu de `/crossformer-saint-ouen` : "Crossformer, méthode style Lagree/Megaformer, à Saint-Ouen à 10 min de Paris 18". SVB est le seul acteur identifiable en France sur "Crossformer" mais absent sur "Lagree Paris".
- **Rédiger vraiment les pages "villes voisines"** : `/pilates-reformer-paris-17` est redirigé aujourd'hui — envisager de recréer une vraie page (temps de trajet depuis Batignolles, métro, comparaison prix). Idem pour Paris 18, Clichy, Saint-Denis.
- **Compléter la page `/sport-enfant-saint-ouen`** avec l'angle "espace enfants pendant le cours parents" — angle presse qui a valu à Burning Bar un article Sortiraparis.
- **Créer les articles blog** (voir liste vague 3 ci-dessus).

---

Dernière mise à jour : 2026-08-20 (post-audit AEO/GEO)
