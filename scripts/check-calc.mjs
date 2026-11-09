import { criarSeed } from '../src/data/seed.js';
import * as c from '../src/lib/calc.js';
const d = criarSeed();
const t = c.totaisMes(d.lancamentos, '2026-10');
const esperado = {
  entrou: 16500, saiu: 7650, saldo: 8850,
  devem: 11700, equipe: 3300, margem: 0.629,
};
const real = {
  entrou: t.entrou, saiu: t.saiu, saldo: t.saldo,
  devem: c.clientesDevem(d.servicos, d.lancamentos),
  equipe: c.faltaPagarEquipe(d.combinados, d.servicos, d.lancamentos),
  margem: Math.round(c.margemServicos(d.servicos, d.lancamentos) * 1000) / 1000,
};
let ok = true;
for (const k in esperado) { const bate = Math.abs(esperado[k] - real[k]) < 0.0005; ok &&= bate; console.log(bate ? 'OK  ' : 'ERRO', k, real[k], '(esperado', esperado[k] + ')'); }
const sobrou = { 1: 11100, 2: 5550, 4: 5740, 5: 6100, 3: 4200 };
for (const s of d.servicos) { const r = c.resumoServico(s, d.lancamentos).sobrou; const bate = r === sobrou[s.id]; ok &&= bate; console.log(bate ? 'OK  ' : 'ERRO', 'servico', s.id, r); }
const pago = { 1: 7460, 2: 750, 3: 1200 };
for (const f in pago) { const r = c.pagoAoFuncionario(+f, d.lancamentos); const bate = r === pago[f]; ok &&= bate; console.log(bate ? 'OK  ' : 'ERRO', 'pago func', f, r); }
process.exit(ok ? 0 : 1);
