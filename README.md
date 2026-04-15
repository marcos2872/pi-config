# pi-config

Configuração pessoal do **[pi](https://shittycodingagent.ai/)** — coding agent de terminal com suporte a múltiplos modelos de IA.

## O que tem aqui

- **`extensions/`** — extensões TypeScript carregadas globalmente pelo pi: troca de agente, provedor OpenRouter, compressão de tokens via RTK e geração automática de `AGENTS.md`
- **`agents/agents/`** — agentes especializados: `ask`, `build`, `doc`, `geral`, `plan`, `qa`, `quality`, `test`
- **`agents/skills/`** — skills reutilizáveis: `diagram`, `excalidraw`, `doc-*`, `git-commit-push`

Troque de agente com **Alt+A** ou **`/agent`**. Gere o `AGENTS.md` de qualquer projeto com **`/init`**.

## Configuração

→ [docs/configure.md](docs/configure.md)

## Preview

**RTK — economia global de tokens:**

![RTK Token Savings Global](https://raw.githubusercontent.com/marcos2872/pi-config/refs/heads/main/docs/images/global.png)

**Excalidraw — diagrama gerado pelo agente:**

![Excalidraw demo](https://raw.githubusercontent.com/marcos2872/pi-config/refs/heads/main/docs/examples/excalidraw-demo.png)
