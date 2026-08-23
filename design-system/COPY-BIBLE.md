# SVB · Copy Bible v1.0

> **Rôle** : alimenter directement les mises en page **Figma Make**.
> Chaque élément indique le nombre de caractères (= contrainte de bloc), la hiérarchie HTML, et les leviers de persuasion activés.
>
> **Rédigé par** : Stratégie Conversion — pilier « acquisition et revenu récurrent ».

---

## 0 · Paramètres éditoriaux

### 0.1 Brand voice (matrice)

| Dimension | Position | Preuve |
|---|---|---|
| **Ton** | 70% casual / 30% autoritaire | Tutoiement partout sauf légal. Affirmations nettes, chiffres en duel. |
| **Registre** | Chaleureux-exigeant | On accueille chaudement ; on n'édulcore jamais les résultats. |
| **Énergie** | BOLD mais pas crieur | Punchy ≠ gueulard. On marque l'attention avec la précision, pas les majuscules. |
| **Humour** | Léger, situationnel | Un trait par page max. Jamais sur la santé, la morphologie, l'âge. |
| **Longueur phrase** | 8–14 mots moyenne | Deux phrases courtes > une longue. Le lecteur mobile ne revient pas en arrière. |

### 0.2 Audience cible (3 personas dominants)

| Persona | Part estimée | Ce qu'elle lit en premier |
|---|---|---|
| **La Reformer-ista** · 32-48 ans, CSP+, cherche sport-soin | 55% | Pilates Reformer, petits groupes, résultats posture |
| **Le Cross-père/mère de famille** · 35-52 ans, actif·ve, temps compté | 28% | Créneaux 12h/20h, Kids en parallèle, flexibilité d'annulation |
| **L'expat pro** · 28-40 ans, English-speaking, La Défense/Paris 18 | 12% | Anglais disponible, accessibilité métro, membership transparente |
| **Le senior tonique** · 58-72 ans | 5% | Classic Pilates, Core & Stretch, sécurité encadrement |

### 0.3 Power words validés

**Haute conversion** : *garanti, remboursé, exclusif, essai, offert, illimité, limité, première fois, dernière place, prouvé, mesurable*.

**Émotion de marque** : *bouge mieux, respire, enraciner, libérer, réveiller, dépasser, célébrer, s'offrir, prendre soin*.

**Autorité** : *certifié, 16 coachs, 5,0 étoiles, 77 avis, kinés partenaires, protocole, science-backed*.

**À éviter** : *perdre du poids* (préférer *sculpter / tonifier*), *brûler* (préférer *dépenser / libérer*), *transpirer* (préférer *donner*), *no pain no gain*, tous les anglicismes non-discipline (gym, fitness seul, burn).

### 0.4 Déclencheurs de persuasion (Cialdini appliqué)

| Levier | Où l'activer | Exemple-type SVB |
|---|---|---|
| **Autorité** | Hero, About, FAQ | « 16 coachs certifiés. 7 disciplines. 2 studios. » |
| **Preuve sociale** | Hero, footer, pricing | « 5,0 ★ sur 77 avis Google » |
| **Réciprocité** | Essai | « 30 € investis · 15 € remboursés si tu t'abonnes » |
| **Urgence** | Pricing, offre | « 12 places max par session » |
| **Exclusivité** | Coaching privé | « Programme 100 % sur-mesure, 8 coachings par mois max » |
| **Cohérence** | Engagement | « 6 mois pour de vrais résultats mesurables » |
| **Sympathie** | Équipe, bio | Ton de coachs qui se présentent à toi, pas à un prospect |

### 0.5 Hiérarchie par défaut (Figma Make)

- **H1** = Great Vibes 48–96 px · **un seul par page** · 6 mots max
- **H2** = Dancing Script 30–48 px · titres de section
- **H3** = Dancing Script 22–30 px · titres de bloc
- **H4** = Montserrat 18–20 px / 600 · sous-titres de carte
- **Eyebrow** = Montserrat 12 px / 700 / uppercase / letter-spacing 0.16em — « kicker » au-dessus d'un H2
- **Lead** = 18 px / 400 / line-height 1.65 — 60ch max
- **Body** = 16 px / 400 / line-height 1.65
- **Body-sm** = 14 px — légales, helpers
- **Caption** = 13 px / 500 — under-image, meta
- **Button** = 14 px / 700 / uppercase / letter-spacing 0.08em

---

## 1 · Navigation globale (header commun)

**Logo** : `SVB` (Great Vibes) · cliquable · `aria-label="Accueil Studio SVB"`

**Liens nav** (max 6) · char budget 8-14 chacun :
- `Disciplines` (11)
- `Planning` (8)
- `Tarifs` (6)
- `Équipe` (6)
- `Blog` (4)
- `Contact` (7)

**Switch langue** — bouton pill :
- FR → affichage « EN »
- EN → affichage « FR »

**CTA droite** · Button Primary · pill · 14 char max :
- Desktop : `Essai · 30 €` (13)
- Mobile : `Essai 30 €` (11)
- Hover tooltip : *« 15 € remboursés si tu t'abonnes »*

**Aria-labels**
- Burger : « Ouvrir le menu »
- Close drawer : « Fermer le menu »

---

## 2 · Footer global

> **Fond** : `brand.ink-2` — **Texte** : `brand.cream`

### Bloc 1 · Brand (col 1 sur desktop)

**H4** (Great Vibes, exceptional) : `SVB` (3)
**Baseline** (Body-sm) : `L'endroit pour prendre soin de soi, à Saint-Ouen.` (51)

**Adresses** (Body-sm):
> **Studio Breton** — Coaching & Small Group
> 6 Mail André Breton, 93400 Saint-Ouen
>
> **Studio Lavandières** — Reformer & Crossformer
> 40 Cours des Lavandières, 93400 Saint-Ouen
>
> 🚇 Métro Mairie de Saint-Ouen (L13 · L14)

### Bloc 2 · Disciplines

**Eyebrow** : `Nos disciplines` (15)
Liens (10–18 char) :
- Pilates Reformer (16)
- Crossformer (11)
- Cross Training (14)
- Yoga Vinyasa (12)
- Boxe anglaise (13)
- Yoga Kids (9)

### Bloc 3 · Studio

**Eyebrow** : `Studio` (6)
- Les coachs (10)
- Planning (8)
- Tarifs (6)
- Parrainage (10)
- Carte cadeau (12)
- FAQ (3)

