import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [message, setMessage] = useState(null);
  const [type, setType] = useState('success');
  const timer = useRef(null);

  const hideToast = useCallback(() => {
    setMessage(null);
  }, []);

  const showToast = useCallback((a, b) => {
    if (typeof a === 'string' && b !== undefined) {
      setType(a === 'alert' ? 'alert' : 'success');
      setMessage(b);
    } else {
      setType('success');
      setMessage(a);
    }
  }, []);

  useEffect(() => {
    if (message) {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(hideToast, 4000);
    }
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [message, hideToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast message={message} type={type} onClose={hideToast} />
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);