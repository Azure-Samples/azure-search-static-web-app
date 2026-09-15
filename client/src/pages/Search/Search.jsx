import React, { useEffect, useState } from 'react';
import fetchInstance from '../../url-fetch';
import CircularProgress from '@mui/material/CircularProgress';
import { useLocation, useNavigate } from "react-router-dom";

import Results from '../../components/Results/Results';
import Pager from '../../components/Pager/Pager';
import Facets from '../../components/Facets/Facets';
import SearchBar from '../../components/SearchBar/SearchBar';

import "./Search.css";

export default function Search() {

  const location = useLocation();
  const navigate = useNavigate();
  const urlQuery = new URLSearchParams(location.search).get('q') || '*';

  const [results, setResults] = useState([]);
  const [resultCount, setResultCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [top] = useState(Number(new URLSearchParams(location.search).get('top')) || 8);
  const [filters, setFilters] = useState([]);
  const [facets, setFacets] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const skip = (currentPage - 1) * top;
  const resultsPerPage = top;

  // Handle page changes in a controlled manner
  function handlePageChange(newPage) {
    setCurrentPage(newPage);
  }

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    const body = {
      q: urlQuery,
      top,
      skip,
      filters,
    };

    fetchInstance('/api/search', {
      body,
      method: 'POST',
      signal: controller.signal,
    })
      .then(response => {
        setResults(response.results);
        setFacets(response.facets);
        setResultCount(response.count);
        setIsLoading(false);
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          console.error(error);
          setResults([]);
          setFacets({});
          setResultCount(0);
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [filters, skip, top, urlQuery]);

  const postSearchHandler = (searchTerm) => {
    const nextQuery = searchTerm?.trim() || '*';
    setCurrentPage(1);
    setFilters([]);
    navigate(`/search?q=${encodeURIComponent(nextQuery)}`);
  };

  // filters should be applied across entire result set, 
  // not just within the current page
  const updateFilterHandler = (newFilters) => {

    // Reset paging
    setCurrentPage(1);

    // Set filters
    setFilters(newFilters);
  };

  return (
    <main className="main main--search container-fluid">
      <div className="row">
        <div className="search-bar-column col-md-3">
          <div className="search-bar-column-container">
            <SearchBar postSearchHandler={postSearchHandler} query={urlQuery} width={false}></SearchBar>
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
              <Results documents={results} top={top} skip={skip} count={resultCount} query={urlQuery}></Results>
              <Pager className="pager-style" currentPage={currentPage} resultCount={resultCount} resultsPerPage={resultsPerPage} onPageChange={handlePageChange}></Pager>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
