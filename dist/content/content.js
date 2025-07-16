const CONFIG = {
  // ===============================
  // FORMATS SUPPORTÉS
  // ===============================
  formats: {
    // Liste des formatages supportés par l'extension
    supported: ["bold", "italic", "underline", "strikethrough"],
    // Configuration pour chaque format
    definitions: {
      bold: {
        id: "bold",
        label: "B",
        tooltip: "Gras",
        className: "ltf-font-bold",
        shortcut: "Ctrl+B"
      },
      italic: {
        id: "italic",
        label: "I",
        tooltip: "Italique",
        className: "ltf-italic",
        shortcut: "Ctrl+I"
      },
      underline: {
        id: "underline",
        label: "U",
        tooltip: "Souligné",
        className: "ltf-underline",
        shortcut: "Ctrl+U"
      },
      strikethrough: {
        id: "strikethrough",
        label: "S",
        tooltip: "Barré",
        className: "ltf-line-through",
        shortcut: "Ctrl+Shift+S"
      }
    }
  },
  // ===============================
  // INTERFACE UTILISATEUR
  // ===============================
  ui: {
    // Configuration de la toolbox flottante
    toolbox: {
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
      // Styles
      zIndex: 1e4,
      cssPrefix: "ltf-",
      // Couleurs
      colors: {
        background: "#ffffff",
        border: "#e1e5e9",
        text: "#666666",
        textHover: "#0a66c2",
        backgroundHover: "#f3f2ef",
        backgroundActive: "#e1e5e9"
      },
      // Styles CSS
      styles: {
        borderRadius: "6px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: "14px",
        fontWeight: "600"
      }
    },
    // Configuration des boutons
    buttons: {
      borderRadius: "4px",
      transition: "all 0.1s ease",
      clickFeedbackDuration: 100
    }
  },
  // ===============================
  // ÉVÉNEMENTS
  // ===============================
  events: {
    linkedinNotification: ["input", "change", "keyup"]
  },
  // ===============================
  // DÉTECTION DE SÉLECTION
  // ===============================
  detection: {
    // Délais et timing
    debounceDelay: 200,
    // Augmenté pour les sélections longues
    stabilizationDelay: 50,
    // Augmenté pour stabiliser les sélections multi-mots
    // Validation de sélection
    minSelectionLength: 1,
    // Délais spécifiques pour les sélections multi-mots
    multiWordStabilizationDelay: 100,
    // Classes et attributs à exclure
    excludeClasses: [
      "ltf-extension",
      "ltf-toolbox",
      "linkedin-ads",
      "ad-banner",
      "sponsored-content"
    ],
    // Attributs indiquant un champ en lecture seule
    readOnlyAttributes: [
      "readonly",
      "disabled",
      "aria-readonly"
    ],
    // Sélecteurs CSS pour identifier les champs LinkedIn
    linkedinSelectors: [
      // Champs de création de posts
      '[data-placeholder*="partager"]',
      `[data-placeholder*="What's"]`,
      '[data-placeholder*="share"]',
      '.ql-editor[contenteditable="true"]',
      '[role="textbox"]',
      // Champs de commentaires
      '[data-placeholder*="comment"]',
      '[data-placeholder*="Add a comment"]',
      '[data-placeholder*="commentaire"]',
      ".comments-comment-box__form textarea",
      ".comments-comment-texteditor",
      // Messages privés
      '[data-placeholder*="message"]',
      '[data-placeholder*="Write a message"]',
      '[data-placeholder*="Rédigez"]',
      ".msg-form__contenteditable",
      ".msg-form__compose",
      // Champs de profil et autres
      '[data-placeholder*="headline"]',
      '[data-placeholder*="summary"]',
      '[data-placeholder*="experience"]',
      'textarea[name*="summary"]',
      'textarea[name*="description"]',
      // Sélecteurs génériques pour LinkedIn
      'div[contenteditable="true"]',
      "textarea",
      'input[type="text"]',
      ".editor-content",
      '[data-editor="true"]'
    ],
    // Classes parentes LinkedIn pour validation de contexte
    contextValidation: {
      maxDepth: 10,
      linkedinClasses: [
        "feed-shared-update-v2",
        "comments-comment-box",
        "msg-form",
        "artdeco-card",
        "feed-shared-text",
        "share-creation-state",
        "editor-content"
      ]
    }
  },
  // ===============================
  // PERFORMANCE
  // ===============================
  performance: {
    // MB
    // Optimisations
    cleanupInterval: 3e4},
  // ===============================
  // SÉCURITÉ
  // ===============================
  security: {
    // Domaines autorisés
    allowedDomains: [
      "linkedin.com",
      "*.linkedin.com"
    ],
    // Validation des entrées
    maxInputLength: 5e4},
  // ===============================
  // MÉTADONNÉES
  // ===============================
  meta: {
    // Mise à jour
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString()}
};
function isDomainAllowed(domain) {
  return CONFIG.security.allowedDomains.some((allowed) => {
    if (allowed.startsWith("*.")) {
      return domain.endsWith(allowed.slice(2));
    }
    return domain === allowed;
  });
}
function log(level, message, ...args) {
  return;
}

// LinkedIn Formateur Toolbox - Error Handler
// Système de gestion d'erreurs centralisé et robuste


/**
 * Types d'erreurs de l'extension
 */
const ErrorTypes = {
  INITIALIZATION: 'initialization',
  FORMATTING: 'formatting',
  TEXT_REPLACEMENT: 'text_replacement',
  UI_INTERACTION: 'ui_interaction',
  NETWORK: 'network',
  UNKNOWN: 'unknown'
};

/**
 * Severité des erreurs
 */
const ErrorSeverity = {
  LOW: 'low',         // Erreur mineure, n'affecte pas le fonctionnement
  MEDIUM: 'medium',   // Erreur modérée, certaines fonctionnalités peuvent échouer
  HIGH: 'high',       // Erreur critique, l'extension ne peut pas fonctionner
  CRITICAL: 'critical' // Erreur fatale, nécessite une intervention immédiate
};

/**
 * Classe pour représenter une erreur de l'extension
 */
class ExtensionError extends Error {
  constructor(message, type = ErrorTypes.UNKNOWN, severity = ErrorSeverity.MEDIUM, context = {}) {
    super(message);
    this.name = 'ExtensionError';
    this.type = type;
    this.severity = severity;
    this.context = context;
    this.timestamp = new Date().toISOString();
    this.userAgent = navigator.userAgent;
    this.url = window.location.href;
    
    // Capturer la stack trace si disponible
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ExtensionError);
    }
  }

  /**
   * Sérialise l'erreur pour le logging
   */
  serialize() {
    return {
      message: this.message,
      type: this.type,
      severity: this.severity,
      context: this.context,
      timestamp: this.timestamp,
      userAgent: this.userAgent,
      url: this.url,
      stack: this.stack
    };
  }
}

/**
 * Gestionnaire d'erreurs centralisé
 */
class ErrorHandler {
  constructor() {
    this.errorCount = new Map();
    this.errorHistory = [];
    this.maxHistorySize = 100;
    this.suppressedErrors = new Set();
    
    // Écouter les erreurs globales
    this.setupGlobalErrorHandling();
  }

  /**
   * Configure la gestion d'erreurs globale
   */
  setupGlobalErrorHandling() {
    // Erreurs JavaScript non capturées
    window.addEventListener('error', (event) => {
      this.handleError(new ExtensionError(
        event.message,
        ErrorTypes.UNKNOWN,
        ErrorSeverity.MEDIUM,
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error
        }
      ));
    });

