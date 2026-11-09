import { useState } from 'react';
import { ArrowDownCircle, HardHat, Package, Receipt, AlertCircle } from 'lucide-react';
import { Modal } from './ui.jsx';
import { useStore } from '../data/store.jsx';
import { hoje, paraNumero } from '../lib/format.js';

const TIPOS = [
  { cat: 'Recebimento do cliente', rot: 'Recebi de um cliente', tom: 'in', Icon: ArrowDownCircle },
  { cat: 'Mão de obra', rot: 'Paguei a equipe', tom: 'out', Icon: HardHat },
  { cat: 'Material', rot: 'Comprei material', tom: 'out', Icon: Package },
  { cat: 'Outros gastos', rot: 'Outro gasto', tom: 'out', Icon: Receipt },
];

export default function LancamentoModal({ lancamento, servicoId, onClose }) {
  const { servicos, equipe, adicionar, atualizar } = useStore();
  const editando = !!lancamento;
  const [cat, setCat] = useState(lancamento?.categoria || 'Recebimento do cliente');
  const [data, setData] = useState(lancamento?.data || hoje());
  const [valor, setValor] = useState(lancamento ? String(lancamento.valor).replace('.', ',') : '');
  const [serv, setServ] = useState(lancamento ? String(lancamento.servicoId ?? '') : servicoId ? String(servicoId) : '');
  const [func, setFunc] = useState(lancamento?.funcionarioId ? String(lancamento.funcionarioId) : '');
  const [quem, setQuem] = useState(lancamento && lancamento.categoria !== 'Mão de obra' ? lancamento.quem : '');
  const [desc, setDesc] = useState(lancamento?.descricao || '');
  const [erros, setErros] = useState([]);

  const ehEntrada = cat === 'Recebimento do cliente';
  const ehMao = cat === 'Mão de obra';

  function escolherServico(v) {
    setServ(v);
    if (ehEntrada && v) {
      const s = servicos.find((x) => x.id === Number(v));
      if (s && !quem) setQuem(s.cliente);
    }
  }

  function salvar(e) {
    e.preventDefault();
    const lista = [];
    const num = paraNumero(valor);
    if (!data) lista.push('Escolha a data.');
    if (!valor || Number.isNaN(num) || num <= 0) lista.push('Digite um valor maior que zero. Exemplo: 1500 ou 1.500,50');
    if (ehEntrada && !serv) lista.push('Escolha de qual serviço é esse recebimento.');
    if (ehMao && !func) lista.push('Escolha quem recebeu o pagamento.');
    if (lista.length) { setErros(lista); return; }

    const f = equipe.find((x) => x.id === Number(func));
    const s = servicos.find((x) => x.id === Number(serv));
    const item = {
      data,
      servicoId: serv ? Number(serv) : null,
      categoria: cat,
      funcionarioId: ehMao ? Number(func) : null,
      quem: ehMao ? f.nome : quem || (ehEntrada && s ? s.cliente : ''),
      descricao: desc,
      valor: Math.round(num * 100) / 100,
    };
    if (editando) atualizar('lancamentos', lancamento.id, item, 'Alteração salva.');
    else adicionar('lancamentos', item, 'Lançamento salvo.');
    onClose();
  }

  return (
    <Modal titulo={editando ? 'Editar lançamento' : 'Novo lançamento'} onClose={onClose}>
      <form onSubmit={salvar} noValidate>
        <p className="pequeno-txt" style={{ marginBottom: 12 }}>Lançamento é qualquer dinheiro que entrou ou saiu. O que aconteceu?</p>
        <div className="tipos" role="group" aria-label="Tipo de lançamento">
          {TIPOS.map(({ cat: c, rot, tom, Icon }) => (
            <button type="button" key={c} className={`tipo ${tom}`} aria-pressed={cat === c} onClick={() => setCat(c)}>
              <Icon size={20} aria-hidden="true" />{rot}
            </button>
          ))}
        </div>

        {erros.length > 0 && (
          <div className="caixa-erro" role="alert">
            {erros.map((m) => <div key={m}><AlertCircle size={15} style={{ verticalAlign: -2 }} aria-hidden="true" /> {m}</div>)}
          </div>
        )}

        <div className="campo"><label htmlFor="l-data">Data</label>
          <input id="l-data" type="date" value={data} onChange={(e) => setData(e.target.value)} /></div>
        <div className="campo"><label htmlFor="l-valor">Valor (R$)</label>
          <input id="l-valor" inputMode="decimal" placeholder="0,00" value={valor} onChange={(e) => setValor(e.target.value)} /></div>
        <div className="campo"><label htmlFor="l-serv">Serviço {ehEntrada ? '' : '(opcional)'}</label>
          <select id="l-serv" value={serv} onChange={(e) => escolherServico(e.target.value)}>
            <option value="">{ehEntrada ? 'Escolha um serviço…' : 'Sem serviço'}</option>
            {servicos.map((s) => <option key={s.id} value={s.id}>Nº {s.id} · {s.cliente} · {s.descricao}</option>)}
          </select></div>
        {ehMao ? (
          <div className="campo"><label htmlFor="l-func">Quem recebeu</label>
            <select id="l-func" value={func} onChange={(e) => setFunc(e.target.value)}>
              <option value="">Escolha a pessoa…</option>
              {equipe.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
            {equipe.length === 0 && <span className="ajuda">Ainda não há ninguém na equipe. Cadastre na tela Equipe.</span>}</div>
        ) : (
          <div className="campo"><label htmlFor="l-quem">{ehEntrada ? 'Quem pagou' : 'Para quem foi o pagamento'} (opcional)</label>
            <input id="l-quem" value={quem} onChange={(e) => setQuem(e.target.value)} /></div>
        )}
        <div className="campo"><label htmlFor="l-desc">Descrição (opcional)</label>
          <input id="l-desc" placeholder="Ex.: entrada de 50%" value={desc} onChange={(e) => setDesc(e.target.value)} /></div>

        <div className="rodape-modal">
          <button type="button" className="btn claro" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn madeira">Salvar</button>
        </div>
      </form>
    </Modal>
  );
}
