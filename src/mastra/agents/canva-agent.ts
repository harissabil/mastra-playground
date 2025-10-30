import {Agent} from '@mastra/core/agent';
import {Memory} from '@mastra/memory';
import {LibSQLStore} from '@mastra/libsql';
import {createAmazonBedrock} from '@ai-sdk/amazon-bedrock';
import * as dotenv from 'dotenv';
import {canvaComposioMcp} from "../mcp/canva-composio-mcp";

dotenv.config();

const bedrock = createAmazonBedrock({
    region: 'ap-southeast-1',
    accessKeyId: process.env.AMAZON_ACCESS_KEY_ID,
    secretAccessKey: process.env.AMAZON_SECRET_ACCESS_KEY,
});

// @ts-ignore
const canvaComposioTools = await canvaComposioMcp.getTools();

export const canvaAgent = new Agent({
    name: 'Canva Agent',
    instructions: `
      You are a helpful design assistant that helps users create and edit designs using Canva.
      You support users in ANY language and help them make visually appealing designs.
      `,
    // model: 'google/gemini-2.5-pro',
    model: bedrock('global.anthropic.claude-sonnet-4-5-20250929-v1:0'),
    tools: {...canvaComposioTools},
    memory: new Memory({
        storage: new LibSQLStore({
            url: 'file:../mastra.db',
        }),
    }),
});