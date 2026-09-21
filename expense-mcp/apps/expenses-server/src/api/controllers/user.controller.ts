import type { Request, Response, NextFunction } from "express";
import { userService } from "@/services/index.js";
import { sendCreated, sendSuccess } from "@/utils/response.js";
import {
  registerUserSchema,
  updateUserProfileSchema,
} from "@/api/validators/index.js";
import { ValidationError } from "@/utils/errors.js";

class UserController {
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      sendSuccess(res, req.user!);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users - Everyone known to this app. Local data only; roles are
   * loaded per row by getUserRoles so listing stays a single query.
   */
  async listUsers(_req: Request, res: Response, next: NextFunction) {
    try {
      console.log("request reached")
      sendSuccess(res, { users: userService.listUsers() });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/users/:userId - Set department and manager.
   */
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateUserProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError("Invalid user update", {
          errors: parsed.error.issues,
        });
      }

      sendSuccess(
        res,
        userService.updateProfile(req.params.userId as string, parsed.data),
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/users/register - Register a new user
   */
  async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = {
        ...req.body,
        ...(req.body.lrUserId
          ? {}
          : req.body.lr_user_id
            ? { lrUserId: req.body.lr_user_id }
            : {}),
      };
      const parsed = registerUserSchema.safeParse(payload);
      if (!parsed.success) {
        throw new ValidationError("Invalid user data", {
          errors: parsed.error.issues,
        });
      }

      const user = await userService.registerUser(parsed.data);
      sendCreated(res, user);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
