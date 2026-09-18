import { defineTool } from "@/mcp/define-tool.js";
import { z } from "zod";
import { createTextResponse, toolErrorResponse } from "@/mcp/types.js";
import { McpScopes } from "@/config/constants.js";
import { exchangeToken } from "@/utils/tokenExchange.js";
import { callRest } from "@/utils/restClient.js";

const rejectExpenseInput = {
  expense_id: z
    .string()
    .uuid()
    .describe("Unique identifier (UUID) of the expense to reject"),

  reason: z
    .string()
    .min(10)
    .max(500)
    .describe("Reason for rejection (required, 10-500 characters)"),
};

export const rejectExpenseTool = defineTool({
  name: "reject_expense",

  description: `Reject a pending expense request.
Only managers and finance admins can reject expenses.
Managers can only reject expenses from their team members.
A reason for rejection is required.`,

  input: rejectExpenseInput as any,

  scopes: [],

  handler: async (args, extra) => {
    try {
      const restToken = await exchangeToken(
        extra.authInfo.token,
        McpScopes.EXPENSE_APPROVE,
      );
      const data = await callRest(
        restToken,
        "POST",
        `/expenses/${args.expense_id}/reject`,
        { reason: args.reason },
      );
      return createTextResponse({ success: true, data });
    } catch (error) {
      return toolErrorResponse(error);
    }
  },
});
