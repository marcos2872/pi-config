# pi-config

Configuração pessoal para dois coding agents de terminal: **[pi](https://shittycodingagent.ai/)** e **[OpenCode](https://opencode.ai/)**.

## Estrutura

```
pi-config/
├── pi/                    ← Configuração do pi
│   ├── extensions/        ← Extensões TypeScript (agent-switcher, RTK, OpenRouter, init-agents)
│   ├── agents/agents/     ← Agentes: ask, build, doc, geral, plan, qa, quality, test
│   ├── agents/skills/     ← Skills: diagram, excalidraw, doc-*, git-commit-push
│   └── docs/              ← Documentação do pi
└── opencode/              ← Configuração do OpenCode
    ├── agents/            ← Agentes: ask, doc, geral, qa, quality, test
    └── skills/            ← Skills: code-conventions, doc-*, excalidraw, git-commit-push
```

## pi

Troque de agente com **Alt+A** ou **`/agent`**. Gere o `AGENTS.md` de qualquer projeto com **`/init`**.

→ [Configuração](pi/docs/configure.md) · [Agentes e Skills](pi/docs/agents.md) · [Extensões](pi/docs/extensions.md)

## OpenCode

Agentes e skills ficam em `opencode/` e são ativados via symlink em `~/.config/opencode/`.

```bash
ln -s ~/Projetos/pi-config/opencode/agents ~/.config/opencode/agents
ln -s ~/Projetos/pi-config/opencode/skills ~/.config/opencode/skills
```

## Preview

**RTK — economia global de tokens:**

![RTK Token Savings Global](https://raw.githubusercontent.com/marcos2872/pi-config/refs/heads/main/docs/images/global.png)

**Excalidraw — diagrama gerado pelo agente:**

![Excalidraw demo](https://raw.githubusercontent.com/marcos2872/pi-config/refs/heads/main/docs/examples/excalidraw-demo.png)
