// frontend/src/components/ModalRegistrarPagamento.js (VERSÃO AJUSTADA)
import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, FormControl, InputLabel, FormHelperText, Typography } from '@mui/material';
import api from '../services/api';

// Função auxiliar para arredondar números com precisão
const round = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

const ModalRegistrarPagamento = ({ open, onClose, conta, onSucesso }) => {
  // CORREÇÃO: O saldo devedor agora é calculado e arredondado com precisão
  const saldoDevedor = conta ? round(parseFloat(conta.valor_total) - parseFloat(conta.valor_pago)) : 0;

  const formik = useFormik({
    initialValues: {
      valor: '',
      metodo_pagamento: 'Dinheiro',
    },
    validationSchema: Yup.object({
      valor: Yup.number()
        .required('O valor é obrigatório.')
        .positive('O valor deve ser positivo.')
        // A validação .max() agora usa o valor arredondado, evitando falsos erros
        .max(saldoDevedor, `O valor não pode ser maior que o saldo devedor de R$ ${saldoDevedor.toFixed(2)}.`),
      metodo_pagamento: Yup.string().required('O método de pagamento é obrigatório.'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Envia o valor como número para o backend
        const dadosPagamento = {
          ...values,
          valor: parseFloat(values.valor)
        };
        await api.post(`/contas-receber/${conta.id}/pagar`, dadosPagamento);
        toast.success('Pagamento registrado com sucesso!');
        onSucesso();
        onClose();
      } catch (error) {
        toast.error(error.response?.data?.error || 'Erro ao registrar pagamento.');
      } finally {
        setSubmitting(false);
      }
    },
    enableReinitialize: true,
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>Registrar Pagamento</DialogTitle>
        <DialogContent>
          {/* A exibição já usava toFixed(2), o que estava correto visualmente */}
          <Typography>Venda #{conta?.id} - Saldo Devedor: <strong>R$ {saldoDevedor.toFixed(2)}</strong></Typography>
          <TextField
            autoFocus
            fullWidth
            margin="normal"
            id="valor"
            name="valor"
            label="Valor a Pagar (R$)"
            type="number"
            value={formik.values.valor}
            onChange={formik.handleChange}
            error={formik.touched.valor && Boolean(formik.errors.valor)}
            helperText={formik.touched.valor && formik.errors.valor}
            // Adiciona step para facilitar a digitação de centavos
            inputProps={{ step: "0.01" }}
          />
          <FormControl fullWidth margin="normal" error={formik.touched.metodo_pagamento && Boolean(formik.errors.metodo_pagamento)}>
            <InputLabel>Método de Pagamento</InputLabel>
            <Select
              name="metodo_pagamento"
              value={formik.values.metodo_pagamento}
              label="Método de Pagamento"
              onChange={formik.handleChange}
            >
              <MenuItem value="Dinheiro">Dinheiro</MenuItem>
              <MenuItem value="Pix">Pix</MenuItem>
              <MenuItem value="Cartão de Débito">Cartão de Débito</MenuItem>
              <MenuItem value="Cartão de Crédito">Cartão de Crédito</MenuItem>
            </Select>
            <FormHelperText>{formik.touched.metodo_pagamento && formik.errors.metodo_pagamento}</FormHelperText>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>Confirmar Pagamento</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ModalRegistrarPagamento;