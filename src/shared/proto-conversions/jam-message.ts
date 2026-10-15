import { JamilaMessage as AppJamilaMessage, JamilaAsk as AppJamilaAsk, JamilaSay as AppJamilaSay } from "@shared/ExtensionMessage"

import { JamilaMessage as ProtoJamilaMessage, JamilaMessageType, JamilaAsk, JamilaSay } from "@shared/proto/ui"

// Helper function to convert JamilaAsk string to enum
function convertJamilaAskToProtoEnum(ask: AppJamilaAsk | undefined): JamilaAsk | undefined {
	if (!ask) {
		return undefined
	}

	const mapping: Record<AppJamilaAsk, JamilaAsk> = {
		followup: JamilaAsk.FOLLOWUP,
		plan_mode_respond: JamilaAsk.PLAN_MODE_RESPOND,
		command: JamilaAsk.COMMAND,
		command_output: JamilaAsk.COMMAND_OUTPUT,
		completion_result: JamilaAsk.COMPLETION_RESULT,
		tool: JamilaAsk.TOOL,
		api_req_failed: JamilaAsk.API_REQ_FAILED,
		resume_task: JamilaAsk.RESUME_TASK,
		resume_completed_task: JamilaAsk.RESUME_COMPLETED_TASK,
		mistake_limit_reached: JamilaAsk.MISTAKE_LIMIT_REACHED,
		auto_approval_max_req_reached: JamilaAsk.AUTO_APPROVAL_MAX_REQ_REACHED,
		browser_action_launch: JamilaAsk.BROWSER_ACTION_LAUNCH,
		use_mcp_server: JamilaAsk.USE_MCP_SERVER,
		new_task: JamilaAsk.NEW_TASK,
		condense: JamilaAsk.CONDENSE,
		report_bug: JamilaAsk.REPORT_BUG,
	}

	const result = mapping[ask]
	if (result === undefined) {
		console.warn(`Unknown JamilaAsk value: ${ask}`)
	}
	return result
}

// Helper function to convert JamilaAsk enum to string
function convertProtoEnumToJamilaAsk(ask: JamilaAsk): AppJamilaAsk | undefined {
	if (ask === JamilaAsk.UNRECOGNIZED) {
		console.warn("Received UNRECOGNIZED JamilaAsk enum value")
		return undefined
	}

	const mapping: Record<Exclude<JamilaAsk, JamilaAsk.UNRECOGNIZED>, AppJamilaAsk> = {
		[JamilaAsk.FOLLOWUP]: "followup",
		[JamilaAsk.PLAN_MODE_RESPOND]: "plan_mode_respond",
		[JamilaAsk.COMMAND]: "command",
		[JamilaAsk.COMMAND_OUTPUT]: "command_output",
		[JamilaAsk.COMPLETION_RESULT]: "completion_result",
		[JamilaAsk.TOOL]: "tool",
		[JamilaAsk.API_REQ_FAILED]: "api_req_failed",
		[JamilaAsk.RESUME_TASK]: "resume_task",
		[JamilaAsk.RESUME_COMPLETED_TASK]: "resume_completed_task",
		[JamilaAsk.MISTAKE_LIMIT_REACHED]: "mistake_limit_reached",
		[JamilaAsk.AUTO_APPROVAL_MAX_REQ_REACHED]: "auto_approval_max_req_reached",
		[JamilaAsk.BROWSER_ACTION_LAUNCH]: "browser_action_launch",
		[JamilaAsk.USE_MCP_SERVER]: "use_mcp_server",
		[JamilaAsk.NEW_TASK]: "new_task",
		[JamilaAsk.CONDENSE]: "condense",
		[JamilaAsk.REPORT_BUG]: "report_bug",
	}

	return mapping[ask]
}

