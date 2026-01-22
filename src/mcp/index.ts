/**
 * MCP Server Entry Point
 *
 * This file is the entry point for the MCP server.
 * Run with: yarn mcp:server
 */

import { startMcpServer } from './server';

// Start the server
startMcpServer().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
