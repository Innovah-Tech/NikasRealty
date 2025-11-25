import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "next-themes";
import "./index.css";

// Suppress non-critical Firebase token refresh errors
// These occur when Firebase tries to refresh tokens for users who aren't logged in
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    // Suppress Firebase token refresh errors (400) - these are expected when not logged in
    if (message.includes('securetoken.googleapis.com') && message.includes('400')) {
      // Only suppress in production, log in development for debugging
      if (!import.meta.env.DEV) {
        return;
      }
    }
    originalError.apply(console, args);
  };
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <App />
  </ThemeProvider>
);
