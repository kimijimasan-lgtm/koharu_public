const fs = require('fs');
const content = fs.readFileSync('js/data.js', 'utf8');

let newContent = content.replace(/totalMins = diffMins\(homeDepart, t\);/g, '');
newContent = newContent.replace(/const totalMins = diffMins\(departTimeStr, t\);/g, '');

// Shinkansen
newContent = newContent.replace('let totalMins = 0;', 'let totalMins = 0; let baseMins = 0;');
newContent = newContent.replace(/t = addMins\(t, ([a-zA-Z0-9]+)\);/g, 't = addMins(t, ); baseMins += ;');
newContent = newContent.replace(/return { time: totalMins, timeline, totalMins };/g, 'return { time: baseMins, timeline, totalMins: baseMins };');

fs.writeFileSync('js/data.js', newContent, 'utf8');
