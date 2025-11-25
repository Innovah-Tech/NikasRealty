import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  // Safelist to ensure CSS variables and color classes aren't purged in production
  safelist: [
    // Core theme colors
    'bg-background', 'text-foreground',
    'bg-card', 'text-card-foreground',
    'bg-popover', 'text-popover-foreground',
    'bg-primary', 'text-primary', 'border-primary', 'ring-primary',
    'bg-primary-foreground', 'text-primary-foreground',
    'bg-accent', 'text-accent', 'border-accent', 'ring-accent',
    'bg-accent-foreground',
    'bg-secondary', 'text-secondary', 'border-secondary', 'ring-secondary',
    'bg-secondary-foreground',
    'bg-muted', 'text-muted-foreground',
    'bg-destructive', 'text-destructive-foreground', 'border-destructive',
    'bg-destructive/10', 'text-destructive-foreground/80',
    'bg-border', 'border-border', 'text-border',
    'bg-input', 'ring-ring',
    'bg-foreground', 'text-background',
    
    // Gradients and shadows
    'gradient-gold', 'gradient-dark', 'gradient-hero',
    'shadow', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl',
    'shadow-luxury',
    
    // All color variants for theme colors
    {
      pattern: /^(bg|text|border|ring|from|to|via|fill|stroke|outline|shadow|ring-offset|divide|accent|caret|stroke|fill)-(background|foreground|primary|primary-foreground|secondary|secondary-foreground|accent|accent-foreground|muted|muted-foreground|destructive|destructive-foreground|border|input|ring|card|card-foreground|popover|popover-foreground)/,
      variants: ['hover', 'focus', 'active', 'dark', 'dark:hover', 'dark:focus', 'group-hover', 'group-focus'],
    },
    
    // CSS variables
    'bg-[hsl(var(--background))]',
    'text-[hsl(var(--foreground))]',
    'bg-[hsl(var(--primary))]',
    'text-[hsl(var(--primary-foreground))]',
    'border-[hsl(var(--border))]',
    'bg-[hsl(var(--card))]',
    'text-[hsl(var(--card-foreground))]',
    'bg-[hsl(var(--popover))]',
    'text-[hsl(var(--popover-foreground))]',
    'bg-[hsl(var(--muted))]',
    'text-[hsl(var(--muted-foreground))]',
    'bg-[hsl(var(--accent))]',
    'text-[hsl(var(--accent-foreground))]',
    'bg-[hsl(var(--destructive))]',
    'text-[hsl(var(--destructive-foreground))]',
    'ring-[hsl(var(--ring))]',
    'border-[hsl(var(--input))]',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
