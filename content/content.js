// LinkedIn Formateur Toolbox - Content Script
// Ce script sera injecté sur toutes les pages LinkedIn

import { CONFIG, isDomainAllowed, log } from '../config/index.js';
import { selectionDetector } from './selection-detector.js';
import { toolboxUI } from './toolbox.js';
import { formatHandler } from './format-handler.js';
import { detectFormatting } from './unicode-formatters.js';
import { errorHandler, ExtensionError, ErrorTypes, ErrorSeverity } from './utils/error-handler.js';


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
      log('info', 'Initializing LinkedIn Formatter Toolbox');
      
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
      log('info', 'LinkedIn Formatter Toolbox initialized successfully');

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

    log('info', 'Text deselected');
    
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

    log('info', 'Destroying LinkedIn Formatter Toolbox');

    // Nettoyer le détecteur de sélection
    selectionDetector.removeSelectionHandler(this.handleSelectionEvent);
    selectionDetector.destroy();

    // Nettoyer la toolbox
    toolboxUI.destroy();

    this.currentSelection = null;
    this.isInitialized = false;
    
    log('info', 'LinkedIn Formatter Toolbox destroyed');
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

// Export pour les tests
export { LinkedInFormatterToolbox, toolbox };