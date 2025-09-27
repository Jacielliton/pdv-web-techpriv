-- PASSO 1: Apaga as tabelas antigas na ordem correta para evitar erros de dependência.
DROP TABLE IF EXISTS venda_itens;
DROP TABLE IF EXISTS vendas;
DROP TABLE IF EXISTS caixas;
DROP TABLE IF EXISTS produtos;
DROP TABLE IF EXISTS funcionarios;

-- PASSO 2: Cria toda a estrutura de tabelas novamente.

-- Tabela de Funcionários
CREATE TABLE funcionarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    cargo VARCHAR(255) NOT NULL
);

-- Tabela de Produtos
CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco NUMERIC(10, 2) NOT NULL,
    quantidade_estoque INTEGER NOT NULL DEFAULT 0,
    codigo_barras VARCHAR(255) UNIQUE
);

-- Tabela de Caixas
CREATE TABLE caixas (
    id SERIAL PRIMARY KEY,
    data_abertura TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    data_fechamento TIMESTAMP WITH TIME ZONE,
    valor_inicial NUMERIC(10, 2) NOT NULL,
    valor_final_calculado NUMERIC(10, 2),
    valor_final_informado NUMERIC(10, 2),
    diferenca NUMERIC(10, 2),
    status VARCHAR(255) NOT NULL DEFAULT 'ABERTO',
    funcionario_id INTEGER NOT NULL REFERENCES funcionarios(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Tabela de Vendas
CREATE TABLE vendas (
    id SERIAL PRIMARY KEY,
    valor_total NUMERIC(10, 2) NOT NULL,
    metodo_pagamento VARCHAR(255) NOT NULL,
    data_venda TIMESTAMP WITH TIME ZONE DEFAULT now(),
    funcionario_id INTEGER NOT NULL REFERENCES funcionarios(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    caixa_id INTEGER NOT NULL REFERENCES caixas(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Tabela de Itens da Venda
CREATE TABLE venda_itens (
    id SERIAL PRIMARY KEY,
    quantidade INTEGER NOT NULL,
    preco_unitario NUMERIC(10, 2) NOT NULL,
    venda_id INTEGER NOT NULL REFERENCES vendas(id) ON DELETE CASCADE ON UPDATE CASCADE,
    produto_id INTEGER NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    telefone VARCHAR(20),
    email VARCHAR(255),
    endereco TEXT,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE vendas ADD COLUMN cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE vendas ADD COLUMN desconto NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE vendas ADD COLUMN status VARCHAR(255) NOT NULL DEFAULT 'CONCLUIDA';

-- Adiciona a coluna de preço de custo na tabela de produtos
ALTER TABLE produtos ADD COLUMN preco_custo NUMERIC(10, 2);

-- Cria a tabela de fornecedores
CREATE TABLE fornecedores (
    id SERIAL PRIMARY KEY,
    nome_fantasia VARCHAR(255) NOT NULL,
    razao_social VARCHAR(255),
    cnpj VARCHAR(18) UNIQUE,
    telefone VARCHAR(20),
    email VARCHAR(255),
    endereco TEXT
);

-- Cria a tabela para registrar as entradas de estoque (compras)
CREATE TABLE entradas_estoque (
    id SERIAL PRIMARY KEY,
    quantidade INTEGER NOT NULL,
    preco_custo_unitario NUMERIC(10, 2) NOT NULL,
    data_entrada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    produto_id INTEGER NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
    fornecedor_id INTEGER REFERENCES fornecedores(id) ON DELETE SET NULL,
    funcionario_id INTEGER NOT NULL REFERENCES funcionarios(id) ON DELETE RESTRICT
);

-- Adiciona a coluna de estoque mínimo na tabela de produtos
-- O valor padrão (DEFAULT 10) é um exemplo, você pode ajustar conforme sua necessidade.
ALTER TABLE produtos ADD COLUMN estoque_minimo INTEGER NOT NULL DEFAULT 10;

-- Cria a tabela principal para contas a receber (dívidas)
CREATE TABLE contas_receber (
    id SERIAL PRIMARY KEY,
    valor_total NUMERIC(10, 2) NOT NULL,
    valor_pago NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'ABERTA', -- Ex: ABERTA, PAGA_PARCIALMENTE, PAGA
    data_vencimento DATE,
    venda_id INTEGER NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE
);

-- Cria uma tabela para registrar os pagamentos de cada conta
CREATE TABLE pagamentos_conta (
    id SERIAL PRIMARY KEY,
    valor NUMERIC(10, 2) NOT NULL,
    metodo_pagamento VARCHAR(255) NOT NULL,
    data_pagamento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    conta_id INTEGER NOT NULL REFERENCES contas_receber(id) ON DELETE CASCADE,
    funcionario_id INTEGER NOT NULL REFERENCES funcionarios(id) ON DELETE RESTRICT,
    caixa_id INTEGER NOT NULL REFERENCES caixas(id) ON DELETE RESTRICT
);

ALTER TABLE vendas ADD COLUMN vendedor_id INTEGER REFERENCES funcionarios(id);
ALTER TABLE vendas ADD COLUMN desconto DECIMAL(10, 2) DEFAULT 0.00;

-- PASSO 3: Insere o usuário Administrador/Gerente com o hash fornecido.
INSERT INTO funcionarios (nome, email, senha_hash, cargo) VALUES 
('Admin', 'admin@pdv.com', '$2b$08$TTWDh6C40HrrsHrhSdRhX.xfH783Mdukqmyr35sPtuwATABxlJ8fO', 'gerente');