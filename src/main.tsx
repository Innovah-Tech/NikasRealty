import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "next-themes";
import "./index.css";

// Set theme colors immediately when the script loads
const applyThemeColors = () => {
  const root = document.documentElement;
  
  // Set theme color variables
  const themeColors = {
    '--primary': '40 100% 43%',
    '--accent': '40 100% 43%',
    '--ring': '40 100% 43%',
    '--gradient-gold': 'linear-gradient(135deg, hsl(40 100% 35%), hsl(40 100% 50%))',
    '--shadow-luxury': '0 10px 40px -10px hsl(40 100% 43% / 0.3)'
  };

  // Apply all theme colors at once
  Object.entries(themeColors).forEach(([key, value]) => {
    root.style.setProperty(key, value, 'important');
  });

  // Log theme status for debugging
  if (process.env.NODE_ENV === 'production') {
    console.log('🎨 Theme colors applied in production');
  }
};

// Run immediately and also after DOM is fully loaded
if (typeof window !== 'undefined') {
  // Apply immediately
  applyThemeColors();
  
  // Apply again after DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyThemeColors);
  } else {
    applyThemeColors();
  }
  
  // Also apply on page show (for back/forward cache)
  window.addEventListener('pageshow', applyThemeColors);
  
  // Verify theme color is loaded
  setTimeout(() => {
    const primaryColor = getComputedStyle(root).getPropertyValue('--primary');
    console.log('🎨 Theme Color Check:', {
      primaryColor,
      expected: '40 100% 43%',
      matches: primaryColor.trim() === '40 100% 43%',
      isProduction: !import.meta.env.DEV,
      buildTime: new Date().toISOString(),
      cssLoaded: !!document.querySelector('style[data-vite-dev-id], link[rel="stylesheet"]'),
    });
    
    // Also log the actual computed color
    const testElement = document.createElement('div');
    testElement.style.color = 'hsl(var(--primary))';
    document.body.appendChild(testElement);
    const computedColor = getComputedStyle(testElement).color;
    console.log('🎨 Computed Primary Color:', computedColor);
    console.log('🎨 Expected Color (RGB):', 'rgb(218, 145, 0)'); // #DA9100 in RGB
    document.body.removeChild(testElement);
    
    // If color doesn't match, log warning
    if (primaryColor.trim() !== '40 100% 43%') {
      console.warn('⚠️ Theme color mismatch! CSS may be cached. JavaScript fallback applied.');
    }
  }, 1000);
}

// Suppress non-critical Firebase token refresh errors
// These occur when Firebase tries to refresh tokens for users who aren't logged in
if (typeof window !== 'undefined') {
  const originalError = console.error;
  const originalWarn = console.warn;
  
  // Override console.error to filter out only the specific token refresh error
  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    // Only suppress the specific Firebase token refresh 400 error
    // This is a network-level error that appears in console but doesn't affect functionality
    if (message.includes('securetoken.googleapis.com') && 
        (message.includes('400') || message.includes('Failed to load resource'))) {
      // Suppress in production only - still log in development
      if (!import.meta.env.DEV) {
        return;
      }
    }
    // Log all other errors normally
    originalError.apply(console, args);
  };
  
  // Keep console.warn for important warnings
  console.warn = (...args: any[]) => {
    originalWarn.apply(console, args);
  };
}

// Startup banner for production debugging
console.log('%c🚀 Nikas Realty App Starting...', 'color: #DA9100; font-size: 16px; font-weight: bold;');
console.log('Build Info:', {
  mode: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  timestamp: new Date().toISOString(),
});

// Check which CSS files are loaded
if (typeof window !== 'undefined') {
  const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  console.log('📄 Loaded Stylesheets:', stylesheets.map(link => ({
    href: link.getAttribute('href'),
    integrity: link.getAttribute('integrity'),
  })));
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <App />
  </ThemeProvider>
);
