import { render, screen } from '@testing-library/react';
import React from 'react';
import Register from './Register';

jest.mock('axios', () => {
  return {};
});

describe('Register', () => {
  test('input validation', () => {
    render(<Register></Register>);
    const createPortfolioButton = screen.get(/Create a portfolio/i);
    expect(createPortfolioButton).toBeVisible();
  });
});
