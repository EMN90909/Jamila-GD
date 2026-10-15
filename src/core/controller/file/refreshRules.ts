import { EmptyRequest } from "@shared/proto/common"
import { RefreshedRules } from "@shared/proto/file"
import type { Controller } from "../index"
import { refreshJamilaRulesToggles } from "@core/context/instructions/user-instructions/jam-rules"
import { refreshExternalRulesToggles } from "@core/context/instructions/user-instructions/external-rules"
import { refreshWorkflowToggles } from "@core/context/instructions/user-instructions/workflows"
import { cwd } from "@core/task"

/**
 * Refreshes all rule toggles (Jamila, External, and Workflows)
 * @param controller The controller instance
 * @param _request The empty request
 * @returns RefreshedRules containing updated toggles for all rule types
 */
export async function refreshRules(controller: Controller, _request: EmptyRequest): Promise<RefreshedRules> {
	try {
		const { globalToggles, localToggles } = await refreshJamilaRulesToggles(controller.context, cwd)
		const { cursorLocalToggles, windsurfLocalToggles } = await refreshExternalRulesToggles(controller.context, cwd)
		const { localWorkflowToggles, globalWorkflowToggles } = await refreshWorkflowToggles(controller.context, cwd)

		return RefreshedRules.create({
			globalJamilaRulesToggles: { toggles: globalToggles },
			localJamilaRulesToggles: { toggles: localToggles },
			localCursorRulesToggles: { toggles: cursorLocalToggles },
			localWindsurfRulesToggles: { toggles: windsurfLocalToggles },
			localWorkflowToggles: { toggles: localWorkflowToggles },
			globalWorkflowToggles: { toggles: globalWorkflowToggles },
		})
	} catch (error) {
		console.error("Failed to refresh rules:", error)
		throw error
	}
}
