// LinkedIn Formateur Toolbox - Background Script
// Service Worker pour Chrome Extension Manifest V3

console.log('🚀 LinkedIn Formateur Toolbox - Background Script chargé');

// Installation de l'extension
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('✅ Extension installée avec succès');
  } else if (details.reason === 'update') {
    console.log('🔄 Extension mise à jour');
  }
});

// Gestion des messages depuis le content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ping') {
    sendResponse({ status: 'pong' });
  }
  
  // Autres actions à implémenter selon les besoins
  return true; // Indique que la réponse sera asynchrone
});

// Pour le développement
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  console.log('🔧 Mode développement activé dans le background');
}