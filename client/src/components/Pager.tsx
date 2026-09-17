import Pagination from '@mui/material/Pagination';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

// Use Material UI's styled API for better style isolation
const StyledPagination = styled(Pagination)(() => ({
  margin: '1em auto',
  '& .MuiPaginationItem-root': {
    color: '#0078d4',
  },
  '& .MuiPaginationItem-page.Mui-selected': {
    backgroundColor: '#0078d4',
    color: 'white',
    '&:hover': {
      backgroundColor: '#106ebe',
    }
  }
}));

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

    // With Material UI's Pagination component, we don't need the custom logic for
    // next/previous page navigation or calculating page windows, as these are 
    // handled internally by the Pagination component

    // With Material UI's Pagination component, we don't need to manually render page links
    // or previous/next buttons, as they're handled by the component itself
    
    // We also don't need the page window calculation for rendering since
    // Material UI's Pagination handles this with siblingCount and boundaryCount props

    // Handle case with no results
    if (totalPages <= 0) {
        return null; // No pagination needed when there are no results
    }

    return (
        <Box 
            component="nav" 
            aria-label="Search results pagination"
            sx={{ 
                margin: 'auto', 
                display: 'flex', 
                justifyContent: 'center', 
                width: '100%'
            }}
        >
            <StyledPagination
                page={page}
                count={totalPages}
                variant="outlined"
                shape="rounded"
                onChange={(_, newPage) => handlePageChange(newPage)}
                showFirstButton
                showLastButton
                siblingCount={PAGE_WINDOW}
                boundaryCount={1}
            />
        </Box>
    );
}
