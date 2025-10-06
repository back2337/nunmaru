document.addEventListener('DOMContentLoaded', () => {
    
    const API_KEY = "WUjoGM8jQl2I6BjPI7JdYw";
    const originalUrl = "https://apihub.kma.go.kr/api/typ02/openApi/VilageFcstInfoService_2.0/getVilageFcst";
    const proxyUrl = "https://cors-anywhere.herokuapp.com/";
    let originalForecastItems = [];
    let displayedDateStr = ''; // [추가] 스크롤 연동 날짜 표시를 위한 변수

    function fetchWeatherData() {
        const now = new Date();
        let base_date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        let base_time;
        const hours = now.getHours();
        const minutes = now.getMinutes();

        if (hours < 2 || (hours === 2 && minutes < 10)) {
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            base_date = `${yesterday.getFullYear()}${String(yesterday.getMonth() + 1).padStart(2, '0')}${String(yesterday.getDate()).padStart(2, '0')}`;
            base_time = "2000"; 
        } else if (hours < 5 || (hours === 5 && minutes < 10)) {
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            base_date = `${yesterday.getFullYear()}${String(yesterday.getMonth() + 1).padStart(2, '0')}${String(yesterday.getDate()).padStart(2, '0')}`;
            base_time = "2300";
        }
        else if (hours < 8 || (hours === 8 && minutes < 10)) base_time = "0200";
        else if (hours < 11 || (hours === 11 && minutes < 10)) base_time = "0500";
        else if (hours < 14 || (hours === 14 && minutes < 10)) base_time = "0800";
        else if (hours < 17 || (hours === 17 && minutes < 10)) base_time = "1100";
        else if (hours < 20 || (hours === 20 && minutes < 10)) base_time = "1400";
        else if (hours < 23 || (hours === 23 && minutes < 10)) base_time = "1700";
        else base_time = "2000";

        const params = new URLSearchParams({ authKey: API_KEY, pageNo: '1', numOfRows: '1000', dataType: 'JSON', base_date, base_time, nx: '98', ny: '125' });
        fetch(`${proxyUrl}${originalUrl}?${params.toString()}`)
            .then(res => res.json()).then(data => {
                if (data.response?.body?.items) {
                    originalForecastItems = data.response.body.items.item;
                    updateUI(originalForecastItems);
                }
                document.getElementById('loader').style.display = 'none';
                document.getElementById('dashboard').style.display = 'flex';
            }).catch(err => console.error("API Error:", err));
    }

    function updateUI(forecastItems, isTestMode = false) {
        const now = new Date();
        const hourlyData = {};
        forecastItems.forEach(item => {
            const key = `${item.fcstDate}_${item.fcstTime}`;
            if (!hourlyData[key]) hourlyData[key] = { fcstDate: item.fcstDate, fcstTime: item.fcstTime };
            hourlyData[key][item.category] = item.fcstValue;
        });
        const sortedKeys = Object.keys(hourlyData).sort();
        const currentDateString = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        const currentHourString = `${String(now.getHours()).padStart(2, '0')}00`;
        
        let currentDataKey = sortedKeys.find(key => key >= `${currentDateString}_${currentHourString}`) || sortedKeys[0];
        if (isTestMode) {
            // 테스트 모드에서는 시나리오의 시작점을 현재 시간으로 간주
            currentDataKey = sortedKeys.find(key => hourlyData[key].SNO && parseFloat(hourlyData[key].SNO) > 0) || currentDataKey;
        }
        const currentData = hourlyData[currentDataKey] || {};

        const initialDateStr = hourlyData[sortedKeys[0]]?.fcstDate || currentDateString;
        displayedDateStr = initialDateStr;
        document.getElementById('current-date').textContent = formatDateString(displayedDateStr);

        document.getElementById('current-temp').textContent = currentData.TMP || '--';
        document.getElementById('current-sky').textContent = {1:"맑음",3:"구름많음",4:"흐림"}[currentData.SKY] || '정보없음';
        document.getElementById('feel-temp').textContent = currentData.TMP || '--';
        document.getElementById('temp-max').textContent = forecastItems.find(i=>i.category==='TMX')?.fcstValue || '--';
        document.getElementById('temp-min').textContent = forecastItems.find(i=>i.category==='TMN')?.fcstValue || '--';
        document.getElementById('current-reh').textContent = `${currentData.REH || '--'} %`;
        document.getElementById('current-wsd').textContent = `${currentData.WSD || '--'} m/s`;
        
        const hourlyContainer = document.getElementById('hourly-container');
        hourlyContainer.innerHTML = '';
        const currentIndex = sortedKeys.findIndex(key => key >= `${currentDateString}_${currentHourString}`);
        const startIndex = isTestMode ? 0 : Math.max(0, currentIndex - 2);
        const endIndex = isTestMode ? sortedKeys.length : Math.min(sortedKeys.length, currentIndex + 48);
        const displayKeys = sortedKeys.slice(startIndex, endIndex);
        
        let lastDate = '';
        if (displayKeys.length > 0) lastDate = hourlyData[displayKeys[0]].fcstDate;

        displayKeys.forEach(key => {
            const hourData = hourlyData[key];
            if (!hourData) return;
            if (hourData.fcstDate !== lastDate) {
                const divider = document.createElement('div');
                divider.className = 'date-divider';
                divider.dataset.date = hourData.fcstDate;
                hourlyContainer.appendChild(divider);
                lastDate = hourData.fcstDate;
            }
            const itemDiv = document.createElement('div');
            itemDiv.className = 'hourly-item';
            itemDiv.dataset.date = hourData.fcstDate;
            if (key === currentDataKey) itemDiv.classList.add('current-hour');
            itemDiv.innerHTML = `<div class="time">${parseInt(hourData.fcstTime.substring(0, 2))}시</div><div class="icon">${getWeatherIcon(hourData.SKY, hourData.PTY)}</div><div class="temp">${hourData.TMP}°</div>`;
            hourlyContainer.appendChild(itemDiv);
        });
        
        setTimeout(() => { hourlyContainer.scrollLeft = 0; }, 100);
        
        const snowAlerts = forecastItems.filter(item => item.category === 'SNO' && parseFloat(item.fcstValue) > 0);
        document.getElementById('summary-text').textContent = generateSummaryText(currentData, snowAlerts);
        updateSnowAlerts(snowAlerts, hourlyData);
        updateCardColors(currentData.SKY, currentData.PTY);
    }
    
    function getWeatherIcon(sky, pty) { pty = parseInt(pty); sky = parseInt(sky); if (pty > 0) { if (pty === 1 || pty === 4) return '💧'; if (pty === 2) return '🌧️'; if (pty === 3) return '❄️'; } if (sky === 1) return '☀️'; if (sky === 3) return '☁️'; if (sky === 4) return '🌫️'; return '❓'; }
    function generateSummaryText(weather, snows) { if (!weather || !weather.TMP) return "날씨 정보를 분석 중입니다..."; const temp = parseFloat(weather.TMP); const pty = parseInt(weather.PTY || 0); if (snows.length > 0) return "폭설 예보가 있습니다. 외출 시 교통 안전에 각별히 유의하세요."; if (pty === 1 || pty === 4) return "비 소식이 있습니다. 작은 우산을 챙기시는 것을 추천합니다."; if (temp <= 5) return "쌀쌀한 날씨입니다. 따뜻한 옷차림으로 체온을 유지하세요."; if (temp >= 28) return "더운 날씨가 예상됩니다. 수분 섭취에 신경 쓰세요."; return "평온한 하루가 예상됩니다. 즐거운 하루 보내세요!"; }
    function updateCardColors(sky, pty) { const weatherCard = document.querySelector('.current-weather'); const summaryCard = document.querySelector('.summary'); const weatherClasses = ['sunny', 'cloudy', 'overcast', 'rainy', 'snowy']; weatherCard.classList.remove(...weatherClasses); summaryCard.classList.remove(...weatherClasses); let newClass = ''; pty = parseInt(pty); sky = parseInt(sky); if (pty === 1 || pty === 4) newClass = 'rainy'; else if (pty === 3) newClass = 'snowy'; else if (sky === 1) newClass = 'sunny'; else if (sky === 3) newClass = 'cloudy'; else if (sky === 4) newClass = 'overcast'; if (newClass) { weatherCard.classList.add(newClass); summaryCard.classList.add(newClass); } }
    function updateSnowAlerts(snowAlerts, hourlyData) { const snowAlertCard = document.querySelector('.snow-alert-card'); const snowAlertsList = snowAlertCard.querySelector('ul'); snowAlertsList.innerHTML = ''; if (snowAlerts.length > 0) { snowAlertCard.style.display = 'block'; const processedTimes = new Set(); snowAlerts.forEach(alert => { const key = `${alert.fcstDate}_${alert.fcstTime}`; if (processedTimes.has(key)) return; const hourData = hourlyData[key] || {}; const li = document.createElement('li'); let warning = "차량 운행 시 미끄럼에 주의하세요."; if (parseFloat(alert.fcstValue) >= 3.0) warning = "대설주의보 수준의 눈입니다. 가급적 외출을 자제하세요."; if (parseFloat(hourData.WSD) >= 9.0) warning += " 강풍을 동반하여 눈보라가 칠 수 있습니다."; li.innerHTML = `<div class="alert-time">${parseInt(alert.fcstTime.substring(0,2))}시 예보</div><div class="alert-details"><span>적설: ${alert.fcstValue}cm</span> | <span>기온: ${hourData.TMP}°C</span> | <span>풍속: ${hourData.WSD}m/s</span></div><div class="alert-warning">${warning}</div>`; snowAlertsList.appendChild(li); processedTimes.add(key); }); } else { snowAlertCard.style.display = 'none'; } }
    
    function formatDateString(dateStr) {
        if (!dateStr || dateStr.length !== 8) return '';
        const year = parseInt(dateStr.substring(0, 4));
        const month = parseInt(dateStr.substring(4, 6));
        const day = parseInt(dateStr.substring(6, 8));
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        const date = new Date(year, month - 1, day);
        return `${month}월 ${day}일 (${weekdays[date.getDay()]})`;
    }

    function throttle(func, limit) { let inThrottle; return function() { const args = arguments; const context = this; if (!inThrottle) { func.apply(context, args); inThrottle = true; setTimeout(() => inThrottle = false, limit); } }; }

    function handleScroll() {
        const container = document.getElementById('hourly-container');
        const scrollLeft = container.scrollLeft;
        const containerPadding = parseInt(window.getComputedStyle(container).paddingLeft);
        const items = container.querySelectorAll('.hourly-item, .date-divider');
        for (const item of items) {
            if (item.offsetLeft + item.offsetWidth > scrollLeft + containerPadding) {
                const newDateStr = item.dataset.date;
                if (newDateStr && newDateStr !== displayedDateStr) {
                    displayedDateStr = newDateStr;
                    document.getElementById('current-date').textContent = formatDateString(newDateStr);
                }
                break;
            }
        }
    }

    document.getElementById('hourly-container').addEventListener('scroll', throttle(handleScroll, 200));
    document.getElementById('scroll-left-btn').addEventListener('click', () => { document.getElementById('hourly-container').scrollBy({ left: -300, behavior: 'smooth' }); });
    document.getElementById('scroll-right-btn').addEventListener('click', () => { document.getElementById('hourly-container').scrollBy({ left: 300, behavior: 'smooth' }); });
    
    let keySequence = '';
    document.addEventListener('keydown', (e) => {
        keySequence += e.key;
        keySequence = keySequence.slice(-3);
        if (keySequence === '111') {
            const testItems = JSON.parse(JSON.stringify(originalForecastItems));
            const now = new Date();
            const scenario = [
                { offset: -1, tmp: '0', pty: '3', sky: '4', sno: '0.1' }, { offset: 0, tmp: '-1', pty: '3', sky: '4', sno: '0.5' },
                { offset: 1, tmp: '-2', pty: '3', sky: '4', sno: '1.5' }, { offset: 2, tmp: '-3', pty: '3', sky: '4', sno: '3.0' },
                { offset: 3, tmp: '-4', pty: '3', sky: '4', sno: '5.5' }, { offset: 4, tmp: '-5', pty: '3', sky: '4', sno: '7.0' },
                { offset: 5, tmp: '-5', pty: '3', sky: '4', sno: '4.0' }, { offset: 6, tmp: '-4', pty: '3', sky: '4', sno: '2.5' },
                { offset: 7, tmp: '-3', pty: '3', sky: '4', sno: '1.0' }, { offset: 8, tmp: '-2', pty: '3', sky: '4', sno: '0.5' },
                { offset: 9, tmp: '-1', pty: '1', sky: '4', sno: '0' }, { offset: 10, tmp: '0', pty: '1', sky: '3', sno: '0' },
                { offset: 11, tmp: '1', pty: '0', sky: '3', sno: '0' }
            ];

            // [수정] 테스트 데이터가 최고/최저 기온도 변경하도록 수정
            const tmnItem = testItems.find(i => i.category === 'TMN');
            if(tmnItem) tmnItem.fcstValue = '-8';
            const tmxItem = testItems.find(i => i.category === 'TMX');
            if(tmxItem) tmxItem.fcstValue = '1';

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
                }
            });
            updateUI(testItems, true); // [수정] 테스트 모드 플래그 전달
            keySequence = '';
        } else if (keySequence === '222') {
            updateUI(originalForecastItems);
            keySequence = '';
        }
    });

    setInterval(() => {
        const now = new Date();
        if (now.getMinutes() === 10) {
            fetchWeatherData();
        } else if (originalForecastItems.length > 0) {
            updateUI(originalForecastItems);
        }
    }, 60000);

    fetchWeatherData();
});