export interface Demanda {
  id_demanda: number;
  protocolo: string;
  titulo_demanda: string;
  prioridade: "BAIXA" | "MEDIA" | "ALTA" | "URGENTE";
  status_demanda: "ABERTA" | "EM_TRIAGEM" | "EM_ANDAMENTO" | "CONCLUIDA" | "CANCELADA";
  codigo_sigproj: string;
  projeto_extensao: string;
  area_tematica: string;
  nome_solicitante: string;
  bolsista_responsavel: string;
  coordenador_projeto: string;
  data_abertura: string;
  data_conclusao: string | null;
  nota_satisfacao: number | null;
}

export interface Opcao { id_usuario: number; nome_completo: string }
export interface Projeto { id_projeto: number; codigo_sigproj: string; titulo: string }
export interface Indicadores {
  porProjeto: { codigo_sigproj: string; titulo: string; total: number; concluidas: number; em_andamento: number; abertas: number; media_satisfacao: number | null }[];
  porStatus: { status: string; total: number }[];
}

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, { headers: { "Content-Type": "application/json" }, ...init });
  const texto = await r.text();
  if (!texto) throw new Error("A API não respondeu");
  const data = JSON.parse(texto);
  if (!r.ok) throw new Error(data.erro || "Erro na requisição");
  return data as T;
}

export const api = {
  demandas: () => req<Demanda[]>("/api/demandas"),
  projetos: () => req<Projeto[]>("/api/projetos"),
  bolsistas: () => req<Opcao[]>("/api/bolsistas"),
  solicitantes: () => req<Opcao[]>("/api/solicitantes"),
  indicadores: () => req<Indicadores>("/api/indicadores"),
  criarDemanda: (body: object) => req<{ protocolo: string }>("/api/demandas", { method: "POST", body: JSON.stringify(body) }),
  triagem: (protocolo: string, body: object) =>
    req<{ ok: boolean }>(`/api/demandas/${protocolo}/triagem`, { method: "PATCH", body: JSON.stringify(body) }),
};

