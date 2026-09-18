import Box from '@mui/material/Box';
import CheckboxFacet from './CheckboxFacet/CheckboxFacet';
import {
    StyledChip,
    ChipLabel,
    ChipDeleteButton,
    FacetBox,
    FilterList,
    FacetList
} from './styles.jsx';

export default function Facets(props) {

    function mapFacetName(facetName) {
        const capitalizeFirstLetter = (string) =>
            string[0] ? `${string[0].toUpperCase()}${string.substring(1)}` : '';
        facetName = facetName.trim();
        facetName = capitalizeFirstLetter(facetName);

        facetName = facetName.replace('_', ' ');
        return facetName;
    }

    function addFilter(name, value) {
        const newFilters = props.filters.concat({ field: name, value: value });
        props.setFilters(newFilters);
    }

    function removeFilter(filter) {      
        const newFilters = props.filters.filter((item) => item.value !== filter.value);
        props.setFilters(newFilters);
    }

    var facets;
    try {
        facets = Object.keys(props.facets).map(key => {
            return <CheckboxFacet 
                key={key}
                name={key} 
                values={props.facets[key]}
                addFilter={addFilter}
                removeFilter={removeFilter}
                mapFacetName={mapFacetName}
                selectedFacets={props.filters.filter(f => f.field === key)}
            />;
        });
    } catch (error) {
        console.log(error);
    }

    const filters = props.filters.map((filter, index) => {
        return (
            <li key={index}>
                <StyledChip>
                    <ChipLabel>{`${mapFacetName(filter.field)}: ${filter.value}`}</ChipLabel>
                    <ChipDeleteButton onClick={() => removeFilter(filter)}>×</ChipDeleteButton>
                </StyledChip>
            </li>
        );
    });

    return (
        <Box className="mui-facets-isolation-wrapper" sx={{ height: '100%' }}>
            <FacetBox>
                <div id="clearFilters" style={{ padding: '8px 16px' }}>
                    <FilterList>
                        {filters}
                    </FilterList>
                </div>
                <FacetList>
                    {facets}
                </FacetList>    
            </FacetBox>
        </Box>
    );
}