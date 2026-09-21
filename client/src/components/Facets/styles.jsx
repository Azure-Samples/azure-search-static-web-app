import { styled } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';

export const FacetBox = styled('div')(() => ({
    height: '100%',
    boxShadow: 'none',
    backgroundColor: 'transparent',
}));

export const FilterList = styled('ul')(() => ({
    display: 'flex',
    flexWrap: 'wrap',
    padding: '8px 0',
    margin: 0,
    listStyle: 'none',
}));

export const StyledChip = styled(Chip)(() => ({
    margin: '4px',
}));

export const FacetList = styled(List)(() => ({
    marginTop: '32px',
    padding: 0,
}));
