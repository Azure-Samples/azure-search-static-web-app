import React, { useEffect, useState, Suspense } from 'react';
import fetchInstance from '../../url-fetch';
import CircularProgress from '@mui/material/CircularProgress';
import { useLocation, useNavigate } from "react-router-dom";

import Results from '../../components/Results/Results';
import Pager from '../../components/Pager/Pager';
import Facets from '../../components/Facets/Facets';
import SearchBar from '../../components/SearchBar/SearchBar';

import "./Search.css";

export default function Search() {

  let location = useLocation();
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [resultCount, setResultCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [q, setQ] = useState(new URLSearchParams(location.search).get('q') ?? "*");
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
  }


  // filters should be applied across entire result set, 
  // not just within the current page
  const updateFilterHandler = (newFilters) => {

    // Reset paging
    setSkip(0);
    setCurrentPage(1);

    // Set filters
    setFilters(newFilters);
  };

  return (
    <main className="main main--search container-fluid">
      <div className="row">
        <div className="search-bar-column col-md-3">
          <div className="search-bar-column-container">
            <SearchBar postSearchHandler={postSearchHandler} query={q} width={false}></SearchBar>
          </div>
          <Facets facets={facets} filters={filters} setFilters={updateFilterHandler}></Facets>
        </div>
        <div className="search-bar-results">
          {isLoading ? (
            <div className="col-md-9">
              <CircularProgress />
            </div>
          ) : (
            <div className="search-results-container">
              <Results documents={results} top={top} skip={skip} count={resultCount} query={q}></Results>
              <Pager className="pager-style" currentPage={currentPage} resultCount={resultCount} resultsPerPage={resultsPerPage} onPageChange={handlePageChange}></Pager>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