    // Promesses rejetées non capturées
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(new ExtensionError(
        `Unhandled promise rejection: ${event.reason}`,
        ErrorTypes.UNKNOWN,
        ErrorSeverity.MEDIUM,
        { reason: event.reason }
      ));
    });
  }

  /**
   * Gère une erreur de manière centralisée
   */
  handleError(error, shouldThrow = false) {
    // Convertir en ExtensionError si nécessaire
    if (!(error instanceof ExtensionError)) {
      error = new ExtensionError(
        error.message || 'Unknown error',
        ErrorTypes.UNKNOWN,
        ErrorSeverity.MEDIUM,
        { originalError: error }
      );
    }

    // Vérifier si l'erreur est supprimée
    if (this.isErrorSuppressed(error)) {
      return;
    }

    // Compter les occurrences
    const errorKey = `${error.type}_${error.message}`;
    this.errorCount.set(errorKey, (this.errorCount.get(errorKey) || 0) + 1);

    // Ajouter à l'historique
    this.addToHistory(error);

    // Logger l'erreur
    this.logError(error);

    // Actions selon la severité
    this.handleBySeverity(error);

    // Lancer l'erreur si demandé
    if (shouldThrow) {
      throw error;
    }
  }

  /**
   * Vérifie si une erreur doit être supprimée
   */
  isErrorSuppressed(error) {
    return this.suppressedErrors.has(error.type) || 
           this.suppressedErrors.has(`${error.type}_${error.message}`);
  }

  /**
   * Ajoute une erreur à l'historique
   */
  addToHistory(error) {
    this.errorHistory.push(error.serialize());
    
    // Limiter la taille de l'historique
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }
  }

  /**
   * Log l'erreur avec le bon niveau
   */
  logError(error) {
    const logLevel = this.getLogLevel(error.severity);
    log(logLevel, `[${error.type}] ${error.message}`, error.context);
  }

  /**
   * Obtient le niveau de log selon la severité
   */
  getLogLevel(severity) {
    switch (severity) {
      case ErrorSeverity.LOW: return 'debug';
      case ErrorSeverity.MEDIUM: return 'warn';
      case ErrorSeverity.HIGH: return 'error';
      case ErrorSeverity.CRITICAL: return 'error';
      default: return 'warn';
    }
  }

  /**
   * Gère l'erreur selon sa severité
   */
  handleBySeverity(error) {
    switch (error.severity) {
      case ErrorSeverity.LOW:
        // Erreur mineure, continuer normalement
        break;
        
      case ErrorSeverity.MEDIUM:
        // Erreur modérée, peut nécessiter une action
        this.handleMediumError(error);
        break;
        
      case ErrorSeverity.HIGH:
        // Erreur critique, actions de récupération
        this.handleHighError(error);
        break;
        
      case ErrorSeverity.CRITICAL:
        // Erreur fatale, arrêter l'extension
        this.handleCriticalError(error);
        break;
    }
  }

  /**
   * Gère les erreurs de severité moyenne
   */
  handleMediumError(error) {
    // Retry automatique pour certains types d'erreurs
    if (error.type === ErrorTypes.NETWORK) ;
  }

  /**
   * Gère les erreurs de haute severité
   */
  handleHighError(error) {
    // Notifier l'utilisateur si nécessaire
    if (error.type === ErrorTypes.FORMATTING) {
      this.notifyUser('Une erreur de formatage s\'est produite. Veuillez réessayer.', 'warning');
    }
  }

  /**
   * Gère les erreurs critiques
   */
  handleCriticalError(error) {
    // Désactiver l'extension si nécessaire
    log('error', 'Critical error occurred, extension may need to be disabled', error.serialize());
    
    // Notifier l'utilisateur
    this.notifyUser('Une erreur critique s\'est produite. L\'extension va être désactivée.', 'error');
  }

  /**
   * Notifie l'utilisateur (à implémenter selon le besoin)
   */
  notifyUser(message, type = 'info') {
    // Pour l'instant, utiliser console
    console[type](`[LinkedIn Formateur] ${message}`);
    
    // Possibilité d'ajouter une notification UI plus tard
  }

  /**
   * Supprime un type d'erreur
   */
  suppressError(errorType) {
    this.suppressedErrors.add(errorType);
  }

  /**
   * Réactive un type d'erreur
   */
  unsuppressError(errorType) {
    this.suppressedErrors.delete(errorType);
  }

  /**
   * Obtient les statistiques d'erreurs
   */
  getErrorStats() {
    return {
      totalErrors: this.errorHistory.length,
      errorCounts: Object.fromEntries(this.errorCount),
      recentErrors: this.errorHistory.slice(-10),
      suppressedErrors: Array.from(this.suppressedErrors)
    };
  }

  /**
   * Nettoie l'historique des erreurs
   */
  clearErrorHistory() {
    this.errorHistory = [];
    this.errorCount.clear();
  }

  /**
   * Wrapper pour l'exécution sécurisée d'une fonction
   */
  async safeExecute(fn, errorType = ErrorTypes.UNKNOWN, context = {}) {
    try {
      return await fn();
    } catch (error) {
      this.handleError(new ExtensionError(
        error.message || 'Safe execution failed',
        errorType,
        ErrorSeverity.MEDIUM,
        { ...context, originalError: error }
      ));
      return null;
    }
  }

  /**
   * Crée un wrapper de fonction avec gestion d'erreur automatique
   */
  createErrorWrapper(fn, errorType = ErrorTypes.UNKNOWN, context = {}) {
    return async (...args) => {
      return this.safeExecute(
        () => fn(...args),
        errorType,
        { ...context, arguments: args }
      );
    };
  }
}

// Instance globale du gestionnaire d'erreurs
const errorHandler = new ErrorHandler();

// LinkedIn Formateur Toolbox - Selection Detector
// Détection intelligente de la sélection de texte dans les champs LinkedIn


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
      log();
      
      // Événements globaux
      document.addEventListener('selectionchange', this.handleSelectionChange, true);
      document.addEventListener('mouseup', this.handleMouseUp, true);
      document.addEventListener('keyup', this.handleKeyUp, true);
      
      // Observer pour les nouveaux champs (LinkedIn SPA)
      this.observeNewFields();
      
      this.isInitialized = true;
      log();
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
      log();
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

    log();
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
      log();
      
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

    log();
  }
}

// Instance globale pour l'extension
const selectionDetector = new SelectionDetector();

