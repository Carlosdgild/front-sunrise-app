// src/components/Form.js
import React, { useState, useCallback } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';
import '../styles/Form.css';

const Form = ({ onSubmit }) => {
  const [location, setLocation] = useState('');
  const [locationName, setLocationName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [dateError, setDateError] = useState('');
  const [historicalData, setHistoricalData] = useState([]);
  const [submittedLocationName, setSubmittedLocationName] = useState('');
  const [submittedStartDate, setSubmittedStartDate] = useState('');
  const [submittedEndDate, setSubmittedEndDate] = useState('');
  const [apiError, setApiError] = useState(null);

  // Retrieve locations
  const fetchLocations = async (location) => {
    if (location.trim() === '') {
      setLocations([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/find?q=${location}&appid=5796abbde9106b7da4febfae8c44c232&units=metric`
      );
      if (response.data.count === 0) {
        setError('No locations found. Please try again.');
        setLocations([]);
        setLatitude(null);
        setLongitude(null);
        setLocationName(null);
      } else {
        setLocations(response.data.list);
        setLatitude(null);
        setLongitude(null);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError('An error occurred while fetching the data.');
      setLocations([]);
      setLatitude(null);
      setLongitude(null);
      setLocationName(null);
    }
    setLoading(false);
  };
  // Used to set .5 seconds to perform search of locations
  const debouncedFetchLocations = useCallback(debounce(fetchLocations, 500), []);
  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocation(value);
    if (!value) {
      setLatitude(null);
      setLongitude(null);
    }
    debouncedFetchLocations(value);
  };
  // When location is selected
  const handleSelectLocation = (selectedLocation) => {
    const fullLocation = `${selectedLocation.name}, ${selectedLocation.sys.country}`;
    setLocation(fullLocation);
    setLocationName(fullLocation);
    setLatitude(selectedLocation.coord.lat);
    setLongitude(selectedLocation.coord.lon);
    setLocations([]);
  };
  // Handle about dates
  const handleStartDateChange = (e) => {
    const value = e.target.value;
    setStartDate(value);
    if (endDate && value > endDate) {
      setDateError('End date must be greater than or equal to start date');
    } else {
      setDateError('');
    }
  };
  const handleEndDateChange = (e) => {
    const value = e.target.value;
    setEndDate(value);
    if (startDate && value < startDate) {
      setDateError('End date must be greater than or equal to start date');
    } else {
      setDateError('');
    }
  };
  // Submiting to the API
  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = {
      location_name: locationName || location,
      latitude: latitude,
      longitude: longitude,
      start_date: startDate,
      end_date: endDate,
    };
    setSubmittedLocationName(locationName || location);
    setSubmittedStartDate(startDate);
    setSubmittedEndDate(endDate);
    setApiError(null);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/location_informations/information_range`, {
        params: dataToSend,
      });
      if (response.data.length === 0) {
        setHistoricalData([]);
      } else {
        setHistoricalData(response.data);
      }
      onSubmit(response.data);
    } catch (error) {
      console.error("Error sending data to the API:", error);
      setHistoricalData([]);
      if (error.response) {
        setApiError(`Error: ${error.response.status} - ${error.response.data.message}`);
      } else if (error.request) {
        setApiError('Network error: Unable to reach the server.');
      } else {
        setApiError('An error occurred while fetching the historical data.');
      }
    }
  };
  // Validating if form is valid
  const isFormValid = locationName && startDate && endDate;
  return (
    <div className="main-container">
      <div>
        <form onSubmit={handleSubmit} className="centered-form">
          <h1>Sunrise Sunset App</h1>
          <div>
            <label>Location: </label>
            <input type="text" value={location} onChange={handleLocationChange} />
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {locations.length > 0 && (
              <ul>
                {locations.map((loc) => (
                  <li key={loc.id} onClick={() => handleSelectLocation(loc)}>
                    {loc.name}, {loc.sys.country}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label>Start Date: </label>
            <input type="date" value={startDate} onChange={handleStartDateChange} />
          </div>
          <div>
            <label>End Date: </label>
            <input type="date" value={endDate} onChange={handleEndDateChange} />
          </div>
          {dateError && <p>{dateError}</p>}
          <button type="submit" disabled={!isFormValid} className="submit-button">
            Submit
          </button>
        </form>
        {apiError ? (
          <div style={{ textAlign: 'center', color: 'red', fontWeight: 'bold' }}>
            <p>{apiError}</p>
          </div>
        ) : (
          historicalData.length > 0 && (
            <div className="table-container">
              <h2>Sunrise Sunset Information</h2>
              <div className="location-info">
                <p><strong>Location:</strong> {submittedLocationName}</p>
                <p><strong>From:</strong> {submittedStartDate} <strong>To:</strong> {submittedEndDate}</p>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Sunrise</th>
                    <th>Sunset</th>
                    <th>Golden Hour</th>
                  </tr>
                </thead>
                <tbody>
                  {historicalData.map((data) => (
                    <tr key={data.id}>
                      <td>{data.information_date}</td>
                      <td>{data.sunrise}</td>
                      <td>{data.sunset}</td>
                      <td>{data.golden_hour}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Form;
