# Documentation du Projet de Gestion de Tâches et de Projets

## 1. Objectif Principal du Projet

L'objectif principal de ce projet est de créer une application web de gestion de tâches et de projets. Cette application permet aux utilisateurs de créer des comptes, de se connecter, de gérer des projets, d'assigner et de suivre des tâches, ainsi que de visualiser un calendrier des projets.

## 2. Structure du Projet

Le projet est structuré comme suit :

- `App.tsx`: Composant principal qui gère le routage de l'application.
- `auth/`
  - `firebase.tsx`: Configuration de Firebase pour l'authentification et la base de données.
  - `Login.tsx`: Composant de connexion.
  - `Sigin.tsx`: Composant d'inscription.
- `components/`
  - `ListProjects.tsx`: Composant pour afficher et gérer la liste des projets.
  - `ListTasks.tsx`: Composant pour afficher et gérer les tâches d'un projet.
  - `Calendar.tsx`: Composant pour afficher le calendrier des projets.
  - `UserSelector.tsx`: Composant pour sélectionner un utilisateur.
- `layout/`
  - `Navbar.tsx`: Composant de la barre de navigation.

## 3. Technologies et Librairies Utilisées

- React : Bibliothèque JavaScript pour la construction de l'interface utilisateur.
- TypeScript : Superset typé de JavaScript.
- Firebase : Plateforme de développement d'applications web pour l'authentification et la base de données.
- React Router : Pour la gestion du routage dans l'application.
- Tailwind CSS : Framework CSS pour le style de l'application.
- date-fns : Bibliothèque pour la manipulation des dates.
- Headless UI : Composants UI accessibles et sans style.
- Heroicons : Ensemble d'icônes SVG.
- @dnd-kit : Bibliothèque pour la fonctionnalité de drag-and-drop.

## 4. Description Détaillée des Composants

### App.tsx

**Rôle** : Composant racine de l'application qui gère le routage.

**Fonctions principales** : 
- Définit les routes de l'application. 
- Gère l'affichage conditionnel de la barre de navigation.

**Dépendances** : React Router, Navbar, Login, Sigin, ListProjects, Calendar.

### firebase.tsx

**Rôle** : Configure Firebase pour l'authentification et la base de données.

**Fonctions principales** : 
- Initialise l'application Firebase. 
- Exporte les instances de Firestore et d'authentification.

**Dépendances** : Firebase.

### Login.tsx

**Rôle** : Gère le processus de connexion des utilisateurs.

**Fonctions principales** : 
- `handleLogin`: Gère la soumission du formulaire de connexion. 
- `handleForgotPassword`: Gère la réinitialisation du mot de passe.

**États** : 
- `email`, `password`: Stockent les informations de connexion. 
- `error`, `loading`, `notification`: Gèrent l'état de l'interface utilisateur.

**Dépendances** : Firebase Authentication, React Router.

### Sigin.tsx

**Rôle** : Gère le processus d'inscription des nouveaux utilisateurs.

**Fonctions principales** : 
- `handleSigin`: Gère la soumission du formulaire d'inscription.

**États** : 
- `email`, `password`, `passwordConfirm`: Stockent les informations d'inscription. 
- `error`, `success`: Gèrent les messages d'erreur et de succès.

**Dépendances** : Firebase Authentication, Firestore, React Router.

### ListProjects.tsx

**Rôle** : Affiche et gère la liste des projets.

**Fonctions principales** : 
- `recupererProjets`: Récupère la liste des projets depuis Firestore. 
- `supprimerProjet`: Supprime un projet. 
- `editerProjet`, `sauvegarderProjet`: Gèrent l'édition des projets. 
- `ajouterProjet`: Ajoute un nouveau projet. 
- `mettreAJourEtatProjet`: Met à jour l'état d'un projet.

**États** :  
- `projets`: Stocke la liste des projets.   
- `notification`, `projetEnEdition`, `nouveauProjet`, `projetEtendu`: Gèrent l'état de l'interface utilisateur.

