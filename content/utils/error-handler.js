// LinkedIn Formateur Toolbox - Error Handler
// Système de gestion d'erreurs centralisé et robuste

import { CONFIG, log } from '../../config/index.js';

/**
 * Types d'erreurs de l'extension
 */
export const ErrorTypes = {
  INITIALIZATION: 'initialization',
  SELECTION_DETECTION: 'selection_detection',
  FORMATTING: 'formatting',
  TEXT_REPLACEMENT: 'text_replacement',
  UI_INTERACTION: 'ui_interaction',
  CONFIGURATION: 'configuration',
  PERMISSION: 'permission',
  NETWORK: 'network',
  UNKNOWN: 'unknown'
};

/**
 * Severité des erreurs
 */
export const ErrorSeverity = {
  LOW: 'low',         // Erreur mineure, n'affecte pas le fonctionnement
  MEDIUM: 'medium',   // Erreur modérée, certaines fonctionnalités peuvent échouer
  HIGH: 'high',       // Erreur critique, l'extension ne peut pas fonctionner
  CRITICAL: 'critical' // Erreur fatale, nécessite une intervention immédiate
};

/**
 * Classe pour représenter une erreur de l'extension
 */
export class ExtensionError extends Error {
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
export class ErrorHandler {
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
    
    // Log détaillé en mode debug
    if (CONFIG.debug.enabled) {
      log('debug', 'Error details', error.serialize());
    }
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
    if (error.type === ErrorTypes.NETWORK) {
      // Possible retry logic ici
    }
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
export const errorHandler = new ErrorHandler();

// Fonctions utilitaires
export const handleError = (error, shouldThrow = false) => errorHandler.handleError(error, shouldThrow);
export const safeExecute = (fn, errorType, context) => errorHandler.safeExecute(fn, errorType, context);
export const createErrorWrapper = (fn, errorType, context) => errorHandler.createErrorWrapper(fn, errorType, context);