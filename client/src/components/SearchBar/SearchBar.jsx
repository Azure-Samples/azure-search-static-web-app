import React, { useState, useEffect } from 'react';
import { TextField, Autocomplete, Button, Box } from '@mui/material';
import fetchInstance from '../../url-fetch';
import './SearchBar.css';

export default function SearchBar({ postSearchHandler, query, width }) {
  const [q, setQ] = useState(() => query || '');
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsEnabled, setSuggestionsEnabled] = useState(false);

  const search = (value) => {
    setSuggestions([]);
    setSuggestionsEnabled(false);
    postSearchHandler(value);
  };

  useEffect(() => {
    setQ(query || '');
    setSuggestions([]);
    setSuggestionsEnabled(false);
  }, [query]);

  useEffect(() => {
    if (!q || !suggestionsEnabled) {
      setSuggestions([]);
      return undefined;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      const body = { q, top: 5, suggester: 'sg' };
      fetchInstance('/api/suggest', {
        body,
        method: 'POST',
        signal: controller.signal,
      })
        .then(response => {
          setSuggestions(response.suggestions.map(suggestion => suggestion.text));
        })
        .catch(error => {
          if (error.name !== 'AbortError') {
            console.error(error);
            setSuggestions([]);
          }
        });
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [q, suggestionsEnabled]);


  const onInputChangeHandler = (event, value, reason) => {
    setQ(value);
    setSuggestionsEnabled(reason === 'input');
  };


  const onChangeHandler = (event, value) => {

    setQ(value);
    search(value);
  };

  const onEnterButton = (event) => {
    // if enter key is pressed
    if (event.key === 'Enter') {
      search(q);
    }
  };

  return (
    <div
      className={width ? "search-bar search-bar-wide" : "search-bar search-bar-narrow"}
    >
      <Box className="search-bar-box">
        <Autocomplete
          className="autocomplete"
          freeSolo
          inputValue={q}
          options={suggestions}
          onInputChange={onInputChangeHandler}
          onChange={onChangeHandler}
          disableClearable
          open={suggestions.length > 0}
          renderInput={(params) => (
            <TextField
              {...params}
              id="search-box"
              className="form-control rounded-0"
              placeholder="What are you looking for?"
              onKeyDown={onEnterButton}
            />
          )}
        />
        <div className="search-button" >
          <Button variant="contained" color="primary" onClick={() => {
            search(q)
          }
          }>
            Search
          </Button>
        </div>
      </Box>
    </div>
  );
}