/**
 * create_folklore_item MCP Tool
 *
 * Allows AI agents to submit new folklore items to the archive.
 */

import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { createItem } from '../../lib/core';
import { validateCreateItemRequest } from '../../lib/api/validation';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * Tool definition for MCP protocol
 */
export const definition: Tool = {
  name: 'create_folklore_item',
  description: `Create a new folklore item in the Digital Folklore Archive.

This tool creates a new entry for folklore content such as kaidan (ghost stories),
urban legends, creepypasta, chain memes, original works, or commentary.

The item will be assigned a unique ID (format: DTA-XXXXXX) and stored in Firestore.

Required fields:
- type: Category of folklore (KAIDAN, URBAN_LEGEND, CREEPYPASTA, CHAIN_MEME, ORIGINAL, COMMENTARY)
- language: Primary language (JA, EN, OTHER)
- confidence: Source reliability (PRIMARY, SECONDARY, UNKNOWN)
- title: Bilingual title object (at least one of ja or en required)
- body: Content text (at least one of ja, en, or original required)
- motifs: Array of thematic tags (1-3 required)

Optional fields:
- status: DRAFT (default) or PUBLISHED
- originalTitle: Original title if different from display title
- firstSeen: When first observed (decade like "2000s" or YYYY format)
- sourceName: Source platform/site name
- sourceUrl: URL to original source
- sourceArchiveUrl: Archive.org or similar backup URL
- formats: Array of format tags
- region: Geographic region (JAPAN, NA, EU, ASIA_EX_JAPAN, GLOBAL_UNKNOWN)
- medium: Source medium (FORUM_BBS, SNS, VIDEO, WIKI_ARCHIVE, PRINT_ORAL, UNKNOWN)`,
  inputSchema: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['KAIDAN', 'URBAN_LEGEND', 'CREEPYPASTA', 'CHAIN_MEME', 'ORIGINAL', 'COMMENTARY'],
        description: 'Category of folklore content',
      },
      language: {
        type: 'string',
        enum: ['JA', 'EN', 'OTHER'],
        description: 'Primary language of the content',
      },
      confidence: {
        type: 'string',
        enum: ['PRIMARY', 'SECONDARY', 'UNKNOWN'],
        description: 'Source reliability level',
      },
      title: {
        type: 'object',
        properties: {
          ja: { type: 'string', description: 'Japanese title (max 200 chars)' },
          en: { type: 'string', description: 'English title (max 200 chars)' },
        },
        description: 'Bilingual title (at least one of ja or en required)',
      },
      body: {
        type: 'object',
        properties: {
          ja: { type: 'string', description: 'Japanese body text' },
          en: { type: 'string', description: 'English body text' },
          original: { type: 'string', description: 'Original text if neither ja nor en' },
        },
        description: 'Content body (at least one of ja, en, or original required)',
      },
      motifs: {
        type: 'array',
        items: {
          type: 'string',
          enum: [
            'PLACE',
            'ROAD_TUNNEL',
            'FOREST_MOUNTAIN',
            'WATER',
            'ROOM_APARTMENT',
            'MISSING_PERSON',
            'STALKER_OBSERVER',
            'ENTITY',
            'DOPPELGANGER',
            'CHILD_FAMILY',
            'MEDIA_DEVICE',
            'RITUAL_RULES',
            'WARNING_CHAIN',
            'EXPERIMENT_REPORT',
            'IDENTITY',
          ],
        },
        minItems: 1,
        maxItems: 3,
        description: 'Thematic motif tags (1-3 required)',
      },
      status: {
        type: 'string',
        enum: ['DRAFT', 'PUBLISHED'],
        default: 'DRAFT',
        description: 'Publication status',
      },
      originalTitle: {
        type: 'string',
        description: 'Original title if different from display title',
      },
      firstSeen: {
        type: 'string',
        description: 'When first observed (Pre-1999, 2000s, 2010s, 2020s, Unknown, or YYYY/YYYY-MM)',
      },
      sourceName: {
        type: 'string',
        description: 'Source platform name (e.g., "2ch", "reddit")',
      },
      sourceUrl: {
        type: 'string',
        format: 'uri',
        description: 'URL to original source',
      },
      sourceArchiveUrl: {
        type: 'string',
        format: 'uri',
        description: 'Archive.org backup URL',
      },
      formats: {
        type: 'array',
        items: { type: 'string' },
        description: 'Format tags',
      },
      region: {
        type: 'string',
        enum: ['JAPAN', 'NA', 'EU', 'ASIA_EX_JAPAN', 'GLOBAL_UNKNOWN'],
        description: 'Geographic region',
      },
      medium: {
        type: 'string',
        enum: ['FORUM_BBS', 'SNS', 'VIDEO', 'WIKI_ARCHIVE', 'PRINT_ORAL', 'UNKNOWN'],
        description: 'Source medium type',
      },
    },
    required: ['type', 'language', 'confidence', 'title', 'body', 'motifs'],
  },
};

/**
 * Tool handler function
 */
export async function handler(
  args: Record<string, unknown> | undefined
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  if (!args) {
    throw new McpError(ErrorCode.InvalidParams, 'Missing arguments');
  }

  // Validate input using existing Zod schema
  const validation = validateCreateItemRequest(args);

  if (!validation.success) {
    const fieldErrors = Object.entries(validation.error.fields)
      .map(([field, message]) => `  - ${field}: ${message}`)
      .join('\n');

    throw new McpError(
      ErrorCode.InvalidParams,
      `Validation failed:\n${fieldErrors}`
    );
  }

  try {
    // Create item using core service
    const result = await createItem(validation.data);

    return {
      content: [
        {
          type: 'text',
          text: `Successfully created folklore item.\n\nID: ${result.id}\nCreated: ${result.createdAt.toISOString()}`,
        },
      ],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new McpError(ErrorCode.InternalError, `Failed to create item: ${message}`);
  }
}

/**
 * Exported tool object
 */
export const createFolkloreItemTool = {
  definition,
  handler,
};
