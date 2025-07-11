// LinkedIn Formateur Toolbox - Unicode Formatters
// Fonctions de formatage avec caractères Unicode spéciaux pour LinkedIn

/**
 * Convertit le texte en caractères Unicode Mathematical Bold
 * Utilisé pour le formatage **gras** sur LinkedIn
 * @param {string} text - Le texte à formater
 * @returns {string} - Le texte formaté en gras Unicode
 */
export function toBold(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // Tables de mapping Unicode Mathematical Bold
  const boldMappings = {
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
  };

  try {
    // Transformer chaque caractère
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const boldChar = boldMappings[char];
      result += boldChar || char; // Utiliser le caractère gras ou le caractère original
    }

    console.log('✅ Texte formaté en gras:', { original: text, bold: result });
    return result;
  } catch (error) {
    console.error('❌ Erreur lors du formatage en gras:', error);
    return text; // Fallback vers le texte original
  }
}

/**
 * Convertit le texte en caractères Unicode Mathematical Italic
 * Utilisé pour le formatage *italique* sur LinkedIn  
 * @param {string} text - Le texte à formater
 * @returns {string} - Le texte formaté en italique Unicode
 */
export function toItalic(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // Tables de mapping Unicode Mathematical Italic
  const italicMappings = {
    // Lettres majuscules A-Z → 𝐴-𝑍 (U+1D434-U+1D44D)
    'A': '𝐴', 'B': '𝐵', 'C': '𝐶', 'D': '𝐷', 'E': '𝐸', 'F': '𝐹', 'G': '𝐺', 'H': '𝐻',
    'I': '𝐼', 'J': '𝐽', 'K': '𝐾', 'L': '𝐿', 'M': '𝑀', 'N': '𝑁', 'O': '𝑂', 'P': '𝑃',
    'Q': '𝑄', 'R': '𝑅', 'S': '𝑆', 'T': '𝑇', 'U': '𝑈', 'V': '𝑉', 'W': '𝑊', 'X': '𝑋',
    'Y': '𝑌', 'Z': '𝑍',
    
    // Lettres minuscules a-z → 𝑎-𝑧 (U+1D44E-U+1D467)
    'a': '𝑎', 'b': '𝑏', 'c': '𝑐', 'd': '𝑑', 'e': '𝑒', 'f': '𝑓', 'g': '𝑔', 'h': '𝒉',
    'i': '𝑖', 'j': '𝑗', 'k': '𝑘', 'l': '𝑙', 'm': '𝑚', 'n': '𝑛', 'o': '𝑜', 'p': '𝑝',
    'q': '𝑞', 'r': '𝑟', 's': '𝑠', 't': '𝑡', 'u': '𝑢', 'v': '𝑣', 'w': '𝑤', 'x': '𝑥',
    'y': '𝑦', 'z': '𝑧'
    
    // Note: Les chiffres n'ont pas d'équivalent italique dans Unicode Mathematical
    // Ils restent en forme normale
  };

  try {
    // Transformer chaque caractère
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const italicChar = italicMappings[char];
      result += italicChar || char; // Utiliser le caractère italique ou le caractère original
    }

    console.log('✅ Texte formaté en italique:', { original: text, italic: result });
    return result;
  } catch (error) {
    console.error('❌ Erreur lors du formatage en italique:', error);
    return text; // Fallback vers le texte original
  }
}

/**
 * Ajoute combining underline aux caractères
 * Utilisé pour le formatage souligné sur LinkedIn
 * @param {string} text - Le texte à formater
 * @returns {string} - Le texte formaté avec soulignement Unicode
 */
