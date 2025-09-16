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

-- PASSO 3: Insere o usuário Administrador/Gerente com o hash fornecido.
INSERT INTO funcionarios (nome, email, senha_hash, cargo) VALUES 
('Admin', 'admin@pdv.com', '$2b$08$TTWDh6C40HrrsHrhSdRhX.xfH783Mdukqmyr35sPtuwATABxlJ8fO', 'gerente');