import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';

export const SearchMain = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

export const Row = styled(Box)(() => ({
  display: 'flex',
  flexWrap: 'wrap',
  '@media (max-width: 768px)': {
    flexDirection: 'column',
  },
}));

export const SearchBarColumn = styled(Box)(() => ({
  flex: 1,
  minWidth: '300px',
}));

export const SearchBarResults = styled(Box)(() => ({
  flex: 2,
  minWidth: '300px',
}));

export const PagerStyle = styled(Box)(() => ({
  marginLeft: 'auto',
  marginRight: 'auto',
  maxWidth: 'fit-content',
}));

export const SearchBarColumnContainer = styled(Box)(() => ({
  width: '100%',
  margin: '0 auto',
  marginTop: '10px',
}));

export const SearchResultsContainer = styled(Box)(() => ({
  flex: '0 0 100%',
  maxWidth: '100%',
}));
