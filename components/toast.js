// UI module to show toasts/notifications on the screen
import { createContext, useContext, useState } from 'react';
import clsx from 'clsx';

// 5 seconds
const TOAST_TIMEOUT = 5000;

const ToastContext = createContext([]);

const types = {
  success: 'bg-green-500/40 border-green-500/50 text-green-200/80',
  error: 'bg-red-500/30 border-red-500/50 text-red-200/90',
  warning: 'bg-[#eab000]'
};

function Toast({ value }) {
  const [ toasts, setToasts ] = useContext(ToastContext);
  const { id, type, message } = value;

  function remove() {
    setToasts(toasts.filter(toast => toast.id !== id));
    clearTimeout(id);
  }

  return (
    <div className={clsx('flex flex-col gap-1 text-white/80 py-2 px-4 border rounded-2xl', types[type])}>
      <div className="flex flex-row justify-between">
        <p className="text-normal capitalize">{type}</p>
        <button onClick={remove}>&#x2715;</button>
      </div>
      <p className="text-light">{message}</p>
    </div>
  );
}

export function ToastContainer({ children }) {
  const [ toasts, setToasts ] = useState([]);

  return (
    <ToastContext.Provider value={[ toasts, setToasts ]}>
      {children}
      <div className="flex flex-col gap-1.5 w-full md:w-96 right-0 p-2 bottom-0 fixed">
        {toasts.map(toast => (<Toast key={toast.id} value={toast}/>))}
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