# Projet « Groupe EHPADIA » : site vitrine IA pour les groupes d'EHPAD privés

Ce dépôt est le site vitrine d'une **offre IA pour les groupes d'EHPAD privés**. Le site met en scène un groupe fictif, le **Groupe EHPADIA** (12 résidences et un siège), pour montrer ce que l'IA change dans chaque service.

## Règle n° 1 : projet distinct de Quarkley

- Ce projet **n'a aucun lien** avec Quarkley, le site sitequarkley ou le SDIS 00. Les offres, la marque, la cible et la charte sont différentes.
- On ne cite **jamais** Quarkley, Superfasttt, SPIN, les SDIS ou les pompiers, ni dans le site, ni dans les commits, ni dans la documentation. On ne reprend pas les textes du site Quarkley.
- Seule exception : l'éditeur du site, **specialisteinternet.fr**, figure dans les mentions légales (jeton `{{EDITEUR_NOM}}`), et nulle part ailleurs dans le site. L'hébergeur du site (OVH, jeton `{{HEBERGEUR}}`) n'est pas l'hébergeur HDS des données de santé.
- La structure (organigramme interactif, calcul du temps rendu, quiz, École IA, espace direction) a été reprise comme principe. Le contenu, lui, est propre au secteur des EHPAD.
- Si une demande semble concerner le site Quarkley, demander à Jean-Marc de quel projet il s'agit avant de toucher à quoi que ce soit.

## Marque

- La marque est **EHPADIA** (elle remplace le nom de travail « EHPAD IA »).
- Le nom de marque, le domaine, l'e-mail et les mentions de l'éditeur sont définis **uniquement** dans `site.config.json`. Ne jamais les écrire en dur dans une page : utiliser les jetons `{{MARQUE}}`, `{{GROUPE}}`, `{{EMAIL}}`, etc.
- Le sigle s'écrit **EHPAD** (et non « EPHAD »). La marque s'écrit donc **EHPADIA** (et non « EPHADIA »). On n'écrit plus « Groupe 00 ».

## Cible et ton

- Cible : directions de **groupes d'EHPAD privés** (direction générale, directions régionales, qualité, RH, DSI, DPO), puis directeurs de résidence.
- Message central : **l'IA prend l'écrit, l'humain garde le soin**. Le temps rendu est réinvesti auprès des résidents. Ne jamais présenter l'IA comme un moyen de supprimer des postes.
- Le sujet est sensible : rester factuel et sobre, sans promesse excessive. Ne citer aucun groupe réel et ne faire aucune allusion aux scandales du secteur.
- Garde-fous à rappeler partout : données de santé hébergées en France chez un hébergeur **certifié HDS** ; aucune donnée de résident dans une IA grand public ; l'IA ne pose **ni diagnostic, ni prescription, ni décision** (admission, recrutement) ; un professionnel relit et valide toujours.
- Vocabulaire du secteur : résidence, résident, famille, IDEC, médecin coordonnateur, AS / IDE, transmissions ciblées (DAR), PAP, CVS, évaluation HAS, CPOM, EPRD / ERRD, RAMA, GMP / PMP, Via Trajectoire, ARS, FALC.
- Personnages et chiffres : tous **fictifs** et présentés comme des exemples (« chiffres donnés à titre d'exemple »).

## Charte graphique (arc-en-ciel)

Les couleurs sont définies dans `public/assets/site.css` (`:root`) :

| Jeton | Couleur | Usage |
|---|---|---|
| `--ink` | #575756 | Texte courant (gris) |
| `--green` | #007F49 | Couleur principale : boutons, chiffres, liens |
| `--teal` | #007C9C | Couleur secondaire : icônes, offre, étapes prises en charge par l'IA |
| `--amber` | #F07E23 | Accent orange : icônes, points « à explorer » (texte orange sur fond blanc : #B4590C) |
| `--pink` / `--lime` | #E5006D / #96C11F | Filet arc-en-ciel seulement |
| `--cream` | #FEF3EA | Fond du bloc « résidence type » |
| `--soft` | #F1F1F1 | Fonds doux |
| `--danger` | #B83A2E | Erreurs seulement (quiz, formulaire) |

Sous un texte blanc, le vert et le bleu sont foncés d'un cran (par exemple #00663B pour le vert) pour garder un contraste suffisant.

Polices : Mulish pour tout le texte, Geist Mono pour les petites étiquettes (`public/fonts`). Les icônes sont des SVG au trait de 1,7 px, tous définis dans `data.js` (`ICONS`).

## Architecture

| Fichier | Rôle |
|---|---|
| `site.config.json` | Marque, domaine, e-mail, éditeur, nom du groupe fictif |
| `src/pages/*.html` | Une page par fichier. La 1re ligne `<!--meta title="…" description="…" path="/…"-->` est obligatoire. |
| `src/partials/` | `head`, `header`, `footer` communs, insérés via `<!--#head-->`, `<!--#header-->`, `<!--#footer-->` |
| `public/assets/data.js` | **Source unique des données** : services de l'organigramme, cas d'usage, actualités |
| `public/assets/site.js` | Comportements : organigramme et calcul, quiz, filtres, École IA (catalogue `F` et `A`), formulaire |
| `build.mjs` | Génère `dist/`, remplace les jetons, pré-calcule le contenu sans JavaScript (`<!--@services-details-->`, `<!--@cases-->`, `<!--@news-->`, `<!--@kpi-hours-->`…), produit le sitemap |

Calcul du temps rendu, pour chaque service : `effectif × occurrences par an × (minutes avant − minutes avec l'IA) / 60`. L'effectif dépend de `sc` : `fixe`, `siege` (base de 12 résidences, au prorata) ou `site` (par résidence). Un ETP = 1 607 h.

## Procédures

- **Ajouter ou modifier un service, un cas d'usage, une actualité** : modifier `public/assets/data.js` seulement. Les pages se mettent à jour à la génération.
- **Ajouter une page** : créer `src/pages/nom.html` avec le bloc meta, puis ajouter le lien dans `src/partials/header.html` et/ou `footer.html`. Les URL sont sans `.html` (`/nom`).
- **Changer la marque** : modifier `site.config.json`, rien d'autre.
- **Avant chaque commit** :
  1. `node build.mjs` : doit afficher « N pages générées », sans jeton non remplacé.
  2. Vérifier dans Chromium (Playwright) à 1280 px et à 390 px : pas d'erreur JavaScript, pas de défilement horizontal.
- Messages de commit en français, courts et descriptifs.

## Déploiement

Netlify : `netlify.toml` lance `node build.mjs` et publie `dist/`. Le formulaire de contact passe par Netlify Forms (`name="contact"`). Ne jamais versionner `dist/`.
