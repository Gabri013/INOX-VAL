/**
 * Serviço de usuários com mock via IndexedDB
 * Preparado para backend futuro
 */

import { Storage } from '@/services/storage/db';
import type { ID } from '@/shared/types/ids';
import type { Usuario, CreateUsuarioInput, UpdateUsuarioInput, UsuariosFilters } from './usuarios.types';
import { usuariosSeed } from './usuarios.seed';
import { defaultPermissionsByRole } from './usuarios.types';

/**
 * Storage para usuários
 */
const usuariosStorage = new Storage<Usuario>('usuarios' as any);

/**
 * Inicializa dados seed se necessário
 */
async function initSeedData() {
  try {
    const existing = await usuariosStorage.getAll();
    if (existing.length === 0) {
      console.log('[UsuariosService] Inicializando dados seed...');
      for (const usuario of usuariosSeed) {
        await usuariosStorage.create(usuario);
      }
      console.log('[UsuariosService] Dados seed inicializados com sucesso!');
    }
  } catch (error) {
    console.error('[UsuariosService] Erro ao inicializar seed:', error);
  }
}

// Inicializar dados ao carregar o módulo
initSeedData();

/**
 * Serviço de usuários
 */
class UsuariosService {
  /**
   * Lista todos os usuários (com filtros)
   */
  async getAll(filters?: UsuariosFilters): Promise<Usuario[]> {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simula latência

    let usuarios = await usuariosStorage.getAll();

    // Remover senhas antes de retornar
    usuarios = usuarios.map(u => {
      const { senha, ...usuarioSemSenha } = u;
      return usuarioSemSenha as Usuario;
    });

    // Aplicar filtros
    if (filters) {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        usuarios = usuarios.filter(u =>
          u.nome.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          u.departamento.toLowerCase().includes(search)
        );
      }

      if (filters.role) {
        usuarios = usuarios.filter(u => u.role === filters.role);
      }

      if (filters.status) {
        usuarios = usuarios.filter(u => u.status === filters.status);
      }

      if (filters.departamento) {
        usuarios = usuarios.filter(u => u.departamento === filters.departamento);
      }
    }

    // Ordenar por nome
    usuarios.sort((a, b) => a.nome.localeCompare(b.nome));

    return usuarios;
  }

  /**
   * Busca usuário por ID
   */
  async getById(id: ID): Promise<Usuario> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const usuario = await usuariosStorage.getById(id);
    if (!usuario) {
      throw new Error(`Usuário ${id} não encontrado`);
    }

    // Remover senha
    const { senha, ...usuarioSemSenha } = usuario;
    return usuarioSemSenha as Usuario;
  }

  /**
   * Busca usuário por email (para login)
   */
  async getByEmail(email: string): Promise<Usuario | null> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const usuarios = await usuariosStorage.getAll();
    const usuario = usuarios.find(u => u.email === email);

    if (!usuario) {
      return null;
    }

    return usuario;
  }

  /**
   * Realiza login (retorna usuário se credenciais válidas)
   */
  async login(email: string, password: string): Promise<Usuario | null> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const usuarios = await usuariosStorage.getAll();
    const usuario = usuarios.find(u => u.email === email && u.senha === password);

    if (!usuario) {
      return null;
    }

    // Verificar se usuário está ativo
    if (usuario.status !== 'ativo') {
      throw new Error('Usuário inativo. Entre em contato com o administrador.');
    }

    return usuario;
  }

  /**
   * Cria novo usuário
   */
  async create(data: CreateUsuarioInput): Promise<Usuario> {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Validar se email já existe
    const existente = await this.getByEmail(data.email);
    if (existente) {
      throw new Error('Email já cadastrado');
    }

    // Gerar ID único
    const id = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const now = new Date().toISOString();

    const novoUsuario: Usuario = {
      id,
      nome: data.nome,
      email: data.email,
      senha: data.senha, // Em produção, seria hash
      role: data.role,
      status: data.status || 'ativo',
      telefone: data.telefone,
      departamento: data.departamento,
      dataAdmissao: data.dataAdmissao || now.split('T')[0],
      dataCriacao: now,
      dataAtualizacao: now,
      permissoesCustomizadas: data.permissoesCustomizadas,
    };

    await usuariosStorage.create(novoUsuario);

    // Retornar sem senha
    const { senha, ...usuarioSemSenha } = novoUsuario;
    return usuarioSemSenha as Usuario;
  }

  /**
   * Atualiza usuário
   */
  async update(id: ID, data: UpdateUsuarioInput): Promise<Usuario> {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Verificar se existe
    const existente = await usuariosStorage.getById(id);
    if (!existente) {
      throw new Error(`Usuário ${id} não encontrado`);
    }

    // Se está alterando email, validar se não existe outro com mesmo email
    if (data.email && data.email !== existente.email) {
      const outroUsuario = await this.getByEmail(data.email);
      if (outroUsuario && outroUsuario.id !== id) {
        throw new Error('Email já cadastrado para outro usuário');
      }
    }

    const atualizado: Usuario = {
      ...existente,
      ...data,
      id, // Garantir que ID não muda
      dataAtualizacao: new Date().toISOString(),
    };

    await usuariosStorage.update(id, atualizado);

    // Retornar sem senha
    const { senha, ...usuarioSemSenha } = atualizado;
    return usuarioSemSenha as Usuario;
  }

  /**
   * Deleta usuário
   */
  async delete(id: ID): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const usuario = await usuariosStorage.getById(id);
    if (!usuario) {
      throw new Error(`Usuário ${id} não encontrado`);
    }

    // Não permitir deletar o próprio usuário logado (verificação adicional no frontend)
    await usuariosStorage.delete(id);
  }

  /**
   * Altera senha do usuário
   */
  async changePassword(id: ID, senhaAtual: string, novaSenha: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const usuario = await usuariosStorage.getById(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    // Validar senha atual
    if (usuario.senha !== senhaAtual) {
      throw new Error('Senha atual incorreta');
    }

    // Atualizar senha
    await usuariosStorage.update(id, {
      ...usuario,
      senha: novaSenha,
      dataAtualizacao: new Date().toISOString(),
    });
  }

  /**
   * Atualiza permissões customizadas do usuário
   */
  async updatePermissoes(id: ID, permissoes: Usuario['permissoesCustomizadas']): Promise<Usuario> {
    return this.update(id, { permissoesCustomizadas: permissoes });
  }

  /**
   * Reset permissões para padrão do role
   */
  async resetPermissoes(id: ID): Promise<Usuario> {
    return this.update(id, { permissoesCustomizadas: undefined });
  }

  /**
   * Obtém estatísticas de usuários
   */
  async getStats(): Promise<{
    total: number;
    ativos: number;
    inativos: number;
    ferias: number;
    porRole: Record<string, number>;
  }> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const usuarios = await usuariosStorage.getAll();

    const stats = {
      total: usuarios.length,
      ativos: usuarios.filter(u => u.status === 'ativo').length,
      inativos: usuarios.filter(u => u.status === 'inativo').length,
      ferias: usuarios.filter(u => u.status === 'ferias').length,
      porRole: {
        Admin: usuarios.filter(u => u.role === 'Admin').length,
        Engenharia: usuarios.filter(u => u.role === 'Engenharia').length,
        Producao: usuarios.filter(u => u.role === 'Producao').length,
        Comercial: usuarios.filter(u => u.role === 'Comercial').length,
      },
    };

    return stats;
  }
}

export const usuariosService = new UsuariosService();