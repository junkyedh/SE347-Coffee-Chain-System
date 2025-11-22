import React from 'react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Modal.scss';
import { X } from 'lucide-react';
import { Button } from '../Button/Button';
import { cn } from '@/modules/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
}) => {
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return createPortal(
    <div className={cn('modal-overlay', { 'modal-open': isOpen })} onClick={handleOverlayClick}>
      <div className={cn('modal', `modal-${size}`, className)}>
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && <h2 className="modal-title">{title}</h2>}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                icon={<X />}
                onClick={onClose}
                className="modal-close"
                aria-label="Close modal"
              />
            )}
          </div>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body
  );
};

const ModalHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={cn('modal-header', className)}>{children}</div>;

const ModalBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={cn('modal-body', className)}>{children}</div>;

const ModalFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={cn('modal-footer', className)}>{children}</div>;

export { Modal, ModalHeader, ModalBody, ModalFooter };
