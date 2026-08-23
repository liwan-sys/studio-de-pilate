# Audit SEO et référencement IA - SVB

Date : 16 août 2026
Périmètre : studiosvb.com, pages françaises et anglaises, données structurées, indexation, performance, cohérence de marque et compréhension par les moteurs d'IA.

## Verdict

SVB possède déjà une vraie autorité locale : la marque est recherchée, la page d'accueil concentre beaucoup de clics et les pages Pilates Reformer, Boxe, Tarifs et Studios ont une demande mesurable. Le principal frein n'était pas un manque de contenu. C'était l'excès de pages répétitives, les informations difficiles à maintenir et une définition trop floue de l'entité SVB.

La nouvelle structure donne un message beaucoup plus net :

- **SVB** est la marque ; **Santez Vous Bien** est sa signification ; **Studio SVB** désigne le site et les studios.
- SVB possède **deux établissements réels à Saint-Ouen-sur-Seine**.
- Le Parc des Docks, 6 Mail André Breton, accueille Cross Training, Boxe, Yoga Kids et coaching privé.
- Le Cours des Lavandières, 40 Cours des Lavandières, accueille Pilates Reformer, Crossformer, Pilates au sol et Yoga Vinyasa.
- SVB ne propose plus de massage ni de rubrique bien-être.
- Les pages prioritaires parlent des disciplines, des studios, des coachs, des tarifs et de l'essai, sans multiplier les pages artificielles par ville.

## Données Search Console

Période observée : du 15 mai au 14 août 2026.

| Indicateur | Résultat |
| --- | ---: |
| Clics Google | 1 747 |
| Impressions Google | 19 105 |
| Taux de clic moyen | 9,1 % |
| Position moyenne | 7,9 |

Pages les plus visibles :

| Page | Clics | Impressions |
| --- | ---: | ---: |
| Accueil | 1 302 | 12 696 |
| Tarifs | 132 | 1 956 |
| Boxe anglaise | 64 | 1 006 |
| Pilates Reformer | 54 | 2 345 |
| Ancienne page bien-être | 38 | 918 |
| Parc des Docks | 27 | 1 323 |
| Contact | 26 | 1 656 |
| Planning et studios | 26 | 1 341 |
| Yoga | 21 | 1 054 |
| Cross Training | 17 | 686 |
| Disciplines | 16 | 409 |
| Version anglaise | 13 | 888 |
| Pilates au sol | 10 | 1 172 |
| Équipe | 9 | 921 |
| Coaching sportif | 8 | 437 |

Les recherches de marque sont solides : « svb saint ouen » a généré 490 clics, « santez vous bien » 69 clics, « santez vous bien saint ouen » 47 clics et « studio svb » 36 clics. La requête générique « salle de sport saint ouen » a obtenu 842 impressions mais seulement 9 clics : elle reste une opportunité à travailler avec la page dédiée, les fiches Google et les avis réels.

Le rapport bêta consacré aux résultats issus de l'IA comptait 225 impressions. L'accueil arrivait en tête, puis la version anglaise, la page Disciplines, le Pilates Reformer, l'ancienne page bien-être, les Tarifs, certains anciens articles, la Boxe et le Coaching. Les anciennes URL qui avaient déjà reçu des signaux sont donc redirigées vers la page actuelle la plus proche afin de conserver leur valeur.

## Problèmes constatés avant correction

### 1. Index trop dispersé

Le sitemap contenait 75 URL. Search Console signalait 60 pages non indexées, dont 43 « détectées, actuellement non indexées ». Une grande partie correspondait à des articles faibles, des doublons `.html` ou des pages presque identiques ciblant Paris, Clichy, Levallois, Asnières, Épinay et l'Île-Saint-Denis.

Cette dispersion obligeait Google à choisir entre plusieurs pages proches au lieu d'identifier une page forte par intention.

### 2. Entité SVB ambiguë

Le nom de l'organisation et celui des établissements étaient parfois mélangés dans les données structurées. Une même identité technique pouvait représenter à la fois la marque et un lieu physique. Pour une IA, cela rend plus difficile la réponse à des questions simples : qu'est-ce que SVB, combien de studios existent et quelle discipline se pratique à quelle adresse ?

### 3. Données structurées fragiles

Plusieurs pages de service se déclaraient comme des établissements. Des notes, nombres d'avis, horaires, coordonnées géographiques et objets vidéo difficiles à maintenir étaient intégrés au code. Les avis auto-déclarés d'une entreprise locale ne sont par ailleurs pas éligibles aux étoiles Google lorsqu'ils sont publiés par l'entreprise sur ses propres pages.

