import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { getCurrentUser, saveUserPrecificacaoConfig, getUserPrecificacaoConfig } from '@/services/auth/userConfig';
import { fetchMarketDefaults } from '@/services/precificacao/marketData';

/**
 * Painel de configuração de precificação por usuário
 * Permite editar margens, mínimos, markup, overhead, benchmark, etc.
 * Configuração é salva por usuário e pode ser usada na página de orçamento e nas configurações do usuário
 */
export function UserPrecificacaoConfigPanel() {
  const [config, setConfig] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchConfig() {
      setLoading(true);
      const user = await getCurrentUser();
      let userConfig = await getUserPrecificacaoConfig(user.id);
      if (!userConfig || Object.keys(userConfig).length === 0) {
        // Se não houver config do usuário, busca padrão de mercado
        userConfig = await fetchMarketDefaults();
      }
      setConfig(userConfig || {});
      setLoading(false);
    }
    fetchConfig();
  }, []);

  function handleChange(field: string, value: any) {
    setConfig((prev: any) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    const user = await getCurrentUser();
    await saveUserPrecificacaoConfig(user.id, config);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  if (loading) return <div>Carregando configurações...</div>;

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Configuração de Precificação do Usuário</h2>
      <div className="flex flex-col gap-4 max-w-md">
        <div>
          <Label>Margem de Lucro (%)</Label>
          <Input type="number" value={config.margemLucro ?? 0.28} onChange={e => handleChange('margemLucro', Number(e.target.value))} min={0} max={1} step={0.01} />
        </div>
        <div>
          <Label>Markup</Label>
          <Input type="number" value={config.markup ?? 3.15} onChange={e => handleChange('markup', Number(e.target.value))} min={1} step={0.01} />
        </div>
        <div>
          <Label>Preço Mínimo</Label>
          <Input type="number" value={config.precoMinimo ?? 0} onChange={e => handleChange('precoMinimo', Number(e.target.value))} min={0} step={0.01} />
        </div>
        <div>
          <Label>Overhead (%)</Label>
          <Input type="number" value={config.overheadPercent ?? 0.03} onChange={e => handleChange('overheadPercent', Number(e.target.value))} min={0} max={1} step={0.01} />
        </div>
        <div>
          <Label>Benchmark de Mercado (fonte)</Label>
          <Input value={config.benchmarkFonte ?? 'MercadoLivre'} onChange={e => handleChange('benchmarkFonte', e.target.value)} />
        </div>
        <div>
          <Label>Preço Matéria-Prima (kg Inox)</Label>
          <Input type="number" value={config.precoKgInox ?? 45} onChange={e => handleChange('precoKgInox', Number(e.target.value))} min={0} step={0.01} />
        </div>
        <div>
          <Label>Preço Matéria-Prima (kg Tubo Pesado)</Label>
          <Input type="number" value={config.precoKgTuboPes ?? 45} onChange={e => handleChange('precoKgTuboPes', Number(e.target.value))} min={0} step={0.01} />
        </div>
        <div>
          <Label>Preço Matéria-Prima (kg Contraventamento)</Label>
          <Input type="number" value={config.precoKgTuboContraventamento ?? 45} onChange={e => handleChange('precoKgTuboContraventamento', Number(e.target.value))} min={0} step={0.01} />
        </div>
        <Button onClick={handleSave}>Salvar Configuração</Button>
        {success && <div className="text-success">Configuração salva!</div>}
      </div>
    </Card>
  );
}
