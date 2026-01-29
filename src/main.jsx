import { setProdOrDev, setApiBaseDomain, setApiBaseDomainDev, setMapApiToken, setAppName } from '@transport-for-the-north/vis-core';
import { api } from '@transport-for-the-north/vis-core/services';

const appName = import.meta.env.VITE_APP_NAME;
const mapApiToken = import.meta.env.VITE_APP_MAP_API_TOKEN;
const prodOrDev = import.meta.env.VITE_PROD_OR_DEV;
const apiBaseDomain = import.meta.env.VITE_API_BASE_DOMAIN;
const apiBaseDomainDev = import.meta.env.VITE_API_BASE_DOMAIN_DEV;

setAppName(appName);
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

console.log("[Clarity] VITE_APP_CLARITY_ID =", import.meta.env.VITE_CLARITY_PROJECT_ID
);

(function loadClarity() {
  const id = import.meta.env.VITE_CLARITY_PROJECT_ID;

  // define queue immediately
  window.clarity = window.clarity || function(){ (window.clarity.q = window.clarity.q || []).push(arguments); };

  if (!id) { console.warn("Missing VITE_APP_CLARITY_ID"); return; }

  // default deny
  window.clarity("consentv2", { ad_Storage:"denied", analytics_Storage:"denied" });

  // grant if returning user
  const consentGiven = document.cookie.split("; ").find(s => s.startsWith("toc="))?.split("=")[1] === "true";
  if (consentGiven) window.clarity("consentv2", { ad_Storage:"granted", analytics_Storage:"granted" });

  // inject clarity.js
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://www.clarity.ms/tag/" + id;
  (document.head || document.documentElement).appendChild(s);
})();

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