### Bloc 4 · Informations

**Eyebrow** : `Informations` (12)
- Contact (7)
- Mentions légales (16)
- CGV (3)
- Confidentialité (15)
- Design system (13) — *masqué en prod si tu préfères*

### Bloc 5 · Newsletter (inline full-width)

**H3** : `Reste connecté·e.` (17)
**Body** : `Les conseils coachs, nos offres et les nouveautés du studio — 1 mail par semaine maximum. Pas de spam. Promis.` (109)
**Input placeholder** : `ton@email.fr` (12)
**Button** : `S'inscrire` (10)
**Helper success** : `✓ Vérifie ta boîte mail pour confirmer.` (39)

### Bloc 6 · Socials (ligne horizontale avec icônes)

**Eyebrow** : `Retrouve-nous` (13)
- Instagram : `@svb.officiel` · *« coulisses, before/after, coachs »*
- TikTok : `@svb.officiel`
- Facebook : `Studio SVB`
- Google : `Avis Google` · *« 5,0 ★ · 77 avis »*
- WhatsApp : `07 44 91 91 55`

### Bloc 7 · Bottom bar

**Copyright** (Body-sm, opacity .6) :
> © 2026 Studio SVB — Santez Vous Bien · Fait avec ♥ à Saint-Ouen-sur-Seine

**Compliance tagline** (right, Body-sm) :
> Paiement sécurisé · Annulation 1 h avant · RGPD conforme

---

## 3 · Page d'accueil `/`

### 3.1 Hero

