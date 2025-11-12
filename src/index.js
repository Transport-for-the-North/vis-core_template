import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import App from './App';
import { Auth0ProviderWithHistory } from 'contexts';
import reportWebVitals from './reportWebVitals';

/**
 * Renders the root React component.
 * Creates a root element using ReactDOM.createRoot and renders the <App /> component wrapped in a <Router /> for routing and enclosed in a <React.StrictMode /> for development checks.
 * @constant root
 */
const root = ReactDOM.createRoot(document.getElementById('root'));

const isDev = import.meta.env.VITE_APP_NAME === 'dev';

root.render(
  <Router>
    {isDev ? (
      <React.StrictMode>
        <App />
      </React.StrictMode>
    ) : (
      <Auth0ProviderWithHistory>
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </Auth0ProviderWithHistory>
    )}
  </Router>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();