# Guide de contenu

Comment modifier le site sans toucher à l'interface. Une section par tâche, avec les fichiers exacts.

Règles communes :

- Le site est **bilingue**. Tout texte visible existe en français et en anglais : dans `content/*.ts` sous
  la forme `l("texte FR", "text EN")`, dans `messages/` sous la forme de deux fichiers jumeaux
  (`messages/fr…` et `messages/en…`, mêmes clés).
- Après une modification, lancer `npm run dev` pour vérifier, puis `npm run lint` et `npm run build` avant
  de pousser. Le build échoue si une news est mal formée (le message indique le fichier et le champ).
- Un push sur `main` redéploie le site sur Vercel (voir le [README](../README.md)).

## Sommaire

1. [Publier une news](#1-publier-une-news)
2. [Modifier les infos ou les chiffres d'un jeu](#2-modifier-les-infos-ou-les-chiffres-dun-jeu)
3. [Ajouter un jeu](#3-ajouter-un-jeu)
4. [Remplacer une démo du Parcours par un vrai visuel](#4-remplacer-une-démo-du-parcours-par-un-vrai-visuel)
5. [Ajouter une expérience au Nid](#5-ajouter-une-expérience-au-nid)
6. [Modifier les traductions](#6-modifier-les-traductions)
7. [Changer les liens des réseaux](#7-changer-les-liens-des-réseaux)
8. [Compléter les mentions légales](#8-compléter-les-mentions-légales)
9. [Remplacer les images et les vidéos](#9-remplacer-les-images-et-les-vidéos)

---

## 1. Publier une news

Une news = **un fichier Markdown par langue**, avec le **même nom de fichier** (le slug) dans les deux
dossiers :

```
content/news/fr/mon-slug.md
content/news/en/mon-slug.md
```

Le chargeur est `src/lib/news.ts`, le rendu est dans `src/components/news/ArticleBody.tsx` et
`src/lib/markdown/`. Référence complète du format : [`content/news/README.md`](../content/news/README.md).
Pour écrire dans Notion plutôt que dans un éditeur de texte : [NOTION.md](./NOTION.md).

### En-tête (frontmatter)

```yaml
---
title: "Patch note du 20 novembre : équilibrage"   # obligatoire
excerpt: "Une ou deux phrases affichées dans les listes."  # obligatoire
game: one-piexel     # one-piexel | fastr | iconic | studio (obligatoire)
date: 2026-11-20     # AAAA-MM-JJ (obligatoire)
type: patch-note     # patch-note | devlog | announcement | behind-the-scenes | video (obligatoire)
lang: fr             # fr | en, doit correspondre au dossier (obligatoire)
cover: /images/news/mon-slug/cover.jpg   # facultatif, voir section 9
coverAlt: "Description de l'image"
readingTime: 3       # minutes, facultatif
tags: [équilibrage, classé]
---
```

Champs facultatifs utiles : `upcoming: true` (annonce de quelque chose de pas encore sorti),
`featured: true` (carte « À la une » de `/news`), `home: 1` (position 1 à 3 sur l'accueil), `video`
(lien YouTube), `teaser` (titre et extrait courts pour les petites cartes), `highlights` et `ctaLabel`
(carte « À la une »), `hero` (affiche illustrée en tête d'article), `cta` (encart « Jouer » en fin
d'article). Tous sont décrits avec un exemple dans `content/news/README.md`.

### Corps de l'article

Markdown standard (GFM) ; le HTML brut est ignoré.

- Le texte avant le premier `##` est le chapeau de l'article.
- Chaque `##` ouvre une section numérotée et une entrée du sommaire. `## Surtitre | Titre | Libellé court`
  règle le surtitre et le libellé du sommaire.
- Image seule dans un paragraphe = figure, le titre Markdown est la légende :
  `![Texte alternatif](/images/news/mon-slug/combat.jpg "Légende")`.
- Lien YouTube, ou chemin `.mp4` / `.webm`, seul dans un paragraphe = lecteur vidéo.
- Paragraphe entièrement en italique = petite note.
- Listes reconnues d'après leur contenu : `- **12** nouveaux combattants` (chiffre en gras : chiffres
  clés), `- **AJOUT** Texte` (étiquette en majuscules : changelog, regroupé sous le `###` précédent),
  `- **Terme.** Définition` (cartes de définition).
- Blocs riches : blocs de code avec un nom réservé, un élément par ligne.

````markdown
```roster Les nouveaux venus
Kaido | Le plus attendu
Garp
Katakuri
```

```cards
shield | Parade | Renvoie le coup au bon timing.
bolt | Ultime | Se déclenche à pleine jauge.
```

```tiles
keyboard | Clavier
gamepad | Manette
```

```ladder
steps: 9
start: Mousse
end: Roi des Pirates
note: Neuf paliers classés.
```
````

Icônes disponibles : `shield`, `armor`, `clock`, `break`, `star`, `bolt`, `keyboard`, `touch`, `gamepad`,
`desktop`. Tout autre bloc de code (` ```js `, ` ```css `…) est un bloc de code avec bouton de copie.

### Étapes

1. Déposer les images dans `public/images/news/<slug>/` (chemin public : `/images/news/<slug>/fichier.jpg`).
2. Créer `content/news/fr/<slug>.md` et `content/news/en/<slug>.md`. Le slug doit être identique ; sans
   version anglaise, la news n'apparaît pas en anglais.
3. `npm run dev`, ouvrir `/news` et `/news/<slug>` (et `/en/news/<slug>`), puis `npm run build`.

---

## 2. Modifier les infos ou les chiffres d'un jeu

Tout est dans **`content/games.ts`**, un objet par jeu : `onePiexel`, `fastr`, `iconic`. Chercher le
chiffre avec la recherche de l'éditeur (par exemple `600+`), il apparaît à plusieurs endroits.

| À changer | Champ dans le jeu |
| --- | --- |
| Pastille de statut des cartes (« SORTI · V3 LE 14 NOV. ») | `statusLabel` |
| Statut long des fiches, statut court des petites cartes | `statusDetail`, `statusShort` |
| Statut technique (`released`, `beta`, `in-development`) | `status` |
| 3 chiffres de la carte d'accueil | `cardStats` |
| 4 chiffres de la page du jeu | `kpis` |
| Fiche (genre, en ligne, solo, plateformes, contrôles, langues) | `facts`, `platforms` |
| Textes de présentation | `pitch`, `pitchSection`, `tagline`, `genre` |
| Les 3 chantiers techniques et leurs chiffres | `challenge.items[].figures` |
| Titre et description pour Google et les partages | `seo` |
| URL du jeu | `url`, `domain` |
| Bande-annonce, galerie, affiche | `media` |

Exemple, passer les combattants de 51 à 55 (à faire dans `cardStats`, `kpis`, `seo.description`,
`pitch.page` et dans le texte du jeu, FR **et** EN) :

```ts
cardStats: [
  { value: "55", label: l("combattants", "fighters") },
  ...
],
```

Un chiffre peut être une simple chaîne (`"60 Hz"`) ou un couple FR/EN quand le format diffère :
`l("175 000+", "175,000+")`. Dans les textes longs de la page du jeu, `*mot*` met en accent, `**mot**` en
gras et `` `code` `` en police de code.

---

## 3. Ajouter un jeu

Ajouter un jeu demande **du contenu et un peu de code**, car chaque jeu a son habillage (skin) et sa carte.

1. **Contenu** : dans `content/games.ts`, ajouter le slug au type `GameSlug` et à `GameSkinKey`, créer un
   objet `Game` en copiant un existant (`fastr` est le plus court) et l'ajouter au tableau `games` en bas
   du fichier. Les pages `/jeux/<slug>`, le sitemap et les données structurées le prennent alors en
   compte automatiquement.
2. **Images** : `public/images/games/<slug>/` (affiche `poster.jpg`, `mini.jpg`, captures), vidéo dans
   `public/videos/`.
3. **Habillage** : classes `.sk-<clé>` dans `src/styles/skins.css`, polices dans `src/lib/fonts-skins.ts`
   (entrée du jeu dans `skinFontVariables`).
4. **Carte et démo** (TypeScript) : une carte dans `src/components/games/GameCard.tsx` (objet `CARDS`), une
   démo jouable dans `src/components/games/GameDemo.tsx` (objet `DEMOS`), et le slug dans les listes
   d'ordre `src/components/games/GamesList.tsx` (`ORDER`), `src/components/games/GameSections.tsx`
   (`OTHERS_ORDER`) et `src/components/home/FeaturedGames.tsx` (accueil).
5. **Formulaire de contact** : `SELECT_OPTIONS.game` dans `src/components/contact/ContactForm.tsx`, et le
   libellé du jeu dans `messages/<locale>/contact.json`.
6. **News** : les news peuvent désormais utiliser `game: <slug>`, sans autre changement.

TypeScript signale les oublis : `npm run typecheck` échoue tant qu'un `Record<GameSlug, …>` est incomplet.

---

## 4. Remplacer une démo du Parcours par un vrai visuel

Chaque réalisation du Parcours (`/parcours`) affiche une démo rejouable avec la mention « visuel à venir ».
Dès qu'un vrai visuel est renseigné, la démo et la mention disparaissent.

1. Déposer le fichier dans **`public/images/career/`** (dossier à créer). Respecter le ratio annoncé par
   `visual.ratio` du cas (16:9 en général), sans logo ni capture d'écran d'entreprise.
2. Dans **`content/career.ts`**, trouver la réalisation (`id: "screenshot-bot"`, `"entity-builder"`,
   `"monorepo"`, `"adtech-forms"`, `"db-redesign"` ou `"serverless"`) et ajouter `media` dans son `visual` :

```ts
visual: {
  kind: l("Démo illustrative", "Illustrative demo"),
  ratio: "16:9",
  brief: l("…", "…"),
  media: {
    type: "image",                       // ou "video"
    src: "/images/career/screenshot-bot.png",
    width: 1920,
    height: 1080,
    alt: l("Description de l'image", "Image description"),
    // poster: "/images/career/screenshot-bot-poster.jpg",   // pour une vidéo
  },
},
```

`width` et `height` sont les dimensions réelles du fichier. Rien d'autre à changer (le rendu est dans
`src/components/career/VisualSlot.tsx`).

Pour remplacer la démo par **un autre composant** plutôt que par une image, changer l'entrée de la
réalisation dans `src/components/career/demos/index.tsx` (objet `DEMOS`). Les textes des démos actuelles
sont dans `content/career-demos.ts`.

Les marqueurs `[chiffre à confirmer]` du Parcours (`result`, `stackNote`) sont laissés exprès dans
`content/career.ts` : les remplacer par les vrais chiffres une fois confirmés.

---

## 5. Ajouter une expérience au Nid

Les expériences sont listées dans le tableau de **`content/nest.ts`** (`id`, `number`, `status`, `from`,
`title`, `description`, `tags`, `how`, `demo`, `code`).

**Annoncer une expérience (statut « à venir »)** : ajouter un objet avec `status: "soon"`, sans `demo` ni
`code`, comme `rollback`, `brick-wall` ou `typo-tolerance`. Ajouter son `id` au type `ExperimentId` en
haut du fichier.

**Publier une expérience jouable** (TypeScript) :

1. Passer `status` à `"playable"`, renseigner `how` (3 étapes), `code` (`filename`, `language`, `short`
   pour l'accueil, `full` pour la page) et `demo: "<nom>"`.
2. Ajouter `"<nom>"` au type `ExperimentDemo` dans `content/nest.ts`.
3. Écrire le composant dans `src/components/nest/` (modèle : `CrowFollowDemo.tsx`, textes via
   `useTranslations("demos.<nom>")`) et l'inscrire dans `src/components/nest/demos.tsx`.
4. Ajouter les textes de la démo (clé `demos.<nom>`) dans `messages/fr.json` **et** `messages/en.json`.

`from` vaut le slug du jeu d'origine, ou `null` pour le studio. Les extraits de code du Nid sont publiés
sous licence MIT.

---

## 6. Modifier les traductions

Deux endroits selon la nature du texte :

- **Texte de l'interface** (boutons, titres de pages, formulaire, pied de page) : dans `messages/`.
  - `messages/fr.json` et `messages/en.json` : parties communes (`meta`, `nav`, `header`, `palette`,
    `footer`, `common`, `home`, `news`, `demos`…).
  - `messages/<locale>/<page>.json` : un fichier par page, `<page>` valant `games`, `career`, `news`,
    `nest`, `services`, `about`, `contact` ou `legal`. Ex. `messages/fr/contact.json` et
    `messages/en/contact.json`.
  - Les deux langues ont **les mêmes clés**. Modifier une clé dans un fichier, la modifier dans l'autre.
  - Les balises `<em>`, `<b>`, `<link>…</link>` et les `{variables}` (ex. `{name}`) sont des repères du
    code : les conserver à l'identique dans la traduction.
- **Texte éditorial** (jeux, parcours, Nid, services, liens) : dans `content/*.ts`, en paires
  `l("français", "english")`.

Ajouter une langue demande du code (`src/i18n/routing.ts`, `content/types.ts`) : à traiter à part.

---

## 7. Changer les liens des réseaux

Fichier **`content/site.ts`**, tableau `socials` : `id`, `label`, `url`, `handle`. Une `url` à `null`
masque le lien (« à venir »), c'est le cas d'Instagram. GitHub et YouTube sont mis en avant grâce à
`featured: true`. Les liens se mettent à jour partout (en-tête, pied de page, page À propos, pages des
jeux). Les réseaux affichés sur la page d'un jeu se règlent dans le champ `socials` de ce jeu dans
`content/games.ts`.

Le même fichier contient le nom du site, l'auteur, le chemin du CV (`cv`, fichier dans `public/cv/`) et
l'image de partage (`ogImage`, `public/og/default.png`).

---

## 8. Compléter les mentions légales

Les champs à renseigner sont marqués `[à compléter]` sur la page. Ils sont dans
**`messages/fr/legal.json`** et **`messages/en/legal.json`**, section `publisher`, sous la forme
`"<todo></todo>"` :

| Clé | Contenu attendu |
| --- | --- |
| `nameValue` | Nom de l'éditeur |
| `statusValue` | Statut (micro-entreprise, société…) |
| `siretValue` | Numéro SIRET |
| `addressValue` | Adresse |
| `directorValue` | Directeur de la publication |

Remplacer `<todo></todo>` par le texte (dans les deux fichiers), par exemple :

```json
"siretValue": "123 456 789 00012",
```

Le texte du marqueur lui-même (`todo`, en haut du fichier) est affiché tant qu'un champ est vide. Relire
aussi les sections hébergeur, données personnelles et **mesure d'audience** : cette dernière décrit un outil
sans cookie, à ajuster si l'outil réellement utilisé est différent.

---

## 9. Remplacer les images et les vidéos

Tout ce qui est servi tel quel est dans **`public/`**. Un fichier `public/images/x.jpg` s'écrit
`/images/x.jpg` dans le code, **sans** `public`.

| Dossier | Contenu |
| --- | --- |
| `public/images/games/<jeu>/` | Affiche (`poster.jpg`), vignette (`mini.jpg`), captures, logo |
| `public/images/news/` | Illustrations des news (`public/images/news/<slug>/` pour une news) |
| `public/images/brand/` | Logo et planche du corbeau |
| `public/images/career/` | Visuels du Parcours (à créer, voir section 4) |
| `public/videos/` | Bandes-annonces `.mp4` |
| `public/cv/` | `CV_Dylan_Tuna.pdf` |
| `public/og/default.png` | Image de partage par défaut (1200 × 630) |

- **Remplacer un fichier à l'identique** : garder le même nom et les mêmes dimensions, rien d'autre à
  modifier. Si les dimensions changent, mettre à jour `width` / `height` du jeu dans `content/games.ts`
  (objets `img(src, largeur, hauteur, alt)`), faute de quoi l'image est déformée.
- **Bande-annonce** : déposer le `.mp4` dans `public/videos/` et régler `media.trailer` du jeu dans
  `content/games.ts` (`src`, durée, légendes). L'affiche (`media.poster`) s'affiche avant le clic.
- **CV** : remplacer le PDF en gardant le nom, ou changer `cv` dans `content/site.ts`.
- **Poids** : images en JPG ou WebP optimisés, vidéos compressées (quelques Mo). Les images passent par
  `next/image` qui génère les tailles.
- Penser au **texte alternatif** (`alt`) de chaque image, dans les deux langues.
