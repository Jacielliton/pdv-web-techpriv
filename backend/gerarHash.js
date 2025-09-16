// arquivo: backend/gerarHash.js
const bcrypt = require('bcryptjs');

async function criarHash() {
  const senha = '123456'; // A senha que você quer usar
  const hash = await bcrypt.hash(senha, 8);

  console.log('--- SEU HASH SEGURO ---');
  console.log(hash);
  console.log('------------------------');
  console.log('Copie o hash acima e cole na coluna "senha_hash" do seu banco de dados.');
}

criarHash();