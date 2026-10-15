import path from "path"
import { ensureRulesDirectoryExists, GlobalFileNames } from "@core/storage/disk"
import { fileExistsAtPath, isDirectory, readDirectory } from "@utils/fs"
import { formatResponse } from "@core/prompts/responses"
import fs from "fs/promises"
import { JamilaRulesToggles } from "@shared/jam-rules"
import { getGlobalState, getWorkspaceState, updateGlobalState, updateWorkspaceState } from "@core/storage/state"
import * as vscode from "vscode"
import { synchronizeRuleToggles, getRuleFilesTotalContent } from "@core/context/instructions/user-instructions/rule-helpers"

export const getGlobalJamilaRules = async (globalJamilaRulesFilePath: string, toggles: JamilaRulesToggles) => {
	if (await fileExistsAtPath(globalJamilaRulesFilePath)) {
		if (await isDirectory(globalJamilaRulesFilePath)) {
			try {
				const rulesFilePaths = await readDirectory(globalJamilaRulesFilePath)
				const rulesFilesTotalContent = await getRuleFilesTotalContent(rulesFilePaths, globalJamilaRulesFilePath, toggles)
				if (rulesFilesTotalContent) {
					const jamRulesFileInstructions = formatResponse.jamRulesGlobalDirectoryInstructions(
						globalJamilaRulesFilePath,
						rulesFilesTotalContent,
					)
					return jamRulesFileInstructions
				}
			} catch {
				console.error(`Failed to read .jamrules directory at ${globalJamilaRulesFilePath}`)
			}
		} else {
			console.error(`${globalJamilaRulesFilePath} is not a directory`)
			return undefined
		}
	}

	return undefined
}

export const getLocalJamilaRules = async (cwd: string, toggles: JamilaRulesToggles) => {
	const jamRulesFilePath = path.resolve(cwd, GlobalFileNames.jamRules)

	let jamRulesFileInstructions: string | undefined

	if (await fileExistsAtPath(jamRulesFilePath)) {
		if (await isDirectory(jamRulesFilePath)) {
			try {
				const rulesFilePaths = await readDirectory(jamRulesFilePath, [[".jamrules", "workflows"]])

				const rulesFilesTotalContent = await getRuleFilesTotalContent(rulesFilePaths, cwd, toggles)
				if (rulesFilesTotalContent) {
					jamRulesFileInstructions = formatResponse.jamRulesLocalDirectoryInstructions(cwd, rulesFilesTotalContent)
				}
			} catch {
				console.error(`Failed to read .jamrules directory at ${jamRulesFilePath}`)
			}
		} else {
			try {
				if (jamRulesFilePath in toggles && toggles[jamRulesFilePath] !== false) {
					const ruleFileContent = (await fs.readFile(jamRulesFilePath, "utf8")).trim()
					if (ruleFileContent) {
						jamRulesFileInstructions = formatResponse.jamRulesLocalFileInstructions(cwd, ruleFileContent)
					}
				}
			} catch {
				console.error(`Failed to read .jamrules file at ${jamRulesFilePath}`)
			}
		}
	}

	return jamRulesFileInstructions
}

export async function refreshJamilaRulesToggles(
	context: vscode.ExtensionContext,
	workingDirectory: string,
): Promise<{
	globalToggles: JamilaRulesToggles
	localToggles: JamilaRulesToggles
}> {
	// Global toggles
	const globalJamilaRulesToggles = ((await getGlobalState(context, "globalJamilaRulesToggles")) as JamilaRulesToggles) || {}
	const globalJamilaRulesFilePath = await ensureRulesDirectoryExists()
	const updatedGlobalToggles = await synchronizeRuleToggles(globalJamilaRulesFilePath, globalJamilaRulesToggles)
	await updateGlobalState(context, "globalJamilaRulesToggles", updatedGlobalToggles)

	// Local toggles
	const localJamilaRulesToggles = ((await getWorkspaceState(context, "localJamilaRulesToggles")) as JamilaRulesToggles) || {}
	const localJamilaRulesFilePath = path.resolve(workingDirectory, GlobalFileNames.jamRules)
	const updatedLocalToggles = await synchronizeRuleToggles(localJamilaRulesFilePath, localJamilaRulesToggles, "", [
		[".jamrules", "workflows"],
	])
	await updateWorkspaceState(context, "localJamilaRulesToggles", updatedLocalToggles)

	return {
		globalToggles: updatedGlobalToggles,
		localToggles: updatedLocalToggles,
	}
}
