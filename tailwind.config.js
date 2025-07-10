/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./content/**/*.{js,ts,jsx,tsx}",
    "./background/**/*.{js,ts,jsx,tsx}",
    "./assets/**/*.{js,ts,jsx,tsx,html}",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs LinkedIn pour l'intégration
        linkedin: {
          primary: '#0a66c2',
          secondary: '#70b5f9',
          dark: '#004182',
          light: '#e7f3ff',
          gray: {
            50: '#f8f9fa',
            100: '#f1f2f4',
            200: '#e9eaed',
            300: '#d4d6da',
            400: '#a8aaae',
            500: '#666666',
            600: '#5e6266',
            700: '#434649',
            800: '#38393c',
            900: '#2c2d30'
          }
        },
        // Couleurs pour la toolbox
        toolbox: {
          bg: '#ffffff',
          border: '#e1e5e9',
          shadow: 'rgba(0, 0, 0, 0.1)',
          hover: '#f3f2ef',
          active: '#e1e5e9'
        }
      },
      fontFamily: {
        // Police LinkedIn
        linkedin: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif']
      },
      fontSize: {
        'linkedin-sm': ['13px', '16px'],
        'linkedin-base': ['14px', '20px'],
        'linkedin-lg': ['16px', '24px']
      },
      borderRadius: {
        'linkedin': '8px',
        'toolbox': '6px'
      },
      boxShadow: {
        'toolbox': '0 4px 12px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
        'toolbox-hover': '0 6px 16px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)'
      },
      spacing: {
        'toolbox': '8px',
        'toolbox-lg': '12px'
      },
      zIndex: {
        'toolbox': '9999',
        'toolbox-overlay': '10000'
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      }
    },
  },
  plugins: [],
  // Configuration pour éviter les conflits avec LinkedIn
  corePlugins: {
    preflight: false // Désactive le reset CSS par défaut
  },
  // Préfixe pour éviter les conflits
  prefix: 'ltf-', // LinkedIn Toolbox Formater
}