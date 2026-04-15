# Extensões

As extensões ficam em `extensions/` na raiz do repositório e são carregadas pelo pi via symlink em `~/.pi/agent/extensions/`. Cada arquivo exporta `default function(pi: ExtensionAPI)` e é carregado pelo pi em runtime via `jiti` — sem etapa de compilação.

```mermaid
graph TD
    PI[pi runtime]
    EXT[~/.pi/agent/extensions/]
    REPO[pi-config/extensions/]

    PI -->|auto-discover| EXT
    EXT -->|symlink| REPO

    REPO --> AS[agent-switcher.ts]
    REPO --> AR[agents-resolver.ts]
    REPO --> IA[init-agents.ts]
    REPO --> OR[openrouter.ts]
    REPO --> RTK[rtk.ts]
```

---

## agent-switcher

Carrega os agentes disponíveis em `agents/agents/` e permite alternar entre eles. Controla as ferramentas ativas conforme o modo de cada agente e injeta o conteúdo do `SKILL.md` ativo no system prompt antes de cada turno.

### Comandos e atalhos

| Atalho / Comando | Ação |
|---|---|
| `Alt+A` | Cicla para o próximo agente |
| `/agent` | Abre seletor visual com lista e descrições |
| `/agent-reload` | Recarrega os SKILL.md sem reiniciar o pi |

### Modos de permissão

| Modo | Agentes | Ferramentas liberadas |
|---|---|---|
| Somente-leitura | `ask` | `read`, `grep`, `find`, `ls` + bash seguro |
| Planejamento | `plan` | Igual + `write`/`edit` apenas em `.pi/plans/` |
| Auditoria | `quality`, `qa` | `read`, `bash`, `grep`, `find`, `ls` |
| Escrita parcial | `doc`, `test` | Todas — escrita restrita pela própria skill |
| Acesso completo | `build`, `geral` | `read`, `bash`, `edit`, `write` |

> Bash seguro: `ls`, `find`, `grep`, `cat`, `head`, `tail`, `git log`, `git diff`, `git status`, `git show`, `jq`, entre outros comandos de leitura.

### Fluxo de inicialização

```mermaid
sequenceDiagram
    participant PI as pi runtime
    participant AS as agent-switcher
    participant FS as agents/agents/

    PI->>AS: session_start
    AS->>FS: readdirSync (local ou ~/agents)
    FS-->>AS: lista de diretórios
    AS->>FS: readFileSync SKILL.md de cada agente
    AS-->>PI: skills carregadas
    AS->>AS: restaura agente da sessão anterior
    AS-->>PI: setActiveTools + status bar

    PI->>AS: before_agent_start
    AS-->>PI: systemPrompt + preamble + conteúdo do SKILL.md ativo
```

### Resolução de agentes (local vs global)

O switcher busca por `agents/agents/` no diretório de trabalho atual. Se não existir, usa `~/agents/agents/` (que aponta para este repositório via symlink).

---

## agents-resolver

Registra os caminhos de agentes e skills no evento `resources_discover` do pi, tornando-os descobríveis pelos mecanismos nativos (seletor `/agent`, `/skill:nome`).

### Lógica de resolução

```mermaid
flowchart TD
    RD[resources_discover]
    LA{agents/agents/ local existe?}
    LS{agents/skills/ local existe?}
    GA[~/agents/agents/]
    GS[~/agents/skills/]

    RD --> LA
    LA -->|sim| AddLA[adiciona local]
    LA -->|não| GA
    GA --> AddGA[adiciona global]

    RD --> LS
    LS -->|sim| AddLS[adiciona local]
    LS -->|não| skip1[ignora]
    AddLS --> GS
    GS -->|caminho diferente| AddGS[adiciona global também]
    GS -->|mesmo caminho| skip2[ignora duplicata]
```

> **Agentes:** local tem prioridade; global é fallback.  
> **Skills:** local e global são adicionados juntos (quando diferentes).

---

## init-agents

Registra o comando `/init`, que spawna um sub-processo pi no modo `--print --no-extensions` com um system prompt específico. O sub-agente analisa o projeto e escreve o `AGENTS.md` autonomamente.

### Fluxo do `/init`

```mermaid
sequenceDiagram
    participant U as usuário
    participant IA as init-agents
    participant SUB as sub-processo pi
    participant FS as sistema de arquivos

    U->>IA: /init
    IA->>U: confirm dialog
    U-->>IA: confirma
    IA->>FS: escreve system prompt em /tmp
    IA->>SUB: spawn pi --print --no-extensions --tools read,grep,find,ls,write
    SUB->>FS: ls, read, grep (descobre stack)
    SUB->>FS: write AGENTS.md
    SUB-->>IA: stream JSON (tool_execution_start events)
    IA->>U: widget com passos em tempo real + spinner no rodapé
    SUB-->>IA: exit 0
    IA->>U: notificação de sucesso
    IA->>FS: remove arquivo temporário
```

### Ferramentas do sub-agente

O sub-agente recebe apenas: `read`, `grep`, `find`, `ls`, `write`. Não tem acesso a `bash` nem às extensões do pi principal.

---

## openrouter

Registra o provedor `openrouter` no pi com a API compatível com OpenAI Completions. A API key é lida dinamicamente a cada chamada:

1. Busca `OPENROUTER_API_KEY` no `.env` da raiz do repositório atual (`git rev-parse --show-toplevel`)
2. Fallback para a variável de ambiente `OPENROUTER_API_KEY`

### Modelos registrados

| ID | Nome | Contexto | Custo |
|---|---|---|---|
| `qwen/qwen3.6-plus:free` | Qwen 3.6-plus via OpenRouter | 40.960 tokens | gratuito |

> Para adicionar modelos, edite `extensions/openrouter.ts` e inclua novos objetos no array `models`.

---

## rtk

Integra o [RTK (Rust Token Killer)](https://www.rtk-ai.app/) para reduzir o consumo de tokens nas saídas de comandos bash. Intercepta chamadas de ferramentas antes da execução e substitui `grep`, `find` e `ls` por versões comprimidas.

> O `read` nativo do pi é preservado intencionalmente — o RTK trunca arquivos de forma opaca e prejudica a qualidade do agente em arquivos grandes.

### Funcionamento

```mermaid
flowchart LR
    MODEL[modelo LLM]
    TC[tool_call bash]
    RW{rtk rewrite}
    EXEC[execução bash]
    OUT[saída comprimida]

    MODEL -->|chama bash| TC
    TC --> RW
    RW -->|rewrite encontrado| EXEC
    RW -->|sem rewrite| EXEC
    EXEC --> OUT
    OUT --> MODEL
```

Para `grep`, `find` e `ls`, as ferramentas são substituídas por implementações próprias que chamam `rtk grep`, `rtk find` e `rtk ls` diretamente.

### Comandos

| Comando | Ação |
|---|---|
| `/rtk-reload` | Re-verifica se o binário `rtk` está no PATH e recarrega o pi |
| `/rtk-logs` | Exibe economia de tokens da sessão atual e estatísticas globais |

### Instalação do binário

```bash
# macOS
brew install rtk

# Linux
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/master/install.sh | sh
```
