// Único ponto de leitura/escrita de dados. Para trocar por um banco (ex.: Supabase),
// basta reimplementar este módulo mantendo a mesma interface do useStore().
import { createContext, useContext, useEffect, useMemo, useReducer, useState, useCallback } from 'react';
import { criarSeed } from './seed.js';

const CHAVE = 'mh-sistema-v1';
const VAZIO = { equipe: [], servicos: [], lancamentos: [], combinados: [], contratos: [] };

function carregar() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto) return { ...VAZIO, ...JSON.parse(bruto) };
  } catch (e) { /* ignora */ }
  return criarSeed();
}

const proximoId = (lista) => lista.reduce((m, x) => Math.max(m, x.id), 0) + 1;

const COLECOES = ['equipe', 'servicos', 'lancamentos', 'combinados', 'contratos'];

function reducer(state, a) {
  switch (a.type) {
    case 'add':
      return { ...state, [a.col]: [...state[a.col], { id: a.id ?? proximoId(state[a.col]), ...a.item }] };
    case 'update':
      return { ...state, [a.col]: state[a.col].map((x) => (x.id === a.id ? { ...x, ...a.item } : x)) };
    case 'remove': {
      const next = { ...state, [a.col]: state[a.col].filter((x) => x.id !== a.id) };
      if (a.col === 'servicos') {
        next.combinados = next.combinados.filter((c) => c.servicoId !== a.id);
        next.contratos = next.contratos.filter((c) => c.servicoId !== a.id);
        next.lancamentos = next.lancamentos.map((l) => (l.servicoId === a.id ? { ...l, servicoId: null } : l));
      }
      if (a.col === 'equipe') {
        next.combinados = next.combinados.filter((c) => c.funcionarioId !== a.id);
        next.lancamentos = next.lancamentos.map((l) => (l.funcionarioId === a.id ? { ...l, funcionarioId: null } : l));
      }
      return next;
    }
    case 'reset':
      return criarSeed();
    case 'clear':
      return { ...VAZIO };
    default:
      return state;
  }
}

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, carregar);
  const [aviso, setAviso] = useState(null);

  useEffect(() => {
    try { localStorage.setItem(CHAVE, JSON.stringify(state)); } catch (e) { /* ignora */ }
  }, [state]);

  const avisar = useCallback((texto) => {
    setAviso({ texto, k: Date.now() });
  }, []);

  useEffect(() => {
    if (!aviso) return undefined;
    const t = setTimeout(() => setAviso(null), 2800);
    return () => clearTimeout(t);
  }, [aviso]);

  const api = useMemo(() => {
    const base = { ...state, aviso, avisar };
    base.adicionar = (col, item, msg) => { dispatch({ type: 'add', col, item }); if (msg) avisar(msg); };
    base.atualizar = (col, id, item, msg) => { dispatch({ type: 'update', col, id, item }); if (msg) avisar(msg); };
    base.remover = (col, id, msg) => { dispatch({ type: 'remove', col, id }); if (msg) avisar(msg); };
    base.adicionarServico = (item, msg) => { dispatch({ type: 'add', col: 'servicos', item, id: item.id }); if (msg) avisar(msg); };
    base.restaurarExemplo = () => { dispatch({ type: 'reset' }); avisar('Dados de exemplo restaurados.'); };
    base.apagarTudo = () => { dispatch({ type: 'clear' }); avisar('Tudo apagado. Pode começar do zero.'); };
    base.proximoNumeroServico = () => proximoId(state.servicos);
    return base;
  }, [state, aviso, avisar]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);
export { COLECOES };
