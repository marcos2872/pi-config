# Como reduzi o custo de tokens em 38% e gerei diagramas Excalidraw direto do terminal com o pi

Trabalho com coding agents no terminal há alguns meses. Depois de acumular contas absurdas de API e perder tempo demais alternando entre terminal, editor e ferramenta de diagramação, resolvi parar e montar uma configuração que resolvesse tudo de uma vez.

---

## A dor

Quem usa LLMs via API em projetos reais conhece bem esses problemas:

**1. Tokens são caros — e bash é guloso**

Comandos como `grep`, `find` e `ls` em projetos grandes devolvem saídas enormes. O agente processa tudo isso como tokens de entrada. Em uma sessão intensa, são centenas de milhares de tokens gastos só com ruído de terminal.

**2. Troca de contexto constante para diagramas**

Toda vez que precisava visualizar uma arquitetura ou fluxo, o ciclo era: descrever pro agente → copiar JSON → abrir Excalidraw no browser → colar → ajustar. Chato, lento e fora do fluxo de trabalho.

**3. Agentes genéricos demais**

Um agente que faz tudo ao mesmo tempo acaba não sendo especialista em nada. Às vezes você quer só uma resposta rápida sem que o agente saia modificando arquivos. Outras vezes quer modo de escrita completa. Gerenciar isso manualmente é custoso.

---

## O que eu usei para resolver

