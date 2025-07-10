#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔄 Starting LinkedIn Formateur Toolbox development server...');

// Configuration des chemins
const distDir = path.join(rootDir, 'dist');
const manifestPath = path.join(distDir, 'manifest.json');

// Créer le manifest.json pour le développement
function createDevManifest() {
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  const manifest = {
    ...packageJson.manifest,
    version: packageJson.version
  };

  // Assurer que le dossier dist existe
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('📄 Manifest créé pour le développement');
}

// Surveiller les changements et recompiler
function watchAndBuild() {
  console.log('👀 Surveillance des fichiers activée...');
  
  // Démarrer Vite en mode watch
  const viteProcess = spawn('npx', ['vite', 'build', '--watch', '--mode', 'development'], {
    stdio: 'inherit',
    cwd: rootDir,
    shell: true
  });

  viteProcess.on('error', (error) => {
    console.error('❌ Erreur Vite:', error);
  });

  viteProcess.on('close', (code) => {
    console.log(`🔄 Processus Vite terminé avec le code ${code}`);
  });

  // Surveiller les changements du package.json pour mettre à jour le manifest
  fs.watchFile(path.join(rootDir, 'package.json'), () => {
    console.log('📦 package.json modifié, mise à jour du manifest...');
    createDevManifest();
  });
}

// Instructions pour l'utilisateur
function showInstructions() {
  console.log('');
  console.log('🎯 Instructions pour le développement:');
  console.log('');
  console.log('1. Ouvrez Chrome et allez sur chrome://extensions/');
  console.log('2. Activez le "Mode développeur" (en haut à droite)');
  console.log('3. Cliquez sur "Charger l\'extension non empaquetée"');
  console.log(`4. Sélectionnez le dossier: ${distDir}`);
  console.log('5. L\'extension sera rechargée automatiquement à chaque modification');
  console.log('');
  console.log('💡 Conseil: Gardez l\'onglet chrome://extensions/ ouvert');
  console.log('💡 pour voir les erreurs et recharger l\'extension si nécessaire');
  console.log('');
  console.log('🔍 Pour déboguer:');
  console.log('- Content Script: Inspectez la page LinkedIn');
  console.log('- Background Script: Cliquez sur "Détails" puis "Inspecter les vues"');
  console.log('');
}

// Démarrage
createDevManifest();
showInstructions();
watchAndBuild();

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur de développement...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du serveur de développement...');
  process.exit(0);
});