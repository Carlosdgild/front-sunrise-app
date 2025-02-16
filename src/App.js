// src/App.js
import React, { useState } from 'react';
import Form from './components/Form';

const App = () => {
  const [historicalData, setHistoricalData] = useState([]);

  const fetchData = (data) => {
    setHistoricalData(data);
  };

  return (
    <div>
      <Form onSubmit={fetchData} />
    </div>
  );
};

export default App;
