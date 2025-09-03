// If anything in your code needs crypto.getRandomValues, polyfill it:
import { webcrypto } from 'node:crypto';
Object.defineProperty(globalThis, 'crypto', { value: webcrypto });

// If you use fetch anywhere, uncomment:
// import 'whatwg-fetch';

// If you installed @testing-library/jest-dom, uncomment:
// import '@testing-library/jest-dom';
