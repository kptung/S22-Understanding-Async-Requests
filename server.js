import "dotenv/config";
import app from "./app.js";
import { mongoConnect } from "./src/db/database.js";
import required from "./utils/requireEnvVar.js";

const PORT = required("SERVER_PORT") || 3000;

// ^ setting up MongoDB connection
mongoConnect(() => {
  app.listen(PORT);
});
