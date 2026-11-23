import { getApiUrl, isBackendConfigured } from './apiConfig';

export type RealtimeEventHandler = (event: { type: string; [key: string]: any }) => void;

class RealtimeSyncManager {
  private eventSource: EventSource | null = null;
  private listeners = new Set<RealtimeEventHandler>();
  private reconnectTimeout: any = null;
  private isConnected = false;
  private retryCount = 0;
  private isManuallyClosed = false;

  connect() {
    if (typeof window === 'undefined') return;
    if (!isBackendConfigured()) {
      this.disconnect(true);
      return;
    }
    this.isManuallyClosed = false;
    this.disconnect(false);

    const sseUrl = getApiUrl('/api/events');
    try {
      this.eventSource = new EventSource(sseUrl);

      this.eventSource.onopen = () => {
        this.isConnected = true;
        this.retryCount = 0;
        this.notify({ type: 'CONNECTION_STATUS', connected: true });
        console.log('[LabGrade Realtime] Đã kết nối kênh thời gian thực SSE tới máy chủ CSDL.');
      };

      this.eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          this.notify(data);
        } catch {}
      };

      this.eventSource.onerror = () => {
        if (this.isConnected) {
          console.warn('[LabGrade Realtime] Mất kết nối kênh SSE, đang tự động kết nối lại...');
        }
        this.isConnected = false;
        this.notify({ type: 'CONNECTION_STATUS', connected: false });
        this.disconnect(false);

        if (!this.isManuallyClosed && isBackendConfigured()) {
          const delay = Math.min(12000, 2500 * Math.pow(1.4, this.retryCount++));
          this.reconnectTimeout = setTimeout(() => this.connect(), delay);
        }
      };
    } catch {
      this.isConnected = false;
      this.notify({ type: 'CONNECTION_STATUS', connected: false });
    }
  }

  disconnect(manual = true) {
    if (manual) {
      this.isManuallyClosed = true;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  subscribe(handler: RealtimeEventHandler) {
    this.listeners.add(handler);
    // Send immediate initial status
    try {
      handler({ type: 'CONNECTION_STATUS', connected: this.isConnected });
    } catch {}

    return () => {
      this.listeners.delete(handler);
    };
  }

  private notify(event: any) {
    for (const l of this.listeners) {
      try {
        l(event);
      } catch {}
    }
  }

  getStatus() {
    return this.isConnected;
  }
}

export const realtimeSync = new RealtimeSyncManager();
