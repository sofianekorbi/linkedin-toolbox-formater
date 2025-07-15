// LinkedIn Formateur Toolbox - Selection Detector
// Détection intelligente de la sélection de texte dans les champs LinkedIn

/**
 * Sélecteurs pour identifier les champs de saisie LinkedIn
 * Ces sélecteurs sont basés sur l'analyse de la structure DOM de LinkedIn
 */
const LINKEDIN_INPUT_SELECTORS = [
  // Champs de création de posts
  '[data-placeholder*="partager"]',
  '[data-placeholder*="What\'s"]',
  '[data-placeholder*="share"]',
  '.ql-editor[contenteditable="true"]', // Editeur principal
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
];

/**
 * Configuration de la détection
 */
const DETECTION_CONFIG = {
  // Délai minimum avant de considérer une nouvelle sélection
  debounceDelay: 100,
  
  // Longueur minimale de texte sélectionné
  minSelectionLength: 1,
  
  // Classes LinkedIn à éviter (pour ne pas interférer)
  excludeClasses: [
    'lt-extension',
    'ltf-toolbox',
    'linkedin-ads',
    'ad-banner'
  ],
  
  // Attributs indiquant un champ en lecture seule
  readOnlyAttributes: [
    'readonly',
    'disabled',
    'aria-readonly'
  ]
};

/**
 * Classe principale pour la détection de sélection
 */
class SelectionDetector {
  constructor() {
    this.isInitialized = false;
    this.currentSelection = null;
    this.currentField = null;
    this.selectionHandlers = new Set();
    this.debounceTimer = null;
    
    // Bind methods
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  /**
   * Initialise la détection de sélection
   */
  init() {
    if (this.isInitialized) {
      return;
    }

    
    // Événements globaux
    document.addEventListener('selectionchange', this.handleSelectionChange, true);
    document.addEventListener('mouseup', this.handleMouseUp, true);
    document.addEventListener('keyup', this.handleKeyUp, true);
    
    // Observer pour les nouveaux champs (LinkedIn SPA)
    this.observeNewFields();
    
    this.isInitialized = true;
  }

  /**
   * Observer pour détecter les nouveaux champs LinkedIn (SPA)
   */
  observeNewFields() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.checkForLinkedInFields(node);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Check initial fields
    this.checkForLinkedInFields(document.body);
  }

  /**
   * Vérifie s'il y a de nouveaux champs LinkedIn dans un élément
   */
  checkForLinkedInFields(element) {
    LINKEDIN_INPUT_SELECTORS.forEach(selector => {
      try {
        const fields = element.querySelectorAll(selector);
        fields.forEach(field => {
          if (!field.hasAttribute('data-ltf-monitored')) {
            this.monitorField(field);
          }
        });
      } catch (error) {
        // Sélecteur invalide, on l'ignore
      }
    });
  }

  /**
   * Ajoute la surveillance à un champ spécifique
   */
  monitorField(field) {
    if (!this.isValidLinkedInField(field)) {
      return;
    }

    field.setAttribute('data-ltf-monitored', 'true');
  }

  /**
   * Vérifie si c'est un champ LinkedIn valide
   */
  isValidLinkedInField(field) {
    // Vérifier si c'est en lecture seule
    for (const attr of DETECTION_CONFIG.readOnlyAttributes) {
      if (field.hasAttribute(attr) && field.getAttribute(attr) !== 'false') {
        return false;
      }
    }

    // Vérifier les classes à exclure
    for (const className of DETECTION_CONFIG.excludeClasses) {
      if (field.classList.contains(className)) {
        return false;
      }
    }

    // Vérifier si c'est dans le contexte LinkedIn
    return this.isInLinkedInContext(field);
  }

  /**
   * Vérifie si l'élément est dans le contexte LinkedIn
   */
  isInLinkedInContext(element) {
    // Vérifier l'URL
    if (!window.location.hostname.includes('linkedin.com')) {
      return false;
    }

    // Vérifier les classes parentes LinkedIn
    let parent = element.parentElement;
    let depth = 0;
    const maxDepth = 10;

    while (parent && depth < maxDepth) {
      const classList = parent.classList;
      
      // Classes LinkedIn communes
      if (classList.contains('feed-shared-update-v2') ||
          classList.contains('comments-comment-box') ||
          classList.contains('msg-form') ||
          classList.contains('artdeco-card') ||
          classList.contains('feed-shared-text')) {
        return true;
      }

      parent = parent.parentElement;
      depth++;
    }

    return true; // Par défaut, accepter si on est sur LinkedIn
  }

