import {Mastra} from '@mastra/core/mastra';
import {PinoLogger} from '@mastra/loggers';
import {LibSQLStore} from '@mastra/libsql';
import {weatherWorkflow} from './workflows/weather-workflow';
import {weatherAgent} from './agents/weather-agent';
import {financeAgent} from './agents/finance-agent';
import {generalAgent} from "./agents/general-agent";
import {gmailCalendarAgent} from "./agents/gmail-calendar-agent";
import {ytAgent} from "./agents/youtube-agent";
import {playwrightAgent} from "./agents/playwright-agent";
import {travelokaFlightAgent} from "./agents/traveloka-playwright-agent";
import {canvaAgent} from "./agents/canva-agent";

export const mastra = new Mastra({
    workflows: {weatherWorkflow},
    agents: {
        weatherAgent,
        financeAgent,
        generalAgent,
        gmailAgent: gmailCalendarAgent,
        ytAgent,
        playwrightAgent,
        travelokaFlightAgent,
        canvaAgent
    },
    storage: new LibSQLStore({
        // stores observability, scores, ... into memory storage, if it needs to persist, change to file:../mastra.db
        url: ":memory:",
    }),
    logger: new PinoLogger({
        name: 'Mastra',
        level: 'info',
    }),
    telemetry: {
        // Telemetry is deprecated and will be removed in the Nov 4th release
        enabled: false,
    },
    observability: {
        // Enables DefaultExporter and CloudExporter for AI tracing
        default: {enabled: true},
    },
});
