import Box from '@mui/material/Box';
import { ResultProps } from '../../../types/props';
import {
  ResultCard,
  ResultImage,
  ResultLink,
  TitleText
} from './styled';

export default function Result(props: ResultProps) {
  const title = props.document.original_title || '<NO TITLE>'; 


  console.log(props.document);
  
  return (
    <Box className="mui-result-isolation-wrapper">
      <ResultCard>
        <ResultLink href={`/details/${props.document.id}`}>
          {/* Using div with inline styles instead of Box component to reduce bundle size */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Image section - fixed height */}
            <div style={{ height: '150px', marginBottom: '8px' }}>
              <ResultImage 
                src={props.document.image_url} 
                alt={props.document.original_title}
              />
            </div>
            
            {/* Text section - centered in remaining space */}
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
    </Box>
  );
}
