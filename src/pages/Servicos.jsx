import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useStore } from '../data/store.jsx';
import { Chip, PageHeader, EmptyState, Modal, ConfirmDialog, Tag, KpiCard } from '../components/ui.jsx';
import LancamentoModal from '../components/LancamentoModal.jsx';
import { moeda, percentual, dataBR, hoje, paraNumero } from '../lib/format.js';
import { resumoServico } from '../lib/calc.js';
import { SITUACOES } from '../data/seed.js';

const tomSituacao = { 'Orçado': 'neutro', 'Em produção': 'madeira', 'Entregue': 'in', 'Cancelado': 'out' };

function ServicoForm({ servico, onClose }) {
  const { adicionarServico, atualizar, proximoNumeroServico } = useStore();
  const [f, setF] = useState({
    cliente: servico?.cliente || '', descricao: servico?.descricao || '',
    valor: servico ? String(servico.valor).replace('.', ',') : '', data: servico?.data || hoje(),
    situacao: servico?.situacao || 'Orçado',
  });
  const [erros, setErros] = useState([]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  function salvar(e) {
    e.preventDefault();
    const lista = [];
    const v = paraNumero(f.valor);
    if (!f.cliente.trim()) lista.push('Digite o nome do cliente.');
    if (!f.descricao.trim()) lista.push('Descreva o que foi vendido. Exemplo: Cozinha planejada.');
    if (!f.valor || Number.isNaN(v) || v <= 0) lista.push('Digite o valor combinado com o cliente.');
    if (lista.length) { setErros(lista); return; }
    const item = { cliente: f.cliente.trim(), descricao: f.descricao.trim(), valor: v, data: f.data, situacao: f.situacao };
    if (servico) atualizar('servicos', servico.id, item, 'Serviço atualizado.');
    else adicionarServico({ id: proximoNumeroServico(), ...item }, 'Serviço criado.');
    onClose();
  }

  return (
    <Modal titulo={servico ? `Editar serviço Nº ${servico.id}` : 'Novo serviço'} onClose={onClose}>
      <form onSubmit={salvar} noValidate>
        {erros.length > 0 && <div className="caixa-erro" role="alert">{erros.map((m) => <div key={m}>{m}</div>)}</div>}
        <div className="campo"><label htmlFor="s-cli">Cliente</label><input id="s-cli" value={f.cliente} onChange={set('cliente')} /></div>
        <div className="campo"><label htmlFor="s-desc">O que foi vendido</label><input id="s-desc" value={f.descricao} onChange={set('descricao')} /></div>
        <div className="campo"><label htmlFor="s-val">Valor combinado (R$)</label><input id="s-val" inputMode="decimal" value={f.valor} onChange={set('valor')} placeholder="0,00" /></div>
        <div className="campo"><label htmlFor="s-data">Data</label><input id="s-data" type="date" value={f.data} onChange={set('data')} /></div>
        <div className="campo"><label htmlFor="s-sit">Situação</label>
          <select id="s-sit" value={f.situacao} onChange={set('situacao')}>{SITUACOES.map((s) => <option key={s}>{s}</option>)}</select></div>
        <div className="rodape-modal">
          <button type="button" className="btn claro" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn madeira">Salvar</button>
        </div>
      </form>
    </Modal>
  );
}

function Detalhe({ servico, onClose, onEditar, onExcluir }) {
  const { lancamentos } = useStore();
  const r = resumoServico(servico, lancamentos);
  const [novo, setNovo] = useState(false);
  const ls = lancamentos.filter((l) => l.servicoId === servico.id).sort((a, b) => b.data.localeCompare(a.data));
  return (
    <Modal titulo={`Serviço Nº ${servico.id} · ${servico.cliente}`} onClose={onClose} largo>
      <p style={{ marginBottom: 6 }}>{servico.descricao} <Tag tom={tomSituacao[servico.situacao]}>{servico.situacao}</Tag></p>
      <div className="det-grid">
        <KpiCard tom="result" rotulo="Valor do serviço" valor={moeda(servico.valor)} />
        <KpiCard tom="in" rotulo="Já recebido" valor={moeda(r.recebido)} />
        <KpiCard tom="in" rotulo="Falta receber" valor={moeda(r.faltaReceber)} />
        <KpiCard tom="out" rotulo="Material" valor={moeda(r.material)} />
        <KpiCard tom="out" rotulo="Mão de obra" valor={moeda(r.maoDeObra)} />
        <KpiCard tom="result" rotulo="Quanto sobrou" valor={moeda(r.sobrou)} dica={`Margem de ${percentual(r.margem)}`} />
      </div>
      <h3 style={{ margin: '8px 0' }}>Dinheiro deste serviço</h3>
      {ls.length === 0 ? <p className="pequeno-txt">Nenhum lançamento ainda.</p> : (
        <ul className="atencao">
          {ls.map((l) => {
            const e = l.categoria === 'Recebimento do cliente';
            return <li key={l.id}><span>{dataBR(l.data)} · {l.descricao || l.categoria} <small className="pequeno-txt">({l.categoria})</small></span>
              <b style={{ color: e ? 'var(--in)' : 'var(--out)' }}>{e ? '+' : '−'} {moeda(l.valor)}</b></li>;
          })}
        </ul>
      )}
      <div className="rodape-modal" style={{ marginTop: 16 }}>
        <button className="btn claro" onClick={() => setNovo(true)}><Plus size={18} />Lançar dinheiro neste serviço</button>
        <button className="btn claro" onClick={onEditar}><Pencil size={18} />Editar</button>
        <button className="btn claro" onClick={onExcluir}><Trash2 size={18} />Excluir</button>
      </div>
      {novo && <LancamentoModal servicoId={servico.id} onClose={() => setNovo(false)} />}
    </Modal>
  );
}

export default function Servicos() {
  const { servicos, lancamentos, remover } = useStore();
  const [filtro, setFiltro] = useState('todos');
  const [aberto, setAberto] = useState(null);
  const [form, setForm] = useState(null); // 'novo' | servico
  const [excluir, setExcluir] = useState(null);

  const lista = servicos.filter((s) => filtro === 'todos' || s.situacao === filtro).sort((a, b) => b.id - a.id);
  const abertoAtual = aberto && servicos.find((s) => s.id === aberto);

  return (
    <>
      <PageHeader titulo="Serviços" frase="Cada serviço vendido: quanto vale, quanto já recebeu e quanto sobrou depois dos gastos.">
        <button className="btn" onClick={() => setForm('novo')}><Plus size={18} />Novo serviço</button>
      </PageHeader>
      <div className="chips" role="group" aria-label="Filtrar por situação">
        <Chip ativo={filtro === 'todos'} onClick={() => setFiltro('todos')}>Todos</Chip>
        {SITUACOES.map((s) => <Chip key={s} ativo={filtro === s} onClick={() => setFiltro(s)}>{s}</Chip>)}
      </div>
      <div className="lista">
        {lista.length === 0 && <EmptyState titulo="Nenhum serviço aqui" texto="Clique em Novo serviço para cadastrar o primeiro." />}
        {lista.map((s) => {
          const r = resumoServico(s, lancamentos);
          return (
            <button key={s.id} className="serv" onClick={() => setAberto(s.id)} aria-label={`Abrir serviço ${s.id}, ${s.cliente}`}>
              <span className="n">{s.id}</span>
              <span><b>{s.cliente}</b><br /><span className="pequeno-txt">{s.descricao}</span></span>
              <span><Tag tom={tomSituacao[s.situacao]}>{s.situacao}</Tag><br /><b>{moeda(s.valor)}</b></span>
              <span>
                <span className="pequeno-txt">Recebido {moeda(r.recebido)} de {moeda(s.valor)}</span>
                <div className="barra" role="img" aria-label={`${Math.round(r.pctRecebido * 100)}% recebido`}><i style={{ width: `${r.pctRecebido * 100}%` }} /></div>
              </span>
              <span><span className="pequeno-txt">Gastos {moeda(r.gastos)}</span><br />
                <b style={{ color: r.sobrou < 0 ? 'var(--out)' : 'var(--result)' }}>Sobrou {moeda(r.sobrou)}</b></span>
            </button>
          );
        })}
      </div>

      {abertoAtual && !form && !excluir && (
        <Detalhe servico={abertoAtual} onClose={() => setAberto(null)}
          onEditar={() => setForm(abertoAtual)} onExcluir={() => setExcluir(abertoAtual)} />
      )}
      {form && <ServicoForm servico={form === 'novo' ? null : form} onClose={() => setForm(null)} />}
      {excluir && (
        <ConfirmDialog titulo="Excluir este serviço?"
          texto={`O serviço Nº ${excluir.id} (${excluir.cliente}) será apagado, junto com os combinados e contratos dele. Os lançamentos de dinheiro ficam, mas sem serviço.`}
          onCancel={() => setExcluir(null)}
          onConfirm={() => { remover('servicos', excluir.id, 'Serviço excluído.'); setExcluir(null); setAberto(null); }} />
      )}
    </>
  );
}
