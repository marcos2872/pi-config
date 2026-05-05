---
name: code-conventions
description: Convenções globais do projeto — quando usar Makefile, como executar comandos por linguagem (uv para Python), checklists de qualidade e regras de teste. Carregue antes de auditar, escrever testes ou executar qualquer comando do projeto.
---

# Code Conventions — Referência de Qualidade por Linguagem

Esta skill é a fonte única de verdade para checklists de qualidade, convenções de execução
e regras universais de teste. Carregue-a nos agentes `quality`, `qa` e `test` antes de qualquer análise.

---

## Convenções Globais de Execução de Comandos

### Makefile como padrão global

**Se o `Makefile` existir na raiz, use `make <target>` para qualquer comando.** Se não existir, **crie-o** com os targets padrão antes de executar qualquer comando do projeto.

> O Makefile é a interface unificada do projeto — independente de linguagem, qualquer desenvolvedor ou agente deve conseguir rodar `make dev`, `make test` ou `make build` sem precisar conhecer o toolchain interno.

```bash
# Verificar se Makefile existe e quais targets estão disponíveis
ls Makefile 2>/dev/null && (make help 2>/dev/null || grep -E '^[a-zA-Z_-]+:' Makefile | cut -d: -f1 | sort)
```

### Targets obrigatórios (toda linguagem)

| Target | Descrição | Requisito |
|---|---|---|
| `make dev` | Inicia o servidor/processo de desenvolvimento | **Obrigatório ter hot-reload** |
| `make build` | Compila ou empacota para produção | — |
| `make test` | Executa a suite de testes | — |
| `make lint` | Executa o linter | — |
| `make format` | Formata o código | — |
| `make install` | Instala dependências | — |
| `make clean` | Remove artefatos de build | — |

Targets opcionais (adicionar quando aplicável):

| Target | Descrição |
|---|---|
| `make migrate` | Executa migrações de banco |
| `make seed` | Popula o banco com dados de desenvolvimento |
| `make docker` | Sobe os serviços via Docker Compose |
| `make docs` | Gera documentação |
| `make typecheck` | Checagem de tipos separada do lint |

### Criação do Makefile

**Quando o Makefile não existir, crie-o antes de qualquer outra ação.** Detecte a linguagem e use o template correspondente abaixo. Adapte os comandos ao toolchain real do projeto (declarado no AGENTS.md ou inferido pelo filesystem).

> `make dev` **deve sempre iniciar com hot-reload** — o desenvolvedor não deve precisar reiniciar o processo manualmente após salvar um arquivo.

#### Template Python (uv + FastAPI/Flask)

```makefile
.PHONY: dev build test lint format typecheck install clean help

install: ## Instala dependências
	uv sync

dev: ## Inicia servidor de desenvolvimento com hot-reload
	uv run fastapi dev app/main.py
	# alternativa Flask: uv run flask --app app run --debug --reload
	# alternativa genérica: uv run watchfiles "python -m app" app/

build: ## Empacota para produção
	uv build

test: ## Executa os testes
	uv run pytest

lint: ## Executa o linter
	uv run ruff check .

format: ## Formata o código
	uv run ruff format .

typecheck: ## Checagem de tipos
	uv run mypy .

clean: ## Remove artefatos de build
	rm -rf dist/ .pytest_cache/ __pycache__/ .mypy_cache/

help: ## Lista os targets disponíveis
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
```

#### Template TypeScript / Node (Next.js / Vite / Express)

```makefile
.PHONY: dev build test lint format typecheck install clean help

install: ## Instala dependências
	npm install

dev: ## Inicia servidor de desenvolvimento com hot-reload
	npm run dev
	# Next.js e Vite têm hot-reload nativo via npm run dev
	# Express: configure nodemon ou tsx watch no script "dev" do package.json

build: ## Compila para produção
	npm run build

test: ## Executa os testes
	npm test

lint: ## Executa o linter
	npm run lint

format: ## Formata o código
	npm run format

typecheck: ## Checagem de tipos
	npx tsc --noEmit

clean: ## Remove artefatos de build
	rm -rf dist/ .next/ node_modules/.cache/

help: ## Lista os targets disponíveis
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
```

#### Template Go

