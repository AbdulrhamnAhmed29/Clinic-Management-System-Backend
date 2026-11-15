import { Router } from "express";
import { validateBody } from "../../middlewares/createMiddlewares.js";
import { createUserController } from "./controller/createUserController.js";
import { deleteUserController } from "./controller/deleteUserController.js";
import { getUserByIdController } from "./controller/getUserByIdController.js";
import { getUsersController } from "./controller/getUsersController.js";
import { updateUserController } from "./controller/updateUserController.js";
import {
  createUserSchema,
  updateUserSchema,
} from "./validators/userValidation.js";
import { authorized } from "../../auth/middlewares/authorized.js";
import { authenticated } from "../../auth/middlewares/authnticated.js";

export const userRouter = Router();
userRouter
  .route("/")
  .get(authenticated, getUsersController)
  .post(
    authenticated,
    authorized("super_admin","clinic_admin"),
    validateBody(createUserSchema),
    createUserController
  );

userRouter
  .route("/:id")
  .get(authenticated, getUserByIdController)
  .patch(
    authenticated,
    authorized("super_admin"),
    validateBody(updateUserSchema),
    updateUserController
  )
  .delete(
    authenticated,
    authorized("super_admin" ,"clinic_admin"),
    deleteUserController
  );