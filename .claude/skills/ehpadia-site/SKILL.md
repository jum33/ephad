---
name: ehpadia-site
description: Gestionnaire du site vitrine IA pour les groupes d'EHPAD privés (dépôt GitHub jum33/ephad, groupe fictif « Groupe EHPADIA », marque EHPADIA). Couvre la charte arc-en-ciel, l'organigramme interactif et le calcul du temps rendu, les cas d'usage, le quiz des bons réflexes, l'École IA, l'espace direction, la page données de santé (HDS), les règles de formulation propres au secteur et le workflow de livraison (génération, vérification, commit, Netlify). À utiliser dès que Jean-Marc mentionne le site EHPAD, « ephad », EHPADIA (ou EPHADIA), le Groupe EHPADIA, EHPAD IA, un service ou un cas d'usage EHPAD à ajouter, ou toute modification de ce site, même formulée de façon informelle (« ajoute un cas d'usage sur les chutes », « change le nom de la marque », « mets à jour les chiffres de l'organigramme »). Ne pas utiliser pour le site Quarkley / SDIS 00, qui est un projet distinct.
---

# Site du Groupe EHPADIA : l'IA pour les groupes d'EHPAD privés

Le site met en scène un **groupe d'EHPAD privé fictif, le Groupe EHPADIA** (12 résidences et un siège). On n'écrit plus « Groupe 00 » ni « EHPAD IA ». Il montre ce que l'IA change dans chaque service et vend une offre (portail IA, formations, accompagnement) sous la marque **EHPADIA**.

- Dépôt : `jum33/ephad`, branche `main`.
- Hébergement : Netlify (`node build.mjs`, publication de `dist/`).

## 1. Règles absolues

1. **Projet distinct de Quarkley.** Ne jamais citer Quarkley, Superfasttt, SPIN, SDIS ou pompiers, ni reprendre un texte du site quarkley.com. Si la demande est ambiguë, demander de quel site il s'agit avant d'agir. Seule exception : l'éditeur du site, **specialisteinternet.fr**, figure dans les mentions légales via `{{EDITEUR_NOM}}`, et nulle part ailleurs.
2. **La marque n'est écrite qu'à un seul endroit** : `site.config.json`. Dans les pages, utiliser les jetons `{{MARQUE}}`, `{{GROUPE}}`, `{{GROUPE_SLOGAN}}`, `{{EMAIL}}`, `{{DOMAINE}}`, `{{EDITEUR_NOM}}`, `{{EDITEUR_ADRESSE}}`, `{{EDITEUR_SIRET}}`, `{{DIRECTEUR_PUBLICATION}}`, `{{HEBERGEUR}}` (hébergeur du site, OVH, distinct de l'hébergeur HDS des données de santé).
3. Le sigle s'écrit **EHPAD**, jamais « EPHAD ». La marque s'écrit donc **EHPADIA**, y compris quand la demande dit « EPHADIA ». Le nom du dépôt, `ephad`, est historique et ne doit pas être recopié dans le contenu.
4. **Tout est fictif** : personnages, résidences, chiffres. Toujours écrire « chiffres donnés à titre d'exemple ».
5. Ne pas exposer l'e-mail personnel de Jean-Marc dans le site sans son accord explicite.

## 2. Ton et formulation

- Message central : **« L'IA prend l'écrit, l'humain garde le soin. »** Les heures rendues sont réinvesties auprès des résidents.
- Interdit : présenter l'IA comme un moyen de réduire les effectifs, promettre un résultat, citer un groupe réel, faire allusion aux scandales du secteur.
- Garde-fous à rappeler dans chaque fiche :
  - données de santé hébergées en France chez un hébergeur **certifié HDS** ;
  - **aucune donnée de résident** dans une IA grand public ;
  - l'IA ne pose **ni diagnostic, ni prescription**, et ne décide ni d'une admission, ni d'un recrutement ;
  - un professionnel **relit et valide**, et rien n'est envoyé automatiquement.
- Vocabulaire : résidence, résident, famille, IDEC, médecin coordonnateur, AS / IDE, transmissions ciblées (DAR), PAP, CVS, évaluation HAS, événements indésirables (EI / EIG), CPOM, EPRD / ERRD, RAMA, GMP / PMP, Via Trajectoire, ARS, FALC, unité protégée.
- Style : phrases courtes, concrètes, sans jargon technique d'IA. On écrit « le portail », « l'assistant », pas « LLM » ni « RAG ». Pas de point d'exclamation.

## 3. Charte graphique (arc-en-ciel)

| Jeton CSS | Valeur | Usage |
|---|---|---|
| `--ink` | #575756 | texte courant (gris) |
| `--green` | #007F49 | principale : boutons, chiffres, liens |
| `--teal` | #007C9C | secondaire : icônes, offre, étapes « IA » |
| `--amber` | #F07E23 | secondaire orange, points « à explorer » ; en texte sur fond blanc, utiliser #B4590C |
| `--pink` | #E5006D | filet arc-en-ciel seulement |
| `--lime` | #96C11F | filet arc-en-ciel seulement |
| `--cream` | #FEF3EA | fond de la « résidence type » |
| `--soft` | #F1F1F1 | fonds doux |
| `--danger` | #B83A2E | erreurs uniquement |

- Sous un texte blanc, foncer le vert et le bleu d'un cran (par exemple #00663B pour le vert) pour garder le contraste.
- Polices : Mulish pour tout le texte, Geist Mono pour les petites étiquettes.
- Icônes : SVG au trait de 1,7 px, couleurs alternées vert / bleu / orange, définies dans `ICONS` (`data.js`).
- L'accueil utilise un dégradé vert, sans photo, avec un filet arc-en-ciel (orange, rose, bleu, vert clair) au-dessus du titre. Le logo `public/assets/logo.svg` (maison et feuille) est provisoire.

## 4. Architecture

```
site.config.json        marque, domaine, e-mail, éditeur, nom du groupe fictif
build.mjs               génère dist/ (jetons, partials, contenu sans JS, sitemap)
src/partials/           head.html, header.html, footer.html
src/pages/*.html        1re ligne obligatoire : <!--meta title="…" description="…" path="/…"-->
public/assets/data.js   SOURCE UNIQUE : ICONS, SERVICES, CASES, FAMILIES, NEWS, fonctions de calcul
public/assets/site.js   organigramme et tiroir, quiz, filtres, École IA (F = formations, A = accompagnements), formulaire
public/assets/site.css  styles et charte
```

Blocs générés à la construction : `<!--@kpi-hours-->`, `<!--@kpi-etp-->`, `<!--@services-count-->`, `<!--@services-details-->`, `<!--@cases-->`, `<!--@news-->`.

Pages : `/` · `/organigramme` · `/cas-usage` · `/le-portail-ia` · `/bons-reflexes` · `/ecole-ia` · `/espace-direction` · `/donnees-de-sante` · `/contact` · `/mentions-legales` · `404`.

## 5. Le calcul du temps rendu

Pour un service : `heures/an = effectif × f × (t[0] − t[1]) / 60`, où `f` est le nombre d'occurrences de la tâche par personne et par an, et `t` les minutes [avant, avec l'IA]. Un ETP vaut 1 607 h.

