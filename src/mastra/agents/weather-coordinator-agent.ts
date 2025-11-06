import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { scorers } from '../scorers/weather-scorer';
// Helper agents this coordinator delegates to
import { weatherDataHelperAgent } from './weather-data-helper-agent';
import { activityPlanningHelperAgent } from './activity-planning-helper-agent';

export const weatherCoordinatorAgent = new Agent({
    id: 'weather-coordinator-agent',
    name: 'Weather Coordinator',
    description: 'Router agent that coordinates and delegates weather-related tasks to specialized helper agents',
    instructions: `
      You are a weather coordinator router agent responsible for routing and orchestrating weather-related requests to the appropriate specialized helper agents.

      You delegate to these helper agents:
      - weather-data-helper-agent: Handles all weather data fetching and forecast queries
      - activity-planning-helper-agent: Handles activity planning based on weather conditions

      Your primary responsibilities as a router:
      - Analyze incoming user requests and determine which helper agent should handle them
      - Route weather data queries to the weather-data-helper-agent (it has access to weatherDataWorkflow)
      - Route activity planning queries to the activity-planning-helper-agent (it has access to activityPlanningWorkflow)
      - For requests requiring both weather data AND activity planning:
        1. First, delegate to weather-data-helper-agent to get weather data
        2. Then, delegate to activity-planning-helper-agent with the weather data to get activity suggestions
      - Coordinate multi-location weather requests by delegating to weather-data-helper-agent for each location
      - Synthesize results from multiple helper agents when needed
      - Manage the overall flow and ensure tasks are completed in the right order

      Routing rules:
      - Pure weather data/forecast queries → delegate to weather-data-helper-agent
      - Activity planning with existing weather data → delegate to activity-planning-helper-agent  
      - Complete weather + activities requests → delegate to weather-data-helper-agent first, then activity-planning-helper-agent
      - Location comparisons → delegate to weather-data-helper-agent for each location, then compare results
      - Complex multi-step requests → break down and route to appropriate helper agents in sequence

      Always delegate to the specialized helper agents rather than handling tasks yourself. Access them via mastra.getAgent('weather-data-helper-agent') or mastra.getAgent('activity-planning-helper-agent').
  `,
    model: 'openai/gpt-4o-mini',
    agents: { weatherDataHelperAgent, activityPlanningHelperAgent },
    scorers: {
        toolCallAppropriateness: {
            scorer: scorers.toolCallAppropriatenessScorer,
            sampling: {
                type: 'ratio',
                rate: 1,
            },
        },
        completeness: {
            scorer: scorers.completenessScorer,
            sampling: {
                type: 'ratio',
                rate: 1,
            },
        },
        translation: {
            scorer: scorers.translationScorer,
            sampling: {
                type: 'ratio',
                rate: 1,
            },
        },
    },
    memory: new Memory({
        storage: new LibSQLStore({
            id: 'coordinator-memory-storage',
            url: 'file:../mastra.db', // path is relative to the .mastra/output directory
        }),
    }),
});

