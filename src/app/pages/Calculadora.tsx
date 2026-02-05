/**
 * Página de Calculadora BOM
 * Interface padronizada com layout consistente
 */

import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

export default function Calculadora() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calculator className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Calculadora BOM</h1>
            <p className="text-muted-foreground">
              Calcule Bill of Materials e visualize nesting de chapas
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cálculo Rápido</CardTitle>
            <CardDescription>
              Para cálculos rápidos de BOM, utilize a funcionalidade integrada no sistema de orçamentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              A calculadora BOM está integrada ao fluxo de orçamentos. Ao criar um novo orçamento,
              o sistema calcula automaticamente:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Blanks necessários baseados nas dimensões do produto</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Nesting otimizado de chapas (2000×1250 e 3000×1250)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Tubos e perfis conforme modelo parametrizado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Custos totais com breakdown detalhado</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acesso Rápido</CardTitle>
            <CardDescription>
              Navegue para as páginas relacionadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <a 
              href="/orcamentos" 
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div>
                <p className="font-medium">Criar Orçamento</p>
                <p className="text-sm text-muted-foreground">Com cálculo automático de BOM</p>
              </div>
              <span className="text-muted-foreground">→</span>
            </a>

            <a 
              href="/ordens" 
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div>
                <p className="font-medium">Ordens de Produção</p>
                <p className="text-sm text-muted-foreground">Visualize BOM e nesting de OPs</p>
              </div>
              <span className="text-muted-foreground">→</span>
            </a>

            <a 
              href="/catalogo-insumos" 
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div>
                <p className="font-medium">Catálogo de Insumos</p>
                <p className="text-sm text-muted-foreground">Visualize materiais disponíveis</p>
              </div>
              <span className="text-muted-foreground">→</span>
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Modelos Parametrizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tipos de bancadas e equipamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Chapas Padrão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground mt-1">
              2000×1250 e 3000×1250
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Algoritmo de Nesting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Real</div>
            <p className="text-xs text-muted-foreground mt-1">
              Guillotine + Shelf packing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes Técnicos */}
      <Card>
        <CardHeader>
          <CardTitle>Como Funciona</CardTitle>
          <CardDescription>
            Fluxo obrigatório do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 items-center justify-center py-4">
            <div className="px-4 py-2 bg-primary/10 rounded-lg text-sm font-medium">
              1. Modelo
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="px-4 py-2 bg-primary/10 rounded-lg text-sm font-medium">
              2. Dimensões
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="px-4 py-2 bg-primary/10 rounded-lg text-sm font-medium">
              3. Blank
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="px-4 py-2 bg-primary/10 rounded-lg text-sm font-medium">
              4. BOM
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="px-4 py-2 bg-primary/10 rounded-lg text-sm font-medium">
              5. Nesting
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="px-4 py-2 bg-primary/10 rounded-lg text-sm font-medium">
              6. Consumo
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="px-4 py-2 bg-primary/10 rounded-lg text-sm font-medium">
              7. Custos
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="px-4 py-2 bg-primary/10 rounded-lg text-sm font-medium">
              8. Preço Final
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-4">
            O sistema <strong>não permite produtos livres</strong> - todo item deve ser baseado em modelos parametrizados
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
