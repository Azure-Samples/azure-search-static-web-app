import { styled } from '@mui/material/styles';
// Styled div instead of Card to reduce bundle size
export const ResultCard = styled('div')(() => ({
    width: '200px',
    padding: '8px',
    textAlign: 'center',
    border: '1px solid #eee',
    boxShadow: '0 2px 3px #ccc',
    margin: '10px',
    marginBottom: '3px',
    paddingBottom: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    height: '220px', // Fixed height for consistent card sizing
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden', // Prevent content overflow
    '&:hover': {
        backgroundColor: '#C0DDF5',
    },
}));
// Styled anchor wrapping the whole card. The theme's global `a` color
// override applies app-wide link color; result cards use the approved
// Azure blue link color instead.
export const ResultLink = styled('a')(({ theme }) => ({
    textDecoration: 'none',
    display: 'block',
    height: '100%',
    color: theme.palette.secondary.main,
}));
// Styled img instead of CardMedia to reduce bundle size
export const ResultImage = styled('img')(() => ({
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: 'block',
    margin: '0 auto',
    backgroundColor: '#ffffff',
}));
// Styled div instead of Typography to reduce bundle size
export const TitleText = styled('div')(({ theme }) => ({
    fontSize: '0.9em',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    lineHeight: '1.4em',
    minHeight: '2.8em', // Force minimum height for 2 lines
    color: theme.palette.secondary.main,
    padding: '0 8px',
    textAlign: 'center',
    width: '100%'
}));
