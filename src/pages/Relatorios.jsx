import { useState } from 'react';
import { FileText, FileSpreadsheet, Download } from 'lucide-react';
import { useStore } from '../data/store.jsx';
import { MES_PADRAO } from '../data/seed.js';
import { PageHeader, MonthPicker, KpiCard, Tag } from '../components/ui.jsx';
import { moeda, percentual } from '../lib/format.js';
import { montarRelatorio, baixarPDF, baixarExcel } from '../lib/relatorio.js';
import { ArrowDownCircle, ArrowUpCircle, Scale, Percent } from 'lucide-react';

export default function Relatorios() {
  const dados = useStore();
  const { avisar } = dados;
  const [mes, setMes] = useState(MES_PADRAO);
  const [gerando, setGerando] = useState(null);

  const rel = montarRelatorio(dados, mes);
  const entrou = rel.resumo[0][1], saiu = rel.resumo[1][1], saldo = rel.resumo[5][1];
  const vazio = rel.lanc.length === 0;

  async function gerar(tipo) {
    setGerando(tipo);
    try {
      await (tipo === 'pdf' ? baixarPDF(rel) : baixarExcel(rel));
      avisar(tipo === 'pdf' ? 'PDF gerado. Veja na pasta de downloads.' : 'Excel gerado. Veja na pasta de downloads.');
    } catch (e) {
      console.error(e);
      avisar('Não foi possível gerar o arquivo. Tente de novo.');
    }
    setGerando(null);
  }

  return (
    <>
      <PageHeader titulo="Relatórios" frase="Escolha um mês e baixe o resumo do dinheiro em PDF ou em Excel.">
        <MonthPicker mes={mes} onChange={setMes} />
      </PageHeader>

      <div className="grid-2">
        <section className="card" aria-label="O que vai no relatório">
          <h2>{rel.titulo}</h2>
          <p className="pequeno-txt" style={{ marginBottom: 12 }}>O relatório deste mês inclui:</p>
          <ul className="atencao">
            <li><span>Resumo: entrou, saiu, saldo e margem</span></li>
            <li><span>Todos os lançamentos do mês</span><Tag>{rel.lanc.length}</Tag></li>
            <li><span>Serviços com movimento no mês</span><Tag>{rel.servs.length}</Tag></li>
            <li><span>Equipe: quanto recebeu e quanto falta</span><Tag>{rel.pessoas.length}</Tag></li>
          </ul>
          {vazio && <p className="pequeno-txt" style={{ marginTop: 12 }}>Não há lançamentos neste mês. O arquivo sai só com o resumo zerado. Use as setas para trocar de mês.</p>}
        </section>

        <section className="card" aria-label="Prévia do resumo">
          <h2>Prévia</h2>
          <div className="det-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <KpiCard tom="in" Icon={ArrowDownCircle} rotulo="Entrou" valor={moeda(entrou)} />
            <KpiCard tom="out" Icon={ArrowUpCircle} rotulo="Saiu" valor={moeda(saiu)} />
            <KpiCard tom={saldo < 0 ? 'out' : 'result'} Icon={Scale} rotulo="Saldo" valor={moeda(saldo)} />
            <KpiCard tom="result" Icon={Percent} rotulo="Margem" valor={percentual(rel.margem)} />
          </div>
        </section>
      </div>

      <div className="grid-2">
        <section className="card">
          <h2><FileText size={20} style={{ verticalAlign: -3 }} aria-hidden="true" /> PDF</h2>
          <p className="pequeno-txt" style={{ margin: '4px 0 14px' }}>Bom para ler, imprimir e mandar por WhatsApp. Não dá para editar.</p>
          <button className="btn madeira" style={{ width: '100%' }} disabled={!!gerando} onClick={() => gerar('pdf')}>
            <Download size={18} aria-hidden="true" />{gerando === 'pdf' ? 'Gerando…' : 'Baixar relatório em PDF'}
          </button>
        </section>
        <section className="card">
          <h2><FileSpreadsheet size={20} style={{ verticalAlign: -3 }} aria-hidden="true" /> Excel</h2>
          <p className="pequeno-txt" style={{ margin: '4px 0 14px' }}>Bom para o contador ou para fazer suas próprias contas. Vem com uma aba para cada assunto.</p>
          <button className="btn madeira" style={{ width: '100%' }} disabled={!!gerando} onClick={() => gerar('xlsx')}>
            <Download size={18} aria-hidden="true" />{gerando === 'xlsx' ? 'Gerando…' : 'Baixar relatório em Excel'}
          </button>
        </section>
      </div>
    </>
  );
}
