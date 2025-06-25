#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PHOTOS_DIR = path.join(__dirname, '../src/assets/photos');
const OUTPUT_FILE = path.join(__dirname, '../src/assets/photos.json');

// Supported image extensions
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov'];

function generatePhotosJson() {
    try {
        // Check if photos directory exists
        if (!fs.existsSync(PHOTOS_DIR)) {
            console.error(`Photos directory not found: ${PHOTOS_DIR}`);
            process.exit(1);
        }

        // Read existing JSON file if it exists
        let existingPhotos = [];
        if (fs.existsSync(OUTPUT_FILE)) {
            try {
                const existingData = fs.readFileSync(OUTPUT_FILE, 'utf8');
                existingPhotos = JSON.parse(existingData);
                console.log(`Found existing photos.json with ${existingPhotos.length} entries`);
            } catch (error) {
                console.warn('Error reading existing photos.json, starting fresh:', error.message);
                existingPhotos = [];
            }
        }

        // Create a map of existing photos for quick lookup
        const existingPhotosMap = new Map();
        existingPhotos.forEach(photo => {
            existingPhotosMap.set(photo.filename, photo.description);
        });

        // Read all files in the photos directory
        const files = fs.readdirSync(PHOTOS_DIR);
        
        // Filter for image files
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return IMAGE_EXTENSIONS.includes(ext);
        });

        console.log(`Found ${imageFiles.length} image files in ${PHOTOS_DIR}`);

        // Generate new photos array
        const newPhotos = imageFiles.map(filename => ({
            filename,
            description: existingPhotosMap.get(filename) || ""
        }));

        // Sort by filename for consistent ordering
        newPhotos.sort((a, b) => a.filename.localeCompare(b.filename));

        // Write to JSON file
        const jsonContent = JSON.stringify(newPhotos, null, 2);
        fs.writeFileSync(OUTPUT_FILE, jsonContent, 'utf8');

        console.log(`✅ Successfully generated ${OUTPUT_FILE}`);
        console.log(`📊 Total photos: ${newPhotos.length}`);
        
        const withDescriptions = newPhotos.filter(photo => photo.description.trim() !== "").length;
        const withoutDescriptions = newPhotos.length - withDescriptions;
        
        console.log(`📝 Photos with descriptions: ${withDescriptions}`);
        console.log(`⏳ Photos needing descriptions: ${withoutDescriptions}`);

        if (withoutDescriptions > 0) {
            console.log('\n📋 Photos needing descriptions:');
            newPhotos
                .filter(photo => photo.description.trim() === "")
                .forEach(photo => console.log(`  - ${photo.filename}`));
        }

    } catch (error) {
        console.error('Error generating photos JSON:', error);
        process.exit(1);
    }
}

// Run the script
generatePhotosJson(); 