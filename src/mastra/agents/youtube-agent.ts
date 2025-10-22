import {Agent} from '@mastra/core/agent';
import {Memory} from '@mastra/memory';
import {ytComposioMcp} from '../mcp/yt-composio-mcp';
import {LibSQLStore} from '@mastra/libsql';
import {createAmazonBedrock} from '@ai-sdk/amazon-bedrock';
import * as dotenv from 'dotenv';
import {dateHelperTool} from "../tools/date-helper-tool";

dotenv.config();

const bedrock = createAmazonBedrock({
    region: 'ap-southeast-1',
    accessKeyId: process.env.AMAZON_ACCESS_KEY_ID,
    secretAccessKey: process.env.AMAZON_SECRET_ACCESS_KEY,
});

const ytComposioTools = await ytComposioMcp.getTools();

const userChannelId = process.env.YOUTUBE_CHANNEL_ID || 'not set';

export const ytAgent = new Agent({
    name: 'YouTube Agent',
    instructions: `
      You are a helpful assistant that can get user's YouTube channel activity and statistics.
      
      You must use dateHelperTool to get current date and time information when needed.
      
      The user's channel id is ${userChannelId}.
      `,
    // model: 'google/gemini-2.5-pro',
    model: bedrock('apac.anthropic.claude-sonnet-4-20250514-v1:0'),
    tools: {...ytComposioTools, dateHelperTool},
    memory: new Memory({
        storage: new LibSQLStore({
            url: 'file:../mastra.db',
        }),
    }),
});