import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  data: any;
  onChange: (updates: any) => void;
}

export function CustomerStep({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customerName">Nome do Cliente</Label>
          <Input
            id="customerName"
            value={data.customerName}
            onChange={(e) => onChange({ customerName: e.target.value })}
            placeholder="Nome ou razão social"
          />
        </div>
        <div>
          <Label htmlFor="customerContact">Contato</Label>
          <Input
            id="customerContact"
            value={data.customerContact}
            onChange={(e) => onChange({ customerContact: e.target.value })}
            placeholder="Nome do contato"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="customerEmail">Email</Label>
        <Input
          id="customerEmail"
          type="email"
          value={data.customerEmail}
          onChange={(e) => onChange({ customerEmail: e.target.value })}
          placeholder="email@exemplo.com"
        />
      </div>
    </div>
  );
}