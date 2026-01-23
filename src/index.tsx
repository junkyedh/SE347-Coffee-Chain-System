import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AppSystemProvider } from './hooks/useSystemContext';
import './index.scss';
import { CartProvider } from './hooks/cartContext';
import { ToastProvider } from './components/common/Toast/Toast';
import { validateEnvConfig } from './config/env.config';

validateEnvConfig();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <AppSystemProvider>
    <CartProvider>
      <BrowserRouter>
        <ToastProvider>
          <App />
        </ToastProvider>
      </BrowserRouter>
    </CartProvider>
  </AppSystemProvider>
);
