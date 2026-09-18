import React, { useEffect, useState} from 'react';
import fetchInstance from '../../url-fetch';
import CircularProgress from '@mui/material/CircularProgress';
import { useLocation, useNavigate } from "react-router-dom";
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Facet } from '../../types/models';
import { SearchResponse, SearchResultDocument } from '../../types/api';

import Results from '../../components/Results/Results';
import Pager from '../../components/Pager';
import Facets from '../../components/Facets/Facets';
import SearchBar from '../../components/SearchBar/SearchBar';

import { 
  SearchMain, 
  SearchBarColumn, 
  SearchBarResults, 
  SearchBarColumnContainer, 
  SearchResultsContainer,
  PagerStyle
} from './styled';

export default function Search(): React.ReactElement {

  let location = useLocation();
  const navigate = useNavigate();

  const [results, setResults] = useState<SearchResultDocument[]>([]);

  const [q, setQ] = useState<string>(new URLSearchParams(location.search).get('q') ?? "*");

  const [resultCount, setResultCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [top] = useState<number>(Number(new URLSearchParams(location.search).get('top')) || 8);
  const [skip, setSkip] = useState<number>(Number(new URLSearchParams(location.search).get('skip')) || 0);
  const [filters, setFilters] = useState<string[]>([]);
  const [facets, setFacets] = useState<Record<string, Facet>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  let resultsPerPage = top;

  // Handle page changes in a controlled manner
  function handlePageChange(newPage: number): void {
    setCurrentPage(newPage);
  }

  // Calculate skip value and fetch results when relevant parameters change
  useEffect(() => {
    // Calculate skip based on current page
    const calculatedSkip = (currentPage - 1) * top;
    
    // Only update if skip has actually changed
    if (calculatedSkip !== skip) {
      setSkip(calculatedSkip);
      return; // Skip the fetch since skip will change and trigger another useEffect
    }
    
    // Proceed with fetch
    setIsLoading(true);
    
    const body = {
      q: q,
      top: top,
      skip: skip,
      filters: filters
    };

    
    fetchInstance<any>('/api/search', { body, method: 'POST' })
      .then(apiResponse => {
        // Map API response to our new interface
        const response: SearchResponse = {
          count: apiResponse.count || 0,
          facets: apiResponse.facets || {},
          // Map existing results or documents to our new searchResults property
          searchResults: (apiResponse.results || apiResponse.documents || []) as SearchResultDocument[],
          skip: apiResponse.skip,
          top: apiResponse.top
        };
        
        setResults(response.searchResults);
        setFacets(response.facets);
        setResultCount(response.count);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Search error:', error);
        setIsLoading(false);
      });
  }, [q, top, skip, filters, currentPage]);

  // pushing the new search term to history when q is updated
  // allows the back button to work as expected when coming back from the details page
  useEffect(() => {
    navigate('/search?q=' + q);
    setCurrentPage(1);
    setFilters([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);


  let postSearchHandler = (searchTerm: string): void => {
    setQ(searchTerm);
  }


  // filters should be applied across entire result set, 
  // not just within the current page
  const updateFilterHandler = (newFilters: string[]): void => {

    // Reset paging
    setSkip(0);
    setCurrentPage(1);

    // Set filters
    setFilters(newFilters);
  };

  return (
    <Container maxWidth={false} component={SearchMain} sx={{ marginTop: 2 }}>
      <Grid container spacing={2} sx={{ px: 2, marginTop: 2 }}> {/* Added horizontal padding and top margin */}
        <Grid item xs={12} md={3} component={SearchBarColumn} sx={{ 
          padding: '8px 16px 16px 16px',
          borderRight: '1px solid #f0f0f0'
        }}>
          <SearchBarColumnContainer>
            <SearchBar postSearchHandler={postSearchHandler} query={q} width={undefined}></SearchBar>
          </SearchBarColumnContainer>
          <Facets facets={facets} filters={filters} setFilters={updateFilterHandler}></Facets>
        </Grid>
        <Grid item xs={12} md={9} component={SearchBarResults}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress />
            </Box>
          ) : (
            <SearchResultsContainer>
              <Results searchResultDocuments={results} top={top} skip={skip} count={resultCount} query={q} ></Results>
              <PagerStyle>
                <Pager currentPage={currentPage} resultCount={resultCount} resultsPerPage={resultsPerPage} onPageChange={handlePageChange}></Pager>
              </PagerStyle>
            </SearchResultsContainer>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
