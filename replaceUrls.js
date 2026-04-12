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

console.log('🔄 Remplacement brutal de localhost:5000 en cours...');

let updatedCount = 0;
walkSync(path.join(__dirname, 'client/src'), (filepath) => {
  let content = fs.readFileSync(filepath, 'utf8');
  let original = content;

  // Remplace absolument tout ce qui est http://localhost:5000 par la nouvelle URL Vercel
  content = content.replace(/http:\/\/localhost:5000/g, "https://school-management-system-one-rose.vercel.app");

  if (content !== original) {
    fs.writeFileSync(filepath, content);
    console.log(`✅ Mis à jour : ${path.relative(__dirname, filepath)}`);
    updatedCount++;
  }
});

console.log(`\n🎉 Terminé ! ${updatedCount} fichiers modifiés.`);