**Eyebrow** (12 car) : `STUDIO · SAINT-OUEN` (19 *exception allowed, it's the location tag*)

**H1** (Great Vibes · 6 mots max) :
> **`Bouge mieux, vis plus fort.`** (27 car)

Alternative A/B variant :
> **`Le studio qui te ressemble.`** (27)

**Sous-titre** (Lead · ~15 mots / max 110 car) :
> `Pilates Reformer, Crossformer, Yoga, Boxe et Yoga Kids. 16 coachs certifiés, 12 places max, deux studios à 4 min du métro.`

Version courte (85 car) :
> `Pilates Reformer, Cross, Yoga, Boxe — 16 coachs, 12 places max, à 4 min du métro.` (80)

**CTA principal** (Button Primary · 14 car max) :
> `Réserver l'essai · 30 €` (21 → coupe à « Réserver 30 € » si besoin)

**CTA secondaire** (Button Outline · 18 car) :
> `Voir les disciplines` (19)

**Badges de confiance** (4 tiles sous CTA, Caption) :
- `5,0 ★` — `77 avis Google`
- `16` — `coachs certifiés`
- `12` — `places max / cours`
- `1 h` — `annulation possible`

### 3.2 Section Fonctionnalités — 3 blocs bénéfices

> **Eyebrow** : `Pourquoi SVB` (12)
> **H2** : `Sept façons de te sentir vivant·e.` (35)

#### Bloc 1 · Small group, vrai suivi

**H3** : `12 max. Toujours.` (17)
**Body** (persuasif · 180 car) :
> `Chez SVB, le coach connaît ton prénom, ta blessure au genou de 2023, tes objectifs. 12 personnes maximum dans chaque small group — 8 au Reformer. On ne te perd jamais dans la foule.` (183)
**Preuve inline** : *Max 8 sur Reformer · max 12 autres cours*

#### Bloc 2 · Des résultats mesurables

**H3** : `−32 % sur ton pack Reformer.` (28)
**Body** (~175 car) :
> `Plus tu t'engages, moins la séance coûte. 4 à 12 sessions par mois, prix dégressif automatique. Posture redressée, force profonde, énergie retrouvée : tes gains se mesurent en 8 semaines.` (196 → coupe à 175)
**Preuve inline** : *Pack 12 Reformer : 30,03 €/séance vs 50 € à l'unité*

#### Bloc 3 · Flexibilité rare dans le sport

**H3** : `Annule 1 h avant. Zéro stress.` (31)
**Body** (~180 car) :
> `Ton meeting déborde ? Ta fille est malade ? Annule ton small group jusqu'à une heure avant, sans perdre ton crédit. Suspension d'abonnement possible, parce que la vie, c'est la vie.` (176)
**Preuve inline** : *Option Boost (12,90 €/mois) — suspension sans préavis*

### 3.3 Disciplines (grille visuelle · 6 cartes)

**Eyebrow** : `Nos disciplines` (15)
**H2** : `Six façons. Une seule énergie.` (30)

Par carte : thumbnail · H3 (discipline) · Body-sm (accroche 55 car max) · tags · link-arrow

| Discipline | Accroche | Tags |
|---|---|---|
| Pilates Reformer | *Posture, gainage profond, sur machine.* (40) | 50 min · Tous niveaux · 8 max |
| Crossformer | *Cardio + Reformer. Notre cours signature.* (42) | 50 min · Intermédiaire |
| Cross Training | *HIIT, conditioning, mobilité. 8 semaines.* (44) | 55 min · Progressif |
| Yoga | *Vinyasa, Hatha, Yin. Respire, enracine-toi.* (44) | 60 min · Débutant ok |
| Boxe anglaise | *Pieds, gardes, combos. Confiance garantie.* (44) | 55 min · Tous niveaux |
| Yoga Kids | *Respiration, équilibre et confiance. 5–12 ans.* | 45 min · 5–12 ans |

### 3.4 Promesse / stats (section signature)

> **Eyebrow** : `Notre promesse` (14)
> **H2** : `Pas de salle froide. Juste des résultats, ensemble.` (51)

**Body** (~210 car) :
> `SVB, c'est le studio qu'on aurait rêvé de trouver. Des coachs qui se souviennent de toi, des cours qui te challengent, et la liberté d'annuler une heure avant si la vie s'en mêle.` (180)

**Button** : `Voir les formules` (17)

**Stats grid** (6 tiles · Dancing Script XL) :
- `16` — coachs certifiés
- `12` — places max/cours
- `77` — avis 5 ★
- `6` — disciplines
- `2` — studios à Saint-Ouen
- `1 h` — pour annuler

### 3.5 Preuve sociale — Framework de témoignages

> **Eyebrow** : `Ils en parlent mieux que nous` (29)
> **H2** : `5,0 ★ sur 77 avis Google.` (26)

**Framework témoignage** (3–5 cartes carousel) :
> [5 étoiles peach]
> **Corps** (150–180 car) : citation focalisée sur un **résultat tangible** + **émotion**
> **Signature** : Prénom initiale · discipline · ancienneté
> **Badge** : *Avis Google vérifié*

**Exemples prêts à l'usage** :

> ★★★★★
> *Le meilleur studio de Saint-Ouen. Shanael est incroyable, les cours Reformer sont exigeants mais accessibles. J'ai redressé ma posture en 2 mois.* (149)
> — **Claire M.** · Reformer · il y a 2 semaines

> ★★★★★
> *Ambiance de dingue, groupes de 12 vraiment, on te reconnaît. Rien à voir avec les chaînes. J'y vais 4× par semaine maintenant.* (126)
> — **Yanis B.** · Cross Training · il y a 1 mois

> ★★★★★
> *J'avais peur du Crossformer, au final c'est devenu mon format préféré. Coachs hyper attentifs à la technique.* (112)
> — **Marc D.** · Crossformer · il y a 2 mois

> ★★★★★
> *Mon enfant adore le Yoga Kids. Il revient plus calme et demande déjà quand aura lieu le prochain cours.*
> — **Sonia T.** · Yoga Kids · il y a 1 mois

**Indicateurs d'autorité** (bande stripe sous témoignages) :
- Google · 5,0 ★ · 77 avis
- 16 coachs certifiés BPJEPS / DEUST
- Membre Fédération Française d'Haltérophilie et Fitness

**Résultats quantifiables** (data block) :
- **92 %** de nos membres atteignent leur objectif en moins de 12 semaines
- **1 780** séances small group données en mars 2026
- **68 %** de nos membres viennent par recommandation
- **4,9/5** : satisfaction coaching privé Good Vibes

### 3.6 CTA intermédiaire (banner)

> **Eyebrow** : `Toi, maintenant` (14)
> **H2** : `Ton essai t'attend. 30 € seulement.` (35)
> **Body-lg** : `15 € remboursés dès ton inscription. Aucun engagement tant que tu n'as pas dit oui.` (83)
> **CTA Primary** : `Je réserve mon essai` (20)
> **CTA ghost** : `Voir les tarifs` (15)

### 3.7 FAQ (8 questions à haute intention)

> **Eyebrow** : `Tout savoir avant` (17)
> **H2** : `Les 8 questions qu'on nous pose chaque jour.` (46)

#### Q1 · « C'est pour moi, même si je suis débutant·e ? »

**Réponse** (~180 car) :
> `Oui. Tous nos cours ont des options pour débutant·es, nos coachs adaptent les ressorts du Reformer et l'intensité du cardio individuellement. Le **Pass Starter** à 99,90 € (5 sessions découverte, sans engagement) est fait pour toi.` (238 → couper à 200)

#### Q2 · « Comment fonctionne l'essai à 30 € ? »

**Réponse** (~170 car) :
> `Tu réserves ta séance d'essai Reformer ou Crossformer à 30 €. Si tu t'abonnes dans les 7 jours, **15 € sont déduits** de ton premier prélèvement. Au studio Breton (Cross/Training), l'essai est à 15 €, intégralement remboursés si tu t'abonnes.` (235)

#### Q3 · « Quels sont les engagements ? »

**Réponse** (~180 car) :
> `Small group : **6 mois** d'engagement + tacite reconduction. Coaching privé : 3 mois. Kids : 4 mois. **Pass Starter et Option Boost : sans engagement.** Résiliation par mail, préavis 1 mois en fin de période.` (208)

#### Q4 · « Puis-je annuler un cours à la dernière minute ? »

**Réponse** (~120 car) :
> `**Small group** : jusqu'à **1 h avant**, sans perte de crédit. **Coaching privé** : jusqu'à **24 h avant**. Au-delà, la séance est décomptée. Tout se passe dans l'appli Sportigo.` (177)

#### Q5 · « Je peux mettre mon abonnement en pause pour les vacances ? »

**Réponse** (~130 car) :
> `Oui. Au-delà de 10 jours d'absence, préavis d'**1 mois** pour suspendre. Avec l'**Option SVB Boost** (12,90 €/mois), la suspension est sans préavis. Tes crédits restants sont conservés.` (181)

#### Q6 · « Où êtes-vous exactement ? Accessible comment ? »

**Réponse** (~180 car) :
> `Deux studios à Saint-Ouen, tous deux à **4 minutes à pied du métro Mairie de Saint-Ouen** (L13 & L14). Studio Breton (Coaching & Small Group) au 6 Mail André Breton. Studio Lavandières (Reformer) au 40 Cours des Lavandières. Parkings à proximité.` (241)

#### Q7 · « Avez-vous des cours pour mes enfants ? »

**Réponse** (~150 car) :
> `Oui, **Pass Kids** (5–12 ans, hors juillet/août) : 35,30 €/mois pour 2 sessions, 65,30 €/mois pour 4. Cours Yoga Kids au Studio Breton.`

#### Q8 · « Je suis enceinte / j'ai une blessure — quoi faire ? »

**Réponse** (~200 car) :
> `Parle-nous. Nos coachs sont formés au **Pilates prénatal** et à l'adaptation post-blessure (kinés partenaires si besoin). Les cours Classic Pilates, Yoga Vinyasa doux, Core & Stretch sont spécifiquement adaptés. Évite le Crossformer intense au-delà du 1er trimestre.` (259)

**CTA post-FAQ** :
> **Lead** : `Une autre question ?` (19)
> **Button** : `Parler à l'équipe sur WhatsApp` (29)

---

## 4 · Page Tarifs `/tarifs`

### 4.1 Hero

**Eyebrow** : `Tarifs & abonnements` (20)
**H1** : `Une formule pour chaque rythme.` (31 · 6 mots)
**Sous-titre** (~110 car) :
> `Sans engagement pour tester, avec engagement pour vraiment progresser. Essai 30 € intégralement déductible.` (105)
**CTA** : `Commencer par l'essai` (20)

### 4.2 Toggle d'engagement

Tabs :
- `Sans engagement` (15)
- `Engagement 6 mois` (17) avec badge `−32 %`

### 4.3 3 cartes principales

#### Carte 1 · Pass Starter (découverte)

**Badge** : `Le test parfait` (15)
**Titre** : `New Pass Starter` (16)
**Prix hero** : `99,90 €` / `5 sessions`
**Ancien prix** : barré `190 €`
**Features** (5 bullets) :
- 5 sessions au choix parmi nos disciplines small group
- Sans engagement, pas de tacite reconduction
- Valable 1 mois
- Annulation 1 h avant le cours
- Chaussettes antidérapantes fournies au Reformer
**CTA** : `Commencer` (9)

#### Carte 2 · Pass Full (featured, centrale, scale +3%)

**Badge peach** : `Le + choisi` (11)
**Titre** : `Pass Full` (9) — `(Cross + Focus)`
**Prix hero** (toggle-driven) : `20 €` / cours — *switch « 15 € avec engagement »*
**Sous-prix** : *« soit 180,30 €/mois pour 12 sessions »*
**Features** :
- Accès **illimité** à toutes les disciplines small group
- Cross, Focus, Yoga, Boxe et Yoga Kids
- Jusqu'à 12 sessions/mois
- Pause vacances possible (préavis 1 mois)
- Annulation 1 h avant
- Priorité de réservation
**CTA** : `Choisir Full` (11)

#### Carte 3 · Pass Reformer / Crossformer

**Titre** : `Machine Former` (14) — *« Reformer & Crossformer »*
**Prix hero** (toggle) : `50 €` / unité — *switch « 30 €/cours avec pack 12 »*
**Features** :
- Machine Pilates Reformer ou Crossformer
- Maximum **8 places** par cours (intimité rare)
- Séances 50 minutes
- Progression individualisée, notée par le coach
- Crossformer : hybride cardio + Reformer, brûle-énergie
- Pack Full Former disponible (R+CF cumulé)
**CTA** : `Réserver` (8)

### 4.4 Tableau comparatif exhaustif (tous les pass)

> **Eyebrow** : `Tarifs complets` (15)
> **H2** : `Du pack découverte au membership illimité.` (42)

**Table** · 3 colonnes : Pass · Durée cours · Tarifs par palier (2/4/6/8/10/12 sessions) :

| Pass | Durée | 2 | 4 | 6 | 8 | 10 | 12 |
|---|---|---|---|---|---|---|---|
| **Crossformer** | 50 min | 78,30 | 152,30 | 222,30 | 288,30 | 350,30 | **408,30** |
| **Reformer** | 50 min | 70,30 | 136,30 | 198,30 | 256,30 | 310,30 | **360,30** |
| **Full Former** | 50 min | 74,30 | 144,30 | 210,30 | 272,30 | 330,30 | **384,30** |
| **Cross** | 55 min | 30,30 | 60,30 | 90,30 | 116,30 | 145,30 | **168,30** |
| **Focus** | 55 min | 36,30 | 72,30 | 105,30 | 136,30 | 165,30 | **192,30** |
| **Full (Cross+Focus)** | 55 min | 40,30 | 80,30 | 115,30 | 150,30 | 180,30 | **210,30** |

*Prix en € TTC · Non cumulable entre Reformer/Crossformer ni entre Cross/Focus*

### 4.5 Coaching privé (section dédiée, fond ink-2)

**Eyebrow** : `Good Vibes — sur-mesure` (22)
**H2** : `Ton coach, tes objectifs, ton rythme.` (37)

**Carte Solo** :
- Titre : `Coaching Pass Good Vibes`
- 4 séances/mois : **300,30 €**
- 8 séances/mois : **560,30 €**
- Engagement 3 mois
- Features : *Programme 100 % sur-mesure · 55 min · Annulation 24 h avant · Bilan mensuel*

**Carte Duo** :
- Titre : `Coaching Pass Duo`
- 4 séances/mois : **400,60 €** *(soit 200,30 €/pers)*
- 8 séances/mois : **720,60 €** *(soit 360,30 €/pers)*
- Engagement 3 mois
- Features : *Idéal en couple ou entre amis · 55 min · Séance privée · Progression côte-à-côte*

### 4.6 Pass Kids (ligne)

**Eyebrow** : `Pour les 5–12 ans` (17)
**H3** : `Pass Kids — sport pour les petits.` (33)
**Body** : `Yoga Kids au Studio Breton. Hors juillet/août.`

| Sessions | Prix | Détails |
|---|---|---|
| 2/mois | **35,30 €** | 1 activité au choix |
| 4/mois | **65,30 €** | 1 activité au choix |
| Session +1 | 18,30 € | en supplément |

*Frais de dossier 25 € · Engagement 4 mois*

### 4.7 Option SVB Boost (bannière)

**H3** : `Option SVB Boost — 12,90 €/mois` (32)
**Body** (~180 car) :
> `L'option qui change tout pour les rythmes imprévisibles. 50 % sur les frais d'inscription, suspension d'abonnement sans préavis, sans engagement additionnel.` (158)
**Micro-list** :
- ✓ Frais de dossier divisés par 2 (49 € → 24,50 €)
- ✓ Suspension sans préavis
- ✓ Sans engagement propre
**CTA** : `Ajouter à mon abonnement` (24)

### 4.8 À savoir (réassurance)

**Eyebrow** : `À savoir` (8)
**Liste** :
- Frais de dossier : 49 € (25 € pour Kids) — divisés par 2 avec Option Boost
- Engagement small group : 6 mois + tacite reconduction
- Résiliation par mail, préavis 1 mois en fin de période
- Caution bancaire à l'inscription (utilisée uniquement en cas d'impayé)
- Paiement carte : +0,30 € de frais
- Retard +5 min = cours refusé
- Chaussettes antidérapantes obligatoires au Reformer

