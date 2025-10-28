import { createLogger, catchErrAsync } from "../utils/index.js";

import User from "../models/user.js";

const log = createLogger(import.meta.url);

export default catchErrAsync(async (req, res, next) => {
  if (!req.session.user) {
    log("warn", "No user session found");
    return next();
  }

  let user = await User.findById(req.session.user._id);
  if (!user) {
    log(
      "warn",
      "User session found, but user does not match any user in database"
    );
    return next();
  }

  req.user = user;
  // log("info", "User attached to session");

  return next();
});