// LinkedIn Formateur Toolbox - Toolbox UI Component
// Interface utilisateur de la toolbox flottante


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
      log();
      
      // Créer l'élément toolbox
      this.createToolboxElement();
      
      // Ajouter les événements globaux
      document.addEventListener('click', this.handleDocumentClick, true);
      document.addEventListener('keydown', this.handleKeyDown, true);
      
      log();
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
      gap: ${toolboxConfig.buttonSpacing}px;
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
    
    // Position par défaut : au-dessus du texte sélectionné
    let x = rect.left + (rect.width / 2) - (toolboxConfig.width / 2);
    let y = rect.top - toolboxConfig.height - toolboxConfig.offsetTop;

    // Ajustements pour les débordements
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Ajustement horizontal
    if (x < toolboxConfig.offsetSides) {
      x = toolboxConfig.offsetSides;
    } else if (x + toolboxConfig.width > viewport.width - toolboxConfig.offsetSides) {
      x = viewport.width - toolboxConfig.width - toolboxConfig.offsetSides;
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
      
      // Pour les sélections multi-lignes, utiliser le premier rectangle
      // mais ajuster la largeur pour centrer la toolbar
      const firstRect = rects[0];
      const lastRect = rects[rects.length - 1];
      
      // Calculer la largeur moyenne pour un meilleur centrage
      const totalWidth = Array.from(rects).reduce((sum, rect) => sum + rect.width, 0);
      const averageWidth = totalWidth / rects.length;
      
      return {
        left: firstRect.left,
        right: firstRect.left + averageWidth,
        top: firstRect.top,
        bottom: firstRect.bottom,
        width: averageWidth,
        height: firstRect.height,
        x: firstRect.x,
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

// Instance globale pour l'extension
const toolboxUI = new ToolboxUI();

// LinkedIn Formateur Toolbox - Unicode Factory
// Factory pattern pour éliminer les répétitions dans les formatages Unicode

/**
 * Mappings Unicode directs (approche sûre qui fonctionne)
 */
const UNICODE_MAPPINGS = {
  bold: {
    // Lettres majuscules A-Z → 𝐀-𝐙 (U+1D400-U+1D419)
    'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇',
    'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏',
    'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗',
    'Y': '𝐘', 'Z': '𝐙',
    
    // Lettres minuscules a-z → 𝐚-𝐳 (U+1D41A-U+1D433)
    'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡',
    'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩',
    'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱',
    'y': '𝐲', 'z': '𝐳',
    
    // Chiffres 0-9 → 𝟎-𝟗 (U+1D7CE-U+1D7D7)
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒',
    '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
  },
  
  italic: {
    // Lettres majuscules A-Z → 𝘈-𝘡 (U+1D608-U+1D621)
    'A': '𝘈', 'B': '𝘉', 'C': '𝘊', 'D': '𝘋', 'E': '𝘌', 'F': '𝘍', 'G': '𝘎', 'H': '𝘏',
    'I': '𝘐', 'J': '𝘑', 'K': '𝘒', 'L': '𝘓', 'M': '𝘔', 'N': '𝘕', 'O': '𝘖', 'P': '𝘗',
    'Q': '𝘘', 'R': '𝘙', 'S': '𝘚', 'T': '𝘛', 'U': '𝘜', 'V': '𝘝', 'W': '𝘞', 'X': '𝘟',
    'Y': '𝘠', 'Z': '𝘡',
    
    // Lettres minuscules a-z → 𝘢-𝘻 (U+1D622-U+1D63B)
    'a': '𝘢', 'b': '𝘣', 'c': '𝘤', 'd': '𝘥', 'e': '𝘦', 'f': '𝘧', 'g': '𝘨', 'h': '𝘩',
    'i': '𝘪', 'j': '𝘫', 'k': '𝘬', 'l': '𝘭', 'm': '𝘮', 'n': '𝘯', 'o': '𝘰', 'p': '𝘱',
    'q': '𝘲', 'r': '𝘳', 's': '𝘴', 't': '𝘵', 'u': '𝘶', 'v': '𝘷', 'w': '𝘸', 'x': '𝘹',
    'y': '𝘺', 'z': '𝘻'
  },
  
  monospace: {
    // Lettres majuscules A-Z → Mathematical Monospace (U+1D670-U+1D689)
    'A': '𝙰', 'B': '𝙱', 'C': '𝙲', 'D': '𝙳', 'E': '𝙴', 'F': '𝙵', 'G': '𝙶', 'H': '𝙷',
    'I': '𝙸', 'J': '𝙹', 'K': '𝙺', 'L': '𝙻', 'M': '𝙼', 'N': '𝙽', 'O': '𝙾', 'P': '𝙿',
    'Q': '𝚀', 'R': '𝚁', 'S': '𝚂', 'T': '𝚃', 'U': '𝚄', 'V': '𝚅', 'W': '𝚆', 'X': '𝚇',
    'Y': '𝚈', 'Z': '𝚉',
    
    // Lettres minuscules a-z → Mathematical Monospace (U+1D68A-U+1D6A3)
    'a': '𝚊', 'b': '𝚋', 'c': '𝚌', 'd': '𝚍', 'e': '𝚎', 'f': '𝚏', 'g': '𝚐', 'h': '𝚑',
    'i': '𝚒', 'j': '𝚓', 'k': '𝚔', 'l': '𝚕', 'm': '𝚖', 'n': '𝚗', 'o': '𝚘', 'p': '𝚙',
    'q': '𝚚', 'r': '𝚛', 's': '𝚜', 't': '𝚝', 'u': '𝚞', 'v': '𝚟', 'w': '𝚠', 'x': '𝚡',
    'y': '𝚢', 'z': '𝚣',
    
    // Chiffres 0-9 → Mathematical Monospace (U+1D7F6-U+1D7FF)
    '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿'
  }
};

/**
 * Caractères combining pour soulignement et barré
 */
const COMBINING_CHARS = {
  underline: '\u0332',      // Combining underline
  strikethrough: '\u0336'   // Combining strikethrough
};

/**
 * Table de normalisation des caractères accentués
 */
const ACCENT_NORMALIZATION = {
  // Lettres majuscules accentuées
  'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A', 'Æ': 'A',
  'Ç': 'C',
  'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E',
  'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I',
  'Ñ': 'N',
  'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O', 'Ø': 'O',
  'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U',
  'Ý': 'Y', 'Ÿ': 'Y',
  
  // Lettres minuscules accentuées
  'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a', 'æ': 'a',
  'ç': 'c',
  'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
  'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
  'ñ': 'n',
  'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o', 'ø': 'o',
  'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
  'ý': 'y', 'ÿ': 'y'
};

/**
 * Normalise un caractère accentué vers sa forme de base
 * @param {string} char - Le caractère à normaliser
 * @returns {string} - Le caractère normalisé ou original
 */
function normalizeAccent(char) {
  return ACCENT_NORMALIZATION[char] || char;
}

/**
 * Factory pour créer des formatters Unicode avec mappings directs
 * @param {Object} mappings - Table de mapping direct des caractères
 * @returns {Function} - Fonction de formatage
 */
function createUnicodeFormatter(mappings) {
  return function(text) {
    if (!text || typeof text !== 'string') {
      return text;
    }

    try {
      let result = '';
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        // Essayer d'abord le caractère original
        let unicodeChar = mappings[char];
        
        // Si pas trouvé, essayer la version sans accent
        if (!unicodeChar) {
          const normalizedChar = normalizeAccent(char);
          unicodeChar = mappings[normalizedChar];
        }
        
        result += unicodeChar || char; // Unicode, ou caractère original si pas de mapping
      }
      return result;
    } catch (error) {
      return text; // Fallback vers le texte original
    }
  };
}

/**
 * Factory pour créer des formatters avec combining characters
 * @param {string} combiningChar - Le caractère combining à utiliser
 * @param {Object} baseMappings - Mappings Unicode pour la base (optionnel)
 * @returns {Function} - Fonction de formatage
 */
function createCombiningFormatter(combiningChar, baseMappings = null) {
  return function(text) {
    if (!text || typeof text !== 'string') {
      return text;
    }

    try {
      let result = '';
      
      // Si des mappings de base sont spécifiés, d'abord appliquer la transformation
      const baseText = baseMappings ? createUnicodeFormatter(baseMappings)(text) : text;
      
      for (let i = 0; i < baseText.length; i++) {
        const char = baseText[i];
        result += char;
        
        // Ajouter le combining character seulement pour les caractères visibles
        if (char.trim() !== '' && !char.match(/\s/)) {
          result += combiningChar;
        }
      }

      return result;
    } catch (error) {
      return text; // Fallback vers le texte original
    }
  };
}

/**
 * Crée un reverse mapper pour convertir vers le texte normal
 * @param {Object} mappings - Table de mapping Unicode vers normal
 * @returns {Object} - Map de caractères Unicode vers caractères normaux
 */
function createReverseMap(mappings) {
  const reverseMap = {};
  
  // Inverser le mapping : Unicode → Normal
  Object.entries(mappings).forEach(([normalChar, unicodeChar]) => {
    reverseMap[unicodeChar] = normalChar;
  });
  
  return reverseMap;
}

/**
 * Génère tous les reverse maps pour tous les formatages
 */
function createGlobalReverseMap() {
  const globalMap = {};
  
  Object.entries(UNICODE_MAPPINGS).forEach(([type, mappings]) => {
    const reverseMap = createReverseMap(mappings);
    Object.assign(globalMap, reverseMap);
  });

  return globalMap;
}

/**
 * Factory principale qui génère tous les formatters
 */
function createFormatters() {
  return {
    // Formatters directs avec mappings sûrs
    toBold: createUnicodeFormatter(UNICODE_MAPPINGS.bold),
    toItalic: createUnicodeFormatter(UNICODE_MAPPINGS.italic),
    
    // Formatters avec combining characters  
    toUnderline: function(text) {
      if (!text || typeof text !== 'string') return text;
      
      try {
        let result = '';
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          
          // Essayer d'abord le caractère original
          let monospaceChar = UNICODE_MAPPINGS.monospace[char];
          
          // Si pas trouvé, essayer la version sans accent
          if (!monospaceChar) {
            const normalizedChar = normalizeAccent(char);
            monospaceChar = UNICODE_MAPPINGS.monospace[normalizedChar];
          }
          
          if (monospaceChar) {
            // Caractère monospace + combining underline
            result += monospaceChar + COMBINING_CHARS.underline;
          } else if (char === ' ') {
            result += char; // Garder les espaces normaux
          } else {
            // Pour les caractères non mappés, utiliser le caractère original + underline
            result += char + COMBINING_CHARS.underline;
          }
        }
        return result;
      } catch (error) {
        return text;
      }
    },
    toStrikethrough: createCombiningFormatter(COMBINING_CHARS.strikethrough),
    
    // Reverse mapper global
    reverseMap: createGlobalReverseMap(),
    
    // Combining characters pour le nettoyage
    combiningChars: Object.values(COMBINING_CHARS)
  };
}

