const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const moeda = (v) => brl.format(v || 0);

export const percentual = (v) =>
  `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 0 }).format((v || 0) * 100)}%`;

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

export function nomeMes(mes, curto = false) {
  const [a, m] = mes.split('-').map(Number);
  const n = MESES[m - 1];
  if (curto) return n.slice(0, 3);
  return `${n[0].toUpperCase()}${n.slice(1)} de ${a}`;
}

export function dataBR(d) {
  if (!d) return '';
  const [a, m, dia] = d.split('-');
  return `${dia}/${m}/${a}`;
}

export function hoje() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function paraNumero(txt) {
  if (typeof txt === 'number') return txt;
  const limpo = String(txt).replace(/[^\d,.-]/g, '');
  if (limpo.includes(',')) return parseFloat(limpo.replace(/\./g, '').replace(',', '.'));
  return parseFloat(limpo);
}
