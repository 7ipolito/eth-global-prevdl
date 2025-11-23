import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <Link to="/" className="header-left">
            <h1>PREVDL SDK</h1>
            <p className="subtitle">Privacy-Preserving Ad Targeting</p>
          </Link>
          <div className="header-right">
            <Link 
              to="/general" 
              className={`header-link ${location.pathname === '/general' ? 'active' : ''}`}
            >
              general
            </Link>
            <Link 
              to="/dashboard" 
              className={`header-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="app-main">
        {children}
      </main>

      <footer className="app-footer">
        <p>

            PREVDL SDK
        </p>
        <p className="footer-note">
          Environment: <strong>LOCAL</strong>
        </p>
      </footer>
    </div>
  );
}

