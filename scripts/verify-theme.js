// This script verifies that theme colors are correctly applied in the production build

console.log('🔍 Verifying theme colors in production build...');

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

console.log('🎨 Theme Verification Results:', themeCheck);

// Add visual indicator in the corner for debugging
const indicator = document.createElement('div');
indicator.style.position = 'fixed';
indicator.style.bottom = '10px';
indicator.style.right = '10px';
indicator.style.padding = '8px 12px';
indicator.style.background = 'rgba(0,0,0,0.8)';
indicator.style.color = 'white';
indicator.style.borderRadius = '4px';
indicator.style.fontFamily = 'monospace';
indicator.style.fontSize = '12px';
indicator.style.zIndex = '9999';
indicator.textContent = `Theme: ${primaryColor === expectedColor ? '✅' : '❌'}`;
document.body.appendChild(indicator);

// Also log to the window object for easier debugging
window.__THEME_VERIFICATION = {
  ...themeCheck,
  buildTime: new Date().toISOString(),
  environment: 'production',
};
