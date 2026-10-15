/**
 * Cấu hình kết nối API & CSDL Trung tâm cho LabGrade AI
 * 
 * Đảm bảo liên thông dữ liệu thời gian thực giữa:
 * 1. Web tĩnh GitHub Pages (haitv198.github.io/chamthuchanh)
 * 2. Máy chủ Cloud Run (ais-dev-... / ais-pre-...)
 * 3. Mạng nội bộ phòng máy trường học (LAN IP ví dụ http://192.168.1.100:3000)
 */

// Địa chỉ máy chủ Cloud Run trung tâm mặc định (đã cấu hình CSDL liên tục 24/7 và CORS)
export const DEFAULT_CLOUD_BACKEND_URL = 'https://ais-dev-z4vcbgzjafe3fqbkfbktwa-152013379411.asia-east1.run.app';

export const STORAGE_KEY_SERVER_URL = 'labgrade_custom_server_url_v1';

/**
 * Xác định xem trang web hiện tại có đang chạy trên môi trường tĩnh không có backend riêng
 * (ví dụ GitHub Pages haitv198.github.io) hay không.
 */
export function isStaticHosting(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  return (
    host.endsWith('github.io') ||
    host.endsWith('pages.dev') ||
    host.endsWith('vercel.app') ||
    host.endsWith('netlify.app') ||
    host === '127.0.0.1' && window.location.port !== '3000'
  );
}

/**
 * Lấy địa chỉ máy chủ API gốc đang được sử dụng
 */
export function getServerBaseUrl(): string {
  if (typeof window === 'undefined') return '';

  // 1. Nếu giáo viên đã chủ động cài đặt địa chỉ máy chủ (vd IP mạng LAN phòng máy)
  const customUrl = localStorage.getItem(STORAGE_KEY_SERVER_URL);
  if (customUrl && customUrl.trim()) {
    return customUrl.trim().replace(/\/+$/, '');
  }

  // 2. Nếu đang chạy trên GitHub Pages (haitv198.github.io/chamthuchanh)
  // Tự động kết nối tới máy chủ CSDL Cloud Run trung tâm để toàn bộ máy học sinh và giáo viên liên thông với nhau
  if (isStaticHosting()) {
    return DEFAULT_CLOUD_BACKEND_URL;
  }

  // 3. Nếu đang chạy trực tiếp trên Cloud Run hoặc localhost:3000 (đã có server.ts nội tại)
  // Dùng relative path để tối ưu tốc độ
  return '';
}

/**
 * Lưu địa chỉ máy chủ tùy chỉnh
 */
export function setServerBaseUrl(url: string | null): void {
  if (!url || !url.trim()) {
    localStorage.removeItem(STORAGE_KEY_SERVER_URL);
  } else {
    localStorage.setItem(STORAGE_KEY_SERVER_URL, url.trim().replace(/\/+$/, ''));
  }
}

/**
 * Tạo URL hoàn chỉnh cho endpoint API
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = getServerBaseUrl();
  return baseUrl ? `${baseUrl}${cleanPath}` : cleanPath;
}

/**
 * Wrapper gọi fetch có tự động nối baseUrl, gắn headers chuẩn và xử lý timeout
 */
export async function apiFetch(path: string, init?: RequestInit, timeoutMs = 8000): Promise<Response> {
  const fullUrl = getApiUrl(path);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers = new Headers(init?.headers || {});
    if (!headers.has('Content-Type') && init?.method && ['POST', 'PUT', 'PATCH'].includes(init.method.toUpperCase())) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(fullUrl, {
      ...init,
      headers,
      signal: init?.signal || controller.signal,
    });
    clearTimeout(timer);
    return response;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * Kiểm tra kết nối tới máy chủ CSDL và đo độ trễ (ping latency)
 */
export async function testServerConnection(customTargetUrl?: string): Promise<{
  ok: boolean;
  latencyMs: number;
  url: string;
  submissionsCount?: number;
  error?: string;
}> {
  const target = (customTargetUrl ?? getServerBaseUrl()) || window.location.origin;
  const cleanTarget = target.replace(/\/+$/, '');
  const testUrl = `${cleanTarget}/api/health`;

  const start = performance.now();
  try {
    const res = await apiFetch('/api/health', { method: 'GET' }, 5000);
    const latencyMs = Math.round(performance.now() - start);

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        ok: true,
        latencyMs,
        url: cleanTarget,
        submissionsCount: data.submissionsCount ?? 0,
      };
    }
    return {
      ok: false,
      latencyMs,
      url: cleanTarget,
      error: `Máy chủ phản hồi mã lỗi HTTP ${res.status}`,
    };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      ok: false,
      latencyMs,
      url: cleanTarget,
      error: err.name === 'AbortError' ? 'Quá thời gian kết nối (Timeout)' : (err.message || 'Không thể kết nối máy chủ'),
    };
  }
}
