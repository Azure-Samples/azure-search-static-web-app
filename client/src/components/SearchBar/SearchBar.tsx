import { useState, useEffect, useRef, KeyboardEvent, ChangeEvent } from 'react';
import Box from '@mui/material/Box';
import fetchInstance from '../../url-fetch';
import { SearchBarProps } from '../../types/props';
import { SuggestRequest, SuggestResponse } from '../../types/api';
import {
  SearchContainer,
  SearchBox,
  SearchInput,
  SearchButton,
  SuggestionList,
  SuggestionItem
} from './styles';

export default function SearchBar({ postSearchHandler, query, width }: SearchBarProps) {
  const [q, setQ] = useState<string>(() => query || '');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const search = (value: string): void => {
    postSearchHandler(value);
  };

  useEffect(() => {
    if (q) {
      const body: SuggestRequest = { q, top: 5, suggester: 'sg' };

      fetchInstance<SuggestResponse>('/api/suggest', { body, method: 'POST' })
      .then((response: SuggestResponse) => {
        setSuggestions(response.suggestions.map((s) => s.text));
      })
      .catch((error: Error) => {
        console.log(error);
        setSuggestions([]);
      });
    } else {
      setSuggestions([]);
    }
  }, [q]);

  // Handle enter key in the search field
  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      search(q);
    }
  };

  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Handle selecting suggestion
  const handleSuggestionClick = (suggestion: string): void => {
    setQ(suggestion);
    search(suggestion);
    setShowSuggestions(false);
  };

  return (
    <Box className="mui-searchbar-isolation-wrapper" sx={{ width: width || 'auto' }}>
      <SearchContainer>
        <SearchBox>
          <div style={{ position: 'relative', width: '100%' }}>
            <SearchInput
              ref={inputRef}
              value={q}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => {
                // Delay to allow click on suggestion
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              onKeyPress={handleKeyPress}
              id="search-box"
              placeholder="What are you looking for?"
              style={{ width: '100%' }}
            />
            {showSuggestions && suggestions.length > 0 && (
              <SuggestionList>
                {suggestions.map((suggestion: string, index: number) => (
                  <SuggestionItem 
                    key={`suggestion-${index}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </SuggestionItem>
                ))}
              </SuggestionList>
            )}
          </div>
          <SearchButton onClick={() => search(q)}>
            Search
          </SearchButton>
        </SearchBox>
      </SearchContainer>
    </Box>
  );
}