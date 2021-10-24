import { render, screen } from '@testing-library/react';
import React from 'react';
import RegisterForm from './RegisterForm';

jest.mock('axios', () => {
  return {};
});

describe('RegisterForm', () => {
  test('input validation', async () => {
    render(<RegisterForm onRegisterSuccess={() => {}}></RegisterForm>);
    expect(screen.getByText(/First Name/)).toBeVisible();
    expect(screen.getByText(/Last Name/)).toBeVisible();
    expect(screen.getByText(/Email Address/)).toBeVisible();
    expect((await screen.findAllByText(/Password/)).length).toBe(2);
    expect(screen.getByLabelText(/Confirm Password/)).toBeVisible();
    expect(screen.getByText(/Create account/)).toBeVisible();
  });
});
