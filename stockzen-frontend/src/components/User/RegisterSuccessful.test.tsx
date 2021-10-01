import { render, screen } from '@testing-library/react';
import React from 'react';
import RegisterSuccessful from './RegisterSuccessful';

test('renders register successful page', () => {
  render(<RegisterSuccessful firstName='Bill' lastName='Gate' />);
  const name = screen.getByText(/Bill Gate/i);
  expect(name).toBeVisible();
});
