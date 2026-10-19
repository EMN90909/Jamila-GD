import { ToggleJamilaRules } from "../../../shared/proto/file"
import type { ToggleJamilaRuleRequest } from "../../../shared/proto/file"
import type { Controller } from "../index"
import { getGlobalState, getWorkspaceState, updateGlobalState, updateWorkspaceState } from "../../../core/storage/state"
import { JamilaRulesToggles as AppJamilaRulesToggles } from "@shared/jam-rules"

/**
 * Toggles a Jamila rule (enable or disable)
 * @param controller The controller instance
 * @param request The toggle request
 * @returns The updated Jamila rule toggles
 */
export async function toggleJamilaRule(controller: Controller, request: ToggleJamilaRuleRequest): Promise<ToggleJamilaRules> {
	const { isGlobal, rulePath, enabled } = request

	if (!rulePath || typeof enabled !== "boolean" || typeof isGlobal !== "boolean") {
		console.error("toggleJamilaRule: Missing or invalid parameters", {
			rulePath,
			isGlobal: typeof isGlobal === "boolean" ? isGlobal : `Invalid: ${typeof isGlobal}`,
			enabled: typeof enabled === "boolean" ? enabled : `Invalid: ${typeof enabled}`,
		})
		throw new Error("Missing or invalid parameters for toggleJamilaRule")
	}

	// This is the same core logic as in the original handler
	if (isGlobal) {
		const toggles = ((await getGlobalState(controller.context, "globalJamilaRulesToggles")) as AppJamilaRulesToggles) || {}
		toggles[rulePath] = enabled
		await updateGlobalState(controller.context, "globalJamilaRulesToggles", toggles)
	} else {
		const toggles = ((await getWorkspaceState(controller.context, "localJamilaRulesToggles")) as AppJamilaRulesToggles) || {}
		toggles[rulePath] = enabled
		await updateWorkspaceState(controller.context, "localJamilaRulesToggles", toggles)
	}

	// Get the current state to return in the response
	const globalToggles = ((await getGlobalState(controller.context, "globalJamilaRulesToggles")) as AppJamilaRulesToggles) || {}
	const localToggles = ((await getWorkspaceState(controller.context, "localJamilaRulesToggles")) as AppJamilaRulesToggles) || {}

	return ToggleJamilaRules.create({
		globalJamRulesToggles: { toggles: globalToggles },
		localJamRulesToggles: { toggles: localToggles },
	})
}
