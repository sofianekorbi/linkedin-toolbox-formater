# LinkedIn Formateur Toolbox

Extension Chrome qui permet de formater du texte directement sur LinkedIn avec une toolbox flottante. Sélectionnez du texte dans n'importe quel champ de saisie LinkedIn et formatez-le en gras, italique, souligné ou barré.

## Technologies

- **Frontend**: Vanilla JavaScript (ES6+)
- **CSS**: Tailwind CSS
- **Extension**: Chrome Extension Manifest V3
- **Build**: Vite

## Développement local

### Prérequis
- Node.js (version 16+)
- npm
- Google Chrome

### Installation

```bash
# Cloner le repository
git clone https://github.com/sofianekorbi/linkedin-toolbox-formater.git
cd linkedin-toolbox-formater

# Installer les dépendances
npm install

# Lancer le développement avec hot reload
npm run dev
```

### Charger l'extension dans Chrome

1. Ouvrir Chrome et aller sur `chrome://extensions/`
2. Activer le "Mode développeur" en haut à droite
3. Cliquer sur "Charger l'extension non empaquetée"
4. Sélectionner le dossier `dist/` du projet
5. L'extension est maintenant active sur LinkedIn

### Commandes disponibles

```bash
npm run dev          # Développement avec surveillance des fichiers
npm run build        # Build pour production
npm run package      # Package pour Chrome Web Store
npm run test         # Lancer les tests
npm run lint         # Vérification du code
```

## Contribution

Deux façons de contribuer au projet :

1. **Pull Request** : Fork le projet, apportez vos modifications et créez une pull request
2. **Recrutement** : Contactez-moi directement si vous souhaitez rejoindre l'équipe de développement

## License

MIT - Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Auteur

**Sofiane Korbi** - [@sofianekorbi](https://github.com/sofianekorbi)