import React, { useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import fetchInstance from '../../url-fetch';
import {
  SearchAutocomplete,
  SearchBox,
  SearchButton,
  SearchContainer,
} from './styles';

const suggestionListStyles = {
  padding: 0,
  '& .MuiAutocomplete-option': {
    minHeight: '40px',
    padding: '8px 14px',
    textAlign: 'left',
  },
};

export default function SearchBar({ postSearchHandler, query, width }) {
  const [q, setQ] = useState(() => query || '');
  const [suggestions, setSuggestions] = useState([]);

  const search = (value) => {
    postSearchHandler(value);
  };

  useEffect(() => {
    if (q) {
      const body = { q, top: 5, suggester: 'sg' };

      fetchInstance('/api/suggest', { body, method: 'POST' })
        .then(response => {
          setSuggestions(response.suggestions.map(s => s.text));
        })
        .catch(error => {
          console.log(error);
          setSuggestions([]);
        });
    }
  }, [q]);

  const onInputChangeHandler = (event, value) => {
    setQ(value);
  };

  const onChangeHandler = (event, value) => {
    setQ(value);
    search(value);
  };

  const onEnterButton = (event) => {
    if (event.key === 'Enter') {
      search(q);
    }
  };

  return (
    <SearchContainer $wide={Boolean(width)}>
      <SearchBox>
        <SearchAutocomplete
          freeSolo
          value={q}
          options={suggestions}
          onInputChange={onInputChangeHandler}
          onChange={onChangeHandler}
          disableClearable
          ListboxProps={{ sx: suggestionListStyles }}
          renderInput={(params) => (
            <TextField
              {...params}
              id="search-box"
              placeholder="What are you looking for?"
              onBlur={() => setSuggestions([])}
              onClick={() => setSuggestions([])}
              onKeyDown={onEnterButton}
            />
          )}
        />
        <SearchButton variant="contained" onClick={() => search(q)}>
          Search
        </SearchButton>
      </SearchBox>
    </SearchContainer>
  );
}
