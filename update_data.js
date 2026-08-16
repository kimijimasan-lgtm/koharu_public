const fs = require('fs');
const content = fs.readFileSync('js/data.js', 'utf8');
const lines = content.split('\n');

// Find where 'const FIVE_HOUR_LIMIT = 300;' starts
const limitIndex = lines.findIndex(l => l.includes('const FIVE_HOUR_LIMIT = 300;'));

const newLogic = 
const FIVE_HOUR_LIMIT = 300; // 分

function addMins(timeStr, mins) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  let total = h * 60 + m + mins;
  if (total < 0) total += 24 * 60;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return \\\\\\:\\\\\\;
}

function generateShinkansenTimeline(stationName, destName, departTimeStr) {
  const times = getTravelTimes();
  const normStation = stationName.replace(/駅$/, '');
  const toOmiya = { '那須塩原': 45, '宇都宮': 30, '郡山': 60, '福島': 80 };
  const toSendai = { '那須塩原': 60, '宇都宮': 80, '郡山': 40, '福島': 25, '白石蔵王': 15, '新白河': 50, '白河': 55 };

  let t = departTimeStr;
  let timeline = [];
  let totalMins = 0;

  const pushNode = (time, text) => timeline.push({ type: 'node', time, text });
  const pushEdge = (text) => timeline.push({ type: 'edge', text });

  if (destName.includes('函館')) {
    if (toSendai[normStation]) {
      const dur1 = toSendai[normStation];
      const wait = 20;
      const dur2 = times['仙台-函館'] || 159;
      totalMins = dur1 + wait + dur2;

      pushNode(t, \\\\\\駅 発\\\);
      pushEdge(\\\🚄 やまびこ・なすの等（約\\\分）\\\);
      t = addMins(t, dur1);
      pushNode(t, \\\仙台駅 着\\\);
      pushEdge(\\\☕ 乗換・待ち（\\\分）\\\);
      t = addMins(t, wait);
      pushNode(t, \\\仙台駅 発\\\);
      pushEdge(\\\🚄 はやぶさ（約\\\分）\\\);
      t = addMins(t, dur2);
      pushNode(t, \\\新函館北斗駅 着\\\);
    } else if (toOmiya[normStation]) {
      const dur1 = toOmiya[normStation];
      const wait = 20;
      const dur2 = times['大宮-函館'] || 231;
      totalMins = dur1 + wait + dur2;

      pushNode(t, \\\\\\駅 発\\\);
      pushEdge(\\\🚄 なすの等（約\\\分）\\\);
      t = addMins(t, dur1);
      pushNode(t, \\\大宮駅 着\\\);
      pushEdge(\\\☕ 乗換・待ち（\\\分）\\\);
      t = addMins(t, wait);
      pushNode(t, \\\大宮駅 発\\\);
      pushEdge(\\\🚄 はやぶさ（約\\\分）\\\);
      t = addMins(t, dur2);
      pushNode(t, \\\新函館北斗駅 着\\\);
    } else {
      const dur = times[\\\\\\-函館\\\] || 255;
      totalMins = dur;
      pushNode(t, \\\\\\駅 発\\\);
      pushEdge(\\\🚄 はやぶさ等（約\\\分）\\\);
      t = addMins(t, dur);
      pushNode(t, \\\新函館北斗駅 着\\\);
    }
  } else if (destName.includes('札幌') || destName.includes('小樽') || destName.includes('旭川')) {
    const hako = generateShinkansenTimeline(normStation, '函館', departTimeStr);
    const plus = destName.includes('旭川') ? 120 : 220;
    const wait = 15;
    totalMins = hako.totalMins + wait + plus;
    
    timeline = hako.timeline;
    t = hako.timeline[hako.timeline.length-1].time;
    pushEdge(\\\☕ 乗換・待ち（\\\分）\\\);
    t = addMins(t, wait);
    pushNode(t, \\\新函館北斗駅 発\\\);
    pushEdge(\\\🚃 特急北斗等（約\\\分）\\\);
    t = addMins(t, plus);
    pushNode(t, \\\\\\ 着\\\);
  } else {
    const dur = times[\\\\\\-\\\\\\] || 255;
    totalMins = dur;
    pushNode(t, \\\\\\駅 発\\\);
    pushEdge(\\\🚄 新幹線（約\\\分）\\\);
    t = addMins(t, dur);
    pushNode(t, \\\\\\ 着\\\);
  }

  return { time: totalMins, timeline, totalMins };
}

