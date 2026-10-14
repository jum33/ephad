# Site vitrine « groupe d'EHPAD à l'ère de l'IA »

Démonstrateur d'un **groupe d'EHPAD privé fictif (Groupe EPHADIA)** qui montre ce que l'IA change au siège et dans chaque résidence.
Le site présente un organigramme interactif avec calcul du temps rendu, un quiz, une École IA et un espace direction. Les règles du projet sont dans `CLAUDE.md`.

## Nom de marque provisoire

La marque, **EPHADIA** (site ephadia.fr), est définie **à un seul endroit** : `site.config.json` (clé `MARQUE`).
Le domaine, l'e-mail de contact et les mentions de l'éditeur y sont aussi, avec des valeurs à compléter.

## Arborescence

| Dossier / fichier | Rôle |
|---|---|
| `src/pages/*.html` | Pages du site. La 1re ligne `<!--meta …-->` donne titre, description et chemin. |
| `src/partials/` | `head`, `header` et `footer` communs, insérés à la génération. |
| `public/assets/data.js` | **Toutes les données** : services de l'organigramme (effectifs, fréquences, temps avant / après), cas d'usage, actualités. |
| `public/assets/site.js` | Comportements : organigramme et calcul, quiz, filtres, École IA, formulaire. |
| `public/assets/site.css` | Charte arc-en-ciel (`--green`, `--teal`, `--amber`, police Mulish). |
| `build.mjs` | Génère `dist/` : remplace les jetons `{{…}}`, insère en-tête et pied de page, pré-calcule le contenu lisible sans JavaScript, produit le `sitemap.xml`. |

## Développer

```bash
node build.mjs                       # génère dist/
npx serve dist  # ou : python3 -m http.server -d dist 8080
```

## Le calcul du temps rendu

Pour chaque service : `heures/an = effectif × occurrences par personne et par an × (minutes avant − minutes avec l'IA) / 60`.
L'effectif dépend du nombre de résidences choisi sur l'organigramme (curseur de 1 à 60) :
- `fixe` : identique quelle que soit la taille (direction générale) ;
- `siege` : effectif d'un groupe de 12 résidences, au prorata ;
- `site` : effectif par résidence × nombre de résidences.

Les équivalents temps plein sont calculés sur 1 607 h/an. Tous les chiffres sont illustratifs.

## Déploiement

OVH (hébergement mutualisé Apache), domaine **ephadia.fr** : lancer `node build.mjs`, puis envoyer **le contenu** de `dist/` (fichier caché `.htaccess` compris) dans le dossier `www/` par FTP. `.htaccess` sert les URL sans `.html`, la page 404 et force le HTTPS. Le formulaire de contact passe par `contact.php`, qui envoie la demande à `{{EMAIL}}` avec la fonction `mail()` d'OVH. Ne jamais versionner `dist/`.
