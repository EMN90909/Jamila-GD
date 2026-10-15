#!/usr/bin/env python3
"""Read-only NoeEngine project MCP server (stdio, JSON-RPC 2.0).
No third-party Python dependencies. Set NOEENGINE_PROJECT_ROOT to the game project.
"""
import json
import os
import sys
from pathlib import Path

ROOT = Path(os.environ.get("NOEENGINE_PROJECT_ROOT", os.getcwd())).expanduser().resolve()
MAX_BYTES = 128_000
EXTS = {".gd", ".tscn", ".tres", ".gdshader", ".shader", ".cs", ".json", ".cfg", ".ini", ".godot"}
TOOLS = [
    {"name": "noe_project_info", "description": "Inspect a NoeEngine game project and its project.godot settings.", "inputSchema": {"type": "object", "properties": {}}},
    {"name": "noe_list_assets", "description": "List scenes, scripts and resources within the selected NoeEngine project.", "inputSchema": {"type": "object", "properties": {"directory": {"type": "string"}, "limit": {"type": "integer", "minimum": 1, "maximum": 200}}, "additionalProperties": False}},
    {"name": "noe_read_asset", "description": "Read a text scene, script or resource from the project.", "inputSchema": {"type": "object", "properties": {"path": {"type": "string"}}, "required": ["path"], "additionalProperties": False}},
    {"name": "noe_scene_summary", "description": "Summarize nodes and resources in a NoeEngine .tscn scene.", "inputSchema": {"type": "object", "properties": {"path": {"type": "string"}}, "required": ["path"], "additionalProperties": False}},
]

def safe_path(value):
    candidate = (ROOT / value).resolve()
    if not candidate.is_relative_to(ROOT):
        raise ValueError("Path must stay inside NOEENGINE_PROJECT_ROOT")
    return candidate

def run(name, args):
    if name == "noe_project_info":
        f = ROOT / "project.godot"
        return json.dumps({"root": str(ROOT), "project_exists": f.is_file(), "project_config": f.read_text(encoding="utf-8")[:MAX_BYTES] if f.is_file() else None})
    if name == "noe_list_assets":
        directory = safe_path(args.get("directory", "."))
        if not directory.is_dir():
            raise ValueError("Directory not found")
        limit = max(1, min(200, int(args.get("limit", 100))))
        paths = []
        for p in sorted(directory.rglob("*")):
            if len(paths) >= limit:
                break
            if any(part.startswith(".") for part in p.relative_to(ROOT).parts) or p.is_symlink():
                continue
            if p.is_file() and p.suffix.lower() in EXTS:
                paths.append(p.relative_to(ROOT).as_posix())
        return json.dumps({"assets": paths, "limit": limit})
    if name in ("noe_read_asset", "noe_scene_summary"):
        p = safe_path(args["path"])
        if not p.is_file() or p.suffix.lower() not in EXTS:
            raise ValueError("Unsupported asset or missing file")
        if p.stat().st_size > MAX_BYTES:
            raise ValueError("File too large")
        content = p.read_text(encoding="utf-8")
        if name == "noe_read_asset":
            return content
        if p.suffix != ".tscn":
            raise ValueError("Scene must have .tscn extension")
        nodes = [line for line in content.splitlines() if line.startswith("[node ")]
        resources = [line for line in content.splitlines() if line.startswith("[ext_resource ") or line.startswith("[sub_resource ")]
        return json.dumps({"scene": p.relative_to(ROOT).as_posix(), "nodes": nodes[:300], "resources": resources[:300], "node_count": len(nodes)})
    raise ValueError("Unknown tool")

def respond(req):
    method = req.get("method")
    if method == "initialize":
        return {"protocolVersion": "2024-11-05", "capabilities": {"tools": {"listChanged": False}}, "serverInfo": {"name": "noeengine-project", "version": "0.1.0"}}
    if method == "ping":
        return {}
    if method == "tools/list":
        return {"tools": TOOLS}
    if method == "tools/call":
        params = req.get("params") or {}
        try:
            return {"content": [{"type": "text", "text": run(params.get("name"), params.get("arguments") or {})}]}
        except (ValueError, OSError, UnicodeError, KeyError) as e:
            return {"content": [{"type": "text", "text": str(e)}], "isError": True}
    raise ValueError("Method not found")

def main():
    for line in sys.stdin:
        try:
            msg = json.loads(line)
            if "id" not in msg:
                continue
            try:
                result = {"jsonrpc": "2.0", "id": msg["id"], "result": respond(msg)}
            except Exception as e:
                result = {"jsonrpc": "2.0", "id": msg["id"], "error": {"code": -32601, "message": str(e)}}
            print(json.dumps(result), flush=True)
        except (ValueError, UnicodeError):
            continue

if __name__ == "__main__":
    main()
