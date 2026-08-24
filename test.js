const fs = require('fs');

function convertTimelineToEvents(timeline) {
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
      
      let durMatch = item.text.match(/（約(\d+)分）/);
      let durationStr = durMatch ? '約' + durMatch[1] + '分' : '';
      let label = item.text.replace(/^[✈️🚄☕🚃🚖🚗🛂]\s*/, '').replace(/（約\d+分）$/, '');
      
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
}
