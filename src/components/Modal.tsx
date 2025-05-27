'use client';

import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  showCloseButton?: boolean;
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  isLoading?: boolean;
}

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  children: ReactNode;
  submitText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
  canSubmit?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// 基础Modal组件
export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true 
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg p-6 w-full ${sizeClasses[size]} mx-4`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

// 确认弹窗组件
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  confirmButtonClass = 'bg-red-600 hover:bg-red-700',
  isLoading = false
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} showCloseButton={false}>
      <div className="mb-6">
        <p className="text-gray-600">{message}</p>
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`flex-1 py-2 px-4 text-white rounded-lg font-medium transition-colors ${
            isLoading 
              ? 'bg-gray-300 cursor-not-allowed' 
              : confirmButtonClass
          }`}
        >
          {isLoading ? '处理中...' : confirmText}
        </button>
        <button
          onClick={onClose}
          disabled={isLoading}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
      </div>
    </Modal>
  );
}

// 表单弹窗组件
export function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitText = '提交',
  cancelText = '取消',
  isSubmitting = false,
  canSubmit = true,
  size = 'md'
}: FormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size={size}>
      <div className="space-y-4 mb-6">
        {children}
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={onSubmit}
          disabled={isSubmitting || !canSubmit}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            isSubmitting || !canSubmit
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? '处理中...' : submitText}
        </button>
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
      </div>
    </Modal>
  );
} 