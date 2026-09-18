import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// Styled components for MUI isolation
export const ResultsContainer = styled(Grid)(() => ({
  display: 'flex',
  flexFlow: 'row wrap',
  justifyContent: 'center',
  width: '100%',
  margin: 'auto',
  '& > *': {
    height: 'auto', // Allow natural height
    alignSelf: 'stretch' // Make each grid item stretch to fill its cell
  }
}));

export const ResultsInfo = styled(Typography)(() => ({
  margin: '1em',
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
}));