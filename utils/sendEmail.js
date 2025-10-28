import transporter from "../config/nodemailer.js";
import { newError, requireEnvVar as required, createLogger } from "./index.js";


const log = createLogger(import.meta.url);

const EMAIL_SEND_DISABLED = required("EMAIL_SEND_DISABLED");
const SENDER_EMAIL = required("SENDGRID_SENDER_EMAIL");
const TESTER_RECEIVER_EMAIL = required("SENDGRID_TESTER_RECEIVER_EMAIL");
const DEV_TESTING = required("SENDGRID_DEVELOPMENT_TESTING");

export default async function sendEmail(to, subject, html, logData) {
  if (!to || !subject || !html || !logData) {
    log("warn", "Missing `sendEmail` arguments");
    throw newError("Could not send a mail: Missing function arguments");
  }

  if (EMAIL_SEND_DISABLED === "true") {
    return log(logData.disabled.logType, logData.disabled.logMessage);
  }

  const receiver = DEV_TESTING ? TESTER_RECEIVER_EMAIL : to;

  try {
    return await transporter.sendMail({
      to: receiver,
      from: SENDER_EMAIL,
      subject,
      html,
    });
  } catch (error) {
    log("error", error);
    throw newError("An error occured while sending an email", error);
  }
}
