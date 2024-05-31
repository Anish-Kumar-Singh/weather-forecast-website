const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "d5940014e250ebb104134ebebc23dac2";

const weatherEmojis = {
    "01d": "🌞", // clear sky day
    "01n": "🌞", // clear sky night
    "02d": "🌤", // few clouds day
    "02n": "☁️", // few clouds night
    "03d": "☁️", // scattered clouds day
    "03n": "☁️", // scattered clouds night
    "04d": "☁️", // broken clouds day
    "04n": "☁️", // broken clouds night
    "09d": "🌧", // shower rain day
    "09n": "🌧", // shower rain night
    "10d": "🌦", // rain day
    "10n": "🌧", // rain night
    "11d": "⛈️", // thunderstorm day
    "11n": "🌩", // thunderstorm night
    "13d": "❄️", // snow day
    "13n": "❄️", // snow night
    "50d": "🌫", // mist day
    "50n": "🌫", // mist night
};

const formatDate = (dateString) => {
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
}

const createWeatherCard = (cityName, weatherItem, index) => {
    const date = formatDate(weatherItem.dt_txt);
    const temp = (weatherItem.main.temp - 273.15).toFixed(2);
    const wind = weatherItem.wind.speed;
    const humidity = weatherItem.main.humidity;
    const icon = weatherItem.weather[0].icon;
    const description = weatherItem.weather[0].description;

    const emoji = weatherEmojis[icon] || "🌈"; // Default to rainbow emoji if no match

    if(index === 0) { 
        return `
            <div class="details">
                <h2>${cityName} (${date})</h2>
                <h6>Temperature: ${temp}°C</h6>
                <h6>Wind: ${wind} M/S</h6>
                <h6>Humidity: ${humidity}%</h6>
            </div>
            <div class="icon">
                <div style="font-size: 50px;">${emoji}</div>
                <h6>${description}</h6>
            </div>`;
    } else {
        return `
            <li class="card">
                <h3>${date}</h3>
                <div style="font-size: 50px;">${emoji}</div>
                <h6>Temp: ${temp}°C</h6>
                <h6>Wind: ${wind} M/S</h6>
                <h6>Humidity: ${humidity}%</h6>
            </li>`;
    }
}

const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });

        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        fiveDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", html);
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        });
    }).catch(() => {
        alert("An error occurred while fetching the weather forecast!");
    });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return;
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(API_URL).then(response => response.json()).then(data => {
        if (!data.length) return alert(`No coordinates found for ${cityName}`);
        const { lat, lon, name } = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error occurred while fetching the coordinates!");
    });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(API_URL).then(response => response.json()).then(data => {
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                alert("An error occurred while fetching the city name!");
            });
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
        });
}

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
