import { setProdOrDev, setApiBaseDomain, setApiBaseDomainDev, setMapApiToken } from '@transport-for-the-north/vis-core';
import { api } from '@transport-for-the-north/vis-core/services';

const mapApiToken = import.meta.env.VITE_APP_MAP_API_TOKEN;
const prodOrDev = import.meta.env.VITE_PROD_OR_DEV;
const apiBaseDomain = import.meta.env.VITE_API_BASE_DOMAIN;
const apiBaseDomainDev = import.meta.env.VITE_API_BASE_DOMAIN_DEV;

setMapApiToken(mapApiToken);
setProdOrDev(prodOrDev);
setApiBaseDomain(apiBaseDomain);
setApiBaseDomainDev(apiBaseDomainDev);

const normalisedProdOrDev = (prodOrDev ?? "").toLowerCase();
const resolvedApiBaseDomain =
  normalisedProdOrDev.startsWith("prod")
    ? apiBaseDomain
    : apiBaseDomainDev || apiBaseDomain;
const fallbackOrigin = typeof window !== "undefined" ? window.location.origin : "";
const resolvedApiBaseUrl = (resolvedApiBaseDomain || fallbackOrigin || "").replace(/\/+$/, "");

if (resolvedApiBaseUrl && api?.geodataService) {
  api.geodataService._apiBaseUrl = resolvedApiBaseUrl;
}

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
