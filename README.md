# Deep Learning Quest

Cours Astro bilingue **français / anglais**, adapté des handouts de François Fleuret fournis dans ce dépôt. Interface sombre, navigation par chapitre, fiches de révision, exercices corrigés, quiz interactifs et progression locale.

Les **62 parties des chapitres 1 à 13** sont disponibles dans les deux langues, soit **124 fichiers Markdown**. Chaque partie contient une explication, les mécanismes et formules, un exemple, un exercice corrigé, les points à retenir, un piège fréquent et une question de quiz expliquée. Des exemples Python/PyTorch accompagnent les notions qui s’y prêtent. Les 63 PDF originaux restent accessibles, avec des liens vers les pages utilisées.

Le chapitre 14 est une note séparée : le PDF fourni est un brouillon de trois pages, dont une seule de contenu. Le site reprend ses thèmes sans inventer un chapitre absent du support. Cette adaptation ne reproduit pas chacune des figures, références et démonstrations des 1 198 pages originales.

## Démarrer

Utiliser **Node.js 24**, indiqué dans `.nvmrc`, et npm. Avec nvm :

```bash
nvm install
nvm use
npm ci
npm run dev
```

Ouvrir `http://localhost:4321/deep_learning/`, puis choisir Français ou English. Le sélecteur FR/EN reste disponible sur toutes les pages du parcours et conserve la leçon ou le filtre de chapitre. La préférence de langue, la progression et les meilleurs scores sont enregistrés dans le navigateur, sans compte ni serveur.

Le dossier `handout/` doit contenir les PDF originaux et `by-nc-sa-4.0.txt`. Ils sont automatiquement copiés vers `public/handout/` avant le développement et la compilation. Ne pas modifier cette copie générée.

## Modifier le cours

Les **fichiers Markdown sont la source de vérité** pour le texte, les fiches et les quiz. Aucun composant Astro à modifier pour corriger une leçon.

```text
src/content/lessons/
  fr/01/1-1.md
  en/01/1-1.md
  …
  fr/13/13-3.md
  en/13/13-3.md
src/content/notes/
  fr/14-draft.md
  en/14-draft.md
```

Le dossier `01` représente le chapitre 1 ; `1-2.md` représente sa partie 2. L’ordre est numérique, donc le chapitre 10 vient après le chapitre 9. Les traductions ont le même `lessonId` et les mêmes références PDF, mais leurs textes et formules sont indépendants.

Exemple d’en-tête YAML, tiré de la leçon 1-4 :

```yaml
---
lessonId: "1-4"
lang: fr
title: "Tenseurs et régression linéaire"
description: "Comprendre les formes des tenseurs et ajuster une droite par moindres carrés."
summary:
  - "Vérifier les formes avant de calculer."
  - "Le symbole @ exprime le produit matriciel."
  - "La colonne de 1 représente le biais."
formula: '\hat\theta=\arg\min_\theta\frac1N\|X\theta-y\|_2^2'
pitfall: "Le produit x * y est élément par élément ; utiliser @ pour un produit matriciel."
source: dlc-handout-1-4-tensors-and-linear-regression.pdf
sourcePages: [2, 3, 6, 10, 13]
pdfPages: 14
quiz:
  question: "Quelle est la forme de cinq vecteurs de trois composantes ?"
  options:
    - "(5, 3)"
    - "(15,)"
    - "(3, 5, 2)"
  answer: 0
  explanation: "Le premier axe indexe les cinq vecteurs ; le second leurs trois composantes."
---
```

`answer` commence à **0**. `sourcePages` compte depuis la couverture du PDF, pas depuis le numéro éventuellement imprimé sur la diapositive. Les fiches de révision et les quiz de chapitre sont produits à partir de cet en-tête : une correction s’applique partout.

Sous l’en-tête, écrire du Markdown : `##` pour les sections du sommaire, `$...$` pour une formule en ligne, `$$...$$` pour une formule centrée, blocs de code avec le langage `python`. Pour une correction dépliable :

```html
<details>
<summary>Afficher la correction</summary>

La solution rédigée, avec éventuellement une formule $x^2$.

</details>
```

Les lignes vides permettent d’interpréter le Markdown dans la correction. Garder les deux langues à jour, puis lancer `npm run check`. Le contenu Markdown est destiné aux personnes de confiance qui maintiennent le dépôt ; il peut contenir du HTML.

Les titres des groupes et chapitres sont dans `src/data/course.ts`. Pour ajouter un nouveau chapitre au-delà du programme actuel, adapter également le schéma de `src/content.config.ts` et la liste des parties valides dans `src/scripts/progress.mjs`, puis ajouter les traductions et le PDF correspondant.

## Vérification et production

```bash
npm run check        # Types, schéma, traductions, formules, sources et exercices
npm test             # Progression et configuration GitHub Pages
npm run build        # Génération de dist/ et contrôle des liens locaux
npx playwright install --with-deps chromium
npm run test:e2e      # Parcours desktop et mobile sur le build
npm run preview      # Prévisualisation locale du build
```

