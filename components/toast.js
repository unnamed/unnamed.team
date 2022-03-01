// UI module to show toasts/notifications on the screen
import { createContext, useContext, useState } from 'react';
import styles from './toast.module.scss';

// 5 seconds
const TOAST_TIMEOUT = 5000;

const ToastContext = createContext([]);

const types = {
  success: styles.toastSuccess,
  error: styles.toastError,
  warning: styles.toastWarning
};

function Toast({ value }) {
  const [ toasts, setToasts ] = useContext(ToastContext);
  const { id, type, message } = value;

  function remove() {
    setToasts(toasts.filter(toast => toast.id !== id));
    clearTimeout(id);
  }

  return (
    <div className={`${styles.toast} ${types[type]}`}>
      <div className={styles.toastHeader}>
        <p className={styles.toastHeaderTitle}>{type}</p>
        <button onClick={remove}>&#x2715;</button>
      </div>
      <p className={styles.toastMessage}>{message}</p>
    </div>
  );
}

export function ToastContainer({ children }) {
  const [ toasts, setToasts ] = useState([]);

  return (
    <ToastContext.Provider value={[ toasts, setToasts ]}>
      {children}
      <div className={styles.container}>
        {toasts.map(toast => (<Toast key={toast.index} value={toast}/>))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToasts() {
  const [ toasts, setToasts ] = useContext(ToastContext);

  function remove(id) {
    setToasts(toasts.filter(toast => toast.id !== id));
  }

  /**
   * Adds a toast to the client screen
   *
   * @param {'success' | 'warning' | 'error'} type The toast type
   * @param {string} message The toast message
   */
  function add(type, message) {
    const id = setTimeout(() => remove(id), TOAST_TIMEOUT);
    setToasts([
      ...toasts,
      { id, type, message }
    ]);
  }

  return { add };
}