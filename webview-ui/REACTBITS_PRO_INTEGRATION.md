# Jamila React Bits UI integration

Jamila's webview is React 18, Vite, Tailwind 4 and TypeScript. The activity indicator, editable plan, and redesigned prompt surface are original Jamila components inspired by the supplied React Bits references. They do not redistribute React Bits Pro source code.

## Installing the exact paid Agent Plan 2 block

The React Bits Pro `agent-plan-2` block requires a Pro/Ultimate license. Configure a **local**, untracked `webview-ui/.env.local` with `REACTBITS_LICENSE_KEY=...`, and use the registries in `webview-ui/components.json`. Never commit the key. In a licensed **private** workspace, run:

```sh
cd webview-ui
npx shadcn@latest add @reactbits-pro/agent-plan-2
```

The repository is public. React Bits Pro's license forbids publishing a substantial part of its proprietary source in a public repository, so the Pro block is **not** committed here. Do not push the downloaded block publicly unless its license permits it. The `EditableAgentPlan` component is a functional open implementation in the meantime.

## Behavioral wiring

- `JamilaActivityLine` uses actual `JamilaMessage` events and the active streaming state; it does not invent tool executions or expose hidden reasoning.
- `EditableAgentPlan` parses steps for a review summary, lets the user edit the full plan text, and sends an explicit revision request via `TaskServiceClient.askResponse` while the plan response is active. It never invokes execution or bypasses approvals.
- `ChatTextArea` retains its existing mentions, slash commands, model selection, MCP controls, images/files, Plan/Act mode and accessibility. Its send control becomes a stop control during streaming and calls the existing `cancelTask` flow.
- UI animations respect `prefers-reduced-motion`.

Validation: run `npm run build`, `npm run lint`, and `npm test -- --run` from `webview-ui` with dependencies installed. Real licensed Pro installation requires a key not stored in this repository.
