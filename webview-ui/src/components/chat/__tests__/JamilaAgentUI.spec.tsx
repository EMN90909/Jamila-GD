import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import type { JamilaMessage } from "@shared/ExtensionMessage"
import { getJamilaActivity } from "../JamilaActivityLine"
import EditableAgentPlan, { extractPlanSteps } from "../EditableAgentPlan"

const say = (kind: JamilaMessage["say"]) => ({ type: "say", say: kind, ts: Date.now() }) as JamilaMessage
const ask = (kind: JamilaMessage["ask"]) => ({ type: "ask", ask: kind, ts: Date.now() }) as JamilaMessage

describe("Jamila agent activity", () => {
 it("labels real AI and tool events without inventing actions", () => {
  const activity = getJamilaActivity(
   [say("api_req_started"), say("reasoning"), say("tool"), say("command")],
   true,
   false,
  )
  expect(activity.status).toBe("Running a command")
  expect(activity.trace).toEqual([
   "Generating a response",
   "Analyzing the task",
   "Working with project files",
   "Running a command",
  ])
 })
 it("distinguishes pending approval from an executed tool", () => {
  const activity = getJamilaActivity([ask("use_mcp_server")], false, true)
  expect(activity.status).toBe("Waiting for your approval")
  expect(activity.trace).toEqual(["Waiting for MCP permission"])
 })
 it("labels only observed GitHub MCP activity", () => {
  const github = {
   type: "ask", ask: "use_mcp_server",
   text: JSON.stringify({ serverName: "github", type: "use_mcp_tool" }), ts: Date.now(),
  } as JamilaMessage
  expect(getJamilaActivity([github], false, false).trace).toEqual(["Waiting for GitHub MCP approval"])
  expect(getJamilaActivity([{ ...github, text: JSON.stringify({ serverName: "local-tools" }) }], false, false).trace)
   .toEqual(["Waiting for MCP permission"])
 })
 it("shows scene editing status only when a Godot tool event was recorded", () => {
  const godot = {
   type: "say", say: "mcp_server_request_started",
   text: JSON.stringify({ serverName: "godot", toolName: "godot_scene_add_node" }), ts: Date.now(),
  } as JamilaMessage
  expect(getJamilaActivity([godot], true, false).status).toBe("Godot: updating the scene")
  const inspection = { ...godot, text: JSON.stringify({ serverName: "godot", toolName: "godot_inspection_get_scene_tree" }) }
  expect(getJamilaActivity([inspection], true, false).status).toBe("Godot: inspecting the project")
 })
 it("collapses repeated events and limits the trace", () => {
  const activity = getJamilaActivity(
   [say("text"), say("text"), say("reasoning"), say("tool"), say("command"), say("api_req_started"), say("text")],
   true,
   false,
  )
  expect(activity.trace).toHaveLength(5)
  expect(activity.trace.at(-1)).toBe("Writing the response")
 })
})

describe("editable agent plan", () => {
 const proposed = "# Proposed work\n1. Inspect existing UI\n2. Update the composer\n- Test approval flow"
 it("extracts numbered and bulleted steps", () => {
  expect(extractPlanSteps(proposed)).toEqual(["Inspect existing UI", "Update the composer", "Test approval flow"])
 })
 it("submits revisions as a review request, not an execution approval", async () => {
  const onRequestRevision = vi.fn().mockResolvedValue(undefined)
  render(<EditableAgentPlan response={proposed} canEdit onRequestRevision={onRequestRevision} />)
  fireEvent.click(screen.getByRole("button", { name: /edit plan/i }))
  fireEvent.change(screen.getByLabelText(/edit the proposed plan/i), {
   target: { value: proposed + "\n3. Verify keyboard access" },
  })
  fireEvent.click(screen.getByRole("button", { name: /request revised plan/i }))
  await waitFor(() => expect(onRequestRevision).toHaveBeenCalledTimes(1))
  const request = onRequestRevision.mock.calls[0][0] as string
  expect(request).toContain("Do not execute any steps yet")
  expect(request).toContain("Verify keyboard access")
 })
 it("cannot edit a settled plan", () => {
  render(<EditableAgentPlan response={proposed} canEdit={false} />)
  expect(screen.queryByRole("button", { name: /edit plan/i })).toBeNull()
 })
})
