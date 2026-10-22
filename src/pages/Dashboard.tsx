import { useEffect, useState } from "react";
import { api, Indicadores } from "../services/api";

const rotulos: Record<string, string> = {
  ABERTA: "Abertas",
  EM_TRIAGEM: "Em triagem",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDA: "Concluídas",
  CANCELADA: "Canceladas",
};

export default function Dashboard() {
  const [dados, setDados] = useState<Indicadores | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    api.indicadores().then(setDados).catch((e) => setErro(e.message));
  }, []);

  if (erro) return <p role="alert" className="rounded bg-red-50 p-4 text-red-700">Não foi possível carregar os dados: {erro}. Verifique se a API está rodando (<code>npm run api</code>).</p>;
  if (!dados) return <p>Carregando…</p>;

  return (
    <div className="space-y-8">
      <section aria-labelledby="t-status">
        <h2 id="t-status" className="mb-3 text-xl font-semibold text-ufms">Situação das demandas</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {dados.porStatus.map((s) => (
            <div key={s.status} className="rounded-lg border bg-white p-4 shadow-sm">
              <p className="text-3xl font-bold text-ufms">{s.total}</p>
              <p className="text-sm text-slate-600">{rotulos[s.status] ?? s.status}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="t-proj">
        <h2 id="t-proj" className="mb-3 text-xl font-semibold text-ufms">Indicadores por projeto</h2>
        <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="p-3">Código</th>
                <th className="p-3">Projeto</th>
                <th className="p-3 text-center">Total</th>
                <th className="p-3 text-center">Concluídas</th>
                <th className="p-3 text-center">Em andamento</th>
                <th className="p-3 text-center">Abertas</th>
                <th className="p-3 text-center">Satisfação</th>
              </tr>
            </thead>
            <tbody>
              {dados.porProjeto.map((p) => (
                <tr key={p.codigo_sigproj} className="border-t">
                  <td className="p-3 font-mono text-xs">{p.codigo_sigproj}</td>
                  <td className="p-3">{p.titulo}</td>
                  <td className="p-3 text-center font-semibold">{p.total}</td>
                  <td className="p-3 text-center">{p.concluidas}</td>
                  <td className="p-3 text-center">{p.em_andamento}</td>
                  <td className="p-3 text-center">{p.abertas}</td>
                  <td className="p-3 text-center">{p.media_satisfacao ? `${p.media_satisfacao} ★` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