  /**
   * Gestionnaire principal des changements de sélection
   */
  handleSelectionChange(event) {
    this.debounceSelectionChange();
  }

  /**
   * Gestionnaire mouseup pour détecter les sélections à la souris
   */
  handleMouseUp(event) {
    // Délai court pour laisser la sélection se stabiliser
    setTimeout(() => {
      this.processSelection();
    }, 10);
  }

  /**
   * Gestionnaire keyup pour détecter les sélections au clavier
   */
  handleKeyUp(event) {
    // Seulement pour les touches de navigation et sélection
    const selectionKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Shift'];
    
    if (selectionKeys.includes(event.key) || event.shiftKey) {
      this.debounceSelectionChange();
    }
  }

  /**
   * Debounce les changements de sélection pour éviter le spam
   */
  debounceSelectionChange() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.processSelection();
    }, DETECTION_CONFIG.debounceDelay);
  }

  /**
   * Traite la sélection actuelle
   */
  processSelection() {
    const selection = window.getSelection();
    
    if (!selection || selection.rangeCount === 0) {
      this.clearSelection();
      return;
    }

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();

    // Vérifier la longueur minimale
    if (selectedText.length < DETECTION_CONFIG.minSelectionLength) {
      this.clearSelection();
      return;
    }

    // Vérifier si la sélection est dans un champ LinkedIn
    const commonAncestor = range.commonAncestorContainer;
    const field = this.findLinkedInField(commonAncestor);

    if (!field) {
      this.clearSelection();
      return;
    }

    // Nouvelle sélection valide détectée
    this.setSelection({
      text: selectedText,
      range: range,
      field: field,
      fieldInfo: this.getFieldInfo(field)
    });
  }

  /**
   * Trouve le champ LinkedIn parent de l'élément
   */
  findLinkedInField(element) {
    let current = element;
    let depth = 0;
    const maxDepth = 15;

    while (current && depth < maxDepth) {
      if (current.nodeType === Node.ELEMENT_NODE) {
        // Vérifier si c'est un champ surveillé
        if (current.hasAttribute('data-ltf-monitored')) {
          return current;
        }

        // Vérifier avec les sélecteurs
        for (const selector of LINKEDIN_INPUT_SELECTORS) {
          try {
            if (current.matches(selector) && this.isValidLinkedInField(current)) {
              this.monitorField(current); // L'ajouter à la surveillance
              return current;
            }
          } catch (error) {
            // Sélecteur invalide
          }
        }
      }

      current = current.parentElement;
      depth++;
    }

    return null;
  }

  /**
   * Obtient les informations sur un champ
   */
  getFieldInfo(field) {
    return {
      tagName: field.tagName.toLowerCase(),
      type: field.type || 'unknown',
      placeholder: field.getAttribute('placeholder') || field.getAttribute('data-placeholder') || '',
      role: field.getAttribute('role') || '',
      classes: Array.from(field.classList),
      id: field.id || '',
      isContentEditable: field.contentEditable === 'true'
    };
  }

  /**
   * Définit une nouvelle sélection
   */
  setSelection(selectionData) {
    this.currentSelection = selectionData;
    this.currentField = selectionData.field;


    // Notifier les handlers
    this.notifySelectionHandlers('selection', selectionData);
  }

  /**
   * Efface la sélection actuelle
   */
  clearSelection() {
    if (this.currentSelection) {
      
      // Notifier les handlers
      this.notifySelectionHandlers('deselection', {
        previousSelection: this.currentSelection
      });

      this.currentSelection = null;
      this.currentField = null;
    }
  }

  /**
   * Ajoute un handler pour les événements de sélection
   */
  addSelectionHandler(handler) {
    this.selectionHandlers.add(handler);
  }

  /**
   * Supprime un handler
   */
  removeSelectionHandler(handler) {
    this.selectionHandlers.delete(handler);
  }

  /**
   * Notifie tous les handlers
   */
  notifySelectionHandlers(type, data) {
    this.selectionHandlers.forEach(handler => {
      try {
        handler(type, data);
      } catch (error) {
      }
    });
  }

  /**
   * Obtient la sélection actuelle
   */
  getCurrentSelection() {
    return this.currentSelection;
  }

  /**
   * Obtient le champ actuel
   */
  getCurrentField() {
    return this.currentField;
  }

  /**
   * Nettoie et détruit le détecteur
   */
  destroy() {
    if (!this.isInitialized) return;

    document.removeEventListener('selectionchange', this.handleSelectionChange, true);
    document.removeEventListener('mouseup', this.handleMouseUp, true);
    document.removeEventListener('keyup', this.handleKeyUp, true);

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.selectionHandlers.clear();
    this.currentSelection = null;
    this.currentField = null;
    this.isInitialized = false;

  }
}

