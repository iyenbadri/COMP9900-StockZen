import { render, screen } from '@testing-library/react';
import React from 'react';
import App from './App';

test('renders buttons', () => {
  render(<App />);
  const registerLink = screen.getAllByText(/Register/i);
  expect(registerLink[0]).toBeInTheDocument();

  const loginLink = screen.getAllByText(/Log in/i);
  expect(loginLink[0]).toBeInTheDocument();
});
