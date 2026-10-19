/**
 * Resolve ${env:NAME} only when initializing an MCP transport.
 * The persisted settings and webview state keep the literal placeholders.
 */
export function resolveMcpEnvironmentReference(value: string, environment: NodeJS.ProcessEnv = process.env): string {
	return value.replace(/\$\{env:([A-Za-z_][A-Za-z0-9_]*)\}/g, (_match, name: string) => {
		const resolved = environment[name]
		if (!resolved) throw new Error(`MCP environment variable ${name} is not configured in the extension host`)
		return resolved
	})
}

export function resolveMcpEnvironmentMap(
	values: Record<string, string> | undefined,
	environment: NodeJS.ProcessEnv = process.env,
): Record<string, string> | undefined {
	if (!values) return undefined
	return Object.fromEntries(
		Object.entries(values).map(([name, value]) => [name, resolveMcpEnvironmentReference(value, environment)]),
	)
}
