// LinkedIn Formateur Toolbox - Content Script
// Ce script sera injecté sur toutes les pages LinkedIn

import { selectionDetector } from './selection-detector.js';

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

    // TODO: Afficher la toolbox (LIN-17)
    // this.showToolbox(selectionData);
    
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

    // TODO: Masquer la toolbox (LIN-17)
    // this.hideToolbox();

    // Nettoyer les éléments de debug en mode développement
    if (__DEV__) {
      this.clearDebugInfo();
    }
  }

  /**
   * Affiche la toolbox de formatage (à implémenter dans LIN-17)
   */
  showToolbox(selectionData) {
    // @TODO: Implémenter dans LIN-17
    console.log('🔨 showToolbox() - À implémenter dans LIN-17');
  }

  /**
   * Masque la toolbox de formatage
   */
  hideToolbox() {
    // @TODO: Implémenter dans LIN-17
    console.log('🔨 hideToolbox() - À implémenter dans LIN-17');
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

    // Nettoyer les éléments de debug
    this.clearDebugInfo();

    this.currentSelection = null;
    this.isInitialized = false;

    console.log('🧹 LinkedIn Formateur Toolbox nettoyé');
  }
}

// Initialisation automatique
const toolbox = new LinkedInFormatterToolbox();

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