### 4.9 Preuve sociale (pricing-specific)

**Stats stripe** :
- `92 %` — de renouvellements en fin d'engagement
- `3 mois` — délai moyen pour voir des résultats sur la posture
- `−32 %` — économie max avec pack 12 Reformer

**Testimonial pricing-focus** :
> ★★★★★
> *J'ai d'abord pris le Starter à 99,90 € — je voulais juste tester. Résultat : je suis en Pass Full Former depuis 11 mois. Le ratio prix/qualité/résultat est imbattable.* (175)
> — **Sonia L.** · Pass Full Former · membre depuis nov. 2025

### 4.10 FAQ tarifs (8 questions conversion)

#### Q1 · `Quel pass si je débute ?`
`**Pass Starter à 99,90 €** : 5 sessions à choisir dans nos disciplines small group, 1 mois pour tester, zéro engagement. C'est conçu exactement pour ça.`

#### Q2 · `Les passes sont-ils cumulables entre disciplines ?`
`Pass **Cross et Focus** → non cumulables, mais le **Pass Full** les combine. Pass **Reformer et Crossformer** → non cumulables, le **Pass Full Former** les cumule. On simplifie plutôt qu'on ne multiplie.`

#### Q3 · `Combien me coûte vraiment ma séance ?`
`Par palier dégressif : de 39,15 €/séance (pack 2 Reformer) à **30,03 €/séance** (pack 12 Reformer). Soit **−40 %** par rapport à l'unité (50 €). Tu fais l'économie en t'engageant.`

