import { styled } from '@mui/material/styles';
// Using styled HTML elements instead of MUI components to reduce bundle size
export const SearchContainer = styled('div')(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '0 auto',
  width: '100%',
}));

export const SearchBox = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  // Make sure the input field takes up most of the space
  '& > div': {
    flexGrow: 1,
    width: 'calc(100% - 100px)', // Accounting for button width + margin
  }
}));

// Custom lightweight autocomplete implementation
export const SearchInput = styled('input')(() => ({
  width: '100%',
  padding: '10px 14px',
  fontSize: '16px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  outline: 'none',
  height: '40px',
  boxSizing: 'border-box',
  '&:focus': {
    borderColor: '#1976d2',
    boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
  }
}));

export const SuggestionList = styled('ul')(() => ({
  position: 'absolute',
  zIndex: 1000,
  background: 'white',
  width: '100%',
  maxHeight: '200px',
  overflowY: 'auto',
  borderRadius: '4px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  margin: 0,
  padding: 0,
  listStyle: 'none',
}));

export const SuggestionItem = styled('li')(() => ({
  padding: '8px 14px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#f5f5f5'
  }
}));

export const SearchButton = styled('button')(() => ({
  marginLeft: '8px',
  height: '40px',
  minWidth: '80px', // Fixed minimum width for the button
  padding: '0 16px',
  backgroundColor: '#1976d2',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontWeight: 500,
  cursor: 'pointer',
  flexShrink: 0, // Prevent button from shrinking
  '&:hover': {
    backgroundColor: '#1565c0'
  }
}));