/**
 * DASHBOARD TV - Exibição em tempo real para TV no chão de fábrica
 * - Auto-refresh a cada 5 segundos
 * - Cards grandes com OPs em andamento
 * - Cronômetro em tempo real
 * - Status visual (verde/amarelo/vermelho)
 * - Fila de OPs pendentes
 */

import { useState, useEffect } from 'react';
import { useWorkflow } from '@/app/contexts/WorkflowContext';
import { Clock, User, AlertTriangle, CheckCircle2, List } from 'lucide-react';
import type { OrdemProducao } from '@/app/types/workflow';

export default function DashboardTV() {
  const { ordens } = useWorkflow();
  const [temposAtuais, setTemposAtuais] = useState<Record<string, number>>({});

  // Filtrar OPs
  const opsEmProducao = ordens.filter(op => op.status === 'Em Produção');
  const opsPausadas = ordens.filter(op => op.status === 'Pausada');
  const opsPendentes = ordens.filter(op => op.status === 'Pendente' && op.materiaisReservados);

  // Timer para atualizar tempos em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      const novosTempos: Record<string, number> = {};
      
      [...opsEmProducao, ...opsPausadas].forEach(op => {
        if (!op.apontamento) return;
        
        const inicio = new Date(op.apontamento.dataInicio).getTime();
        const agora = Date.now();
        
        // Calcular tempo de pausas
        let tempoPausas = 0;
        op.apontamento.pausas.forEach(pausa => {
          const inicioPausa = new Date(pausa.inicio).getTime();
          const fimPausa = pausa.fim ? new Date(pausa.fim).getTime() : agora;
          tempoPausas += fimPausa - inicioPausa;
        });
        
        const tempoEfetivoMs = agora - inicio - tempoPausas;
        novosTempos[op.id] = Math.floor(tempoEfetivoMs / 1000); // em segundos
      });
      
      setTemposAtuais(novosTempos);
    }, 1000);

    return () => clearInterval(interval);
  }, [opsEmProducao, opsPausadas]);

  // Formatar tempo (HH:MM:SS)
  const formatarTempo = (segundos: number) => {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Calcular status de prazo
  const getStatusPrazo = (op: OrdemProducao, tempoDecorrido: number) => {
    if (!op.tempoEstimadoMinutos) return 'normal';
    
    const tempoEstimadoSegundos = op.tempoEstimadoMinutos * 60;
    const percentual = (tempoDecorrido / tempoEstimadoSegundos) * 100;
    
    if (percentual > 100) return 'atrasado';
    if (percentual > 80) return 'atencao';
    return 'noPrazo';
  };

  // Hora atual
  const [horaAtual, setHoraAtual] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setHoraAtual(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl shadow-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">🏭 Produção em Tempo Real</h1>
              <p className="text-2xl text-blue-100">
                {opsEmProducao.length} em produção • {opsPausadas.length} pausadas • {opsPendentes.length} na fila
              </p>
            </div>
            <div className="text-right">
              <p className="text-6xl font-bold text-white font-mono">
                {horaAtual.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xl text-blue-100">
                {horaAtual.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* OPs em Produção */}
          {opsEmProducao.slice(0, 6).map(op => {
            const tempoDecorrido = temposAtuais[op.id] || 0;
            const statusPrazo = getStatusPrazo(op, tempoDecorrido);
            
            let bgColor = 'from-green-500 to-green-600';
            let textColor = 'text-green-50';
            let borderColor = 'border-green-400';
            let statusIcon = <CheckCircle2 className="w-12 h-12" />;
            let statusLabel = 'NO PRAZO';
            
            if (statusPrazo === 'atrasado') {
              bgColor = 'from-red-500 to-red-600';
              textColor = 'text-red-50';
              borderColor = 'border-red-400';
              statusIcon = <AlertTriangle className="w-12 h-12 animate-pulse" />;
              statusLabel = 'ATRASADO';
            } else if (statusPrazo === 'atencao') {
              bgColor = 'from-yellow-500 to-yellow-600';
              textColor = 'text-yellow-50';
              borderColor = 'border-yellow-400';
              statusIcon = <Clock className="w-12 h-12" />;
              statusLabel = 'ATENÇÃO';
            }

            return (
              <div
                key={op.id}
                className={`bg-gradient-to-br ${bgColor} rounded-2xl shadow-2xl p-6 border-4 ${borderColor} 
                           transform transition-all hover:scale-[1.02]`}
              >
                {/* Cabeçalho */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-1">{op.numero}</h3>
                    <p className="text-lg text-white/90">{op.clienteNome}</p>
                  </div>
                  <div className={`${textColor}`}>
                    {statusIcon}
                  </div>
                </div>

                {/* Cronômetro */}
                <div className="bg-black/20 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Clock className="w-8 h-8 text-white" />
                    <p className="text-6xl font-bold font-mono text-white">
                      {formatarTempo(tempoDecorrido)}
                    </p>
                  </div>
                  {op.tempoEstimadoMinutos && (
                    <div className="text-center">
                      <p className="text-sm text-white/80 mb-1">
                        Prazo: {formatarTempo(op.tempoEstimadoMinutos * 60)}
                      </p>
                      <div className="w-full bg-white/20 rounded-full h-3">
                        <div
                          className="h-3 bg-white rounded-full transition-all"
                          style={{ 
                            width: `${Math.min((tempoDecorrido / (op.tempoEstimadoMinutos * 60)) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Operador */}
                {op.apontamento && (
                  <div className="flex items-center gap-3 mb-3">
                    <User className="w-6 h-6 text-white" />
                    <p className="text-xl font-semibold text-white">{op.apontamento.operadorNome}</p>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">▶️ EM PRODUÇÃO</span>
                  <span className="text-xl font-bold text-white">{statusLabel}</span>
                </div>
              </div>
            );
          })}

          {/* OPs Pausadas */}
          {opsPausadas.slice(0, 6 - opsEmProducao.length).map(op => {
            const tempoDecorrido = temposAtuais[op.id] || 0;

            return (
              <div
                key={op.id}
                className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-2xl p-6 
                           border-4 border-yellow-400"
              >
                {/* Cabeçalho */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-1">{op.numero}</h3>
                    <p className="text-lg text-white/90">{op.clienteNome}</p>
                  </div>
                  <AlertTriangle className="w-12 h-12 text-yellow-50 animate-pulse" />
                </div>

                {/* Cronômetro */}
                <div className="bg-black/20 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-center gap-3">
                    <Clock className="w-8 h-8 text-white" />
                    <p className="text-6xl font-bold font-mono text-white">
                      {formatarTempo(tempoDecorrido)}
                    </p>
                  </div>
                </div>

                {/* Operador */}
                {op.apontamento && (
                  <div className="flex items-center gap-3 mb-3">
                    <User className="w-6 h-6 text-white" />
                    <p className="text-xl font-semibold text-white">{op.apontamento.operadorNome}</p>
                  </div>
                )}

                {/* Status */}
                <div className="text-center">
                  <span className="text-3xl font-bold text-white">⏸️ PAUSADA</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fila de Pendentes */}
        {opsPendentes.length > 0 && (
          <div className="bg-slate-800 rounded-3xl shadow-2xl p-6 border-2 border-slate-700">
            <div className="flex items-center gap-4 mb-4">
              <List className="w-10 h-10 text-slate-300" />
              <h2 className="text-3xl font-bold text-white">Fila de Produção ({opsPendentes.length})</h2>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {opsPendentes.slice(0, 8).map(op => (
                <div
                  key={op.id}
                  className="bg-slate-700 hover:bg-slate-600 rounded-xl p-4 border-2 border-slate-600 
                             transition-all"
                >
                  <h3 className="text-xl font-bold text-white mb-1">{op.numero}</h3>
                  <p className="text-sm text-slate-300 mb-2">{op.clienteNome}</p>
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                      op.prioridade === 'Urgente' ? 'bg-red-500 text-white' :
                      op.prioridade === 'Alta' ? 'bg-orange-500 text-white' :
                      op.prioridade === 'Normal' ? 'bg-blue-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {op.prioridade}
                    </span>
                    {op.tempoEstimadoMinutos && (
                      <span className="text-xs text-slate-400">
                        {op.tempoEstimadoMinutos} min
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {opsPendentes.length > 8 && (
              <p className="text-center text-slate-400 text-xl mt-4">
                + {opsPendentes.length - 8} OPs na fila
              </p>
            )}
          </div>
        )}

        {/* Mensagem se não há OPs */}
        {opsEmProducao.length === 0 && opsPausadas.length === 0 && opsPendentes.length === 0 && (
          <div className="bg-slate-800 rounded-3xl shadow-2xl p-24 text-center border-2 border-slate-700">
            <CheckCircle2 className="w-32 h-32 mx-auto mb-8 text-green-500" />
            <h2 className="text-6xl font-bold text-white mb-4">Nenhuma OP em Produção</h2>
            <p className="text-3xl text-slate-400">O chão de fábrica está livre! 🎉</p>
          </div>
        )}
      </div>
    </div>
  );
}
