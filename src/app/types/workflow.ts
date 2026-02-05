// Tipos para o fluxo de trabalho integrado do ERP
// IMPORTANTE: Orçamentos baseados em MODELOS parametrizados de /src/bom/models

import type { ResultadoCalculadora } from '@/domains/calculadora/types';

export type StatusOrcamento = "Rascunho" | "Enviado" | "Aprovado" | "Rejeitado" | "Convertido";
export type StatusOrdem = "Pendente" | "Em Produção" | "Pausada" | "Concluída" | "Cancelada";
export type StatusCompra = "Solicitada" | "Cotação" | "Aprovada" | "Pedido Enviado" | "Recebida" | "Cancelada";

// APONTAMENTO DE PRODUÇÃO
export interface ApontamentoProducao {
  operadorId: string;
  operadorNome: string;
  dataInicio: Date;
  dataFim?: Date;
  pausas: PausaProducao[];
  tempoDecorridoMs: number; // Tempo efetivo (descontando pausas)
  observacoes?: string;
}

export interface PausaProducao {
  inicio: Date;
  fim?: Date;
  motivo?: string;
}

// NOVO: Item baseado em modelo parametrizado (não permite produtos livres)
export interface ItemOrcamento {
  id: string;
  modeloId: string; // Obrigatório - ID do modelo de /src/bom/models
  modeloNome: string; // Nome do modelo (ex: "MPLC - Mesa com Encosto Liso")
  descricao: string; // Descrição amigável (ex: "Bancada 2000×800×850mm")
  quantidade: number;
  
  // Snapshots do cálculo (não recalcula)
  calculoSnapshot: ResultadoCalculadora; // BOM + Nesting + Precificação completa
  
  // Valores calculados (cache)
  precoUnitario: number;
  subtotal: number;
}

// LEGADO: Item genérico de material (usado em compras/estoque)
export interface ItemMaterial {
  id: string;
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  unidade: string;
  precoUnitario: number;
  subtotal: number;
}

export interface Orcamento {
  id: string;
  numero: string;
  clienteId: string;
  clienteNome: string;
  data: Date;
  validade: Date;
  status: StatusOrcamento;
  itens: ItemOrcamento[];
  subtotal: number;
  desconto: number;
  total: number;
  observacoes?: string;
  ordemId?: string; // Referência à ordem criada
  
  // Campos para Firebase (multi-tenant e auditoria)
  tenantId?: string; // ID da empresa (multi-tenant)
  createdAt?: Date; // Data de criação
  updatedAt?: Date; // Data da última atualização
}

export interface OrdemProducao {
  id: string;
  numero: string;
  orcamentoId?: string; // Referência ao orçamento origem
  clienteId: string;
  clienteNome: string;
  dataAbertura: Date;
  dataPrevisao: Date;
  dataConclusao?: Date;
  status: StatusOrdem;
  itens: ItemMaterial[];
  total: number;
  prioridade: "Baixa" | "Normal" | "Alta" | "Urgente";
  observacoes?: string;
  materiaisReservados: boolean;
  materiaisConsumidos: boolean;
  
  // APONTAMENTO DE PRODUÇÃO (chão de fábrica)
  apontamento?: ApontamentoProducao;
  tempoEstimadoMinutos?: number; // Prazo estimado para alertas
  
  // Campos para Firebase (multi-tenant e auditoria)
  tenantId?: string; // ID da empresa (multi-tenant)
  createdAt?: Date; // Data de criação
  updatedAt?: Date; // Data da última atualização
}

export interface SolicitacaoCompra {
  id: string;
  numero: string;
  ordemId?: string; // Ordem que originou a solicitação
  data: Date;
  status: StatusCompra;
  fornecedorId?: string;
  fornecedorNome?: string;
  itens: ItemMaterial[];
  total: number;
  justificativa: string;
  observacoes?: string;
}

export interface MovimentacaoEstoque {
  id: string;
  data: Date;
  tipo: "Entrada" | "Saída" | "Ajuste" | "Reserva";
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  origem: string; // Descrição da origem/destino
  referencia?: string; // ID da ordem, compra, etc
  usuarioId: string;
  usuarioNome: string;
}

export interface WorkflowContextType {
  // Orçamentos
  orcamentos: Orcamento[];
  addOrcamento: (orcamento: Omit<Orcamento, "id" | "numero">) => Orcamento;
  updateOrcamento: (id: string, data: Partial<Orcamento>) => void;
  converterOrcamentoEmOrdem: (orcamentoId: string) => OrdemProducao;
  
  // Ordens de Produção
  ordens: OrdemProducao[];
  addOrdem: (ordem: Omit<OrdemProducao, "id" | "numero">) => OrdemProducao;
  updateOrdem: (id: string, data: Partial<OrdemProducao>) => void;
  iniciarProducao: (ordemId: string) => boolean; // Retorna true se tem estoque
  concluirProducao: (ordemId: string) => void;
  
  // Compras
  solicitacoes: SolicitacaoCompra[];
  addSolicitacao: (solicitacao: Omit<SolicitacaoCompra, "id" | "numero">) => SolicitacaoCompra;
  updateSolicitacao: (id: string, data: Partial<SolicitacaoCompra>) => void;
  verificarNecessidadeCompra: (ordemId: string) => ItemMaterial[];
  
  // Estoque
  movimentacoes: MovimentacaoEstoque[];
  verificarDisponibilidade: (produtoId: string, quantidade: number) => boolean;
  reservarMateriais: (ordemId: string) => boolean;
  consumirMateriais: (ordemId: string) => boolean;
}