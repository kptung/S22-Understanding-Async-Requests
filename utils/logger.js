import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import required from "../utils/requireEnvVar.js";

const projectRoot = process.cwd();
const ENABLE_LOGGING = required("ENABLE_LOGGING");

const colorPallete = {
  info: chalk.blue,
  success: chalk.green,
  warn: chalk.yellow,
  error: chalk.red,
};

function createLogger(metaUrl) {
  if (ENABLE_LOGGING === "false")
    return () => {
      undefined;
    };

  const filePath = path.relative(projectRoot, fileURLToPath(metaUrl));
  return (...args) => {
    const { line, fn } = getCallerInfo();
    log(...args, `${filePath}:${line}`, fn);
  };
}

function getCallerInfo() {
  const err = new Error();
  const stack = err.stack?.split("\n");

  if (!stack || stack.length < 4) return { line: "?", fn: "unknown" };

  const lineMatch = stack[3].match(/:(\d+):\d+\)?$/);
  let fnMatch = stack[3].match(/at (\S+)/);

  // handles cases where fnMatch is an absolute URL path, not e.g. 'at productSchema.statics.addProduct'
  let match;
  if (fnMatch[1].includes("///")) {
    match = fnMatch[1].match(/file:\/\/.*\/([^/]+)\.js:\d+:\d+$/);
  }

  fnMatch = match ?? fnMatch;

  return {
    line: lineMatch ? lineMatch[1] : "?",
    fn: fnMatch ? fnMatch[1] : "unknown",
  };
}

function log(
  errorType,
  message = "Log message not defined",
  filePath = "?",
  fnName = "unknown"
) {
  if (!Object.keys(colorPallete).includes(errorType))
    return console.log(
      colorPallete.error(
        `\nInvalid logger 'errorType' (${errorType}) in filePath ${filePath}`
      )
    );

  return console.log(
    chalk.dim(`[${filePath}]`, `[${fnName}]`),
    colorPallete[errorType](`${message}`)
  );
}

export default createLogger;