```makefile
.PHONY: dev build test lint format install clean help

install: ## Baixa dependências
	go mod download

dev: ## Inicia servidor de desenvolvimento com hot-reload (requer air)
	air
	# se air não estiver instalado: go install github.com/air-verse/air@latest

build: ## Compila o binário
	go build -o bin/app ./cmd/app

test: ## Executa os testes
	go test ./...

lint: ## Executa o linter
	golangci-lint run

format: ## Formata o código
	gofmt -w .

clean: ## Remove artefatos de build
	rm -rf bin/

help: ## Lista os targets disponíveis
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
```

#### Template Rust

```makefile
.PHONY: dev build test lint format install clean help

install: ## Baixa dependências
	cargo fetch

dev: ## Inicia com hot-reload (requer cargo-watch)
	cargo watch -x run
	# se não instalado: cargo install cargo-watch

build: ## Compila para produção
	cargo build --release

test: ## Executa os testes
	cargo test

lint: ## Executa o clippy
	cargo clippy

format: ## Formata o código
	cargo fmt

clean: ## Remove artefatos de build
	cargo clean

help: ## Lista os targets disponíveis
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
```

### Regras de criação do Makefile

1. Detecte a linguagem e o toolchain real (não assuma)
2. Use o template acima como base, adaptando os comandos ao projeto
3. Garanta que `make dev` tenha hot-reload — se o framework não suportar nativamente, adicione `watchfiles`, `nodemon`, `air` ou `cargo-watch` como dependência de dev e documente no README
4. Documente cada target com `## descrição` para que `make help` funcione

---

## Princípios Universais (toda linguagem)

### Estrutura
- Funções com mais linhas do que o limite do projeto → **AVISO**
- Aninhamento > 3 níveis → **AVISO** — extrair função
- Arquivos com mais linhas do que o limite do projeto → **AVISO**
- Código duplicado (mesma lógica em 3+ lugares) → **AVISO**

### Segurança — itens são sempre **ERRO**
- Tokens, senhas, chaves de API hardcoded ou logados (mesmo em `debug`)
- Dado de usuário usado sem validação ou sanitização
- Caminho de arquivo aceito do cliente sem whitelist (path traversal)
- Variável de ambiente secreta com valor default hardcoded no código
- Deserialização de dados não confiáveis sem validação de schema

### Manutenção
- TODO/FIXME sem issue associada → **SUGESTÃO**
- Dependências importadas mas não usadas → **AVISO**
- Nomes não descritivos (`x`, `data2`, `tmp`) → **SUGESTÃO**
- Comentários que explicam *o quê* em vez de *por quê* → **SUGESTÃO**

---

## Python

### Gerenciador de pacotes

**Use sempre `uv`.** Só use `pip` ou `poetry` se o projeto declarar explicitamente outro gerenciador.

| Ação | Comando |
|---|---|
| Instalar dependências | `uv sync` |
| Executar no venv | `uv run <comando>` |
| Adicionar dependência | `uv add <pacote>` |

> Se Makefile existir, prefira `make test` / `make lint` — que internamente já usarão `uv run`.

### Checklist de qualidade
- Parâmetros ou retornos de funções públicas sem anotação de tipo → **AVISO**
- `Optional[X]` em vez de `X | None` (Python ≥ 3.10) → **AVISO**
- `Union[X, Y]` em vez de `X | Y` → **AVISO**
- `List[X]`, `Dict[X, Y]` de `typing` em vez dos built-ins → **AVISO**
- `except Exception` sem log → **AVISO**
- `print()` em código de produção → **AVISO**
- `os.path` em vez de `pathlib.Path` → **AVISO**

### Pydantic (se aplicável)
- `.dict()` em vez de `.model_dump()` → **ERRO**
- `.schema()` em vez de `.model_json_schema()` → **ERRO**
- `validator` em vez de `field_validator` → **ERRO**

### Testes
- Framework: `pytest` via `uv run pytest`
- Fixtures compartilhadas em `conftest.py`
- Mocks via `unittest.mock.patch` ou `pytest-mock`
- Estrutura: Arrange / Act / Assert com mensagem de falha descritiva

---

## TypeScript / JavaScript

