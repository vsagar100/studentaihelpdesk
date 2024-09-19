import React from 'react';

const Test = () => {
  const testApi = async () => {
    try {
      const response = await fetch('http://vm-ae-mvn-ubn22.australiaeast.cloudapp.azure.com:5000/api/test');
      const data = await response.json();
      console.log(data);
      alert(data.message);
    } catch (error) {
      console.error('Error testing API:', error);
      alert('An error occurred while testing the API.');
    }
  };

  return <button onClick={testApi}>Test API</button>;
};

export default Test;
