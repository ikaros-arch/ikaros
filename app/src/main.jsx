import React from 'react';
import ReactDOM from 'react-dom/client';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import './assets/css/w3.css';
import './assets/css/fontRaleway.css';
import './assets/css/font-awesome.min.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/ubuntu/300.css';
import '@fontsource/ubuntu/400.css';
import '@fontsource/ubuntu/500.css';
import '@fontsource/ubuntu/700.css';
import './assets/css/main.css';
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css'
import keycloak from './services/keycloak';
import App from "./App";

// Dev:
const initOptions = { checkLoginIframe: false, onLoad: 'login-required' };
// Prod:
// const initOptions = { onLoad: 'login-required' };

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ReactKeycloakProvider
    authClient={keycloak}
    initOptions={initOptions}
  > 
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </ReactKeycloakProvider>  
);
