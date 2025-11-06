import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const forecastSchema = z.object({
    date: z.string(),
    maxTemp: z.number(),
    minTemp: z.number(),
    precipitationChance: z.number(),
    condition: z.string(),
    location: z.string(),
});

const planActivities = createStep({
    id: 'plan-activities-from-weather',
    description: 'Suggests activities based on weather forecast data',
    inputSchema: forecastSchema,
    outputSchema: z.object({
        activities: z.string(),
    }),
    execute: async ({ inputData, mastra }) => {
        const forecast = inputData;

        if (!forecast) {
            throw new Error('Forecast data not found');
        }

        const agent = mastra?.getAgentById('activity-planning-helper-agent');

        if (!agent) {
            throw new Error('Activity planning helper agent not found');
        }

        const prompt = `Based on the following weather forecast for ${forecast.location}, suggest appropriate activities:
      ${JSON.stringify(forecast, null, 2)}
      For each day in the forecast, structure your response exactly as follows:

      📅 [Day, Month Date, Year]
      ═══════════════════════════

      🌡️ WEATHER SUMMARY
      • Conditions: [brief description]
      • Temperature: [X°C/Y°F to A°C/B°F]
      • Precipitation: [X% chance]

      🌅 MORNING ACTIVITIES
      Outdoor:
      • [Activity Name] - [Brief description including specific location/route]
        Best timing: [specific time range]
        Note: [relevant weather consideration]

      🌞 AFTERNOON ACTIVITIES
      Outdoor:
      • [Activity Name] - [Brief description including specific location/route]
        Best timing: [specific time range]
        Note: [relevant weather consideration]

      🏠 INDOOR ALTERNATIVES
      • [Activity Name] - [Brief description including specific venue]
        Ideal for: [weather condition that would trigger this alternative]

      ⚠️ SPECIAL CONSIDERATIONS
      • [Any relevant weather warnings, UV index, wind conditions, etc.]

      Guidelines:
      - Suggest 2-3 time-specific outdoor activities per day
      - Include 1-2 indoor backup options
      - For precipitation >50%, lead with indoor activities
      - All activities must be specific to the location
      - Include specific venues, trails, or locations
      - Consider activity intensity based on temperature
      - Keep descriptions concise but informative

      Maintain this exact formatting for consistency, using the emoji and section headers as shown.`;

        const response = await agent.stream([
            {
                role: 'user',
                content: prompt,
            },
        ]);

        let activitiesText = '';

        for await (const chunk of response.textStream) {
            process.stdout.write(chunk);
            activitiesText += chunk;
        }

        return {
            activities: activitiesText,
        };
    },
});

const activityPlanningWorkflow = createWorkflow({
    id: 'activity-planning-workflow',
    description: 'Plans activities based on weather forecast data',
    inputSchema: forecastSchema,
    outputSchema: z.object({
        activities: z.string(),
    }),
})
    .then(planActivities);

activityPlanningWorkflow.commit();

export { activityPlanningWorkflow };

