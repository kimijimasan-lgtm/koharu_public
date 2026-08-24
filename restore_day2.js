const fs = require('fs');
const execSync = require('child_process').execSync;

const oldContent = execSync('git show HEAD^:js/app.js').toString('utf8');
let currentContent = fs.readFileSync('js/app.js', 'utf8');

const startIndex = oldContent.indexOf('  planDay2(dest, hotel) {');
const endIndex = oldContent.indexOf('  planDay3(dest, hotel, travelTime');
if (startIndex !== -1 && endIndex !== -1) {
  const planDay2Str = oldContent.substring(startIndex, endIndex);
  currentContent = currentContent.replace('  planDay3(dest, hotel, timeline, returnHour = 19, returnMin = 0) {', planDay2Str + '  planDay3(dest, hotel, timeline, returnHour = 19, returnMin = 0) {');
  fs.writeFileSync('js/app.js', currentContent, 'utf8');
  console.log('Successfully restored planDay2');
} else {
  console.log('Could not find planDay2 in old content');
}
