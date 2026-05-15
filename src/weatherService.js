const WEATHER_CODE_MAP = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm'
};

function getConditionLabel(code) {
  return WEATHER_CODE_MAP[code] || 'Unknown conditions';
}

async function fetchWeatherByCity(city, customFetch = fetch) {
  const cleanedCity = String(city || '').trim();
  if (!cleanedCity) {
    throw new Error('City is required');
  }

  const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanedCity)}&count=1`;
  const geocodeResponse = await customFetch(geocodeUrl);

  if (!geocodeResponse.ok) {
    throw new Error('Could not lookup city coordinates');
  }

  const geocodeData = await geocodeResponse.json();
  const location = geocodeData?.results?.[0];

  if (!location) {
    throw new Error('City not found');
  }

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=3`;
  const weatherResponse = await customFetch(weatherUrl);

  if (!weatherResponse.ok) {
    throw new Error('Could not fetch weather data');
  }

  const weatherData = await weatherResponse.json();

  return {
    location: `${location.name}${location.country ? `, ${location.country}` : ''}`,
    current: {
      temperature: weatherData?.current?.temperature_2m,
      humidity: weatherData?.current?.relative_humidity_2m,
      condition: getConditionLabel(weatherData?.current?.weather_code)
    },
    forecast: (weatherData?.daily?.time || []).map((date, index) => ({
      date,
      maxTemperature: weatherData?.daily?.temperature_2m_max?.[index],
      minTemperature: weatherData?.daily?.temperature_2m_min?.[index],
      condition: getConditionLabel(weatherData?.daily?.weather_code?.[index])
    }))
  };
}

module.exports = {
  fetchWeatherByCity,
  getConditionLabel
};
