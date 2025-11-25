// This script verifies that theme colors are correctly applied in the production build
// Silent verification - only logs to window object for debugging if needed

// Check if theme colors are correctly defined
const root = document.documentElement;
const primaryColor = getComputedStyle(root).getPropertyValue('--primary').trim();
const accentColor = getComputedStyle(root).getPropertyValue('--accent').trim();
const expectedColor = '40 100% 43%';

const themeCheck = {
  'Primary Color': {
    expected: expectedColor,
    actual: primaryColor,
    status: primaryColor === expectedColor ? '✅' : '❌',
  },
  'Accent Color': {
    expected: expectedColor,
    actual: accentColor,
    status: accentColor === expectedColor ? '✅' : '❌',
  },
  'Theme Colors Applied': {
    expected: true,
    actual: primaryColor === expectedColor && accentColor === expectedColor,
    status: primaryColor === expectedColor && accentColor === expectedColor ? '✅' : '❌',
  },
};

// Log to the window object for debugging (accessible via window.__THEME_VERIFICATION)
window.__THEME_VERIFICATION = {
  ...themeCheck,
  buildTime: new Date().toISOString(),
  environment: 'production',
};