// LinkedIn Formateur Toolbox - Unicode Formatters
// Fonctions de formatage avec caractères Unicode spéciaux pour LinkedIn


// Générer tous les formatters via la factory
const formatters = createFormatters();

/**
 * Convertit le texte en caractères Unicode Mathematical Bold
 * Utilisé pour le formatage **gras** sur LinkedIn
 * @param {string} text - Le texte à formater
 * @returns {string} - Le texte formaté en gras Unicode
 */
const toBold = formatters.toBold;

/**
 * Convertit le texte en caractères Unicode Mathematical Italic
 * Utilisé pour le formatage *italique* sur LinkedIn  
 * @param {string} text - Le texte à formater
 * @returns {string} - Le texte formaté en italique Unicode
 */
const toItalic = formatters.toItalic;

/**
 * Ajoute combining underline aux caractères
 * Utilisé pour le formatage souligné sur LinkedIn
 * @param {string} text - Le texte à formater
 * @returns {string} - Le texte formaté avec soulignement Unicode
 */
const toUnderline = formatters.toUnderline;

/**
 * Ajoute combining strikethrough aux caractères
 * Utilisé pour le formatage barré sur LinkedIn
 * @param {string} text - Le texte à formater
 * @returns {string} - Le texte formaté avec strikethrough Unicode
 */
const toStrikethrough = formatters.toStrikethrough;

/**
 * Convertit un texte formaté vers sa forme normale
 * @param {string} text - Le texte formaté à normaliser
 * @returns {string} - Le texte en forme normale
 */
function toNormal(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  try {
    let result = '';
    
    // Utiliser la reverse map générée par la factory
    const reverseMapping = formatters.reverseMap;
    const combiningChars = formatters.combiningChars;

    // Parcourir chaque caractère Unicode réel (pas code unit)
    for (const char of text) {
      // Ignorer les combining characters
      if (combiningChars.includes(char)) {
        continue;
      }
      
      // Convertir vers la forme normale si mapping existe
      const normalChar = reverseMapping[char];
      result += normalChar || char;
    }

    return result;

  } catch (error) {
    return text;
  }
}

/**
 * Détecte le type de formatage appliqué à un texte
 * @param {string} text - Le texte à analyser
 * @returns {Array<string>} - Liste des formatages détectés
 */
function detectFormatting(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const detectedFormats = [];

  try {
    const combiningChars = formatters.combiningChars;
    
    // Regex pour détecter les ranges Unicode des différents formatages
    const unicodeRanges = {
      // Mathematical Bold : 𝐀-𝐙 + 𝐚-𝐳 + 𝟎-𝟗
      bold: /[\u{1D400}-\u{1D419}\u{1D41A}-\u{1D433}\u{1D7CE}-\u{1D7D7}]/u,
      
      // Mathematical Sans-Serif Italic : 𝘈-𝘡 + 𝘢-𝘻
      italic: /[\u{1D608}-\u{1D621}\u{1D622}-\u{1D63B}]/u,
      
      // Mathematical Monospace : 𝙰-𝚉 + 𝚊-𝚣 + 𝟶-𝟿
      monospace: /[\u{1D670}-\u{1D689}\u{1D68A}-\u{1D6A3}\u{1D7F6}-\u{1D7FF}]/u
    };

    // Détection par ranges Unicode
    if (unicodeRanges.bold.test(text)) detectedFormats.push('bold');
    if (unicodeRanges.italic.test(text)) detectedFormats.push('italic');
    
    // Détection par combining characters
    if (text.includes(combiningChars[0])) detectedFormats.push('underline');
    if (text.includes(combiningChars[1])) detectedFormats.push('strikethrough');
    
    // Cas spécial : underline utilise aussi monospace
    if (unicodeRanges.monospace.test(text) && !detectedFormats.includes('underline')) {
      detectedFormats.push('underline');
    }

    return detectedFormats;

  } catch (error) {
    return [];
  }
}

/**
 * Applique un formatage simple avec toggle off et remplacement
 * @param {string} text - Le texte à formater
 * @param {Array<string>} existingFormats - Liste des formatages déjà appliqués
 * @param {string} newFormat - Le nouveau formatage à appliquer
 * @returns {string} - Le texte avec le nouveau formatage appliqué
 */
function applyIncrementalFormatting(text, existingFormats, newFormat) {
  if (!text || typeof text !== 'string') return text;
  if (!newFormat || typeof newFormat !== 'string') return text;
  
  existingFormats = existingFormats || [];

  try {
    // 1. TOGGLE OFF: Si le formatage est déjà appliqué, revenir au texte normal
    if (existingFormats.includes(newFormat)) {
      return toNormal(text);
    }

    // 2. REMPLACEMENT: Si un autre formatage existe, le remplacer
    if (existingFormats.length > 0) {
      const normalizedText = toNormal(text);
      return applySimpleFormatting(normalizedText, newFormat);
    }

    // 3. FORMATAGE SIMPLE: Aucun formatage existant, appliquer le nouveau
    return applySimpleFormatting(text, newFormat);

  } catch (error) {
    return text;
  }
}

/**
 * Applique un formatage simple à un texte normal
 * @param {string} text - Le texte à formater
 * @param {string} formatType - Le type de formatage
 * @returns {string} - Le texte formaté
 */
function applySimpleFormatting(text, formatType) {
  const formatMap = {
    bold: toBold,
    italic: toItalic,
    underline: toUnderline,
    strikethrough: toStrikethrough
  };
  
  return formatMap[formatType] ? formatMap[formatType](text) : text;
}

// LinkedIn Formateur Toolbox - Text Formatter
// Classe spécialisée pour la logique de formatage pure


