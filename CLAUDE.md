# LinkedIn Formateur Toolbox - Guide Claude Code

## Aperçu du projet
Extension Chrome qui apparaît directement sur LinkedIn lorsque l'utilisateur sélectionne du texte dans un champ de saisie. Elle propose une toolbox flottante pour formater le texte sélectionné (gras, italique, souligné, barré) sans quitter le contexte de LinkedIn.

## Structure du projet
```
chrome-ext-linkedin-formater/
├── manifest.json              # Configuration Chrome Extension Manifest V3
├── content/                   # Scripts injectés sur LinkedIn
│   ├── content.js            # Script principal de détection et toolbox
│   ├── content.css           # Styles pour la toolbox
│   └── unicode-formatters.js # Fonctions de formatage Unicode
├── background/                # Scripts d'arrière-plan
│   └── background.js         # Script background minimal
├── assets/                    # Ressources statiques
│   ├── icons/                # Icônes de l'extension
│   └── styles/               # Styles globaux
├── build/                     # Fichiers de build et distribution
├── PRD.md                     # Document de référence complet
├── CLAUDE.md                  # Ce fichier
└── package.json              # Configuration npm
```

## Commandes principales
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

# Linting
npm run lint

# Type checking
npm run type-check
```

## Technologies utilisées
- **Frontend**: Vanilla JavaScript (ES6+) - Plus simple pour extensions Chrome
- **CSS Framework**: Tailwind CSS - Design cohérent avec LinkedIn
- **Extension Framework**: Chrome Extension Manifest V3
- **Build Tools**: Webpack ou Vite (à configurer)
- **Formatage**: Caractères Unicode spéciaux LinkedIn

## Conventions de code
- **Variables**: camelCase (ex: `toolboxContainer`, `selectedText`)
- **Fonctions**: Fonctions pures pour le formatage Unicode
- **Sélecteurs CSS**: Commentaires pour les sélecteurs complexes LinkedIn
- **Modules**: ES6+ avec import/export
- **Sécurité**: Aucune donnée utilisateur collectée

## Spécifications techniques importantes

### Formatage Unicode LinkedIn
- **Gras**: Caractères Unicode Mathematical Bold
- **Italique**: Caractères Unicode Mathematical Italic  
- **Souligné**: Caractères avec combining underline
- **Barré**: Caractères avec combining strikethrough

### Permissions Chrome requises
- **Active Tab**: Accès à l'onglet actif
- **Host Permissions**: `*://*.linkedin.com/*`
- **Content Scripts**: Injection sur LinkedIn uniquement

### Critères de performance
- Injection content script < 100ms
- Apparition toolbox < 50ms après sélection
- Empreinte mémoire < 10MB
- Pas d'impact sur les performances LinkedIn

## Phases de développement (Linear)

### Phase 1: Setup & Core Development (2-3 semaines)
- Configuration environnement de développement
- Création structure extension
- Implémentation détection sélection
- Création toolbox flottante

### Phase 2: Formatage & Integration (2-3 semaines)
- Implémentation fonctions formatage Unicode
- Intégration avec tous les champs LinkedIn
- Tests sur différents scénarios
- Gestion formatages combinés

### Phase 3: Polish & Deployment (1-2 semaines)
- Optimisation performances
- Design final et responsive
- Packaging pour Chrome Web Store
- Tests finaux et debugging

### Phase 4: Publication (1 semaine)
- Publication sur Chrome Web Store
- Création contenu marketing LinkedIn
- Monitoring initial post-lancement

## Priorités de développement
1. **Détection de sélection** - Détecter sélection texte sur LinkedIn
2. **Toolbox flottante** - Interface utilisateur avec 4 boutons
3. **Formatage Unicode** - Conversion vers caractères spéciaux LinkedIn
4. **Intégration complète** - Compatibilité tous champs LinkedIn
5. **Packaging et publication** - Chrome Web Store ready

## Champs LinkedIn supportés
- Création de nouveaux posts
- Champs de commentaires
- Messages privés
- Descriptions de profil
- Autres champs de saisie LinkedIn

## Références et documentation
- **PRD.md**: Document de référence complet et source de vérité
- **Linear**: Suivi des tâches organisées en 4 projets/phases
- **Chrome Extension Developer Guide**: Documentation officielle
- **LinkedIn DOM**: Structure à étudier pour l'intégration
- **Unicode Standards**: Pour les caractères de formatage

## Notes importantes pour Claude Code
- **Source de vérité**: PRD.md contient tous les détails techniques
- **Suivi projet**: Linear contient les tâches organisées par phases
- **Pas de données utilisateur**: Extension entièrement locale
- **Desktop uniquement**: Pas de support mobile
- **LinkedIn exclusif**: Fonctionne uniquement sur *.linkedin.com

## Débogage et tests
- Tester sur différents champs LinkedIn
- Vérifier compatibilité avec autres extensions
- Tester performance avec textes longs
- Valider formatage Unicode sur LinkedIn
- Tests d'accessibilité (navigation clavier, contraste)

## Déploiement
- Version .crx pour installation manuelle
- Package optimisé pour Chrome Web Store
- Compte développeur Chrome ($5)
- Screenshots et description marketing