/**
 * Dialog Component - Modal simples para formulários
 */

import { X } from 'lucide-react';
import { Button } from './button';
import { ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Content */}
      <div className="relative z-50">
        {children}
      </div>
    </div>
  );
}

interface DialogContentProps {
  className?: string;
  children: ReactNode;
}

export function DialogContent({ className = '', children }: DialogContentProps) {
  return (
    <div
      className={`relative bg-card border rounded-lg shadow-lg p-6 w-full ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

interface DialogHeaderProps {
  children: ReactNode;
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return (
    <div className="mb-4 pb-4 border-b">
      {children}
    </div>
  );
}

interface DialogTitleProps {
  children: ReactNode;
}

export function DialogTitle({ children }: DialogTitleProps) {
  return (
    <h2 className="text-2xl font-bold">{children}</h2>
  );
}

interface DialogDescriptionProps {
  children: ReactNode;
}

export function DialogDescription({ children }: DialogDescriptionProps) {
  return (
    <p className="text-sm text-muted-foreground mt-2">{children}</p>
  );
}

interface DialogTriggerProps {
  children: ReactNode;
  asChild?: boolean;
}

export function DialogTrigger({ children }: DialogTriggerProps) {
  return <>{children}</>;
}

interface DialogFooterProps {
  children: ReactNode;
  className?: string;
}

export function DialogFooter({ children, className = '' }: DialogFooterProps) {
  return (
    <div className={`mt-6 pt-4 border-t flex items-center justify-end gap-2 ${className}`}>
      {children}
    </div>
  );
}