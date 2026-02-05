import { useState } from 'react';
import { Calculator, ShoppingCart, Plus, Trash2, FileText, DollarSign } from 'lucide-react';
import { FormularioEntrada } from '../components/FormularioEntrada';
import { ResultadoCalculadoraView } from '../components/ResultadoCalculadora';
import { CalculadoraEngine } from '../engine';
import type { EntradaCalculadora, ResultadoCalculadora } from '../types';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';

interface ItemCarrinho {
  id: string;
  entrada: EntradaCalculadora;
  resultado: ResultadoCalculadora;
  descricao: string;
}

interface CalculadoraRapidaProps {
  embedded?: boolean; // Modo embedded (sem header/carrinho)
  onCalculoCompleto?: (resultado: ResultadoCalculadora) => void; // Callback quando calcula
}

export function CalculadoraRapida({ embedded = false, onCalculoCompleto }: CalculadoraRapidaProps = {}) {
  const [resultado, setResultado] = useState<ResultadoCalculadora | null>(null);
  const [calculando, setCalculando] = useState(false);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [modoVisualizacao, setModoVisualizacao] = useState<'formulario' | 'resultado' | 'carrinho'>('formulario');

  const handleCalcular = (entrada: EntradaCalculadora) => {
    setCalculando(true);
    
    setTimeout(() => {
      const resultado = CalculadoraEngine.calcular(entrada);
      setResultado(resultado);
      setModoVisualizacao('resultado');
      setCalculando(false);
      if (onCalculoCompleto) {
        onCalculoCompleto(resultado);
      }
    }, 500);
  };

  const handleAdicionarCarrinho = () => {
    if (!resultado) return;

    const modeloNome = resultado.entrada.modelo;
    const config = resultado.entrada.config;
    const descricao = `${modeloNome} - ${config.l}x${config.c}x${config.h}mm`;

    const novoItem: ItemCarrinho = {
      id: Date.now().toString(),
      entrada: resultado.entrada,
      resultado: resultado,
      descricao
    };

    setCarrinho([...carrinho, novoItem]);
    setResultado(null);
    setModoVisualizacao('formulario');
  };

  const handleRemoverItem = (id: string) => {
    setCarrinho(carrinho.filter(item => item.id !== id));
  };

  const handleNovoCalculo = () => {
    setResultado(null);
    setModoVisualizacao('formulario');
  };

  const handleSalvarOrcamento = () => {
    if (carrinho.length === 0) {
      toast.error('Adicione pelo menos um item ao carrinho!');
      return;
    }
    // TODO: Implementar salvamento via API
    toast.success('Orçamento salvo com sucesso! (Função será conectada ao backend)');
  };

  const calcularTotalCarrinho = () => {
    return carrinho.reduce((total, item) => total + item.resultado.precificacao.precoFinal, 0);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* CABEÇALHO */}
      {!embedded && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary rounded-lg">
              <Calculator className="size-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Calculadora Rápida</h1>
              <p className="text-muted-foreground">
                Gere orçamentos técnicos precisos em minutos
              </p>
            </div>
          </div>

          {/* BOTÕES DE NAVEGAÇÃO */}
          <div className="flex items-center gap-3">
            <Button
              variant={modoVisualizacao === 'formulario' ? 'default' : 'outline'}
              onClick={() => setModoVisualizacao('formulario')}
            >
              <Plus className="size-4 mr-2" />
              Novo Item
            </Button>
            <Button
              variant={modoVisualizacao === 'carrinho' ? 'default' : 'outline'}
              onClick={() => setModoVisualizacao('carrinho')}
              className="relative"
            >
              <ShoppingCart className="size-4 mr-2" />
              Carrinho
              {carrinho.length > 0 && (
                <Badge className="ml-2 bg-success text-success-foreground">
                  {carrinho.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* INFO BOX - Apenas no formulário */}
      {modoVisualizacao === 'formulario' && !resultado && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardContent className="pt-6">
            <div className="font-medium text-blue-600 dark:text-blue-400 mb-2">💡 Como funciona:</div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>✓ Selecione o modelo e configure as dimensões da bancada</p>
              <p>✓ Escolha as opções (estrutura, prateleira, espelhos, cuba)</p>
              <p>✓ Configure os preços dos materiais e margens</p>
              <p>✓ Adicione ao carrinho para criar orçamento com múltiplos itens</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CONTEÚDO PRINCIPAL */}
      {modoVisualizacao === 'formulario' && !resultado && (
        <FormularioEntrada onCalcular={handleCalcular} carregando={calculando} />
      )}

      {modoVisualizacao === 'resultado' && resultado && (
        <div className="space-y-6">
          <ResultadoCalculadoraView
            resultado={resultado}
            onNovo={handleNovoCalculo}
            onSalvar={handleAdicionarCarrinho}
            salvarLabel="Adicionar ao Carrinho"
          />
        </div>
      )}

      {modoVisualizacao === 'carrinho' && (
        <div className="space-y-6">
          {/* RESUMO DO CARRINHO */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="size-5 text-primary" />
                  Carrinho de Itens
                </CardTitle>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {carrinho.length} {carrinho.length === 1 ? 'item' : 'itens'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {carrinho.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="size-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium text-muted-foreground mb-2">
                    Carrinho vazio
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Adicione itens usando a Calculadora Rápida
                  </p>
                  <Button onClick={() => setModoVisualizacao('formulario')}>
                    <Plus className="size-4 mr-2" />
                    Adicionar Primeiro Item
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* LISTA DE ITENS */}
                  {carrinho.map((item, index) => (
                    <Card key={item.id} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">Item #{index + 1}</Badge>
                              <h4 className="font-semibold">{item.descricao}</h4>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Material</p>
                                <p className="font-medium">{item.entrada.config.material}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Itens BOM</p>
                                <p className="font-medium">{item.resultado.bomResult.bom.length}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Peso Total</p>
                                <p className="font-medium">{item.resultado.bomResult.totais.pesoTotal.toFixed(1)} kg</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Preço</p>
                                <p className="font-bold text-success text-lg">
                                  R$ {item.resultado.precificacao.precoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoverItem(item.id)}
                            className="text-danger hover:text-danger hover:bg-danger/10"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* TOTAL */}
                  <Card className="border-primary border-2 bg-primary/5">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <DollarSign className="size-8 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Valor Total do Orçamento</p>
                            <p className="text-3xl font-bold text-primary">
                              R$ {calcularTotalCarrinho().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setModoVisualizacao('formulario')}
                          >
                            <Plus className="size-4 mr-2" />
                            Adicionar Mais
                          </Button>
                          <Button
                            onClick={handleSalvarOrcamento}
                            className="bg-success text-success-foreground hover:bg-success/90"
                          >
                            <FileText className="size-4 mr-2" />
                            Salvar Orçamento
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}