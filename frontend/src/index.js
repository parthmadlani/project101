import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
const GOOGLE_CLIENT_ID = "92471254186-5st88veddd0bv4vfrm9koicep6hnns1m.apps.googleusercontent.com"; // 🔴 REPLACE THIS WITH YOUR ACTUAL GOOGLE CLIENT ID

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
