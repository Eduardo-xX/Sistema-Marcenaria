import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownCircle, ArrowUpCircle, Scale, Users, UserCheck, Percent } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { useStore } from '../data/store.jsx';
import { MES_PADRAO } from '../data/seed.js';
import { KpiCard, MonthPicker, PageHeader, EmptyState } from '../components/ui.jsx';
import { moeda, percentual, nomeMes } from '../lib/format.js';
import * as c from '../lib/calc.js';

export default function Painel() {
  const { lancamentos, servicos, combinados, equipe } = useStore();
  const [mes, setMes] = useState(MES_PADRAO);

  const t = c.totaisMes(lancamentos, mes);
  const devem = c.clientesDevem(servicos, lancamentos);
  const faltaEquipe = c.faltaPagarEquipe(combinados, servicos, lancamentos);
  const margem = c.margemServicos(servicos, lancamentos);

  const seis = c.ultimosMeses(lancamentos, mes).map((m) => ({ ...m, nome: nomeMes(m.mes, true) }));
  const pizza = [
    { nome: 'Mão de obra', valor: t.maoDeObra, cor: '#B93A32' },
    { nome: 'Material', valor: t.material, cor: '#b07a45' },
    { nome: 'Outros gastos', valor: t.outros, cor: '#5d6672' },
  ].filter((p) => p.valor > 0);
  const porServico = [...servicos].filter((s) => s.situacao !== 'Cancelado').sort((a, b) => b.id - a.id).slice(0, 8).reverse().map((s) => {
    const r = c.resumoServico(s, lancamentos);
    return { nome: `Nº ${s.id}`, Valor: s.valor, Gastos: r.gastos, Sobrou: Math.max(0, r.sobrou) };
  });

  const devendo = servicos.map((s) => ({ s, r: c.resumoServico(s, lancamentos) })).filter((x) => x.s.situacao !== 'Cancelado' && x.r.faltaReceber > 0);
  const faltando = combinados.map((cb) => c.detalheCombinado(cb, servicos, lancamentos)).filter((d) => d.falta > 0);
  const nomeFunc = (id) => equipe.find((f) => f.id === id)?.nome || 'Pessoa removida';

  return (
    <>
      <PageHeader titulo="Início" frase="Veja de relance como está o dinheiro da marcenaria neste mês.">
        <MonthPicker mes={mes} onChange={setMes} />
      </PageHeader>

      <div className="grid-kpi">
        <KpiCard tom="in" Icon={ArrowDownCircle} rotulo="Entrou no mês" valor={moeda(t.entrou)} dica="Dinheiro recebido dos clientes" />
        <KpiCard tom="out" Icon={ArrowUpCircle} rotulo="Saiu no mês" valor={moeda(t.saiu)} dica="Equipe, material e outros gastos" />
        <KpiCard tom={t.saldo < 0 ? 'out' : 'result'} Icon={Scale} rotulo="Saldo do mês" valor={moeda(t.saldo)} dica={t.saldo < 0 ? 'Saiu mais do que entrou' : 'O que entrou menos o que saiu'} />
        <KpiCard tom="in" Icon={Users} rotulo="Clientes ainda devem" valor={moeda(devem)} dica="Falta receber dos serviços" />
        <KpiCard tom="out" Icon={UserCheck} rotulo="Falta pagar à equipe" valor={moeda(faltaEquipe)} dica="Combinado que ainda não foi pago" />
        <KpiCard tom="result" Icon={Percent} rotulo="Margem dos serviços" valor={percentual(margem)} dica="De cada R$ 100 vendidos, quanto sobra" />
      </div>

      <div className="grid-2">
        <section className="card" aria-label="Entrou e saiu nos últimos 6 meses">
          <h2>Entrou x saiu nos últimos 6 meses</h2>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seis}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0d7c8" vertical={false} />
                <XAxis dataKey="nome" tick={{ fontSize: 13 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v / 1000}k`} width={40} />
                <Tooltip formatter={(v) => moeda(v)} />
                <Legend />
                <Bar dataKey="entrou" name="Entrou" fill="#2E7D4F" radius={[4, 4, 0, 0]} />
                <Bar dataKey="saiu" name="Saiu" fill="#B93A32" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card" aria-label="Para onde foi o dinheiro">
          <h2>Para onde foi o dinheiro neste mês</h2>
          {pizza.length === 0 ? (
            <EmptyState titulo="Nada saiu neste mês" texto="Quando você lançar gastos, eles aparecem aqui." />
          ) : (
            <div className="chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pizza} dataKey="valor" nameKey="nome" innerRadius={55} outerRadius={90} paddingAngle={2}
                    label={({ nome, percent }) => `${nome} ${Math.round(percent * 100)}%`}>
                    {pizza.map((p) => <Cell key={p.nome} fill={p.cor} />)}
                  </Pie>
                  <Tooltip formatter={(v) => moeda(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      <section className="card" style={{ marginBottom: 14 }} aria-label="Quanto sobrou de cada serviço">
        <h2>Quanto sobrou de cada serviço</h2>
        <div className="chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={porServico}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0d7c8" vertical={false} />
              <XAxis dataKey="nome" tick={{ fontSize: 13 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v / 1000}k`} width={40} />
              <Tooltip formatter={(v) => moeda(v)} />
              <Legend />
              <Bar dataKey="Valor" fill="#2F5F98" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Gastos" fill="#B93A32" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Sobrou" fill="#2E7D4F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card" aria-label="Precisa de atenção">
        <h2>Precisa de atenção</h2>
        <div className="grid-2" style={{ marginBottom: 0 }}>
          <div>
            <h3 style={{ marginBottom: 6 }}>Clientes que ainda devem</h3>
            {devendo.length === 0 ? <p className="pequeno-txt">Nenhum cliente devendo. 👍</p> : (
              <ul className="atencao">
                {devendo.map(({ s, r }) => (
                  <li key={s.id}><span>Nº {s.id} · {s.cliente}</span><Link to="/servicos"><b style={{ color: 'var(--in)' }}>{moeda(r.faltaReceber)}</b></Link></li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 style={{ marginBottom: 6 }}>Falta pagar à equipe</h3>
            {faltando.length === 0 ? <p className="pequeno-txt">Equipe em dia. 👍</p> : (
              <ul className="atencao">
                {faltando.map((d) => (
                  <li key={d.id}><span>{nomeFunc(d.funcionarioId)} · serviço Nº {d.servicoId}</span><Link to="/equipe"><b style={{ color: 'var(--out)' }}>{moeda(d.falta)}</b></Link></li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
