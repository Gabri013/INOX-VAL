/**
 * Página de Configurações do Sistema
 * Permite configurar margens, preços, notificações e dados da empresa
 */

import { useState, useEffect } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { 
  useMinhasConfiguracoes, 
  useUpdateConfiguracoes, 
  useResetConfiguracoes 
} from '@/domains/configuracoes/hooks';
import { toast } from 'sonner';
import { 
  DollarSign, 
  Bell, 
  Building2, 
  Save, 
  RotateCcw,
  TrendingUp,
  Percent,
  Calendar,
  Mail,
  Phone,
  Globe
} from 'lucide-react';

export default function Configuracoes() {
  const { data: config, isLoading } = useMinhasConfiguracoes();
  const updateConfig = useUpdateConfiguracoes();
  const resetConfig = useResetConfiguracoes();

  const [vendas, setVendas] = useState({
    margemLucroDefault: 50,
    descontoMaximo: 15,
    validadeOrcamentoDias: 30,
    comissaoPercentual: 3,
    incluirImpostosAutomatico: true,
    incluirFreteAutomatico: false,
  });

  const [notificacoes, setNotificacoes] = useState({
    emailNovoOrcamento: true,
    emailOrcamentoAprovado: true,
    emailOrcamentoRejeitado: true,
    emailOrdemProducao: true,
    notificacaoPush: true,
    notificacaoSonora: false,
  });

  const [empresa, setEmpresa] = useState({
    nome: 'Indústria de Inox LTDA',
    cnpj: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: '',
    email: '',
    website: '',
  });

  // Carregar configurações quando dados chegarem
  useEffect(() => {
    if (config) {
      setVendas(config.vendas);
      setNotificacoes(config.notificacoes);
      setEmpresa(config.empresa);
    }
  }, [config]);

  const handleSalvarVendas = () => {
    updateConfig.mutate({ vendas });
  };

  const handleSalvarNotificacoes = () => {
    updateConfig.mutate({ notificacoes });
  };

  const handleSalvarEmpresa = () => {
    updateConfig.mutate({ empresa });
  };

  const handleResetarConfiguracoes = () => {
    if (confirm('Tem certeza que deseja resetar todas as configurações para os valores padrão?')) {
      resetConfig.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Configurações"
        description="Configure suas preferências de vendas, notificações e dados da empresa"
      />

      <div className="mt-6 max-w-5xl">
        <Tabs defaultValue="vendas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vendas">
              <DollarSign className="w-4 h-4 mr-2" />
              Vendas
            </TabsTrigger>
            <TabsTrigger value="notificacoes">
              <Bell className="w-4 h-4 mr-2" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="empresa">
              <Building2 className="w-4 h-4 mr-2" />
              Empresa
            </TabsTrigger>
          </TabsList>

          {/* ABA VENDAS */}
          <TabsContent value="vendas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Vendas</CardTitle>
                <CardDescription>
                  Defina margens de lucro, descontos e parâmetros padrão para orçamentos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Margem de Lucro Padrão */}
                <div className="space-y-2">
                  <Label htmlFor="margemLucroDefault" className="flex items-center gap-2">
                    <Percent className="w-4 h-4" />
                    Margem de Lucro Padrão (%)
                  </Label>
                  <Input
                    id="margemLucroDefault"
                    type="number"
                    min="0"
                    max="200"
                    value={vendas.margemLucroDefault}
                    onChange={(e) => setVendas({ ...vendas, margemLucroDefault: parseFloat(e.target.value) || 0 })}
                  />
                  <p className="text-sm text-gray-500">
                    Margem aplicada automaticamente nos novos orçamentos
                  </p>
                </div>

                <Separator />

                {/* Desconto Máximo */}
                <div className="space-y-2">
                  <Label htmlFor="descontoMaximo" className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Desconto Máximo Permitido (%)
                  </Label>
                  <Input
                    id="descontoMaximo"
                    type="number"
                    min="0"
                    max="100"
                    value={vendas.descontoMaximo}
                    onChange={(e) => setVendas({ ...vendas, descontoMaximo: parseFloat(e.target.value) || 0 })}
                  />
                  <p className="text-sm text-gray-500">
                    Desconto máximo que você pode oferecer aos clientes
                  </p>
                </div>

                <Separator />

                {/* Validade de Orçamento */}
                <div className="space-y-2">
                  <Label htmlFor="validadeOrcamentoDias" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Validade Padrão do Orçamento (dias)
                  </Label>
                  <Input
                    id="validadeOrcamentoDias"
                    type="number"
                    min="1"
                    max="365"
                    value={vendas.validadeOrcamentoDias}
                    onChange={(e) => setVendas({ ...vendas, validadeOrcamentoDias: parseInt(e.target.value) || 30 })}
                  />
                  <p className="text-sm text-gray-500">
                    Quantos dias os orçamentos ficam válidos
                  </p>
                </div>

                <Separator />

                {/* Comissão */}
                <div className="space-y-2">
                  <Label htmlFor="comissaoPercentual" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Comissão do Vendedor (%)
                  </Label>
                  <Input
                    id="comissaoPercentual"
                    type="number"
                    min="0"
                    max="50"
                    step="0.1"
                    value={vendas.comissaoPercentual}
                    onChange={(e) => setVendas({ ...vendas, comissaoPercentual: parseFloat(e.target.value) || 0 })}
                  />
                  <p className="text-sm text-gray-500">
                    Percentual de comissão sobre as vendas fechadas
                  </p>
                </div>

                <Separator />

                {/* Switches */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="incluirImpostos">Incluir Impostos Automaticamente</Label>
                      <p className="text-sm text-gray-500">
                        Calcular e incluir impostos nos orçamentos
                      </p>
                    </div>
                    <Switch
                      id="incluirImpostos"
                      checked={vendas.incluirImpostosAutomatico}
                      onCheckedChange={(checked) => setVendas({ ...vendas, incluirImpostosAutomatico: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="incluirFrete">Incluir Frete Automaticamente</Label>
                      <p className="text-sm text-gray-500">
                        Calcular e incluir frete nos orçamentos
                      </p>
                    </div>
                    <Switch
                      id="incluirFrete"
                      checked={vendas.incluirFreteAutomatico}
                      onCheckedChange={(checked) => setVendas({ ...vendas, incluirFreteAutomatico: checked })}
                    />
                  </div>
                </div>

                <Separator />

                <Button 
                  onClick={handleSalvarVendas}
                  disabled={updateConfig.isPending}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateConfig.isPending ? 'Salvando...' : 'Salvar Configurações de Vendas'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA NOTIFICAÇÕES */}
          <TabsContent value="notificacoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificações</CardTitle>
                <CardDescription>
                  Escolha quais notificações você deseja receber
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {/* Notificações por E-mail */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Notificações por E-mail</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="emailNovoOrcamento">Novo Orçamento Criado</Label>
                        <Switch
                          id="emailNovoOrcamento"
                          checked={notificacoes.emailNovoOrcamento}
                          onCheckedChange={(checked) => setNotificacoes({ ...notificacoes, emailNovoOrcamento: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="emailOrcamentoAprovado">Orçamento Aprovado</Label>
                        <Switch
                          id="emailOrcamentoAprovado"
                          checked={notificacoes.emailOrcamentoAprovado}
                          onCheckedChange={(checked) => setNotificacoes({ ...notificacoes, emailOrcamentoAprovado: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="emailOrcamentoRejeitado">Orçamento Rejeitado</Label>
                        <Switch
                          id="emailOrcamentoRejeitado"
                          checked={notificacoes.emailOrcamentoRejeitado}
                          onCheckedChange={(checked) => setNotificacoes({ ...notificacoes, emailOrcamentoRejeitado: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="emailOrdemProducao">Ordem de Produção Criada</Label>
                        <Switch
                          id="emailOrdemProducao"
                          checked={notificacoes.emailOrdemProducao}
                          onCheckedChange={(checked) => setNotificacoes({ ...notificacoes, emailOrdemProducao: checked })}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Notificações no Sistema */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Notificações no Sistema</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="notificacaoPush">Notificações Push</Label>
                          <p className="text-sm text-gray-500">
                            Receber notificações na tela
                          </p>
                        </div>
                        <Switch
                          id="notificacaoPush"
                          checked={notificacoes.notificacaoPush}
                          onCheckedChange={(checked) => setNotificacoes({ ...notificacoes, notificacaoPush: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="notificacaoSonora">Notificação Sonora</Label>
                          <p className="text-sm text-gray-500">
                            Tocar som ao receber notificações
                          </p>
                        </div>
                        <Switch
                          id="notificacaoSonora"
                          checked={notificacoes.notificacaoSonora}
                          onCheckedChange={(checked) => setNotificacoes({ ...notificacoes, notificacaoSonora: checked })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <Button 
                  onClick={handleSalvarNotificacoes}
                  disabled={updateConfig.isPending}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateConfig.isPending ? 'Salvando...' : 'Salvar Configurações de Notificações'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA EMPRESA */}
          <TabsContent value="empresa" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados da Empresa</CardTitle>
                <CardDescription>
                  Informações utilizadas em orçamentos, PDFs e documentos oficiais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="empresaNome">
                      <Building2 className="w-4 h-4 inline mr-2" />
                      Razão Social
                    </Label>
                    <Input
                      id="empresaNome"
                      value={empresa.nome}
                      onChange={(e) => setEmpresa({ ...empresa, nome: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="empresaCnpj">CNPJ</Label>
                    <Input
                      id="empresaCnpj"
                      value={empresa.cnpj}
                      onChange={(e) => setEmpresa({ ...empresa, cnpj: e.target.value })}
                      placeholder="00.000.000/0001-00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="empresaTelefone">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Telefone
                    </Label>
                    <Input
                      id="empresaTelefone"
                      value={empresa.telefone}
                      onChange={(e) => setEmpresa({ ...empresa, telefone: e.target.value })}
                      placeholder="(11) 1234-5678"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="empresaEmail">
                      <Mail className="w-4 h-4 inline mr-2" />
                      E-mail
                    </Label>
                    <Input
                      id="empresaEmail"
                      type="email"
                      value={empresa.email}
                      onChange={(e) => setEmpresa({ ...empresa, email: e.target.value })}
                      placeholder="contato@empresa.com.br"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="empresaWebsite">
                      <Globe className="w-4 h-4 inline mr-2" />
                      Website
                    </Label>
                    <Input
                      id="empresaWebsite"
                      value={empresa.website}
                      onChange={(e) => setEmpresa({ ...empresa, website: e.target.value })}
                      placeholder="www.empresa.com.br"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="empresaEndereco">Endereço</Label>
                    <Input
                      id="empresaEndereco"
                      value={empresa.endereco}
                      onChange={(e) => setEmpresa({ ...empresa, endereco: e.target.value })}
                      placeholder="Rua, número - bairro"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="empresaCidade">Cidade</Label>
                    <Input
                      id="empresaCidade"
                      value={empresa.cidade}
                      onChange={(e) => setEmpresa({ ...empresa, cidade: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="empresaEstado">Estado</Label>
                    <Input
                      id="empresaEstado"
                      value={empresa.estado}
                      onChange={(e) => setEmpresa({ ...empresa, estado: e.target.value })}
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="empresaCep">CEP</Label>
                    <Input
                      id="empresaCep"
                      value={empresa.cep}
                      onChange={(e) => setEmpresa({ ...empresa, cep: e.target.value })}
                      placeholder="00000-000"
                    />
                  </div>
                </div>

                <Separator />

                <Button 
                  onClick={handleSalvarEmpresa}
                  disabled={updateConfig.isPending}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateConfig.isPending ? 'Salvando...' : 'Salvar Dados da Empresa'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Botão de Reset */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Resetar Configurações</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Restaurar todas as configurações para os valores padrão
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleResetarConfiguracoes}
                disabled={resetConfig.isPending}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {resetConfig.isPending ? 'Resetando...' : 'Resetar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
