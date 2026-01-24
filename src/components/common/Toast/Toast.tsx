import React from 'react';
import { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './Toast.scss';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '../Button/Button';
import { cn } from '../../../modules/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastOptions {
  duration?: number;
  key?: string;
  title?: string;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  loading: (message: string, options?: ToastOptions) => string;
  destroy: (key?: string) => void;

  createSuccess: (entityName: string) => void;
  createError: (entityName: string, error?: string) => void;
  updateSuccess: (entityName: string) => void;
  updateError: (entityName: string, error?: string) => void;
  deleteSuccess: (entityName: string) => void;
  deleteError: (entityName: string, error?: string) => void;
  fetchError: (entityName: string, error?: string) => void;
  exportSuccess: (fileName: string) => void;
  exportError: (error?: string) => void;
  uploadSuccess: () => void;
  uploadError: (error?: string) => void;
  validationError: (message: string) => void;
  networkError: () => void;
  permissionError: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  loading: Loader2,
};

const ToastItem: React.FC<{
  toast: Toast;
  onRemove: (id: string) => void;
}> = ({ toast, onRemove }) => {
  const Icon = toastIcons[toast.type];

  return (
    <div className={cn('toast', `toast-${toast.type}`)}>
      <div className="toast-icon">
        <Icon className={toast.type === 'loading' ? 'animate-spin' : ''} />
      </div>
      <div className="toast-content">
        {toast.title && <div className="toast-title">{toast.title}</div>}
        <div className="toast-message">{toast.message}</div>
        {toast.action && (
          <Button variant="link" size="sm" onClick={toast.action.onClick} className="toast-action">
            {toast.action.label}
          </Button>
        )}
      </div>
      {toast.type !== 'loading' && (
        <Button
          variant="ghost"
          size="sm"
          icon={<X />}
          onClick={() => onRemove(toast.id)}
          className="toast-close"
          aria-label="Close notification"
        />
      )}
    </div>
  );
};

const ToastContainer: React.FC<{
  toasts: Toast[];
  onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>,
    document.body
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'> & { key?: string }) => {
      const { key, ...rest } = toast;
      const id = key || Math.random().toString(36).substr(2, 9);
      const newToast = { ...rest, id };

      setToasts((prev) => {
        // Remove existing toast with same key if exists
        const filtered = prev.filter((t) => t.id !== id);
        return [...filtered, newToast];
      });

      // Auto remove after duration (except for loading toasts with duration 0)
      const duration =
        toast.duration ?? (toast.type === 'loading' ? 0 : toast.type === 'error' ? 7000 : 5000);
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title?: string) => {
      addToast({ type: 'success', message, title });
    },
    [addToast]
  );

  const error = useCallback(
    (message: string, title?: string) => {
      addToast({ type: 'error', message, title, duration: 7000 });
    },
    [addToast]
  );

  const warning = useCallback(
    (message: string, title?: string) => {
      addToast({ type: 'warning', message, title });
    },
    [addToast]
  );

  const info = useCallback(
    (message: string, title?: string) => {
      addToast({ type: 'info', message, title });
    },
    [addToast]
  );

  const loading = useCallback(
    (message: string, options?: ToastOptions) => {
      return addToast({
        type: 'loading',
        message,
        title: options?.title,
        duration: options?.duration || 0,
        key: options?.key,
      });
    },
    [addToast]
  );

  const destroy = useCallback(
    (key?: string) => {
      if (key) {
        removeToast(key);
      } else {
        setToasts([]);
      }
    },
    [removeToast]
  );

  // CRUD specific methods
  const createSuccess = useCallback(
    (entityName: string) => {
      success(`✅ Tạo ${entityName} thành công!`);
    },
    [success]
  );

  const createError = useCallback(
    (entityName: string, errorMsg?: string) => {
      error(`❌ Không thể tạo ${entityName}. ${errorMsg || 'Vui lòng thử lại.'}`);
    },
    [error]
  );

  const updateSuccess = useCallback(
    (entityName: string) => {
      success(`✅ Cập nhật ${entityName} thành công!`);
    },
    [success]
  );

  const updateError = useCallback(
    (entityName: string, errorMsg?: string) => {
      error(`❌ Không thể cập nhật ${entityName}. ${errorMsg || 'Vui lòng thử lại.'}`);
    },
    [error]
  );

  const deleteSuccess = useCallback(
    (entityName: string) => {
      success(`✅ Xóa ${entityName} thành công!`);
    },
    [success]
  );

  const deleteError = useCallback(
    (entityName: string, errorMsg?: string) => {
      error(`❌ Không thể xóa ${entityName}. ${errorMsg || 'Vui lòng thử lại.'}`);
    },
    [error]
  );

  const fetchError = useCallback(
    (entityName: string, errorMsg?: string) => {
      error(`❌ Không thể tải danh sách ${entityName}. ${errorMsg || 'Vui lòng thử lại.'}`);
    },
    [error]
  );

  const exportSuccess = useCallback(
    (fileName: string) => {
      success(`📊 Xuất file ${fileName} thành công!`);
    },
    [success]
  );

  const exportError = useCallback(
    (errorMsg?: string) => {
      error(`❌ Không thể xuất file. ${errorMsg || 'Vui lòng thử lại.'}`);
    },
    [error]
  );

  const uploadSuccess = useCallback(() => {
    success(`📁 Tải file lên thành công!`);
  }, [success]);

  const uploadError = useCallback(
    (errorMsg?: string) => {
      error(`❌ Không thể tải file lên. ${errorMsg || 'Vui lòng thử lại.'}`);
    },
    [error]
  );

  const validationError = useCallback(
    (message: string) => {
      warning(`⚠️ ${message}`);
    },
    [warning]
  );

  const networkError = useCallback(() => {
    error(`🌐 Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.`);
  }, [error]);

  const permissionError = useCallback(() => {
    error(`🔒 Bạn không có quyền thực hiện hành động này.`);
  }, [error]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
        loading,
        destroy,
        createSuccess,
        createError,
        updateSuccess,
        updateError,
        deleteSuccess,
        deleteError,
        fetchError,
        exportSuccess,
        exportError,
        uploadSuccess,
        uploadError,
        validationError,
        networkError,
        permissionError,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};
