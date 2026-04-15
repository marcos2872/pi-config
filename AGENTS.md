# AGENTS.md

> Arquivo gerado por `/init` com análise automática. Edite manualmente para ajustar convenções.

## Projeto

- **Nome:** pi-config
- **Descrição:** Repositório de configuração pessoal do **pi** (coding agent de terminal) — contém extensões TypeScript, agentes especializados e skills reutilizáveis para uso em qualquer projeto.

## Stack

- **Linguagem(s):** TypeScript (sem compilação — carregado via `jiti` pelo pi em runtime)
- **Frameworks:** `@mariozechner/pi-coding-agent` (API de extensões), `@mariozechner/pi-tui` (componentes TUI), `@sinclair/typebox` (schemas)

## Gerenciamento de Dependências

- As extensões são carregadas diretamente pelo pi via `jiti` — não há `package.json` na raiz nem etapa de build/install.

## Comandos Essenciais

- **Dev / Reload:** `/rtk-reload` — re-verifica se o RTK está instalado e recarrega as extensões no pi
- **Logs de tokens:** `/rtk-logs` — exibe economia de tokens da sessão atual e estatísticas globais
- **Gerar AGENTS.md:** `/init` — detecta a stack do projeto atual e gera/atualiza o `AGENTS.md`
- **Trocar agente:** `/agent` (seletor visual) ou `Alt+A` (ciclo entre agentes)

## Estrutura de Diretórios

- **Extensões pi:** `.pi/extensions/`
- **Agentes:** `agents/agents/`
- **Skills:** `agents/skills/`
- **Planos:** `.pi/plans/`
- **Documentação:** `docs/`
- **Testes:** (não encontrado — validação é manual/interativa no runtime do pi)

## Módulos

### Extensões (`.pi/extensions/`)

- **`agent-switcher.ts`** — Troca de agente via `Alt+A` ou `/agent`; controla permissões de ferramentas por modo (somente-leitura, planejamento, auditoria, escrita completa)
- **`agents-resolver.ts`** — Registra os caminhos `agents/agents/` e `agents/skills/` para que o pi descubra agentes e skills via `resources_discover`
- **`init-agents.ts`** — Registra o comando `/init`; spawna sub-agente LLM que analisa o projeto e escreve o `AGENTS.md` com feedback visual em tempo real
- **`openrouter.ts`** — Integra o provedor OpenRouter, lendo a API key de `.env` local ou da variável de ambiente `OPENROUTER_API_KEY`
- **`rtk.ts`** — Integra o RTK (Rust Token Killer) para reduzir consumo de tokens em 60-90%; intercepta chamadas bash via `rtk rewrite` e substitui `grep`/`find`/`ls` por versões comprimidas

### Agentes (`agents/agents/`)

- **`ask/`** — Agente somente-leitura; responde perguntas sobre o projeto sem modificar nada
- **`build/`** — Agente de código; implementa funcionalidades, corrige bugs e refatora com escrita completa
- **`doc/`** — Especialista em documentação; cria ADRs, tabelas de API, diagramas e estrutura em `docs/`
- **`geral/`** — Agente de propósito geral; lê, escreve, executa e responde sem restrições de domínio
- **`plan/`** — Agente de planejamento; opera em somente-leitura e produz planos em `.pi/plans/`
- **`qa/`** — Agente de QA; analisa bugs, edge cases e vulnerabilidades de segurança
- **`quality/`** — Auditor de qualidade; verifica conformidade com lint, tipos e testes declarados no AGENTS.md
- **`test/`** — Engenheiro de testes; cria, mantém e executa testes automatizados

### Skills (`agents/skills/`)

- **`diagram/`** — Criação e validação de diagramas Excalidraw (C4, ER, fluxos de dados, árvores de componentes)
- **`doc-architecture/`** — Produz ADRs no formato MADR compacto e tabelas de inventário de serviços
- **`doc-backend/`** — Documenta sistemas backend com tabelas de endpoints e diagramas de fluxo de dados
- **`doc-db/`** — Gera e atualiza diagramas ER em três níveis de detalhe (conceitual, lógico, físico)
- **`doc-frontend/`** — Documenta sistemas frontend com árvores de componentes e fluxos de usuário
- **`excalidraw/`** — Geração de JSON Excalidraw para visualizações de arquitetura e workflows
- **`git-commit-push/`** — Gera mensagem Conventional Commits, executa commit, push e abre PR no GitHub

## Arquitetura

- **Estilo:** Flat / Plugin-based
- **Descrição:** Cada extensão em `.pi/extensions/` exporta `default function(pi: ExtensionAPI)` e é carregada pelo pi via `jiti` sem compilação. Os agentes e skills são arquivos Markdown com frontmatter YAML, descobertos automaticamente via `agents-resolver.ts` e injetados no system prompt pelo `agent-switcher.ts` conforme o modo ativo.

## Testes

- **Framework:** manual/interativo (extensões são runtime-only no processo do pi)
- **Diretório:** `tests/` ⚠️ não encontrado
- **Validação de extensões:** `node -e` para smoke tests de lógica isolada antes de carregar no pi

## Convenções de Código

- **Tamanho máximo de função:** 40 linhas
- **Tamanho máximo de arquivo:** 300 linhas
- **Aninhamento máximo:** 3 níveis
- **Docstrings / comentários:** Português brasileiro
- **Identificadores (variáveis, funções, classes):** Inglês
- **TypeScript:** sem etapa de build; compatível com `jiti` (ESM/CJS transparente); use tipos explícitos do `@mariozechner/pi-coding-agent` para eventos e APIs
- **Extensões:** sempre exportar `default function(pi: ExtensionAPI)` como entry point

## Commits

Este projeto segue o padrão **Conventional Commits**.
Antes de commitar, carregue a skill de commit:

```
/skill:git-commit-push
```

Ou siga diretamente as regras em `agents/skills/git-commit-push/SKILL.md`.

## Agentes e Skills

| Agente    | Função                                         | Modo                   |
|-----------|------------------------------------------------|------------------------|
| `build`   | Implementa funcionalidades e corrige bugs      | escrita completa       |
| `ask`     | Responde perguntas somente-leitura             | somente-leitura        |
| `plan`    | Cria planos detalhados em `.pi/plans/`         | escrita em .pi/plans/  |
| `quality` | Auditoria de qualidade de código               | bash + leitura         |
| `qa`      | Análise de bugs e edge cases                   | bash + leitura         |
| `test`    | Cria e mantém testes automatizados             | escrita em tests/      |
| `doc`     | Cria documentação técnica em `docs/`           | escrita em docs/       |
| `geral`   | Propósito geral sem restrições de domínio      | escrita completa       |
