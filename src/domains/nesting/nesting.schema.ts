/**
 * Schemas de validação para Nesting
 */

import { z } from 'zod';
import { requiredString, requiredNumber } from '@/shared/lib/validators';

export const itemNestingSchema = z.object({
  descricao: requiredString('Descrição é obrigatória'),
  quantidade: requiredNumber('Quantidade é obrigatória').min(1, 'Quantidade deve ser maior que 0'),
  largura: z.number().optional(),
  comprimento: z.number().optional(),
  diametro: z.number().optional(),
  espessura: z.number().optional(),
  peso: z.number().optional(),
  area: z.number().optional(),
  unidade: z.enum(['mm', 'cm', 'm', 'kg', 'un']),
});

export const materialBaseSchema = z.object({
  tipo: z.enum(['CHAPA', 'TUBO', 'PERFIL', 'BARRA']),
  descricao: requiredString('Descrição é obrigatória'),
  largura: z.number().optional(),
  comprimento: z.number().optional(),
  espessura: z.number().optional(),
  diametro: z.number().optional(),
  peso: requiredNumber('Peso é obrigatório').min(0.01, 'Peso deve ser maior que 0'),
  custoKg: requiredNumber('Custo por kg é obrigatório').min(0, 'Custo não pode ser negativo'),
  fornecedor: z.string().optional(),
});

export const createCalculoNestingSchema = z.object({
  nome: requiredString('Nome é obrigatório'),
  descricao: z.string().optional(),
  clienteId: z.string().optional(),
  itens: z.array(itemNestingSchema).min(1, 'Adicione pelo menos um item'),
  materialBase: materialBaseSchema,
  custoMaoObra: z.number().min(0, 'Custo não pode ser negativo').optional(),
  custoSetup: z.number().min(0, 'Custo não pode ser negativo').optional(),
  custoOutros: z.number().min(0, 'Custo não pode ser negativo').optional(),
  margemLucro: z.number().min(0, 'Margem não pode ser negativa').max(100, 'Margem não pode exceder 100%').optional(),
  criadoPor: requiredString('Usuário é obrigatório'),
});

export const updateCalculoNestingSchema = createCalculoNestingSchema.partial().extend({
  atualizadoPor: requiredString('Usuário é obrigatório'),
});

export const parametrosCalculoSchema = z.object({
  espacamentoCorte: requiredNumber('Espaçamento é obrigatório').min(0, 'Espaçamento não pode ser negativo'),
  perdaBorda: requiredNumber('Perda de borda é obrigatória').min(0, 'Perda não pode ser negativa'),
  eficienciaCorte: requiredNumber('Eficiência é obrigatória').min(0, 'Eficiência mínima é 0%').max(100, 'Eficiência máxima é 100%'),
});

export type CreateCalculoNestingFormData = z.infer<typeof createCalculoNestingSchema>;
export type UpdateCalculoNestingFormData = z.infer<typeof updateCalculoNestingSchema>;
export type ItemNestingFormData = z.infer<typeof itemNestingSchema>;
export type MaterialBaseFormData = z.infer<typeof materialBaseSchema>;
export type ParametrosCalculoFormData = z.infer<typeof parametrosCalculoSchema>;
