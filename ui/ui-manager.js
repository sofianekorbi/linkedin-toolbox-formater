// LinkedIn Formateur Toolbox - UI Manager
// Classe spécialisée pour la gestion UI pure

import { CONFIG, log } from '../config/index.js';
import { errorHandler, ExtensionError, ErrorTypes, ErrorSeverity } from '../utils/error-handler.js';

/**
 * Classe pour la gestion UI pure
 * Responsabilité: Gérer les interactions et l'affichage des éléments UI
 */
export class UIManager {
  constructor() {
    this.activeElements = new Map();
    this.eventListeners = new Map();
    this.animationQueue = [];
    this.isAnimating = false;
  }

  /**
   * Crée un élément UI avec configuration
   * @param {string} elementType - Type d'élément HTML
   * @param {Object} config - Configuration de l'élément
   * @returns {Promise<HTMLElement>} - L'élément créé
   */
  async createElement(elementType, config = {}) {
    return errorHandler.safeExecute(async () => {
      if (!elementType || typeof elementType !== 'string') {
        throw new ExtensionError(
          'Invalid element type provided',
          ErrorTypes.UI_INTERACTION,
          ErrorSeverity.MEDIUM,
          { elementType }
        );
      }

      const element = document.createElement(elementType);
      
      // Appliquer la configuration
      if (config.id) element.id = config.id;
      if (config.className) element.className = config.className;
      if (config.textContent) element.textContent = config.textContent;
      if (config.innerHTML) element.innerHTML = config.innerHTML;
      
      // Appliquer les styles
      if (config.styles) {
        Object.entries(config.styles).forEach(([property, value]) => {
          element.style[property] = value;
        });
      }

      // Appliquer les attributs
      if (config.attributes) {
        Object.entries(config.attributes).forEach(([attr, value]) => {
          element.setAttribute(attr, value);
        });
      }

      // Enregistrer l'élément
      if (config.id) {
        this.activeElements.set(config.id, element);
      }

      return element;
    }, ErrorTypes.UI_INTERACTION, { elementType, configKeys: Object.keys(config) });
  }

  /**
   * Ajoute un event listener sécurisé
   * @param {HTMLElement} element - L'élément cible
   * @param {string} eventType - Type d'événement
   * @param {Function} handler - Gestionnaire d'événement
   * @param {Object} options - Options d'événement
   */
  addEventListener(element, eventType, handler, options = {}) {
    return errorHandler.safeExecute(() => {
      if (!element || !eventType || !handler) {
        throw new ExtensionError(
          'Invalid parameters for event listener',
          ErrorTypes.UI_INTERACTION,
          ErrorSeverity.MEDIUM,
          { hasElement: !!element, eventType, hasHandler: !!handler }
        );
      }

      // Wrapper pour la gestion d'erreur
      const wrappedHandler = errorHandler.createErrorWrapper(
        handler,
        ErrorTypes.UI_INTERACTION,
        { eventType, elementId: element.id }
      );

      element.addEventListener(eventType, wrappedHandler, options);

      // Enregistrer pour le nettoyage
      const key = `${element.id || 'anonymous'}_${eventType}`;
      this.eventListeners.set(key, {
        element,
        eventType,
        handler: wrappedHandler,
        options
      });

    }, ErrorTypes.UI_INTERACTION, { eventType, elementId: element.id });
  }

  /**
   * Supprime un event listener
   * @param {string} elementId - ID de l'élément
   * @param {string} eventType - Type d'événement
   */
  removeEventListener(elementId, eventType) {
    return errorHandler.safeExecute(() => {
      const key = `${elementId}_${eventType}`;
      const listener = this.eventListeners.get(key);

      if (listener) {
        listener.element.removeEventListener(
          listener.eventType,
          listener.handler,
          listener.options
        );
        this.eventListeners.delete(key);
      }
    }, ErrorTypes.UI_INTERACTION, { elementId, eventType });
  }

  /**
   * Positionne un élément de manière sécurisée
   * @param {HTMLElement} element - L'élément à positionner
   * @param {Object} position - Position { x, y }
   * @param {Object} options - Options de positionnement
   */
  positionElement(element, position, options = {}) {
    return errorHandler.safeExecute(() => {
      if (!element || !position) {
        throw new ExtensionError(
          'Invalid parameters for element positioning',
          ErrorTypes.UI_INTERACTION,
          ErrorSeverity.MEDIUM,
          { hasElement: !!element, hasPosition: !!position }
        );
      }

      // Valider les coordonnées
      const x = this.validateCoordinate(position.x, 'x');
      const y = this.validateCoordinate(position.y, 'y');

      // Appliquer les contraintes de viewport
      const constrainedPosition = this.constrainToViewport(
        { x, y },
        element,
        options
      );

      // Positionner l'élément
      element.style.position = options.position || 'fixed';
      element.style.left = constrainedPosition.x + 'px';
      element.style.top = constrainedPosition.y + 'px';

      // Z-index si spécifié
      if (options.zIndex) {
        element.style.zIndex = options.zIndex;
      }

    }, ErrorTypes.UI_INTERACTION, { elementId: element.id, position });
  }

