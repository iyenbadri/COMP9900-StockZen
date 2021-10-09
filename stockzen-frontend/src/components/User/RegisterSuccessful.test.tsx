import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import RegisterSuccessful from './RegisterSuccessful';

test('renders register successful page', () => {
  render(
    <Router>
      <RegisterSuccessful firstName='Bill' lastName='Gate' />
    </Router>
  );
  const name = screen.getByText(/Bill Gate/i);
  expect(name).toBeVisible();
});
