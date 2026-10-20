import { getApiUrl } from './apiConfig';

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
    this.isManuallyClosed = false;
    this.disconnect();

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
        this.disconnect();

        if (!this.isManuallyClosed) {
          const delay = Math.min(8000, 2000 * Math.pow(1.3, this.retryCount++));
          this.reconnectTimeout = setTimeout(() => this.connect(), delay);
        }
      };
    } catch (err) {
      this.isConnected = false;
      this.notify({ type: 'CONNECTION_STATUS', connected: false });
    }
  }

  disconnect() {
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
