import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logoPath = join(__dirname, '../public/logo.png');
const outputDir = join(__dirname, '../public/favicon');

// Create output directory if it doesn't exist
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

// Favicon sizes to generate
const faviconSizes = [
  { name: 'favicon.ico', size: 32 },
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

async function generateFavicons() {
  try {
    console.log('Generating favicon assets from logo.png...');
    
    // Check if logo exists
    if (!existsSync(logoPath)) {
      throw new Error(`Logo file not found at ${logoPath}`);
    }

    // Generate all favicon sizes
    for (const { name, size } of faviconSizes) {
      const outputPath = join(outputDir, name);
      
      if (name === 'favicon.ico') {
        // Generate ICO file (multi-size ICO with 16x16 and 32x32)
        await sharp(logoPath)
          .resize(32, 32, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .toFormat('png')
          .toFile(outputPath.replace('.ico', '-32.png'));
        
        // For ICO, we'll create a PNG and rename it (browsers accept PNG as ICO)
        await sharp(logoPath)
          .resize(32, 32, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .toFormat('png')
          .toFile(outputPath);
        
        console.log(`✓ Generated ${name} (32x32)`);
      } else {
        await sharp(logoPath)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .toFormat('png')
          .toFile(outputPath);
        
        console.log(`✓ Generated ${name} (${size}x${size})`);
      }
    }

    console.log('\n✅ All favicon assets generated successfully!');
    console.log(`Output directory: ${outputDir}`);
  } catch (error) {
    console.error('Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();

