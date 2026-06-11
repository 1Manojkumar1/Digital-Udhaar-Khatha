/**
 * Application Entry Point
 *
 * Mounts the React app into the DOM with:
 *   - StrictMode for highlighting potential issues in development
 *   - ErrorBoundary to catch and display rendering crashes gracefully
 *   - BrowserRouter for client-side routing via React Router
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
