# Mosala.io — Frontend

> 🌿 La plateforme freelance de la nouvelle génération en Afrique centrale.

## 📌 Description

**Mosala.io** est une plateforme de mise en relation entre freelances et clients basée en République Démocratique du Congo. Elle permet aux talents congolais de proposer leurs services et aux entreprises/particuliers de trouver les meilleurs prestataires locaux.

## 🚀 Stack technique

- **Frontend** : HTML statique + [Alpine.js](https://alpinejs.dev/) + [Tailwind CSS](https://tailwindcss.com/)
- **Backend** : FastAPI (Python) → repo [kazigreen-api](https://github.com/kazigreen/kazigreen-api)
- **Base de données** : PostgreSQL
- **Hébergement** : VPS DigitalOcean (London) + Nginx + Let's Encrypt (SSL)

## 📁 Structure

```
mosala-frontend/
├── index.html          # Application principale (SPA Alpine.js)
├── tabs/               # Onglets lazy-loaded
│   ├── dashboard.html
│   ├── marketplace.html
│   ├── messages.html
│   ├── wallet.html
│   ├── profil.html
│   ├── reviews.html
│   ├── settings.html
│   └── nouveau.html
├── mosala.css          # Styles custom
├── bundle.js           # JS bundlé
└── uploads/            # Fichiers uploadés (avatars, portfolios)
```

## ✨ Fonctionnalités

- 🔐 Authentification (téléphone/mot de passe + Google OAuth)
- 🏪 Marketplace de projets (USD + CDF)
- 💬 Messagerie temps réel (polling)
- 💰 Wallet & transactions
- 👤 Profil freelance complet (portfolio, avis, vérifications)
- 📊 Dashboard freelance (KPIs, revenus, projets actifs)
- 🔔 Notifications en temps réel

## 🌍 Liens

- 🔗 Site live : [mosala.io](https://mosala.io)
- 🔧 Backend API : [kazigreen/kazigreen-api](https://github.com/kazigreen/kazigreen-api)

## 👨‍💻 Développement

Ce projet est développé et maintenu par l'équipe Mosala.

---

*Mosala — Travail en lingala* 🇨🇩
