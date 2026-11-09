import { useState } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import { useStore } from '../data/store.jsx';
import { PageHeader, Tag, ConfirmDialog } from '../components/ui.jsx';

export default function Ajuda() {
  const { restaurarExemplo, apagarTudo } = useStore();
  const [confirma, setConfirma] = useState(null);

  return (
    <>
      <PageHeader titulo="Ajuda" frase="Como usar o sistema em poucos passos." />
      <div className="grid-2">
        <section className="card">
          <h2>Como usar em 4 passos</h2>
          <ol className="passos">
            <li><span><b>Cadastre o serviço.</b> Em “Serviços”, clique em Novo serviço e coloque o cliente, o que foi vendido e o valor.</span></li>
            <li><span><b>Anote o dinheiro.</b> Toda vez que receber ou pagar algo, clique em “Novo lançamento”. Lançamento é só um nome para dinheiro que entrou ou saiu.</span></li>
            <li><span><b>Combine com a equipe.</b> Em “Equipe”, diga quanto cada pessoa vai receber em cada serviço.</span></li>
            <li><span><b>Olhe o Início.</b> Lá aparece quanto entrou, quanto saiu, quanto sobrou e quem ainda precisa receber ou ser pago.</span></li>
          </ol>
        </section>
        <section className="card">
          <h2>O que significam as cores</h2>
          <div className="legenda" style={{ marginBottom: 12 }}>
            <Tag tom="in">Verde: dinheiro que entrou</Tag>
            <Tag tom="out">Vermelho: dinheiro que saiu</Tag>
            <Tag tom="result">Azul: resultado, o que sobrou</Tag>
          </div>
          <p className="pequeno-txt">Além da cor, sempre há uma palavra ou um sinal (+ ou −) para ninguém depender só da cor.</p>
          <h2 style={{ marginTop: 18 }}>Dados de exemplo</h2>
          <p className="pequeno-txt" style={{ marginBottom: 12 }}>Tudo que você vê é de exemplo e fica salvo só neste computador. Pode mexer à vontade.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn claro" onClick={() => setConfirma('reset')}><RotateCcw size={18} />Voltar aos dados de exemplo</button>
            <button className="btn claro" onClick={() => setConfirma('clear')}><Trash2 size={18} />Apagar tudo e começar do zero</button>
          </div>
        </section>
      </div>
      <section className="card">
        <h2>Perguntas frequentes</h2>
        <details><summary>Os dados ficam seguros?</summary><p>Neste protótipo, os dados ficam só no navegador deste computador. Na versão final, ficariam guardados com cópia de segurança.</p></details>
        <details><summary>Preciso saber de computador?</summary><p>Não. Se você sabe usar o WhatsApp, sabe usar o sistema. Cada tela explica para que serve.</p></details>
        <details><summary>E se eu errar um valor?</summary><p>Na lista de dinheiro, clique no lápis para corrigir ou na lixeira para apagar.</p></details>
        <details><summary>Como tiro um relatório do mês?</summary><p>Na tela Relatórios, escolha o mês com as setas e clique em PDF (para ler e mandar) ou Excel (para o contador). O arquivo vai para a pasta de downloads.</p></details>
      </section>

      {confirma && (
        <ConfirmDialog
          titulo={confirma === 'reset' ? 'Voltar aos dados de exemplo?' : 'Apagar tudo?'}
          texto={confirma === 'reset' ? 'Tudo que você mexeu será substituído pelos dados de exemplo.' : 'Todos os serviços, lançamentos, equipe e contratos serão apagados. Não dá para desfazer.'}
          confirmar={confirma === 'reset' ? 'Sim, voltar' : 'Sim, apagar tudo'}
          onCancel={() => setConfirma(null)}
          onConfirm={() => { (confirma === 'reset' ? restaurarExemplo : apagarTudo)(); setConfirma(null); }} />
      )}
    </>
  );
}
