const { useState } = React;

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setWeather(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Could not fetch weather data');
      }

      setWeather(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return React.createElement(
    'div',
    { className: 'container' },
    React.createElement('h1', null, 'Weather Tracker'),
    React.createElement('p', null, 'Check real-time conditions, humidity, and 3-day forecast by city.'),
    React.createElement(
      'form',
      { onSubmit: handleSubmit },
      React.createElement('input', {
        value: city,
        onChange: (event) => setCity(event.target.value),
        placeholder: 'Enter a city (e.g., London)',
        'aria-label': 'City'
      }),
      React.createElement('button', { type: 'submit', disabled: loading }, loading ? 'Loading...' : 'Get Weather')
    ),
    error ? React.createElement('div', { className: 'error' }, error) : null,
    weather
      ? React.createElement(
          'div',
          null,
          React.createElement(
            'div',
            { className: 'card' },
            React.createElement('h2', null, weather.location),
            React.createElement('p', null, `Temperature: ${weather.current.temperature}°C`),
            React.createElement('p', null, `Humidity: ${weather.current.humidity}%`),
            React.createElement('p', null, `Condition: ${weather.current.condition}`)
          ),
          React.createElement(
            'div',
            { className: 'card' },
            React.createElement('h3', null, 'Forecast'),
            React.createElement(
              'ul',
              null,
              weather.forecast.map((entry) =>
                React.createElement(
                  'li',
                  { key: entry.date },
                  `${entry.date}: ${entry.condition}, ${entry.minTemperature}°C - ${entry.maxTemperature}°C`
                )
              )
            )
          )
        )
      : null
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
