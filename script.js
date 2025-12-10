const API_KEY = "fa1e72ff893c6a4a5ed4077327e855b4";
const cityValueInput = document.getElementById("cityValueInput");
const weatherBtn = document.getElementById("weatherBtn");
const weatherInfo = document.getElementById("weatherInfo");
const themeCheckBox = document.getElementById("checkChecked");
const geoWeatherBtn = document.getElementById("geoWeatherBtn");
const lastCityData = document.getElementById("dataSaves");

lastCityData.innerHTML = `
<button id="loadLastCityBtn1" class="btn btn-secondary">Load 1. City Weather</button>
<button id="loadLastCityBtn2" class="btn btn-secondary">Load 2. City Weather</button>
<button id="loadLastCityBtn3" class="btn btn-secondary">Load 3. City Weather</button>
`;

function lastCityLoadOfStorage(buttonId, storageKey) {
  document.getElementById(buttonId).onclick = () => {
    if (localStorage.getItem(storageKey)) {
      const data = JSON.parse(localStorage.getItem(storageKey));
      displayWeather(data);
    }
}
}

themeCheckBox.addEventListener("change", () => {
  if (themeCheckBox.checked) {
    document.body.classList.add("dark-theme");
  } else {
    document.body.classList.remove("dark-theme");
  }
});


document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("weather")) {
    const data = JSON.parse(localStorage.getItem("weather"));
    displayWeather(data);
  }
});

async function fetchWeather(url) {
  try {
    weatherInfo.innerHTML = `<img src="./Image20251208200339.gif" alt="loading" />`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    localStorage.setItem("weather", JSON.stringify(data));
    return data;
  } catch (error) {
    weatherInfo.innerHTML = `<p>Не удалось получить геолокацию</p>`;
  }
}

weatherBtn.onclick = async () => {
  const city = cityValueInput.value.trim();
  const lang = document.getElementById("langSelect").value;
  displayWeather(
    await fetchWeather(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=${lang}`
    )
  );
};


geoWeatherBtn.onclick = async () => {
  try {
    // 1. Получаем координаты
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    const lang = document.getElementById("langSelect").value;
    const { latitude, longitude } = position.coords;
    displayWeather(
      await fetchWeather(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=${lang}`
      )
    );
  } catch (err) {
    weatherInfo.innerHTML = `<p>Не удалось получить геолокацию</p>`;
  }
};

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
        <p><strong>Скорость ветра:</strong> ${speed} m/s</p>`;
}
