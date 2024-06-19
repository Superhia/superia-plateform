// src/utils/polyfills.ts

// Example polyfill for older browsers or environments that lack certain modern JavaScript features
if (typeof window !== 'undefined' && !window.Promise) {
    window.Promise = require('promise-polyfill');
  }