`npm run validate` enchaîne les vérifications, les tests, le build et les tests navigateur. Installer Chromium une première fois avant cette commande. Le port 4321 doit être libre pour les tests. `BASE_PATH` et `SITE_URL` doivent être identiques lors du build et de sa prévisualisation.

Les tests navigateur vérifient notamment les quiz, les corrections, la persistance des scores, le changement de langue, les filtres, l’affichage mobile, la lecture sans JavaScript et le fonctionnement lorsque le stockage local est bloqué. Le build échoue si un lien local ou un PDF référencé manque.

## Publication GitHub Pages

Le workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) valide les changements sur `main` et `website`, ainsi que les pull requests vers ces branches. Il publie **uniquement depuis la branche par défaut du dépôt**, après validation complète. Un lancement manuel est également disponible.

1. Ajouter au dépôt le code, `package-lock.json`, les fichiers `.github/`, `.devcontainer/` et les **handouts originaux**. Les fichiers générés (`dist`, `node_modules`, `.work`, `public/handout`) sont ignorés.
2. Dans GitHub, ouvrir **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Pousser ou fusionner les changements dans la branche par défaut (`main` ou `website`). Si elle porte un autre nom, modifier les filtres `branches` du workflow.
4. Consulter l’exécution **Validate and deploy to GitHub Pages**, puis l’URL de l’environnement `github-pages`.

Pour `Arkanthara/deep_learning`, l’URL attendue est `https://arkanthara.github.io/deep_learning/` **après une publication réussie**. Le workflow calcule automatiquement le domaine et le préfixe pour les forks et les dépôts `owner.github.io`. Il utilise les permissions minimales `contents: read`, puis `pages: write` et `id-token: write` uniquement pour le déploiement. Aucun jeton personnel n’est nécessaire.

Pour un domaine personnalisé, configurer ce domaine et son DNS dans GitHub Pages, puis définir les variables de dépôt **Settings → Secrets and variables → Actions → Variables** :

| Variable | Exemple |
| --- | --- |
| `SITE_URL` | `https://cours.example.org` (origine sans sous-chemin) |
| `BASE_PATH` | `/` (ou le préfixe souhaité) |

En local, utiliser les mêmes variables, par exemple `SITE_URL=https://cours.example.org BASE_PATH=/ npm run build`. La protection de l’environnement `github-pages`, si elle est activée dans GitHub, peut demander une approbation de déploiement.

## Dev Container

Avec Docker et l’extension VS Code **Dev Containers**, ouvrir le dépôt puis lancer **Dev Containers: Reopen in Container**. Le conteneur installe Node 24, les dépendances verrouillées, Chromium et ses bibliothèques système, puis expose le port 4321. Exécuter ensuite `npm run dev` dans son terminal. La première installation nécessite un accès réseau.

Configuration : [`.devcontainer/devcontainer.json`](.devcontainer/devcontainer.json), basée sur l’[image officielle Node.js et TypeScript](https://github.com/devcontainers/images/blob/main/src/typescript-node/README.md). Le conteneur utilise l’utilisateur `node`, pas un utilisateur root pour le développement courant. L’installation des bibliothèques système du navigateur utilise les capacités fournies par l’image de développement.

## Suite prévue

Les quiz, corrections dépliables, filtres, recherche et progression fonctionnent dès maintenant. L’exécution Python dans le navigateur et les graphiques pilotés par des sliders restent la deuxième étape demandée. Les blocs Python actuels sont à exécuter dans un environnement Python/PyTorch externe. Ils ne prétendent pas lancer du code dans la page.

Pour cette suite, isoler le moteur Python dans un Web Worker, définir les bibliothèques réellement disponibles, puis ajouter des composants interactifs aux leçons via MDX ou des composants Astro dédiés. Aucun service distant d’exécution n’est requis par cette version.

## Sources et licences

- Handouts : **François Fleuret**, [cours original Deep Learning](https://fleuret.org/dlc/).
- Contenu pédagogique et traductions adaptés : **CC BY-NC-SA 4.0**, voir [CONTENT-LICENSE.md](CONTENT-LICENSE.md) et le texte fourni dans `handout/by-nc-sa-4.0.txt`.
- Code du site : licence MIT du dépôt, voir [LICENSE](LICENSE).

Cette adaptation indépendante n’est pas le site officiel du cours et n’implique aucune approbation de son auteur.

## English quick start

Use Node 24, then run `npm ci` and `npm run dev`. Open `http://localhost:4321/deep_learning/` and select English. Edit lessons under `src/content/lessons/en/` and their French counterparts under `fr/`. Each Markdown file contains the lesson and YAML metadata for its revision card and quiz; answer indices start at zero. Run `npm run check` after editing.

The course covers all 62 numbered parts in chapters 1–13. Chapter 14 is explicitly marked as the short draft supplied with the sources. Interactive Python execution and slider-driven plots are planned for a second phase. To deploy, enable **GitHub Actions** as the Pages source and merge into the repository’s default branch; the workflow validates, builds, tests and deploys the static site.
