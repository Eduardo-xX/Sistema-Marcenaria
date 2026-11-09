// Monta os dados do relatório de um mês e exporta em PDF ou Excel.
import * as c from './calc.js';
import { nomeMes, dataBR } from './format.js';

const ENTRADA = 'Recebimento do cliente';
const brl = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

export function montarRelatorio({ lancamentos, servicos, combinados, equipe }, mes) {
  const totais = c.totaisMes(lancamentos, mes);
  const doMes = lancamentos.filter((l) => c.mesDe(l.data) === mes).sort((a, b) => a.data.localeCompare(b.data) || a.id - b.id);

  const resumo = [
    ['Dinheiro que entrou', totais.entrou],
    ['Dinheiro que saiu', totais.saiu],
    ['  Mão de obra', totais.maoDeObra],
    ['  Material', totais.material],
    ['  Outros gastos', totais.outros],
    ['Saldo do mês', totais.saldo],
    ['Clientes ainda devem (hoje)', c.clientesDevem(servicos, lancamentos)],
    ['Falta pagar à equipe (hoje)', c.faltaPagarEquipe(combinados, servicos, lancamentos)],
  ];
  const margem = c.margemServicos(servicos, lancamentos);

  const lanc = doMes.map((l) => ({
    data: dataBR(l.data), tipo: l.categoria, descricao: l.descricao || '', quem: l.quem || '',
    servico: l.servicoId ? `Nº ${l.servicoId}` : 'Sem serviço',
    valor: l.categoria === ENTRADA ? l.valor : -l.valor,
  }));

  const servs = servicos.filter((s) => doMes.some((l) => l.servicoId === s.id)).sort((a, b) => a.id - b.id).map((s) => {
    const ls = doMes.filter((l) => l.servicoId === s.id);
    const r = c.resumoServico(s, lancamentos);
    return {
      n: s.id, cliente: s.cliente, descricao: s.descricao, situacao: s.situacao, valor: s.valor,
      entrou: ls.filter((l) => l.categoria === ENTRADA).reduce((t, l) => t + l.valor, 0),
      saiu: ls.filter((l) => l.categoria !== ENTRADA).reduce((t, l) => t + l.valor, 0),
      sobrou: r.sobrou,
    };
  });

  const pessoas = equipe.map((f) => {
    const falta = combinados.filter((cb) => cb.funcionarioId === f.id)
      .map((cb) => c.detalheCombinado(cb, servicos, lancamentos)).filter((d) => d.falta > 0).reduce((t, d) => t + d.falta, 0);
    return { nome: f.nome, pagoNoMes: c.pagoAoFuncionario(f.id, lancamentos, mes), falta };
  });

  return {
    mes, titulo: nomeMes(mes), resumo, margem, lanc, servs, pessoas,
    arquivo: `relatorio-marcenaria-${mes}`,
  };
}

export async function baixarPDF(rel) {
  const [mj, ma] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const jsPDF = mj.jsPDF || mj.default?.jsPDF || mj.default;
  const autoTable = ma.default?.default || ma.default || ma.autoTable;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const verde = [46, 125, 79], verm = [185, 58, 50], azul = [47, 95, 152], madeira = [176, 122, 69], tinta = [19, 27, 37];

  doc.setFillColor(...tinta); doc.rect(0, 0, W, 70, 'F');
  doc.setTextColor(255); doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
  doc.text('Marcenaria Hernandes', 40, 34);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(12);
  doc.text(`Relatório financeiro · ${rel.titulo}`, 40, 54);
  doc.setFontSize(9); doc.text('Protótipo: dados de exemplo', W - 40, 54, { align: 'right' });

  let y = 100;
  doc.setTextColor(...tinta); doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
  doc.text('Resumo do mês', 40, y);
  autoTable(doc, {
    startY: y + 8, theme: 'grid', margin: { left: 40, right: 40 },
    head: [['Indicador', 'Valor']],
    body: [...rel.resumo.map(([k, v]) => [k, brl(v)]), ['Margem dos serviços', `${(rel.margem * 100).toFixed(1).replace('.', ',')}%`]],
    headStyles: { fillColor: madeira }, styles: { fontSize: 10 }, columnStyles: { 1: { halign: 'right' } },
    didParseCell: (d) => {
      if (d.section !== 'body') return;
      const k = rel.resumo[d.row.index]?.[0] || '';
      if (d.column.index === 1) {
        if (k === 'Dinheiro que entrou') d.cell.styles.textColor = verde;
        else if (k === 'Dinheiro que saiu' || k.startsWith('Falta pagar')) d.cell.styles.textColor = verm;
        else if (k === 'Saldo do mês') d.cell.styles.textColor = azul;
      }
    },
  });

  const secao = (titulo, opts) => {
    const yy = doc.lastAutoTable.finalY + 26;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(...tinta);
    doc.text(titulo, 40, yy > 780 ? 40 : yy);
    autoTable(doc, { startY: (yy > 780 ? 40 : yy) + 8, theme: 'grid', margin: { left: 40, right: 40 }, headStyles: { fillColor: madeira }, styles: { fontSize: 9 }, ...opts });
  };

  secao('Dinheiro que entrou e saiu', {
    head: [['Data', 'Tipo', 'Descrição', 'Quem', 'Serviço', 'Valor']],
    body: rel.lanc.length ? rel.lanc.map((l) => [l.data, l.tipo, l.descricao, l.quem, l.servico, `${l.valor < 0 ? '− ' : '+ '}${brl(Math.abs(l.valor))}`]) : [['', 'Nenhum lançamento neste mês', '', '', '', '']],
    columnStyles: { 5: { halign: 'right' } },
    didParseCell: (d) => { if (d.section === 'body' && d.column.index === 5 && rel.lanc[d.row.index]) d.cell.styles.textColor = rel.lanc[d.row.index].valor < 0 ? verm : verde; },
  });
  secao('Serviços com movimento no mês', {
    head: [['Nº', 'Cliente', 'Serviço', 'Situação', 'Valor', 'Entrou', 'Saiu', 'Sobrou (total)']],
    body: rel.servs.length ? rel.servs.map((s) => [s.n, s.cliente, s.descricao, s.situacao, brl(s.valor), brl(s.entrou), brl(s.saiu), brl(s.sobrou)]) : [['', 'Nenhum serviço com movimento', '', '', '', '', '', '']],
    columnStyles: { 4: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right' }, 7: { halign: 'right' } },
  });
  secao('Equipe', {
    head: [['Pessoa', 'Recebeu no mês', 'Falta pagar (hoje)']],
    body: rel.pessoas.length ? rel.pessoas.map((p) => [p.nome, brl(p.pagoNoMes), brl(p.falta)]) : [['Ninguém cadastrado', '', '']],
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
  });

  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i); doc.setFontSize(8); doc.setTextColor(120);
    doc.text(`Página ${i} de ${n}`, W - 40, 820, { align: 'right' });
  }
  doc.save(`${rel.arquivo}.pdf`);
}

