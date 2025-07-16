// LinkedIn Formateur Toolbox - Format Orchestrator
// Classe d'orchestration pour coordonner le formatage

import { CONFIG, log } from '../../config/index.js';
import { errorHandler, ExtensionError, ErrorTypes, ErrorSeverity } from '../utils/error-handler.js';
import { textFormatter } from '../formatters/text-formatter.js';
import { uiManager } from '../ui/ui-manager.js';

/**
 * Classe d'orchestration pour le formatage
 * Responsabilité: Coordonner les différents composants pour le formatage
 */
export class FormatOrchestrator {
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
    log('info', 'Format orchestrator cleaned up');
  }
}

// Instance globale
export const formatOrchestrator = new FormatOrchestrator();