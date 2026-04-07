# AGENTS.md

> Arquivo gerado por `/init` e ajustado manualmente.

## Projeto

- **Nome:** pi-config
- **Descrição:** Configuração global do agente pi — extensões, agents e skills reutilizáveis em qualquer projeto.

## Stack

- **Linguagem(s):** TypeScript (extensões pi via jiti — sem compilação)
- **Runtime:** Node.js (carregado pelo pi via jiti)

## Gerenciamento de Dependências

- **Sem gerenciador:** extensões `.ts` são carregadas diretamente pelo pi sem `npm install`
- **Dependências de tipos:** disponíveis via `@mariozechner/pi-coding-agent` (instalado globalmente com o pi)

## Comandos Essenciais

- **Reload de extensões:** `/reload` (dentro do pi)
- **Testar uma extensão:** `pi -e .pi/extensions/<arquivo>.ts`

## Estrutura de Diretórios

- **Extensões (projeto-local):** `.pi/extensions/`
- **Agents:** `.agents/agents/<nome>/SKILL.md`
- **Skills de suporte:** `.agents/skills/<nome>/SKILL.md`

## Arquitetura

- **Estilo:** Configuração declarativa — sem lógica de negócio
- **Extensões:** intercept events do pi (`before_agent_start`, `tool_call`, `session_start`) e registram comandos/ferramentas
- **Agents:** arquivos SKILL.md injetados no system prompt pelo `agent-switcher`
- **Skills:** arquivos SKILL.md carregados sob demanda via `/skill:<nome>`

## Testes

- **Framework:** manual — testar extensões dentro do pi com `/reload`
- **Diretório:** (não aplicável)

## Convenções de Código

- **Tamanho máximo de função:** 40 linhas
- **Tamanho máximo de arquivo:** 300 linhas
- **Aninhamento máximo:** 3 níveis
- **Docstrings / comentários:** Português brasileiro
- **Identificadores (variáveis, funções, classes):** Inglês
- **TypeScript:** estrito, sem `any` implícito, sem variáveis não usadas
- **Extensões:** exportar `default function (pi: ExtensionAPI)` como entry point

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
