/**
 * Função para popular o banco de dados com dados iniciais (seed)
 */

import { Storage } from './db';
import { clientesSeed } from '@/domains/clientes/clientes.seed';
import { produtosSeed } from '@/domains/produtos/produtos.seed';
import { initChatMock } from '@/domains/chat';
import { initAnunciosMock } from '@/domains/anuncios';

/**
 * Verifica se uma store precisa ser populada e popula se necessário
 */
async function seedStoreIfEmpty<T extends { id: string }>(
  storeName: any,
  seedData: T[]
): Promise<void> {
  const storage = new Storage<T>(storeName);
  const existing = await storage.getAll();
  
  if (existing.length === 0) {
    console.log(`Populando ${storeName} com ${seedData.length} registros...`);
    for (const item of seedData) {
      await storage.create(item);
    }
    console.log(`${storeName} populado com sucesso!`);
  }
}

/**
 * Popula todas as stores com dados iniciais
 */
export async function seedDatabase(): Promise<void> {
  try {
    // Seed de clientes
    await seedStoreIfEmpty('clientes', clientesSeed);
    
    // Seed de produtos
    await seedStoreIfEmpty('produtos', produtosSeed);
    
    // Inicializar mock do chat
    await initChatMock();
    
    // Inicializar mock de anúncios
    await initAnunciosMock();
    
    // TODO: Adicionar seed de outros módulos conforme forem criados
    // await seedStoreIfEmpty('estoque', estoqueSeed);
    // etc...
    
    console.log('Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao popular banco de dados:', error);
    throw error;
  }
}