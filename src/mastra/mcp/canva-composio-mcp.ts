import {MCPClient} from "@mastra/mcp";
import * as dotenv from 'dotenv';

dotenv.config();

export const canvaComposioMcp = new MCPClient({
    servers: {
        canva: {
            url: new URL(process.env.COMPOSIO_MCP_CANVA_URL),
        },
    },
});