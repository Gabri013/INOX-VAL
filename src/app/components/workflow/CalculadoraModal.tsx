/**
 * Modal da Calculadora Rápida para Orçamentos
 * Permite calcular item baseado em modelo e adicionar ao orçamento
 */

import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { ItemOrcamento } from '../../types/workflow';
import { CalculadoraRapida } from '@/domains/calculadora/pages/CalculadoraRapida';
import type { ResultadoCalculadora } from '@/domains/calculadora/types';

interface CalculadoraModalProps {
  onAddItem: (item: ItemOrcamento) => void;
  onClose: () => void;
}

export function CalculadoraModal({ onAddItem, onClose }: CalculadoraModalProps) {
  const [resultado, setResultado] = useState<ResultadoCalculadora | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [showQuantidade, setShowQuantidade] = useState(false);

  const handleCalculoCompleto = (result: ResultadoCalculadora) => {
    setResultado(result);
    setShowQuantidade(true);
  };

  const handleAddToOrcamento = () => {
    if (!resultado) return;

    if (quantidade < 1) {
      toast.error('Quantidade deve ser no mínimo 1');
      return;
    }

    const { modelo, config } = resultado.entrada;
    const precoUnitario = resultado.precificacao.precoFinal;
    
    // Gerar descrição amigável
    const descricao = `${config.comprimento}×${config.largura}×${config.altura}mm - ${config.material}`;

    const item: ItemOrcamento = {
      id: `item-${Date.now()}`,
      modeloId: modelo.id,
      modeloNome: modelo.nome,
      descricao,
      quantidade,
      calculoSnapshot: resultado,
      precoUnitario,
      subtotal: precoUnitario * quantidade,
    };

    onAddItem(item);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Item ao Orçamento</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {!showQuantidade ? (
            <>
              <p className="text-sm text-muted-foreground">
                Use a calculadora abaixo para configurar o produto e calcular o preço.
              </p>
              
              <CalculadoraRapida 
                embedded 
                onCalculoCompleto={handleCalculoCompleto}
              />
            </>
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <h4 className="font-medium">Produto Calculado</h4>
                <p className="text-sm">
                  {resultado?.entrada.modelo.nome} - {' '}
                  {resultado?.entrada.config.comprimento}×
                  {resultado?.entrada.config.largura}×
                  {resultado?.entrada.config.altura}mm
                </p>
                <p className="text-lg font-bold font-mono">
                  R$ {resultado?.precificacao.precoFinal.toFixed(2)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(Number(e.target.value))}
                  autoFocus
                />
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total do Item:</span>
                  <span className="text-xl font-bold font-mono">
                    R$ {((resultado?.precificacao.precoFinal || 0) * quantidade).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowQuantidade(false);
                    setResultado(null);
                  }}
                >
                  Voltar para Calculadora
                </Button>
                
                <Button onClick={handleAddToOrcamento}>
                  Adicionar ao Orçamento
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}