L'effectif dépend de `sc` et du nombre de résidences `R` (curseur de 1 à 60, 12 par défaut) :
- `fixe` → `n` ;
- `siege` → `max(1, round(n × R / 12))` ;
- `site` → `n × R`.

Repère pour 12 résidences : environ **10 000 h et 6,3 ETP**, dont environ 3 600 h pour le service Soins (le plus lourd, car il compte le plus d'effectif par résidence). Après toute modification de `SERVICES`, vérifier que les ordres de grandeur restent crédibles : aucun service au-delà d'environ 40 % du total, et un total qui ne dépasse pas environ 15 ETP pour 12 résidences.

Pour obtenir ces chiffres sans navigateur :

```bash
node -e 'global.window={};require("./public/assets/data.js");const D=window.DATA;const h=D.totalHours(12);console.log(Math.round(h),"h",D.etp(h),"ETP")'
```

Champs d'un service :

```js
{id, g:"Direction générale|Siège|Résidence", k:"Intitulé", ic:"icône", c:G|T|A, p:"Prénom Nom (fictif)",
 sc:"fixe|siege|site", n, f, t:[avant, après],
 task:"Tâche", s:["étape 1", …], ai:[index des étapes faites par l'IA],
 q:"Exemple de demande", a:"Réponse (HTML court, <ul> permis)", src:"Source citée", gd:"Garde-fou"}
```

Champs d'un cas d'usage : `{id, f: clé de FAMILIES, t, d, o (bénéfice), gain, who}`. Familles : `pilotage`, `soins`, `vie`, `rh`, `qualite`, `relation`.

Champs d'une actualité : `{d: "date en toutes lettres", id: id du service lié, t: titre, s: phrase de résumé}`.

## 6. Procédures

- **Ajouter ou modifier un service, un cas d'usage, une actualité** : modifier uniquement `data.js`. Le lien d'une actualité vers un service se fait par `id` (`/organigramme#service-<id>`).
- **Ajouter une page** : créer `src/pages/nom.html` à partir d'une page existante (bloc meta, `<!--#head-->`, `<!--#header-->`, `<main id="contenu">`, `<!--#footer-->`), puis ajouter le lien dans `header.html` et/ou `footer.html`. URL sans `.html`.
- **Ajouter une formation** : tableaux `F` (avec `pub` : `tous`, `referents`, `direction` ou `metiers`) ou `A` dans `site.js`.
- **Changer la marque** : modifier `site.config.json`, régénérer, et vérifier qu'aucune page ne contient l'ancien nom (`grep -ri "ancien nom" dist`).
- **Renommer le groupe fictif** : clé `GROUPE` du même fichier (valeur actuelle : « Groupe EHPADIA »).

## 7. Vérifier avant de livrer

1. `node build.mjs` doit afficher « N pages générées » ; le script échoue si un jeton n'est pas remplacé.
2. Servir `dist/` (`python3 -m http.server -d dist 8099`), puis contrôler avec Playwright à **1280 px et 390 px** : aucune erreur JavaScript, `scrollWidth` égal à la largeur de la fenêtre, organigramme cliquable, curseur qui recalcule, quiz fonctionnel.
3. Relire le texte modifié au regard des sections 1 et 2 : aucune mention de Quarkley ou des SDIS, présence des garde-fous, ton sobre.
4. Contrôler l'absence de toute mention Quarkley : `grep -rniE 'quarkley|sdis|pompier' src public`, qui ne doit rien renvoyer.

## 8. Livraison

- Le fichier `CLAUDE.md` du dépôt fait foi : en cas d'écart avec cette compétence, suivre `CLAUDE.md` et signaler l'écart.
- Commit en français, court et descriptif, poussé sur `jum33/ephad`. Créer une branche et une pull request quand Jean-Marc veut relire avant publication, sinon pousser sur `main` s'il le demande.
- Ne jamais versionner `dist/`.
- Netlify redéploie automatiquement après chaque push sur `main`.
- Hors GitHub : livrer une archive zip du dépôt (`git archive -o site.zip HEAD`).