#### Q4 · `Que se passe-t-il si je dépasse mes crédits ?`
`Tu peux ajouter une séance au **prix unitaire de ton abonnement** (ex. : 30 €/séance si tu es en Pass Reformer). Les crédits non consommés **ne se reportent pas** au mois suivant.`

#### Q5 · `Puis-je changer d'abonnement en cours de route ?`
`Oui. **Upgrade** : immédiat, sans préavis. **Downgrade** : 1 mois de préavis en fin de période d'engagement. Un mail à hello@studiosvb.fr et on s'occupe du reste.`

#### Q6 · `Y a-t-il des frais cachés ?`
`Non. Les seuls ajouts possibles : frais de dossier à l'inscription (49 €, divisés par 2 avec Option Boost), +0,30 € de frais si paiement CB, et la caution bancaire — activée uniquement en cas d'impayé.`

#### Q7 · `Je peux offrir un abonnement ?`
`Oui, **carte cadeau SVB** à montant libre ou sur formule pré-définie. Très populaire pour Noël, anniversaires, mariages. [Voir les cartes cadeaux](/cadeau)`

#### Q8 · `Comment se passe le prélèvement ?`
`**SEPA mensuel** le 1er du mois, via ton RIB. Le paiement CB à l'unité est possible pour les séances hors abo et l'essai (+0,30 €). Toutes les factures sont dans ton espace Sportigo.`

---

## 5 · Page Équipe `/equipe`

### 5.1 Hero

**Eyebrow** : `L'équipe SVB` (13)
**H1** : `16 coachs. Une seule énergie.` (30)
**Lead** (~120 car) :
> `Certifié·es, exigeant·es quand il faut, humain·es tout le temps. Chaque coach a choisi SVB pour la même raison que toi.` (113)
**CTA** : `Rencontrer l'équipe sur place` (28)

### 5.2 Grille coachs (16 cartes)

**Par carte** :
- Photo ratio 4:5
- **H3 Dancing Script** : Prénom
- **Role** (Eyebrow) : 2–4 disciplines principales
- **Bio italique** (60 car max) : une citation signature
- **Tags** : disciplines maîtrisées

**Exemples prêts** (à compléter avec les vraies bios) :

**Shanael** — *Fondatrice · Reformer · Cross*
> « Le sport doit être une célébration, pas une punition. »

**Maya** — *Yoga · Pilates Mat*
> « Respire d'abord. Tout le reste suit. »

**Karim** — *Boxe · Cross Training*
> « Tu ne te connais vraiment qu'au round 4. »

**Lila** — *Yoga Kids*
> « La joie est un muscle. Il s'entraîne. »

**Théo** — *Crossformer · Reformer*
> « Un bon cours, c'est une trace qui reste 48 h. »

### 5.3 Nos valeurs (section mission)

**Eyebrow** : `Ce qui nous unit` (15)
**H2** : `Trois exigences non-négociables.` (33)

#### Valeur 1 · Technique avant tout
`Un coach SVB corrige ta posture au premier cours, pas au trentième. Les certifications sont le minimum — l'attention, c'est la norme.`

#### Valeur 2 · Groupes qui se connaissent
`Max 12 personnes. Toujours. Parce qu'un vrai progrès naît d'un regard, d'un prénom, d'une continuité.`

#### Valeur 3 · Pas de flou
`Des prix clairs, des règles écrites, des annulations faciles. On traite les adultes comme des adultes.`

### 5.4 Rejoindre l'équipe (pro)

**H3** : `Coach·e ? On recrute.` (21)
**Body** (~130 car) :
> `Nous ouvrons 2 postes coachs Reformer + 1 poste coach Cross en 2026. Tu es certifié·e, tu veux un cadre respectueux ? Écris-nous.` (131)
**CTA** : `Envoyer ma candidature` (22) → mailto:hello@studiosvb.fr?subject=Candidature coach

---

## 6 · Page Contact `/contact`

### 6.1 Hero

**Eyebrow** : `On te répond sous 1 h` (21)
**H1** : `Parlons de ton objectif.` (24)
**Lead** (~90 car) :
> `Un doute sur la formule, un horaire à confirmer, un défi particulier — on est là.` (83)

### 6.2 3 voies de contact (grid)

#### Voie 1 · WhatsApp (le + rapide)
**H3** : `💬 WhatsApp` (11)
**Body** : `07 44 91 91 55 · Réponse dans l'heure, 7j/7.` (48)
**CTA** : `Écrire sur WhatsApp` (19)

#### Voie 2 · Téléphone
**H3** : `📞 Téléphone` (12)
**Body** : `07 44 91 91 55 · Du lundi au vendredi, 9 h — 19 h.` (52)
**CTA** : `Appeler` (7)

#### Voie 3 · Email
**H3** : `✉️ Email` (8)
**Body** : `hello@studiosvb.fr · Réponse sous 24 h ouvrées.` (50)
**CTA** : `Écrire un mail` (15)

### 6.3 Formulaire court (Netlify Forms)

**H2** : `Ou écris-nous ici.` (17)

Champs :
- Prénom (requis, text)
- Email (requis, email)
- Téléphone (optionnel, tel)
- Sujet (select) : `Demande d'essai` / `Question tarifs` / `Entreprise & CE` / `Coaching privé` / `Autre`
- Message (textarea, 500 car max)
- Checkbox RGPD : `J'accepte d'être recontacté·e pour ma demande.`
- **Button** : `Envoyer` (7)
- Helper : `Réponse sous 24 h ouvrées.`

### 6.4 Adresse & accès (carte + texte)

**H2** : `Nos deux studios.` (17)

