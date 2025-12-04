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
  - **Tools :** liste paginée des outils.
  - **Analytics :** 3 sous-onglets : Cost, Usage, Insights.
- **environments :** Pour configurer l'API.
- **hooks :** Data fetching, mapping et tri des données.

## Design System Evolution

**Le design s'est construit et maintenu par :**

- **Variables CSS** pour les couleurs : --bg, --text, --card-bg, --border, etc.

- Un **dark/light** mode : toggle lune/soleil.

- **Inter** comme police par défaut (via Google Fonts) et Tailwind configuré.

- Des **badges dégradés** (Active/Expiring/Unused) et **pastilles KPI** de couleurs dégradées.

- Des **icônes Lucide** pour un design plus moderne.

## Navigation & User Journey

- **Flow actuel :** 
  - **Dashboard :**
    - Dropdown profil avec actions (Profile, Settings, Billing, Team et Logout).
    - KPIs
    - Table des outils récents

  - **Tools :**
    - Liste complète avec pagination
  - **Analytics :** 
    - Sous-onglet Cost avec charts
    - Sous-onglet Usage avec tableau des user adoption
    - Sous-onglet Insights avec les alertes d'optimisation des coûts
    
- **A faire :**
  - Activer la recherche

## Data Integration Strategy

- Endpoints utilisés :

  - /tools
  - /departments
  - /analytics
  - /user_tools

- **Stratégie Dashboard :**

  - Combinaison via forkJoin() pour récupérer simultanément :

    - Nombre total d’outils
    - Nombre de départements
    - Budget overview
    - Cost per user

- **Stratégie Tools :**

  - Récupération des données via /tools
  
  - Pagination via :
    - _page
    - _limit


- **Stratégie Analytics :**

  - **Cost Analytics :**
    - 3 graphiques intégrés (line, donut, horizontal bar)
    - Budget KPI

  - **Usage Analytics :**
    - Adoption calculée via user_tools et analytics.active_users

  - **Insights :**
    - Analyse simple (monthly_cost, trend, alert type, reason)

- **États :**

  - Intégrés sur toutes les pages :
    - loading state
    - error state
    - empty state
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
- Charts détruits et recrés uniquement quand nécessaire
- Limitation du nombre de KPIs recalculés

## Design Consistency Approach

- Utilisation de la **typograhie Inter** pour le texte.
- Espacement identiques sur toutes les cards
- Dégradés réutilisés pour : KPIs, badges et charts
- Icônes Lucide utilisées partout
- **Dégradés de couleur limités :** vert, violet, rouge et orange.

## Data Visualisation Philosophy

- Choix : **Chart.js**
- Line chart pour les variations mensuelles
- Donut chart pour une claire répartition visuelle
- Horizontal bar chart pour comparer les outils
- Utilisation de gradients pour garder un design constant

## Next Steps / Complete App Vision

- **Pour la page Tools :** 
  - Filtre par département
  - Recherche
  - CRUD complet
- **Page Analytics :** 
  - Charts supplémentaires
  - Sélecteur de période (30d, 90d, 1y)
  - Drill-down par département
- **Au global :**
  - Responsive à améliorer