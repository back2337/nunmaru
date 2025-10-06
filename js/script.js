// js/script.js v3.0 전체 코드

// --- API 호출 정보 및 시간 계산 (기존과 동일) ---
const API_KEY = "WUjoGM8jQl2I6BjPI7JdYw";
const originalUrl = "https://apihub.kma.go.kr/api/typ02/openApi/VilageFcstInfoService_2.0/getVilageFcst";
const proxyUrl = "https://cors-anywhere.herokuapp.com/";
const now = new Date();
let base_date = '', base_time = '';
// ... (시간 계산 로직은 이전과 동일)
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

// --- [❗ 수정된 부분] 데이터 처리 및 UI 업데이트 로직 ---
fetch(finalUrl)
    .then(response => response.json())
    .then(data => {
        console.log("✅ API 호출 성공!", data);
        const forecastItems = data.response.body.items.item;
        
        // 1. 데이터를 시간대별로 그룹화
        const hourlyData = {};
        forecastItems.forEach(item => {
            if (!hourlyData[item.fcstTime]) {
                hourlyData[item.fcstTime] = {};
            }
            hourlyData[item.fcstTime][item.category] = item.fcstValue;
        });

        // 2. 날씨 아이콘 매핑 함수
        function getWeatherIcon(sky, pty) {
            if (pty > 0) { // 강수 형태가 있으면 강수 아이콘 우선
                if (pty === 1) return '💧'; // 비
                if (pty === 2) return '🌧️'; // 비/눈
                if (pty === 3) return '❄️'; // 눈
                if (pty === 4) return '🌦️'; // 소나기
            }
            if (sky === 1) return '☀️'; // 맑음
            if (sky === 3) return '☁️'; // 구름많음
            if (sky === 4) return '🌫️'; // 흐림
            return '❓';
        }

        // 3. UI 요소에 데이터 채우기
        const firstHour = Object.keys(hourlyData).sort()[0];
        document.getElementById('current-temp').textContent = hourlyData[firstHour].TMP;
        document.getElementById('current-sky').textContent = {1: "맑음", 3: "구름많음", 4: "흐림"}[hourlyData[firstHour].SKY];
        document.getElementById('temp-max').textContent = forecastItems.find(i => i.category === 'TMX').fcstValue;
        document.getElementById('temp-min').textContent = forecastItems.find(i => i.category === 'TMN').fcstValue;
        document.getElementById('feel-temp').textContent = hourlyData[firstHour].TMP; // 간단하게 현재기온으로 대체

        // 4. 시간대별 예보 UI 생성
        const hourlyContainer = document.getElementById('hourly-container');
        hourlyContainer.innerHTML = ''; // 초기화
        Object.keys(hourlyData).sort().slice(0, 6).forEach(time => { // 6시간만 표시
            const hourData = hourlyData[time];
            const icon = getWeatherIcon(parseInt(hourData.SKY), parseInt(hourData.PTY));
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'hourly-item';
            itemDiv.innerHTML = `
                <div class="time">${time.substring(0,2)}시</div>
                <div class="icon">${icon}</div>
                <div class="temp">${hourData.TMP}°</div>
            `;
            hourlyContainer.appendChild(itemDiv);
        });
        
        // 5. 요약 정보 및 폭설 예보 처리
        document.getElementById('summary-text').textContent = "오늘도 맑고 쾌청한 하루 되세요!";
        const snowAlerts = forecastItems.filter(item => item.category === 'SNO' && parseFloat(item.fcstValue) > 0);
        const snowAlertsList = document.getElementById('snow-alerts');
        if (snowAlerts.length > 0) {
            snowAlertsList.innerHTML = snowAlerts.map(alert => `<li>${alert.fcstTime.substring(0,2)}시, 약 ${alert.fcstValue}cm 예상</li>`).join('');
        } else {
            snowAlertsList.innerHTML = '<li>현재 유의미한 강설 예보가 없습니다.</li>';
        }
    })
    .catch(error => console.error("❌ API 호출 오류:", error));