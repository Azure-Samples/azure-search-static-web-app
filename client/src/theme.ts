import { createTheme } from '@mui/material/styles';
import { debugStyles } from './debug'; // Import debug styles

// Create a theme instance
const theme = createTheme({
  typography: {
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  },
  palette: {
    primary: {
      main: '#646cff', // From your link color
      dark: '#535bf2', // From your link hover color
      light: '#747bff', // From your light theme link hover
    },
    secondary: {
      main: '#0078d4', // Azure blue
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#213547', // From your light theme color
      secondary: '#6e6e6e',
    },
    action: {
      hover: 'rgba(100, 108, 255, 0.08)', // Light blue hover effect
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility',
        },
        body: {
          fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
          lineHeight: 1.5,
          margin: 0,
          padding: 0,
          minWidth: '320px',
        },
        h1: {
          fontSize: '3.2em',
          lineHeight: 1.1,
        },
        a: {
          fontWeight: 500,
          color: '#646cff',
          textDecoration: 'inherit',
          '&:hover': {
            color: '#747bff',
          },
        },
        button: {
          borderRadius: '8px',
          border: '1px solid transparent',
          padding: '0.6em 1.2em',
          fontSize: '1em',
          fontWeight: 500,
          fontFamily: 'inherit',
          backgroundColor: '#f9f9f9',
          cursor: 'pointer',
          transition: 'border-color 0.25s',
          '&:hover': {
            borderColor: '#646cff',
          },
          '&:focus, &:focus-visible': {
            outline: '4px auto -webkit-focus-ring-color',
          },
        },
      },
    },
  },
});

// Define global styles that can be used with MUI's GlobalStyles component
export const globalStyles = {
  ':root': {
    // Base font styles
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
    lineHeight: 1.5,
    fontWeight: 400,
    
    // Text rendering optimizations
    fontSynthesis: 'none',
    textRendering: 'optimizeLegibility',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    
    // Light theme colors
    color: '#213547',
    backgroundColor: '#ffffff',
  },
  
  // Debug styles imported from debug.js
  // To enable/disable, just change DEBUG_MODE in debug.js
  ...debugStyles,
  
  // Link styles
  'a': {
    fontWeight: 500,
    color: '#646cff',
    textDecoration: 'inherit',
  },
  'a:hover': {
    color: '#747bff',
  },
  
  // Body styles
  'body': {
    margin: 0,
    padding: 0,
    minWidth: '320px',
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
  },
  
  // Heading styles
  'h1': {
    fontSize: '3.2em',
    lineHeight: 1.1,
  },
  
  // Button styles
  'button': {
    borderRadius: '8px',
    border: '1px solid transparent',
    padding: '0.6em 1.2em',
    fontSize: '1em',
    fontWeight: 500,
    fontFamily: 'inherit',
    backgroundColor: '#f9f9f9', // Light theme button color
    cursor: 'pointer',
    transition: 'border-color 0.25s',
  },
  'button:hover': {
    borderColor: '#646cff',
  },
  'button:focus, button:focus-visible': {
    outline: '4px auto -webkit-focus-ring-color',
  },
  
  // Box sizing for all elements
  '*, *::before, *::after': {
    boxSizing: 'border-box',
  },
};

export default theme;
