import crypto from "crypto";
import bcrypt from "bcryptjs";

import User from "./user.js";

import { comparePasswords } from "../utils/validation.js";
import {
  newError,
  sendEmail,
  requireEnvVar as required,
  createLogger,
} from "../utils/index.js";

const log = createLogger(import.meta.url);

export async function loginUser(userData) {
  const errorDetails = [
    { cause: "email", message: "Invalid email or password" },
    { cause: "password" },
  ];

  try {
    const { email, password } = userData;

    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      log("warn", `User with email ${email} not found`);
      return {
        didSucceed: false,
        details: errorDetails,
        oldInput: { email: userData.email },
      };
    }

    const doMatch = await comparePasswords(password.trim(), foundUser.password);
    if (!doMatch) {
      log("warn", `Invalid credentials`);
      return {
        didSucceed: false,
        details: errorDetails,
        oldInput: { email: userData.email },
      };
    }

    log("success", "Succesfully logged in");
    return {
      didSucceed: true,
      details: { message: "Welcome!" },
      user: foundUser,
    };
  } catch (error) {
    log("error", error);
    throw newError("Failed to login user", error);
  }
}

export async function singupUser(userData) {
  try {
    const { email, password } = userData;

    const userExists = await User.findOne({ email });

    // ^ return will be handled in controller, calling res.render
    if (userExists) {
      log("warn", `Email ${email} already taken`);
      return {
        didSucceed: false,
        details: {
          cause: "email",
          message:
            "Email already in use. Please provide different email adress",
        },
      };
    }

    const hashedPwd = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      password: hashedPwd,
      cart: { items: [] },
    });

    await user.save();

    const dummyID = crypto.randomUUID();
    await sendEmail(
      email,
      "Signup succeeded!",
      `<h1>You succesfully signed up!</h1><p>Dummy ID: ${dummyID}</p>`,
      {
        disabled: {
          logType: "warn",
          logMessage:
            "[EMAIL NOT SENT] - EMAIL_SEND_DISABLED env var was set to true",
        },
      }
    );

    log("success", "User created");
    return {
      didSucceed: true,
      details: {
        message: "User succesfully created!",
      },
    };
  } catch (error) {
    log("error", error);
    throw newError("Failed to signup user", error);
  }
}

export async function resetPassword(email) {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err)
        return reject(newError("Generating crypto random data failed", err));

      const token = buffer.toString("hex");

      try {
        const foundUser = await User.findOne({ email });

        if (!foundUser) {
          log("warn", `Email ${email} not found`);
          return resolve({
            didSucceed: false,
            details: {
              cause: "email",
              message: "No user found. Please provide a valid email adress",
            },
            oldInput: { email },
          });
        }

        const PORT = required("SERVER_PORT") || 3000;
        const ONE_HOUR = 60 * 60 * 1000; // 1h in miliseconds
        const dummyID = crypto.randomUUID();

        foundUser.resetPasswordToken.token = token;
        foundUser.resetPasswordToken.expiresAt = Date.now() + ONE_HOUR;
        await foundUser.save();

        await sendEmail(
          foundUser.email,
          "Password Reset Link",
          `
            <h1>You requested a password reset</h1>
            <p>Click this <a href="http://localhost:${PORT}/reset-password/${token}">link</a> to set a new password.</p>
            <p>Dummy ID: ${dummyID}</p>
            `,
          {
            disabled: {
              logType: "warn",
              logMessage: `[EMAIL NOT SENT] - EMAIL_SEND_DISABLED env var was set to true\nGenerated token: ${token}\nPassword reset link: ${`http://localhost:${PORT}/reset-password/${token}`}`,
            },
          }
        );

        log("success", "Password reset email sent");
        return resolve({
          didSucceed: true,
          details: {
            message: "Email was sent. Check your inbox!",
          },
        });
      } catch (error) {
        log("error", error);
        throw newError("Failed to reset user password", error);
      }
    });
  });
}

// * looks for req.query.token in DB and returns matching user._id if token was found and not expired
export async function validateToken(token) {
  // console.log("resetPassword token:", token); // DEBUGGING
  try {
    const matchingUser = await User.findOne({
      "resetPasswordToken.token": token,
      "resetPasswordToken.expiresAt": { $gt: Date.now() },
    });
    if (!matchingUser) {
      log("warn", "Invalid or expired password reset token");
      return {
        didSucceed: false,
        details: {
          message: "Invalid or expired password reset link",
        },
      };
    }
    // console.log("matchingUser based on resetPassword token: ", matchingUser); // DEBUGGING

    const matchingUserId = matchingUser._id;
    const matchingUserHashedPwd = matchingUser.password;

    log("success", "Token validated succesfully");
    return {
      didSucceed: true,
      matchingUserId,
      matchingUserHashedPwd,
    };
  } catch (error) {
    log("error", error);
    throw newError("Could not validate reset password token", error);
  }
}

// * reads userId from hidden `token` value & re-validates, checks DB for matching _id based on token and updates password
export async function updatePassword(formData) {
  const { password, token } = formData;
  try {
    // ^ re-validate token to prevent tampering and (some) edge cases
    const { didSucceed, details, matchingUserId, matchingUserHashedPwd } =
      await validateToken(token);
    if (!didSucceed) {
      log("warn", `Password not updated - ${details.message}`);
      return {
        didSucceed,
        details,
        toLoginPage: true,
      };
    }

    const doMatch = await comparePasswords(password, matchingUserHashedPwd);
    if (doMatch) {
      log("warn", "Old and new passwords match");
      return {
        didSucceed: false,
        details: {
          cause: "password",
          message: "New password cannot match old password",
        },
        toLoginPage: false,
      };
    }

    const hashedPwd = await bcrypt.hash(password, 12);
    const updated = await User.findOneAndUpdate(
      {
        _id: matchingUserId,
      },
      {
        $set: { password: hashedPwd },
        $unset: {
          resetPasswordToken: {
            token: "",
            expiresAt: "",
          },
        },
      },
      { new: false }
    );
    if (!updated) {
      log("warn", "Password not updated - invalid or expired token");
      return {
        didSucceed: false,
        details: {
          message: "Invalid or expired link",
        },
        toLoginPage: false,
      };
    }

    log("success", "Password updated");
    return {
      didSucceed: true,
      details: {
        message: "Password updated succesfully!",
      },
      toLoginPage: true,
    };
  } catch (error) {
    log("error", error);
    throw newError("Could not update password", error);
  }
}

export default {
  loginUser,
  singupUser,
  resetPassword,
  validateToken,
  updatePassword,
};
