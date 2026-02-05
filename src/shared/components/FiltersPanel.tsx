/**
 * Painel de filtros recolhível para listagens
 */

import { ReactNode, useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

export interface FiltersPanelProps {
  /**
   * Conteúdo dos filtros (inputs, selects, etc)
   */
  children: ReactNode;
  
  /**
   * Callback ao aplicar filtros
   */
  onApply?: () => void;
  
  /**
   * Callback ao limpar filtros
   */
  onClear?: () => void;
  
  /**
   * Se o painel deve começar expandido
   */
  defaultExpanded?: boolean;
  
  /**
   * Título do painel
   */
  title?: string;
}

export function FiltersPanel({
  children,
  onApply,
  onClear,
  defaultExpanded = false,
  title = 'Filtros',
}: FiltersPanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        {/* Header do painel */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            {title}
          </button>
          
          {onClear && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-8"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>

        {/* Conteúdo dos filtros */}
        {isExpanded && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children}
            </div>
            
            {onApply && (
              <div className="flex justify-end pt-2">
                <Button onClick={onApply} size="sm">
                  Aplicar Filtros
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
