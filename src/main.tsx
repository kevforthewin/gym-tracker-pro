import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import { seedCatalog } from './local/db';
import { dedupePlanEntries } from './local/plans';
import './styles/index.css';

registerSW({ immediate: true });
navigator.storage?.persist?.().catch(() => undefined);

seedCatalog()
  .then(() => dedupePlanEntries())
  .catch(() => undefined)
  .finally(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  ),
);
