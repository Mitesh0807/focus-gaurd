import fs from 'fs-extra';
import path from 'path';

const __dirname = path.resolve();

const distPath = path.join(__dirname, 'dist');
const assetsPath = path.join(__dirname, 'assets');
const manifestPath = path.join(__dirname, 'manifest.json');

async function postbuild() {
  try {
    // Ensure dist directory exists
    await fs.ensureDir(distPath);

    // Copy manifest and transform it
    const manifest = await fs.readJson(manifestPath);
    const distManifest = {
      ...manifest,
      action: {
        ...manifest.action,
        default_popup: 'popup/popup.html',
      },
      options_page: 'pages/options.html',
      background: {
        service_worker: 'background.js',
        type: 'module',
      },
      web_accessible_resources: [
        {
          resources: ['pages/blocked.html'],
          matches: ['<all_urls>'],
        },
      ],
    };
    await fs.writeJson(path.join(distPath, 'manifest.json'), distManifest, {
      spaces: 2,
    });

    // Copy assets
    await fs.copy(assetsPath, path.join(distPath, 'assets'));

    console.log('Postbuild script completed successfully.');
  } catch (error) {
    console.error('Error during postbuild script:', error);
    process.exit(1);
  }
}

postbuild();
