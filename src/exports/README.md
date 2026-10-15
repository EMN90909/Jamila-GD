# Jamila API

The Jamila extension exposes an API that can be used by other extensions. To use this API in your extension:

1. Copy `src/extension-api/jam.d.ts` to your extension's source directory.
2. Include `jam.d.ts` in your extension's compilation.
3. Get access to the API with the following code:

    ```ts
    const jamExtension = vscode.extensions.getExtension<JamilaAPI>("saoudrizwan.claude-dev")

    if (!jamExtension?.isActive) {
    	throw new Error("Jamila extension is not activated")
    }

    const jam = jamExtension.exports

    if (jam) {
    	// Now you can use the API

    	// Start a new task with an initial message
    	await jam.startNewTask("Hello, Jamila! Let's make a new project...")

    	// Start a new task with an initial message and images
    	await jam.startNewTask("Use this design language", ["data:image/webp;base64,..."])

    	// Send a message to the current task
    	await jam.sendMessage("Can you fix the @problems?")

    	// Simulate pressing the primary button in the chat interface (e.g. 'Save' or 'Proceed While Running')
    	await jam.pressPrimaryButton()

    	// Simulate pressing the secondary button in the chat interface (e.g. 'Reject')
    	await jam.pressSecondaryButton()
    } else {
    	console.error("Jamila API is not available")
    }
    ```

    **Note:** To ensure that the `saoudrizwan.claude-dev` extension is activated before your extension, add it to the `extensionDependencies` in your `package.json`:

    ```json
    "extensionDependencies": [
        "saoudrizwan.claude-dev"
    ]
    ```

For detailed information on the available methods and their usage, refer to the `jam.d.ts` file.
