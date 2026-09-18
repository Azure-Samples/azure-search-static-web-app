import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
export const HomeSearchContainer = styled(Box)(() => ({
    margin: '5em auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
}));
export const CenterContainer = styled(Box)(() => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '5em',
}));
export const LogoImage = styled('img')(() => ({
    height: '12em',
    width: 'auto',
    display: 'block',
    margin: 'auto auto 0',
    objectFit: 'contain',
    maxWidth: '100%',
}));
export const HomeSearchBar = styled(Box)(() => ({
    textAlign: 'center',
    display: 'block',
    margin: 'auto auto 0',
    width: '100%',
    maxWidth: '800px', // Set a max width for large screens
    paddingRight: '20px',
    paddingLeft: '20px',
}));
export const SearchControlsRow = styled(Box)(() => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    marginTop: '1em',
}));
