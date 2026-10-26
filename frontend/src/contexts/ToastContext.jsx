import React, { createContext, useContext, useState } from 'react';
import Icon from '../components/common/Icon';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const push = (msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  return (
    <ToastContext.Provider value={{ 
      success: (m) => push(m, 'success'), 
      error: (m) => push(m, 'error'), 
      info: (m) => push(m, 'info') 
    }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
        {toasts.map(t => (
          <div 
            key={t.id} 
            className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 min-w-[260px] pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-200 ${
              t.type === 'success' ? 'bg-green-600 text-white' :
              t.type === 'error' ? 'bg-red-600 text-white' : 'bg-navy text-white'
            }`}
          >
            <Icon name={t.type === 'success' ? 'CheckCircle' : t.type === 'error' ? 'XCircle' : 'Info'} size={16} />
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider');
  }
  return context;
};

export default ToastContext;
