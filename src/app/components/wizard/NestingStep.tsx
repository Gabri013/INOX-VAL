import { Button } from '@/app/components/ui/button';
import { Loader2 } from 'lucide-react';
import { QuoteDraftResult } from '@/domains/engine/quote';

interface Props {
  data: any;
  draftResult: QuoteDraftResult | null;
  onCalculate: () => void;
  isCalculating: boolean;
}

export function NestingStep({ data, draftResult, onCalculate, isCalculating }: Props) {
  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <p className="text-muted-foreground mb-4">
          Clique no botão abaixo para calcular o nesting e otimizar o uso de chapas.
        </p>
        <Button 
          onClick={onCalculate} 
          disabled={isCalculating}
          size="lg"
        >
          {isCalculating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Calculando...
            </>
          ) : (
            'Calcular Nesting'
          )}
        </Button>
      </div>
      
      {draftResult && (
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Resultado do Nesting</h3>
          
          {draftResult.nesting.sheets.length > 0 ? (
            <div className="space-y-3">
              {draftResult.nesting.sheets.map((sheet, index) => (
                <div key={index} className="bg-muted p-3 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Chapa {index + 1}</span>
                    <span className="text-sm text-muted-foreground">
                      {sheet.width}x{sheet.height}mm
                    </span>
                  </div>
                  <div className="mt-2 text-sm">
                    <div className="flex justify-between">
                      <span>Área utilizada:</span>
                      <span>{(sheet.utilization * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Peças:</span>
                      <span>{sheet.parts.length}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Nenhum resultado de nesting disponível.
            </p>
          )}
        </div>
      )}
    </div>
  );
}