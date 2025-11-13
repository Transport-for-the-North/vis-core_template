// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfill for URL.createObjectURL - jsdom doesn't support it
if (typeof window !== 'undefined' && window.URL && !window.URL.createObjectURL) {
  window.URL.createObjectURL = function(blob) {
    if (blob) {
      return 'blob:' + Math.random().toString(36).substring(2, 9);
    }
    return '';
  };
  
  window.URL.revokeObjectURL = function(url) {
    // No-op for tests
  };
}