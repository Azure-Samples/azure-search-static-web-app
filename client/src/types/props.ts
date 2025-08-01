// Types for React component props
import { Document, Facet } from './models';
import { SearchResultDocument } from './api';

export interface SearchBarProps {
  postSearchHandler: (query: string) => void;
  query?: string;
  width?: string | number;
}

export interface ResultsProps {
  query?: string;
  searchResultDocuments: SearchResultDocument[];
  count?: number;
  skip?: number;
  top?: number;
}

export interface ResultProps {
  document: Document;
}

export interface PagerProps {
  pageCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export interface FacetsProps {
  facets?: Record<string, Facet[]>;
  onFacetValueSelection: (fieldName: string, value: string, selected: boolean) => void;
  selectedFacets: Record<string, string[]>;
}

export interface CheckboxFacetProps {
  fieldName: string;
  values: Array<{value: string; count: number; selected: boolean}>;
  onSelection: (fieldName: string, value: string, selected: boolean) => void;
  selectedFacets: Record<string, string[]>;
}
