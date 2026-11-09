import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { nomeMes } from '../lib/format.js';
import { mesAnterior, mesProximo } from '../lib/calc.js';

export function KpiCard({ tom, Icon, rotulo, valor, dica }) {
  return (
    <div className={`kpi ${tom}`}>
      <div className="rot">{Icon && <Icon size={18} aria-hidden="true" />}{rotulo}</div>
      <div className="val">{valor}</div>
      {dica && <div className="dica">{dica}</div>}
    </div>
  );
}

export function MonthPicker({ mes, onChange }) {
  return (
    <div className="mes" role="group" aria-label="Escolher mês">
      <button className="btn claro icone pequeno" onClick={() => onChange(mesAnterior(mes))} aria-label="Mês anterior"><ChevronLeft size={20} /></button>
      <span aria-live="polite">{nomeMes(mes)}</span>
      <button className="btn claro icone pequeno" onClick={() => onChange(mesProximo(mes))} aria-label="Próximo mês"><ChevronRight size={20} /></button>
    </div>
  );
}

export function Chip({ ativo, children, onClick }) {
  return <button className="chip" aria-pressed={ativo} onClick={onClick}>{children}</button>;
}

export function EmptyState({ titulo, texto, children }) {
  return <div className="vazio"><b>{titulo}</b><p>{texto}</p>{children}</div>;
}

export function Tag({ tom = 'neutro', children, Icon }) {
  return <span className={`tag ${tom}`}>{Icon && <Icon size={13} aria-hidden="true" />}{children}</span>;
}

export function PageHeader({ titulo, frase, children }) {
  return (
    <div className="topo">
      <div><h1>{titulo}</h1><p>{frase}</p></div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
    </div>
  );
}

export function Modal({ titulo, onClose, children, largo }) {
  const ref = useRef(null);
  useEffect(() => {
    const anterior = document.activeElement;
    const el = ref.current;
    const foco = el?.querySelector('input,select,textarea,button:not([data-fechar])');
    (foco || el)?.focus();
    const tecla = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', tecla);
    return () => { document.removeEventListener('keydown', tecla); anterior?.focus?.(); };
  }, [onClose]);
  return (
    <div className="fundo" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={titulo} ref={ref} tabIndex={-1} style={largo ? { maxWidth: 760 } : null}>
        <div className="modal-cab">
          <h2>{titulo}</h2>
          <button className="btn claro icone pequeno" data-fechar onClick={onClose} aria-label="Fechar"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({ titulo, texto, confirmar = 'Sim, excluir', onConfirm, onCancel }) {
  return (
    <Modal titulo={titulo} onClose={onCancel}>
      <p style={{ marginBottom: 18 }}>{texto}</p>
      <div className="rodape-modal">
        <button className="btn claro" onClick={onCancel}>Não, voltar</button>
        <button className="btn perigo" onClick={onConfirm}>{confirmar}</button>
      </div>
    </Modal>
  );
}
