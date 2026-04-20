import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packagePath = path.join(__dirname, '../package.json');
const outputPath = path.join(__dirname, '../data/app-info.ts'); // adjust path as needed

const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

const content = `// This file is auto-generated from package.json. If you want to change it, edit package.json instead.
export const version = '${pkg.version}';
export const name = '${pkg.name}';
`;

fs.writeFileSync(outputPath, content);
console.warn('Generated app-info.js successfully.');

// Generate public/search.json if it doesn't exist
// KBarSearchProvider always fetches this file; an empty array is a valid response.
const searchJsonPath = path.join(__dirname, '../public/search.json');
if (!fs.existsSync(searchJsonPath)) {
    fs.writeFileSync(searchJsonPath, '[]\n');
    console.warn('Generated public/search.json successfully.');
}
