import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/shared/ErrorBoundary.tsx';

// Prevent unhandled promise rejections from surfacing as diagnostic errors
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
  });
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary fallbackName="RootApp">
    <App />
  </ErrorBoundary>
);
