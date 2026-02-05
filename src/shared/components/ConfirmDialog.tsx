/**
 * Dialog de confirmação reutilizável
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';

export interface ConfirmDialogProps {
  /**
   * Se o dialog está aberto
   */
  open: boolean;
  
  /**
   * Callback de mudança de estado
   */
  onOpenChange: (open: boolean) => void;
  
  /**
   * Título do dialog
   */
  title: string;
  
  /**
   * Descrição/mensagem
   */
  description: string;
  
  /**
   * Callback de confirmação
   */
  onConfirm: () => void;
  
  /**
   * Callback de cancelamento
   */
  onCancel?: () => void;
  
  /**
   * Label do botão de confirmação
   */
  confirmLabel?: string;
  
  /**
   * Label do botão de cancelamento
   */
  cancelLabel?: string;
  
  /**
   * Variante do botão de confirmação
   */
  variant?: 'default' | 'destructive';
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className={variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
