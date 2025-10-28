import nodemailer from "nodemailer";
import sendgridTransport from "nodemailer-sendgrid-transport";

import { requireEnvVar as required } from "../utils/index.js";

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: required("SENDGRID_API_KEY"),
    },
  })
);

export default transporter;
