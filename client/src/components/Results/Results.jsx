import Box from '@mui/material/Box';
import Result from './Result/Result';
import { ResultsContainer, ResultsInfo } from './styled';
export default function Results(props) {
    let results = props.documents.map((result, index) => {
        let book = result?.document;
        return <Result key={index} document={book}/>;
    });
    let beginDocNumber = Math.min(props.skip + 1, props.count);
    let endDocNumber = Math.min(props.skip + props.top, props.count);
    return (<Box>
      <ResultsInfo variant="body1">
        Showing {beginDocNumber}-{endDocNumber} of {props.count.toLocaleString()} results for <strong>{props.query}</strong>
      </ResultsInfo>
      <ResultsContainer container spacing={2} justifyContent="center">
        {results}
      </ResultsContainer>
    </Box>);
}
;
