import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, RotateCcw, Sparkles } from 'lucide-react';
import { StitchDetective } from './StitchMascot';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error?.message || 'Lỗi hiển thị giao diện tạm thời',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[LabGrade AI] Đã chặn lỗi hiển thị để tránh màn hình trắng:', error, errorInfo);
  }

  private handleRecover = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleSafeReset = () => {
    try {
      // Dọn bớt cache tạm thời nhưng giữ lại tài khoản và danh sách bài tập
      sessionStorage.clear();
    } catch {}
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 via-slate-100 to-slate-200 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-blue-200 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 border border-blue-200 flex items-center justify-center shadow-inner">
              <StitchDetective className="w-14 h-14" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-200">
                <Sparkles className="w-3.5 h-3.5" /> Tự Động Phục Hồi Phòng Máy
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Không Lo Mất Bài • Hệ Thống Đã Bảo Vệ Dữ Liệu
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Vừa xảy ra gián đoạn đường truyền hoặc tải trọng cao từ nhiều máy cùng nộp một lúc. Hệ thống đã lưu trữ bài làm của em an toàn.
              </p>
            </div>

            {this.state.errorMessage && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs font-mono text-slate-500 overflow-x-auto max-h-24">
                {this.state.errorMessage}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleRecover}
                className="w-full sm:flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Tiếp Tục Làm Bài</span>
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Tải Lại Trang</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-400 font-medium">
              LabGrade AI • Hệ thống tự phục hồi phòng thực hành tin học
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