// Instance globale pour l'extension
const selectionDetector = new SelectionDetector();

// LinkedIn Formateur Toolbox - Toolbox UI Component
// Interface utilisateur de la toolbox flottante

/**
 * Configuration de la toolbox
 */
const TOOLBOX_CONFIG = {
  // Dimensions
  width: 160,
  height: 40,
  buttonSize: 32,
  // Positionnement
  offsetTop: 10,
  offsetBottom: 10,
  offsetSides: 10,
  
  // Animations
  animationDuration: 200,
  fadeOutDuration: 150,
  
  // Z-index
  zIndex: 10000,
  
  // Classes CSS
  cssPrefix: 'ltf-',
  
  // Boutons de formatage
  buttons: [
    {
      id: 'bold',
      label: 'B',
      tooltip: 'Gras',
      className: 'ltf-font-bold'
    },
    {
      id: 'italic',
      label: 'I',
      tooltip: 'Italique', 
      className: 'ltf-italic'
    },
    {
      id: 'underline',
      label: 'U',
      tooltip: 'Souligné',
      className: 'ltf-underline'
    },
    {
      id: 'strikethrough',
      label: 'S',
      tooltip: 'Barré',
      className: 'ltf-line-through'
    }
  ]
};

/**
 * Classe principale pour la toolbox flottante
 */
class ToolboxUI {
  constructor() {
    this.isVisible = false;
    this.toolboxElement = null;
    this.currentSelection = null;
    this.formatHandlers = new Map();
    this.isAnimating = false;
    
    // Bind methods
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handleButtonClick = this.handleButtonClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    
    // Initialisation
    this.init();
  }

  /**
   * Initialise la toolbox
   */
  init() {
    
    // Créer l'élément toolbox
    this.createToolboxElement();
    
    // Ajouter les événements globaux
    document.addEventListener('click', this.handleDocumentClick, true);
    document.addEventListener('keydown', this.handleKeyDown, true);
    
  }

