# Project Requirements Document (PRD) Template

## 1. Project Overview

### Project Name
[Nom du projet]

### Project Description
[Description courte et claire du projet en 2-3 phrases]

### Project Goals
- [Objectif principal]
- [Objectif secondaire]
- [Objectif tertiaire]

### Target Audience
[Qui sont les utilisateurs cibles?]

### Success Metrics
- [Métrique de succès 1]
- [Métrique de succès 2]
- [Métrique de succès 3]

## 2. Functional Requirements

### Core Features
#### Feature 1: [Nom de la fonctionnalité]
- **Description**: [Description détaillée]
- **User Story**: En tant que [utilisateur], je veux [action] afin de [bénéfice]
- **Acceptance Criteria**:
  - [ ] Critère 1
  - [ ] Critère 2
  - [ ] Critère 3

#### Feature 2: [Nom de la fonctionnalité]
- **Description**: [Description détaillée]
- **User Story**: En tant que [utilisateur], je veux [action] afin de [bénéfice]
- **Acceptance Criteria**:
  - [ ] Critère 1
  - [ ] Critère 2
  - [ ] Critère 3

### Nice-to-Have Features
- [Fonctionnalité optionnelle 1]
- [Fonctionnalité optionnelle 2]
- [Fonctionnalité optionnelle 3]

## 3. Technical Requirements

