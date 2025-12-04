# Internal Tools Management Dashboard

## Quick Start

### 1. Installer
- npm i

### 2. Configurer l’API
- src/environments/environment.ts : indique l'URL de la base API.

### 3. Lancer
- ng serve

## Architecture

Répartition dans les dossiers :
- **components :** Header avec logo, nav, recherche, actions et dropdown du profil.
- **pages :** 
  - **Dashboard :** KPI cards et la table Recent Tools. 
  - **Tools :** placeholder à compléter.
  - **Analytics :** placeholder à compléter.
- **environments :** Pour configurer l'API.
- **hooks :** Data fetching, mapping et tri des données sur les tools.

## Design System Evolution

**Le design s'est construit et maintenu par :**

- **Variables CSS** pour les couleurs : --bg, --text, --card-bg, --border, etc.

- Un **dark/light** mode : toggle lune/soleil.

- **Inter** comme police par défaut (via Google Fonts) et Tailwind configuré.

- Des **badges dégradés** (Active/Expiring/Unused) et **pastilles KPI** de couleurs dégradées.

- Des **icônes Lucide** pour un design plus moderne.

## Navigation & User Journey

**Flow actuel :**
- Header fixe -> Dashboard.
- Dropdown profil avec actions (Profile, Settings, Billing, Team et Logout).

**A faire :**
- Activer la recherche
- Définir les routes pour Tools et Analytics

## Data Integration Strategy

### Endpoints

- `GET /tools?_limit=10&_sort=updated_at&_order=desc` :
  - Affiche **les 10 derniers outils** mis à jour (pas de pagination pour l’instant).


- **GET /departments :** nombre de départements.

- **GET /analytics :** budget_overview, kpi_trends, cost_analytics.

### KPI (forkJoin)

On combine **tools.length**, **departments.length** et **analytics** pour créer les cartes KPIs:
- **Monthly Budget** (limit/current + trend)
- **Active Tools** (count + trend)
- **Departments** (count + trend)
- **Cost/User** (value + trend).

## Progressive Responsive Design

- Organisation du tableau des tools récents en 2 colonnes sur tablette et 4 colonnes sur desktop.

## Testing Strategy

Cette partie n'a pas été faites. Il faudrait ajouter notamment:
- Des **tests unitaires sur DashboardService** : sur le mapping des champs et le tri updated_at par ex.
- Tests sur changements de theme **clair/sombre**.
- Test de la **fonction euro()** (formats, null/undefined).

## Performance Optimizations

- Limitation à **10 items** pour la table des tools récents.
- **CSS variables** pour les changements de theme (empêche les recalculs lourds).

## Design Consistency Approach

- Utilisation de la **typograhie Inter** pour le texte.
- **Dégradés de couleur limités :** vert, violet, rouge et orange.

## Data Visualisation Philosophy

**A faire :**

- **1-2 graphiques** pour les coûts mensuels et users actifs.
- **Légendes et couleurs alignées** au design system.

## Next Steps / Complete App Vision

- **Pour la page Tools :** tris sur les colonnes, filtres (département, status).
- **Page Analytics :** Période sélectionnable, comparatifs selon les mois, possibilité d'export CSV.
- **Authentification simple** et implémentation de l'avatar dans le header.
- **Internationalisation** pour les formats des dates, des monnaies et possibilité de changer la langue du site (EN/FR).