/**
 * Init Agents Extension
 *
 * Registra o comando /init que detecta a stack do projeto e gera/atualiza
 * o AGENTS.md com todos os parâmetros necessários para os agentes e skills.
 *
 * Também injeta o conteúdo do AGENTS.md no system prompt a cada turno,
 * tornando todos os agentes agnósticos de linguagem e arquitetura.
 *
 * Uso:
 *   /init  →  detecta projeto, mostra preview, confirma, escreve AGENTS.md
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import * as fs from "node:fs";
import * as path from "node:path";

// ─── tipos ────────────────────────────────────────────────────────────────────

interface ProjectStack {
  name: string;
  description: string;
  languages: string[];
  frameworks: string[];
  packageManagers: { install: string; add: string; remove: string };
  commands: {
    build: string;
    test: string;
    testCoverage: string;
    lint: string;
    format: string;
    dev: string;
    migrate: string;
  };
  dirs: {
    src: string;
    tests: string;
    frontend: string;
    backend: string;
  };
  architecture: {
    style: string;
    layers: string;
  };
  conventions: {
    maxFunctionLines: number;
    maxFileLines: number;
    docLanguage: string;
    identifiers: string;
    notes: string[];
  };
  testFramework: string;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function safeReadJson(filePath: string): Record<string, unknown> {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return {};
  }
}

function safeReadText(filePath: string): string {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

/**
 * Substitui uma seção do AGENTS.md pelo novo bloco gerado.
 * Seções que não existam no arquivo são ignoradas (retorna o conteúdo original).
 */
function replaceSection(content: string, heading: string, newBlock: string): string {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`${escaped}[\\s\\S]*?(?=\\n## |$)`);
  return regex.test(content) ? content.replace(regex, newBlock) : content;
}

// ─── detecção de stack ────────────────────────────────────────────────────────