/**
 * Classe pour la logique de formatage pure
 * Responsabilité: Transformer du texte selon les règles de formatage
 */
class TextFormatter {
  constructor() {
    this.supportedFormats = CONFIG.formats.supported;
    this.formatFunctions = this.initializeFormatFunctions();
  }

  /**
   * Initialise les fonctions de formatage
   */
  initializeFormatFunctions() {
    return {
      bold: toBold,
      italic: toItalic,
      underline: toUnderline,
      strikethrough: toStrikethrough,
      normal: toNormal
    };
  }

  /**
   * Applique un formatage à un texte
   * @param {string} text - Le texte à formater
   * @param {string} formatType - Le type de formatage
   * @param {Array} existingFormats - Les formatages déjà présents
   * @returns {Promise<string>} - Le texte formaté
   */
  async formatText(text, formatType, existingFormats = []) {
    return errorHandler.safeExecute(async () => {
      this.validateFormatRequest(text, formatType);

      // Utiliser la logique incrémentale pour tous les cas
      const formattedText = applyIncrementalFormatting(text, existingFormats, formatType);

      this.validateFormattedText(formattedText, text, formatType);

      return formattedText;
    }, ErrorTypes.FORMATTING, { formatType, textLength: text?.length });
  }

  /**
   * Détecte les formatages existants dans un texte
   * @param {string} text - Le texte à analyser
   * @returns {Array} - Les formatages détectés
   */
  detectFormats(text) {
    return errorHandler.safeExecute(() => {
      if (!text || typeof text !== 'string') {
        return [];
      }

      return detectFormatting(text);
    }, ErrorTypes.FORMATTING, { textLength: text?.length }) || [];
  }

  /**
   * Valide une demande de formatage
   * @param {string} text - Le texte à valider
   * @param {string} formatType - Le type de formatage
   */
  validateFormatRequest(text, formatType) {
    if (!text || typeof text !== 'string') {
      throw new ExtensionError(
        'Invalid text provided for formatting',
        ErrorTypes.FORMATTING,
        ErrorSeverity.MEDIUM,
        { textType: typeof text, formatType }
      );
    }

    if (!formatType || !this.supportedFormats.includes(formatType)) {
      throw new ExtensionError(
        'Unsupported format type',
        ErrorTypes.FORMATTING,
        ErrorSeverity.MEDIUM,
        { formatType, supportedFormats: this.supportedFormats }
      );
    }

    if (text.length > CONFIG.security.maxInputLength) {
      throw new ExtensionError(
        'Text too long for formatting',
        ErrorTypes.FORMATTING,
        ErrorSeverity.MEDIUM,
        { textLength: text.length, maxLength: CONFIG.security.maxInputLength }
      );
    }
  }

  /**
   * Valide le texte formaté
   * @param {string} formattedText - Le texte formaté
   * @param {string} originalText - Le texte original
   * @param {string} formatType - Le type de formatage
   */
  validateFormattedText(formattedText, originalText, formatType) {
    if (!formattedText || typeof formattedText !== 'string') {
      throw new ExtensionError(
        'Formatting failed to produce valid text',
        ErrorTypes.FORMATTING,
        ErrorSeverity.HIGH,
        { formatType, originalLength: originalText.length }
      );
    }

    // Vérifier que le texte formaté n'est pas vide si l'original ne l'était pas
    if (originalText.trim() && !formattedText.trim()) {
      throw new ExtensionError(
        'Formatting resulted in empty text',
        ErrorTypes.FORMATTING,
        ErrorSeverity.HIGH,
        { formatType, originalText: originalText.substring(0, 50) }
      );
    }
  }

  /**
   * Applique un formatage simple (fonction directe)
   * @param {string} text - Le texte à formater
   * @param {string} formatType - Le type de formatage
   * @returns {Promise<string>} - Le texte formaté
   */
  async applySimpleFormat(text, formatType) {
    return errorHandler.safeExecute(async () => {
      this.validateFormatRequest(text, formatType);

      const formatFunction = this.formatFunctions[formatType];
      if (!formatFunction) {
        throw new ExtensionError(
          'Format function not found',
          ErrorTypes.FORMATTING,
          ErrorSeverity.MEDIUM,
          { formatType, availableFunctions: Object.keys(this.formatFunctions) }
        );
      }

      const formattedText = formatFunction(text);
      this.validateFormattedText(formattedText, text, formatType);

      return formattedText;
    }, ErrorTypes.FORMATTING, { formatType, textLength: text?.length });
  }

  /**
   * Supprime tous les formatages d'un texte
   * @param {string} text - Le texte à nettoyer
   * @returns {Promise<string>} - Le texte sans formatage
   */
  async removeAllFormats(text) {
    return errorHandler.safeExecute(async () => {
      if (!text || typeof text !== 'string') {
        return text;
      }

      return toNormal(text);
    }, ErrorTypes.FORMATTING, { operation: 'removeAllFormats', textLength: text?.length });
  }

  /**
   * Vérifie si un texte contient des formatages
   * @param {string} text - Le texte à vérifier
   * @returns {boolean} - True si le texte contient des formatages
   */
  hasFormats(text) {
    return errorHandler.safeExecute(() => {
      if (!text || typeof text !== 'string') {
        return false;
      }

      const formats = this.detectFormats(text);
      return formats.length > 0;
    }, ErrorTypes.FORMATTING, { operation: 'hasFormats', textLength: text?.length }) || false;
  }

  /**
   * Obtient les types de formatage supportés
   * @returns {Array} - Liste des types supportés
   */
  getSupportedFormats() {
    return [...this.supportedFormats];
  }

  /**
   * Obtient les informations sur un type de formatage
   * @param {string} formatType - Le type de formatage
   * @returns {Object} - Informations sur le formatage
   */
  getFormatInfo(formatType) {
    return CONFIG.formats.definitions[formatType] || null;
  }

  /**
   * Prévisualise un formatage sans l'appliquer
   * @param {string} text - Le texte à prévisualiser
   * @param {string} formatType - Le type de formatage
   * @returns {Promise<Object>} - Informations de prévisualisation
   */
  async previewFormat(text, formatType) {
    return errorHandler.safeExecute(async () => {
      this.validateFormatRequest(text, formatType);

      const existingFormats = this.detectFormats(text);
      const formattedText = await this.formatText(text, formatType, existingFormats);

      return {
        original: text,
        formatted: formattedText,
        formatType,
        existingFormats,
        hasChanges: text !== formattedText
      };
    }, ErrorTypes.FORMATTING, { operation: 'preview', formatType, textLength: text?.length });
  }
}

// Instance globale
const textFormatter = new TextFormatter();

// LinkedIn Formateur Toolbox - Format Orchestrator
// Classe d'orchestration pour coordonner le formatage


/**
 * Classe d'orchestration pour le formatage
 * Responsabilité: Coordonner les différents composants pour le formatage
 */
