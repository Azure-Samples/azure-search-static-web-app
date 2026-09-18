import React, { useState } from 'react';
import { Checkbox, Collapse } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import {
    FacetListItem,
    FacetListItemText,
    FacetValueItem,
    FacetValuesList,
} from './styles.jsx';

export default function CheckboxFacet(props) {
    const [isExpanded, setIsExpanded] = useState(false);

    const checkboxes = props.values.map(facetValue => {
        let isSelected = props.selectedFacets.some(facet => facet.value === facetValue.value);

        return (
            <FacetValueItem
                key={facetValue.value}
                dense
                disableGutters
                id={facetValue.value}
            >
                <Checkbox
                    edge="start"
                    disableRipple
                    checked={isSelected}
                    onClick={isSelected
                        ? () => props.removeFilter({ field: props.name, value: facetValue.value })
                        : () => props.addFilter(props.name, facetValue.value)
                    }
                />
                <FacetListItemText primary={`${facetValue.value} (${facetValue.count})`} />
            </FacetValueItem>
        );
    });

    return (
        <div>
            <FacetListItem
                disableRipple
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <FacetListItemText primary={props.mapFacetName(props.name)} />
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
            </FacetListItem>
            <Collapse in={isExpanded} component="div">
                <FacetValuesList>
                    {checkboxes}
                </FacetValuesList>
            </Collapse>
        </div>
    );
}
