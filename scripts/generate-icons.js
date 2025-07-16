#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const rootDir = path.resolve(__dirname, '..');
const assetsDir = path.join(rootDir, 'assets');
const iconsDir = path.join(assetsDir, 'icons');
const pngFile = path.join(iconsDir, 'icon.png');

// Tailles d'icônes requises pour Chrome Web Store
const iconSizes = [16, 32, 48, 128];

console.log('🎨 Génération des icônes PNG pour Chrome Web Store...');

// Vérifier que le fichier PNG existe
if (!fs.existsSync(pngFile)) {
  console.error(`❌ Fichier PNG non trouvé : ${pngFile}`);
  process.exit(1);
}

// Fonction pour redimensionner PNG avec différentes tailles
function resizePngToSize(pngPath, outputPath, size) {
  try {
    // Utiliser ImageMagick ou sips pour redimensionner le PNG
    try {
      execSync(`convert "${pngPath}" -resize ${size}x${size} "${outputPath}"`, { 
        stdio: 'pipe' 
      });
      console.log(`✅ Icône ${size}x${size} créée : ${path.basename(outputPath)}`);
    } catch (error) {
      // Fallback vers sips (macOS)
      try {
        execSync(`sips -s format png -Z ${size} "${pngPath}" --out "${outputPath}"`, { 
          stdio: 'pipe' 
        });
        console.log(`✅ Icône ${size}x${size} créée (sips) : ${path.basename(outputPath)}`);
      } catch (error2) {
        console.warn(`⚠️  Impossible de créer l'icône ${size}x${size}. Veuillez installer ImageMagick ou utiliser macOS.`);
        console.warn(`💡 Commande alternative : convert "${pngPath}" -resize ${size}x${size} "${outputPath}"`);
      }
    }
  } catch (error) {
    console.error(`❌ Erreur lors du redimensionnement ${size}x${size}:`, error.message);
  }
}

// Créer les icônes PNG redimensionnées
iconSizes.forEach(size => {
  const outputFile = path.join(iconsDir, `icon-${size}.png`);
  resizePngToSize(pngFile, outputFile, size);
});

// Créer également des versions sans suffixe pour la compatibilité
const compatibilityMappings = {
  '16.png': 'icon-16.png',
  '32.png': 'icon-32.png', 
  '48.png': 'icon-48.png',
  '128.png': 'icon-128.png'
};

Object.entries(compatibilityMappings).forEach(([target, source]) => {
  const sourcePath = path.join(iconsDir, source);
  const targetPath = path.join(iconsDir, target);
  
  if (fs.existsSync(sourcePath)) {
    try {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ Icône de compatibilité créée : ${target}`);
    } catch (error) {
      console.warn(`⚠️  Impossible de créer ${target}:`, error.message);
    }
  }
});

// Créer un fichier de vérification
const verificationFile = path.join(iconsDir, 'icons-info.json');
const iconsInfo = {
  generatedAt: new Date().toISOString(),
  sizes: iconSizes,
  files: {}
};

iconSizes.forEach(size => {
  const filePath = path.join(iconsDir, `icon-${size}.png`);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    iconsInfo.files[`icon-${size}.png`] = {
      size: stats.size,
      created: stats.birthtime.toISOString()
    };
  }
});

fs.writeFileSync(verificationFile, JSON.stringify(iconsInfo, null, 2));

console.log('\n🎯 Résumé de la génération d\'icônes :');
console.log('📁 Dossier icônes :', iconsDir);
console.log('📊 Tailles générées :', iconSizes.join(', '));
console.log('📄 Fichier de vérification :', verificationFile);

// Vérifier la présence de tous les fichiers requis
const missingFiles = [];
iconSizes.forEach(size => {
  const filePath = path.join(iconsDir, `icon-${size}.png`);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(`icon-${size}.png`);
  }
});

if (missingFiles.length > 0) {
  console.warn('\n⚠️  Fichiers manquants :');
  missingFiles.forEach(file => console.warn(`   - ${file}`));
  console.warn('\n💡 Assurez-vous d\'avoir installé rsvg-convert ou ImageMagick :');
  console.warn('   - Ubuntu/Debian: sudo apt install librsvg2-bin');
  console.warn('   - macOS: brew install librsvg');
  console.warn('   - Windows: Télécharger depuis https://imagemagick.org/');
} else {
  console.log('\n✅ Toutes les icônes ont été générées avec succès !');
}

console.log('\n🚀 Génération terminée !');