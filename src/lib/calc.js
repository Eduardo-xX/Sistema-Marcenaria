// Cálculos puros — reproduzem a lógica da planilha v2.
const ENTRADA = 'Recebimento do cliente';
const soma = (arr, f) => arr.reduce((t, x) => t + f(x), 0);

export const mesDe = (data) => data.slice(0, 7);

export function totaisMes(lancs, mes) {
  const doMes = lancs.filter((l) => mesDe(l.data) === mes);
  const entrou = soma(doMes.filter((l) => l.categoria === ENTRADA), (l) => l.valor);
  const saiu = soma(doMes.filter((l) => l.categoria !== ENTRADA), (l) => l.valor);
  const maoDeObra = soma(doMes.filter((l) => l.categoria === 'Mão de obra'), (l) => l.valor);
  const material = soma(doMes.filter((l) => l.categoria === 'Material'), (l) => l.valor);
  const outros = soma(doMes.filter((l) => l.categoria === 'Outros gastos'), (l) => l.valor);
  return { entrou, saiu, saldo: entrou - saiu, maoDeObra, material, outros };
}

export function resumoServico(servico, lancs) {
  const ls = lancs.filter((l) => l.servicoId === servico.id);
  const por = (c) => soma(ls.filter((l) => l.categoria === c), (l) => l.valor);
  const recebido = por(ENTRADA);
  const material = por('Material');
  const maoDeObra = por('Mão de obra');
  const outros = por('Outros gastos');
  const gastos = material + maoDeObra + outros;
  const sobrou = servico.valor - gastos;
  return {
    recebido,
    faltaReceber: servico.valor - recebido,
    material, maoDeObra, outros, gastos, sobrou,
    margem: servico.valor === 0 ? 0 : sobrou / servico.valor,
    pctRecebido: servico.valor === 0 ? 0 : Math.min(1, recebido / servico.valor),
  };
}

export const servicosAtivos = (servicos) => servicos.filter((s) => s.situacao !== 'Cancelado');

export function clientesDevem(servicos, lancs) {
  return soma(servicosAtivos(servicos), (s) => resumoServico(s, lancs).faltaReceber);
}

export function margemServicos(servicos, lancs) {
  const at = servicosAtivos(servicos);
  const valor = soma(at, (s) => s.valor);
  const sobrou = soma(at, (s) => resumoServico(s, lancs).sobrou);
  return valor === 0 ? 0 : sobrou / valor;
}

export function detalheCombinado(c, servicos, lancs) {
  const s = servicos.find((x) => x.id === c.servicoId);
  const combinado = c.pct != null ? c.pct * (s ? s.valor : 0) : c.fixo || 0;
  const pago = soma(
    lancs.filter((l) => l.categoria === 'Mão de obra' && l.servicoId === c.servicoId && l.funcionarioId === c.funcionarioId),
    (l) => l.valor,
  );
  return { ...c, servico: s, combinado, pago, falta: combinado - pago };
}

export function faltaPagarEquipe(combinados, servicos, lancs) {
  return soma(
    combinados.map((c) => detalheCombinado(c, servicos, lancs)).filter((d) => d.falta > 0),
    (d) => d.falta,
  );
}

export function pagoAoFuncionario(funcId, lancs, mes = null) {
  return soma(
    lancs.filter((l) => l.categoria === 'Mão de obra' && l.funcionarioId === funcId && (!mes || mesDe(l.data) === mes)),
    (l) => l.valor,
  );
}

export function mesAnterior(mes, n = 1) {
  const [a, m] = mes.split('-').map(Number);
  const d = new Date(a, m - 1 - n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export const mesProximo = (mes) => mesAnterior(mes, -1);

export function ultimosMeses(lancs, mes, qtd = 6) {
  const out = [];
  for (let i = qtd - 1; i >= 0; i--) {
    const m = mesAnterior(mes, i);
    const t = totaisMes(lancs, m);
    out.push({ mes: m, entrou: t.entrou, saiu: t.saiu });
  }
  return out;
}
