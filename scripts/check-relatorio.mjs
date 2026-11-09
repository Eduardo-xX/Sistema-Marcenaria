import { criarSeed } from '../src/data/seed.js';
import { montarRelatorio, baixarExcel } from '../src/lib/relatorio.js';
import XLSX from 'xlsx-js-style';
const rel = montarRelatorio(criarSeed(), '2026-10');
console.log('resumo', rel.resumo.slice(0, 6).map((r) => r[1]).join(' | '), '| lanc', rel.lanc.length, '| servs', rel.servs.length, '| pessoas', rel.pessoas.length);
await baixarExcel(rel);
const wb = XLSX.readFile(`${rel.arquivo}.xlsx`);
console.log('abas', wb.SheetNames.join(', '));
console.log(XLSX.utils.sheet_to_csv(wb.Sheets['Resumo']));
