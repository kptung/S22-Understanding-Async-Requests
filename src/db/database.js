import "dotenv/config";
import mongoose from "mongoose";

import { requireEnvVar as required, newError } from "../../utils/index.js";

function buildAtlasUri() {
  const user = required("MONGO_USER");
  const pwd = required("MONGO_PASSWORD");
  const host = required("MONGO_HOST");
  const db = required("MONGO_DB");
  const appName = required("MONGO_APPNAME");

  return `mongodb+srv://${user}:${pwd}@${host}/${db}?retryWrites=true&w=majority&appName=${appName}`;
}

function getMongoDB_URI() {
  let uri;
  if (required("USE_MONGODB_ATLAS") === "true") uri = buildAtlasUri();
  else uri = required("MONGODB_URI");

  return uri;
}

// * connecting to the 'shop' database using Mongoose
async function mongoConnect(callback) {
  try {
    const uri = getMongoDB_URI();
    if (typeof callback === "function") callback();

    return await mongoose.connect(uri);
  } catch (error) {
    throw newError(
      "An error occurred whilst trying to connect to MongoDB",
      error
    );
  }
}

function close() {
  return mongoose.connection.close();
}

export { mongoConnect, close, mongoose, getMongoDB_URI };
