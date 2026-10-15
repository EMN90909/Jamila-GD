### .jamignore Support

To give you more control over which files are accessible to Jamila, we've implemented `.jamignore` functionality, similar to `.gitignore`. This allows you to specify files and directories that Jamila should **not** access or process. This is useful for:

*   **Privacy:** Preventing Jamila from accessing sensitive or private files in your workspace.
*   **Performance:**  Excluding large directories or files that are irrelevant to your tasks, potentially improving the efficiency of Jamila.
*   **Context Management:**  Focusing Jamila's attention on the relevant parts of your project.

**How to use `.jamignore`**

1.  **Create a `.jamignore` file:** In the root directory of your workspace (the same level as your `.vscode` folder, or the top level folder you opened in VS Code), create a new file named `.jamignore`.

2.  **Define ignore patterns:** Open the `.jamignore` file and specify the patterns for files and directories you want Jamila to ignore. The syntax is the same as `.gitignore`:

    *   Each line in the file represents a pattern.
    *   **Standard glob patterns are supported:**
        *   `*` matches zero or more characters
        *   `?` matches one character
        *   `[]` matches a character range
        *   `**` matches any number of directories and subdirectories.

    *   **Directory patterns:** Append `/` to the end of a pattern to specify a directory.
    *   **Negation patterns:** Start a pattern with `!` to negate (un-ignore) a previously ignored pattern.
    *   **Comments:** Start a line with `#` to add comments.

    **Example `.jamignore` file:**

    ```
    # Ignore log files
    *.log

    # Ignore the entire 'node_modules' directory
    node_modules/

    # Ignore all files in the 'temp' directory and its subdirectories
    temp/**

    # But DO NOT ignore 'important.log' even if it's in the root
    !important.log

    # Ignore any file named 'secret.txt' in any subdirectory
    **/secret.txt
    ```

3.  **Jamila respects your `.jamignore`:** Once you save the `.jamignore` file, Jamila will automatically recognize and apply these rules.

    *   **File Access Control:** Jamila will not be able to read the content of ignored files using tools like `read_file`. If you attempt to use a tool on an ignored file, Jamila will inform you that access is blocked due to `.jamignore` settings.
    *   **File Listing:** When you ask Jamila to list files in a directory (e.g., using `list_files`), ignored files and directories will still be listed, but they will be marked with a **🔒** symbol next to their name to indicate that they are ignored. This helps you understand which files Jamila can and cannot interact with.

4.  **Dynamic Updates:** Jamila monitors your `.jamignore` file for changes. If you modify, create, or delete your `.jamignore` file, Jamila will automatically update its ignore rules without needing to restart VS Code or the extension.

**In Summary**

The `.jamignore` file provides a powerful and flexible way to control Jamila's access to your workspace files, enhancing privacy, performance, and context management. By leveraging familiar `.gitignore` syntax, you can easily tailor Jamila's focus to the most relevant parts of your projects.