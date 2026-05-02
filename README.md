# ELEO_FORMATION_AI

Plateforme web interne et publique pour **Eleo Formation**, la branche commerciale de formations professionnelles d'**Eleo Informatique** (Aix-en-Provence).

> Site public + back-office complet : catalogue, CRM prospects avec filtre anti-candidatures gratuites, gestion des formations/sessions/apprenants/entreprises, dossiers OPCO, génération PDF, cockpit Qualiopi, assistant IA administratif et espace LMS apprenant.

---

## 🎯 Objectif business

Permettre à Eleo Informatique de passer de :

> *« Je forme gratuitement des gens qu'on m'envoie »*

à :

> *« Eleo vend une formation hybride professionnelle, documentée, administrable, finançable, filtrée, avec un cockpit Qualiopi et un assistant IA administratif. »*

La plateforme **bloque automatiquement** les demandes de stages, alternances, apprentissages, immersions gratuites et candidatures emploi.

Elle accepte uniquement :
- **Entreprise** (facture directe)
- **OPCO**
- **France Travail / organisme financeur** (si financé et contractualisé)
- **Fonds propres**
- Demandes en attente de financement (« je ne sais pas encore »)

---

## 🛠️ Stack technique

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS 4**
- **Prisma 6** + **SQLite** (MVP local)
- **JWT** via `jose` pour l'auth
- **bcryptjs** pour le hash des mots de passe
- **pdf-lib** pour la génération PDF côté serveur
- **lucide-react** pour les icônes
- Provider IA abstrait avec **mode mock** par défaut

---

## 🚀 Installation locale

### Prérequis

- Node.js 20+
- npm

### Étapes

