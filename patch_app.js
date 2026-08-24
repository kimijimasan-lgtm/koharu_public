const fs = require('fs');
const content = fs.readFileSync('js/app.js', 'utf8');

// Replace generateItinerary
let newContent = content.replace(
  /generateItinerary\(hotel\) \{[\s\S]*?renderItinerary\(dest, hotel, day1, day2, day3, koharuScore, totalCost, relevantStation, travelTime, busyPeriod\);\r?\n  \},/,
  generateItinerary(hotel) {
    const destKey = this.resolveDestination(this.state.inputs.destination);
    const dest = DESTINATIONS[destKey];
    const inputs = this.state.inputs;
    
    const returnTimeParts = inputs.returnTime.split(':');
    const returnHour = parseInt(returnTimeParts[0]);
    const returnMin = parseInt(returnTimeParts[1]);

    const departureTimeParts = (inputs.departureTime || '10:00').split(':');
    const departureHour = parseInt(departureTimeParts[0]);
    const departureMin = parseInt(departureTimeParts[1]);

    const relevantStation = inputs.useStation === '2' ? inputs.station2 : inputs.station1;
    
    const departStr = \\\\\\:\\\\\\;
    const comparison = compareTransportRoutes(relevantStation, dest.name, departStr);
    const selectedRoute = comparison[comparison.recommended]; // flight or shinkansen

    const travelTime = selectedRoute.time;
    const koharuScore = this.calculateKoharuScore(hotel, travelTime, inputs.luggagePattern);

    const day1 = this.planDay1(dest, hotel, selectedRoute.timeline);
    const day2 = this.planDay2(dest, hotel);
    const day3 = this.planDay3(dest, hotel, selectedRoute.timeline, returnHour, returnMin);

    this.enrichEventsWithLinks(day1.events, hotel, dest);
    this.enrichEventsWithLinks(day2.events, hotel, dest);
    this.enrichEventsWithLinks(day3.events, hotel, dest);

    day1.events = this.fillMovementGaps(day1.events, hotel, dest);
    day2.events = this.fillMovementGaps(day2.events, hotel, dest);
    day3.events = this.fillMovementGaps(day3.events, hotel, dest);

    day1.dateLabel = this.getDayDateLabel(inputs.departureDate, 0);
    day2.dateLabel = this.getDayDateLabel(inputs.departureDate, 1);
    day3.dateLabel = this.getDayDateLabel(inputs.departureDate, 2);

    const busyPeriod = this.checkBusyPeriod(inputs.departureDate);
    const fareData = this.lookupFareData(relevantStation, dest);
    const totalCost = this.calculateCost(hotel, travelTime, dest, inputs.luggagePattern, fareData);

    this.renderItinerary(dest, hotel, day1, day2, day3, koharuScore, totalCost, relevantStation, travelTime, busyPeriod);
  },
);

