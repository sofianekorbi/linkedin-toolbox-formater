#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { createHash } from 'crypto';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const buildDir = path.join(rootDir, 'build');

console.log('📦 Packaging LinkedIn Formateur Toolbox pour Chrome Web Store...');

// Créer le dossier build s'il n'existe pas
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Lire le package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const manifest = { ...packageJson.manifest };

// Ajouter la version depuis package.json
manifest.version = packageJson.version;

// Valider le manifest pour Chrome Web Store
console.log('🔍 Validation du manifest...');
validateManifest(manifest);

// Écrire le manifest.json dans le dossier dist
fs.writeFileSync(
  path.join(distDir, 'manifest.json'), 
  JSON.stringify(manifest, null, 2)
);

// Copier et optimiser les assets
console.log('📁 Copie des assets...');
copyAssets();

// Validation des fichiers requis
console.log('✅ Validation des fichiers requis...');
validateRequiredFiles();

// Créer l'archive ZIP pour Chrome Web Store
const zipFile = path.join(buildDir, `linkedin-formateur-toolbox-v${packageJson.version}.zip`);
const crxFile = path.join(buildDir, `linkedin-formateur-toolbox-v${packageJson.version}.crx`);

try {
  console.log('🗜️  Création du package ZIP...');
  execSync(`cd ${distDir} && zip -r ${zipFile} . -x "*.map"`, { stdio: 'inherit' });
  
  // Calculer la taille du package
  const stats = fs.statSync(zipFile);
  const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log(`✅ Package ZIP créé : ${path.basename(zipFile)}`);
  console.log(`📊 Taille du package : ${sizeInMB} MB`);
  
  if (stats.size > 20 * 1024 * 1024) { // 20MB limit
    console.warn('⚠️  ATTENTION : Le package dépasse 20MB, cela peut poser des problèmes sur Chrome Web Store');
  }
  
} catch (error) {
  console.error('❌ Erreur lors de la création du package ZIP:', error);
  process.exit(1);
}

// Créer le fichier .crx si possible
createCrxFile(crxFile);

// Générer un rapport de packaging
generatePackageReport(zipFile, crxFile);

console.log('\n🎉 Packaging terminé avec succès !');
console.log(`📦 Archive ZIP: ${zipFile}`);
console.log(`📁 Dossier dist: ${distDir}`);
console.log(`📄 Prêt pour Chrome Web Store: ${path.basename(zipFile)}`);

// Fonctions utilitaires
function validateManifest(manifest) {
  const required = ['name', 'version', 'description', 'manifest_version'];
  const missing = required.filter(key => !manifest[key]);
  
  if (missing.length > 0) {
    console.error(`❌ Champs manquants dans le manifest : ${missing.join(', ')}`);
    process.exit(1);
  }
  
  if (manifest.manifest_version !== 3) {
    console.error('❌ Manifest version doit être 3 pour Chrome Web Store');
    process.exit(1);
  }
  
  if (!manifest.icons || Object.keys(manifest.icons).length === 0) {
    console.error('❌ Icônes manquantes dans le manifest');
    process.exit(1);
  }
  
  console.log('✅ Manifest validé');
}

function copyAssets() {
  const assetsDir = path.join(rootDir, 'assets');
  if (fs.existsSync(assetsDir)) {
    try {
      execSync(`cp -r ${assetsDir} ${distDir}/`, { stdio: 'pipe' });
      console.log('✅ Assets copiés');
    } catch (error) {
      console.error('❌ Erreur lors de la copie des assets:', error);
      process.exit(1);
    }
  }
}

function validateRequiredFiles() {
  const requiredFiles = [
    'manifest.json',
    'content/content.js',
    'content/content.css',
    'background/background.js',
    'assets/icons/icon-16.png',
    'assets/icons/icon-32.png',
    'assets/icons/icon-48.png',
    'assets/icons/icon-128.png'
  ];
  
  const missingFiles = requiredFiles.filter(file => {
    const filePath = path.join(distDir, file);
    return !fs.existsSync(filePath);
  });
  
  if (missingFiles.length > 0) {
    console.error('❌ Fichiers requis manquants :');
    missingFiles.forEach(file => console.error(`   - ${file}`));
    process.exit(1);
  }
  
  console.log('✅ Tous les fichiers requis sont présents');
}

function createCrxFile(crxFile) {
  const keyFile = path.join(rootDir, 'key.pem');
  
  if (fs.existsSync(keyFile)) {
    try {
      console.log('🔐 Création du fichier .crx...');
      execSync(`google-chrome --pack-extension=${distDir} --pack-extension-key=${keyFile}`, { 
        stdio: 'pipe' 
      });
      
      const generatedCrx = path.join(path.dirname(distDir), 'dist.crx');
      if (fs.existsSync(generatedCrx)) {
        fs.renameSync(generatedCrx, crxFile);
        console.log(`✅ Fichier .crx créé : ${path.basename(crxFile)}`);
      }
    } catch (error) {
      console.warn('⚠️  Impossible de créer le fichier .crx automatiquement');
      console.warn('💡 Vous pouvez le créer manuellement via Chrome Developer Mode');
    }
  } else {
    console.log('💡 Pour créer un fichier .crx, générez une clé privée :');
    console.log('   openssl genrsa -out key.pem 2048');
  }
}

function generatePackageReport(zipFile, crxFile) {
  const report = {
    timestamp: new Date().toISOString(),
    version: packageJson.version,
    files: {
      zip: {
        path: zipFile,
        exists: fs.existsSync(zipFile),
        size: fs.existsSync(zipFile) ? fs.statSync(zipFile).size : 0
      },
      crx: {
        path: crxFile,
        exists: fs.existsSync(crxFile),
        size: fs.existsSync(crxFile) ? fs.statSync(crxFile).size : 0
      }
    },
    validation: {
      manifest: 'passed',
      icons: 'passed',
      required_files: 'passed'
    }
  };
  
  const reportFile = path.join(buildDir, 'package-report.json');
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`📄 Rapport de packaging généré : ${reportFile}`);
}