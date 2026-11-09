import { useState } from 'react';
import { Plus, Pencil, Trash2, HandCoins } from 'lucide-react';
import { useStore } from '../data/store.jsx';
import { MES_PADRAO, TIPOS_PAGAMENTO } from '../data/seed.js';
import { PageHeader, EmptyState, Modal, ConfirmDialog, Tag, MonthPicker } from '../components/ui.jsx';
import { moeda, percentual, paraNumero } from '../lib/format.js';
import { detalheCombinado, pagoAoFuncionario } from '../lib/calc.js';

function PessoaForm({ pessoa, onClose }) {
  const { adicionar, atualizar } = useStore();
  const [nome, setNome] = useState(pessoa?.nome || '');
  const [tipo, setTipo] = useState(pessoa?.tipo || 'Diária');
  const [diaria, setDiaria] = useState(pessoa?.diaria != null ? String(pessoa.diaria) : '');
  const [pct, setPct] = useState(pessoa?.pct != null ? String(pessoa.pct * 100) : '');
  const [erros, setErros] = useState([]);

  function salvar(e) {
    e.preventDefault();
    const lista = [];
    if (!nome.trim()) lista.push('Digite o nome da pessoa.');
    if (tipo === 'Diária' && !(paraNumero(diaria) > 0)) lista.push('Digite quanto vale a diária.');
    if (tipo === 'Percentual' && !(paraNumero(pct) > 0 && paraNumero(pct) <= 100)) lista.push('Digite a porcentagem, de 1 a 100.');
    if (lista.length) { setErros(lista); return; }
    const item = {
      nome: nome.trim(), tipo,
      diaria: tipo === 'Diária' ? paraNumero(diaria) : null,
      pct: tipo === 'Percentual' ? paraNumero(pct) / 100 : null,
    };
    if (pessoa) atualizar('equipe', pessoa.id, item, 'Pessoa atualizada.');
    else adicionar('equipe', item, 'Pessoa adicionada.');
    onClose();
  }

  return (
    <Modal titulo={pessoa ? 'Editar pessoa' : 'Adicionar pessoa'} onClose={onClose}>
      <form onSubmit={salvar} noValidate>
        {erros.length > 0 && <div className="caixa-erro" role="alert">{erros.map((m) => <div key={m}>{m}</div>)}</div>}
        <div className="campo"><label htmlFor="p-nome">Nome</label><input id="p-nome" value={nome} onChange={(e) => setNome(e.target.value)} /></div>
        <div className="campo"><label htmlFor="p-tipo">Como essa pessoa recebe</label>
          <select id="p-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="Diária">Por dia trabalhado (diária)</option>
            <option value="Por obra">Um valor fechado por obra</option>
            <option value="Percentual">Uma porcentagem do serviço</option>
          </select></div>
        {tipo === 'Diária' && <div className="campo"><label htmlFor="p-d">Valor da diária (R$)</label><input id="p-d" inputMode="decimal" value={diaria} onChange={(e) => setDiaria(e.target.value)} /></div>}
        {tipo === 'Percentual' && <div className="campo"><label htmlFor="p-pct">Porcentagem (%)</label><input id="p-pct" inputMode="decimal" value={pct} onChange={(e) => setPct(e.target.value)} placeholder="20" /></div>}
        <div className="rodape-modal">
          <button type="button" className="btn claro" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn madeira">Salvar</button>
        </div>
      </form>
    </Modal>
  );
}

