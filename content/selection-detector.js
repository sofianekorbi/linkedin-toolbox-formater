// LinkedIn Formateur Toolbox - Selection Detector
// Détection intelligente de la sélection de texte dans les champs LinkedIn

import { CONFIG, log } from '../config/index.js';
import { errorHandler, ExtensionError, ErrorTypes, ErrorSeverity } from './utils/error-handler.js';

/**
 * Classe principale pour la détection de sélection
 */
class SelectionDetector {
  constructor() {
    this.isInitialized = false;
    this.currentSelection = null;
    this.currentField = null;
    this.selectionHandlers = new Set();
    this.debounceTimer = null;
    this.isProcessingMouseUp = false;
    
    // Bind methods
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  /**
   * Initialise la détection de sélection
   */
  init() {
    if (this.isInitialized) {
      return;
    }

    return errorHandler.safeExecute(() => {
      log('info', 'Initializing selection detector');
      
      // Événements globaux
      document.addEventListener('selectionchange', this.handleSelectionChange, true);
      document.addEventListener('mouseup', this.handleMouseUp, true);
      document.addEventListener('keyup', this.handleKeyUp, true);
      
      // Observer pour les nouveaux champs (LinkedIn SPA)
      this.observeNewFields();
      
      this.isInitialized = true;
      log('info', 'Selection detector initialized successfully');
    }, ErrorTypes.INITIALIZATION, { component: 'selection-detector' });
  }

  /**
   * Observer pour détecter les nouveaux champs LinkedIn (SPA)
   */
  observeNewFields() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.checkForLinkedInFields(node);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Check initial fields
    this.checkForLinkedInFields(document.body);
  }

  /**
   * Vérifie s'il y a de nouveaux champs LinkedIn dans un élément
   */
  checkForLinkedInFields(element) {
    const selectors = CONFIG.detection.linkedinSelectors;
    log('debug', 'Checking for LinkedIn fields', { selectors: selectors.length });
    
    selectors.forEach(selector => {
      try {
        const fields = element.querySelectorAll(selector);
        fields.forEach(field => {
          if (!field.hasAttribute('data-ltf-monitored')) {
            this.monitorField(field);
          }
        });
      } catch (error) {
        // Sélecteur invalide, on l'ignore
        log('debug', 'Invalid selector ignored', { selector, error: error.message });
      }
    });
  }

  /**
   * Ajoute la surveillance à un champ spécifique
   */
  monitorField(field) {
    if (!this.isValidLinkedInField(field)) {
      return;
    }

    field.setAttribute('data-ltf-monitored', 'true');
  }

  /**
   * Vérifie si c'est un champ LinkedIn valide
   */
  isValidLinkedInField(field) {
    const detectionConfig = CONFIG.detection;
    
    // Vérifier si c'est en lecture seule
    for (const attr of detectionConfig.readOnlyAttributes) {
      if (field.hasAttribute(attr) && field.getAttribute(attr) !== 'false') {
        log('debug', 'Field rejected: readonly', { field: field.tagName, attr });
        return false;
      }
    }

    // Vérifier les classes à exclure
    for (const className of detectionConfig.excludeClasses) {
      if (field.classList.contains(className)) {
        log('debug', 'Field rejected: excluded class', { field: field.tagName, className });
        return false;
      }
    }

    // Vérifier si c'est dans le contexte LinkedIn
    return this.isInLinkedInContext(field);
  }

  /**
   * Vérifie si l'élément est dans le contexte LinkedIn
   */
  isInLinkedInContext(element) {
    // Vérifier l'URL
    if (!window.location.hostname.includes('linkedin.com')) {
      log('debug', 'Not on LinkedIn domain');
      return false;
    }

    // Vérifier les classes parentes LinkedIn
    let parent = element.parentElement;
    let depth = 0;
    const contextConfig = CONFIG.detection.contextValidation;
    const maxDepth = contextConfig.maxDepth;

    while (parent && depth < maxDepth) {
      const classList = parent.classList;
      
      // Classes LinkedIn communes
      for (const linkedinClass of contextConfig.linkedinClasses) {
        if (classList.contains(linkedinClass)) {
          log('debug', 'Found LinkedIn context', { class: linkedinClass, depth });
          return true;
        }
      }

      parent = parent.parentElement;
      depth++;
    }

    log('debug', 'Default accept on LinkedIn');
    return true; // Par défaut, accepter si on est sur LinkedIn
  }