### 4. Contenu difficile à vérifier

Le site contenait des résultats chiffrés, des promesses de progression, des comparaisons avec d'autres salles, des horaires fixes, des nombres exacts de coachs et des avis internes non vérifiables. Ces éléments vieillissent vite et peuvent conduire Google ou une IA à reprendre une information devenue fausse.

### 5. Ancienne offre bien-être encore présente

Des mentions de massage, bien-être et wellness restaient dans les pages, les liens et certains contenus techniques alors que cette offre n'existe plus.

### 6. Poids vidéo excessif

Le dossier vidéo pesait 287,2 Mo. Plusieurs vidéos verticales de 30 à 43 secondes pesaient entre 21 et 41 Mo chacune et pouvaient être chargées simultanément sur la page Disciplines.

### 7. Outils et contenus dormants

Un ancien blog, un mini-CMS, trois avis internes non affichés, un widget inutilisé et un générateur de contenu restaient présents. Ils augmentaient la complexité sans aider les visiteurs ni le référencement.

## Corrections réalisées

### Architecture et indexation

- Sitemap réduit de **75 à 35 URL canoniques**.
- Une seule page principale par discipline ou intention locale utile.
- Suppression des pages satellites presque identiques par ville.
- Suppression de l'ancien blog et de ses 22 pages ou flux.
- Suppression des pages bien-être et redirection vers Disciplines.
- Redirections permanentes conservées pour les anciennes URL afin de ne pas perdre les signaux déjà acquis.
- Redirection des variantes `.html` vers les URL propres.
- Pages juridiques et techniques accessibles mais placées en `noindex` lorsqu'elles n'ont pas vocation à apparaître dans les résultats.
- Aucun lien interne restant ne pointe vers une URL redirigée.

### Marque et établissements

- Organisation principale : **SVB**.
- Noms alternatifs déclarés : **Studio SVB**, **Santez Vous Bien**, **studiosvb.com**.
- Définition explicite : « SVB signifie Santez Vous Bien ».
- Deux établissements seulement dans les données structurées, chacun relié à l'organisation SVB.
- Disciplines et adresses corrigées sur tout le site.
- Téléphone, e-mail, Instagram et adresses rendus cohérents.

### Données structurées

- Une entité `Organization` centrale sur l'accueil.
- Deux entités d'établissement, une par adresse réelle.
- Des objets `Service` sur les principales pages de discipline.
- Suppression des notes, nombres d'avis, horaires et coordonnées difficiles à maintenir dans le balisage.
- Suppression des faux objets vidéo et des établissements dupliqués.
- Correction des liens `.html` dans les fils d'Ariane et les offres.
- Vérification automatique de la validité de tous les blocs JSON-LD.

### Contenu et fiabilité

- Offre d'essai uniformisée : **30 €**, dont **15 € déduits en cas d'inscription sous 7 jours**.
- Suppression des promesses médicales, chiffres de calories, délais de résultats et comparaisons non démontrables.
- Suppression de l'affirmation « 2 à 3 fois plus vite » et des prestations non confirmées.
- Tarifs détaillés concentrés sur la page Tarifs afin d'éviter les contradictions futures.
- Horaires statiques retirés des pages de discipline ; le planning en ligne reste la source actuelle.
- Texte grossesse, douleur et reprise après blessure rendu prudent et factuel.
- Questionnaire d'abonnement allégé : aucune demande de diagnostic ou de traitement médical par WhatsApp.
- Ancienne rubrique « Blog » renommée « Disciplines » dans toute la navigation.
- Partie massage et bien-être retirée du contenu public.
- Sportigo n'a pas été modifié.

### Performance

- Vidéos les plus lourdes réencodées pour le web, avec contrôle visuel.
- Poids total des vidéos réduit de **287,2 Mo à 54,2 Mo**, soit environ **81 % de moins**.
- Une vidéo inutilisée de 19 Mo supprimée.
- Affiches fixes ajoutées aux vidéos verticales.
- Chargement différé : les vidéos secondaires démarrent seulement lorsqu'elles approchent de l'écran.
- Les grands titres restent lisibles dès l'affichage, même pendant leur animation.
- Écran vert d'introduction retiré : l'accueil s'affiche immédiatement à la première visite.
- Version du cache du site mise à jour pour éviter de montrer une ancienne version après publication.

### Nettoyage technique