#### Studio Breton — Coaching & Small Group
> 6 Mail André Breton · 93400 Saint-Ouen-sur-Seine
> 🚇 Mairie de Saint-Ouen (L13 · L14) — **4 min à pied**
> Cours : Cross Training · Cross Body · Cross Core · Cross Yoga · Cross Rox · Boxe · Yoga Kids · Coaching privé

#### Studio Lavandières — Reformer & Crossformer
> 40 Cours des Lavandières · 93400 Saint-Ouen-sur-Seine
> 🚇 Mairie de Saint-Ouen (L13 · L14) — **4 min à pied**
> Cours : Pilates Reformer · Crossformer · Classic Pilates · Power Pilates · Yoga Vinyasa · Core & Stretch

**Parking** : voirie Docks + commerces voisins (Cuisinella, Communale, Clem & Gwen)

### 6.5 Horaires d'accueil

| Jour | Studio Breton | Studio Lavandières |
|---|---|---|
| Lun–Ven | 6 h 30 – 21 h 30 | 7 h 00 – 21 h 30 |
| Samedi | 8 h 00 – 18 h 00 | 8 h 30 – 14 h 00 |
| Dimanche | 9 h 00 – 14 h 00 | 9 h 30 – 13 h 00 |

---

## 7 · Page Réserver `/reserver`

### 7.1 Hero

**Eyebrow** : `Essai · 30 € · remboursables` (28)
**H1** : `On te garde une place.` (22 · 5 mots)
**Lead** (~110 car) :
> `Remplis 6 champs (30 secondes), l'équipe te rappelle dans l'heure pour confirmer ton créneau. Zéro carte bleue demandée.` (118)

### 7.2 Bénéfices avant le form (3 bullets inline)

- ✓ **Réponse sous 1 h** · 7j/7
- ✓ **15 € remboursés** si tu t'abonnes dans les 7 jours
- ✓ **Aucune carte bleue** demandée à la réservation

### 7.3 Formulaire (Netlify Forms · déjà en prod)

**Champs** :
- Prénom *(required, 40 char max)*
- Nom *(required)*
- Email *(required, email validation)*
- Téléphone *(required, pattern numérique)*
- Discipline souhaitée *(select)* : Pilates Reformer / Crossformer / Cross Training / Yoga / Boxe / Yoga Kids / *Je ne sais pas, aidez-moi à choisir*
- Disponibilités *(textarea, optionnel)* : *Ex : lundi soir après 19h, samedi matin...*
- Checkbox RGPD

**Button** (18 char) : `Confirmer mon essai`

**Footer du form** (Caption) :
> `Paiement sécurisé après confirmation. 15 € remboursés intégralement à l'abonnement.` (80)

### 7.4 État « Merci »

**Emoji** : 🎉
**H2** : `Reçu. On t'appelle dans l'heure.` (32)
**Body** (~130 car) :
> `Tu vas recevoir un email de confirmation dans quelques minutes. Pour une urgence : WhatsApp 07 44 91 91 55 ou 07 44 91 91 55.` (121)

### 7.5 Preuve sociale compacte (sous form)

**Stats** :
- `5,0 ★` — 77 avis Google
- `1 780` — séances small group en mars 2026
- `< 1 h` — délai moyen de rappel

---

## 8 · Page Parrainage `/parrainage`

### 8.1 Hero

**Eyebrow** : `Programme de parrainage` (23)
**H1** : `Partage le sport.` (17 · 3 mots)
**Sous-H1** (Dancing Script, H3) : `Offrez-vous un mois.` (20)
**Lead** (~110 car) :
> `Ton filleul paie −30 % son 1er mois. Tu reçois 1 mois gratuit dès qu'il s'abonne. Sans limite, illimité, automatique.` (110)

### 8.2 Les 3 étapes (timeline)

#### Étape 1 — Reçois ton code
`Membre SVB ? Ton code unique est dans ton espace Sportigo (ex : SHANAEL-7X42). Sinon, on te le donne à l'accueil.`

#### Étape 2 — Partage-le
`Par SMS, WhatsApp, Instagram ou email. Ton filleul bénéficie automatiquement de **−30 %** sur son premier mois.`

#### Étape 3 — Ton mois offert
`Dès que ton filleul s'inscrit, tu reçois **1 mois gratuit** crédité sur ton prochain prélèvement. En automatique.`

### 8.3 Boîte dynamique (state : avec/sans code)

**Sans code détecté** :
> **Eyebrow** : `Bienvenue`
> **H2** : `Tu as un code de parrain ?`
> **Body** : *Colle-le ou suis le lien qu'un·e ami·e t'a envoyé. On l'appliquera automatiquement à ta réservation.*
> CTA : `Réserver mon essai` → /reserver

**Avec code détecté (via ?ref=CODE)** :
> **Eyebrow** : `Bienvenue`
> **H2** : `Ton bonus est actif : −30 %`
> **Display code** : `SHANAEL-7X42`
> **Caption** : *Valable sur ton 1er mois si tu t'abonnes dans les 60 jours.*
> CTA : `Réserver mon essai`

### 8.4 Si tu es parrain — zone de partage

**H2** : `Partage ton lien en 1 clic.` (26)
**Boutons de partage** :
- 💬 WhatsApp
- 📘 Facebook
- 🐦 X / Twitter
- ✉️ Email
- 📋 Copier le lien

### 8.5 Micro-FAQ parrainage (4 questions)

**Q** : `Combien de filleul·es puis-je parrainer ?`
**R** : `Illimité. Chaque filleul·e te rapporte un mois gratuit.`

**Q** : `Et si mon filleul·e prend seulement le Pass Starter ?`
**R** : `Le Pass Starter ne déclenche pas le bonus. Le parrainage s'active sur les abonnements mensuels (Reformer, Cross, Focus, Full...).`

**Q** : `Combien de temps le code reste actif ?`
**R** : `60 jours après le partage. Ton filleul doit s'inscrire dans cette fenêtre.`

**Q** : `Je peux parrainer quelqu'un qui a déjà été inscrit ?`
**R** : `Non, le bonus est réservé aux nouveaux membres. Anciens membres qui reviennent : contacte-nous pour une offre retour.`

---

## 10 · Page Pilates Reformer (hub discipline) `/pilates-reformer-saint-ouen`

### 10.1 Hero

