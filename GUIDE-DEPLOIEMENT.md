# SPARTAN INTELLIGENCE — Guide de déploiement pas à pas

## Ce que tu vas faire

Tu vas mettre en ligne ton application Spartan Intelligence pour qu'elle soit accessible depuis ton iPhone (et ceux de tes futurs clients) comme une vraie app. Le processus complet prend environ 1 heure.

**Ce dont tu as besoin :**
- Un ordinateur avec un navigateur web
- Un compte GitHub (gratuit) → github.com
- Un compte Vercel (gratuit) → vercel.com
- Ton espace Notion existant avec tes bases de données

---

## ÉTAPE 1 — Créer un compte GitHub

GitHub est l'endroit où ton code sera stocké. Vercel le lira depuis GitHub pour le mettre en ligne.

1. Va sur **github.com** et clique sur **Sign up**
2. Crée ton compte avec ton email
3. Une fois connecté, clique sur le **+** en haut à droite → **New repository**
4. Nom du repository : `spartan-intelligence`
5. Laisse en **Public** (ou Private si tu préfères)
6. Coche **Add a README file**
7. Clique **Create repository**

---

## ÉTAPE 2 — Envoyer le code sur GitHub

### Option A — Via l'interface web GitHub (le plus simple)

1. Ouvre ton repository `spartan-intelligence` sur GitHub
2. Clique sur **Add file** → **Upload files**
3. Fais glisser TOUS les fichiers du dossier `spartan-project` que je t'ai fourni
4. **IMPORTANT** : tu dois respecter la structure des dossiers. Si GitHub ne gère pas bien les dossiers par glisser-déposer, utilise l'Option B.

### Option B — Via GitHub Desktop (recommandé)

1. Télécharge **GitHub Desktop** → desktop.github.com
2. Installe-le et connecte-toi avec ton compte GitHub
3. Clique sur **Clone a repository** et sélectionne `spartan-intelligence`
4. Choisis un dossier local sur ton ordinateur
5. Copie TOUS les fichiers du dossier `spartan-project` dans ce dossier local
6. Dans GitHub Desktop, tu verras tous les fichiers listés comme "changements"
7. En bas à gauche, écris un message comme "Premier déploiement" et clique **Commit to main**
8. Clique **Push origin** en haut

La structure de ton dossier doit ressembler à ça :

```
spartan-intelligence/
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
├── lib/
│   └── notion.js
├── pages/
│   ├── _app.js
│   ├── index.js
│   └── api/
│       ├── seances.js
│       ├── nutrition.js
│       ├── bilan.js
│       └── etat-semaine.js
├── public/
│   └── manifest.json
└── styles/
    └── globals.css
```

---

## ÉTAPE 3 — Créer une intégration Notion

Cette étape permet à ton app de lire tes bases de données Notion.

1. Va sur **notion.so/my-integrations**
2. Clique sur **Nouvelle intégration**
3. Donne-lui un nom : `Spartan Intelligence`
4. Sélectionne ton espace de travail (Espace de Djo H)
5. Clique **Envoyer**
6. Tu verras une **clé secrète** qui commence par `secret_...`
7. **COPIE cette clé et garde-la précieusement** — tu en auras besoin à l'étape 5

### Donner accès aux bases de données

