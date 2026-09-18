import React from "react";
import { useNavigate } from "react-router-dom";
import Typography from '@mui/material/Typography';
import SearchBar from '../../components/SearchBar/SearchBar';
import {
  CenterContainer,
  HomeSearchBar,
  HomeSearchContainer,
  LogoImage,
  SearchControlsRow,
} from './styled';
import { HomeMain } from '../../App/styled';
import logo from '../../images/cognitive_search.jpg';

export default function Home() {
  const navigate = useNavigate();
  const navigateToSearchPage = (q) => {
    if (!q || q === '') {
      q = '*'
    }
    navigate('/search?q=' + q);
  }

  return (
    <CenterContainer>
      <HomeMain>
        <HomeSearchContainer>
          <LogoImage src={logo} alt="Cognitive Search" />
          <SearchControlsRow>
            <Typography
              variant="body1"
              sx={{ textAlign: 'center', width: '100%', marginBottom: '1em' }}
            >
              Powered by Azure AI Search
            </Typography>
            <HomeSearchBar>
              <SearchBar postSearchHandler={navigateToSearchPage} width={true} />
            </HomeSearchBar>
          </SearchControlsRow>
        </HomeSearchContainer>
      </HomeMain>
    </CenterContainer>
  );
}
