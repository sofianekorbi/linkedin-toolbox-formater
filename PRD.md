# Project Requirements Document (PRD)

## 1. Project Overview

### Project Name
**LinkedIn Formateur Toolbox**

### Project Description
Une extension Chrome qui apparaît directement sur LinkedIn lorsque l'utilisateur sélectionne du texte dans un champ de saisie. Elle propose une toolbox flottante pour formater le texte sélectionné (gras, italique, souligné, barré) sans quitter le contexte de LinkedIn.

### Project Goals
- Permettre un formatage rapide et intuitif du texte directement sur LinkedIn
- Éviter aux utilisateurs de sortir du contexte LinkedIn pour formater leur contenu
- Améliorer l'expérience de création de contenu sur LinkedIn

### Target Audience
Utilisateurs de LinkedIn qui créent du contenu régulièrement (posts, commentaires) et souhaitent formater leur texte de manière efficace.

### Success Metrics
- Adoption intuitive de l'outil (pas de tutoriel nécessaire)
- Simplicité et efficacité d'utilisation
- Outil simple, efficace et bien fait

## 2. Functional Requirements

### Core Features
#### Feature 1: Détection de sélection de texte
- **Description**: Détecter automatiquement quand l'utilisateur sélectionne du texte dans un champ de saisie LinkedIn
- **User Story**: En tant qu'utilisateur LinkedIn, je veux pouvoir sélectionner du texte dans n'importe quel champ de saisie afin que la toolbox apparaisse automatiquement
- **Acceptance Criteria**:
  - [ ] La toolbox apparaît uniquement lors de la sélection de texte dans les champs de saisie LinkedIn
  - [ ] La toolbox ne perturbe pas l'expérience utilisateur normale
  - [ ] La détection fonctionne sur tous les types de champs de saisie LinkedIn

#### Feature 2: Toolbox de formatage flottante
- **Description**: Afficher une toolbox flottante au-dessus du texte sélectionné avec les options de formatage
- **User Story**: En tant qu'utilisateur, je veux voir une toolbox flottante au-dessus de mon texte sélectionné afin de pouvoir rapidement choisir un formatage
- **Acceptance Criteria**:
  - [ ] La toolbox apparaît au-dessus du texte sélectionné
  - [ ] La toolbox contient 4 boutons : Gras, Italique, Souligné, Barré
  - [ ] La toolbox se ferme automatiquement après sélection d'un formatage
  - [ ] La toolbox a un design propre et non intrusif

#### Feature 3: Formatage avec caractères Unicode
- **Description**: Appliquer le formatage en utilisant les caractères Unicode spéciaux de LinkedIn
- **User Story**: En tant qu'utilisateur, je veux que mon texte soit formaté avec les bons caractères Unicode afin qu'il s'affiche correctement sur LinkedIn
- **Acceptance Criteria**:
  - [ ] **Gras**: Conversion en caractères Unicode Mathematical Bold
  - [ ] *Italique*: Conversion en caractères Unicode Mathematical Italic
  - [ ] Souligné: Ajout de combining underline
  - [ ] Barré: Ajout de combining strikethrough
  - [ ] Le texte formaté reste dans le champ de saisie LinkedIn
  - [ ] Possibilité de combiner plusieurs formatages (ex: gras + italique)

#### Feature 4: Reconnaissance du formatage existant
- **Description**: Détecter et afficher le formatage existant quand l'utilisateur sélectionne du texte déjà formaté
- **User Story**: En tant qu'utilisateur, je veux voir quel formatage est déjà appliqué à mon texte sélectionné afin de pouvoir le modifier si nécessaire
- **Acceptance Criteria**:
  - [ ] La toolbox indique visuellement les formatages déjà appliqués
  - [ ] Possibilité d'ajouter des formatages supplémentaires au texte déjà formaté
  - [ ] Gestion correcte des formatages combinés

### Nice-to-Have Features
- Ajout d'autres formatages (listes, liens, etc.) dans une version future
- Personnalisation de la position de la toolbox
- Raccourcis clavier pour les formatages

## 3. Technical Requirements

### Technology Stack
- **Frontend**: Vanilla JavaScript (plus simple pour les extensions Chrome)
- **CSS Framework**: Tailwind CSS
- **Extension Framework**: Chrome Extension Manifest V3
- **Build Tools**: Webpack ou Vite (pour le packaging)

