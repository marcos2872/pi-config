"""Extrai um item de uma biblioteca .excalidrawlib e gera elementos prontos para
inserir no array `elements[]` de um arquivo .excalidraw.

Normaliza coordenadas para (x, y), reescala para a largura alvo e gera novos
IDs únicos para evitar colisões com elementos existentes no diagrama.

Uso:
    cd .agents/skills/excalidraw/references
    uv run python extract_lib_item.py <lib-file> <item-name> [--x 0] [--y 0] [--width 80]

Exemplos:
    uv run python extract_lib_item.py icons.excalidrawlib python --x 200 --y 150 --width 80
    uv run python extract_lib_item.py icons.excalidrawlib react --x 400 --y 150 --width 60
    uv run python extract_lib_item.py system-design-template.excalidrawlib flow --x 100 --y 100
    uv run python extract_lib_item.py icons.excalidrawlib --list
    uv run python extract_lib_item.py system-design-template.excalidrawlib --list

Saída:
    Array JSON de elementos prontos para copiar para o campo `elements[]`.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import random
import string
import sys
from pathlib import Path


# Nomes amigáveis para itens do system-design-template (formato v1 — indexado)
SYSTEM_DESIGN_NAMES = {
    "steps": 0,
    "flow": 1,
    "note": 2,
    "table": 3,
    "separator": 4,
    "code-block": 5,
    "system-diagram": 6,
    "node-circle": 7,
}


def _salt() -> str:
    return "".join(random.choices(string.ascii_lowercase + string.digits, k=10))


def _new_id(old_id: str, mapping: dict[str, str], salt: str) -> str:
    """Retorna ID mapeado, criando um novo se necessário."""
    if old_id not in mapping:
        h = hashlib.sha256(f"{salt}:{old_id}".encode()).hexdigest()[:21]
        mapping[old_id] = h
    return mapping[old_id]


def _bounding_box(elements: list[dict]) -> tuple[float, float, float, float]:
    """Retorna (min_x, min_y, max_x, max_y) dos elementos."""
    xs, ys, x2s, y2s = [], [], [], []
    for e in elements:
        x, y = e.get("x", 0), e.get("y", 0)
        w, h = e.get("width", 0), e.get("height", 0)
        if e.get("type") in ("arrow", "line") and "points" in e:
            for px, py in e["points"]:
                xs.append(x + px)
                ys.append(y + py)
                x2s.append(x + px)
                y2s.append(y + py)
        else:
            xs.append(x)
            ys.append(y)
            x2s.append(x + abs(w))
            y2s.append(y + abs(h))
    if not xs:
        return (0.0, 0.0, 80.0, 80.0)
    return (min(xs), min(ys), max(x2s), max(y2s))


def _load_item(lib_path: Path, item_name: str) -> list[dict]:
    """Carrega os elementos de um item de biblioteca pelo nome."""
    with open(lib_path, encoding="utf-8") as f:
        data = json.load(f)

    items = data.get("libraryItems", data.get("library", []))
    if not items:
        raise ValueError(f"Nenhum item encontrado em {lib_path.name}")

    # Formato v2: lista de dicts com 'name' e 'elements'
    if isinstance(items[0], dict) and "name" in items[0]:
        for item in items:
            if item.get("name") == item_name:
                return item.get("elements", [])
        available = [i.get("name", "?") for i in items]
        raise ValueError(
            f"Item '{item_name}' não encontrado em {lib_path.name}.\n"
            f"Disponíveis: {', '.join(available)}"
        )

    # Formato v1: lista de listas, usa mapeamento de nomes amigáveis
    name_lower = item_name.lower()
    if name_lower in SYSTEM_DESIGN_NAMES:
        idx = SYSTEM_DESIGN_NAMES[name_lower]
        return items[idx]

    # Tenta como índice numérico
    try:
        idx = int(item_name)
        return items[idx]
    except (ValueError, IndexError):
        pass

    available = list(SYSTEM_DESIGN_NAMES.keys())
    raise ValueError(
        f"Item '{item_name}' não encontrado em {lib_path.name}.\n"
        f"Nomes disponíveis: {', '.join(available)}\n"
        f"Ou use índice numérico (0–{len(items)-1})"
    )


def _list_items(lib_path: Path) -> None:
    """Lista todos os itens disponíveis na biblioteca."""
    with open(lib_path, encoding="utf-8") as f:
        data = json.load(f)

    items = data.get("libraryItems", data.get("library", []))
    if not items:
        print("Nenhum item encontrado.")
        return

    if isinstance(items[0], dict) and "name" in items[0]:
        print(f"\n{lib_path.name} ({len(items)} itens):")
        for item in items:
            els = item.get("elements", [])
            print(f"  {item.get('name','?'):30s} {len(els)} elementos")
    else:
        print(f"\n{lib_path.name} ({len(items)} itens — formato v1):")
        for name, idx in SYSTEM_DESIGN_NAMES.items():
            if idx < len(items):
                print(f"  {name:30s} índice {idx}, {len(items[idx])} elementos")


def extract(
    lib_path: Path,
    item_name: str,
    target_x: float = 0.0,
    target_y: float = 0.0,
    target_width: float | None = None,
) -> list[dict]:
    """
    Extrai e posiciona elementos de um item de biblioteca.

    Args:
        lib_path: Caminho para o arquivo .excalidrawlib
        item_name: Nome do item (ou índice numérico para formato v1)
        target_x: Coordenada X de destino no diagrama
        target_y: Coordenada Y de destino no diagrama
        target_width: Largura alvo em px (None = tamanho original)

    Returns:
        Lista de elementos prontos para inserir em `elements[]`
    """
    elements = _load_item(lib_path, item_name)
    if not elements:
        return []

    min_x, min_y, max_x, max_y = _bounding_box(elements)
    orig_w = max_x - min_x
    orig_h = max_y - min_y

    scale = (target_width / orig_w) if (target_width and orig_w > 0) else 1.0

    salt = _salt()
    id_map: dict[str, str] = {}

    # Coletar todos os IDs (elementos + grupos)
    for e in elements:
        if e.get("id"):
            _new_id(e["id"], id_map, salt)
        for gid in e.get("groupIds", []):
            if gid:
                _new_id(gid, id_map, salt)

    result = []
    for e in elements:
        ne = dict(e)

        # Reposicionar e reescalar
        ne["x"] = (e.get("x", 0) - min_x) * scale + target_x
        ne["y"] = (e.get("y", 0) - min_y) * scale + target_y
        if "width" in e:
            ne["width"] = e["width"] * scale
        if "height" in e:
            ne["height"] = e["height"] * scale

        # Reescalar pontos de linhas/setas (relativos a x,y)
        if "points" in e and scale != 1.0:
            ne["points"] = [[p[0] * scale, p[1] * scale] for p in e["points"]]

        # Atualizar IDs
        if e.get("id"):
            ne["id"] = id_map[e["id"]]
        ne["groupIds"] = [id_map.get(gid, gid) for gid in e.get("groupIds", [])]

        # Atualizar containerId
        if e.get("containerId"):
            ne["containerId"] = id_map.get(e["containerId"], e["containerId"])

        # Atualizar boundElements
        if e.get("boundElements"):
            ne["boundElements"] = [
                {**be, "id": id_map.get(be.get("id", ""), be.get("id", ""))}
                for be in e["boundElements"]
            ]

        # Atualizar bindings de setas
        for key in ("startBinding", "endBinding"):
            if e.get(key) and isinstance(e[key], dict):
                old_eid = e[key].get("elementId", "")
                ne[key] = {**e[key], "elementId": id_map.get(old_eid, old_eid)}

        result.append(ne)

    return result


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Extrai item de .excalidrawlib para elementos Excalidraw"
    )
    parser.add_argument(
        "lib",
        type=Path,
        help="Caminho para o arquivo .excalidrawlib",
    )
    parser.add_argument(
        "item",
        nargs="?",
        default=None,
        help="Nome do item (use --list para ver opções)",
    )
    parser.add_argument("--x", type=float, default=0.0, help="Coordenada X de destino")
    parser.add_argument("--y", type=float, default=0.0, help="Coordenada Y de destino")
    parser.add_argument(
        "--width", type=float, default=None, help="Largura alvo em px (padrão: tamanho original)"
    )
    parser.add_argument(
        "--list", action="store_true", help="Listar itens disponíveis na biblioteca"
    )
    args = parser.parse_args()

    lib_path = args.lib if args.lib.is_absolute() else Path(__file__).parent / args.lib

    if not lib_path.exists():
        print(f"ERRO: arquivo não encontrado: {lib_path}", file=sys.stderr)
        sys.exit(1)

    if args.list:
        _list_items(lib_path)
        return

    if not args.item:
        print("ERRO: informe o nome do item ou use --list", file=sys.stderr)
        sys.exit(1)

    elements = extract(lib_path, args.item, args.x, args.y, args.width)
    print(json.dumps(elements, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
