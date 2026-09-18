import Box from '@mui/material/Box';
import { ResultCard, ResultImage, ResultLink, TitleText } from './styled';
export default function Result(props) {
    const title = props.document.original_title || '<NO TITLE>';
    return (<Box className="mui-result-isolation-wrapper">
      <ResultCard>
        <ResultLink href={`/details/${props.document.id}`}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ height: '150px', marginBottom: '8px' }}>
              <ResultImage src={props.document.image_url} alt={props.document.original_title}/>
            </div>

            <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1
        }}>
              <TitleText>
                {title}
              </TitleText>
            </div>
          </div>
        </ResultLink>
      </ResultCard>
    </Box>);
}
