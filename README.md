# Corvus Web Studio

Site portfolio de **Corvus Web Studio**, le studio de Dylan Tuna (Senior Fullstack Engineer, Nancy) :
les trois jeux du studio (One Piexel, Fastr, Iconic), les services, les news (devlog), le parcours,
le Nid (expériences interactives sous licence MIT), la page À propos, le contact et les mentions légales.
Le site est bilingue : français sans préfixe (`/jeux`), anglais sous `/en` (`/en/games`).

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript strict
- Tailwind CSS v4, styles de composants dans `src/styles/`
- next-intl pour les langues et les routes traduites
- Contenu typé dans `content/`, news en Markdown (`gray-matter`, `react-markdown`, `remark-gfm`)
- Envoi du formulaire de contact avec Resend, déploiement sur Vercel, npm

## Démarrage local

Prérequis : Node.js 20.9 ou plus (22 recommandé) et npm.

```bash
npm install
cp .env.example .env.local   # puis compléter, voir « Variables d'environnement »
npm run dev                  # http://localhost:3000
```

## Scripts npm

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement (Turbopack) |
| `npm run build` | Build de production : c'est ce que Vercel exécute |
| `npm run start` | Sert le build de production en local |
| `npm run lint` | ESLint sur tout le dépôt |
| `npm run typecheck` | Vérification TypeScript (`tsc --noEmit`) |
| `npm run test:scripts` | Tests (`node --test`) du mapping Notion → frontmatter |
| `npm run news:sync` | Synchronise les news depuis Notion, voir [docs/NOTION.md](./docs/NOTION.md) |

## Variables d'environnement

Le modèle est `.env.example`. En local, copier vers `.env.local` (ignoré par git). Aucune variable n'est
obligatoire pour que le site se construise et s'affiche.

| Variable | Où | Rôle |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | local + Vercel | Origine de production sans `/` final (`https://mon-domaine.fr`). Sert aux URL canoniques, au sitemap, à `robots` et à Open Graph. Sans elle, le site retombe sur `VERCEL_PROJECT_PRODUCTION_URL`, puis sur `http://localhost:3000`. |
| `RESEND_API_KEY` | Vercel | Clé API Resend du formulaire de contact (`src/app/api/contact/route.ts`). |
| `CONTACT_TO_EMAIL` | Vercel | Boîte qui reçoit les messages (plusieurs adresses séparées par des virgules). Jamais envoyée au navigateur. |
| `CONTACT_FROM_EMAIL` | Vercel, optionnel | Expéditeur sur un domaine vérifié dans Resend, ex. `Corvus Web Studio <contact@mon-domaine.fr>`. Par défaut, l'expéditeur de test de Resend, qui ne livre qu'au titulaire du compte Resend. |
| `NOTION_TOKEN`, `NOTION_NEWS_DATABASE_ID` | local seulement | Synchro des news depuis Notion ([docs/NOTION.md](./docs/NOTION.md)). Inutiles sur Vercel. |

Sans `RESEND_API_KEY` ou `CONTACT_TO_EMAIL`, le formulaire affiche un message d'erreur propre et le serveur
journalise la raison.

## Déploiement (Vercel)

1. Importer le dépôt GitHub dans Vercel (framework détecté : Next.js, aucune configuration de build).
2. Chaque push sur `main` déclenche un déploiement de production ; chaque autre branche ou pull request
   obtient une préversion.
3. Dans *Project Settings → Environment Variables*, définir `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY` et
   `CONTACT_TO_EMAIL` (et `CONTACT_FROM_EMAIL` si le domaine est vérifié dans Resend) pour l'environnement
   *Production*.
4. `NEXT_PUBLIC_SITE_URL` est lue au moment du build : après l'avoir modifiée, relancer un déploiement
   (*Redeploy*) pour qu'elle soit prise en compte.
5. Avant de pousser, vérifier en local que `npm run lint` et `npm run build` passent.

## Structure

```
content/      Contenu éditorial typé : jeux, parcours, Nid, services, liens réseaux
  news/       Une news = un fichier Markdown par langue (content/news/<fr|en>/<slug>.md)
messages/     Textes de l'interface : fr.json, en.json, et messages/<locale>/<page>.json par page
public/       Images, vidéos, CV, image Open Graph
scripts/      Synchro Notion → Markdown et ses tests
docs/         Guides : CONTENU.md (modifier le site), NOTION.md (synchro des news)
src/
  app/        Routes ([locale]/…), sitemap, robots, API du contact
  components/ Composants par domaine (games, news, career, nest, ui, layout…)
  i18n/       Routage et navigation next-intl
  lib/        Chargeur de news, SEO, JSON-LD, helpers
  styles/     Tokens, base, composants, skins des jeux
```

Conventions détaillées (routes, thème, skins de jeux, SEO) : [ARCHITECTURE.md](./ARCHITECTURE.md).
Modifier un texte, un chiffre, une news ou une image sans coder : [docs/CONTENU.md](./docs/CONTENU.md).

## Licence

Voir [LICENSE](./LICENSE).
