import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Typography from '@mui/material/Typography';

import SearchBar from '../../components/SearchBar/SearchBar';

import { HomeSearchContainer, CenterContainer, LogoImage, HomeSearchBar, SearchControlsRow } from './styled';
import { HomeMain } from '../../App/styled';
import logo from '../../images/cognitive_search.jpg';

export default function Home(): React.ReactElement {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  
  // Prefetch the search page component when the home page loads
  useEffect(() => {
    // Prefetch the Search page component
    const prefetchSearch = () => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = '/src/pages/Search/Search.tsx';
      link.as = 'script';
      document.head.appendChild(link);
    };
    
    // Short delay to prioritize critical resources first
    const timer = setTimeout(() => {
      prefetchSearch();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const navigateToSearchPage = (q: string): void => {
    if (!q || q === '') {
      q = '*'
    }
    navigate('/search?q=' + q);
  }
  
  const handleImageLoad = (): void => {
    setImageLoaded(true);
  };

  return (
    <CenterContainer>
    <HomeMain>
      <HomeSearchContainer>
        {/* Add loading="eager" to prioritize image loading and width/height for layout stability */}
        <LogoImage 
          isLoaded={imageLoaded ? true : false}
          src={logo} 
          alt="Cognitive Search"
          loading="eager"
          width="400"
          height="350"
          fetchPriority="high"
          onLoad={handleImageLoad}
        />
        
        {/* New row for poweredby and search bar that takes 80% width */}
        <SearchControlsRow>
          <Typography variant="body1" sx={{ textAlign: 'center', width: '100%', marginBottom: '1em' }}>Powered by Azure AI Search</Typography>
          <HomeSearchBar>
            <SearchBar postSearchHandler={navigateToSearchPage} width="100%"></SearchBar>
          </HomeSearchBar>
        </SearchControlsRow>
      </HomeSearchContainer>
    </HomeMain>
    </CenterContainer>
  );
};
