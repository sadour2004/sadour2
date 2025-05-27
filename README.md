# APPMOBILE

## Prérequis
- Node.js (v16+ recommandé)
- PostgreSQL

## 1. Installation de la base de données

1. Crée une base de données PostgreSQL nommée `appmobile`.
2. Exécute le script SQL suivant pour créer les tables et insérer les données de base :

```sql
-- Voir le fichier appmobile.sql fourni dans ce projet
```

## 2. Backend

```bash
cd backend
npm install
cp .env.example .env # puis configure la connexion à ta base de données
npm start
```

## 3. Frontend

```bash
cd frontend
npm install
npm start
```

## 4. Connexion
- Par défaut, crée un utilisateur dans la table `users` (voir backend/controllers/authController.js pour le hash du mot de passe).

---

## Structure du projet
- `/backend` : API Express (Node.js)
- `/frontend` : Application React
- `appmobile.sql` : Script d'initialisation de la base de données 