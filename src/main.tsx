import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "next-themes";
import "./index.css";

// Production debugging - verify theme color is loaded
if (typeof window !== 'undefined') {
  // Wait for CSS to load, then verify theme color
  setTimeout(() => {
    const root = document.documentElement;
    const primaryColor = getComputedStyle(root).getPropertyValue('--primary');
    console.log('🎨 Theme Color Check:', {
      primaryColor,
      expected: '40 100% 43%',
      matches: primaryColor.trim() === '40 100% 43%',
      isProduction: !import.meta.env.DEV,
      buildTime: new Date().toISOString(),
    });
    
    // Also log the actual computed color
    const testElement = document.createElement('div');
    testElement.style.color = 'hsl(var(--primary))';
    document.body.appendChild(testElement);
    const computedColor = getComputedStyle(testElement).color;
    console.log('🎨 Computed Primary Color:', computedColor);
    document.body.removeChild(testElement);
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

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <App />
  </ThemeProvider>
);