Pour CHAQUE base de données (Séance, Nutrition, Bilan du coach, Etat Semaine, Plan d'entrainement) :

1. Ouvre la base dans Notion
2. Clique sur les **...** en haut à droite de la page
3. Clique sur **Connexions**
4. Cherche et sélectionne **Spartan Intelligence** (ton intégration)
5. Confirme

---

## ÉTAPE 4 — Récupérer les IDs de tes bases de données

Pour chaque base de données, tu dois copier son ID unique.

1. Ouvre une base de données dans Notion (ex: Séance)
2. Clique sur **Partager** → **Copier le lien**
3. Tu obtiens un lien comme :
   `https://www.notion.so/ton-espace/ABC123DEF456...?v=XYZ`
4. L'ID est la partie entre le dernier `/` et le `?`
   Dans cet exemple : `ABC123DEF456...`
5. C'est une chaîne de 32 caractères (lettres et chiffres)

Fais ça pour ces 5 bases et note chaque ID :
- **Séance** → NOTION_DB_SEANCES
- **Nutrition** → NOTION_DB_NUTRITION
- **Bilan du coach** → NOTION_DB_BILAN
- **Etat Semaine** → NOTION_DB_ETAT_SEMAINE
- **Plan d'entrainement** → NOTION_DB_PLAN

---

## ÉTAPE 5 — Déployer sur Vercel

Vercel est le service qui va héberger ton app gratuitement et la mettre en ligne.

1. Va sur **vercel.com** et crée un compte (utilise "Continue with GitHub")
2. Une fois connecté, clique **Add New...** → **Project**
3. Tu verras ton repository `spartan-intelligence` — clique **Import**
4. Dans la section **Environment Variables**, ajoute tes variables :

| Nom | Valeur |
|-----|--------|
| `NOTION_API_KEY` | Ta clé secrète `secret_...` de l'étape 3 |
| `NOTION_DB_SEANCES` | L'ID de ta base Séance |
| `NOTION_DB_NUTRITION` | L'ID de ta base Nutrition |
| `NOTION_DB_BILAN` | L'ID de ta base Bilan |
| `NOTION_DB_ETAT_SEMAINE` | L'ID de ta base Etat Semaine |
| `NOTION_DB_PLAN` | L'ID de ta base Plan d'entrainement |

5. Clique **Deploy**
6. Attends 1-2 minutes que Vercel compile ton app
7. Tu obtiens une URL comme `spartan-intelligence.vercel.app`

**C'est en ligne !**

---

## ÉTAPE 6 — Installer l'app sur ton iPhone

1. Ouvre **Safari** sur ton iPhone
2. Va sur ton URL Vercel (ex: `spartan-intelligence.vercel.app`)
3. Appuie sur le bouton **Partager** (carré avec flèche vers le haut)
4. Sélectionne **Sur l'écran d'accueil**
5. Donne-lui un nom : "Spartan AI"
6. L'app apparaît sur ton écran d'accueil comme une vraie app !

---

## ÉTAPE 7 — Personnaliser ton domaine (optionnel)

Si tu veux un nom de domaine personnalisé (ex: `app.spartan-intelligence.fr`) :

1. Achète un domaine sur **OVH**, **Namecheap** ou **Google Domains**
2. Dans Vercel, va dans **Settings** → **Domains**
3. Ajoute ton domaine
4. Vercel te donnera des enregistrements DNS à configurer chez ton registrar
5. Suis les instructions — ça prend quelques minutes à propager

---

## COMPRENDRE LA STRUCTURE DU PROJET

Voici ce que fait chaque fichier pour que tu puisses modifier les choses :

### `pages/index.js` — L'interface de l'app
C'est le fichier principal. Il contient tout le visuel : les écrans, les couleurs, la navigation. Si tu veux changer une couleur, un texte, ou ajouter une section, c'est ici.

**Pour changer les couleurs :** Modifie l'objet `C` tout en haut du fichier.
**Pour changer les données de démo :** Modifie `DEMO_SESSIONS`, `DEMO_NUTRITION`, etc.

### `lib/notion.js` — La connexion à Notion
Ce fichier lit tes bases de données Notion et transforme les données. Si tu ajoutes une colonne dans Notion, tu devras peut-être ajouter une ligne ici pour la lire.

### `pages/api/` — Les routes API
Ces fichiers font le pont entre l'interface et Notion. Chaque fichier correspond à une base de données. Tu ne devrais pas avoir à les modifier.

### `styles/globals.css` — Les styles globaux
Les polices, les couleurs de fond, etc.

### `public/manifest.json` — Configuration PWA
C'est ce qui permet à l'app de s'installer comme une app sur iPhone.

---

## ADAPTER LES NOMS DE COLONNES NOTION

Le fichier `lib/notion.js` essaie de reconnaître tes colonnes Notion automatiquement. Par exemple, pour la colonne "Séance", il cherche `Séance`, `Name`, ou `Nom`.

Si tes colonnes ont des noms différents, ouvre `lib/notion.js` et modifie les noms entre guillemets. Par exemple :

```javascript
// Si ta colonne s'appelle "Titre de la séance" au lieu de "Séance"
nom: getText(props["Titre de la séance"]),
```

---

## ADAPTER POUR LA COMMERCIALISATION

Pour vendre ce produit à d'autres athlètes, il te faudra :

### 1. Authentification (qui est l'utilisateur ?)
- Utilise **Clerk** (clerk.com) — gratuit jusqu'à 10 000 utilisateurs
- S'intègre facilement avec Next.js
- Chaque utilisateur aura un login/mot de passe

### 2. Multi-utilisateurs (une base Notion par client)
Deux approches possibles :
- **Une seule base Notion** avec une colonne "Utilisateur" pour filtrer
- **Un template Notion** dupliqué pour chaque client (plus propre mais plus complexe)

### 3. Onboarding (profil de l'athlète)
Ajouter un formulaire de première connexion où l'utilisateur renseigne :
- Âge, poids, taille
- Objectif (Spartan Sprint / Super / Beast / Ultra)
- Niveau d'expérience
- Fréquence d'entraînement souhaitée
- Données métaboliques

### 4. Paiement
- Utilise **Stripe** (stripe.com) pour gérer les abonnements
- Intégration facile avec Vercel

---

## EN CAS DE PROBLÈME

### L'app affiche "DÉMO" au lieu de "LIVE"
→ Tes variables Notion ne sont pas correctement configurées dans Vercel. Va dans Settings → Environment Variables et vérifie chaque valeur.

### Erreur 500 sur les API
→ Ouvre la console Vercel (onglet Logs) pour voir le message d'erreur. Souvent c'est un nom de colonne Notion qui ne correspond pas.

### Les données ne se mettent pas à jour
→ L'app lit Notion à chaque chargement de page. Rafraîchis simplement la page. Si ça ne marche pas, vérifie que l'intégration Notion a bien accès à la base.

### Tu veux modifier quelque chose
→ Modifie le fichier sur GitHub (soit via l'interface web, soit via GitHub Desktop). Vercel redéploiera automatiquement en quelques secondes.

---

## PROCHAINES ÉTAPES RECOMMANDÉES

1. **Déploie d'abord en mode démo** (sans connecter Notion) pour voir le résultat
2. **Connecte Notion** et vérifie que tes données réelles s'affichent
3. **Ajuste les noms de colonnes** si nécessaire dans `lib/notion.js`
4. **Personnalise les couleurs et textes** dans `pages/index.js`
5. **Ajoute un domaine personnalisé** quand tu es satisfait
6. **Intègre Garmin Connect** pour enrichir les données (on peut en reparler)

---

*Guide créé pour Geoffrey — Spartan Intelligence v1.0*
*En cas de question, reviens me voir, je t'accompagne sur chaque étape.*
