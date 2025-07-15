// Test rapide des regex Unicode
console.log('🧪 Test rapide des regex Unicode');

// Test des ranges Unicode
const boldRegex = /[\u{1D400}-\u{1D419}\u{1D41A}-\u{1D433}\u{1D7CE}-\u{1D7D7}]/u;
const italicRegex = /[\u{1D608}-\u{1D621}\u{1D622}-\u{1D63B}]/u;

// Caractères de test
const testChars = {
  boldA: '𝐀',      // U+1D400
  boldz: '𝐳',      // U+1D433
  bold5: '𝟓',      // U+1D7D2
  italicA: '𝘈',    // U+1D608
  italicz: '𝘻',    // U+1D63B
  normal: 'A',
  emoji: '🚀'
};

console.log('🔍 Test Bold regex:');
for (const [name, char] of Object.entries(testChars)) {
  const result = boldRegex.test(char);
  console.log(`  ${name} (${char}): ${result}`);
}

console.log('\n🔍 Test Italic regex:');
for (const [name, char] of Object.entries(testChars)) {
  const result = italicRegex.test(char);
  console.log(`  ${name} (${char}): ${result}`);
}

// Test des combining characters
console.log('\n🔍 Test combining characters:');
const underlineChar = '\u0332';
const strikeChar = '\u0336';

console.log('Combining underline:', underlineChar.charCodeAt(0).toString(16));
console.log('Combining strikethrough:', strikeChar.charCodeAt(0).toString(16));

// Test avec texte complet
const testText = "𝐓̲𝐞̲𝐱̲𝐭̲𝐞̲";
console.log('\n🔍 Test texte complet:', testText);
console.log('Contient bold:', boldRegex.test(testText));
console.log('Contient underline:', testText.includes(underlineChar));

console.log('\n✅ Test terminé!');