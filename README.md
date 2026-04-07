# pi-config

Repositório de configuração pessoal do **[pi](https://github.com/mariozechner/pi-coding-agent)** — coding agent de terminal com suporte a múltiplos modelos de IA.

## O que é o pi?

O **pi** é um agente de código que roda no terminal, capaz de ler arquivos, executar comandos, editar código e criar novos arquivos. Ele suporta extensões, temas, skills e múltiplos provedores de LLM (OpenAI, Anthropic, OpenRouter, entre outros).

## Estrutura deste repositório

```
pi-config/
├── AGENTS.md                 # Convenções deste repositório (gerado por /init)
├── .agents/                  # Agentes e skills customizados
│   ├── agents/               # Agentes especializados (modos de operação)
│   │   ├── ask/              # Agente somente-leitura — responde perguntas
│   │   ├── build/            # Agente de código — implementa e corrige
│   │   ├── doc/              # Agente de documentação técnica
│   │   ├── plan/             # Agente de planejamento — produz planos em .pi/plans/
│   │   ├── qa/               # Agente de QA — analisa bugs e vulnerabilidades
│   │   ├── quality/          # Auditor de qualidade — lint, tipos e testes
│   │   └── test/             # Engenheiro de testes — cria e executa testes
│   └── skills/               # Skills reutilizáveis entre agentes
│       ├── diagram/          # Criação e validação de diagramas Excalidraw
│       ├── doc-architecture/ # ADRs e diagramas C4
│       ├── doc-backend/      # Documentação de sistemas backend
│       ├── doc-db/           # Diagramas ER via Excalidraw
│       ├── doc-frontend/     # Documentação de sistemas frontend
│       ├── excalidraw/       # Geração de arquivos .excalidraw
│       └── git-commit-push/  # Commit convencional, push e abertura de PR
└── .pi/                      # Configurações e artefatos internos do pi
    ├── extensions/           # Extensões TypeScript customizadas
    │   ├── agent-switcher.ts # Troca de agente via Alt+A ou /agent
    │   ├── agents-resolver.ts# Registra os caminhos de agents e skills no pi
    │   ├── init-agents.ts    # Comando /init — gera AGENTS.md para qualquer projeto
    │   └── openrouter.ts     # Provedor OpenRouter
    └── plans/                # Planos gerados pelo agente plan
```

## Agentes disponíveis

| Agente    | Descrição |
|-----------|-----------|
| `ask`     | Modo somente-leitura — responde perguntas sobre o projeto sem modificar nada |
| `build`   | Implementa funcionalidades, corrige bugs e refatora código |
| `doc`     | Cria e atualiza ADRs, tabelas de API, diagramas e estrutura de docs |
| `plan`    | Planeja funcionalidades e mudanças arquiteturais, produz planos em `.pi/plans/` |
| `qa`      | Analisa código em busca de bugs, edge cases e vulnerabilidades |
| `quality` | Audita conformidade com lint, tipos e testes |
| `test`    | Cria, mantém e executa testes automatizados |

Troque de agente com **Alt+A** (ciclo) ou **`/agent`** (seletor visual).

## Skills disponíveis

| Skill               | Descrição |
|---------------------|-----------|
| `diagram`           | Cria e valida diagramas Excalidraw (C4, ER, fluxos) |
| `doc-architecture`  | Produz ADRs (MADR) e tabelas de inventário de serviços |
| `doc-backend`       | Documenta sistemas backend com tabelas de endpoints e diagramas de fluxo |
| `doc-db`            | Gera e atualiza diagramas ER em três níveis de detalhe |
| `doc-frontend`      | Documenta sistemas frontend com árvores de componentes e fluxos de usuário |
| `excalidraw`        | Geração de JSON Excalidraw para visualizações e arquiteturas |
| `git-commit-push`   | Gera mensagem Conventional Commits, executa commit, push e abre PR |

## Extensões

As extensões ficam em `.pi/extensions/` e são carregadas automaticamente pelo pi em qualquer projeto que use este repositório de configuração:

- **`init-agents.ts`** — registra o comando `/init`, que detecta automaticamente a stack do projeto (Node.js, Python, Go, Rust, Java…) e gera ou atualiza o `AGENTS.md` com stack, comandos, estrutura de diretórios, arquitetura e convenções. O pi injeta o `AGENTS.md` no contexto nativamente, tornando todos os agentes e skills agnósticos de linguagem.
- **`agent-switcher.ts`** — troca de agente via **Alt+A** (ciclo) ou `/agent` (seletor visual); controla permissões de ferramentas por modo (somente-leitura, planejamento, auditoria, escrita completa).
- **`agents-resolver.ts`** — registra os caminhos `.agents/agents/` e `.agents/skills/` para que o pi descubra os agentes e skills automaticamente.
- **`openrouter.ts`** — integra o provedor [OpenRouter](https://openrouter.ai), permitindo uso de dezenas de modelos via uma única API key.

## AGENTS.md — Configuração do projeto

Cada projeto que usar estes agentes deve ter um `AGENTS.md` na raiz com a stack, comandos e convenções. Para gerar automaticamente:

```
/init
```

O `/init` detecta `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml` e equivalentes, preenche o `AGENTS.md` e pede confirmação antes de escrever. O arquivo pode ser editado manualmente a qualquer momento.

## Como usar

Consulte a documentação oficial do pi para instruções de instalação e configuração:

```bash
pi --help
```

Para carregar este repositório de configuração, configure o caminho nas preferências do pi ou use a variável de ambiente correspondente conforme a documentação.
