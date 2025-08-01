import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const DetailsMain = styled(Box)(() => ({
  paddingTop: '2em',
  minHeight: '40em',
}));

export const TabPanel = styled(Box)(() => ({
  width: '100%',
  position: 'relative',
  overflow: 'visible',
  backgroundColor: '#fff',
  padding: '1em',
  boxSizing: 'border-box',
  minHeight: 'auto',
}));

export const TabPanelValue = styled(Box)(() => ({
  padding: 3,
}));

export const CardBody = styled(Box)(() => ({
  height: 'inherit',
  position: 'relative',
  backgroundColor: '#fff',
  border: '1px solid #ddd',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  padding: '1em',
  margin: '1em 0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  width: '100%',
  boxSizing: 'border-box',
}));

export const ImageContainer = styled('img')(() => ({
  width: '10em',
  height: 'auto',
  marginBottom: '1em',
}));

export const CardTitle = styled(Typography)(() => ({
  fontSize: '1.2em',
  fontWeight: 'bold',
  marginBottom: '0.5em',
  textAlign: 'center',
}));

export const CardText = styled(Typography)(() => ({
  fontSize: '1em',
  marginBottom: '0.5em',
  textAlign: 'center',
}));

export const BoxHeader = styled(Box)(() => ({
  borderBottom: '1px solid var(--divider-color)',
  padding: '1em',
  backgroundColor: '#f5f5f5',
}));

export const BoxContent = styled(Box)(() => ({
  padding: '1.5em',
  backgroundColor: '#ffffff',
  border: '1px solid #ddd',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
}));

export const DetailsBoxParent = styled(Box)(() => ({
  width: '100%',
  paddingTop: '25px',
  paddingLeft: '150px',
  paddingRight: '150px',
}));

export const DetailsTabBoxHeader = styled(Box)(() => ({
  borderBottom: '1px solid',
  borderColor: 'var(--divider-color)',
}));

export const DetailsCustomTabPanelJsonDiv = styled(Box)(() => ({
  textAlign: 'left',
}));
