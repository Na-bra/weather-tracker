const express = require('express');
const path = require('path');
const { fetchWeatherByCity } = require('./src/weatherService');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use('/vendor/react', express.static(path.join(__dirname, 'node_modules', 'react', 'umd')));
app.use('/vendor/react-dom', express.static(path.join(__dirname, 'node_modules', 'react-dom', 'umd')));

app.get('/api/weather', async (req, res) => {
  try {
    const weather = await fetchWeatherByCity(req.query.city);
    res.json(weather);
  } catch (error) {
    res.status(400).json({ error: error.message });
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
