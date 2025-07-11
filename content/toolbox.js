// LinkedIn Formateur Toolbox - Toolbox UI Component
// Interface utilisateur de la toolbox flottante

/**
 * Configuration de la toolbox
 */
const TOOLBOX_CONFIG = {
  // Dimensions
  width: 160,
  height: 40,
  buttonSize: 32,
  buttonSpacing: 4,
  
  // Positionnement
  offsetTop: 10,
  offsetBottom: 10,
  offsetSides: 10,
  
  // Animations
  animationDuration: 200,
  fadeOutDuration: 150,
  
  // Z-index
  zIndex: 10000,
  
  // Classes CSS
  cssPrefix: 'ltf-',
  
  // Boutons de formatage
  buttons: [
    {
      id: 'bold',
      label: 'B',
      tooltip: 'Gras',
      className: 'ltf-font-bold'
    },
    {
      id: 'italic',
      label: 'I',
      tooltip: 'Italique', 
      className: 'ltf-italic'
    },
    {
      id: 'underline',
      label: 'U',
      tooltip: 'Souligné',
      className: 'ltf-underline'
    },
    {
      id: 'strikethrough',
      label: 'S',
      tooltip: 'Barré',
      className: 'ltf-line-through'
    }
  ]
};

/**
 * Classe principale pour la toolbox flottante
 */
class ToolboxUI {
  constructor() {
    this.isVisible = false;
    this.toolboxElement = null;
    this.currentSelection = null;
    this.formatHandlers = new Map();
    this.isAnimating = false;
    
    // Bind methods
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handleButtonClick = this.handleButtonClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    
    // Initialisation
    this.init();
  }

  /**
   * Initialise la toolbox
   */
  init() {
    console.log('🎨 Initialisation de ToolboxUI...');
    
    // Créer l'élément toolbox
    this.createToolboxElement();
    
    // Ajouter les événements globaux
    document.addEventListener('click', this.handleDocumentClick, true);
    document.addEventListener('keydown', this.handleKeyDown, true);
    
    console.log('✅ ToolboxUI initialisé');
  }

