import { Button } from '@/app/components/ui/button';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { QuoteDraftResult } from '@/domains/engine/quote';

interface Props {
  data: any;
  draftResult: QuoteDraftResult | null;
  onFinalize: () => void;
}

export function ReviewStep({ data, draftResult, onFinalize }: Props) {
  if (!draftResult) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Complete as etapas anteriores para revisar
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Validation Status */}
      <div className={`p-4 rounded-lg ${
        draftResult.valid ? 'bg-green-50' : 'bg-yellow-50'
      }`}>
        <div className="flex items-center gap-2">
          {draftResult.valid ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          )}
          <span className="font-medium">
            {draftResult.valid ? 'Orçamento válido para finalização' : 'Pendências encontradas'}
          </span>
        </div>
        
        {draftResult.errors.length > 0 && (
          <ul className="mt-2 text-sm text-red-600">
            {draftResult.errors.map((err, i) => (
              <li key={i}>{err.message}</li>
            ))}
          </ul>
        )}
        
        {draftResult.warnings.length > 0 && (
          <ul className="mt-2 text-sm text-yellow-600">
            {draftResult.warnings.map((warn, i) => (
              <li key={i}>{warn.message}</li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2">Cliente</h3>
          <p>{data.customerName}</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Dimensões</h3>
          <p>{data.dimensions.length} x {data.dimensions.width} x {data.dimensions.height} mm</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Preço Final</h3>
          <p className="text-2xl font-bold text-primary">
            R$ {draftResult.pricing.targetPrice.toFixed(2)}
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Margem</h3>
          <p>{draftResult.pricing.margin.toFixed(1)}%</p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={onFinalize}
          disabled={!draftResult.valid}
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Finalizar Orçamento
        </Button>
      </div>
    </div>
  );
}