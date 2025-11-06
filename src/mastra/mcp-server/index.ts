import { MCPServer } from '@mastra/mcp';
import { weatherTool } from '../tools/weather-tool';
import { weatherAgent } from '../agents/weather-agent';
import { weatherWorkflow } from '../workflows/weather-workflow';

export const mcpServer = new MCPServer({
    id: 'mcp-server',
    name: 'MCP Server',
    description: 'MCP Server',
    version: '1.0.0',
    tools: {
        weatherTool,
    },
    agents: {
        weatherAgent,
    },
    workflows: {
        weatherWorkflow,
    },
});