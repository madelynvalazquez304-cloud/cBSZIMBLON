import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string | null;
  isError?: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, isError = false }) => {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-14 right-4 md:top-16 md:right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl font-medium text-sm transition-all duration-300 transform translate-y-0 text-white max-w-sm ${
        isError ? 'bg-[#dc2626] border border-red-400/40' : 'bg-[#273C83] border border-[#8DC63F]/50'
      }`}
      style={{ fontFamily: "'Albert Sans', sans-serif" }}
    >
      {isError ? (
        <AlertCircle className="w-5 h-5 text-white shrink-0" />
      ) : (
        <CheckCircle2 className="w-5 h-5 text-[#8DC63F] shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
};