export async function baixarExcel(rel) {
  const XLSX = (await import('xlsx-js-style')).default;
  const wb = XLSX.utils.book_new();
  const F = '"R$" #,##0.00;[Red]-"R$" #,##0.00';
  const cab = { font: { bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: 'B07A45' } }, alignment: { vertical: 'center' } };
  const titulo = { font: { bold: true, sz: 14, color: { rgb: '131B25' } } };
  const cor = (rgb) => ({ font: { bold: true, color: { rgb } } });

  function aba(nome, linhas, largura, formatoCols = [], estiloCelula = null) {
    const ws = XLSX.utils.aoa_to_sheet(linhas.map((l) => l.map((v) => (v && v.__titulo ? v.t : v))));
    ws['!cols'] = largura.map((w) => ({ wch: w }));
    const ref = XLSX.utils.decode_range(ws['!ref']);
    for (let r = ref.s.r; r <= ref.e.r; r++) {
      for (let col = ref.s.c; col <= ref.e.c; col++) {
        const a = XLSX.utils.encode_cell({ r, c: col });
        if (!ws[a]) continue;
        if (r === 0) ws[a].s = titulo;
        else if (r === 2) ws[a].s = cab;
        if (r > 2 && formatoCols.includes(col) && typeof ws[a].v === 'number') ws[a].z = F;
        if (r > 2 && estiloCelula) { const s = estiloCelula(r - 3, col, ws[a].v); if (s) ws[a].s = s; }
      }
    }
    XLSX.utils.book_append_sheet(wb, ws, nome);
  }

  const t = `Marcenaria Hernandes · ${rel.titulo}`;
  aba('Resumo', [[t], [], ['Indicador', 'Valor'], ...rel.resumo, ['Margem dos serviços', rel.margem]], [34, 18], [1],
    (i, col, v) => {
      if (col !== 1) return null;
      const k = rel.resumo[i]?.[0] || '';
      if (k === 'Dinheiro que entrou') return cor('2E7D4F');
      if (k === 'Dinheiro que saiu' || k.startsWith('Falta pagar')) return cor('B93A32');
      if (k === 'Saldo do mês') return cor('2F5F98');
      return null;
    });
  const wsR = wb.Sheets.Resumo; const ult = rel.resumo.length + 3; const mc = wsR[`B${ult + 1}`]; if (mc) { mc.z = '0.0%'; }

  aba('Lançamentos', [[`Lançamentos · ${rel.titulo}`], [], ['Data', 'Tipo', 'Descrição', 'Quem', 'Serviço', 'Valor'],
    ...rel.lanc.map((l) => [l.data, l.tipo, l.descricao, l.quem, l.servico, l.valor])], [12, 24, 28, 28, 14, 16], [5],
    (i, col) => (col === 5 && rel.lanc[i] ? cor(rel.lanc[i].valor < 0 ? 'B93A32' : '2E7D4F') : null));
  aba('Serviços', [[`Serviços com movimento · ${rel.titulo}`], [], ['Nº', 'Cliente', 'Serviço', 'Situação', 'Valor', 'Entrou no mês', 'Saiu no mês', 'Sobrou (total)'],
    ...rel.servs.map((s) => [s.n, s.cliente, s.descricao, s.situacao, s.valor, s.entrou, s.saiu, s.sobrou])], [6, 22, 28, 14, 14, 16, 16, 16], [4, 5, 6, 7]);
  aba('Equipe', [[`Equipe · ${rel.titulo}`], [], ['Pessoa', 'Recebeu no mês', 'Falta pagar (hoje)'],
    ...rel.pessoas.map((p) => [p.nome, p.pagoNoMes, p.falta])], [26, 18, 20], [1, 2]);

  XLSX.writeFile(wb, `${rel.arquivo}.xlsx`);
}
