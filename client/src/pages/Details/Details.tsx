import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import Rating from '@mui/material/Rating';
import CircularProgress from '@mui/material/CircularProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

import fetchInstance from '../../url-fetch';
import { Document } from '../../types/models';

import {
  TabPanel,
  TabPanelValue,
  CardBody,
  ImageContainer,
  CardTitle,
  CardText,
  BoxContent,
  DetailsBoxParent,
  DetailsTabBoxHeader,
  DetailsCustomTabPanelJsonDiv
} from './styled';


interface CustomTabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
  component?: React.ElementType;
  [key: string]: any; // For other props
}

function CustomTabPanel(props: CustomTabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <TabPanel
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <TabPanelValue>{children}</TabPanelValue>}
    </TabPanel>
  );
}

export default function BasicTabs() {
  const { id } = useParams();
  const [document, setDocument] = useState<Document>({} as Document);
  const [value, setValue] = React.useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchInstance('/api/lookup', { query: { id: id as string } })
      .then(response => {
        console.log(JSON.stringify(response))
        const doc = response.document;
        setDocument(doc);
        setIsLoading(false);
      })
      .catch(error => {
        console.log(error);
        setIsLoading(false);
      });

  }, [id]);

  const handleChange = (_, newValue) => {
    setValue(newValue);
  };


  if (isLoading || !id || Object.keys(document).length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2em' }}>
        <CircularProgress />
        <Box sx={{ mt: 2 }}>Loading...</Box>
      </Box>
    );
  }

  return (
    <DetailsBoxParent>
      <DetailsTabBoxHeader>
        <Tabs value={value} onChange={handleChange} aria-label="book-details-tabs">
          <Tab label="Result" />
          <Tab label="Raw Data" />
        </Tabs>
      </DetailsTabBoxHeader>
      <CustomTabPanel value={value} index={0} component={BoxContent}>
        <CardBody>
          <CardTitle variant="h5">{document.original_title}</CardTitle>
          <ImageContainer src={document.image_url} alt="Book cover" />
          <CardText variant="body1">{document.authors?.join('; ')} - {document.original_publication_year}</CardText>
          <CardText variant="body1">ISBN {document.isbn}</CardText>
          <Rating name="half-rating-read" value={document.average_rating ? Number(document.average_rating) : 0} precision={0.1} readOnly></Rating>
          <CardText variant="body1">{document.ratings_count} Ratings</CardText>
        </CardBody>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1} component={BoxContent}>
        <CardBody>
          <DetailsCustomTabPanelJsonDiv>
            <pre><code>
              {JSON.stringify(document, null, 2)}
            </code></pre>
          </DetailsCustomTabPanelJsonDiv>
        </CardBody>
      </CustomTabPanel>
    </DetailsBoxParent>
  );
}