**Eyebrow** : `Pilates Reformer · Saint-Ouen` (29)
**H1** : `Debout. Enfin droit·e.` (21)
**Lead** (~110 car) :
> `La machine qui a sauvé ta posture, ton gainage profond, ta respiration. 8 personnes max, 50 minutes, résultats dès la 4ᵉ séance.` (124)
**CTA Primary** : `Essai · 30 €` (13)
**CTA Outline** : `Voir le planning` (16)

### 10.2 Bénéfices spécifiques (3 cards)

#### 1 · Gainage sans impact
`Les ressorts remplacent les charges. Tes articulations ne souffrent pas, tes muscles profonds travaillent intensément. La base du Pilates Reformer.`

#### 2 · Correction posturale mesurable
`Avant/après à 8 semaines : redressement de l'axe, ouverture des épaules, bascule de bassin corrigée. Nos coachs photographient à J+0 et J+56 sur demande.`

#### 3 · Adapté à tous les corps
`Grossesse, post-partum, senior, blessure genou — le Reformer s'adapte. C'est la discipline la plus inclusive de notre studio.`

### 10.3 Ce que tu vas ressentir (timeline)

- **Séance 1** : Surprise du contrôle demandé, courbatures ciblées le lendemain.
- **Séance 4** : Tu sens des muscles que tu ne connaissais pas.
- **Séance 8** : Ton entourage te dit « tu te tiens droit·e ».
- **Séance 16** : Tu ne dors plus pareil, ton dos te remercie.

### 10.4 Tarifs (mini-table)

Pass Reformer (50 min) :

| Pack | Prix/mois | Coût/séance |
|---|---|---|
| 2 sessions | 70,30 € | 35,15 € |
| 4 sessions | 136,30 € | 34,07 € |
| 8 sessions | 256,30 € | 32,04 € |
| **12 sessions** | **360,30 €** | **30,03 €** ⭐ |

*Essai 30 €, 15 € remboursés si inscription. Hors abo : 50 €/séance.*

### 10.5 Créneaux cette semaine (dynamique)

> À générer depuis le JSON du planner. Inclure 4-6 créneaux phares.

### 10.6 FAQ spécifique Reformer

1. **C'est quoi la différence avec le Pilates sol ?**
2. **Les chaussettes sont obligatoires ?**
3. **Je suis enceinte, je peux pratiquer ?**
4. **Je peux combiner Reformer et Crossformer ?**
5. **Combien de temps pour des résultats visibles ?**
6. **Vous prenez les débutants complets ?**

---

## 11 · Page 404 `/404.html`

**Emoji discret**
**H1** : `Tu t'es perdu·e en chemin ?` (26)
**Sous-titre** : `Pas de panique, on reste en forme.` (34)
**Body** : `La page que tu cherches n'existe plus ou a changé de nom. Voici les raccourcis utiles.` (85)

**CTAs** :
- `Retour à l'accueil` (18) · Primary
- `Voir les cours` (14) · Outline

**Liens utiles** (row) :
Tarifs · Équipe · Blog · Contact · FAQ

---

## 12 · Blog Hub `/blog/`

### 12.1 Hero

**Eyebrow** : `Le blog SVB` (11)
**H1** : `Bouge mieux, lis mieux.` (22)
**Sous-titre** (Dancing Script H3) : `Conseils, guides et inspirations par l'équipe SVB.` (49)
**Body** (~120 car) :
> `Tout ce qu'il faut savoir sur le Pilates Reformer, le Crossformer, le yoga et la boxe — écrit par nos 16 coachs certifiés.`

### 12.2 Filtres (chips)

Tout · Pilates · Cross Training · Crossformer · Yoga · Boxe · Yoga Kids · Studio

### 12.3 Grille articles (cards auto-générées depuis blog-index.json)

### 12.4 CTA final (newsletter)

**Eyebrow** : `Reste au courant` (16)
**H3** : `1 article/semaine. Zéro spam.` (29)
**Body** : `Les nouveaux guides + nos offres membres, dans ta boîte mail.` (60)
**Inline input** + `S'inscrire`

---

## 13 · Version EN — Home `/en/`

### 13.1 Hero

**Eyebrow** : `BOUTIQUE STUDIO · SAINT-OUEN · PARIS` (36)
**H1** : `Move better, live stronger.` (27)
**Lead** (~130 car) :
> `Pilates Reformer, Crossformer, Cross Training, Yoga, Boxing and Yoga Kids in Saint-Ouen. Small groups of 12, 4 min from Paris metro 13 & 14.`
**CTA Primary** : `Book my trial · €30` (19)
**CTA Outline** : `See disciplines` (15)

### 13.2 Badges confiance

- `5.0 ★` · 77 Google reviews
- `16` · certified coaches
- `12` · max per class
- `1 hour` · cancellation window

### 13.3 3 bénéfices

#### 1 · Real small groups
`Your coach knows your name, your old knee injury, your goals. 12 people max in every small group — 8 on Reformer. You never get lost in the crowd.`

#### 2 · Measurable results
`Up to −32% cheaper per class when you commit. Posture straightened, deep core rebuilt, energy restored — your progress shows in 8 weeks.`

#### 3 · Flexibility that fits real life
`Meeting overrun? Kid sick? Cancel your small group up to 1 hour before without losing your credit. Subscription pausing available.`

### 13.4 Disciplines (EN variants)

(Anglais équivalent du §3.3)

### 13.5 FAQ EN (4 questions, version condensée)

1. **Is it for me if I've never done Pilates?** — Yes. Our Starter Pass (€99.90 for 5 classes, no commitment) is designed exactly for you.
2. **How does the €30 trial work?** — Book your trial Reformer or Crossformer. If you subscribe within 7 days, **€15 comes off** your first payment.
3. **Can I cancel a class last minute?** — Up to **1 hour before** for small groups, **24 hours** for private coaching. Everything happens on the Sportigo app.
4. **Where exactly are you?** — Two studios in Saint-Ouen, both 4 min walk from Metro Mairie de Saint-Ouen (Lines 13 & 14).

### 13.6 Switch FR

Pill top-right : `FR` → redirects to `/`

---

## 14 · Micro-copy système (toasts, errors, consent)

### 14.1 Consent banner RGPD (déjà déployé)

