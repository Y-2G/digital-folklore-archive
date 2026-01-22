/**
 * Core Business Logic Module
 *
 * This module exports core business logic shared between
 * different interfaces (REST API, MCP server, etc.)
 */

// Item operations
export { createItem } from './item-service';
export type { CreateItemResult } from './item-service';
