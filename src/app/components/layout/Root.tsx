import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useTheme } from "next-themes";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Warehouse, 
  FileText, 
  ClipboardList, 
  ShoppingCart, 
  Factory, 
  MessageCircle, 
  Megaphone, 
  UserCog, 
  Settings, 
  Shield, 
  Zap, 
  HelpCircle, 
  X, 
  Menu, 
  Sun, 
  Moon, 
  User, 
  LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, module: "dashboard" },
  { name: "Calculadora Rápida", href: "/calculadora-rapida", icon: Zap, highlight: true },
  { name: "Clientes", href: "/clientes", icon: Users, module: "clientes" },
  { name: "Produtos", href: "/produtos", icon: Package, module: "produtos" },
  { name: "Estoque", href: "/estoque", icon: Warehouse, module: "estoque" },
  { name: "Orçamentos", href: "/orcamentos", icon: FileText, module: "orcamentos" },
  { name: "Ordens", href: "/ordens", icon: ClipboardList, module: "ordens" },
  { name: "Compras", href: "/compras", icon: ShoppingCart, module: "compras" },
  { name: "Controle de Produção", href: "/controle-producao", icon: Factory, module: "producao" },
  { name: "Chat", href: "/chat", icon: MessageCircle },
  { name: "Anúncios", href: "/anuncios", icon: Megaphone },
  { name: "Usuários", href: "/usuarios", icon: UserCog, module: "usuarios" },
  { name: "Configuração de Custos", href: "/configuracao-custos", icon: Settings },
  { name: "Auditoria", href: "/auditoria", icon: Shield, module: "auditoria" },
];

export default function Root() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  // Verificar autenticação
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getUserInitials = () => {
    const name = user.displayName || user.email || "User";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const roleColors: Record<string, string> = {
    Admin: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    Engenharia: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    Producao: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    Comercial: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-card border-r border-border transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
                <LayoutDashboard className="size-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">ERP Inox</h1>
                <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="size-10 bg-primary rounded-lg flex items-center justify-center">
                <LayoutDashboard className="size-6 text-primary-foreground" />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            // Temporariamente, mostrar todos os itens (Firebase Auth não tem hasPermission ainda)
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="size-5 flex-shrink-0" />
                {sidebarOpen && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          {/* Calculadora Rápida */}
          <Link
            to="/calculadora-rapida"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
              location.pathname === "/calculadora-rapida"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Zap className="size-5 flex-shrink-0" />
            {sidebarOpen && <span className="truncate">Calc. Rápida</span>}
          </Link>

          {/* Ajuda */}
          <Link
            to="/ajuda"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
              location.pathname === "/ajuda"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <HelpCircle className="size-5 flex-shrink-0" />
            {sidebarOpen && <span className="truncate">Ajuda</span>}
          </Link>

          {/* Toggle Sidebar */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full"
          >
            {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-foreground">
              {navigation.find((item) => item.href === location.pathname)?.name || "ERP System"}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="size-5" />
              ) : (
                <Moon className="size-5" />
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{user.displayName || user.email}</p>
                    <p className="text-xs text-muted-foreground">Usuário</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.displayName || "Usuário"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/perfil')}>
                  <User className="size-4 mr-2" />
                  Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/configuracoes')}>
                  <Settings className="size-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="size-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}