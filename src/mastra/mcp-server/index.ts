import { MCPServer } from '@mastra/mcp';
import { weatherTool } from '../tools/weather-tool';
import { weatherCoordinatorAgent } from '../agents/weather-coordinator-agent';

export const mcpServer = new MCPServer({
    id: 'mcp-server',
    name: 'MCP Server',
    description: 'MCP Server',
    version: '1.0.0',
    tools: {
        weatherTool,
    },
    agents: {
        weatherCoordinatorAgent,
    },
});