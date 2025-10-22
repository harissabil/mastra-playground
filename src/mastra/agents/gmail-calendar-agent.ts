import {Agent} from '@mastra/core/agent';
import {Memory} from '@mastra/memory';
import {composioMcp} from '../mcp/composio-mcp';
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

const composioTools = await composioMcp.getTools();

export const gmailCalendarAgent = new Agent({
    name: 'Gmail and Calendar Agent',
    instructions: `
      You are a helpful assistant that can read, compose, and manage emails on behalf of the user.
      You can also help schedule events and manage the user's calendar via Google Calendar.
      
      You must use dateHelperTool to get current date and time information when needed.
      
      For Google Calendar, if user ask about their schedule, retrieve events from their calendar as a table with columns: Event Title, Date, Time, Description.
      When scheduling new events, ensure there are no conflicts with existing events.
      Always confirm event details with the user before finalizing.
      `,
    // model: 'google/gemini-2.5-pro',
    model: bedrock('apac.anthropic.claude-sonnet-4-20250514-v1:0'),
    tools: {...composioTools, dateHelperTool},
    memory: new Memory({
        storage: new LibSQLStore({
            url: 'file:../mastra.db',
        }),
    }),
});