**Dépendances** : Firestore, ListTasks.

### ListTasks.tsx

**Rôle** : Affiche et gère les tâches d'un projet spécifique.

**Fonctions principales** : 
- `recupererTaches`: Récupère les tâches d'un projet. 
- `ajouterTache`: Ajoute une nouvelle tâche. 
- `sauvegarderTache`: Sauvegarde les modifications d'une tâche. 
- `basculerEtatTache`: Change l'état d'une tâche. 
- `supprimerTache`: Supprime une tâche. 
- `assignerTache`: Assigne une tâche à un utilisateur. 
- `onDragEnd`: Gère le réordonnancement des tâches par drag-and-drop.

**États** : 
- `taches`: Stocke la liste des tâches. 
- `tacheEnEdition`, `nouvelleTache`, `isModalOpen`, `currentTaskId`: Gèrent l'état de l'interface utilisateur.

**Dépendances** : Firestore, @dnd-kit, Heroicons.

### Calendar.tsx

**Rôle** : Affiche un calendrier mensuel avec les projets.

**Fonctions principales** : 
- `fetchProjects`: Récupère les projets depuis Firestore. 
- `navigateMonth`, `goToToday`: Gèrent la navigation dans le calendrier. 
- `getProjectsForDate`: Récupère les projets pour une date spécifique.

**États** : 
- `currentDate`: Stocke la date actuellement affichée. 
- `projects`: Stocke la liste des projets.

**Dépendances** : date-fns, Firestore, Lucide React.

### Navbar.tsx

**Rôle** : Affiche la barre de navigation de l'application.

**Fonctions principales** : 
- `handleLogout`: Gère la déconnexion de l'utilisateur.

**Dépendances** : Headless UI, Heroicons, React Router.

### UserSelector.tsx

**Rôle** : Permet de sélectionner un utilisateur pour l'assignation de tâches.

**Fonctions principales** : 
- `fetchUsers`: Récupère la liste des utilisateurs depuis Firestore.

**États** : 
- `users`: Stocke la liste des utilisateurs.

**Dépendances** : Firestore.

## Manuel d'Utilisation en Production

1. **Inscription et Connexion** :
   - Accédez à la page d'accueil et cliquez sur "S'inscrire" pour créer un nouveau compte.
   - Utilisez vos identifiants pour vous connecter.

2. **Navigation** :
   - Utilisez la barre de navigation pour accéder aux différentes sections de l'application.

3. **Gestion des Projets** :
   - Dans la section "Projets", vous pouvez créer, éditer et supprimer des projets.
   - Cliquez sur "Créer un projet" pour ajouter un nouveau projet.
   - Utilisez les icônes d'édition et de suppression pour gérer les projets existants.

4. **Gestion des Tâches** :
   - Dans chaque projet, vous pouvez ajouter, éditer, supprimer et réorganiser les tâches.
   - Utilisez le formulaire en bas de la liste pour ajouter une nouvelle tâche.
   - Glissez-déposez les tâches pour les réorganiser.
   - Utilisez les icônes pour marquer une tâche comme terminée, l'éditer ou la supprimer.

5. **Assignation des Tâches** :
   - Cliquez sur "Assigner" pour attribuer une tâche à un utilisateur.
   - Utilisez le sélecteur d'utilisateur pour choisir la personne à qui assigner la tâche.

6. **Calendrier** :
   - Accédez à la section "Calendrier" pour voir une vue mensuelle des projets.
   - Utilisez les flèches pour naviguer entre les mois.
   - Cliquez sur "Aujourd'hui" pour revenir à la date actuelle.

7. **Déconnexion** :
   - Cliquez sur "Fermer Connexion" dans la barre de navigation pour vous déconnecter.

**Note** : Assurez-vous d'avoir une connexion Internet stable pour utiliser toutes les fonctionnalités de l'application, car elle dépend de Firebase pour l'authentification et le stockage des données.