// Replace planDay1, getCityConnection, finishDay1, and planDay3
newContent = newContent.replace(
  /planDay1\(dest, hotel, travelTime[\s\S]*?return \{ events, label: '3日目（帰宅日）' \};\r?\n  \},/,
  convertTimelineToEvents(timeline) {
    let events = [];
    let arrivalMin = 0;
    
    timeline.forEach(item => {
      if (item.type === 'node') {
        events.push({
          time: item.time,
          title: item.text,
          type: 'transport',
          timeSource: 'verified'
        });
        const [h, m] = item.time.split(':').map(Number);
        arrivalMin = h * 60 + m;
      } else {
        let icon = '❓';
        if (item.text.includes('✈️')) icon = '✈️';
        else if (item.text.includes('🚄')) icon = '🚄';
        else if (item.text.includes('☕') || item.text.includes('🛂')) icon = '⏳';
        else if (item.text.includes('🚃')) icon = '🚃';
        else if (item.text.includes('🚗') || item.text.includes('🚖')) icon = '🚕';
        
        let durMatch = item.text.match(/（約(\\d+)分）/);
        let durationStr = durMatch ? '約' + durMatch[1] + '分' : '';
        let label = item.text.replace(/^[^\\s]*\\s*/, '').replace(/（約\\d+分）$/, '');
        
        events.push({
          type: 'transfer',
          icon: icon,
          label: label,
          duration: durationStr,
          cost: null,
          timeSource: 'verified'
        });
      }
    });
    return { events, arrivalMin };
  },

  reverseTimelineToEvents(timeline, returnHour, returnMin) {
    // 逆算タイムラインの生成
    // 例: returnHour: 19, returnMin: 00 の場合、最終到着時間を19:00として各ノードの時刻を逆算する
    // 元のタイムラインの所要時間合計 (timeline[last].time - timeline[0].time) を算出
    
    const [startH, startM] = timeline[0].time.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    
    const lastNode = timeline[timeline.length - 1];
    const [endH, endM] = lastNode.time.split(':').map(Number);
    let endTotal = endH * 60 + endM;
    if (endTotal < startTotal) endTotal += 24 * 60; // 日またぎ
    
    const duration = endTotal - startTotal;
    
    // 逆算開始
    let targetEndTotal = returnHour * 60 + returnMin;
    let targetStartTotal = targetEndTotal - duration;
    
    // タイムラインを逆順にたどってイベントを生成
    let events = [];
    let currentMin = targetStartTotal;
    
    let reversedNodes = timeline.filter(t => t.type === 'node');
    let reversedEdges = timeline.filter(t => t.type === 'edge');
    
    // 出発ノード
    let firstNodeText = reversedNodes[reversedNodes.length - 1].text.replace('着', '発');
    if (firstNodeText.includes('北海道')) firstNodeText = firstNodeText.replace('北海道', ''); // 札幌着などを発に
    
    events.push({
      time: this.minToTime(currentMin),
      title: firstNodeText,
      type: 'transport',
      timeSource: 'verified'
    });
    
    let destDepartMin = currentMin; // 宿からの出発時間に使う
    
    // エッジと中間ノードを処理
    for (let i = reversedEdges.length - 1; i >= 0; i--) {
      let edge = reversedEdges[i];
      let icon = '❓';
      if (edge.text.includes('✈️')) icon = '✈️';
      else if (edge.text.includes('🚄')) icon = '🚄';
      else if (edge.text.includes('☕') || edge.text.includes('🛂')) icon = '⏳';
      else if (edge.text.includes('🚃')) icon = '🚃';
      else if (edge.text.includes('🚗') || edge.text.includes('🚖')) icon = '🚕';
      
      let durMatch = edge.text.match(/（約(\\d+)分）/);
      let durationMins = durMatch ? parseInt(durMatch[1]) : 0;
      let durationStr = durMatch ? '約' + durMatch[1] + '分' : '';
      let label = edge.text.replace(/^[^\\s]*\\s*/, '').replace(/（約\\d+分）$/, '');
      
      events.push({
        type: 'transfer',
        icon: icon,
        label: label,
        duration: durationStr,
        cost: null,
        timeSource: 'verified'
      });
      
      currentMin += durationMins;
      
      let nextNode = reversedNodes[i];
      let nodeText = nextNode.text;
      
      if (i > 0) {
        // 中間ノードの場合は発着を反転するなどの処理が必要だが、シンプルなテキスト置換で対応
        nodeText = nodeText.includes('着') ? nodeText.replace('着', '発') : nodeText.replace('発', '着');
      } else {
        // 最終到着地点（自宅）
        nodeText = nodeText.replace('発', '着');
      }
      
      events.push({
        time: this.minToTime(currentMin),
        title: nodeText,
        type: 'transport',
        timeSource: 'verified'
      });
    }
    
    return { events, destDepartMin };
  },

  planDay1(dest, hotel, timeline) {
    const { events, arrivalMin } = this.convertTimelineToEvents(timeline);
    return this.finishDay1(events, dest, hotel, arrivalMin);
  },

  finishDay1(events, dest, hotel, arrivalMin) {
    let taxiStartMin = arrivalMin;

    const taxiArrivalMin = taxiStartMin + hotel.taxiFromCityStation;
    const luggageDropMin = taxiArrivalMin + 15;
    const availableMinutes = 18 * 60 - luggageDropMin;

    events.push(this.makeTransfer('🚕', 'タクシー', \約\分\, \¥\\, 'estimated'));
    events.push({
      time: this.minToTime(taxiArrivalMin),
      title: \\ チェックイン・荷物を預ける\,
      type: 'hotel',
      timeSource: 'estimated',
    });

    const nearbySpots = dest.spots.filter(
      (s) => Math.abs(s.taxiFromCityStation - hotel.taxiFromCityStation) < 8
    );
    const lunchOptions = dest.restaurants.lunch;
    const snackOptions = dest.restaurants.snack;

    let currentMin = luggageDropMin;

    if (currentMin < 13.5 * 60 && lunchOptions.length > 0) {
      const lunch = lunchOptions[0];
      const lunchTime = Math.max(currentMin, 12 * 60);
      events.push({
        time: this.minToTime(lunchTime),
        title: \昼食：\\,
        type: 'food-lunch',
        detail: \\\\,
        budget: lunch.budget,
      });
      currentMin = lunchTime + 60;
    }

    if (availableMinutes > 120 && nearbySpots.length > 0) {
      const spot = nearbySpots[0];
      events.push({
        time: this.minToTime(currentMin),
        title: spot.name,
        type: 'spot',
        detail: \滞在約\分\,
        duration: spot.duration,
      });
      currentMin += spot.duration + 15;
    }

    if (currentMin < 16 * 60 && snackOptions.length > 0) {
      const snack = snackOptions[0];
      events.push({
        time: this.minToTime(currentMin),
        title: \食べ歩き：\\,
        type: 'food-snack',
        detail: snack.area,
        budget: snack.budget,
      });
      currentMin += 30;
    }

    if (currentMin < 17 * 60 && nearbySpots.length > 1) {
      const spot = nearbySpots[1];
      events.push({
        time: this.minToTime(currentMin),
        title: spot.name,
        type: 'spot',
        detail: \滞在約\分\,
        duration: spot.duration,
      });
      currentMin += spot.duration + 15;
    }

    events.push({
      time: '17:30',
      title: \\へ戻る\,
      type: 'hotel',
    });

    events.push({
      time: '18:00',
      title: hotel.dinnerIncluded ? '宿の夕食' : \夕食：\\,
      type: 'food-dinner',
      detail: hotel.dinnerIncluded
        ? '宿にて'
        : \\・要予約\,
      budget: hotel.dinnerIncluded ? 0 : dest.restaurants.dinner[0].budget,
    });

    return { events, label: '1日目（到着日）' };
  },

  planDay3(dest, hotel, timeline, returnHour = 19, returnMin = 0) {
    const { events: transportEvents, destDepartMin } = this.reverseTimelineToEvents(timeline, returnHour, returnMin);
    
    const events = [];
    const checkOutMin = Math.min(10 * 60, destDepartMin - hotel.taxiFromCityStation - 15);
    
    events.push({
      time: '07:30',
      title: hotel.breakfastIncluded ? '宿の朝食' : '朝食',
      type: 'food-breakfast',
      detail: hotel.breakfastIncluded ? '宿にて' : null,
    });
    
    events.push({
      time: this.minToTime(checkOutMin),
      title: \\ チェックアウト\,
      type: 'hotel',
    });
    
    const availableMinutes = destDepartMin - checkOutMin - hotel.taxiFromCityStation - 15;
    let currentMin = checkOutMin + 15;
    
    if (availableMinutes > 120 && dest.spots.length > 2) {
      events.push(this.makeTransfer('🚕', 'タクシー等', '約15分', null, 'estimated'));
      const spot = dest.spots[2];
      events.push({
        time: this.minToTime(currentMin + 15),
        title: spot.name,
        type: 'spot',
        detail: \滞在約\分\,
        duration: spot.duration,
      });
      currentMin += 15 + spot.duration;
    }
    
    if (destDepartMin > 13.5 * 60 && dest.restaurants.lunch.length > 1) {
      const lunch = dest.restaurants.lunch[1];
      const lunchTime = Math.max(currentMin + 15, 12 * 60);
      events.push(this.makeTransfer('🚶', '移動', '約15分', null, 'estimated'));
      events.push({
        time: this.minToTime(lunchTime),
        title: \昼食：\\,
        type: 'food-lunch',
        detail: \\\\,
        budget: lunch.budget,
      });
      currentMin = lunchTime + 60;
    }
    
    events.push(this.makeTransfer('🚕', 'タクシー等', \約\分\, null, 'estimated'));
    
    // トランスポートイベント（逆算したタイムライン）を追加
    events.push(...transportEvents);
    
    return { events, label: '3日目（帰宅日）' };
  },
);

fs.writeFileSync('js/app.js', newContent, 'utf8');
