// LinkedIn Formateur Toolbox - Configuration centralisée
// Toute la configuration de l'extension en un seul endroit

/**
 * Configuration principale de l'extension
 * Centralisée pour faciliter la maintenance et éviter les magic numbers
 */
export const CONFIG = {
  
  // ===============================
  // FORMATS SUPPORTÉS
  // ===============================
  formats: {
    // Liste des formatages supportés par l'extension
    supported: ['bold', 'italic', 'underline', 'strikethrough'],
    
    // Configuration pour chaque format
    definitions: {
      bold: {
        id: 'bold',
        label: 'B',
        tooltip: 'Gras',
        className: 'ltf-font-bold',
        shortcut: 'Ctrl+B'
      },
      italic: {
        id: 'italic',
        label: 'I',
        tooltip: 'Italique',
        className: 'ltf-italic',
        shortcut: 'Ctrl+I'
      },
      underline: {
        id: 'underline',
        label: 'U',
        tooltip: 'Souligné',
        className: 'ltf-underline',
        shortcut: 'Ctrl+U'
      },
      strikethrough: {
        id: 'strikethrough',
        label: 'S',
        tooltip: 'Barré',
        className: 'ltf-line-through',
        shortcut: 'Ctrl+Shift+S'
      }
    }
  },

  // ===============================
  // INTERFACE UTILISATEUR
  // ===============================
  ui: {
    // Configuration de la toolbox flottante
    toolbox: {
      // Dimensions
      width: 160,
      height: 40,
      buttonSize: 32,
      buttonSpacing: 4,
      
      // Positionnement
      offsetTop: 10,
      offsetBottom: 10,
      offsetSides: 10,
      
      // Animations
      animationDuration: 200,
      fadeOutDuration: 150,
      
      // Styles
      zIndex: 10000,
      cssPrefix: 'ltf-',
      
      // Couleurs
      colors: {
        background: '#ffffff',
        border: '#e1e5e9',
        text: '#666666',
        textHover: '#0a66c2',
        backgroundHover: '#f3f2ef',
        backgroundActive: '#e1e5e9'
      },
      
      // Styles CSS
      styles: {
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
        fontFamily: '-apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif',
        fontSize: '14px',
        fontWeight: '600'
      }
    },
    
    // Configuration des boutons
    buttons: {
      borderRadius: '4px',
      transition: 'all 0.1s ease',
      activeScale: 0.95,
      clickFeedbackDuration: 100
    }
  },

  // ===============================
  // ÉVÉNEMENTS
  // ===============================
  events: {
    linkedinNotification: ['input', 'change', 'keyup']
  },

  // ===============================
  // DÉTECTION DE SÉLECTION
  // ===============================
  detection: {
    // Délais et timing
    debounceDelay: 200, // Augmenté pour les sélections longues
    stabilizationDelay: 50, // Augmenté pour stabiliser les sélections multi-mots
    
    // Validation de sélection
    minSelectionLength: 1,
    maxSelectionLength: 10000,
    
    // Délais spécifiques pour les sélections multi-mots
    multiWordStabilizationDelay: 100,
    selectionProcessingDelay: 25,
    
    // Classes et attributs à exclure
    excludeClasses: [
      'ltf-extension',
      'ltf-toolbox',
      'linkedin-ads',
      'ad-banner',
      'sponsored-content'
    ],
    
    // Attributs indiquant un champ en lecture seule
    readOnlyAttributes: [
      'readonly',
      'disabled',
      'aria-readonly'
    ],
    
    // Sélecteurs CSS pour identifier les champs LinkedIn
    linkedinSelectors: [
      // Champs de création de posts
      '[data-placeholder*="partager"]',
      '[data-placeholder*="What\'s"]',
      '[data-placeholder*="share"]',
      '.ql-editor[contenteditable="true"]',
      '[role="textbox"]',
      
      // Champs de commentaires
      '[data-placeholder*="comment"]',
      '[data-placeholder*="Add a comment"]',
      '[data-placeholder*="commentaire"]',
      '.comments-comment-box__form textarea',
      '.comments-comment-texteditor',
      
      // Messages privés
      '[data-placeholder*="message"]',
      '[data-placeholder*="Write a message"]',
      '[data-placeholder*="Rédigez"]',
      '.msg-form__contenteditable',
      '.msg-form__compose',
      
      // Champs de profil et autres
      '[data-placeholder*="headline"]',
      '[data-placeholder*="summary"]',
      '[data-placeholder*="experience"]',
      'textarea[name*="summary"]',
      'textarea[name*="description"]',
      
      // Sélecteurs génériques pour LinkedIn
      'div[contenteditable="true"]',
      'textarea',
      'input[type="text"]',
      '.editor-content',
      '[data-editor="true"]'
    ],
    
    // Classes parentes LinkedIn pour validation de contexte
    contextValidation: {
      maxDepth: 10,
      linkedinClasses: [
        'feed-shared-update-v2',
        'comments-comment-box',
        'msg-form',
        'artdeco-card',
        'feed-shared-text',
        'share-creation-state',
        'editor-content'
      ]
    }
  },

  // ===============================
  // PERFORMANCE
  // ===============================
  performance: {
    // Timing critiques
    maxContentScriptInjection: 100, // ms
    maxToolboxAppearance: 50, // ms
    maxMemoryUsage: 10, // MB
    
    // Optimisations
    cleanupInterval: 30000, // 30 secondes
    maxEventListeners: 50,
    
    // Débouncing
    resizeDebounce: 250,
    scrollDebounce: 100
  },

  // ===============================
  // DÉVELOPPEMENT ET DEBUG
  // ===============================
  debug: {
    // Activé seulement en mode développement
    enabled: process.env.NODE_ENV === 'development',
    
    // Niveaux de log
    logLevel: 'info', // 'debug', 'info', 'warn', 'error'
    
    // Métriques à tracker
    trackMetrics: true,
    
    // Éléments à highlighter pour debug
    highlightElements: false,
    
    // Préfixes pour les logs
    logPrefix: '[LinkedIn Formateur]'
  },

  // ===============================
  // SÉCURITÉ
  // ===============================
  security: {
    // Domaines autorisés
    allowedDomains: [
      'linkedin.com',
      '*.linkedin.com'
    ],
    
    // Validation des entrées
    maxInputLength: 50000,
    
    // Sanitization
    allowedTags: [], // Pas de HTML dans les entrées
    
    // CSP
    contentSecurityPolicy: {
      'default-src': "'self'",
      'script-src': "'self' 'unsafe-inline'",
      'style-src': "'self' 'unsafe-inline'"
    }
  },

  // ===============================
  // CARACTÈRES UNICODE
  // ===============================
  unicode: {
    // Caractères combining
    combiningChars: {
      underline: '\u0332',
      strikethrough: '\u0336'
    },
    
    // Ranges Unicode pour détection
    ranges: {
      // Mathematical Bold
      bold: [
        '\u{1D400}-\u{1D419}', // Majuscules
        '\u{1D41A}-\u{1D433}', // Minuscules
        '\u{1D7CE}-\u{1D7D7}'  // Chiffres
      ],
      
      // Mathematical Sans-Serif Italic
      italic: [
        '\u{1D608}-\u{1D621}', // Majuscules
        '\u{1D622}-\u{1D63B}'  // Minuscules
      ],
      
      // Mathematical Monospace
      monospace: [
        '\u{1D670}-\u{1D689}', // Majuscules
        '\u{1D68A}-\u{1D6A3}', // Minuscules
        '\u{1D7F6}-\u{1D7FF}'  // Chiffres
      ]
    }
  },

  // ===============================
  // MÉTADONNÉES
  // ===============================
  meta: {
    version: '1.0.0',
    name: 'LinkedIn Formateur Toolbox',
    author: 'Sofiane Korbi',
    description: 'Extension Chrome pour formater du texte directement sur LinkedIn',
    
    // URLs
    homepage: 'https://github.com/sofiane-korbi/linkedin-formateur-toolbox',
    repository: 'https://github.com/sofiane-korbi/linkedin-formateur-toolbox',
    
    // Compatibilité
    chromeMinVersion: '88',
    manifestVersion: 3,
    
    // Mise à jour
    lastUpdated: new Date().toISOString(),
    buildNumber: Date.now()
  }
};

