import { render, screen } from '@testing-library/react';
import React from 'react';
import PortfolioList from './PortfolioList';

jest.mock('axios', () => {
  return {
    get: async () => {
      return [];
    },
  };
});

// Test for PortfolioList
describe('PortfolioList', () => {
  test('scenario 1', () => {
    render(<PortfolioList></PortfolioList>);
    const createPortfolioButton = screen.getByText(/Create a portfolio/i);
    expect(createPortfolioButton).toBeVisible();
  });
});
