// LinkedIn Formateur Toolbox - Text Formatter
// Classe spécialisée pour la logique de formatage pure

import { CONFIG } from '../../config/index.js';
import { errorHandler, ExtensionError, ErrorTypes, ErrorSeverity } from '../utils/error-handler.js';
import { toBold, toItalic, toUnderline, toStrikethrough, toNormal, detectFormatting, applyIncrementalFormatting } from '../unicode-formatters.js';

/**
 * Classe pour la logique de formatage pure
 * Responsabilité: Transformer du texte selon les règles de formatage
 */
export class TextFormatter {
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
export const textFormatter = new TextFormatter();