export function toUnderline(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // Approche optimale : Mathematical Monospace + Combining Underline
  // Comme dans ton exemple : 𝚄̲𝚗̲𝚍̲𝚎̲𝚛̲𝚕̲𝚒̲𝚗̲𝚎̲
  const monospaceMap = {
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
  };

  // Combining underline Unicode (U+0332)
  const COMBINING_UNDERLINE = '\u0332';

  try {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const monospaceChar = monospaceMap[char];
      
      if (monospaceChar) {
        // Caractère monospace + combining underline
        result += monospaceChar + COMBINING_UNDERLINE;
      } else if (char === ' ') {
        result += char; // Garder les espaces normaux
      } else {
        // Pour les caractères non mappés, utiliser le caractère original + underline
        result += char + COMBINING_UNDERLINE;
      }
    }

    console.log('✅ Texte formaté avec Mathematical Monospace + Underline:', { 
      original: text, 
      underlined: result,
      method: 'monospace_with_combining_underline'
    });
    return result;
  } catch (error) {
    console.error('❌ Erreur lors du formatage souligné:', error);
    return text; // Fallback vers le texte original
  }
}

/**
 * Ajoute combining strikethrough aux caractères
 * Utilisé pour le formatage barré sur LinkedIn
 * @param {string} text - Le texte à formater
 * @returns {string} - Le texte formaté avec strikethrough Unicode
 */
export function toStrikethrough(text) {
  // À implémenter dans LIN-18
  // Ajout du caractère combining strikethrough après chaque caractère
  console.log('🔨 toStrikethrough() - À implémenter dans LIN-18');
  return text; // Placeholder
}

/**
 * Détecte le type de formatage appliqué à un texte
 * @param {string} text - Le texte à analyser
 * @returns {Array<string>} - Liste des formatages détectés
 */
export function detectFormatting(text) {
  // À implémenter dans LIN-21 (formatages combinés)
  const detectedFormats = [];
  
  // Détection du gras (Mathematical Bold)
  // if (text.match(/[𝐀-𝐙𝐚-𝐳𝟎-𝟗]/)) {
  //   detectedFormats.push('bold');
  // }
  
  // Détection de l'italique (Mathematical Italic)
  // if (text.match(/[𝐴-𝑍𝑎-𝑧]/)) {
  //   detectedFormats.push('italic');
  // }
  
  // Détection du soulignement (combining underline)
  // if (text.includes('\\u0332')) {
  //   detectedFormats.push('underline');
  // }
  
  // Détection du barré (combining strikethrough)
  // if (text.includes('\\u0336')) {
  //   detectedFormats.push('strikethrough');
  // }
  
  console.log('🔨 detectFormatting() - À implémenter dans LIN-21');
  return detectedFormats;
}

/**
 * Combine plusieurs formatages sur un même texte
 * @param {string} text - Le texte à formater
 * @param {Array<string>} formats - Liste des formatages à appliquer
 * @returns {string} - Le texte avec formatages combinés
 */
export function combineFormatting(text, formats) {
  // À implémenter dans LIN-21 (formatages combinés)
  let formattedText = text;
  
  // Appliquer les formatages dans l'ordre optimal
  // 1. D'abord les transformations de caractères (gras, italique)
  // 2. Ensuite les combining characters (soulignement, barré)
  
  console.log('🔨 combineFormatting() - À implémenter dans LIN-21');
  return formattedText;
}

/**
 * Utilitaire pour mapper un caractère vers son équivalent Unicode
 * @param {string} char - Le caractère à mapper
 * @param {string} type - Le type de formatage ('bold', 'italic')
 * @returns {string} - Le caractère Unicode correspondant
 */
export function mapCharacter(char, type) {
  // Tables de mapping à implémenter dans LIN-18
  const mappings = {
    bold: {
      // A-Z: U+1D400-U+1D419
      // a-z: U+1D41A-U+1D433  
      // 0-9: U+1D7CE-U+1D7D7
    },
    italic: {
      // A-Z: U+1D434-U+1D44D
      // a-z: U+1D44E-U+1D467
    }
  };
  
  console.log('🔨 mapCharacter() - À implémenter dans LIN-18');
  return char; // Placeholder
}

// Export de toutes les fonctions pour utilisation dans content.js
export const formatters = {
  toBold,
  toItalic,
  toUnderline,
  toStrikethrough,
  detectFormatting,
  combineFormatting,
  mapCharacter
};