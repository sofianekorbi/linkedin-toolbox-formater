#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const buildDir = path.join(rootDir, 'build');

console.log('📦 Packaging LinkedIn Formateur Toolbox...');

// Créer le dossier build s'il n'existe pas
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Copier le manifest.json depuis package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const manifest = packageJson.manifest;

// Ajouter la version depuis package.json
manifest.version = packageJson.version;

// Écrire le manifest.json dans le dossier dist
fs.writeFileSync(
  path.join(distDir, 'manifest.json'), 
  JSON.stringify(manifest, null, 2)
);

// Copier les assets
const assetsDir = path.join(rootDir, 'assets');
if (fs.existsSync(assetsDir)) {
  execSync(`cp -r ${assetsDir} ${distDir}/`, { stdio: 'inherit' });
}

// Créer l'archive ZIP pour Chrome Web Store
const zipFile = path.join(buildDir, `linkedin-formateur-toolbox-v${packageJson.version}.zip`);

try {
  execSync(`cd ${distDir} && zip -r ${zipFile} .`, { stdio: 'inherit' });
  console.log(`✅ Package créé : ${zipFile}`);
} catch (error) {
  console.error('❌ Erreur lors de la création du package:', error);
  process.exit(1);
}

// Créer le fichier .crx (nécessite une clé privée)
console.log('📋 Pour créer le fichier .crx, utilisez Chrome Developer Mode');
console.log('📋 Ou générez une clé privée avec: openssl genrsa -out key.pem 2048');

console.log('🎉 Packaging terminé avec succès !');
console.log(`📦 Archive ZIP: ${zipFile}`);
console.log(`📁 Dossier dist: ${distDir}`);