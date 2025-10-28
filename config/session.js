import session from "express-session";
import MongoDBStore from "connect-mongodb-session";

import { getMongoDB_URI } from "../src/db/database.js";
import { requireEnvVar as required } from "../utils/index.js";

const MongoDB_URI = getMongoDB_URI();

export default () => {
  const store = new (MongoDBStore(session))({
    uri: MongoDB_URI,
    collection: "sessions",
  });

  return session({
    secret: required("SESSION_HASH"),
    resave: false,
    saveUninitialized: false,
    store,
    // cookie: {}
  });
};