```bash
# 1. Installer les dépendances
npm install

# 2. Copier le fichier d'environnement
cp .env.example .env

# 3. Initialiser la base de données SQLite + générer le client Prisma
npx prisma migrate dev --name init

# 4. Lancer le seed (données de démo)
npm run seed

# 5. Démarrer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### Comptes de démonstration

| Rôle      | Email                    | Mot de passe       |
|-----------|--------------------------|--------------------|
| Admin     | `admin@eleo.local`       | `ChangeMe123!`     |
| Formateur | `formateur@eleo.local`   | `Formateur2026!`   |
| Apprenant | `apprenant@demo.local`   | `Apprenant2026!`   |

---

## 📂 Architecture

```
eleo-formation-ai/
├── prisma/
│   ├── schema.prisma          # Schéma complet (20+ modèles)
│   ├── seed.ts                # Données de démo
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── (public)           # Site public
│   │   │   ├── page.tsx       # Accueil
│   │   │   ├── formations/    # Catalogue + détail formation
│   │   │   ├── devis/         # Formulaire avec filtre anti-parasites
│   │   │   ├── contact/
│   │   │   ├── conditions-accueil/
│   │   │   ├── mentions-legales/
│   │   │   └── politique-confidentialite/
│   │   ├── login/             # Connexion
│   │   ├── admin/             # Back-office (rôle ADMIN/FORMATEUR)
│   │   │   ├── page.tsx       # Tableau de bord
│   │   │   ├── crm/           # CRM Prospects
│   │   │   ├── formations/    # CRUD formations
│   │   │   ├── sessions/      # CRUD sessions
│   │   │   ├── apprenants/    # Gestion apprenants
│   │   │   ├── entreprises/   # Gestion entreprises
│   │   │   ├── opco/          # Dossiers OPCO + génération PDF
│   │   │   ├── qualiopi/      # Cockpit Qualiopi (7 critères)
│   │   │   ├── ateliers/      # Atelier présentiel
│   │   │   ├── emails/        # Modèles d'emails
│   │   │   └── assistant/     # Assistant IA mock
│   │   ├── learn/             # Espace LMS apprenant
│   │   └── api/               # Routes API
│   ├── components/
│   │   ├── ui/                # Composants réutilisables
│   │   └── layout/            # Layouts publique + admin
│   ├── config/
│   │   └── company.ts         # ⭐ Config Eleo (modifiable facilement)
│   ├── lib/
│   │   ├── prisma.ts          # Client Prisma
│   │   ├── auth.ts            # Auth + JWT + bcrypt
│   │   ├── ai-provider.ts     # Provider IA abstrait
│   │   ├── pdf-generator.ts   # Génération PDF (8 types)
│   │   └── utils.ts
│   └── generated/             # Client Prisma généré
└── .env.example
```

---

## 📋 Fonctionnalités implémentées

### Site public
- ✅ Page d'accueil avec mise en avant Eleo Formation
- ✅ Catalogue des formations (filtré sur statut `PUBLIEE`)
- ✅ Page détaillée par formation (slug)
- ✅ **Formulaire de devis avec filtre anti-parasites automatique**
- ✅ Page contact + conditions d'accueil
- ✅ Mentions légales + politique de confidentialité
- ✅ Design sobre, moderne, responsive

### Filtre anti-candidatures gratuites ⭐
Le formulaire `/devis` détecte automatiquement les demandes refusées :

| Mode de financement choisi              | Action                                |
|------------------------------------------|---------------------------------------|
| Entreprise / OPCO / France Travail / Fonds propres / NSP | ✅ Prospect valide créé                |
| Stage / alternance / apprentissage      | ❌ Refus automatique + statut CRM      |
| Immersion gratuite / PMSMP              | ❌ Refus automatique + statut CRM      |
| Candidature emploi                      | ❌ Refus automatique + statut CRM      |

Les demandes refusées sont **conservées dans le CRM** avec un statut clair pour traçabilité, et un message s'affiche immédiatement à l'utilisateur.

### Back-office Admin
- ✅ **Tableau de bord** : prospects, refus, formations, sessions, apprenants, alertes Qualiopi/OPCO
- ✅ **CRM Prospects** : recherche, filtres, statuts, modification, notes, prochaines actions
- ✅ **CRUD Formations** : titre, programme, modules, tarifs, statut, modalités
- ✅ **CRUD Sessions** : dates, places, format, statut, formateur
- ✅ **Gestion Apprenants** : création (avec mdp par défaut), profil, progression
- ✅ **Gestion Entreprises** : raison sociale, SIRET, OPCO, contacts, salariés
- ✅ **Dossiers OPCO** : suivi des 11 types de documents (devis, programme, convention, convocation, émargement, certificat, attestation, satisfaction, eval chaud/froid, facture)
- ✅ **Cockpit Qualiopi** : 7 critères + items, statuts, progression
- ✅ **Atelier présentiel** : planning, matériel, sécurité, cas pratiques, grille de compétences
- ✅ **Modèles d'emails** : 11 modèles prêts à copier (refus alternance, fonds propres, OPCO, France Travail, etc.)
- ✅ **Assistant IA** : 12 actions rapides (programme, devis, mail OPCO, refus, quiz, fiche besoin, etc.) — mode mock par défaut

### Génération PDF
8 types de PDF générés côté serveur, identité Eleo intégrée :
- Programme de formation
- Devis
- Convention de formation
- Convocation
- Feuille d'émargement
- Attestation de fin de formation
- Certificat de réalisation
- Questionnaire de satisfaction (à chaud / à froid)

Tous les PDF intègrent le disclaimer légal :
> *« Les documents générés doivent être vérifiés par un humain avant usage officiel… »*

### Espace LMS apprenant (`/learn`)
- ✅ Vue formation inscrite
- ✅ Progression globale + par module
- ✅ Compteurs leçons, quiz, documents, soumissions

### Sécurité / RGPD
- ✅ Auth par rôles (ADMIN, FORMATEUR, APPRENANT, ENTREPRISE_CLIENTE)
- ✅ Mots de passe hashés (bcrypt, 12 rounds)
- ✅ JWT en cookie httpOnly, sameSite lax
- ✅ Routes admin protégées (layout `admin/layout.tsx`)
- ✅ Validation des entrées
- ✅ Pas de données sensibles inutiles
- ✅ Page politique de confidentialité

---

## 🤖 Assistant IA

Provider IA abstrait dans `src/lib/ai-provider.ts`. Mode **mock** par défaut (réponses pré-écrites contextuelles).

Pour brancher une vraie API :

```env
# .env
AI_PROVIDER="openai"
OPENAI_API_KEY="sk-..."
```

(L'implémentation OpenAI/Anthropic est à ajouter dans `getAIProvider()` — la classe `MockAIProvider` sert de référence.)

---

## 🧰 Scripts disponibles

```bash
npm run dev         # Serveur de dev
npm run build       # Build de production
npm run start       # Serveur de production
npm run lint        # Lint ESLint
npm run seed        # Seed de la base
npm run db:reset    # Reset complet de la base
npm run db:migrate  # Nouvelle migration
npm run db:studio   # Prisma Studio (UI admin DB)
```

---

## ⚙️ Configuration centrale

Toutes les infos Eleo sont centralisées dans `src/config/company.ts` :

```ts
export const COMPANY = {
  name: "Eleo Informatique",
  brandName: "Eleo Formation",
  address: "49 Avenue Henri Malacrida",
  postalCode: "13100",
  city: "Aix-en-Provence",
  phone: "04 42 29 06 65",
  email: "eleo.informatique@gmail.com",
  siret: "87773553000017",
  tvaIntra: "FR79877735530",
  // ...
};
```

Modifier ce fichier met à jour : PDF, footer, mentions légales, politique de confidentialité, contact, etc.

---

## ⚠️ Points à vérifier juridiquement avant exploitation

> Cette plateforme aide à structurer l'activité. Elle **ne remplace pas** un audit Qualiopi, un conseil juridique ou une validation administrative.

### À faire avant tout usage officiel
1. **Faire valider les modèles de PDF** (devis, convention, attestation, certificat) par un expert-comptable ou un conseil juridique.
2. **Vérifier les modèles de convention de formation** au regard du Code du travail (articles L.6353-1 et suivants).
3. **Faire viser la politique de confidentialité** par un DPO ou conseil RGPD.
4. **Mentions légales** : ajouter les coordonnées de l'hébergeur réel.
5. **Numéro de déclaration d'activité (NDA)** : à obtenir auprès de la DREETS PACA et à faire apparaître sur tous les documents.
6. **Bilan pédagogique et financier (BPF)** : à déposer chaque année.

### Conditions Qualiopi
La plateforme prépare la documentation des **7 critères** mais la certification reste à obtenir auprès d'un organisme certificateur accrédité (Bureau Veritas, AFNOR, ICPF, etc.).

---

## 🔜 Prochaines étapes

### Pour rendre les formations finançables OPCO
1. Obtenir le **NDA** (numéro de déclaration d'activité) auprès de la DREETS.
2. Obtenir la certification **Qualiopi** auprès d'un certificateur accrédité.
3. Référencer Eleo Formation dans le **catalogue Carif-Oref**.
4. Créer un compte **EDOF** (pour CPF, optionnel).
5. Adapter les conventions et programmes aux exigences spécifiques de chaque OPCO.

### Pour brancher une vraie API IA
1. Souscrire un compte OpenAI / Anthropic.
2. Ajouter la clé dans `.env` (`OPENAI_API_KEY` ou `ANTHROPIC_API_KEY`).
3. Implémenter `OpenAIProvider` ou `AnthropicProvider` dans `src/lib/ai-provider.ts` (suivre le pattern de `MockAIProvider`).
4. Mettre à jour `getAIProvider()` pour retourner la bonne instance selon `AI_PROVIDER`.

### Pour passer en production
1. Migrer SQLite vers **PostgreSQL** (modifier `provider` dans `schema.prisma`, mettre à jour `DATABASE_URL`).
2. Définir un **JWT_SECRET** fort (`openssl rand -hex 32`).
3. Configurer un **service email** (Resend, Brevo, SMTP) pour l'envoi automatique.
4. Mettre en place un **stockage fichier** (S3, local volumé) pour les PDF générés.
5. Activer **HTTPS** et configurer les **cookies sécurisés**.
6. Configurer une **stratégie de sauvegarde** de la base de données.
7. Déployer (Vercel, OVH, scaleway, ou self-hosted).

### Pour intégrer la page WordPress existante
La page actuelle `eleo-informatique.fr/formation-informatique-et-formation-bureautique-aix-en-provence/` contient une formation obsolète. Une fois la plateforme prête :
1. Récupérer les credentials WordPress.
2. Remplacer le contenu par une présentation rapide de Eleo Formation.
3. Ajouter un CTA vers `https://eleo-formation.fr` (ou le domaine choisi pour la plateforme SaaS).

---

## 📊 Schéma de base de données (résumé)

20 modèles principaux :

- **Auth** : `User`, `AuditLog`
- **Catalogue** : `Formation`, `Module`, `Lesson`, `Quiz`, `QuizQuestion`
- **Sessions** : `Session`, `Enrollment`, `Workshop`, `Attendance`
- **Apprenants** : `Learner`, `LearnerDocument`, `Submission`, `LessonCompletion`, `QuizAttempt`, `QuizAnswer`
- **Entreprises** : `Company`
- **CRM** : `Prospect`
- **OPCO** : `OPCODocument`
- **Qualiopi** : `QualiopiCriterion`, `QualiopiItem`
- **Outils** : `EmailTemplate`, `AIConversation`

Voir `prisma/schema.prisma` pour le détail complet.

---

## 📞 Contact projet

**Eleo Informatique**
49 Avenue Henri Malacrida — 13100 Aix-en-Provence
04 42 29 06 65 — eleo.informatique@gmail.com
SIRET 87773553000017

---

## 📜 Licence

Projet propriétaire — Eleo Informatique. Tous droits réservés.
