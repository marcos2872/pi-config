# AGENTS.md

> Arquivo gerado por `/init` com análise automática. Edite manualmente para ajustar convenções.

## Projeto

- **Nome:** pi-config
- **Descrição:** Configuração pessoal global do **pi** (coding agent de terminal) — contém extensões TypeScript carregadas via symlink, agentes especializados e skills reutilizáveis disponíveis em qualquer projeto.

## Stack

- **Linguagem(s):** TypeScript (sem compilação — carregado via `jiti` pelo pi em runtime)
- **Frameworks:** `@mariozechner/pi-coding-agent` (API de extensões e sub-agentes), `@mariozechner/pi-tui` (componentes TUI), `@sinclair/typebox` (schemas de ferramentas)

## Gerenciamento de Dependências

As extensões são carregadas diretamente pelo pi via `jiti` — não há `package.json` na raiz nem etapa de build/install.

- **Instalar pi globalmente:** `npm install -g @mariozechner/pi-coding-agent`
- **Instalar RTK (compressão de tokens):** `brew install rtk` ou `curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/master/install.sh | sh`

## Comandos Essenciais

- **Ativar extensões (symlink):** `ln -s ~/pi-config/extensions ~/.pi/agent/extensions`
- **Reload RTK:** `/rtk-reload` — re-verifica se o RTK está instalado e recarrega as extensões
- **Logs de tokens:** `/rtk-logs` — exibe economia de tokens da sessão atual e estatísticas globais
- **Gerar AGENTS.md:** `/init` — analisa o projeto atual e gera/atualiza o `AGENTS.md`
- **Trocar agente:** `/agent` (seletor visual) ou `Alt+A` (ciclo entre agentes)
- **Recarregar agentes:** `/agent-reload` — recarrega skills de `agents/agents/` sem reiniciar o pi

## Estrutura de Diretórios

- **Extensões pi:** `extensions/`
- **Agentes:** `agents/agents/`
- **Skills:** `agents/skills/`
- **Prompts:** `agents/prompts/`
- **Documentação:** `docs/`
- **Testes:** (não encontrado — validação é manual/interativa no runtime do pi)

## Módulos

### Extensões (`extensions/`)

- **`extensions/agent-switcher.ts`** — Troca de agente via `Alt+A` ou `/agent`; controla permissões de ferramentas por modo (somente-leitura, planejamento, auditoria, escrita parcial, escrita completa); restaura agente ativo entre sessões
- **`extensions/agents-resolver.ts`** — Registra `agents/agents/` e `agents/skills/` para descoberta nativa de agentes e skills pelo pi via `resources_discover`; prioriza paths locais do projeto com fallback para `~/agents`
- **`extensions/init-agents.ts`** — Registra o comando `/init`; spawna sub-agente LLM com ferramentas de leitura + escrita que analisa o projeto e gera o `AGENTS.md` com feedback visual em tempo real (spinner + log de passos)
- **`extensions/openrouter.ts`** — Integra o provedor OpenRouter; lê a API key de `.env` local (raiz do projeto) ou da variável de ambiente `OPENROUTER_API_KEY`
- **`extensions/rtk.ts`** — Integra o RTK (Rust Token Killer) para reduzir consumo de tokens em ~60-90%; intercepta chamadas bash via `rtk rewrite` e substitui `grep`/`find`/`ls` por versões comprimidas

### Agentes (`agents/agents/`)

- **`agents/agents/ask/`** — Agente somente-leitura; responde perguntas sobre o projeto sem modificar nada
- **`agents/agents/build/`** — Agente de código; implementa funcionalidades, corrige bugs e refatora com escrita completa
- **`agents/agents/doc/`** — Especialista em documentação; cria ADRs, tabelas de API e estrutura em `docs/`
- **`agents/agents/geral/`** — Agente de propósito geral; lê, escreve, executa e responde sem restrições de domínio
- **`agents/agents/plan/`** — Agente de planejamento; opera em somente-leitura e produz planos em `.pi/plans/`
- **`agents/agents/qa/`** — Agente de QA; analisa bugs, edge cases e vulnerabilidades de segurança
- **`agents/agents/quality/`** — Auditor de qualidade; verifica conformidade com lint, tipos e convenções declaradas no AGENTS.md
- **`agents/agents/test/`** — Engenheiro de testes; cria, mantém e executa testes automatizados

### Skills (`agents/skills/`)

- **`agents/skills/diagram/`** — Criação e validação de diagramas Excalidraw (C4, ER, fluxos de dados, árvores de componentes)
- **`agents/skills/doc-architecture/`** — Produz ADRs no formato MADR compacto e tabelas de inventário de serviços
- **`agents/skills/doc-backend/`** — Documenta sistemas backend com tabelas de endpoints e diagramas de fluxo de dados
- **`agents/skills/doc-db/`** — Gera e atualiza diagramas ER em três níveis de detalhe (conceitual, lógico, físico)
- **`agents/skills/doc-frontend/`** — Documenta sistemas frontend com árvores de componentes e fluxos de usuário
- **`agents/skills/excalidraw/`** — Geração de JSON Excalidraw para visualizações de arquitetura e workflows
- **`agents/skills/git-commit-push/`** — Gera mensagem Conventional Commits, executa commit, push e abre PR no GitHub

## Arquitetura

- **Estilo:** Flat / Plugin-based
- **Descrição:** Cada extensão em `extensions/` exporta `default function(pi: ExtensionAPI)` e é carregada pelo pi via `jiti` sem compilação. Os agentes e skills são arquivos Markdown com frontmatter YAML, descobertos automaticamente via `agents-resolver.ts` e injetados no system prompt pelo `agent-switcher.ts` conforme o agente ativo. O `init-agents.ts` spawna um sub-processo pi para análise autônoma de projetos.

## Configuração Global

> Para usar este repositório como configuração global do pi em qualquer projeto:

1. Clonar: `git clone https://github.com/marcos2872/pi-config ~/pi-config`
2. Criar symlink: `ln -s ~/pi-config/extensions ~/.pi/agent/extensions`
3. Atualizar `~/.pi/agent/settings.json` com os paths de `agents/agents/` e `agents/skills/` — veja [docs/configure.md](docs/configure.md)

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
- **Agentes/Skills:** frontmatter YAML com `name` e `description`; conteúdo em Markdown; comentários em Português brasileiro
- **Hooks `pi.on()`:** retornar objeto de modificação (ex: `{ systemPrompt }`, `{ block, reason }`) ou `undefined`; nunca lançar exceção

## Commits

Este projeto segue o padrão **Conventional Commits**.
Antes de commitar, carregue a skill de commit:

```
/skill:git-commit-push
```

Ou siga diretamente as regras em `agents/skills/git-commit-push/SKILL.md`.

## Agentes e Skills

| Agente    | Função                                         | Modo                        |
|-----------|------------------------------------------------|-----------------------------|
| `build`   | Implementa funcionalidades e corrige bugs      | escrita completa            |
| `ask`     | Responde perguntas somente-leitura             | somente-leitura             |
| `plan`    | Cria planos detalhados em `.pi/plans/`         | escrita apenas em .pi/plans/|
| `quality` | Auditoria de qualidade de código               | bash + leitura              |
| `qa`      | Análise de bugs e edge cases                   | bash + leitura              |
| `test`    | Cria e mantém testes automatizados             | escrita em tests/           |
| `doc`     | Cria documentação técnica em `docs/`           | escrita em docs/            |
| `geral`   | Propósito geral sem restrições de domínio      | escrita completa            |
