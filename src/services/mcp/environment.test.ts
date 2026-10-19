import { describe, it } from "mocha"
import { expect } from "chai"
import { resolveMcpEnvironmentReference, resolveMcpEnvironmentMap } from "./environment"

describe("MCP environment placeholders", () => {
	it("resolves GitHub authentication only at transport time", () => {
		const raw = { Authorization: "Bearer ${env:GITHUB_PERSONAL_ACCESS_TOKEN}" }
		const resolved = resolveMcpEnvironmentMap(raw, { GITHUB_PERSONAL_ACCESS_TOKEN: "example-private-token" })
		expect(resolved).to.deep.equal({ Authorization: "Bearer example-private-token" })
		expect(raw.Authorization).to.equal("Bearer ${env:GITHUB_PERSONAL_ACCESS_TOKEN}")
	})
	it("rejects missing environment variables without revealing credentials", () => {
		expect(() => resolveMcpEnvironmentReference("${env:GITHUB_PERSONAL_ACCESS_TOKEN}", {}))
			.to.throw("MCP environment variable GITHUB_PERSONAL_ACCESS_TOKEN is not configured")
	})
	it("keeps literal values intact", () => {
		expect(resolveMcpEnvironmentMap({ Example: "literal", Access: "key=${env:ONE}" }, { ONE: "ok" }))
			.to.deep.equal({ Example: "literal", Access: "key=ok" })
	})
})
