import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  data: any;
  onChange: (updates: any) => void;
}

export function BOMStep({ data, onChange }: Props) {
  const { bom } = data;
  
  const addSheet = () => {
    const newSheet = {
      id: `sheet-${Date.now()}`,
      name: 'Nova Chapa',
      width: 1000,
      height: 500,
      thickness: data.dimensions.thickness,
      finish: data.dimensions.finish,
      quantity: 1,
      materialKey: '',
    };
    onChange({
      bom: { ...bom, sheets: [...bom.sheets, newSheet] }
    });
  };
  
  const removeSheet = (id: string) => {
    onChange({
      bom: { ...bom, sheets: bom.sheets.filter((s: any) => s.id !== id) }
    });
  };
  
  const updateSheet = (id: string, updates: any) => {
    onChange({
      bom: {
        ...bom,
        sheets: bom.sheets.map((s: any) => 
          s.id === id ? { ...s, ...updates } : s
        )
      }
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-base">Chapas</Label>
          <Button variant="outline" size="sm" onClick={addSheet}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Chapa
          </Button>
        </div>
        
        {bom.sheets.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Largura</TableHead>
                <TableHead>Altura</TableHead>
                <TableHead>Qtd</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bom.sheets.map((sheet: any) => (
                <TableRow key={sheet.id}>
                  <TableCell>
                    <Input
                      value={sheet.name}
                      onChange={(e) => updateSheet(sheet.id, { name: e.target.value })}
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={sheet.width}
                      onChange={(e) => updateSheet(sheet.id, { width: Number(e.target.value) })}
                      className="h-8 w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={sheet.height}
                      onChange={(e) => updateSheet(sheet.id, { height: Number(e.target.value) })}
                      className="h-8 w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={sheet.quantity}
                      onChange={(e) => updateSheet(sheet.id, { quantity: Number(e.target.value) })}
                      className="h-8 w-16"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSheet(sheet.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground border rounded-lg">
            Nenhuma chapa adicionada. Clique em "Adicionar Chapa" para começar.
          </div>
        )}
      </div>
      
      <div>
        <Label className="text-base">Processos</Label>
        <div className="flex flex-wrap gap-2 mt-3">
          {['CORTE_LASER', 'DOBRA', 'MONTAGEM', 'EMBALAGEM', 'SOLDAGEM', 'POLIMENTO'].map((process) => (
            <label
              key={process}
              className="flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer hover:bg-accent"
            >
              <input
                type="checkbox"
                checked={bom.processes.includes(process)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange({ bom: { ...bom, processes: [...bom.processes, process] } });
                  } else {
                    onChange({ bom: { ...bom, processes: bom.processes.filter((p: string) => p !== process) } });
                  }
                }}
                className="rounded"
              />
              <span className="text-sm">{process.replace(/_/g, ' ')}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}