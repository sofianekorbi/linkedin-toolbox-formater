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

    return result;
  } catch (error) {
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

  // Tables de mapping Unicode Mathematical Sans-Serif Italic (plus stable sur LinkedIn)
  const italicMappings = {
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

    return result;
  } catch (error) {
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

    return result;
  } catch (error) {
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
  if (!text || typeof text !== 'string') {
    return text;
  }

  // Combining strikethrough Unicode (U+0336)
  const COMBINING_STRIKETHROUGH = '\u0336';

  try {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      // Ajouter le caractère
      result += char;
      
      // Ajouter le combining strikethrough seulement pour les caractères visibles
      // (pas pour les espaces, retours à la ligne, etc.)
      if (char.trim() !== '' && !char.match(/\s/)) {
        result += COMBINING_STRIKETHROUGH;
      }
    }

    return result;
  } catch (error) {
    return text; // Fallback vers le texte original
  }
}

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
    
    // Tables de reverse mapping pour chaque formatage
    const reverseMapping = {
      // Mathematical Bold → Normal
      '𝐀': 'A', '𝐁': 'B', '𝐂': 'C', '𝐃': 'D', '𝐄': 'E', '𝐅': 'F', '𝐆': 'G', '𝐇': 'H',
      '𝐈': 'I', '𝐉': 'J', '𝐊': 'K', '𝐋': 'L', '𝐌': 'M', '𝐍': 'N', '𝐎': 'O', '𝐏': 'P',
      '𝐐': 'Q', '𝐑': 'R', '𝐒': 'S', '𝐓': 'T', '𝐔': 'U', '𝐕': 'V', '𝐖': 'W', '𝐗': 'X',
      '𝐘': 'Y', '𝐙': 'Z',
      '𝐚': 'a', '𝐛': 'b', '𝐜': 'c', '𝐝': 'd', '𝐞': 'e', '𝐟': 'f', '𝐠': 'g', '𝐡': 'h',
      '𝐢': 'i', '𝐣': 'j', '𝐤': 'k', '𝐥': 'l', '𝐦': 'm', '𝐧': 'n', '𝐨': 'o', '𝐩': 'p',
      '𝐪': 'q', '𝐫': 'r', '𝐬': 's', '𝐭': 't', '𝐮': 'u', '𝐯': 'v', '𝐰': 'w', '𝐱': 'x',
      '𝐲': 'y', '𝐳': 'z',
      '𝟎': '0', '𝟏': '1', '𝟐': '2', '𝟑': '3', '𝟒': '4', '𝟓': '5', '𝟔': '6', '𝟕': '7', '𝟖': '8', '𝟗': '9',
      
      // Mathematical Sans-Serif Italic → Normal
      '𝘈': 'A', '𝘉': 'B', '𝘊': 'C', '𝘋': 'D', '𝘌': 'E', '𝘍': 'F', '𝘎': 'G', '𝘏': 'H',
      '𝘐': 'I', '𝘑': 'J', '𝘒': 'K', '𝘓': 'L', '𝘔': 'M', '𝘕': 'N', '𝘖': 'O', '𝘗': 'P',
      '𝘘': 'Q', '𝘙': 'R', '𝘚': 'S', '𝘛': 'T', '𝘜': 'U', '𝘝': 'V', '𝘞': 'W', '𝘟': 'X',
      '𝘠': 'Y', '𝘡': 'Z',
      '𝘢': 'a', '𝘣': 'b', '𝘤': 'c', '𝘥': 'd', '𝘦': 'e', '𝘧': 'f', '𝘨': 'g', '𝘩': 'h',
      '𝘪': 'i', '𝘫': 'j', '𝘬': 'k', '𝘭': 'l', '𝘮': 'm', '𝘯': 'n', '𝘰': 'o', '𝘱': 'p',
      '𝘲': 'q', '𝘳': 'r', '𝘴': 's', '𝘵': 't', '𝘶': 'u', '𝘷': 'v', '𝘸': 'w', '𝘹': 'x',
      '𝘺': 'y', '𝘻': 'z',
      
      // Mathematical Monospace → Normal
      '𝙰': 'A', '𝙱': 'B', '𝙲': 'C', '𝙳': 'D', '𝙴': 'E', '𝙵': 'F', '𝙶': 'G', '𝙷': 'H',
      '𝙸': 'I', '𝙹': 'J', '𝙺': 'K', '𝙻': 'L', '𝙼': 'M', '𝙽': 'N', '𝙾': 'O', '𝙿': 'P',
      '𝚀': 'Q', '𝚁': 'R', '𝚂': 'S', '𝚃': 'T', '𝚄': 'U', '𝚅': 'V', '𝚆': 'W', '𝚇': 'X',
      '𝚈': 'Y', '𝚉': 'Z',
      '𝚊': 'a', '𝚋': 'b', '𝚌': 'c', '𝚍': 'd', '𝚎': 'e', '𝚏': 'f', '𝚐': 'g', '𝚑': 'h',
      '𝚒': 'i', '𝚓': 'j', '𝚔': 'k', '𝚕': 'l', '𝚖': 'm', '𝚗': 'n', '𝚘': 'o', '𝚙': 'p',
      '𝚚': 'q', '𝚛': 'r', '𝚜': 's', '𝚝': 't', '𝚞': 'u', '𝚟': 'v', '𝚠': 'w', '𝚡': 'x',
      '𝚢': 'y', '𝚣': 'z',
      '𝟶': '0', '𝟷': '1', '𝟸': '2', '𝟹': '3', '𝟺': '4', '𝟻': '5', '𝟼': '6', '𝟽': '7', '𝟾': '8', '𝟿': '9'
    };

    // Combining characters à supprimer
    const COMBINING_UNDERLINE = '\u0332';
    const COMBINING_STRIKETHROUGH = '\u0336';

    // Parcourir chaque caractère Unicode réel (pas code unit)
    for (const char of text) {
      // Ignorer les combining characters
      if (char === COMBINING_UNDERLINE || char === COMBINING_STRIKETHROUGH) {
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
    // Constantes pour les combining characters
    const COMBINING_UNDERLINE = '\u0332';
    const COMBINING_STRIKETHROUGH = '\u0336';

    // Regex pour détecter les ranges Unicode des différents formatages
    const unicodeRanges = {
      // Mathematical Bold : 𝐀-𝐙 (U+1D400-U+1D419) + 𝐚-𝐳 (U+1D41A-U+1D433) + 𝟎-𝟗 (U+1D7CE-U+1D7D7)
      bold: /[\u{1D400}-\u{1D419}\u{1D41A}-\u{1D433}\u{1D7CE}-\u{1D7D7}]/u,
      
      // Mathematical Sans-Serif Italic : 𝘈-𝘡 (U+1D608-U+1D621) + 𝘢-𝘻 (U+1D622-U+1D63B)
      italic: /[\u{1D608}-\u{1D621}\u{1D622}-\u{1D63B}]/u,
      
      // Mathematical Monospace : 𝙰-𝚉 (U+1D670-U+1D689) + 𝚊-𝚣 (U+1D68A-U+1D6A3) + 𝟶-𝟿 (U+1D7F6-U+1D7FF)
      monospace: /[\u{1D670}-\u{1D689}\u{1D68A}-\u{1D6A3}\u{1D7F6}-\u{1D7FF}]/u
    };

    // Détection du gras (Mathematical Bold)
    if (unicodeRanges.bold.test(text)) {
      detectedFormats.push('bold');
    }

    // Détection de l'italique (Mathematical Sans-Serif Italic)
    if (unicodeRanges.italic.test(text)) {
      detectedFormats.push('italic');
    }

    // Détection du soulignement (monospace + combining underline)
    // toUnderline() utilise monospace + combining underline, donc on détecte les deux
    if (text.includes(COMBINING_UNDERLINE) || unicodeRanges.monospace.test(text)) {
      detectedFormats.push('underline');
    }

    // Détection du barré (combining strikethrough)
    if (text.includes(COMBINING_STRIKETHROUGH)) {
      detectedFormats.push('strikethrough');
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
  if (!text || typeof text !== 'string') {
    return text;
  }

  if (!existingFormats || !Array.isArray(existingFormats)) {
    existingFormats = [];
  }

  if (!newFormat || typeof newFormat !== 'string') {
    return text;
  }

  try {
    // 1. TOGGLE OFF: Si le formatage est déjà appliqué, revenir au texte normal
    if (existingFormats.includes(newFormat)) {
      return toNormal(text);
    }

    // 2. REMPLACEMENT: Si un autre formatage existe, le remplacer (pas de combinaison)
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
 * @param {string} formatType - Le type de formatage ('bold', 'italic', 'underline', 'strikethrough')
 * @returns {string} - Le texte formaté
 */
function applySimpleFormatting(text, formatType) {
  switch (formatType) {
    case 'bold':
      return toBold(text);
    case 'italic':
      return toItalic(text);
    case 'underline':
      return toUnderline(text);
    case 'strikethrough':
      return toStrikethrough(text);
    default:
      return text;
  }
}



// Export de toutes les fonctions pour utilisation dans content.js
export const formatters = {
  toBold,
  toItalic,
  toUnderline,
  toStrikethrough,
  toNormal,
  detectFormatting,
  applyIncrementalFormatting
};