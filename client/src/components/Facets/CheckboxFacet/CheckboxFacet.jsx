import React, { useState } from 'react';
import {
    Collapse,
    Checkbox,
    FormControlLabel,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

import './CheckboxFacet.css';

export default function CheckboxFacet(props) {
    const [isExpanded, setIsExpanded] = useState(false);

    const checkboxes = props.values.map(facetValue => {
        let isSelected = props.selectedFacets.some(facet => facet.value === facetValue.value);
        
        return (
            <ListItem
                key={facetValue.value}
                dense
                disableGutters
                id={facetValue.value}
                className="facet-value-list-item"
            >
                <FormControlLabel
                    control={
                        <Checkbox
                            disableRipple
                            checked={isSelected}
                            onChange={isSelected
                                ? () => props.removeFilter({field: props.name, value: facetValue.value})
                                : () => props.addFilter(props.name, facetValue.value)
                            }
                        />
                    }
                    label={`${facetValue.value} (${facetValue.count})`}
                />
            </ListItem>
        );
    });

    return (
        <div>
            <ListItemButton
                disableRipple
                onClick={() => setIsExpanded(!isExpanded)}
                className="facet-list-item"
                aria-expanded={isExpanded}
                aria-controls={`${props.name}-facet-values`}
            >
                <ListItemText primary={props.mapFacetName(props.name)} />
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={isExpanded} component="div" id={`${props.name}-facet-values`}>
                <List className="facet-values-list">
                    {checkboxes}
                </List>
            </Collapse>
        </div>
    );
}