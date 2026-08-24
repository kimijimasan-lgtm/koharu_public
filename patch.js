const fs = require('fs');
const content = fs.readFileSync('js/data.js', 'utf8');
const lines = content.split(/\r?\n/);
const limitIndex = lines.findIndex(l => l.includes('const FIVE_HOUR_LIMIT'));
if (limitIndex === -1) { console.error('Limit not found'); process.exit(1); }

const newLogic = 
const FIVE_HOUR_LIMIT = 300; // 分

function addMins(timeStr, mins) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  let total = h * 60 + m + mins;
  if (total < 0) total += 24 * 60; // 日付またぎ対応
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return \\\\\\:\\\\\\;
}

// 時刻の差分（分）を計算
function diffMins(startStr, endStr) {
  const [sh, sm] = startStr.split(':').map(Number);
  const [eh, em] = endStr.split(':').map(Number);
  let total = (eh * 60 + em) - (sh * 60 + sm);
  if (total < 0) total += 24 * 60;
  return total;
}

// 現在時刻以降の直近の出発時刻を探す（モックダイヤ）
// schedules: ['08:00', '10:30', '14:15'] または毎時パターン
function findNextDeparture(currentTimeStr, schedules) {
  const currentTotal = currentTimeStr.split(':').map(Number).reduce((h, m) => h * 60 + m);
  
  for (let s of schedules) {
    const sTotal = s.split(':').map(Number).reduce((h, m) => h * 60 + m);
    if (sTotal >= currentTotal) return s;
  }
  // その日に無い場合は翌日の始発（モックなので24時間足す感覚で）
  return schedules[0];
}

