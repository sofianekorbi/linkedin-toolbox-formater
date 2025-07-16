// LinkedIn Formateur Toolbox - Format Handler
// Gestionnaire spécialisé pour l'application du formatage

import { CONFIG, log } from '../config/index.js';
import { toBold, toItalic, toUnderline, toStrikethrough, toNormal, detectFormatting, applyIncrementalFormatting } from './unicode-formatters.js';

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
  applyFormatting(selectionData, formatType) {
    try {
      const existingFormats = selectionData.existingFormats || [];
      
      log('info', 'Applying formatting', { 
        formatType, 
        existingFormats,
        textLength: selectionData.text.length
      });
      
      // Utiliser la logique simplifiée pour tous les cas
      const formattedText = applyIncrementalFormatting(
        selectionData.text, 
        existingFormats, 
        formatType
      );

      // Remplacer le texte sélectionné
      this.replaceSelectedText(selectionData, formattedText);

      return true;

    } catch (error) {
      log('error', 'Failed to apply formatting', { formatType, error });
      return false;
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
        this.handleContentEditableField(field, range, newText);
      // Méthode 2: Pour les textarea et input
      } else if (field.tagName === 'TEXTAREA' || field.tagName === 'INPUT') {
        this.handleInputField(field, newText);
      }

    } catch (error) {
      log('error', 'Failed to replace selected text', error);
    }
  }

  /**
   * Gère les champs contenteditable
   */
  handleContentEditableField(field, range, newText) {
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
  }

  /**
   * Gère les champs input/textarea
   */
  handleInputField(field, newText) {
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

  /**
   * Déclenche les événements nécessaires pour notifier LinkedIn des changements
   */
  triggerLinkedInEvents(field) {
    // Événements de base pour notifier les changements
    const events = CONFIG.events.linkedinNotification;
    
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
   * Détecte les formatages existants dans le texte
   */
  detectExistingFormats(text) {
    return detectFormatting(text);
  }
}

// Exporter la classe et créer une instance globale
export { FormatHandler };

// Instance globale pour l'extension
export const formatHandler = new FormatHandler();