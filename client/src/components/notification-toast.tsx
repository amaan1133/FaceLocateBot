import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export interface NotificationProps {
  type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
  show: boolean;
  onHide: () => void;
}

export function NotificationToast({ type, title, message, show, onHide }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onHide, 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-400 text-xl" />;
      case 'error':
        return <XCircle className="text-red-400 text-xl" />;
      case 'warning':
        return <AlertTriangle className="text-yellow-400 text-xl" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-green-400';
      case 'error':
        return 'border-red-400';
      case 'warning':
        return 'border-yellow-400';
    }
  };

  if (!show) return null;

  return (
    <div 
      className={`fixed top-4 right-4 max-w-sm bg-youtube-secondary border-l-4 ${getBorderColor()} text-white p-4 rounded-lg shadow-2xl transform transition-transform duration-300 z-50 ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm text-gray-300 mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
}
