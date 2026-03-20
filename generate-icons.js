const sharp = require('/opt/homebrew/lib/node_modules/turtle-cli/node_modules/sharp');
const fs = require('fs');
const path = require('path');

const svg = fs.readFileSync(path.join(__dirname, 'icons/icon.svg'));
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

(async () => {
  for (const size of sizes) {
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, `icons/icon-${size}.png`));
    console.log(`Generated icon-${size}.png`);
  }
  // Also generate apple-touch-icon (180x180)
  await sharp(svg)
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, 'icons/apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // favicon 32x32
  await sharp(svg)
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, 'icons/favicon-32.png'));
  console.log('Generated favicon-32.png');
})();
