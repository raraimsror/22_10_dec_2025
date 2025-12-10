const API_KEY = "fa1e72ff893c6a4a5ed4077327e855b4";
const cityValueInput = document.getElementById("cityValueInput");
const weatherBtn = document.getElementById("weatherBtn");
const weatherInfo = document.getElementById("weatherInfo");
const themeCheckBox = document.getElementById("checkChecked");
const geoWeatherBtn = document.getElementById("geoWeatherBtn");
const lastCityData = document.getElementById("dataSaves");

//  Переключение темы (светлая/тёмная)
themeCheckBox.addEventListener("change", () => {
  if (themeCheckBox.checked) {
    document.body.classList.add("dark-theme");
  } else {
    document.body.classList.remove("dark-theme");
  }
});

//  При загрузке страницы показываем последнюю погоду и историю
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("weather")) {
    const data = JSON.parse(localStorage.getItem("weather"));
    displayWeather(data);
  }
  renderCityHistory();
});

//  Функция сохранения города в историю (максимум 3)
function saveCityToHistory(data) {
  let history = JSON.parse(localStorage.getItem("cityHistory")) || [];
  history.unshift(data); // добавляем новый город в начало
  if (history.length > 3) history = history.slice(0, 3); // оставляем только 3
  localStorage.setItem("cityHistory", JSON.stringify(history));
}

//  Функция отображения кнопок истории
function renderCityHistory() {
  const history = JSON.parse(localStorage.getItem("cityHistory")) || [];
  lastCityData.innerHTML = ""; // очищаем div

  history.forEach((cityData, index) => {
    const btn = document.createElement("button");
    btn.className = "btn btn-secondary m-1";
    btn.textContent = `Загрузить город ${index + 1}: ${cityData.name}`;
    btn.onclick = () => displayWeather(cityData);
    lastCityData.appendChild(btn);
  });
}

//  Функция запроса погоды
async function fetchWeather(url) {
  try {
    weatherInfo.innerHTML = `<img src="./Image20251208200339.gif" alt="loading" />`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();

    // сохраняем текущую погоду
    localStorage.setItem("weather", JSON.stringify(data));
    // добавляем в историю
    saveCityToHistory(data);
    // обновляем кнопки истории
    renderCityHistory();

    return data;
  } catch (error) {
    weatherInfo.innerHTML = `<p>Ошибка получения данных</p>`;
  }
}

//  Запрос погоды по названию города
weatherBtn.onclick = async () => {
  const city = cityValueInput.value.trim();
  const lang = document.getElementById("langSelect").value;
  if (!city) {
    weatherInfo.innerHTML = `<p style="color:red">Введите название города!</p>`;
    return;
  }
  displayWeather(
    await fetchWeather(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=${lang}`
    )
  );
};

//  Запрос погоды по геолокации
geoWeatherBtn.onclick = async () => {
  try {
    // 1. Получаем координаты пользователя
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    const lang = document.getElementById("langSelect").value;
    const { latitude, longitude } = position.coords;

    // 2. Делаем запрос погоды по координатам
    displayWeather(
      await fetchWeather(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=${lang}`
      )
    );
  } catch (err) {
    // 3. Если ошибка — выводим сообщение
    weatherInfo.innerHTML = `<p>Не удалось получить геолокацию</p>`;
  }
};

// 🔧 Функция отображения погоды
function displayWeather({
  name,
  weather: [{ icon, description }],
  main: { temp, feels_like, humidity },
  wind: { speed },
}) {
  cityValueInput.value = "";
  weatherInfo.innerHTML = `
        <p style="text-transform: uppercase;">${name}</p>
        <img class="weather-icon" src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="iconWeatherDescription">
        <p><strong>Температура: </strong>${Math.round(temp)}°C</p>
        <small><strong>Ощущается как: </strong>${Math.round(feels_like)}°C</small>
        <p><strong>Описание: </strong>${description}</p>
        <p><strong>Влажность:</strong> ${humidity}%</p>
        <p><strong>Скорость ветра:</strong> ${speed} м/с</p>`;
}