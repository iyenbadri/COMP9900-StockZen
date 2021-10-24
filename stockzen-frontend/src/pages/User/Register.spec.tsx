import { render, screen } from '@testing-library/react';
import React from 'react';
import Register from './Register';

jest.mock('axios', () => {
  return {};
});

describe('Register', () => {
  test('input validation', async () => {
    render(<Register></Register>);
    const createPortfolioButton = await screen.findByText(/Create account/i);
    expect(createPortfolioButton).toBeVisible();
  });
});
