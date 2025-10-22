import {MCPClient} from "@mastra/mcp";

export const testMcpClient = new MCPClient({
    id: "test-mcp-client",
    servers: {
        microsoft: {
            url: new URL('https://learn.microsoft.com/api/mcp')
        },
        playwright: {
            "command": "npx",
            "args": [
                "@playwright/mcp@latest"
            ]
        }
        // wikipedia: {
        //     command: "npx",
        //     args: ["-y", "wikipedia-mcp"]
        // },
        // weather: {
        //     url: new URL(`https://server.smithery.ai/@smithery-ai/national-weather-service/mcp?api_key=${process.env.SMITHERY_API_KEY}`)
        // },
    }
});