import { RestError } from "@/utils/restClient.js";
import { TokenExchangeError } from "@/utils/tokenExchange.js";
// =============================================================================
// MCP Tool Type Definitions
// =============================================================================

import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { UserRole } from "@/config/constants.js";

/**
 * Authentication info provided to MCP tools
 * Available in tool handlers via `extra.authInfo`
 */
export interface McpAuthInfo {
  /** Raw access token */
  token: string;

  /** The client ID (user ID from token subject) */
  clientId: string;

  /** Scopes granted to this token */
  scopes: string[];

  /** Derived roles from scopes */
  roles?: UserRole[];

  /** Token expiration timestamp */
  expiresAt?: number;

  /** Raw token claims */
  claims?: Record<string, unknown>;
}

/**
 * Extra context passed to tool handlers
 */
export interface McpToolExtra {
  /** Authentication information from the validated token */
  authInfo: McpAuthInfo;

  /**
   * Get an outbound token for calling external APIs
   * Only available if configured by the auth provider
   */
  getOutboundToken?: (appId: string, scopes?: string[]) => Promise<string>;
}

/**
 * Tool handler function signature (with input)
 */
export type ToolHandlerWithInput<TArgs = any> = (
  args: TArgs,
  extra: McpToolExtra,
) => Promise<CallToolResult>;

/**
 * Tool handler function signature (without input)
 */
export type ToolHandlerNoInput = (
  extra: McpToolExtra,
) => Promise<CallToolResult>;

/**
 * Helper to create a successful text response
 */
export function createTextResponse(data: unknown): CallToolResult {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

/**
 * Helper to create an error response
 */
export function createErrorResponse(
  error: string,
  details?: unknown,
): CallToolResult {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            error,
            details,
          },
          null,
          2,
        ),
      },
    ],
    isError: true,
  };
}

/**
 * Renders a failure from a tool handler as a tool result.
 *
 * Tools reach the REST API through token exchange, so the API's own error is
 * what the agent needs to see: the same code, message and details a REST caller
 * would get. Anything unrecognised is reported generically rather than leaking
 * internals into the transcript.
 */
export function toolErrorResponse(error: unknown): CallToolResult {
  if (error instanceof RestError) {
    return createErrorResponse(error.message, {
      status: error.status,
      code: error.code,
      ...(error.details !== undefined ? { details: error.details } : {}),
    });
  }

  if (error instanceof TokenExchangeError) {
    return createErrorResponse(error.message, { code: "TOKEN_EXCHANGE_FAILED" });
  }

  return createErrorResponse("An unexpected error occurred");
}