  /**
   * Crée l'élément DOM de la toolbox
   */
  createToolboxElement() {
    // Supprimer l'ancienne toolbox si elle existe
    if (this.toolboxElement) {
      this.toolboxElement.remove();
    }

    // Créer le conteneur principal
    this.toolboxElement = document.createElement('div');
    this.toolboxElement.id = 'ltf-toolbox';
    this.toolboxElement.className = `
      ${TOOLBOX_CONFIG.cssPrefix}fixed
      ${TOOLBOX_CONFIG.cssPrefix}bg-toolbox-bg
      ${TOOLBOX_CONFIG.cssPrefix}border
      ${TOOLBOX_CONFIG.cssPrefix}border-toolbox-border
      ${TOOLBOX_CONFIG.cssPrefix}rounded-toolbox
      ${TOOLBOX_CONFIG.cssPrefix}shadow-toolbox
      ${TOOLBOX_CONFIG.cssPrefix}flex
      ${TOOLBOX_CONFIG.cssPrefix}items-center
      ${TOOLBOX_CONFIG.cssPrefix}gap-1
      ${TOOLBOX_CONFIG.cssPrefix}p-1
      ${TOOLBOX_CONFIG.cssPrefix}opacity-0
      ${TOOLBOX_CONFIG.cssPrefix}pointer-events-none
      ${TOOLBOX_CONFIG.cssPrefix}transition-all
      ${TOOLBOX_CONFIG.cssPrefix}duration-200
    `.trim().replace(/\s+/g, ' ');

    // Styles inline pour garantir le bon affichage
    this.toolboxElement.style.cssText = `
      position: fixed;
      z-index: ${TOOLBOX_CONFIG.zIndex};
      width: ${TOOLBOX_CONFIG.width}px;
      height: ${TOOLBOX_CONFIG.height}px;
      background: #ffffff;
      border: 1px solid #e1e5e9;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px;
      opacity: 0;
      pointer-events: none;
      transition: all 0.2s ease-out;
      transform: translateY(8px);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;

    // Créer les boutons
    this.createButtons();

    // Ajouter au DOM (mais invisible)
    document.body.appendChild(this.toolboxElement);
  }

  /**
   * Crée les boutons de formatage
   */
  createButtons() {
    TOOLBOX_CONFIG.buttons.forEach(buttonConfig => {
      const button = document.createElement('button');
      button.id = `ltf-btn-${buttonConfig.id}`;
      button.className = `ltf-toolbox-btn ltf-btn-${buttonConfig.id}`;
      button.setAttribute('data-format', buttonConfig.id);
      button.setAttribute('title', buttonConfig.tooltip);
      button.textContent = buttonConfig.label;

      // Styles inline pour les boutons
      button.style.cssText = `
        width: ${TOOLBOX_CONFIG.buttonSize}px;
        height: ${TOOLBOX_CONFIG.buttonSize}px;
        border: none;
        border-radius: 4px;
        background: transparent;
        color: #666666;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.1s ease;
        user-select: none;
        -webkit-user-select: none;
      `;

      // Ajouter les styles spécifiques au bouton
      if (buttonConfig.className) {
        if (buttonConfig.id === 'bold') {
          button.style.fontWeight = 'bold';
        } else if (buttonConfig.id === 'italic') {
          button.style.fontStyle = 'italic';
        } else if (buttonConfig.id === 'underline') {
          button.style.textDecoration = 'underline';
        } else if (buttonConfig.id === 'strikethrough') {
          button.style.textDecoration = 'line-through';
        }
      }

      // Événements hover
      button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = '#f3f2ef';
        button.style.color = '#0a66c2';
      });

      button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = 'transparent';
        button.style.color = '#666666';
      });

      // Événement clic
      button.addEventListener('click', this.handleButtonClick);

      this.toolboxElement.appendChild(button);
    });
  }

  /**
   * Affiche la toolbox à la position du texte sélectionné
   */
  show(selectionData) {
    if (this.isAnimating) return;

    this.currentSelection = selectionData;
    this.isVisible = true;

    console.log('🎨 Affichage de la toolbox pour:', {
      text: selectionData.text.substring(0, 30) + '...',
      field: selectionData.fieldInfo.tagName
    });

    // Calculer la position
    const position = this.calculatePosition(selectionData);
    
    // Positionner la toolbox
    this.toolboxElement.style.left = position.x + 'px';
    this.toolboxElement.style.top = position.y + 'px';

    // Afficher avec animation
    this.animateShow();
  }

  /**
   * Calcule la position optimale pour la toolbox
   */
  calculatePosition(selectionData) {
    const range = selectionData.range;
    const rect = range.getBoundingClientRect();
    
    // Position par défaut : au-dessus du texte sélectionné
    let x = rect.left + (rect.width / 2) - (TOOLBOX_CONFIG.width / 2);
    let y = rect.top - TOOLBOX_CONFIG.height - TOOLBOX_CONFIG.offsetTop;

    // Ajustements pour les débordements
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Ajustement horizontal
    if (x < TOOLBOX_CONFIG.offsetSides) {
      x = TOOLBOX_CONFIG.offsetSides;
    } else if (x + TOOLBOX_CONFIG.width > viewport.width - TOOLBOX_CONFIG.offsetSides) {
      x = viewport.width - TOOLBOX_CONFIG.width - TOOLBOX_CONFIG.offsetSides;
    }

    // Ajustement vertical - si pas assez de place en haut, mettre en bas
    if (y < TOOLBOX_CONFIG.offsetTop) {
      y = rect.bottom + TOOLBOX_CONFIG.offsetBottom;
    }

    // Vérifier que la toolbox reste dans le viewport
    if (y + TOOLBOX_CONFIG.height > viewport.height - TOOLBOX_CONFIG.offsetBottom) {
      y = viewport.height - TOOLBOX_CONFIG.height - TOOLBOX_CONFIG.offsetBottom;
    }

    return { x, y };
  }

  /**
   * Animation d'apparition
   */
  animateShow() {
    this.isAnimating = true;
    
    // Activer les interactions
    this.toolboxElement.style.pointerEvents = 'auto';
    
    // Animation slide-up + fade-in
    this.toolboxElement.style.opacity = '1';
    this.toolboxElement.style.transform = 'translateY(0)';

    // Fin de l'animation
    setTimeout(() => {
      this.isAnimating = false;
    }, TOOLBOX_CONFIG.animationDuration);
  }

  /**
   * Masque la toolbox
   */
  hide() {
    if (!this.isVisible || this.isAnimating) return;

    this.isVisible = false;
    this.isAnimating = true;

    console.log('🎨 Masquage de la toolbox');

    // Animation fade-out
    this.toolboxElement.style.opacity = '0';
    this.toolboxElement.style.transform = 'translateY(8px)';
    this.toolboxElement.style.pointerEvents = 'none';

    // Nettoyage après animation
    setTimeout(() => {
      this.currentSelection = null;
      this.isAnimating = false;
    }, TOOLBOX_CONFIG.fadeOutDuration);
  }

  /**
   * Gère les clics sur les boutons
   */
  handleButtonClick(event) {
    event.preventDefault();
    event.stopPropagation();

    const button = event.currentTarget;
    const formatType = button.getAttribute('data-format');

    console.log('🎨 Clic sur bouton:', formatType);

    // Ajouter effet visuel de clic
    button.style.backgroundColor = '#e1e5e9';
    setTimeout(() => {
      button.style.backgroundColor = 'transparent';
    }, 100);

    // Déclencher le formatage
    this.triggerFormatting(formatType);

    // Masquer la toolbox
    this.hide();
  }

  /**
   * Déclenche le formatage du texte
   */
  triggerFormatting(formatType) {
    if (!this.currentSelection) return;

    console.log('🎨 Déclenchement formatage:', formatType);

    // Notifier les handlers enregistrés
    if (this.formatHandlers.has(formatType)) {
      const handler = this.formatHandlers.get(formatType);
      try {
        handler(this.currentSelection, formatType);
      } catch (error) {
        console.error('❌ Erreur dans le handler de formatage:', error);
      }
    } else {
      console.log('🔨 Handler de formatage non trouvé pour:', formatType);
      // TODO: Implémenter dans LIN-18
    }
  }

  /**
   * Enregistre un handler pour un type de formatage
   */
  addFormatHandler(formatType, handler) {
    this.formatHandlers.set(formatType, handler);
  }

  /**
   * Supprime un handler de formatage
   */
  removeFormatHandler(formatType) {
    this.formatHandlers.delete(formatType);
  }

  /**
   * Gère les clics sur le document (pour fermer la toolbox)
   */
  handleDocumentClick(event) {
    if (!this.isVisible) return;

    // Si le clic est sur la toolbox, ne pas fermer
    if (this.toolboxElement.contains(event.target)) {
      return;
    }

    // Fermer la toolbox
    this.hide();
  }

  /**
   * Gère les raccourcis clavier
   */
  handleKeyDown(event) {
    if (!this.isVisible) return;

    // Échapper pour fermer
    if (event.key === 'Escape') {
      event.preventDefault();
      this.hide();
    }
  }

  /**
   * Vérifie si la toolbox est visible
   */
  isShowing() {
    return this.isVisible;
  }

  /**
   * Obtient la sélection actuelle
   */
  getCurrentSelection() {
    return this.currentSelection;
  }

  /**
   * Nettoie et détruit la toolbox
   */
  destroy() {
    if (!this.toolboxElement) return;

    console.log('🧹 Destruction de ToolboxUI');

    // Supprimer les événements
    document.removeEventListener('click', this.handleDocumentClick, true);
    document.removeEventListener('keydown', this.handleKeyDown, true);

    // Supprimer l'élément DOM
    if (this.toolboxElement.parentNode) {
      this.toolboxElement.parentNode.removeChild(this.toolboxElement);
    }

    // Nettoyer les références
    this.toolboxElement = null;
    this.currentSelection = null;
    this.formatHandlers.clear();
    this.isVisible = false;
    this.isAnimating = false;
  }
}

// Exporter la classe et créer une instance globale
export { ToolboxUI, TOOLBOX_CONFIG };

// Instance globale pour l'extension
export const toolboxUI = new ToolboxUI();