import Box from '@mui/material/Box';
import Result from './Result/Result';
import { ResultsProps } from '../../types/props';
import {
  ResultsContainer,
  ResultsInfo
} from './styled';

export default function Results(props: ResultsProps) {

  let results = props.searchResultDocuments.map((result, index) => {

  let book = result?.document;
 
    return <Result 
        key={index} 
        document={book}
      />;
  });

  console.log(results[0]);

  // Provide default values for pagination properties
  const skip = props.skip ?? 0;  // Default to 0 if skip is not provided
  const count = props.count ?? 0; // Default to 0 if count is not provided
  const top = props.top ?? 8;    // Default to 8 if top is not provided

  // When there are results, show 1-based counting for beginDocNumber
  // When no results, beginDocNumber should be 0
  let beginDocNumber = count > 0 ? skip + 1 : 0;
  
  // For endDocNumber, take the smaller of (skip + top) or count
  // This ensures we don't show ranges beyond the actual number of results
  let endDocNumber = count > 0 ? Math.min(skip + top, count) : 0;

  return (
    <Box>
      <ResultsInfo variant="body1">
        {count > 0 ? (
          <>Showing {beginDocNumber}-{endDocNumber} of {count.toLocaleString()} results for <strong>{props.query ?? ""}</strong></>
        ) : (
          <>No results found for <strong>{props.query ?? ""}</strong></>
        )}
      </ResultsInfo>
      <ResultsContainer container spacing={2} justifyContent="center">
        {results}
      </ResultsContainer>
    </Box>
  );
};
