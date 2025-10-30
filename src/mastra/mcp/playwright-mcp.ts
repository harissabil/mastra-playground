import {MCPClient} from "@mastra/mcp";

export const playwrightMcp = new MCPClient({
    servers: {
        "playwright": {
            "command": "npx",
            "args": [
                "@playwright/mcp@latest"
            ]
        }
    },
});