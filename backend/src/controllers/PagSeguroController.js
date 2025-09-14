// backend/src/controllers/PagSeguroController.js
const axios = require('axios');

class PagSeguroController {
  // NOVO MÉTODO para listar maquininhas online
  async listDevices(req, res) {
    try {
      const response = await axios.get('https://api.pagseguro.com/proximity-payment/devices', {
        headers: { 'Authorization': `Bearer ${process.env.PAGSEGURO_TOKEN}` },
      });
      // Filtra apenas as maquininhas que estão online
      const onlineDevices = response.data.devices.filter(d => d.online === true);
      return res.json(onlineDevices);
    } catch (error) {
      console.error("Erro ao listar dispositivos PagSeguro:", error.response?.data);
      return res.status(500).json({ error: 'Falha ao listar dispositivos.' });
    }
  }

  // MÉTODO ATUALIZADO para criar o pedido e enviar para um dispositivo
  async createOrder(req, res) {
    const { itens, valor_total, device_id } = req.body; // Agora recebemos o device_id

    if (!device_id) {
      return res.status(400).json({ error: 'ID do dispositivo não fornecido.' });
    }

    const orderData = {
      items: itens.map(item => ({
        name: item.nome,
        quantity: item.quantidade,
        unit_amount: Math.round(item.preco * 100),
      })),
      // A mudança principal é aqui: em vez de 'qr_codes', usamos 'devices'
      devices: [{
        id: device_id,
        amount: {
          value: Math.round(valor_total * 100),
        },
      }],
    };

    try {
      const response = await axios.post(
        'https://api.pagseguro.com/orders',
        orderData,
        {
          headers: {
            'Authorization': `Bearer ${process.env.PAGSEGURO_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );
      // Retorna uma confirmação simples. A mágica acontece na maquininha.
      return res.json({ message: 'Cobrança enviada para a maquininha.', order: response.data });
    } catch (error) {
      console.error("Erro ao criar pedido no PagSeguro:", error.response?.data);
      return res.status(500).json({ error: 'Falha ao criar pedido no PagSeguro.' });
    }
  }
}

module.exports = new PagSeguroController();