import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const walkSync = (dir, callback) => {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
      walkSync(filepath, callback);
    } else if (stats.isFile() && (filepath.endsWith('.js') || filepath.endsWith('.jsx'))) {
      callback(filepath);
    }
  });
};

console.log('🔄 Mise à jour des URLs en cours...');

let updatedCount = 0;
// Note: on utilise des RegExp pour "http://localhost:5000" et "http://localhost:5000/api"
walkSync(path.join(__dirname, 'client/src'), (filepath) => {
  let content = fs.readFileSync(filepath, 'utf8');
  let original = content;

  // Remplace "http://localhost:5000/api" strict (le plus commun)
  content = content.replace(/['"`]http:\/\/localhost:5000\/api(.*?)['"`]/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}$1`");
  
  // Remplace "http://localhost:5000" s'il en reste (sans le /api)
  content = content.replace(/['"`]http:\/\/localhost:5000(.*?)['"`]/g, "`${(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000')}$1`");

  if (content !== original) {
    fs.writeFileSync(filepath, content);
    console.log(`✅ Mis à jour : ${path.relative(__dirname, filepath)}`);
    updatedCount++;
  }
});

console.log(`\n🎉 Terminé ! ${updatedCount} fichiers modifiés.`);
