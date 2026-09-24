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
    // 比較カードで利用者が選んだ出発空港。{ station, dest, index } の形で持ち、
    // 出発駅か目的地が変わったら（＝候補の顔ぶれが変わったら）無視して既定に戻す
    selectedDepartureAirport: null,
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
    this.refreshTrainChoices();
    this.showStep('input');
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

    this.bindDirectPdfButton();
    this.bindHowtoModalEvents();
    this.bindTicketGuideModalEvents();
    
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

    // 時刻を入力し直したら、未入力エラーの表示と赤枠をその場で解除する
    ['hakodate-arrival-time', 'hakodate-departure-time'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', () => {
        if (el.value.trim()) el.classList.remove('input-missing');
        if (this.validateYahooData().ok) this.clearYahooDataError();
      });
    });

    const btnBack = document.getElementById('btn-back-to-input');
    if (btnBack) {
      btnBack.addEventListener('click', () => this.showStep('input'));
    }

    document.getElementById('btn-top').addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
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

    // 比較カードの「この空港で見る」。カードは updateDestinationInfo() で
    // 毎回作り直されるため、ボタン個別ではなく親要素への委譲で受ける
    document.getElementById('destination-info')?.addEventListener('click', (e) => {
      const btn = e.target.closest('.airport-alt-pick');
      if (!btn) return;
      this.state.selectedDepartureAirport = {
        station: this.getSelectedStationName(),
        dest: btn.dataset.dest || '',
        index: Number(btn.dataset.airportIndex),
      };
      this.updateDestinationInfo();
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
    if (step === 'yahoo-data') this.updateYahooDataLabels();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // 「ヤフー乗換データの連携」画面の駅名表示を、選択中のエリアに合わせて更新する。
  // 元テンプレートが函館固定だった名残の要素(id="yahoo-data-*")をエリア名/駅名で上書きする。
  updateYahooDataLabels() {
    const destKey = this.resolveDestination(this.state.inputs.destination);
    const dest = destKey ? DESTINATIONS[destKey] : null;
    if (!dest) return;
    const stationName = dest.cityStation || dest.station;
    document.querySelectorAll('#yahoo-data-station-name-1, #yahoo-data-station-name-2, #yahoo-data-station-name-3').forEach((el) => {
      el.textContent = stationName;
    });
    const destNameEl = document.getElementById('yahoo-data-dest-name');
    if (destNameEl) destNameEl.textContent = dest.name;
  },

  // 「ヤフー乗換データの連携」画面の入力チェック。
  // 到着/出発時刻は行程の起点そのものなので必須。未入力を既定値で補うと、
  // 利用者が調べていない架空の時刻が「しおり」に印刷されてしまう。
  // スクショ画像は裏取り用の添付であり、無くても行程は組めるため必須にはしない。
  validateYahooData() {
    const arrEl = document.getElementById('hakodate-arrival-time');
    const depEl = document.getElementById('hakodate-departure-time');
    const arrival = arrEl ? arrEl.value.trim() : '';
    const departure = depEl ? depEl.value.trim() : '';

    const destKey = this.resolveDestination(this.state.inputs.destination);
    const dest = destKey ? DESTINATIONS[destKey] : null;
    const stationName = dest ? (dest.cityStation || dest.station) : '目的地の駅';

    const messages = [];
    if (!arrival) {
      messages.push(`ヤフー乗換データ（行き）が未入力のため、行きの交通ルートを表示できません。乗換案内アプリで調べた「${stationName}への到着時刻」を入力してください。`);
    }
    if (!departure) {
      messages.push(`ヤフー乗換データ（帰り）が未入力のため、帰りの交通ルートを表示できません。乗換案内アプリで調べた「${stationName}からの出発時刻」を入力してください。`);
    }

    return { ok: messages.length === 0, messages, arrival, departure };
  },

  showYahooDataError(messages) {
    const box = document.getElementById('yahoo-data-error');
    if (!box) return;
    box.innerHTML = `
      <p class="yahoo-data-error-title">⚠️ 入力が足りないため「しおり」を作成できません</p>
      <ul>${messages.map(m => `<li>${m}</li>`).join('')}</ul>
      <p class="yahoo-data-error-note">アプリが架空の時刻を補うと、実際の時刻表と見分けがつかなくなるため、推測での自動生成は行いません。</p>
    `;
    box.hidden = false;

    // 未入力の欄を赤枠にして、どこを直せばよいか一目で分かるようにする
    ['hakodate-arrival-time', 'hakodate-departure-time'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('input-missing', !el.value.trim());
    });

    const firstEmpty = ['hakodate-arrival-time', 'hakodate-departure-time']
      .map((id) => document.getElementById(id))
      .find((el) => el && !el.value.trim());
    if (firstEmpty) firstEmpty.focus({ preventScroll: true });
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  clearYahooDataError() {
    const box = document.getElementById('yahoo-data-error');
    if (box) {
      box.hidden = true;
      box.innerHTML = '';
    }
    ['hakodate-arrival-time', 'hakodate-departure-time'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('input-missing');
    });
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
    const station = this.getSelectedStationName();
    if (station && station.includes('駅')) {
        const routeInfo = compareTransportRoutes(station, dest.name, this.state.inputs.departureTime || '10:00', this.state.inputs.departureDate || null);
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
            // 飛行機側はフライト所要時間が未検証の場合、この合計自体が目安である
            const fUnverified = routeInfo.flight && routeInfo.flight.hasUnverifiedFlightLeg;
            const fTime = routeInfo.flight
              ? '飛行機は約' + formatHours(routeInfo.flight.time) + (fUnverified ? '（目安）' : '')
              : '';
            const joinT = sTime && fTime ? '、' : '';
            const fNote = fUnverified
              ? '\n※飛行機側は直行便の有無・所要時間・便の時刻が未検証のため、合計は「空港到着の60分後に搭乗できた場合」の最短の目安です。'
              : '';
            alert('ご指定のルートは ' + sTime + joinT + fTime + ' かかるため、片道5時間（300分）を超えてしまいます。' + fNote + '\n「疲れない旅」の基準を満たさないため、出発地または目的地を変更してください。');
            return false;
        }
    }
    if (subtitleEl) subtitleEl.innerHTML = `${dest.area}・片道５時間以内で到着。<br>２泊３日の疲れない旅を設計します。`;
    const stationName = this.getSelectedStationName();

    let transportHtml = '';
    if (stationName && dest.name) {
      const departTimeStr = document.getElementById('departure-time').value || '10:00';
      const departDateStr = document.getElementById('departure-date')?.value || null;
      // 利用者が「この空港で見る」で選んだ候補があれば、それで飛行機ルートを組む。
      // ただし出発駅・目的地が変わると候補の顔ぶれ自体が変わり、同じ番号が
      // まったく別の空港を指してしまうため、その場合は選択を捨てて既定に戻す
      const picked = this.state.selectedDepartureAirport;
      const airportIndex =
        picked && picked.station === stationName && picked.dest === dest.name ? picked.index : null;
      const comparison = compareTransportRoutes(stationName, dest.name, departTimeStr, departDateStr, airportIndex);
      // Save recommended transport mode for reuse in hotel step
      this.state.recommendedTransport = comparison.recommended;
      
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
            // 区間ごとの確定/概算/目安をバッジで示す
            return `<div class="timeline-edge">${item.text}${this.renderReliabilityBadge(item.reliability)}${this.renderReliabilityCaveat(item.reliability)}</div>`;
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

      // フライト区間が未検証のとき、合計時間はその概算値の上に乗っている。
      // 「約6時間6分」を確定値として読ませないよう、合計の隣に注記を出す
      const fliUnverified = fli && fli.hasUnverifiedFlightLeg;
      const fliTimeNote = fliUnverified
        ? `<div class="compare-time-note">※フライトの所要時間・便の時刻が未検証のため、合計は最短の目安です（空港到着の60分後に搭乗できた場合）</div>`
        : '';

      // ── 出発空港が複数ある駅の「ほかの空港も見る」（案D） ──
      // 候補が1件しかない駅（大多数）ではこのブロックごと出さないため、
      // 見た目は従来どおり。複数ある駅だけ折りたたみが1行増える。
      // 折りたたみの中は1行サマリだけにして、フルのタイムラインは
      // 選択中の1候補しか描かない（縦に伸ばさないため）。
      const candidates = (fli && fli.airportCandidates) || [];
      const selectedIdx = fli ? fli.selectedAirportIndex : -1;

      const altHtml = (fli && candidates.length > 1) ? (() => {
        // 候補には「別の空港」だけでなく「同じ空港への別ルート」も入る
        // （例：横浜→羽田は京急30分とYCATリムジン35分の2通り）。
        // 「ほかの空港も見る」とだけ書くと同じ空港名が並んで混乱するため、
        // 同じ空港の候補が含まれるかどうかで見出しと行の表記を変える
        const selAirport = candidates[selectedIdx] ? candidates[selectedIdx].airport : '';
        const hasSameAirportAlt = candidates.some((c, i) => i !== selectedIdx && c.airport === selAirport);

        const rows = candidates.map((cand, i) => {
          if (i === selectedIdx) return '';
          // 候補ごとの合計は、その空港で行程を組み直さないと出せない。
          // 候補は多くても3件なので、ここで都度生成してよい
          const altRoute = generateFlightTimeline(stationName, dest.name, departTimeStr, i);
          const viaText = cand.via ? `（${this.escapeHtml(cand.via)}）` : '';
          const fareText = cand.fare ? ` / ${cand.fare.toLocaleString()}円` : '';
          const unverified = altRoute && altRoute.hasUnverifiedFlightLeg;
          return `
            <li class="airport-alt-row">
              <div class="aar-main">
                <span class="aar-airport">${this.escapeHtml(cand.airport)} 経由${cand.airport === selAirport ? '（別の行き方）' : ''}</span>
                <span class="aar-total">合計 約 ${formatTime(altRoute.time)}${unverified ? '<span class="compare-time-mark">※</span>' : ''}</span>
              </div>
              <div class="aar-sub">
                ${this.escapeHtml(cand.label)} 約${cand.durationMin}分${viaText}${fareText}
                ${unverified ? '<span class="aar-flag">直行便の有無＝要確認</span>' : ''}
              </div>
              ${this.renderReliabilityCaveat(cand.reliability)}
              <button type="button" class="airport-alt-pick" data-airport-index="${i}" data-dest="${this.escapeHtml(dest.name)}">この空港で見る</button>
            </li>`;
        }).join('');

        return `
          <details class="airport-alt">
            <summary>${hasSameAirportAlt ? 'ほかの空港・行き方も見る' : 'ほかの空港も見る'}（${candidates.length - 1}件）</summary>
            <ul class="airport-alt-list">${rows}</ul>
          </details>`;
      })() : '';

      // 候補が複数ある駅でだけ、どの空港を経由する行程なのかを示す。
      // 見出しの <strong> の中に入れると「飛行機（福島」「空港 経由）」のように
      // 所要時間との間で不自然に折り返すため、見出しの下に独立した1行として出す。
      // 候補1件の駅ではこの行ごと出さないので、従来どおり「✈️ 飛行機」のまま
      const fliVia = (fli && candidates.length > 1)
        ? `<div class="compare-via">${this.escapeHtml(candidates[selectedIdx] ? candidates[selectedIdx].airport : '')} 経由</div>`
        : '';

      const fliHtml = (fli) ? `
        <div class="compare-item ${comparison.recommended === 'flight' ? 'recommended' : ''}">
          <div class="compare-header">
            <strong>✈️ 飛行機</strong>
            <span class="compare-time">約 ${formatTime(fli.time)}${fliUnverified ? '<span class="compare-time-mark">※</span>' : ''}</span>
          </div>
          ${fliVia}
          ${fliTimeNote}
          <div class="timeline-container">
            ${renderTimeline(fli.timeline)}
          </div>
          ${altHtml}
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
            conclusionText = `⚠️ どちらも5時間を超えますが、比較するなら<br>${reason}`;
        } else if (shin.time > 300) {
            conclusionText = `✈️ 新幹線は5時間を超える（約${shinT}）ため、【飛行機】推奨`;
        } else if (fli.time > 300) {
            conclusionText = `🚄 飛行機は5時間を超える（約${fliT}）ため、疲労の少ない【新幹線】推奨`;
        } else {
            conclusionText = reason;
        }

        // 比較の土台になっている飛行機側の合計が未検証のフライト時間を含む場合、
        // 「所要時間が短いため」という結論も未検証の値に依存している。
        // 推奨そのものは変えず（行程の時刻計算を動かさないため）、根拠の弱さを明示する
        if (fliUnverified) {
          const pair = fli.flightPair;
          const pairText = pair ? `${pair.from}→${pair.to}` : '利用区間';
          conclusionText += `<br><span style="font-size: 0.9em; color: #b45309;">※${pairText}の直行便の有無・所要時間・便の時刻が未検証のため、飛行機側の合計は「空港到着の60分後に搭乗できた場合」の最短の目安です。実際の便の時刻によっては待ち時間が加わり、乗り継ぎになる場合は所要時間が大きく変わります</span>`;
        }
      } else {
         conclusionText = comparison.recommended === 'shinkansen' ? '🚄 【新幹線】推奨' : '✈️ 【飛行機】推奨';
      }

      // ── 片道5時間超の警告バナー ──
      // app.js の5時間ゲート（station.includes('駅') の分岐）は
      // PREFECTURE_STATIONS の駅名に「駅」の字が無いため実際には発火せず、
      // 5時間超の目的地も選択できてしまう（この挙動は意図的に維持する方針）。
      // そのため利用者への歯止めはこの警告表示だけになる。
      // 小さな注記では見落とされるため、バナーとしてはっきり出す。
      // あわせて、表示している所要時間が概算・未検証区間を含む積み上げであり
      // 「これ以上短くなることはまず無い」ことを明示する
      const overLimitWarning = (() => {
        const rec = comparison[comparison.recommended];
        if (!rec || rec.time <= 300) return '';

        const overMin = rec.time - 300;
        // 超過分は1時間未満になることもあるため「0時間10分」にならない書き方にする
        const overText = overMin >= 60 ? formatHoursStr(overMin) : `${overMin}分`;
        const recLabel = comparison.recommended === 'shinkansen' ? '新幹線ルート' : '飛行機ルート';
        const bothOver = shin && fli && shin.time > 300 && fli.time > 300;

        // 「夕方〜夜に着く」等を決め打ちで書くと5時間ちょうど付近のルートで
        // 事実と食い違う。行程の最終ノードから実際の到着時刻を取って提示する
        const recNodes = (rec.timeline || []).filter(i => i.type === 'node' && i.time);
        const lastNode = recNodes[recNodes.length - 1];
        const arriveText = lastNode
          ? `この行程だと <strong>${departTimeStr} 出発 → ${lastNode.time} 到着</strong>${lastNode.dayLabel ? `<strong>${lastNode.dayLabel}</strong>` : ''}で、初日は移動が中心になります。`
          : '初日は移動が中心になります。';

        // 未検証のフライト区間を含むかどうかで、注意の具体性を変える
        const pair = rec.flightPair;
        const unverifiedNote = rec.hasUnverifiedFlightLeg
          ? `とくに <strong>${pair ? `${pair.from}→${pair.to}` : 'フライト区間'}</strong> は直行便の有無すら未検証です。乗り継ぎが必要な場合、ここだけで数時間増えることがあります。`
          : '';

        return `
          <div class="over-limit-warning" role="alert">
            <div class="olw-head">
              <span class="olw-icon" aria-hidden="true">⚠️</span>
              <span class="olw-head-text">片道 約${formatHoursStr(rec.time)}：「疲れない旅」の目安（片道5時間）を <strong>${overText}</strong> 超えています</span>
            </div>
            <ul class="olw-body">
              <li>${bothOver
                    ? `新幹線・飛行機の<strong>どちらも5時間を超えます</strong>（新幹線 約${formatHoursStr(shin.time)} / 飛行機 約${formatHoursStr(fli.time)}）。`
                    : `最短の${recLabel}でも約${formatHoursStr(rec.time)}かかります。`}</li>
              <li><strong>実際の所要時間はさらに長くなる可能性があります。</strong>表示しているのは乗り換え・待ち時間を含む概算の積み上げで、未検証の区間を含みます。${unverifiedNote}</li>
              <li>${arriveText}2泊3日では現地で過ごせる時間がその分短くなります。</li>
              <li><strong>出発地または目的地の変更を強くおすすめします。</strong>それでもこの行程で進める場合は、各区間の実際の時刻を必ずご自身でご確認ください。</li>
            </ul>
          </div>
        `;
      })();

      transportHtml = `
        <div class="transport-comparison">
          <div class="comparison-title">💡 ${conclusionText}</div>
          ${overLimitWarning}
          <div class="comparison-grid">
            ${shinHtml}
            ${fliHtml}
          </div>
        </div>
      `;
    } else {
      // Fallback: use the transport mode defined in destination data
      this.state.recommendedTransport = dest.transportMode === 'flight' ? 'flight' : 'shinkansen';
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
      const dep = this.state.inputs.departure || '';
      const destId = this.state.inputs.destination;
      const selectedDest = window.DESTINATIONS ? window.DESTINATIONS[destId] : null;
      // Use the recommendation already computed and saved in updateDestinationInfo
      const isShinkansen = this.state.recommendedTransport === 'shinkansen';
      const mode = isShinkansen ? '新幹線' : '飛行機';
      const reason = isShinkansen ? '乗り換えが少なく座ったまま移動できるため疲れにくいです。' : '移動時間が圧倒的に短いため疲れにくいです。';
      
      transportRec.innerHTML = `
        <h2 style="font-size:1.2rem; margin-top:0; color:var(--color-primary);">${isShinkansen ? '🚅' : '✈️'} あなたへのオススメ移動手段：${mode}</h2>
        <p style="margin:5px 0 0 0; color:#333;">出発地（${dep}周辺）から${selectedDest ? selectedDest.name : "目的地"}へのアクセスは、${reason}</p>
      `;
    }

    // Sort hotels by price descending (高い順)
    const availableHotels = (dest.hotels || [])
      .filter((hotel) => this.isHotelAvailable(hotel, this.state.inputs.departureDate))
      .sort((a, b) => (b.pricePerNight || 0) - (a.pricePerNight || 0));

    availableHotels.forEach((hotel) => {
      const card = document.createElement('div');
      card.className = 'hotel-card';

      card.innerHTML = `
        <div class="hotel-card-header">
          <div class="hotel-title-group">
            <h3><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + ' ' + dest.name)}" target="_blank" rel="noopener" class="hotel-map-link">${hotel.name}</a></h3>
            <span class="hotel-type">${hotel.type || '宿泊施設'}</span>
          </div>
          <div class="hotel-price-badge">
            <span class="hotel-price-label">宿泊目安</span>
            <span class="hotel-price-val">¥${(hotel.pricePerNight || 0).toLocaleString()}</span>
            <span class="hotel-price-unit">/泊</span>
          </div>
        </div>
        <div class="hotel-card-body">
          <div class="hotel-features">
            ${(hotel.features || []).map((f) => `<span class="feature-tag">${f}</span>`).join('')}
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
              <span class="detail-icon">🍽️</span>
              <span>${hotel.dinnerIncluded ? '夕食付' : '夕食なし'}・${hotel.breakfastIncluded ? '朝食付' : '朝食なし'}</span>
            </div>
            <div class="hotel-detail-item">
              <span class="detail-icon">🗺️</span>
              <span><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + ' ' + dest.name)}" target="_blank" rel="noopener" style="color:var(--color-primary);text-decoration:underline;">Googleマップで位置を見る</a></span>
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
        window.scrollTo(0, 0);
      });

      container.appendChild(card);
    });

    const customCard = document.createElement('div');
    customCard.className = 'hotel-card';
    customCard.innerHTML = `
      <div class="hotel-card-header">
        <div class="hotel-title-group">
          <h3>🔗 自分でホテルを指定する</h3>
          <span class="hotel-type">URL貼り付け</span>
        </div>
      </div>
      <div class="hotel-card-body">
        <p style="font-size:0.9rem; color:#666; margin-bottom:12px; line-height:1.5;">
          候補以外のホテルを使いたい場合、ホテル名とURLを入力してください。<br>
          じゃらん・楽天トラベル・公式サイト等のURLを貼り付けられます。
        </p>
        <div style="margin-bottom:10px;">
          <label style="font-weight:bold; font-size:0.9rem; color:#444; display:block; margin-bottom:4px;">ホテル名</label>
          <input type="text" id="custom-hotel-name" placeholder="例：○○ホテル" style="width:100%; padding:10px; border:2px solid #ccc; border-radius:8px; font-size:1rem; box-sizing:border-box;">
        </div>
        <div style="margin-bottom:10px;">
          <label style="font-weight:bold; font-size:0.9rem; color:#444; display:block; margin-bottom:4px;">ホテルのURL（任意）</label>
          <input type="url" id="custom-hotel-url" placeholder="https://..." style="width:100%; padding:10px; border:2px solid #ccc; border-radius:8px; font-size:1rem; box-sizing:border-box;">
        </div>
        <div style="margin-bottom:12px;">
          <label style="font-weight:bold; font-size:0.9rem; color:#444; display:block; margin-bottom:4px;">駅からの所要時間（タクシー、分）</label>
          <input type="number" id="custom-hotel-taxi" placeholder="例：10" min="1" max="120" style="width:120px; padding:10px; border:2px solid #ccc; border-radius:8px; font-size:1rem;">
        </div>
        <button class="btn btn-secondary btn-simulate" id="btn-custom-hotel-select" style="width:100%;">
          このホテルで決定して次へ
        </button>
        <p id="custom-hotel-error" style="color:#e74c3c; font-size:0.85rem; margin-top:8px; display:none;"></p>
      </div>
    `;
    container.appendChild(customCard);

    customCard.querySelector('#btn-custom-hotel-select').addEventListener('click', () => {
      const nameVal = document.getElementById('custom-hotel-name').value.trim();
      const urlVal = document.getElementById('custom-hotel-url').value.trim();
      const taxiVal = parseInt(document.getElementById('custom-hotel-taxi').value) || 0;
      const errEl = document.getElementById('custom-hotel-error');

      if (!nameVal) {
        errEl.textContent = 'ホテル名を入力してください。';
        errEl.style.display = 'block';
        return;
      }
      if (taxiVal < 1) {
        errEl.textContent = '駅からの所要時間を入力してください（1分以上）。';
        errEl.style.display = 'block';
        return;
      }
      errEl.style.display = 'none';

      this.state.selectedHotel = {
        id: 'custom',
        name: nameVal,
        type: 'ユーザー指定',
        features: urlVal ? [`<a href="${urlVal}" target="_blank" rel="noopener" style="color:#2980b9;">ホテル詳細ページ</a>`] : [],
        taxiFromCityStation: taxiVal,
        area: 'ユーザー指定',
        pricePerNight: 0,
        dinnerIncluded: false,
        breakfastIncluded: false,
        customUrl: urlVal || null,
      };
      this.showStep('yahoo-data');
      window.scrollTo(0, 0);
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

  makeTransfer(icon, title, duration, cost, rl = null) {
    return { type: 'transfer', icon, title, duration: duration, cost: cost, reliability: rl };
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

  checkRouteEfficiency(dayArrays, hotel, dest) {
    const warnings = [];
    const dayLabels = ['1日目', '2日目', '3日目'];

    dayArrays.forEach((events, dayIdx) => {
      const locations = [];
      for (const ev of events) {
        if (ev.type === 'transfer') continue;
        const loc = this.inferEventLocation(ev, hotel, dest);
        if (!loc || loc.area === '__unknown__' || loc.taxiFromCityStation == null) continue;
        locations.push({ name: ev.title, area: loc.area, dist: loc.taxiFromCityStation });
      }

      for (let i = 1; i < locations.length - 1; i++) {
        const prev = locations[i - 1];
        const curr = locations[i];
        const next = locations[i + 1];
        if (prev.area === curr.area || curr.area === next.area || prev.area === next.area) continue;

        const prevDist = prev.dist;
        const currDist = curr.dist;
        const nextDist = next.dist;

        const goingOut = currDist > prevDist && currDist > nextDist;
        const goingIn  = currDist < prevDist && currDist < nextDist;
        const backtrack = goingOut || goingIn;

        if (backtrack) {
          const detour = Math.abs(prevDist - currDist) + Math.abs(currDist - nextDist);
          const direct = Math.abs(prevDist - nextDist);
          const wastedMin = detour - direct;

          if (wastedMin >= 15) {
            const direction = goingOut ? '遠い地点を経由してから戻る' : '近い地点を経由してから再び遠くへ';
            warnings.push(
              `【${dayLabels[dayIdx]}】${prev.name} → <strong>${curr.name}</strong> → ${next.name}：${direction}ルートです（推定 +${wastedMin}分の迂回）`
            );
          }
        }
      }
    });
    return warnings;
  },

  // 現地移動はいずれも「駅からの所要分の差」から機械的に導いた値であり、
  // 実際の経路検索の結果ではない。運賃も所要分から距離を逆算した概算なので、
  // すべて ESTIMATED（目安）として扱う
  estimateMovement(fromLoc, toLoc, hotel, dest) {
    const walkRl = reliability(RELIABILITY.ESTIMATED, {
      note: '同一エリア内とみなした概算です',
    });
    const taxiRl = reliability(RELIABILITY.ESTIMATED, {
      note: '駅からの所要時間の差から求めた概算です。運賃は所要分から距離を逆算しています',
    });

    if (fromLoc.area === toLoc.area && fromLoc.area !== '__unknown__' && fromLoc.area !== '__station__') {
      return this.makeTransfer('🚶', '徒歩で移動', '約5分', null, walkRl);
    }
    const fromTaxi = fromLoc.taxiFromCityStation;
    const toTaxi = toLoc.taxiFromCityStation;
    if (fromTaxi != null && toTaxi != null) {
      const diff = Math.abs(fromTaxi - toTaxi);
      const est = Math.max(10, diff + 5);
      return this.makeTransfer('🚕', 'タクシー等で移動', `約${est}分`, `¥${this.estimateTaxiFare(dest.name, est).toLocaleString()}`, taxiRl);
    }
    if (fromTaxi != null || toTaxi != null) {
      const est = fromTaxi != null ? fromTaxi : toTaxi;
      return this.makeTransfer('🚕', 'タクシー等で移動', `約${est}分`, `¥${this.estimateTaxiFare(dest.name, est).toLocaleString()}`, taxiRl);
    }
    return this.makeTransfer('🔄', '移動', '', null, taxiRl);
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

  getDinnerReservationLinks(day1, day2, day3, dest) {
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
               const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest.name + ' ' + name)}`;
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
        if (r && r.tabelogUrl) {
          // If we had a direct tabelogUrl in data, we could use it, but for now we rely on Maps for robustness.
          // event.tabelogUrl = r.tabelogUrl;
        }
      }
    });
  },

  // HTML属性に値を埋めるためのエスケープ（出典文字列に " や < が混ざっても壊れないように）
  escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  },

  // 信頼度バッジ。色だけに頼らず文字（確定／概算／目安）と枠線で区別する（白黒印刷対応）
  renderReliabilityBadge(rl) {
    if (!rl) return '';
    const label = RELIABILITY_LABELS[rl.level];
    if (!label) return '';
    const tip = this.escapeHtml(describeReliability(rl));
    const mark = rl.caveat ? '<span class="rl-caveat-mark" aria-hidden="true">⚠</span>' : '';
    return `<span class="rl-badge ${label.className}" title="${tip}">${label.text}${mark}</span>`;
  },

  // caveat（季節運行・所要の幅など、行程を組み替える判断材料）は本文としても出す。
  // 印刷時は title 属性が読めないため、バッジのツールチップだけに頼らない
  renderReliabilityCaveat(rl) {
    if (!rl || !rl.caveat) return '';
    return `<div class="rl-caveat">※ ${this.escapeHtml(rl.caveat)}</div>`;
  },

  // 交通ルート（generateShinkansenTimeline / generateFlightTimeline の結果）を
  // しおり用に描画する。比較画面と違い、印刷して持ち歩く前提なので
  // バッジと注意書きを必ず一緒に出す
  renderRouteTimeline(route, heading) {
    if (!route || !route.timeline || !route.timeline.length) return '';
    const rows = route.timeline.map(item => {
      if (item.type === 'node') {
        // dayLabel（「（翌日）」等）は出発日からの日またぎを示す。
        // 待ち時間の分数を隠しても後続の時刻自体は翌日にまたがりうるため、
        // 利用者が「今日中に着く」と誤解しないよう時刻の直前に明示する
        const dayLabel = item.dayLabel ? `<span class="route-day-label">${item.dayLabel}</span>` : '';
        return `<div class="route-node">${dayLabel}<span class="route-time">${item.time || ''}</span><span class="route-text">${item.text}</span></div>`;
      }
      return `
        <div class="route-edge">
          <span class="route-edge-text">${item.text}</span>
          ${this.renderReliabilityBadge(item.reliability)}
          ${this.renderReliabilityCaveat(item.reliability)}
        </div>
      `;
    }).join('');

    const h = Math.floor(route.totalMins / 60);
    const m = route.totalMins % 60;
    const durText = h > 0 ? `${h}時間${m > 0 ? m + '分' : ''}` : `${m}分`;

    // 往路を反転して作った行程は、その旨をはっきり書く（利用者が裏取りの必要性を判断できるように）
    // 往路も発車時刻自体はアプリの模擬ダイヤなので、同様に本文へ明記する。
    // 印刷時は title 属性が読めないため、バッジのツールチップだけでは足りない
    const reversedNote = route.isReversedFromOutbound
      ? `<div class="rl-caveat">※ この復路は往路の所要時間を逆順に並べて算出した目安です。乗り換え・搭乗の待ち時間は実際のダイヤで変わります。</div>`
      : route.isAnchoredToArrival
        ? `<div class="rl-caveat">※ 到着時刻は入力された乗換案内の時刻です。出発時刻と途中の待ち時間は、そこからアプリの模擬ダイヤで逆算した目安です。実際の列車はえきねっと等でご確認ください。</div>`
        : `<div class="rl-caveat">※ 発着時刻はアプリの模擬ダイヤによる目安です。実際の列車はえきねっと等でご確認ください。</div>`;

    // フライト区間の所要時間が未検証のとき、この合計もその概算値を含んでいる。
    // しおりは印刷して持ち歩くものなので、合計の近くに本文として明記する
    const unverifiedFlightNote = route.hasUnverifiedFlightLeg
      ? `<div class="rl-caveat">※ ${
          route.flightPair ? `${route.flightPair.from}→${route.flightPair.to}の` : ''
        }直行便の有無・所要時間・便の時刻が未検証のため、上の合計時間は「空港到着の60分後に搭乗できた場合」の最短の目安です。実際の便の時刻によっては待ち時間が加わり、乗り継ぎになる場合は大きく変わります。航空会社の公式時刻表で必ずご確認ください。</div>`
      : '';

    return `
      <div class="route-card">
        <div class="route-card-header">
          <span>${heading}</span>
          <span class="route-card-total">所要 約${durText}</span>
        </div>
        ${unverifiedFlightNote}
        ${reversedNote}
        ${rows}
      </div>
    `;
  },

  // ヤフー乗換案内の実画像が貼られている場合、アプリ生成の概算タイムラインは
  // 同じ内容を重複して縦に並べることになるため、折りたたみ表示にする。
  // 画像が無い場合はこのカードが唯一の行程情報なので、常に開いたまま表示する
  renderRouteFallback(route, heading, hasImage) {
    const cardHtml = this.renderRouteTimeline(route, heading);
    if (!cardHtml) return '';
    if (!hasImage) return cardHtml;
    return `
      <details class="route-fallback">
        <summary>${heading}（アプリ概算・タップで表示）</summary>
        ${cardHtml}
      </details>
    `;
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
              ${this.renderReliabilityBadge(e.reliability)}
              ${this.renderReliabilityCaveat(e.reliability)}
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
    
    // 乗換アプリで調べた実際の到着/出発時刻。ここが未入力のまま行程を組むと
    // 架空の時刻が実データのように印刷されてしまうため、既定値では補わない
    const yahooData = this.validateYahooData();
    if (!yahooData.ok) {
      this.showYahooDataError(yahooData.messages);
      this.showStep('yahoo-data');
      return;
    }
    this.clearYahooDataError();

    const arrInput = yahooData.arrival;
    const depInput = yahooData.departure;

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
    
    // ── 往復の交通ルートを生成する ──
    // しおりに実際の行程として描画し、区間ごとに確定/概算/目安のバッジを出す。
    // 以前は「右の経路図を参照」というプレースホルダのみで、
    // 生成済みのタイムラインはこの画面に一切出ていなかった
    const itineraryStation = this.getSelectedStationName();
    // 往路は模擬ダイヤで組んだあと、入力された到着時刻(arrInput)に終点を合わせる。
    // そうしないと同じしおりの中で1日目のタイムラインと往路カードの到着時刻が食い違う
    const outboundRoute = itineraryStation
      ? (() => {
          const cmp = compareTransportRoutes(
            itineraryStation, dest.name, inputs.departureTime || '10:00', inputs.departureDate || null
          );
          const route = cmp[cmp.recommended] || null;
          return route ? anchorRouteTimelineArrival(route, arrInput) : null;
        })()
      : null;
    // 復路は往路の反転で作る。generateShinkansenTimeline 等は「出発地→目的地」専用で、
    // 引数を入れ替えて呼ぶと分岐に当たらず既定値（255分・新千歳空港など）の
    // でたらめな行程になってしまうため
    const returnRoute = reverseRouteTimeline(outboundRoute, depInput);

    // Prepend home departure based on uploaded images
    day1Events.push({ time: '', title: '自宅・出発地を出発', type: 'transport', icon: '🏠' });
    day1Events.push({
      type: 'transfer',
      title: img1Src ? '行きのルート（右の乗換経路の画像を参照）' : '行きのルート（右の「行きの交通ルート」を参照）',
      icon: '🚄', duration: null,
      reliability: outboundRoute && outboundRoute.reliabilityLevel
        ? reliability(outboundRoute.reliabilityLevel, { note: '区間ごとの確からしさは右の交通ルートをご覧ください' })
        : null,
    });
    
    day1Events.push({ time: this.minToTime(currentMin), title: `${dest.cityStation || dest.station} 到着`, type: 'transport', icon: '🚉' });
    
    currentMin += 15 + (parseInt(hotel.taxiFromCityStation) || 15);
    day1Events.push({ time: this.minToTime(currentMin), title: hotel.name + ' 到着', type: 'hotel', icon: '🏨' });
    
    currentMin += 60; // rest
    const d1Spot = dest.spots[2] || dest.spots[0];
      day1Events.push({ time: this.minToTime(currentMin), title: d1Spot ? d1Spot.name : '周辺を散策', type: 'sightseeing', icon: '🚶' });
    
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
    const stationArrMin = depMin - 30; // arrive 30 mins before departure
    const luggage = this.state.inputs.luggagePattern;
    const d3Spot = dest.spots[3] || dest.spots[1];
    
    let day3Events = [];
    day3Events.push({ time: '08:30', title: hotel.breakfastIncluded ? 'ホテルで朝食' : '周辺で朝食', type: 'food', icon: '🥐' });
    
    if (luggage === 'A') {
      day3Events.push({ time: '09:30', title: 'ホテルをチェックアウト（荷物を預ける）', type: 'hotel', icon: '🏨' });
      const startMin = 600; // 10:00
      const pickupMin = Math.max(585, stationArrMin - 40); // 少なくとも09:45
      const avail = pickupMin - startMin;

      if (avail > 100) {
        day3Events.push({ time: this.minToTime(startMin), title: d3Spot ? d3Spot.name : '宿周辺の観光地を散策', type: 'sightseeing', icon: '🚶' });
        day3Events.push({ time: this.minToTime(startMin + Math.floor(avail / 2)), title: 'お土産購入・市場散策', type: 'sightseeing', icon: '🛍️' });
      } else if (avail > 40) {
        day3Events.push({ time: this.minToTime(startMin), title: '宿周辺でお土産購入・散策', type: 'sightseeing', icon: '🛍️' });
      }
      day3Events.push({ time: this.minToTime(pickupMin), title: 'ホテルに戻り荷物をピックアップ', type: 'hotel', icon: '🧳' });

    } else if (luggage === 'B') {
      day3Events.push({ time: '09:30', title: 'ホテルをチェックアウト', type: 'hotel', icon: '🏨' });
      const lockerMin = Math.min(600, stationArrMin - 30); // 10:00 or earlier
      day3Events.push({ time: this.minToTime(lockerMin), title: `${dest.cityStation || dest.station}のコインロッカーに荷物を預ける`, type: 'transport', icon: '🛅' });
      
      const pickupMin = Math.max(lockerMin + 15, stationArrMin - 15);
      const avail = pickupMin - (lockerMin + 30);

      if (avail > 100) {
        day3Events.push({ time: this.minToTime(lockerMin + 30), title: d3Spot ? d3Spot.name : '駅周辺の観光地を散策', type: 'sightseeing', icon: '📸' });
        day3Events.push({ time: this.minToTime(lockerMin + 30 + Math.floor(avail / 2)), title: '駅周辺でお土産購入', type: 'sightseeing', icon: '🛍️' });
      } else if (avail > 40) {
        day3Events.push({ time: this.minToTime(lockerMin + 30), title: '駅周辺でお土産購入・散策', type: 'sightseeing', icon: '🛍️' });
      }
      day3Events.push({ time: this.minToTime(pickupMin), title: 'コインロッカーから荷物をピックアップ', type: 'transport', icon: '🧳' });

    } else {
      day3Events.push({ time: '09:30', title: 'ホテルをチェックアウト（荷物は持ち歩き）', type: 'hotel', icon: '🏨' });
      const startMin = 600; // 10:00
      const avail = stationArrMin - startMin - 30;

      if (avail > 100) {
        day3Events.push({ time: this.minToTime(startMin), title: '身軽に立ち寄れるスポット（カフェや展望台など）', type: 'sightseeing', icon: '☕' });
        day3Events.push({ time: this.minToTime(startMin + Math.floor(avail / 2)), title: '駅・空港周辺でお土産購入', type: 'sightseeing', icon: '🛍️' });
      } else if (avail > 40) {
        day3Events.push({ time: this.minToTime(startMin), title: '駅・空港周辺でお土産購入・散策', type: 'sightseeing', icon: '🛍️' });
      }
    }

    day3Events.push({ time: this.minToTime(stationArrMin), title: `${dest.cityStation || dest.station} 到着（出発の準備）`, type: 'transport', icon: '🚉' });
    day3Events.push({ time: this.minToTime(depMin), title: `${dest.cityStation || dest.station} 出発`, type: 'transport', icon: '🚄' });
    
    day3Events.push({
      type: 'transfer',
      title: img3Src ? '帰りのルート（右の乗換経路の画像を参照）' : '帰りのルート（右の「帰りの交通ルート」を参照）',
      icon: '🚄', duration: null,
      reliability: returnRoute && returnRoute.reliabilityLevel
        ? reliability(returnRoute.reliabilityLevel, { note: '区間ごとの確からしさは右の交通ルートをご覧ください' })
        : null,
    });
    day3Events.push({ time: '', title: '自宅・出発地に帰着', type: 'transport', icon: '🏠' });

    day1Events = this.fillMovementGaps(day1Events, hotel, dest);
    day2Events = this.fillMovementGaps(day2Events, hotel, dest);
    day3Events = this.fillMovementGaps(day3Events, hotel, dest);

    this.enrichEventsWithLinks(day1Events, hotel, dest);
    this.enrichEventsWithLinks(day2Events, hotel, dest);
    this.enrichEventsWithLinks(day3Events, hotel, dest);

    const routeWarnings = this.checkRouteEfficiency(
      [day1Events, day2Events, day3Events], hotel, dest
    );

    // Render logic
    const ticketSection = `
        <div class="no-print" style="width:100%; background:white; padding: 20px; border-radius:12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 30px;">
          <h3 style="margin-top:0; border-bottom:2px solid #eee; padding-bottom:10px; color:var(--color-primary);">🎫 新幹線チケット（きっぷ）の購入</h3>
          <p style="font-size:0.95rem; color:#666; margin-bottom:15px;">※印刷には表示されません</p>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <a href="https://www.eki-net.com/personal/top/index" target="_blank" class="btn btn-primary" style="text-decoration: none; padding: 10px 20px; font-weight: bold;">えきねっと（JR東日本・北海道）で購入する</a>
            <a href="https://smart-ex.jp/" target="_blank" class="btn btn-primary" style="text-decoration: none; padding: 10px 20px; font-weight: bold; background-color: #f39c12; border-color: #e67e22;">スマートEX（東海道・山陽）で購入する</a>
          </div>
          ${this.buildTicketGuideButtons(outboundRoute, returnRoute)}
        </div>
    `;

    const reservationHtml = this.getDinnerReservationLinks(day1Events, day2Events, day3Events, dest);
    const reservationSection = reservationHtml ? `
        <div style="width:100%; background:white; padding: 20px; border-radius:12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 30px;">
          <h3 style="margin-top:0; border-bottom:2px solid #eee; padding-bottom:10px; color:#d35400;">📞 予約・確認が必要なレストラン</h3>
          ${reservationHtml}
        </div>
    ` : '';
    
    
    const costs = this.calculateTotalCost(hotel, day1Events, day2Events, day3Events);
    const costHtml = `
      <div class="cost-summary-card" style="background:white; padding: 20px; border-radius:12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 30px;">
        <h3 style="margin-top:0; border-bottom:2px solid #eee; padding-bottom:10px; color:#27ae60;">💰 2名様 旅行代金（概算）</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 1.1rem;">
          <tr style="border-bottom: 1px dashed #ccc;">
             <td style="padding: 10px 0;">🚅 新幹線・交通費 (東京方面目安)${this.renderReliabilityBadge(reliability(RELIABILITY.ESTIMATED, { note: '東京-函館間を想定した固定値です。出発地・目的地による差は反映していません' }))}</td>
             <td style="text-align: right; padding: 10px 0;">¥${costs.shinkansen.toLocaleString()}</td>
          </tr>
          <tr style="border-bottom: 1px dashed #ccc;">
             <td style="padding: 10px 0;">🏨 宿泊代 (${hotel.name} / 2泊)${this.renderReliabilityBadge(reliability(RELIABILITY.RESEARCHED, { note: '宿泊プランの公表料金に基づく目安です。時期により変動します' }))}</td>
             <td style="text-align: right; padding: 10px 0;">¥${costs.accommodation.toLocaleString()}</td>
          </tr>
          <tr style="border-bottom: 1px dashed #ccc;">
             <td style="padding: 10px 0;">🚕 現地タクシー代 (2泊3日分)${this.renderReliabilityBadge(reliability(RELIABILITY.ESTIMATED, { note: '所要分から距離を逆算し、公示運賃を当てはめた概算です' }))}</td>
             <td style="text-align: right; padding: 10px 0;">¥${costs.taxi.toLocaleString()}</td>
          </tr>
          <tr style="border-bottom: 2px solid #333;">
             <td style="padding: 10px 0;">🍽️ 飲食代 (昼食・夕食目安)${this.renderReliabilityBadge(reliability(RELIABILITY.ESTIMATED, { note: '各店の予算帯から求めた概算です' }))}</td>
             <td style="text-align: right; padding: 10px 0;">¥${costs.food.toLocaleString()}</td>
          </tr>
          <tr style="font-weight: bold; font-size: 1.3rem; color: #d35400;">
             <td style="padding: 15px 0;">合計</td>
             <td style="text-align: right; padding: 15px 0;">¥${costs.total.toLocaleString()}</td>
          </tr>
        </table>
        <p style="font-size: 0.85em; color: #666; margin-top: 10px;">※新幹線・交通費は東京-函館間を想定した概算値（固定¥60,000）です。飛行機利用エリア（稚内・知床・根室等）では実際の航空券代を反映していないため、実際の運賃は別途ご確認ください。タクシー代と飲食代はスケジュールに基づく概算です。</p>
      </div>
    `;

    const container = document.getElementById('confirmed-content');
    
    container.innerHTML = `
      <div class="print-page-1" style="margin-bottom: 30px;">
        <div class="itinerary-header" style="text-align:center; padding: 20px; background:var(--color-bg-sub); border-radius:12px; margin-bottom: 20px;">
          <h1 style="color:var(--color-primary); font-size: 1.8rem; margin:0;">${dest.name}滞在 特化型しおり</h1>
          <p style="color:#555; margin-top:5px;">ご宿泊：<strong>${hotel.customUrl ? `<a href="${hotel.customUrl}" target="_blank" rel="noopener" style="color:var(--color-primary);">${hotel.name}</a>` : hotel.name}</strong></p>
        </div>

        <div class="spots-gourmet-card" style="background:white; padding: 25px; border-radius:12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 30px;">
    <h3 style="margin-top:0; border-bottom:2px solid #eee; padding-bottom:10px; color: var(--color-primary);">🌟 ${dest.name} 厳選スポット＆グルメ</h3>
    <p style="font-size: 0.95rem; color: #666; margin-bottom: 20px; line-height: 1.5;">滞在型の旅行だからこそじっくり楽しめる、${dest.name}の魅力を凝縮した全リストです。行程の空き時間にぜひ訪れてみてください。</p>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
      <div>
        <h4 style="margin: 0 0 10px 0; font-size: 1.05rem; color: #444; border-left: 4px solid #2980b9; padding-left: 10px;">📸 必見の観光スポット</h4>
        <ul style="margin: 0; padding-left: 20px; line-height: 1.8; font-size: 0.95rem;">
          ${dest.spots.map(s => {
            const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest.name + ' ' + s.name)}`;
            return `<li><a href="${url}" target="_blank" style="color: #2980b9; text-decoration: none; font-weight: bold;">${s.name}</a> <span style="font-size:0.85em; color:#666;">(滞在目安: ${s.duration}分)</span></li>`;
          }).join('')}
        </ul>
      </div>
      <div>
        <h4 style="margin: 0 0 10px 0; font-size: 1.05rem; color: #444; border-left: 4px solid #e67e22; padding-left: 10px;">🍽️ おすすめ絶品グルメ</h4>
        <ul style="margin: 0; padding-left: 20px; line-height: 1.8; font-size: 0.95rem;">
          ${[
            ...(dest.restaurants?.dinner || []),
            ...(dest.restaurants?.lunch || []),
            ...(dest.restaurants?.snack || [])
          ].map(r => {
            const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest.name + ' ' + r.name)}`;
            return `<li><a href="${url}" target="_blank" style="color: #e67e22; text-decoration: none; font-weight: bold;">${r.name}</a> <span style="font-size:0.85em; color:#666;">(${r.genre} / ${r.budget}円)</span></li>`;
          }).join('')}
        </ul>
      </div>
    </div>
  </div>

        ${ticketSection}
        ${reservationSection}
        <h3 class="section-title">🕒 ${dest.name} 2泊3日 滞在スケジュール</h3>

        <h4 style="color:var(--color-primary); border-bottom: 2px dashed #ccc; padding-bottom: 5px;">【1日目】 ${dest.name}へ到着</h4>
        <div class="day-section day-section-split" style="margin-bottom: 20px; padding: 15px; background:white; border-radius:12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <div class="day-section-timeline-col">
            ${this.renderTimeline(day1Events)}
          </div>
          <div class="route-column">
            ${this.renderRouteFallback(outboundRoute, '🚄 行きの交通ルート', !!img1Src)}
            ${img1Src ? `<div style="background:#f9f9f9; padding: 10px; border-radius: 8px; border: 1px solid #eee; break-inside: avoid; page-break-inside: avoid;"><h5 style="margin:0 0 10px 0; text-align:center; color:#555;">🚄 行きの乗換経路（実際の検索結果）</h5><img src="${img1Src}" style="width: 100%; display: block; border-radius: 4px; border: 1px solid #ddd;"></div>` : ''}
          </div>
        </div>

        <h4 style="color:var(--color-primary); border-bottom: 2px dashed #ccc; padding-bottom: 5px;">【2日目】 終日フリー・観光</h4>
        <div class="day-section" style="margin-bottom: 20px; padding: 15px; background:white; border-radius:12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          ${this.renderTimeline(day2Events)}
        </div>

        <h4 style="color:var(--color-primary); border-bottom: 2px dashed #ccc; padding-bottom: 5px;">【3日目】 ${dest.name}を出発</h4>
        <div class="day-section day-section-split" style="margin-bottom: 20px; padding: 15px; background:white; border-radius:12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <div class="day-section-timeline-col">
            ${this.renderTimeline(day3Events)}
          </div>
          <div class="route-column">
            ${this.renderRouteFallback(returnRoute, '🚄 帰りの交通ルート', !!img3Src)}
            ${img3Src ? `<div style="background:#f9f9f9; padding: 10px; border-radius: 8px; border: 1px solid #eee; break-inside: avoid; page-break-inside: avoid;"><h5 style="margin:0 0 10px 0; text-align:center; color:#555;">🚄 帰りの乗換経路（実際の検索結果）</h5><img src="${img3Src}" style="width: 100%; display: block; border-radius: 4px; border: 1px solid #ddd;"></div>` : ''}
          </div>
        </div>
      <div class="checklist-card" style="background:white; padding: 20px; border-radius:12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 30px; break-inside: avoid; page-break-inside: avoid;">
          <h3 style="margin-top:0; border-bottom:2px solid #eee; padding-bottom:10px;">🎒 持ち物チェックリスト</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 20px;">
            <ul style="list-style:none; padding:0; margin:0; font-size:1rem; line-height:2; flex:1; min-width:250px;">
              <li><label style="cursor:pointer;"><input type="checkbox" style="transform: scale(1.2); margin-right: 8px;"> 着替え（2泊3日分）</label></li>
              <li><label style="cursor:pointer;"><input type="checkbox" style="transform: scale(1.2); margin-right: 8px;"> スマホ充電器・モバイルバッテリー</label></li>
              <li><label style="cursor:pointer;"><input type="checkbox" style="transform: scale(1.2); margin-right: 8px;"> 常備薬・洗面用具</label></li>
            </ul>
            <ul style="list-style:none; padding:0; margin:0; font-size:1rem; line-height:2; flex:1; min-width:250px;">
              <li><label style="cursor:pointer;"><input type="checkbox" style="transform: scale(1.2); margin-right: 8px;"> 健康保険証・身分証</label></li>
              <li><label style="cursor:pointer;"><input type="checkbox" style="transform: scale(1.2); margin-right: 8px;"> 現金・クレジットカード</label></li>
              <li><label style="cursor:pointer;"><input type="checkbox" style="transform: scale(1.2); margin-right: 8px;"> 航空券・新幹線チケット等</label></li>
            </ul>
          </div>
        </div>
      </div>
      ${costHtml}
      ${routeWarnings.length > 0 ? `
        <div class="no-print" style="background:#fff3cd; border:2px solid #ffc107; padding:20px; border-radius:12px; margin-bottom:30px;">
          <h3 style="margin-top:0; color:#856404;">⚠️ 経路効率チェック</h3>
          <p style="font-size:0.9rem; color:#856404; margin-bottom:10px;">以下の区間で非効率な移動（行ったり来たり）が検出されました：</p>
          <ul style="margin:0; padding-left:20px; color:#856404; font-size:0.95rem; line-height:1.8;">
            ${routeWarnings.map(w => `<li>${w}</li>`).join('')}
          </ul>
          <p style="font-size:0.85rem; color:#997a00; margin-top:10px; margin-bottom:0;">見学地の順序を並べ替えると、移動時間とタクシー代を節約できるかもしれません。</p>
        </div>
      ` : ''}
    `;

    this.updatePrintScreenshotsLayout();
    this.bindTicketGuideButtons();
    this.showStep('confirmed');
    window.scrollTo(0,0);
  },

  // ============================================================
  // シニア旅行者向け：改札での切符の出し方ガイド
  // ============================================================
  // 案内の文章（改札の仕組みの一般論）は固定で、駅名・列車名だけを
  // buildTicketGuide()（js/data.js）が返す構造データから差し替える。
  // 新幹線区間を含まない行程（飛行機ルート等）は guide が null になり、
  // ボタン自体を出さない

  // 「はやぶさ特急券」のような券名を作る。列車名が総称（'新幹線'）のときは
  // 実在しない券名になってしまうため、単に「特急券」と呼ぶ
  ticketName(train) {
    if (!train) return '特急券';
    return train.generic ? '特急券' : `${train.name}特急券`;
  },

  // 文中で列車そのものを指すときの呼び方
  ticketTrainLabel(train) {
    if (!train) return '新幹線';
    return train.generic ? '新幹線' : train.name;
  },

  // 段落の最後のひとまとまり（最後の句読点より後ろ）を inline-block でくくり、
  // その中で改行が起きないようにする。これをしないと最終行が「です。」のように
  // 数文字だけ残る「孤立行」になる（CLAUDE.md の日本語テキストのレイアウト規則）。
  // 余白や字間の調整だけでは 360px 幅で消しきれなかったため、この手当てを併用する
  tgNoOrphanTail(text) {
    if (typeof text !== 'string' || text.length < 10) return text;
    // エスケープ済みの文字参照やタグを途中で割らないよう、含む場合は何もしない
    if (/[<>&]/.test(text)) return text;
    // Intl.Segmenter が無いブラウザでは元の文字列のまま返す（崩れはしない）
    if (typeof Intl === 'undefined' || !Intl.Segmenter) return text;

    const segmenter = new Intl.Segmenter('ja', { granularity: 'word' });
    const raw = [];
    for (const { segment } of segmenter.segment(text)) raw.push(segment);
    if (raw.length < 2) return text;

    // 語の単位をそのまま使うと「乗車券」が「乗車」＋「券」、「持っている」が
    // 「持」＋「っている」のように分かれ、熟語や活用の途中で改行されてしまう。
    // 前の語にくっつけてよいものをまとめ、文節に近いかたまりに直す。
    // 長くしすぎると狭い画面で行が大きく余るので9文字までにする
    const MAX = 9;
    const units = [];
    for (const seg of raw) {
      const prev = units.length ? units[units.length - 1] : null;
      // 句読点・閉じ括弧・小書きかな・長音・繰り返し記号は行頭に来てはいけないので、
      // 長さの上限にかかわらず必ず前にくっつける
      // 続いたひらがなを途中で切ると「ください」が「くだ／さい」のように割れてしまう。
      // 語の区切りは Intl.Segmenter がひらがなの中にも入れてくるので、
      // ひらがなが続く限りは長さの上限にかかわらずつなげる
      const hiraganaRun = prev && /[ぁ-ん]$/.test(prev) && /^[ぁ-ん]/.test(seg);
      const mustJoin = prev && (
        /^[、。，．！？」』）】〕・：；ーゝ々ぁぃぅぇぉっゃゅょァィゥェォッャュョ]/.test(seg) || hiraganaRun
      );
      const joinable = mustJoin || (prev && prev.length + seg.length <= MAX && (
        // 助詞・送りがななど短いひらがなは前の語にくっつけて文節にする
        (/^[ぁ-ん]+$/.test(seg) && seg.length <= 3)
        // 続く漢字・カタカナは熟語としてまとめる
        || (/[一-龥]$/.test(prev) && /^[一-龥]+$/.test(seg))
        || (/[ァ-ヶー]$/.test(prev) && /^[ァ-ヶー]+$/.test(seg))
        // 開き括弧・数字は後ろの語と一緒にする
        || /[「『（【〔]$/.test(prev)
        || /^[0-9０-９]+$/.test(prev)
        // 「受け」＋「取って」「落ち」＋「着いて」のような複合動詞。
        // 漢字1文字＋送りがなで終わっているかたまりの直後に漢字が続く場合はつなげる
        || (/^[一-龥][ぁ-ん]{1,2}$/.test(prev) && /^[一-龥]/.test(seg))
      ));
      if (joinable) {
        units[units.length - 1] = prev + seg;
        continue;
      }
      units.push(seg);
    }
    if (units.length < 2) return text;

    // 最終行が数文字だけ残る「孤立行」を防ぐため、末尾のかたまりを
    // 4文字以上にまとめる。長くしすぎると行が大きく余るので12文字まで
    while (units.length > 1 && units[units.length - 1].length < 4) {
      const last = units.pop();
      if (units[units.length - 1].length + last.length > 12) { units.push(last); break; }
      units[units.length - 1] += last;
    }

    return units.map(u => `<span class="tg-w">${u}</span>`).join('');
  },

  // 案内1件分（駅名・入れる切符・結果）のカード。
  // 折り返しまわりの指定は css/style.css の .tg-* にまとめてある
  // （インラインの style だと、スマホ幅だけ余白を詰める調整ができないため）
  renderTicketGuideStep(title, insert, result) {
    return `
      <div class="tg-step">
        <p class="tg-step-title">${this.tgNoOrphanTail(title)}</p>
        <p><strong>入れる切符：</strong>${this.tgNoOrphanTail(insert)}</p>
        <p><strong>結果：</strong>${this.tgNoOrphanTail(result)}</p>
      </div>
    `;
  },

  // 解説セクション（見出し＋本文）
  renderTicketGuideSection(heading, body) {
    return `
      <div class="tg-section">
        <h4>${this.tgNoOrphanTail(heading)}</h4>
        <p>${this.tgNoOrphanTail(body)}</p>
      </div>
    `;
  },

  // 切符の出し方ガイド本体を組み立てる
  renderTicketGuide(guide, direction) {
    if (!guide || !guide.trains || !guide.trains.length) return '';
    const e = (s) => this.escapeHtml(s);
    const trains = guide.trains;
    const firstTrain = trains[0];
    const lastTrain = trains[trains.length - 1];
    const entry = e(guide.entryStation);
    const exit = e(guide.exitStation);

    // 新幹線に乗る前の区間。在来線（普通・快速）だけなら乗車券1枚で通れるが、
    // 在来特急が含まれる場合は特急券がもう1枚必要になるため案内を分ける
    const hasBefore = guide.beforeLegs.length > 0;
    const beforeHasExpress = guide.beforeLegs.some(l => l.kind === 'limitedExpress');
    // 新幹線を降りたあとにさらに在来線区間が続くか（札幌・旭川方面など）
    const hasAfter = guide.afterLegs.length > 0;
    const finalPlace = hasAfter ? e(guide.afterLegs[guide.afterLegs.length - 1].to) : exit;

    // ── 改札での出し方（順番） ──
    let steps = '';

    if (hasBefore && !beforeHasExpress) {
      steps += this.renderTicketGuideStep(
        `最初の在来線駅（乗る時）：${e(guide.startStation)}`,
        '「乗車券」のみ（1枚）',
        '切符が出てくるので受け取ります。'
      );
      steps += this.renderTicketGuideStep(
        `${entry}（新幹線への乗換口）`,
        `「乗車券」＋「${e(this.ticketName(firstTrain))}」（2枚重ねて）`,
        '2枚とも出てくるので必ず両方受け取ります。'
      );
    } else if (hasBefore && beforeHasExpress) {
      steps += this.renderTicketGuideStep(
        `最初の駅（乗る時）：${e(guide.startStation)}`,
        '「乗車券」＋この区間の「特急券」',
        `${entry}までは在来線の特急に乗るため、この区間にも特急券が必要です。改札の通り方は駅によって異なりますので、切符をまとめて駅員さんに見せるのが確実です。`
      );
      steps += this.renderTicketGuideStep(
        `${entry}（新幹線への乗換口）`,
        `「乗車券」＋「${e(this.ticketName(firstTrain))}」（2枚重ねて）`,
        '2枚とも出てくるので必ず両方受け取ります。'
      );
    } else {
      steps += this.renderTicketGuideStep(
        `${entry}（乗る時）`,
        `「乗車券」＋「${e(this.ticketName(firstTrain))}」（2枚重ねて）`,
        '2枚とも出てくるので必ず両方受け取ります。'
      );
    }

    guide.transfers.forEach(tr => {
      const fromLabel = e(tr.fromTrainGeneric ? '新幹線' : tr.fromTrain);
      const toLabel = e(tr.toTrainGeneric ? '新幹線' : tr.toTrain);
      steps += this.renderTicketGuideStep(
        `${e(tr.station)}（${fromLabel} → ${toLabel}乗換）`,
        'なし（改札は通りません）',
        '改札を出ずに新幹線ホーム同士を歩いて移動します。'
      );
    });

    if (hasAfter) {
      steps += this.renderTicketGuideStep(
        `${exit}（新幹線を降りる時）`,
        `「乗車券」＋「${e(this.ticketName(lastTrain))}」`,
        `ここから先は在来線に乗り換えます。改札機から戻ってきた切符は必ず受け取ってください。乗り換え改札の場所は駅によって異なりますので、駅員さんに切符をまとめて見せると確実です。`
      );
    } else {
      steps += this.renderTicketGuideStep(
        `${exit}（降りる時）`,
        `「乗車券」＋「${e(this.ticketName(lastTrain))}」（2枚重ねて）`,
        '切符は改札機に回収され、そのまま外に出られます。'
      );
    }

    // ── 改札と切符の解説 ──
    let sections = '';

    // 在来線（普通・快速）から乗り継ぐ場合だけ「乗車券だけで改札を通る」が成り立つ。
    // 在来特急から乗り継ぐ場合は手前の区間にも特急券が要るので、この説明は使えない
    const roleBody = (hasBefore && !beforeHasExpress)
      ? `乗車券は「出発駅から目的地まで移動するための運賃」の切符で、旅の最初から最後まで通して使います。特急券は「新幹線という特別な速い列車に乗るための料金」の切符です。そのため、在来線の駅では乗車券だけで改札を通り、新幹線のエリアに入る${entry}で初めて特急券が必要になります。`
      : `乗車券は「出発駅から目的地まで移動するための運賃」の切符で、旅の最初から最後まで通して使います。特急券は「新幹線という特別な速い列車に乗るための料金」の切符です。そのため、${entry}の新幹線改札では、この2種類を一緒に入れることになります。`;
    sections += this.renderTicketGuideSection('「乗車券」と「特急券」の役割の違い', roleBody);

    const firstDropOff = guide.transfers.length ? e(guide.transfers[0].station) : exit;
    sections += this.renderTicketGuideSection(
      `${entry}で「${e(this.ticketName(firstTrain))}」を通す理由`,
      `${entry}の新幹線改札機に「乗車券」と「${e(this.ticketName(firstTrain))}」を一緒に入れることで、「ここから${firstDropOff}行きの新幹線に乗車した」という記録が切符に付きます。改札機を通過する際、切符には小さな穴が開いて機械から戻ってきますので、取り忘れないようご注意ください。`
    );

    guide.transfers.forEach(tr => {
      const fromLabel = e(tr.fromTrainGeneric ? '新幹線' : tr.fromTrain);
      const toLabel = e(tr.toTrainGeneric ? '新幹線' : tr.toTrain);
      const st = e(tr.station);
      const fromTicket = e(tr.fromTrainGeneric ? '特急券' : `${tr.fromTrain}特急券`);
      sections += this.renderTicketGuideSection(
        `${st}で改札を通らない理由`,
        `${st}での「${fromLabel}」から「${toLabel}」への乗り換えは、新幹線の改札の内側（新幹線エリア内）で行われます。改札の外に出るわけではないため、切符を機械に通すタイミングはありません。ホームにある階段やエスカレーターを使って、案内板に表示された「${toLabel}」の発車番線ホームへ直接移動してください。${st}で役目を終えた「${fromTicket}」は、ポケットやカバンにしまっておいて大丈夫です。`
      );
    });

    if (hasAfter) {
      // 新函館北斗から先のように在来線特急へ乗り継ぐ行程。
      // 乗換改札の構造は駅ごとに異なり、一次資料で確認できていないため
      // 「切符が回収される」等の断定はせず、駅員さんへの確認を促す
      sections += this.renderTicketGuideSection(
        `${exit}から先の乗り換えについて`,
        `${exit}から${finalPlace}までは、新幹線ではなく在来線の特急に乗り換えます。この区間には別の特急券が必要になるため、きっぷの枚数はここまでの案内より増えます。乗り換え改札の場所や切符の入れ方は駅によって異なりますので、${exit}に着いたら駅員さんにきっぷをまとめて見せて確認するのが確実です。`
      );
    } else {
      sections += this.renderTicketGuideSection(
        `${exit}で切符が回収される理由`,
        `${exit}に到着して新幹線の改札機に「乗車券」と「${e(this.ticketName(lastTrain))}」を入れると、目的地までの移動がすべて完了したと改札機が認識します。そのため切符は戻ってこず、そのまま回収されて扉が開きます。`
      );
    }

    // 迷った時の安心策。枚数は「乗車券1枚＋新幹線の特急券」で数える。
    // 券名に「・」を含む列車（やまびこ・なすの等）があると区切りが読み取れなくなるので、
    // そのときだけ区切り記号を「／」に変える
    const ticketNames = ['乗車券', ...trains.map(t => this.ticketName(t))];
    const separator = ticketNames.some(n => n.includes('・')) ? '／' : '・';
    const ticketList = ticketNames.map(n => e(n)).join(separator);
    const ticketCount = ticketNames.length;
    // 在来線特急が前後に付く行程では、実際に持っている枚数がこれより増える。
    // 「◯枚重ねて入れれば大丈夫」と言い切ると枚数が合わず不安にさせるため、
    // 新幹線の改札で入れる分だけを案内する
    const extraExpress = hasAfter || beforeHasExpress;
    const expressOnlyList = trains.map(t => e(this.ticketName(t))).join(separator);
    const reliefBody = extraExpress
      ? `新幹線の改札の前で「どれを入れればいいか」と迷った場合は、「乗車券」と新幹線の特急券（${expressOnlyList}）を重ねて自動改札機に入れれば、機械が正しく判別してくれます。在来線の特急に乗る区間には別の特急券があるため、手元の枚数はこれより多くなります。一番確実で落ち着いて通れる方法は、改札口の端にある駅員さんのいる有人窓口へ行き、切符をまとめて見せることです。`
      : `改札の前で「どれを入れればいいか」と迷った場合は、持っている${ticketCount}枚（${ticketList}）をそのまま${ticketCount}枚重ねて自動改札機に入れてしまっても機械が正しく判別してくれます。また、一番確実で落ち着いて通れる方法は、改札口の端にある駅員さんのいる有人窓口へ行き、切符をまとめて見せることです。`;
    sections += this.renderTicketGuideSection('迷った時の安心策', reliefBody);

    const dirLabel = direction === 'return' ? '帰り' : '行き';
    return `
      <p class="tg-lead">${this.tgNoOrphanTail(`${e(dirLabel)}の行程（${e(guide.startStation)} → ${e(finalPlace)}）にあわせた案内です。券名は実際のきっぷの表記と異なる場合があります。`)}</p>
      <h3 class="tg-heading">${this.tgNoOrphanTail(hasBefore ? '在来線から新幹線の切符の出し方' : '新幹線の切符の出し方')}</h3>
      ${steps}
      <h3 class="tg-heading tg-heading-sections">${this.tgNoOrphanTail('改札と切符の解説')}</h3>
      ${sections}
    `;
  },

  // しおり内の切符ガイドボタン（行き・帰り）を組み立てる。
  // 生成済みの HTML は state に持たせ、ボタンを押した時にモーダルへ差し込む
  buildTicketGuideButtons(outboundRoute, returnRoute) {
    const outGuide = outboundRoute ? buildTicketGuide(outboundRoute) : null;
    const retGuide = returnRoute ? buildTicketGuide(returnRoute) : null;

    this.ticketGuideHtml = {
      outbound: outGuide ? this.renderTicketGuide(outGuide, 'outbound') : '',
      return: retGuide ? this.renderTicketGuide(retGuide, 'return') : '',
    };

    // 新幹線を使わない行程（飛行機ルート等）では、案内できる改札が無いのでボタンを出さない
    if (!this.ticketGuideHtml.outbound && !this.ticketGuideHtml.return) return '';

    const btn = (dir, label) => `
      <button type="button" class="btn" data-ticket-guide="${dir}"
        style="padding:10px 20px; font-weight:bold; background:#fff; color:var(--color-primary); border:2px solid var(--color-primary);">
        ${label}
      </button>
    `;

    return `
      <div style="margin-top:18px; border-top:1px dashed #ddd; padding-top:16px;">
        <h4 style="margin:0 0 6px 0; font-size:1.02rem; color:#444; line-break:strict; text-wrap:balance;">👓 はじめての方へ：改札での切符の出し方</h4>
        <p style="margin:0 0 12px 0; font-size:0.92rem; color:#666; line-height:1.7; line-break:strict; text-wrap:pretty;">どの改札で、どの切符を何枚入れるのかを、今回の行程にあわせてご案内します。</p>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          ${this.ticketGuideHtml.outbound ? btn('outbound', '🚄 行きの切符の出し方を見る') : ''}
          ${this.ticketGuideHtml.return ? btn('return', '🚄 帰りの切符の出し方を見る') : ''}
        </div>
      </div>
    `;
  },

  // しおりを描画し直すたびにボタンは作り直されるので、そのつど貼り直す
  bindTicketGuideButtons() {
    const modal = document.getElementById('ticket-guide-modal');
    const body = document.getElementById('ticket-guide-body');
    const title = document.getElementById('ticket-guide-title');
    if (!modal || !body) return;

    document.querySelectorAll('[data-ticket-guide]').forEach(btn => {
      btn.addEventListener('click', () => {
        const dir = btn.getAttribute('data-ticket-guide');
        const html = (this.ticketGuideHtml && this.ticketGuideHtml[dir]) || '';
        if (!html) return;
        body.innerHTML = html;
        if (title) title.textContent = dir === 'return' ? '🎫 帰りの切符の出し方' : '🎫 行きの切符の出し方';
        body.scrollTop = 0;
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
      });
    });
  },

  bindTicketGuideModalEvents() {
    const modal = document.getElementById('ticket-guide-modal');
    const btnClose = document.getElementById('ticket-guide-modal-close');
    const backdrop = document.getElementById('ticket-guide-modal-backdrop');
    if (!modal) return;

    const closeModal = () => {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    };
    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);
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


  bindDirectPdfButton() {
    const btnPdf = document.getElementById('btn-direct-pdf');
    if (!btnPdf) return;
    
    btnPdf.addEventListener('click', async () => {
      const overlay = document.getElementById('pdf-loading-overlay');
      if (overlay) overlay.style.display = 'flex';
      
      // wait a bit for the overlay to render
      await new Promise(resolve => setTimeout(resolve, 50));
      
      try {
        const element = document.getElementById('step-confirmed');
        const opt = {
          margin:       [10, 10, 10, 10], // top, left, bottom, right in mm
          filename:     'こはる_旅のしおり.pdf',
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { 
            scale: 2, 
            useCORS: true,
            ignoreElements: (el) => {
              // Ignore elements with 'no-print' class
              if (el.classList && el.classList.contains('no-print')) {
                return true;
              }
              return false;
            }
          },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        await html2pdf().set(opt).from(element).save();
      } catch (error) {
        console.error("PDF生成中にエラーが発生しました:", error);
        alert("PDFの作成に失敗しました。");
      } finally {
        if (overlay) overlay.style.display = 'none';
      }
    });
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


  