### Technology Stack
- **Frontend**: [Framework/Library (ex: React, Vue, Vanilla JS)]
- **Backend**: [Framework/Language (ex: Node.js, Python, etc.)]
- **Database**: [Type de base de données (ex: MongoDB, PostgreSQL, etc.)]
- **Authentication**: [Méthode d'authentification]
- **Hosting/Deployment**: [Plateforme de déploiement]

### Browser/Platform Support
- [ ] Chrome (minimum version: )
- [ ] Firefox (minimum version: )
- [ ] Safari (minimum version: )
- [ ] Edge (minimum version: )
- [ ] Mobile responsive
- [ ] Desktop application
- [ ] Other: [spécifier]

### Integration Requirements
- [ ] API externe 1: [nom et description]
- [ ] API externe 2: [nom et description]
- [ ] Service tiers: [nom et description]

## 4. Architecture & Design

### System Architecture
[Description de l'architecture système ou diagramme]

### Database Schema
[Structure des données principales]

### API Design
- **Endpoints nécessaires**:
  - `GET /api/[endpoint]` - [description]
  - `POST /api/[endpoint]` - [description]
  - `PUT /api/[endpoint]` - [description]
  - `DELETE /api/[endpoint]` - [description]

### File Structure
```
project-root/
├── src/
│   ├── components/
│   ├── pages/
│   ├── utils/
│   ├── api/
│   └── styles/
├── public/
├── tests/
├── docs/
└── [autres dossiers]
```

## 5. User Experience (UX)

### User Flow
1. [Étape 1 de l'utilisateur]
2. [Étape 2 de l'utilisateur]
3. [Étape 3 de l'utilisateur]

### UI Requirements
- **Design System**: [Utiliser un design system existant ou créer le nôtre]
- **Color Palette**: [Couleurs principales]
- **Typography**: [Police et tailles]
- **Responsive Design**: [Breakpoints principaux]

### Accessibility
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] High contrast mode

## 6. Security Requirements

### Authentication & Authorization
- [Méthode d'authentification]
- [Niveaux d'autorisation]

### Data Security
- [ ] Data encryption in transit
- [ ] Data encryption at rest
- [ ] Input validation
- [ ] XSS protection
- [ ] CSRF protection

### Privacy
- [ ] GDPR compliance
- [ ] Data retention policy
- [ ] Cookie policy

## 7. Performance Requirements

### Load Time
- [ ] Initial page load < [X] seconds
- [ ] Subsequent page loads < [X] seconds

### Scalability
- [ ] Support for [X] concurrent users
- [ ] Database optimization
- [ ] Caching strategy

### Browser Performance
- [ ] Memory usage optimization
- [ ] CPU usage optimization
- [ ] Network requests optimization

## 8. Testing Strategy

### Testing Types
- [ ] Unit Tests (coverage > 80%)
- [ ] Integration Tests
- [ ] End-to-End Tests
- [ ] Performance Tests
- [ ] Security Tests

### Testing Tools
- **Unit Testing**: [Framework (ex: Jest, Mocha)]
- **E2E Testing**: [Framework (ex: Cypress, Playwright)]
- **Performance Testing**: [Outil (ex: Lighthouse, WebPageTest)]

## 9. Deployment & DevOps

### Development Environment
- [ ] Local development setup
- [ ] Development database
- [ ] Environment variables

### CI/CD Pipeline
- [ ] Automated testing
- [ ] Code quality checks
- [ ] Automated deployment
- [ ] Rollback strategy

### Monitoring
- [ ] Error tracking
- [ ] Performance monitoring
- [ ] User analytics
- [ ] Logging strategy

## 10. Documentation Requirements

### Code Documentation
- [ ] README.md avec instructions d'installation
- [ ] API documentation
- [ ] Code comments
- [ ] Architecture documentation

### User Documentation
- [ ] User manual
- [ ] FAQ
- [ ] Troubleshooting guide

## 11. Timeline & Milestones

### Phase 1: Planning & Setup (Duration: [X] weeks)
- [ ] Project setup
- [ ] Technology selection
- [ ] Architecture design
- [ ] UI/UX mockups

### Phase 2: Core Development (Duration: [X] weeks)
- [ ] Core feature 1
- [ ] Core feature 2
- [ ] Core feature 3
- [ ] Basic testing

### Phase 3: Integration & Testing (Duration: [X] weeks)
- [ ] Feature integration
- [ ] Comprehensive testing
- [ ] Security testing
- [ ] Performance optimization

### Phase 4: Deployment & Launch (Duration: [X] weeks)
- [ ] Production deployment
- [ ] User acceptance testing
- [ ] Documentation finalization
- [ ] Launch preparation

## 12. Constraints & Assumptions

### Technical Constraints
- [Contrainte technique 1]
- [Contrainte technique 2]
- [Contrainte technique 3]

### Business Constraints
- [Contrainte business 1]
- [Contrainte business 2]
- [Contrainte business 3]

### Assumptions
- [Assumption 1]
- [Assumption 2]
- [Assumption 3]

## 13. Risks & Mitigation

### Technical Risks
- **Risk**: [Description du risque]
  - **Impact**: [High/Medium/Low]
  - **Probability**: [High/Medium/Low]
  - **Mitigation**: [Stratégie de mitigation]

### Business Risks
- **Risk**: [Description du risque]
  - **Impact**: [High/Medium/Low]
  - **Probability**: [High/Medium/Low]
  - **Mitigation**: [Stratégie de mitigation]

## 14. Resources & Dependencies

### Team Resources
- [Rôle 1]: [Nombre de personnes]
- [Rôle 2]: [Nombre de personnes]
- [Rôle 3]: [Nombre de personnes]

### External Dependencies
- [Dépendance externe 1]
- [Dépendance externe 2]
- [Dépendance externe 3]

### Budget Considerations
- [Coût 1]: [Montant]
- [Coût 2]: [Montant]
- [Coût 3]: [Montant]

## 15. Maintenance & Support

### Post-Launch Support
- [ ] Bug fixes
- [ ] Feature updates
- [ ] Performance monitoring
- [ ] User support

### Long-term Maintenance
- [ ] Regular security updates
- [ ] Technology stack updates
- [ ] Feature enhancements
- [ ] Scaling considerations

---

## Instructions pour Claude Code

### Commands à exécuter
```bash
# Installation
npm install

# Développement
npm run dev

# Tests
npm run test

# Build
npm run build

# Lint
npm run lint

# Type checking
npm run type-check
```

### Conventions de code
- [Convention 1]
- [Convention 2]
- [Convention 3]

### Structure des commits
- feat: nouvelle fonctionnalité
- fix: correction de bug
- docs: documentation
- style: formatage
- refactor: refactoring
- test: ajout de tests
- chore: maintenance

### Priorités de développement
1. [Priorité 1]
2. [Priorité 2]
3. [Priorité 3]