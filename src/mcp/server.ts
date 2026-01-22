/**
 * MCP Server for Digital Folklore Archive
 *
 * This server allows external AI agents to submit folklore items
 * to the Digital Folklore Archive via the Model Context Protocol.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { createFolkloreItemTool } from './tools/create-item';

/**
 * Creates and configures the MCP server
 */
export function createMcpServer(): Server {
  const server = new Server(
    {
      name: 'dta-archive',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tool list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [createFolkloreItemTool.definition],
    };
  });

  // Register tool call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'create_folklore_item':
        return createFolkloreItemTool.handler(args);

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  });

  return server;
}

/**
 * Starts the MCP server with stdio transport
 */
export async function startMcpServer(): Promise<void> {
  const server = createMcpServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  // Log to stderr (stdout is used for MCP communication)
  console.error('DTA Archive MCP Server started');
}
