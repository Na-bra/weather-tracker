const express = require('express');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const path = require('path');
const { fetchWeatherByCity } = require('./src/weatherService');

const app = express();
const port = process.env.PORT || 3000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 120;
const CLIENT_WEATHER_ERRORS = new Set(['City is required', 'City not found']);
const UPSTREAM_WEATHER_ERRORS = new Set(['Could not lookup city coordinates', 'Could not fetch weather data']);

app.use((req, res, next) => {
  if (!req.ip && !req.socket?.remoteAddress) {
    return res.status(400).json({ error: 'Unable to identify request source.' });
  }
  return next();
});
app.use(
  rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => ipKeyGenerator(req.ip || req.socket.remoteAddress),
    message: { error: 'Too many requests. Please try again shortly.' }
  })
);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/vendor/react', express.static(path.join(__dirname, 'node_modules', 'react', 'umd')));
app.use('/vendor/react-dom', express.static(path.join(__dirname, 'node_modules', 'react-dom', 'umd')));

app.get('/api/weather', async (req, res) => {
  try {
    const weather = await fetchWeatherByCity(req.query.city);
    res.json(weather);
  } catch (error) {
    if (CLIENT_WEATHER_ERRORS.has(error.message)) {
      return res.status(400).json({ error: error.message });
    }
    if (UPSTREAM_WEATHER_ERRORS.has(error.message)) {
      return res.status(502).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Unable to get weather right now.' });
  }
});

app.use((_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Weather tracker running on http://localhost:${port}`);
  });
}

module.exports = app;
