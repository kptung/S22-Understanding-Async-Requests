import path from "path";
import express from "express";
import cookieParser from "cookie-parser";

import multerConfig from "./config/multer.js";
import sessionMiddleware from "./config/session.js";
import csrfProtection from "./config/csrf.js";
import flash from "./config/connect-flash.js";
import routes from "./routes/index.js";

import attachUser from "./middleware/attachUser.js";
import attachLocals from "./middleware/attachLocals.js";
import * as errorController from "./controllers/error.js";

const app = express();
const __dirname = process.cwd();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.urlencoded({ extended: false }));
app.use(multerConfig);
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(cookieParser());

app.use(sessionMiddleware());
app.use(csrfProtection);
app.use(flash);

app.use(attachUser); // ^ attaches user found by User.findById(req.session.user._id) to req.user
app.use(attachLocals); // ^ automatically attaches res.locals.loggedIn && .csrfToken to currently rendered views

app.use(routes);

app.use(errorController.get404);
app.use(errorController.getErrorPage);

export default app;
