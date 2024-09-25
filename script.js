document.getElementById('getWeather').addEventListener('click', fetchWeather);
document.getElementById('saveFavorite').addEventListener('click', saveFavorite);
document.getElementById('themeToggle').addEventListener('click', toggleTheme);
document.getElementById('unitSelector').addEventListener('change', fetchWeather);

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentTheme = localStorage.getItem('theme') || 'light';
let unit = localStorage.getItem('unit') || 'metric';

// Set initial theme and unit
setTheme(currentTheme);
document.getElementById('unitSelector').value = unit;

// Display favorites on page load
displayFavorites();

async function fetchWeather() {
    const city = document.getElementById('city').value.trim();
    const apiKey = 'f55844c5f5c1ee2e5acab129de267516'; 
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${unit}`;
    
    // Reset previous results
    resetResults();

    if (!city) {
        showError('Please enter a city name.');
        return;
    }

    showLoading();

    try {
        // Fetch current weather
        const weatherResponse = await fetch(weatherUrl);
        if (!weatherResponse.ok) {
            throw new Error('City not found. Please check your input.');
        }
        const weatherData = await weatherResponse.json();
        displayWeather(weatherData);

        // Fetch 5-day forecast
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();
        displayForecast(forecastData);

        // Initialize map
        initializeMap(weatherData.coord.lat, weatherData.coord.lon);
        
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function resetResults() {
    document.getElementById('weatherResult').classList.add('hidden');
    document.getElementById('forecastResult').classList.add('hidden');
    document.getElementById('error').classList.add('hidden');
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('map').classList.add('hidden');
}

function showLoading() {
    document.getElementById('loading').innerHTML = `<div class="spinner"></div>`;
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

function showError(message) {
    document.getElementById('error').innerHTML = `<p>Error: ${message}</p>`;
    document.getElementById('error').classList.remove('hidden');
}

function displayWeather(data) {
    const { name, main, weather, wind } = data;
    document.getElementById('weatherResult').innerHTML = `
        <h2>${name}</h2>
        <p>Temperature: ${main.temp} °${unit === 'metric' ? 'C' : 'F'}</p>
        <p>Weather: ${weather[0].description}</p>
        <p>Humidity: ${main.humidity}%</p>
        <p>Wind Speed: ${wind.speed} m/s</p>
        <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="Weather Icon" />
    `;
    document.getElementById('weatherResult').classList.remove('hidden');
    document.getElementById('saveFavorite').classList.remove('hidden');
}

function displayForecast(data) {
    const forecastContainer = document.getElementById('forecastResult');
    forecastContainer.innerHTML = '';

    const uniqueDates = [...new Set(data.list.map(item => item.dt_txt.split(' ')[0]))];
    uniqueDates.forEach(date => {
        const dailyData = data.list.filter(item => item.dt_txt.startsWith(date));
        const avgTemp = dailyData.reduce((sum, item) => sum + item.main.temp, 0) / dailyData.length;

        const dayDiv = document.createElement('div');
        dayDiv.innerHTML = `
            <h3>${date}</h3>
            <p>Average Temperature: ${avgTemp.toFixed(1)} °${unit === 'metric' ? 'C' : 'F'}</p>
            <img src="https://openweathermap.org/img/wn/${dailyData[0].weather[0].icon}@2x.png" alt="Weather Icon" />
        `;
        forecastContainer.appendChild(dayDiv);
    });

    forecastContainer.classList.remove('hidden');
}

function saveFavorite() {
    const city = document.getElementById('city').value.trim();
    if (city && !favorites.includes(city)) {
        favorites.push(city);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        displayFavorites();
    }
}

function displayFavorites() {
    const favoritesList = document.getElementById('favoritesList');
    favoritesList.innerHTML = '';
    favorites.forEach(fav => {
        const li = document.createElement('li');
        li.textContent = fav;
        li.addEventListener('click', () => {
            document.getElementById('city').value = fav;
            fetchWeather();
        });
        favoritesList.appendChild(li);
    });
}

function initializeMap(lat, lon) {
    const mapContainer = document.getElementById('map');
    mapContainer.classList.remove('hidden');
    
    const map = L.map(mapContainer).setView([lat, lon], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);
    
    L.marker([lat, lon]).addTo(map).bindPopup('Location').openPopup();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(currentTheme);
}

function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark');
        document.querySelector('.container').classList.add('dark');
        document.querySelectorAll('h1, h2').forEach(el => el.classList.add('dark'));
        document.querySelectorAll('button').forEach(el => el.classList.add('dark'));
    } else {
        document.body.classList.remove('dark');
        document.querySelector('.container').classList.remove('dark');
        document.querySelectorAll('h1, h2').forEach(el => el.classList.remove('dark'));
        document.querySelectorAll('button').forEach(el => el.classList.remove('dark'));
    }
    localStorage.setItem('theme', currentTheme);
}