  /**
   * Crée l'élément DOM de la toolbox
   */
  createToolboxElement() {
    // Supprimer l'ancienne toolbox si elle existe
    if (this.toolboxElement) {
      this.toolboxElement.remove();
    }

    // Créer le conteneur principal
    this.toolboxElement = document.createElement('div');
    this.toolboxElement.id = 'ltf-toolbox';
    this.toolboxElement.className = `
      ${TOOLBOX_CONFIG.cssPrefix}fixed
      ${TOOLBOX_CONFIG.cssPrefix}bg-toolbox-bg
      ${TOOLBOX_CONFIG.cssPrefix}border
      ${TOOLBOX_CONFIG.cssPrefix}border-toolbox-border
      ${TOOLBOX_CONFIG.cssPrefix}rounded-toolbox
      ${TOOLBOX_CONFIG.cssPrefix}shadow-toolbox
      ${TOOLBOX_CONFIG.cssPrefix}flex
      ${TOOLBOX_CONFIG.cssPrefix}items-center
      ${TOOLBOX_CONFIG.cssPrefix}gap-1
      ${TOOLBOX_CONFIG.cssPrefix}p-1
      ${TOOLBOX_CONFIG.cssPrefix}opacity-0
      ${TOOLBOX_CONFIG.cssPrefix}pointer-events-none
      ${TOOLBOX_CONFIG.cssPrefix}transition-all
      ${TOOLBOX_CONFIG.cssPrefix}duration-200
    `.trim().replace(/\s+/g, ' ');

    // Styles inline pour garantir le bon affichage
    this.toolboxElement.style.cssText = `
      position: fixed;
      z-index: ${TOOLBOX_CONFIG.zIndex};
      width: ${TOOLBOX_CONFIG.width}px;
      height: ${TOOLBOX_CONFIG.height}px;
      background: #ffffff;
      border: 1px solid #e1e5e9;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px;
      opacity: 0;
      pointer-events: none;
      transition: all 0.2s ease-out;
      transform: translateY(8px);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;

    // Créer les boutons
    this.createButtons();

    // Ajouter au DOM (mais invisible)
    document.body.appendChild(this.toolboxElement);
  }

  /**
   * Crée les boutons de formatage
   */
  createButtons() {
    TOOLBOX_CONFIG.buttons.forEach(buttonConfig => {
      const button = document.createElement('button');
      button.id = `ltf-btn-${buttonConfig.id}`;
      button.className = `ltf-toolbox-btn ltf-btn-${buttonConfig.id}`;
      button.setAttribute('data-format', buttonConfig.id);
      button.setAttribute('title', buttonConfig.tooltip);
      button.textContent = buttonConfig.label;

      // Styles inline pour les boutons
      button.style.cssText = `
        width: ${TOOLBOX_CONFIG.buttonSize}px;
        height: ${TOOLBOX_CONFIG.buttonSize}px;
        border: none;
        border-radius: 4px;
        background: transparent;
        color: #666666;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.1s ease;
        user-select: none;
        -webkit-user-select: none;
      `;

      // Ajouter les styles spécifiques au bouton
      if (buttonConfig.className) {
        if (buttonConfig.id === 'bold') {
          button.style.fontWeight = 'bold';
        } else if (buttonConfig.id === 'italic') {
          button.style.fontStyle = 'italic';
        } else if (buttonConfig.id === 'underline') {
          button.style.textDecoration = 'underline';
        } else if (buttonConfig.id === 'strikethrough') {
          button.style.textDecoration = 'line-through';
        }
      }

      // Événements hover
      button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = '#f3f2ef';
        button.style.color = '#0a66c2';
      });

      button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = 'transparent';
        button.style.color = '#666666';
      });

      // Événement clic
      button.addEventListener('click', this.handleButtonClick);

      this.toolboxElement.appendChild(button);
    });
  }

  /**
   * Affiche la toolbox à la position du texte sélectionné
   */
  show(selectionData) {
    if (this.isAnimating) return;

    this.currentSelection = selectionData;
    this.isVisible = true;


    // Calculer la position
    const position = this.calculatePosition(selectionData);
    
    // Positionner la toolbox
    this.toolboxElement.style.left = position.x + 'px';
    this.toolboxElement.style.top = position.y + 'px';

    // Afficher avec animation
    this.animateShow();
  }

  /**
   * Calcule la position optimale pour la toolbox
   */
  calculatePosition(selectionData) {
    const range = selectionData.range;
    const rect = range.getBoundingClientRect();
    
    // Position par défaut : au-dessus du texte sélectionné
    let x = rect.left + (rect.width / 2) - (TOOLBOX_CONFIG.width / 2);
    let y = rect.top - TOOLBOX_CONFIG.height - TOOLBOX_CONFIG.offsetTop;

    // Ajustements pour les débordements
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Ajustement horizontal
    if (x < TOOLBOX_CONFIG.offsetSides) {
      x = TOOLBOX_CONFIG.offsetSides;
    } else if (x + TOOLBOX_CONFIG.width > viewport.width - TOOLBOX_CONFIG.offsetSides) {
      x = viewport.width - TOOLBOX_CONFIG.width - TOOLBOX_CONFIG.offsetSides;
    }

    // Ajustement vertical - si pas assez de place en haut, mettre en bas
    if (y < TOOLBOX_CONFIG.offsetTop) {
      y = rect.bottom + TOOLBOX_CONFIG.offsetBottom;
    }

    // Vérifier que la toolbox reste dans le viewport
    if (y + TOOLBOX_CONFIG.height > viewport.height - TOOLBOX_CONFIG.offsetBottom) {
      y = viewport.height - TOOLBOX_CONFIG.height - TOOLBOX_CONFIG.offsetBottom;
    }

    return { x, y };
  }

  /**
   * Animation d'apparition
   */
  animateShow() {
    this.isAnimating = true;
    
    // Activer les interactions
    this.toolboxElement.style.pointerEvents = 'auto';
    
    // Animation slide-up + fade-in
    this.toolboxElement.style.opacity = '1';
    this.toolboxElement.style.transform = 'translateY(0)';

    // Fin de l'animation
    setTimeout(() => {
      this.isAnimating = false;
    }, TOOLBOX_CONFIG.animationDuration);
  }

  /**
   * Masque la toolbox
   */
  hide() {
    if (!this.isVisible || this.isAnimating) return;

    this.isVisible = false;
    this.isAnimating = true;


    // Animation fade-out
    this.toolboxElement.style.opacity = '0';
    this.toolboxElement.style.transform = 'translateY(8px)';
    this.toolboxElement.style.pointerEvents = 'none';

    // Nettoyage après animation
    setTimeout(() => {
      this.currentSelection = null;
      this.isAnimating = false;
    }, TOOLBOX_CONFIG.fadeOutDuration);
  }

  /**
   * Gère les clics sur les boutons
   */
  handleButtonClick(event) {
    event.preventDefault();
    event.stopPropagation();

    const button = event.currentTarget;
    const formatType = button.getAttribute('data-format');


    // Ajouter effet visuel de clic
    button.style.backgroundColor = '#e1e5e9';
    setTimeout(() => {
      button.style.backgroundColor = 'transparent';
    }, 100);

    // Déclencher le formatage
    this.triggerFormatting(formatType);

    // Masquer la toolbox
    this.hide();
  }

  /**
   * Déclenche le formatage du texte
   */
  triggerFormatting(formatType) {
    if (!this.currentSelection) return;


    // Notifier les handlers enregistrés
    if (this.formatHandlers.has(formatType)) {
      const handler = this.formatHandlers.get(formatType);
      try {
        handler(this.currentSelection, formatType);
      } catch (error) {
      }
    }
  }

  /**
   * Enregistre un handler pour un type de formatage
   */
  addFormatHandler(formatType, handler) {
    this.formatHandlers.set(formatType, handler);
  }

  /**
   * Supprime un handler de formatage
   */
  removeFormatHandler(formatType) {
    this.formatHandlers.delete(formatType);
  }

  /**
   * Gère les clics sur le document (pour fermer la toolbox)
   */
  handleDocumentClick(event) {
    if (!this.isVisible) return;

    // Si le clic est sur la toolbox, ne pas fermer
    if (this.toolboxElement.contains(event.target)) {
      return;
    }

    // Fermer la toolbox
    this.hide();
  }

  /**
   * Gère les raccourcis clavier
   */
  handleKeyDown(event) {
    if (!this.isVisible) return;

    // Échapper pour fermer
    if (event.key === 'Escape') {
      event.preventDefault();
      this.hide();
    }
  }

  /**
   * Vérifie si la toolbox est visible
   */
  isShowing() {
    return this.isVisible;
  }

  /**
   * Obtient la sélection actuelle
   */
  getCurrentSelection() {
    return this.currentSelection;
  }

  /**
   * Nettoie et détruit la toolbox
   */
  destroy() {
    if (!this.toolboxElement) return;


    // Supprimer les événements
    document.removeEventListener('click', this.handleDocumentClick, true);
    document.removeEventListener('keydown', this.handleKeyDown, true);

    // Supprimer l'élément DOM
    if (this.toolboxElement.parentNode) {
      this.toolboxElement.parentNode.removeChild(this.toolboxElement);
    }

    // Nettoyer les références
    this.toolboxElement = null;
    this.currentSelection = null;
    this.formatHandlers.clear();
    this.isVisible = false;
    this.isAnimating = false;
  }
}

// Instance globale pour l'extension
const toolboxUI = new ToolboxUI();

// LinkedIn Formateur Toolbox - Unicode Formatters
// Fonctions de formatage avec caractères Unicode spéciaux pour LinkedIn

/**
 * Convertit le texte en caractères Unicode Mathematical Bold
 * Utilisé pour le formatage **gras** sur LinkedIn
 * @param {string} text - Le texte à formater
 * @returns {string} - Le texte formaté en gras Unicode
 */
function toBold(text) {
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
function toItalic(text) {
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
function toUnderline(text) {
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
function toStrikethrough(text) {
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
function toNormal(text) {
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
function detectFormatting(text) {
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
function applyIncrementalFormatting(text, existingFormats, newFormat) {
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

// LinkedIn Formateur Toolbox - Content Script
// Ce script sera injecté sur toutes les pages LinkedIn



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
//# sourceMappingURL=content.js.map
