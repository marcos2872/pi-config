# pi-config

Repositório de configuração pessoal do **[pi](https://github.com/mariozechner/pi-coding-agent)** — coding agent de terminal com suporte a múltiplos modelos de IA.

## O que é o pi?

O **pi** é um agente de código que roda no terminal, capaz de ler arquivos, executar comandos, editar código e criar novos arquivos. Ele suporta extensões, temas, skills e múltiplos provedores de LLM (OpenAI, Anthropic, OpenRouter, entre outros).

## Estrutura deste repositório

```
pi-config/
├── .agents/                  # Agentes e skills customizados
│   ├── agents/               # Agentes especializados (modos de operação)
│   │   ├── ask/              # Agente somente-leitura — responde perguntas
│   │   ├── build/            # Agente de código — implementa e corrige
│   │   ├── doc/              # Agente de documentação técnica
│   │   ├── plan/             # Agente de planejamento — produz planos em .pi/plans/
│   │   ├── qa/               # Agente de QA — analisa bugs e vulnerabilidades
│   │   └── quality/          # Auditor de qualidade — lint, tipos e testes
│   └── skills/               # Skills reutilizáveis entre agentes
│       ├── diagram/          # Criação e validação de diagramas Excalidraw
│       ├── doc-architecture/ # ADRs e diagramas C4
│       ├── doc-backend/      # Documentação de sistemas backend
│       ├── doc-db/           # Diagramas ER via Excalidraw
│       ├── doc-frontend/     # Documentação de sistemas frontend
│       ├── excalidraw/       # Geração de arquivos .excalidraw
│       ├── git-commit-push/  # Commit convencional, push e abertura de PR
│       └── test/             # Criação e execução de testes automatizados
└── .pi/                      # Configurações e artefatos internos do pi
    ├── extensions/           # Extensões TypeScript customizadas
    │   ├── agent-switcher.ts # Troca de agente via UI
    │   ├── agents-resolver.ts# Resolução automática de agentes
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
| `test`              | Cria, mantém e executa testes automatizados |

## Extensões

As extensões ficam em `.pi/extensions/` e são arquivos TypeScript carregados automaticamente pelo pi:

- **`openrouter.ts`** — integra o provedor [OpenRouter](https://openrouter.ai), permitindo uso de dezenas de modelos via uma única API key
- **`agent-switcher.ts`** — adiciona atalho de teclado para trocar de agente sem reiniciar a sessão
- **`agents-resolver.ts`** — resolve automaticamente qual agente carregar com base no contexto do projeto

## Como usar

Consulte a documentação oficial do pi para instruções de instalação e configuração:

```bash
pi --help
```

Para carregar este repositório de configuração, configure o caminho nas preferências do pi ou use a variável de ambiente correspondente conforme a documentação.
