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

// LinkedIn Formateur Toolbox - Unicode Formatters
// Fonctions de formatage avec caractères Unicode spéciaux pour LinkedIn


// Générer tous les formatters via la factory
const formatters = createFormatters();

/**
 * Convertit le texte en caractères Unicode Mathematical Bold
 * Utilisé pour le formatage **gras** sur LinkedIn
 * @param {string} text - Le texte à formater
 * @returns {string} - Le texte formaté en gras Unicode
 */
const toBold = formatters.toBold;

/**
 * Convertit le texte en caractères Unicode Mathematical Italic
 * Utilisé pour le formatage *italique* sur LinkedIn  
 * @param {string} text - Le texte à formater
 * @returns {string} - Le texte formaté en italique Unicode
 */
const toItalic = formatters.toItalic;

/**
 * Ajoute combining underline aux caractères
 * Utilisé pour le formatage souligné sur LinkedIn
 * @param {string} text - Le texte à formater
 * @returns {string} - Le texte formaté avec soulignement Unicode
 */
const toUnderline = formatters.toUnderline;

/**
 * Ajoute combining strikethrough aux caractères
 * Utilisé pour le formatage barré sur LinkedIn
 * @param {string} text - Le texte à formater
 * @returns {string} - Le texte formaté avec strikethrough Unicode
 */
const toStrikethrough = formatters.toStrikethrough;

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
function detectFormatting(text) {
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
function applyIncrementalFormatting(text, existingFormats, newFormat) {
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
