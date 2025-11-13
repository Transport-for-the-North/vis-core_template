import { setProdOrDev, setApiBaseDomain, setApiBaseDomainDev, setMapApiToken } from '@transport-for-the-north/vis-core';

// Initialize the map API token before rendering your app
setMapApiToken(import.meta.env.VITE_APP_MAP_API_TOKEN);
setProdOrDev(import.meta.env.VITE_PROD_OR_DEV);
setApiBaseDomain(import.meta.env.VITE_API_BASE_DOMAIN);
setApiBaseDomainDev(import.meta.env.VITE_API_BASE_DOMAIN_DEV);

import '@transport-for-the-north/vis-core/style.css';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <StrictMode>
      <App />
    </StrictMode>
  </BrowserRouter>,
)
