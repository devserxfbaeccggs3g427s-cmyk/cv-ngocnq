'use client';

import { useEffect, useCallback, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export function Modal({ isOpen, onClose, children, title, size = 'md', className }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key !== 'Tab') {
        return;
      }

      const dialog = dialogRef.current;

      if (!dialog) {
        return;
      }

      const focusableElements = dialog.querySelectorAll<HTMLElement>(
        [
          'a[href]',
          'button:not([disabled])',
          'textarea:not([disabled])',
          'input:not([disabled])',
          'select:not([disabled])',
          '[tabindex]:not([tabindex="-1"])',
        ].join(',')
      );

      if (focusableElements.length === 0) {
        e.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
        return;
      }

      if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElementRef.current = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      window.requestAnimationFrame(() => {
        const dialog = dialogRef.current;
        const firstFocusable = dialog?.querySelector<HTMLElement>(
          [
            'button:not([disabled])',
            'a[href]',
            'textarea:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
          ].join(',')
        );

        (firstFocusable ?? dialog)?.focus();
      });
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
      previouslyFocusedElementRef.current?.focus();
    };
  }, [isOpen, handleKeyDown]);

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  };

  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-label={title ? undefined : 'Hộp thoại'}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'glass-panel relative w-full overflow-hidden rounded-3xl shadow-2xl',
              sizes[size],
              className
            )}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-4 dark:border-slate-800">
                <h2 id={titleId} className="text-lg font-bold text-slate-950 dark:text-white">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Đóng hộp thoại"
                  className="rounded-2xl p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="px-6 py-4 max-h-[80vh] overflow-y-auto">{children}</div>

            {/* Close button if no title */}
            {!title && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng hộp thoại"
                className="absolute right-4 top-4 rounded-2xl p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
