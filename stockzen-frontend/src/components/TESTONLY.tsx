import React, { useEffect, useState } from 'react';

const TestOnly = () => {
  const [output, setOutput] = useState({});

  useEffect(() => {
    const MOCK_INPUT = {
      email: '123@123.com',
      password: 'asecret',
    };
    const loginRequest = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(MOCK_INPUT),
    };
    const loginUser = async () => {
      const response = await fetch('/users/login', loginRequest);
      const data = await response.json();
      setOutput(data);
    };
    loginUser();
  }, []);

  return <div>{JSON.stringify(output)}</div>;
};

export default TestOnly;
