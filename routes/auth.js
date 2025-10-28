import express from "express";
const router = express.Router();

import isAuthed from "../middleware/isAuthed.js";
import * as authController from "../controllers/auth.js";
import catchErrAsync from "../utils/catchErrAsync.js";
import {
  validateLogin,
  validateSignup,
  validateResetPassword,
  validateResetPasswordForm,
} from "../utils/validation.js";
import handleValidation from "../middleware/handleValidation.js";

router.get(
  "/login",
  isAuthed({ shouldBeAuthed: false }),
  authController.getLogin
);

router.post(
  "/login",
  isAuthed({ shouldBeAuthed: false }),
  validateLogin(),
  handleValidation("auth/login", { path: "/login", pageTitle: "Login" }),
  catchErrAsync(authController.postLogin)
);

router.post("/logout", catchErrAsync(authController.postLogout));

router.get(
  "/signup",
  isAuthed({ shouldBeAuthed: false }),
  authController.getSignup
);

router.post(
  "/signup",
  isAuthed({ shouldBeAuthed: false }),
  validateSignup(),
  handleValidation("auth/signup", { path: "/signup", pageTitle: "Signup" }),
  catchErrAsync(authController.postSignup)
);

router.get(
  "/reset-password",
  isAuthed({ shouldBeAuthed: false }),
  authController.getResetPassword
);

router.post(
  "/reset-password",
  isAuthed({ shouldBeAuthed: false }),
  validateResetPassword(),
  handleValidation("auth/reset-password", {
    path: "/reset-password",
    pageTitle: "Reset Password",
  }),
  catchErrAsync(authController.postResetPassword)
);

router.get(
  "/reset-password/:token",
  isAuthed({ shouldBeAuthed: false }),
  catchErrAsync(authController.getResetPasswordForm)
);

router.post(
  "/update-password",
  isAuthed({ shouldBeAuthed: false }),
  validateResetPasswordForm(),
  handleValidation("auth/form-reset-password", {
    path: "/form-reset-password",
    pageTitle: "Reset Password Form",
  }),
  catchErrAsync(authController.postResetPasswordForm)
);

export default router;
