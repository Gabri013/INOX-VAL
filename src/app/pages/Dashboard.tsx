import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { useWorkflow } from "../contexts/WorkflowContext";
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  TrendingUp,
  Factory,
  AlertTriangle,
  Clock,
  ArrowRight
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { useNavigate } from "react-router";

// Dados de exemplo
const salesData = [
  { month: "Jan", vendas: 45000, custos: 32000, producao: 52 },
  { month: "Fev", vendas: 52000, custos: 35000, producao: 61 },
  { month: "Mar", vendas: 48000, custos: 33000, producao: 58 },
  { month: "Abr", vendas: 61000, custos: 40000, producao: 72 },
  { month: "Mai", vendas: 55000, custos: 38000, producao: 65 },
  { month: "Jun", vendas: 67000, custos: 42000, producao: 78 },
];

const productCategories = [
  { name: "Chapas", value: 35, color: "#8b5cf6" },
  { name: "Tubos", value: 25, color: "#3b82f6" },
  { name: "Perfis", value: 20, color: "#10b981" },
  { name: "Outros", value: 20, color: "#f59e0b" },
];

// Materiais em estoque baixo (mock)
const materiaisCriticos = [
  { nome: "Perfil U 100mm", atual: 8, minimo: 15, porcentagem: 53, urgencia: "alta" },
  { nome: "Chapa Galvanizada", atual: 0, minimo: 5, porcentagem: 0, urgencia: "critica" },
  { nome: "Barra Chata 1/4", atual: 12, minimo: 20, porcentagem: 60, urgencia: "media" },
];

export default function Dashboard() {
  const { ordens, solicitacoes } = useWorkflow();
  const navigate = useNavigate();

  // Calcular estatísticas
  const ordensEmAberto = ordens.filter(o => o.status === "Em Produção" || o.status === "Pendente");
  const ordensEmProducao = ordens.filter(o => o.status === "Em Produção");
  const comprasPendentes = solicitacoes.filter(s => 
    s.status === "Solicitada" || s.status === "Cotação"
  );

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 328.000</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="size-3 text-green-500" />
              <span className="text-green-500">+12.5%</span> em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ordens em Aberto</CardTitle>
            <Factory className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordensEmAberto.length + 4}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {ordensEmProducao.length + 2} em produção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Materiais Críticos</CardTitle>
            <AlertTriangle className="size-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{materiaisCriticos.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Necessitam reposição urgente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compras Pendentes</CardTitle>
            <ShoppingCart className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{comprasPendentes.length + 3}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Aguardando aprovação
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas Críticos */}
      {materiaisCriticos.some(m => m.urgencia === "critica") && (
        <Card className="border-danger/50 bg-danger/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-danger">
              <AlertTriangle className="size-5" />
              Alertas Críticos de Estoque
            </CardTitle>
            <CardDescription>Materiais esgotados que impedem a produção</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {materiaisCriticos
                .filter(m => m.urgencia === "critica")
                .map((material, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="size-5 text-danger" />
                      <div>
                        <p className="font-medium">{material.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          Estoque: {material.atual} / {material.minimo} unidades
                        </p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => navigate("/compras")}>
                      Solicitar Compra
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ordens em Aberto */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Ordens em Produção</CardTitle>
                <CardDescription>Acompanhamento em tempo real</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/ordens")}>
                Ver Todas
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mock de ordens em produção */}
            {[
              { numero: "OP-0145", cliente: "Empresa ABC", progresso: 75, previsao: "08/02/2026" },
              { numero: "OP-0146", cliente: "Indústria XYZ", progresso: 45, previsao: "10/02/2026" },
              { numero: "OP-0147", cliente: "Construções Norte", progresso: 90, previsao: "06/02/2026" },
            ].map((ordem) => (
              <div key={ordem.numero} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium font-mono text-sm">{ordem.numero}</p>
                    <p className="text-xs text-muted-foreground">{ordem.cliente}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{ordem.progresso}%</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3" />
                      {ordem.previsao}
                    </p>
                  </div>
                </div>
                <Progress value={ordem.progresso} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Materiais Abaixo do Mínimo</CardTitle>
                <CardDescription>Necessitam reposição</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/estoque")}>
                Ver Estoque
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {materiaisCriticos.map((material, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {material.urgencia === "critica" && (
                      <AlertTriangle className="size-4 text-red-600" />
                    )}
                    {material.urgencia === "alta" && (
                      <AlertTriangle className="size-4 text-yellow-600" />
                    )}
                    <span className="font-medium text-sm">{material.nome}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {material.atual} / {material.minimo} un
                  </span>
                </div>
                <Progress 
                  value={material.porcentagem} 
                  className={`h-2 ${
                    material.urgencia === "critica" ? "[&>div]:bg-red-600" :
                    material.urgencia === "alta" ? "[&>div]:bg-yellow-600" :
                    "[&>div]:bg-blue-600"
                  }`}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Produção e Faturamento</CardTitle>
            <CardDescription>Comparativo dos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis yAxisId="left" className="text-xs" />
                <YAxis yAxisId="right" orientation="right" className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }} 
                />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="vendas" 
                  fill="hsl(var(--primary))" 
                  name="Faturamento (R$)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  yAxisId="right"
                  dataKey="producao" 
                  fill="#10b981" 
                  name="Ordens Produzidas"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Categorias de Produtos</CardTitle>
            <CardDescription>Distribuição por tipo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {productCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Acesso rápido às principais funcionalidades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button 
              variant="outline" 
              className="h-auto flex-col items-start p-4 gap-2"
              onClick={() => navigate("/orcamentos")}
            >
              <div className="flex items-center gap-2 w-full">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ArrowRight className="size-4 text-primary" />
                </div>
                <span className="font-semibold">Novo Orçamento</span>
              </div>
              <p className="text-xs text-muted-foreground text-left">
                Criar proposta comercial
              </p>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto flex-col items-start p-4 gap-2"
              onClick={() => navigate("/ordens")}
            >
              <div className="flex items-center gap-2 w-full">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Factory className="size-4 text-blue-600" />
                </div>
                <span className="font-semibold">Nova Ordem</span>
              </div>
              <p className="text-xs text-muted-foreground text-left">
                Criar ordem de produção
              </p>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto flex-col items-start p-4 gap-2"
              onClick={() => navigate("/compras")}
            >
              <div className="flex items-center gap-2 w-full">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <ShoppingCart className="size-4 text-green-600" />
                </div>
                <span className="font-semibold">Solicitar Compra</span>
              </div>
              <p className="text-xs text-muted-foreground text-left">
                Requisitar materiais
              </p>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto flex-col items-start p-4 gap-2"
              onClick={() => navigate("/calculadora-rapida")}
            >
              <div className="flex items-center gap-2 w-full">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Package className="size-4 text-purple-600" />
                </div>
                <span className="font-semibold">Calculadora Rápida</span>
              </div>
              <p className="text-xs text-muted-foreground text-left">
                Calcular orçamentos técnicos
              </p>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}