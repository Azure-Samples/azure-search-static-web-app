import { useState } from 'react';

import Box from '@mui/material/Box';
import {
  FacetListItem,
  FacetValueItem,
  FacetList,
  CustomCheckbox,
  ExpandIcon
} from './styles.jsx';

export default function CheckboxFacet(props) {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    const checkboxes = props.values.map(facetValue => {
        let isSelected = props.selectedFacets.some(facet => facet.value === facetValue.value);
        
        const handleClick = () => {
            if (isSelected) {
                props.removeFilter({field: props.name, value: facetValue.value});
            } else {
                props.addFilter(props.name, facetValue.value);
            }
        };
        
        return (
            <li key={facetValue.value}>
                <FacetValueItem
                    id={facetValue.value}
                    onClick={handleClick}
                >
                    <CustomCheckbox checked={isSelected} />
                    <span style={{ 
                        fontSize: '0.875rem',
                        fontFamily: 'Roboto, Arial, sans-serif'
                    }}>
                        {`${facetValue.value} (${facetValue.count})`}
                    </span>
                </FacetValueItem>
            </li>
        );
    });

    // Simple animation styles for collapse effect
    const collapseStyle = {
        maxHeight: isExpanded ? '1000px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.3s ease-in-out',
    };

    return (
        <Box className="mui-facet-isolation-wrapper">
            <FacetListItem 
                onClick={() => setIsExpanded(!isExpanded)}
                style={{ fontWeight: 500 }}
            >
                <span style={{ 
                    fontWeight: 500,
                    fontFamily: 'Roboto, Arial, sans-serif'
                }}>
                    {props.mapFacetName(props.name)}
                </span>
                <ExpandIcon expanded={isExpanded} />
            </FacetListItem>
            <div style={collapseStyle}>
                <FacetList>
                    {checkboxes}
                </FacetList>
            </div>
        </Box>
    );
}