import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { PortalContentProvider } from './context/PortalContentContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PortalContentProvider><App /></PortalContentProvider>
  </StrictMode>,
);
