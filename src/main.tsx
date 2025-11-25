import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "next-themes";
import "./index.css";

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

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <App />
  </ThemeProvider>
);
