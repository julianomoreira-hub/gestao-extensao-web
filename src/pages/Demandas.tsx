import { useCallback, useEffect, useState } from "react";
import Badge from "../components/Badge";
import { api, Demanda, Opcao } from "../services/api";

const status = ["ABERTA", "EM_TRIAGEM", "EM_ANDAMENTO", "CONCLUIDA", "CANCELADA"];

export default function Demandas() {
  const [lista, setLista] = useState<Demanda[]>([]);
  const [bolsistas, setBolsistas] = useState<Opcao[]>([]);
  const [filtro, setFiltro] = useState("");
  const [editando, setEditando] = useState<Demanda | null>(null);
  const [erro, setErro] = useState("");

  const carregar = useCallback(() => {
    api.demandas().then(setLista).catch((e) => setErro(e.message));
  }, []);

  useEffect(() => {
    carregar();
    api.bolsistas().then(setBolsistas).catch(() => {});
  }, [carregar]);

  const visiveis = filtro ? lista.filter((d) => d.status_demanda === filtro) : lista;

  async function salvar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editando) return;
    const f = new FormData(e.currentTarget);
    const bols = f.get("bolsista");
    try {
      await api.triagem(editando.protocolo, {
        status_demanda: f.get("status"),
        id_bolsista_responsavel: bols ? Number(bols) : null,
        parecer_tecnico: f.get("parecer"),
      });
      setEditando(null);
      carregar();
    } catch (err) {
      setErro((err as Error).message);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-ufms">Demandas e triagem</h2>
        <label className="text-sm">
          Filtrar por status{" "}
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="rounded border px-2 py-1">
            <option value="">Todos</option>
            {status.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
        </label>
      </div>

      {erro && <p role="alert" className="mb-3 rounded bg-red-50 p-3 text-sm text-red-700">{erro}</p>}

      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="p-3">Protocolo</th>
              <th className="p-3">Assunto</th>
              <th className="p-3">Prioridade</th>
              <th className="p-3">Status</th>
              <th className="p-3">Bolsista</th>
              <th className="p-3"><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((d) => (
              <tr key={d.protocolo} className="border-t align-top">
                <td className="p-3 font-mono text-xs">{d.protocolo}</td>
                <td className="p-3">
                  <p className="font-medium">{d.titulo_demanda}</p>
                  <p className="text-xs text-slate-500">{d.nome_solicitante} · {d.area_tematica}</p>
                </td>
                <td className="p-3"><Badge valor={d.prioridade} /></td>
                <td className="p-3"><Badge valor={d.status_demanda} /></td>
                <td className="p-3">{d.bolsista_responsavel}</td>
                <td className="p-3">
                  <button onClick={() => setEditando(d)} className="rounded border border-ufms px-3 py-1 text-ufms hover:bg-ufms hover:text-white">
                    Triar
                  </button>
                </td>
              </tr>
            ))}
            {visiveis.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-slate-500">Nenhuma demanda encontrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editando && (
        <div role="dialog" aria-modal="true" aria-label="Triagem da demanda" className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={salvar} className="w-full max-w-md space-y-3 rounded-lg bg-white p-5 shadow-xl">
            <h3 className="font-semibold text-ufms">Triagem — {editando.protocolo}</h3>
            <label className="block text-sm">
              Novo status
              <select name="status" defaultValue={editando.status_demanda} className="mt-1 w-full rounded border px-2 py-2">
                {status.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </label>
            <label className="block text-sm">
              Bolsista responsável
              <select name="bolsista" defaultValue="" className="mt-1 w-full rounded border px-2 py-2">
                <option value="">Sem bolsista</option>
                {bolsistas.map((b) => <option key={b.id_usuario} value={b.id_usuario}>{b.nome_completo}</option>)}
              </select>
            </label>
            <label className="block text-sm">
              Parecer técnico
              <textarea name="parecer" required rows={3} className="mt-1 w-full rounded border px-2 py-2" />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditando(null)} className="rounded border px-4 py-2 text-sm">Cancelar</button>
              <button className="rounded bg-ufms px-4 py-2 text-sm font-semibold text-white">Salvar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

