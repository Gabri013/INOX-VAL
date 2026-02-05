/**
 * Componente de estado vazio reutilizável
 */

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

export interface EmptyStateProps {
  /**
   * Ícone a ser exibido
   */
  icon?: LucideIcon;
  
  /**
   * Título
   */
  title: string;
  
  /**
   * Descrição
   */
  description?: string;
  
  /**
   * Ação primária (opcional)
   */
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-muted/10">
      {Icon && (
        <Icon className="h-12 w-12 text-muted-foreground/50 mb-4" />
      )}
      
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      
      {description && (
        <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
          {description}
        </p>
      )}
      
      {action && (
        <Button onClick={action.onClick}>
          {action.icon}
          {action.label}
        </Button>
      )}
    </div>
  );
}
