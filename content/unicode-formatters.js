// LinkedIn Formateur Toolbox - Unicode Formatters
// Fonctions de formatage avec caractères Unicode spéciaux pour LinkedIn

import { createFormatters } from './unicode-factory.js';

// Générer tous les formatters via la factory
const formatters = createFormatters();

/**
 * Convertit le texte en caractères Unicode Mathematical Bold
 * Utilisé pour le formatage **gras** sur LinkedIn
 * @param {string} text - Le texte à formater
 * @returns {string} - Le texte formaté en gras Unicode
 */
export const toBold = formatters.toBold;

/**
 * Convertit le texte en caractères Unicode Mathematical Italic
 * Utilisé pour le formatage *italique* sur LinkedIn  
 * @param {string} text - Le texte à formater
 * @returns {string} - Le texte formaté en italique Unicode
 */
export const toItalic = formatters.toItalic;

/**
 * Ajoute combining underline aux caractères
 * Utilisé pour le formatage souligné sur LinkedIn
 * @param {string} text - Le texte à formater
 * @returns {string} - Le texte formaté avec soulignement Unicode
 */
export const toUnderline = formatters.toUnderline;

/**
 * Ajoute combining strikethrough aux caractères
 * Utilisé pour le formatage barré sur LinkedIn
 * @param {string} text - Le texte à formater
 * @returns {string} - Le texte formaté avec strikethrough Unicode
 */
export const toStrikethrough = formatters.toStrikethrough;

/**
 * Convertit un texte formaté vers sa forme normale
 * @param {string} text - Le texte formaté à normaliser
 * @returns {string} - Le texte en forme normale
 */
export function toNormal(text) {
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
export function detectFormatting(text) {
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
export function applyIncrementalFormatting(text, existingFormats, newFormat) {
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

// Export de toutes les fonctions pour utilisation dans content.js
export { formatters };