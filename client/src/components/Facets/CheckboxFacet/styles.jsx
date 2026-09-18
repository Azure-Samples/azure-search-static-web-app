import { styled } from '@mui/material/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

export const FacetListItem = styled(ListItem)(() => ({
    paddingLeft: '36px',
    cursor: 'pointer',
}));

export const FacetValueItem = styled(ListItem)(() => ({
    paddingLeft: '46px',
}));

export const FacetListItemText = styled(ListItemText)(() => ({
    '& .MuiTypography-root': {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
}));

export const FacetValuesList = styled(List)(() => ({
    maxHeight: '340px',
    overflowY: 'auto',
    marginRight: '18px',
}));