class FormatOrchestrator {
  constructor() {
    this.activeOperations = new Map();
    this.operationCounter = 0;
    this.statistics = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      averageProcessingTime: 0
    };
  }

  /**
   * Orchestre une opération de formatage complète
   * @param {Object} request - Requête de formatage
   * @returns {Promise<Object>} - Résultat de l'opération
   */
  async orchestrateFormatting(request) {
    const operationId = this.generateOperationId();
    const startTime = Date.now();

    return errorHandler.safeExecute(async () => {
      // Valider la requête
      this.validateFormatRequest(request);

      // Enregistrer l'opération
      this.registerOperation(operationId, request);

      log('info', 'Starting format orchestration', {
        operationId,
        formatType: request.formatType,
        textLength: request.selectionData.text.length
      });

      // Étape 1: Analyser la sélection
      const analysisResult = await this.analyzeSelection(request.selectionData);

      // Étape 2: Préparer le formatage
      const formatPreparation = await this.prepareFormatting(
        request.selectionData,
        request.formatType,
        analysisResult
      );

      // Étape 3: Appliquer le formatage
      const formatResult = await this.applyFormatting(
        formatPreparation,
        request.formatType
      );

      // Étape 4: Appliquer le changement dans l'UI
      const uiResult = await this.applyUIChanges(
        request.selectionData,
        formatResult
      );

      // Étape 5: Finaliser
      const finalResult = await this.finalizeOperation(
        operationId,
        uiResult,
        startTime
      );

      this.updateStatistics(true, Date.now() - startTime);
      return finalResult;

    }, ErrorTypes.FORMATTING, { operationId, formatType: request.formatType });
  }

  /**
   * Valide une requête de formatage
   * @param {Object} request - La requête à valider
   */
  validateFormatRequest(request) {
    if (!request) {
      throw new ExtensionError(
        'Format request is required',
        ErrorTypes.FORMATTING,
        ErrorSeverity.HIGH,
        { request }
      );
    }

    if (!request.selectionData) {
      throw new ExtensionError(
        'Selection data is required',
        ErrorTypes.FORMATTING,
        ErrorSeverity.HIGH,
        { request: Object.keys(request) }
      );
    }

    if (!request.formatType) {
      throw new ExtensionError(
        'Format type is required',
        ErrorTypes.FORMATTING,
        ErrorSeverity.HIGH,
        { request: Object.keys(request) }
      );
    }

    if (!request.selectionData.text) {
      throw new ExtensionError(
        'No text selected for formatting',
        ErrorTypes.FORMATTING,
        ErrorSeverity.MEDIUM,
        { formatType: request.formatType }
      );
    }
  }

  /**
   * Génère un ID unique pour l'opération
   * @returns {string} - ID unique
   */
  generateOperationId() {
    return `format_${++this.operationCounter}_${Date.now()}`;
  }

  /**
   * Enregistre une opération
   * @param {string} operationId - ID de l'opération
   * @param {Object} request - Requête de formatage
   */
  registerOperation(operationId, request) {
    this.activeOperations.set(operationId, {
      id: operationId,
      startTime: Date.now(),
      formatType: request.formatType,
      textLength: request.selectionData.text.length,
      status: 'started'
    });
  }

  /**
   * Analyse la sélection pour préparer le formatage
   * @param {Object} selectionData - Données de la sélection
   * @returns {Promise<Object>} - Résultat de l'analyse
   */
  async analyzeSelection(selectionData) {
    return errorHandler.safeExecute(async () => {
      const text = selectionData.text;
      const existingFormats = selectionData.existingFormats || 
                            textFormatter.detectFormats(text);

      const analysis = {
        text,
        length: text.length,
        existingFormats,
        hasFormats: existingFormats.length > 0,
        field: selectionData.field,
        fieldType: selectionData.fieldInfo?.tagName,
        isContentEditable: selectionData.field?.contentEditable === 'true'
      };

      log('debug', 'Selection analysis completed', analysis);
      return analysis;
    }, ErrorTypes.FORMATTING, { operation: 'analyze' });
  }

  /**
   * Prépare le formatage
   * @param {Object} selectionData - Données de la sélection
   * @param {string} formatType - Type de formatage
   * @param {Object} analysisResult - Résultat de l'analyse
   * @returns {Promise<Object>} - Préparation du formatage
   */
  async prepareFormatting(selectionData, formatType, analysisResult) {
    return errorHandler.safeExecute(async () => {
      // Vérifier les conflits potentiels
      const conflicts = this.checkFormatConflicts(
        analysisResult.existingFormats,
        formatType
      );

      // Préparer la stratégie de formatage
      const strategy = this.determineFormatStrategy(
        formatType,
        analysisResult.existingFormats,
        conflicts
      );

      const preparation = {
        text: analysisResult.text,
        formatType,
        existingFormats: analysisResult.existingFormats,
        strategy,
        conflicts,
        field: selectionData.field,
        range: selectionData.range
      };

      log('debug', 'Formatting preparation completed', {
        formatType,
        strategy,
        conflicts: conflicts.length
      });

      return preparation;
    }, ErrorTypes.FORMATTING, { operation: 'prepare', formatType });
  }

  /**
   * Vérifie les conflits de formatage
   * @param {Array} existingFormats - Formatages existants
   * @param {string} newFormatType - Nouveau type de formatage
   * @returns {Array} - Conflits trouvés
   */
  checkFormatConflicts(existingFormats, newFormatType) {
    const conflicts = [];

    existingFormats.forEach(format => {
      if (format === newFormatType) {
        conflicts.push({
          type: 'duplicate',
          format: format,
          message: `Format ${format} already applied`
        });
      }
    });

    return conflicts;
  }

  /**
   * Détermine la stratégie de formatage
   * @param {string} formatType - Type de formatage
   * @param {Array} existingFormats - Formatages existants
   * @param {Array} conflicts - Conflits détectés
   * @returns {string} - Stratégie à utiliser
   */
  determineFormatStrategy(formatType, existingFormats, conflicts) {
    if (conflicts.length > 0) {
      const hasDuplicate = conflicts.some(c => c.type === 'duplicate');
      if (hasDuplicate) {
        return 'toggle'; // Retirer le formatage s'il existe déjà
      }
    }

    if (existingFormats.length === 0) {
      return 'apply'; // Appliquer directement
    }

    return 'incremental'; // Formatage incrémental
  }

  /**
   * Applique le formatage
   * @param {Object} preparation - Préparation du formatage
   * @param {string} formatType - Type de formatage
   * @returns {Promise<Object>} - Résultat du formatage
   */
  async applyFormatting(preparation, formatType) {
    return errorHandler.safeExecute(async () => {
      let formattedText;

      switch (preparation.strategy) {
        case 'toggle':
          // Retirer le formatage existant
          formattedText = await textFormatter.removeAllFormats(preparation.text);
          break;

        case 'apply':
          // Appliquer le formatage directement
          formattedText = await textFormatter.applySimpleFormat(
            preparation.text,
            formatType
          );
          break;

        case 'incremental':
        default:
          // Formatage incrémental
          formattedText = await textFormatter.formatText(
            preparation.text,
            formatType,
            preparation.existingFormats
          );
          break;
      }

      const result = {
        originalText: preparation.text,
        formattedText,
        formatType,
        strategy: preparation.strategy,
        hasChanges: preparation.text !== formattedText
      };

      log('debug', 'Formatting applied', {
        formatType,
        strategy: preparation.strategy,
        hasChanges: result.hasChanges
      });

      return result;
    }, ErrorTypes.FORMATTING, { operation: 'apply', formatType });
  }

  /**
   * Applique les changements dans l'UI
   * @param {Object} selectionData - Données de la sélection
   * @param {Object} formatResult - Résultat du formatage
   * @returns {Promise<Object>} - Résultat de l'application UI
   */
  async applyUIChanges(selectionData, formatResult) {
    return errorHandler.safeExecute(async () => {
      if (!formatResult.hasChanges) {
        return {
          success: true,
          message: 'No changes to apply',
          formatResult
        };
      }

      // Appliquer le changement selon le type de champ
      if (selectionData.field.contentEditable === 'true') {
        await this.applyContentEditableChange(
          selectionData.field,
          selectionData.range,
          formatResult.formattedText
        );
      } else {
        await this.applyInputFieldChange(
          selectionData.field,
          formatResult.formattedText
        );
      }

      // Déclencher les événements LinkedIn
      await this.triggerLinkedInEvents(selectionData.field);

      return {
        success: true,
        message: 'Changes applied successfully',
        formatResult
      };
    }, ErrorTypes.UI_INTERACTION, { fieldType: selectionData.fieldInfo?.tagName });
  }

  /**
   * Applique les changements dans un champ contenteditable
   * @param {HTMLElement} field - Le champ
   * @param {Range} range - La range de sélection
   * @param {string} newText - Le nouveau texte
   */
  async applyContentEditableChange(field, range, newText) {
    return errorHandler.safeExecute(async () => {
      range.deleteContents();
      const textNode = document.createTextNode(newText);
      range.insertNode(textNode);
      
      // Repositionner le curseur
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      selection.collapseToEnd();
    }, ErrorTypes.UI_INTERACTION, { operation: 'contenteditable' });
  }

  /**
   * Applique les changements dans un champ input/textarea
   * @param {HTMLElement} field - Le champ
   * @param {string} newText - Le nouveau texte
   */
  async applyInputFieldChange(field, newText) {
    return errorHandler.safeExecute(async () => {
      const start = field.selectionStart;
      const end = field.selectionEnd;
      const value = field.value;
      
      field.value = value.substring(0, start) + newText + value.substring(end);
      
      // Repositionner le curseur
      const newCursorPos = start + newText.length;
      field.setSelectionRange(newCursorPos, newCursorPos);
    }, ErrorTypes.UI_INTERACTION, { operation: 'input' });
  }

  /**
   * Déclenche les événements LinkedIn
   * @param {HTMLElement} field - Le champ
   */
  async triggerLinkedInEvents(field) {
    return errorHandler.safeExecute(async () => {
      const events = CONFIG.events.linkedinNotification;
      
      events.forEach(eventType => {
        const event = new Event(eventType, {
          bubbles: true,
          cancelable: true
        });
        field.dispatchEvent(event);
      });

      field.focus();
    }, ErrorTypes.UI_INTERACTION, { operation: 'events' });
  }

  /**
   * Finalise une opération
   * @param {string} operationId - ID de l'opération
   * @param {Object} uiResult - Résultat de l'application UI
   * @param {number} startTime - Temps de début
   * @returns {Object} - Résultat final
   */
  async finalizeOperation(operationId, uiResult, startTime) {
    return errorHandler.safeExecute(async () => {
      const operation = this.activeOperations.get(operationId);
      if (operation) {
        operation.status = 'completed';
        operation.endTime = Date.now();
        operation.duration = operation.endTime - startTime;
      }

      // Nettoyer l'opération après un délai
      setTimeout(() => {
        this.activeOperations.delete(operationId);
      }, 5000);

      log('info', 'Format operation completed', {
        operationId,
        duration: operation?.duration,
        success: uiResult.success
      });

      return {
        operationId,
        success: uiResult.success,
        message: uiResult.message,
        duration: operation?.duration,
        formatResult: uiResult.formatResult
      };
    }, ErrorTypes.FORMATTING, { operationId });
  }

  /**
   * Met à jour les statistiques
   * @param {boolean} success - Succès de l'opération
   * @param {number} duration - Durée de l'opération
   */
  updateStatistics(success, duration) {
    this.statistics.totalOperations++;
    
    if (success) {
      this.statistics.successfulOperations++;
    } else {
      this.statistics.failedOperations++;
    }

    // Calcul de la moyenne mobile
    const currentAvg = this.statistics.averageProcessingTime;
    const newAvg = (currentAvg + duration) / 2;
    this.statistics.averageProcessingTime = Math.round(newAvg);
  }

  /**
   * Obtient les statistiques
   * @returns {Object} - Statistiques de l'orchestrateur
   */
  getStatistics() {
    return {
      ...this.statistics,
      activeOperations: this.activeOperations.size,
      successRate: this.statistics.totalOperations > 0 
        ? (this.statistics.successfulOperations / this.statistics.totalOperations * 100).toFixed(2)
        : 0
    };
  }

  /**
   * Obtient les opérations actives
   * @returns {Array} - Liste des opérations actives
   */
  getActiveOperations() {
    return Array.from(this.activeOperations.values());
  }

  /**
   * Nettoie les ressources
   */
  cleanup() {
    this.activeOperations.clear();
    this.statistics = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      averageProcessingTime: 0
    };
    log();
  }
}

