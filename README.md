# pi-config

Repositório de configuração pessoal do **[pi](https://shittycodingagent.ai/)** — coding agent de terminal com suporte a múltiplos modelos de IA.

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
│   │   ├── geral/            # Agente geral — propósito livre, sem restrições de domínio
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
    │   ├── openrouter.ts     # Provedor OpenRouter
    │   └── rtk.ts            # Compressão de tokens via RTK (60-90% de economia)
    └── plans/                # Planos gerados pelo agente plan
```

## Agentes disponíveis

| Agente    | Descrição |
|-----------|-----------|
| `ask`     | Modo somente-leitura — responde perguntas sobre o projeto sem modificar nada |
| `build`   | Implementa funcionalidades, corrige bugs e refatora código |
| `doc`     | Cria e atualiza ADRs, tabelas de API, diagramas e estrutura de docs |
| `geral`   | Propósito geral — lê, escreve, executa e responde sem restrições de domínio |
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
- **`rtk.ts`** — integra o [RTK (Rust Token Killer)](https://www.rtk-ai.app/) para reduzir o consumo de tokens em ~40% na prática (pico de 98% em comandos como `cargo test` e `git commit`). Intercepta chamadas bash via `rtk rewrite` e substitui os built-ins `grep`, `find` e `ls` por versões comprimidas. O `read` nativo é preservado para manter a qualidade em arquivos grandes. Exibe notificação de instalação quando o binário não está disponível. Comandos disponíveis:
  - **`/rtk-reload`** — re-verifica se o rtk está instalado e recarrega o pi
  - **`/rtk-logs`** — exibe a economia de tokens da sessão atual e estatísticas globais

  Pré-requisito: instale via [rtk-ai.app](https://www.rtk-ai.app/) — `brew install rtk` ou `curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/master/install.sh | sh`

## AGENTS.md — Configuração do projeto

Cada projeto que usar estes agentes deve ter um `AGENTS.md` na raiz com a stack, comandos e convenções. Para gerar automaticamente:

```
/init
```

O `/init` detecta `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml` e equivalentes, preenche o `AGENTS.md` e pede confirmação antes de escrever. O arquivo pode ser editado manualmente a qualquer momento.

## Instalação global

Este repositório foi desenhado para funcionar como configuração global do pi — disponível em todos os projetos sem nenhuma configuração por repositório.

A abordagem usa **symlinks**: os arquivos continuam versionados aqui, e o pi os encontra nos caminhos globais esperados. Qualquer `git pull` neste repositório reflete imediatamente em todos os projetos.

### 1. Instalar o pi

```bash
npm install -g @mariozechner/pi-coding-agent
```

### 2. Clonar este repositório

```bash
git clone https://github.com/marcos2872/pi-config ~/Projetos/pi-config
```

> Ajuste o caminho de destino conforme preferir — use o mesmo nos próximos passos.

### 3. Criar os symlinks globais

```bash
# Extensões TypeScript → ~/.pi/agent/extensions/
ln -s ~/Projetos/pi-config/.pi/extensions ~/.pi/agent/extensions

# Agentes e skills → ~/.agents/ (descoberto automaticamente pelo pi)
ln -s ~/Projetos/pi-config/.agents ~/.agents

# AGENTS.md global → carregado pelo pi em qualquer projeto
ln -s ~/Projetos/pi-config/AGENTS.md ~/.pi/agent/AGENTS.md
```

### 4. Atualizar o settings.json global (sem apagar configs existentes)

O arquivo `~/.pi/agent/settings.json` pode já conter configurações de provider, modelo, tema etc. O comando abaixo **mescla** os novos campos sem sobrescrever o que já existe:

```bash
SETTINGS=~/.pi/agent/settings.json
REPO=~/Projetos/pi-config

# Cria o arquivo se não existir
[ -f "$SETTINGS" ] || echo '{}' > "$SETTINGS"

# Merge: mantém chaves existentes e adiciona/atualiza skills e prompts
node -e "
  const fs = require('fs');
  const current = JSON.parse(fs.readFileSync('$SETTINGS', 'utf8'));
  const patch = {
    skills:  ['$REPO/.agents/agents', '$REPO/.agents/skills'],
    prompts: ['$REPO/.agents/prompts']
  };
  fs.writeFileSync('$SETTINGS', JSON.stringify({ ...current, ...patch }, null, 2));
  console.log('settings.json atualizado.');
"
```

> **Por que só `skills` e `prompts`?** As extensões são descobertas automaticamente via o symlink `~/.pi/agent/extensions/`. O `~/.agents/skills/` também é descoberto automaticamente pelo pi, mas incluímos `agents/` e `skills/` explicitamente em `skills` para que o `agents-resolver.ts` registre ambos os caminhos via `resources_discover`.

### 5. Instalar o RTK (opcional, recomendado)

```bash
# macOS
brew install rtk

# Linux
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/master/install.sh | sh
```

### 6. Recarregar as extensões

Abra o pi em qualquer projeto e execute:

```
/reload
```

As extensões, skills e prompts deste repositório estarão disponíveis globalmente. Os agentes (`/agent`, `Alt+A`) fazem fallback para `~/.agents/agents/` quando o projeto não tem `.agents/agents/` próprio.

### Como usar em um projeto

Com o pi aberto no diretório do projeto:

```
/init
```

O comando detecta a stack automaticamente e gera o `AGENTS.md` na raiz do projeto. A partir daí todos os agentes e skills conhecem a estrutura, comandos e convenções do projeto sem instrução adicional.

## Preview

**RTK — economia global de tokens:**

![RTK Token Savings Global](https://raw.githubusercontent.com/marcos2872/pi-config/refs/heads/main/docs/images/global.png)

**Excalidraw — diagrama gerado pelo agente:**

![Excalidraw demo](https://raw.githubusercontent.com/marcos2872/pi-config/refs/heads/main/docs/examples/excalidraw-demo.png)

> Post completo: [Como reduzi o custo de tokens em 40.9% e gerei diagramas Excalidraw direto do terminal com o pi](docs/post-tabnews.md)
