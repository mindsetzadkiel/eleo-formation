# 🚀 Guide de déploiement — Eleo Formation

Ce document décrit comment déployer la plateforme `eleo-formation-ai` en production sur Vercel avec une base PostgreSQL Neon, et la connecter au sous-domaine `formation.eleo-informatique.fr` via le DNS o2switch.

**Coût total : 0 € / mois** (plans gratuits suffisants pour démarrer).

---

## Architecture cible

```
┌─────────────────────────────────────────────────────────┐
│  eleo-informatique.fr                                   │
│  ├── /                  → o2switch (WordPress, inchangé)│
│  └── formation.…        → Vercel (Next.js, plateforme)  │
│                            └─ Neon (PostgreSQL)         │
└─────────────────────────────────────────────────────────┘
```

---

## 1. Créer la base de données PostgreSQL (Neon)

1. Aller sur [neon.tech](https://neon.tech) et créer un compte (signup avec GitHub recommandé).
2. **New Project** :
   - Name : `eleo-formation`
   - PostgreSQL version : 16 (par défaut)
   - Region : `Europe (Frankfurt)` ou `Europe (Paris)` si dispo
3. Copier la **Connection string** (format `postgresql://user:pass@…neon.tech/eleo_formation?sslmode=require`).
4. La conserver pour l'étape suivante (Vercel).

---

## 2. Pousser le code sur GitHub

Si le projet n'est pas encore versionné :

```bash
git init
git add .
git commit -m "Initial commit — Eleo Formation platform"
```

Créer un repo privé sur [github.com/new](https://github.com/new) (nom suggéré : `eleo-formation`) puis :

```bash
git remote add origin https://github.com/<votre-user>/eleo-formation.git
git branch -M main
git push -u origin main
```

---

## 3. Déployer sur Vercel

1. Aller sur [vercel.com](https://vercel.com) et se connecter avec GitHub.
2. **Add New → Project** → sélectionner le repo `eleo-formation`.
3. **Framework Preset** : Next.js (auto-détecté).
4. **Environment Variables** : ajouter chaque variable de `.env.example` avec sa vraie valeur :

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | Connection string Neon (étape 1) |
| `JWT_SECRET` | Générer avec `openssl rand -base64 32` |
| `AI_PROVIDER` | `openrouter` |
| `OPENROUTER_API_KEY` | Votre clé OpenRouter |
| `OPENROUTER_MODEL` | `openai/gpt-oss-120b:free` |
| `OPENROUTER_FALLBACK_MODELS` | `qwen/qwen3-next-80b-a3b-instruct:free,z-ai/glm-4.5-air:free,meta-llama/llama-3.3-70b-instruct:free,google/gemma-3-27b-it:free` |
| `OPENROUTER_SITE_URL` | `https://formation.eleo-informatique.fr` |
| `OPENROUTER_APP_NAME` | `Eleo Formation` |
| `NEXT_PUBLIC_APP_URL` | `https://formation.eleo-informatique.fr` |
| `WP_SITE_URL` | `https://eleo-informatique.fr` |
| `WP_USER` | Email admin WordPress |
| `WP_APP_PASSWORD` | Mot de passe d'application WordPress |

5. **Deploy** — premier build prend ~3 minutes.
6. Une fois terminé, vous obtenez une URL temporaire `eleo-formation-xxx.vercel.app`. Vérifiez qu'elle fonctionne avant de continuer.

---

## 4. Initialiser la base de données (premier déploiement)

Vercel exécute `prisma migrate deploy` à chaque build. Pour la **toute première fois**, il faut créer le schéma :

**Option A** : Depuis votre machine locale, avec `DATABASE_URL` pointant vers Neon dans `.env.local` :

```bash
npx prisma db push       # crée les tables
npm run seed             # insère les données initiales (formations, utilisateurs démo)
```

**Option B** : Utiliser le terminal Neon directement (Console SQL) — plus complexe, déconseillé.

---

## 5. Brancher le sous-domaine (o2switch)

### Côté Vercel
1. Project → **Settings → Domains**.
2. Ajouter `formation.eleo-informatique.fr`.
3. Vercel affiche les enregistrements DNS à configurer (généralement un CNAME).

### Côté o2switch (cPanel)
1. Connexion à votre cPanel o2switch.
2. **Domains → Zone Editor** → cliquer sur `eleo-informatique.fr`.
3. **+ Add Record** :
   - Type : `CNAME`
   - Name : `formation`
   - TTL : `14400`
   - Target : `cname.vercel-dns.com` (valeur indiquée par Vercel)
4. Enregistrer. La propagation DNS prend 5 à 30 minutes.

### Vérification
Vercel valide automatiquement le domaine. HTTPS Let's Encrypt est généré gratuitement. Une fois validé, `https://formation.eleo-informatique.fr` est en ligne.

---

## 6. Mettre à jour la page WordPress

Une fois la plateforme accessible, exécuter localement :

```bash
node scripts/wp-elementor-rewrite.mjs --push
```

Cela met à jour la page WordPress `Formation` (id 1237) :
- Retire toutes les mentions « bureautique » (formations non proposées)
- Retire « DIF » (obsolète depuis 2015 → remplacé par OPCO)
- Met à jour les boutons CTA → `formation.eleo-informatique.fr`
- Préserve 100% du design Elementor

---

## 7. Ajouter le menu WordPress

Dans `wp-admin → Apparence → Menus` :
- Ajouter un lien personnalisé : URL `https://formation.eleo-informatique.fr`, Texte « Plateforme formation ».
- Le placer dans le menu principal.

---

## Maintenance

### Pousser une mise à jour du code
```bash
git push origin main
```
Vercel redéploie automatiquement.

### Voir les logs en production
Vercel → Project → Deployments → cliquer sur le dernier déploiement → **Functions / Logs**.

### Réinitialiser la base de données (⚠️ destructif)
```bash
DATABASE_URL=<neon-url> npx prisma migrate reset --force
DATABASE_URL=<neon-url> npm run seed
```

### Mettre à jour les schémas
```bash
# Modifier prisma/schema.prisma localement
DATABASE_URL=<neon-url> npx prisma db push
git add prisma/schema.prisma
git commit -m "schema: …"
git push
```

---

## Sécurité

- ✅ Tous les secrets (DB, JWT, API keys) sont dans Vercel Environment Variables, jamais dans le code.
- ✅ HTTPS obligatoire (Let's Encrypt automatique via Vercel).
- ✅ Mots de passe utilisateur hashés bcrypt.
- ✅ Auth par cookie HttpOnly + JWT signé.
- ⚠️ Le mot de passe d'application WordPress doit être révoqué et régénéré si fuite (Utilisateurs → Profil → Mots de passe d'application).

---

## Questions fréquentes

**Q : Mon WordPress va être impacté par le déploiement ?**
R : Non, zéro changement côté o2switch jusqu'à l'étape 5 (ajout du CNAME). Et même là, on n'ajoute qu'un sous-domaine — votre site `eleo-informatique.fr` reste totalement intact.

**Q : Puis-je revenir en arrière sur la page WordPress « Formation » ?**
R : Oui. Le JSON Elementor original est sauvegardé dans `wp-elementor-parsed.json`. Un script de restauration peut être créé en cas de besoin.

**Q : Combien ça coûte vraiment ?**
R : 0 € / mois sur les plans gratuits Neon (3 Go) + Vercel (100 Go bande passante / mois). Largement suffisant pour démarrer. Si croissance, plans payants à partir de 19 $/mois chacun.
