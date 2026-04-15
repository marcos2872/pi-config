import { existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

/**
 * Registra os caminhos canônicos de agentes e skills do diretório agents/
 * para que o pi os descubra nativamente via resources_discover.
 *
 * Prioridade: paths locais do projeto (cwd) quando existirem;
 * caso contrário, fallback para ~/agents (symlink global do pi-config).
 *
 * Agentes (Alt+A, /agent): agents/agents/
 * Skills de suporte (/skill:nome): agents/skills/
 */

const GLOBAL_BASE = join(homedir(), "agents");

export default function (pi: ExtensionAPI) {
  pi.on("resources_discover", (event) => {
    const localAgents = join(event.cwd, "agents", "agents");
    const localSkills = join(event.cwd, "agents", "skills");
    const globalAgents = join(GLOBAL_BASE, "agents");
    const globalSkills = join(GLOBAL_BASE, "skills");

    const skillPaths: string[] = [];

    // Agentes: local tem prioridade; fallback para global
    if (existsSync(localAgents)) skillPaths.push(localAgents);
    else if (existsSync(globalAgents)) skillPaths.push(globalAgents);

    // Skills: sempre registra local (se existir) + global
    if (existsSync(localSkills)) skillPaths.push(localSkills);
    if (existsSync(globalSkills) && globalSkills !== localSkills) skillPaths.push(globalSkills);

    return { skillPaths };
  });
}