// Instance globale
const formatOrchestrator = new FormatOrchestrator();

// LinkedIn Formateur Toolbox - Format Handler
// Gestionnaire spécialisé pour l'application du formatage


/**
 * Classe spécialisée pour la gestion du formatage
 */
class FormatHandler {
  constructor() {
    this.activeFormats = new Map();
  }

  /**
   * Applique le formatage au texte sélectionné
   */
  async applyFormatting(selectionData, formatType) {
    return errorHandler.safeExecute(async () => {
      // Valider les paramètres
      if (!selectionData || !formatType) {
        throw new ExtensionError(
          'Invalid parameters for formatting',
          ErrorTypes.FORMATTING,
          ErrorSeverity.MEDIUM,
          { selectionData: !!selectionData, formatType }
        );
      }

      if (!selectionData.text || selectionData.text.length === 0) {
        throw new ExtensionError(
          'No text selected for formatting',
          ErrorTypes.FORMATTING,
          ErrorSeverity.LOW,
          { formatType }
        );
      }

      log('info', 'Delegating formatting to orchestrator', { 
        formatType, 
        textLength: selectionData.text.length
      });
      
      // Utiliser l'orchestrateur pour gérer le formatage complet
      const result = await formatOrchestrator.orchestrateFormatting({
        selectionData,
        formatType
      });

      return result.success;

    }, ErrorTypes.FORMATTING, { formatType, textLength: selectionData?.text?.length });
  }

  /**
   * Remplace le texte sélectionné dans le champ LinkedIn
   */
  async replaceSelectedText(selectionData, newText) {
    return errorHandler.safeExecute(async () => {
      const field = selectionData.field;
      const range = selectionData.range;

      if (!field) {
        throw new ExtensionError(
          'No field found for text replacement',
          ErrorTypes.TEXT_REPLACEMENT,
          ErrorSeverity.HIGH,
          { newText: newText.substring(0, 50) }
        );
      }

      // Méthode 1: Pour les éléments contenteditable (posts, commentaires)
      if (field.contentEditable === 'true') {
        await this.handleContentEditableField(field, range, newText);
      // Méthode 2: Pour les textarea et input
      } else if (field.tagName === 'TEXTAREA' || field.tagName === 'INPUT') {
        await this.handleInputField(field, newText);
      } else {
        throw new ExtensionError(
          'Unsupported field type for text replacement',
          ErrorTypes.TEXT_REPLACEMENT,
          ErrorSeverity.MEDIUM,
          { fieldType: field.tagName, fieldId: field.id }
        );
      }

    }, ErrorTypes.TEXT_REPLACEMENT, { fieldType: selectionData.field?.tagName });
  }

  /**
   * Gère les champs contenteditable
   */
  async handleContentEditableField(field, range, newText) {
    return errorHandler.safeExecute(async () => {
      if (!range) {
        throw new ExtensionError(
          'No range provided for contenteditable field',
          ErrorTypes.TEXT_REPLACEMENT,
          ErrorSeverity.HIGH,
          { fieldId: field.id }
        );
      }

      // Supprimer le contenu sélectionné et insérer le nouveau texte
      range.deleteContents();
      const textNode = document.createTextNode(newText);
      range.insertNode(textNode);
      
      // Repositionner le curseur après le texte inséré
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      
      // Effacer la sélection
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      window.getSelection().collapseToEnd();

      // Déclencher les événements pour notifier LinkedIn
      await this.triggerLinkedInEvents(field);

    }, ErrorTypes.TEXT_REPLACEMENT, { fieldType: 'contenteditable', fieldId: field.id });
  }

