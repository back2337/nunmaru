// js/script.js 오류 수정 최종 버전

// HTML 문서가 완전히 로드되었을 때 모든 스크립트를 실행하도록 감쌉니다.
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. API 호출 정보 및 시간 계산 ---
    const API_KEY = "WUjoGM8jQl2I6BjPI7JdYw";
    const originalUrl = "https://apihub.kma.go.kr/api/typ02/openApi/VilageFcstInfoService_2.0/getVilageFcst";
    const proxyUrl = "https://cors-anywhere.herokuapp.com/";

    const now = new Date();
    let base_date = '', base_time = '';
    
    if (now.getHours() < 2) {
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        base_date = `${yesterday.getFullYear()}${String(yesterday.getMonth() + 1).padStart(2, '0')}${String(yesterday.getDate()).padStart(2, '0')}`;
        base_time = "2300";
    } else {
        base_date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        if (now.getHours() < 5) base_time = "0200";
        else if (now.getHours() < 8) base_time = "0500";
        else if (now.getHours() < 11) base_time = "0800";
        else if (now.getHours() < 14) base_time = "1100";
        else if (now.getHours() < 17) base_time = "1400";
        else if (now.getHours() < 20) base_time = "1700";
        else if (now.getHours() < 23) base_time = "2000";
        else base_time = "2300";
    }

    const params = new URLSearchParams({
        authKey: API_KEY, pageNo: '1', numOfRows: '1000', dataType: 'JSON',
        base_date: base_date, base_time: base_time, nx: '98', ny: '125'
    });
    const finalUrl = `${proxyUrl}${originalUrl}?${params.toString()}`;

    let originalForecastItems = [];

    /**
     * 메인 UI 업데이트 함수
     */
    function updateUI(forecastItems) {
        const snowAlertCard = document.querySelector('.snow-alert-card');
        const hourlyData = {};
        forecastItems.forEach(item => {
            if (!hourlyData[item.fcstTime]) { hourlyData[item.fcstTime] = {}; }
            hourlyData[item.fcstTime][item.category] = item.fcstValue;
        });

        function getWeatherIcon(sky, pty) {
            pty = parseInt(pty); sky = parseInt(sky);
            if (pty > 0) {
                if (pty === 1 || pty === 4) return '💧';
                if (pty === 2) return '🌧️';
                if (pty === 3) return '❄️';
            }
            if (sky === 1) return '☀️';
            if (sky === 3) return '☁️';
            if (sky === 4) return '🌫️';
            return '❓';
        }

        function generateSummaryText(weather, snows) {
            if (!weather || !weather.TMP) return "날씨 정보를 분석 중입니다..."; // 데이터 없을 때 방어 코드
            const temp = parseFloat(weather.TMP);
            const pty = parseInt(weather.PTY || 0);
            if (snows.length > 0) return "폭설 예보가 있습니다. 외출 시 교통 안전에 각별히 유의하세요.";
            if (pty === 1 || pty === 4) return "비 소식이 있습니다. 작은 우산을 챙기시는 것을 추천합니다.";
            if (temp <= 5) return "쌀쌀한 날씨입니다. 따뜻한 옷차림으로 체온을 유지하세요.";
            if (temp >= 28) return "더운 날씨가 예상됩니다. 수분 섭취에 신경 쓰세요.";
            return "평온한 하루가 예상됩니다. 즐거운 하루 보내세요!";
        }

        const firstHourKey = Object.keys(hourlyData).sort()[0];
        const firstHourData = hourlyData[firstHourKey] || {};
        document.getElementById('current-temp').textContent = firstHourData.TMP || '--';
        document.getElementById('current-sky').textContent = {1: "맑음", 3: "구름많음", 4: "흐림"}[firstHourData.SKY] || '정보없음';
        document.getElementById('temp-max').textContent = forecastItems.find(i => i.category === 'TMX')?.fcstValue || '--';
        document.getElementById('temp-min').textContent = forecastItems.find(i => i.category === 'TMN')?.fcstValue || '--';
        document.getElementById('feel-temp').textContent = firstHourData.TMP || '--';

        const hourlyContainer = document.getElementById('hourly-container');
        hourlyContainer.innerHTML = '';
        const allSortedKeys = Object.keys(hourlyData).sort();
        const displayKeys = allSortedKeys.slice(0, 24);
        
        displayKeys.forEach(time => {
            const hourData = hourlyData[time];
            if (!hourData) return;
            const icon = getWeatherIcon(hourData.SKY, hourData.PTY);
            const displayTime = `${parseInt(time.substring(0, 2))}시`;
            const itemDiv = document.createElement('div');
            itemDiv.className = 'hourly-item';
            itemDiv.innerHTML = `<div class="time">${displayTime}</div><div class="icon">${icon}</div><div class="temp">${hourData.TMP}°</div>`;
            hourlyContainer.appendChild(itemDiv);
        });
        
        const snowAlerts = forecastItems.filter(item => item.category === 'SNO' && parseFloat(item.fcstValue) > 0);
        document.getElementById('summary-text').textContent = generateSummaryText(firstHourData, snowAlerts);
        
        const snowAlertsList = document.getElementById('snow-alerts');
        if (snowAlerts.length > 0) {
            snowAlertCard.style.display = 'block';
            snowAlertsList.innerHTML = '';
            snowAlerts.forEach(alert => {
                const time = alert.fcstTime;
                const hourDataForAlert = hourlyData[time] || {};
                const temp = hourDataForAlert.TMP;
                const wind = hourDataForAlert.WSD;
                const snow = alert.fcstValue;
                let warning = "차량 운행 시 미끄럼에 주의하세요.";
                if (parseFloat(snow) >= 3.0) warning = "대설주의보 수준의 눈입니다. 가급적 외출을 자제하세요.";
                if (parseFloat(wind) >= 9.0) warning += " 강풍을 동반하여 눈보라가 칠 수 있습니다.";
                const li = document.createElement('li');
                li.innerHTML = `<div class="alert-time">${parseInt(time.substring(0,2))}시 예보</div><div class="alert-details"><span>적설: ${snow}cm</span> | <span>기온: ${temp}°C</span> | <span>풍속: ${wind}m/s</span></div><div class="alert-warning">${warning}</div>`;
                snowAlertsList.appendChild(li);
            });
        } else {
            snowAlertCard.style.display = 'none';
        }
    }

    // --- 2. API 데이터 호출 및 UI 업데이트 실행 ---
    fetch(finalUrl)
        .then(response => response.json())
        .then(data => {
            console.log("✅ API 호출 성공!", data);
            originalForecastItems = data.response.body.items.item;
            updateUI(originalForecastItems);
        })
        .catch(error => {
            console.error("❌ API 호출 오류:", error);
            document.getElementById('summary-text').textContent = "데이터 로딩 실패. 새로고침 해주세요.";
        });

    // --- 3. 시간대별 예보 스크롤 기능 ---
    const hourlyContainer = document.getElementById('hourly-container');
    const scrollLeftBtn = document.getElementById('scroll-left-btn');
    const scrollRightBtn = document.getElementById('scroll-right-btn');
    const scrollAmount = 300;

    scrollLeftBtn.addEventListener('click', () => {
        hourlyContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    scrollRightBtn.addEventListener('click', () => {
        hourlyContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    // --- 4. 테스트 모드 (치트 코드) 기능 ---
    let keySequence = '';
    document.addEventListener('keydown', (e) => {
        keySequence += e.key;
        keySequence = keySequence.slice(-3);

        if (keySequence === '111') {
            console.warn('⚠️ 테스트 모드: 폭설 경보 생성');
            const testItems = JSON.parse(JSON.stringify(originalForecastItems));
            for (let i = 1; i <= 2; i++) {
                const targetTime = `${String(now.getHours() + i).padStart(2, '0')}00`;
                const snowValue = i === 1 ? '3.5' : '5.0';
                testItems.forEach(item => {
                    if (item.fcstTime === targetTime) {
                        if (item.category === 'SNO') item.fcstValue = snowValue;
                        if (item.category === 'PTY') item.fcstValue = '3';
                        if (item.category === 'SKY') item.fcstValue = '4';
                    }
                });
            }
            updateUI(testItems);
            keySequence = '';
        }
        
        if (keySequence === '222') {
            console.warn('⚠️ 테스트 모드: 원래 데이터로 복원');
            updateUI(originalForecastItems);
            keySequence = '';
        }
    });

}); // DOMContentLoaded 이벤트 리스너 종료