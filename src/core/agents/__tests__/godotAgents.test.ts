import { describe, it } from "mocha"
import { expect } from "chai"
import type { McpServer } from "@shared/mcp"
import { McpSettingsSchema } from "@services/mcp/schemas"
import { GODOT_AGENT_STAGES, getGameAgentGuide, isGodotMcpServer } from "../godotAgents"

function server(name: string, status: McpServer["status"], tools: string[] = []): McpServer {
	return {
		name, status, config: "{}", tools: tools.map((tool) => ({ name: tool })),
	}
}

describe("Jamila Godot agent workflows", () => {
	it("detects renamed custom Godot MCP servers using advertised tools", () => {
		expect(isGodotMcpServer(server("my-editor", "connected", ["godot_inspection_get_scene_tree"]))).to.equal(true)
		expect(isGodotMcpServer(server("git", "connected", ["create_pull_request"]))).to.equal(false)
	})
	it("lists connected Godot and external MCP servers without inventing tools", () => {
		const guide = getGameAgentGuide([
			server("my-editor", "connected", ["godot_inspection_get_scene_tree"]),
			server("github", "connected", ["create_issue"]),
		], false)
		expect(guide).to.contain("my-editor")
		expect(guide).to.contain("github")
		expect(guide).to.contain("godot_inspection_get_scene_tree")
		expect(guide).to.contain("sequentially")
		expect(guide).to.contain("Human Approval")
	})
	it("never implies editor access when no Godot MCP is connected", () => {
		const guide = getGameAgentGuide([server("godot", "disconnected")], true)
		expect(guide).to.contain("No connected Godot MCP server")
		expect(getGameAgentGuide([], false)).to.equal("")
	})
	it("accepts multiple named MCP backends in the same settings file", () => {
		const settings = McpSettingsSchema.safeParse({
			mcpServers: {
				godot: { type: "stdio", command: "uvx", args: ["godot-editor-mcp"], autoApprove: [] },
				github: {
					type: "streamableHttp",
					url: "https://api.githubcopilot.com/mcp/",
					headers: { Authorization: "Bearer ${env:GITHUB_PERSONAL_ACCESS_TOKEN}" },
				},
			},
		})
		expect(settings.success).to.equal(true)
	})
	it("includes explicit specialist handoffs and QA", () => {
		expect(GODOT_AGENT_STAGES.map((stage) => stage.role)).to.deep.equal([
			"planner", "scene", "gameplay", "integration", "qa",
		])
	})
})
