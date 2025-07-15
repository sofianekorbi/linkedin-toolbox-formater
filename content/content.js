// LinkedIn Formateur Toolbox - Content Script
// Ce script sera injecté sur toutes les pages LinkedIn

import { selectionDetector } from './selection-detector.js';
import { toolboxUI } from './toolbox.js';
import { toBold, toItalic, toUnderline, toStrikethrough, toNormal, detectFormatting, applyIncrementalFormatting } from './unicode-formatters.js';


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

    try {
      // Vérifier qu'on est bien sur LinkedIn
      if (!this.isLinkedInPage()) {
        return;
      }

      // Initialiser le détecteur de sélection
      selectionDetector.init();
      
      // Ajouter notre handler pour les événements de sélection
      selectionDetector.addSelectionHandler(this.handleSelectionEvent);

      // Enregistrer les handlers de formatage
      this.registerFormatHandlers();

      this.isInitialized = true;

    } catch (error) {
      // Silently fail in production
    }
  }

  /**
   * Vérifie si on est sur une page LinkedIn
   */
  isLinkedInPage() {
    return window.location.hostname.includes('linkedin.com');
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
    // Handler pour le formatage gras
    toolboxUI.addFormatHandler('bold', (selectionData, formatType) => {
      this.applyFormatting(selectionData, formatType);
    });

    // Handler pour le formatage italique
    toolboxUI.addFormatHandler('italic', (selectionData, formatType) => {
      this.applyFormatting(selectionData, formatType);
    });

    // Handler pour le formatage souligné
    toolboxUI.addFormatHandler('underline', (selectionData, formatType) => {
      this.applyFormatting(selectionData, formatType);
    });

    // Handler pour le formatage barré
    toolboxUI.addFormatHandler('strikethrough', (selectionData, formatType) => {
      this.applyFormatting(selectionData, formatType);
    });
  }

  /**
   * Applique le formatage au texte sélectionné avec comportement simplifié
   */
  applyFormatting(selectionData, formatType) {
    try {
      const existingFormats = selectionData.existingFormats || [];
      
      // Utiliser la logique simplifiée pour tous les cas
      const formattedText = applyIncrementalFormatting(
        selectionData.text, 
        existingFormats, 
        formatType
      );

      // Remplacer le texte sélectionné
      this.replaceSelectedText(selectionData, formattedText);

    } catch (error) {
      // Silently fail in production
    }
  }

  /**
   * Remplace le texte sélectionné dans le champ LinkedIn
   */
  replaceSelectedText(selectionData, newText) {
    try {
      const field = selectionData.field;
      const range = selectionData.range;

      // Méthode 1: Pour les éléments contenteditable (posts, commentaires)
      if (field.contentEditable === 'true') {
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
        this.triggerLinkedInEvents(field);

      // Méthode 2: Pour les textarea et input
      } else if (field.tagName === 'TEXTAREA' || field.tagName === 'INPUT') {
        const start = field.selectionStart;
        const end = field.selectionEnd;
        const value = field.value;
        
        // Remplacer le texte sélectionné
        field.value = value.substring(0, start) + newText + value.substring(end);
        
        // Repositionner le curseur
        const newCursorPos = start + newText.length;
        field.setSelectionRange(newCursorPos, newCursorPos);
        
        // Déclencher les événements
        this.triggerLinkedInEvents(field);

      }

    } catch (error) {
      // Silently fail in production
    }
  }

  /**
   * Déclenche les événements nécessaires pour notifier LinkedIn des changements
   */
  triggerLinkedInEvents(field) {
    // Événements de base pour notifier les changements
    const events = ['input', 'change', 'keyup'];
    
    events.forEach(eventType => {
      const event = new Event(eventType, {
        bubbles: true,
        cancelable: true
      });
      field.dispatchEvent(event);
    });

    // Focus sur le champ pour maintenir l'état actif
    field.focus();
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

    // Nettoyer le détecteur de sélection
    selectionDetector.removeSelectionHandler(this.handleSelectionEvent);
    selectionDetector.destroy();

    // Nettoyer la toolbox
    toolboxUI.destroy();

    this.currentSelection = null;
    this.isInitialized = false;
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
    }, 1000);
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Export pour les tests
export { LinkedInFormatterToolbox, toolbox };