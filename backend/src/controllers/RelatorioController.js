// backend/src/controllers/RelatorioController.js (VERSÃO ATUALIZADA)
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Venda = require('../models/Venda');
const VendaItem = require('../models/VendaItem');
const Produto = require('../models/Produto');
// ADICIONADO: Importar o modelo Funcionario para fazer o JOIN
const Funcionario = require('../models/Funcionario');
const puppeteer = require('puppeteer'); // Importa o puppeteer
const gerarRelatorioHTML = require('../templates/relatorioVendasTemplate'); // Importa o nosso template
const gerarRelatorioLucratividadeHTML = require('../templates/relatorioLucratividadeTemplate');


class RelatorioController {
  
  async getRelatorioVendas(req, res) {
    const { data_inicio, data_fim } = req.query;

    if (!data_inicio || !data_fim) {
      return res.status(400).json({ error: 'As datas de início e fim são obrigatórias.' });
    }

    const dataFimAjustada = new Date(data_fim);
    dataFimAjustada.setHours(23, 59, 59, 999);

    try {
      const whereClause = {
        data_venda: {
          [Op.between]: [new Date(data_inicio), dataFimAjustada],
        },
      };

      // 1. Cálculo dos totais gerais (agora incluindo descontos)
      const resumoGeral = await Venda.findOne({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'numeroDeVendas'],
          [sequelize.fn('SUM', sequelize.col('valor_total')), 'totalVendido'],
          [sequelize.fn('SUM', sequelize.col('desconto')), 'totalDescontos'],
        ],
        where: whereClause,
        raw: true,
      });

      // --- CORREÇÃO E ADIÇÃO DO FATURAMENTO BRUTO ---
      const totalVendido = Number(resumoGeral.totalVendido) || 0;
      const totalDescontos = Number(resumoGeral.totalDescontos) || 0;
      const numeroDeVendas = Number(resumoGeral.numeroDeVendas) || 0;
      const faturamentoBruto = totalVendido + totalDescontos;

      // 2. Cálculo do total por método de pagamento
      const vendasPorMetodo = await Venda.findAll({
        attributes: [
          'metodo_pagamento',
          [sequelize.fn('SUM', sequelize.col('valor_total')), 'total'],
        ],
        where: whereClause,
        group: ['metodo_pagamento'],
        raw: true,
      });
      
