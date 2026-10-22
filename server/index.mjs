// API mínima (sem dependências) que expõe o banco SQLite do Módulo 3 ao front-end.
// Requer Node.js >= 22 (módulo nativo node:sqlite).
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const here = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH =
  process.env.DB_PATH ||
  path.resolve(here, "../../gestao-extensao-db/database/gestao_extensao.db");
const PORT = Number(process.env.PORT || 3001);

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA foreign_keys = ON;");

const send = (res, status, body) => {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
  });

const now = () => new Date().toISOString().replace("T", " ").slice(0, 19);

const routes = async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const { pathname } = url;

  if (req.method === "GET" && pathname === "/api/demandas") {
    return send(res, 200, db.prepare("SELECT * FROM vw_painel_demandas ORDER BY data_abertura DESC").all());
  }

  if (req.method === "GET" && pathname === "/api/projetos") {
    return send(res, 200, db.prepare("SELECT id_projeto, codigo_sigproj, titulo FROM projetos_extensao WHERE status_projeto = 'ATIVO' ORDER BY titulo").all());
  }

  if (req.method === "GET" && pathname === "/api/bolsistas") {
    return send(res, 200, db.prepare("SELECT id_usuario, nome_completo FROM usuarios WHERE perfil = 'DISCENTE_BOLSISTA' AND ativo = 1 ORDER BY nome_completo").all());
  }

  if (req.method === "GET" && pathname === "/api/solicitantes") {
    return send(res, 200, db.prepare("SELECT id_usuario, nome_completo FROM usuarios WHERE perfil = 'SOLICITANTE_EXTERNO' AND ativo = 1 ORDER BY nome_completo").all());
  }

  if (req.method === "GET" && pathname === "/api/indicadores") {
    const porProjeto = db.prepare(`
      SELECT p.codigo_sigproj, p.titulo,
             COUNT(d.id_demanda) AS total,
             SUM(CASE WHEN d.status_demanda = 'CONCLUIDA' THEN 1 ELSE 0 END) AS concluidas,
             SUM(CASE WHEN d.status_demanda = 'EM_ANDAMENTO' THEN 1 ELSE 0 END) AS em_andamento,
             SUM(CASE WHEN d.status_demanda = 'ABERTA' THEN 1 ELSE 0 END) AS abertas,
             ROUND(AVG(av.nota), 2) AS media_satisfacao
      FROM projetos_extensao p
      LEFT JOIN demandas_atendimento d ON p.id_projeto = d.id_projeto
      LEFT JOIN avaliacoes_atendimento av ON d.id_demanda = av.id_demanda
      GROUP BY p.id_projeto ORDER BY total DESC`).all();
    const porStatus = db.prepare("SELECT status_demanda AS status, COUNT(*) AS total FROM demandas_atendimento GROUP BY status_demanda").all();
    return send(res, 200, { porProjeto, porStatus });
  }

  if (req.method === "POST" && pathname === "/api/demandas") {
    const b = await readBody(req);
    if (!b.id_projeto || !b.id_solicitante || !b.titulo_demanda || !b.descricao_solic) {
      return send(res, 400, { erro: "Preencha todos os campos obrigatórios." });
    }
    const ano = new Date().getFullYear();
    const { n } = db.prepare("SELECT COUNT(*) AS n FROM demandas_atendimento").get();
    let protocolo = `UFMS-${ano}-${String(n + 1).padStart(4, "0")}`;
    while (db.prepare("SELECT 1 FROM demandas_atendimento WHERE protocolo = ?").get(protocolo)) {
      protocolo = `UFMS-${ano}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    }
    const ts = now();
    try {
      db.prepare(`INSERT INTO demandas_atendimento
        (protocolo, id_projeto, id_solicitante, titulo_demanda, descricao_solic, prioridade, status_demanda, data_abertura, data_atualizacao)
        VALUES (?, ?, ?, ?, ?, ?, 'ABERTA', ?, ?)`)
        .run(protocolo, b.id_projeto, b.id_solicitante, b.titulo_demanda, b.descricao_solic, b.prioridade || "MEDIA", ts, ts);
    } catch (e) {
      return send(res, 400, { erro: String(e.message) });
    }
    return send(res, 201, { protocolo });
  }

  const m = pathname.match(/^\/api\/demandas\/([^/]+)\/triagem$/);
  if (req.method === "PATCH" && m) {
    const b = await readBody(req);
    const d = db.prepare("SELECT id_demanda, status_demanda FROM demandas_atendimento WHERE protocolo = ?").get(m[1]);
    if (!d) return send(res, 404, { erro: "Demanda não encontrada." });
    const ts = now();
    const concluida = b.status_demanda === "CONCLUIDA" ? ts : null;
    try {
      db.prepare(`UPDATE demandas_atendimento
        SET id_bolsista_responsavel = ?, status_demanda = ?, data_atualizacao = ?, data_conclusao = ?
        WHERE id_demanda = ?`)
        .run(b.id_bolsista_responsavel ?? null, b.status_demanda, ts, concluida, d.id_demanda);
      // trilha de auditoria (autor: primeiro coordenador cadastrado)
      const autor = db.prepare("SELECT id_usuario FROM usuarios WHERE perfil = 'COORDENADOR' ORDER BY id_usuario LIMIT 1").get();
      db.prepare(`INSERT INTO historico_interacoes (id_demanda, id_autor, status_anterior, status_novo, parecer_tecnico, data_registro)
        VALUES (?, ?, ?, ?, ?, ?)`)
        .run(d.id_demanda, autor.id_usuario, d.status_demanda, b.status_demanda, b.parecer_tecnico || "Triagem realizada pelo painel web.", ts);
    } catch (e) {
      return send(res, 400, { erro: String(e.message) });
    }
    return send(res, 200, { ok: true });
  }

  send(res, 404, { erro: "Rota não encontrada." });
};

http
  .createServer((req, res) => routes(req, res).catch((e) => send(res, 500, { erro: String(e.message) })))
  .listen(PORT, "127.0.0.1", () => console.log(`API em http://127.0.0.1:${PORT}  (banco: ${DB_PATH})`));

