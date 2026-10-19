# GitHub MCP in Jamila

Jamila's existing MCP tool runner supports the [official GitHub MCP Server](https://github.com/github/github-mcp-server), including the remote Streamable HTTP transport.

## Configure GitHub

1. Create a GitHub personal access token with only the repository and operation permissions you need. Keep it private and never commit it.
2. Supply the token as the OS/launch-environment variable `GITHUB_PERSONAL_ACCESS_TOKEN` to the VS Code **extension host process**. Restart VS Code after changing its environment. The `webview-ui/.env.local` file is not the extension host's credential store.
3. Open **Jamila > MCP Servers > Remote Servers > GitHub MCP**, and use **Copy GitHub entry** and **Open MCP settings**.
4. Insert the single `github` entry below into the existing `mcpServers` object in your **local** `jam_mcp_settings.json`. Keep all existing MCP server entries:

```json
{
  "github": {
    "type": "streamableHttp",
    "url": "https://api.githubcopilot.com/mcp/",
    "headers": {
      "Authorization": "Bearer ${env:GITHUB_PERSONAL_ACCESS_TOKEN}"
    }
  }
}
```

Do **not** replace the entire file with this fragment, and do **not** replace the environment placeholder with your actual PAT.

5. Save settings, verify `github` appears as connected in Installed MCP Servers, and review its tools. Jamila can use these via its existing `UseMCPTool` path under your approval policy. If the server is disconnected, first check that the VS Code extension host inherited your environment variable and that your PAT has the required scopes.

## Security and limitations

- `McpHub` substitutes `${env:...}` when establishing a connection. It does not publish the resolved value in the server configuration sent to the React webview.
- Avoid pasting a token into Chat, repository files, or MCP settings, and avoid storing it in terminal history.
- This supports GitHub **PAT authentication**. The basic Jamila remote-server form does not implement GitHub's OAuth handshake. A server will not connect until the user supplies authorization on their own machine.
- Existing Human Approval and Allow All controls still govern the agent's MCP tool actions. Restrict GitHub PAT permissions regardless of approval mode.

See: https://github.com/github/github-mcp-server
