# AGENTS.md

> Arquivo gerado por `/init`. Edite manualmente para ajustar convenções.

## Projeto

- **Nome:** pi-config

## Stack

- **Linguagem(s):** TypeScript

## Gerenciamento de Dependências

- Sem `package.json` no projeto raiz — as extensões são carregadas diretamente pelo pi via `jiti` (TypeScript nativo, sem build)

## Comandos Essenciais

- `/init` — gera ou atualiza o `AGENTS.md` do projeto atual
- `/agent` — abre o seletor visual de agentes
- `Alt+A` — cicla entre agentes
- `/rtk-reload` — re-verifica se o RTK está instalado e recarrega o pi
- `/rtk-logs` — exibe economia de tokens da sessão atual

## Estrutura de Diretórios

- **Extensões:** `.pi/extensions/`
- **Agentes:** `.agents/agents/`
- **Skills:** `.agents/skills/`
- **Planos:** `.pi/plans/`

## Arquitetura

- **Estilo:** Flat
- **Extensões pi:** TypeScript carregado via `jiti` (sem compilação); cada arquivo exporta `default function(pi: ExtensionAPI)`
- **Agentes:** skills Markdown em `.agents/agents/<nome>/SKILL.md`, injetadas no system prompt pelo `agent-switcher`
- **Skills:** skills Markdown em `.agents/skills/<nome>/SKILL.md`, invocadas via `/skill:<nome>`

## Testes

- **Framework:** manual/interativo (extensões são runtime-only no processo do pi)
- **Validação de extensões:** `node -e` para smoke tests de lógica isolada antes de carregar no pi

## Convenções de Código

- **Tamanho máximo de função:** 40 linhas
- **Tamanho máximo de arquivo:** 300 linhas
- **Aninhamento máximo:** 3 níveis
- **Docstrings / comentários:** Português brasileiro
- **Identificadores (variáveis, funções, classes):** Inglês

## Commits

Este projeto segue o padrão **Conventional Commits**.
Antes de commitar, carregue a skill de commit:

```
/skill:git-commit-push
```

Ou siga diretamente as regras em `.agents/skills/git-commit-push/SKILL.md`.

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
