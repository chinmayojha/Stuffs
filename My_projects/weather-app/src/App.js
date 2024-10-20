import React, { useState, useEffect } from 'react';
import './App.css';

const updateTextColorBasedOnBackground = (weatherData) => {
  let textColor = '#f5f5dc'; 
  document.documentElement.style.setProperty('--text-color', textColor);
};

const App = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState('metric');
  const [time, setTime] = useState('');
  const [animateTemp, setAnimateTemp] = useState(false);

  useEffect(() => {
    if (weatherData) {
      updateTextColorBasedOnBackground(weatherData);
      const currentTime = new Date(weatherData.location.localtime);
      setTime(currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setAnimateTemp(true);
      setTimeout(() => setAnimateTemp(false), 500);
    }
  }, [weatherData]);

  const handleInputChange = (e) => {
    setCity(e.target.value);
  };

  const fetchWeatherData = async () => {
    if (!city) return;
    setLoading(true);
    setError('');
    try {
      const apiKey = '12087cede0a44cc7bfe171741241910'; 
      const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`);
      if (!response.ok) throw new Error('City not found');
      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        setCity(`${latitude},${longitude}`);
        await fetchWeatherData();
      }, (error) => {
        setError('Unable to retrieve your location');
      });
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  const handleUnitToggle = () => {
    setUnit((prevUnit) => (prevUnit === 'metric' ? 'imperial' : 'metric'));
  };

  const getTemperature = (tempC) => {
    return unit === 'metric' ? `${tempC} °C` : `${(tempC * 9 / 5 + 32).toFixed(1)} °F`;
  };

  return (
    <div className={`app-container ${loading ? 'loading' : ''}`}>
      <div className="navbar">
        <h1>Weather App</h1>
      </div>
      <div className="input-container">
        <input
          type="text"
          className="input-city"
          placeholder="Enter city..."
          value={city}
          onChange={handleInputChange}
        />
        <button className="get-weather" onClick={fetchWeatherData}>
          Get Weather
        </button>
        <button className="current-location" onClick={handleCurrentLocation}>
          Use Current Location
        </button>
        <button className="toggle-unit" onClick={handleUnitToggle}>
          Toggle to {unit === 'metric' ? 'Imperial' : 'Metric'}
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      <div className={`weather-info fade-in ${loading ? 'loading-box' : ''}`}>
        {loading ? (
          <div className="spinner"></div>
        ) : (
          weatherData && (
            <>
              <h2 className={`temperature ${animateTemp ? 'animate-temp' : ''}`}>{getTemperature(weatherData.current.temp_c || 0)}</h2>
              <p className="description">{weatherData.current.condition.text}</p>
              <p className="additional-info">Wind: {weatherData.current.wind_kph} kph</p>
              <p className="additional-info">Humidity: {weatherData.current.humidity}%</p>
              <p className="additional-info">Time: {time}</p>
            </>
          )
        )}
      </div>
    </div>
  );
};

export default App;