function generateFlightTimeline(stationName, destName, departTimeStr) {
  const normStation = stationName.replace(/駅$/, '');
  let airportTransferTime = 90;
  let airportTransText = '🚃 在来線等（約90分）';
  let airport = '羽田空港(または主要空港)';
  
  let useFukushima = false;
  let useSendai = false;
  if (['那須塩原', '宇都宮', '郡山', '福島', '白石蔵王', '新白河', '白河'].includes(normStation)) {
    if (destName.includes('函館')) {
      useSendai = true;
      airportTransferTime = normStation === '宇都宮' ? 120 : 90;
      airportTransText = \\\🚗 自家用車・高速バス等（約\\\分）\\\;
      airport = '仙台空港';
    } else {
      useFukushima = true;
      airportTransferTime = ['那須塩原', '宇都宮'].includes(normStation) ? 90 : 60;
      airportTransText = \\\🚗 自家用車等（約\\\分）\\\;
      airport = '福島空港';
    }
  }

  const flightTime = destName.includes('函館') ? 70 : 80;
  let localTransfer = 50;
  let localTransText = '🚃 快速エアポート等（約50分）';
  let destAirport = '新千歳空港';
  
  if (destName.includes('函館')) {
    destAirport = '函館空港';
    localTransfer = 20;
    localTransText = '🚖 連絡バス・タクシー等（約20分）';
  } else if (destName.includes('旭川')) {
    destAirport = '旭川空港';
    localTransfer = 40;
    localTransText = '🚖 連絡バス等（約40分）';
  }

  let tHomeDepart = departTimeStr;
  let waitTime = 60;
  let flightDepart = '';
  let flightNote = '';

  if (useFukushima) {
     flightDepart = '10:30';
     flightNote = ' ※ANA 1日1便';
     const preMins = airportTransferTime + waitTime;
     tHomeDepart = addMins(flightDepart, -preMins);
  } else if (useSendai) {
     waitTime = 90;
     flightDepart = addMins(departTimeStr, airportTransferTime + waitTime);
     flightNote = ' ※ANA/JAL/ADO等';
  } else {
     waitTime = 90;
     flightDepart = addMins(departTimeStr, airportTransferTime + waitTime);
     flightNote = ' ※複数便あり';
  }

  let t = tHomeDepart;
  let timeline = [];
  const pushNode = (time, text) => timeline.push({ type: 'node', time, text });
  const pushEdge = (text) => timeline.push({ type: 'edge', text });

  pushNode(t, \\\\\\（ご自宅周辺） 発\\\);
  pushEdge(airportTransText);
  t = addMins(t, airportTransferTime);
  pushNode(t, \\\\\\ 着\\\);
  
  pushEdge(\\\🛂 搭乗手続き・待ち（約\\\分）\\\);
  t = addMins(t, waitTime);
  pushNode(t, \\\\\\ 発\\\\\\);
  
  pushEdge(\\\✈️ フライト（約\\\分）\\\);
  t = addMins(t, flightTime);
  pushNode(t, \\\\\\ 着\\\);
  
  pushEdge(localTransText);
  t = addMins(t, localTransfer);
  pushNode(t, \\\\\\ 着\\\);

  const totalMins = airportTransferTime + waitTime + flightTime + localTransfer;
  return { time: totalMins, timeline, totalMins };
}

function compareTransportRoutes(stationName, destName, departTimeStr = '10:00') {
  const shinkansen = generateShinkansenTimeline(stationName, destName, departTimeStr);
  const flight = generateFlightTimeline(stationName, destName, departTimeStr);

  let recommended = 'flight';
  if (shinkansen && shinkansen.time <= FIVE_HOUR_LIMIT) {
    recommended = 'shinkansen';
  }

  return { recommended, shinkansen, flight };
}
;

const newLines = lines.slice(0, limitIndex);
fs.writeFileSync('js/data.js', newLines.join('\n') + '\n' + newLogic, 'utf8');
