---
layout: layouts/post
title: 'Vite MCP Client Tools Plugin'
description: 'A Vite plugin that brings client-side MCP tools to allow your coding agent to see your app in action'
image: i/vite-plugin-mcp-client-tools.webp
alt: 'A diagram depicting how the plugin components interact with each other'
date: 2025-10-13
bluesky: https://bsky.app/profile/ates.dev/post/3m355kdy4v223
---

### tl;dr

[A Vite plugin](https://www.npmjs.com/package/vite-plugin-mcp-client-tools) that brings client-side MCP tools to allow your coding agent to see your app in action. Uses your existing Vite development server, so you don't have to run a separate MCP server.

### Short story

I've been enamored with getting coding agents to self-improve by telling them to write MCP servers for themselves.

This is the outcome of one such experiment where I was getting frustrated by the agent's enthusiastic "Perfect!" exclamations while it had no idea what the UI it was modifying looked like. I told the agent to add an MCP server to the existing Vite server that's serving the UI, and to add two tools: A screenshot tool so it can see the browser window whenever it wants, and a console log tool so it can see errors and diagnostic messages.

Once the proof of concept worked, I put aside the agent to properly (manually) architect the plugin and made it extensible for new tools.

### Installation and configuration

Adding the Vite plugin and its tools to a project looks like this:

<pre><code class="language-sh">npm install vite-plugin-mcp-client-tools
</code></pre>

<pre><code class="language-js">import { defineConfig } from 'vite';
import { viteMcpPlugin } from "vite-plugin-mcp-client-tools";
import { readConsoleTool } from "vite-plugin-mcp-client-tools/tools/read-console";
import { takeScreenshotTool } from "vite-plugin-mcp-client-tools/tools/take-screenshot";

export default defineConfig({
  plugins: [
    viteMcpPlugin({
      tools: [readConsoleTool, takeScreenshotTool],
    }),
  ],
});
</code></pre>

### Usage

Then the agent needs to be configured with the MCP server exposed by the plugin, running on the very same Vite development server.
Depending on the coding agent that you use, you may have to edit an MCP configuration file. For Claude Code, you can run something like this:

<pre><code class="language-sh">claude mcp add vite-server-client-tools --transport http http://localhost:3000/mcp
</code></pre>

Once the agent knows about these tools, it will automatically start using them, unprompted. Magic will ensue. It will start taking screenshots to see the result of its changes (and the reason for your complaints) and it will start peeking at the console to see what's happening in JavaScript land in the browser. Unless it doesn't. Then you might have to nudge it to start using the tools.

Hint: If you let your agent start the Vite development server as a background process, it can also see how the server is doing, by tailing its output.

### Tool contract

Beyond the standard MCP tool definition components, `name`, `description`, `inputSchema`, and `outputSchema`, each tool consists of:

- A `handler` function that implements the tool's logic.
- An optional `component` factory function for a WebComponent that gets mounted on the document's body. This is useful for tools that require user interaction or configurability.
- An optional `server` hash of helper methods that get mounted on the Vite server (namespaced by the tool's name).

The `handler` receives the `component` and `server` as properties on `this`:

- The `component` property is the DOM node for the WebComponent.
- The `server` property is a `Proxy` that lets the tool remote-call the defined server-side methods.

The built-in screenshot tools demonstrates all of these features. The tool's `handler` function:

<pre><code class="language-js">handler: async function (this: ToolContext) {
  const { dataUrl, quality, saveToDisk } = await this.component.captureScreenshot();

  const base64Data = dataUrl.split(",")[1];

  let savedPath: string | undefined;

  if (saveToDisk) {
    const { path } = await this.server.saveScreenshot({ dataUrl });
    savedPath = path;
  }

  const textContent = savedPath
    ? `Screenshot of current browser tab captured (quality: ${quality}, saved to: ${savedPath})`
    : `Screenshot of current browser tab captured (quality: ${quality})`;

  return {
    content: [
      {
        type: "text",
        text: textContent,
      },
      {
        type: "image",
        mimeType: "image/jpeg",
        data: base64Data,
      },
    ],
  };
},
...
</code></pre>

### Under the hood

The plugin uses Vite's existing HMR (Hot Module Replacement) WebSocket connection for bi-directional RPC (Remote Procedure Call) with a bridge that gets injected into the page as a virtual module (so that `import.meta.hot` can be present). Tools' WebComponents are defined using additional script tags and get mounted on the document's body.

In the scripts injected into the page by the plugin, there's generous use of IIFE (Immediately Invoked Function Expression) for serialization and deserialization of server-defined functions while performing dependency injection. I'm not going to cover all the tips and tricks here. You can see them in action in the [source code](https://github.com/atesgoral/vite-plugin-mcp-client-tools/tree/main/src) of the plugin.
