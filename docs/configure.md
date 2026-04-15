# Configuração global do pi

Este repositório funciona como configuração global do pi — disponível em todos os projetos sem nenhuma configuração por repositório.

A abordagem usa **symlinks e paths absolutos no `settings.json`**: os arquivos ficam versionados aqui, e o pi os encontra nos caminhos globais esperados. Qualquer `git pull` reflete imediatamente em todos os projetos.

## 1. Instalar o pi

```bash
npm install -g @mariozechner/pi-coding-agent
```

## 2. Clonar este repositório

Escolha onde quer manter o repositório localmente — esse caminho será referenciado nos passos seguintes:

```bash
git clone https://github.com/marcos2872/pi-config ~/pi-config
```

> Pode ser qualquer caminho (`~/dotfiles/pi-config`, `~/Projetos/pi-config`, etc.). O importante é usar o mesmo nos próximos passos.

## 3. Criar o symlink das extensões

Aponte `~/.pi/agent/extensions/` para a pasta `extensions/` do repositório:

```bash
# Substitua ~/pi-config pelo caminho onde você clonou o repositório
ln -s ~/pi-config/extensions ~/.pi/agent/extensions
```

## 4. Atualizar o settings.json global

O `~/.pi/agent/settings.json` é o arquivo de configuração global do pi. O comando abaixo **mescla** os caminhos deste repositório sem sobrescrever configurações existentes (provider, modelo, tema etc.):

```bash
# Substitua ~/pi-config pelo caminho onde você clonou o repositório
SETTINGS=~/.pi/agent/settings.json
REPO=~/pi-config

[ -f "$SETTINGS" ] || echo '{}' > "$SETTINGS"

node -e "
  const fs = require('fs');
  const current = JSON.parse(fs.readFileSync('$SETTINGS', 'utf8'));
  const patch = {
    skills:  ['$REPO/agents/agents', '$REPO/agents/skills'],
    prompts: ['$REPO/agents/prompts']
  };
  fs.writeFileSync('$SETTINGS', JSON.stringify({ ...current, ...patch }, null, 2));
  console.log('settings.json atualizado.');
"
```

> As extensões são carregadas via symlink (passo 3), por isso não precisam de entrada no `settings.json`.

## 5. Criar o symlink dos agentes globais

O `agent-switcher` procura os agentes primeiro em `{cwd}/agents/agents/` (local ao projeto) e, se não encontrar, cai para `~/agents/agents/`. Sem esse symlink, o pi exibe o warning abaixo ao abrir em qualquer projeto sem pasta local de agentes:

```
Warning: agent-switcher: nenhuma skill encontrada (local nem global)
```

Crie o symlink apontando para a pasta `agents/` do repositório:

```bash
# Substitua ~/pi-config pelo caminho onde você clonou o repositório
ln -s ~/pi-config/agents ~/agents
```

## 6. Instalar o RTK (opcional, recomendado)

Reduz o consumo de tokens em ~40% interceptando saídas de `grep`, `find` e `ls`.

```bash
# macOS
brew install rtk

# Linux
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/master/install.sh | sh
```

## 7. Recarregar

Abra o pi em qualquer projeto e execute:

```
/reload
```

## Uso em um projeto

Com o pi aberto no diretório do projeto:

```
/init
```

Detecta a stack automaticamente e gera o `AGENTS.md` na raiz. A partir daí todos os agentes e skills conhecem a estrutura, comandos e convenções do projeto.