Duas ferramentas encaixaram perfeitamente no **[pi](https://shittycodingagent.ai/)**, um coding agent de terminal open source:

- **[RTK (Rust Token Killer)](https://www.rtk-ai.app/)** — comprime a saída de comandos bash antes de mandar pro LLM
- **Skill de Excalidraw do pi** — gera diagramas `.excalidraw` diretamente na conversa, com renderização em PNG inline

---

## Como foi resolvido

### RTK: interceptação transparente de bash

O pi suporta extensões TypeScript. Criei uma extensão (`rtk.ts`) que faz três coisas:

1. **Hook `tool_call`**: antes de qualquer comando bash executar, passa o comando pelo `rtk rewrite`. O RTK substitui chamadas nativas de `grep`, `find` e `ls` pelas versões comprimidas do RTK automaticamente — sem o agente precisar saber disso.

2. **Override de ferramentas**: registra versões `grep`, `find` e `ls` no pi que já chamam o RTK diretamente, contornando o bash puro quando o agente usa as ferramentas nomeadas.

3. **Snapshot de sessão**: no início de cada sessão, captura as estatísticas globais do RTK. O comando `/rtk-logs` calcula o delta e mostra a economia real daquela sessão.

O `read` nativo do pi é **preservado intencionalmente**. O RTK trunca arquivos de forma opaca — isso prejudicaria a qualidade em leituras de código.

**Resultado real depois de 359 comandos:**

**Estatísticas globais acumuladas:**

![RTK Token Savings — estatísticas globais](https://raw.githubusercontent.com/marcos2872/pi-config/refs/heads/main/docs/images/global.png)

**Economia da sessão no pi (`/rtk-logs`):**

![RTK Token Savings — sessão do pi](https://raw.githubusercontent.com/marcos2872/pi-config/refs/heads/main/docs/images/sess%C3%A3o.png)

39.5% de economia em 385 comandos — 58.7K tokens salvos de 148.8K de entrada. `rtk cargo test` chegou a 98.5% de redução. `rtk git commit` economizou 98.2%. `rtk ls` economizou 82%.

O código da extensão completa está no repositório: [`.pi/extensions/rtk.ts`](https://github.com/marcos2872/pi-config/blob/main/.pi/extensions/rtk.ts)

### Skill de Excalidraw: diagramas sem sair do terminal

O pi tem um sistema de **skills** — arquivos Markdown que ensinam o agente a executar tarefas especializadas. A skill de Excalidraw define toda uma metodologia de criação de diagramas:

- **Filosofia de argumento visual**: o diagrama deve *argumentar*, não apenas exibir. Se remover todos os textos, a estrutura ainda deve comunicar algo.
- **Biblioteca de padrões**: fan-out, convergência, timeline, ciclo, árvore — cada conceito tem um padrão visual correspondente.
- **Evidence artifacts**: para diagramas técnicos, inclui snippets de código reais, exemplos de JSON e nomes de eventos reais — não "Input → Process → Output".
- **Loop render-validate obrigatório**: o agente gera o JSON, renderiza em PNG via Playwright, lê a imagem e itera até o diagrama estar visualmente correto.

A skill usa uma paleta de cores semântica (`color-palette.md`) e duas bibliotecas de ícones para tecnologias comuns (Python, React, Node, TypeScript, SQL, etc.) e templates de layout (steps, flow, system-diagram).

![Exemplo de diagrama gerado pela skill Excalidraw](https://raw.githubusercontent.com/marcos2872/pi-config/refs/heads/main/docs/examples/excalidraw-demo.png)

---

## Como funciona na prática

### Estrutura do repositório de configuração

```
pi-config/
├── .pi/
│   └── extensions/
│       ├── rtk.ts            # Integração RTK (compressão de tokens)
│       ├── agent-switcher.ts # Troca de agentes via Alt+A ou /agent
│       ├── agents-resolver.ts
│       ├── init-agents.ts    # Comando /init para gerar AGENTS.md
│       └── openrouter.ts     # Suporte a OpenRouter
└── .agents/
    ├── agents/               # Agentes especializados
    │   ├── ask/              # Somente-leitura
    │   ├── build/            # Escrita completa
    │   ├── doc/              # Documentação técnica
    │   ├── plan/             # Planejamento
    │   ├── qa/               # Análise de bugs
    │   ├── quality/          # Conformidade e lint
    │   └── test/             # Testes automatizados
    └── skills/
        ├── excalidraw/       # Geração de diagramas
        ├── diagram/          # Orquestração de diagramas
        ├── doc-architecture/ # ADRs e C4
        ├── doc-backend/      # Backend
        ├── doc-db/           # Diagramas ER
        ├── doc-frontend/     # Frontend
        └── git-commit-push/  # Commit convencional + PR
```

### Como usar

**Pré-requisitos:**
```bash
# Instalar pi
npm install -g @mariozechner/pi-coding-agent

# Instalar RTK
brew install rtk
# ou
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/master/install.sh | sh
```

**Configurar o repositório de config:**
```bash
git clone https://github.com/seu-usuario/pi-config ~/.pi-config
# Aponte o pi para o repositório de config nas preferências
```

**Comandos disponíveis após carregar:**

| Comando | O que faz |
|---|---|
| `/init` | Detecta a stack do projeto e gera `AGENTS.md` automaticamente |
| `/agent` | Abre seletor visual de agentes |
| `Alt+A` | Cicla entre agentes |
| `/rtk-reload` | Re-verifica instalação do RTK e recarrega |
| `/rtk-logs` | Exibe economia de tokens da sessão atual |

**Gerar um diagrama Excalidraw:**
```
> desenha a arquitetura do sistema de autenticação com JWT e refresh token
```
O agente carrega a skill, planeja o diagrama, gera o JSON em seções, renderiza o PNG, lê a imagem e itera até ficar correto — tudo na mesma sessão.

---

## Formas diferentes de usar

### 1. Só o RTK, sem agentes customizados

Se você usa qualquer coding agent com suporte a extensões, pode integrar o RTK apenas no hook de bash. O ganho de tokens começa imediatamente em projetos que fazem muitos `grep` e `find` — Rust e Go são os casos de maior economia (saídas de compilação e teste são enormes).

### 2. Agentes por modo de operação

O `agent-switcher` controla as permissões de ferramentas por agente:

- **`ask`**: somente-leitura — sem edição de arquivos, ideal para revisões
- **`plan`**: escreve apenas em `.pi/plans/` — planejamento sem side effects
- **`build`**: escrita completa — implementação e refatoração
- **`qa`**: bash + leitura — analisa bugs sem modificar nada

Alternar com `Alt+A` no meio de uma conversa muda o comportamento do agente instantaneamente, sem reiniciar a sessão.

### 3. Skills de documentação encadeadas

A skill `doc` orquestra as demais:
1. `doc-architecture` → ADRs no formato MADR
2. `doc-backend` / `doc-frontend` / `doc-db` → tabelas de endpoints, modelos, componentes
3. `diagram` → carrega `excalidraw` + renderiza PNG

Uma única instrução como *"documenta o módulo de pagamentos"* percorre toda essa cadeia.

### 4. AGENTS.md agnóstico de linguagem

O comando `/init` detecta `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml` e equivalentes. Gera um `AGENTS.md` com a stack, comandos de lint/test/build, estrutura de diretórios e convenções do projeto específico. O pi injeta esse arquivo no contexto — todos os agentes e skills passam a entender o projeto sem instrução adicional.

---

## Considerações finais

O RTK resolve um problema que não deveria existir — ferramentas de terminal produzem saídas verbosas por design, mas LLMs cobram por cada token. A compressão transparente no nível da extensão é a camada certa para atacar isso.

A skill de Excalidraw mudou como eu registro decisões de arquitetura. Antes eu adiava a criação de diagramas porque era trabalhoso. Agora faz parte da mesma sessão em que o código é escrito.

- **pi**: [shittycodingagent.ai](https://shittycodingagent.ai/)
- **RTK**: [rtk-ai.app](https://www.rtk-ai.app/)
- **Repositório de configuração**: [github.com/marcos2872/pi-config](https://github.com/marcos2872/pi-config)
