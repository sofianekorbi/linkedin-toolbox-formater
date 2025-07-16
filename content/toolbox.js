// LinkedIn Formateur Toolbox - Toolbox UI Component
// Interface utilisateur de la toolbox flottante

import { CONFIG, getConfig, log } from '../config/index.js';
import { errorHandler, ExtensionError, ErrorTypes, ErrorSeverity } from './utils/error-handler.js';

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
    return errorHandler.safeExecute(() => {
      log('info', 'Initializing toolbox UI');
      
      // Créer l'élément toolbox
      this.createToolboxElement();
      
      // Ajouter les événements globaux
      document.addEventListener('click', this.handleDocumentClick, true);
      document.addEventListener('keydown', this.handleKeyDown, true);
      
      log('info', 'Toolbox UI initialized successfully');
    }, ErrorTypes.INITIALIZATION, { component: 'toolbox' });
  }

  /**
   * Crée l'élément DOM de la toolbox
   */
  createToolboxElement() {
    // Supprimer l'ancienne toolbox si elle existe
    if (this.toolboxElement) {
      this.toolboxElement.remove();
    }

    const toolboxConfig = CONFIG.ui.toolbox;
    const cssPrefix = toolboxConfig.cssPrefix;

    // Créer le conteneur principal
    this.toolboxElement = document.createElement('div');
    this.toolboxElement.id = 'ltf-toolbox';
    this.toolboxElement.className = `
      ${cssPrefix}fixed
      ${cssPrefix}bg-toolbox-bg
      ${cssPrefix}border
      ${cssPrefix}border-toolbox-border
      ${cssPrefix}rounded-toolbox
      ${cssPrefix}shadow-toolbox
      ${cssPrefix}flex
      ${cssPrefix}items-center
      ${cssPrefix}gap-1
      ${cssPrefix}p-1
      ${cssPrefix}opacity-0
      ${cssPrefix}pointer-events-none
      ${cssPrefix}transition-all
      ${cssPrefix}duration-200
    `.trim().replace(/\s+/g, ' ');

    // Styles inline pour garantir le bon affichage
    this.toolboxElement.style.cssText = `
      position: fixed;
      z-index: ${toolboxConfig.zIndex};
      width: ${toolboxConfig.width}px;
      height: ${toolboxConfig.height}px;
      background: ${toolboxConfig.colors.background};
      border: 1px solid ${toolboxConfig.colors.border};
      border-radius: ${toolboxConfig.styles.borderRadius};
      box-shadow: ${toolboxConfig.styles.boxShadow};
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: ${toolboxConfig.buttonSpacing}px;
      opacity: 0;
      pointer-events: none;
      transition: all 0.2s ease-out;
      transform: translateY(8px);
      font-family: ${toolboxConfig.styles.fontFamily};
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
    const formatConfig = CONFIG.formats.definitions;
    const toolboxConfig = CONFIG.ui.toolbox;
    const buttonConfig = CONFIG.ui.buttons;
    
    log('info', 'Creating toolbox buttons', Object.keys(formatConfig));
    
    Object.values(formatConfig).forEach(format => {
      const button = document.createElement('button');
      button.id = `ltf-btn-${format.id}`;
      button.className = `ltf-toolbox-btn ltf-btn-${format.id}`;
      button.setAttribute('data-format', format.id);
      button.setAttribute('title', format.tooltip);
      button.textContent = format.label;

      // Styles inline pour les boutons
      button.style.cssText = `
        width: ${toolboxConfig.buttonSize}px;
        height: ${toolboxConfig.buttonSize}px;
        border: none;
        border-radius: ${buttonConfig.borderRadius};
        background: transparent;
        color: ${toolboxConfig.colors.text};
        font-size: ${toolboxConfig.styles.fontSize};
        font-weight: ${toolboxConfig.styles.fontWeight};
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: ${buttonConfig.transition};
        user-select: none;
        -webkit-user-select: none;
      `;

      // Ajouter les styles spécifiques au bouton
      if (format.className) {
        if (format.id === 'bold') {
          button.style.fontWeight = 'bold';
        } else if (format.id === 'italic') {
          button.style.fontStyle = 'italic';
        } else if (format.id === 'underline') {
          button.style.textDecoration = 'underline';
        } else if (format.id === 'strikethrough') {
          button.style.textDecoration = 'line-through';
        }
      }

      // Événements hover
      button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = toolboxConfig.colors.backgroundHover;
        button.style.color = toolboxConfig.colors.textHover;
      });

      button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = 'transparent';
        button.style.color = toolboxConfig.colors.text;
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
    const toolboxConfig = CONFIG.ui.toolbox;
    
    // Gérer les sélections multi-lignes
    const rect = this.getOptimalSelectionRect(range);
    
    // Position par défaut : au-dessus du texte sélectionné, parfaitement centré
    const centerX = rect.left + (rect.width / 2);
    let x = centerX - (toolboxConfig.width / 2);
    let y = rect.top - toolboxConfig.height - toolboxConfig.offsetTop;

    // Ajustements pour les débordements
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Ajustement horizontal avec marges symétriques
    const leftBoundary = toolboxConfig.offsetSides;
    const rightBoundary = viewport.width - toolboxConfig.width - toolboxConfig.offsetSides;
    
    if (x < leftBoundary) {
      x = leftBoundary;
    } else if (x > rightBoundary) {
      x = rightBoundary;
    }

    // Ajustement vertical - si pas assez de place en haut, mettre en bas
    if (y < toolboxConfig.offsetTop) {
      y = rect.bottom + toolboxConfig.offsetBottom;
    }

    // Vérifier que la toolbox reste dans le viewport
    if (y + toolboxConfig.height > viewport.height - toolboxConfig.offsetBottom) {
      y = viewport.height - toolboxConfig.height - toolboxConfig.offsetBottom;
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
    }, CONFIG.ui.toolbox.animationDuration);
  }

  /**
   * Masque la toolbox
   */
  hide() {
    if (!this.isVisible || this.isAnimating) return;

    this.isVisible = false;
    this.isAnimating = true;


    // Animation fade-out
    this.toolboxElement.style.opacity = '0';
    this.toolboxElement.style.transform = 'translateY(8px)';
    this.toolboxElement.style.pointerEvents = 'none';

    // Nettoyage après animation
    setTimeout(() => {
      this.currentSelection = null;
      this.isAnimating = false;
    }, CONFIG.ui.toolbox.fadeOutDuration);
  }

  /**
   * Gère les clics sur les boutons
   */
  handleButtonClick(event) {
    return errorHandler.safeExecute(() => {
      event.preventDefault();
      event.stopPropagation();

      const button = event.currentTarget;
      const formatType = button.getAttribute('data-format');

      if (!formatType) {
        throw new ExtensionError(
          'No format type found on button',
          ErrorTypes.UI_INTERACTION,
          ErrorSeverity.MEDIUM,
          { buttonId: button.id }
        );
      }

      // Ajouter effet visuel de clic
      button.style.backgroundColor = CONFIG.ui.toolbox.colors.backgroundActive;
      setTimeout(() => {
        button.style.backgroundColor = 'transparent';
      }, CONFIG.ui.buttons.clickFeedbackDuration);

      // Déclencher le formatage
      this.triggerFormatting(formatType);

      // Masquer la toolbox
      this.hide();
    }, ErrorTypes.UI_INTERACTION, { formatType: event.currentTarget?.getAttribute('data-format') });
  }

  /**
   * Déclenche le formatage du texte
   */
  triggerFormatting(formatType) {
    if (!this.currentSelection) return;


    // Notifier les handlers enregistrés
    if (this.formatHandlers.has(formatType)) {
      const handler = this.formatHandlers.get(formatType);
      try {
        handler(this.currentSelection, formatType);
      } catch (error) {
      }
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

    // Délai court pour éviter les fermetures pendant la sélection
    setTimeout(() => {
      // Vérifier si une sélection est encore active
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        // Ne pas fermer si une sélection est active
        return;
      }
      
      // Fermer la toolbox
      this.hide();
    }, 50);
  }

  /**
   * Obtient le rectangle optimal pour la sélection (gérant les multi-lignes)
   */
  getOptimalSelectionRect(range) {
    try {
      // Obtenir tous les rectangles de la sélection
      const rects = range.getClientRects();
      
      if (rects.length === 0) {
        return range.getBoundingClientRect();
      }
      
      if (rects.length === 1) {
        return rects[0];
      }
      
      // Pour les sélections multi-lignes, utiliser un centrage plus précis
      const firstRect = rects[0];
      const lastRect = rects[rects.length - 1];
      
      // Calculer la largeur totale de la sélection (de début à fin)
      const selectionStart = Math.min(firstRect.left, lastRect.left);
      const selectionEnd = Math.max(firstRect.right, lastRect.right);
      const totalSelectionWidth = selectionEnd - selectionStart;
      
      // Utiliser le centre de la sélection complète
      const centerX = selectionStart + (totalSelectionWidth / 2);
      
      return {
        left: centerX - (totalSelectionWidth / 2),
        right: centerX + (totalSelectionWidth / 2),
        top: firstRect.top,
        bottom: firstRect.bottom,
        width: totalSelectionWidth,
        height: firstRect.height,
        x: centerX - (totalSelectionWidth / 2),
        y: firstRect.y
      };
    } catch (error) {
      log('debug', 'Error in getOptimalSelectionRect, falling back to getBoundingClientRect', error);
      return range.getBoundingClientRect();
    }
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
export { ToolboxUI };

// Instance globale pour l'extension
export const toolboxUI = new ToolboxUI();