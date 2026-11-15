import { Router } from "express";
import { validateBody } from "../middlewares/createMiddlewares.js";
import { createUserSchema } from "../features/users/validators/userValidation.js";
import { loginController } from "./controller/loginController.js";
import { registerController } from "./controller/registerController.js";
import { loginSchema } from "./validators/loginValidation.js";
import { logoutController } from "./controller/logoutController.js";

export const AuthRoutes = Router();

AuthRoutes.post(
  "/register",
  validateBody(createUserSchema),
  registerController
);
AuthRoutes.post("/login", validateBody(loginSchema), loginController);
AuthRoutes.post("/logout", logoutController);