# Synchro Notion → Markdown

Les news s'écrivent dans une base Notion ; le script `scripts/notion-sync.mjs` les exporte en fichiers
Markdown dans `content/news/<langue>/<slug>.md`, au format attendu par `src/lib/news.ts`. Le site reste
statique : Notion n'est interrogé que par la commande, jamais par le site en ligne. Les fichiers générés
sont relus puis commités comme n'importe quelle modification.

## 1. Créer l'intégration Notion

1. Aller sur <https://www.notion.so/profile/integrations> et créer une intégration **interne** dans le
   bon espace de travail.
2. Dans *Capabilities*, ne laisser que **Read content** (le script ne fait que lire).
3. Copier le secret (*Internal Integration Secret*, commence par `ntn_` ou `secret_`) : c'est `NOTION_TOKEN`.

## 2. Partager la base avec l'intégration

Une intégration ne voit que ce qui lui est partagé. Ouvrir la base de news dans Notion, menu `…` en haut à
droite, *Connections* (ou *Connexions*), ajouter l'intégration.

L'identifiant de la base (`NOTION_NEWS_DATABASE_ID`) est la suite de 32 caractères de son URL, avant `?v=` :
`https://www.notion.so/<espace>/`**`0123456789abcdef0123456789abcdef`**`?v=…`

Dans `.env.local` (jamais commité) :

```bash
NOTION_TOKEN=ntn_xxxxxxxx
NOTION_NEWS_DATABASE_ID=0123456789abcdef0123456789abcdef
```

## 3. Propriétés de la base

**Une ligne Notion = une news dans une langue.** Une news bilingue a donc deux lignes, avec le même `Slug`
et deux valeurs de `Langue`. Les noms des propriétés sont lus tels quels (accents compris) ; ils sont
définis en haut de `scripts/lib/news-mapping.mjs` (`PROPS`).

### Obligatoires

| Propriété | Type Notion | Frontmatter | Valeurs |
| --- | --- | --- | --- |
| `Titre` | Title | `title` | texte |
| `Slug` | Texte | nom du fichier | kebab-case : `one-piexel-patch-2026-11-20` (identique en `fr` et `en`) |
| `Langue` | Select | `lang` + dossier | `fr`, `en` |
| `Jeu` | Select | `game` | `one-piexel`, `fastr`, `iconic`, `studio` |
| `Type` | Select | `type` | `patch-note`, `devlog`, `announcement`, `behind-the-scenes`, `video` |
| `Date` | Date | `date` | date de publication (seul le jour est gardé) |
| `Extrait` | Texte | `excerpt` | une ou deux phrases pour les listes |
| `Publié` | Checkbox | (filtre) | seules les lignes cochées sont exportées |

Les valeurs de `Langue`, `Jeu` et `Type` doivent être écrites exactement ainsi (minuscules, tirets).

### Facultatives

Une propriété absente ou vide est simplement omise du frontmatter. Elles correspondent aux champs décrits
dans [`content/news/README.md`](../content/news/README.md).

