import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

async function initApp() {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    try {
      const { worker } = await import('./mocks/browser');
      await worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
      });
    } catch (error) {
      console.warn('[MSW] Falha ao registar Mock Service Worker:', error);
    }
  }

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

initApp();
