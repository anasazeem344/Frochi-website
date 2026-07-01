import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const container = document.getElementById('root');

if (container) {
  // Attach shadow root to isolate styles from the WordPress theme
  const shadowRoot = container.attachShadow({ mode: 'open' });

  // Create a React container element inside the shadow root
  const reactContainer = document.createElement('div');
  reactContainer.id = 'frochi-shadow-root';
  reactContainer.style.width = '100%';
  reactContainer.style.display = 'block';
  shadowRoot.appendChild(reactContainer);

  // Helper to copy only Frochi application styles into the shadow DOM
  const copyStylesToShadow = () => {
    // Copy stylesheets
    document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
      const href = link.getAttribute('href') || '';
      const id = link.getAttribute('id') || '';
      if (
        href.includes('frochi-app') || 
        href.includes('index.css') || 
        id.includes('frochi') ||
        link.classList.contains('frochi-style')
      ) {
        const existing = shadowRoot.querySelector(`link[href="${href}"]`);
        if (!existing) {
          const clone = link.cloneNode(true) as HTMLLinkElement;
          shadowRoot.appendChild(clone);
        }
      }
    });

    // Copy style blocks (Vite dev style blocks & custom patches)
    document.querySelectorAll('style').forEach((style) => {
      const text = style.textContent || '';
      const devId = style.getAttribute('data-vite-dev-id') || '';
      const id = style.getAttribute('id') || '';
      if (
        devId || 
        id.includes('frochi') || 
        text.includes('tailwind') || 
        text.includes('glass-navbar') || 
        text.includes('our-flavours')
      ) {
        const key = devId || text.substring(0, 100);
        const existing = Array.from(shadowRoot.querySelectorAll('style')).find((s) => {
          return (s.getAttribute('data-vite-dev-id') === devId && devId) || s.textContent?.substring(0, 100) === text.substring(0, 100);
        });
        if (!existing) {
          const clone = style.cloneNode(true) as HTMLStyleElement;
          shadowRoot.appendChild(clone);
        }
      }
    });
  };

  // Run style copier immediately
  copyStylesToShadow();

  // Watch for dynamic style injections (Vite HMR updates during development)
  const observer = new MutationObserver(() => {
    copyStylesToShadow();
  });
  observer.observe(document.head, { childList: true, subtree: true });

  createRoot(reactContainer).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
