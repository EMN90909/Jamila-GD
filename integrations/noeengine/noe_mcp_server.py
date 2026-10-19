#!/usr/bin/env python3
"""Jamila's NoeEngine project MCP (stdio/JSON-RPC 2.0).

Adapted from EMN90909/Jamila-GD integrations/noeengine/noe_mcp_server.py.
Read tools are available without permission. Mutations and validation demand
a one-time secret supplied by the local agent only AFTER user approval.
"""
import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path, PurePosixPath

MAX_BYTES = 96000
READ_EXTS = {".gd", ".nqr", ".tscn", ".tres", ".gdshader", ".shader", ".cs", ".json", ".cfg", ".ini"}
WRITE_EXTS = {".gd", ".nqr", ".tscn", ".tres", ".gdshader", ".shader"}
BLOCKED = {".git", ".godot", ".import", ".agents", ".claude", ".github", "node_modules", ".venv", "__pycache__"}
TOOLS = [
    {"name": "noe_project_info", "description": "Read NoeEngine project metadata.",
     "inputSchema": {"type": "object", "properties": {}, "additionalProperties": False}},
    {"name": "noe_list_assets", "description": "List project scenes, scripts and text assets.",
     "inputSchema": {"type": "object", "properties": {"directory": {"type": "string"}, "limit": {"type": "integer", "minimum": 1, "maximum": 100}}, "additionalProperties": False}},
    {"name": "noe_read_asset", "description": "Read a project text asset.",
     "inputSchema": {"type": "object", "properties": {"path": {"type": "string"}}, "required": ["path"], "additionalProperties": False}},
    {"name": "noe_scene_summary", "description": "Summarize a .tscn scene's nodes and resources.",
     "inputSchema": {"type": "object", "properties": {"path": {"type": "string"}}, "required": ["path"], "additionalProperties": False}},
    {"name": "noe_write_asset", "description": "Create or update a game text asset after explicit user approval.",
     "inputSchema": {"type": "object", "properties": {"path": {"type": "string"}, "content": {"type": "string"}, "overwrite": {"type": "boolean"}, "approval_token": {"type": "string"}}, "required": ["path", "content", "approval_token"], "additionalProperties": False}},
    {"name": "noe_validate_project", "description": "Run the exact NoeEngine binary in headless editor import/parse mode after approval (no shell).",
     "inputSchema": {"type": "object", "properties": {"approval_token": {"type": "string"}}, "required": ["approval_token"], "additionalProperties": False}},
]

