import React, {useState, useEffect, lazy, Suspense} from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// App shell components
import AppHeader from '../components/AppHeader';
import AppFooter from '../components/AppFooter';

// React Router page components - Lazy load routes
const Home = lazy(() => import('../pages/Home/Home'));
const Search = lazy(() => import('../pages/Search/Search'));
const Details = lazy(() => import('../pages/Details/Details'));

// Styled components
import { AppContainer } from './styled';

// Types
interface AuthUser {
  clientPrincipal?: {
    userId: string;
    userRoles: string[];
    claims: Array<{typ: string, val: string}>;
    identityProvider: string;
    userDetails: string;
  };
}

export default function App(): React.ReactElement {
  // React Hook: useState with a var name, set function, & default value
  const [user, setUser] = useState<AuthUser>({});

  // Fetch authentication API & set user state
  async function fetchAuth(): Promise<void> {
    try {
      const response = await fetch("/.auth/me");
      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const authData: AuthUser = await response.json();
          setUser(authData);
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  }

  // React Hook: useEffect when component changes
  // Empty array ensure this only runs once on mount
  useEffect(() => {
    fetchAuth()
  }, []);

  // Simple loading component
  const LoadingFallback = () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '50vh', 
      fontSize: '1.2rem' 
    }}>
      Loading...
    </div>
  );

  return (
      <AppContainer className="container-fluid">
        <AppHeader />
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path={`/`} element={<Home />} />
              <Route path={`/search`} element={<Search />} />
              <Route path={`/details/:id`} element={<Details />}/>
              <Route path={`*`} element={<Home />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        {<AppFooter />}
      </AppContainer>
  );
}
