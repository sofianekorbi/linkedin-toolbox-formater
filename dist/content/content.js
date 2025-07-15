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
      console.log('🔍 SelectionDetector déjà initialisé');
      return;
    }

    console.log('🚀 Initialisation du SelectionDetector...');
    
    // Événements globaux
    document.addEventListener('selectionchange', this.handleSelectionChange, true);
    document.addEventListener('mouseup', this.handleMouseUp, true);
    document.addEventListener('keyup', this.handleKeyUp, true);
    
    // Observer pour les nouveaux champs (LinkedIn SPA)
    this.observeNewFields();
    
    this.isInitialized = true;
    console.log('✅ SelectionDetector initialisé avec succès');
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
    console.log('📝 Nouveau champ LinkedIn détecté:', this.getFieldInfo(field));
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

    console.log('✨ Nouvelle sélection détectée:', {
      text: selectionData.text.substring(0, 50) + (selectionData.text.length > 50 ? '...' : ''),
      length: selectionData.text.length,
      fieldType: selectionData.fieldInfo.tagName,
      placeholder: selectionData.fieldInfo.placeholder
    });

    // Notifier les handlers
    this.notifySelectionHandlers('selection', selectionData);
  }

  /**
   * Efface la sélection actuelle
   */
  clearSelection() {
    if (this.currentSelection) {
      console.log('🗑️ Sélection effacée');
      
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
        console.error('❌ Erreur dans un handler de sélection:', error);
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

    console.log('🧹 SelectionDetector détruit');
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
    console.log('🎨 Initialisation de ToolboxUI...');
    
    // Créer l'élément toolbox
    this.createToolboxElement();
    
    // Ajouter les événements globaux
    document.addEventListener('click', this.handleDocumentClick, true);
    document.addEventListener('keydown', this.handleKeyDown, true);
    
    console.log('✅ ToolboxUI initialisé');
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

    console.log('🎨 Affichage de la toolbox pour:', {
      text: selectionData.text.substring(0, 30) + '...',
      field: selectionData.fieldInfo.tagName
    });

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

    console.log('🎨 Masquage de la toolbox');

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

    console.log('🎨 Clic sur bouton:', formatType);

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

    console.log('🎨 Déclenchement formatage:', formatType);

    // Notifier les handlers enregistrés
    if (this.formatHandlers.has(formatType)) {
      const handler = this.formatHandlers.get(formatType);
      try {
        handler(this.currentSelection, formatType);
      } catch (error) {
        console.error('❌ Erreur dans le handler de formatage:', error);
      }
    } else {
      console.log('🔨 Handler de formatage non trouvé pour:', formatType);
      // TODO: Implémenter dans LIN-18
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

    console.log('🧹 Destruction de ToolboxUI');

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

    console.log('✅ Texte formaté avec strikethrough:', { 
      original: text, 
      strikethrough: result,
      method: 'combining_strikethrough'
    });
    return result;
  } catch (error) {
    console.error('❌ Erreur lors du formatage barré:', error);
    return text; // Fallback vers le texte original
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

    // Détection du soulignement (combining underline)
    if (text.includes(COMBINING_UNDERLINE)) {
      detectedFormats.push('underline');
    }

    // Détection du barré (combining strikethrough)
    if (text.includes(COMBINING_STRIKETHROUGH)) {
      detectedFormats.push('strikethrough');
    }

    console.log('🔍 Formatages détectés:', { 
      text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      detected: detectedFormats 
    });

    return detectedFormats;

  } catch (error) {
    console.error('❌ Erreur lors de la détection des formatages:', error);
    return [];
  }
}

// LinkedIn Field Analyzer - Outil de diagnostic pour LIN-19
// Ce script aide à identifier et tester tous les champs LinkedIn

/**
 * Analyseur de champs LinkedIn
 * Permet de diagnostiquer et tester la compatibilité des champs
 */
class LinkedInFieldAnalyzer {
  constructor() {
    this.foundFields = [];
    this.testedFields = [];
    this.isAnalyzing = false;
  }

  /**
   * Lance l'analyse complète des champs sur la page actuelle
   */
  async analyzeCurrentPage() {
    if (this.isAnalyzing) {
      console.log('🔄 Analyse déjà en cours...');
      return;
    }

    console.log('🔍 Début de l\'analyse des champs LinkedIn...');
    this.isAnalyzing = true;
    this.foundFields = [];

    try {
      // Analyser tous les sélecteurs connus
      await this.scanKnownSelectors();
      
      // Rechercher de nouveaux champs potentiels
      await this.discoverNewFields();
      
      // Générer le rapport
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse:', error);
    } finally {
      this.isAnalyzing = false;
    }
  }

  /**
   * Scanne les sélecteurs déjà connus
   */
  async scanKnownSelectors() {
    const knownSelectors = [
      // Posts
      { selector: '[data-placeholder*="partager"]', type: 'post', description: 'Post français' },
      { selector: '[data-placeholder*="What\'s"]', type: 'post', description: 'Post anglais' },
      { selector: '.ql-editor[contenteditable="true"]', type: 'post', description: 'Éditeur principal' },
      { selector: '[role="textbox"]', type: 'post', description: 'Textbox ARIA' },
      
      // Commentaires
      { selector: '[data-placeholder*="comment"]', type: 'comment', description: 'Commentaire général' },
      { selector: '[data-placeholder*="Add a comment"]', type: 'comment', description: 'Commentaire anglais' },
      { selector: '.comments-comment-box__form textarea', type: 'comment', description: 'Form commentaire' },
      { selector: '.comments-comment-texteditor', type: 'comment', description: 'Éditeur commentaire' },
      
      // Messages
      { selector: '[data-placeholder*="message"]', type: 'message', description: 'Message général' },
      { selector: '[data-placeholder*="Write a message"]', type: 'message', description: 'Message anglais' },
      { selector: '.msg-form__contenteditable', type: 'message', description: 'Form message' },
      { selector: '.msg-form__compose', type: 'message', description: 'Compose message' },
      
      // Profil
      { selector: '[data-placeholder*="headline"]', type: 'profile', description: 'Titre profil' },
      { selector: '[data-placeholder*="summary"]', type: 'profile', description: 'Résumé profil' },
      { selector: 'textarea[name*="summary"]', type: 'profile', description: 'Textarea résumé' },
      { selector: 'textarea[name*="description"]', type: 'profile', description: 'Textarea description' }
    ];

    console.log('🔍 Scan des sélecteurs connus...');
    
    for (const config of knownSelectors) {
      try {
        const elements = document.querySelectorAll(config.selector);
        if (elements.length > 0) {
          elements.forEach((element, index) => {
            this.foundFields.push({
              ...config,
              element: element,
              index: index,
              isVisible: this.isElementVisible(element),
              boundingRect: element.getBoundingClientRect(),
              computedStyle: window.getComputedStyle(element)
            });
          });
          console.log(`✅ ${config.description}: ${elements.length} élément(s) trouvé(s)`);
        }
      } catch (error) {
        console.warn(`⚠️ Erreur avec sélecteur ${config.selector}:`, error);
      }
    }
  }

  /**
   * Découvre de nouveaux champs potentiels
   */
  async discoverNewFields() {
    console.log('🔍 Recherche de nouveaux champs...');
    
    // Chercher tous les éléments contenteditable
    const contentEditables = document.querySelectorAll('[contenteditable="true"]');
    console.log(`📝 ${contentEditables.length} éléments contenteditable trouvés`);
    
    // Chercher toutes les textareas
    const textareas = document.querySelectorAll('textarea');
    console.log(`📝 ${textareas.length} textareas trouvées`);
    
    // Chercher tous les inputs text
    const textInputs = document.querySelectorAll('input[type="text"]');
    console.log(`📝 ${textInputs.length} inputs text trouvés`);
    
    // Chercher les éléments avec role="textbox"
    const textboxes = document.querySelectorAll('[role="textbox"]');
    console.log(`📝 ${textboxes.length} éléments textbox trouvés`);

    // Analyser les nouveaux éléments
    const allCandidates = [...contentEditables, ...textareas, ...textInputs, ...textboxes];
    
    for (const element of allCandidates) {
      if (!this.isAlreadyKnown(element)) {
        this.foundFields.push({
          selector: this.generateSelector(element),
          type: 'unknown',
          description: 'Nouveau champ découvert',
          element: element,
          isVisible: this.isElementVisible(element),
          boundingRect: element.getBoundingClientRect(),
          placeholder: element.getAttribute('data-placeholder') || element.placeholder || '',
          className: element.className,
          id: element.id
        });
      }
    }
  }

  /**
   * Vérifie si un élément est déjà connu
   */
  isAlreadyKnown(element) {
    return this.foundFields.some(field => field.element === element);
  }

  /**
   * Génère un sélecteur CSS pour un élément
   */
  generateSelector(element) {
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.length > 0);
      if (classes.length > 0) {
        return `.${classes[0]}`;
      }
    }
    
    return element.tagName.toLowerCase();
  }

  /**
   * Vérifie si un élément est visible
   */
  isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0'
    );
  }

  /**
   * Teste la sélection sur un champ spécifique
   */
  async testFieldSelection(fieldData) {
    console.log(`🧪 Test de sélection sur: ${fieldData.description}`);
    
    try {
      const element = fieldData.element;
      
      // Focus sur l'élément
      element.focus();
      
      // Insérer du texte de test
      const testText = 'Test de sélection LinkedIn Formateur';
      
      if (element.contentEditable === 'true') {
        element.textContent = testText;
      } else if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
        element.value = testText;
      }
      
      // Sélectionner le texte
      this.selectAllText(element);
      
      // Déclencher l'événement de sélection
      const selectionEvent = new Event('selectionchange', { bubbles: true });
      document.dispatchEvent(selectionEvent);
      
      // Attendre un peu pour voir si la toolbox apparaît
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Vérifier si la toolbox est apparue
      const toolbox = document.querySelector('.linkedin-formatter-toolbox');
      const hasToolbox = toolbox && toolbox.style.display !== 'none';
      
      const result = {
        field: fieldData,
        testText: testText,
        hasToolbox: hasToolbox,
        toolboxPosition: hasToolbox ? toolbox.getBoundingClientRect() : null,
        timestamp: new Date().toISOString()
      };
      
      this.testedFields.push(result);
      
      console.log(`${hasToolbox ? '✅' : '❌'} Test ${fieldData.description}: ${hasToolbox ? 'SUCCÈS' : 'ÉCHEC'}`);
      
      return result;
      
    } catch (error) {
      console.error(`❌ Erreur lors du test de ${fieldData.description}:`, error);
      return { field: fieldData, error: error.message };
    }
  }

  /**
   * Sélectionne tout le texte dans un élément
   */
  selectAllText(element) {
    if (element.contentEditable === 'true') {
      const range = document.createRange();
      range.selectNodeContents(element);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      element.select();
    }
  }

  /**
   * Génère un rapport d'analyse
   */
  generateReport() {
    console.log('\n📊 ====== RAPPORT D\'ANALYSE LINKEDIN ======');
    console.log(`🔍 Analyse effectuée le: ${new Date().toLocaleString()}`);
    console.log(`📄 URL: ${window.location.href}`);
    console.log(`📝 Champs trouvés: ${this.foundFields.length}`);
    
    // Grouper par type
    const byType = {};
    this.foundFields.forEach(field => {
      if (!byType[field.type]) byType[field.type] = [];
      byType[field.type].push(field);
    });
    
    // Afficher par type
    Object.keys(byType).forEach(type => {
      console.log(`\n📋 === ${type.toUpperCase()} (${byType[type].length}) ===`);
      byType[type].forEach(field => {
        const visibility = field.isVisible ? '👁️' : '🙈';
        console.log(`  ${visibility} ${field.description}`);
        console.log(`     Sélecteur: ${field.selector}`);
        if (field.placeholder) {
          console.log(`     Placeholder: "${field.placeholder}"`);
        }
      });
    });
    
    // Recommandations
    console.log('\n💡 === RECOMMANDATIONS ===');
    const visibleFields = this.foundFields.filter(f => f.isVisible);
    const newFields = this.foundFields.filter(f => f.type === 'unknown' && f.isVisible);
    
    console.log(`✅ Champs visibles: ${visibleFields.length}/${this.foundFields.length}`);
    console.log(`🆕 Nouveaux champs découverts: ${newFields.length}`);
    
    if (newFields.length > 0) {
      console.log('\n🎯 Nouveaux sélecteurs à ajouter:');
      newFields.forEach(field => {
        console.log(`  - ${field.selector} // ${field.description}`);
      });
    }
    
    console.log('\n====== FIN DU RAPPORT ======\n');
    
    return {
      total: this.foundFields.length,
      visible: visibleFields.length,
      newFields: newFields.length,
      byType: byType
    };
  }

  /**
   * Lance des tests automatiques sur tous les champs visibles
   */
  async runAutomaticTests() {
    console.log('🚀 Lancement des tests automatiques...');
    
    const visibleFields = this.foundFields.filter(f => f.isVisible);
    
    for (const field of visibleFields) {
      await this.testFieldSelection(field);
      // Pause entre les tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`✅ Tests terminés sur ${visibleFields.length} champs`);
    return this.testedFields;
  }
}

