// Test simple pour la fonction detectFormatting
// À exécuter dans la console du navigateur

// Import simulé de la fonction (pour test dans browser)
// En vrai, ça sera importé depuis le module

/**
 * Tests unitaires pour detectFormatting
 */
function testDetectFormatting() {
  console.log('🧪 === Tests detectFormatting ===');
  
  // Test 1: Texte normal (pas de formatage)
  console.log('\n📝 Test 1: Texte normal');
  const normalText = "Hello world 123";
  const normalResult = detectFormatting(normalText);
  console.log('Résultat:', normalResult);
  console.assert(normalResult.length === 0, 'Texte normal devrait retourner []');
  
  // Test 2: Texte en gras
  console.log('\n📝 Test 2: Texte en gras');
  const boldText = "𝐇𝐞𝐥𝐥𝐨 𝐰𝐨𝐫𝐥𝐝 𝟏𝟐𝟑";
  const boldResult = detectFormatting(boldText);
  console.log('Résultat:', boldResult);
  console.assert(boldResult.includes('bold'), 'Texte gras devrait être détecté');
  
  // Test 3: Texte en italique
  console.log('\n📝 Test 3: Texte en italique');
  const italicText = "𝘏𝘦𝘭𝘭𝘰 𝘸𝘰𝘳𝘭𝘥";
  const italicResult = detectFormatting(italicText);
  console.log('Résultat:', italicResult);
  console.assert(italicResult.includes('italic'), 'Texte italique devrait être détecté');
  
  // Test 4: Texte souligné
  console.log('\n📝 Test 4: Texte souligné');
  const underlineText = "𝚃̲𝚎̲𝚡̲𝚝̲𝚎̲ ̲𝚜̲𝚘̲𝚞̲𝚕̲𝚒̲𝚐̲𝚗̲é̲";
  const underlineResult = detectFormatting(underlineText);
  console.log('Résultat:', underlineResult);
  console.assert(underlineResult.includes('underline'), 'Texte souligné devrait être détecté');
  
  // Test 5: Texte barré
  console.log('\n📝 Test 5: Texte barré');
  const strikeText = "T̶e̶x̶t̶e̶ ̶b̶a̶r̶r̶é̶";
  const strikeResult = detectFormatting(strikeText);
  console.log('Résultat:', strikeResult);
  console.assert(strikeResult.includes('strikethrough'), 'Texte barré devrait être détecté');
  
  // Test 6: Texte avec combinaisons
  console.log('\n📝 Test 6: Texte avec combinaisons');
  const combinedText = "𝐓̲𝐞̲𝐱̲𝐭̲𝐞̲ ̲𝐠̲𝐫̲𝐚̲𝐬̲ ̲𝐞̲𝐭̲ ̲𝐬̲𝐨̲𝐮̲𝐥̲𝐢̲𝐠̲𝐧̲é̲"; // Gras + souligné
  const combinedResult = detectFormatting(combinedText);
  console.log('Résultat:', combinedResult);
  console.assert(combinedResult.includes('bold'), 'Combinaison devrait détecter gras');
  console.assert(combinedResult.includes('underline'), 'Combinaison devrait détecter souligné');
  
  // Test 7: Texte avec emoji
  console.log('\n📝 Test 7: Texte avec emoji');
  const emojiText = "𝐇𝐞𝐥𝐥𝐨 🚀 𝐰𝐨𝐫𝐥𝐝";
  const emojiResult = detectFormatting(emojiText);
  console.log('Résultat:', emojiResult);
  console.assert(emojiResult.includes('bold'), 'Texte gras avec emoji devrait être détecté');
  
  // Test 8: Texte vide
  console.log('\n📝 Test 8: Texte vide');
  const emptyResult = detectFormatting("");
  console.log('Résultat:', emptyResult);
  console.assert(emptyResult.length === 0, 'Texte vide devrait retourner []');
  
  // Test 9: Texte null/undefined
  console.log('\n📝 Test 9: Texte null/undefined');
  const nullResult = detectFormatting(null);
  const undefinedResult = detectFormatting(undefined);
  console.log('Résultat null:', nullResult);
  console.log('Résultat undefined:', undefinedResult);
  console.assert(nullResult.length === 0, 'Null devrait retourner []');
  console.assert(undefinedResult.length === 0, 'Undefined devrait retourner []');
  
  console.log('\n✅ === Tests terminés ===');
}

// Exemples de textes formatés pour test manuel
const testTexts = {
  normal: "Hello world 123",
  bold: "𝐇𝐞𝐥𝐥𝐨 𝐰𝐨𝐫𝐥𝐝 𝟏𝟐𝟑",
  italic: "𝘏𝘦𝘭𝘭𝘰 𝘸𝘰𝘳𝘭𝘥",
  underline: "𝚃̲𝚎̲𝚡̲𝚝̲𝚎̲ ̲𝚜̲𝚘̲𝚞̲𝚕̲𝚒̲𝚐̲𝚗̲é̲",
  strikethrough: "T̶e̶x̶t̶e̶ ̶b̶a̶r̶r̶é̶",
  boldUnderline: "𝐓̲𝐞̲𝐱̲𝐭̲𝐞̲ ̲𝐠̲𝐫̲𝐚̲𝐬̲ ̲𝐞̲𝐭̲ ̲𝐬̲𝐨̲𝐮̲𝐥̲𝐢̲𝐠̲𝐧̲é̲"
};

console.log('🧪 Textes de test disponibles:', testTexts);
console.log('💡 Utilisez testDetectFormatting() pour lancer les tests');
console.log('💡 Utilisez detectFormatting("votre texte") pour tester manuellement');