      // 3. Cálculo dos produtos mais vendidos no período
      const topProdutos = await VendaItem.findAll({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('quantidade')), 'total_vendido'],
        ],
        include: [{
          model: Produto,
          attributes: ['nome'],
        }, {
          model: Venda,
          attributes: [],
          where: whereClause,
        }],
        group: ['Produto.id'],
        order: [[sequelize.col('total_vendido'), 'DESC']],
        limit: 10,
        raw: true,
      });

      // 4. ADICIONADO: Cálculo dos top vendedores
      const topVendedores = await Venda.findAll({
        attributes: [
          'vendedor_id',
          [sequelize.fn('SUM', sequelize.col('valor_total')), 'totalVendido'],
        ],
        include: [{
          model: Funcionario,
          as: 'Vendedor', // Usando o alias definido no seu model
          attributes: ['nome'],
        }],
        where: {
          ...whereClause,
          vendedor_id: { [Op.ne]: null } // Ignora vendas sem vendedor associado
        },
        group: ['vendedor_id', 'Vendedor.id'],
        order: [[sequelize.col('totalVendido'), 'DESC']],
        limit: 5, // Top 5 vendedores
        raw: true,
      });


      const relatorio = {
        periodo: { inicio: data_inicio, fim: data_fim },
        resumo: {
          faturamentoBruto, // Adicionado aqui
          totalVendido,
          totalDescontos,
          numeroDeVendas,
          ticketMedio: numeroDeVendas > 0 ? (totalVendido / numeroDeVendas) : 0,
        },
        vendasPorMetodo,
        topProdutos: topProdutos.map(p => ({ nome: p['Produto.nome'], total_vendido: parseInt(p.total_vendido, 10) })),
        topVendedores: topVendedores.map(v => ({ nome: v['Vendedor.nome'], totalVendido: parseFloat(v.totalVendido) })),
      };

      return res.json(relatorio);
    } catch (error) {
      console.error("Erro ao gerar relatório de vendas:", error);
      return res.status(500).json({ error: 'Erro ao gerar relatório.', details: error.message });
    }
  }

  // NOVO MÉTODO PARA GERAR O PDF
  async gerarRelatorioVendasPDF(req, res) {
    const { data_inicio, data_fim } = req.query;
    if (!data_inicio || !data_fim) return res.status(400).json({ error: 'As datas de início e fim são obrigatórias.' });

    const dataFimAjustada = new Date(data_fim);
    dataFimAjustada.setHours(23, 59, 59, 999);
    const whereClause = { data_venda: { [Op.between]: [new Date(data_inicio), dataFimAjustada] } };

    try {
      // --- CÁLCULO ROBUSTO DO RESUMO GERAL ---
      const resumoGeral = await Venda.findOne({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'numeroDeVendas'],
          [sequelize.fn('SUM', sequelize.col('valor_total')), 'totalVendido'],
          [sequelize.fn('SUM', sequelize.col('desconto')), 'totalDescontos'],
        ],
        where: whereClause, raw: true,
      });

      // --- CORREÇÃO PRINCIPAL: Garantir que os valores sejam números antes de somar ---
      const totalVendido = Number(resumoGeral.totalVendido) || 0;
      const totalDescontos = Number(resumoGeral.totalDescontos) || 0;
      const numeroDeVendas = Number(resumoGeral.numeroDeVendas) || 0;
      const faturamentoBruto = totalVendido + totalDescontos;

      // 2. Busca os outros dados (vendedores, métodos)
      const vendasPorMetodo = await Venda.findAll({
        attributes: ['metodo_pagamento', [sequelize.fn('SUM', sequelize.col('valor_total')), 'total']],
        where: whereClause, group: ['metodo_pagamento'], raw: true,
      });

      const topVendedores = await Venda.findAll({
        attributes: [[sequelize.fn('SUM', sequelize.col('valor_total')), 'totalVendido']],
        include: [{ model: Funcionario, as: 'Vendedor', attributes: ['nome'] }],
        where: { ...whereClause, vendedor_id: { [Op.ne]: null } },
        group: ['vendedor_id', 'Vendedor.id'], order: [[sequelize.col('totalVendido'), 'DESC']],
        raw: true,
      });
      
      // 3. BUSCA DETALHADA DE PRODUTOS (MAIS COMPLETA QUE A ORIGINAL)
      const produtosVendidos = await VendaItem.findAll({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('quantidade')), 'quantidade'],
          [sequelize.fn('AVG', sequelize.col('preco_unitario')), 'precoMedio'],
          [sequelize.fn('SUM', sequelize.literal('quantidade * preco_unitario')), 'receitaTotal'],
        ],
        include: [
          { model: Produto, attributes: ['nome'] },
          { model: Venda, attributes: [], where: whereClause, required: true },
        ],
        group: ['Produto.id'],
        order: [[sequelize.col('receitaTotal'), 'DESC']],
        raw: true,
      });
      
      // 4. Monta o objeto de dados final para o template
      const data = {
        periodo: { inicio: data_inicio, fim: data_fim },
        resumo: {
          faturamentoBruto,
          totalVendido,
          totalDescontos,
          numeroDeVendas,
          ticketMedio: numeroDeVendas > 0 ? (totalVendido / numeroDeVendas) : 0,
        },
        vendasPorMetodo,
        topVendedores: topVendedores.map(v => ({ nome: v['Vendedor.nome'], totalVendido: v.totalVendido })),
        produtosVendidos: produtosVendidos.map(p => ({
          nome: p['Produto.nome'],
          quantidade: p.quantidade,
          precoMedio: p.precoMedio,
          receitaTotal: p.receitaTotal,
        })),
      };

      // 5. Geração do PDF com Puppeteer
      const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      const page = await browser.newPage();
      
      const htmlContent = gerarRelatorioHTML(data);
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '80px', right: '20px', bottom: '60px', left: '20px' },
        displayHeaderFooter: true,
        headerTemplate: `<div style="font-size: 8px; text-align: center; width: 100%; padding: 0 20px;">PDV - TechPriv | Relatório Gerencial de Vendas</div>`,
        footerTemplate: `<div style="font-size: 8px; text-align: center; width: 100%; padding: 0 20px;">Gerado em: <span class='date'></span> | Página <span class='pageNumber'></span> de <span class='totalPages'></span></div>`,
      });

      await browser.close();

      // 6. Envio do PDF para o cliente
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="relatorio-vendas-${data_inicio}-a-${data_fim}.pdf"`);
      res.send(pdfBuffer);

    } catch (error) {
      console.error("Erro ao gerar PDF do relatório:", error);
      res.status(500).json({ error: 'Erro ao gerar PDF.', details: error.message });
    }
  }

  // O método getRelatorioLucratividade permanece o mesmo
  async getRelatorioLucratividade(req, res) {
    const { data_inicio, data_fim } = req.query;
    if (!data_inicio || !data_fim) {
      return res.status(400).json({ error: 'As datas de início e fim são obrigatórias.' });
    }
    const dataFimAjustada = new Date(data_fim);
    dataFimAjustada.setHours(23, 59, 59, 999);
    const whereClauseVendas = { data_venda: { [Op.between]: [new Date(data_inicio), dataFimAjustada] } };

    try {
      const itensVendidos = await VendaItem.findAll({
        include: [
          { model: Produto, attributes: ['nome', 'preco_custo'] },
          { model: Venda, attributes: [], where: whereClauseVendas },
        ],
        raw: true,
      });

      let faturamentoBruto = 0;
      let custoTotal = 0;
      const produtosCalculados = {};

      itensVendidos.forEach(item => {
        const precoVenda = parseFloat(item.preco_unitario);
        const precoCusto = parseFloat(item['Produto.preco_custo']) || 0;
        const quantidade = item.quantidade;
        const nomeProduto = item['Produto.nome'];

        faturamentoBruto += precoVenda * quantidade;
        custoTotal += precoCusto * quantidade;

        if (!produtosCalculados[nomeProduto]) {
          produtosCalculados[nomeProduto] = { nome: nomeProduto, lucroTotal: 0 };
        }
        produtosCalculados[nomeProduto].lucroTotal += (precoVenda - precoCusto) * quantidade;
      });

      const lucroBruto = faturamentoBruto - custoTotal;
      const margemLucro = faturamentoBruto > 0 ? (lucroBruto / faturamentoBruto) * 100 : 0;
      
      const rankingProdutos = Object.values(produtosCalculados).sort((a, b) => b.lucroTotal - a.lucroTotal);

      const relatorio = {
        resumo: {
          faturamentoBruto,
          custoTotal,
          lucroBruto,
          margemLucro,
        },
        top5MaisLucrativos: rankingProdutos.slice(0, 5),
        top5MenosLucrativos: rankingProdutos.slice(-5).reverse(),
      };

      return res.json(relatorio);
    } catch (error) {
      console.error("Erro ao gerar relatório de lucratividade:", error);
      return res.status(500).json({ error: 'Erro ao gerar relatório de lucratividade.', details: error.message });
    }
  }

  async gerarRelatorioLucratividadePDF(req, res) {
    const { data_inicio, data_fim } = req.query;
    if (!data_inicio || !data_fim) {
    return res.status(400).json({ error: 'As datas de início e fim são obrigatórias.' });
    }
    const dataFimAjustada = new Date(data_fim);
    dataFimAjustada.setHours(23, 59, 59, 999);
    const whereClauseVendas = { data_venda: { [Op.between]: [new Date(data_inicio), dataFimAjustada] } };

    try {
    const itensVendidos = await VendaItem.findAll({
        include: [
        { model: Produto, attributes: ['nome', 'preco_custo'] },
        { model: Venda, attributes: [], where: whereClauseVendas },
        ],
        raw: true,
    });

    let faturamentoBruto = 0;
    let custoTotal = 0;
    const produtosCalculados = {};

    itensVendidos.forEach(item => {
        const precoVenda = parseFloat(item.preco_unitario);
        const precoCusto = parseFloat(item['Produto.preco_custo']) || 0;
        const quantidade = item.quantidade;
        const nomeProduto = item['Produto.nome'];

        faturamentoBruto += precoVenda * quantidade;
        custoTotal += precoCusto * quantidade;

        if (!produtosCalculados[nomeProduto]) {
        produtosCalculados[nomeProduto] = { nome: nomeProduto, lucroTotal: 0 };
        }
        produtosCalculados[nomeProduto].lucroTotal += (precoVenda - precoCusto) * quantidade;
    });

    const lucroBruto = faturamentoBruto - custoTotal;
    const margemLucro = faturamentoBruto > 0 ? (lucroBruto / faturamentoBruto) * 100 : 0;

    const rankingProdutos = Object.values(produtosCalculados).sort((a, b) => b.lucroTotal - a.lucroTotal);

    const data = {
        periodo: { inicio: data_inicio, fim: data_fim },
        resumo: { faturamentoBruto, custoTotal, lucroBruto, margemLucro },
        top5MaisLucrativos: rankingProdutos.slice(0, 5),
        top5MenosLucrativos: rankingProdutos.slice(-5).reverse(),
    };

    // Geração do PDF com Puppeteer
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    const htmlContent = gerarRelatorioLucratividadeHTML(data);
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '80px', right: '20px', bottom: '60px', left: '20px' },
        displayHeaderFooter: true,
        headerTemplate: `<div style="font-size: 8px; text-align: center; width: 100%; padding: 0 20px;">PDV - TechPriv | Relatório Gerencial de Lucratividade</div>`,
        footerTemplate: `<div style="font-size: 8px; text-align: center; width: 100%; padding: 0 20px;">Gerado em: <span class='date'></span> | Página <span class='pageNumber'></span> de <span class='totalPages'></span></div>`,
    });

    await browser.close();

    // Envio do PDF para o cliente
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="relatorio-lucratividade-${data_inicio}-a-${data_fim}.pdf"`);
    res.send(pdfBuffer);

    } catch (error) {
    console.error("Erro ao gerar PDF de lucratividade:", error);
    return res.status(500).json({ error: 'Erro ao gerar PDF de lucratividade.', details: error.message });
    }
}

}

module.exports = new RelatorioController();