// Helper function to convert JamilaSay string to enum
function convertJamilaSayToProtoEnum(say: AppJamilaSay | undefined): JamilaSay | undefined {
	if (!say) {
		return undefined
	}

	const mapping: Record<AppJamilaSay, JamilaSay> = {
		task: JamilaSay.TASK,
		error: JamilaSay.ERROR,
		api_req_started: JamilaSay.API_REQ_STARTED,
		api_req_finished: JamilaSay.API_REQ_FINISHED,
		text: JamilaSay.TEXT,
		reasoning: JamilaSay.REASONING,
		completion_result: JamilaSay.COMPLETION_RESULT_SAY,
		user_feedback: JamilaSay.USER_FEEDBACK,
		user_feedback_diff: JamilaSay.USER_FEEDBACK_DIFF,
		api_req_retried: JamilaSay.API_REQ_RETRIED,
		command: JamilaSay.COMMAND_SAY,
		command_output: JamilaSay.COMMAND_OUTPUT_SAY,
		tool: JamilaSay.TOOL_SAY,
		shell_integration_warning: JamilaSay.SHELL_INTEGRATION_WARNING,
		browser_action_launch: JamilaSay.BROWSER_ACTION_LAUNCH_SAY,
		browser_action: JamilaSay.BROWSER_ACTION,
		browser_action_result: JamilaSay.BROWSER_ACTION_RESULT,
		mcp_server_request_started: JamilaSay.MCP_SERVER_REQUEST_STARTED,
		mcp_server_response: JamilaSay.MCP_SERVER_RESPONSE,
		mcp_notification: JamilaSay.MCP_NOTIFICATION,
		use_mcp_server: JamilaSay.USE_MCP_SERVER_SAY,
		diff_error: JamilaSay.DIFF_ERROR,
		deleted_api_reqs: JamilaSay.DELETED_API_REQS,
		jamignore_error: JamilaSay.JAMIGNORE_ERROR,
		checkpoint_created: JamilaSay.CHECKPOINT_CREATED,
		load_mcp_documentation: JamilaSay.LOAD_MCP_DOCUMENTATION,
		info: JamilaSay.INFO,
	}

	const result = mapping[say]
	if (result === undefined) {
		console.warn(`Unknown JamilaSay value: ${say}`)
	}
	return result
}

// Helper function to convert JamilaSay enum to string
function convertProtoEnumToJamilaSay(say: JamilaSay): AppJamilaSay | undefined {
	if (say === JamilaSay.UNRECOGNIZED) {
		console.warn("Received UNRECOGNIZED JamilaSay enum value")
		return undefined
	}

	const mapping: Record<Exclude<JamilaSay, JamilaSay.UNRECOGNIZED>, AppJamilaSay> = {
		[JamilaSay.TASK]: "task",
		[JamilaSay.ERROR]: "error",
		[JamilaSay.API_REQ_STARTED]: "api_req_started",
		[JamilaSay.API_REQ_FINISHED]: "api_req_finished",
		[JamilaSay.TEXT]: "text",
		[JamilaSay.REASONING]: "reasoning",
		[JamilaSay.COMPLETION_RESULT_SAY]: "completion_result",
		[JamilaSay.USER_FEEDBACK]: "user_feedback",
		[JamilaSay.USER_FEEDBACK_DIFF]: "user_feedback_diff",
		[JamilaSay.API_REQ_RETRIED]: "api_req_retried",
		[JamilaSay.COMMAND_SAY]: "command",
		[JamilaSay.COMMAND_OUTPUT_SAY]: "command_output",
		[JamilaSay.TOOL_SAY]: "tool",
		[JamilaSay.SHELL_INTEGRATION_WARNING]: "shell_integration_warning",
		[JamilaSay.BROWSER_ACTION_LAUNCH_SAY]: "browser_action_launch",
		[JamilaSay.BROWSER_ACTION]: "browser_action",
		[JamilaSay.BROWSER_ACTION_RESULT]: "browser_action_result",
		[JamilaSay.MCP_SERVER_REQUEST_STARTED]: "mcp_server_request_started",
		[JamilaSay.MCP_SERVER_RESPONSE]: "mcp_server_response",
		[JamilaSay.MCP_NOTIFICATION]: "mcp_notification",
		[JamilaSay.USE_MCP_SERVER_SAY]: "use_mcp_server",
		[JamilaSay.DIFF_ERROR]: "diff_error",
		[JamilaSay.DELETED_API_REQS]: "deleted_api_reqs",
		[JamilaSay.JAMIGNORE_ERROR]: "jamignore_error",
		[JamilaSay.CHECKPOINT_CREATED]: "checkpoint_created",
		[JamilaSay.LOAD_MCP_DOCUMENTATION]: "load_mcp_documentation",
		[JamilaSay.INFO]: "info",
	}

	return mapping[say]
}

