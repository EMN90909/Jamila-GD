# Jamila GD: Godot editor MCP and game agents

Jamila-GD is a Cline-derived VS Code extension webview today. Its Godot bridge uses external MCP processes; **this is not a native in-editor Godot dock/plugin**. The Godot addon is a separate component. The Godot and Jamila processes need to run on the same machine for the default localhost bridge.

## Recommended live-editor MCP server

[hybridindie/godot-mcp](https://github.com/hybridindie/godot-mcp) (MIT) ships `godot-editor-mcp` (server) and a matching Godot Editor MCP addon for Godot **4.4+**. The Python server accepts MCP over stdio and bridges to the active editor addon over localhost WebSocket. The addon must be installed separately.

1. Install Python 3.11+ and [uv](https://docs.astral.sh/uv/) so `uvx` is on your `PATH`. 
2. In your Godot game project, install the matching addon from the project's [release instructions](https://github.com/hybridindie/godot-mcp); enable it in **Project → Project Settings → Plugins**.
3. In Jamila's **MCP Servers → Remote Servers** tab, select **Copy Godot entry** and then **Open MCP settings**.
4. Merge this entry into the existing `mcpServers` object of the **local** `jam_mcp_settings.json`, retaining GitHub/other servers:

```json
{
  "mcpServers": {
    "godot": {
      "type": "stdio",
      "command": "uvx",
      "args": ["godot-editor-mcp"],
      "autoApprove": []
    }
  }
}
```

5. Open Godot with your project. Restart the MCP connection if needed.
6. In Jamila, request a **read-only scene inspection** using the actual advertised `godot` tool. A status of **MCP connected** only means Jamila reached the MCP Python server. It does **not** guarantee that the Godot addon connected to the server or that a scene is loaded.
7. After a successful inspection, ask Jamila to build a small playable slice. Approve mutating tool calls where necessary. Verify the resulting scenes, scripts, and game play in Godot.

If the editor plugin cannot be installed, you can connect a different compatible Godot MCP server in the local settings. Jamila matches advertised `godot_` tools and uses their input schemas. Different servers expose different tool names and capabilities; never assume a particular tool exists.

## Agent roles and coordination

For Godot projects (the selected workspace contains `project.godot`) or active Godot MCP connections, every Jamila model prompt gets a purpose-built five-role workflow:

| Role | Responsibility | Exit check |
| --- | --- | --- |
| Planner | Inspect project and connected tools, define an editable implementation plan | Scope and acceptance criteria clear |
| Scene | Create/modify scene tree, nodes and resources through connected Godot MCP | Scene changes saved and verified |
| Gameplay | Implement and test scripts, physics and input | Scripts parse and mechanics exercised |
| Integration | Coordinate GitHub, docs and custom MCP tools | External tool results confirmed |
| QA | Test scene, inspect errors, iterate on failures | Verified evidence or explicit blockers |

**Current architecture:** These are specialist execution passes in the existing single model/task executor, **not independently running or parallel LLM subprocesses**. This avoids concurrent editor state mutations but does not provide autonomous concurrent coding agents. The system does not claim parallel work without implementing it.

The LLM always gets the *actual currently advertised tool schemas* from every connected MCP server. Jamila sends `use_mcp_tool` operations to the requested server; the MCP server does not need to proxy other MCPs. Tools acquired via an MCP toolset-enabling call are refreshed on `notifications/tools/list_changed` before subsequent steps. MCP tool inventories are paginated for large servers, and the executor rejects unadvertised tools.

Skill manifests in project-relative `.agents/skills`, `.claude/skills`, `.github/skills`, or `skills` are indexed in the task prompt if present. The agent should read the relevant `SKILL.md` before applying it. Untrusted skill contents are not executed automatically.

## Safety

- Every tool action goes through the existing Jamila Human Approval / auto-approval gate. `autoApprove: []` is the recommended starting point for scene mutations.
- Actions affecting scene state must run sequentially against a shared editor. Avoid two agents editing the same scene at once.
- Use the tool's actual input schema. Never paste secrets into chats or config files.
- GitHub MCP, Godot MCP and any custom tools remain separate, independently configured connections.
- The tool call result is evidence. Do not report a created game, a passed playtest or a saved scene unless verified.

## NoeEngine compatibility

NoeEngine is a Godot fork, but its compatibility with **this** third-party Godot 4.4+ addon has **not** been established. A build based on Godot 4.0.5 likely needs an older compatible MCP bridge or further editor API adaptation. The setup currently targets supported **Godot 4.4+** versions. The addon and Godot binary are not bundled into Jamila-GD.

## Verification

- Unit tests: `npm run test:unit -- --grep "Jamila Godot agent workflows|MCP environment placeholders"`
- Extension types: `npm run check-types`
- Webview types/build: `cd webview-ui && npm run build`
- Webview tests: `cd webview-ui && npm test`
- End-to-end verification requires an installed Godot editor, its addon, and a real MCP process. CI checks alone do not prove a playable game was produced.
