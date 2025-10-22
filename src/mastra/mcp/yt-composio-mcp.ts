import {MCPClient} from "@mastra/mcp";
import * as dotenv from 'dotenv';

dotenv.config();

export const ytComposioMcp = new MCPClient({
    servers: {
        youtube: {
            url: new URL(process.env.COMPOSIO_MCP_YOUTUBE_URL),
        },
    },
});