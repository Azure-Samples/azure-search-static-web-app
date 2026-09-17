// Type definitions for the application models

export interface Document {
  id: string;
  authors?: string[];
  average_rating?: string | number;
  best_book_id?: number;
  books_count?: number;
  goodreads_book_id?: number;
  image_url?: string;
  isbn?: string;
  isbn13?: string;
  language_code?: string;
  original_publication_year?: string | number;
  original_title?: string;
  ratings_1?: number;
  ratings_2?: number;
  ratings_3?: number;
  ratings_4?: number;
  ratings_5?: number;
  ratings_count?: number;
  small_image_url?: string;
  title?: string;
  work_id?: number;
  work_ratings_count?: number;
  work_text_reviews_count?: number;
  [key: string]: any; // Allow for additional dynamic properties
}

export interface SearchResult {
  document: Document;
  score?: number;
}

export interface FacetValue {
  value: string;
  count: number;
  selected: boolean;
}

export interface Facet {
  fieldName: string;
  values: FacetValue[];
}
