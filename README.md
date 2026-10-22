# Gestão de Extensão UFMS — Front-end (Módulo 2 + integração com o banco do Módulo 3)

Interface web (React + TypeScript + Vite + Tailwind CSS + React Router) do **Sistema Web de Gestão de Atendimento e Demandas de Projetos de Extensão Universitária** — Programa de Extensão UFMS Digital (`95DX7.200525`).

Uma API mínima em Node.js (`server/index.mjs`, sem dependências, usando `node:sqlite`) conecta a interface ao banco SQLite do repositório [`gestao-extensao-db`](https://github.com/julianomoreira-hub/gestao-extensao-db).

## Telas
- **Painel**: contadores por status e indicadores por projeto (consulta `GROUP BY` do Módulo 3).
- **Nova solicitação**: formulário que executa `INSERT` em `demandas_atendimento`.
- **Demandas e triagem**: listagem (view `vw_painel_demandas`), filtro por status e triagem (`UPDATE` + registro em `historico_interacoes`).

## Estrutura
```text
gestao-extensao-web/
├── server/index.mjs        # API REST sobre o SQLite
├── src/
│   ├── components/         # Layout, Badge
│   ├── pages/              # Dashboard, NovaSolicitacao, Demandas
│   └── services/api.ts     # cliente HTTP tipado
└── vite.config.ts          # proxy /api -> :3001
```

## Como executar
Pré-requisitos: Node.js >= 22 e os dois repositórios clonados lado a lado:

```text
projetao/
├── gestao-extensao-db/
└── gestao-extensao-web/
```

```bash
cd gestao-extensao-web
npm install
npm run api     # terminal 1: API em http://localhost:3001
npm run dev     # terminal 2: interface em http://localhost:5173
```

Para usar outro banco: `DB_PATH=/caminho/gestao_extensao.db npm run api`.
