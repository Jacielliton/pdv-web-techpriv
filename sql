CREATE TABLE funcionarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cargo VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Opcional: Inserir um funcionário de exemplo para testes
INSERT INTO funcionarios (nome, cargo, email, senha_hash) VALUES
('Administrador', 'Gerente', 'admin@email.com', 'hash_da_senha_aqui');


CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco NUMERIC(10, 2) NOT NULL CHECK (preco >= 0),
    quantidade_estoque INTEGER NOT NULL DEFAULT 0 CHECK (quantidade_estoque >= 0),
    codigo_barras VARCHAR(50) UNIQUE,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT now()
);

INSERT INTO produtos (nome, descricao, preco, quantidade_estoque, codigo_barras) VALUES
('Coca-Cola Lata 350ml', 'Refrigerante de cola gelado', 4.50, 100, '7894900011517'),
('Salgado de Queijo', 'Salgado assado recheado com queijo minas', 7.00, 50, '1000000000001'),
('Água Mineral 500ml', 'Água mineral natural sem gás', 2.50, 200, NULL);

-- Tabela para armazenar o "cabeçalho" de cada venda
CREATE TABLE vendas (
    id SERIAL PRIMARY KEY,
    funcionario_id INTEGER NOT NULL,
    valor_total NUMERIC(10, 2) NOT NULL,
    metodo_pagamento VARCHAR(50),
    data_venda TIMESTAMP WITH TIME ZONE DEFAULT now(),

    -- Cria a relação com a tabela de funcionários
    CONSTRAINT fk_funcionario
        FOREIGN KEY(funcionario_id) 
        REFERENCES funcionarios(id)
);

-- Tabela para armazenar cada item de uma venda
CREATE TABLE venda_itens (
    id SERIAL PRIMARY KEY,
    venda_id INTEGER NOT NULL,
    produto_id INTEGER NOT NULL,
    quantidade INTEGER NOT NULL,
    preco_unitario NUMERIC(10, 2) NOT NULL,

    -- Cria a relação com a tabela de vendas. Se uma venda for deletada, seus itens também serão.
    CONSTRAINT fk_venda
        FOREIGN KEY(venda_id) 
        REFERENCES vendas(id)
        ON DELETE CASCADE,

    -- Cria a relação com a tabela de produtos
    CONSTRAINT fk_produto
        FOREIGN KEY(produto_id) 
        REFERENCES produtos(id)
);