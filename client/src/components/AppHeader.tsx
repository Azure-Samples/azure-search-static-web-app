import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import logo from '../images/microsoft_small.png';

export default function AppHeader() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="mui-header-isolation-wrapper">
      <AppBar position="static" sx={{ backgroundColor: '#0078d7' }}>
        <Toolbar>
          {/* Logo */}
          <Box 
            component="a" 
            href="/" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              textDecoration: 'none',
              flexGrow: 0
            }}
          >
            <img src={logo} className="mui-navbar-logo" alt="Microsoft" />
          </Box>
          
          {/* Nav links - desktop */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
            <Stack direction="row" spacing={3} sx={{ marginLeft: 2 }}>
              <Button 
                href="/search" 
                sx={{ 
                  color: '#fff', 
                  textTransform: 'none',
                  cursor: 'pointer',
                  '&:hover': {
                    cursor: 'pointer'
                  }
                }}
              >
                Search
              </Button>
              <Button 
                href="https://azure.microsoft.com/services/search/"
                sx={{ 
                  color: '#fff', 
                  textTransform: 'none',
                  cursor: 'pointer',
                  '&:hover': {
                    cursor: 'pointer'
                  }
                }}
              >
                Learn more
              </Button>
            </Stack>
          </Box>
          
          {/* Hamburger menu - mobile */}
          <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMenuOpen}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose} component="a" href="/search">
                Search
              </MenuItem>
              <MenuItem onClick={handleMenuClose} component="a" href="https://azure.microsoft.com/services/search/">
                Learn more
              </MenuItem>
            </Menu>
          </Box>
          
          {/* Auth functionality removed */}
        </Toolbar>
      </AppBar>
    </div>
  );
};
