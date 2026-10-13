import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Đảm bảo window.fetch có setter để các extension trình duyệt không bị lỗi "Cannot set property fetch of #<Window> which has only a getter"
try {
  let activeFetch = window.fetch;
  Object.defineProperty(window, 'fetch', {
    configurable: true,
    enumerable: true,
    get() {
      return activeFetch;
    },
    set(newFetch) {
      activeFetch = newFetch;
    },
  });
} catch {}

// Chặn lỗi unhandledrejection hoặc mạng chập chờn từ các máy học sinh gây gián đoạn
window.addEventListener('unhandledrejection', (event) => {
  console.warn('[LabGrade AI] Chặn unhandled promise rejection:', event.reason);
  event.preventDefault();
});

// Chặn các lỗi script ngoài luồng từ tiện ích mở rộng Chrome/trình duyệt
window.addEventListener('error', (event) => {
  if (
    (event.filename && event.filename.includes('chrome-extension://')) ||
    (event.message && event.message.includes('Cannot set property fetch'))
  ) {
    event.preventDefault();
    return true;
  }
});

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
