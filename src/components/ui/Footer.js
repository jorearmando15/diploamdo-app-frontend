import React from 'react';
import './Footer.css';

import 'bootstrap/dist/css/bootstrap.min.css';

export default function Footer({ year }) {
  return (
    <footer className="bg-dark text-light py-3 mt-auto">
      <div className="container text-center">
        <span>IUDigital-HelpMeIUD &copy; {year}</span>
      </div>
    </footer>
  );
}
