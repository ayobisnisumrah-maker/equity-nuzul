import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { PortalContentProvider } from './context/PortalContentContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PortalContentProvider>
      <App />
    </PortalContentProvider>
  </StrictMode>,
);
