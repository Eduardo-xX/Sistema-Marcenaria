import { useEffect, useRef, useState } from 'react';
import { Plus, FileText, PenLine, Printer, Eraser, ArrowLeft, CheckCircle2, Files } from 'lucide-react';
import { useStore } from '../data/store.jsx';
import { PageHeader, Modal, Tag, EmptyState } from '../components/ui.jsx';
import { moeda, dataBR, hoje } from '../lib/format.js';

const FORMAS = ['50% de entrada e 50% na entrega', 'Pagamento integral à vista', 'Entrada de 30% e 3 parcelas iguais'];

function Assinatura({ onChange }) {
  const ref = useRef(null);
  const desenhando = useRef(false);

  useEffect(() => {
    const cv = ref.current;
    const ratio = window.devicePixelRatio || 1;
    cv.width = cv.clientWidth * ratio;
    cv.height = cv.clientHeight * ratio;
    const ctx = cv.getContext('2d');
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.strokeStyle = '#131b25';
  }, []);

  const pos = (e) => { const r = ref.current.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const ini = (e) => { desenhando.current = true; ref.current.setPointerCapture(e.pointerId); const ctx = ref.current.getContext('2d'); ctx.beginPath(); ctx.moveTo(...pos(e)); };
  const mov = (e) => { if (!desenhando.current) return; const ctx = ref.current.getContext('2d'); ctx.lineTo(...pos(e)); ctx.stroke(); };
  const fim = () => { if (!desenhando.current) return; desenhando.current = false; onChange(ref.current.toDataURL('image/png')); };
  const limpar = () => { const cv = ref.current; cv.getContext('2d').clearRect(0, 0, cv.width, cv.height); onChange(null); };

  return (
    <div>
      <canvas ref={ref} className="canvas-ass" onPointerDown={ini} onPointerMove={mov} onPointerUp={fim} onPointerLeave={fim}
        aria-label="Quadro para desenhar a assinatura com o dedo ou o mouse" />
      <button type="button" className="btn claro pequeno" style={{ marginTop: 8 }} onClick={limpar}><Eraser size={16} />Limpar</button>
    </div>
  );
}

function Documento({ servico, contrato, assinatura }) {
  const paginas = [
    { t: 'Contrato de prestação de serviços de marcenaria', c: (
      <>
        <p><b>CONTRATADO:</b> Marcenaria Hernandes, Mauá/SP.</p>
        <p><b>CONTRATANTE:</b> {servico.cliente}.</p>
        <p><b>Cláusula 1ª · Do objeto.</b> O contratado fará o seguinte serviço: <b>{servico.descricao}</b>, conforme combinado entre as partes.</p>
        <p>Data do contrato: {dataBR(hoje())}.</p>
      </>) },
    { t: 'Valor e forma de pagamento', c: (
      <>
        <p><b>Cláusula 2ª · Do valor.</b> O valor total do serviço é de <b>{moeda(servico.valor)}</b>.</p>
        <p><b>Cláusula 3ª · Do pagamento.</b> {contrato.pagamento}.</p>
        <p><b>Cláusula 4ª · Do prazo.</b> O prazo de entrega será combinado por escrito entre as partes, a partir do pagamento da entrada.</p>
      </>) },
    { t: 'Garantia e disposições finais', c: (
      <>
        <p><b>Cláusula 5ª · Da garantia.</b> O contratado garante o serviço contra defeitos de fabricação e instalação, nas condições combinadas entre as partes.</p>
        <p><b>Cláusula 6ª · Das alterações.</b> Qualquer mudança no serviço deve ser combinada por escrito e pode alterar valor e prazo.</p>
        <p><b>Cláusula 7ª · Do foro.</b> As partes elegem o foro da comarca de Mauá/SP.</p>
      </>) },
  ];
  return (
    <div className="doc" id="documento-contrato">
      {paginas.map((p, i) => (
        <section className="pagina" key={p.t} aria-label={`Página ${i + 1} de ${paginas.length}`}>
          <span className="pag-num">Página {i + 1} de {paginas.length}</span>
          <div><h3>{p.t}</h3>{p.c}</div>
          <div className="assin-rodape">
            <div><div className="campo-ass">{assinatura && <img src={assinatura} alt="Assinatura do contratado" />}</div>Contratado</div>
            <div><div className="campo-ass">{assinatura && <img src={assinatura} alt="Assinatura do contratante" />}</div>Contratante</div>
          </div>
        </section>
      ))}
    </div>
  );
}

function Visualizar({ contrato, onVoltar }) {
  const { servicos, atualizar } = useStore();
  const servico = servicos.find((s) => s.id === contrato.servicoId);
  const [rascunho, setRascunho] = useState(null);
  const assinado = contrato.status === 'Assinado';
  const assin = contrato.assinatura || rascunho;
  if (!servico) return null;

  function assinar() {
    atualizar('contratos', contrato.id, { status: 'Assinado', assinatura: rascunho }, 'Todas as páginas foram assinadas de uma vez.');
  }

  return (
    <>
      <div className="nao-imprimir">
        <button className="btn claro pequeno" onClick={onVoltar} style={{ marginBottom: 14 }}><ArrowLeft size={16} />Voltar à lista</button>
        <PageHeader titulo={`Contrato · Serviço ${String(servico.id).padStart(3, '0')}`} frase={`${servico.cliente} · ${servico.descricao}`}>
          <Tag tom={assinado ? 'in' : 'madeira'} Icon={assinado ? CheckCircle2 : PenLine}>{contrato.status}</Tag>
        </PageHeader>
        <div className="aviso-juridico" role="note">Este é um <b>modelo de demonstração</b> e não é texto jurídico. Para ter validade de verdade, é preciso um serviço de assinatura eletrônica com registro.</div>
      </div>
      <div className="contrato-wrap">
        <Documento servico={servico} contrato={contrato} assinatura={assin} />
        <aside className="card nao-imprimir">
          <div className="destaque"><Files size={20} aria-hidden="true" />Todas as páginas em um único arquivo</div>
          {!assinado ? (
            <>
              <h2>Assine uma vez só</h2>
              <p className="pequeno-txt" style={{ margin: '4px 0 10px' }}>Desenhe sua assinatura abaixo. Ela vale para as 3 páginas.</p>
              <Assinatura onChange={setRascunho} />
              <button className="btn madeira" style={{ width: '100%', marginTop: 14 }} disabled={!rascunho} onClick={assinar}>
                <PenLine size={18} />Assinar todas as páginas
              </button>
              {!rascunho && <p className="pequeno-txt" style={{ marginTop: 6 }}>Desenhe a assinatura para liberar o botão.</p>}
            </>
          ) : (
            <p><CheckCircle2 size={16} style={{ verticalAlign: -3, color: 'var(--in)' }} /> Contrato assinado nas 3 páginas.</p>
          )}
          <button className="btn" style={{ width: '100%', marginTop: 14 }} onClick={() => window.print()}>
            <Printer size={18} />Baixar PDF único
          </button>
          <p className="pequeno-txt" style={{ marginTop: 6 }}>Na janela que abrir, escolha “Salvar como PDF”.</p>
        </aside>
      </div>
    </>
  );
}

function NovoContrato({ onClose }) {
  const { servicos, contratos, adicionar } = useStore();
  const [serv, setServ] = useState('');
  const [forma, setForma] = useState(FORMAS[0]);
  const [erro, setErro] = useState('');
  function criar(e) {
    e.preventDefault();
    if (!serv) { setErro('Escolha o serviço do contrato.'); return; }
    adicionar('contratos', { servicoId: Number(serv), status: 'Aguardando assinatura', pagamento: forma, assinatura: null }, 'Contrato criado.');
    onClose();
  }
  const disponiveis = servicos.filter((s) => !contratos.some((c) => c.servicoId === s.id));
  return (
    <Modal titulo="Novo contrato" onClose={onClose}>
      <form onSubmit={criar} noValidate>
        {erro && <div className="caixa-erro" role="alert">{erro}</div>}
        <div className="campo"><label htmlFor="nc-s">Serviço</label>
          <select id="nc-s" value={serv} onChange={(e) => setServ(e.target.value)}>
            <option value="">Escolha…</option>
            {disponiveis.map((s) => <option key={s.id} value={s.id}>Nº {s.id} · {s.cliente} · {s.descricao} · {moeda(s.valor)}</option>)}
          </select>
          {disponiveis.length === 0 && <span className="ajuda">Todos os serviços já têm contrato.</span>}</div>
        <div className="campo"><label htmlFor="nc-f">Forma de pagamento</label>
          <select id="nc-f" value={forma} onChange={(e) => setForma(e.target.value)}>{FORMAS.map((f) => <option key={f}>{f}</option>)}</select></div>
        <div className="rodape-modal">
          <button type="button" className="btn claro" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn madeira">Criar contrato</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Contratos() {
  const { contratos, servicos } = useStore();
  const [aberto, setAberto] = useState(null);
  const [novo, setNovo] = useState(false);
  const atual = aberto && contratos.find((c) => c.id === aberto);

  if (atual) return <Visualizar contrato={atual} onVoltar={() => setAberto(null)} />;

  return (
    <>
      <PageHeader titulo="Contratos" frase="Gere o contrato de um serviço e assine todas as páginas de uma vez, em um único arquivo.">
        <button className="btn" onClick={() => setNovo(true)}><Plus size={18} />Novo contrato</button>
      </PageHeader>
      <div className="aviso-juridico" role="note">Tela de demonstração: o texto é um modelo e <b>não é texto jurídico</b>.</div>
      {contratos.length === 0 && <div className="card"><EmptyState titulo="Nenhum contrato ainda" texto="Clique em Novo contrato e escolha um serviço." /></div>}
      <div className="c-lista">
        {contratos.map((c) => {
          const s = servicos.find((x) => x.id === c.servicoId);
          return (
            <div className="c-item" key={c.id}>
              <span><b>Serviço {String(c.servicoId).padStart(3, '0')}</b> · {s?.cliente} <span className="pequeno-txt">· {s?.descricao}</span></span>
              <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Tag tom={c.status === 'Assinado' ? 'in' : 'madeira'} Icon={c.status === 'Assinado' ? CheckCircle2 : PenLine}>{c.status}</Tag>
                <button className="btn claro pequeno" onClick={() => setAberto(c.id)}><FileText size={16} />Abrir</button>
              </span>
            </div>
          );
        })}
      </div>
      {novo && <NovoContrato onClose={() => setNovo(false)} />}
    </>
  );
}
