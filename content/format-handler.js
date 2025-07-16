// LinkedIn Formateur Toolbox - Format Handler
// Gestionnaire spécialisé pour l'application du formatage

import { CONFIG, log } from '../config/index.js';
import { toBold, toItalic, toUnderline, toStrikethrough, toNormal, detectFormatting, applyIncrementalFormatting } from './unicode-formatters.js';
import { errorHandler, ExtensionError, ErrorTypes, ErrorSeverity } from '../utils/error-handler.js';
import { formatOrchestrator } from '../orchestrators/format-orchestrator.js';

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

// Exporter la classe et créer une instance globale
export { FormatHandler };

// Instance globale pour l'extension
export const formatHandler = new FormatHandler();