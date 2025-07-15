// LinkedIn Formateur Toolbox - Unicode Factory
// Factory pattern pour éliminer les répétitions dans les formatages Unicode

/**
 * Mappings Unicode directs (approche sûre qui fonctionne)
 */
const UNICODE_MAPPINGS = {
  bold: {
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
  },
  
  italic: {
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
  },
  
  monospace: {
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
  }
};

/**
 * Caractères combining pour soulignement et barré
 */
const COMBINING_CHARS = {
  underline: '\u0332',      // Combining underline
  strikethrough: '\u0336'   // Combining strikethrough
};

/**
 * Table de normalisation des caractères accentués
 */
const ACCENT_NORMALIZATION = {
  // Lettres majuscules accentuées
  'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A', 'Æ': 'A',
  'Ç': 'C',
  'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E',
  'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I',
  'Ñ': 'N',
  'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O', 'Ø': 'O',
  'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U',
  'Ý': 'Y', 'Ÿ': 'Y',
  
  // Lettres minuscules accentuées
  'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a', 'æ': 'a',
  'ç': 'c',
  'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
  'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
  'ñ': 'n',
  'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o', 'ø': 'o',
  'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
  'ý': 'y', 'ÿ': 'y'
};

/**
 * Normalise un caractère accentué vers sa forme de base
 * @param {string} char - Le caractère à normaliser
 * @returns {string} - Le caractère normalisé ou original
 */
function normalizeAccent(char) {
  return ACCENT_NORMALIZATION[char] || char;
}

/**
 * Factory pour créer des formatters Unicode avec mappings directs
 * @param {Object} mappings - Table de mapping direct des caractères
 * @returns {Function} - Fonction de formatage
 */
function createUnicodeFormatter(mappings) {
  return function(text) {
    if (!text || typeof text !== 'string') {
      return text;
    }

    try {
      let result = '';
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        // Essayer d'abord le caractère original
        let unicodeChar = mappings[char];
        
        // Si pas trouvé, essayer la version sans accent
        if (!unicodeChar) {
          const normalizedChar = normalizeAccent(char);
          unicodeChar = mappings[normalizedChar];
        }
        
        result += unicodeChar || char; // Unicode, ou caractère original si pas de mapping
      }
      return result;
    } catch (error) {
      return text; // Fallback vers le texte original
    }
  };
}

/**
 * Factory pour créer des formatters avec combining characters
 * @param {string} combiningChar - Le caractère combining à utiliser
 * @param {Object} baseMappings - Mappings Unicode pour la base (optionnel)
 * @returns {Function} - Fonction de formatage
 */
function createCombiningFormatter(combiningChar, baseMappings = null) {
  return function(text) {
    if (!text || typeof text !== 'string') {
      return text;
    }

    try {
      let result = '';
      
      // Si des mappings de base sont spécifiés, d'abord appliquer la transformation
      const baseText = baseMappings ? createUnicodeFormatter(baseMappings)(text) : text;
      
      for (let i = 0; i < baseText.length; i++) {
        const char = baseText[i];
        result += char;
        
        // Ajouter le combining character seulement pour les caractères visibles
        if (char.trim() !== '' && !char.match(/\s/)) {
          result += combiningChar;
        }
      }

      return result;
    } catch (error) {
      return text; // Fallback vers le texte original
    }
  };
}

/**
 * Crée un reverse mapper pour convertir vers le texte normal
 * @param {Object} mappings - Table de mapping Unicode vers normal
 * @returns {Object} - Map de caractères Unicode vers caractères normaux
 */
function createReverseMap(mappings) {
  const reverseMap = {};
  
  // Inverser le mapping : Unicode → Normal
  Object.entries(mappings).forEach(([normalChar, unicodeChar]) => {
    reverseMap[unicodeChar] = normalChar;
  });
  
  return reverseMap;
}

/**
 * Génère tous les reverse maps pour tous les formatages
 */
function createGlobalReverseMap() {
  const globalMap = {};
  
  Object.entries(UNICODE_MAPPINGS).forEach(([type, mappings]) => {
    const reverseMap = createReverseMap(mappings);
    Object.assign(globalMap, reverseMap);
  });

  return globalMap;
}

/**
 * Factory principale qui génère tous les formatters
 */
function createFormatters() {
  return {
    // Formatters directs avec mappings sûrs
    toBold: createUnicodeFormatter(UNICODE_MAPPINGS.bold),
    toItalic: createUnicodeFormatter(UNICODE_MAPPINGS.italic),
    
    // Formatters avec combining characters  
    toUnderline: function(text) {
      if (!text || typeof text !== 'string') return text;
      
      try {
        let result = '';
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          
          // Essayer d'abord le caractère original
          let monospaceChar = UNICODE_MAPPINGS.monospace[char];
          
          // Si pas trouvé, essayer la version sans accent
          if (!monospaceChar) {
            const normalizedChar = normalizeAccent(char);
            monospaceChar = UNICODE_MAPPINGS.monospace[normalizedChar];
          }
          
          if (monospaceChar) {
            // Caractère monospace + combining underline
            result += monospaceChar + COMBINING_CHARS.underline;
          } else if (char === ' ') {
            result += char; // Garder les espaces normaux
          } else {
            // Pour les caractères non mappés, utiliser le caractère original + underline
            result += char + COMBINING_CHARS.underline;
          }
        }
        return result;
      } catch (error) {
        return text;
      }
    },
    toStrikethrough: createCombiningFormatter(COMBINING_CHARS.strikethrough),
    
    // Reverse mapper global
    reverseMap: createGlobalReverseMap(),
    
    // Combining characters pour le nettoyage
    combiningChars: Object.values(COMBINING_CHARS)
  };
}

// Export des utilitaires et configuration
export {
  UNICODE_MAPPINGS,
  COMBINING_CHARS,
  createUnicodeFormatter,
  createCombiningFormatter,
  createReverseMap,
  createFormatters
};