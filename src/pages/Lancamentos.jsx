import { useState } from 'react';
import { Pencil, Trash2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { useStore } from '../data/store.jsx';
import { Chip, PageHeader, EmptyState, ConfirmDialog, Tag } from '../components/ui.jsx';
import LancamentoModal from '../components/LancamentoModal.jsx';
import { moeda, nomeMes, dataBR } from '../lib/format.js';
import { totaisMes, mesDe } from '../lib/calc.js';

const FILTROS = [
  ['todos', 'Todos'],
  ['Recebimento do cliente', 'Entradas'],
  ['Mão de obra', 'Mão de obra'],
  ['Material', 'Material'],
  ['Outros gastos', 'Outros'],
];

export default function Lancamentos() {
  const { lancamentos, remover } = useStore();
  const [filtro, setFiltro] = useState('todos');
  const [editando, setEditando] = useState(null);
  const [excluindo, setExcluindo] = useState(null);

  const lista = lancamentos.filter((l) => filtro === 'todos' || l.categoria === filtro)
    .sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id);
  const meses = [...new Set(lista.map((l) => mesDe(l.data)))].sort().reverse();

  return (
    <>
      <PageHeader titulo="Dinheiro" frase="Tudo que entrou e saiu, mês a mês. Clique em “Novo lançamento” para anotar um movimento." />
      <div className="chips" role="group" aria-label="Filtrar lançamentos">
        {FILTROS.map(([k, rot]) => <Chip key={k} ativo={filtro === k} onClick={() => setFiltro(k)}>{rot}</Chip>)}
      </div>

      {meses.length === 0 && (
        <div className="card"><EmptyState titulo="Ainda não há lançamentos" texto="Clique em + Novo lançamento para anotar o primeiro dinheiro que entrou ou saiu." /></div>
      )}

      {meses.map((m) => {
        const t = totaisMes(lancamentos, m);
        return (
          <section className="grupo" key={m} aria-label={nomeMes(m)}>
            <div className="grupo-cab">
              <h2>{nomeMes(m)}</h2>
              <div className="tot">
                <Tag tom="in" Icon={ArrowDownCircle}>Entrou {moeda(t.entrou)}</Tag>
                <Tag tom="out" Icon={ArrowUpCircle}>Saiu {moeda(t.saiu)}</Tag>
                <Tag tom={t.saldo < 0 ? 'out' : 'result'}>Saldo {moeda(t.saldo)}</Tag>
              </div>
            </div>
            <div className="lista">
              {lista.filter((l) => mesDe(l.data) === m).map((l) => {
                const entrada = l.categoria === 'Recebimento do cliente';
                return (
                  <div className="linha" key={l.id}>
                    <span className="data">{dataBR(l.data)}</span>
                    <span className="desc"><b>{l.descricao || l.categoria}</b><small>{l.quem}</small></span>
                    <span className="tag-col">{l.servicoId ? <Tag tom="madeira">Serviço Nº {l.servicoId}</Tag> : <Tag>Sem serviço</Tag>}</span>
                    <span className="tag-col"><Tag tom={entrada ? 'in' : 'out'} Icon={entrada ? ArrowDownCircle : ArrowUpCircle}>{l.categoria}</Tag></span>
                    <span className={`valor ${entrada ? 'in' : 'out'}`}>{entrada ? '+' : '−'} {moeda(l.valor)}</span>
                    <span className="acoes" style={{ gridColumn: 'auto' }}>
                      <button className="btn claro icone pequeno" onClick={() => setEditando(l)} aria-label={`Editar lançamento de ${dataBR(l.data)}`}><Pencil size={17} /></button>
                      <button className="btn claro icone pequeno" onClick={() => setExcluindo(l)} aria-label={`Excluir lançamento de ${dataBR(l.data)}`}><Trash2 size={17} /></button>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {editando && <LancamentoModal lancamento={editando} onClose={() => setEditando(null)} />}
      {excluindo && (
        <ConfirmDialog
          titulo="Excluir este lançamento?"
          texto={`${excluindo.descricao || excluindo.categoria} de ${moeda(excluindo.valor)} em ${dataBR(excluindo.data)} será apagado e não dá para desfazer.`}
          onCancel={() => setExcluindo(null)}
          onConfirm={() => { remover('lancamentos', excluindo.id, 'Lançamento excluído.'); setExcluindo(null); }}
        />
      )}
    </>
  );
}
