const fs = require('fs');
const path = require('path');

function importarModelosSolidworks(modelDir) {
  const arquivos = fs.readdirSync(modelDir).filter(f => f.endsWith('.txt'));
  const modelos = [];
  for (const arquivo of arquivos) {
    const conteudo = fs.readFileSync(path.join(modelDir, arquivo), 'utf-8');
    const linhas = conteudo.split(/\r?\n/);
    const nome = arquivo.replace(/\.txt$/, '');
    const codigo = nome.split(' ')[0];
    const descricao = linhas[0] || nome;
    const materiais = linhas.filter(l => l.toLowerCase().includes('inox') || l.toLowerCase().includes('aço'));
    const componentes = linhas.filter(l => l.toLowerCase().includes('tubo') || l.toLowerCase().includes('prateleira') || l.toLowerCase().includes('espelho'));
    const operacoes = linhas.filter(l => l.toLowerCase().includes('solda') || l.toLowerCase().includes('dobrar') || l.toLowerCase().includes('montagem'));
    const dimensoes = {};
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

const modelDir = './model';
const modelos = importarModelosSolidworks(modelDir);
console.log('Modelos importados para precificação:');
console.log(JSON.stringify(modelos, null, 2));

const catalogPath = './src/domains/precificacao/modelosCatalogo.json';
fs.writeFileSync(catalogPath, JSON.stringify(modelos, null, 2));
console.log('Catálogo atualizado em', catalogPath);
