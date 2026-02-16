// Serviço de configuração de precificação por usuário (mock para demo)
import { PricingConfig } from '@/domains/precificacao/config/pricingConfig';

const USER_CONFIG_KEY = 'user_precificacao_config_';

export async function getCurrentUser() {
  // Simulação: retorna usuário mock
  return { id: 'user-1', nome: 'Usuário Demo', email: 'demo@inoxval.com', role: 'admin' };
}

export async function getUserPrecificacaoConfig(userId: string): Promise<Partial<PricingConfig> | any> {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(USER_CONFIG_KEY + userId);
    return raw ? JSON.parse(raw) : {};
  }
  return {};
}

export async function saveUserPrecificacaoConfig(userId: string, config: Partial<PricingConfig> | any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_CONFIG_KEY + userId, JSON.stringify(config));
  }
}
