// LinkedIn Formateur Toolbox - Content Script
// Ce script sera injecté sur toutes les pages LinkedIn

import { selectionDetector } from './selection-detector.js';
import { toolboxUI } from './toolbox.js';
import { toBold, toItalic, toUnderline, toStrikethrough } from './unicode-formatters.js';
import { LinkedInFieldAnalyzer } from './field-analyzer.js';

console.log('🚀 LinkedIn Formateur Toolbox - Content Script chargé');

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
      console.log('🔄 Extension déjà initialisée');
      return;
    }

    console.log('🚀 Initialisation de LinkedIn Formateur Toolbox...');

    try {
      // Vérifier qu'on est bien sur LinkedIn
      if (!this.isLinkedInPage()) {
        console.log('⚠️ Pas sur LinkedIn, extension non activée');
        return;
      }

      // Initialiser le détecteur de sélection
      selectionDetector.init();
      
      // Ajouter notre handler pour les événements de sélection
      selectionDetector.addSelectionHandler(this.handleSelectionEvent);

      // Enregistrer les handlers de formatage
      this.registerFormatHandlers();

      this.isInitialized = true;
      console.log('✅ LinkedIn Formateur Toolbox initialisé avec succès');

      // Notification de test en mode développement
      if (__DEV__) {
        console.log('🔧 Mode développement activé');
        console.log('📦 Version:', __VERSION__);
        this.showDevNotification();
      }

    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
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
    
    console.log('✨ Texte sélectionné:', {
      text: selectionData.text.substring(0, 100) + (selectionData.text.length > 100 ? '...' : ''),
      length: selectionData.text.length,
      fieldType: selectionData.fieldInfo.tagName,
      placeholder: selectionData.fieldInfo.placeholder.substring(0, 50)
    });

    // Afficher la toolbox
    this.showToolbox(selectionData);
    
    // Pour le développement, afficher une notification visuelle
    if (__DEV__) {
      this.showSelectionDebugInfo(selectionData);
    }
  }

  /**
   * Appelé quand la sélection est effacée
   */
  onTextDeselected(data) {
    console.log('🗑️ Sélection effacée');
    this.currentSelection = null;

    // Masquer la toolbox
    this.hideToolbox();

    // Nettoyer les éléments de debug en mode développement
    if (__DEV__) {
      this.clearDebugInfo();
    }
  }

  /**
   * Affiche la toolbox de formatage
   */
  showToolbox(selectionData) {
    console.log('🎨 Affichage de la toolbox pour la sélection');
    toolboxUI.show(selectionData);
  }

  /**
   * Masque la toolbox de formatage
   */
  hideToolbox() {
    console.log('🎨 Masquage de la toolbox');
    toolboxUI.hide();
  }

  /**
   * Affiche des informations de debug sur la sélection (mode dev uniquement)
   */
  showSelectionDebugInfo(selectionData) {
    // Créer ou mettre à jour l'élément de debug
    let debugElement = document.getElementById('ltf-debug-selection');
    
    if (!debugElement) {
      debugElement = document.createElement('div');
      debugElement.id = 'ltf-debug-selection';
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
      <strong>Texte:</strong> "${selectionData.text.substring(0, 50)}${selectionData.text.length > 50 ? '...' : ''}"<br>
      <strong>Longueur:</strong> ${selectionData.text.length} caractères<br>
      <strong>Champ:</strong> ${selectionData.fieldInfo.tagName}<br>
      <strong>Placeholder:</strong> ${selectionData.fieldInfo.placeholder.substring(0, 30)}<br>
      <strong>Classes:</strong> ${selectionData.fieldInfo.classes.slice(0, 2).join(', ')}
    `;

    // Auto-suppression après 5 secondes
    setTimeout(() => {
      if (debugElement && debugElement.parentNode) {
        debugElement.remove();
      }
    }, 5000);
  }

  /**
   * Nettoie les informations de debug
   */
  clearDebugInfo() {
    const debugElement = document.getElementById('ltf-debug-selection');
    if (debugElement) {
      debugElement.remove();
    }
  }

  /**
   * Affiche une notification de test en mode développement
   */
  showDevNotification() {
    const notification = document.createElement('div');
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

    // Auto-suppression après 3 secondes
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  }

  /**
   * Enregistre les handlers de formatage
   */
  registerFormatHandlers() {
    // Handler pour le formatage gras
    toolboxUI.addFormatHandler('bold', (selectionData, formatType) => {
      console.log('🎨 Formatage gras demandé pour:', selectionData.text);
      this.applyFormatting(selectionData, formatType);
    });

    // Handler pour le formatage italique
    toolboxUI.addFormatHandler('italic', (selectionData, formatType) => {
      console.log('🎨 Formatage italique demandé pour:', selectionData.text);
      this.applyFormatting(selectionData, formatType);
    });

    // Handler pour le formatage souligné
    toolboxUI.addFormatHandler('underline', (selectionData, formatType) => {
      console.log('🎨 Formatage souligné demandé pour:', selectionData.text);
      this.applyFormatting(selectionData, formatType);
    });

    // Handler pour le formatage barré
    toolboxUI.addFormatHandler('strikethrough', (selectionData, formatType) => {
      console.log('🎨 Formatage barré demandé pour:', selectionData.text);
      this.applyFormatting(selectionData, formatType);
    });

    console.log('✅ Handlers de formatage enregistrés');
  }

  /**
   * Applique le formatage au texte sélectionné
   */
  applyFormatting(selectionData, formatType) {
    try {
      let formattedText;

      // Appliquer le formatage selon le type
      switch (formatType) {
        case 'bold':
          formattedText = toBold(selectionData.text);
          break;
        case 'italic':
          formattedText = toItalic(selectionData.text);
          break;
        case 'underline':
          formattedText = toUnderline(selectionData.text);
          break;
        case 'strikethrough':
          formattedText = toStrikethrough(selectionData.text);
          break;
        default:
          console.warn('⚠️ Type de formatage non supporté:', formatType);
          formattedText = selectionData.text;
      }

      // Remplacer le texte sélectionné
      this.replaceSelectedText(selectionData, formattedText);

    } catch (error) {
      console.error('❌ Erreur lors du formatage:', error);
    }
  }

  /**
   * Remplace le texte sélectionné dans le champ LinkedIn
   */
  replaceSelectedText(selectionData, newText) {
    try {
      const field = selectionData.field;
      const range = selectionData.range;

      console.log('🔄 Remplacement du texte:', {
        original: selectionData.text,
        formatted: newText,
        fieldType: field.tagName
      });

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

      } else {
        console.warn('⚠️ Type de champ non supporté pour le remplacement:', field.tagName);
      }

      console.log('✅ Texte remplacé avec succès');

    } catch (error) {
      console.error('❌ Erreur lors du remplacement du texte:', error);
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

    // Nettoyer les éléments de debug
    this.clearDebugInfo();

    this.currentSelection = null;
    this.isInitialized = false;

    console.log('🧹 LinkedIn Formateur Toolbox nettoyé');
  }

  /**
   * Lance l'analyse des champs LinkedIn (LIN-19)
   */
  async analyzeLinkedInFields() {
    console.log('🔍 Lancement de l\'analyse des champs LinkedIn (LIN-19)...');
    
    const analyzer = new LinkedInFieldAnalyzer();
    await analyzer.analyzeCurrentPage();
    
    // Exposer l'analyseur globalement pour les tests manuels
    window.linkedInAnalyzer = analyzer;
    
    console.log('✅ Analyse terminée. Utilisez window.linkedInAnalyzer pour plus de détails');
    return analyzer;
  }

  /**
   * Lance des tests automatiques sur tous les champs (LIN-19)
   */
  async testAllFields() {
    console.log('🧪 Lancement des tests automatiques sur tous les champs...');
    
    const analyzer = new LinkedInFieldAnalyzer();
    await analyzer.analyzeCurrentPage();
    const results = await analyzer.runAutomaticTests();
    
    console.log('✅ Tests automatiques terminés');
    return results;
  }
}

// Initialisation automatique
const toolbox = new LinkedInFormatterToolbox();

// Exposer globalement pour les tests et debugging (LIN-19)
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
    console.log('🔄 Navigation LinkedIn détectée, réinitialisation...');
    
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

// Export pour les tests
export { LinkedInFormatterToolbox, toolbox };