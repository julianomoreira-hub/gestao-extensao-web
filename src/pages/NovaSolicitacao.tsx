import { FormEvent, useEffect, useState } from "react";
import { api, Opcao, Projeto } from "../services/api";

const campo = "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-ufms-claro focus:outline-none focus:ring-2 focus:ring-ufms-claro/30";

export default function NovaSolicitacao() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [solicitantes, setSolicitantes] = useState<Opcao[]>([]);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  useEffect(() => {
    api.projetos().then(setProjetos).catch(() => {});
    api.solicitantes().then(setSolicitantes).catch(() => {});
  }, []);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    try {
      const r = await api.criarDemanda({
        id_projeto: Number(f.get("id_projeto")),
        id_solicitante: Number(f.get("id_solicitante")),
        titulo_demanda: f.get("titulo_demanda"),
        descricao_solic: f.get("descricao_solic"),
        prioridade: f.get("prioridade"),
      });
      setMsg({ tipo: "ok", texto: `Solicitação registrada! Protocolo: ${r.protocolo}` });
      form.reset();
    } catch (err) {
      setMsg({ tipo: "erro", texto: (err as Error).message });
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="mb-4 text-xl font-semibold text-ufms">Nova solicitação de atendimento</h2>
      <form onSubmit={enviar} className="space-y-4 rounded-lg border bg-white p-5 shadow-sm">
        <label className="block text-sm font-medium">
          Solicitante
          <select name="id_solicitante" required className={campo} defaultValue="">
            <option value="" disabled>Selecione…</option>
            {solicitantes.map((s) => <option key={s.id_usuario} value={s.id_usuario}>{s.nome_completo}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Projeto de extensão
          <select name="id_projeto" required className={campo} defaultValue="">
            <option value="" disabled>Selecione…</option>
            {projetos.map((p) => <option key={p.id_projeto} value={p.id_projeto}>{p.codigo_sigproj} — {p.titulo}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Assunto
          <input name="titulo_demanda" required maxLength={140} className={campo} />
        </label>
        <label className="block text-sm font-medium">
          Descrição da necessidade
          <textarea name="descricao_solic" required rows={4} className={campo} />
        </label>
        <label className="block text-sm font-medium">
          Prioridade
          <select name="prioridade" className={campo} defaultValue="MEDIA">
            <option value="BAIXA">Baixa</option>
            <option value="MEDIA">Média</option>
            <option value="ALTA">Alta</option>
            <option value="URGENTE">Urgente</option>
          </select>
        </label>
        <button className="w-full rounded-md bg-ufms px-4 py-2 font-semibold text-white hover:bg-ufms-claro sm:w-auto">
          Enviar solicitação
        </button>
        {msg && (
          <p role="status" className={`rounded p-3 text-sm ${msg.tipo === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>
            {msg.texto}
          </p>
        )}
      </form>
    </div>
  );
}