### Browser/Platform Support
- [x] Chrome (minimum version: 88 - Manifest V3)
- [ ] Firefox (non requis pour cette version)
- [ ] Safari (non requis pour cette version)
- [ ] Edge (non requis pour cette version)
- [ ] Mobile (non requis - extension Chrome desktop uniquement)

### Integration Requirements
- [x] Intégration exclusive avec LinkedIn (*.linkedin.com)
- [ ] Aucune API externe requise
- [ ] Aucun service tiers requis

## 4. Architecture & Design

### System Architecture
```
Extension Chrome (Manifest V3)
├── Content Script (injecté sur LinkedIn)
│   ├── Détection de sélection de texte
│   ├── Création de la toolbox flottante
│   └── Application du formatage Unicode
├── Background Script (minimal)
└── Assets (CSS, icons)
```

### Chrome Extension Structure
```
chrome-ext-linkedin-formater/
├── manifest.json
├── content/
│   ├── content.js
│   ├── content.css
│   └── unicode-formatters.js
├── background/
│   └── background.js
├── assets/
│   ├── icons/
│   └── styles/
├── popup/ (optionnel)
└── build/
```

### API Design
Pas d'API externe - Interaction directe avec le DOM de LinkedIn via Content Scripts.

## 5. User Experience (UX)

### User Flow
1. L'utilisateur navigue sur LinkedIn
2. L'utilisateur clique dans un champ de saisie (post, commentaire, etc.)
3. L'utilisateur sélectionne du texte
4. La toolbox apparaît automatiquement au-dessus du texte sélectionné
5. L'utilisateur clique sur le formatage souhaité
6. Le texte est formaté avec les caractères Unicode appropriés
7. La toolbox se ferme automatiquement
8. Le texte reste dans le champ de saisie LinkedIn

### UI Requirements
- **Design System**: Design minimaliste et non intrusif
- **Color Palette**: Couleurs neutres compatibles avec l'interface LinkedIn
- **Typography**: Police cohérente avec LinkedIn
- **Responsive Design**: Optimisé pour desktop uniquement

### Accessibility
- [ ] Boutons accessibles au clavier
- [ ] Contraste suffisant pour la visibilité
- [ ] Tooltips descriptifs sur les boutons de formatage

## 6. Security Requirements

### Chrome Extension Permissions
- **Active Tab**: Accès à l'onglet actif
- **Host Permissions**: `*://*.linkedin.com/*`
- **Content Scripts**: Injection sur LinkedIn uniquement

### Data Security
- [ ] Aucune donnée utilisateur collectée
- [ ] Aucune donnée transmise à des serveurs externes
- [ ] Fonctionnement entièrement local

### Privacy
- [ ] Pas de tracking utilisateur
- [ ] Pas de collecte de données
- [ ] Pas de cookies ou stockage persistant

## 7. Performance Requirements

### Load Time
- [ ] Injection du content script < 100ms
- [ ] Apparition de la toolbox < 50ms après sélection

### Memory Usage
- [ ] Empreinte mémoire minimale
- [ ] Nettoyage automatique des event listeners

### LinkedIn Performance
- [ ] Aucun impact sur les performances de LinkedIn
- [ ] Pas d'interférence avec les fonctionnalités LinkedIn

## 8. Testing Strategy

### Testing Types
- [ ] Tests unitaires pour les fonctions de formatage Unicode
- [ ] Tests d'intégration avec différents champs LinkedIn
- [ ] Tests manuels sur différentes versions de LinkedIn
- [ ] Tests de compatibilité Chrome

### Testing Scenarios
- Sélection de texte dans différents champs LinkedIn
- Formatage de texte de différentes longueurs
- Combinaison de formatages
- Reconnaissance de formatage existant
- Comportement avec du texte déjà formaté

## 9. Deployment & DevOps

### Development Environment
- [ ] Configuration locale pour le développement d'extension
- [ ] Hot reload pour le développement
- [ ] Build process pour la production

### Packaging
- [ ] Version packagée pour installation manuelle (.crx)
- [ ] Package optimisé pour Chrome Web Store
- [ ] Minification et optimisation des assets

