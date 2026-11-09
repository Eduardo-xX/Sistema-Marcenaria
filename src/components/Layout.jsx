import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Wallet, Hammer, Users, FileBarChart, HelpCircle, Check, Plus } from 'lucide-react';
import { useStore } from '../data/store.jsx';
import LancamentoModal from './LancamentoModal.jsx';

const ITENS = [
  { to: '/', rot: 'Início', curto: 'Início', Icon: Home, end: true },
  { to: '/dinheiro', rot: 'Dinheiro (lançamentos)', curto: 'Dinheiro', Icon: Wallet },
  { to: '/servicos', rot: 'Serviços', curto: 'Serviços', Icon: Hammer },
  { to: '/equipe', rot: 'Equipe', curto: 'Equipe', Icon: Users },
  { to: '/relatorios', rot: 'Relatórios', curto: 'Relatórios', Icon: FileBarChart },
  { to: '/ajuda', rot: 'Ajuda', curto: 'Ajuda', Icon: HelpCircle },
];

function Marca() {
  return (
    <div className="marca">
      <div className="marca-h" aria-hidden="true">H</div>
      <div><b>Marcenaria Hernandes</b><small>Gestão</small></div>
    </div>
  );
}

export default function Layout() {
  const { aviso } = useStore();
  const [novo, setNovo] = useState(false);
  const cls = ({ isActive }) => `nav${isActive ? ' ativo' : ''}`;
  return (
    <>
      <div className="faixa">Protótipo de demonstração: os dados são de exemplo</div>
      <div className="app">
        <nav className="side" aria-label="Menu principal">
          <Marca />
          {ITENS.map(({ to, rot, Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={cls}><Icon size={20} aria-hidden="true" />{rot}</NavLink>
          ))}
        </nav>
        <main className="main">
          <div className="topo-mobile">
            <div className="marca" style={{ padding: 0 }}>
              <div className="marca-h" style={{ width: 36, height: 36, fontSize: '1.2rem' }} aria-hidden="true">H</div>
              <div><b style={{ color: 'var(--ink)' }}>Marcenaria Hernandes</b></div>
            </div>
            <NavLink to="/ajuda" className="btn claro pequeno"><HelpCircle size={18} aria-hidden="true" />Ajuda</NavLink>
          </div>
          <Outlet />
        </main>
        <nav className="bottom" aria-label="Menu principal (celular)">
          {ITENS.slice(0, 5).map(({ to, curto, Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'ativo' : '')}>
              <Icon size={22} aria-hidden="true" />{curto}
            </NavLink>
          ))}
        </nav>
      </div>
      <button className="btn madeira fab-novo nao-imprimir" onClick={() => setNovo(true)}>
        <Plus size={20} aria-hidden="true" />Novo lançamento
      </button>
      {novo && <LancamentoModal onClose={() => setNovo(false)} />}
      {aviso && <div className="toast" role="status" key={aviso.k}><Check size={18} aria-hidden="true" />{aviso.texto}</div>}
    </>
  );
}
