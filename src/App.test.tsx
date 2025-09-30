import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders AI Document Humanizer title', () => {
  render(<App />);
  const titleElement = screen.getByText(/AI Document Humanizer/i);
  expect(titleElement).toBeInTheDocument();
});
