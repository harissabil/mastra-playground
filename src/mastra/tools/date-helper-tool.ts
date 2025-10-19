import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const dateHelperTool = createTool({
    id: 'get-current-datetime',
    description: 'Get the current date and time. Use this tool when users ask about weather for relative dates like tomorrow, yesterday, or specific days. The LLM will calculate the target date based on the current datetime.',
    inputSchema: z.object({
        _dummy: z.string().optional().describe('Not used, just for schema validation'),
    }),
    outputSchema: z.object({
        currentDate: z.string().describe('Current date in ISO format (YYYY-MM-DD)'),
        currentDateTime: z.string().describe('Current date and time in ISO format'),
        currentTimestamp: z.number().describe('Current timestamp in milliseconds'),
        timezone: z.string().describe('Timezone'),
        dayOfWeek: z.string().describe('Current day of the week'),
    }),
    execute: async () => {
        const now = new Date();
        const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });

        return {
            currentDate: now.toISOString().split('T')[0],
            currentDateTime: now.toISOString(),
            currentTimestamp: now.getTime(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            dayOfWeek,
        };
    },
});