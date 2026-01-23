/**
 * MCP Server Entry Point
 *
 * This file is the entry point for the MCP server.
 * Run with: yarn mcp:server
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load production environment variables (quiet: true to avoid stdout pollution in MCP)
config({ path: resolve(__dirname, '../../.env.prod'), quiet: true });

import { startMcpServer } from './server';

// Start the server
startMcpServer().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
