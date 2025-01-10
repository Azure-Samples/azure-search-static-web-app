import React from 'react';

import './AppFooter.css';

export default function AppFooter() {
  const currentYear = new Date().getFullYear();
  return (
      <footer className="footer">
        <hr />
        &copy; {currentYear} Microsoft
      </footer>
  );
};
