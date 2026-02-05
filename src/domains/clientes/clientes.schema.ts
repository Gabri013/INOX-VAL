/**
 * Schemas de validação para Clientes
 */

import { z } from 'zod';
import { requiredString, emailSchema, cnpjSchema, phoneSchema } from '@/shared/lib/validators';

export const createClienteSchema = z.object({
  nome: requiredString('Nome é obrigatório'),
  cnpj: cnpjSchema,
  email: emailSchema,
  telefone: phoneSchema,
  endereco: z.string().optional(),
  cidade: requiredString('Cidade é obrigatória'),
  estado: requiredString('Estado é obrigatório').length(2, 'Use a sigla do estado (ex: SP)'),
  cep: z.string().regex(/^\d{5}-\d{3}$/, 'CEP inválido').optional(),
  status: z.enum(['Ativo', 'Inativo', 'Bloqueado']),
  observacoes: z.string().optional(),
});

export const updateClienteSchema = createClienteSchema.partial();

export type CreateClienteFormData = z.infer<typeof createClienteSchema>;
export type UpdateClienteFormData = z.infer<typeof updateClienteSchema>;