// 毎時決まった分に出発するパターンの生成
function generateHourlySchedule(minuteList, startH = 6, endH = 22) {
  let list = [];
  for (let h = startH; h <= endH; h++) {
    for (let m of minuteList) {
      list.push(\\\\\\:\\\\\\);
    }
  }
  return list;
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

  // 仮想ダイヤ
  const yamabikoSchedule = generateHourlySchedule([12]); // 毎時12分
  const hayabusaSchedule = generateHourlySchedule([53]); // 毎時53分

  if (destName.includes('函館')) {
    if (toSendai[normStation]) {
      const dur1 = toSendai[normStation];
      const dur2 = times['仙台-函館'] || 159;
      
      const homeDepart = t;
      // やまびこへの乗車（駅到着後すぐ乗るわけではなくダイヤにスナップ）
      const firstTrain = findNextDeparture(t, yamabikoSchedule);
      const stationWait = diffMins(t, firstTrain);
      
      pushNode(t, \\\\\\駅 発\\\);
      if (stationWait > 0) {
        pushEdge(\\\☕ 駅での待ち（\\\分）\\\);
        t = addMins(t, stationWait);
      }
      
      pushEdge(\\\🚄 やまびこ・なすの等（約\\\分）\\\);
      t = addMins(t, dur1);
      pushNode(t, \\\仙台駅 着\\\);
      
      // 仙台ではやぶさに乗り換え
      const nextHayabusa = findNextDeparture(t, hayabusaSchedule);
      const wait = diffMins(t, nextHayabusa);
      
      pushEdge(\\\☕ 乗換・待ち（\\\分）\\\);
      t = addMins(t, wait);
      pushNode(t, \\\仙台駅 発\\\);
      pushEdge(\\\🚄 はやぶさ（約\\\分）\\\);
      t = addMins(t, dur2);
      pushNode(t, \\\新函館北斗駅 着\\\);
      
      totalMins = diffMins(homeDepart, t);
    } else if (toOmiya[normStation]) {
      const dur1 = toOmiya[normStation];
      const dur2 = times['大宮-函館'] || 231;
      
      const homeDepart = t;
      const firstTrain = findNextDeparture(t, yamabikoSchedule);
      const stationWait = diffMins(t, firstTrain);
      
      pushNode(t, \\\\\\駅 発\\\);
      if (stationWait > 0) {
        pushEdge(\\\☕ 駅での待ち（\\\分）\\\);
        t = addMins(t, stationWait);
      }
      
      pushEdge(\\\🚄 なすの等（約\\\分）\\\);
      t = addMins(t, dur1);
      pushNode(t, \\\大宮駅 着\\\);
      
      const nextHayabusa = findNextDeparture(t, hayabusaSchedule);
      const wait = diffMins(t, nextHayabusa);
      
      pushEdge(\\\☕ 乗換・待ち（\\\分）\\\);
      t = addMins(t, wait);
      pushNode(t, \\\大宮駅 発\\\);
      pushEdge(\\\🚄 はやぶさ（約\\\分）\\\);
      t = addMins(t, dur2);
      pushNode(t, \\\新函館北斗駅 着\\\);
      
      totalMins = diffMins(homeDepart, t);
    } else {
      const dur = times[\\\\\\-函館\\\] || 255;
      const homeDepart = t;
      const firstTrain = findNextDeparture(t, hayabusaSchedule);
      const stationWait = diffMins(t, firstTrain);
      
      pushNode(t, \\\\\\駅 発\\\);
      if (stationWait > 0) {
        pushEdge(\\\☕ 駅での待ち（\\\分）\\\);
        t = addMins(t, stationWait);
      }
      pushEdge(\\\🚄 はやぶさ等（約\\\分）\\\);
      t = addMins(t, dur);
      pushNode(t, \\\新函館北斗駅 着\\\);
      
      totalMins = diffMins(homeDepart, t);
    }
  } else if (destName.includes('札幌') || destName.includes('小樽') || destName.includes('旭川')) {
    const hako = generateShinkansenTimeline(normStation, '函館', departTimeStr);
    const plus = destName.includes('旭川') ? 120 : 220; 
    
    // 特急北斗は毎時05分発とする
    const hokutoSchedule = generateHourlySchedule([5]);
    
    timeline = hako.timeline;
    t = hako.timeline[hako.timeline.length-1].time;
    
    const nextHokuto = findNextDeparture(t, hokutoSchedule);
    const wait = diffMins(t, nextHokuto);
    
    pushEdge(\\\☕ 乗換・待ち（\\\分）\\\);
    t = addMins(t, wait);
    pushNode(t, \\\新函館北斗駅 発\\\);
    pushEdge(\\\🚃 特急北斗等（約\\\分）\\\);
    t = addMins(t, plus);
    pushNode(t, \\\\\\ 着\\\);
    
    totalMins = diffMins(departTimeStr, t);
  } else {
    const dur = times[\\\\\\-\\\\\\] || 255;
    const homeDepart = t;
    const genericSchedule = generateHourlySchedule([10, 40]);
    const firstTrain = findNextDeparture(t, genericSchedule);
    const stationWait = diffMins(t, firstTrain);
    
    pushNode(t, \\\\\\駅 発\\\);
    if (stationWait > 0) {
      pushEdge(\\\☕ 駅での待ち（\\\分）\\\);
      t = addMins(t, stationWait);
    }
    pushEdge(\\\🚄 新幹線（約\\\分）\\\);
    t = addMins(t, dur);
    pushNode(t, \\\\\\ 着\\\);
    
    totalMins = diffMins(departTimeStr, t);
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
  
  // モックダイヤ
  let flightSchedule = ['10:45', '14:00']; // 仙台-函館
  
  if (['那須塩原', '宇都宮', '郡山', '福島', '白石蔵王', '新白河', '白河'].includes(normStation)) {
    if (destName.includes('函館')) {
      useSendai = true;
      airportTransferTime = normStation === '宇都宮' ? 120 : 90;
      airportTransText = \\\🚗 自家用車・高速バス等（約\\\分）\\\;
      airport = '仙台空港';
      flightSchedule = ['10:45', '14:00']; // 仙台→函館
    } else {
      useFukushima = true;
      airportTransferTime = ['那須塩原', '宇都宮'].includes(normStation) ? 90 : 60;
      airportTransText = \\\🚗 自家用車等（約\\\分）\\\;
      airport = '福島空港';
      flightSchedule = ['10:30']; // 福島→新千歳
    }
  } else {
    // デフォルト空港（羽田など）
    flightSchedule = ['08:00', '10:30', '13:00', '16:00', '18:30'];
  }
  
  // 行き先が札幌（新千歳）で仙台空港の場合
  if (useSendai && !destName.includes('函館')) {
    flightSchedule = ['08:30', '10:15', '12:00', '14:45', '17:30', '19:00'];
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

  const REQUIRED_SECURE_TIME = 60; // 搭乗手続き等に必要な最小時間
  
  let t = departTimeStr;
  let timeline = [];
  const pushNode = (time, text) => timeline.push({ type: 'node', time, text });
  const pushEdge = (text) => timeline.push({ type: 'edge', text });

  pushNode(t, \\\\\\（ご自宅周辺） 発\\\);
  pushEdge(airportTransText);
  t = addMins(t, airportTransferTime);
  pushNode(t, \\\\\\ 着\\\);
  
  // 空港到着後、REQUIRED_SECURE_TIME を加えた時刻以降のフライトを探す
  const readyToFly = addMins(t, REQUIRED_SECURE_TIME);
  let flightDepart = findNextDeparture(readyToFly, flightSchedule);
  
  let flightNote = '';
  if (useFukushima) flightNote = ' ※ANA 1日1便';
  else if (useSendai) flightNote = ' ※ANA/ADO等';
  
  let waitTime = diffMins(t, flightDepart);
  // もしその日に乗れる便が無く翌日になる場合、待ち時間が極端に長くなるが計算上は正確
  pushEdge(\\\🛂 搭乗手続き・待ち（約\\\分）\\\);
  t = addMins(t, waitTime);
  pushNode(t, \\\\\\ 発\\\\\\);
  
  pushEdge(\\\✈️ フライト（約\\\分）\\\);
  t = addMins(t, flightTime);
  pushNode(t, \\\\\\ 着\\\);
  
  pushEdge(localTransText);
  t = addMins(t, localTransfer);
  pushNode(t, \\\\\\ 着\\\);

  const totalMins = diffMins(departTimeStr, t);
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
fs.writeFileSync('js/data.js', newLines.join('\\n') + '\\n' + newLogic, 'utf8');
