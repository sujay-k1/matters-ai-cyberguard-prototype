if (import.meta.env.DEV || (typeof window !== 'undefined' && window.location.hostname === 'localhost')) {
  void import('code-to-figma');
}
import React from 'react';
import ReactDOM from 'react-dom/client';
import '@carbon/styles/css/styles.css';
import './styles/app.scss';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
