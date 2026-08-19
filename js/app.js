const STORAGE_KEY = 'koharu_saved_inputs';

const App = {
  state: {
    currentStep: 'input',
    inputs: {
      // 公開版：departure（自宅住所）は削除済み
      station1: '',
      station2: '',
      useStation: '1',
      destination: '',
      departureTime: '10:00',
      departureDate: '',
      returnTime: '19:00',
      luggagePattern: 'A',
    },
    selectedHotel: null,
    itineraries: [],
    confirmedPlan: null,
    // 実ダイヤから選ばれた便のパターン名（'朝便' 等）。実ダイヤ未整備の区間では null のまま
    trainChoice: { outbound: null, inbound: null },
    customTimes: {}, // e.g. { day1Start: "08:58", day1End: "14:21" }
    // findScheduleOptions() の結果キャッシュ。送信ボタンの活性判定に使う
    scheduleOptions: { outbound: null, inbound: null },
  },

  init() {
    this.bindEvents();
    this.loadSavedInputs();
    this.updateStationChoiceLabels();
    if (!this.restoreFromQr()) {
      this.refreshTrainChoices();
      this.showStep('input');
    }
  },

  bindEvents() {
    this.bindSwipeEvents();
    document.getElementById('form-input').addEventListener('submit', (e) => {
      e.preventDefault();
      this.collectInputs();
      this.saveInputsToStorage();
      if (this.generateHotelCandidates()) {
        this.showStep('hotels');
      }
    });

    this.bindQrModalEvents();
    
    // Screenshot upload handling
    const screenshotInput = document.getElementById('route-screenshot-upload');
    if (screenshotInput) {
      screenshotInput.addEventListener('change', (e) => {
        const previewContainer = document.getElementById('route-screenshots-preview');
        const files = Array.from(e.target.files);
        
        files.forEach(file => {
          if (!file.type.startsWith('image/')) return;
          
          const reader = new FileReader();
          reader.onload = (e) => {
            const imgEl = document.createElement('img');
            imgEl.src = e.target.result;
            imgEl.style.maxWidth = '100%';
            imgEl.style.maxHeight = '500px'; // Restrict height for reasonable printing
            imgEl.style.objectFit = 'contain';
            imgEl.style.borderRadius = '8px';
            imgEl.style.border = '1px solid #ddd';
            imgEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            
            const wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            wrapper.style.display = 'inline-block';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '×';
            deleteBtn.style.position = 'absolute';
            deleteBtn.style.top = '-8px';
            deleteBtn.style.right = '-8px';
            deleteBtn.style.background = '#ff4444';
            deleteBtn.style.color = 'white';
            deleteBtn.style.border = 'none';
            deleteBtn.style.borderRadius = '50%';
            deleteBtn.style.width = '24px';
            deleteBtn.style.height = '24px';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.style.fontSize = '14px';
            deleteBtn.style.lineHeight = '1';
            deleteBtn.classList.add('no-print');
            deleteBtn.onclick = () => wrapper.remove();
            
            wrapper.appendChild(imgEl);
            wrapper.appendChild(deleteBtn);
            previewContainer.appendChild(wrapper);
          };
          reader.readAsDataURL(file);
        });
        
        // Reset input so the same file can be selected again if needed
        screenshotInput.value = '';
      });
    }

    document.getElementById('btn-back-hotels').addEventListener('click', () => this.showStep('input'));
    document.getElementById('btn-back-itinerary').addEventListener('click', () => this.showStep('hotels'));
    document.getElementById('btn-new-trip').addEventListener('click', () => {
      this.resetState();
      this.showStep('input');
    });

    document.getElementById('destination').addEventListener('change', () => {
      this.saveInputsToStorage();
      this.updateDestinationInfo();
      this.refreshTrainChoices();
    });

    document.querySelectorAll('input[name="luggage"]').forEach((radio) => {
      radio.addEventListener('change', () => this.updateLuggageDescription());
    });

    // 出発地・時刻が変わると使える実ダイヤが変わるため、そのつど選択肢を組み直す
    ['departure-time', 'return-time'].forEach((id) => {
      document.getElementById(id).addEventListener('change', () => {
        this.saveInputsToStorage();
        this.refreshTrainChoices();
      });
    });

    // 公開版：departure（自宅住所）欄は削除済みのためイベントなし
    document.getElementById('user-prefecture')?.addEventListener('change', () => {
      this.populateStationsForPrefecture();
      this.saveInputsToStorage();
      this.updateDestinationInfo();
      this.refreshTrainChoices();
    });
    
    document.getElementById('top-station-select')?.addEventListener('change', () => {
      this.saveInputsToStorage();
      this.updateDestinationInfo();
      this.refreshTrainChoices();
    });
  },

  updateStationChoiceLabels() {
    // Deprecated
  },

  populateStationsForPrefecture() {
    const prefSelect = document.getElementById('user-prefecture');
    const stationSelect = document.getElementById('top-station-select');
    if (!prefSelect || !stationSelect) return;
    
    const pref = prefSelect.value;
    const stations = PREFECTURE_STATIONS[pref] || [];
    
    // Preserve current selection if possible
    const currentVal = stationSelect.value;
    
    stationSelect.innerHTML = '';
    if (stations.length === 0) {
      stationSelect.innerHTML = '<option value="" disabled selected>未登録</option><option value="" disabled>↓お住まいの都道府県を画面下部で登録してください</option>';
    } else {
      stations.forEach(st => {
        const opt = document.createElement('option');
        opt.value = st;
        opt.textContent = st + '駅';
        stationSelect.appendChild(opt);
      });
      if (stations.includes(currentVal)) {
        stationSelect.value = currentVal;
      } else {
        stationSelect.selectedIndex = 0;
      }
    }
  },

  saveInputsToStorage() {
    const data = {
      userPrefecture: document.getElementById('user-prefecture')?.value,
      topStation: document.getElementById('top-station-select')?.value,
      destination: document.getElementById('destination').value,
      departureTime: document.getElementById('departure-time').value,
      departureDate: document.getElementById('departure-date').value,
      returnTime: document.getElementById('return-time').value,
      luggagePattern: document.querySelector('input[name="luggage"]:checked')?.value || 'A',
      trainChoice: { ...this.state.trainChoice },
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  },

  loadSavedInputs() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      this.applyInputsToForm(data);
    } catch (e) {}
  },

  // 保存済み/QR経由の入力データをフォームDOMとstate.inputsの両方に反映する
  applyInputsToForm(data) {
    if (!data) return;
    if (data.userPrefecture != null) {
      const prefEl = document.getElementById('user-prefecture');
      if (prefEl) prefEl.value = data.userPrefecture;
      this.populateStationsForPrefecture();
    }
    if (data.topStation != null) {
      const topSelect = document.getElementById('top-station-select');
      if (topSelect && [...topSelect.options].some(o => o.value === data.topStation)) {
        topSelect.value = data.topStation;
      }
    }
    if (data.destination != null) {
      document.getElementById('destination').value = data.destination;
    }
    if (data.departureTime) {
      document.getElementById('departure-time').value = data.departureTime;
    }
    if (data.departureDate != null) {
      document.getElementById('departure-date').value = data.departureDate;
    }
    if (data.returnTime) {
      document.getElementById('return-time').value = data.returnTime;
    }
    if (data.luggagePattern) {
      const radio = document.querySelector(`input[name="luggage"][value="${data.luggagePattern}"]`);
      if (radio) radio.checked = true;
    }
    if (data.luggagePattern) {
      const radio = document.querySelector(`input[name="luggage"][value="${data.luggagePattern}"]`);
      if (radio) radio.checked = true;
    }

    // trainChoice はフォーム項目ではないので state.inputs には混ぜない
    const { trainChoice, ...formInputs } = data;
    this.state.inputs = { ...this.state.inputs, ...formInputs };
    if (trainChoice) {
      this.state.trainChoice = { outbound: trainChoice.outbound || null, inbound: trainChoice.inbound || null };
    }

    this.updateStationChoiceLabels();
    this.updateLuggageDescription();
    this.updateDestinationInfo();
    // 復元した時刻・区間に対して選択肢を組み直す（選択済みの便が今も有効なら維持される）
    this.refreshTrainChoices();
    
  },

  showStep(step) {
    this.state.currentStep = step;
    document.querySelectorAll('.step').forEach((el) => el.classList.remove('active'));
    document.getElementById(`step-${step}`).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  collectInputs() {
    this.state.inputs = {
      userPrefecture: document.getElementById('user-prefecture')?.value,
      topStation: document.getElementById('top-station-select')?.value,
      destination: document.getElementById('destination').value,
      departureTime: document.getElementById('departure-time').value,
      departureDate: document.getElementById('departure-date').value,
      returnTime: document.getElementById('return-time').value,
      luggagePattern: document.querySelector('input[name="luggage"]:checked')?.value || 'A',
    };
  },

  resolveDestination(text) {
    if (!text) return null;
    for (const [key, dest] of Object.entries(DESTINATIONS)) {
      if (text.includes(dest.name) || text.includes(key)) return key;
    }
    return null;
  },

  // 現在選択中の新幹線駅名を返す（公開版：departure欄がないためstation-1/2を参照）
  getSelectedStationName() {
    return document.getElementById('top-station-select')?.value || '';
  },

  updateDestinationInfo() {
    const infoEl = document.getElementById('destination-info');
    const text = document.getElementById('destination').value;
    const destKey = this.resolveDestination(text);
    const subtitleEl = document.getElementById('top-subtitle');
    
    if (!destKey) {
      infoEl.innerHTML = '';
      if (subtitleEl) subtitleEl.innerHTML = '旅行先エリアを選択してください。';
      return;
    }
    const dest = DESTINATIONS[destKey];

    // Check if the route is valid and under 5 hours
    const station = this.state.inputs.topStation;
    if (station && station.includes('駅')) {
        const routeInfo = compareTransportRoutes(station, dest.name, this.state.inputs.departureTime || '10:00');
        const recommendedRoute = routeInfo[routeInfo.recommended];
        if (!recommendedRoute || recommendedRoute.time === 0) {
            alert('ご指定の出発時刻では、本日中に到着できる交通機関がありません。\n出発時刻を早めるか、別の出発地をご検討ください。');
            return false;
        }
        if (recommendedRoute && recommendedRoute.time > 300) {
            const formatHours = (mins) => {
                const h = Math.floor(mins / 60);
                const m = mins % 60;
                return m === 0 ? h + '時間' : h + '時間' + m + '分';
            };
            const sTime = routeInfo.shinkansen ? '新幹線は約' + formatHours(routeInfo.shinkansen.time) : '';
            const fTime = routeInfo.flight ? '飛行機は約' + formatHours(routeInfo.flight.time) : '';
            const joinT = sTime && fTime ? '、' : '';
            alert('ご指定のルートは ' + sTime + joinT + fTime + ' かかるため、片道5時間（300分）を超えてしまいます。\n「疲れない旅」の基準を満たさないため、出発地または目的地を変更してください。');
            return false;
        }
    }
    if (subtitleEl) subtitleEl.innerHTML = `${dest.area}・片道５時間以内で到着。<br>２泊３日の疲れない旅を設計します。`;
    const stationName = this.getSelectedStationName();

    let transportHtml = '';
    if (stationName && dest.name) {
      const departTimeStr = document.getElementById('departure-time').value || '10:00';
      const comparison = compareTransportRoutes(stationName, dest.name, departTimeStr);
      
      const formatTime = (mins) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? `${h}時間${m > 0 ? m + '分' : ''}` : `${m}分`;
      };

      const renderTimeline = (timeline) => {
        return timeline.map(item => {
          if (item.type === 'node') {
            return `<div class="timeline-node"><span class="tl-time">${item.time}</span> <span class="tl-text">${item.text}</span></div>`;
          } else {
            return `<div class="timeline-edge">${item.text}</div>`;
          }
        }).join('');
      };

      const shin = comparison.shinkansen;
      const fli = comparison.flight;

      const shinHtml = (shin) ? `
        <div class="compare-item ${comparison.recommended === 'shinkansen' ? 'recommended' : ''}">
          <div class="compare-header">
            <strong>🚄 新幹線</strong>
            <span class="compare-time">約 ${formatTime(shin.time)}</span>
          </div>
          <div class="timeline-container">
            ${renderTimeline(shin.timeline)}
          </div>
        </div>
      ` : '';

      const fliHtml = (fli) ? `
        <div class="compare-item ${comparison.recommended === 'flight' ? 'recommended' : ''}">
          <div class="compare-header">
            <strong>✈️ 飛行機</strong>
            <span class="compare-time">約 ${formatTime(fli.time)}</span>
          </div>
          <div class="timeline-container">
            ${renderTimeline(fli.timeline)}
          </div>
        </div>
      ` : '';

      let conclusionText = '';
      const formatHoursStr = (mins) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return m === 0 ? h + '時間' : h + '時間' + m + '分';
      };

      if (shin && fli) {
        const shinT = formatHoursStr(shin.time);
        const fliT = formatHoursStr(fli.time);
        
        let reason = '';
        if (comparison.recommended === 'shinkansen') {
            if (shin.time <= fli.time) {
                reason = `🚄 所要時間も短く、乗り換え等の疲労も少ないため【新幹線】推奨`;
            } else {
                reason = `🚄 飛行機（約${fliT}）より少し時間はかかりますが、乗り換え等の疲労の少なさから【新幹線】推奨`;
            }
        } else {
            reason = `✈️ 新幹線（約${shinT}）より所要時間が短いため【飛行機】推奨`;
        }

        if (shin.time > 300 && fli.time > 300) {
            conclusionText = `⚠️ どちらも5時間を超えますが、比較するなら<br>${reason}。<br><span style="font-size: 0.9em; color: #d32f2f;">※片道5時間超えのため出発地または目的地の変更をご検討ください</span>`;
        } else if (shin.time > 300) {
            conclusionText = `✈️ 新幹線は5時間を超える（約${shinT}）ため、【飛行機】推奨`;
        } else if (fli.time > 300) {
            conclusionText = `🚄 飛行機は5時間を超える（約${fliT}）ため、疲労の少ない【新幹線】推奨`;
        } else {
            conclusionText = reason;
        }
      } else {
         conclusionText = comparison.recommended === 'shinkansen' ? '🚄 【新幹線】推奨' : '✈️ 【飛行機】推奨';
      }

      transportHtml = `
        <div class="transport-comparison">
          <div class="comparison-title">💡 ${conclusionText}</div>
          <div class="comparison-grid">
            ${shinHtml}
            ${fliHtml}
          </div>
        </div>
      `;
    }

    const accessLabel = dest.transportMode === 'flight'
      ? `📍 ${dest.airport || '最寄り空港'}出発 ⇄ ${dest.station}`
      : `📍 ${dest.shinkansen || '新幹線'}の${dest.station}駅`;

    infoEl.innerHTML = `
      <div class="dest-info-card">
        <span class="dest-info-label">${accessLabel}</span>
        <span class="dest-info-highlights">${dest.highlights.join(' ・ ')}</span>
        ${transportHtml}
      </div>
    `;
  },

  updateLuggageDescription() {
    const val = document.querySelector('input[name="luggage"]:checked').value;
    const descriptions = {
      A: '最終日、宿に荷物を預けて観光後に宿へ戻り、そこから駅へ向かいます。宿周辺の観光が中心になります。',
      B: '最終日、駅のコインロッカーに預けてから観光。駅を起点に動ける範囲で観光します。',
      C: '荷物を持ち歩きます。身軽に動ける観光地に限定されますが、動線がシンプルです。',
    };
    document.getElementById('luggage-description').textContent = descriptions[val];
  },

  // ==== 実ダイヤへのスナップ（希望時刻 → 実在する列車） ====
  // 自由入力された時刻をそのまま使うと実在しない列車を前提にした行程になるため、
  // SHINKANSEN_SCHEDULES の実ダイヤから便を選ばせる。完全一致する便があるとき、
  // および選択の余地がないとき（A=B、または片側しか便が無い）は自動確定し、
  // 「早い便」と「最も近い便」が別々に存在するときだけユーザーに選ばせる。
  refreshTrainChoices() {
    const destKey = this.resolveDestination(document.getElementById('destination').value);
    const destName = destKey ? DESTINATIONS[destKey].name : '';
    // 公開版：departure欄は削除済み。選択中の駅名を使用する
    const stationName = this.getSelectedStationName();
    const trip = lookupTripSchedule(stationName, destName);

    const outbound = trip
      ? findScheduleOptions(trip.outbound, document.getElementById('departure-time').value, 'departure')
      : null;
    const inbound = trip
      ? findScheduleOptions(trip.inbound, document.getElementById('return-time').value, 'arrival')
      : null;

    this.state.scheduleOptions = { outbound, inbound };
    this.renderTrainChoice('departure-train-choice', 'outbound', outbound);
    this.renderTrainChoice('return-train-choice', 'inbound', inbound);
    this.updateSubmitGate();
  },

  // 1パターンを「見出し（基準時刻）」と「補足（反対側の時刻・所要・便名）」に整形する。
  // 往路は出発時刻、復路は帰宅到着時刻が利用者の関心事なので、そちらを見出しに置く。
  describeSchedulePattern(pattern, mode) {
    const first = pattern.steps[0];
    const last = pattern.steps[pattern.steps.length - 1];
    const totalMin = this.timeToMin(last.arr) - this.timeToMin(first.dep);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    const dur = h ? (m ? `${h}時間${m}分` : `${h}時間`) : `${m}分`;
    return mode === 'outbound'
      ? { title: `${first.dep} ${first.from}発`, detail: `${last.to} ${last.arr}着／所要${dur}／${pattern.pattern}` }
      : { title: `${last.arr} ${last.to}着`, detail: `${first.from} ${first.dep}発／所要${dur}／${pattern.pattern}` };
  },

  renderTrainChoice(containerId, mode, opts) {
    const el = document.getElementById(containerId);
    const wishLabel = mode === 'outbound' ? '出発' : '帰宅';

    // 実ダイヤ未整備の区間では何も出さず、従来どおりの概算計算に任せる
    if (!opts) {
      el.innerHTML = '';
      el.classList.remove('is-resolved');
      this.state.trainChoice[mode] = null;
      return;
    }

    const settle = (entry, noteHtml) => {
      this.state.trainChoice[mode] = entry.pattern.pattern;
      el.classList.add('is-resolved');
      el.innerHTML = `<p class="train-choice-note">${noteHtml}</p>`;
    };

    if (opts.exact) {
      const d = this.describeSchedulePattern(opts.exact.pattern, mode);
      settle(opts.exact, `ご希望の時刻ちょうどの列車があります：<strong>${d.title}</strong>（${d.detail}）`);
      return;
    }

    if (!opts.needsChoice) {
      const entry = opts.auto;
      const d = this.describeSchedulePattern(entry.pattern, mode);
      const warn = scheduleGapWarning(entry.diffMin);
      const warnHtml = warn ? ` <span class="train-choice-warning">${warn}</span>` : '';
      settle(
        entry,
        `ご希望の時刻に運行する列車がないため、<strong>${d.title}</strong>（希望より${formatScheduleDiff(entry.diffMin)}）になります。${d.detail}${warnHtml}`
      );
      return;
    }

    // ここから2択。以前の選択が今回の候補にも残っていれば選択状態を引き継ぐ
    el.classList.remove('is-resolved');
    const candidates = [
      { key: 'A', entry: opts.earlier, caption: '希望より早い便' },
      { key: 'B', entry: opts.nearest, caption: '希望に最も近い便' },
    ];
    const previous = this.state.trainChoice[mode];
    const stillValid = candidates.some((c) => c.entry.pattern.pattern === previous);
    if (!stillValid) this.state.trainChoice[mode] = null;

    const optionsHtml = candidates
      .map(({ key, entry, caption }) => {
        const d = this.describeSchedulePattern(entry.pattern, mode);
        const warn = scheduleGapWarning(entry.diffMin);
        const warnHtml = warn ? `<span class="train-choice-warning">${warn}</span>` : '';
        const id = `${mode}-train-${key.toLowerCase()}`;
        const checked = entry.pattern.pattern === this.state.trainChoice[mode] ? ' checked' : '';
        return `
          <div class="train-choice-option">
            <input type="radio" name="${mode}-train" id="${id}" value="${entry.pattern.pattern}"${checked}>
            <label for="${id}">
              <span class="train-choice-letter">${key}</span>
              <span class="train-choice-text">
                <span class="train-choice-title">${d.title}（希望より${formatScheduleDiff(entry.diffMin)}）</span>
                <span class="train-choice-desc">${caption}／${d.detail}</span>
                ${warnHtml}
              </span>
            </label>
          </div>`;
      })
      .join('');

    el.innerHTML = `
      <p class="train-choice-lead">ご希望の${wishLabel}時刻ちょうどに走る列車がありません。どちらの便にしますか？</p>
      <div class="train-choice-options">${optionsHtml}</div>
    `;

    el.querySelectorAll(`input[name="${mode}-train"]`).forEach((radio) => {
      radio.addEventListener('change', () => {
        this.state.trainChoice[mode] = radio.value;
        this.updateSubmitGate();
      });
    });
  },

  // 未選択の列車が残っている間は送信ボタンを押せなくし、何が足りないかを明示する
  updateSubmitGate() {
    const { outbound, inbound } = this.state.scheduleOptions;
    const pending = [];
    if (outbound && outbound.needsChoice && !this.state.trainChoice.outbound) pending.push('出発時刻');
    if (inbound && inbound.needsChoice && !this.state.trainChoice.inbound) pending.push('帰宅希望時刻');

    document.getElementById('btn-submit-input').disabled = pending.length > 0;
    document.getElementById('input-submit-hint').textContent = pending.length
      ? `${pending.join('と')}の列車を選んでください`
      : '';
  },

  // 選択済みのパターン本体を取り出す（行程生成側から使う）。未確定なら null
  getSelectedSchedule() {
    const destKey = this.resolveDestination(this.state.inputs.destination);
    const destName = destKey ? DESTINATIONS[destKey].name : '';
    const trip = lookupTripSchedule(this.state.inputs.departure, destName);
    if (!trip) return null;
    const pick = (patterns, name) => patterns.find((p) => p.pattern === name) || null;
    return {
      outbound: pick(trip.outbound, this.state.trainChoice.outbound),
      inbound: pick(trip.inbound, this.state.trainChoice.inbound),
    };
  },

  generateHotelCandidates() {
    const destKey = this.resolveDestination(this.state.inputs.destination);
    if (!destKey) {
      const infoEl = document.getElementById('destination-info');
      infoEl.innerHTML = '<div class="dest-info-card dest-info-notice">このエリアはまだ準備中です。現在は北海道エリアのみに対応しています。</div>';
      return false;
    }
    const dest = DESTINATIONS[destKey];

    const container = document.getElementById('hotel-list');
    container.innerHTML = '';

    document.getElementById('hotels-area-name').textContent = dest.name;

    dest.hotels.forEach((hotel) => {
      if (!this.isHotelAvailable(hotel, this.state.inputs.departureDate)) {
        console.log(`[休館期間のため除外] ${hotel.name}（休館: ${hotel.closedPeriod.start}〜${hotel.closedPeriod.end}）`);
        return;
      }

      const card = document.createElement('div');
      card.className = 'hotel-card';
      const imageHtml = hotel.image
        ? `<div class="hotel-image"><img src="${hotel.image}" alt="${hotel.name} 外観" loading="lazy"></div>`
        : `<div class="hotel-image hotel-image-placeholder"><span class="placeholder-icon">📷</span><span class="placeholder-text">写真準備中</span></div>`;

      card.innerHTML = `
        <div class="hotel-card-header">
          <h3><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + ' ' + dest.name)}" target="_blank" rel="noopener" class="hotel-map-link">${hotel.name}</a></h3>
        </div>
        ${imageHtml}
        <div class="hotel-card-body">
          <div class="hotel-features">
            ${hotel.features.map((f) => `<span class="feature-tag">${f}</span>`).join('')}
          </div>
          <div class="hotel-details">
            <div class="hotel-detail-item">
              <span class="detail-icon">🚕</span>
              <span>${dest.cityStation || dest.station}からタクシー約${hotel.taxiFromCityStation}分</span>
            </div>
            <div class="hotel-detail-item">
              <span class="detail-icon">📍</span>
              <span>${hotel.area}</span>
            </div>
            <div class="hotel-detail-item">
              <span class="detail-icon">💴</span>
              <span>¥${hotel.pricePerNight.toLocaleString()}/泊（税込目安）</span>
            </div>
            <div class="hotel-detail-item">
              <span class="detail-icon">🍽️</span>
              <span>${hotel.dinnerIncluded ? '夕食付' : '食事なし'}・${hotel.breakfastIncluded ? '朝食付' : '朝食なし'}</span>
            </div>
          </div>
          <button class="btn btn-secondary btn-simulate" data-hotel-id="${hotel.id}">
            この宿で行程を試算する
          </button>
        </div>
      `;

      card.querySelector('.btn-simulate').addEventListener('click', async () => {
        const btn = card.querySelector('.btn-simulate');
        const originalText = btn.textContent;
        
        // ユーザー提案：行程を見る際に動的データ取得をシミュレート
        if (!hotel.image) {
          btn.textContent = '最新データを取得中...';
          btn.disabled = true;
          
          // 動的フェッチをシミュレート（API通信の代わり）
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // ホテルのタイプに応じた画像を割り当て
          if (hotel.type.includes('旅館')) {
            hotel.image = 'https://images.unsplash.com/photo-1578368817942-0d17066da9bc?auto=format&fit=crop&q=80&w=800';
          } else if (hotel.type.includes('ラグジュアリー') || hotel.type.includes('リゾート')) {
            hotel.image = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800';
          } else if (hotel.type.includes('デザイナーズ')) {
            hotel.image = 'https://images.unsplash.com/photo-1551882547-ff40c0d13c81?auto=format&fit=crop&q=80&w=800';
          } else {
            hotel.image = 'https://images.unsplash.com/photo-1542314831-c6a420325142?auto=format&fit=crop&q=80&w=800';
          }
          
          // 一覧UI側の画像も更新（フェードイン効果つき）
          const imgContainer = card.querySelector('.hotel-image');
          if (imgContainer) {
            imgContainer.className = 'hotel-image';
            imgContainer.innerHTML = `<img src="${hotel.image}" alt="${hotel.name} 外観" style="animation: fadeIn 0.5s;">`;
          }
        }
        
        btn.textContent = originalText;
        btn.disabled = false;
        
        this.state.selectedHotel = hotel;
        this.generateItinerary(hotel);
        this.showStep('itinerary');
      });

      container.appendChild(card);
    });
    return true;
  },

  routeKey(stationName, dest) {
    const normalized = stationName.replace(/駅$/, '');
    const destName = dest.station === '小田原駅' ? '小田原' : dest.name;
    return `${normalized}-${destName}`;
  },

  // 実運賃が確認済みの区間なら詳細データを、なければ null を返す
  lookupTravelTime(stationName, dest) {
    const key = this.routeKey(stationName, dest);
    const fare = SHINKANSEN_FARES[key];
    if (fare) return fare.duration_min;
    
    const time = getTravelTimes()[key];
    if (time) return time;
    
    if (dest.transportMode === 'flight') {
      // 飛行機利用の概算：空港までの移動・待機・フライト時間を合算した基準時間
      return dest.travelTimeFromTokyo || 210;
    }
    return 120;
  },

  // 実運賃が確認済みの区間なら詳細データを、なければ null を返す
  lookupFareData(stationName, dest) {
    return SHINKANSEN_FARES[this.routeKey(stationName, dest)] || null;
  },

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

    const relevantStation = inputs.topStation || '';
    
    const departStr = `${String(departureHour).padStart(2, '0')}:${String(departureMin).padStart(2, '0')}`;
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

  // 出発日(YYYY-MM-DD)を基準に offsetDays 日後の「M/D（曜）」を返す。未指定時は「日付未定」
  getDayDateLabel(departureDateStr, offsetDays) {
    if (!departureDateStr) return '日付未定';
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const date = new Date(`${departureDateStr}T00:00:00`);
    date.setDate(date.getDate() + offsetDays);
    return `${date.getMonth() + 1}/${date.getDate()}（${weekdays[date.getDay()]}）`;
  },

  // "MM-DD" 形式の日付が BUSY_PERIODS の期間(年跨ぎを含む)に含まれるか判定
  isDateInBusyPeriod(monthDay, period) {
    if (period.start <= period.end) {
      return monthDay >= period.start && monthDay <= period.end;
    }
    return monthDay >= period.start || monthDay <= period.end;
  },

  // 出発日からDay1〜Day3の3日間がBUSY_PERIODSと重なるか確認し、該当する期間を返す(なければnull)
  checkBusyPeriod(departureDateStr) {
    if (!departureDateStr) return null;
    const base = new Date(`${departureDateStr}T00:00:00`);
    for (let offset = 0; offset < 3; offset++) {
      const date = new Date(base);
      date.setDate(date.getDate() + offset);
      const monthDay = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const matched = BUSY_PERIODS.find((period) => this.isDateInBusyPeriod(monthDay, period));
      if (matched) return matched;
    }
    return null;
  },

  // 出発日からの2泊3日（宿泊期間）が hotel.closedPeriod と重なるか判定
  // closedPeriod未設定、または出発日未入力の場合は常に候補に含める（true）
  isHotelAvailable(hotel, departureDateStr) {
    if (!hotel.closedPeriod || !departureDateStr) return true;

    const tripStart = departureDateStr;
    const tripEndDate = new Date(`${departureDateStr}T00:00:00`);
    tripEndDate.setDate(tripEndDate.getDate() + 2);
    const tripEnd = `${tripEndDate.getFullYear()}-${String(tripEndDate.getMonth() + 1).padStart(2, '0')}-${String(tripEndDate.getDate()).padStart(2, '0')}`;

    const { start: closedStart, end: closedEnd } = hotel.closedPeriod;
    const overlaps = tripStart <= closedEnd && closedStart <= tripEnd;
    return !overlaps;
  },

  calculateKoharuScore(hotel, travelTime, luggagePattern) {
    let score = 100;

    if (travelTime > 150) score -= 15;
    else if (travelTime > 100) score -= 8;
    else if (travelTime > 60) score -= 3;

    if (hotel.taxiFromCityStation > 15) score -= 10;
    else if (hotel.taxiFromCityStation > 10) score -= 5;

    if (luggagePattern === 'C') score -= 10;
    else if (luggagePattern === 'B') score -= 3;

    if (!hotel.dinnerIncluded) score -= 5;

    return Math.max(0, Math.min(100, score));
  },

  // 乗換データがある区間は「〜で乗換」を注記し、直通に見せない
  formatTransportDetail(shinkansenName, fareData, travelTime) {
    let base = fareData ? `${shinkansenName}（${fareData.transfer_station}で乗換）` : shinkansenName;
    const dur = fareData ? fareData.duration_min : travelTime;
    return dur ? `${base}・約${dur}分` : base;
  },

  // 所要分から距離を逆算(市街地の平均時速30km=0.5km/分と仮定)し、
  // 公式運賃データがあれば初乗り+距離加算の公式運賃体系で、なければ簡易概算で算出する
  estimateTaxiFare(destName, minutes) {
    const taxiFareData = getTaxiFareData(destName);
    if (taxiFareData) {
      const estimatedKm = minutes * 0.5;
      const extraM = Math.max(0, (estimatedKm - taxiFareData.initial_fare.distance_km) * 1000);
      return (
        taxiFareData.initial_fare.yen +
        Math.ceil(extraM / taxiFareData.additional_fare.distance_m) * taxiFareData.additional_fare.yen
      );
    }
    return minutes * 500;
  },

  formatTaxiDetail(destName, minutes, label) {
    const fare = this.estimateTaxiFare(destName, minutes);
    return `${label || 'タクシー'}約${minutes}分・約¥${fare.toLocaleString()}（概算）`;
  },

  makeTransfer(icon, label, duration, cost, timeSource) {
    return { type: 'transfer', icon, label, duration, cost: cost || null, timeSource: timeSource || 'estimated' };
  },

  timeToMin(timeStr) {
    if (!timeStr) return NaN;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  },

  lookupAreaTaxi(area, dest) {
    if (area === '__station__') return 0;
    const spot = dest.spots.find(s => s.area === area);
    return spot ? spot.taxiFromCityStation : null;
  },

  inferEventLocation(event, hotel, dest) {
    if (event.type === 'transfer') return null;
    const hotelLoc = { venue: hotel.name, area: hotel.area, taxiFromCityStation: hotel.taxiFromCityStation };
    if (event.type === 'transport') {
      const match = event.title.match(/(.+駅)/);
      const stationName = match ? match[1] : dest.station;
      return { venue: stationName, area: '__station__', taxiFromCityStation: 0 };
    }
    if (event.type === 'hotel') return hotelLoc;
    if (event.type === 'food-breakfast') {
      return (!event.detail || event.detail.includes('宿にて')) ? hotelLoc : { venue: '__external__', area: '__station__', taxiFromCityStation: 0 };
    }
    if (event.type === 'food-dinner') {
      if (event.detail && event.detail.includes('宿にて')) return hotelLoc;
      const name = event.title.replace(/^夕食：/, '');
      const r = dest.restaurants.dinner.find(d => d.name === name);
      const area = r ? r.area : '__unknown__';
      return { venue: name, area, taxiFromCityStation: this.lookupAreaTaxi(area, dest) };
    }
    if (event.type === 'food-lunch') {
      const name = event.title.replace(/^昼食：/, '');
      const r = dest.restaurants.lunch.find(d => d.name === name);
      const area = r ? r.area : '__unknown__';
      return { venue: name, area, taxiFromCityStation: this.lookupAreaTaxi(area, dest) };
    }
    if (event.type === 'food-snack') {
      const name = event.title.replace(/^食べ歩き：/, '');
      const r = dest.restaurants.snack.find(d => d.name === name);
      const area = r ? r.area : '__unknown__';
      return { venue: name, area, taxiFromCityStation: this.lookupAreaTaxi(area, dest) };
    }
    if (event.type === 'spot') {
      const s = dest.spots.find(sp => sp.name === event.title);
      return { venue: event.title, area: s ? s.area : '__unknown__', taxiFromCityStation: s ? s.taxiFromCityStation : null };
    }
    return { venue: '__unknown__', area: '__unknown__', taxiFromCityStation: null };
  },

  estimateMovement(fromLoc, toLoc, hotel, dest) {
    if (fromLoc.area === toLoc.area && fromLoc.area !== '__unknown__' && fromLoc.area !== '__station__') {
      return this.makeTransfer('🚶', '徒歩で移動', '約5分', null, 'estimated');
    }
    const fromTaxi = fromLoc.taxiFromCityStation;
    const toTaxi = toLoc.taxiFromCityStation;
    if (fromTaxi != null && toTaxi != null) {
      const diff = Math.abs(fromTaxi - toTaxi);
      const est = Math.max(10, diff + 5);
      return this.makeTransfer('🚕', 'タクシーで移動', `約${est}分`, `¥${this.estimateTaxiFare(dest.name, est).toLocaleString()}`, 'estimated');
    }
    if (fromTaxi != null || toTaxi != null) {
      return this.makeTransfer('🚕', 'タクシーで移動', '約15分', `¥${this.estimateTaxiFare(dest.name, 15).toLocaleString()}`, 'estimated');
    }
    return this.makeTransfer('❓', '移動（詳細未定）', '', null, 'estimated');
  },

  fillMovementGaps(events, hotel, dest) {
    const result = [];
    for (let i = 0; i < events.length; i++) {
      result.push(events[i]);
      const current = events[i];
      const next = events[i + 1];
      if (current.type === 'transfer' || !next || next.type === 'transfer') continue;
      const currentLoc = this.inferEventLocation(current, hotel, dest);
      const nextLoc = this.inferEventLocation(next, hotel, dest);
      if (!currentLoc || !nextLoc) continue;

      if (currentLoc.venue === nextLoc.venue && currentLoc.venue !== '__unknown__') {
        if (current.time && next.time) {
          const gapMin = this.timeToMin(next.time) - this.timeToMin(current.time);
          let eventDur = current.duration || 0;
          if (!eventDur) {
            switch (current.type) {
              case 'food-breakfast': eventDur = 60; break;
              case 'food-lunch': eventDur = 60; break;
              case 'food-snack': eventDur = 30; break;
              case 'food-dinner': eventDur = 90; break;
              case 'hotel':
                if (current.title.includes('チェックイン') || current.title.includes('荷物を預ける')) eventDur = 15;
                else if (current.title.includes('チェックアウト')) eventDur = 15;
                else eventDur = 0;
                break;
            }
          }
          const freeTime = gapMin - eventDur;
          if (freeTime >= 15) {
            const rounded = Math.round(freeTime / 5) * 5;
            let locLabel;
            if (currentLoc.venue === hotel.name) locLabel = '宿';
            else if (currentLoc.area === '__station__') locLabel = currentLoc.venue;
            else locLabel = currentLoc.area;
            result.push({
              type: 'transfer', icon: '⏳',
              label: `${locLabel}にて自由時間`,
              duration: `約${rounded}分`,
              cost: null, timeSource: 'estimated',
            });
          }
        }
        continue;
      }

      result.push(this.estimateMovement(currentLoc, nextLoc, hotel, dest));
    }
    return result;
  },

  // 実ダイヤのパターンを「出発 → 移動 → (乗換待ち) → 到着」のタイムライン要素に展開する。
  // 乗換待ちは step 間の実時刻差から毎回算出するので、待ち時間をデータ側に持たせる必要がない
  // （持たせると時刻とのズレが生まれるため）。
  buildScheduleTransportEvents(pattern) {
    const events = [];
    pattern.steps.forEach((step, i) => {
      const depMin = this.timeToMin(step.dep);
      const arrMin = this.timeToMin(step.arr);

      events.push({ time: step.dep, title: `${step.from}駅 出発`, type: 'transport', timeSource: 'verified' });
      events.push(this.makeTransfer(
        step.line.includes('新幹線') ? '🚄' : '🚃',
        `${step.line}・${step.type}`,
        `約${arrMin - depMin}分`,
        null,
        'verified'
      ));
      events.push({ time: step.arr, title: `${step.to}駅 到着`, type: 'transport', timeSource: 'verified' });

      const next = pattern.steps[i + 1];
      if (next) {
        const waitMin = this.timeToMin(next.dep) - arrMin;
        events.push(this.makeTransfer('⏳', `${step.to}駅で乗り換え`, `待ち時間 約${waitMin}分`, null, 'verified'));
      }
    });
    return events;
  },

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
        
        let durMatch = item.text.match(/（約(\d+)分）/);
        let durationStr = durMatch ? '約' + durMatch[1] + '分' : '';
        let label = item.text.replace(/^[^\s]*\s*/, '').replace(/（約\d+分）$/, '');
        
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
    // タイムラインを完全に逆順に辿る
    const startNode = timeline[0];
    const [startH, startM] = startNode.time.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    
    const endNode = timeline[timeline.length - 1];
    const [endH, endM] = endNode.time.split(':').map(Number);
    let endTotal = endH * 60 + endM;
    if (endTotal < startTotal) endTotal += 24 * 60;
    
    const duration = endTotal - startTotal;
    
    let targetEndTotal = returnHour * 60 + returnMin;
    let currentMin = targetEndTotal - duration;
    const destDepartMin = currentMin;
    
    let events = [];
    
    // 出発ノード
    let firstNodeText = endNode.text.replace('着', '発');
    if (firstNodeText.includes('北海道')) firstNodeText = firstNodeText.replace('北海道', '');
    
    events.push({
      time: this.minToTime(currentMin),
      title: firstNodeText,
      type: 'transport',
      timeSource: 'verified'
    });
    
    for (let i = timeline.length - 2; i >= 0; i--) {
      const item = timeline[i];
      if (item.type === 'edge') {
        let icon = '❓';
        if (item.text.includes('✈️')) icon = '✈️';
        else if (item.text.includes('🚄')) icon = '🚄';
        else if (item.text.includes('☕') || item.text.includes('🛂')) icon = '⏳';
        else if (item.text.includes('🚃')) icon = '🚃';
        else if (item.text.includes('🚗') || item.text.includes('🚖')) icon = '🚕';
        
        let durMatch = item.text.match(/（(?:約)?(\d+)分）/);
        let durationMins = durMatch ? parseInt(durMatch[1]) : 0;
        let durationStr = durMatch ? '約' + durMatch[1] + '分' : '';
        let label = item.text.replace(/^[^\s]*\s*/, '').replace(/（(?:約)?\d+分）$/, '');
        
        events.push({
          type: 'transfer',
          icon: icon,
          label: label,
          duration: durationStr,
          cost: null,
          timeSource: 'verified'
        });
        currentMin += durationMins;
      } else if (item.type === 'node') {
        let nodeText = item.text;
        if (i === 0) {
          nodeText = nodeText.replace('発', '着');
        } else {
          nodeText = nodeText.includes('着') ? nodeText.replace('着', '発') : nodeText.replace('発', '着');
        }
        events.push({
          time: this.minToTime(currentMin),
          title: nodeText,
          type: 'transport',
          timeSource: 'verified'
        });
      }
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

    events.push(this.makeTransfer('🚕', 'タクシー', `約${hotel.taxiFromCityStation}分`, `¥${this.estimateTaxiFare(dest.name, hotel.taxiFromCityStation).toLocaleString()}`, 'estimated'));
    events.push({
      time: this.minToTime(taxiArrivalMin),
      title: `${hotel.name} チェックイン・荷物を預ける`,
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
        title: `昼食：${lunch.name}`,
        type: 'food-lunch',
        detail: `${lunch.area}${lunch.reservationNeeded ? '・要予約' : ''}`,
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
        detail: `滞在約${spot.duration}分`,
        duration: spot.duration,
      });
      currentMin += spot.duration + 15;
    }

    if (currentMin < 16 * 60 && snackOptions.length > 0) {
      const snack = snackOptions[0];
      events.push({
        time: this.minToTime(currentMin),
        title: `食べ歩き：${snack.name}`,
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
        detail: `滞在約${spot.duration}分`,
        duration: spot.duration,
      });
      currentMin += spot.duration + 15;
    }

    events.push({
      time: '17:30',
      title: `${hotel.name}へ戻る`,
      type: 'hotel',
    });

    events.push({
      time: '18:00',
      title: hotel.dinnerIncluded ? '宿の夕食' : `夕食：${dest.restaurants.dinner[0].name}`,
      type: 'food-dinner',
      detail: hotel.dinnerIncluded
        ? '宿にて'
        : `${dest.restaurants.dinner[0].area}・要予約`,
      budget: hotel.dinnerIncluded ? 0 : dest.restaurants.dinner[0].budget,
    });

    return { events, label: '1日目（到着日）' };
  },

  planDay2(dest, hotel) {
    const events = [];

    events.push({
      time: '07:30',
      title: hotel.breakfastIncluded ? '宿の朝食' : '朝食',
      type: 'food-breakfast',
      detail: hotel.breakfastIncluded ? '宿にて' : '駅前で軽く',
    });

    events.push({
      time: '09:30',
      title: '宿を出発',
      type: 'hotel',
    });

    const mainSpots = dest.spots.slice(0, 3);
    const lunch = dest.restaurants.lunch[1] || dest.restaurants.lunch[0];
    const dinner = dest.restaurants.dinner[1] || dest.restaurants.dinner[0];
    const snack = dest.restaurants.snack[1] || dest.restaurants.snack[0];

    let currentMin = 10 * 60;

    if (mainSpots[0]) {
      events.push({
        time: this.minToTime(currentMin),
        title: mainSpots[0].name,
        type: 'spot',
        detail: `滞在約${mainSpots[0].duration}分`,
        duration: mainSpots[0].duration,
      });
      currentMin += mainSpots[0].duration + 15;
    }

    const lunchTime = Math.max(currentMin, 11.5 * 60);
    events.push({
      time: this.minToTime(lunchTime),
      title: `昼食：${lunch.name}`,
      type: 'food-lunch',
      detail: `${lunch.area}${lunch.reservationNeeded ? '・要予約' : ''}`,
      budget: lunch.budget,
    });
    currentMin = lunchTime + 75;

    if (snack) {
      events.push({
        time: this.minToTime(currentMin),
        title: `食べ歩き：${snack.name}`,
        type: 'food-snack',
        detail: snack.area,
        budget: snack.budget,
      });
      currentMin += 30;
    }

    if (mainSpots[1]) {
      events.push({
        time: this.minToTime(currentMin),
        title: mainSpots[1].name,
        type: 'spot',
        detail: `滞在約${mainSpots[1].duration}分`,
        duration: mainSpots[1].duration,
      });
      currentMin += mainSpots[1].duration + 15;
    }

    if (mainSpots[2] && currentMin < 16 * 60) {
      events.push({
        time: this.minToTime(currentMin),
        title: mainSpots[2].name,
        type: 'spot',
        detail: `滞在約${mainSpots[2].duration}分`,
        duration: mainSpots[2].duration,
      });
      currentMin += mainSpots[2].duration + 15;
    }

    events.push({
      time: '17:30',
      title: `${hotel.name}へ戻る`,
      type: 'hotel',
    });

    events.push({
      time: '18:00',
      title: hotel.dinnerIncluded ? '宿の夕食' : `夕食：${dinner.name}`,
      type: 'food-dinner',
      detail: hotel.dinnerIncluded
        ? '宿にて'
        : `${dinner.area}・要予約`,
      budget: hotel.dinnerIncluded ? 0 : dinner.budget,
    });

    return { events, label: '2日目（まる一日）' };
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
      title: `${hotel.name} チェックアウト`,
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
        detail: `滞在約${spot.duration}分`,
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
        title: `昼食：${lunch.name}`,
        type: 'food-lunch',
        detail: `${lunch.area}${lunch.reservationNeeded ? '・要予約' : ''}`,
        budget: lunch.budget,
      });
      currentMin = lunchTime + 60;
    }
    
    events.push(this.makeTransfer('🚕', 'タクシー等', `約${hotel.taxiFromCityStation}分`, null, 'estimated'));
    
    // トランスポートイベント（逆算したタイムライン）を追加
    events.push(...transportEvents);
    
    return { events, label: '3日目（帰路）' };
  },


  // 新幹線駅と市内拠点駅が離れている都市（函館）だけ連絡列車データを返す。他都市は null
  getCityConnection(dest) {
    return dest.connectionToCityStation ? CITY_STATION_CONNECTIONS[dest.connectionToCityStation] : null;
  },

  calculateCost(hotel, travelTime, dest, luggagePattern, fareData) {
    let shinkansen;
    let shinkansenEstimated;
    if (fareData) {
      shinkansen = fareData.fare_yen * 2 * 2;
      shinkansenEstimated = false;
    } else {
      let shinkansenPerPerson = 0;
      if (travelTime <= 50) shinkansenPerPerson = 4000;
      else if (travelTime <= 100) shinkansenPerPerson = 9000;
      else if (travelTime <= 150) shinkansenPerPerson = 13000;
      else shinkansenPerPerson = 16000;
      shinkansen = shinkansenPerPerson * 2 * 2;
      shinkansenEstimated = true;
    }

    // 函館の はこだてライナー のように、新幹線駅と市内拠点駅を結ぶ連絡列車の運賃。
    // 往路1回＋復路1回 × 2名。実運賃が確定しているものだけ計上する
    const cityConn = this.getCityConnection(dest);
    const cityConnection = cityConn && cityConn.verified ? cityConn.fare_yen * 2 * 2 : 0;
    const cityConnectionName = cityConn ? cityConn.name : null;

    const accommodation = hotel.pricePerNight * 2 * 2;

    const taxiFareData = getTaxiFareData(dest.name);
    const taxiPerTrip = this.estimateTaxiFare(dest.name, hotel.taxiFromCityStation);
    let taxiTrips = 4;
    if (luggagePattern === 'A') taxiTrips += 2;
    const taxi = taxiPerTrip * taxiTrips;

    let food = 0;
    if (!hotel.dinnerIncluded) food += 25000;
    food += 15000;
    food += 5000;

    return {
      shinkansen,
      shinkansenEstimated,
      fareData: fareData || null,
      accommodation,
      taxi,
      taxiOfficialBase: !!taxiFareData,
      cityConnection,
      cityConnectionName,
      food,
      total: shinkansen + cityConnection + accommodation + taxi + food,
    };
  },

  renderItinerary(dest, hotel, day1, day2, day3, koharuScore, totalCost, departureStation, travelTime, busyPeriod) {
    const imgContainer = document.getElementById('itinerary-hotel-image-container');
    if (imgContainer) {
      if (hotel.image) {
        imgContainer.innerHTML = `<div class="hotel-image" style="height: 200px; background-image: url('${hotel.image}'); background-size: cover; background-position: center; border-radius: var(--radius-sm); margin-bottom: 1rem;"></div>`;
      } else {
        imgContainer.innerHTML = '<div class="hotel-image hotel-image-placeholder" style="height: 200px; margin-bottom: 1rem; border-radius: var(--radius-sm);"><span class="placeholder-icon">📷</span><span class="placeholder-text">写真準備中</span></div>';
      }
    }
    
    document.getElementById('itinerary-hotel-info').innerHTML = `
      <h2 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem;">
        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + ' ' + dest.name)}" target="_blank" rel="noopener" class="hotel-map-link">${hotel.name}</a>
      </h2>
      <div class="hotel-features" style="margin-bottom: 1rem;">
        ${hotel.features.map((f) => `<span class="feature-tag">${f}</span>`).join('')}
      </div>
      <div class="hotel-details" style="font-size: 0.9rem;">
        <div class="hotel-detail-item">
          <span class="detail-icon">🚕</span>
          <span>${dest.cityStation || dest.station}からタクシー約${hotel.taxiFromCityStation}分</span>
        </div>
        <div class="hotel-detail-item">
          <span class="detail-icon">📍</span>
          <span>${hotel.area}</span>
        </div>
        <div class="hotel-detail-item">
          <span class="detail-icon">💴</span>
          <span>¥${hotel.pricePerNight.toLocaleString()}/泊（税込目安）</span>
        </div>
        <div class="hotel-detail-item">
          <span class="detail-icon">🍽️</span>
          <span>${hotel.dinnerIncluded ? '夕食付' : '食事なし'}・${hotel.breakfastIncluded ? '朝食付' : '朝食なし'}</span>
        </div>
      </div>
    `;

    document.getElementById('busy-period-notice').innerHTML = busyPeriod
      ? `<div class="cost-note">※ この時期（${busyPeriod.name}）は混雑が予想されます</div>`
      : '';

    this.renderTimeline('timeline-day1', day1);
    this.renderTimeline('timeline-day2', day2);
    this.renderTimeline('timeline-day3', day3);

    document.getElementById('cost-shinkansen-label').textContent = totalCost.shinkansenEstimated
      ? '新幹線（往復・指定席・概算）'
      : '新幹線（往復・指定席）';
    const shinkansenNote = document.getElementById('cost-shinkansen-note');
    if (totalCost.shinkansenEstimated) {
      shinkansenNote.textContent = '※ 新幹線料金は所要時間からの概算です';
    } else {
      const f = totalCost.fareData;
      shinkansenNote.textContent =
        `片道 ¥${f.fare_yen.toLocaleString()}/人（乗車券¥${f.fare_breakdown.kijousha.toLocaleString()}+特急¥${f.fare_breakdown.tokkyu.toLocaleString()}）・` +
        `${f.transfer_station}乗換${f.transfers}回・${f.train_name}｜${f.source} ${f.verified_date}確認`;
    }
    document.getElementById('cost-shinkansen').textContent = `¥${totalCost.shinkansen.toLocaleString()}`;

    // 連絡列車（函館のはこだてライナー等）がある都市だけ行を出す
    const connRow = document.getElementById('cost-city-connection-row');
    if (totalCost.cityConnection > 0) {
      connRow.hidden = false;
      document.getElementById('cost-city-connection-label').textContent = `${totalCost.cityConnectionName}（往復・2名）`;
      document.getElementById('cost-city-connection').textContent = `¥${totalCost.cityConnection.toLocaleString()}`;
    } else {
      connRow.hidden = true;
    }

    document.getElementById('cost-accommodation').textContent = `¥${totalCost.accommodation.toLocaleString()}`;
    document.getElementById('cost-taxi').textContent = `¥${totalCost.taxi.toLocaleString()}`;
    document.getElementById('cost-taxi-note').textContent = totalCost.taxiOfficialBase
      ? '※ 函館市公式運賃（初乗り1.35km 700円+267mごと100円）に基づく概算'
      : '';
    document.getElementById('cost-food').textContent = `¥${totalCost.food.toLocaleString()}`;
    document.getElementById('cost-total').textContent = `¥${totalCost.total.toLocaleString()}`;

    document.getElementById('btn-confirm').onclick = () => {
      this.state.confirmedPlan = { dest, hotel, day1, day2, day3, koharuScore, totalCost };
      this.renderConfirmed(dest, hotel, day1, day2, day3, koharuScore, totalCost, departureStation);
      this.showStep('confirmed');
    };
  },

  // 実データに基づく時刻か概算かを示すバッジ。
  // timeSource を持たないイベント（観光・食事など、そもそも時刻の正確性を問わないもの）には付けない。
  // 確定は連続して並ぶため控えめな配色に、概算は注意を向けたいので目立つ配色にしている。
  sourceBadge(event) {
    if (event.timeSource === 'verified') return '<span class="src-badge src-verified">確定</span>';
    if (event.timeSource === 'estimated') return '<span class="src-badge src-estimated">概算</span>';
    return '';
  },

  renderTimeline(containerId, day) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
      <h3 class="day-label">${day.label}${day.dateLabel ? `<span class="day-date">${day.dateLabel}</span>` : ''}</h3>`;

    const timeline = document.createElement('div');
    timeline.className = 'timeline';

    day.events.forEach((event) => {
      const item = document.createElement('div');
      item.className = `timeline-item type-${event.type}`;

      if (event.type === 'transfer') {
        const costHtml = event.cost ? `<span class="transfer-cost">（${event.cost}）</span>` : '';
        item.innerHTML = `
          <div class="timeline-time">${event.duration || ''}</div>
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <span class="transfer-icon">${event.icon}</span>
            <span class="transfer-label">${event.label}${costHtml}</span>
            ${this.sourceBadge(event)}
          </div>
        `;
      } else {
        const titleHtml = event.mapsUrl
          ? `<a href="${event.mapsUrl}" target="_blank" rel="noopener" class="map-link">${event.title}<span class="map-icon">📍</span></a>`
          : event.title;
        const tabelogHtml = event.tabelogUrl
          ? `<a href="${event.tabelogUrl}" target="_blank" rel="noopener" class="tabelog-link">食べログで予約する</a>`
          : '';
        item.innerHTML = `
          <div class="timeline-time">${event.time}</div>
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-title">${titleHtml}${this.sourceBadge(event)}</div>
            ${event.detail ? `<div class="timeline-detail">${event.detail}</div>` : ''}
            ${event.note ? `<div class="cost-note">${event.note}</div>` : ''}
            ${tabelogHtml}
          </div>
        `;
      }
      timeline.appendChild(item);
    });

    container.appendChild(timeline);
  },

  renderConfirmed(dest, hotel, day1, day2, day3, koharuScore, totalCost, departureStation) {
    const container = document.getElementById('confirmed-content');
    
    // Copy the route info html from the destination info container
    const routeInfoHtml = document.getElementById('destination-info') ? document.getElementById('destination-info').innerHTML : '';
    
    // Construct the hotel info html for print
    const hotelImageHtml = hotel.image ? `<div class="hotel-image" style="text-align:center;"><img src="${hotel.image}" alt="${hotel.name} 外観" style="max-height:220px; object-fit:cover;"></div>` : '';
    const hotelFeaturesHtml = hotel.features ? hotel.features.map(f => `<span class="feature-tag">${f}</span>`).join('') : '';
    // Fetch uploaded screenshots from the 4 slots
    let allScreenshotsLayoutHtml = '';
    let allImages = [];
    for(let i=1; i<=4; i++) {
      const preview = document.getElementById(`preview-${i}`);
      if(preview && preview.style.display !== 'none' && preview.src) {
        allImages.push(`<img src="${preview.src}" style="border-radius:8px; border:1px solid #ddd; width:100%; flex:1; min-height:0; object-fit:contain; margin-bottom:10px;" />`);
      }
    }

    if (allImages.length > 0) {
      const col1Images = allImages.slice(0, 2).join('');
      const col2Images = allImages.slice(2, 4).join('');
      
      allScreenshotsLayoutHtml = `
        <div class="print-only print-page-screenshots" style="page-break-before: always; height: 260mm; display: flex; flex-direction: column; padding-top: 2rem;">
          <div style="text-align:center; margin-bottom:1rem;">
            <h2 style="color:var(--color-primary); font-size:1.8rem; margin-bottom:0.5rem;">📱 実際の乗換ルート（スクショ）</h2>
            <p style="color:#555;">無料乗換アプリでの検索結果（ダイヤ詳細）</p>
          </div>
          
          <div class="print-screenshots-grid" style="display:flex; gap:2rem; flex: 1; min-height: 0;">
            <div style="flex:1; display:flex; flex-direction:column; min-height: 0;">
              ${col1Images ? `
                <h3 class="section-title" style="font-size: 1.1rem; margin-bottom: 1rem; flex: 0 0 auto;">📌 往路など（1・2枚目）</h3>
                ${col1Images}
              ` : ''}
            </div>
            <div style="flex:1; display:flex; flex-direction:column; min-height: 0;">
              ${col2Images ? `
                <h3 class="section-title" style="font-size: 1.1rem; margin-bottom: 1rem; flex: 0 0 auto;">📌 復路など（3・4枚目）</h3>
                ${col2Images}
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }

    const hotelInfoHtml = `
      <div class="hotel-card" style="box-shadow:none; border: 1px solid #ddd; padding: 1rem; margin-bottom: 0;">
        <div class="hotel-card-header"><h3>${hotel.name}</h3></div>
        ${hotelImageHtml}
        <div class="hotel-card-body" style="padding-top: 1rem;">
          <div class="hotel-features">${hotelFeaturesHtml}</div>
          <div class="hotel-details" style="display:flex; flex-wrap:wrap; gap:1rem; margin-top:0.5rem;">
            <div class="hotel-detail-item"><span>🚕 ${dest.cityStation || dest.station}からタクシー約${hotel.taxiFromCityStation}分</span></div>
            <div class="hotel-detail-item"><span>📍 ${hotel.area}</span></div>
            <div class="hotel-detail-item"><span>💴 ¥${hotel.pricePerNight.toLocaleString()}/泊（税込目安）</span></div>
            <div class="hotel-detail-item"><span>🍽️ ${hotel.dinnerIncluded ? '夕食付' : '食事なし'}・${hotel.breakfastIncluded ? '朝食付' : '朝食なし'}</span></div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = `
      <div class="confirmed-header-block">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <h2>${dest.name}への二泊三日</h2>
            <p class="confirmed-subtitle">${hotel.name}（${hotel.area}）連泊</p>
          </div>
          <button class="action-button" onclick="window.print()" style="margin-top: 10px; background-color: #f8f9fa; color: #333; border: 1px solid #ddd;">🖨️ 印刷する</button>
        </div>
      </div>

      <div class="print-only print-page-1">
          <div class="print-header" style="text-align:center; margin-bottom:1rem;">
          <h2 style="color:var(--color-primary); font-size:1.8rem; margin-bottom:0.5rem;">『こはる』旅の条件</h2>
          <p style="color:#555;">${dest.area}・片道５時間以内で到着。<br>２泊３日の疲れない旅を設計します。</p>
        </div>
        
        ${routeInfoHtml}
        
        ${hotelInfoHtml}
      </div>
      
      ${allScreenshotsLayoutHtml}

      <div class="print-only print-page-2" style="page-break-before: always;">
          <div style="margin-top:1rem;">
            <h3 style="margin-bottom:0.5rem; font-size:1.3rem;">料金概算</h3>
          <div class="cost-summary-final" style="border: 1px solid #ddd; padding: 1.5rem; border-radius: 8px; font-size: 1.1rem; line-height: 1.6; margin-bottom: 2rem;">
            <div class="cost-row"><span>新幹線（往復2名${totalCost.shinkansenEstimated ? '・概算' : ''}）</span><span>¥${totalCost.shinkansen.toLocaleString()}</span></div>
            <div class="cost-row"><span>宿泊（2泊2名）</span><span>¥${totalCost.accommodation.toLocaleString()}</span></div>
            <div class="cost-row"><span>タクシー</span><span>¥${totalCost.taxi.toLocaleString()}</span></div>
            <div class="cost-row"><span>飲食</span><span>¥${totalCost.food.toLocaleString()}</span></div>
            <div class="cost-row cost-total-row" style="margin-top:1rem; padding-top:1rem; border-top:1px solid #eee; font-weight:bold; font-size: 1.3rem;"><span>合計（概算）</span><span>¥${totalCost.total.toLocaleString()}</span></div>
          </div>
          
          <h3 style="margin-bottom:0.5rem; font-size:1.3rem;">予約チェックリスト</h3>
          <ul class="checklist" style="border: 1px solid #ddd; padding: 1.5rem 1.5rem 1.5rem 2.5rem; border-radius: 8px; font-size: 1.1rem; line-height: 1.8;">
            <li><label><input type="checkbox"> ${dest.shinkansen}（往復・指定席）</label></li>
            <li><label><input type="checkbox"> ${hotel.name}（2泊）</label></li>
            ${this.getReservationItems(day1, day2, day3).map((item) => `<li><label><input type="checkbox"> ${item}</label></li>`).join('')}
          </ul>
        </div>
      </div>

      <div class="print-hidden">
        <div class="confirmed-section">
          <h3>予約チェックリスト</h3>
          <ul class="checklist">
            <li><label><input type="checkbox"> ${dest.shinkansen}（往復・指定席）</label></li>
            <li><label><input type="checkbox"> ${hotel.name}（2泊）</label></li>
            ${this.getReservationItems(day1, day2, day3).map((item) => `<li><label><input type="checkbox"> ${item}</label></li>`).join('')}
          </ul>
        </div>

        <div class="confirmed-section">
          <h3>予約リンク</h3>
          <div class="reservation-links">
            <div class="reservation-link-item">
              <div class="reservation-link-label">🏨 宿泊予約</div>
              <p class="reservation-link-desc">${hotel.name} のご予約はこちら（外部サイト）</p>
              <a href="https://travel.rakuten.co.jp/HOTEL/keyword/keyword.html?keyword=${encodeURIComponent(hotel.name)}" target="_blank" rel="noopener" class="btn btn-reservation" style="background-color: #bf0000; color: white; border-color: #a00000;">
                宿泊サイトで予約する
              </a>
            </div>
            
            <div class="reservation-link-item">
              <div class="reservation-link-label">🚄 新幹線を予約する</div>
              <p class="reservation-link-desc">${dest.shinkansen}の指定席予約はえきねっとから行えます</p>
              <a href="https://www.eki-net.com/" target="_blank" rel="noopener" class="btn btn-reservation btn-ekinet">
                えきねっとで予約する
              </a>
            </div>
            ${this.getDinnerReservationLinks(day1, day2, day3)}
          </div>
        </div>

        <div class="confirmed-section">
          <h3>料金概算</h3>
          <div class="cost-summary-final">
            <div class="cost-row"><span>新幹線（往復2名${totalCost.shinkansenEstimated ? '・概算' : ''}）</span><span>¥${totalCost.shinkansen.toLocaleString()}</span></div>
            ${totalCost.fareData ? `<div class="cost-note">片道 ¥${totalCost.fareData.fare_yen.toLocaleString()}/人・${totalCost.fareData.transfer_station}乗換・${totalCost.fareData.train_name}（${totalCost.fareData.verified_date}確認）</div>` : ''}
            <div class="cost-row"><span>宿泊（2泊2名）</span><span>¥${totalCost.accommodation.toLocaleString()}</span></div>
            <div class="cost-row"><span>タクシー</span><span>¥${totalCost.taxi.toLocaleString()}</span></div>
            ${totalCost.taxiOfficialBase ? '<div class="cost-note">函館市公式運賃に基づく概算</div>' : ''}
            <div class="cost-row"><span>飲食</span><span>¥${totalCost.food.toLocaleString()}</span></div>
            <div class="cost-row cost-total-row"><span>合計（概算）</span><span>¥${totalCost.total.toLocaleString()}</span></div>
          </div>
        </div>
      </div>
    `;

    this.renderTimeline('confirmed-day1', day1);
    this.renderTimeline('confirmed-day2', day2);
    this.renderTimeline('confirmed-day3', day3);},

  enrichEventsWithLinks(events, hotel, dest) {
    events.forEach(event => {
      if (event.type === 'spot') {
        const spotData = dest.spots.find(s => s.name === event.title);
        event.mapsUrl = spotData && spotData.lat != null
          ? getGoogleMapsUrl(spotData.name, spotData.lat, spotData.lng)
          : getGoogleMapsUrl(event.title);
      } else if (event.type === 'hotel' && event.title.includes(hotel.name)) {
        event.mapsUrl = hotel.lat != null
          ? getGoogleMapsUrl(hotel.name, hotel.lat, hotel.lng)
          : getGoogleMapsUrl(hotel.name);
      } else if (event.type === 'food-lunch') {
        const name = event.title.replace(/^昼食：/, '');
        event.mapsUrl = getGoogleMapsUrl(name);
      } else if (event.type === 'food-snack') {
        const name = event.title.replace(/^食べ歩き：/, '');
        event.mapsUrl = getGoogleMapsUrl(name);
      } else if (event.type === 'food-dinner' && event.detail && !event.detail.includes('宿にて')) {
        const restaurant = dest.restaurants.dinner.find(r => event.title.includes(r.name));
        if (restaurant) {
          event.mapsUrl = getGoogleMapsUrl(restaurant.name);
          event.tabelogUrl = restaurant.tabelogUrl || getTabelogSearchUrl(restaurant.name, restaurant.area);
        }
      }
    });
  },

  getDinnerReservationLinks(day1, day2, day3) {
    const dinners = [];
    [day1, day2, day3].forEach((day, i) => {
      day.events.forEach(e => {
        if (e.tabelogUrl) {
          const name = e.title.replace('夕食：', '');
          if (!dinners.find(d => d.name === name)) {
            dinners.push({ name, url: e.tabelogUrl, day: `${i + 1}日目` });
          }
        }
      });
    });
    if (dinners.length === 0) return '';
    return dinners.map(d => `
      <div class="reservation-link-item">
        <div class="reservation-link-label">🍽️ ${d.name}（${d.day}夕食）</div>
        <a href="${d.url}" target="_blank" rel="noopener" class="btn btn-reservation btn-tabelog">
          食べログで予約する
        </a>
      </div>
    `).join('');
  },

  getReservationItems(day1, day2, day3) {
    const items = [];
    [day1, day2, day3].forEach((day) => {
      day.events.forEach((e) => {
        if (e.detail && e.detail.includes('要予約')) {
          items.push(e.title.replace('昼食：', '').replace('夕食：', '') + '（予約）');
        }
      });
    });
    return items;
  },

  minToTime(min) {
    const h = Math.floor(min / 60);
    const m = Math.round(min % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  },

  // ==== QR: スマホで見る ====
  // 行程の計算結果ではなく「入力条件＋選択中の宿ID」だけをURLハッシュに圧縮エンコードする。
  // スキャンした端末側はこのハッシュから条件を復元し、フォーム入力を経由せず結果画面へ直行する。

  bindSwipeEvents() {
    let touchStartX = 0;
    let touchStartY = 0;
    
    document.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    document.addEventListener('touchend', e => {
      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      
      // Only trigger if horizontal swipe is larger than vertical (not scrolling)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX < 0) this.navigateNext();
        else this.navigatePrev();
      }
    }, { passive: true });
  },

  navigateNext() {
    // Only on mobile
    if (window.innerWidth > 768) return;
    
    if (this.state.currentStep === 'input') {
      const form = document.getElementById('form-input');
      if (form.checkValidity()) {
        this.collectInputs();
        this.saveInputsToStorage();
        if (this.generateHotelCandidates()) {
          this.showStep('hotels');
        }
      } else {
        form.reportValidity();
      }
    } else if (this.state.currentStep === 'hotels') {
      if (this.state.selectedHotel) {
        this.generateItinerary(this.state.selectedHotel);
      }
    }
  },

  navigatePrev() {
    // Only on mobile
    if (window.innerWidth > 768) return;

    if (this.state.currentStep === 'hotels') {
      this.showStep('input');
    } else if (this.state.currentStep === 'itinerary') {
      this.showStep('hotels');
    } else if (this.state.currentStep === 'confirmed') {
      this.showStep('itinerary');
    }
  },

  bindQrModalEvents() {
    document.getElementById('btn-qr-open').addEventListener('click', () => this.openQrModal());
    document.getElementById('qr-modal-close').addEventListener('click', () => this.closeQrModal());
    document.getElementById('qr-modal-backdrop').addEventListener('click', () => this.closeQrModal());
    document.getElementById('qr-modal-copy').addEventListener('click', () => {
      const input = document.getElementById('qr-modal-url');
      input.select();
      input.setSelectionRange(0, 99999);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(input.value).catch(() => {});
      }
    });
  },

  buildShareUrl() {
    const payload = {
      v: 1,
      inputs: { ...this.state.inputs },
      trainChoice: { ...this.state.trainChoice },
      hotelId: this.state.selectedHotel ? this.state.selectedHotel.id : null,
      customTimes: this.state.customTimes || {},
    };
    const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(payload));
    // location.origin を動的に使うことで、localtunnel等の一時URLでも本番ドメインでもそのまま機能する
    return `${window.location.origin}${window.location.pathname}#koharu=${compressed}`;
  },

  openQrModal() {
    this.collectInputs(); // モーダルを開いた時点のフォーム内容を必ず反映する
    const url = this.buildShareUrl();

    const container = document.getElementById('qr-code-container');
    if (!this._qrCodeInstance) {
      container.innerHTML = '';
      this._qrCodeInstance = new QRCode(container, {
        text: url,
        width: 200,
        height: 200,
        correctLevel: QRCode.CorrectLevel.M,
      });
    } else {
      this._qrCodeInstance.clear();
      this._qrCodeInstance.makeCode(url);
    }

    document.getElementById('qr-modal-url').value = url;
    document.getElementById('qr-modal-caption').textContent = this.state.selectedHotel
      ? `「${this.state.selectedHotel.name}」を選んだ状態の行程を復元します`
      : (this.state.inputs.destination ? '入力済みの条件から宿の候補を復元します' : 'まだ条件が入力されていません（先に旅の条件を入力してください）');

    const modal = document.getElementById('qr-modal');
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  },

  closeQrModal() {
    const modal = document.getElementById('qr-modal');
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  },

  // URLハッシュ(#koharu=...)に入力条件が含まれていれば復元し、入力画面を経由せず該当画面を表示する。
  // 復元できた場合は true を返す(呼び出し側はこの場合デフォルトの showStep('input') をスキップする)。
  restoreFromQr() {
    const match = window.location.hash.match(/koharu=([^&]+)/);
    if (!match) return false;

    let payload;
    try {
      const json = LZString.decompressFromEncodedURIComponent(match[1]);
      payload = json ? JSON.parse(json) : null;
    } catch (e) {
      payload = null;
    }

    // 復元後にURLを掃除し、リロードや戻る操作での二重処理を防ぐ
    history.replaceState(null, '', window.location.pathname + window.location.search);

    if (!payload || !payload.inputs) return false;

    this.applyInputsToForm({ ...payload.inputs, trainChoice: payload.trainChoice });
    this.saveInputsToStorage();

    if (!this.generateHotelCandidates()) {
      // 対応エリア外などの場合は入力画面のまま条件だけ復元しておく
      this.showStep('input');
      return true;
    }

    if (payload.hotelId) {
      const destKey = this.resolveDestination(this.state.inputs.destination);
      const dest = DESTINATIONS[destKey];
      const hotel = dest.hotels.find((h) => h.id === payload.hotelId);
      if (payload.customTimes) {
        this.state.customTimes = payload.customTimes;
      }
      if (hotel && this.isHotelAvailable(hotel, this.state.inputs.departureDate)) {
        this.state.selectedHotel = hotel;
        this.generateItinerary(hotel);
        this.showStep('itinerary');
        return true;
      }
    }

    this.showStep('hotels');
    return true;
  },

  resetState() {
    this.state = {
      currentStep: 'input',
      inputs: {
        departure: '',
        station1: '',
        station2: '',
        useStation: '1',
        destination: '',
        departureTime: '10:00',
        departureDate: '',
        returnTime: '19:00',
        luggagePattern: 'A',
      },
      selectedHotel: null,
      itineraries: [],
      confirmedPlan: null,
      trainChoice: { outbound: null, inbound: null },
      scheduleOptions: { outbound: null, inbound: null },
    };
    this.loadSavedInputs();
    this.updateStationChoiceLabels();
    this.refreshTrainChoices();
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());


  // Screenshot slots logic
  const initScreenshotSlots = () => {
    for(let i=1; i<=4; i++) {
      const container = document.getElementById(`slot-container-${i}`);
      const input = document.getElementById(`upload-${i}`);
      const deleteBtn = document.getElementById(`delete-${i}`);
      if(!container) continue;

      // Click to upload
      container.addEventListener('click', (e) => {
        if(e.target === deleteBtn) return;
        input.click();
      });

      // Handle file selection
      input.addEventListener('change', (e) => {
        if(e.target.files && e.target.files[0]) {
          setSlotImage(i, e.target.files[0]);
        }
      });

      // Handle delete
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearSlotImage(i);
      });
      
      // Handle paste on the container
      // Prevent typing text into contenteditable
      container.addEventListener('keydown', (e) => {
        // Allow Tab, Ctrl+V, Cmd+V
        if (e.key === 'Tab' || (e.key === 'v' && (e.ctrlKey || e.metaKey))) {
          return;
        }
        e.preventDefault();
      });

      container.addEventListener('paste', (e) => {
        e.preventDefault();
        const clipboardData = e.clipboardData || e.originalEvent.clipboardData;
        let fileToPaste = null;
        
        if (clipboardData.files && clipboardData.files.length > 0) {
          for (let j = 0; j < clipboardData.files.length; j++) {
            if (clipboardData.files[j].type.startsWith('image/')) {
              fileToPaste = clipboardData.files[j];
              break;
            }
          }
        } else if (clipboardData.items) {
          for (let j = 0; j < clipboardData.items.length; j++) {
            if (clipboardData.items[j].type.startsWith('image/')) {
              fileToPaste = clipboardData.items[j].getAsFile();
              break;
            }
          }
        }
        
        if (fileToPaste) {
          setSlotImage(i, fileToPaste);
        }
      });
    }

    // Global paste handler to fill the first empty slot
    document.addEventListener('paste', (e) => {
      // Ignore if a specific slot is focused to avoid double pasting
      if(document.activeElement && document.activeElement.classList.contains('screenshot-slot')) return;
      
      const clipboardData = e.clipboardData || e.originalEvent.clipboardData;
      let fileToPaste = null;
      
      if (clipboardData.files && clipboardData.files.length > 0) {
        for (let j = 0; j < clipboardData.files.length; j++) {
          if (clipboardData.files[j].type.startsWith('image/')) {
            fileToPaste = clipboardData.files[j];
            break;
          }
        }
      } else if (clipboardData.items) {
        for (let j = 0; j < clipboardData.items.length; j++) {
          if (clipboardData.items[j].type.startsWith('image/')) {
            fileToPaste = clipboardData.items[j].getAsFile();
            break;
          }
        }
      }
      
      if (fileToPaste) {
        // Find first empty slot
        for(let i=1; i<=4; i++) {
          const preview = document.getElementById(`preview-${i}`);
          if(preview && preview.style.display === 'none') {
            setSlotImage(i, fileToPaste);
            e.preventDefault();
            return;
          }
        }
      }
    });
  };

  const setSlotImage = (index, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = document.getElementById(`preview-${index}`);
      const content = document.getElementById(`slot-content-${index}`);
      const deleteBtn = document.getElementById(`delete-${index}`);
      
      preview.src = e.target.result;
      preview.style.display = 'block';
      content.style.display = 'none';
      deleteBtn.style.display = 'block';
      
      // Trigger OCR
      processOcr(index, e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const clearSlotImage = (index) => {
    const preview = document.getElementById(`preview-${index}`);
    const content = document.getElementById(`slot-content-${index}`);
    const deleteBtn = document.getElementById(`delete-${index}`);
    const input = document.getElementById(`upload-${index}`);
    
    preview.src = '';
    preview.style.display = 'none';
    content.style.display = 'block';
    deleteBtn.style.display = 'none';
    input.value = ''; // Reset input
  };

  // Initialize after a short delay to ensure DOM is ready
  setTimeout(initScreenshotSlots, 100);


  let currentOcrDay = null;

  const showOcrModal = (dayIndex, startTime, endTime) => {
    currentOcrDay = dayIndex;
    document.getElementById('ocr-start-time').value = startTime;
    document.getElementById('ocr-end-time').value = endTime;
    document.getElementById('ocr-modal').style.display = 'flex';
  };

  document.addEventListener('DOMContentLoaded', () => {
    const applyBtn = document.getElementById('ocr-apply');
    const cancelBtn = document.getElementById('ocr-cancel');
    if(applyBtn && cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        document.getElementById('ocr-modal').style.display = 'none';
      });
      applyBtn.addEventListener('click', () => {
        const startTime = document.getElementById('ocr-start-time').value;
        const endTime = document.getElementById('ocr-end-time').value;
        if(currentOcrDay && App.currentPlan) {
          const planKey = 'day' + currentOcrDay;
          const plan = App.currentPlan[planKey];
          if(plan && plan.events && plan.events.length > 0) {
            plan.events[0].time = startTime;
            plan.events[plan.events.length - 1].time = endTime;
            // Save to state for QR export
            if(!App.state.customTimes) App.state.customTimes = {};
            App.state.customTimes[planKey + 'Start'] = startTime;
            App.state.customTimes[planKey + 'End'] = endTime;
            // Update the UI
            App.renderTimeline('timeline-' + planKey, plan);
            App.renderTimeline('confirmed-' + planKey, plan);
          }
        }
        document.getElementById('ocr-modal').style.display = 'none';
      });
    }
  });

  const processOcr = async (index, imageUrl) => {
    // Slot 1 -> Day 1 (Outbound), Slot 3 -> Day 3 (Return)
    if (index !== 1 && index !== 3) return;
    
    const dayNum = index === 1 ? 1 : 3;
    const contentEl = document.getElementById(`slot-content-${index}`);
    const originalHtml = contentEl.innerHTML;
    
    try {
      contentEl.innerHTML = `<span class="slot-icon" style="animation: spin 2s linear infinite;">⏳</span><br><span class="slot-text">読取中...</span>`;
      contentEl.style.display = 'block';
      const previewEl = document.getElementById(`preview-${index}`);
      previewEl.style.opacity = '0.3';
      
      if (typeof Tesseract === 'undefined') {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const result = await Tesseract.recognize(imageUrl, 'eng');
      const text = result.data.text;
      
      const matches = text.match(/\b([0-1]?[0-9]|2[0-3]):([0-5][0-9])\b/g);
      if (matches && matches.length >= 2) {
        let times = matches.map(t => {
          const [h, m] = t.split(':').map(Number);
          return h * 60 + m;
        });
        
        // Remove times that are likely the phone status bar (e.g. exactly same time appearing multiple times, or very high/low compared to rest)
        // For simplicity, just take min and max
        times.sort((a, b) => a - b);
        
        const formatTime = (mins) => {
          const h = Math.floor(mins / 60).toString().padStart(2, '0');
          const m = (mins % 60).toString().padStart(2, '0');
          return `${h}:${m}`;
        };

        const startTime = formatTime(times[0]);
        const endTime = formatTime(times[times.length - 1]);
        
        showOcrModal(dayNum, startTime, endTime);
      }
    } catch (e) {
      console.error('OCR Error', e);
    } finally {
      contentEl.innerHTML = originalHtml;
      contentEl.style.display = 'none';
      const previewEl = document.getElementById(`preview-${index}`);
      if(previewEl) previewEl.style.opacity = '1';
    }
  };

  const style = document.createElement('style');
  style.innerHTML = '@keyframes spin { 100% { transform: rotate(360deg); } }';
  document.head.appendChild(style);
