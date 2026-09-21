import { Router, type Router as ExpressRouter } from "express";
import { config } from "@/config/index.js";
import { LR_MCP_SCOPE, McpScopes } from "@/config/constants.js";

const router: ExpressRouter = Router();

/**
 * RFC 9728 protected-resource metadata for the MCP endpoint, served at the
 * root so MCP clients can discover the authorization server from the
 * `WWW-Authenticate` header on a 401. Built from config rather than held in an
 * environment variable, so the advertised resource and scopes cannot drift
 * from the ones the server actually enforces.
 */
router.get("/.well-known/oauth-protected-resource", (_req, res) => {
  res.json({
    resource: config.MCP_RESOURCE_URL,
    authorization_servers: [config.LR_ISSUER],
    bearer_methods_supported: ["header"],
    scopes_supported: [
      LR_MCP_SCOPE,
      "openid",
      "email",
      ...Object.values(McpScopes),
    ],
  });
});

export const wellKnownRouter: Router = router;
