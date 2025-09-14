// backend/src/controllers/PagSeguroController.js
const axios = require('axios');

// Crie uma instância do Axios para o PagSeguro para não repetir a configuração
const pagseguroApi = axios.create({
  baseURL: process.env.PAGSEGURO_API_URL, // <-- USA A VARIÁVEL DE AMBIENTE
  headers: {
    'Authorization': `Bearer ${process.env.PAGSEGURO_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

class PagSeguroController {
  async listDevices(req, res) {
    try {
      // A URL agora é relativa: '/proximity-payment/devices'
      const response = await pagseguroApi.get('/proximity-payment/devices');

      const onlineDevices = response.data.devices.filter(d => d.online === true);
      return res.json(onlineDevices);
    } catch (error) {
      console.error("Erro ao listar dispositivos PagSeguro:", error.response?.data || error.message);
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
      // A URL agora é relativa: '/orders'
      const response = await pagseguroApi.post('/orders', orderData);

      return res.json({ message: 'Cobrança enviada para o dispositivo.', order: response.data });
    } catch (error) {
      console.error("Erro ao criar pedido no PagSeguro:", error.response?.data || error.message);
      return res.status(500).json({ error: 'Falha ao criar pedido no PagSeguro.' });
    }
  }
}

module.exports = new PagSeguroController();