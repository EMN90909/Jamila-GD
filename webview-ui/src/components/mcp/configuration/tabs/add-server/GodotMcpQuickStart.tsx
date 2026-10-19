import { useState } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { McpServiceClient } from "@/services/grpc-client"
import { EmptyRequest } from "@shared/proto/common"

/**
 * Launches the verified Godot Editor MCP bridge in a local stdio transport.
 * The Godot addon must also be installed and enabled in the target project.
 */
export const GODOT_EDITOR_MCP_ENTRY = JSON.stringify({
	godot: { type: "stdio", command: "uvx", args: ["godot-editor-mcp"], autoApprove: [] },
}, null, 2)

export default function GodotMcpQuickStart() {
	const { mcpServers } = useExtensionState()
	const [copied, setCopied] = useState(false)
	const [error, setError] = useState("")
	const editor = mcpServers?.find((server) =>
		/(godot|noeengine)/i.test(server.name) ||
		server.tools?.some((tool) => /^godot[_-]/i.test(tool.name)),
	)
	const connected = editor?.status === "connected" && !editor.disabled
	const toolCount = editor?.tools?.length || 0

	const copy = async () => {
		setError("")
		try {
			if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable")
			await navigator.clipboard.writeText(GODOT_EDITOR_MCP_ENTRY)
			setCopied(true)
		} catch {
			setError("Clipboard unavailable. Select the JSON below and copy it into MCP settings.")
		}
	}
	return (
		<section aria-label="Godot editor MCP setup" style={{ border: "1px solid var(--vscode-editorGroup-border)", borderRadius: 12, padding: 12, marginBottom: 16 }}>
			<div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
				<strong style={{ fontSize: 13 }}>Godot / NoeEngine MCP</strong>
				<span role="status" style={{ fontSize: 11, color: connected ? "var(--vscode-testing-iconPassed)" : "var(--vscode-descriptionForeground)" }}>
					{connected ? `Connected: ${editor?.name} (${toolCount} tools)` : editor ? `${editor.name}: ${editor.status}` : "Not connected"}
				</span>
			</div>
			<p style={{ fontSize: 12, color: "var(--vscode-descriptionForeground)", lineHeight: 1.5 }}>
				Connect Jamila to the real Godot editor for scenes, nodes, scripts, testing, and gameplay changes.
				This example uses the open-source <code>godot-editor-mcp</code> bridge. Custom Godot MCP servers also work.
			</p>
			<ol style={{ fontSize: 12, lineHeight: 1.6, paddingLeft: 20 }}>
				<li>Install Python 3.11+ and <code>uv</code> (provides <code>uvx</code>).</li>
				<li>Install the matching <code>Godot Editor MCP</code> addon in your game project's <code>addons/</code> folder, then enable it in <strong>Project Settings → Plugins</strong>.</li>
				<li>Copy the entry below inside <code>mcpServers</code> in your local <code>jam_mcp_settings.json</code>. Keep your other MCP servers.</li>
				<li>Open Godot/NoeEngine with that game project and verify the server is connected before asking Jamila to build or test gameplay.</li>
			</ol>
			<pre aria-label="Godot MCP configuration" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", padding: 10, borderRadius: 8, fontSize: 11, background: "var(--vscode-textCodeBlock-background)" }}>{GODOT_EDITOR_MCP_ENTRY}</pre>
			<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
				<button type="button" onClick={copy} style={{ padding: "7px 10px", borderRadius: 8, cursor: "pointer" }}>{copied ? "Copied entry" : "Copy Godot entry"}</button>
				<button type="button" onClick={() => {
					setError("")
					McpServiceClient.openMcpSettings(EmptyRequest.create({})).catch(() => setError("Could not open MCP settings."))
				}} style={{ padding: "7px 10px", borderRadius: 8, cursor: "pointer" }}>Open MCP settings</button>
			</div>
			{error && <p role="status" style={{ color: "var(--vscode-errorForeground)", fontSize: 12 }}>{error}</p>}
			<p style={{ fontSize: 11, color: "var(--vscode-descriptionForeground)" }}>Agent workflow: Planner → Scene → Gameplay → Integration → QA. Changes still require the selected approval policy.</p>
			<a href="https://github.com/hybridindie/godot-mcp" target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>Install Godot MCP addon and read the official bridge guide</a>
		</section>
	)
}
