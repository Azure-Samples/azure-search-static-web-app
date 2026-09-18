import CheckboxFacet from './CheckboxFacet/CheckboxFacet';
import { FacetBox, FilterList, FacetList, StyledChip } from './styles.jsx';
export default function Facets(props) {
    function mapFacetName(facetName) {
        const capitalizeFirstLetter = (string) => string[0] ? `${string[0].toUpperCase()}${string.substring(1)}` : '';
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
            return <CheckboxFacet key={key} name={key} values={props.facets[key]} addFilter={addFilter} removeFilter={removeFilter} mapFacetName={mapFacetName} selectedFacets={props.filters.filter(f => f.field === key)}/>;
        });
    }
    catch (error) {
        console.log(error);
    }
    const filters = props.filters.map((filter, index) => {
        return (<li key={index}>
                <StyledChip
                    label={`${mapFacetName(filter.field)}: ${filter.value}`}
                    onDelete={() => removeFilter(filter)}
                />
            </li>);
    });
    return (<div className="mui-facets-isolation-wrapper">
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
        </div>);
}
