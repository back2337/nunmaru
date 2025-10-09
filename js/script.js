document.addEventListener('DOMContentLoaded', () => {
    
    const API_KEY = "WUjoGM8jQl2I6BjPI7JdYw";
    const originalUrl = "https://apihub.kma.go.kr/api/typ02/openApi/VilageFcstInfoService_2.0/getVilageFcst";
    const proxyUrl = "https://corsproxy.io/?";
    let originalForecastItems = [];
    let displayedDateStr = '';
    let isTestModeActive = false;

    const testScenarios = { '111': [ { offset: -2, tmp: '10', pty: '0', sky: '1', sno: '0', wsd: '2.0'}, { offset: 0, tmp: '12', pty: '0', sky: '1', sno: '0', wsd: '2.5'}, { offset: 2, tmp: '15', pty: '0', sky: '1', sno: '0', wsd: '3.0'}, { offset: 4, tmp: '13', pty: '0', sky: '1', sno: '0', wsd: '2.0'} ], '222': [ { offset: -2, tmp: '8', pty: '1', sky: '4', sno: '0', wsd: '4.0'}, { offset: 0, tmp: '7', pty: '1', sky: '4', sno: '0', wsd: '5.0'}, { offset: 2, tmp: '6', pty: '1', sky: '4', sno: '0', wsd: '6.0'}, { offset: 4, tmp: '6', pty: '0', sky: '4', sno: '0', wsd: '4.0'} ], '333': [ { offset: 0, tmp: '-1', pty: '3', sky: '4', sno: '0.3', wsd: '3.0'}, { offset: 1, tmp: '-2', pty: '3', sky: '4', sno: '0.8', wsd: '3.5'}, { offset: 2, tmp: '-2', pty: '3', sky: '4', sno: '1.0', wsd: '4.0'}, { offset: 3, tmp: '-3', pty: '3', sky: '4', sno: '0.7', wsd: '4.0'}, { offset: 4, tmp: '-3', pty: '0', sky: '3', sno: '0', wsd: '3.0'} ], '444': [ { offset: 0, tmp: '-2', pty: '3', sky: '4', sno: '0.5', wsd: '5.0'}, { offset: 1, tmp: '-3', pty: '3', sky: '4', sno: '1.0', wsd: '6.0'}, { offset: 2, tmp: '-3', pty: '3', sky: '4', sno: '1.5', wsd: '7.0'}, { offset: 3, tmp: '-4', pty: '3', sky: '4', sno: '1.5', wsd: '7.5'}, { offset: 4, tmp: '-4', pty: '3', sky: '4', sno: '1.5', wsd: '7.0'}, { offset: 5, tmp: '-5', pty: '3', sky: '4', sno: '1.0', wsd: '6.0'}, { offset: 6, tmp: '-5', pty: '3', sky: '4', sno: '0.5', wsd: '5.0'}, { offset: 7, tmp: '-6', pty: '0', sky: '4', sno: '0', wsd: '4.0'} ], '555': [ { offset: -1, tmp: '1', pty: '1', sky: '4', sno: '0', wsd: '7.0'}, { offset: 0, tmp: '0.5', pty: '1', sky: '4', sno: '0', wsd: '8.0'}, { offset: 1, tmp: '0', pty: '3', sky: '4', sno: '1.5', wsd: '9.0'}, { offset: 2, tmp: '-0.5', pty: '3', sky: '4', sno: '2.0', wsd: '9.5'}, { offset: 3, tmp: '-1', pty: '3', sky: '4', sno: '2.5', wsd: '9.0'}, { offset: 4, tmp: '-1.5', pty: '3', sky: '4', sno: '1.0', wsd: '8.0'}, { offset: 5, tmp: '-2', pty: '0', sky: '4', sno: '0', wsd: '7.0'} ], '666': [ { offset: -2, tmp: '2', pty: '0', sky: '3', sno: '0', wsd: '8.0'}, { offset: -1, tmp: '1', pty: '1', sky: '4', sno: '0', wsd: '10.0'}, { offset: 0, tmp: '-1', pty: '3', sky: '4', sno: '3.0', wsd: '14.0'}, { offset: 1, tmp: '-3', pty: '3', sky: '4', sno: '4.0', wsd: '15.0'}, { offset: 2, tmp: '-5', pty: '3', sky: '4', sno: '3.0', wsd: '16.0'}, { offset: 3, tmp: '-6', pty: '3', sky: '4', sno: '2.0', wsd: '15.0'}, { offset: 4, tmp: '-7', pty: '3', sky: '4', sno: '1.0', wsd: '14.0'}, { offset: 5, tmp: '-7', pty: '0', sky: '4', sno: '0', wsd: '12.0'} ],};
    const testScenarioDetails = {
        '111': { level: '안전', className: '', tags: '', recommendation: '눈깨비가 알려드려요! 화창하고 맑은 날씨예요. 즐거운 하루 보내세요!', breakdownHtml: '' },
        '222': { level: '안전', className: '', tags: '', recommendation: '눈깨비가 알려드려요! 비 소식이 있으니, 외출하실 때 작은 우산을 챙기는 게 좋겠어요.', breakdownHtml: '' },
        '333': { level: '관심', className: 'level-interest', tags: '#가벼운눈', recommendation: '눈깨비가 알려드려요! 가벼운 눈 소식이 있어요. 최신 정보를 계속 확인할게요.', breakdownHtml: '◾ 기본 점수 (관심 단계): +10점<br>----------------------------------<br>  총점: 10점 → 관심 단계' },
        '444': { level: '주의', className: 'level-caution', tags: '#대설주의보', recommendation: '눈깨비가 알려드려요! 눈이 제법 많이 올 수 있어요. 운전하신다면 미끄럼 사고에 꼭 주의해 주세요.', breakdownHtml: '◾ 기본 점수 (대설주의보): +20점<br>----------------------------------<br>  총점: 20점 → 주의 단계' },
        '555': { level: '경계', className: 'level-warning', tags: '#습설', recommendation: '눈깨비가 걱정돼요! 시설물에 무리가 갈 수 있는 무거운 눈이에요. 차량 운행은 자제하는 편이 안전해요.', breakdownHtml: '◾ 기본 점수 (대설주의보): +20점<br>◾ 가중 점수 (시설물 붕괴): +10점<br>----------------------------------<br>  총점: 30점 → 경계 단계' },
        '666': { level: '심각', className: 'level-severe', tags: '#블랙아이스 #눈보라', recommendation: '눈깨비가 경고해요! 매우 위험한 폭설이 예상돼요. 지금은 꼭 안전한 실내에 머무르는 것이 가장 중요해요.', breakdownHtml: '◾ 기본 점수 (대설주의보): +20점<br>◾ 가중 점수 (도로 결빙): +15점<br>◾ 가중 점수 (눈보라 발생): +15점<br>----------------------------------<br>  총점: 50점 → 심각 단계' }
    };

    const loaderElement = document.getElementById('loader');
    const dashboardElement = document.getElementById('dashboard');
    const briefingCard = document.getElementById('strategy-briefing-card');
    const hourlyContainer = document.getElementById('hourly-container');

    const HUMIDITY_ICON = `<svg class="weather-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.32 0L12 2.69zm0 18.62a6 6 0 0 0 4.24-1.76A6 6 0 0 0 12 5.51 6 6 0 0 0 3.51 15.3a6 6 0 0 0 8.49 4.25v-1.42a4 4 0 0 1-5.66-5.66 4 4 0 0 1 5.66 0 4 4 0 0 1 0 5.66v1.42z"/></svg>`;
    const WIND_ICON = `<svg class="weather-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M17.7 7.7a.75.75 0 0 0-1.06-1.06L14 9.28V5.5a.75.75 0 0 0-1.5 0v3.78l-2.64-2.64a.75.75 0 0 0-1.06 1.06L12.94 11H9.5a.75.75 0 0 0 0 1.5h3.44l-4.14 4.14a.75.75 0 0 0 1.06 1.06L12.5 15.06v3.44a.75.75 0 0 0 1.5 0v-3.44l2.64 2.64a.75.75 0 0 0 1.06-1.06L14.06 14h3.44a.75.75 0 0 0 0-1.5h-3.44l4.14-4.14z"/></svg>`;

    function fetchWeatherData() {
        const now = new Date(); let base_date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`; let base_time; const hours = now.getHours(); const minutes = now.getMinutes(); if (hours < 2 || (hours === 2 && minutes < 10)) { const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000); base_date = `${yesterday.getFullYear()}${String(yesterday.getMonth() + 1).padStart(2, '0')}${String(yesterday.getDate()).padStart(2, '0')}`; base_time = "2000"; } else if (hours < 5 || (hours === 5 && minutes < 10)) { const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000); base_date = `${yesterday.getFullYear()}${String(yesterday.getMonth() + 1).padStart(2, '0')}${String(yesterday.getDate()).padStart(2, '0')}`; base_time = "2300"; } else if (hours < 8 || (hours === 8 && minutes < 10)) base_time = "0200"; else if (hours < 11 || (hours === 11 && minutes < 10)) base_time = "0500"; else if (hours < 14 || (hours === 14 && minutes < 10)) base_time = "0800"; else if (hours < 17 || (hours === 17 && minutes < 10)) base_time = "1100"; else if (hours < 20 || (hours === 20 && minutes < 10)) base_time = "1400"; else if (hours < 23 || (hours === 23 && minutes < 10)) base_time = "1700"; else base_time = "2000"; const fullUrl = `${originalUrl}?${new URLSearchParams({ authKey: API_KEY, pageNo: '1', numOfRows: '1000', dataType: 'JSON', base_date, base_time, nx: '98', ny: '125' })}`;
        
        fetch(`${proxyUrl}${encodeURIComponent(fullUrl)}`)
            .then(res => { if (!res.ok) { throw new Error(`HTTP error! status: ${res.status}`); } return res.json(); })
            .then(data => {
                if (data.response?.body?.items) {
                    originalForecastItems = data.response.body.items.item;
                    updateUI(originalForecastItems);
                } else {
                    throw new Error("API data format is invalid.");
                }
                
                loaderElement.classList.add('hidden');
                dashboardElement.classList.remove('hidden');
            })
            .catch(err => {
                console.error("API Fetch Error:", err);
                loaderElement.querySelector('.loader-text').innerHTML = "데이터를 불러오는데 실패했습니다.<br>잠시 후 다시 시도해 주세요.";
            });
    }

    function calculateRisk(hourlyData, sortedKeys) {
        let breakdown = [];
        const tags = new Set();
        let recommendation = "눈깨비가 알려드려요! 특별한 위험 없이 평온한 날씨가 예상돼요.";
        const now = new Date(); const future24h = new Date(now.getTime() + 24 * 60 * 60 * 1000); const future24hString = `${future24h.getFullYear()}${String(future24h.getMonth() + 1).padStart(2, '0')}${String(future24h.getDate()).padStart(2, '0')}_${String(future24h.getHours()).padStart(2, '0')}00`; const relevantKeys = sortedKeys.filter(key => key > `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_0000` && key < future24hString); let totalSnow = 0; relevantKeys.forEach(key => { const hour = hourlyData[key]; if (hour && hour.SNO) { totalSnow += parseFloat(hour.SNO); } }); let baseScore = 0; if (totalSnow >= 20) { baseScore = 40; breakdown.push("◾ 기본 점수 (대설경보): +40점"); } else if (totalSnow >= 5) { baseScore = 20; breakdown.push("◾ 기본 점수 (대설주의보): +20점"); } else if (totalSnow >= 1) { baseScore = 10; breakdown.push("◾ 기본 점수 (관심 단계): +10점"); } let prevTemp = null; for (const key of sortedKeys) { const hour = hourlyData[key]; if(!hour) { if(key.endsWith("00")) prevTemp = null; continue; }; const temp = parseFloat(hour.TMP); const isRainingOrSnowing = hour.PTY && ['1', '2', '3', '4'].includes(hour.PTY); if(isRainingOrSnowing && prevTemp !== null && prevTemp > 0 && temp <= 0) tags.add("#블랙아이스"); if(baseScore >= 20 && parseFloat(hour.WSD) >= 14) tags.add("#눈보라"); if(hour.PTY === '3' && temp >= -1 && temp <= 1) tags.add("#습설"); prevTemp = temp; } let currentScore = baseScore; if (tags.has("#블랙아이스")) { currentScore += 15; breakdown.push("◾ 가중 점수 (도로 결빙): +15점"); } if (tags.has("#눈보라")) { currentScore += 15; breakdown.push("◾ 가중 점수 (눈보라 발생): +15점"); } if (tags.has("#습설")) { currentScore += 10; breakdown.push("◾ 가중 점수 (시설물 붕괴): +10점"); }
        
        let level = "관심", className = "level-interest";
        if (currentScore >= 40) {
            level = "심각"; className = "level-severe";
            recommendation = "눈깨비가 경고해요! 매우 위험한 폭설이 예상돼요. 지금은 꼭 안전한 실내에 머무르는 것이 가장 중요해요.";
        } else if (currentScore >= 30) {
            level = "경계"; className = "level-warning";
            recommendation = "눈깨비가 걱정돼요! 여러 위험이 함께 예상되니, 차량 운행은 자제하고 외출 시 각별히 조심해 주세요.";
        } else if (currentScore >= 20) {
            level = "주의"; className = "level-caution";
            recommendation = "눈깨비가 알려드려요! 눈이 제법 많이 올 수 있어요. 운전하신다면 미끄럼 사고에 꼭 주의해 주세요.";
        } else if (currentScore > 0) {
            recommendation = "눈깨비가 알려드려요! 가벼운 눈 소식이 있어요. 최신 정보를 계속 확인할게요.";
        } else {
            level = "안전"; className = "";
        }

        if (breakdown.length > 0) { breakdown.push(`----------------------------------`); breakdown.push(`  총점: ${currentScore}점 → ${level} 단계`); } return { level, className, tags: Array.from(tags).join(' '), recommendation, criticalTime: "", breakdownHtml: breakdown.join('<br>') };
    }
    
    function updateCardColors(sky, pty) {
        const weatherCard = document.querySelector('.current-weather');
        const weatherClasses = ['sunny', 'cloudy', 'overcast', 'rainy', 'snowy'];
        weatherCard.classList.remove(...weatherClasses);
        let newClass = '';
        pty = parseInt(pty);
        sky = parseInt(sky);
        if (pty === 1 || pty === 4) newClass = 'rainy';
        else if (pty === 3) newClass = 'snowy';
        else if (sky === 1) newClass = 'sunny';
        else if (sky === 3) newClass = 'cloudy';
        else if (sky === 4) newClass = 'overcast';
        if (newClass) {
            weatherCard.classList.add(newClass);
        }
    }

    function calculateFeelsLikeTemp(temp, windSpeed) { if (temp === undefined || windSpeed === undefined) return '--'; const T = parseFloat(temp); const V_ms = parseFloat(windSpeed); const V_kmh = V_ms * 3.6; if (V_kmh < 4.8) return T.toFixed(1); const feelsLike = 13.12 + 0.6215 * T - 11.37 * Math.pow(V_kmh, 0.16) + 0.3965 * T * Math.pow(V_kmh, 0.16); return feelsLike.toFixed(1); }
    
    function getWeatherIconSVG(sky, pty) {
        pty = parseInt(pty);
        sky = parseInt(sky);
        let iconName = 'sun';

        if (pty > 0) {
            if (pty === 1 || pty === 4) iconName = 'cloud-rain';
            else if (pty === 2) iconName = 'cloud-sleet';
            else if (pty === 3) iconName = 'snowflake';
        } else {
            if (sky === 3) iconName = 'cloud';
            else if (sky === 4) iconName = 'cloud-fog';
        }

        const icons = {
            'sun': `<svg class="weather-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
            'cloud': `<svg class="weather-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>`,
            'cloud-rain': `<svg class="weather-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16" y1="13" x2="16" y2="21"></line><line x1="8" y1="13" x2="8" y2="21"></line><line x1="12" y1="15" x2="12" y2="23"></line><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path></svg>`,
            'cloud-sleet': `<svg class="weather-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16" y1="13" x2="16" y2="21"></line><line x1="8" y1="13" x2="8" y2="21"></line><line x1="12" y1="15" x2="12" y2="23"></line><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path><path d="M19 15l-1.5-1.5"></path><path d="M14.5 20l-1.5-1.5"></path><path d="M9.5 15l-1.5-1.5"></path></svg>`,
            'snowflake': `<svg class="weather-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"></line><line x1="17" y1="7" x2="7" y2="17"></line><line x1="7" y1="7" x2="17" y2="17"></line><line x1="2" y1="12" x2="22" y2="12"></line></svg>`,
            'cloud-fog': `<svg class="weather-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 17H7"/><path d="M17 21H9"/></svg>`
        };
        return icons[iconName] || icons['sun'];
    }
    
    function updateUI(forecastItems, isTestMode = false, scenarioData = null, riskOverride = null) {
        const now = new Date(); const hourlyData = {}; forecastItems.forEach(item => { const key = `${item.fcstDate}_${item.fcstTime}`; if (!hourlyData[key]) hourlyData[key] = { fcstDate: item.fcstDate, fcstTime: item.fcstTime }; hourlyData[key][item.category] = item.fcstValue; }); const sortedKeys = Object.keys(hourlyData).sort(); const currentDateString = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`; let currentData; if (isTestMode && scenarioData) { currentData = scenarioData; } else { const currentDataKey = sortedKeys.find(key => key >= `${currentDateString}_${now.getHours().toString().padStart(2,'0')}00`) || sortedKeys[0]; currentData = hourlyData[currentDataKey] || {}; }
        
        const initialDateStr = hourlyData[sortedKeys[0]]?.fcstDate || currentDateString; displayedDateStr = initialDateStr;
        document.getElementById('current-date').textContent = formatDateString(displayedDateStr);
        document.getElementById('current-temp').textContent = Math.round(parseFloat(currentData.TMP)) || '--';
        let skyText; const pty = parseInt(currentData.PTY); const sky = parseInt(currentData.SKY); if (pty > 0) { if (pty === 1 || pty === 4) skyText = '비'; else if (pty === 2) skyText = '진눈깨비'; else if (pty === 3) skyText = '눈'; else skyText = '강수'; } else { if (sky === 1) skyText = '맑음'; else if (sky === 3) skyText = '구름많음'; else if (sky === 4) skyText = '흐림'; else skyText = '정보없음'; }
        document.getElementById('current-sky').textContent = skyText;
        document.getElementById('temp-max').textContent = forecastItems.find(i=>i.category==='TMX')?.fcstValue || '--';
        document.getElementById('temp-min').textContent = forecastItems.find(i=>i.category==='TMN')?.fcstValue || '--';
        
        document.getElementById('humidity-label').innerHTML = `${HUMIDITY_ICON} 습도`;
        document.getElementById('current-reh').textContent = `${currentData.REH || '--'} %`;
        document.getElementById('wind-label').innerHTML = `${WIND_ICON} 풍속`;
        document.getElementById('current-wsd').textContent = `${currentData.WSD || '--'} m/s`;
        document.getElementById('feel-temp').textContent = calculateFeelsLikeTemp(currentData.TMP, currentData.WSD);
        
        const riskAnalysis = riskOverride ? riskOverride : calculateRisk(hourlyData, sortedKeys);
        briefingCard.style.display = 'block'; const allLevelClasses = ['level-interest', 'level-caution', 'level-warning', 'level-severe']; briefingCard.classList.remove(...allLevelClasses); if (riskAnalysis.className) { briefingCard.classList.add(riskAnalysis.className); } document.getElementById('risk-level-text').textContent = riskAnalysis.level; document.getElementById('risk-tags').textContent = riskAnalysis.tags; document.getElementById('risk-recommendation').textContent = riskAnalysis.recommendation; document.getElementById('critical-time-warning').textContent = riskAnalysis.criticalTime; document.getElementById('risk-breakdown').innerHTML = riskAnalysis.breakdownHtml;
        
        updateCardColors(currentData.SKY, currentData.PTY);
        
        hourlyContainer.innerHTML = '';
        
        let startIndex;
        if (isTestMode && scenarioData) {
            const currentTestKey = `${scenarioData.fcstDate}_${scenarioData.fcstTime}`;
            const currentTestIndex = sortedKeys.findIndex(key => key === currentTestKey);
            startIndex = currentTestIndex !== -1 ? Math.max(0, currentTestIndex - 2) : 0;
        } else {
            const currentDataKey = `${currentDateString}_${now.getHours().toString().padStart(2, '0')}00`;
            startIndex = Math.max(0, sortedKeys.findIndex(key => key >= currentDataKey) - 2);
        }
        
        const endIndex = Math.min(sortedKeys.length, startIndex + 50); const displayKeys = sortedKeys.slice(startIndex, endIndex); let lastDate = ''; if (displayKeys.length > 0) lastDate = hourlyData[displayKeys[0]].fcstDate;
        
        displayKeys.forEach((key, index) => {
            const hourData = hourlyData[key]; if (!hourData) return;
            if (hourData.fcstDate !== lastDate) { const divider = document.createElement('div'); divider.className = 'date-divider'; divider.dataset.date = hourData.fcstDate; hourlyContainer.appendChild(divider); lastDate = hourData.fcstDate; }
            const itemDiv = document.createElement('div'); itemDiv.className = 'hourly-item'; itemDiv.dataset.date = hourData.fcstDate;
            if (!isTestMode && key === (sortedKeys.find(k => k >= `${currentDateString}_${now.getHours().toString().padStart(2,'0')}00`))) { itemDiv.classList.add('current-hour'); }
            if (isTestMode && scenarioData.fcstTime === hourData.fcstTime && scenarioData.fcstDate === hourData.fcstDate) { itemDiv.classList.add('current-hour'); }
            itemDiv.style.animationDelay = `${index * 0.05 + 0.1}s`;
            itemDiv.innerHTML = `<div class="time">${parseInt(hourData.fcstTime.substring(0, 2))}시</div><div class="icon">${getWeatherIconSVG(hourData.SKY, hourData.PTY)}</div><div class="temp">${hourData.TMP}°</div>`;
            hourlyContainer.appendChild(itemDiv);
        });
        
        setTimeout(() => { const currentHourItem = hourlyContainer.querySelector('.current-hour'); if (currentHourItem) { const scrollPos = currentHourItem.offsetLeft - (hourlyContainer.offsetWidth / 2) + (currentHourItem.offsetWidth / 2); hourlyContainer.scrollTo({ left: Math.max(0, scrollPos), behavior: 'smooth' }); } else { hourlyContainer.scrollLeft = 0; } }, 100);
        
        const snowAlerts = forecastItems.filter(item => item.category === 'SNO' && parseFloat(item.fcstValue) > 0);
        updateSnowAlerts(snowAlerts, hourlyData);
    }
    
    function updateSnowAlerts(snowAlerts, hourlyData) { const snowAlertCard = document.querySelector('.snow-alert-card'); const snowAlertsList = snowAlertCard.querySelector('ul'); snowAlertsList.innerHTML = ''; if (snowAlerts.length > 0) { snowAlertCard.style.display = 'block'; const processedTimes = new Set(); snowAlerts.forEach(alert => { const key = `${alert.fcstDate}_${alert.fcstTime}`; if (processedTimes.has(key)) return; const hourData = hourlyData[key] || {}; const li = document.createElement('li'); let warning = "차량 운행 시 미끄럼에 주의하세요."; if (parseFloat(alert.fcstValue) >= 3.0) warning = "대설주의보 수준의 눈입니다. 가급적 외출을 자제하세요."; if (parseFloat(hourData.WSD) >= 9.0) warning += " 강풍을 동반하여 눈보라가 칠 수 있습니다."; li.innerHTML = `<div class="alert-time">${parseInt(alert.fcstTime.substring(0,2))}시 예보</div><div class="alert-details"><span>적설: ${alert.fcstValue}cm</span> | <span>기온: ${hourData.TMP}°C</span> | <span>풍속: ${hourData.WSD}m/s</span></div><div class="alert-warning">${warning}</div>`; snowAlertsList.appendChild(li); processedTimes.add(key); }); } else { snowAlertCard.style.display = 'none'; } }
    function formatDateString(dateStr) { if (!dateStr || dateStr.length !== 8) return ''; const year = parseInt(dateStr.substring(0, 4)); const month = parseInt(dateStr.substring(4, 6)); const day = parseInt(dateStr.substring(6, 8)); const weekdays = ['일', '월', '화', '수', '목', '금', '토']; const date = new Date(year, month - 1, day); return `${month}월 ${day}일 (${weekdays[date.getDay()]})`; }
    function throttle(func, limit) { let inThrottle; return function() { const args = arguments; const context = this; if (!inThrottle) { func.apply(context, args); inThrottle = true; setTimeout(() => inThrottle = false, limit); } }; }
    function handleScroll() { const container = document.getElementById('hourly-container'); const scrollLeft = container.scrollLeft; const containerPadding = parseInt(window.getComputedStyle(container).paddingLeft); const items = container.querySelectorAll('.hourly-item, .date-divider'); for (const item of items) { if (item.offsetLeft + item.offsetWidth > scrollLeft + containerPadding) { const newDateStr = item.dataset.date; if (newDateStr && newDateStr !== displayedDateStr) { displayedDateStr = newDateStr; document.getElementById('current-date').textContent = formatDateString(newDateStr); } break; } } }
    
    function applyTestScenario(scenarioKey) {
        const scenario = testScenarios[scenarioKey]; if (!scenario) return;
        isTestModeActive = true;
        const testItems = JSON.parse(JSON.stringify(originalForecastItems));
        const now = new Date();
        testItems.forEach(item => {
            if (item.category === 'SNO' || item.category === 'PTY') item.fcstValue = '0';
            if (item.category === 'SKY') item.fcstValue = '1';
        });
        let scenarioCurrentData = {};
        testItems.forEach(item => {
            const itemDate = new Date(item.fcstDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') + 'T' + item.fcstTime.replace(/(\d{2})(\d{2})/, '$1:$2:00'));
            const hoursDiff = Math.round((itemDate.getTime() - now.getTime()) / 3600000);
            const matchingScenario = scenario.find(s => s.offset === hoursDiff);
            if (matchingScenario) {
                const s = matchingScenario;
                if (item.category === 'TMP') item.fcstValue = s.tmp;
                if (item.category === 'PTY') item.fcstValue = s.pty;
                if (item.category === 'SKY') item.fcstValue = s.sky;
                if (item.category === 'SNO') item.fcstValue = s.sno;
                if (item.category === 'WSD') item.fcstValue = s.wsd;
                if (s.offset === 0) {
                    scenarioCurrentData = { fcstDate: item.fcstDate, fcstTime: item.fcstTime, TMP: s.tmp, PTY: s.pty, SKY: s.sky, SNO: s.sno, WSD: s.wsd, REH: '50' };
                }
            }
        });
        scenario.forEach(s => {
            if (parseFloat(s.sno) > 0) {
                const scenarioDate = new Date(now.getTime() + s.offset * 3600000);
                const fcstDate = `${scenarioDate.getFullYear()}${String(scenarioDate.getMonth() + 1).padStart(2, '0')}${String(scenarioDate.getDate()).padStart(2, '0')}`;
                const fcstTime = `${String(scenarioDate.getHours()).padStart(2, '0')}00`;
                const existingSnoItem = testItems.find(item => item.category === 'SNO' && item.fcstDate === fcstDate && item.fcstTime === fcstTime);
                if (existingSnoItem) {
                    existingSnoItem.fcstValue = s.sno;
                } else {
                    testItems.push({ base_date: fcstDate, base_time: fcstTime, category: 'SNO', fcstDate: fcstDate, fcstTime: fcstTime, fcstValue: s.sno, nx: 98, ny: 125 });
                }
            }
        });
        const scenarioTemps = scenario.map(s => parseFloat(s.tmp));
        const tmn = Math.min(...scenarioTemps);
        const tmx = Math.max(...scenarioTemps);
        const tmnItem = testItems.find(i => i.category === 'TMN');
        if(tmnItem) tmnItem.fcstValue = String(tmn);
        const tmxItem = testItems.find(i => i.category === 'TMX');
        if(tmxItem) tmxItem.fcstValue = String(tmx);
        const riskDetails = testScenarioDetails[scenarioKey];
        updateUI(testItems, true, scenarioCurrentData, riskDetails);
    }

    hourlyContainer.addEventListener('scroll', throttle(handleScroll, 200));
    document.getElementById('scroll-left-btn').addEventListener('click', () => { hourlyContainer.scrollBy({ left: -300, behavior: 'smooth' }); });
    document.getElementById('scroll-right-btn').addEventListener('click', () => { hourlyContainer.scrollBy({ left: 300, behavior: 'smooth' }); });
    
    document.getElementById('risk-details-toggle').addEventListener('click', (e) => {
        const toggle = e.currentTarget;
        const breakdown = document.getElementById('risk-breakdown');
        toggle.classList.toggle('expanded');
        breakdown.style.display = toggle.classList.contains('expanded') ? 'block' : 'none';
        
        if (toggle.classList.contains('expanded')) {
            toggle.childNodes[0].nodeValue = '닫기 ';
        } else {
            toggle.childNodes[0].nodeValue = '자세히 보기 ';
        }
    });
    
    let keySequence = '';
    document.addEventListener('keydown', (e) => {
        keySequence += e.key;
        keySequence = keySequence.slice(-3);
        if (testScenarios[keySequence]) {
            applyTestScenario(keySequence);
            keySequence = '';
            loaderElement.classList.add('hidden');
            dashboardElement.classList.remove('hidden');
        } else if (keySequence === '000') {
            isTestModeActive = false;
            updateUI(originalForecastItems);
            keySequence = '';
            dashboardElement.classList.remove('hidden');
        }
    });

    setInterval(() => { const now = new Date(); if (now.getMinutes() === 10) { fetchWeatherData(); } else { if (!dashboardElement.classList.contains('hidden') && !isTestModeActive) { updateUI(originalForecastItems); } } }, 60000);
    
    fetchWeatherData();
});