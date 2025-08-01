import { styled } from '@mui/material/styles';

// Using lightweight styled components instead of MUI components
export const FacetListItem = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 16px 8px 32px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
}));

export const FacetValueItem = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  padding: '4px 16px 4px 48px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
}));

export const FacetList = styled('ul')(() => ({
  maxHeight: '340px',
  overflowY: 'auto',
  paddingRight: '16px',
  margin: 0,
  listStyle: 'none',
}));

// Custom checkbox component
export const CustomCheckbox = styled('div')<{ checked: boolean }>(({ checked }) => ({
  width: '18px',
  height: '18px',
  border: checked ? '2px solid #1976d2' : '2px solid rgba(0, 0, 0, 0.6)',
  borderRadius: '2px',
  marginRight: '8px',
  position: 'relative',
  backgroundColor: checked ? '#1976d2' : 'transparent',
  '&::after': checked ? {
    content: '""',
    position: 'absolute',
    left: '4px',
    top: '1px',
    width: '6px',
    height: '10px',
    border: 'solid white',
    borderWidth: '0 2px 2px 0',
    transform: 'rotate(45deg)',
  } : {},
}));

// Lightweight expand/collapse icons
export const ExpandIcon = ({ expanded }: { expanded: boolean }) => (
  <div style={{ 
    width: '24px', 
    height: '24px', 
    display: 'flex', 
    alignItems: 'center',
    justifyContent: 'center',
    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: 'transform 0.3s',
  }}>
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path 
        fill="currentColor" 
        d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"
      />
    </svg>
  </div>
);