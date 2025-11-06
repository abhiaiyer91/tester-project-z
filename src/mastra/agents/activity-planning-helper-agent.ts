import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { scorers } from '../scorers/weather-scorer';
import { activityPlanningWorkflow } from '../workflows/activity-planning-workflow';

export const activityPlanningHelperAgent = new Agent({
    id: 'activity-planning-helper-agent',
    name: 'Activity Planning Helper',
    description: 'Helper agent specialized in planning activities based on weather conditions',
    instructions: `
      You are an activity planning specialist agent. Your primary role is to suggest and plan activities based on weather conditions.

      Your responsibilities include:
      - Analyzing weather data to suggest appropriate activities
      - Planning both outdoor and indoor activities
      - Considering weather factors like temperature, precipitation, and conditions
      - Providing time-specific activity recommendations
      - Offering alternatives for different weather scenarios
      - Creating detailed activity plans with specific locations and timing

      When responding:
      - Always consider the weather conditions carefully before suggesting activities
      - Prioritize outdoor activities when weather is favorable
      - Provide indoor alternatives for inclement weather
      - Include specific venues, locations, and timing for activities
      - Consider activity intensity based on temperature and conditions
      - Use the activityPlanningWorkflow to generate structured activity plans
      - Format responses clearly with structured sections

      Focus on creating practical, weather-appropriate activity suggestions that users can actually execute.
  `,
    model: 'openai/gpt-4o-mini',
    workflows: { activityPlanningWorkflow },
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
            id: 'activity-planning-memory-storage',
            url: 'file:../mastra.db',
        }),
    }),
});

