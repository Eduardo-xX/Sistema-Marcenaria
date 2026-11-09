import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './data/store.jsx';
import Layout from './components/Layout.jsx';
import Painel from './pages/Painel.jsx';
import Lancamentos from './pages/Lancamentos.jsx';
import Servicos from './pages/Servicos.jsx';
import Equipe from './pages/Equipe.jsx';
import Relatorios from './pages/Relatorios.jsx';
import Ajuda from './pages/Ajuda.jsx';

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Painel />} />
            <Route path="dinheiro" element={<Lancamentos />} />
            <Route path="servicos" element={<Servicos />} />
            <Route path="equipe" element={<Equipe />} />
            <Route path="relatorios" element={<Relatorios />} />
            <Route path="ajuda" element={<Ajuda />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
}
