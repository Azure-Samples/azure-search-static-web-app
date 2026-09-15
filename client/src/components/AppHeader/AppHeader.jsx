import React, { useRef, useState } from 'react';
import AppHeaderAuth from '../AppHeaderAuth/AppHeaderAuth';

import logo from '../../images/microsoft_small.png';

import './AppHeader.css';

export default function AppHeader() {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const toggleButton = useRef(null);

  const closeNavigation = () => setIsNavigationOpen(false);

  const handleHeaderKeyDown = (event) => {
    if (event.key === 'Escape' && isNavigationOpen) {
      closeNavigation();
      toggleButton.current?.focus();
    }
  };

  return (
    <header className="header" onKeyDown={handleHeaderKeyDown}>
      <nav className="navbar navbar-expand-lg nav-bar-search">
        <a className="navbar-brand" href="/">
          <img src={logo} className="navbar-logo navbar-brand-image" alt="Microsoft" />
        </a>
        <button
          ref={toggleButton}
          className="navbar-toggler"
          type="button"
          aria-controls="navbarSupportedContent"
          aria-expanded={isNavigationOpen}
          aria-label="Toggle navigation"
          onClick={() => setIsNavigationOpen(open => !open)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`collapse navbar-collapse${isNavigationOpen ? ' show' : ''}`}
          id="navbarSupportedContent"
        >
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <a className="nav-link" href="/search" onClick={closeNavigation}>Search</a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                href="https://azure.microsoft.com/services/search/"
                onClick={closeNavigation}
              >
                Learn more
              </a>
            </li>
          </ul>
        </div>

        <AppHeaderAuth />
      </nav>
      
    </header>
  );
};
