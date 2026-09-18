import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

export const SearchContainer = styled('div', {
  shouldForwardProp: prop => prop !== '$wide',
})(({ $wide }) => ({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  margin: '0 auto',
  width: $wide ? '100%' : 'auto',
}));

export const SearchBox = styled('div')({
  alignItems: 'center',
  display: 'flex',
  width: '100%',
});

export const SearchAutocomplete = styled(Autocomplete)(({ theme }) => ({
  flexGrow: 1,
  '& .MuiAutocomplete-endAdornment': {
    display: 'none',
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
    height: '40px',
    padding: 0,
  },
  '& .MuiOutlinedInput-input': {
    boxSizing: 'border-box',
    height: '40px',
    padding: theme.spacing(1.25, 1.75),
  },
}));

export const SearchButton = styled(Button)(({ theme }) => ({
  flexShrink: 0,
  height: '40px',
  marginLeft: theme.spacing(1),
  minWidth: '80px',
  textTransform: 'none',
}));