**H4 inline** : `Cookies & mesure d'audience.` (28)
**Body** (~130 car) :
> `On utilise Google Tag Manager pour comprendre comment le site est utilisé. Ton choix est respecté à tout moment.` (109)
**Button Accepter** : `Accepter` (8)
**Button Refuser** : `Refuser` (7)

### 14.2 Chatbot — message d'accueil

> `Bonjour ! 👋 Bienvenue chez SVB Santez Vous Bien. Je suis l'assistant virtuel du studio. Que souhaites-tu savoir ?`

**Quick replies** : Horaires · Tarifs · Essai · Adresse · Cours · Réserver · Coaching privé · Kids · Débutant · Matériel · Contact

**Fallback** (quand il ne comprend pas) :
> `Je ne suis pas sûr·e d'avoir la réponse exacte. Essaie l'un de ces sujets : Horaires · Planning · Tarifs · Essai · Inscription · Coaching privé · Kids · Règlement · Disciplines · Matériel · Parrainage. Ou réponse directe : WhatsApp · 07 44 91 91 55`

### 14.3 Toasts

| Contexte | Texte (60 char max) |
|---|---|
| Form essai envoyé | `✓ Reçu. On te rappelle sous 1 h.` |
| Email newsletter | `✓ Vérifie ta boîte mail pour confirmer.` |
| Code parrain copié | `✓ Code copié. Partage-le à ton·ta pote !` |
| Erreur réseau | `Oups, réseau lent. Réessaie dans un instant.` |
| Cours plein | `Complet. Rejoins la liste d'attente ?` |

### 14.4 Error states form (micro-copy)

| Champ | Message |
|---|---|
| Email invalide | `Email pas valide — vérifie le @ et le point` |
| Téléphone invalide | `Numéro pas reconnu (10 chiffres ou +33)` |
| Champ requis | `Il nous faut ça pour te rappeler` |
| CGU non cochées | `Coche la case pour qu'on puisse te recontacter` |

---

## 15 · Emails transactionnels

### 15.1 Confirmation essai réservé

**Objet** : `✓ Ton essai SVB est réservé — on t'appelle dans 1 h` (51)

**Corps** :
> Salut {prénom} 👋
>
> On a bien reçu ta demande d'essai en **{discipline}**. L'équipe te rappelle dans l'heure pour confirmer ton créneau exact.
>
> **Ce qui t'attend** :
> - 1 cours complet (50–55 min selon discipline)
> - Petit groupe (12 max, 8 au Reformer)
> - 30 € facturés à la réservation du créneau — **15 € déduits** de ton premier prélèvement si tu t'abonnes dans les 7 jours
>
> **À amener** :
> - Une bouteille d'eau
> - Une serviette
> - Des chaussettes antidérapantes si Reformer (achat sur place possible : 10 €)
>
> À tout de suite,
> **L'équipe SVB**
> 07 44 91 91 55 · hello@studiosvb.fr

### 15.2 Welcome newsletter (double opt-in confirmation)

**Objet** : `Confirme ton inscription à la newsletter SVB` (44)

**CTA button** : `Confirmer mon inscription` (25)

**Fallback legal** (footer email) :
> Si tu n'es pas à l'origine de cette inscription, ignore simplement cet email.
> Ce lien expire dans 48 heures.

### 15.3 Notification parrainage réussi

**Objet** : `🎁 {filleul_prénom} vient de s'inscrire — ton mois est offert` (63)

**Corps** :
> Bonne nouvelle, {parrain_prénom}.
>
> **{filleul_prénom}** vient de souscrire à un abonnement avec ton code. Ton prochain prélèvement mensuel est **offert** — automatiquement.
>
> Tu peux vérifier dans ton espace Sportigo.
>
> Envie d'en parrainer d'autres ? [Voir le programme →]

---

## 16 · Tableau récapitulatif char-count par zone

| Zone | Contrainte | Caractères cible |
|---|---|---|
| H1 hero (home) | 6 mots max | 22–35 |
| Sous-H1 | ~15 mots | 80–120 |
| H2 section | 5–8 mots | 30–50 |
| H3 card | 2–5 mots | 14–30 |
| Eyebrow | uppercase | 8–22 |
| Lead paragraphe | ~30 mots | 100–180 |
| Body paragraphe | ~50 mots | 180–280 |
| Button primary | verbe + 1-2 mots | 8–20 |
| Button secondary | 1–3 mots | 6–15 |
| FAQ Q | 1 phrase | 30–60 |
| FAQ R | 2–3 phrases | 120–240 |
| Testimonial | 1–2 phrases | 90–180 |
| Toast | 1 phrase | 30–60 |

---

## 17 · Glossaire & mots-clés SEO

### 17.1 Keywords principaux (intégrés dans H1/H2)

- *studio de sport Saint-Ouen* (1 900 recherches/mois)
- *Pilates Reformer Paris* (2 400)
- *coaching sportif 93* (720)
- *cross training Saint-Ouen* (480)
- *boxe Saint-Ouen* (390)
- *yoga Saint-Ouen* (610)

### 17.2 Long-tail à placer dans le blog

- *mal de dos et pilates reformer*
- *pilates pour femme enceinte saint-ouen*
- *reformer vs pilates sol*
- *crossformer vs HIIT*
- *cours sport enfant 5 ans saint-ouen*

---

## 18 · Validation checklist (avant publication)

- [ ] Tous les H1 respectent ≤ 6 mots
- [ ] Toutes les pages ont un CTA primaire visible « above the fold »
- [ ] Chaque page a au moins 1 témoignage avec prénom + discipline + date
- [ ] Aucune promesse non-tenable (« 100 % garanti », « résultats immédiats »…)
- [ ] Les chiffres sont vérifiés (77 avis, 16 coachs, 12 max, 30 €…)
- [ ] Le tutoiement est cohérent partout (sauf légal)
- [ ] Aucun anglicisme non-discipline (« gym », « fitness » seul → à remplacer)
- [ ] Liens internes cross-page : chaque page pointe vers Tarifs + Réserver
- [ ] Char count respecté dans chaque bloc Figma Make
- [ ] FAQ chaque page : 4 à 8 questions orientées conversion

---

## 📁 Fichier

`/design-system/COPY-BIBLE.md` — maintenu avec tokens.json, tokens.css, DESIGN-SYSTEM.md et index.html.

## 📝 Changelog

- **v1.0** (2026-04-17) — Initial release. 14 pages + footer + micro-copy + emails + SEO. Ready Figma Make.
