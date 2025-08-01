import { styled } from '@mui/material/styles';
// Styled components using basic HTML elements to reduce bundle size
export const FacetBox = styled('div')(() => ({
  height: '100%',
  boxShadow: 'none',
  backgroundColor: 'transparent',
  borderRadius: 0,
}));

export const FilterList = styled('ul')(() => ({
  display: 'flex',
  flexWrap: 'wrap',
  padding: '8px 0',
  margin: 0,
  listStyle: 'none',
}));

// Custom lightweight chip component instead of MUI Chip
export const StyledChip = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  height: '32px',
  margin: '4px',
  padding: '0 12px',
  fontSize: '0.8125rem',
  backgroundColor: '#e0e0e0',
  borderRadius: '16px',
  cursor: 'default',
  '&:hover': {
    backgroundColor: '#bdbdbd',
  },
}));

export const ChipLabel = styled('span')(() => ({
  padding: '0 8px 0 0',
}));

export const ChipDeleteButton = styled('button')(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '16px',
  height: '16px',
  padding: 0,
  fontSize: '14px',
  lineHeight: 1,
  color: '#666',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '50%',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
}));

export const FacetList = styled('nav')(() => ({
  marginTop: '32px',
  padding: 0,
}));