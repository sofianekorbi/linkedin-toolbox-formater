#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const manifest = {
  "manifest_version": 3,
  "name": "LinkedIn Formateur Toolbox",
  "version": "1.0.0",
  "description": "Formatez votre texte directement sur LinkedIn avec une toolbox flottante",
  "permissions": ["activeTab"],
  "host_permissions": ["*://*.linkedin.com/*"],
  "content_scripts": [{
    "matches": ["*://*.linkedin.com/*"],
    "js": ["content/content.js"],
    "css": ["content/content.css"]
  }],
  "background": {
    "service_worker": "background/background.js"
  },
  "action": {
    "default_title": "LinkedIn Formateur Toolbox"
  }
};

const manifestPath = path.join(__dirname, 'dist', 'manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log('✅ Manifest créé dans dist/manifest.json');