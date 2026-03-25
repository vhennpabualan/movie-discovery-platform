// Jest setup file
// Add any global test setup here
import '@testing-library/jest-dom';

// Polyfill TextEncoder for jsdom environment
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}
