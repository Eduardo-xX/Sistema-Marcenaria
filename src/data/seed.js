// Dados de exemplo (todos fictícios)
export const MES_PADRAO = '2026-10';

export const CATEGORIAS = ['Recebimento do cliente', 'Mão de obra', 'Material', 'Outros gastos'];
export const SITUACOES = ['Orçado', 'Em produção', 'Entregue', 'Cancelado'];
export const TIPOS_PAGAMENTO = ['Diária', 'Por obra', 'Percentual'];

const L = (id, data, servicoId, categoria, funcionarioId, quem, descricao, valor) => ({
  id, data, servicoId, categoria, funcionarioId, quem, descricao, valor,
});

export function criarSeed() {
  return {
    equipe: [
      { id: 1, nome: 'Carlos (exemplo)', tipo: 'Percentual', diaria: null, pct: 0.2 },
      { id: 2, nome: 'Pedro (exemplo)', tipo: 'Diária', diaria: 150, pct: null },
      { id: 3, nome: 'Marcos (exemplo)', tipo: 'Por obra', diaria: null, pct: null },
    ],
    servicos: [
      { id: 4, data: '2026-08-15', cliente: 'Cliente Exemplo D', descricao: 'Home office completo', valor: 9800, situacao: 'Entregue' },
      { id: 5, data: '2026-09-02', cliente: 'Cliente Exemplo E', descricao: 'Closet planejado', valor: 12500, situacao: 'Entregue' },
      { id: 1, data: '2026-10-05', cliente: 'Cliente Exemplo A', descricao: 'Cozinha planejada completa', valor: 18000, situacao: 'Em produção' },
      { id: 2, data: '2026-10-12', cliente: 'Cliente Exemplo B', descricao: 'Guarda-roupa de casal', valor: 7500, situacao: 'Entregue' },
      { id: 3, data: '2026-11-03', cliente: 'Cliente Exemplo C', descricao: 'Painel ripado para TV', valor: 4200, situacao: 'Orçado' },
    ],
    lancamentos: [
      L(1, '2026-08-15', 4, 'Recebimento do cliente', null, 'Cliente Exemplo D', 'Entrada de 50%', 4900),
      L(2, '2026-08-18', 4, 'Material', null, 'Fornecedor de MDF (exemplo)', 'Chapas de MDF', 2100),
      L(3, '2026-08-22', 4, 'Mão de obra', 1, 'Carlos (exemplo)', 'Pagamento do serviço', 1960),
      L(4, '2026-08-30', 4, 'Recebimento do cliente', null, 'Cliente Exemplo D', 'Saldo na entrega', 4900),
      L(5, '2026-09-02', 5, 'Recebimento do cliente', null, 'Cliente Exemplo E', 'Entrada de 50%', 6250),
      L(6, '2026-09-08', 5, 'Material', null, 'Fornecedor de MDF (exemplo)', 'Chapas e ferragens', 3600),
      L(7, '2026-09-15', 5, 'Mão de obra', 1, 'Carlos (exemplo)', 'Pagamento do serviço', 2500),
      L(8, '2026-09-18', 5, 'Mão de obra', 2, 'Pedro (exemplo)', '2 diárias', 300),
      L(9, '2026-09-25', 5, 'Recebimento do cliente', null, 'Cliente Exemplo E', 'Saldo na entrega', 6250),
      L(10, '2026-09-28', null, 'Outros gastos', null, 'Posto (exemplo)', 'Combustível da van', 280),
      L(11, '2026-10-05', 1, 'Recebimento do cliente', null, 'Cliente Exemplo A', 'Entrada de 50%', 9000),
      L(12, '2026-10-12', 2, 'Recebimento do cliente', null, 'Cliente Exemplo B', 'Pagamento integral', 7500),
      L(13, '2026-10-14', 1, 'Material', null, 'Fornecedor de MDF (exemplo)', 'Chapas de MDF', 4200),
      L(14, '2026-10-20', 1, 'Mão de obra', 1, 'Carlos (exemplo)', 'Adiantamento', 1500),
      L(15, '2026-10-25', 2, 'Mão de obra', 1, 'Carlos (exemplo)', 'Pagamento do serviço', 1500),
      L(16, '2026-10-25', 2, 'Mão de obra', 2, 'Pedro (exemplo)', '3 diárias', 450),
      L(17, '2026-11-03', 3, 'Recebimento do cliente', null, 'Cliente Exemplo C', 'Sinal', 1500),
      L(18, '2026-11-04', 1, 'Mão de obra', 3, 'Marcos (exemplo)', 'Instalação (parcial)', 1200),
      L(19, '2026-11-05', null, 'Outros gastos', null, 'Posto (exemplo)', 'Combustível da van', 320),
    ],
    combinados: [
      { id: 1, servicoId: 4, funcionarioId: 1, pct: 0.2, fixo: null },
      { id: 2, servicoId: 5, funcionarioId: 1, pct: 0.2, fixo: null },
      { id: 3, servicoId: 5, funcionarioId: 2, pct: null, fixo: 300 },
      { id: 4, servicoId: 1, funcionarioId: 1, pct: 0.2, fixo: null },
      { id: 5, servicoId: 1, funcionarioId: 3, pct: null, fixo: 2400 },
      { id: 6, servicoId: 2, funcionarioId: 1, pct: 0.2, fixo: null },
      { id: 7, servicoId: 2, funcionarioId: 2, pct: null, fixo: 450 },
    ],
    contratos: [
      { id: 1, servicoId: 1, status: 'Aguardando assinatura', pagamento: '50% de entrada e 50% na entrega', assinatura: null },
      { id: 2, servicoId: 2, status: 'Assinado', pagamento: 'Pagamento integral à vista', assinatura: null },
    ],
  };
}
