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
    document.getElementById('form-input').addEventListener('submit', (e) => {
      e.preventDefault();
      this.collectInputs();
      this.saveInputsToStorage();
      if (this.generateHotelCandidates()) {
        this.showStep('hotels');
      }
    });

    this.bindQrModalEvents();
    this.bindHowtoModalEvents();
    
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
    document.getElementById('btn-back-yahoo').addEventListener('click', () => this.showStep('hotels'));
    document.getElementById('btn-back-to-yahoo-from-confirmed').addEventListener('click', () => this.showStep('yahoo-data'));
    document.getElementById('btn-generate-final').addEventListener('click', () => this.generateFinalItinerary());
    const btnBack = document.getElementById('btn-back-to-input');
    if (btnBack) {
      btnBack.addEventListener('click', () => this.showStep('input'));
    }

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

    const container = document.getElementById('hotels-list');
    container.innerHTML = '';

    document.getElementById('hotels-area-name').textContent = dest.name;
    
    // Add Recommendation
    const transportRec = document.getElementById('transport-recommendation');
    if (transportRec) {
      // Very basic logic for demo: if from Hokkaido, maybe JR/Car. Else Flight.
      const dep = this.state.inputs.departure || '';
      const isShinkansen = dep.includes('青森') || dep.includes('岩手') || dep.includes('宮城') || dep.includes('秋田');
      const mode = isShinkansen ? '新幹線' : '飛行機';
      const reason = isShinkansen ? '乗り換えが少なく座ったまま移動できるため疲れにくいです。' : '移動時間が圧倒的に短いため疲れにくいです。';
      
      transportRec.innerHTML = `
        <h2 style="font-size:1.2rem; margin-top:0; color:var(--color-primary);">${isShinkansen ? '🚅' : '✈️'} あなたへのオススメ移動手段：${mode}</h2>
        <p style="margin:5px 0 0 0; color:#333;">出発地（${dep}周辺）から函館へのアクセスは、${reason}</p>
      `;
    }

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
              この宿で決定して次へ
            </button>
        </div>
      `;

      card.querySelector('.btn-simulate').addEventListener('click', async () => {
          this.state.selectedHotel = hotel;
          this.showStep('yahoo-data');
          window.scrollTo(0,0);
        });

      container.appendChild(card);
    });
    return true;
  },

  
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

  
  timeToMin(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  },

  minToTime(min) {
    const h = Math.floor(min / 60);
    const m = Math.round(min % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
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

  
  
  estimateTaxiFare(destName, minutes) {
    if (typeof getTaxiFareData !== 'undefined') {
      const taxiFareData = getTaxiFareData(destName);
      if (taxiFareData) {
        const estimatedKm = minutes * 0.5;
        const extraM = Math.max(0, (estimatedKm - taxiFareData.initial_fare.distance_km) * 1000);
        return (
          taxiFareData.initial_fare.yen +
          Math.ceil(extraM / taxiFareData.additional_fare.distance_m) * taxiFareData.additional_fare.yen
        );
      }
    }
    return minutes * 500;
  },

  makeTransfer(icon, title, duration, cost) {
    return { type: 'transfer', icon, title, duration: duration, cost: cost };
  },
  
  lookupAreaTaxi(area, dest) {
    if (area === '__station__') return 0;
    const spot = dest.spots && dest.spots.find(s => s.area === area);
    return spot ? spot.taxiFromCityStation : null;
  },

  inferEventLocation(event, hotel, dest) {
    if (event.type === 'transfer') return null;
    const hotelLoc = { venue: hotel.name, area: hotel.area, taxiFromCityStation: hotel.taxiFromCityStation };
    if (event.type === 'transport') {
      const stationName = dest.cityStation || dest.station;
      return { venue: stationName, area: '__station__', taxiFromCityStation: 0 };
    }
    if (event.type === 'hotel') return hotelLoc;
    if (event.type === 'food') {
      const name = event.title;
      if (name.includes('ホテルで')) return hotelLoc;
      
      const r = [...(dest.restaurants?.dinner || []), ...(dest.restaurants?.lunch || []), ...(dest.restaurants?.snack || [])].find(d => name.includes(d.name));
      const area = r ? r.area : '__unknown__';
      return { venue: name, area, taxiFromCityStation: this.lookupAreaTaxi(area, dest) };
    }
    if (event.type === 'sightseeing' || event.type === 'spot') {
      const s = dest.spots && dest.spots.find(sp => sp.name === event.title);
      return { venue: event.title, area: s ? s.area : '__unknown__', taxiFromCityStation: s ? s.taxiFromCityStation : null };
    }
    return { venue: '__unknown__', area: '__unknown__', taxiFromCityStation: null };
  },

  estimateMovement(fromLoc, toLoc, hotel, dest) {
    if (fromLoc.area === toLoc.area && fromLoc.area !== '__unknown__' && fromLoc.area !== '__station__') {
      return this.makeTransfer('🚶', '徒歩で移動', '約5分', null);
    }
    const fromTaxi = fromLoc.taxiFromCityStation;
    const toTaxi = toLoc.taxiFromCityStation;
    if (fromTaxi != null && toTaxi != null) {
      const diff = Math.abs(fromTaxi - toTaxi);
      const est = Math.max(10, diff + 5);
      return this.makeTransfer('🚕', 'タクシー等で移動', `約${est}分`, `¥${this.estimateTaxiFare(dest.name, est).toLocaleString()}`);
    }
    if (fromTaxi != null || toTaxi != null) {
      const est = fromTaxi != null ? fromTaxi : toTaxi;
      return this.makeTransfer('🚕', 'タクシー等で移動', `約${est}分`, `¥${this.estimateTaxiFare(dest.name, est).toLocaleString()}`);
    }
    return this.makeTransfer('🔄', '移動', '', null);
  },

  fillMovementGaps(events, hotel, dest) {
    const result = [];
    for (let i = 0; i < events.length; i++) {
      result.push(events[i]);
      const current = events[i];
      const next = events[i + 1];
      
      if (!next || current.type === 'transfer' || next.type === 'transfer') continue;
      
      const currentLoc = this.inferEventLocation(current, hotel, dest);
      const nextLoc = this.inferEventLocation(next, hotel, dest);
      if (!currentLoc || !nextLoc) continue;

      if (currentLoc.venue === nextLoc.venue && currentLoc.venue !== '__unknown__') {
        if (current.time && next.time) {
          const gapMin = this.timeToMin(next.time) - this.timeToMin(current.time);
          let eventDur = current.duration || 0;
          if (!eventDur) {
            switch (current.type) {
              case 'food': eventDur = 60; break;
              case 'hotel': eventDur = 15; break;
              case 'sightseeing': eventDur = 60; break;
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
              title: `${locLabel}周辺で自由時間`,
              duration: `約${rounded}分`,
            });
          }
        }
        continue;
      }
      
      // Calculate stay duration based on next event time
      const transfer = this.estimateMovement(currentLoc, nextLoc, hotel, dest);
      
      if (current.time && next.time) {
        const gapMin = this.timeToMin(next.time) - this.timeToMin(current.time);
        let eventDur = 0;
        if (current.type === 'food') eventDur = 60;
        else if (current.type === 'sightseeing') eventDur = 90;
        else if (current.type === 'hotel') eventDur = 15;
        
        let freeTime = gapMin - eventDur - parseInt((transfer.duration || '').replace(/[^0-9]/g, '') || 0);
        
        if (current.type !== 'transport') {
            current.detail = (current.detail ? current.detail + '<br>' : '') + `<span style="color:#666; font-size: 0.9em;">滞在の目安：約${eventDur}分</span>`;
        }
        
        if (freeTime >= 30) {
            const rounded = Math.round(freeTime / 5) * 5;
            let locLabel = currentLoc.venue;
            if (currentLoc.venue === hotel.name) locLabel = '宿';
            else if (currentLoc.area === '__station__') locLabel = currentLoc.venue;
            result.push({
              type: 'transfer', icon: '⏳',
              title: `${locLabel}周辺で自由時間・散策`,
              duration: `約${rounded}分`,
            });
        }
      }

      result.push(transfer);
    }
    return result;
  },

  
  autoCropBlackMargins(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let minX = canvas.width, maxX = 0;
        let minY = canvas.height, maxY = 0;
        
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const i = (y * canvas.width + x) * 4;
            const r = data[i], g = data[i+1], b = data[i+2];
            // threshold for black (allow dark gray noise)
            if (r > 20 || g > 20 || b > 20) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
        
        if (minX <= maxX && minY <= maxY) {
          if (minX > 0 || maxX < canvas.width - 1 || minY > 0 || maxY < canvas.height - 1) {
             const cropW = maxX - minX + 1;
             const cropH = maxY - minY + 1;
             const cropCanvas = document.createElement('canvas');
             cropCanvas.width = cropW;
             cropCanvas.height = cropH;
             const cropCtx = cropCanvas.getContext('2d');
             cropCtx.drawImage(img, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
             resolve(cropCanvas.toDataURL('image/png'));
             return;
          }
        }
        resolve(dataUrl);
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  },

  getDinnerReservationLinks(day1, day2, day3) {
    const dinners = [];
    [day1, day2, day3].forEach((day, i) => {
      day.forEach(e => {
        if (e.type === 'food' && !e.title.includes('ホテル')) {
          let names = [];
          if (e.title.includes('候補①')) {
             const parts = e.title.replace(/^夕食：/, '').split(' / ');
             parts.forEach(p => names.push(p.replace(/候補[①②]\s*/, '')));
          } else {
             names.push(e.title.replace(/^夕食：/, '').replace(/^昼食：/, ''));
          }
          
          names.forEach(name => {
             if (!dinners.find(d => d.name === name)) {
               const url = e.tabelogUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('函館 ' + name)}`;
               dinners.push({ name, url, day: `${i + 1}日目` });
             }
          });
        }
      });
    });
    if (dinners.length === 0) return '';
    return dinners.map(d => `
      <div class="reservation-link-item" style="background:#fff; border:1px solid #ddd; padding:10px; border-radius:8px; display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
        <div class="reservation-link-label" style="font-weight:bold;">🍽️ ${d.name} <span style="font-size:0.8em; color:#666;">(${d.day})</span></div>
        <a href="${d.url}" target="_blank" rel="noopener" class="btn btn-reservation btn-tabelog" style="background:#e67e22; color:#fff; text-decoration:none; padding:5px 15px; border-radius:4px; font-size:0.9em;">店舗情報を確認・予約する</a>
      </div>
    `).join('');
  },


  calculateTotalCost(hotel, day1Events, day2Events, day3Events) {
     let shinkansen = 60000; // rough estimate for 2 people round trip from Tokyo
     let accommodation = hotel.pricePerNight * 2 * 2; // 2 people, 2 nights
     
     let taxi = 0;
     [day1Events, day2Events, day3Events].forEach(day => {
        day.forEach(e => {
           if (e.cost && e.cost.includes('¥')) {
              taxi += parseInt(e.cost.replace(/[^0-9]/g, ''));
           }
        });
     });
     
     let food = 0;
     [day1Events, day2Events, day3Events].forEach(day => {
        day.forEach(e => {
           if (e.type === 'food') {
              if (e.title.includes('夕食') && !e.title.includes('ホテル')) food += 15000;
              else if (e.title.includes('昼食')) food += 4000;
              else if (e.title.includes('朝食') && !e.title.includes('ホテル')) food += 3000;
              else if (e.title.includes('候補')) food += 15000;
           }
        });
     });
     
     const total = shinkansen + accommodation + taxi + food;
     return { shinkansen, accommodation, taxi, food, total };
  },

  getGoogleMapsUrl(query) {
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query);
  },

  enrichEventsWithLinks(events, hotel, dest) {
    events.forEach(event => {
      if (event.type === 'sightseeing' || event.type === 'spot') {
        event.mapsUrl = this.getGoogleMapsUrl(dest.name + ' ' + event.title);
      } else if (event.type === 'hotel') {
        event.mapsUrl = this.getGoogleMapsUrl(event.title.replace(' 到着', '').replace('へ帰還', '').replace(' チェックアウト', ''));
      } else if (event.type === 'food') {
        const name = event.title.replace(/^夕食：/, '').replace(/^昼食：/, '').replace(/^周辺レストランで/, '').replace(/^周辺カフェで/, '').replace(/^ホテルで/, '');
        event.mapsUrl = this.getGoogleMapsUrl(dest.name + ' ' + name);
        const r = [...(dest.restaurants?.dinner || []), ...(dest.restaurants?.lunch || []), ...(dest.restaurants?.snack || [])].find(d => name.includes(d.name));
        if (typeof getTabelogSearchUrl !== 'undefined') {
          event.tabelogUrl = getTabelogSearchUrl(name, dest.name);
        } else if (r && r.tabelogUrl) {
          event.tabelogUrl = r.tabelogUrl;
        }
      }
    });
  },

  renderTimeline(events) {
    let html = '<div class="timeline">';
    events.forEach(e => {
      let titleHtml = e.title;
      if (e.mapsUrl) {
        titleHtml = `<a href="${e.mapsUrl}" target="_blank" rel="noopener" class="map-link">${e.title}<span class="map-icon">📍</span></a>`;
      }
      
      if (e.type === 'transfer') {
        html += `
          <div class="timeline-item type-transfer">
            <div class="timeline-time">${e.duration ? e.duration : ''}</div>
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <span class="transfer-icon">${e.icon}</span>
              <span class="transfer-label">${e.title}</span>\n              ${e.cost ? ` <span class="transfer-cost" style="margin-left: 10px; color: #e67e22; font-weight: bold; font-size: 0.85em;">${e.cost}</span>` : ""}
              ${e.detail ? `<div class="timeline-detail" style="margin-top: 5px;">${e.detail}</div>` : ''}
            </div>
          </div>
        `;
      } else {
        html += `
          <div class="timeline-item type-${e.type}">
            <div class="timeline-time">${e.time || ''}</div>
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-title">${titleHtml}</div>
              ${e.detail ? `<div class="timeline-detail" style="margin-top: 5px;">${e.detail}</div>` : ''}
            </div>
          </div>
        `;
      }
    });
    html += '</div>';
    return html;
  },

  updatePrintScreenshotsLayout() {
    const container = document.getElementById('dynamic-print-screenshots');
    if (container) {
      container.innerHTML = '';
    }
  },

  async generateFinalItinerary() {
    const hotel = this.state.selectedHotel;
    if (!hotel) {
      alert('宿が選択されていません。');
      this.showStep('hotels');
      return;
    }

    const destKey = this.resolveDestination(this.state.inputs.destination);
    const dest = DESTINATIONS[destKey];
    const inputs = this.state.inputs;
    
    // Get inputted local arrival/departure times
    const arrInput = document.getElementById('hakodate-arrival-time').value || '14:00';
    const depInput = document.getElementById('hakodate-departure-time').value || '13:00';
    
    // Get images
    const img1El = document.getElementById('preview-1');
    const img3El = document.getElementById('preview-3');

    let img1Src = (img1El && img1El.style.display !== 'none' && img1El.src) ? img1El.src : null;
    let img3Src = (img3El && img3El.style.display !== 'none' && img3El.src) ? img3El.src : null;
    
    img1Src = img1Src ? await this.autoCropBlackMargins(img1Src) : null;
    img3Src = img3Src ? await this.autoCropBlackMargins(img3Src) : null;
    
    const wrapImage = (src) => {
      if (!src) return '';
      return `<div style="width: 100%; border-radius: 8px; margin-top: 10px; border: 1px solid #ddd; background: #fff;">
        <img src="${src}" style="width: 100%; max-height: 800px; object-fit: contain; display: block; border-radius: 8px;">
      </div>`;
    };

    // Build Day 1 Timeline (Local Hakodate)
    const arrParts = arrInput.split(':').map(Number);
    const arrMin = arrParts[0] * 60 + arrParts[1];
    
    let currentMin = arrMin;
    let day1Events = [];
    
    // Prepend home departure based on uploaded images
    day1Events.push({ time: '', title: '自宅・出発地を出発', type: 'transport', icon: '🏠' });
    day1Events.push({ type: 'transfer', title: '行きのルート（右の経路図を参照）', icon: '🚄', duration: null });
    
    day1Events.push({ time: this.minToTime(currentMin), title: `${dest.cityStation || dest.station} 到着`, type: 'transport', icon: '🚉' });
    
    currentMin += 15 + (parseInt(hotel.taxiFromCityStation) || 15);
    day1Events.push({ time: this.minToTime(currentMin), title: hotel.name + ' 到着', type: 'hotel', icon: '🏨' });
    
    currentMin += 60; // rest
    day1Events.push({ time: this.minToTime(currentMin), title: 'ホテル周辺を散策', type: 'sightseeing', icon: '🚶' });
    
    currentMin += 120;
    if (hotel.dinnerIncluded) {
      day1Events.push({ time: this.minToTime(currentMin), title: 'ホテルで夕食', type: 'food', icon: '🍽️' });
    } else {
      const d1 = dest.restaurants?.dinner?.[0];
      const d2 = dest.restaurants?.dinner?.[1];
      let title = '周辺レストランで夕食';
      let detail = '';
      if (d1 && d2) {
         title = `夕食：候補① ${d1.name} / 候補② ${d2.name}`;
         detail = `①${d1.genre} (予算:約${d1.budget}円) <br>②${d2.genre} (予算:約${d2.budget}円)`;
      } else if (d1) {
         title = `夕食：${d1.name}`;
         detail = `${d1.genre} (予算:約${d1.budget}円)`;
      }
      day1Events.push({ time: this.minToTime(currentMin), title: title, type: 'food', icon: '🍽️', detail: detail });
    };

    // Build Day 2 Timeline
    let day2Events = [];
    day2Events.push({ time: '08:00', title: hotel.breakfastIncluded ? 'ホテルで朝食' : '周辺カフェで朝食', type: 'food', icon: '🥐' });
    day2Events.push({ time: '10:00', title: 'ホテルを出発', type: 'transport', icon: '🏨' });
    day2Events.push({ time: '10:30', title: dest.spots[0]?.name || '観光スポットA', type: 'sightseeing', icon: '📸' });
    const lunch = dest.restaurants?.lunch?.[0];
    day2Events.push({ time: '12:30', title: lunch ? `昼食：${lunch.name}` : '周辺で昼食', type: 'food', icon: '🍜', detail: lunch ? lunch.description : '' });
    day2Events.push({ time: '14:30', title: dest.spots[1]?.name || '観光スポットB', type: 'sightseeing', icon: '🏯' });
    day2Events.push({ time: '17:00', title: 'ホテルへ帰還', type: 'hotel', icon: '🏨' });

    // Build Day 3 Timeline
    const depParts = depInput.split(':').map(Number);
    let depMin = depParts[0] * 60 + depParts[1];
    
    let day3Events = [];
    day3Events.push({ time: '08:30', title: hotel.breakfastIncluded ? 'ホテルで朝食' : '周辺で朝食', type: 'food', icon: '🥐' });
    day3Events.push({ time: '10:00', title: 'ホテルをチェックアウト', type: 'hotel', icon: '🏨' });
    day3Events.push({ time: '10:30', title: 'お土産購入・市場散策など', type: 'sightseeing', icon: '🛍️' });
    
    const stationArrMin = depMin - 30; // arrive 30 mins before departure
    day3Events.push({ time: this.minToTime(stationArrMin), title: `${dest.cityStation || dest.station} 到着（お土産・休憩）`, type: 'transport', icon: '🚉' });
    day3Events.push({ time: this.minToTime(depMin), title: `${dest.cityStation || dest.station} 出発`, type: 'transport', icon: '🚄' });
    
    day3Events.push({ type: 'transfer', title: '帰りのルート（右の経路図を参照）', icon: '🚄', duration: null });
    day3Events.push({ time: '', title: '自宅・出発地に帰着', type: 'transport', icon: '🏠' });

    day1Events = this.fillMovementGaps(day1Events, hotel, dest);
    day2Events = this.fillMovementGaps(day2Events, hotel, dest);
    day3Events = this.fillMovementGaps(day3Events, hotel, dest);

    this.enrichEventsWithLinks(day1Events, hotel, dest);
    this.enrichEventsWithLinks(day2Events, hotel, dest);
    this.enrichEventsWithLinks(day3Events, hotel, dest);

    // Render logic
    const reservationHtml = this.getDinnerReservationLinks(day1Events, day2Events, day3Events);
    const reservationSection = reservationHtml ? `
        <div style="width:100%; background:white; padding: 20px; border-radius:12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 30px;">
          <h3 style="margin-top:0; border-bottom:2px solid #eee; padding-bottom:10px; color:#d35400;">📞 予約・確認が必要なレストラン</h3>
          ${reservationHtml}
        </div>
    ` : '';
    
    
    const costs = this.calculateTotalCost(hotel, day1Events, day2Events, day3Events);
    const costHtml = `
      <div style="background:white; padding: 20px; border-radius:12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 30px;">
        <h3 style="margin-top:0; border-bottom:2px solid #eee; padding-bottom:10px; color:#27ae60;">💰 2名様 旅行代金（概算）</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 1.1rem;">
          <tr style="border-bottom: 1px dashed #ccc;">
             <td style="padding: 10px 0;">🚅 新幹線・交通費 (東京方面目安)</td>
             <td style="text-align: right; padding: 10px 0;">¥${costs.shinkansen.toLocaleString()}</td>
          </tr>
          <tr style="border-bottom: 1px dashed #ccc;">
             <td style="padding: 10px 0;">🏨 宿泊代 (${hotel.name} / 2泊)</td>
             <td style="text-align: right; padding: 10px 0;">¥${costs.accommodation.toLocaleString()}</td>
          </tr>
          <tr style="border-bottom: 1px dashed #ccc;">
             <td style="padding: 10px 0;">🚕 現地タクシー代 (2泊3日分)</td>
             <td style="text-align: right; padding: 10px 0;">¥${costs.taxi.toLocaleString()}</td>
          </tr>
          <tr style="border-bottom: 2px solid #333;">
             <td style="padding: 10px 0;">🍽️ 飲食代 (昼食・夕食目安)</td>
             <td style="text-align: right; padding: 10px 0;">¥${costs.food.toLocaleString()}</td>
          </tr>
          <tr style="font-weight: bold; font-size: 1.3rem; color: #d35400;">
             <td style="padding: 15px 0;">合計</td>
             <td style="text-align: right; padding: 15px 0;">¥${costs.total.toLocaleString()}</td>
          </tr>
        </table>
        <p style="font-size: 0.85em; color: #666; margin-top: 10px;">※交通費は出発地や時期によって変動します。タクシー代と飲食代はスケジュールに基づく概算です。</p>
      </div>
    `;

    const container = document.getElementById('confirmed-content');
    
    container.innerHTML = `
      <div class="print-page-1" style="margin-bottom: 30px;">
        <div class="itinerary-header" style="text-align:center; padding: 20px; background:var(--color-bg-sub); border-radius:12px; margin-bottom: 20px;">
          <h1 style="color:var(--color-primary); font-size: 1.8rem; margin:0;">${dest.name}滞在 特化型しおり</h1>
          <p style="color:#555; margin-top:5px;">ご宿泊：<strong>${hotel.name}</strong></p>
        </div>

        <div style="display:flex; gap: 20px; flex-wrap:wrap; margin-bottom: 30px;">
          <div style="flex:1; min-width:300px; background:white; padding: 20px; border-radius:12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <h3 style="margin-top:0; border-bottom:2px solid #eee; padding-bottom:10px;">🏨 宿泊情報</h3>
            <p><strong>${hotel.name}</strong></p>
            <p style="font-size:0.9rem; color:#666;">📍 ${hotel.area}</p>
            <p style="font-size:0.9rem; color:#666;">${hotel.features.join(' / ')}</p>
          </div>
          <div style="flex:1; min-width:300px; background:white; padding: 20px; border-radius:12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <h3 style="margin-top:0; border-bottom:2px solid #eee; padding-bottom:10px;">🎒 持ち物チェックリスト</h3>
            <ul style="list-style:none; padding:0; margin:0; font-size:0.9rem; line-height:1.8;">
              <li><input type="checkbox"> 着替え（2泊3日分）</li>
              <li><input type="checkbox"> スマホ充電器・モバイルバッテリー</li>
              <li><input type="checkbox"> 常備薬・洗面用具</li>
              <li><input type="checkbox"> 健康保険証・身分証</li>
              <li><input type="checkbox"> 現金・クレジットカード</li>
            </ul>
          </div>
        </div>

        ${reservationSection}
        <h3 class="section-title">🕒 ${dest.name} 2泊3日 滞在スケジュール</h3>
        
        <h4 style="color:var(--color-primary); border-bottom: 2px dashed #ccc; padding-bottom: 5px;">【1日目】 ${dest.name}へ到着</h4>
        <div class="day-section" style="margin-bottom: 20px; padding: 15px; background:white; border-radius:12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start;">
          <div style="flex: 1; min-width: 300px;">
            ${this.renderTimeline(day1Events)}
          </div>
          ${img1Src ? `<div style="width: 320px; max-width: 100%; flex-shrink: 0; margin: 0 auto;"><div style="background:#f9f9f9; padding: 10px; border-radius: 8px; border: 1px solid #eee;"><h5 style="margin:0 0 10px 0; text-align:center; color:#555;">🚄 行きの乗換経路</h5><img src="${img1Src}" style="width: 100%; display: block; border-radius: 4px; border: 1px solid #ddd;"></div></div>` : ''}
        </div>

        <h4 style="color:var(--color-primary); border-bottom: 2px dashed #ccc; padding-bottom: 5px;">【2日目】 終日フリー・観光</h4>
        <div class="day-section" style="margin-bottom: 20px; padding: 15px; background:white; border-radius:12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          ${this.renderTimeline(day2Events)}
        </div>

        <h4 style="color:var(--color-primary); border-bottom: 2px dashed #ccc; padding-bottom: 5px;">【3日目】 ${dest.name}を出発</h4>
        <div class="day-section" style="margin-bottom: 20px; padding: 15px; background:white; border-radius:12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start;">
          <div style="flex: 1; min-width: 300px;">
            ${this.renderTimeline(day3Events)}
          </div>
          ${img3Src ? `<div style="width: 320px; max-width: 100%; flex-shrink: 0; margin: 0 auto;"><div style="background:#f9f9f9; padding: 10px; border-radius: 8px; border: 1px solid #eee;"><h5 style="margin:0 0 10px 0; text-align:center; color:#555;">🚄 帰りの乗換経路</h5><img src="${img3Src}" style="width: 100%; display: block; border-radius: 4px; border: 1px solid #ddd;"></div></div>` : ''}
        </div>
      </div>
      ${costHtml}
    `;

    this.updatePrintScreenshotsLayout();
    this.showStep('confirmed');
    window.scrollTo(0,0);
  },

  bindHowtoModalEvents() {
    const btnOpen = document.getElementById('btn-howto-open');
    const btnClose = document.getElementById('howto-modal-close');
    const backdrop = document.getElementById('howto-modal-backdrop');
    const modal = document.getElementById('howto-modal');
    
    if (btnOpen) btnOpen.addEventListener('click', () => {
      if(modal) {
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
      }
    });
    
    const closeModal = () => {
      if(modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
      }
    };
    
    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);
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
      hakodateArrivalTime: document.getElementById('hakodate-arrival-time') ? document.getElementById('hakodate-arrival-time').value : '14:00',
      hakodateDepartureTime: document.getElementById('hakodate-departure-time') ? document.getElementById('hakodate-departure-time').value : '13:00',
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
      
      if (hotel && this.isHotelAvailable(hotel, this.state.inputs.departureDate)) {
        this.state.selectedHotel = hotel;
        
        // Restore times
        if (payload.hakodateArrivalTime) {
          const arrInput = document.getElementById('hakodate-arrival-time');
          if (arrInput) arrInput.value = payload.hakodateArrivalTime;
        }
        if (payload.hakodateDepartureTime) {
          const depInput = document.getElementById('hakodate-departure-time');
          if (depInput) depInput.value = payload.hakodateDepartureTime;
        }

        this.showStep('yahoo-data');
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
      
      }

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
      
      
      App.updatePrintScreenshotsLayout();
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
    App.updatePrintScreenshotsLayout();
    input.value = ''; // Reset input
  };

  // Initialize after a short delay to ensure DOM is ready
  setTimeout(initScreenshotSlots, 100);


  