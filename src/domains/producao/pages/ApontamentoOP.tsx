/**
 * APONTAMENTO DE PRODUÇÃO - Interface para operadores no chão de fábrica
 * - Login simplificado (seleção de operador)
 * - Selecionar OP da fila
 * - Iniciar, Pausar, Retomar, Finalizar
 * - Interface touch-friendly (botões grandes)
 */

import { useState, useEffect } from 'react';
import { useWorkflow } from '@/app/contexts/WorkflowContext';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Play, Pause, Square, Clock, User, AlertCircle } from 'lucide-react';
import type { OrdemProducao } from '@/app/types/workflow';

// Lista de operadores (em produção viria do backend)
const OPERADORES = [
  { id: '1', nome: 'João Silva' },
  { id: '2', nome: 'Maria Santos' },
  { id: '3', nome: 'Pedro Costa' },
  { id: '4', nome: 'Ana Oliveira' },
  { id: '5', nome: 'Carlos Souza' },
];

export default function ApontamentoOP() {
  const { ordens, updateOrdem } = useWorkflow();
  const [operadorSelecionado, setOperadorSelecionado] = useState<string | null>(null);
  const [opSelecionada, setOpSelecionada] = useState<OrdemProducao | null>(null);
  const [tempoDecorrido, setTempoDecorrido] = useState(0);

  // Filtrar OPs disponíveis para produção
  const opsPendentes = ordens.filter(op => op.status === 'Pendente' && op.materiaisReservados);
  const opsEmProducao = ordens.filter(op => op.status === 'Em Produção');

  // Timer para atualizar tempo decorrido
  useEffect(() => {
    if (opSelecionada?.status === 'Em Produção' && opSelecionada.apontamento) {
      const interval = setInterval(() => {
        const inicio = new Date(opSelecionada.apontamento!.dataInicio).getTime();
        const agora = Date.now();
        
        // Calcular tempo de pausas
        let tempoPausas = 0;
        opSelecionada.apontamento!.pausas.forEach(pausa => {
          const inicioPausa = new Date(pausa.inicio).getTime();
          const fimPausa = pausa.fim ? new Date(pausa.fim).getTime() : agora;
          tempoPausas += fimPausa - inicioPausa;
        });
        
        const tempoEfetivoMs = agora - inicio - tempoPausas;
        setTempoDecorrido(Math.floor(tempoEfetivoMs / 1000)); // em segundos
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [opSelecionada]);

  // Formatar tempo (HH:MM:SS)
  const formatarTempo = (segundos: number) => {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Ações
  const handleIniciarOP = (op: OrdemProducao) => {
    if (!operadorSelecionado) return;

    const operador = OPERADORES.find(o => o.id === operadorSelecionado);
    if (!operador) return;

    updateOrdem(op.id, {
      status: 'Em Produção',
      apontamento: {
        operadorId: operador.id,
        operadorNome: operador.nome,
        dataInicio: new Date(),
        pausas: [],
        tempoDecorridoMs: 0,
      },
    });

    setOpSelecionada({ ...op, status: 'Em Produção' });
  };

  const handlePausarOP = () => {
    if (!opSelecionada || !opSelecionada.apontamento) return;

    // Verificar se já está pausada
    const ultimaPausa = opSelecionada.apontamento.pausas[opSelecionada.apontamento.pausas.length - 1];
    if (ultimaPausa && !ultimaPausa.fim) {
      alert('OP já está pausada');
      return;
    }

    updateOrdem(opSelecionada.id, {
      status: 'Pausada',
      apontamento: {
        ...opSelecionada.apontamento,
        pausas: [
          ...opSelecionada.apontamento.pausas,
          { inicio: new Date() },
        ],
      },
    });

    setOpSelecionada({ ...opSelecionada, status: 'Pausada' });
  };

  const handleRetomarOP = () => {
    if (!opSelecionada || !opSelecionada.apontamento) return;

    const pausas = [...opSelecionada.apontamento.pausas];
    const ultimaPausa = pausas[pausas.length - 1];
    
    if (ultimaPausa && !ultimaPausa.fim) {
      ultimaPausa.fim = new Date();
    }

    updateOrdem(opSelecionada.id, {
      status: 'Em Produção',
      apontamento: {
        ...opSelecionada.apontamento,
        pausas,
      },
    });

    setOpSelecionada({ ...opSelecionada, status: 'Em Produção' });
  };

  const handleFinalizarOP = () => {
    if (!opSelecionada || !opSelecionada.apontamento) return;

    const dataFim = new Date();
    const inicio = new Date(opSelecionada.apontamento.dataInicio).getTime();
    
    // Calcular tempo total descontando pausas
    let tempoPausas = 0;
    opSelecionada.apontamento.pausas.forEach(pausa => {
      const inicioPausa = new Date(pausa.inicio).getTime();
      const fimPausa = pausa.fim ? new Date(pausa.fim).getTime() : dataFim.getTime();
      tempoPausas += fimPausa - inicioPausa;
    });
    
    const tempoEfetivoMs = dataFim.getTime() - inicio - tempoPausas;

    updateOrdem(opSelecionada.id, {
      status: 'Concluída',
      dataConclusao: dataFim,
      apontamento: {
        ...opSelecionada.apontamento,
        dataFim,
        tempoDecorridoMs: tempoEfetivoMs,
      },
    });

    setOpSelecionada(null);
    setTempoDecorrido(0);
  };

  // TELA 1: Seleção de Operador
  if (!operadorSelecionado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Apontamento de Produção</h1>
            <p className="text-2xl text-gray-600">Selecione seu nome para começar</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {OPERADORES.map(operador => (
              <button
                key={operador.id}
                onClick={() => setOperadorSelecionado(operador.id)}
                className="bg-white hover:bg-blue-50 border-4 border-blue-200 hover:border-blue-400 
                           rounded-2xl p-12 transition-all transform hover:scale-105 shadow-lg"
              >
                <User className="w-20 h-20 mx-auto mb-6 text-blue-600" />
                <p className="text-3xl font-bold text-gray-900">{operador.nome}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const operador = OPERADORES.find(o => o.id === operadorSelecionado);

  // TELA 2: OP em Andamento
  if (opSelecionada && (opSelecionada.status === 'Em Produção' || opSelecionada.status === 'Pausada')) {
    const isPausada = opSelecionada.status === 'Pausada';
    const statusColor = isPausada ? 'yellow' : 'green';
    
    // Calcular % do tempo estimado
    let percentualTempo = 0;
    if (opSelecionada.tempoEstimadoMinutos) {
      const tempoEstimadoSegundos = opSelecionada.tempoEstimadoMinutos * 60;
      percentualTempo = (tempoDecorrido / tempoEstimadoSegundos) * 100;
    }

    const statusAlert = percentualTempo > 100 ? 'red' : percentualTempo > 80 ? 'yellow' : 'green';

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{opSelecionada.numero}</h1>
                <p className="text-2xl text-gray-600">{opSelecionada.clienteNome}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-8 h-8 text-gray-600" />
                  <p className="text-2xl font-semibold text-gray-900">{operador?.nome}</p>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setOperadorSelecionado(null);
                    setOpSelecionada(null);
                  }}
                >
                  Trocar Operador
                </Button>
              </div>
            </div>
          </div>

          {/* Cronômetro */}
          <div className={`bg-${statusColor}-50 border-4 border-${statusColor}-400 rounded-2xl p-12 mb-8 text-center`}>
            <div className="flex items-center justify-center gap-6 mb-6">
              <Clock className={`w-16 h-16 text-${statusColor}-600`} />
              <p className={`text-8xl font-bold font-mono text-${statusColor}-700`}>
                {formatarTempo(tempoDecorrido)}
              </p>
            </div>
            
            {opSelecionada.tempoEstimadoMinutos && (
              <div className="mt-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <p className="text-xl text-gray-700">
                    Prazo estimado: {opSelecionada.tempoEstimadoMinutos} min ({formatarTempo(opSelecionada.tempoEstimadoMinutos * 60)})
                  </p>
                  {statusAlert === 'red' && (
                    <AlertCircle className="w-8 h-8 text-red-500 animate-pulse" />
                  )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <div
                    className={`h-6 rounded-full transition-all ${
                      statusAlert === 'red' ? 'bg-red-500' : 
                      statusAlert === 'yellow' ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(percentualTempo, 100)}%` }}
                  />
                </div>
                <p className={`text-lg mt-2 font-semibold ${
                  statusAlert === 'red' ? 'text-red-600' : 
                  statusAlert === 'yellow' ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>
                  {percentualTempo.toFixed(0)}% do tempo decorrido
                </p>
              </div>
            )}
            
            <p className={`text-3xl font-bold mt-6 ${isPausada ? 'text-yellow-700' : 'text-green-700'}`}>
              {isPausada ? '⏸️ PAUSADA' : '▶️ EM PRODUÇÃO'}
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="grid grid-cols-3 gap-6">
            {!isPausada && (
              <Button
                onClick={handlePausarOP}
                size="lg"
                variant="outline"
                className="h-32 text-2xl font-bold border-4 border-yellow-400 hover:bg-yellow-50"
              >
                <Pause className="w-12 h-12 mr-4" />
                Pausar
              </Button>
            )}
            
            {isPausada && (
              <Button
                onClick={handleRetomarOP}
                size="lg"
                className="h-32 text-2xl font-bold bg-green-500 hover:bg-green-600"
              >
                <Play className="w-12 h-12 mr-4" />
                Retomar
              </Button>
            )}
            
            <Button
              onClick={handleFinalizarOP}
              size="lg"
              className="h-32 text-2xl font-bold bg-blue-600 hover:bg-blue-700 col-span-2"
            >
              <Square className="w-12 h-12 mr-4" />
              Finalizar OP
            </Button>
          </div>

          {/* Info da OP */}
          <Card className="mt-8 p-6">
            <h3 className="text-2xl font-bold mb-4">Itens da OP</h3>
            <div className="space-y-2">
              {opSelecionada.itens.map(item => (
                <div key={item.id} className="flex justify-between text-lg">
                  <span>{item.produtoNome}</span>
                  <span className="font-semibold">{item.quantidade} {item.unidade}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // TELA 3: Seleção de OP
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Selecione uma OP</h1>
              <div className="flex items-center gap-3">
                <User className="w-8 h-8 text-gray-600" />
                <p className="text-2xl text-gray-700">Operador: <span className="font-bold">{operador?.nome}</span></p>
              </div>
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setOperadorSelecionado(null)}
            >
              Trocar Operador
            </Button>
          </div>
        </div>

        {/* OPs em Produção (outros operadores) */}
        {opsEmProducao.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">🔄 Em Produção (Outros Operadores)</h2>
            <div className="grid gap-4">
              {opsEmProducao.map(op => (
                <Card key={op.id} className="p-6 bg-yellow-50 border-2 border-yellow-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{op.numero}</h3>
                      <p className="text-lg text-gray-700">{op.clienteNome}</p>
                      {op.apontamento && (
                        <p className="text-lg text-yellow-700 font-semibold mt-2">
                          👤 {op.apontamento.operadorNome}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-6 py-3 bg-yellow-500 text-white font-bold rounded-lg text-xl">
                        EM PRODUÇÃO
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* OPs Pendentes */}
        <div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">📋 Fila de OPs Pendentes</h2>
          
          {opsPendentes.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-2xl text-gray-500">Nenhuma OP disponível para produção</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {opsPendentes.map(op => (
                <button
                  key={op.id}
                  onClick={() => handleIniciarOP(op)}
                  className="bg-white hover:bg-green-50 border-4 border-green-200 hover:border-green-400 
                             rounded-2xl p-8 transition-all transform hover:scale-[1.02] shadow-lg text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">{op.numero}</h3>
                      <p className="text-xl text-gray-700 mb-1">{op.clienteNome}</p>
                      <p className="text-lg text-gray-600">
                        Prazo: {new Date(op.dataPrevisao).toLocaleDateString('pt-BR')}
                      </p>
                      {op.tempoEstimadoMinutos && (
                        <p className="text-lg text-blue-600 font-semibold mt-2">
                          ⏱️ Tempo estimado: {op.tempoEstimadoMinutos} min
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-6 py-3 font-bold rounded-lg text-xl mb-3 ${
                        op.prioridade === 'Urgente' ? 'bg-red-500 text-white' :
                        op.prioridade === 'Alta' ? 'bg-orange-500 text-white' :
                        op.prioridade === 'Normal' ? 'bg-blue-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {op.prioridade}
                      </span>
                      <div className="flex items-center justify-end gap-2">
                        <Play className="w-10 h-10 text-green-600" />
                        <span className="text-2xl font-bold text-green-600">Iniciar</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
