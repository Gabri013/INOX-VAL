const { importarModelosSolidworks } = require('../src/domains/precificacao/importarModelosSolidworks');

const modelDir = './model';

const modelos = importarModelosSolidworks(modelDir);

console.log('Modelos importados para precificação:');
console.log(JSON.stringify(modelos, null, 2));

// Aqui você pode integrar: salvar no banco, atualizar cache, alimentar UI, etc.