  /**
   * Gère les champs input/textarea
   */
  async handleInputField(field, newText) {
    return errorHandler.safeExecute(async () => {
      const start = field.selectionStart;
      const end = field.selectionEnd;
      const value = field.value;
      
      if (start === null || end === null) {
        throw new ExtensionError(
          'No selection found in input field',
          ErrorTypes.TEXT_REPLACEMENT,
          ErrorSeverity.MEDIUM,
          { fieldId: field.id, fieldType: field.tagName }
        );
      }
      
      // Remplacer le texte sélectionné
      field.value = value.substring(0, start) + newText + value.substring(end);
      
      // Repositionner le curseur
      const newCursorPos = start + newText.length;
      field.setSelectionRange(newCursorPos, newCursorPos);
      
      // Déclencher les événements
      await this.triggerLinkedInEvents(field);

    }, ErrorTypes.TEXT_REPLACEMENT, { fieldType: field.tagName, fieldId: field.id });
  }

  /**
   * Déclenche les événements nécessaires pour notifier LinkedIn des changements
   */
  async triggerLinkedInEvents(field) {
    return errorHandler.safeExecute(async () => {
      // Événements de base pour notifier les changements
      const events = CONFIG.events.linkedinNotification;
      
      events.forEach(eventType => {
        try {
          const event = new Event(eventType, {
            bubbles: true,
            cancelable: true
          });
          field.dispatchEvent(event);
        } catch (error) {
          throw new ExtensionError(
            `Failed to dispatch event: ${eventType}`,
            ErrorTypes.UI_INTERACTION,
            ErrorSeverity.LOW,
            { eventType, fieldId: field.id, error: error.message }
          );
        }
      });

      // Focus sur le champ pour maintenir l'état actif
      try {
        field.focus();
      } catch (error) {
        throw new ExtensionError(
          'Failed to focus field after text replacement',
          ErrorTypes.UI_INTERACTION,
          ErrorSeverity.LOW,
          { fieldId: field.id, error: error.message }
        );
      }

    }, ErrorTypes.UI_INTERACTION, { fieldId: field.id });
  }

  /**
   * Détecte les formatages existants dans le texte
   */
  detectExistingFormats(text) {
    return detectFormatting(text);
  }
}

// Instance globale pour l'extension
const formatHandler = new FormatHandler();

// LinkedIn Formateur Toolbox - Content Script
// Ce script sera injecté sur toutes les pages LinkedIn



/**
 * Classe principale de l'extension
 */
class LinkedInFormatterToolbox {
  constructor() {
    this.isInitialized = false;
    this.currentSelection = null;
    
    // Bind methods
    this.handleSelectionEvent = this.handleSelectionEvent.bind(this);
  }

  /**
   * Initialise l'extension
   */
  async init() {
    if (this.isInitialized) {
      return;
    }

    return errorHandler.safeExecute(async () => {
      log();
      
      // Vérifier qu'on est bien sur LinkedIn
      if (!this.isLinkedInPage()) {
        throw new ExtensionError(
          'Not on LinkedIn page, skipping initialization',
          ErrorTypes.INITIALIZATION,
          ErrorSeverity.LOW,
          { hostname: window.location.hostname }
        );
      }

      // Initialiser le détecteur de sélection
      selectionDetector.init();
      
      // Ajouter notre handler pour les événements de sélection
      selectionDetector.addSelectionHandler(this.handleSelectionEvent);

      // Enregistrer les handlers de formatage
      this.registerFormatHandlers();

      this.isInitialized = true;
      log();

    }, ErrorTypes.INITIALIZATION, { hostname: window.location.hostname });
  }

  /**
   * Vérifie si on est sur une page LinkedIn
   */
  isLinkedInPage() {
    const hostname = window.location.hostname;
    const isAllowed = isDomainAllowed(hostname);
    log('debug', 'Checking LinkedIn page', { hostname, isAllowed });
    return isAllowed;
  }

  /**
   * Gère les événements de sélection/désélection
   */
  handleSelectionEvent(type, data) {
    if (type === 'selection') {
      this.onTextSelected(data);
    } else if (type === 'deselection') {
      this.onTextDeselected(data);
    }
  }

  /**
   * Appelé quand du texte est sélectionné
   */
  onTextSelected(selectionData) {
    this.currentSelection = selectionData;
    
    log('info', 'Text selected', { 
      length: selectionData.text.length,
      fieldType: selectionData.fieldInfo.tagName
    });
    
    // LIN-33: Détecter les formatages existants
    const existingFormats = detectFormatting(selectionData.text);

    // Enrichir les données de sélection avec les formatages détectés
    selectionData.existingFormats = existingFormats;

    // Afficher la toolbox
    this.showToolbox(selectionData);
  }

  /**
   * Appelé quand la sélection est effacée
   */
  onTextDeselected(data) {
    this.currentSelection = null;

    log();
    
    // Masquer la toolbox
    this.hideToolbox();
  }

  /**
   * Affiche la toolbox de formatage
   */
  showToolbox(selectionData) {
    toolboxUI.show(selectionData);
  }

  /**
   * Masque la toolbox de formatage
   */
  hideToolbox() {
    toolboxUI.hide();
  }


  /**
   * Enregistre les handlers de formatage
   */
  registerFormatHandlers() {
    const supportedFormats = CONFIG.formats.supported;
    
    log('info', 'Registering format handlers', { formats: supportedFormats });
    
    // Enregistrer un handler pour chaque format supporté
    supportedFormats.forEach(formatType => {
      toolboxUI.addFormatHandler(formatType, (selectionData, formatType) => {
        this.applyFormatting(selectionData, formatType);
      });
    });
  }

  /**
   * Applique le formatage au texte sélectionné
   */
  async applyFormatting(selectionData, formatType) {
    return errorHandler.safeExecute(async () => {
      if (!selectionData || !formatType) {
        throw new ExtensionError(
          'Invalid parameters for applyFormatting',
          ErrorTypes.FORMATTING,
          ErrorSeverity.MEDIUM,
          { hasSelectionData: !!selectionData, formatType }
        );
      }

      return await formatHandler.applyFormatting(selectionData, formatType);
    }, ErrorTypes.FORMATTING, { formatType });
  }

  /**
   * Obtient la sélection actuelle
   */
  getCurrentSelection() {
    return this.currentSelection;
  }

  /**
   * Nettoie l'extension
   */
  destroy() {
    if (!this.isInitialized) return;

    log();

    // Nettoyer le détecteur de sélection
    selectionDetector.removeSelectionHandler(this.handleSelectionEvent);
    selectionDetector.destroy();

    // Nettoyer la toolbox
    toolboxUI.destroy();

    this.currentSelection = null;
    this.isInitialized = false;
    
    log();
  }
}

// Initialisation automatique
const toolbox = new LinkedInFormatterToolbox();

// Exposer globalement pour l'extension
window.linkedInFormatterToolbox = toolbox;

// Initialiser quand le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => toolbox.init());
} else {
  // DOM déjà prêt
  toolbox.init();
}

// Pour LinkedIn SPA, réinitialiser lors des changements de page
let currentUrl = window.location.href;
const observer = new MutationObserver(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    
    // Délai pour laisser LinkedIn finir de charger
    setTimeout(() => {
      toolbox.destroy();
      toolbox.init();
    }, CONFIG.performance.cleanupInterval / 30); // 1 seconde par défaut
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
//# sourceMappingURL=content.js.map
