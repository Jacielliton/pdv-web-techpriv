// backend/src/database/seeders/admin-user.js
const Funcionario = require('../../models/Funcionario');
const bcrypt = require('bcryptjs');

const createAdminUser = async () => {
  try {
    const adminExists = await Funcionario.findOne({ where: { email: 'gerente@pdv.com' } });

    if (!adminExists) {
      const senha_hash = await bcrypt.hash('123456', 8);
      await Funcionario.create({
        nome: 'Admin Gerente',
        email: 'gerente@pdv.com',
        senha_hash: senha_hash,
        cargo: 'gerente'
      });
      console.log('✅ Usuário administrador padrão criado com sucesso!');
    } else {
      console.log('ℹ️ Usuário administrador já existe.');
    }
  } catch (error) {
    console.error('❌ Erro ao criar usuário administrador:', error);
  }
};

module.exports = createAdminUser;