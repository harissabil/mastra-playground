import {Agent} from '@mastra/core/agent';
import {Memory} from '@mastra/memory';
import {testMcpClient} from '../mcp/microsoft-playwright-mcp';
import {LibSQLStore} from '@mastra/libsql';
import {createAmazonBedrock} from '@ai-sdk/amazon-bedrock';
import * as dotenv from 'dotenv';

dotenv.config();

const bedrock = createAmazonBedrock({
    region: 'ap-southeast-1',
    accessKeyId: process.env.AMAZON_ACCESS_KEY_ID,
    secretAccessKey: process.env.AMAZON_SECRET_ACCESS_KEY,
});

export const generalAgent = new Agent({
    name: 'General Agent',
    instructions: `
      You are a helpful assistant that provides accurate and relevant information to users on a wide range of topics, you can use any available tools to assist you in providing the best possible answers.
`,
    // model: 'google/gemini-2.5-pro',
    model: bedrock('apac.anthropic.claude-sonnet-4-20250514-v1:0'),
    tools: await testMcpClient.getTools(),
    memory: new Memory({
        storage: new LibSQLStore({
            url: 'file:../mastra.db',
        }),
    }),
});