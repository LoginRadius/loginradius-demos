import { Router } from "express";
import { userController } from "@/api/controllers/index.js";
import { authMiddleware, requireFinanceAdmin } from "@/middleware/index.js";

const router = Router();

router.use(authMiddleware);

// GET /users/me — auth only, no role guard
router.get("/me", userController.getMe.bind(userController));

// Everything below is the admin surface.
router.use(requireFinanceAdmin());

// Literal segments must precede "/:userId" so they are not captured by it.
router.get("/", userController.listUsers.bind(userController));
router.post("/register", userController.registerUser.bind(userController));

router.patch("/:userId", userController.updateUser.bind(userController));

export const userRouter: Router = router;
