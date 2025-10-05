// js/script.js - 최종 버그 수정 버전

// [❗ 수정된 부분] originalUrl의 오타('.k.')를 제거했습니다.
const API_KEY = "WUjoGM8jQl2I6BjPI7JdYw";
const originalUrl = "https://apihub.kma.go.kr/api/typ02/openApi/VilageFcstInfoService_2.0/getVilageFcst";
const proxyUrl = "https://cors-anywhere.herokuapp.com/";

// 시간 계산 로직 (변경 없음)
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

fetch(finalUrl)
    .then(response => response.json())
    .then(data => {
        console.log("✅ API 호출 성공!", data);

        const summaryElement = document.getElementById('report-summary');
        const alertsListElement = document.getElementById('snow-alerts');
        const weatherInfoElement = document.getElementById('weather-info');

        const forecastItems = data.response.body.items.item;
        
        const snowAlerts = [];
        const currentWeatherData = {};

        // 데이터 추출 로직 (이전과 동일)
        for (const item of forecastItems) {
            const category = item.category;
            const value = item.fcstValue;

            if (category === "SNO" && parseFloat(value) > 0) {
                snowAlerts.push(item);
            }
            if (category === "TMP" && currentWeatherData.temperature === undefined) {
                currentWeatherData.temperature = value;
            }
            if (category === "REH" && currentWeatherData.humidity === undefined) {
                currentWeatherData.humidity = value;
            }
            if (category === "PCP" && currentWeatherData.precipitation === undefined) {
                currentWeatherData.precipitation = value;
            }
        }

        // 화면 표시 로직 (이전과 동일)
        let weatherHtml = `현재 기온: ${currentWeatherData.temperature}°C  |  습도: ${currentWeatherData.humidity}%`;
        if (currentWeatherData.precipitation && currentWeatherData.precipitation !== "강수없음") {
            weatherHtml += `  |  시간당 강수량: ${currentWeatherData.precipitation}`;
        }
        weatherInfoElement.innerHTML = weatherHtml;

        if (snowAlerts.length > 0) {
            summaryElement.textContent = `🚨 주의: 총 ${snowAlerts.length}건의 유의미한 강설 예보가 있습니다.`;
            alertsListElement.innerHTML = '';
            for (const alert of snowAlerts) {
                const date = alert.fcstDate;
                const time = alert.fcstTime;
                const amount = alert.fcstValue;
                const listItem = document.createElement('li');
                listItem.textContent = `${date.substring(4, 6)}월 ${date.substring(6, 8)}일 ${time.substring(0, 2)}시에는 약 ${amount}cm의 눈이 내릴 것으로 예상됩니다.`;
                alertsListElement.appendChild(listItem);
            }
        } else {
            summaryElement.textContent = "✅ 분석 완료: 현재 유의미한 강설 예보가 없습니다.";
            summaryElement.style.color = '#28a745';
        }
    })
    .catch(error => {
        // 오류 처리 (이전과 동일)
        console.error("❌ API 호출 오류:", error);
        document.getElementById('weather-info').textContent = "날씨 정보 로딩 실패";
        document.getElementById('report-summary').textContent = "데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.";
    });