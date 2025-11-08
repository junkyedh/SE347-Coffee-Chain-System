import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import "./index.scss";
import { AppSystemProvider } from './hooks/useSystemContext';
import { ToastProvider } from './components/common/Toast/Toast';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
      <AppSystemProvider>
        <BrowserRouter>
        <ToastProvider>
          <App />
        </ToastProvider>
        </BrowserRouter>
      </AppSystemProvider>
  </React.StrictMode>
);