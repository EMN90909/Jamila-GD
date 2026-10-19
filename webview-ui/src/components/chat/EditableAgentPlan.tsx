import { useEffect, useId, useMemo, useState } from "react"
import "./EditableAgentPlan.css"

interface EditableAgentPlanProps {
 response: string
 canEdit: boolean
 onRequestRevision?: (message: string) => Promise<void> | void
}

export function extractPlanSteps(markdown: string): string[] {
 const steps = markdown.split(/\r?\n/)
  .map((line) => line.match(/^\s*(?:\d+[.)]|[-*+]\s*(?:\[[ xX]\])?)\s+(.+)$/)?.[1]?.trim())
  .filter((line): line is string => Boolean(line))
 return steps.slice(0, 12)
}

export default function EditableAgentPlan({ response, canEdit, onRequestRevision }: EditableAgentPlanProps) {
 const editorId = useId()
 const [editing, setEditing] = useState(false)
 const [draft, setDraft] = useState(response)
 const [saving, setSaving] = useState(false)
 const [error, setError] = useState("")
 const steps = useMemo(() => extractPlanSteps(response), [response])

 useEffect(() => {
  setDraft(response)
  setEditing(false)
  setError("")
 }, [response])

 const submit = async () => {
  if (!canEdit || !onRequestRevision || saving || !draft.trim() || draft.trim() === response.trim()) return
  setSaving(true)
  setError("")
  try {
   await onRequestRevision(
    "Revise your proposed plan using my edited version below. Show me the updated plan for approval. Do not execute any steps yet.\n\n" + draft.trim(),
   )
   setEditing(false)
  } catch (reason) {
   setError(reason instanceof Error ? reason.message : "Could not send the plan revision.")
  } finally {
   setSaving(false)
  }
 }

 return (
  <section className="jamila-plan" aria-label="Editable agent plan">
   <div className="jamila-plan__top">
    <span className="codicon codicon-checklist" aria-hidden="true" />
    <strong>Agent plan</strong>
    <span className="jamila-plan__badge">Review before execution</span>
   </div>
   {!editing && steps.length > 0 && (
    <ol className="jamila-plan__steps">
     {steps.map((step, index) => <li key={index}><span className="jamila-plan__number">{index + 1}</span><span>{step}</span></li>)}
    </ol>
   )}
   {editing ? (
    <div className="jamila-plan__editor">
     <label htmlFor={editorId}>Edit the proposed plan</label>
     <textarea id={editorId} value={draft} onChange={(event) => setDraft(event.target.value)} rows={Math.min(14, Math.max(6, draft.split("\n").length))} spellCheck={false} />
     {error && <p role="alert" className="jamila-plan__error">{error}</p>}
     <div className="jamila-plan__actions">
      <button type="button" onClick={() => { setDraft(response); setEditing(false); setError("") }} disabled={saving}>Cancel</button>
      <button type="button" className="jamila-plan__primary" onClick={submit} disabled={saving || !draft.trim() || draft.trim() === response.trim()}>
       {saving ? "Sending…" : "Request revised plan"}
      </button>
     </div>
     <small>Changes go to Jamila for a new review. Execution never starts from this editor.</small>
    </div>
   ) : canEdit && onRequestRevision ? (
    <button type="button" className="jamila-plan__edit" onClick={() => setEditing(true)}>
     <span className="codicon codicon-edit" aria-hidden="true" /> Edit plan
    </button>
   ) : null}
  </section>
 )
}
