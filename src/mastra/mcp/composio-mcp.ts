import {MCPClient} from "@mastra/mcp";
import * as dotenv from 'dotenv';

dotenv.config();

export const composioMcp = new MCPClient({
    servers: {
        gmail: {
            url: new URL(process.env.COMPOSIO_MCP_GMAIL_URL),
        },
        calendar: {
            url: new URL(process.env.COMPOSIO_MCP_GOOGLE_CALENDAR_URL),
        }
    },
});