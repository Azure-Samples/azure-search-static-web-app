import React, { useEffect, useState, Suspense } from 'react';
import fetchInstance from '../../url-fetch';
import CircularProgress from '@mui/material/CircularProgress';
import { useLocation, useNavigate } from "react-router-dom";
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Results from '../../components/Results/Results';
import Pager from '../../components/Pager/Pager';
import Facets from '../../components/Facets/Facets';
import SearchBar from '../../components/SearchBar/SearchBar';
import { SearchMain, SearchBarColumn, SearchBarResults, SearchBarColumnContainer, SearchResultsContainer, PagerStyle } from './styled';
export default function Search() {
    let location = useLocation();
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const [q, setQ] = useState(new URLSearchParams(location.search).get('q') ?? "*");
    const [resultCount, setResultCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [top] = useState(new URLSearchParams(location.search).get('top') ?? 8);
    const [skip, setSkip] = useState(new URLSearchParams(location.search).get('skip') ?? 0);
    const [filters, setFilters] = useState([]);
    const [facets, setFacets] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    let resultsPerPage = top;
    // Handle page changes in a controlled manner
    function handlePageChange(newPage) {
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
        fetchInstance('/api/search', { body, method: 'POST' })
            .then(response => {
            setResults(response.results);
            setFacets(response.facets);
            setResultCount(response.count);
            setIsLoading(false);
        })
            .catch(error => {
            console.log(error);
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
    let postSearchHandler = (searchTerm) => {
        setQ(searchTerm);
    };
    // filters should be applied across entire result set,
    // not just within the current page
    const updateFilterHandler = (newFilters) => {
        // Reset paging
        setSkip(0);
        setCurrentPage(1);
        // Set filters
        setFilters(newFilters);
    };
    return (<Container maxWidth={false} component={SearchMain} sx={{ marginTop: 2 }}>
      <Grid container spacing={2} sx={{ px: 2, marginTop: 2 }}> {/* Added horizontal padding and top margin */}
        <Grid item xs={12} md={3} component={SearchBarColumn} sx={{
            padding: '8px 16px 16px 16px',
            borderRight: '1px solid #f0f0f0'
        }}>
          <SearchBarColumnContainer>
            <SearchBar postSearchHandler={postSearchHandler} query={q} width={false}></SearchBar>
          </SearchBarColumnContainer>
          <Facets facets={facets} filters={filters} setFilters={updateFilterHandler}></Facets>
        </Grid>
        <Grid item xs={12} md={9} component={SearchBarResults}>
          {isLoading ? (<Box display="flex" justifyContent="center" p={2}>
              <CircularProgress />
            </Box>) : (<SearchResultsContainer>
              <Results documents={results} top={top} skip={skip} count={resultCount} query={q}></Results>
              <PagerStyle>
                <Pager currentPage={currentPage} resultCount={resultCount} resultsPerPage={resultsPerPage} onPageChange={handlePageChange}></Pager>
              </PagerStyle>
            </SearchResultsContainer>)}
        </Grid>
      </Grid>
    </Container>);
}
