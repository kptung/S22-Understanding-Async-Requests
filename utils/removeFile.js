import fs from "fs";

import { newError, createLogger } from "./index.js";

const log = createLogger(import.meta.url);

export default function removeFile(filePath) {
  return fs.unlink(filePath, (err) => {
    if (err) {
      log("error", err);

      if (err.code === "ENOENT") return;
      throw newError("An error occured while deleting a file", err);
    }
  });
}
