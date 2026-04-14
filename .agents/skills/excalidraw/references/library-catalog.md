# Library Catalog — Excalidraw Icon & Template Libraries

Two `.excalidrawlib` files are available in this directory. Use the `extract_lib_item.py`
script to incorporate any item into a diagram.

---

## How to Use

```bash
# Listar itens disponíveis
cd .agents/skills/excalidraw/references
uv run python extract_lib_item.py icons.excalidrawlib --list
uv run python extract_lib_item.py system-design-template.excalidrawlib --list

# Extrair um ícone e posicioná-lo no diagrama
uv run python extract_lib_item.py icons.excalidrawlib <nome> --x <X> --y <Y> --width <W>

# Extrair um template
uv run python extract_lib_item.py system-design-template.excalidrawlib <nome> --x <X> --y <Y>
```

O script imprime um array JSON. Copie os elementos gerados para o array `elements[]`
do arquivo `.excalidraw` alvo — use `edit` para inserir antes do `]` final.

---

## `icons.excalidrawlib` — 65 ícones

Ícones desenhados à mão (`roughness: 1`). Use `--width 80` como padrão para a maioria
dos contextos. Para ícones pequenos ao lado de labels, use `--width 60`.

### Documentos e Arquivos

| Nome | Quando usar |
|---|---|
| `paper` | Documento genérico, arquivo de texto |
| `documents` | Conjunto de documentos, pasta |
| `notes` | Notas, anotações, comentários |
| `clipboard` | Formulário, checklist, dados coletados |
| `attachment` | Anexo, arquivo vinculado |
| `table` | Tabela de dados, planilha |
| `pdf` | Arquivo PDF, relatório exportado |
| `doc` | Documento Word, arquivo de texto formatado |
| `xls` | Planilha Excel, dados tabulares |
| `ppt` | Apresentação, slides |
| `zip` | Arquivo comprimido, pacote |

### Formatos de Mídia

| Nome | Quando usar |
|---|---|
| `gif` | Imagem animada |
| `jpg` | Imagem fotográfica |
| `png` | Imagem com transparência |
| `mp3` | Áudio |
| `wav` | Áudio sem compressão |
| `mov` | Vídeo QuickTime |
| `avi` | Vídeo |
| `flv` | Vídeo Flash |
| `iso` | Imagem de disco |

### Formatos de Código / Design

| Nome | Quando usar |
|---|---|
| `sql` | Banco de dados, query SQL |
| `psd` | Arquivo Photoshop |
| `sketch` | Arquivo Sketch |
| `ai` | Adobe Illustrator |
| `otf` | Fonte tipográfica |
| `dmg` | Instalador macOS |
| `exe` | Executável Windows |
| `apk` | Pacote Android |

### UI e Ações

| Nome | Quando usar |
|---|---|
| `message` | Mensagem, chat, notificação |
| `cloud` | Cloud, serviço em nuvem, AWS/GCP/Azure genérico |
| `more` | Mais opções, menu |
| `delete` | Exclusão, remoção |
| `search` | Busca, pesquisa, indexação |
| `share` | Compartilhamento, envio |
| `upload` | Upload, envio para servidor |
| `download` | Download, recebimento |
| `password` | Autenticação, segurança, chave |
| `code` | Trecho de código, editor |
| `shredder` | Destruição de dados, LGPD |
| `movie` | Vídeo, streaming |

### Linguagens de Programação

| Nome | Quando usar |
|---|---|
| `python` | Serviço Python, backend FastAPI/Django/Flask |
| `java` | Serviço Java, Spring Boot |
| `go` | Serviço Go |
| `rust` | Serviço Rust |
| `c` | Código C |
| `c++` | Código C++ |
| `c#` | Serviço .NET/C# |
| `php` | Serviço PHP |
| `swift` | App iOS |
| `dart` | App Flutter |
| `typescript` | Módulo TypeScript |
| `js` | Módulo JavaScript |
| `shell` | Script shell, CLI, terminal |
| `html` | Página HTML, template |
| `css` | Estilos, design system |

### Frameworks e Ferramentas

| Nome | Quando usar |
|---|---|
| `react` | Frontend React |
| `vue` | Frontend Vue |
| `node` | Backend Node.js |
| `flutter` | App mobile Flutter |
| `nuxt` | Frontend Nuxt.js |
| `vite` | Bundler Vite |
| `webpack` | Bundler Webpack |
| `esbuild` | Bundler esbuild |
| `rollup` | Bundler Rollup |
| `jest` | Testes Jest |

---

## `system-design-template.excalidrawlib` — 8 templates

Templates de layout pré-construídos. Use sem `--width` (tamanho original) ou ajuste
com `--width` conforme o espaço disponível.

| Nome | Quando usar |
|---|---|
| `steps` | Sequência de passos numerados com ícones, linha do tempo |
| `flow` | Fluxo com caixas e textos, storytelling visual |
| `note` | Caixa de nota/comentário flutuante |
| `table` | Tabela com cabeçalho e linhas |
| `separator` | Divisor visual entre seções |
| `code-block` | Bloco de código com numeração de linhas |
| `system-diagram` | Diagrama básico: User → API Service → DB |
| `node-circle` | Nó circular rotulado (para grafos ou fluxos) |

---

## Regras de uso automático

O agente deve incorporar ícones automaticamente sempre que o diagrama incluir
um dos conceitos abaixo. **Não pergunte ao usuário — aplique diretamente.**

| Conceito no diagrama | Ícone a usar | Lib |
|---|---|---|
| Backend Python / FastAPI / Django | `python` | icons |
| Backend Node.js / Express | `node` | icons |
| Backend Java / Spring | `java` | icons |
| Backend Go | `go` | icons |
| Backend Rust | `rust` | icons |
| Backend PHP | `php` | icons |
| Backend .NET / C# | `c#` | icons |
| Frontend React / Next.js | `react` | icons |
| Frontend Vue / Nuxt | `vue` | icons |
| App iOS / Swift | `swift` | icons |
| App Android / Dart | `dart` ou `apk` | icons |
| App Flutter | `flutter` | icons |
| Banco de dados SQL | `sql` | icons |
| Serviço de cloud / AWS / GCP / Azure | `cloud` | icons |
| Autenticação / segurança / JWT | `password` | icons |
| Busca / Elasticsearch | `search` | icons |
| Upload de arquivo | `upload` | icons |
| Download / exportação | `download` | icons |
| Mensageria / notificação / webhook | `message` | icons |
| Script de automação / CLI | `shell` | icons |
| Testes automatizados | `jest` | icons |
| Documento / relatório gerado | `pdf` ou `doc` | icons |
| Fluxo de dados passo a passo | `steps` | system-design-template |
| Diagrama básico User→API→DB | `system-diagram` | system-design-template |

**Tamanho padrão:** `--width 80` para ícones em diagramas técnicos.
**Tamanho pequeno:** `--width 60` para ícones usados como marcadores ao lado de texto.
