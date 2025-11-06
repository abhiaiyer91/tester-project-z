
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { Observability } from '@mastra/observability';
import { weatherDataWorkflow } from './workflows/weather-data-workflow';
import { activityPlanningWorkflow } from './workflows/activity-planning-workflow';
import { weatherCoordinatorAgent } from './agents/weather-coordinator-agent';
import { toolCallAppropriatenessScorer, completenessScorer, translationScorer } from './scorers/weather-scorer';
import { mcpServer } from './mcp-server';
import { activityPlanningHelperAgent } from './agents/activity-planning-helper-agent';

export const mastra = new Mastra({
  workflows: {
    weatherDataWorkflow,
    activityPlanningWorkflow
  },
  agents: {
    activityPlanningHelperAgent,
    weatherCoordinatorAgent
  },
  scorers: {
    toolCallAppropriatenessScorer,
    completenessScorer,
    translationScorer
  },
  storage: new LibSQLStore({
    id: "mastra-storage",
    // stores observability, scores, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  mcpServers: {
    mcpServer,
  },
  observability: new Observability({
    // Enables DefaultExporter and CloudExporter for tracing
    default: { enabled: true },
  }),
});