  /**
   * Valide une coordonnée
   * @param {number} coordinate - La coordonnée à valider
   * @param {string} axis - L'axe (x ou y)
   * @returns {number} - La coordonnée validée
   */
  validateCoordinate(coordinate, axis) {
    if (typeof coordinate !== 'number' || isNaN(coordinate)) {
      throw new ExtensionError(
        `Invalid ${axis} coordinate`,
        ErrorTypes.UI_INTERACTION,
        ErrorSeverity.MEDIUM,
        { coordinate, axis }
      );
    }

    return Math.max(0, Math.min(coordinate, 
      axis === 'x' ? window.innerWidth : window.innerHeight
    ));
  }

  /**
   * Contraint la position dans le viewport
   * @param {Object} position - Position { x, y }
   * @param {HTMLElement} element - L'élément à contraindre
   * @param {Object} options - Options de contrainte
   * @returns {Object} - Position contrainte
   */
  constrainToViewport(position, element, options = {}) {
    const rect = element.getBoundingClientRect();
    const margin = options.margin || 10;

    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    return {
      x: Math.max(margin, Math.min(
        position.x,
        viewport.width - rect.width - margin
      )),
      y: Math.max(margin, Math.min(
        position.y,
        viewport.height - rect.height - margin
      ))
    };
  }

  /**
   * Anime un élément avec gestion d'erreur
   * @param {HTMLElement} element - L'élément à animer
   * @param {Object} animation - Configuration d'animation
   * @returns {Promise} - Promise de l'animation
   */
  async animateElement(element, animation) {
    return errorHandler.safeExecute(async () => {
      if (!element || !animation) {
        throw new ExtensionError(
          'Invalid parameters for animation',
          ErrorTypes.UI_INTERACTION,
          ErrorSeverity.MEDIUM,
          { hasElement: !!element, hasAnimation: !!animation }
        );
      }

      // Ajouter à la queue d'animation
      return new Promise((resolve, reject) => {
        this.animationQueue.push({
          element,
          animation,
          resolve,
          reject
        });

        if (!this.isAnimating) {
          this.processAnimationQueue();
        }
      });
    }, ErrorTypes.UI_INTERACTION, { elementId: element.id, animationType: animation.type });
  }

  /**
   * Traite la queue d'animation
   */
  async processAnimationQueue() {
    if (this.animationQueue.length === 0) {
      this.isAnimating = false;
      return;
    }

    this.isAnimating = true;
    const { element, animation, resolve, reject } = this.animationQueue.shift();

    try {
      await this.executeAnimation(element, animation);
      resolve();
    } catch (error) {
      reject(error);
    }

    // Traiter la suite
    setTimeout(() => this.processAnimationQueue(), 10);
  }

  /**
   * Exécute une animation
   * @param {HTMLElement} element - L'élément à animer
   * @param {Object} animation - Configuration d'animation
   */
  async executeAnimation(element, animation) {
    return new Promise((resolve, reject) => {
      const duration = animation.duration || 200;
      const easing = animation.easing || 'ease-out';

      // Appliquer les styles de transition
      element.style.transition = `all ${duration}ms ${easing}`;

      // Appliquer les styles finaux
      Object.entries(animation.styles || {}).forEach(([property, value]) => {
        element.style[property] = value;
      });

      // Attendre la fin de l'animation
      setTimeout(() => {
        // Nettoyer la transition
        element.style.transition = '';
        resolve();
      }, duration);
    });
  }

  /**
   * Affiche un élément avec animation
   * @param {HTMLElement} element - L'élément à afficher
   * @param {Object} options - Options d'affichage
   */
  async showElement(element, options = {}) {
    return this.animateElement(element, {
      type: 'show',
      duration: options.duration || CONFIG.ui.toolbox.animationDuration,
      styles: {
        opacity: '1',
        transform: 'translateY(0)',
        pointerEvents: 'auto'
      }
    });
  }

  /**
   * Masque un élément avec animation
   * @param {HTMLElement} element - L'élément à masquer
   * @param {Object} options - Options de masquage
   */
  async hideElement(element, options = {}) {
    return this.animateElement(element, {
      type: 'hide',
      duration: options.duration || CONFIG.ui.toolbox.fadeOutDuration,
      styles: {
        opacity: '0',
        transform: 'translateY(8px)',
        pointerEvents: 'none'
      }
    });
  }

  /**
   * Nettoie les ressources UI
   */
  cleanup() {
    return errorHandler.safeExecute(() => {
      // Supprimer tous les event listeners
      this.eventListeners.forEach(listener => {
        listener.element.removeEventListener(
          listener.eventType,
          listener.handler,
          listener.options
        );
      });
      this.eventListeners.clear();

      // Supprimer tous les éléments actifs
      this.activeElements.forEach(element => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
      this.activeElements.clear();

      // Nettoyer la queue d'animation
      this.animationQueue = [];
      this.isAnimating = false;

      log('info', 'UI Manager cleaned up');
    }, ErrorTypes.UI_INTERACTION, { operation: 'cleanup' });
  }

  /**
   * Obtient un élément par son ID
   * @param {string} elementId - ID de l'élément
   * @returns {HTMLElement} - L'élément trouvé
   */
  getElement(elementId) {
    return this.activeElements.get(elementId) || null;
  }

  /**
   * Obtient les statistiques UI
   * @returns {Object} - Statistiques UI
   */
  getStats() {
    return {
      activeElements: this.activeElements.size,
      eventListeners: this.eventListeners.size,
      animationQueue: this.animationQueue.length,
      isAnimating: this.isAnimating
    };
  }
}

// Instance globale
export const uiManager = new UIManager();