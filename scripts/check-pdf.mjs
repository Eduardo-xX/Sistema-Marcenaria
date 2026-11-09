import { criarSeed } from '../src/data/seed.js';
import { montarRelatorio, baixarPDF } from '../src/lib/relatorio.js';
await baixarPDF(montarRelatorio(criarSeed(), '2026-10'));
