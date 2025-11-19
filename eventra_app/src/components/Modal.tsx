import React, { type PropsWithChildren } from 'react';
import { FiX } from 'react-icons/fi';

interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  maxWidthClass?: string; // e.g., 'max-w-lg'
}

const Modal: React.FC<PropsWithChildren<ModalProps>> = ({ open, title, onClose, children, maxWidthClass = 'max-w-xl' }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative w-full ${maxWidthClass} mx-4 card p-6`}>
        <div className="flex items-center justify-between mb-4">
          {title ? <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{title}</h3> : <div />}
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