class ProjectTools:
    def __init__(self, root, engine="", approval=""):
        self.root = Path(root).expanduser().resolve()
        self.engine = Path(engine).expanduser().resolve() if engine else None
        self.approval = approval
        if not (self.root / "project.godot").is_file():
            raise ValueError("Select a valid project containing project.godot")

    def path(self, value, writing=False):
        if not isinstance(value, str) or not value or len(value) > 320 or "\\" in value:
            raise ValueError("Invalid relative asset path")
        rel = PurePosixPath(value)
        if rel.is_absolute() or any(part in ("", ".", "..") or part.startswith(".") or part in BLOCKED for part in rel.parts):
            raise ValueError("Path must remain within the game project")
        p = self.root.joinpath(*rel.parts)
        if p.suffix.lower() not in (WRITE_EXTS if writing else READ_EXTS):
            raise ValueError("Unsupported game asset extension")
        for parent in (p, *list(p.parents)):
            if parent == self.root.parent:
                break
            if parent.is_symlink():
                raise ValueError("Symbolic links are not permitted")
        if not p.resolve().is_relative_to(self.root):
            raise ValueError("Asset escaped project root")
        return p

    def require_approval(self, args):
        import hmac
        supplied = args.get("approval_token")
        if not self.approval or not isinstance(supplied, str) or not hmac.compare_digest(supplied, self.approval):
            raise PermissionError("User approval required")

    def call(self, name, args):
        if name == "noe_project_info":
            config = (self.root / "project.godot").read_text(encoding="utf8")[:12000]
            # Do not expose arbitrary project settings that may contain secrets.
            title = re.search(r'^config/name="([^"]+)"', config, re.M)
            return {"project_exists": True, "project_name": title.group(1) if title else self.root.name}
        if name == "noe_list_assets":
            rel = args.get("directory", "")
            base = self.root if not rel else self.root.joinpath(*PurePosixPath(rel).parts)
            if rel and (not isinstance(rel, str) or rel.startswith("/") or ".." in PurePosixPath(rel).parts):
                raise ValueError("Invalid asset directory")
            if not base.is_dir() or base.is_symlink() or not base.resolve().is_relative_to(self.root):
                raise ValueError("Invalid project directory")
            limit = max(1, min(100, int(args.get("limit", 60))))
            entries = []
            for p in sorted(base.rglob("*")):
                if len(entries) >= limit:
                    break
                relative = p.relative_to(self.root)
                if any(part.startswith(".") or part in BLOCKED for part in relative.parts) or p.is_symlink():
                    continue
                if p.is_file() and p.suffix.lower() in READ_EXTS:
                    entries.append(relative.as_posix())
            return {"assets": entries, "limit": limit}
        if name in ("noe_read_asset", "noe_scene_summary"):
            p = self.path(args.get("path"))
            if not p.is_file() or p.stat().st_size > MAX_BYTES:
                raise ValueError("Missing or oversized asset")
            content = p.read_text(encoding="utf8")
            if name == "noe_read_asset":
                return {"path": p.relative_to(self.root).as_posix(), "content": content}
            if p.suffix != ".tscn":
                raise ValueError("Scene summary requires .tscn")
            lines = content.splitlines()
            nodes = [line for line in lines if line.startswith("[node ")]
            resources = [line for line in lines if line.startswith(("[ext_resource ", "[sub_resource "))]
            return {"nodes": nodes[:120], "resources": resources[:80], "node_count": len(nodes)}
        if name == "noe_write_asset":
            self.require_approval(args)
            p = self.path(args.get("path"), writing=True)
            content = args.get("content")
            if not isinstance(content, str) or len(content.encode("utf8")) > MAX_BYTES:
                raise ValueError("Asset is not text or exceeds 96 kB")
            if p.exists() and not args.get("overwrite", False):
                raise ValueError("Existing files require explicit overwrite in the approved plan")
            # The approval UI must show the full proposed content; this tool only
            # accepts server-held approved plans, never raw browser write requests.
            p.parent.mkdir(parents=True, exist_ok=True)
            original = p.read_bytes() if p.exists() else None
            fd, temp = tempfile.mkstemp(dir=p.parent, prefix=".jamila-", suffix=".tmp")
            try:
                with os.fdopen(fd, "wb") as f:
                    f.write(content.encode("utf8"))
                    f.flush()
                    os.fsync(f.fileno())
                if original is not None:
                    backup = p.with_name(p.name + ".jamila-backup")
                    if not backup.exists():
                        backup.write_bytes(original)
                os.replace(temp, p)
            finally:
                if os.path.exists(temp):
                    os.unlink(temp)
            return {"saved": p.relative_to(self.root).as_posix(), "bytes": len(content.encode("utf8"))}
        if name == "noe_validate_project":
            self.require_approval(args)
            if not self.engine or not self.engine.is_file():
                raise ValueError("NoeEngine executable unavailable; cannot claim validation passed")
            try:
                run = subprocess.run([str(self.engine), "--headless", "--path", str(self.root), "--editor", "--quit"],
                                     cwd=self.root, capture_output=True, text=True, timeout=90, shell=False)
                log = (run.stdout + "\n" + run.stderr)[-12000:]
                ok = run.returncode == 0 and not any(x in log for x in ("SCRIPT ERROR:", "Parse Error:", "ERROR:"))
                return {"ok": ok, "exit_code": run.returncode, "output": log}
            except subprocess.TimeoutExpired:
                return {"ok": False, "error": "Headless project check timed out after 90 seconds"}
        raise ValueError("Unknown MCP tool")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--project", default=os.environ.get("NOEENGINE_PROJECT_ROOT", "."))
    parser.add_argument("--engine", default="")
    args = parser.parse_args()
    try:
        tools = ProjectTools(args.project, args.engine, os.environ.get("JAMILA_APPROVAL_SECRET", ""))
    except ValueError as exc:
        print(str(exc), file=sys.stderr)
        return 2
    for line in sys.stdin:
        try:
            req = json.loads(line)
            if "id" not in req:
                continue
            method = req.get("method")
            if method == "initialize":
                payload = {"protocolVersion": "2024-11-05", "capabilities": {"tools": {"listChanged": False}},
                           "serverInfo": {"name": "jamila-noeengine", "version": "0.2.0"}}
            elif method == "ping":
                payload = {}
            elif method == "tools/list":
                payload = {"tools": TOOLS}
            elif method == "tools/call":
                params = req.get("params") or {}
                try:
                    output = tools.call(params.get("name"), params.get("arguments") or {})
                    payload = {"content": [{"type": "text", "text": json.dumps(output)}]}
                except (KeyError, TypeError, ValueError, OSError, PermissionError, UnicodeError) as exc:
                    payload = {"isError": True, "content": [{"type": "text", "text": str(exc)}]}
            else:
                raise ValueError("Method not found")
            response = {"jsonrpc": "2.0", "id": req["id"], "result": payload}
        except (ValueError, KeyError, TypeError) as exc:
            response = {"jsonrpc": "2.0", "id": req.get("id") if isinstance(req, dict) else None,
                        "error": {"code": -32600, "message": str(exc)}}
        print(json.dumps(response), flush=True)
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