  /**
   * Gestionnaire principal des changements de sélection
   */
  handleSelectionChange(event) {
    // Ignorer si on traite déjà un mouseup
    if (this.isProcessingMouseUp) {
      return;
    }
    this.debounceSelectionChange();
  }

  /**
   * Gestionnaire mouseup pour détecter les sélections à la souris
   */
  handleMouseUp(event) {
    // Désactiver temporairement selectionchange pour éviter les conflits
    this.isProcessingMouseUp = true;
    
    // Délai adapté selon la longueur de la sélection potentielle
    const delay = this.getSelectionStabilizationDelay();
    setTimeout(() => {
      this.processSelection();
      this.isProcessingMouseUp = false;
    }, delay);
  }

  /**
   * Gestionnaire keyup pour détecter les sélections au clavier
   */
  handleKeyUp(event) {
    // Seulement pour les touches de navigation et sélection
    const selectionKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Shift'];
    
    if (selectionKeys.includes(event.key) || event.shiftKey) {
      this.debounceSelectionChange();
    }
  }

  /**
   * Debounce les changements de sélection pour éviter le spam
   */
  debounceSelectionChange() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.processSelection();
    }, CONFIG.detection.debounceDelay);
  }

  /**
   * Traite la sélection actuelle
   */
  processSelection() {
    const selection = window.getSelection();
    
    if (!selection || selection.rangeCount === 0) {
      this.clearSelection();
      return;
    }

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();

    // Vérifier la longueur minimale
    if (selectedText.length < CONFIG.detection.minSelectionLength) {
      log('debug', 'Selection too short', { length: selectedText.length });
      this.clearSelection();
      return;
    }

    // Vérifier si la sélection est dans un champ LinkedIn (méthode améliorée)
    const field = this.findLinkedInFieldImproved(range);

    if (!field) {
      log('debug', 'No LinkedIn field found for selection', { 
        text: selectedText.substring(0, 50),
        commonAncestor: range.commonAncestorContainer.tagName 
      });
      this.clearSelection();
      return;
    }

    // Détection des sélections multi-mots pour debugging
    const wordCount = selectedText.trim().split(/\s+/).length;
    const isMultiWord = wordCount > 1;
    
    log('debug', 'Selection processed successfully', {
      textLength: selectedText.length,
      wordCount,
      isMultiWord,
      fieldType: field.tagName,
      fieldId: field.id || 'no-id'
    });

    // Nouvelle sélection valide détectée
    this.setSelection({
      text: selectedText,
      range: range,
      field: field,
      fieldInfo: this.getFieldInfo(field),
      isMultiWord,
      wordCount
    });
  }

  /**
   * Trouve le champ LinkedIn parent de l'élément
   */
  findLinkedInField(element) {
    let current = element;
    let depth = 0;
    const maxDepth = 20; // Augmenté pour les structures complexes

    while (current && depth < maxDepth) {
      if (current.nodeType === Node.ELEMENT_NODE) {
        // Vérifier si c'est un champ surveillé
        if (current.hasAttribute('data-ltf-monitored')) {
          return current;
        }

        // Vérifier avec les sélecteurs
        for (const selector of CONFIG.detection.linkedinSelectors) {
          try {
            if (current.matches(selector) && this.isValidLinkedInField(current)) {
              this.monitorField(current); // L'ajouter à la surveillance
              return current;
            }
          } catch (error) {
            // Sélecteur invalide
            log('debug', 'Invalid selector in findLinkedInField', { selector, error: error.message });
          }
        }
      }

      current = current.parentElement;
      depth++;
    }

    return null;
  }

  /**
   * Obtient les informations sur un champ
   */
  getFieldInfo(field) {
    return {
      tagName: field.tagName.toLowerCase(),
      type: field.type || 'unknown',
      placeholder: field.getAttribute('placeholder') || field.getAttribute('data-placeholder') || '',
      role: field.getAttribute('role') || '',
      classes: Array.from(field.classList),
      id: field.id || '',
      isContentEditable: field.contentEditable === 'true'
    };
  }

  /**
   * Définit une nouvelle sélection
   */
  setSelection(selectionData) {
    this.currentSelection = selectionData;
    this.currentField = selectionData.field;

    log('info', 'Selection set', { 
      text: selectionData.text.substring(0, 50) + '...', 
      fieldType: selectionData.fieldInfo.tagName 
    });

    // Notifier les handlers
    this.notifySelectionHandlers('selection', selectionData);
  }

  /**
   * Efface la sélection actuelle
   */
  clearSelection() {
    if (this.currentSelection) {
      log('info', 'Selection cleared');
      
      // Notifier les handlers
      this.notifySelectionHandlers('deselection', {
        previousSelection: this.currentSelection
      });

      this.currentSelection = null;
      this.currentField = null;
    }
  }

  /**
   * Ajoute un handler pour les événements de sélection
   */
  addSelectionHandler(handler) {
    this.selectionHandlers.add(handler);
  }

  /**
   * Supprime un handler
   */
  removeSelectionHandler(handler) {
    this.selectionHandlers.delete(handler);
  }

  /**
   * Notifie tous les handlers
   */
  notifySelectionHandlers(type, data) {
    this.selectionHandlers.forEach(handler => {
      try {
        handler(type, data);
      } catch (error) {
      }
    });
  }

  /**
   * Obtient la sélection actuelle
   */
  getCurrentSelection() {
    return this.currentSelection;
  }

  /**
   * Obtient le champ actuel
   */
  getCurrentField() {
    return this.currentField;
  }

  /**
   * Obtient le délai de stabilisation adapté à la sélection
   */
  getSelectionStabilizationDelay() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return CONFIG.detection.stabilizationDelay;
    }

    const selectedText = selection.toString();
    const wordCount = selectedText.trim().split(/\s+/).length;

    // Utiliser un délai plus long pour les sélections multi-mots
    if (wordCount > 1) {
      return CONFIG.detection.multiWordStabilizationDelay;
    }

    return CONFIG.detection.stabilizationDelay;
  }

  /**
   * Améliore la détection des champs LinkedIn pour les sélections multi-éléments
   */
  findLinkedInFieldImproved(range) {
    // Essayer d'abord avec le commonAncestor
    let field = this.findLinkedInField(range.commonAncestorContainer);
    if (field) {
      return field;
    }

    // Essayer avec le startContainer
    field = this.findLinkedInField(range.startContainer);
    if (field) {
      return field;
    }

    // Essayer avec le endContainer
    field = this.findLinkedInField(range.endContainer);
    if (field) {
      return field;
    }

    // Dernier recours : vérifier les éléments dans la sélection
    return this.findLinkedInFieldInSelection(range);
  }

  /**
   * Trouve un champ LinkedIn dans la sélection
   */
  findLinkedInFieldInSelection(range) {
    try {
      const walker = document.createTreeWalker(
        range.commonAncestorContainer,
        NodeFilter.SHOW_ELEMENT,
        null,
        false
      );

      let node;
      while (node = walker.nextNode()) {
        if (range.intersectsNode(node)) {
          const field = this.findLinkedInField(node);
          if (field) {
            return field;
          }
        }
      }
    } catch (error) {
      log('debug', 'Error in findLinkedInFieldInSelection', error);
    }

    return null;
  }

  /**
   * Nettoie et détruit le détecteur
   */
  destroy() {
    if (!this.isInitialized) return;

    document.removeEventListener('selectionchange', this.handleSelectionChange, true);
    document.removeEventListener('mouseup', this.handleMouseUp, true);
    document.removeEventListener('keyup', this.handleKeyUp, true);

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.selectionHandlers.clear();
    this.currentSelection = null;
    this.currentField = null;
    this.isInitialized = false;
    this.isProcessingMouseUp = false;

    log('info', 'Selection detector destroyed');
  }
}

// Exporter la classe et créer une instance globale
export { SelectionDetector };

// Instance globale pour l'extension
export const selectionDetector = new SelectionDetector();