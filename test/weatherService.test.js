const test = require('node:test');
const assert = require('node:assert/strict');

const { fetchWeatherByCity, getConditionLabel } = require('../src/weatherService');

test('getConditionLabel returns known and unknown labels', () => {
  assert.equal(getConditionLabel(0), 'Clear sky');
  assert.equal(getConditionLabel(999), 'Unknown conditions');
});

test('fetchWeatherByCity transforms weather API data', async () => {
  const responses = [
    {
      ok: true,
      json: async () => ({
        results: [{ name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522 }]
      })
    },
    {
      ok: true,
      json: async () => ({
        current: {
          temperature_2m: 21,
          relative_humidity_2m: 55,
          weather_code: 2
        },
        daily: {
          time: ['2026-05-15', '2026-05-16'],
          temperature_2m_max: [24, 23],
          temperature_2m_min: [16, 15],
          weather_code: [1, 3]
        }
      })
    }
  ];

  let callIndex = 0;
  const mockFetch = async () => responses[callIndex++];

  const result = await fetchWeatherByCity('Paris', mockFetch);

  assert.equal(result.location, 'Paris, France');
  assert.deepEqual(result.current, {
    temperature: 21,
    humidity: 55,
    condition: 'Partly cloudy'
  });
  assert.equal(result.forecast.length, 2);
  assert.equal(result.forecast[0].condition, 'Mainly clear');
});

test('fetchWeatherByCity validates missing city', async () => {
  await assert.rejects(() => fetchWeatherByCity('   ', async () => ({ ok: true, json: async () => ({}) })), {
    message: 'City is required'
  });
});
