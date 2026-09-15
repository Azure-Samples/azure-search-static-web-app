import React, { useState } from 'react';
import { Collapse, Checkbox, List, ListItem, ListItemText } from '@mui/material';
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
                <Checkbox 
                    edge="start" 
                    disableRipple 
                    checked={isSelected}
                    onClick={ isSelected 
                        ? () => props.removeFilter({field: props.name, value: facetValue.value})
                        : () => props.addFilter(props.name, facetValue.value)
                    }
                />
                <ListItemText primary={`${facetValue.value} (${facetValue.count})`} />
            </ListItem>
        );
    });

    return (
        <div>
            <ListItem 
                disableRipple 
                button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="facet-list-item"
            >
                <ListItemText primary={props.mapFacetName(props.name)} />
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={isExpanded} component="div">
                <List className="facet-values-list">
                    {checkboxes}
                </List>
            </Collapse>
        </div>
    );
}