// ===============================
// UTILITAIRES DE CONFIGURATION
// ===============================

/**
 * Récupère une valeur de configuration avec une valeur par défaut
 * @param {string} path - Chemin vers la configuration (ex: 'ui.toolbox.width')
 * @param {*} defaultValue - Valeur par défaut si non trouvée
 * @returns {*} - La valeur de configuration
 */
export function getConfig(path, defaultValue = null) {
  const keys = path.split('.');
  let current = CONFIG;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return defaultValue;
    }
  }
  
  return current;
}

/**
 * Valide si un domaine est autorisé
 * @param {string} domain - Le domaine à valider
 * @returns {boolean} - True si autorisé
 */
export function isDomainAllowed(domain) {
  return CONFIG.security.allowedDomains.some(allowed => {
    if (allowed.startsWith('*.')) {
      return domain.endsWith(allowed.slice(2));
    }
    return domain === allowed;
  });
}

/**
 * Génère les regex pour la détection Unicode
 * @returns {Object} - Objet avec les regex par type
 */
export function generateUnicodeRegex() {
  const regex = {};
  
  Object.entries(CONFIG.unicode.ranges).forEach(([type, ranges]) => {
    const rangePattern = ranges.map(range => `[${range}]`).join('|');
    regex[type] = new RegExp(`(${rangePattern})`, 'u');
  });
  
  return regex;
}

/**
 * Log avec préfixe et niveau
 * @param {string} level - Niveau de log ('debug', 'info', 'warn', 'error')
 * @param {string} message - Message à logger
 * @param {...any} args - Arguments supplémentaires
 */
export function log(level, message, ...args) {
  if (!CONFIG.debug.enabled) return;
  
  const levels = ['debug', 'info', 'warn', 'error'];
  const currentLevelIndex = levels.indexOf(CONFIG.debug.logLevel);
  const messageLevelIndex = levels.indexOf(level);
  
  if (messageLevelIndex >= currentLevelIndex) {
    const prefix = CONFIG.debug.logPrefix;
    const timestamp = new Date().toISOString();
    console[level](`${prefix} [${timestamp}] ${message}`, ...args);
  }
}

// Export par défaut
export default CONFIG;