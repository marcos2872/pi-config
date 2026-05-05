# 40.9% de economia em tokens e diagramas Excalidraw sem sair do terminal — minha configuração do pi

Uso o [pi](https://shittycodingagent.ai/) como coding agent de terminal há alguns meses. As contas de API cresceram rápido, e o fluxo de criar diagramas de arquitetura estava completamente fora do terminal. Este post mostra o que montei para atacar os dois problemas — com os números reais depois de 367 comandos.

Vale deixar claro: o repositório de configuração é pessoal. Funciona como está, mas adaptar para outro setup exige familiaridade com o sistema de extensões do pi. Não é um pacote pronto para instalar.

---

## O problema

**Bash desperdiça tokens**

`grep`, `find` e `ls` em projetos reais devolvem saídas enormes. O agente processa tudo como tokens de entrada. Em uma sessão intensa de análise de código, boa parte dos tokens vai para ruído de terminal — paths longos, output de build que o agente nunca vai usar, linhas repetidas.

**Diagramas quebravam o fluxo**

O ciclo para visualizar uma arquitetura era: pedir pro agente gerar o JSON do Excalidraw → copiar → abrir browser → colar → ajustar. Quatro passos manuais toda vez. Com o tempo, comecei a adiar diagramas porque o custo de criar um era alto demais.

**Agente genérico é agente descuidado**

Revisando código de um colega, não quero que o agente edite nada. Planejando uma refatoração, não quero side effects. Gerenciar isso manualmente — lembrando de instruir o agente antes de cada operação — é fricção que acumula.

---

## O que eu tinha antes

Bash puro, sem compressão. Cada `grep -r` em um monorepo Rust chegava a 3.000 linhas de output. O agente lia tudo, eu pagava por tudo.

Para diagramas, usava o Excalidraw online. Funciona, mas sair do terminal quebra o contexto: você perde a thread da conversa e volta com um arquivo que o agente não gerou nem revisa.

Para controle de modo de operação, nada estruturado. Ou o agente tinha permissão total, ou eu criava uma sessão nova com instrução diferente.

---

## Como resolvi

### RTK: compressão transparente no hook de bash

O [RTK (Rust Token Killer)](https://www.rtk-ai.app/) comprime a saída de comandos de terminal antes de enviar ao LLM. Depois de 367 comandos:

| Métrica | Valor |
|---|---|
| Tokens de entrada totais | 141.100 |
| Tokens salvos | 57.600 |
| Economia | 40.9% |

Os maiores ganhos individuais: `rtk cargo test` (98.5%), `rtk git commit` (98.2%), `rtk ls` (80.9%). Projetos Rust e Go têm o maior ganho — saídas de compilação e teste são enormes.

O mecanismo: a integração intercepta cada comando bash antes de executar e passa pelo `rtk rewrite`, que reescreve chamadas de `grep`, `find` e `ls` para versões comprimidas — sem o agente precisar saber disso. O `read` nativo do pi fica fora da interceptação intencionalmente: RTK trunca arquivos de forma opaca, o que prejudicaria leituras de código onde o agente precisa do conteúdo completo.

**Estatísticas globais acumuladas:**

![RTK Token Savings — estatísticas globais](https://raw.githubusercontent.com/marcos2872/pi-config/refs/heads/main/docs/images/global.png)

**Economia da sessão no pi (`/rtk-logs`):**

![RTK Token Savings — estatísticas da sessão](https://raw.githubusercontent.com/marcos2872/pi-config/refs/heads/main/docs/images/sess%C3%A3o.png)

Uma ressalva: o RTK comprime saídas de `grep` com heurísticas. Em buscas muito específicas, pode omitir contexto relevante. Não identifiquei falsos negativos no meu uso, mas é um risco real.

### Excalidraw: diagramas dentro da sessão

O pi tem um sistema de skills — arquivos Markdown que ensinam o agente a executar tarefas especializadas. A skill de Excalidraw define uma filosofia de argumento visual (o diagrama deve comunicar algo mesmo sem os textos), uma biblioteca de padrões para fan-out, convergência, timeline, ciclo e árvore, e um loop obrigatório de render-validate.

O loop funciona assim: o agente gera o JSON do diagrama, renderiza em PNG via Playwright, lê a imagem e itera até o resultado estar correto — tudo na mesma sessão. O arquivo `.excalidraw` fica na pasta do projeto e o PNG aparece inline na conversa.

A dependência do Playwright é uma limitação real. Sem ele instalado, o loop render-validate não funciona e o agente entrega só o JSON sem renderizar.

![Exemplo de diagrama gerado pela skill Excalidraw](https://raw.githubusercontent.com/marcos2872/pi-config/refs/heads/main/docs/examples/excalidraw-demo.png)

### Controle de modo com agent-switcher

Uma extensão define permissões de ferramentas por agente. Alternar com `Alt+A` muda o comportamento instantaneamente — sem reiniciar a sessão, sem nova instrução.

| Agente | Permissões |
|---|---|
| `ask` | somente-leitura |
| `plan` | escreve apenas em `.pi/plans/` |
| `build` | escrita completa |
| `qa` | bash + leitura, sem edição de arquivos |

---

## Como usar

**Instalar as dependências:**

```bash
npm install -g @mariozechner/pi-coding-agent

# RTK
brew install rtk
# ou
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/master/install.sh | sh
```

**Clonar o repositório de configuração:**

```bash
git clone https://github.com/marcos2872/pi-config
```

Siga os passos em [github.com/marcos2872/pi-config/blob/main/docs/configure.md](https://github.com/marcos2872/pi-config/blob/main/docs/configure.md) para criar os symlinks e atualizar o `settings.json` global.

**Comandos disponíveis após carregar:**

| Comando | O que faz |
|---|---|
| `/init` | Detecta a stack do projeto e gera `AGENTS.md` automaticamente |
| `/agent` | Seletor visual de agentes |
| `Alt+A` | Cicla entre agentes sem reiniciar a sessão |
| `/rtk-reload` | Re-verifica instalação do RTK e recarrega |
| `/rtk-logs` | Exibe economia de tokens da sessão atual |

**Gerar um diagrama:**

```
> desenha a arquitetura do sistema de autenticação com JWT e refresh token
```

O agente carrega a skill, gera o JSON em seções, renderiza o PNG e itera até ficar correto.

---

## O que mudou na prática

Os 40.9% de economia não vêm de um benchmark controlado — são de uso real em projetos mistos de TypeScript, Rust e shell. Projetos com mais compilação têm ganho maior; projetos predominantemente em Python, onde o output de ferramentas é mais enxuto, têm ganho menor.

A skill de Excalidraw resolveu um problema de atrito. Antes eu adiava diagramas porque criar um custava mais do que valia. Agora o diagrama entra na mesma sessão em que o código está sendo discutido.

O agent-switcher é a mudança mais silenciosa das três — mas é a que mais mudou o dia a dia. Não penso mais em "preciso lembrar de dizer pro agente não editar nada". Só troco o modo.

- **pi**: [shittycodingagent.ai](https://shittycodingagent.ai/)
- **RTK**: [rtk-ai.app](https://www.rtk-ai.app/)
- **Repositório de configuração**: [github.com/marcos2872/pi-config](https://github.com/marcos2872/pi-config)
