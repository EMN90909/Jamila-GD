import { useState } from "react"
import { McpServiceClient } from "@/services/grpc-client"
import { EmptyRequest } from "@shared/proto/common"

// A template, not a live credential. Do not capture a GitHub token in a webview.
export const GITHUB_MCP_ENTRY = JSON.stringify({
	github: {
		type: "streamableHttp",
		url: "https://api.githubcopilot.com/mcp/",
		headers: { Authorization: "Bearer ${env:GITHUB_PERSONAL_ACCESS_TOKEN}" },
	},
}, null, 2)

export default function GitHubMcpQuickStart() {
	const [copied, setCopied] = useState(false)
	const [error, setError] = useState("")
	const copyEntry = async () => {
		setError("")
		try {
			if (!navigator.clipboard?.writeText) throw new Error("Clipboard is unavailable")
			await navigator.clipboard.writeText(GITHUB_MCP_ENTRY)
			setCopied(true)
		} catch {
			setError("Copy the JSON entry manually, then open MCP settings.")
		}
	}

	return (
		<section aria-label="GitHub MCP setup" style={{ border: "1px solid var(--vscode-editorGroup-border)", borderRadius: 12, padding: 12, marginBottom: 18 }}>
			<strong style={{ display: "block", fontSize: 13 }}>GitHub MCP (official)</strong>
			<p style={{ fontSize: 12, color: "var(--vscode-descriptionForeground)", lineHeight: 1.5 }}>
				Connect Jamila to GitHub repositories, issues and pull requests through the official MCP server.
				Configure <code>GITHUB_PERSONAL_ACCESS_TOKEN</code> in the VS Code extension host environment before starting VS Code.
				The server cannot connect until valid GitHub credentials are available.
			</p>
			<p style={{ fontSize: 12, lineHeight: 1.5 }}>
				Add the following <code>github</code> entry to the existing <code>mcpServers</code> object in your
				local <code>jam_mcp_settings.json</code>. Preserve existing entries. Do not paste a real token into this file.
			</p>
			<pre aria-label="GitHub MCP configuration" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", padding: 10, fontSize: 11, borderRadius: 8, background: "var(--vscode-textCodeBlock-background)" }}>{GITHUB_MCP_ENTRY}</pre>
			<div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
				<button type="button" onClick={copyEntry} style={{ padding: "7px 10px", borderRadius: 8, cursor: "pointer" }}>{copied ? "Copied entry" : "Copy GitHub entry"}</button>
				<button type="button" onClick={() => {
					setError("")
					McpServiceClient.openMcpSettings(EmptyRequest.create({})).catch(() => setError("Could not open MCP settings."))
				}} style={{ padding: "7px 10px", borderRadius: 8, cursor: "pointer" }}>Open MCP settings</button>
			</div>
			{error && <p role="status" style={{ color: "var(--vscode-errorForeground)", fontSize: 12 }}>{error}</p>}
			<a href="https://github.com/github/github-mcp-server" target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 10, fontSize: 12 }}>Official GitHub MCP documentation</a>
		</section>
	)
}
