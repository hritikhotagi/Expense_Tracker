import React from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-1pphv8tum6k6x6vd.us.auth0.com"
      clientId="Uydfpr6KIxwa59QQFNpNiHV4W66JGfqr"
      audience="https://dev-1pphv8tum6k6x6vd.us.auth0.com/api/v2/"
      responseType="token id_token"
      scope="openid profile email"
      redirectUri={window.location.origin}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);

reportWebVitals();