/**
 * Convert application JamilaMessage to proto JamilaMessage
 */
export function convertJamilaMessageToProto(message: AppJamilaMessage): ProtoJamilaMessage {
	// For sending messages, we need to provide values for required proto fields
	const askEnum = message.ask ? convertJamilaAskToProtoEnum(message.ask) : undefined
	const sayEnum = message.say ? convertJamilaSayToProtoEnum(message.say) : undefined

	// Determine appropriate enum values based on message type
	let finalAskEnum: JamilaAsk = JamilaAsk.FOLLOWUP // Proto default
	let finalSayEnum: JamilaSay = JamilaSay.TEXT // Proto default

	if (message.type === "ask") {
		finalAskEnum = askEnum ?? JamilaAsk.FOLLOWUP // Use FOLLOWUP as default for ask messages
	} else if (message.type === "say") {
		finalSayEnum = sayEnum ?? JamilaSay.TEXT // Use TEXT as default for say messages
	}

	const protoMessage: ProtoJamilaMessage = {
		ts: message.ts,
		type: message.type === "ask" ? JamilaMessageType.ASK : JamilaMessageType.SAY,
		ask: finalAskEnum,
		say: finalSayEnum,
		text: message.text ?? "",
		reasoning: message.reasoning ?? "",
		images: message.images ?? [],
		files: message.files ?? [],
		partial: message.partial ?? false,
		lastCheckpointHash: message.lastCheckpointHash ?? "",
		isCheckpointCheckedOut: message.isCheckpointCheckedOut ?? false,
		isOperationOutsideWorkspace: message.isOperationOutsideWorkspace ?? false,
		conversationHistoryIndex: message.conversationHistoryIndex ?? 0,
		conversationHistoryDeletedRange: message.conversationHistoryDeletedRange
			? {
					startIndex: message.conversationHistoryDeletedRange[0],
					endIndex: message.conversationHistoryDeletedRange[1],
				}
			: undefined,
	}

	return protoMessage
}

/**
 * Convert proto JamilaMessage to application JamilaMessage
 */
export function convertProtoToJamilaMessage(protoMessage: ProtoJamilaMessage): AppJamilaMessage {
	const message: AppJamilaMessage = {
		ts: protoMessage.ts,
		type: protoMessage.type === JamilaMessageType.ASK ? "ask" : "say",
	}

	// Convert ask enum to string
	if (protoMessage.type === JamilaMessageType.ASK) {
		const ask = convertProtoEnumToJamilaAsk(protoMessage.ask)
		if (ask !== undefined) {
			message.ask = ask
		}
	}

	// Convert say enum to string
	if (protoMessage.type === JamilaMessageType.SAY) {
		const say = convertProtoEnumToJamilaSay(protoMessage.say)
		if (say !== undefined) {
			message.say = say
		}
	}

	// Convert other fields - preserve empty strings as they may be intentional
	if (protoMessage.text !== "") {
		message.text = protoMessage.text
	}
	if (protoMessage.reasoning !== "") {
		message.reasoning = protoMessage.reasoning
	}
	if (protoMessage.images.length > 0) {
		message.images = protoMessage.images
	}
	if (protoMessage.files.length > 0) {
		message.files = protoMessage.files
	}
	if (protoMessage.partial) {
		message.partial = protoMessage.partial
	}
	if (protoMessage.lastCheckpointHash !== "") {
		message.lastCheckpointHash = protoMessage.lastCheckpointHash
	}
	if (protoMessage.isCheckpointCheckedOut) {
		message.isCheckpointCheckedOut = protoMessage.isCheckpointCheckedOut
	}
	if (protoMessage.isOperationOutsideWorkspace) {
		message.isOperationOutsideWorkspace = protoMessage.isOperationOutsideWorkspace
	}
	if (protoMessage.conversationHistoryIndex !== 0) {
		message.conversationHistoryIndex = protoMessage.conversationHistoryIndex
	}

	// Convert conversationHistoryDeletedRange from object to tuple
	if (protoMessage.conversationHistoryDeletedRange) {
		message.conversationHistoryDeletedRange = [
			protoMessage.conversationHistoryDeletedRange.startIndex,
			protoMessage.conversationHistoryDeletedRange.endIndex,
		]
	}

	return message
}