// Export pour utilisation dans content.js
window.LinkedInFieldAnalyzer = LinkedInFieldAnalyzer;

// Fonction globale pour lancer l'analyse facilement
window.analyzeLinkedInFields = async function() {
  const analyzer = new LinkedInFieldAnalyzer();
  await analyzer.analyzeCurrentPage();
  return analyzer;
};

// Fonction globale pour tester tous les champs
window.testAllLinkedInFields = async function() {
  const analyzer = new LinkedInFieldAnalyzer();
  await analyzer.analyzeCurrentPage();
  const results = await analyzer.runAutomaticTests();
  return results;
};

console.log('🔧 LinkedIn Field Analyzer chargé. Utilisez:');
console.log('   - analyzeLinkedInFields() pour analyser');
console.log('   - testAllLinkedInFields() pour tester');

console.log("🚀 LinkedIn Formateur Toolbox - Content Script chargé");
class LinkedInFormatterToolbox {
  constructor() {
    this.isInitialized = false;
    this.currentSelection = null;
    this.handleSelectionEvent = this.handleSelectionEvent.bind(this);
  }
  /**
   * Initialise l'extension
   */
  async init() {
    if (this.isInitialized) {
      console.log("🔄 Extension déjà initialisée");
      return;
    }
    console.log("🚀 Initialisation de LinkedIn Formateur Toolbox...");
    try {
      if (!this.isLinkedInPage()) {
        console.log("⚠️ Pas sur LinkedIn, extension non activée");
        return;
      }
      selectionDetector.init();
      selectionDetector.addSelectionHandler(this.handleSelectionEvent);
      this.registerFormatHandlers();
      this.isInitialized = true;
      console.log("✅ LinkedIn Formateur Toolbox initialisé avec succès");
      if (false) ;
    } catch (error) {
      console.error("❌ Erreur lors de l'initialisation:", error);
    }
  }
  /**
   * Vérifie si on est sur une page LinkedIn
   */
  isLinkedInPage() {
    return window.location.hostname.includes("linkedin.com");
  }
  /**
   * Gère les événements de sélection/désélection
   */
  handleSelectionEvent(type, data) {
    if (type === "selection") {
      this.onTextSelected(data);
    } else if (type === "deselection") {
      this.onTextDeselected(data);
    }
  }
  /**
   * Appelé quand du texte est sélectionné
   */
  onTextSelected(selectionData) {
    this.currentSelection = selectionData;
    console.log("✨ Texte sélectionné:", {
      text: selectionData.text.substring(0, 100) + (selectionData.text.length > 100 ? "..." : ""),
      length: selectionData.text.length,
      fieldType: selectionData.fieldInfo.tagName,
      placeholder: selectionData.fieldInfo.placeholder.substring(0, 50)
    });
    const existingFormats = detectFormatting(selectionData.text);
    console.log("🔍 Formatages existants détectés:", existingFormats);
    selectionData.existingFormats = existingFormats;
    this.showToolbox(selectionData);
  }
  /**
   * Appelé quand la sélection est effacée
   */
  onTextDeselected(data) {
    console.log("🗑️ Sélection effacée");
    this.currentSelection = null;
    this.hideToolbox();
  }
  /**
   * Affiche la toolbox de formatage
   */
  showToolbox(selectionData) {
    console.log("🎨 Affichage de la toolbox pour la sélection");
    toolboxUI.show(selectionData);
  }
  /**
   * Masque la toolbox de formatage
   */
  hideToolbox() {
    console.log("🎨 Masquage de la toolbox");
    toolboxUI.hide();
  }
  /**
   * Affiche des informations de debug sur la sélection (mode dev uniquement)
   */
  showSelectionDebugInfo(selectionData) {
    let debugElement = document.getElementById("ltf-debug-selection");
    if (!debugElement) {
      debugElement = document.createElement("div");
      debugElement.id = "ltf-debug-selection";
      debugElement.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 10000;
        background: #0a66c2;
        color: white;
        padding: 10px;
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 12px;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;
      document.body.appendChild(debugElement);
    }
    debugElement.innerHTML = `
      <strong>🎯 LTF Debug - Sélection détectée</strong><br>
      <strong>Texte:</strong> "${selectionData.text.substring(0, 50)}${selectionData.text.length > 50 ? "..." : ""}"<br>
      <strong>Longueur:</strong> ${selectionData.text.length} caractères<br>
      <strong>Champ:</strong> ${selectionData.fieldInfo.tagName}<br>
      <strong>Placeholder:</strong> ${selectionData.fieldInfo.placeholder.substring(0, 30)}<br>
      <strong>Classes:</strong> ${selectionData.fieldInfo.classes.slice(0, 2).join(", ")}
    `;
    setTimeout(() => {
      if (debugElement && debugElement.parentNode) {
        debugElement.remove();
      }
    }, 5e3);
  }
  /**
   * Nettoie les informations de debug
   */
  clearDebugInfo() {
    const debugElement = document.getElementById("ltf-debug-selection");
    if (debugElement) {
      debugElement.remove();
    }
  }
  /**
   * Affiche une notification de test en mode développement
   */
  showDevNotification() {
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      z-index: 10000;
      background: #28a745;
      color: white;
      padding: 10px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    notification.innerHTML = `
      <strong>🚀 LinkedIn Formateur Toolbox</strong><br>
      Extension chargée en mode développement<br>
      <small>Sélectionnez du texte pour tester la détection</small>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3e3);
  }
  /**
   * Enregistre les handlers de formatage
   */
  registerFormatHandlers() {
    toolboxUI.addFormatHandler("bold", (selectionData, formatType) => {
      console.log("🎨 Formatage gras demandé pour:", selectionData.text);
      this.applyFormatting(selectionData, formatType);
    });
    toolboxUI.addFormatHandler("italic", (selectionData, formatType) => {
      console.log("🎨 Formatage italique demandé pour:", selectionData.text);
      this.applyFormatting(selectionData, formatType);
    });
    toolboxUI.addFormatHandler("underline", (selectionData, formatType) => {
      console.log("🎨 Formatage souligné demandé pour:", selectionData.text);
      this.applyFormatting(selectionData, formatType);
    });
    toolboxUI.addFormatHandler("strikethrough", (selectionData, formatType) => {
      console.log("🎨 Formatage barré demandé pour:", selectionData.text);
      this.applyFormatting(selectionData, formatType);
    });
    console.log("✅ Handlers de formatage enregistrés");
  }
  /**
   * Applique le formatage au texte sélectionné
   */
  applyFormatting(selectionData, formatType) {
    try {
      let formattedText;
      switch (formatType) {
        case "bold":
          formattedText = toBold(selectionData.text);
          break;
        case "italic":
          formattedText = toItalic(selectionData.text);
          break;
        case "underline":
          formattedText = toUnderline(selectionData.text);
          break;
        case "strikethrough":
          formattedText = toStrikethrough(selectionData.text);
          break;
        default:
          console.warn("⚠️ Type de formatage non supporté:", formatType);
          formattedText = selectionData.text;
      }
      this.replaceSelectedText(selectionData, formattedText);
    } catch (error) {
      console.error("❌ Erreur lors du formatage:", error);
    }
  }
  /**
   * Remplace le texte sélectionné dans le champ LinkedIn
   */
  replaceSelectedText(selectionData, newText) {
    try {
      const field = selectionData.field;
      const range = selectionData.range;
      console.log("🔄 Remplacement du texte:", {
        original: selectionData.text,
        formatted: newText,
        fieldType: field.tagName
      });
      if (field.contentEditable === "true") {
        range.deleteContents();
        const textNode = document.createTextNode(newText);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        window.getSelection().collapseToEnd();
        this.triggerLinkedInEvents(field);
      } else if (field.tagName === "TEXTAREA" || field.tagName === "INPUT") {
        const start = field.selectionStart;
        const end = field.selectionEnd;
        const value = field.value;
        field.value = value.substring(0, start) + newText + value.substring(end);
        const newCursorPos = start + newText.length;
        field.setSelectionRange(newCursorPos, newCursorPos);
        this.triggerLinkedInEvents(field);
      } else {
        console.warn("⚠️ Type de champ non supporté pour le remplacement:", field.tagName);
      }
      console.log("✅ Texte remplacé avec succès");
    } catch (error) {
      console.error("❌ Erreur lors du remplacement du texte:", error);
    }
  }
  /**
   * Déclenche les événements nécessaires pour notifier LinkedIn des changements
   */
  triggerLinkedInEvents(field) {
    const events = ["input", "change", "keyup"];
    events.forEach((eventType) => {
      const event = new Event(eventType, {
        bubbles: true,
        cancelable: true
      });
      field.dispatchEvent(event);
    });
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
    selectionDetector.removeSelectionHandler(this.handleSelectionEvent);
    selectionDetector.destroy();
    toolboxUI.destroy();
    this.clearDebugInfo();
    this.currentSelection = null;
    this.isInitialized = false;
    console.log("🧹 LinkedIn Formateur Toolbox nettoyé");
  }
  /**
   * Lance l'analyse des champs LinkedIn (LIN-19)
   */
  async analyzeLinkedInFields() {
    console.log("🔍 Lancement de l'analyse des champs LinkedIn (LIN-19)...");
    const analyzer = new LinkedInFieldAnalyzer();
    await analyzer.analyzeCurrentPage();
    window.linkedInAnalyzer = analyzer;
    console.log("✅ Analyse terminée. Utilisez window.linkedInAnalyzer pour plus de détails");
    return analyzer;
  }
  /**
   * Lance des tests automatiques sur tous les champs (LIN-19)
   */
  async testAllFields() {
    console.log("🧪 Lancement des tests automatiques sur tous les champs...");
    const analyzer = new LinkedInFieldAnalyzer();
    await analyzer.analyzeCurrentPage();
    const results = await analyzer.runAutomaticTests();
    console.log("✅ Tests automatiques terminés");
    return results;
  }
}
const toolbox = new LinkedInFormatterToolbox();
window.linkedInFormatterToolbox = toolbox;
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => toolbox.init());
} else {
  toolbox.init();
}
let currentUrl = window.location.href;
const observer = new MutationObserver(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    console.log("🔄 Navigation LinkedIn détectée, réinitialisation...");
    setTimeout(() => {
      toolbox.destroy();
      toolbox.init();
    }, 1e3);
  }
});
observer.observe(document.body, {
  childList: true,
  subtree: true
});
//# sourceMappingURL=content.js.map
