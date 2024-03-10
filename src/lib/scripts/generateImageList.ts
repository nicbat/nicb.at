import { readdirSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Convert import.meta.url to a directory path
const __dirname = dirname(fileURLToPath(import.meta.url));

const imagesDir: string = resolve(__dirname, '../public/images');
const outputFilePath: string = resolve(__dirname, '../src/assets/imagesList.ts');

// Read directory and map files
const images: string[] = readdirSync(imagesDir).map(file => `/images/${file}`);

// Write to file
writeFileSync(outputFilePath, `export const images: string[] = ${JSON.stringify(images)};`);