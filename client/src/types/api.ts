// Types for API requests and responses

import { Document, Facet } from './models';

export interface SearchResultDocument {
  score: number;
  document: Document;
}

export interface SearchRequest {
  q: string;
  top?: number;
  skip?: number;
  facets?: string[];
  selectedFacets?: Record<string, string[]>;
}

export interface SuggestRequest {
  q: string;
  top?: number;
  suggester?: string;
}

export interface SearchResponse {
  count: number;
  facets: Record<string, Facet>;
  searchResults: SearchResultDocument[]; 
  skip?: number;
  top?: number;
}

export interface SuggestResponse {
  suggestions: {
    text: string;
    [key: string]: any;
  }[];
}

export interface LookupResponse {
  document: Document;
}
