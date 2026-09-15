import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import './Pager.css';

// Constants
const PAGE_WINDOW = 2; // Pages to show before and after the current page

/**
 * Pagination component for search results - fully controlled by parent
 * @param {Object} props
 * @param {number} props.currentPage - Current active page number (1-based)
 * @param {number} props.resultCount - Total number of results across all pages
 * @param {number} props.resultsPerPage - Number of results displayed per page
 * @param {function} props.onPageChange - Callback function when page changes
 */
export default function Pager(props) {
    // Destructure props for cleaner code and proper dependency tracking
    const { currentPage, resultCount, resultsPerPage, onPageChange } = props;
    
    // Ensure currentPage is always an integer
    const page = parseInt(currentPage) || 1;
    const totalPages = Math.max(1, Math.ceil(resultCount / resultsPerPage));

    // Handler for changing the current page
    function handlePageChange(pageNumber) {
        // Convert to integer and clamp within valid range
        const newPage = Math.max(1, Math.min(totalPages, parseInt(pageNumber) || 1));
        
        // Only update if actually changing page
        if (newPage !== page) {
            onPageChange(newPage);
        }
    }

    // Handler for next page button click
    function handleNextPage() {
        if (page < totalPages) {
            handlePageChange(page + 1);
        }
    }

    // Handler for previous page button click
    function handlePreviousPage() {
        if (page > 1) {
            handlePageChange(page - 1);
        }
    }
    
    // Calculate page range and memoize to avoid recalculation on every render
    const { minPage, maxPage } = useMemo(() => {
        let minPage = Math.max(1, page - PAGE_WINDOW);
        let maxPage = Math.min(totalPages, page + PAGE_WINDOW);
        
        // Adjust range if we're near the start or end
        // This ensures we always show 5 pages if available
        if (maxPage - minPage < PAGE_WINDOW * 2) {
            if (page < totalPages / 2) {
                // Near start, expand end
                maxPage = Math.min(totalPages, minPage + PAGE_WINDOW * 2);
            } else {
                // Near end, expand start
                minPage = Math.max(1, maxPage - PAGE_WINDOW * 2);
            }
        }
        
        return { minPage, maxPage };
    }, [page, totalPages]);

    // Generate page links array
    function renderPageLinks() {
        const links = [];
        
        for (let i = minPage; i <= maxPage; i++) {
            if (i === page) {
                links.push(
                    <li className="page-item active" key={i}>
                        <span className="page-link" aria-current="page">
                            {i}
                        </span>
                    </li>
                );
            } else {
                links.push(
                    <li className="page-item" key={i}>
                        <button 
                            className="page-link" 
                            onClick={() => handlePageChange(i)}
                            aria-label={`Go to page ${i}`}>
                            {i}
                        </button>
                    </li>
                );
            }
        }
        return links;
    }

    // Create previous button component
    function renderPreviousButton() {
        const isFirstPage = page === 1;
        return (
            <li className={`page-item ${isFirstPage ? 'disabled' : ''}`} key="prev">
                {isFirstPage ? (
                    <span className="page-link">Previous</span>
                ) : (
                    <button 
                        className="page-link" 
                        onClick={handlePreviousPage} 
                        aria-label="Go to previous page">
                        Previous
                    </button>
                )}
            </li>
        );
    }

    // Create next button component
    function renderNextButton() {
        const isLastPage = page === totalPages;
        return (
            <li className={`page-item ${isLastPage ? 'disabled' : ''}`} key="next">
                {isLastPage ? (
                    <span className="page-link">Next</span>
                ) : (
                    <button 
                        className="page-link" 
                        onClick={handleNextPage}
                        aria-label="Go to next page">
                        Next
                    </button>
                )}
            </li>
        );
    }

    // Handle case with no results
    if (totalPages <= 0) {
        return null; // No pagination needed when there are no results
    }

    return (
        <nav aria-label="Search results pagination" className="pager">
            <ul className="pagination item">
                {renderPreviousButton()}
                {renderPageLinks()}
                {renderNextButton()}
            </ul>
        </nav>
    );
}

// PropTypes for better documentation and runtime type checking
Pager.propTypes = {
    currentPage: PropTypes.number,
    resultCount: PropTypes.number.isRequired,
    resultsPerPage: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired
};

// Default props
Pager.defaultProps = {
    currentPage: 1
};
