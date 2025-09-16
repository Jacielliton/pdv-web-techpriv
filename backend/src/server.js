// --- Importações ---
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const sequelize = require('./config/database');
const routes = require('./routes/index');

// Importação de todos os models para definir as associações
const Venda = require('./models/Venda');
const VendaItem = require('./models/VendaItem');
const Funcionario = require('./models/Funcionario');
const Produto = require('./models/Produto');
const Caixa = require('./models/Caixa'); 

// --- Inicialização do App ---
const app = express();

// --- Middlewares ---
app.use(cors()); // Permite requisições de outros domínios
app.use(morgan('dev')); // Adiciona logs de requisição no console
app.use(express.json()); // Permite que o express entenda JSON

// --- Definição das Associações entre Models ---
// Relação: Venda <-> Funcionário
Funcionario.hasMany(Venda, { foreignKey: 'funcionario_id' });
Venda.belongsTo(Funcionario, { foreignKey: 'funcionario_id' });

// Relação: Venda <-> VendaItem
Venda.hasMany(VendaItem, { foreignKey: 'venda_id' });
VendaItem.belongsTo(Venda, { foreignKey: 'venda_id' });

// Relação: VendaItem <-> Produto
Produto.hasMany(VendaItem, { foreignKey: 'produto_id' });
VendaItem.belongsTo(Produto, { foreignKey: 'produto_id' });

// Relação: Caixa <-> Funcionário
// Um funcionário pode ter várias sessões de caixa, mas uma sessão pertence a um único funcionário.
Funcionario.hasMany(Caixa, { foreignKey: 'funcionario_id' });
Caixa.belongsTo(Funcionario, { foreignKey: 'funcionario_id' });

// Relação: Caixa <-> Venda
// Uma sessão de caixa pode ter várias vendas, mas uma venda pertence a uma única sessão.
Caixa.hasMany(Venda, { foreignKey: 'caixa_id' });
Venda.belongsTo(Caixa, { foreignKey: 'caixa_id' });

// --- Rotas da API ---
app.use('/api', routes); // Prefixo '/api' para todas as rotas

// --- Inicialização do Servidor ---
const PORT = process.env.PORT || 3333;

// A lógica de iniciar o servidor só será executada se o arquivo não for importado por um teste
if (process.env.NODE_ENV !== 'test') {
  sequelize.authenticate()
    .then(() => {
      console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');

      // ESTA É A LINHA QUE CRIA/ALTERA AS TABELAS
      return sequelize.sync({ alter: true }); 
    })
    .then(() => {
      // Só depois de sincronizar, o servidor começa a ouvir
      app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
      });
    })
    .catch(err => {
      console.error('❌ Não foi possível conectar ao banco de dados:', err);
    });
}

// Exporta o 'app' para que nossos testes de API possam usá-lo
module.exports = app;