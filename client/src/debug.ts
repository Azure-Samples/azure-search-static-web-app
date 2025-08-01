/**
 * Debug utility for styling components
 * Used to visualize component boundaries during development
 */

// Set this to true to enable debug mode
export const DEBUG_MODE = false;

// Debug styles to be imported and used in your app
export const debugStyles = DEBUG_MODE
  ? {
      // Debug styles for all elements
      '*': {
        outline: '1px solid red',
      },
      
      // Debug styles specifically for MUI components
      '.MuiBox-root': {
        outline: '1px solid blue !important',
      },
      '.MuiGrid-root': {
        outline: '1px solid green !important',
      },
      '.MuiContainer-root': {
        outline: '1px solid purple !important',
      },
      
      // Debug styles for basic elements
      'div': {
        outline: '1px dashed red',
      },
      'section': {
        outline: '1px dashed orange',
      },
      'header, footer': {
        outline: '2px solid magenta',
      },
      
      // Optional - Add component name label to top-left corner of selected elements
      '.MuiBox-root:before, .MuiGrid-root:before, .MuiContainer-root:before': {
        content: 'attr(class)',
        position: 'absolute',
        top: '0',
        left: '0',
        fontSize: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '2px',
        color: 'black',
        zIndex: 1000,
      },
    }
  : {}; // Empty object when debug mode is off
