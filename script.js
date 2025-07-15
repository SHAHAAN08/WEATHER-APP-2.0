const apiKey = "a9b46bb586f31a7d9c42e9b17a70a4f7";

// Elements
const searchBtn = document.querySelector(".search-btn");
const cityInput = document.querySelector(".city-input");

const weatherInfoSection = document.querySelector(".weather-info");
const searchMessageSection = document.querySelector(".search-city");
const notFoundSection = document.querySelector(".not-found-city");

const countryText = document.querySelector(".country-txt");
const dateText = document.querySelector(".currrent-data-txt");
const tempText = document.querySelector(".temp-txt");
const conditionText = document.querySelector(".condition-txt");
const humidityText = document.querySelector(".Humidity-value-txt");
const windText = document.querySelector(".Wind-value-txt");
const weatherIcon = document.querySelector(".weather-summary-img");

const forecastContainer = document.querySelector(".forecast-items-container");

// Utilities
const getDateStr = () => {
  const now = new Date();
  const options = { weekday: "short", day: "numeric", month: "short" };
  return now.toLocaleDateString(undefined, options);
};

// 🟡 UPDATED: Support day/night + drizzle
const getWeatherIcon = (condition, isDaytime = true) => {
    condition = condition.toLowerCase();
  
    if (condition.includes("cloud"))
      return isDaytime
        ? "assets/weather/clouds.svg"
        : "assets/weather/cloudy-night.svg";
  
    if (condition.includes("rain")) return "assets/weather/rain.svg";
    if (condition.includes("drizzle")) return "assets/weather/drizzle.svg";
    if (condition.includes("snow")) return "assets/weather/snow.svg";
    if (condition.includes("thunder")) return "assets/weather/thunderstorm.svg";
  
    if (condition.includes("clear"))
      return isDaytime
        ? "assets/weather/clear.svg"
        : "assets/weather/clear-night.svg";
  
    return isDaytime
      ? "assets/weather/clouds.svg"
      : "assets/weather/cloudy-night.svg"; // default fallback
  };
  

// API Fetch
const getWeather = async (city) => {
  showSection("search");

  try {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    const [weatherRes, forecastRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(forecastUrl),
    ]);

    if (!weatherRes.ok || !forecastRes.ok) throw new Error("City not found");

    const weatherData = await weatherRes.json();
    const forecastData = await forecastRes.json();

    updateWeatherInfo(weatherData);
    updateForecast(forecastData.list);

    showSection("weather");
  } catch (err) {
    showSection("notFound");
  }
};

// Show/hide sections
function showSection(type) {
  weatherInfoSection.style.display = "none";
  searchMessageSection.style.display = "none";
  notFoundSection.style.display = "none";

  if (type === "weather") weatherInfoSection.style.display = "flex";
  if (type === "search") searchMessageSection.style.display = "flex";
  if (type === "notFound") notFoundSection.style.display = "flex";
}

// Update weather info
const updateWeatherInfo = (data) => {
    countryText.textContent = `${data.name}, ${data.sys.country}`;
    dateText.textContent = getDateStr();
    tempText.textContent = `${Math.round(data.main.temp)} °C`;
    conditionText.textContent = data.weather[0].main;
    humidityText.textContent = `${data.main.humidity}%`;
    windText.textContent = `${data.wind.speed} M/s`;
  
    
    const currentTime = data.dt;
    const sunrise = data.sys.sunrise;
    const sunset = data.sys.sunset;
    const isDaytime = currentTime >= sunrise && currentTime < sunset;
  
    weatherIcon.src = getWeatherIcon(data.weather[0].main, isDaytime);
  };
  

// Update 4-day forecast
const updateForecast = (forecastList) => {
  forecastContainer.innerHTML = "";

  const dailyForecast = {};
  forecastList.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    if (!dailyForecast[date] && item.dt_txt.includes("12:00:00")) {
      dailyForecast[date] = item;
    }
  });

  Object.values(dailyForecast)
    .slice(0, 4)
    .forEach((item) => {
      const date = new Date(item.dt_txt);
      const day = date.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
      });

      const forecastItem = document.createElement("div");
      forecastItem.className = "forecast-item";

      forecastItem.innerHTML = `
        <h5 class="forecast-item-date regular-txt">${day}</h5>
        <img src="${getWeatherIcon(item.weather[0].main)}" class="forecast-item-img">
        <h5 class="forecast-item-temp">${Math.round(item.main.temp)} °C</h5>
      `;

      forecastContainer.appendChild(forecastItem);
    });
};

// Default
showSection("search");

// Search button event
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city !== "") {
    getWeather(city);
  }
});
