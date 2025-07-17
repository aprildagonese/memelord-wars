#!/usr/bin/env node

/**
 * Script to auto-update meme templates from Imgflip API
 * Run: node scripts/update_meme_templates.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const IMGFLIP_API_URL = 'https://api.imgflip.com/get_memes';
const APP_JS_PATH = path.join(__dirname, '../src/App.js');

async function fetchMemeTemplates() {
  return new Promise((resolve, reject) => {
    https.get(IMGFLIP_API_URL, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.data.memes);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

function generateTemplateObject(memes) {
  // Filter for popular memes and create template object
  const popularMemes = memes
    .filter(meme => meme.captions > 50000) // Only popular memes
    .slice(0, 50) // Top 50
    .sort((a, b) => b.captions - a.captions);

  let templateCode = 'const MEME_TEMPLATES = {\n';
  
  popularMemes.forEach(meme => {
    const name = meme.name;
    const id = meme.id;
    const boxes = meme.box_count;
    
    templateCode += `  '${name}': { id: '${id}', boxes: ${boxes} },\n`;
  });
  
  templateCode += '};';
  
  return templateCode;
}

function updateAppJs(newTemplateCode) {
  const appJs = fs.readFileSync(APP_JS_PATH, 'utf8');
  
  // Replace the MEME_TEMPLATES object
  const updatedCode = appJs.replace(
    /const MEME_TEMPLATES = \{[\s\S]*?\};/,
    newTemplateCode
  );
  
  fs.writeFileSync(APP_JS_PATH, updatedCode);
  console.log('✅ Updated meme templates in App.js');
}

async function main() {
  try {
    console.log('🔄 Fetching meme templates from Imgflip API...');
    const memes = await fetchMemeTemplates();
    
    console.log(`📊 Found ${memes.length} total memes`);
    
    const templateCode = generateTemplateObject(memes);
    
    console.log('🔧 Updating App.js with new templates...');
    updateAppJs(templateCode);
    
    console.log('🎉 Done! Remember to rebuild your app.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();