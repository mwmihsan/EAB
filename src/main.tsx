import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router future={{ v7_relativeSplatPath: true }}>
      <App />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1E40AF',
            color: '#fff',
            borderRadius: '8px',
          },
          success: {
            style: {
              background: '#047857',
            },
          },
          error: {
            style: {
              background: '#B91C1C',
            },
            duration: 4000,
          },
        }}
      />
    </Router>
  </StrictMode>
);