import { useEffect, useMemo, useState } from "react"
import type { JamilaMessage } from "@shared/ExtensionMessage"
import "./JamilaActivityLine.css"

interface JamilaActivityLineProps {
 messages: JamilaMessage[]
 working: boolean
 waitingForApproval: boolean
 taskKey: number
}

function activityFor(message: JamilaMessage): string | null {
 if (message.type === "ask") {
  switch (message.ask) {
   case "command": return "Waiting to run a command"
   case "tool": return "Waiting for file or workspace approval"
   case "use_mcp_server": return "Waiting for MCP permission"
   case "browser_action_launch": return "Waiting for browser approval"
   case "plan_mode_respond": return "Plan ready for review"
   case "followup": return "Waiting for your answer"
   default: return null
  }
 }
 switch (message.say) {
  case "api_req_started": return "Generating a response"
  case "reasoning": return "Analyzing the task"
  case "text": return "Writing the response"
  case "tool": return "Working with project files"
  case "command": return "Running a command"
  case "mcp_server_request_started": return "Calling an MCP server"
  case "mcp_server_response": return "Processing an MCP response"
  case "browser_action": return "Using the browser"
  case "completion_result": return "Task complete"
  case "error": return "Task encountered an error"
  default: return null
 }
}

export function getJamilaActivity(messages: JamilaMessage[], working: boolean, waitingForApproval: boolean) {
 const events = messages.map(activityFor).filter((value): value is string => Boolean(value))
 const trace = events.filter((value, index) => index === 0 || value !== events[index - 1]).slice(-5)
 const last = messages.at(-1)
 const status = working
  ? trace.at(-1) ?? "Working on your task"
  : waitingForApproval ? "Waiting for your approval"
  : last?.say === "completion_result" ? "Task complete"
  : last?.say === "error" ? "Task encountered an error"
  : "Ready for your next instruction"
 return { status, trace }
}

export default function JamilaActivityLine({ messages, working, waitingForApproval, taskKey }: JamilaActivityLineProps) {
 const [expanded, setExpanded] = useState(false)
 const [elapsed, setElapsed] = useState(0)
 const { status, trace } = useMemo(
  () => getJamilaActivity(messages, working, waitingForApproval),
  [messages, working, waitingForApproval],
 )

 useEffect(() => {
  setElapsed(0)
  setExpanded(false)
 }, [taskKey])

 useEffect(() => {
  if (!working) return
  const started = Date.now()
  const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - started) / 100) / 10), 100)
  return () => window.clearInterval(timer)
 }, [working, taskKey])

 if (messages.length === 0) return null
 return (
  <section className="jamila-activity" data-working={working ? "true" : "false"} aria-label="Agent activity">
   <button type="button" className="jamila-activity__heading" aria-expanded={expanded} onClick={() => setExpanded((open) => !open)}>
    <span className="jamila-activity__glyph codicon codicon-sparkle" aria-hidden="true" />
    <span className="jamila-activity__label" aria-live="polite" aria-atomic="true">{status}</span>
    {working && <span className="jamila-activity__timer" aria-hidden="true">{elapsed.toFixed(1)}s</span>}
    <span className={`codicon codicon-chevron-${expanded ? "up" : "down"} jamila-activity__chevron`} aria-hidden="true" />
   </button>
   {expanded && (
    <ol className="jamila-activity__trace" aria-label="Recent agent actions">
     {trace.map((step, index) => (
      <li key={`${index}-${step}`} className="jamila-activity__step">
       <span className={index === trace.length - 1 && working ? "jamila-activity__current" : "codicon codicon-check"} aria-hidden="true" />
       <span>{step}</span>
      </li>
     ))}
    </ol>
   )}
  </section>
 )
}
