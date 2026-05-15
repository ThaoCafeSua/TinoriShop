const { Jimp } = require('jimp');

async function removeBackground() {
  try {
    const img = await Jimp.read('public/brand/floating-icons.png');
    
    // Iterate over all pixels
    img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      
      // If the pixel is close to white, make it transparent
      if (r > 240 && g > 240 && b > 240) {
        this.bitmap.data[idx + 3] = 0; // Set alpha to 0
      }
    });
    
    await img.write('public/brand/floating-icons-transparent.png');
    console.log("Background removed successfully!");
  } catch (err) {
    console.error("Error:", err);
  }
}

removeBackground();
