import React from 'react';
import { ToastContainer, toast, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  position?: 'top-right' | 'bottom-right' | 'top-center' | 'bottom-center';
}

const ReusableToast: React.FC = () => (
  <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} pauseOnHover theme="light" />
);

export const showToast = ({ message, type = 'default', duration = 3000, position = 'top-right' }: ToastProps) => {
  const options: ToastOptions = { position, autoClose: duration, closeOnClick: true, pauseOnHover: true, draggable: true };

  switch (type) {
    case 'success':
      toast.success(message, options);
      break;
    case 'error':
      toast.error(message, options);
      break;
    case 'warning':
      toast.warning(message, options);
      break;
    case 'info':
      toast.info(message, options);
      break;
    default:
      toast(message, options);
  }
};

export default ReusableToast;
