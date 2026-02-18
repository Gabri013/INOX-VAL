import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { QuoteDraftResult } from '@/domains/engine/quote';

interface Props {
  draftResult: QuoteDraftResult | null;
}

export function CostsStep({ draftResult }: Props) {
  if (!draftResult) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Execute o cálculo na etapa anterior para ver os custos
      </div>
    );
  }
  
  const { costs } = draftResult;
  
  return (
    <div className="space-y-6">
      {/* Material Costs */}
      <div>
        <h3 className="font-semibold mb-2">Custos de Material</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material</TableHead>
              <TableHead className="text-right">Custo Total</TableHead>
              <TableHead className="text-right">Desperdício</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {costs.material.breakdown.map((item, i) => (
              <TableRow key={i}>
                <TableCell>{item.materialKey}</TableCell>
                <TableCell className="text-right">
                  R$ {item.totalCost.toFixed(2)}
                </TableCell>
                <TableCell className="text-right text-red-500">
                  R$ {item.wasteCost.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Process Costs */}
      <div>
        <h3 className="font-semibold mb-2">Custos de Processos</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Processo</TableHead>
              <TableHead className="text-right">Custo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {costs.process.breakdown.map((item, i) => (
              <TableRow key={i}>
                <TableCell>{item.processKey}</TableCell>
                <TableCell className="text-right">
                  R$ {item.totalCost.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Summary */}
      <div className="bg-muted p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span>Material:</span>
          <span className="text-right">R$ {costs.material.total.toFixed(2)}</span>
          <span>Processos:</span>
          <span className="text-right">R$ {costs.process.total.toFixed(2)}</span>
          <span>Overhead:</span>
          <span className="text-right">R$ {costs.overhead.toFixed(2)}</span>
          <span className="font-bold">Total:</span>
          <span className="text-right font-bold">R$ {costs.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}