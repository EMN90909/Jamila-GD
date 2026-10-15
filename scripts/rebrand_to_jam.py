#!/usr/bin/env python3
"""Repository-wide Jamila -> Jamila / jam migration.

Dry run by default. Run with --apply from the repository root to modify the
working tree. Inspect the diff and run tests before committing.
"""
from __future__ import annotations
import argparse
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPLACEMENTS = (("JAM", "JAM"), ("Jamila", "Jamila"), ("jam", "jam"))
TEXT_EXTENSIONS = {
    ".ts", ".tsx", ".js", ".jsx", ".json", ".jsonc", ".md", ".mdx",
    ".yaml", ".yml", ".toml", ".xml", ".html", ".css", ".scss", ".less",
    ".sh", ".mjs", ".cjs", ".py", ".proto", ".txt", ".svg",
    ".sql", ".graphql", ".gql", ".properties", ".conf", ".ini",
}
SPECIAL_TEXT = {
    ".gitignore", ".gitattributes", ".npmrc", ".nvmrc",
    ".vscodeignore", ".codespellrc", ".prettierrc", ".prettierignore",
    "Dockerfile", "Makefile", "LICENSE", "CODEOWNERS",
}
SKIP_DIRS = {".git", "node_modules", ".next", "dist", "build", "coverage", ".venv"}
SKIP_PATHS = {".github/workflows"}


def rename(value: str) -> str:
    for old, new in REPLACEMENTS:
        value = value.replace(old, new)
    return value


def is_text(path: Path) -> bool:
    return path.suffix.lower() in TEXT_EXTENSIONS or path.name in SPECIAL_TEXT


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Perform changes (default: preview)")
    args = parser.parse_args()
    files: list[Path] = []
    for base, dirs, names in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not (Path(base) / d).is_symlink()]
        for name in names:
            path = Path(base) / name
            if path.is_file() and not path.is_symlink():
                files.append(path)

    changes: list[tuple[Path, Path, bytes | None]] = []
    original = set(files)
    destinations: set[Path] = set()
    for path in files:
        relative = path.relative_to(ROOT)
        if relative.parts[:2] == (".github", "workflows"):
            continue
        dest = ROOT / rename(str(relative))
        modified: bytes | None = None
        if is_text(path):
            raw = path.read_bytes()
            try:
                text = raw.decode("utf-8")
            except UnicodeDecodeError:
                text = ""
            if text:
                rewritten = rename(text)
                if rewritten != text:
                    modified = rewritten.encode("utf-8")
        if dest != path or modified is not None:
            if dest in destinations or (dest.exists() and dest not in original):
                raise SystemExit(f"Destination collision: {dest}")
            destinations.add(dest)
            changes.append((path, dest, modified))

    print(f"{len(changes)} files would change; --apply={args.apply}")
    if not args.apply:
        for src, dest, data in changes[:80]:
            print(f"  {src.relative_to(ROOT)} -> {dest.relative_to(ROOT)}" if src != dest
                  else f"  edit {src.relative_to(ROOT)}")
        return
    # Content edits happen before path moves; deepest paths move first.
    for src, _, data in changes:
        if data is not None:
            src.write_bytes(data)
    for src, dst, _ in sorted(changes, key=lambda c: len(c[0].parts), reverse=True):
        if src != dst:
            dst.parent.mkdir(parents=True, exist_ok=True)
            src.rename(dst)
    # Remove newly empty directories, but never .git or generated directories.
    for base, dirs, _ in os.walk(ROOT, topdown=False):
        current = Path(base)
        if current == ROOT or any(s in SKIP_DIRS for s in current.parts):
            continue
        try:
            current.rmdir()
        except OSError:
            pass
    print("Migration applied. Review external URLs, generated files, package names and tests.")


if __name__ == "__main__":
    main()
