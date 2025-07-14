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

export { LinkedInFieldAnalyzer };