- Ancien CMS, widget d'avis, fichiers d'avis non vérifiables et générateur de blog retirés.
- Ancien test A/B de l'accueil retiré : une seule version est servie et peut rester en cache sur le CDN.
- Anciennes balises `meta keywords` supprimées.
- Encodage de texte corrigé.
- Fichier `robots.txt` simplifié et accès explicitement autorisé à `OAI-SearchBot`, le robot de recherche de ChatGPT.
- Contrôle automatique ajouté à chaque mise à jour pour vérifier sitemap, titres, descriptions, H1, canoniques, redirections, données structurées, images et affirmations retirées.

## Structure conservée

Les 35 URL indexables sont réparties en cinq ensembles :

1. Marque et conversion : accueil, pourquoi SVB, essai, tarifs, témoignages, équipe, FAQ, contact, cadeau et parrainage.
2. Navigation pratique : disciplines, planning et studios.
3. Deux établissements : Parc des Docks et Cours des Lavandières.
4. Disciplines et besoins : Reformer, Crossformer, salle de sport, Yoga, Boxe, Cross Training, Bootcamp, Pilates au sol, coaching, Yoga Kids, sport enfant, sport femme et sport débutant.
5. Huit pages anglaises utiles pour les personnes qui cherchent un studio à Saint-Ouen en anglais.

## Ce qui reste à faire hors du site

Ces actions nécessitent un travail sur les plateformes externes ou des informations réelles fournies par SVB :

### Priorité 1 - Fiches Google Business Profile

- Vérifier qu'il existe une fiche distincte pour chaque établissement réellement accueilli par le public.
- Utiliser un nom cohérent commençant par SVB, sans ajouter artificiellement des mots-clés.
- Associer chaque fiche à sa page d'établissement correspondante.
- Vérifier les catégories, le téléphone, les horaires, les photos et l'adresse.
- Éviter toute troisième fiche ou ancienne fiche en doublon.

### Priorité 2 - Preuves humaines

- Ajouter sur la page Équipe les vrais noms, photos, disciplines et qualifications des coachs qui acceptent d'être présentés.
- Conserver uniquement des témoignages dont l'origine peut être confirmée.
- Demander des avis Google naturels après une expérience réelle, sans imposer de texte au client.
- Montrer régulièrement des photos authentiques de cours dans chacun des deux studios.

### Priorité 3 - Suivi Search Console

- Envoyer le nouveau sitemap après publication.
- Demander une nouvelle exploration de l'accueil, Reformer, Coaching, Salle de sport, Tarifs et des deux studios.
- Surveiller pendant 4 à 8 semaines la baisse des URL « détectées, actuellement non indexées ».
- Comparer les impressions et clics sur « salle de sport saint ouen », « coach sportif saint ouen », « pilates reformer saint ouen » et les requêtes de marque.
- Ne pas recréer de pages par ville tant qu'une vraie demande et un contenu réellement différent ne le justifient pas.

## Pourquoi cette structure aide aussi les IA

Il n'existe pas de balise magique « SEO pour IA ». Les moteurs d'IA s'appuient sur des pages accessibles, des faits cohérents, des sources identifiables et une entité clairement décrite. Une réponse fiable devient plus probable lorsque la marque, les lieux, les services, les preuves et les coordonnées se confirment entre le site, Google Business Profile et les autres sources publiques.

Le site respecte maintenant ce principe : peu de pages, chacune avec un rôle précis, une marque centrale, deux lieux réels et aucune offre retirée présentée comme actuelle.

## Sources officielles utilisées

- [OpenAI - permettre à ChatGPT Search d'afficher un site](https://help.openai.com/en/articles/12627856)
- [Google - données structurées Organization](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [Google - données structurées LocalBusiness](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Google - fonctionnement des données structurées](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Google - règles relatives aux avis](https://developers.google.com/search/docs/appearance/structured-data/review-snippet)
- [Google - créer et envoyer un sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google - politiques antispam et pages satellites](https://developers.google.com/search/docs/essentials/spam-policies)
- [Google - contenu utile et fiable](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google - recherche et fonctionnalités d'IA](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

## Résultat mesurable de l'intervention

| Avant | Après |
| --- | ---: |
| 75 URL dans le sitemap | 35 URL |
| Plusieurs établissements déclarés sur des pages de service | 2 établissements réels |
| Blog et pages locales répétitives | Pages de référence consolidées |
| 287,2 Mo de vidéos | 54,2 Mo |
| Horaires et informations dupliqués | Planning et Tarifs comme sources principales |
| Contrôle manuel uniquement | Validation SEO automatique |

Google doit maintenant réexplorer les URL et traiter les redirections. L'amélioration de l'index ne sera donc pas instantanée, mais la base publiée sera beaucoup plus simple à comprendre, à maintenir et à citer.
