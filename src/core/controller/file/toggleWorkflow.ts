import { Controller } from ".."
import { Metadata } from "../../../shared/proto/common"
import { ToggleWorkflowRequest, JamilaRulesToggles } from "../../../shared/proto/file"
import { getWorkspaceState, updateWorkspaceState, getGlobalState, updateGlobalState } from "../../../core/storage/state"
import { JamilaRulesToggles as AppJamilaRulesToggles } from "../../../shared/jam-rules"

/**
 * Toggles a workflow on or off
 * @param controller The controller instance
 * @param request The request containing the workflow path and enabled state
 * @returns The updated workflow toggles
 */
export async function toggleWorkflow(controller: Controller, request: ToggleWorkflowRequest): Promise<JamilaRulesToggles> {
	const { workflowPath, enabled, isGlobal } = request

	if (!workflowPath || typeof enabled !== "boolean") {
		console.error("toggleWorkflow: Missing or invalid parameters", {
			workflowPath,
			enabled: typeof enabled === "boolean" ? enabled : `Invalid: ${typeof enabled}`,
		})
		throw new Error("Missing or invalid parameters for toggleWorkflow")
	}

	// Update the toggles based on isGlobal flag
	if (isGlobal) {
		// Global workflows
		const toggles = ((await getGlobalState(controller.context, "globalWorkflowToggles")) as AppJamilaRulesToggles) || {}
		toggles[workflowPath] = enabled
		await updateGlobalState(controller.context, "globalWorkflowToggles", toggles)
		await controller.postStateToWebview()

		// Return the global toggles
		return JamilaRulesToggles.create({ toggles: toggles })
	} else {
		// Workspace workflows
		const toggles = ((await getWorkspaceState(controller.context, "workflowToggles")) as AppJamilaRulesToggles) || {}
		toggles[workflowPath] = enabled
		await updateWorkspaceState(controller.context, "workflowToggles", toggles)
		await controller.postStateToWebview()

		// Return the workspace toggles
		return JamilaRulesToggles.create({ toggles: toggles })
	}
}