| Propriété | Type Notion | Frontmatter |
| --- | --- | --- |
| `Couverture` | Files & media (ou URL) | `cover` |
| `Couverture (texte alt)` | Texte | `coverAlt` |
| `Temps de lecture` | Number | `readingTime` |
| `À venir` | Checkbox | `upcoming` |
| `À la une` | Checkbox | `featured` |
| `Accueil` | Number (1 à 3) | `home` |
| `Tags` | Multi-select | `tags` |
| `Vidéo` | URL | `video` |
| `Teaser titre`, `Teaser extrait` | Texte | `teaser.title`, `teaser.excerpt` |
| `Points forts` | Texte, un point par ligne | `highlights` |
| `Bouton principal` | Texte | `ctaLabel` |
| `Hero titre` | Texte | `hero.title` (le bloc `hero` n'existe que si ce titre est rempli) |
| `Hero label`, `Hero alt`, `Hero légende` | Texte | `hero.label`, `hero.alt`, `hero.caption` |
| `Hero découpes` | Files & media, ou texte avec un chemin ou une URL par ligne | `hero.cutouts` (gauche, droite, centre) |
| `CTA titre` | Texte | `cta.title` (le bloc `cta` n'existe que si ce titre est rempli) |
| `CTA note`, `CTA libellé`, `CTA lien` | Texte, Texte, URL | `cta.note`, `cta.label`, `cta.href` |

Pour `Couverture` et `Hero découpes`, une image **téléversée dans Notion** est téléchargée dans le dépôt ;
un chemin déjà présent dans `public/` (`/images/news/keyart.jpg`, saisi comme texte) est gardé tel quel.

## 4. Écrire le corps de l'article

Le corps de la page Notion devient le corps du Markdown. La syntaxe du site
([`content/news/README.md`](../content/news/README.md), section *Body*) s'applique :

- Titre 2 de Notion = `##` (section numérotée du sommaire). `Surtitre | Titre | Libellé court` fonctionne.
- Titre 3 = `###`, listes, citations, tableaux, liens, images : conversion native.
- Une **image** de la page devient une figure ; sa **légende** Notion devient le texte alternatif (le
  titre Markdown de la figure, lui, se règle ensuite dans le fichier généré si besoin).
- Un lien YouTube collé seul sur une ligne devient un lecteur vidéo.
- **Blocs riches** (`roster`, `cards`, `tiles`, `ladder`) : Notion n'offre pas ces langages de code.
  Créer un bloc de code (langage *Plain text*) dont la **première ligne** est `@roster Libellé`, `@cards`,
  `@tiles` ou `@ladder`, puis les lignes du bloc comme dans le README :

  ```
  @roster Les nouveaux venus
  Kaido | Le plus attendu
  Garp
  ```

  Le script le transforme en bloc ` ```roster Les nouveaux venus `.

## 5. Lancer la synchro

```bash
npm run news:sync -- --dry-run   # montre ce qui serait écrit (new / changed / unchanged), ne touche à rien
npm run news:sync                # écrit les fichiers et télécharge les images
npm run news:sync -- --only mon-slug   # une seule news (les deux langues)
```

Ce que fait le script :

1. Interroge la base et ne garde que les lignes dont `Publié` est coché.
2. Valide chaque ligne comme le fait `src/lib/news.ts` (champs obligatoires, valeurs permises, slug en
   kebab-case) ; une ligne invalide est signalée avec la liste de ses problèmes, **les autres sont quand même
   traitées**, et la commande se termine en erreur.
3. Télécharge les images hébergées par Notion (URL signées qui expirent au bout d'une heure) dans
   `public/images/news/<slug>/` sous un nom stable (`<empreinte>.<ext>`) et réécrit les liens en
   `/images/news/<slug>/<fichier>`. Relancer la synchro ne retélécharge pas ce qui est déjà là.
4. Écrit `content/news/<langue>/<slug>.md`. Un fichier identique n'est pas touché.

Le script **n'efface jamais** rien : dépublier (décocher `Publié`) ou renommer un slug ne supprime pas
le fichier existant, à supprimer à la main avec `git rm`.

## 6. Relire le diff et commiter

```bash
git status
git diff content/news        # relire le texte et le frontmatter
npm run build                # vérifie que le site accepte les news
git add content/news public/images/news
git commit -m "content(news): <titre de la news>"
```

Le Markdown généré est la source de vérité du site : une retouche faite à la main dans le fichier sera
**écrasée** à la prochaine synchro de la même page. Corriger dans Notion, ou ne plus synchroniser cette news.

## Dépannage

| Message | Cause probable |
| --- | --- |
| `Missing NOTION_TOKEN or NOTION_NEWS_DATABASE_ID` | Variables absentes de `.env.local` et du shell |
| `Notion query failed` | Token faux, identifiant de base faux, ou base non partagée avec l'intégration (étape 2) |
| `property "…" is empty or missing` | Champ obligatoire vide dans la ligne Notion |
| `game "…" must be one of …` | Valeur du Select `Jeu` mal écrite, ou nouveau jeu à ajouter dans `scripts/lib/news-mapping.mjs` (`GAMES`) |
| `image download failed` | URL Notion expirée : relancer la commande (les URL sont lues à neuf à chaque exécution) |

## Tests

`npm run test:scripts` vérifie, sur une page Notion factice, la conversion propriétés → frontmatter,
l'écriture YAML, les blocs riches et la réécriture des images, ainsi que l'accord des listes de jeux et de
types avec `content/games.ts` et `src/lib/news.ts`. Aucun appel réseau n'est fait.
