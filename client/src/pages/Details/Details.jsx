import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import Rating from '@mui/material/Rating';
import CircularProgress from '@mui/material/CircularProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

import fetchInstance from '../../url-fetch';

import "./Details.css";


function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      className="tab-panel"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
       // Ensure it takes full width
    >
      {value === index && <Box className="tab-panel-value">{children}</Box>}
    </div>
  );
}

export default function BasicTabs() {
  const { id } = useParams();
  const [document, setDocument] = useState({});
  const [value, setValue] = React.useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchInstance('/api/lookup', { query: { id } })
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

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };


  if (isLoading || !id || Object.keys(document).length === 0) {
    return (
      <div className="loading-container">
        <CircularProgress />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Box className="details-box-parent">
      <Box className="details-tab-box-header">
        <Tabs value={value} onChange={handleChange} aria-label="book-details-tabs">
          <Tab label="Result" />
          <Tab label="Raw Data" />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0} className="tab-panel box-content">
        <div className="card-body">
          <h5 className="card-title">{document.original_title}</h5>
          <img className="image" src={document.image_url} alt="Book cover"></img>
          <p className="card-text">{document.authors?.join('; ')} - {document.original_publication_year}</p>
          <p className="card-text">ISBN {document.isbn}</p>
          <Rating name="half-rating-read" value={parseInt(document.average_rating)} precision={0.1} readOnly></Rating>
          <p className="card-text">{document.ratings_count} Ratings</p>
        </div>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1} className="tab-panel">
        <div className="card-body text-left card-text details-custom-tab-panel-json-div" >
          <pre><code>
            {JSON.stringify(document, null, 2)}
          </code></pre>
        </div>
      </CustomTabPanel>
    </Box>
  );
}