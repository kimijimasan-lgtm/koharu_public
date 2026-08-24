const Tesseract = require('tesseract.js');
const path = 'C:/Users/kimij/.gemini/antigravity/brain/da5f98da-05af-499a-a8b4-3db9af6260d2/.user_uploaded/media_1787123472146.png';

Tesseract.recognize(
  path,
  'eng', // try eng first for numbers
  { logger: m => console.log(m.status, Math.round(m.progress * 100) + '%') }
).then(({ data: { text } }) => {
  console.log('--- RAW TEXT ---');
  console.log(text);
  
  const matches = text.match(/\b([0-1]?[0-9]|2[0-3]):([0-5][0-9])\b/g);
  console.log('--- TIMES FOUND ---');
  console.log(matches);
});