### Checklist de qualidade
- `any` explícito → **AVISO**
- `fetch` direto dentro de componente (deve ir para camada `api/`) → **ERRO**
- `useEffect` com chamada assíncrona sem cleanup/`AbortController` → **ERRO**
- Estado mutado diretamente (sem spread/map/filter) → **ERRO**
- Componentes com mais de 200 linhas de JSX → **AVISO**
- Props de componentes públicos sem tipagem TypeScript → **AVISO**

### Testes
- Framework: Jest ou Vitest (verificar `package.json`)
- Estrutura: `describe` + `it` com Arrange / Act / Assert
- Um arquivo de teste por módulo-alvo
- Mocks explícitos para qualquer dependência externa

---

## Go

### Checklist de qualidade
- Erro retornado ignorado (`_`) → **ERRO**
- Goroutine sem mecanismo de encerramento (`ctx.Done`, `WaitGroup`) → **AVISO**
- `panic` em código de produção fora de `init` → **AVISO**
- Funções exportadas sem comentário godoc → **AVISO**
- Funções exportadas sem testes → **AVISO**

### Testes
- Usar table-driven tests (padrão idiomático do Go)
- Mocks via interfaces — nunca dependência concreta

---

## Rust

### Checklist de qualidade
- `unwrap()` / `expect()` em código de produção → **AVISO** (prefira `?`)
- `unsafe` sem comentário justificando → **AVISO**
- Clippy warnings não resolvidos → **AVISO**
- `clone()` excessivo sem justificativa → **SUGESTÃO**

### Testes
- Testes unitários no mesmo arquivo via `#[cfg(test)] mod tests`
- Testes de integração em `tests/`

---

## Java / Kotlin

### Checklist de qualidade
- `Exception` capturada genericamente sem log → **AVISO**
- `null` sem `@Nullable` / `@NonNull` → **AVISO**
- Ausência de testes para classes de serviço → **AVISO**
- Tipos raw em generics → **AVISO**

### Testes
- Framework: JUnit 5 com Mockito para mocks
- Estrutura: Arrange / Act / Assert com `@DisplayName` descritivo

---

## Prioridade de Cobertura de Testes (universal)

1. **Funções puras / lógica de domínio** — sem I/O, alto valor de regressão
2. **Validações e transformações de dados** — edge cases críticos
3. **Casos de erro** — entradas inválidas, nulos, listas vazias, valores extremos
4. **Integrações com I/O** — com mocks (banco, HTTP, filesystem)
5. **Endpoints / handlers HTTP** — com cliente de teste do framework

## Regras Universais de Teste

- Testar **comportamento observável**, não implementação interna
- Não criar testes que passam sempre (`assert True`, `assert 1 == 1`)
- Não usar caminhos absolutos hardcoded — usar diretórios temporários
- Não chamar APIs externas em testes — sempre mockar
- Não deixar `skip`/`xfail`/`todo` sem justificativa em comentário
- Fixtures compartilhadas no arquivo padrão da linguagem (`conftest.py`, `setup.ts`, etc.)

---

## Detecção de Linguagem sem AGENTS.md

| Arquivo encontrado | Linguagem | Gerenciador | Comando de teste padrão |
|---|---|---|---|
| `uv.lock` / `[tool.uv]` em `pyproject.toml` | Python | `uv` | `uv run pytest` |
| `pyproject.toml` / `requirements.txt` | Python | pip/poetry | `pytest` |
| `package.json` | TypeScript/JS | npm/pnpm | verificar `scripts.test` |
| `go.mod` | Go | — | `go test ./...` |
| `Cargo.toml` | Rust | cargo | `cargo test` |
| `pom.xml` / `build.gradle` | Java/Kotlin | maven/gradle | `mvn test` / `gradle test` |

```bash
# Detectar linguagem, gerenciador e Makefile
ls Makefile uv.lock pyproject.toml requirements.txt go.mod Cargo.toml pom.xml build.gradle package.json 2>/dev/null

# Detectar diretório de testes
find . -maxdepth 3 -type d \( -name "tests" -o -name "test" -o -name "__tests__" -o -name "spec" \) 2>/dev/null | grep -v node_modules | grep -v .git

# Detectar framework de testes em projetos Node
grep -E '"jest"|"vitest"|"mocha"|"jasmine"' package.json 2>/dev/null
```