### Chrome Web Store
- [ ] Publication sur Chrome Web Store
- [ ] Description et screenshots appropriés
- [ ] Politique de confidentialité (même basique)

## 10. Documentation Requirements

### Code Documentation
- [ ] README.md avec instructions d'installation et développement
- [ ] Documentation des fonctions de formatage Unicode
- [ ] Instructions de build et packaging

### User Documentation
- [ ] Instructions d'utilisation simples
- [ ] Pas de tutoriel complexe (utilisation intuitive)

## 11. Timeline & Milestones

### Phase 1: Setup & Core Development 
- [ ] Configuration de l'environnement de développement
- [ ] Création de la structure de l'extension
- [ ] Implémentation de la détection de sélection
- [ ] Création de la toolbox flottante

### Phase 2: Formatage & Integration
- [ ] Implémentation des fonctions de formatage Unicode
- [ ] Intégration avec tous les champs LinkedIn
- [ ] Tests sur différents scénarios
- [ ] Gestion des formatages combinés

### Phase 3: Polish & Deployment
- [ ] Optimisation des performances
- [ ] Design final et responsive
- [ ] Packaging pour Chrome Web Store
- [ ] Tests finaux et debugging

### Phase 4: Publication
- [ ] Publication sur Chrome Web Store
- [ ] Monitoring initial post-lancement

## 12. Constraints & Assumptions

### Technical Constraints
- Extension limitée à Chrome desktop
- Fonctionne uniquement sur LinkedIn
- Dépendant de la structure DOM de LinkedIn

### Business Constraints
- Pas de monétisation prévue
- Maintenance personnelle
- Pas de support client complexe

### Assumptions
- LinkedIn ne changera pas drastiquement son interface
- Les caractères Unicode resteront compatibles
- Chrome maintiendra la compatibilité Manifest V3

## 13. Risks & Mitigation

### Technical Risks
- **Risk**: LinkedIn change son interface/structure DOM
  - **Impact**: High
  - **Probability**: Medium
  - **Mitigation**: Code modulaire et sélecteurs CSS robustes

- **Risk**: Chrome change les politiques d'extension
  - **Impact**: Medium
  - **Probability**: Low
  - **Mitigation**: Suivre les mises à jour Chrome et adapter

### Business Risks
- **Risk**: Concurrence avec d'autres extensions
  - **Impact**: Medium
  - **Probability**: Medium
  - **Mitigation**: Focus sur l'expérience utilisateur et la simplicité

## 14. Resources & Dependencies

### Team Resources
- Développeur principal: 1 personne
- Design: intégré au développement
- Testing: manuel par le développeur

### External Dependencies
- Chrome Extension APIs
- LinkedIn DOM structure
- Tailwind CSS
- Unicode character standards

### Budget Considerations
- Développement: temps personnel
- Chrome Web Store: frais de développeur unique ($5)
- Hébergement: non requis

## 15. Maintenance & Support

### Post-Launch Support
- [ ] Monitoring des reviews Chrome Web Store
- [ ] Correction des bugs reportés
- [ ] Adaptations aux mises à jour LinkedIn

### Long-term Maintenance
- [ ] Mises à jour de sécurité Chrome
- [ ] Évolution des standards Unicode
- [ ] Nouvelles fonctionnalités selon les retours utilisateurs

---

## Instructions pour Claude Code

### Commands à exécuter
```bash
# Installation des dépendances
npm install

# Développement avec hot reload
npm run dev

# Build pour production
npm run build

# Package pour Chrome Web Store
npm run package

# Tests
npm run test
```

### Conventions de code
- Utiliser ES6+ avec modules
- Noms de variables en camelCase
- Fonctions pures pour le formatage Unicode
- Commentaires pour les sélecteurs CSS complexes

### Structure des commits
- feat: nouvelle fonctionnalité
- fix: correction de bug
- style: formatage et UI
- refactor: refactoring du code
- docs: documentation
- test: ajout de tests
- build: changements de build

### Priorités de développement
1. Détection de sélection de texte sur LinkedIn
2. Création de la toolbox flottante
3. Implémentation du formatage Unicode
4. Intégration et tests sur LinkedIn
5. Packaging et publication Chrome Web Store