function CombinadoForm({ combinado, funcionarioId, onClose }) {
  const { equipe, servicos, adicionar, atualizar } = useStore();
  const [func, setFunc] = useState(String(combinado?.funcionarioId || funcionarioId || ''));
  const [serv, setServ] = useState(String(combinado?.servicoId || ''));
  const [modo, setModo] = useState(combinado?.pct != null ? 'pct' : 'fixo');
  const [valor, setValor] = useState(combinado ? String(combinado.pct != null ? combinado.pct * 100 : combinado.fixo ?? '') : '');
  const [erros, setErros] = useState([]);

  function salvar(e) {
    e.preventDefault();
    const lista = [];
    const n = paraNumero(valor);
    if (!func) lista.push('Escolha a pessoa.');
    if (!serv) lista.push('Escolha o serviço.');
    if (!(n > 0)) lista.push(modo === 'pct' ? 'Digite a porcentagem combinada.' : 'Digite o valor combinado.');
    if (!combinado && func && serv && equipe.length) {
      // evita combinado duplicado
    }
    if (lista.length) { setErros(lista); return; }
    const item = { servicoId: Number(serv), funcionarioId: Number(func), pct: modo === 'pct' ? n / 100 : null, fixo: modo === 'fixo' ? n : null };
    if (combinado) atualizar('combinados', combinado.id, item, 'Combinado atualizado.');
    else adicionar('combinados', item, 'Combinado salvo.');
    onClose();
  }

  return (
    <Modal titulo={combinado ? 'Editar combinado' : 'Combinar pagamento'} onClose={onClose}>
      <form onSubmit={salvar} noValidate>
        {erros.length > 0 && <div className="caixa-erro" role="alert">{erros.map((m) => <div key={m}>{m}</div>)}</div>}
        <div className="campo"><label htmlFor="c-f">Pessoa</label>
          <select id="c-f" value={func} onChange={(e) => setFunc(e.target.value)}>
            <option value="">Escolha…</option>{equipe.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select></div>
        <div className="campo"><label htmlFor="c-s">Serviço</label>
          <select id="c-s" value={serv} onChange={(e) => setServ(e.target.value)}>
            <option value="">Escolha…</option>{servicos.map((s) => <option key={s.id} value={s.id}>Nº {s.id} · {s.cliente} · {s.descricao}</option>)}
          </select></div>
        <div className="campo"><label htmlFor="c-m">Como foi combinado</label>
          <select id="c-m" value={modo} onChange={(e) => setModo(e.target.value)}>
            <option value="fixo">Um valor fechado (R$)</option>
            <option value="pct">Uma porcentagem do serviço (%)</option>
          </select></div>
        <div className="campo"><label htmlFor="c-v">{modo === 'pct' ? 'Porcentagem (%)' : 'Valor combinado (R$)'}</label>
          <input id="c-v" inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} /></div>
        <div className="rodape-modal">
          <button type="button" className="btn claro" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn madeira">Salvar</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Equipe() {
  const { equipe, combinados, servicos, lancamentos, remover } = useStore();
  const [mes, setMes] = useState(MES_PADRAO);
  const [pessoaForm, setPessoaForm] = useState(null);
  const [combForm, setCombForm] = useState(null);
  const [excluir, setExcluir] = useState(null); // { tipo, item }

  const comoRecebe = (f) => (f.tipo === 'Diária' ? `Diária de ${moeda(f.diaria)}` : f.tipo === 'Percentual' ? `${percentual(f.pct)} de cada serviço` : 'Valor fechado por obra');

  return (
    <>
      <PageHeader titulo="Equipe" frase="Quem trabalha com você, quanto cada um já recebeu e quanto ainda falta pagar.">
        <MonthPicker mes={mes} onChange={setMes} />
        <button className="btn" onClick={() => setPessoaForm('novo')}><Plus size={18} />Adicionar pessoa</button>
        <button className="btn claro" onClick={() => setCombForm('novo')} disabled={equipe.length === 0}><HandCoins size={18} />Combinar pagamento</button>
      </PageHeader>

      {equipe.length === 0 && <div className="card"><EmptyState titulo="Ninguém na equipe ainda" texto="Clique em Adicionar pessoa para cadastrar o primeiro funcionário." /></div>}

      <div className="grid-eq">
        {equipe.map((f) => {
          const meus = combinados.filter((c) => c.funcionarioId === f.id).map((c) => detalheCombinado(c, servicos, lancamentos));
          const falta = meus.filter((d) => d.falta > 0).reduce((t, d) => t + d.falta, 0);
          return (
            <section className="card" key={f.id} aria-label={f.nome}>
              <div className="pessoa-cab">
                <div><h2 style={{ marginBottom: 2 }}>{f.nome}</h2><span className="pequeno-txt">{comoRecebe(f)}</span></div>
                <span className="acoes">
                  <button className="btn claro icone pequeno" onClick={() => setPessoaForm(f)} aria-label={`Editar ${f.nome}`}><Pencil size={17} /></button>
                  <button className="btn claro icone pequeno" onClick={() => setExcluir({ tipo: 'equipe', item: f })} aria-label={`Excluir ${f.nome}`}><Trash2 size={17} /></button>
                </span>
              </div>
              <div className="nums">
                <div><small>Recebeu no mês</small><b style={{ color: 'var(--out)' }}>{moeda(pagoAoFuncionario(f.id, lancamentos, mes))}</b></div>
                <div><small>Falta pagar</small><b style={{ color: falta > 0 ? 'var(--out)' : 'var(--in)' }}>{moeda(falta)}</b></div>
              </div>
              <h3 style={{ fontSize: '1rem', margin: '4px 0' }}>Combinados por serviço</h3>
              {meus.length === 0 && <p className="pequeno-txt">Nenhum combinado ainda.</p>}
              {meus.map((d) => (
                <div className="comb" key={d.id}>
                  <span><b>Nº {d.servicoId}</b> · {d.servico?.cliente || '—'}</span>
                  <Tag tom={d.falta > 0 ? 'out' : 'in'}>{d.falta > 0 ? 'Falta pagar' : 'Pago'}</Tag>
                  <span className="sub">Combinado {moeda(d.combinado)} · pago {moeda(d.pago)}{d.falta > 0 ? ` · falta ${moeda(d.falta)}` : ''}</span>
                  <span className="acoes">
                    <button className="btn claro icone pequeno" onClick={() => setCombForm(d)} aria-label="Editar combinado"><Pencil size={15} /></button>
                    <button className="btn claro icone pequeno" onClick={() => setExcluir({ tipo: 'combinados', item: d })} aria-label="Excluir combinado"><Trash2 size={15} /></button>
                  </span>
                </div>
              ))}
              <button className="btn claro pequeno" style={{ marginTop: 10 }} onClick={() => setCombForm({ novoPara: f.id })}><Plus size={16} />Combinar pagamento</button>
            </section>
          );
        })}
      </div>

      {pessoaForm && <PessoaForm pessoa={pessoaForm === 'novo' ? null : pessoaForm} onClose={() => setPessoaForm(null)} />}
      {combForm && (
        <CombinadoForm combinado={combForm === 'novo' || combForm.novoPara ? null : combForm}
          funcionarioId={combForm.novoPara} onClose={() => setCombForm(null)} />
      )}
      {excluir && (
        <ConfirmDialog titulo={excluir.tipo === 'equipe' ? 'Excluir esta pessoa?' : 'Excluir este combinado?'}
          texto={excluir.tipo === 'equipe'
            ? `${excluir.item.nome} e os combinados dela serão apagados. Os pagamentos já lançados continuam na lista de dinheiro.`
            : 'O combinado será apagado. Os pagamentos já lançados continuam.'}
          onCancel={() => setExcluir(null)}
          onConfirm={() => { remover(excluir.tipo, excluir.item.id, 'Excluído.'); setExcluir(null); }} />
      )}
    </>
  );
}
