<div align="center">

# 🚀 Armin — Backend API

### Application SaaS de création de contenu par IA

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.1-brightgreen)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-orange)](https://openjdk.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Confidential-red)]()

</div>

---

## 📋 Table des matières

- [Présentation](#présentation)
- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Tests](#tests)
- [Déploiement](#déploiement)
- [Contribuer](#contribuer)

---

## 📖 Présentation

**Armin** est une plateforme SaaS verticale conçue exclusivement pour les créateurs de contenu.
Elle intègre l'intelligence artificielle pour automatiser chaque étape du pipeline créatif :

| Fonctionnalité | Description |
|---|---|
| 💡 **Idées** | Génération d'idées par thème, niche et plateforme |
| 📝 **Scripts** | Création, amélioration et versioning de scripts |
| 🎯 **Titres** | Optimisation SEO avec score d'engagement |
| 📁 **Projets** | Organisation et collaboration en équipe |
| 📊 **Dashboard** | Statistiques et gestion des quotas |

### Plans disponibles

| Feature | Free | Pro (6 550 XOF/mois) | Business (19 670 XOF/mois) |
|---|---|---|---|
| Projets actifs | 3 | Illimités | Illimités |
| Idées / jour | 5 | 50 | Illimitées |
| Scripts / jour | 3 | 30 | Illimités |
| Titres / jour | 5 | Illimités | Illimités |
| Export PDF | ❌ | ✅ | ✅ |
| Collaboration | ❌ | ✅ | ✅ |

---

## 🛠 Stack technique

| Couche | Technologie | Version |
|---|---|---|
| Backend | Spring Boot | 4.0.1 |
| Language | Java | 21 |
| Base de données | PostgreSQL | 15+ |
| ORM | Spring Data JPA / Hibernate | 7.x |
| Sécurité | Spring Security + JWT | 7.x |
| IA principale | Google Gemini | 2.5 Flash |
| IA fallback | Groq + Llama | 3.3 70B |
| Paiement | FedaPay | REST API |
| Email | Gmail SMTP + Thymeleaf | - |
| Export PDF | iText | 8.0.4 |
| Documentation | SpringDoc OpenAPI | 3.x |

---

## 🏗 Architecture

```
com.tank.armin/
├── auth/              # Inscription, connexion, OTP, reset password
├── config/            # BeansConfig, SecurityConfig
├── security/          # JwtAuthFilter, JwtService, UserDetailsServiceImpl
├── user/              # Entité User, UserRepository
├── role/              # Entité Role, RoleRepository
├── token/             # Entité Token (OTP), TokenRepository
├── subscription/      # Plans, abonnements FedaPay, quotas
├── fedapay/           # Intégration API FedaPay (Mobile Money)
├── project/           # Projets + collaboration
├── idea/              # Génération d'idées IA
├── script/            # Scripts + versioning
├── title/             # Titres + score SEO
├── dashboard/         # Stats et quotas utilisateur
├── admin/             # Backoffice admin
├── export/            # Export TXT + PDF
├── ai/                # Abstraction Gemini + Groq
├── email/             # EmailService + templates Thymeleaf
├── exception/         # GlobalExceptionHandler
└── utils/             # Listeners (audit createdAt/updatedAt)
```

---

## ✅ Prérequis

- **Java 21+** — [Télécharger Temurin 21](https://adoptium.net)
- **Maven 3.8+**
- **PostgreSQL 15+**
- **Compte Gmail** (pour les emails)
- **Compte Google AI Studio** (clé Gemini gratuite)
- **Compte Groq** (clé gratuite)
- **Compte FedaPay** (paiements Mobile Money)

---

## 🚀 Installation

### 1. Cloner le repo

```bash
git clone https://github.com/ton-compte/armin-backend.git
cd armin-backend
```

### 2. Créer la base de données

```sql
CREATE DATABASE armin_db;
```

### 3. Insérer les rôles initiaux

```sql
INSERT INTO role (role_name, created_at, last_modified_date)
VALUES ('USER', NOW(), NOW());

INSERT INTO role (role_name, created_at, last_modified_date)
VALUES ('ADMIN', NOW(), NOW());
```

### 4. Configurer les propriétés

```bash
cp src/main/resources/application-dev.properties.example \
   src/main/resources/application-dev.properties
```

Puis remplis `application-dev.properties` avec tes valeurs.

### 5. Lancer l'application

```bash
./mvnw spring-boot:run
```

L'API démarre sur **http://localhost:8081** ✅

---

## ⚙️ Configuration

Crée `src/main/resources/application-dev.properties` depuis le template `.example` :

```properties
# SERVER
server.port=8081

# POSTGRESQL
spring.datasource.url=jdbc:postgresql://localhost:5432/armin_db
spring.datasource.username=VOTRE_USERNAME
spring.datasource.password=VOTRE_PASSWORD

# JWT
application.security.jwt.secret-key=VOTRE_CLE_256_BITS_HEX
application.security.jwt.expiration=1800000
application.security.jwt.refresh-token-expiration=604800000

# GMAIL
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=VOTRE_EMAIL@gmail.com
spring.mail.password=VOTRE_APP_PASSWORD

# IA (gratuits)
gemini.api.key=VOTRE_CLE_GEMINI
groq.api.key=VOTRE_CLE_GROQ

# FEDAPAY
fedapay.api.secret-key=sk_sandbox_VOTRE_CLE
fedapay.api.base-url=https://sandbox-api.fedapay.com
fedapay.callback-url=http://localhost:8081/api/webhooks/fedapay
```

### Obtenir les clés gratuites

| Service | Lien | Coût |
|---|---|---|
| Google Gemini | [aistudio.google.com](https://aistudio.google.com) | Gratuit |
| Groq | [console.groq.com](https://console.groq.com) | Gratuit |
| FedaPay | [fedapay.com](https://fedapay.com) | Sandbox gratuit |

---

## 📚 API Documentation

Une fois l'application lancée :

```
http://localhost:8081/swagger-ui/index.html
```

### Endpoints principaux

```
🔐 AUTH
POST   /api/auth/register          Inscription
POST   /api/auth/login             Connexion
GET    /api/auth/confirm           Confirmer le compte (OTP)
POST   /api/auth/forgot-password   Mot de passe oublié
POST   /api/auth/reset-password    Réinitialiser le mot de passe
POST   /api/auth/refresh-token     Renouveler l'access token
POST   /api/auth/logout            Déconnexion

📁 PROJECTS
POST   /api/projects               Créer un projet
GET    /api/projects               Mes projets
PUT    /api/projects/{id}          Modifier
DELETE /api/projects/{id}          Supprimer

💡 IDEAS
POST   /api/ideas/generate         Générer des idées IA
GET    /api/ideas/project/{id}     Idées d'un projet

📝 SCRIPTS
POST   /api/scripts/generate       Générer un script IA
POST   /api/scripts/improve        Améliorer un script
GET    /api/scripts/project/{id}   Scripts d'un projet

🎯 TITLES
POST   /api/titles/generate        Générer des titres IA
GET    /api/titles/project/{id}    Titres d'un projet

📊 DASHBOARD
GET    /api/dashboard              Stats et quotas

💳 SUBSCRIPTIONS
POST   /api/subscriptions/upgrade  Passer au plan Pro/Business
GET    /api/subscriptions/current  Mon abonnement

📤 EXPORT
GET    /api/export/scripts/{id}/txt   Export TXT (tous plans)
GET    /api/export/scripts/{id}/pdf   Export PDF (Pro/Business)

👑 ADMIN
GET    /api/admin/stats            Statistiques globales
GET    /api/admin/users            Liste des utilisateurs
PATCH  /api/admin/users/{id}/lock  Suspendre un compte
```

---

## 🧪 Tests

```bash
# Lancer tous les tests
./mvnw test

# Avec rapport de couverture
./mvnw test jacoco:report
```

---

## 🐳 Déploiement

```bash
# Build
./mvnw clean package -DskipTests

# Docker
docker build -t armin-backend .
docker run -p 8081:8081 armin-backend
```

---

## 🌿 Branches Git

```
main      → Production stable
develop   → Intégration (branche principale de travail)
feature/* → Nouvelles fonctionnalités
fix/*     → Corrections de bugs
```

### Convention de commits

```
feat(module): description     → Nouvelle fonctionnalité
fix(module): description      → Correction de bug
chore(module): description    → Configuration, maintenance
refactor(module): description → Refactoring
docs(module): description     → Documentation
test(module): description     → Tests
```

---

## 👥 Équipe

| Rôle | Responsabilité |
|---|---|
| Product Owner | Vision produit, validation |
| Lead Backend | Architecture Spring Boot, API REST |
| Frontend Dev | Interface React/Angular |
| DevOps | CI/CD, déploiement, monitoring |

---

## 📄 Licence

Confidentiel — Tous droits réservés © 2025 Armin

---

<div align="center">
Fait avec ❤️ au Togo 🇹🇬
</div>
=======
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
>>>>>>> develop
