// Plugin Vite personnalisé pour les extensions Chrome
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { resolve, dirname } from 'path';

export function chromeExtensionPlugin() {
  return {
    name: 'chrome-extension',
    generateBundle(options, bundle) {
      // Créer le manifest.json depuis le package.json
      const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
      
      const manifest = {
        manifest_version: 3,
        name: packageJson.displayName || packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
        permissions: [
          "activeTab"
        ],
        host_permissions: [
          "*://*.linkedin.com/*"
        ],
        content_scripts: [
          {
            matches: [
              "*://*.linkedin.com/*"
            ],
            js: [
              "content/content.js"
            ],
            css: [
              "content/content.css"
            ]
          }
        ],
        background: {
          service_worker: "background/background.js"
        },
        action: {
          default_title: packageJson.displayName || packageJson.name
        },
        icons: {
          16: "assets/icons/icon.svg",
          48: "assets/icons/icon.svg",
          128: "assets/icons/icon.svg"
        }
      };

      // Ajouter le manifest au bundle
      this.emitFile({
        type: 'asset',
        fileName: 'manifest.json',
        source: JSON.stringify(manifest, null, 2)
      });

      console.log('✅ Manifest.json généré automatiquement');
    },
    writeBundle(options, bundle) {
      // Copier les assets après le build
      const outDir = options.dir || 'dist';
      
      // Créer le dossier assets/icons s'il n'existe pas
      const iconsDir = resolve(outDir, 'assets/icons');
      if (!existsSync(iconsDir)) {
        mkdirSync(iconsDir, { recursive: true });
      }

      // Copier les icônes depuis le dossier source
      const sourceIconsDir = resolve('assets/icons');
      if (existsSync(sourceIconsDir)) {
        try {
          copyFileSync(resolve(sourceIconsDir, 'icon.svg'), resolve(iconsDir, 'icon.svg'));
          console.log('✅ Icônes copiées');
        } catch (error) {
          console.log('⚠️ Icônes non trouvées, création de placeholders');
          // Créer des icônes placeholder si elles n'existent pas
          const placeholderIcon = 'data:image/svg+xml;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
          writeFileSync(resolve(iconsDir, 'icon.svg'), placeholderIcon);
        }
      }

      console.log('✅ Extension Chrome prête dans:', outDir);
    }
  };
}