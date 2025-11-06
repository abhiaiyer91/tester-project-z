import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { weatherTool } from '../tools/weather-tool';
import { scorers } from '../scorers/weather-scorer';
import { weatherDataWorkflow } from '../workflows/weather-data-workflow';

export const weatherDataHelperAgent = new Agent({
  id: 'weather-data-helper-agent',
  name: 'Weather Data Helper',
  description: 'Helper agent specialized in fetching and providing weather data',
  instructions: `
      You are a weather data specialist agent. Your primary role is to fetch, retrieve, and provide accurate weather information.

      Your responsibilities include:
      - Fetching current weather data for locations
      - Retrieving weather forecasts
      - Providing detailed weather metrics (temperature, humidity, wind, precipitation)
      - Handling geocoding and location resolution
      - Formatting weather data in a clear and useful manner

      When responding:
      - Always verify the location is correct before fetching weather
      - Provide comprehensive weather details when requested
      - Use the weatherDataWorkflow for forecast data
      - Use the weatherTool for current weather queries
      - Be precise and accurate with weather information
      - Convert temperatures if needed for user convenience

      Focus on delivering accurate weather data efficiently.
  `,
  model: 'openai/gpt-4o-mini',
  tools: { weatherTool },
  workflows: { weatherDataWorkflow },
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
      id: 'weather-data-memory-storage',
      url: 'file:../mastra.db',
    }),
  }),
});

