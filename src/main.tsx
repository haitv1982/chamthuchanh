import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Chặn lỗi unhandledrejection hoặc mạng chập chờn từ các máy học sinh gây gián đoạn
window.addEventListener('unhandledrejection', (event) => {
  console.warn('[LabGrade AI] Chặn unhandled promise rejection:', event.reason);
  // Không cho lỗi làm sập toàn bộ trang
  event.preventDefault();
});

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