function detectProjectStack(cwd: string): ProjectStack {
  const stack: ProjectStack = {
    name: path.basename(cwd),
    description: "",
    languages: [],
    frameworks: [],
    packageManagers: { install: "", add: "", remove: "" },
    commands: {
      build: "",
      test: "",
      testCoverage: "",
      lint: "",
      format: "",
      dev: "",
      migrate: "",
    },
    dirs: {
      src: "src/",
      tests: "tests/",
      frontend: "(nenhum)",
      backend: "(nenhum)",
    },
    architecture: { style: "Flat", layers: "(não definido)" },
    conventions: {
      maxFunctionLines: 40,
      maxFileLines: 300,
      docLanguage: "Português brasileiro",
      identifiers: "Inglês",
      notes: [],
    },
    testFramework: "",
  };

  // ── Node.js / TypeScript ──────────────────────────────────────────────────
  const pkgPath = path.join(cwd, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = safeReadJson(pkgPath) as {
      name?: string;
      description?: string;
      scripts?: Record<string, string>;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    stack.name = pkg.name ?? stack.name;
    stack.description = pkg.description ?? "";
    stack.languages.push("TypeScript");
    stack.packageManagers = {
      install: "npm install",
      add: "npm install <pacote>",
      remove: "npm uninstall <pacote>",
    };

    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    const scripts = pkg.scripts ?? {};

    // Frameworks
    if (allDeps["next"])    stack.frameworks.push("Next.js");
    if (allDeps["react"])   stack.frameworks.push("React");
    if (allDeps["vue"])     stack.frameworks.push("Vue");
    if (allDeps["svelte"])  stack.frameworks.push("Svelte");
    if (allDeps["express"]) stack.frameworks.push("Express");
    if (allDeps["fastify"]) stack.frameworks.push("Fastify");
    if (allDeps["hono"])    stack.frameworks.push("Hono");

    // Gerenciador de pacotes alternativo
    if (fs.existsSync(path.join(cwd, "pnpm-lock.yaml"))) {
      stack.packageManagers = {
        install: "pnpm install",
        add: "pnpm add <pacote>",
        remove: "pnpm remove <pacote>",
      };
    } else if (fs.existsSync(path.join(cwd, "bun.lockb"))) {
      stack.packageManagers = {
        install: "bun install",
        add: "bun add <pacote>",
        remove: "bun remove <pacote>",
      };
    }

    // Framework de testes
    if (allDeps["vitest"])    stack.testFramework = "vitest";
    else if (allDeps["jest"]) stack.testFramework = "jest";

    // Comandos via scripts do package.json
    if (scripts["build"])          stack.commands.build        = "npm run build";
    if (scripts["test"])           stack.commands.test         = "npm test";
    if (scripts["test:coverage"])  stack.commands.testCoverage = "npm run test:coverage";
    if (scripts["lint"])           stack.commands.lint         = "npm run lint";
    if (scripts["format"])         stack.commands.format       = "npm run format";
    if (scripts["dev"])            stack.commands.dev          = "npm run dev";

    // Fallback para test sem script
    if (!stack.commands.test && stack.testFramework) {
      stack.commands.test = `npx ${stack.testFramework}`;
    }

    // Estrutura de diretórios
    if (fs.existsSync(path.join(cwd, "lib")))       stack.dirs.src   = "lib/";
    if (fs.existsSync(path.join(cwd, "__tests__"))) stack.dirs.tests = "__tests__/";
    if (fs.existsSync(path.join(cwd, "test")))      stack.dirs.tests = "test/";

    // Next.js
    if (allDeps["next"]) {
      if (fs.existsSync(path.join(cwd, "app")))   stack.dirs.src = "app/";
      if (fs.existsSync(path.join(cwd, "pages"))) stack.dirs.src = "pages/";
      stack.architecture.style = "Next.js App Router";
    }

    stack.conventions.notes.push(
      "TypeScript estrito: sem `any` implícito, sem variáveis não usadas"
    );
  }

  // ── Python ────────────────────────────────────────────────────────────────
  const pyprojectPath = path.join(cwd, "pyproject.toml");
  if (fs.existsSync(pyprojectPath)) {
    const raw = safeReadText(pyprojectPath);
    stack.languages.push("Python");

    // Gerenciador
    const hasUv     = raw.includes("[tool.uv]") || fs.existsSync(path.join(cwd, "uv.lock"));
    const hasPoetry = raw.includes("[tool.poetry]");
    const hasPdm    = raw.includes("[tool.pdm]");

    if (hasUv) {
      stack.packageManagers = {
        install: "uv sync",
        add: "uv add <pacote>",
        remove: "uv remove <pacote>",
      };
      stack.commands.test         = "uv run pytest tests/";
      stack.commands.testCoverage = "uv run pytest tests/ --cov=src --cov-report=term-missing";
      stack.commands.lint         = "uv run ruff check .";
      stack.commands.format       = "uv run ruff format .";
    } else if (hasPoetry) {
      stack.packageManagers = {
        install: "poetry install",
        add: "poetry add <pacote>",
        remove: "poetry remove <pacote>",
      };
      stack.commands.test   = "poetry run pytest tests/";
      stack.commands.lint   = "poetry run ruff check .";
      stack.commands.format = "poetry run ruff format .";
    } else if (hasPdm) {
      stack.packageManagers = {
        install: "pdm install",
        add: "pdm add <pacote>",
        remove: "pdm remove <pacote>",
      };
      stack.commands.test = "pdm run pytest tests/";
    } else {
      stack.packageManagers = {
        install: "pip install -r requirements.txt",
        add: "pip install <pacote>",
        remove: "pip uninstall <pacote>",
      };
      stack.commands.test = "pytest tests/";
    }

    // Nome e descrição
    const nameMatch = raw.match(/^name\s*=\s*["']([^"']+)["']/m);
    if (nameMatch) stack.name = nameMatch[1]!;
    const descMatch = raw.match(/^description\s*=\s*["']([^"']+)["']/m);
    if (descMatch) stack.description = descMatch[1]!;

    // Versão Python
    const pyVersionMatch = raw.match(/python\s*[>=<]+\s*"?([0-9.]+)/);
    const pyIdx = stack.languages.indexOf("Python");
    if (pyVersionMatch && pyIdx >= 0) {
      stack.languages[pyIdx] = `Python ${pyVersionMatch[1]}`;
    }

    // Frameworks
    if (raw.includes("fastapi"))    stack.frameworks.push("FastAPI");
    if (raw.includes("django"))     stack.frameworks.push("Django");
    if (raw.includes("flask"))      stack.frameworks.push("Flask");
    if (raw.includes("litestar"))   stack.frameworks.push("Litestar");
    if (raw.includes("sqlalchemy")) stack.frameworks.push("SQLAlchemy");
    if (raw.includes("alembic")) {
      stack.frameworks.push("Alembic");
      stack.commands.migrate = hasUv
        ? "uv run alembic upgrade head"
        : "alembic upgrade head";
    }

    stack.testFramework = "pytest";
    stack.conventions.notes.push(
      "Python: `X | None`, `list[str]` — nunca `Optional`/`Union` de `typing`"
    );
    stack.conventions.notes.push(
      "Pydantic v2: `.model_dump()`, `field_validator`, `model_json_schema()`"
    );

    // Estrutura
    if (fs.existsSync(path.join(cwd, "backend")))  stack.dirs.backend  = "backend/";
    if (fs.existsSync(path.join(cwd, "frontend"))) stack.dirs.frontend = "frontend/";

    // Arquitetura em camadas
    const hasDomain = fs.existsSync(path.join(cwd, "src", "domain"));
    const hasApp    = fs.existsSync(path.join(cwd, "src", "application"));
    const hasInfra  = fs.existsSync(path.join(cwd, "src", "infrastructure"));
    if (hasDomain && hasApp && hasInfra) {
      stack.architecture.style  = "Hexagonal / Camadas";
      stack.architecture.layers =
        "`src/domain/` → `src/application/` → `src/infrastructure/` → `backend/`";
    }
  }

  // ── Go ────────────────────────────────────────────────────────────────────
  const goModPath = path.join(cwd, "go.mod");
  if (fs.existsSync(goModPath)) {
    const raw = safeReadText(goModPath);
    stack.languages.push("Go");

    const goVersionMatch = raw.match(/^go\s+([0-9.]+)/m);
    const goIdx = stack.languages.indexOf("Go");
    if (goVersionMatch && goIdx >= 0) {
      stack.languages[goIdx] = `Go ${goVersionMatch[1]}`;
    }

    stack.packageManagers = {
      install: "go mod download",
      add: "go get <pacote>",
      remove: "go mod tidy",
    };
    stack.commands.build        = "go build ./...";
    stack.commands.test         = "go test ./...";
    stack.commands.testCoverage = "go test ./... -coverprofile=coverage.out";
    stack.commands.lint         = "golangci-lint run";
    stack.commands.format       = "gofmt -w .";
    stack.testFramework         = "go test";
    stack.dirs.src              = "cmd/ + internal/";
    stack.dirs.tests            = "(colocados junto ao código — _test.go)";
  }

  // ── Rust ──────────────────────────────────────────────────────────────────
  const cargoPath = path.join(cwd, "Cargo.toml");
  if (fs.existsSync(cargoPath)) {
    const raw = safeReadText(cargoPath);
    stack.languages.push("Rust");

    stack.packageManagers = {
      install: "cargo build",
      add: "cargo add <pacote>",
      remove: "cargo remove <pacote>",
    };
    stack.commands.build        = "cargo build";
    stack.commands.test         = "cargo test";
    stack.commands.testCoverage = "cargo tarpaulin";
    stack.commands.lint         = "cargo clippy";
    stack.commands.format       = "cargo fmt";
    stack.testFramework         = "cargo test";
    stack.dirs.src              = "src/";
    stack.dirs.tests            = "tests/";

    const nameMatch = raw.match(/^name\s*=\s*["']([^"']+)["']/m);
    if (nameMatch) stack.name = nameMatch[1]!;
  }

  // ── Java / Maven ──────────────────────────────────────────────────────────
  if (fs.existsSync(path.join(cwd, "pom.xml"))) {
    stack.languages.push("Java");
    stack.packageManagers = {
      install: "mvn install",
      add: "(adicionar em pom.xml)",
      remove: "(remover de pom.xml)",
    };
    stack.commands.build        = "mvn package";
    stack.commands.test         = "mvn test";
    stack.commands.testCoverage = "mvn jacoco:report";
    stack.commands.lint         = "mvn checkstyle:check";
    stack.testFramework         = "JUnit";
  }

  // ── Java / Kotlin (Gradle) ────────────────────────────────────────────────
  const hasGradle    = fs.existsSync(path.join(cwd, "build.gradle"));
  const hasGradleKts = fs.existsSync(path.join(cwd, "build.gradle.kts"));
  if (hasGradle || hasGradleKts) {
    stack.languages.push(hasGradleKts ? "Kotlin" : "Java");
    stack.packageManagers = {
      install: "./gradlew build",
      add: "(adicionar em build.gradle)",
      remove: "(remover de build.gradle)",
    };
    stack.commands.build        = "./gradlew build";
    stack.commands.test         = "./gradlew test";
    stack.commands.testCoverage = "./gradlew jacocoTestReport";
    stack.commands.lint         = "./gradlew ktlintCheck";
    stack.testFramework         = "JUnit";
  }

  // ── Monorepo: frontend separado ───────────────────────────────────────────
  const frontendPkg = path.join(cwd, "frontend", "package.json");
  if (
    fs.existsSync(frontendPkg) &&
    stack.languages.length > 0 &&
    !stack.languages.includes("TypeScript")
  ) {
    const pkg = safeReadJson(frontendPkg) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (allDeps["react"] || allDeps["vue"] || allDeps["next"]) {
      stack.languages.push("TypeScript");
      stack.dirs.frontend = "frontend/";
    }
  }

  return stack;
}

// ─── geradores de seção (auto-detectadas) ───────────────────────────────────

function genStackSection(s: ProjectStack): string {
  const lines: string[] = [];
  lines.push(`## Stack`);
  lines.push(``);
  lines.push(`- **Linguagem(s):** ${s.languages.join(", ") || "(preencher manualmente)"}`);
  if (s.frameworks.length > 0)
    lines.push(`- **Frameworks:** ${s.frameworks.join(", ")}`);
  lines.push(``);
  return lines.join("\n");
}

function genPackageManagerSection(s: ProjectStack): string {
  const lines: string[] = [];
  lines.push(`## Gerenciamento de Dependências`);
  lines.push(``);
  if (s.packageManagers.install)
    lines.push(`- **Instalar tudo:** \`${s.packageManagers.install}\``);
  if (s.packageManagers.add)
    lines.push(`- **Adicionar pacote:** \`${s.packageManagers.add}\``);
  if (s.packageManagers.remove)
    lines.push(`- **Remover pacote:** \`${s.packageManagers.remove}\``);
  lines.push(``);
  return lines.join("\n");
}

function genCommandsSection(s: ProjectStack): string {
  const lines: string[] = [];
  lines.push(`## Comandos Essenciais`);
  lines.push(``);
  const cmds: [string, string][] = [
    ["Build",      s.commands.build],
    ["Dev server", s.commands.dev],
    ["Testes",     s.commands.test],
    ["Cobertura",  s.commands.testCoverage],
    ["Lint",       s.commands.lint],
    ["Formato",    s.commands.format],
    ["Migrações",  s.commands.migrate],
  ];
  for (const [label, cmd] of cmds) {
    if (cmd) lines.push(`- **${label}:** \`${cmd}\``);
  }
  lines.push(``);
  return lines.join("\n");
}

function genTestsSection(s: ProjectStack): string {
  const lines: string[] = [];
  lines.push(`## Testes`);
  lines.push(``);
  lines.push(`- **Framework:** ${s.testFramework || "(preencher manualmente)"}`);
  lines.push(`- **Diretório:** \`${s.dirs.tests}\``);
  if (s.commands.test)
    lines.push(`- **Executar todos:** \`${s.commands.test}\``);
  if (s.commands.testCoverage)
    lines.push(`- **Com cobertura:** \`${s.commands.testCoverage}\``);
  lines.push(``);
  return lines.join("\n");
}

// ─── geração do AGENTS.md ─────────────────────────────────────────────────────

function generateAgentsMd(s: ProjectStack): string {
  const lines: string[] = [];

  lines.push(`# AGENTS.md`);
  lines.push(``);
  lines.push(
    `> Arquivo gerado por \`/init\`. Edite manualmente para ajustar convenções.`
  );
  lines.push(``);

  // Projeto
  lines.push(`## Projeto`);
  lines.push(``);
  lines.push(`- **Nome:** ${s.name}`);
  if (s.description) lines.push(`- **Descrição:** ${s.description}`);
  lines.push(``);

  // Stack (usa gerador de seção)
  lines.push(genStackSection(s));

  // Gerenciamento de dependências (usa gerador de seção)
  lines.push(genPackageManagerSection(s));

  // Comandos (usa gerador de seção)
  lines.push(genCommandsSection(s));

  // Estrutura de diretórios
  lines.push(`## Estrutura de Diretórios`);
  lines.push(``);
  lines.push(`- **Código principal:** \`${s.dirs.src}\``);
  lines.push(`- **Testes:** \`${s.dirs.tests}\``);
  if (s.dirs.frontend !== "(nenhum)")
    lines.push(`- **Frontend:** \`${s.dirs.frontend}\``);
  if (s.dirs.backend !== "(nenhum)")
    lines.push(`- **Backend/API:** \`${s.dirs.backend}\``);
  lines.push(``);

  // Arquitetura
  lines.push(`## Arquitetura`);
  lines.push(``);
  lines.push(`- **Estilo:** ${s.architecture.style}`);
  if (s.architecture.layers !== "(não definido)") {
    lines.push(`- **Camadas:** ${s.architecture.layers}`);
    lines.push(
      `- **Regra:** dependências sempre apontam para dentro (camadas internas não importam externas)`
    );
  }
  lines.push(``);

  // Testes (usa gerador de seção)
  lines.push(genTestsSection(s));

  // Convenções
  lines.push(`## Convenções de Código`);
  lines.push(``);
  lines.push(
    `- **Tamanho máximo de função:** ${s.conventions.maxFunctionLines} linhas`
  );
  lines.push(
    `- **Tamanho máximo de arquivo:** ${s.conventions.maxFileLines} linhas`
  );
  lines.push(`- **Aninhamento máximo:** 3 níveis`);
  lines.push(`- **Docstrings / comentários:** ${s.conventions.docLanguage}`);
  lines.push(
    `- **Identificadores (variáveis, funções, classes):** ${s.conventions.identifiers}`
  );
  for (const note of s.conventions.notes) {
    lines.push(`- ${note}`);
  }
  lines.push(``);

  lines.push(`## Commits`);
  lines.push(``);
  lines.push(`Este projeto segue o padrão **Conventional Commits**.`);
  lines.push(`Antes de commitar, carregue a skill de commit:`);
  lines.push(``);
  lines.push(`\`\`\``);
  lines.push(`/skill:git-commit-push`);
  lines.push(`\`\`\``);
  lines.push(``);
  lines.push(`Ou siga diretamente as regras em \`.agents/skills/git-commit-push/SKILL.md\`.`);
  lines.push(``);

  // Agentes
  lines.push(`## Agentes e Skills`);
  lines.push(``);
  lines.push(`| Agente    | Função                                         | Modo                   |`);
  lines.push(`|-----------|------------------------------------------------|------------------------|`);
  lines.push(`| \`build\`   | Implementa funcionalidades e corrige bugs      | escrita completa       |`);
  lines.push(`| \`ask\`     | Responde perguntas somente-leitura             | somente-leitura        |`);
  lines.push(`| \`plan\`    | Cria planos detalhados em \`.pi/plans/\`         | escrita em .pi/plans/  |`);
  lines.push(`| \`quality\` | Auditoria de qualidade de código               | bash + leitura         |`);
  lines.push(`| \`qa\`      | Análise de bugs e edge cases                   | bash + leitura         |`);
  lines.push(`| \`test\`    | Cria e mantém testes automatizados             | escrita em tests/      |`);
  lines.push(`| \`doc\`     | Cria documentação técnica em \`docs/\`           | escrita em docs/       |`);
  lines.push(``);

  return lines.join("\n");
}

// ─── atualização inteligente (preserva edições manuais) ──────────────────────

/**
 * Atualiza apenas as seções auto-detectadas do AGENTS.md existente,
 * preservando seções editadas manualmente (Projeto, Estrutura de Diretórios,
 * Arquitetura, Convenções de Código, Commits, Agentes e Skills).
 */
function updateAgentsMd(existing: string, s: ProjectStack): string {
  const autoSections: Array<[string, string]> = [
    ["## Stack",                        genStackSection(s)],
    ["## Gerenciamento de Dependências", genPackageManagerSection(s)],
    ["## Comandos Essenciais",           genCommandsSection(s)],
    ["## Testes",                        genTestsSection(s)],
  ];
  return autoSections.reduce(
    (content, [heading, newBlock]) => replaceSection(content, heading, newBlock),
    existing
  );
}

// ─── extensão principal ───────────────────────────────────────────────────────

export default function (pi: ExtensionAPI) {
  // Nota: o pi injeta AGENTS.md no contexto nativamente — não é necessário
  // fazer isso manualmente via before_agent_start.

  // ── Comando /init ─────────────────────────────────────────────────────────
  pi.registerCommand("init", {
    description:
      "Detecta a stack do projeto e cria/atualiza AGENTS.md com as convenções",
    handler: async (_args, ctx) => {
      const cwd = ctx.cwd;
      const agentsPath = path.join(cwd, "AGENTS.md");
      const exists = fs.existsSync(agentsPath);

      ctx.ui.notify("Detectando stack do projeto...", "info");

      const detected = detectProjectStack(cwd);

      // Stack não detectada
      if (detected.languages.length === 0) {
        if (exists) {
          ctx.ui.notify(
            "Nenhuma stack detectada. AGENTS.md existente foi mantido sem alterações.",
            "warning"
          );
          return;
        }
        const ok = await ctx.ui.confirm(
          "Stack não detectada",
          "Nenhum manifesto encontrado (package.json, pyproject.toml, go.mod, Cargo.toml, pom.xml).\n\n" +
            "Deseja criar um AGENTS.md em branco para preencher manualmente?"
        );
        if (!ok) return;
        const blank = generateAgentsMd({
          ...detected,
          languages: ["(preencher manualmente)"],
        });
        fs.writeFileSync(agentsPath, blank, "utf8");
        ctx.ui.notify(
          "AGENTS.md criado em branco. Edite as seções manualmente.",
          "warning"
        );
        return;
      }

      // Preview para confirmação
      const updateNote = exists
        ? "\n\nℹ️  Seções detectadas (Stack, Dependências, Comandos, Testes) serão atualizadas.\nSeções editadas manualmente serão preservadas."
        : "";
      const summary = [
        `Projeto: ${detected.name}`,
        `Linguagem(s): ${detected.languages.join(", ")}`,
        detected.frameworks.length > 0
          ? `Frameworks: ${detected.frameworks.join(", ")}`
          : "",
        `Testes: ${detected.testFramework || "não detectado"}`,
        `Arquitetura: ${detected.architecture.style}`,
      ]
        .filter(Boolean)
        .join("\n");

      const action = exists ? "Atualizar" : "Criar";
      const ok = await ctx.ui.confirm(
        `${action} AGENTS.md`,
        `${summary}${updateNote}\n\nDeseja ${action.toLowerCase()} o AGENTS.md?`
      );

      if (!ok) {
        ctx.ui.notify("Operação cancelada.", "info");
        return;
      }

      const content = exists
        ? updateAgentsMd(fs.readFileSync(agentsPath, "utf8"), detected)
        : generateAgentsMd(detected);
      fs.writeFileSync(agentsPath, content, "utf8");
      ctx.ui.notify(
        `✅ AGENTS.md ${exists ? "atualizado" : "criado"} — ${agentsPath}`,
        "success"
      );
    },
  });
}
