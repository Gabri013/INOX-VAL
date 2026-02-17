// @ts-ignore
import fs from 'fs';
// @ts-ignore
import path from 'path';

export interface ModeloEstrutura {
  codigo: string;
  nome: string;
  descricao: string;
  materiais: string[];
  componentes: string[];
  operacoes: string[];
  dimensoes?: Record<string, number>;
}

/**
 * Lê todos os arquivos de modelos do SolidWorks e extrai informações estruturais para precificação
 */
export function importarModelosSolidworks(modelDir: string): ModeloEstrutura[] {
  const arquivos = fs.readdirSync(modelDir).filter(f => f.endsWith('.txt'));
  const modelos: ModeloEstrutura[] = [];
  for (const arquivo of arquivos) {
    const conteudo = fs.readFileSync(path.join(modelDir, arquivo), 'utf-8');
    // Extração simples: pode ser melhorada conforme padrão dos arquivos
    const linhas = conteudo.split(/\r?\n/);
    const nome = arquivo.replace(/\.txt$/, '');
    const codigo = nome.split(' ')[0];
    const descricao = linhas[0] || nome;
    const materiais = linhas.filter(l => l.toLowerCase().includes('inox') || l.toLowerCase().includes('aço'));
    const componentes = linhas.filter(l => l.toLowerCase().includes('tubo') || l.toLowerCase().includes('prateleira') || l.toLowerCase().includes('espelho'));
    const operacoes = linhas.filter(l => l.toLowerCase().includes('solda') || l.toLowerCase().includes('dobrar') || l.toLowerCase().includes('montagem'));
    // Dimensões: busca por padrões tipo L=, C=, A=, etc
    const dimensoes: Record<string, number> = {};
    linhas.forEach(l => {
      const match = l.match(/([LCA]=)(\d+)/gi);
      if (match) {
        match.forEach(dim => {
          const [chave, valor] = dim.split('=');
          dimensoes[chave] = Number(valor);
        });
      }
    });
    modelos.push({ codigo, nome, descricao, materiais, componentes, operacoes, dimensoes });
  }
  return modelos;
}
